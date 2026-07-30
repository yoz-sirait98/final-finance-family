# Implementation Plan

## Receipt Scanner Module — Full Rebuild (July 2026)

### Problem Area & Target Architecture

| Problem Area | Current State | Target State |
|---|---|---|
| **Architecture** | Logic scattered across 3 files (`receiptScanner.js`, `opencvPreprocess.js`, `receiptItemParser.js`) | Single composable `useReceiptScanner` + clean pipeline utility files |
| **Image preprocessing** | Fixed 10% crop + `blockSize=31` threshold | Adaptive deskew → auto-crop to receipt bounding box → CLAHE-equivalent contrast |
| **Date parsing** | Fragile regex + hardcoded `currentMonth` correction | Candidate-scoring pipeline — pick most plausible date from all candidates |
| **Amount parsing** | 3 heuristic passes; large amounts misidentified if OCR splits a line | Multi-pass with per-line scoring: keyword density + position weight + range filter |
| **Merchant matching** | Hardcoded `if/else` + merchant JSON regex scan | DB-matched merchant object + fuzzy fallback → return structured `{ name, category, brandKey }` |
| **Item parsing** | Works, but has no column-detection (left-side noise items added) | Filter out margin noise, extract unit prices, quantities, and line totals cleanly |
| **Shared logic** | `TransactionsPage.vue` duplicates 100+ lines of account/category/member mapping | Extract into `useScannerMapping.js` composable — reused by both pages |
| **UX** | Progress bar only; no preview of preprocessed image | Show preprocessed image thumbnail next to raw OCR panel in review modal |

---

### Proposed Changes

#### Layer 1: Core Pipeline Utils
* **`frontend/src/utils/opencvPreprocess.js`**:
  * Add auto-contour crop (detecting receipt paper rectangle).
  * Enhance contrast using adaptive binarization + Gaussian blur.
  * Export both canvas AND base64 data URL for review modal preview.
* **`frontend/src/utils/receiptItemParser.js`**:
  * Improve quantity/unit-price extraction (e.g., `3x @ Rp 46,500`).
  * Filter discount lines (`disc:`, `saving`).
  * Robust deduplication merging both prices and quantities.
* **`frontend/src/utils/receiptScanner.js`**:
  * Replace date typo fixer with Candidate Scoring Engine.
  * Return structured object: `{ merchant, amount, date, items, payment, member, rawText, processedImageDataUrl, fieldConfidence, imageFile }`.

#### Layer 2: Shared Composable
* **[NEW] `frontend/src/composables/useScannerMapping.js`**:
  * Extract account, category, and member mapping logic out of Vue components into a reusable composable.

#### Layer 3: Page Integration
* **`frontend/src/pages/TransactionsPage.vue`**:
  * Consume new `scanReceipt()` structure and `useScannerMapping`.
  * Display preprocessed image thumbnail in raw OCR modal.
  * Support savings amount badge.
* **`frontend/src/pages/ShoppingPage.vue`**:
  * Consume pre-parsed `result.items` directly.
  * Show quantity and per-unit price calculations in receipt review modal.

---

## Past Features History

### WhatsApp Checkout Notifications
- Added automatic WhatsApp notification dispatch when completing checkout in `ShoppingDetailPage.vue`.
