// ---------------------------------------------------------------------------
// receiptItemParser.js — Extract individual line items from raw OCR text
// ---------------------------------------------------------------------------
// Designed for Indonesian retail receipts (supermarkets, minimarkets, etc.)
// Input:  raw OCR text string
// Output: Array of { name: string, price: number, qty: number, unitPrice: number }
// ---------------------------------------------------------------------------

/**
 * Keywords that indicate a line is NOT an item (header, footer, summary lines).
 */
const SKIP_KEYWORDS = [
  // Summary / total lines
  'total', 'subtotal', 'sub total', 'grand total', 'total belanja', 'total bayar',
  'total harga', 'jumlah total', 'total pembayaran', 'total transaksi',
  'harus dibayar', 'total due', 'netto', 'net amount',
  // Payment / change lines
  'tunai', 'cash', 'kembali', 'kembalian', 'change', 'bayar', 'pembayaran',
  'debit', 'credit', 'kredit', 'card', 'kartu', 'visa', 'mastercard',
  'gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'qris', 'e-money',
  'flazz', 'brizzi', 'edc', 'non-tunai',
  // Tax / discount summary
  'ppn', 'pajak', 'tax', 'vat', 'disc', 'diskon', 'discount', 'potongan',
  'promo', 'voucher', 'saving', 'hemat', 'anda hemat', 'disc:', 'disc :',
  // Delivery and service fees
  'delivery', 'ongkir', 'service', 'layanan', 'biaya', 'fee', 'charge',
  // Store header / footer
  'terima kasih', 'thank you', 'struk', 'receipt', 'invoice', 'nota',
  'kasir', 'cashier', 'welcome', 'selamat datang', 'selamat berbelanja',
  'alamat', 'address', 'telp', 'phone', 'fax', 'npwp', 'member',
  'no.', 'no :', 'customer', 'pelanggan', 'tanggal', 'tgl', 'date',
  'waktu', 'time', 'jam', 'order', 'transaksi', 'pengukuhan', 'hotline',
  // Misc
  'barcode', '---', '===', '***', '###', 'print',
  'qty', 'x harga', 'harga satuan', 'unit price',
];

const MIN_ITEM_NAME_LENGTH = 2;

/**
 * Extract the rightmost currency amount from a text line.
 * Returns 0 if nothing found.
 */
function extractPrice(line) {
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
 * Try to extract quantity and unit price from the item name / line.
 * Formats supported:
 *   - "3 x 46.500" or "3x @ 46500"
 *   - "3 MILK" or "MILK 3x"
 *   - "MILK 3 15000"
 */
function extractQuantityAndUnitPrice(name, totalPrice) {
  let qty = 1;
  let unitPrice = totalPrice;
  let cleanedName = name;

  // Pattern: "3 x 46,500" or "3x 46500"
  let m = name.match(/^(\d+)\s*[xX×@]\s*([\d.,]+)\s+(.+)/);
  if (m) {
    qty = parseInt(m[1], 10);
    const parsedUnit = parseInt(m[2].replace(/[.,]/g, ''), 10);
    if (!isNaN(parsedUnit) && parsedUnit > 0) unitPrice = parsedUnit;
    cleanedName = m[3].trim();
    return { qty, unitPrice, cleanedName };
  }

  // Pattern: "3 x MILK" or "3x MILK"
  m = name.match(/^(\d+)\s*[xX×]\s+(.+)/);
  if (m) {
    qty = parseInt(m[1], 10);
    cleanedName = m[2].trim();
    if (qty > 0 && totalPrice > 0) unitPrice = Math.round(totalPrice / qty);
    return { qty, unitPrice, cleanedName };
  }

  // Pattern: "MILK 2x" or "MILK x2" at the end
  m = name.match(/^(.+?)\s+(\d+)\s*[xX×]\s*$/);
  if (m) {
    qty = parseInt(m[2], 10);
    cleanedName = m[1].trim();
    if (qty > 0 && totalPrice > 0) unitPrice = Math.round(totalPrice / qty);
    return { qty, unitPrice, cleanedName };
  }

  // Pattern for minimarkets: "ITEM NAME [Qty] [UnitPrice]"
  m = name.match(/^(.+?)\s+(\d+)\s+(\d{3,})\s*$/);
  if (m) {
    qty = parseInt(m[2], 10);
    const parsedUnit = parseInt(m[3].replace(/[.,]/g, ''), 10);
    if (!isNaN(parsedUnit) && parsedUnit > 0) unitPrice = parsedUnit;
    cleanedName = m[1].trim();
    return { qty, unitPrice, cleanedName };
  }

  // Fallback for trailing small qty number
  m = name.match(/^(.+?)\s+(\d+)\s*$/);
  if (m && m[2].length < 3) {
    qty = parseInt(m[2], 10);
    cleanedName = m[1].trim();
    if (qty > 0 && totalPrice > 0) unitPrice = Math.round(totalPrice / qty);
    return { qty, unitPrice, cleanedName };
  }

  return { qty: 1, unitPrice: totalPrice, cleanedName: name };
}

/**
 * Determine if a line should be skipped (header, footer, discount, etc.).
 */
function shouldSkipLine(line) {
  const lower = line.toLowerCase();

  for (const kw of SKIP_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }

  if (/^\d[\d\s.,\-/]*$/.test(line)) return true;
  if (/^[\-=*#_\s]+$/.test(line)) return true;
  if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(line)) return true;
  if (/^\d{1,2}:\d{2}/.test(line)) return true;

  return false;
}

/**
 * Clean up an item name extracted from OCR text.
 */
function cleanItemName(name) {
  let s = name;

  s = s.replace(/^[\-*#.\s«+T]+/, '').replace(/[\-*#.\s«+]+$/, '');
  s = s.replace(/\b(rp\.?|idr\.?)\s*/gi, '');
  s = s.replace(/\s+\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?\s*$/, '');
  s = s.replace(/\s*\d+\s*[xX×]\s*$/, '');
  s = s.replace(/^\d+\s*[xX×]\s*/, '');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Parse raw OCR text and extract individual line items.
 *
 * @param {string} rawText - Raw OCR text from Tesseract
 * @returns {Array<{name: string, price: number, qty: number, unitPrice: number}>}
 */
export function parseReceiptItems(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return [];

  const items = [];
  let pendingName = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (shouldSkipLine(line)) {
      pendingName = null;
      continue;
    }

    const price = extractPrice(line);

    if (price > 0) {
      let namePart = line;

      const priceMatch = [...line.matchAll(/\b(?:\d{1,3}(?:[.,\s]\d{3})+|\d+)(?:[.,]\d{2})?\b/g)];
      if (priceMatch.length > 0) {
        const lastMatch = priceMatch[priceMatch.length - 1];
        namePart = line.substring(0, lastMatch.index).trim();
      }

      namePart = namePart.replace(/\b(rp\.?|idr\.?)\s*/gi, '').trim();

      let itemName = cleanItemName(namePart);

      if (!itemName && pendingName) {
        itemName = pendingName;
        pendingName = null;
      }

      if (itemName && itemName.length >= MIN_ITEM_NAME_LENGTH) {
        const { qty, unitPrice, cleanedName } = extractQuantityAndUnitPrice(itemName, price);
        const finalName = cleanItemName(cleanedName);

        if (finalName && finalName.length >= MIN_ITEM_NAME_LENGTH) {
          if (price >= 100 && price <= 10_000_000) {
            items.push({
              name: finalName,
              price,
              qty: qty || 1,
              unitPrice: unitPrice || price,
            });
          }
        }
      }

      pendingName = null;
    } else {
      const cleaned = cleanItemName(line);
      if (cleaned && cleaned.length >= MIN_ITEM_NAME_LENGTH) {
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        const nextPrice = extractPrice(nextLine);

        if (nextPrice > 0) {
          pendingName = cleaned;
        }
      }
    }
  }

  return deduplicateItems(items);
}

/**
 * Deduplicate items with the same name by combining quantity and price.
 *
 * @param {Array<{name: string, price: number, qty: number, unitPrice: number}>} items
 * @returns {Array<{name: string, price: number, qty: number, unitPrice: number}>}
 */
export function deduplicateItems(items) {
  const map = new Map();

  for (const item of items) {
    const key = item.name.toLowerCase().replace(/\s+/g, ' ');
    if (map.has(key)) {
      const existing = map.get(key);
      existing.price += item.price;
      existing.qty += item.qty;
      if (existing.qty > 0) {
        existing.unitPrice = Math.round(existing.price / existing.qty);
      }
    } else {
      map.set(key, { ...item });
    }
  }

  return Array.from(map.values());
}
