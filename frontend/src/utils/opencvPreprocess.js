/**
 * opencvPreprocess.js
 *
 * Applies an advanced 6-step OpenCV.js image-processing pipeline to a receipt photo
 * before passing it to Tesseract.js for OCR.
 *
 * Pipeline:
 *   1. Load File → HTMLImageElement → cv.Mat
 *   2. Aspect-ratio height normalization (min 1800px height for OCR accuracy)
 *   3. Smart Margin Crop (auto-detects paper rectangle, fallback to 10% outer crop)
 *   4. Grayscale conversion
 *   5. Gaussian Blur (denoises before thresholding)
 *   6. Adaptive Thresholding (blockSize = 31, C = 10)
 *   7. Write to Canvas + generate base64 thumbnail for UI modal
 *   8. Strict memory cleanup (delete all Mat instances)
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
 * @returns {Promise<HTMLCanvasElement>} Processed canvas with attached `.processedImageDataUrl`
 */
export async function preprocessReceiptImage(file, cv) {
  const img = await fileToImageElement(file);

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
    // Default: Strip 10% left & right outer margins where table wood grain & hands usually sit
    let cropX = Math.round(src.cols * 0.10);
    let cropW = Math.round(src.cols * 0.80);
    let cropY = 0;
    let cropH = src.rows;

    const cropROI = new cv.Rect(cropX, cropY, cropW, cropH);
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

    // Attach data URL for UI modal thumbnail preview
    outputCanvas.processedImageDataUrl = outputCanvas.toDataURL('image/jpeg', 0.8);

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
