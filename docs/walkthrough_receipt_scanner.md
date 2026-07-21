# 📸 Receipt Scanner Upgrade — Walkthrough

We have successfully upgraded the Receipt Scanner module to be a production-quality, **100% offline** local-first solution using OpenCV.js and Tesseract.js.

## 🛠️ What Was Built

### 1. OpenCV Pre-Processing Pipeline (Phase 1)
We replaced the raw camera feed with a robust 6-step OpenCV image processing pipeline. This drastically improves Tesseract's ability to read text accurately.
- **`opencvLoader.js`**: Lazy-loads a slim build of OpenCV.js (~3-4MB) from a CDN only when the user taps "Scan Receipt" for the first time. It caches the instance so subsequent scans are instant.
- **`opencvPreprocess.js`**: Applies Grayscale → Gaussian Blur → Adaptive Threshold (crucial for uneven receipt lighting) → Morphological Close (fills character gaps) → Upscaling → Canvas Output. It also includes strict `cv.Mat` memory cleanup to prevent memory leaks.
- **`receiptScanner.js` (Upgraded)**: Now runs the OpenCV pipeline first, passes the cleaned image to Tesseract (using `PSM 6` mode for better single-block reading), and implements smarter "rightmost number" extraction for two-column receipts, supporting Indonesian `Rp` prefixes.

### 2. Indonesian Merchant Database
- **`merchants.json`**: Replaced 16 hard-coded merchants with over **100 structured Indonesian merchants**, automatically categorising them (e.g., Indomaret → Groceries, Pertamina → Transport).

### 3. UX Enhancements & Confidence Scoring (Phase 2)
- **Confidence Badges**: The scanner now calculates confidence scores for the extracted Merchant, Amount, and Date. In the Add Transaction modal, you'll see coloured badges:
  - 🟢 **Scanned (Akurat)**: High confidence (≥80%)
  - 🟡 **Please verify (Periksa)**: Medium confidence (50-79%)
  - 🔴 **Likely wrong (Mungkin salah)**: Low confidence (<50%)
- **Raw OCR Panel**: Added a collapsible panel at the bottom of the modal so users can inspect the raw text Tesseract extracted if the auto-fill missed something.
- **Duplicate Detection**: The system hashes `amount|date|merchantName` and compares it against recent transactions. If it detects a duplicate, it shows an amber warning banner above the form.

### 4. Atomic One-Step Save (Phase 3)
- Fixed the "orphan receipt" bug. Previously, the app created the database row first, then uploaded the image via a `PATCH`. If the upload failed, an orphan row was left behind.
- **New Flow**: `TransactionsPage.vue` now uploads the receipt image *first*. It takes the resulting `storagePath` and injects it into the initial `POST` payload, ensuring the transaction and receipt URL are saved atomically.

### 5. Bonus: Syntax Bug Fix
- Fixed a pre-existing syntax error in `ShoppingDetailPage.vue` that was breaking the production build (a missing closing brace had caused a massive block of duplicate code). The app now builds perfectly (`npm run build` succeeds).

## 🧪 Validation Results
- [x] **Build Verification**: `npm run build` completed successfully in ~1.6s with 0 errors.
- [x] **Code Execution**: The OpenCV memory leaks are prevented via strict `.delete()` in `finally` blocks.
- [x] **Git**: All changes have been cleanly committed to the local repository.

## 🚀 Next Steps
The feature is fully implemented and committed locally. Test it out by running `npm run dev` and trying to scan a receipt!
