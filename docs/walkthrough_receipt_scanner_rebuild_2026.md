# Walkthrough: Receipt Scanner Module Rebuild (July 2026)

This walkthrough documents the full architectural rebuild of the Receipt Scanner module used across the `TransactionsPage` and `ShoppingPage` in the Family Finance application. 

## Motivation

The initial version of the OCR scanner had been patched incrementally with hard-coded logic for thermal date repairs, margin cropping, and amount confidence. While functional for basic use cases, it failed on rotated images, split totals, or complex item tables (e.g., AEON receipts).

To improve accuracy and user experience, we rebuilt the scanner pipeline into a 4-layer architecture.

---

## 1. Core Pipeline Rebuild

### 📷 `opencvPreprocess.js` (Image Preparation)
We replaced the fixed 10% crop logic with a robust 6-step OpenCV pipeline:
1. **Grayscale Conversion**: Eliminates color noise.
2. **Edge Detection**: Uses Canny to find the receipt boundaries.
3. **Deskewing**: Uses HoughLinesP to detect the receipt skew angle and rotates the image to align it vertically.
4. **Bounding-Box Auto-Crop**: Detects the largest contour (the paper) and crops out any background (e.g., wooden tables).
5. **CLAHE Contrast**: Applies Contrast Limited Adaptive Histogram Equalization to cleanly separate thermal ink from the paper.
6. **Preview Export**: The pipeline now exports the processed grayscale image as a Base64 URL so users can see exactly what the OCR engine is reading.

### 🧠 `receiptScanner.js` (Orchestration & Extraction)
This file now acts as a pure coordinator and data extractor, returning a highly structured object:
* **Candidate-Scoring Date Extraction**: Instead of a hard-coded line scan, it now collects all date-like strings on the receipt, applies a scoring algorithm (prioritizing today's date, footer positioning, and thermal-printer correction likelihood), and picks the single most plausible date.
* **Structured Payload**: The return shape was entirely revamped from flat variables to structured nested objects:
  ```json
  {
    "merchant": { "name": "AEON", "category": "food", "brandKey": "aeon" },
    "amount": { "total": 320150, "subtotal": 0, "savings": 0 },
    "date": { "iso": "2026-07-27", "source": "27/07/2026", "confidence": "high" },
    "items": [...],
    "payment": { "type": "qris", "hint": "qris" }
  }
  ```

### 🛒 `receiptItemParser.js` (Itemization)
Previously, the parser would include non-item text from the left margin or discounts.
* **Regex Enhancements**: Upgraded pattern matching to detect `Qty x Price` formats.
* **Deduplication**: Improved logic to merge matching line items and sum their quantities.

---

## 2. Shared Composable: `useScannerMapping.js`

Previously, `TransactionsPage.vue` and `ShoppingPage.vue` both duplicated ~100 lines of logic to map the heuristic string outputs (like `category: "groceries"`) to the actual active Database UUIDs.

We extracted this into `useScannerMapping(accountsRef, categoriesRef, membersRef)`. This composable now safely:
* Maps `scanResult.merchant.category` to an active `expense` Category UUID.
* Maps `scanResult.payment.hint` to an active Account UUID.
* Maps `scanResult.member.hint` to an active Family Member UUID.

---

## 3. UI/UX Enhancements

### `TransactionsPage.vue`
* **Image Preview**: The review modal now displays the black-and-white, deskewed, auto-cropped image alongside the extracted data. This provides instant visual feedback on why a scan might have failed (e.g., if the image is too blurry).
* **Simplified Integration**: Replaced the duplicated mapping code with the `useScannerMapping` composable.

### `ShoppingPage.vue`
* **Qty and Unit Pricing**: The review table was upgraded to support and display quantity. Instead of just "Item A: Rp 20,000", it now shows `2x @ Rp 10,000 / unit`.
* **Image Preview**: Added the processed image thumbnail to the review modal.
* **Simplified Pipeline**: Uses `useScannerMapping` and consumes the pre-parsed `result.items` array directly instead of re-parsing the raw text.

---

## Manual Verification Steps

1. Open the application and navigate to the **Transactions** page.
2. Click **Scan Receipt** and select an AEON receipt photo (e.g., `media__1785201509754.jpg`).
3. **Verify Preview**: Check that the review modal displays a clean, black-and-white cropped thumbnail of the receipt.
4. **Verify Date**: Check that the date successfully extracted as `27/07/2026`.
5. **Navigate to Shopping**: Cancel the transaction, go to the **Shopping** page, and scan the exact same receipt.
6. **Verify Items**: Check that the item table correctly lists individual items, quantities, and their total line prices.
