/**
 * imagePreprocess.js (formerly opencvPreprocess.js)
 *
 * Applies an advanced image-processing pipeline to a receipt photo
 * before passing it to Tesseract.js for OCR.
 *
 * Uses 100% native HTML5 Canvas. Zero dependencies. Guaranteed instant execution.
 */

const MIN_HEIGHT_PX = 1800; // Tesseract accuracy drops below this

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
 * Native Canvas Preprocessing
 * Applies contrast stretching and scaling without destructive binary clipping or edge cropping.
 */
export async function preprocessReceiptImage(file) {
  const img = await fileToImageElement(file);
  
  const scale = img.naturalHeight < MIN_HEIGHT_PX ? MIN_HEIGHT_PX / img.naturalHeight : 1;
  const targetW = Math.round(img.naturalWidth * scale);
  const targetH = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  // Draw full image scaled (0% margin crop so left/right margins are not cut off)
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const d = imgData.data;

  // 1. Calculate min and max luminance for dynamic contrast stretching
  let minGray = 255;
  let maxGray = 0;
  
  // Sample loop to find min/max
  for (let i = 0; i < d.length; i += 16) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (g < minGray) minGray = g;
    if (g > maxGray) maxGray = g;
  }

  const range = (maxGray - minGray) || 1;

  // 2. Grayscale + Dynamic Contrast Stretch (preserves text anti-aliasing for Tesseract)
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let normalized = ((gray - minGray) / range) * 255;
    
    // Mild contrast boost to sharpen dark text against light paper
    if (normalized < 128) {
      normalized = Math.max(0, normalized - 25);
    } else {
      normalized = Math.min(255, normalized + 25);
    }

    d[i]     = normalized;
    d[i + 1] = normalized;
    d[i + 2] = normalized;
    d[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  canvas.processedImageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return canvas;
}
