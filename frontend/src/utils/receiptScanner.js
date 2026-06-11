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
 * Clean dates and times from a line before extracting numbers to avoid false positives
 */
function cleanLineOfDatesAndTimes(line) {
  let cleaned = line.toLowerCase();
  
  // Remove times (e.g. 10:34 or 10:34:15)
  cleaned = cleaned.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ');
  
  // Remove dates with slashes, dashes, or dots (e.g. 11/06/2026, 11-06-26, 11.06.2026)
  cleaned = cleaned.replace(/\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/g, ' ');
  cleaned = cleaned.replace(/\b\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}\b/g, ' ');
  
  // Remove word dates (e.g. 10 Jun 2026 or 10-Juni-2026)
  const monthsPattern = '(?:jan|feb|mar|apr|mei|may|jun|jul|ags|aug|sep|okt|oct|nov|des|dec)[a-z]*';
  const wordDateRegex = new RegExp(`\\b\\d{1,2}[\\s/\\-.]*${monthsPattern}[\\s/\\-.]*\\d{2,4}\\b`, 'g');
  cleaned = cleaned.replace(wordDateRegex, ' ');
  
  return cleaned;
}

/**
 * Parse date string from text
 */
function parseDate(text) {
  const textLower = text.toLowerCase();
  
  // 1. Check standard DD/MM/YY(YY) or DD-MM-YY(YY) or DD.MM.YY(YY)
  const standardDateRegex = /\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/;
  const matchStd = textLower.match(standardDateRegex);
  if (matchStd) {
    const day = parseInt(matchStd[1], 10);
    const month = parseInt(matchStd[2], 10);
    const yearStr = matchStd[3];
    
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      let year = parseInt(yearStr, 10);
      if (yearStr.length === 2) {
        year = 2000 + year; // assume 2000s
      }
      if (year >= 2000 && year <= 2099) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  // 2. Check YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const isoDateRegex = /\b(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})\b/;
  const matchIso = textLower.match(isoDateRegex);
  if (matchIso) {
    const year = parseInt(matchIso[1], 10);
    const month = parseInt(matchIso[2], 10);
    const day = parseInt(matchIso[3], 10);
    if (year >= 2000 && year <= 2099 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // 3. Check word dates (Indonesian & English months)
  const monthsMap = {
    jan: '01', peb: '02', feb: '02', mar: '03', apr: '04', mei: '05', may: '05',
    jun: '06', jul: '07', ags: '08', aug: '08', sep: '09', okt: '10', nov: '11', des: '12', dec: '12'
  };
  
  for (const [mName, mVal] of Object.entries(monthsMap)) {
    const wordRegex = new RegExp(`\\b(\\d{1,2})[\\s/\\-.]*${mName}[a-z]*[\\s/\\-.]*(\\d{2,4})\\b`);
    const wordMatch = textLower.match(wordRegex);
    if (wordMatch) {
      const day = parseInt(wordMatch[1], 10);
      const yearStr = wordMatch[2];
      if (day >= 1 && day <= 31) {
        let year = parseInt(yearStr, 10);
        if (yearStr.length === 2) {
          year = 2000 + year;
        }
        if (year >= 2000 && year <= 2099) {
          return `${year}-${mVal}-${String(day).padStart(2, '0')}`;
        }
      }
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
  const commonMerchants = [
    { pattern: /indomaret/i, name: 'Indomaret' },
    { pattern: /alfamart/i, name: 'Alfamart' },
    { pattern: /alfamidi/i, name: 'Alfamidi' },
    { pattern: /super\s*indo/i, name: 'Superindo' },
    { pattern: /hypermart/i, name: 'Hypermart' },
    { pattern: /transmart/i, name: 'Transmart' },
    { pattern: /starbucks/i, name: 'Starbucks' },
    { pattern: /mcdonald/i, name: "McDonald's" },
    { pattern: /\bkfc\b/i, name: 'KFC' },
    { pattern: /kopi\s+kenangan/i, name: 'Kopi Kenangan' },
    { pattern: /janji\s+jiwa/i, name: 'Kopi Janji Jiwa' },
    { pattern: /cinema\s*xxi/i, name: 'Cinema XXI' },
    { pattern: /pertamina/i, name: 'Pertamina' },
    { pattern: /shell/i, name: 'Shell' },
  ];
  
  let merchantName = '';
  
  // Try matching common merchants first from the entire raw text
  for (const item of commonMerchants) {
    if (item.pattern.test(rawText)) {
      merchantName = item.name;
      break;
    }
  }
  
  // Fallback to line-by-line first clean line heuristic
  if (!merchantName) {
    const merchantBlacklist = [
      'alamat', 'telp', 'npwp', 'tanggal', 'tgl', 'receipt', 'strip', 'kasir', 'cashier',
      'welcome', 'terima', 'kasih', 'thank', 'you', 'invoice', 'member', 'no.', 'order',
      'promo', 'discount', 'diskon', 'transaksi', 'merchant', 'jl.', 'jalan', 'raya',
      'card', 'tunai', 'cash', 'debit'
    ];
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const lineLower = lines[i].toLowerCase();
      const isPureNumbers = /^\d+$/.test(lines[i].replace(/[.,\s]/g, ''));
      const containsBlacklist = merchantBlacklist.some(word => lineLower.includes(word));
      
      if (lines[i].length > 2 && !isPureNumbers && !containsBlacklist) {
        merchantName = lines[i];
        break;
      }
    }
  }
  
  if (!merchantName) {
    merchantName = 'Receipt Scan';
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
    parsedDate = new Date().toISOString().split('T')[0];
  }
  
  // 3. EXTRACT TOTAL AMOUNT
  const strictTotalKeywords = ['grand total', 'total belanja', 'total bayar', 'total due', 'total', 'harus dibayar', 'jumlah total', 'jumlah', 'netto', 'net', 'total harga'];
  const secondaryTotalKeywords = ['subtotal', 'sub total', 'rp'];
  const excludeKeywords = ['kembali', 'kembalian', 'change', 'tunai', 'cash', 'bayar cash', 'uang bayar', 'debit', 'credit', 'visa', 'mastercard', 'ovo', 'gopay', 'dana', 'shopeepay', 'linkaja', 'qris', 'card', 'non-tunai', 'edc', 'payment'];

  let totalAmount = 0;
  
  // Heuristic 1: Scan bottom-to-top for strict total keywords and no exclusions
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    const hasStrictKeyword = strictTotalKeywords.some(kw => lineLower.includes(kw));
    const hasExcludeKeyword = excludeKeywords.some(kw => lineLower.includes(kw));
    
    if (hasStrictKeyword && !hasExcludeKeyword) {
      const cleanedLine = cleanLineOfDatesAndTimes(line);
      const nums = extractNumbers(cleanedLine);
      const validNums = nums.filter(val => val >= 500 && val < 50000000);
      if (validNums.length > 0) {
        totalAmount = validNums[validNums.length - 1]; // pick the last number in the line
        break;
      }
    }
  }
  
  // Heuristic 2: Scan bottom-to-top for secondary keywords and no exclusions
  if (totalAmount === 0) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const lineLower = line.toLowerCase();
      const hasSecondaryKeyword = secondaryTotalKeywords.some(kw => lineLower.includes(kw));
      const hasExcludeKeyword = excludeKeywords.some(kw => lineLower.includes(kw));
      
      if (hasSecondaryKeyword && !hasExcludeKeyword) {
        const cleanedLine = cleanLineOfDatesAndTimes(line);
        const nums = extractNumbers(cleanedLine);
        const validNums = nums.filter(val => val >= 500 && val < 50000000);
        if (validNums.length > 0) {
          totalAmount = validNums[validNums.length - 1];
          break;
        }
      }
    }
  }
  
  // Heuristic 3: Scan bottom-to-top for any valid numbers after date/time cleanup
  if (totalAmount === 0) {
    let allPossibleAmounts = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      const cleanedLine = cleanLineOfDatesAndTimes(lines[i]);
      const nums = extractNumbers(cleanedLine);
      const validNums = nums.filter(val => val >= 500 && val < 50000000);
      allPossibleAmounts.push(...validNums);
    }
    if (allPossibleAmounts.length > 0) {
      totalAmount = Math.max(...allPossibleAmounts);
    }
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
    rawText,
    imageFile,
  };
}
