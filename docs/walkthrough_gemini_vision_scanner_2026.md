# Walkthrough: Gemini Vision API Receipt Scanner Upgrade (July 2026)

This walkthrough documents the full architectural transition of the Receipt Scanner module from Tesseract.js & Regex line parsing to **Google Gemini 1.5 Flash Vision API**.

---

## Key Architectural Changes

1. **Replaced Tesseract.js & Regex Parsers with Multimodal AI**:
   - Tesseract.js and its 13MB dependencies (`opencv-js`, `tesseract.js`) have been removed from `package.json`.
   - The scanner now sends a compressed JPEG payload directly to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` (with automatic fallback to `gemini-flash-latest`).
   - Gemini receives a structured JSON schema instruction and returns clean, structured data: merchant name, transaction date, total amount, payment method, customer/member name heuristic, and item array with quantities and unit prices.

2. **Lightweight Canvas Image Preprocessing**:
   - `opencvPreprocess.js` was refactored into a lightweight canvas resizer that scales the receipt image to max 1280px and outputs high-quality JPEG Base64 data.
   - Zero heavy WASM or ASM.js dependencies.

3. **Smooth UX Progress Ticker**:
   - Added an active progress ticker interval during the AI request that smoothly animates the progress bar from 35% → 45% → 60% → 75% → 90% → 100% so the user gets continuous visual feedback as the AI processes the receipt.

4. **Settings Page & Supabase Storage Integration**:
   - **Cross-device API Key**: Reads API key from `localStorage.getItem('gemini_api_key')` (configured in Settings Page) with fallback to `VITE_GEMINI_API_KEY` in `.env`.
   - **Supabase Storage**: Scanned receipts on both Transactions and Shopping Plan pages are automatically uploaded to Supabase Storage (`receipts` bucket).
   - **Receipt Lightbox**: Shopping Plan cards and detail view now include a clickable "Struk" button opening a full receipt photo preview.

5. **Code Cleanup**:
   - Deleted `receiptItemParser.js` (no longer needed since Gemini extracts item line arrays directly).
   - Removed `tesseract.js` from `package.json` (build size reduced by ~15MB).

---

## Configuration

Set the API Key either in **Settings Page** within the app or in `.env`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free API key at [Google AI Studio](https://aistudio.google.com/apikey).

---

## Verification Results

- **Build**: Successfully compiled using `npm run build` in 1.68 seconds.
- **Git Push**: Pushed to `origin/main` (commit `51edcd0`).
