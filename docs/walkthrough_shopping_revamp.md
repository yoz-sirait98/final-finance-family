# Walkthrough: Shopping List Revamp

## Overview
This update revamps the Shopping List feature with three major changes:

1. **Flexible Checkout** — Users now choose between "Mark as Done" (no transaction) or "Checkout & Record Transaction" when completing a shopping plan.
2. **Done Plans are Protected** — Shopping plans with status `done` can no longer be deleted. A "Locked" badge replaces the delete button.
3. **Receipt → Auto Shopping Plan** — Users can scan a receipt (OCR), review extracted line items, and auto-create a completed Shopping Plan.

---

## Changes Made

### New File: `receiptItemParser.js`
- **Purpose**: Extracts individual line items (name + price) from raw OCR text.
- **Features**:
  - Smart keyword filtering to skip headers, footers, totals, tax, payment lines.
  - Handles Indonesian receipt formats (Rp prefix, thousand separators).
  - Multi-line item support (name on one line, price on the next).
  - Quantity extraction (`2x MILK`, `MILK x2`).
  - Configurable price range validation (100 – 10,000,000).
  - Deduplication utility for merging duplicate items.

### Modified: `shoppingPlanService.js`
- **`markAsDone(planId)`**: New method that sets status to `done` without creating a transaction.
- **`createFromReceipt(location, items, createdBy)`**: New method that creates a plan + bulk-inserts items with status `done`.
- **`delete(id)`**: Now guards against deleting done plans with a clear error message.

### Modified: `ShoppingDetailPage.vue`
- **Choice Modal**: Clicking "Complete Plan" now shows a two-option choice card:
  - ✅ "Mark as Done" — just marks done, items become read-only reference.
  - 💳 "Checkout & Record Transaction" — opens the existing checkout form.
- **Read-only Mode**: When a plan is done, item prices show as static text, checkboxes are disabled, and no delete/add buttons are visible.

### Modified: `ShoppingPage.vue`
- **"Scan Receipt" Button**: New button in the header that triggers the camera/file picker.
- **OCR Scanning Overlay**: Shows progress bar while Tesseract.js processes the image.
- **Review Modal**: After scanning, users see an editable table of extracted items with store name, individual prices, and a total. Users can add/remove/edit items before saving.
- **Delete Protection**: Done plans show a "🔒 Locked" badge instead of a delete button.

---

## Verification
- ✅ Production build compiled with zero errors.
- Manual testing recommended for:
  - Shopping Detail → "Complete Plan" → Choice modal flow.
  - Shopping List → "Scan Receipt" → OCR → Review → Save.
  - Verify done plans cannot be deleted (button hidden + service guard).
