# 📷 Receipt Scanner Transaction Module — Analysis & Upgrade Plan

## Overview

The scanner module allows users to **photograph a physical receipt** and automatically extract
key transaction fields (merchant name, total amount, date) using on-device OCR — no backend
AI calls needed, no API key dependency.

---

## 🏗️ Technology Stack

### Current (Before Upgrade)

| Layer | Technology |
|---|---|
| **Frontend Framework** | Vue 3 (Composition API, `<script setup>`) |
| **OCR Engine** | Tesseract.js v4 — runs fully in-browser (WASM), `eng+ind` |
| **Image Pre-Processing** | ❌ None — raw camera photo sent directly to Tesseract |
| **Image Compression** | HTML5 Canvas API (`toBlob`, JPEG @ 82%) |
| **Receipt Storage** | Supabase Storage — `receipts` bucket, signed URLs (1hr) |
| **Camera Input** | Native `<input type="file" accept="image/*" capture="environment">` |
| **Merchant Database** | 16 hard-coded merchants in `receiptScanner.js` |

### Upgraded (After)

| Layer | Technology |
|---|---|
| **Frontend Framework** | Vue 3 (Composition API, `<script setup>`) |
| **OCR Engine** | Tesseract.js v4 — WASM, `eng+ind`, PSM 6 mode |
| **Image Pre-Processing** | ✅ **OpenCV.js** (slim build, lazy-loaded on demand) |
| **Image Compression** | HTML5 Canvas API (still used for final storage compress) |
| **Receipt Storage** | Supabase Storage — `receipts` bucket, signed URLs (1hr) |
| **Camera Input** | Native `<input type="file" accept="image/*" capture="environment">` |
| **Merchant Database** | ✅ `merchants.json` — 100+ Indonesian merchants, structured |

---

## 🔬 Why OpenCV.js?

| Capability | OpenCV.js | Plain Canvas |
|---|---|---|
| Adaptive Thresholding (per-region binarization) | ✅ | ❌ |
| Gaussian Blur (true kernel noise removal) | ✅ | ⚠️ Approximation |
| Morphological Close (fill character gaps) | ✅ | ❌ |
| Perspective Transform / Deskew | ✅ (future) | ❌ |
| Contour Detection (receipt edge crop) | ✅ (future) | ❌ |
| Bundle cost | ~3–4 MB (slim, lazy) | 0 |
| API Key required | ❌ None | ❌ None |

> **Adaptive thresholding** is the single biggest win — it handles receipts
> with uneven lighting (shadows, camera flash hotspots) by computing a
> per-region threshold instead of a single global value.

---

## 📦 Files Involved

### Existing

| File | Role |
|---|---|
| [`receiptScanner.js`](file:///c:/Projects/final-finance-family/frontend/src/utils/receiptScanner.js) | Core OCR + text parsing logic — **major changes** |
| [`storageService.js`](file:///c:/Projects/final-finance-family/frontend/src/services/storageService.js) | Image compress & upload to Supabase — minor changes |
| [`TransactionsPage.vue`](file:///c:/Projects/final-finance-family/frontend/src/pages/TransactionsPage.vue) | UI trigger, overlay, form auto-fill — **significant changes** |

### New

| File | Role |
|---|---|
| `src/utils/opencvLoader.js` | Lazy-loads OpenCV.js WASM, caches `cv` instance |
| `src/utils/opencvPreprocess.js` | Full 6-step OpenCV image pipeline, memory-safe |
| `src/utils/merchants.json` | 100+ Indonesian merchant database with categories |

---

## 🔄 Upgraded End-to-End Business Process Flow

```
User taps "Scan Receipt"
       │
       ▼
Native camera / file picker opens
(capture="environment" → rear camera on mobile)
       │
       ▼
User selects/captures a photo (File object)
       │
       ▼
[opencvLoader.js] loadOpenCV()
  ├─ First call: lazy-load OpenCV.js WASM (~3-4 MB, cached after)
  └─ Subsequent calls: return cached cv instance immediately
       │
       ▼
[opencvPreprocess.js] preprocessReceiptImage(file)
  ├─ 1. Load image into cv.Mat via HTMLImageElement
  ├─ 2. cv.cvtColor → Grayscale (removes color noise)
  ├─ 3. cv.GaussianBlur → Denoise (5×5 kernel, σ=0)
  ├─ 4. cv.adaptiveThreshold → Binary image
  │       (ADAPTIVE_THRESH_GAUSSIAN_C, blockSize=11, C=2)
  ├─ 5. cv.morphologyEx → MORPH_CLOSE (fills character gaps)
  ├─ 6. cv.resize → Upscale if image height < 1500px
  ├─ 7. cv.imshow → Write to output HTMLCanvasElement
  └─ 8. .delete() all cv.Mat objects (memory safety)
       │
       ▼
[receiptScanner.js] scanReceipt(file, progressCallback)
  ├─ Tesseract.recognize(preprocessedCanvas, 'eng+ind', { psm: 6 })
  │    OCR runs on clean binary image → higher character accuracy
  │
  ├─ TEXT PARSING:
  │   1. Merchant Name
  │      → Match against merchants.json (100+ patterns, case-insensitive)
  │      → Fallback: first clean non-blacklisted line in top-5 lines
  │      → Returns merchant's category hint from JSON
  │
  │   2. Date
  │      → DD/MM/YY, YYYY-MM-DD, word dates ("10 Juni 2026")
  │      → Fuzzy month matching (handles OCR typos: "Jume" → June)
  │      → Fallback: today's date
  │
  │   3. Total Amount (Smarter Extraction)
  │      → Picks RIGHTMOST number per line (two-column layout support)
  │      → Keywords: total, grand total, jumlah, tagihan,
  │                  total pembayaran, total keseluruhan, harga total
  │      → Supports: Rp150.000, Rp 150,000 prefix format
  │      → Min amount: Rp 100 (was Rp 500)
  │      → Excludes payment method lines (kembalian, gopay, qris, etc.)
  │
  │   4. Category & Account Heuristics
  │      → Category now sourced from merchants.json match
  │      → Fallback: keyword regex on full OCR text (unchanged)
  │
  │   5. Confidence Scoring
  │      → ret.data.confidence → overall OCR confidence (0–100)
  │      → Per-field confidence: 'high' (≥80) / 'medium' (50–79) / 'low' (<50)
  │
  └─ Returns: {
        merchantName, totalAmount, date,
        confidence,       ← overall 0–100
        fieldConfidence,  ← { merchant, amount, date }
        heuristics: { category, account },
        rawText,
        imageFile
     }
       │
       ▼
[TransactionsPage.vue] onReceiptSelected()
  ├─ Duplicate detection:
  │   fingerprint = amount + "|" + date + "|" + merchantName.toLowerCase()
  │   Compare against last 30 transactions in memory
  │   → If match: set possibleDuplicate ref (shows warning banner in modal)
  │
  ├─ Map category/account/member heuristics → user's actual data
  ├─ Store scanConfidence, scanRawText for UI display
  ├─ Store imageFile for pending upload
  │
  └─ Open Add Transaction modal (auto-filled) with:
       • type: "expense"
       • description: merchantName   [confidence badge]
       • amount: totalAmount         [confidence badge]
       • transaction_date: date      [confidence badge]
       • category_id, account_id, member_id: matched from user data
       • ⚠️ Duplicate warning banner (if fingerprint matched)
       • 📋 Collapsible Raw OCR Text panel
       │
       ▼
User reviews / corrects auto-filled fields
       │
       ▼
User clicks Save
       │
       ├─ Budget pre-check (over-budget → confirmation modal)
       │
       ├─ ONE-STEP ATOMIC SAVE:
       │   ① (if pendingReceiptFile) uploadReceipt(file) → storagePath
       │      - compress via Canvas API → JPEG
       │      - upload to Supabase Storage: {familyId}/{ts}-{random}.jpg
       │   ② transactionService.create({ ...payload, receipt_url: storagePath })
       │      (single POST — no PATCH needed)
       │
       └─ If upload fails → transaction NOT created → no orphan record
       │
       ▼
Transaction saved ✅
receipt_url set atomically in same DB row
Viewable via signed URL (1-hour expiry) in lightbox
```

---

## ⚠️ Problems Fixed by This Upgrade

| # | Problem (Before) | Solution (After) |
|---|---|---|
| 1 | No image pre-processing | ✅ OpenCV.js 6-step pipeline |
| 2 | Adaptive thresholding missing | ✅ `cv.adaptiveThreshold` per-region |
| 3 | Amount picks wrong number on 2-col layouts | ✅ Rightmost-number detection |
| 4 | Only 16 merchants recognized | ✅ 100+ merchants in JSON |
| 5 | Silent bad scans — no feedback | ✅ Per-field confidence badges |
| 6 | No way to verify OCR output | ✅ Collapsible Raw OCR Text panel |
| 7 | 2-step save race condition (orphan bug) | ✅ Upload-first atomic save |
| 8 | Same receipt scannable twice silently | ✅ Hash-based duplicate detection |

---

## 📊 Expected Performance Impact

| Metric | Before | After |
|---|---|---|
| OCR accuracy (good lighting) | ~65% | ~85–90% |
| OCR accuracy (dark/tilted) | ~30% | ~70–80% |
| First scan tap load | ~10 MB (Tesseract) | ~13–14 MB (+ OpenCV slim) |
| Subsequent scans | Tesseract cached | Both cached — fast |
| Memory safety | N/A | All cv.Mat objects deleted in `finally` |

---

## 📋 Execution Phases

| Phase | Upgrades Included | Effort |
|---|---|---|
| **Phase 1** | OpenCV loader + preprocess + smarter parser + merchants.json | Medium |
| **Phase 2** | Confidence badges + Raw OCR panel + Duplicate detection | Low |
| **Phase 3** | One-step atomic save (orphan bug fix) | Low |
