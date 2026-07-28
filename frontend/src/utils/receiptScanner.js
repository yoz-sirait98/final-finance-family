import { preprocessReceiptImage } from './opencvPreprocess';
import merchantsDb from './merchants.json';

/**
 * Gemini Vision API Receipt Scanner
 * Replaces Tesseract.js & regex parsing with Gemini 1.5 Flash multimodal AI.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_FALLBACK_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const RECEIPT_PROMPT = `
You are a high-precision Indonesian receipt OCR and parser for a family finance app.
Analyze this receipt image and extract structured information.

Return ONLY a JSON object with the following schema:
{
  "merchantName": "Name of store/merchant (e.g. AEON, Indomaret, Kopi Kenangan, Starbucks, etc.)",
  "merchantCategory": "groceries | food | health | utilities | transport | entertainment | shopping | household",
  "date": "YYYY-MM-DD (Transaction date. Format strictly as YYYY-MM-DD. Look carefully at receipt date headers or footers)",
  "totalAmount": 123000,
  "subtotalAmount": 123000,
  "savingsAmount": 0,
  "paymentType": "cash | wallet | bank",
  "paymentHint": "bca | mandiri | blu | gopay | ovo | dana | qris | etc",
  "customerName": "Customer or member name printed on receipt if present (e.g. Yosua, Budi, etc.)",
  "items": [
    {
      "name": "Exact item name cleaned of barcode or weird symbols",
      "qty": 1,
      "unitPrice": 10000,
      "price": 10000
    }
  ]
}

Strict Rules:
1. Extract EVERY individual purchase item row listed on the receipt accurately.
2. Clean OCR noise or raw barcode numbers from item names.
3. Make sure date is formatted as YYYY-MM-DD.
4. Amounts must be raw integers (e.g., 46500, NOT "46.500" or "Rp 46.500").
5. Exclude subtotal, grand total, tax, discount lines, change/kembalian, or payment details from the "items" array.
6. Output ONLY valid JSON.
`;

export async function scanReceipt(imageFile, progressCallback) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured in .env file. Please add your Gemini API key to continue.');
  }

  // 1. Image Compression & Base64 encoding
  if (progressCallback) progressCallback(15, 'Compressing image...');
  const canvas = await preprocessReceiptImage(imageFile);
  const base64Data = canvas.base64Data;
  const processedImageDataUrl = canvas.processedImageDataUrl;

  if (!base64Data) {
    throw new Error('Failed to encode receipt image for AI processing.');
  }

  // 2. Call Gemini 1.5 Flash Vision API
  if (progressCallback) progressCallback(35, 'Analyzing receipt with AI...');

  const payload = {
    contents: [
      {
        parts: [
          { text: RECEIPT_PROMPT },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1,
    },
  };

  let response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok && response.status === 404) {
    console.warn('Primary Gemini model endpoint returned 404, trying fallback endpoint...');
    response = await fetch(`${GEMINI_FALLBACK_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  if (progressCallback) progressCallback(85, 'Parsing AI response...');

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const msg = errorJson.error?.message || `API error ${response.status}`;
    throw new Error(`Gemini Vision API error: ${msg}`);
  }

  const resData = await response.json();
  const textResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error('Gemini Vision API returned an empty response.');
  }

  let parsedData = {};
  try {
    // Strip markdown formatting if model wrapped in ```json ... ```
    const cleanJson = textResponse.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsedData = JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', textResponse);
    throw new Error('Failed to parse AI response into structured data.');
  }

  if (progressCallback) progressCallback(100, 'Processing complete!');

  // Normalize extracted fields
  const merchantName = parsedData.merchantName || 'Receipt Scan';
  const merchantCategory = parsedData.merchantCategory || 'groceries';
  const totalAmount = parseInt(parsedData.totalAmount || 0, 10);
  const subtotalAmount = parseInt(parsedData.subtotalAmount || totalAmount, 10);
  const savingsAmount = parseInt(parsedData.savingsAmount || 0, 10);

  // Validate & format items array
  const rawItems = Array.isArray(parsedData.items) ? parsedData.items : [];
  const items = rawItems
    .filter(i => i.name && typeof i.name === 'string' && i.name.trim().length > 1)
    .map(i => {
      const p = parseInt(i.price || i.unitPrice || 0, 10);
      const q = parseInt(i.qty || 1, 10);
      const u = parseInt(i.unitPrice || (q > 0 ? Math.round(p / q) : p), 10);
      return {
        name: i.name.trim(),
        price: p,
        qty: q,
        unitPrice: u,
      };
    });

  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(parsedData.date)
    ? parsedData.date
    : new Date().toISOString().split('T')[0];

  return {
    merchantName,
    totalAmount,
    date: parsedDate,
    confidence: 95,

    merchant: {
      name: merchantName,
      category: merchantCategory,
      brandKey: merchantName.toLowerCase(),
    },
    amount: {
      total: totalAmount,
      subtotal: subtotalAmount,
      savings: savingsAmount,
    },
    payment: {
      type: parsedData.paymentType || null,
      hint: parsedData.paymentHint || null,
    },
    member: {
      hint: parsedData.customerName || parsedData.memberName || null,
    },
    items,

    fieldConfidence: {
      merchant: 'high',
      amount: 'high',
      date: 'high',
    },

    heuristics: {
      category: merchantCategory,
      account: parsedData.paymentType || null,
      accountHint: parsedData.paymentHint || null,
      memberHint: parsedData.customerName || parsedData.memberName || null,
    },

    rawText: textResponse,
    processedImageDataUrl,
    imageFile,
  };
}
