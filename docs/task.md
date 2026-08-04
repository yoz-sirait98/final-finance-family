# Tasks Checklist

- [x] **1. Service Updates (`shoppingPlanService.js`)**
  - [x] Add `transactionId` parameter to `createFromReceipt` method in `shoppingPlanService.js` to link `transaction_id`.

- [x] **2. Transactions Page Integration (`TransactionsPage.vue`)**
  - [x] Store `scannedItems` when receipt is scanned in `onReceiptSelected`.
  - [x] Add scanned items review/edit component to Transaction Modal.
  - [x] Auto-create locked Shopping Plan with items in `doSaveTransaction` when `scannedItems` exist.

- [x] **3. Shopping Page Cleanup (`ShoppingPage.vue`)**
  - [x] Remove "Scan Struk" button, file input, and review modal.
  - [x] Clean up unused scanner methods, state, and imports.

- [x] **4. Build & Verification**
  - [x] Verify build with `npm run build`.
  - [x] Perform manual end-to-end testing of scanning, saving, and plan creation.
