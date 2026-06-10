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
        // Binarization: drastically improves OCR for yellow/colored backgrounds
        // Anything brighter than ~160 becomes pure white, else black.
        const binary = avg > 160 ? 255 : 0;
        
        data[i] = binary;     // red
        data[i + 1] = binary; // green
        data[i + 2] = binary; // blue
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
  let cleaned = str.replace(/[^\d.,]/g, '');
  if (!cleaned) return 0;
  
  // If it ends with ,XX or .XX where XX is exactly two digits, remove the decimal part
  if (/[,.]\d{2}$/.test(cleaned)) {
    cleaned = cleaned.slice(0, -3);
  }
  
  // Now simply remove all remaining non-digits
  const digitsOnly = cleaned.replace(/[^\d]/g, '');
  return parseInt(digitsOnly, 10) || 0;
}

/**
 * Smart parses raw OCR text into structured data
 */
export function parseReceiptText(text, members = []) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  
  let merchantName = '';
  let date = '';
  let totalAmount = 0;

  // 1. Merchant Name: Find the first line that has actual letters (ignore logo noise)
  const validMerchantLine = lines.find(l => /[A-Za-z]{3,}/.test(l));
  if (validMerchantLine) {
    merchantName = validMerchantLine
      .replace(/[^a-zA-Z0-9 &.-]/g, '')
      .replace(/^[\d\s]+/, '') // Remove leading numbers
      .substring(0, 30)
      .trim();
  }

  // 2. Date: Find date and strictly format to YYYY-MM-DD for HTML date input
  // Indonesian receipts usually use DD/MM/YYYY or DD-MM-YYYY or DD MMM YYYY
  const dateRegex = /(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/;
  const textDateRegex = /(\d{1,2})\s+(JAN|FEB|MAR|APR|MEI|JUN|JUL|AGS|SEP|OKT|NOV|DES)[A-Z]*\s+(\d{2,4})/i;
  const monthMap = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MEI': '05', 'JUN': '06',
    'JUL': '07', 'AGS': '08', 'SEP': '09', 'OKT': '10', 'NOV': '11', 'DES': '12'
  };

  for (const line of lines) {
    const textMatch = line.match(textDateRegex);
    if (textMatch) {
      let [_, d, mName, y] = textMatch;
      if (y.length === 2) y = '20' + y;
      const m = monthMap[mName.substring(0, 3).toUpperCase()] || '01';
      date = `${y}-${m}-${d.padStart(2, '0')}`;
      break;
    }

    const match = line.match(dateRegex);
    if (match) {
      let [_, d, m, y] = match;
      if (y.length === 2) y = '20' + y;
      
      // Assume DD/MM/YYYY format
      date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      break;
    }
  }

  // Try to find an explicit TOTAL line first
  const explicitTotalKeywords = ['TOTAL', 'GRAND TOTAL', 'JUMLAH TOTAL', 'NETTO'];
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    if (explicitTotalKeywords.some(kw => upperLine.includes(kw)) && !upperLine.includes('SUB')) {
      const numbers = line.match(/[\d.,]+/g);
      if (numbers) {
        // Usually the last number is the actual total
        const lastNumStr = numbers[numbers.length - 1];
        const val = extractNumber(lastNumStr);
        if (val > 0 && val < 100000000) {
          totalAmount = val;
          break; // Found our explicit total!
        }
      }
    }
  }

  // Fallback to max amount if explicit total isn't found
  if (totalAmount === 0) {
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
  }

  // 4. Find member by name
  let member_id = '';
  if (members && members.length > 0) {
    const upperText = text.toUpperCase();
    for (const member of members) {
      if (member.name && upperText.includes(member.name.toUpperCase())) {
        member_id = member.id;
        break;
      }
    }
  }

  return {
    merchantName,
    date,
    totalAmount,
    member_id
  };
}

/**
 * Processes an image file and returns parsed receipt data
 */
export async function scanReceipt(imageFile, members = [], onProgress = null) {
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
    const result = parseReceiptText(text, members);
    
    await worker.terminate();
    return result;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}
