/**
 * opencvPreprocess.js
 *
 * Applies a 6-step OpenCV.js image-processing pipeline to a receipt photo
 * before passing it to Tesseract.js for OCR.
 *
 * Pipeline:
 *   1. Load File → HTMLImageElement → cv.Mat
 *   2. Grayscale conversion   (removes colour noise)
 *   3. Gaussian Blur          (denoises before threshold)
 *   4. Adaptive Threshold     (per-region binarisation — handles uneven lighting)
 *   5. Morphological Close    (fills small gaps in printed characters)
 *   6. Upscale if needed      (ensures min 1800px height for Tesseract accuracy)
 *   7. Write to Canvas        (output format Tesseract can consume)
 *   8. Delete all cv.Mat      (mandatory memory cleanup)
 *
 * Usage:
 *   import { preprocessReceiptImage } from './opencvPreprocess';
 *   const canvas = await preprocessReceiptImage(file, cv);
 *   // Pass canvas to Tesseract.recognize(canvas, ...)
 */

const MIN_HEIGHT_PX = 1800; // Tesseract accuracy drops below this

/**
 * Loads a File object into an HTMLImageElement.
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
function fileToImageElement(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file for OpenCV processing.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Pre-processes a receipt image file through the OpenCV pipeline.
 *
 * @param {File}   file - Raw image File from <input type="file"> or camera
 * @param {object} cv   - The loaded OpenCV.js runtime (from opencvLoader)
 * @returns {Promise<HTMLCanvasElement>} Processed canvas ready for Tesseract
 */
export async function preprocessReceiptImage(file, cv) {
  const img = await fileToImageElement(file);

  // Output canvas that will hold the final processed image
  const outputCanvas = document.createElement('canvas');

  let src = null;
  let cropped = null;
  let gray = null;
  let blurred = null;
  let binary = null;

  try {
    gray = new cv.Mat();
    blurred = new cv.Mat();
    binary = new cv.Mat();

    // ── Step 1: Load image into cv.Mat ────────────────────────────────────
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width  = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    src = cv.imread(tempCanvas);

    // ── Step 2: Resize to MIN_HEIGHT_PX ──────────────────────────────────
    if (src.rows !== MIN_HEIGHT_PX) {
      const scale = MIN_HEIGHT_PX / src.rows;
      const newSize = new cv.Size(
        Math.round(src.cols * scale),
        MIN_HEIGHT_PX
      );
      const interpolation = src.rows > MIN_HEIGHT_PX ? cv.INTER_AREA : cv.INTER_CUBIC;
      const resized = new cv.Mat();
      cv.resize(src, resized, newSize, 0, 0, interpolation);
      src.delete();
      src = resized;
    }

    // ── Step 3: Margin Crop (Remove surrounding table background) ────────
    // Strip 10% left & right outer margins where table wood grain & hands usually sit
    const cropX = Math.round(src.cols * 0.10);
    const cropW = Math.round(src.cols * 0.80);
    const cropROI = new cv.Rect(cropX, 0, cropW, src.rows);
    cropped = src.roi(cropROI);

    // ── Step 4: Grayscale Conversion ─────────────────────────────────────
    cv.cvtColor(cropped, gray, cv.COLOR_RGBA2GRAY);

    // ── Step 5: Gaussian Blur ──────────────────────────────────────────────
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);

    // ── Step 6: Adaptive Thresholding ──────────────────────────────────────
    // blockSize = 31, C = 10: Makes paper background pure white (255) and ink crisp black (0)
    cv.adaptiveThreshold(
      blurred,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      31,
      10,
    );

    // ── Step 7: Write result to output canvas ──────────────────────────────
    outputCanvas.width  = binary.cols;
    outputCanvas.height = binary.rows;
    cv.imshow(outputCanvas, binary);

  } finally {
    // ── Step 8: Memory cleanup ─────────────────────────────────────────────
    if (src) src.delete();
    if (cropped) cropped.delete();
    if (gray) gray.delete();
    if (blurred) blurred.delete();
    if (binary) binary.delete();
  }

  return outputCanvas;
}
