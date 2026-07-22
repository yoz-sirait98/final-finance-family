// ---------------------------------------------------------------------------
// receiptItemParser.js — Extract individual line items from raw OCR text
// ---------------------------------------------------------------------------
// Designed for Indonesian retail receipts (supermarkets, minimarkets, etc.)
// Input:  raw OCR text string
// Output: Array of { name: string, price: number, qty: number }
// ---------------------------------------------------------------------------

/**
 * Keywords that indicate a line is NOT an item (header, footer, summary lines).
 * Case-insensitive matching.
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
  'promo', 'voucher', 'saving', 'hemat', 'anda hemat',
  // Store header / footer
  'terima kasih', 'thank you', 'struk', 'receipt', 'invoice', 'nota',
  'kasir', 'cashier', 'welcome', 'selamat datang', 'selamat berbelanja',
  'alamat', 'address', 'telp', 'phone', 'fax', 'npwp', 'member',
  'no.', 'no :', 'customer', 'pelanggan', 'tanggal', 'tgl', 'date',
  'waktu', 'time', 'jam', 'order', 'transaksi',
  // Misc
  'barcode', '---', '===', '***', '###', 'print',
  'qty', 'x harga', 'harga satuan', 'unit price',
];

/**
 * Lines that are purely numeric (like barcodes) or too short to be items.
 */
const MIN_ITEM_NAME_LENGTH = 2;

/**
 * Extract the rightmost currency amount from a text line.
 * Handles: 150.000 | 150,000 | Rp150.000 | Rp 150,000 | 150000
 * Returns 0 if nothing found.
 */
function extractPrice(line) {
  // Strip Rp / IDR prefix
  const cleaned = line.replace(/\b(rp\.?|idr\.?)\s*/gi, ' ');

  // Match numbers that look like currency amounts
  const matches = [...cleaned.matchAll(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?\b/g)];
  if (!matches.length) return 0;

  // Take the LAST (rightmost) match — prices are on the right side of receipts
  const raw = matches[matches.length - 1][0];
  let s = raw.replace(/\s/g, '');

  // Strip trailing ,00 / .00
  if (s.endsWith(',00') || s.endsWith('.00')) s = s.slice(0, -3);

  // Remove remaining thousand-separators
  s = s.replace(/[.,]/g, '');

  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Try to extract quantity from the item line.
 * Common formats:
 *   "2 x MILK"  |  "MILK 2x"  |  "MILK x2"  |  "2 MILK"  |  "MILK  2  15.000"
 * Returns { qty, cleanedName } or null if no quantity pattern found.
 */
function extractQuantity(name) {
  // Pattern: "2 x ITEM" or "2x ITEM" at the start
  let m = name.match(/^(\d+)\s*[xX×]\s+(.+)/);
  if (m) return { qty: parseInt(m[1], 10), cleanedName: m[2].trim() };

  // Pattern: "ITEM 2x" or "ITEM x2" at the end (before price)
  m = name.match(/^(.+?)\s+(\d+)\s*[xX×]\s*$/);
  if (m) return { qty: parseInt(m[2], 10), cleanedName: m[1].trim() };

  m = name.match(/^(.+?)\s+[xX×]\s*(\d+)\s*$/);
  if (m) return { qty: parseInt(m[2], 10), cleanedName: m[1].trim() };

  return null;
}

/**
 * Determine if a line should be skipped (it's a header, footer, total, etc.)
 */
function shouldSkipLine(line) {
  const lower = line.toLowerCase();

  // Check against skip keywords
  for (const kw of SKIP_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }

  // Skip lines that are purely numeric (barcodes, phone numbers, etc.)
  if (/^\d[\d\s.,\-/]*$/.test(line)) return true;

  // Skip lines that are purely decorative (dashes, equals, asterisks)
  if (/^[\-=*#_\s]+$/.test(line)) return true;

  // Skip lines that look like date/time only
  if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(line)) return true;
  if (/^\d{1,2}:\d{2}/.test(line)) return true;

  return false;
}

/**
 * Clean up an item name extracted from OCR text.
 */
function cleanItemName(name) {
  let s = name;

  // Remove leading/trailing special chars
  s = s.replace(/^[\-*#.\s]+/, '').replace(/[\-*#.\s]+$/, '');

  // Remove Rp / IDR prefixes that might be stuck to the name
  s = s.replace(/\b(rp\.?|idr\.?)\s*/gi, '');

  // Remove trailing numbers that look like prices (already extracted)
  s = s.replace(/\s+\d{1,3}([.,]\d{3})*([.,]\d{2})?\s*$/, '');

  // Remove quantity indicators if still present
  s = s.replace(/\s*\d+\s*[xX×]\s*$/, '');
  s = s.replace(/^\d+\s*[xX×]\s*/, '');

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Parse raw OCR text and extract individual line items.
 *
 * Strategy:
 * 1. Split text into lines
 * 2. Skip header/footer/summary lines using keyword matching
 * 3. For remaining lines, extract name and price
 * 4. Handle multi-line items (qty line + price line pattern)
 * 5. Filter out items with no meaningful name or price
 *
 * @param {string} rawText - Raw OCR text from Tesseract
 * @returns {Array<{name: string, price: number, qty: number}>}
 */
export function parseReceiptItems(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return [];

  const items = [];
  let pendingName = null; // For multi-line item handling

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip non-item lines
    if (shouldSkipLine(line)) {
      pendingName = null;
      continue;
    }

    const price = extractPrice(line);

    if (price > 0) {
      // This line has a price — extract the name part (everything before the price)
      // Remove the price portion from the line to get the name
      let namePart = line;

      // Remove the rightmost number (price) from the line to isolate the name
      const priceMatch = [...line.matchAll(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?\b/g)];
      if (priceMatch.length > 0) {
        const lastMatch = priceMatch[priceMatch.length - 1];
        namePart = line.substring(0, lastMatch.index).trim();
      }

      // Also strip Rp prefix from the name part
      namePart = namePart.replace(/\b(rp\.?|idr\.?)\s*/gi, '').trim();

      // If this line has a name, use it. If not, use pending name from previous line.
      let itemName = cleanItemName(namePart);

      if (!itemName && pendingName) {
        itemName = pendingName;
        pendingName = null;
      }

      if (itemName && itemName.length >= MIN_ITEM_NAME_LENGTH) {
        // Check for quantity
        const qtyResult = extractQuantity(itemName);
        const qty = qtyResult ? qtyResult.qty : 1;
        const finalName = qtyResult ? cleanItemName(qtyResult.cleanedName) : itemName;

        if (finalName && finalName.length >= MIN_ITEM_NAME_LENGTH) {
          // Validate price range (skip tiny or huge amounts)
          if (price >= 100 && price <= 10_000_000) {
            items.push({ name: finalName, price, qty });
          }
        }
      }

      pendingName = null;
    } else {
      // This line has no price — it might be an item name on a separate line
      // (common in receipts where name and price are on different lines)
      const cleaned = cleanItemName(line);
      if (cleaned && cleaned.length >= MIN_ITEM_NAME_LENGTH) {
        // Check if next line has a price (look-ahead)
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        const nextPrice = extractPrice(nextLine);

        if (nextPrice > 0) {
          // This is likely a name line, next is the price line
          pendingName = cleaned;
        }
        // If next line also has no price, this is probably a standalone description line — skip it
      }
    }
  }

  return items;
}

/**
 * Deduplicate items with the same name by summing their prices.
 * Useful when OCR splits a single item across multiple lines.
 *
 * @param {Array<{name: string, price: number, qty: number}>} items
 * @returns {Array<{name: string, price: number, qty: number}>}
 */
export function deduplicateItems(items) {
  const map = new Map();

  for (const item of items) {
    const key = item.name.toLowerCase().replace(/\s+/g, ' ');
    if (map.has(key)) {
      const existing = map.get(key);
      existing.price += item.price;
      existing.qty += item.qty;
    } else {
      map.set(key, { ...item });
    }
  }

  return Array.from(map.values());
}
