import Tesseract from 'tesseract.js';
import { loadOpenCV } from './opencvLoader';
import { preprocessReceiptImage } from './opencvPreprocess';
import merchantsDb from './merchants.json';

// ---------------------------------------------------------------------------
// Month fuzzy-matching for robust date extraction despite OCR errors
// ---------------------------------------------------------------------------
const fuzzyMonths = [
  { pattern: /ja[nu|m|n]/i,         val: '01' },
  { pattern: /f[eb|p]|p[eb|p]/i,    val: '02' },
  { pattern: /ma[r|t]/i,            val: '03' },
  { pattern: /ap[r|l]/i,            val: '04' },
  { pattern: /me[iy]|ma[yi]/i,      val: '05' },
  { pattern: /ju[nmrhi][ei]?/i,     val: '06' },
  { pattern: /ju[liy]/i,            val: '07' },
  { pattern: /au[gs]|ag[su]/i,      val: '08' },
  { pattern: /se[pt]/i,             val: '09' },
  { pattern: /ok[tc]|oc[tk]/i,      val: '10' },
  { pattern: /no[vw]/i,             val: '11' },
  { pattern: /de[sc]/i,             val: '12' },
];

// Category → heuristic keyword fallback (used when merchant JSON has no match)
const categoryKeywords = {
  food:        /(cafe|kopi|coffee|starbucks|resto|bakso|mcd|kfc|burger|pizza|dunkin|roti|eat|warung|mie|makan)/,
  health:      /(apotek|kimia|guardian|watsons|sehat|klinik|dokter|medicine|panadol|bodrex)/,
  utilities:   /(pln|listrik|pdam|air|telkom|internet|pulsa|speedy)/,
  transport:   /(pertamina|bensin|shell|gojek|go-jek|grab|grob|greb|taxi|toll|parkir|bensin|ride|fare|passenger|booking|trip|perjalanan|driver)/,
};

// ---------------------------------------------------------------------------
// Number extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract the RIGHTMOST valid Rupiah amount from a text line.
 * Handles: 150.000 | 150,000 | Rp150.000 | Rp 150,000 | 150000
 * Returns 0 if nothing found.
 */
function extractRightmostAmount(line) {
  // Strip any Rp / IDR prefix so it does not interfere with number matching
  const cleaned = line.replace(/\b(rp\.?|idr\.?)\s*/gi, ' ');

  // Match numbers that look like Indonesian currency amounts
  const matches = [...cleaned.matchAll(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?\b/g)];
  if (!matches.length) return 0;

  // Take the LAST (rightmost) match — two-column receipts put prices on the right
  const raw = matches[matches.length - 1][0];
  let s = raw.replace(/\s/g, '');

  // Strip trailing ,00 / .00 (Indonesian cent notation)
  if (s.endsWith(',00') || s.endsWith('.00')) s = s.slice(0, -3);

  // Remove remaining thousand-separators
  s = s.replace(/[.,]/g, '');

  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Remove date/time tokens from a line to prevent them being mistaken for amounts.
 */
function stripDatesAndTimes(line) {
  let s = line.toLowerCase();
  s = s.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ');                             // times
  s = s.replace(/(?<!\d)\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}(?!\d)/g, ' ');           // DD/MM/YY
  s = s.replace(/(?<!\d)\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}(?!\d)/g, ' ');             // YYYY-MM-DD
  const months = '(?:jan|feb|mar|apr|mei|may|jun|jul|ags|aug|sep|okt|oct|nov|des|dec)[a-z]*';
  s = s.replace(new RegExp(`(?<!\\d)\\d{1,2}[\\s/\\-.]*${months}[\\s/\\-.]*\\d{2,4}(?!\\d)`, 'g'), ' ');
  return s;
}

// ---------------------------------------------------------------------------
// Date parser
// ---------------------------------------------------------------------------
function parseDate(text) {
  const t = text.toLowerCase();

  // DD/MM/YY(YY)
  const m1 = t.match(/(?<!\d)(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})(?!\d)/);
  if (m1) {
    const d = +m1[1], mo = +m1[2];
    let y = +m1[3];
    if (m1[3].length === 2) y += 2000;
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 2000 && y <= 2099)
      return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  // YYYY-MM-DD
  const m2 = t.match(/(?<!\d)(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?!\d)/);
  if (m2) {
    const y = +m2[1], mo = +m2[2], d = +m2[3];
    if (y >= 2000 && y <= 2099 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
      return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  // Word dates: "10 Juni 2026", "10-Jun-26"
  for (const mItem of fuzzyMonths) {
    const re = new RegExp(`(?<!\\d)(\\d{1,2})[\\s/\\-.]*(${mItem.pattern.source})[a-z]*[\\s/\\-.]*(\\d{2,4})(?!\\d)`, 'i');
    const wm = t.match(re);
    if (wm) {
      const d = +wm[1];
      let y = +wm[3];
      if (wm[3].length === 2) y += 2000;
      if (d >= 1 && d <= 31 && y >= 2000 && y <= 2099)
        return `${y}-${mItem.val}-${String(d).padStart(2,'0')}`;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Confidence classifier
// ---------------------------------------------------------------------------
function classifyConfidence(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Scan a receipt image file.
 *
 * Steps:
 *   1. Lazy-load OpenCV.js
 *   2. Pre-process image through OpenCV pipeline
 *   3. OCR via Tesseract.js (PSM 6, eng+ind)
 *   4. Parse merchant, date, amount, heuristics, confidence
 *
 * @param {File}     imageFile        - Raw File from camera / file input
 * @param {Function} progressCallback - Called with 0-100 during OCR recognition
 * @returns {Promise<object>}
 */
export async function scanReceipt(imageFile, progressCallback) {

  // ── 1. OpenCV Preprocessing ───────────────────────────────────
  if (progressCallback) progressCallback(5, 'Loading image processing engine...');
  // Yield to main thread so the UI can render the progress message
  await new Promise(resolve => setTimeout(resolve, 50));
  
  let ocrInput = imageFile;
  try {
    const cv = await loadOpenCV();
    if (progressCallback) progressCallback(10, 'Enhancing image for OCR...');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    ocrInput = await preprocessReceiptImage(imageFile, cv);
  } catch (err) {
    console.warn('OpenCV preprocessing failed, falling back to raw image:', err);
  }

  // ── 2. Tesseract OCR ────────────────────────────────────────────────────
  if (progressCallback) progressCallback(15, 'Initializing OCR engine...');
  const ret = await Tesseract.recognize(
    ocrInput,
    'eng+ind',
    {
      logger: m => {
        if (progressCallback) {
          // m.status values include: "loading tesseract core", "loading language traineddata", 
          // "initializing api", "recognizing text"
          const statusText = m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) + '...' : 'Scanning...';
          const p = Math.round((m.progress || 0) * 100);
          progressCallback(p, statusText);
        }
      },
      // PSM 6 = "Assume a single uniform block of text"
      // Works well for receipts which are narrow single-column documents
      tessedit_pageseg_mode: '6',
    },
  );

  const rawText        = ret.data.text;
  const overallScore   = Math.round(ret.data.confidence ?? 0); // 0-100

  const lines = rawText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    throw new Error('No text detected on the receipt image.');
  }

  // ── 3. Merchant Name ─────────────────────────────────────────────────────
  let merchantName     = '';
  let merchantCategory = '';   // sourced from merchants.json

  // Hardcoded specific matchers for exact brand keywords
  const rawLower = rawText.toLowerCase();
  if (rawLower.includes('klikindomaret') || rawLower.includes('indomaret')) {
    merchantName = 'INDOMARET';
    merchantCategory = 'groceries';
  } else if (rawLower.includes('@kopikenangan.id') || rawLower.includes('kopi kenangan') || rawLower.includes('kenangan')) {
    merchantName = 'Kopi Kenangan';
    merchantCategory = 'food';
  } else {
    // Match against merchants.json (100+ patterns)
    for (const entry of merchantsDb) {
      const re = new RegExp(entry.pattern, 'i');
      if (re.test(rawText)) {
        merchantName     = entry.name;
        merchantCategory = entry.category;
        break;
      }
    }

    // Fallback: first clean line heuristic
    if (!merchantName) {
      const blacklist = [
        'alamat','telp','npwp','tanggal','tgl','receipt','strip','kasir','cashier',
        'welcome','terima','kasih','thank','you','invoice','member','no.','order',
        'promo','discount','diskon','transaksi','merchant','jl.','jalan','raya',
        'card','tunai','cash','debit',
      ];
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const ll  = lines[i].toLowerCase();
        const num = /^\d+$/.test(lines[i].replace(/[.,\s]/g, ''));
        const bad = blacklist.some(w => ll.includes(w));
        if (lines[i].length > 2 && !num && !bad) {
          merchantName = lines[i];
          break;
        }
      }
    }
  }

  if (!merchantName) merchantName = 'Receipt Scan';

  // ── 4. Date ──────────────────────────────────────────────────────────────
  let parsedDate = null;
  for (const line of lines) {
    const d = parseDate(line);
    if (d) { parsedDate = d; break; }
  }
  if (!parsedDate) parsedDate = new Date().toISOString().split('T')[0];

  // ── 5. Total Amount ──────────────────────────────────────────────────────
  const strictKeywords = [
    'grand total','total belanja','total bayar','total due',
    'harus dibayar','jumlah total','total harga',
    'total keseluruhan','total transaksi','total pembayaran',
    'tagihan','netto','net','\\btotal\\b','\\bjumlah\\b',
  ];
  const secondaryKeywords = ['subtotal','sub total','\\brp\\b'];
  const excludeKeywords   = [
    'kembali','kembalian','change','tunai','cash','bayar cash','uang bayar',
    'debit','credit','visa','mastercard','ovo','gopay','dana','shopeepay',
    'linkaja','qris','card','non-tunai','edc','payment','cicilan',
  ];

  const MIN_AMOUNT = 100;
  const MAX_AMOUNT = 50_000_000;

  let totalAmount = 0;

  // Heuristic 1 — strict total keywords (scan bottom-to-top)
  for (let i = lines.length - 1; i >= 0; i--) {
    const ll      = lines[i].toLowerCase();
    const hasKey  = strictKeywords.some(kw => new RegExp(kw).test(ll));
    const hasExcl = excludeKeywords.some(kw => ll.includes(kw));
    if (hasKey && !hasExcl) {
      const n = extractRightmostAmount(stripDatesAndTimes(lines[i]));
      if (n >= MIN_AMOUNT && n <= MAX_AMOUNT) { totalAmount = n; break; }
    }
  }

  // Heuristic 2 — secondary keywords
  if (!totalAmount) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const ll      = lines[i].toLowerCase();
      const hasKey  = secondaryKeywords.some(kw => new RegExp(kw).test(ll));
      const hasExcl = excludeKeywords.some(kw => ll.includes(kw));
      if (hasKey && !hasExcl) {
        const n = extractRightmostAmount(stripDatesAndTimes(lines[i]));
        if (n >= MIN_AMOUNT && n <= MAX_AMOUNT) { totalAmount = n; break; }
      }
    }
  }

  // Heuristic 3 — largest number from bottom half of receipt
  if (!totalAmount) {
    const candidates = [];
    const startIdx   = Math.floor(lines.length / 2); // skip item list header
    for (let i = startIdx; i < lines.length; i++) {
      const n = extractRightmostAmount(stripDatesAndTimes(lines[i]));
      if (n >= MIN_AMOUNT && n <= MAX_AMOUNT) candidates.push(n);
    }
    if (candidates.length) totalAmount = Math.max(...candidates);
  }

  // ── 6. Category & Account Heuristics ────────────────────────────────────
  // Category: prefer merchants.json category, else keyword fallback
  let recommendedCategoryType = merchantCategory || 'groceries';
  if (!merchantCategory) {
    for (const [cat, re] of Object.entries(categoryKeywords)) {
      if (re.test(rawLower)) { recommendedCategoryType = cat; break; }
    }
  }

  // Account
  let recommendedAccountType = null;
  let accountHint = null;
  let memberHint = null;

  if (/\b(blu)\b/i.test(rawLower)) {
    recommendedAccountType = 'wallet';
    accountHint = 'blu';
  } else if (/\b(livin)\b/i.test(rawLower)) {
    recommendedAccountType = 'bank';
    accountHint = 'mandiri';
  } else if (/\b(tunai|cash|kembalian|kembali)\b/i.test(rawLower)) {
    recommendedAccountType = 'cash';
  } else if (/\b(gopay|ovo|dana|linkaja|shopeepay|qris|e-money|flazz|brizzi)\b/i.test(rawLower)) {
    recommendedAccountType = 'wallet';
  } else if (/\b(debit|kredit|card|bca|mandiri|bni|bri|cimb|kartu)\b/i.test(rawLower)) {
    recommendedAccountType = 'bank';
  }

  // Member Hint
  if (/\b(yosua)\b/i.test(rawLower)) {
    memberHint = 'yosua';
  }

  // ── 7. Per-field Confidence ──────────────────────────────────────────────
  // We use overall Tesseract confidence as a proxy.
  // Fields extracted via keyword match get a small boost; fallbacks get a penalty.
  const merchantConfidenceScore = merchantCategory
    ? Math.min(100, overallScore + 10)   // matched known merchant → bump
    : Math.max(0, overallScore - 20);    // fallback heuristic → penalise

  const amountConfidenceScore   = totalAmount > 0
    ? overallScore
    : 0;

  const dateConfidenceScore     = parsedDate !== new Date().toISOString().split('T')[0]
    ? overallScore          // parsed from text
    : Math.max(0, overallScore - 30); // fell back to today

  return {
    merchantName,
    totalAmount,
    date:       parsedDate,
    confidence: overallScore,
    fieldConfidence: {
      merchant: classifyConfidence(merchantConfidenceScore),
      amount:   classifyConfidence(amountConfidenceScore),
      date:     classifyConfidence(dateConfidenceScore),
    },
    heuristics: {
      category: recommendedCategoryType,
      account:  recommendedAccountType,
      accountHint,
      memberHint,
    },
    rawText,
    imageFile,
  };
}
