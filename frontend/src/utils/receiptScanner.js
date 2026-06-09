import { createWorker } from 'tesseract.js';

/**
 * Preprocesses an image to improve OCR speed and accuracy on mobile.
 * Downscales image and applies grayscale filter.
 */
function preprocessImage(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const MAX_WIDTH = 1500;
      const MAX_HEIGHT = 1500;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to grayscale for better OCR contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Luminance calculation
        const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        data[i] = avg;     // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
      }
      ctx.putImageData(imageData, 0, 0);

      // Return processed image as blob
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image for preprocessing"));
    };
    
    img.src = url;
  });
}

/**
 * Extracts numeric value from a string
 */
function extractNumber(str) {
  // Remove all non-numeric characters except comma and dot
  const cleaned = str.replace(/[^\d.,]/g, '');
  // Replace comma with dot if it's used as a decimal separator, but usually in IDR it's used as a thousand separator.
  // For IDR, we usually ignore dots and commas at the end, or just strip all non-digits to get the raw value.
  const digitsOnly = cleaned.replace(/[^\d]/g, '');
  return parseInt(digitsOnly, 10) || 0;
}

/**
 * Smart parses raw OCR text into structured data
 */
export function parseReceiptText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  
  let merchantName = '';
  let date = '';
  let totalAmount = 0;

  // 1. Merchant Name: Find the first line that has actual letters (ignore logo noise)
  const validMerchantLine = lines.find(l => /[A-Za-z]{3,}/.test(l));
  if (validMerchantLine) {
    merchantName = validMerchantLine.replace(/[^a-zA-Z0-9 &.-]/g, '').substring(0, 30).trim();
  }

  // 2. Date: Find date and strictly format to YYYY-MM-DD for HTML date input
  // Indonesian receipts usually use DD/MM/YYYY or DD-MM-YYYY
  const dateRegex = /(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      let [_, d, m, y] = match;
      if (y.length === 2) y = '20' + y;
      
      // Assume DD/MM/YYYY format
      date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      break;
    }
  }

  // 3. Find total amount
  const totalKeywords = ['TOTAL', 'AMOUNT', 'JUMLAH', 'TL', 'TOT'];
  let maxAmount = 0;

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    const hasKeyword = totalKeywords.some(kw => upperLine.includes(kw));
    if (hasKeyword) {
      const numbers = line.match(/[\d.,]+/g);
      if (numbers) {
        for (const numStr of numbers) {
          const val = extractNumber(numStr);
          if (val > maxAmount && val < 100000000) {
            maxAmount = val;
          }
        }
      }
    }
  }

  if (maxAmount === 0) {
    for (const line of lines) {
      if (line.toUpperCase().includes('RP')) {
        const numbers = line.match(/[\d.,]+/g);
        if (numbers) {
          for (const numStr of numbers) {
            const val = extractNumber(numStr);
            if (val > maxAmount && val < 100000000) {
              maxAmount = val;
            }
          }
        }
      }
    }
  }

  totalAmount = maxAmount;

  return {
    merchantName,
    date,
    totalAmount
  };
}

/**
 * Processes an image file and returns parsed receipt data
 */
export async function scanReceipt(imageFile, onProgress = null) {
  try {
    // 1. Preprocess the image (resize + grayscale) to drastically speed up parsing on mobile CPUs!
    if (onProgress) onProgress(5); // Show initial progress
    const processedBlob = await preprocessImage(imageFile);
    if (onProgress) onProgress(10); // Image processed

    // 2. Load Tesseract.js (Only 'ind' to halve download size)
    const worker = await createWorker('ind', 1, {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          // map remaining 10%-100% to Tesseract's progress
          onProgress(10 + Math.round(m.progress * 90));
        }
      }
    });
    
    const { data: { text } } = await worker.recognize(processedBlob);
    console.log("Raw OCR Text:\n", text);
    const result = parseReceiptText(text);
    
    await worker.terminate();
    return result;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}
