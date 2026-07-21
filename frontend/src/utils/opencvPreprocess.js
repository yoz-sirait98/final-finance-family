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

  // Allocate all cv.Mat objects (except src, which is returned by imread)
  let src = null;
  let gray = null;
  let blurred = null;
  let binary = null;
  let closed = null;
  let upscaled = null;
  let kernel = null;

  try {
    gray = new cv.Mat();
    blurred = new cv.Mat();
    binary = new cv.Mat();
    closed = new cv.Mat();
    upscaled = new cv.Mat();
    kernel = cv.Mat.ones(2, 2, cv.CV_8U);

    // ── Step 1: Load image into cv.Mat ────────────────────────────────────
    // Draw to a temp canvas first so cv.imread can access pixel data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width  = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // imread allocates and returns a new Mat
    src = cv.imread(tempCanvas);

    // ── Step 2: Grayscale ─────────────────────────────────────────────────
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // ── Step 3: Gaussian Blur (denoise) ──────────────────────────────────
    // 5×5 kernel, σ = 0 (auto-computed from kernel size)
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);

    // ── Step 4: Adaptive Threshold ────────────────────────────────────────
    // ADAPTIVE_THRESH_GAUSSIAN_C: weight neighbours by Gaussian distribution
    // THRESH_BINARY: foreground = 255 (white text on black bg is handled by Tesseract)
    // blockSize = 15: neighbourhood for threshold computation (must be odd)
    // C = 4: constant subtracted from the mean — tuned for receipt paper
    cv.adaptiveThreshold(
      blurred,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      15,
      4,
    );

    // ── Step 5: Morphological Close ────────────────────────────────────────
    // Fills small white gaps inside dark characters caused by printer dots or folds
    cv.morphologyEx(binary, closed, cv.MORPH_CLOSE, kernel);

    // ── Step 6: Upscale if height is too small ─────────────────────────────
    // Tesseract accuracy drops significantly below ~1800px height
    let finalMat = closed;
    if (closed.rows < MIN_HEIGHT_PX) {
      const scale   = MIN_HEIGHT_PX / closed.rows;
      const newSize = new cv.Size(
        Math.round(closed.cols * scale),
        MIN_HEIGHT_PX,
      );
      // INTER_CUBIC gives better quality for text upscaling
      cv.resize(closed, upscaled, newSize, 0, 0, cv.INTER_CUBIC);
      finalMat = upscaled;
    }

    // ── Step 7: Write result to output canvas ──────────────────────────────
    outputCanvas.width  = finalMat.cols;
    outputCanvas.height = finalMat.rows;
    cv.imshow(outputCanvas, finalMat);

  } finally {
    // ── Step 8: MANDATORY memory cleanup ──────────────────────────────────
    // OpenCV.js uses C++ heap; leaks crash the tab after repeated scans
    if (src) src.delete();
    if (gray) gray.delete();
    if (blurred) blurred.delete();
    if (binary) binary.delete();
    if (closed) closed.delete();
    if (upscaled) upscaled.delete();
    if (kernel) kernel.delete();
  }

  return outputCanvas;
}
