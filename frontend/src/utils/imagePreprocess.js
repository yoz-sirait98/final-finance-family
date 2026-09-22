/**
 * imagePreprocess.js
 *
 * Image compressor & preprocessor for Gemini Vision API.
 * Uses 100% native HTML5 Canvas. Zero dependencies. Guaranteed instant execution.
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
 * Image compressor & preprocessor for Gemini Vision API.
 * Resizes image to optimal max dimension (1280px) and converts to JPEG Base64 payload.
 */
export async function preprocessReceiptImage(file) {
  const img = await fileToImageElement(file);

  const MAX_DIM = 1280;
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > MAX_DIM || height > MAX_DIM) {
    if (width > height) {
      height = Math.round((height * MAX_DIM) / width);
      width = MAX_DIM;
    } else {
      width = Math.round((width * MAX_DIM) / height);
      height = MAX_DIM;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const base64Data = dataUrl.split(',')[1] || '';

  canvas.processedImageDataUrl = dataUrl;
  canvas.base64Data = base64Data;
  canvas.mimeType = 'image/jpeg';

  return canvas;
}
