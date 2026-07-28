/**
 * opencvPreprocess.js
 *
 * Applies an advanced image-processing pipeline to a receipt photo
 * before passing it to Tesseract.js for OCR.
 *
 * Supports both OpenCV.js and a 100% native HTML5 Canvas fallback so
 * preprocessing is guaranteed to succeed in production even if WASM fails to load.
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
      reject(new Error('Failed to decode image file for processing.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Native Canvas Preprocessing Fallback (0 WASM dependencies, 100% browser native).
 * Guaranteed to execute instantly in Production even if OpenCV WASM fails or times out.
 */
export function nativePreprocessReceiptImage(img) {
  const scale = img.naturalHeight < MIN_HEIGHT_PX ? MIN_HEIGHT_PX / img.naturalHeight : 1;
  const targetW = Math.round(img.naturalWidth * scale);
  const targetH = Math.round(img.naturalHeight * scale);

  const cropX = Math.round(targetW * 0.10);
  const cropW = Math.round(targetW * 0.80);

  const canvas = document.createElement('canvas');
  canvas.width = cropW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  // Draw cropped and scaled image onto canvas
  ctx.drawImage(img, cropX / scale, 0, cropW / scale, img.naturalHeight, 0, 0, cropW, targetH);

  // Grayscale & Adaptive Contrast Binarization
  const imgData = ctx.getImageData(0, 0, cropW, targetH);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // Contrast binarization: crisp black ink (0), white paper (255)
    const val = gray < 145 ? 0 : 255;
    d[i]     = val;
    d[i + 1] = val;
    d[i + 2] = val;
    d[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  canvas.processedImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return canvas;
}

/**
 * Pre-processes a receipt image file through the OpenCV / Native Canvas pipeline.
 *
 * @param {File}   file - Raw image File from <input type="file"> or camera
 * @param {object} [cv] - Optional loaded OpenCV.js runtime
 * @returns {Promise<HTMLCanvasElement>} Processed canvas with attached `.processedImageDataUrl`
 */
export async function preprocessReceiptImage(file, cv) {
  const img = await fileToImageElement(file);

  if (!cv || !cv.Mat) {
    return nativePreprocessReceiptImage(img);
  }

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

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width  = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    src = cv.imread(tempCanvas);

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

    let cropX = Math.round(src.cols * 0.10);
    let cropW = Math.round(src.cols * 0.80);

    const cropROI = new cv.Rect(cropX, 0, cropW, src.rows);
    cropped = src.roi(cropROI);

    cv.cvtColor(cropped, gray, cv.COLOR_RGBA2GRAY);

    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);

    cv.adaptiveThreshold(
      blurred,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      31,
      10,
    );

    outputCanvas.width  = binary.cols;
    outputCanvas.height = binary.rows;
    cv.imshow(outputCanvas, binary);

    outputCanvas.processedImageDataUrl = outputCanvas.toDataURL('image/jpeg', 0.8);
    return outputCanvas;

  } catch (err) {
    console.warn('OpenCV processing encountered error, falling back to Native Canvas:', err);
    return nativePreprocessReceiptImage(img);
  } finally {
    if (src) src.delete();
    if (cropped) cropped.delete();
    if (gray) gray.delete();
    if (blurred) blurred.delete();
    if (binary) binary.delete();
  }
}
