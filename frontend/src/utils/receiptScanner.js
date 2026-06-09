import { createWorker } from 'tesseract.js';

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

  if (lines.length > 0) {
    // Usually the first line is the merchant name
    merchantName = lines[0];
  }

  // Find date (common formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD.MM.YY)
  const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      date = match[1].replace(/\./g, '-').replace(/\//g, '-');
      // Normalize to YYYY-MM-DD if possible, else just keep it.
      // A simple fallback: just use today's date if parsing fails in the UI, 
      // but let's return the matched string for now.
      break;
    }
  }

  // Find total amount
  // We look for lines containing "TOTAL", "AMOUNT", "JUMLAH", "RP"
  // and extract the largest number we find in those lines.
  const totalKeywords = ['TOTAL', 'AMOUNT', 'JUMLAH', 'TL', 'TOT'];
  let maxAmount = 0;

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    const hasKeyword = totalKeywords.some(kw => upperLine.includes(kw));
    if (hasKeyword) {
      // Find all numbers in this line
      const numbers = line.match(/[\d.,]+/g);
      if (numbers) {
        for (const numStr of numbers) {
          const val = extractNumber(numStr);
          // Reasonability check: usually totals are the largest number, but ignore crazy large phone numbers
          // Let's say max 100,000,000 IDR
          if (val > maxAmount && val < 100000000) {
            maxAmount = val;
          }
        }
      }
    }
  }

  // If we couldn't find a keyword, just look for the largest number in the entire receipt 
  // that looks like currency (has a dot or comma, or follows 'Rp').
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
  const worker = await createWorker('ind+eng', 1, {
    logger: m => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });
  
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    console.log("Raw OCR Text:\n", text);
    const result = parseReceiptText(text);
    return result;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  } finally {
    await worker.terminate();
  }
}
