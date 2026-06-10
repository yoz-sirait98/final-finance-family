import Tesseract from 'tesseract.js';

/**
 * Clean and parse numbers from OCR lines
 */
function extractNumbers(text) {
  // Matches digits with optional dots, commas or spaces as thousands/decimals
  // e.g. Rp 150.000,00 or 150,000 or 150000
  const matches = text.match(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?\b/g);
  if (!matches) return [];
  
  return matches.map(numStr => {
    // Strip whitespace
    let cleaned = numStr.replace(/\s/g, '');
    
    // If it ends with ,00 or .00, remove the decimal cents for clean integer math
    if (cleaned.endsWith(',00') || cleaned.endsWith('.00')) {
      cleaned = cleaned.slice(0, -3);
    }
    
    // Strip remaining punctuation (commas, periods)
    cleaned = cleaned.replace(/[.,]/g, '');
    
    return parseInt(cleaned, 10);
  }).filter(n => !isNaN(n));
}

/**
 * Parse date string from text
 */
function parseDate(text) {
  // Matches formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const dateRegex = /\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\b|\b(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})\b/;
  const match = text.match(dateRegex);
  
  if (match) {
    if (match[1]) {
      // DD/MM/YYYY or DD-MM-YYYY
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    } else if (match[4]) {
      // YYYY-MM-DD
      const year = match[4];
      const month = match[5].padStart(2, '0');
      const day = match[6].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  
  // Test for Indonesian word months like "10 Jun 2026", "10 Juni 2026", etc.
  const monthsMap = {
    jan: '01', peb: '02', feb: '02', mar: '03', apr: '04', mei: '05', may: '05',
    jun: '06', jul: '07', ags: '08', aug: '08', sep: '09', okt: '10', nov: '11', des: '12', dec: '12'
  };
  
  const textLower = text.toLowerCase();
  for (const [mName, mVal] of Object.entries(monthsMap)) {
    const wordRegex = new RegExp(`\\b(\\d{1,2})\\s+${mName}[a-z]*\\s+(\\d{4})\\b`);
    const wordMatch = textLower.match(wordRegex);
    if (wordMatch) {
      const day = wordMatch[1].padStart(2, '0');
      const year = wordMatch[2];
      return `${year}-${mVal}-${day}`;
    }
  }
  
  return null;
}

/**
 * Main Receipt Parser
 */
export async function scanReceipt(imageFile, progressCallback) {
  // Perform OCR using Tesseract static method
  const ret = await Tesseract.recognize(
    imageFile,
    'eng+ind',
    {
      logger: m => {
        if (progressCallback && m.status === 'recognizing text') {
          progressCallback(Math.round(m.progress * 100));
        }
      }
    }
  );
  
  const rawText = ret.data.text;
  
  // Split into clean lines
  const lines = rawText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  if (lines.length === 0) {
    throw new Error('No text detected on the receipt image.');
  }
  
  // 1. EXTRACT DESCRIPTION (Merchant Name)
  const merchantBlacklist = [
    'alamat', 'telp', 'npwp', 'tanggal', 'tgl', 'receipt', 'strip', 'kasir', 'cashier',
    'welcome', 'terima', 'kasih', 'thank', 'you', 'invoice', 'member', 'no.', 'order',
    'promo', 'discount', 'diskon', 'transaksi', 'merchant', 'jl.', 'jalan', 'raya'
  ];
  
  let merchantName = 'Receipt Scan';
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const lineLower = lines[i].toLowerCase();
    
    // Heuristic: Avoid lines that are purely numbers or have blacklisted words
    const isPureNumbers = /^\d+$/.test(lines[i].replace(/[.,\s]/g, ''));
    const containsBlacklist = merchantBlacklist.some(word => lineLower.includes(word));
    
    if (lines[i].length > 2 && !isPureNumbers && !containsBlacklist) {
      merchantName = lines[i];
      break;
    }
  }
  
  // 2. EXTRACT DATE
  let parsedDate = null;
  for (const line of lines) {
    const d = parseDate(line);
    if (d) {
      parsedDate = d;
      break;
    }
  }
  if (!parsedDate) {
    // Default to today
    parsedDate = new Date().toISOString().split('T')[0];
  }
  
  // 3. EXTRACT TOTAL AMOUNT
  // Scan lines for total keywords and find values
  const totalKeywords = ['total', 'grand total', 'due', 'bayar', 'netto', 'net', 'subtotal', 'rp'];
  let possibleAmounts = [];
  
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    const hasKeyword = totalKeywords.some(kw => lineLower.includes(kw));
    
    if (hasKeyword) {
      const nums = extractNumbers(line);
      possibleAmounts.push(...nums);
    }
  }
  
  // Fallback: If no line matches keyword, scan all numbers in the receipt
  if (possibleAmounts.length === 0) {
    for (const line of lines) {
      const nums = extractNumbers(line);
      possibleAmounts.push(...nums);
    }
  }
  
  // Filter numbers to remove dates (like 2026), tax percentages (like 10, 11), or extremely small counts
  possibleAmounts = possibleAmounts.filter(val => val > 100 && val < 50000000); // 100 Rupiah to 50 Million Rupiah
  
  let totalAmount = 0;
  if (possibleAmounts.length > 0) {
    totalAmount = Math.max(...possibleAmounts);
  }
  
  // 4. RECOMMEND CATEGORY AND ACCOUNT HEURISTICS
  const rawTextLower = rawText.toLowerCase();
  
  // Category Heuristics
  let recommendedCategoryType = 'groceries'; // default fallback
  if (rawTextLower.match(/(cafe|kopi|coffee|starbucks|resto|bakso|mcd|kfc|burger|pizza|dunkin|roti|eat|warung|mie|makan)/)) {
    recommendedCategoryType = 'food';
  } else if (rawTextLower.match(/(apotek|kimia|guardian|watsons|sehat|klinik|dokter|medicine|panadol|bodrex)/)) {
    recommendedCategoryType = 'health';
  } else if (rawTextLower.match(/(pln|listrik|pdam|air|telkom|internet|pulsa|speedy)/)) {
    recommendedCategoryType = 'utilities';
  } else if (rawTextLower.match(/(pertamina|bensin|shell|gojek|grab|taxi|toll|parkir|bensin)/)) {
    recommendedCategoryType = 'transport';
  }
  
  // Account Heuristics
  let recommendedAccountType = 'bank'; // default fallback
  if (rawTextLower.match(/(tunai|cash|kembalian|kembali)/)) {
    recommendedAccountType = 'cash';
  } else if (rawTextLower.match(/(gopay|ovo|dana|linkaja|shopeepay|qris|e-money|flazz|brizzi)/)) {
    recommendedAccountType = 'wallet';
  }
  
  return {
    merchantName: merchantName,
    totalAmount: totalAmount,
    date: parsedDate,
    heuristics: {
      category: recommendedCategoryType,
      account: recommendedAccountType
    },
    rawText
  };
}
