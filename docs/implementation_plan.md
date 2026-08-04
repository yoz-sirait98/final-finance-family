# Implementation Plan

## Auto-Create Shopping Plan from Transaction Receipt Scanning (August 2026)

### Problem Area & Target Architecture

| Problem Area | Current State | Target State |
|---|---|---|
| **Receipt Scan Entry Point** | Receipt scanning is available on both Transactions Page and Shopping Plan Page | Scanning is consolidated into Transactions Page; removed from Shopping Plan Page |
| **Shopping Plan Creation from Receipt** | User had to manually scan from Shopping Plan Page to generate a plan from receipt | When scanning & saving a transaction with item list on Transactions Page, a Shopping Plan is automatically created with items |
| **Transaction & Plan Linkage** | Manual scan on Shopping Page had no initial expense transaction link | Shopping Plan is automatically created with status `locked` and linked directly to the saved `transaction_id` |
| **Item Review UX** | Item review was only available in Shopping Page scan modal | Item list review/editing section integrated into Transactions Page Transaction Modal when items are scanned |

---

### Proposed Changes

#### Frontend Services & Composable
* **`frontend/src/services/shoppingPlanService.js`**:
  * Extend `createFromReceipt(location, items, createdBy, receiptUrl, transactionId)` to support passing optional `transactionId`.
  * Store `transaction_id` on the inserted `shopping_plans` record.

#### Transactions Page
* **`frontend/src/pages/TransactionsPage.vue`**:
  * Add reactive state `scannedItems = ref([])` to hold OCR-detected items from `scanReceipt()`.
  * Render an editable item list review component in Transaction Modal when `scannedItems.length > 0`.
  * In `doSaveTransaction()`, after transaction creation, automatically invoke `shoppingPlanService.createFromReceipt()` if `scannedItems.length > 0`.

#### Shopping Plan Page
* **`frontend/src/pages/ShoppingPage.vue`**:
  * Remove "Scan Struk / Scan Receipt" button, file input, and receipt review modal.
  * Clean up unused receipt scanning methods, reactive states, and imports.

---

## Past Features History

### Receipt Scanner Module — Full Rebuild (July 2026)
- Consolidated scanner logic into `useReceiptScanner` and `useScannerMapping` composables.
- Added adaptive binarization preprocessing and candidate-scoring date engine.

### WhatsApp Checkout Notifications
- Added automatic WhatsApp notification dispatch when completing checkout in `ShoppingDetailPage.vue`.
