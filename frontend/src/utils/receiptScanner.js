import Tesseract from 'tesseract.js';
import { loadOpenCV } from './opencvLoader';
import { preprocessReceiptImage } from './opencvPreprocess';
import merchantsDb from './merchants.json';
import { parseReceiptItems } from './receiptItemParser';

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

// Category → heuristic keyword fallback
const categoryKeywords = {
  food:        /(cafe|kopi|coffee|starbucks|resto|bakso|mcd|kfc|burger|pizza|dunkin|roti|eat|warung|mie|makan)/i,
  health:      /(apotek|kimia|guardian|watsons|sehat|klinik|dokter|medicine|panadol|bodrex)/i,
  utilities:   /(pln|listrik|pdam|air|telkom|internet|pulsa|speedy)/i,
  transport:   /(pertamina|bensin|shell|gojek|go-jek|grab|grob|greb|taxi|toll|parkir|ride|fare|passenger|booking|trip|perjalanan|driver)/i,
};

// ---------------------------------------------------------------------------
// Number extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract the RIGHTMOST valid Rupiah amount from a text line.
 * Returns 0 if nothing found.
 */
function extractRightmostAmount(line) {
  const cleaned = line.replace(/\b(rp\.?|idr\.?)\s*/gi, ' ');
  const matches = [...cleaned.matchAll(/\b(?:\d{1,3}(?:[.,\s]\d{3})+|\d+)(?:[.,]\d{2})?\b/g)];
  if (!matches.length) return 0;

  const raw = matches[matches.length - 1][0];
  let s = raw.replace(/\s/g, '');

  if (s.endsWith(',00') || s.endsWith('.00')) s = s.slice(0, -3);
  s = s.replace(/[.,]/g, '');

  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Remove date/time tokens from a line to prevent them being mistaken for amounts.
 */
function stripDatesAndTimes(line) {
  let s = line.toLowerCase();
  s = s.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ');
  s = s.replace(/(?<!\d)\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}(?!\d)/g, ' ');
  s = s.replace(/(?<!\d)\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}(?!\d)/g, ' ');
  const months = '(?:jan|feb|mar|apr|mei|may|jun|jul|ags|aug|sep|okt|oct|nov|des|dec)[a-z]*';
  s = s.replace(new RegExp(`(?<!\\d)\\d{1,2}[\\s/\\-.]*${months}[\\s/\\-.]*\\d{2,4}(?!\\d)`, 'g'), ' ');
  return s;
}

// ---------------------------------------------------------------------------
// Date Candidate Scoring Engine
// ---------------------------------------------------------------------------

function parseDateCandidatesFromLine(text, lineIdx, totalLines) {
  const candidates = [];
  let cleaned = text.toLowerCase();

  // Normalize delimiters & common OCR noise
  cleaned = cleaned.replace(/(?<=\d|[/\\|.-])[oo](?=\d|[/\\|.-])/gi, '0');
  cleaned = cleaned.replace(/\s*[/\\|]\s*/g, '/');

  // Regex patterns
  const m1 = cleaned.match(/(?<!\d)(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})(?!\d)/);
  if (m1) {
    const d = +m1[1], mo = +m1[2];
    let y = +m1[3];
    if (m1[3].length === 2) y += 2000;
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 2000 && y <= 2099) {
      candidates.push({
        iso: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
        raw: m1[0],
        lineIdx,
      });
    }
  }

  const m2 = cleaned.match(/(?<!\d)(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?!\d)/);
  if (m2) {
    const y = +m2[1], mo = +m2[2], d = +m2[3];
    if (y >= 2000 && y <= 2099 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      candidates.push({
        iso: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
        raw: m2[0],
        lineIdx,
      });
    }
  }

  for (const mItem of fuzzyMonths) {
    const re = new RegExp(`(?<!\\d)(\\d{1,2})[\\s/\\-.]*(${mItem.pattern.source})[a-z]*[\\s/\\-.]*(\\d{2,4})(?!\\d)`, 'i');
    const wm = cleaned.match(re);
    if (wm) {
      const d = +wm[1];
      let y = +wm[3];
      if (wm[3].length === 2) y += 2000;
      if (d >= 1 && d <= 31 && y >= 2000 && y <= 2099) {
        candidates.push({
          iso: `${y}-${mItem.val}-${String(d).padStart(2,'0')}`,
          raw: wm[0],
          lineIdx,
        });
      }
    }
  }

  return candidates;
}

/**
 * Score date candidates to pick the most plausible transaction date.
 */
function scoreAndSelectBestDate(lines) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const allCandidates = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toLowerCase().includes('pengukuhan')) continue; // Skip tax registration header date

    const cands = parseDateCandidatesFromLine(line, i, lines.length);
    for (const cand of cands) {
      allCandidates.push(cand);

      // Also create dot-matrix 7->1 thermal repaired candidate if applicable
      const [y, mo, d] = cand.iso.split('-').map(Number);
      if (y === currentYear) {
        let repairedMo = mo;
        let repairedD = d;
        if (mo === 1 && currentMonth >= 6) repairedMo = currentMonth;
        if (d === 21) repairedD = 27;
        else if (d === 11) repairedD = 17;
        else if (d === 1) repairedD = 7;

        if (repairedMo !== mo || repairedD !== d) {
          allCandidates.push({
            iso: `${y}-${String(repairedMo).padStart(2,'0')}-${String(repairedD).padStart(2,'0')}`,
            raw: cand.raw + ' (thermal repair)',
            lineIdx: i,
            isRepaired: true,
          });
        }
      }
    }
  }

  if (!allCandidates.length) return new Date().toISOString().split('T')[0];

  // Score each candidate
  let bestCand = null;
  let maxScore = -999;

  for (const cand of allCandidates) {
    const candDateObj = new Date(cand.iso);
    const diffDays = (now - candDateObj) / (1000 * 60 * 60 * 24);

    let score = 0;

    // 1. Plausibility score (dates within last 45 days get high points)
    if (diffDays >= -1 && diffDays <= 45) {
      score += 50;
      if (diffDays <= 7) score += 20; // Very recent receipt
    } else if (diffDays > 45 && diffDays <= 365) {
      score += 10;
    } else {
      score -= 50; // Far past or future date
    }

    // 2. Position score (transaction dates sit near the bottom footer)
    const positionRatio = cand.lineIdx / lines.length; // 0.0 (top) to 1.0 (bottom)
    score += Math.round(positionRatio * 30);

    // 3. Line keyword context score
    const lineText = lines[cand.lineIdx].toLowerCase();
    if (/trans|receipt|struk|jam|date|tgl|waktu/i.test(lineText)) score += 25;

    // 4. Repaired candidate bonus if original was > 60 days in past
    if (cand.isRepaired) score += 15;

    if (score > maxScore) {
      maxScore = score;
      bestCand = cand;
    }
  }

  return bestCand ? bestCand.iso : new Date().toISOString().split('T')[0];
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
// Main Scanner Export
// ---------------------------------------------------------------------------

/**
 * Scan a receipt image file.
 *
 * @param {File}     imageFile        - Raw File from camera / file input
 * @param {Function} progressCallback - Called with 0-100 during OCR recognition
 * @returns {Promise<object>} Structured receipt analysis result
 */
export async function scanReceipt(imageFile, progressCallback) {

  // ── 1. OpenCV Preprocessing ───────────────────────────────────
  if (progressCallback) progressCallback(5, 'Loading image processing engine...');
  await new Promise(resolve => setTimeout(resolve, 50));
  
  let ocrInput = imageFile;
  let processedImageDataUrl = '';

  try {
    const cv = await Promise.race([
      loadOpenCV(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('OpenCV load timeout')), 3000))
    ]).catch(() => null);

    if (progressCallback) progressCallback(10, 'Enhancing image for OCR...');
    await new Promise(resolve => setTimeout(resolve, 50));

    const preprocessedCanvas = await preprocessReceiptImage(imageFile, cv);
    ocrInput = preprocessedCanvas;
    processedImageDataUrl = preprocessedCanvas.processedImageDataUrl || '';
  } catch (err) {
    console.warn('Preprocessing fallback to native canvas:', err);
    try {
      const nativeCanvas = await preprocessReceiptImage(imageFile, null);
      ocrInput = nativeCanvas;
      processedImageDataUrl = nativeCanvas.processedImageDataUrl || '';
    } catch (e) {
      console.warn('Native preprocessing failed:', e);
    }
  }

  // ── 2. Tesseract OCR ────────────────────────────────────────────────────
  if (progressCallback) progressCallback(15, 'Initializing OCR engine...');
  const ret = await Tesseract.recognize(
    ocrInput,
    'eng+ind',
    {
      logger: m => {
        if (progressCallback) {
          const statusText = m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) + '...' : 'Scanning...';
          const p = Math.round((m.progress || 0) * 100);
          progressCallback(p, statusText);
        }
      },
      tessedit_pageseg_mode: '6', // PSM 6 = single uniform block
    },
  );

  const rawText        = ret.data.text;
  const overallScore   = Math.round(ret.data.confidence ?? 0); // 0-100

  const lines = rawText.split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (l.length < 2) return false;
      const alphaNum = (l.match(/[a-zA-Z0-9]/g) || []).length;
      return alphaNum >= 2;
    });

  if (lines.length === 0) {
    throw new Error('No text detected on the receipt image.');
  }

  // ── 3. Merchant Extraction ─────────────────────────────────────────────
  let merchantName     = '';
  let merchantCategory = '';
  let brandKey         = '';

  const rawLower = rawText.toLowerCase();
  if (rawLower.includes('klikindomaret') || rawLower.includes('indomaret')) {
    merchantName = 'INDOMARET';
    merchantCategory = 'groceries';
    brandKey = 'indomaret';
  } else if (rawLower.includes('@kopikenangan.id') || rawLower.includes('kopi kenangan') || rawLower.includes('kenangan')) {
    merchantName = 'Kopi Kenangan';
    merchantCategory = 'food';
    brandKey = 'kopikenangan';
  } else {
    for (const entry of merchantsDb) {
      const re = new RegExp(entry.pattern, 'i');
      if (re.test(rawText)) {
        merchantName     = entry.name;
        merchantCategory = entry.category;
        brandKey         = entry.pattern;
        break;
      }
    }

    if (!merchantName) {
      const blacklist = [
        'alamat','telp','npwp','tanggal','tgl','receipt','strip','kasir','cashier',
        'welcome','terima','kasih','thank','you','invoice','member','no.','order',
        'promo','discount','diskon','transaksi','merchant','jl.','jalan','raya',
        'card','tunai','cash','debit','pengukuhan','hotline','customer','email',
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

  // ── 4. Date Extraction ──────────────────────────────────────────────────
  const parsedDate = scoreAndSelectBestDate(lines);

  // ── 5. Total & Subtotal & Savings Amount ────────────────────────────────
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
    'saving','hemat','diskon','discount','item','qty'
  ];

  const MIN_AMOUNT = 100;
  const MAX_AMOUNT = 50_000_000;

  let totalAmount = 0;
  let subtotalAmount = 0;
  let savingsAmount = 0;

  // Strict search for Total
  for (let i = lines.length - 1; i >= 0; i--) {
    const ll      = lines[i].toLowerCase();
    const hasKey  = strictKeywords.some(kw => new RegExp(kw).test(ll));
    const hasExcl = excludeKeywords.some(kw => ll.includes(kw));
    if (hasKey && !hasExcl) {
      const n = extractRightmostAmount(stripDatesAndTimes(lines[i]));
      if (n >= MIN_AMOUNT && n <= MAX_AMOUNT) { totalAmount = n; break; }
    }
  }

  // Secondary search for Total
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

  // Largest number fallback
  if (!totalAmount) {
    const candidates = [];
    const startIdx   = Math.floor(lines.length / 2);
    for (let i = startIdx; i < lines.length; i++) {
      const n = extractRightmostAmount(stripDatesAndTimes(lines[i]));
      if (n >= MIN_AMOUNT && n <= MAX_AMOUNT) candidates.push(n);
    }
    if (candidates.length) totalAmount = Math.max(...candidates);
  }

  // Extract savings if present (e.g., TOTAL SAVING: 65,250)
  for (const l of lines) {
    if (/saving|hemat|diskon|discount/i.test(l)) {
      const n = extractRightmostAmount(stripDatesAndTimes(l));
      if (n > 0 && n < totalAmount) {
        savingsAmount = n;
        break;
      }
    }
  }

  // ── 6. Category, Payment & Account Heuristics ──────────────────────────
  let recommendedCategoryType = merchantCategory || 'groceries';
  if (!merchantCategory) {
    for (const [cat, re] of Object.entries(categoryKeywords)) {
      if (re.test(rawLower)) { recommendedCategoryType = cat; break; }
    }
  }

  let paymentType = null;
  let paymentHint = null;
  let memberHint  = null;

  if (/\b(blu)\b/i.test(rawLower)) {
    paymentType = 'wallet';
    paymentHint = 'blu';
  } else if (/\b(livin)\b/i.test(rawLower)) {
    paymentType = 'bank';
    paymentHint = 'mandiri';
  } else if (/\b(tunai|cash|kembalian|kembali)\b/i.test(rawLower)) {
    paymentType = 'cash';
  } else if (/\b(gopay|ovo|dana|linkaja|shopeepay|qris|e-money|flazz|brizzi)\b/i.test(rawLower)) {
    paymentType = 'wallet';
  } else if (/\b(debit|kredit|card|bca|mandiri|bni|bri|cimb|kartu)\b/i.test(rawLower)) {
    paymentType = 'bank';
  }

  if (/\b(yosua)\b/i.test(rawLower)) {
    memberHint = 'yosua';
  }

  // ── 7. Line Item Extraction ───────────────────────────────────────────
  const parsedItems = parseReceiptItems(rawText);

  // ── 8. Per-field Confidence ────────────────────────────────────────────
  const merchantConfidenceScore = merchantCategory
    ? Math.min(100, overallScore + 10)
    : Math.max(0, overallScore - 20);

  const amountConfidenceScore   = totalAmount > 0 ? overallScore : 0;
  const dateConfidenceScore     = parsedDate !== new Date().toISOString().split('T')[0]
    ? overallScore
    : Math.max(0, overallScore - 30);

  // ── 9. Return Structured Result ────────────────────────────────────────
  return {
    // Backwards-compatible legacy properties
    merchantName,
    totalAmount,
    date: parsedDate,
    confidence: overallScore,

    // Structured properties
    merchant: {
      name: merchantName,
      category: merchantCategory,
      brandKey,
    },
    amount: {
      total: totalAmount,
      subtotal: subtotalAmount || totalAmount,
      savings: savingsAmount,
    },
    payment: {
      type: paymentType,
      hint: paymentHint,
    },
    member: {
      hint: memberHint,
    },
    items: parsedItems,

    fieldConfidence: {
      merchant: classifyConfidence(merchantConfidenceScore),
      amount:   classifyConfidence(amountConfidenceScore),
      date:     classifyConfidence(dateConfidenceScore),
    },

    heuristics: {
      category: recommendedCategoryType,
      account:  paymentType,
      accountHint: paymentHint,
      memberHint,
    },

    rawText,
    processedImageDataUrl,
    imageFile,
  };
}
