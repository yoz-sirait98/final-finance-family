# Walkthrough: Receipt Image Storage & Financial Calendar View

**Date:** 2026-06-11  
**Branch:** `redesign-ui-supabase-stack`  
**Commit:** `7499a9e`

---

## Feature 1: 📸 Receipt Image Storage (Supabase Storage)

### Overview
After OCR scanning a receipt, the original image is now compressed client-side and uploaded to **Supabase Storage**, then permanently linked to the transaction record via a `receipt_url` column.

### Files Changed

| File | Type | Change |
|------|------|--------|
| `supabase/migrations/000022_add_receipt_url_to_transactions.sql` | NEW | Adds `receipt_url TEXT` column to `transactions` table |
| `frontend/src/services/storageService.js` | NEW | `uploadReceipt()`, `getReceiptSignedUrl()`, `deleteReceipt()` |
| `frontend/src/utils/receiptScanner.js` | MODIFIED | Return `imageFile` reference in result object |
| `frontend/src/services/transactionService.js` | MODIFIED | Add `receipt_url` to the select query |
| `frontend/src/pages/TransactionsPage.vue` | MODIFIED | Full receipt storage integration |

### Key Architecture Decisions

1. **Image compression before upload**: Canvas resize to max 1200px width, JPEG 82% quality (~100KB vs 3MB raw).
2. **Non-fatal upload**: If storage fails, the transaction is still saved. Toast warns user without blocking.
3. **Private signed URLs**: `receipts` bucket is private. All views fetch 1-hour signed URLs on demand.
4. **Cleanup on delete**: `deleteReceipt()` called best-effort after transaction delete — no orphaned files.
5. **Two-step save**: `create()` → get DB-assigned `id` → `update(id, { receipt_url: storagePath })`.

### User Flow
1. Scan Receipt → OCR → form auto-fills + thumbnail shows in modal
2. Click Save → transaction created → image uploads to `receipts/{familyId}/{uuid}.jpg`
3. Transaction row shows **📎** icon next to description
4. Click **📎** → fullscreen lightbox (dark overlay, close button or click outside)
5. Edit transaction → saved thumbnail loads via signed URL
6. Delete transaction → image cleaned up from storage

> **⚠️ Setup Required**: Create a Storage Bucket named `receipts` (private) in the Supabase Dashboard. Add RLS: authenticated users can read/write files under their own `family_id/` prefix.

---

## Feature 2: 📅 Financial Calendar View

### Overview
A dedicated full-page monthly calendar showing the family's daily financial activity as colored dots, with a click-to-expand day detail panel and a mobile list-view fallback.

### Files Changed

| File | Type | Change |
|------|------|--------|
| `frontend/src/pages/CalendarPage.vue` | NEW | Full calendar page component |
| `frontend/src/router/index.js` | MODIFIED | Added `/calendar` route |
| `frontend/src/layouts/DashboardLayout.vue` | MODIFIED | Calendar nav item in Main section |
| `frontend/src/locales/en.json` | MODIFIED | `nav.calendar: "Calendar"` |
| `frontend/src/locales/id.json` | MODIFIED | `nav.calendar: "Kalender"` |

### Features Detail

| Feature | Implementation |
|---------|---------------|
| **7-column grid** | Mon-Sun, dynamic first-day offset from `new Date(y, m-1, 1).getDay()` |
| **Colored dots** | 🟢 Income · 🔴 Expense · 🔵 Recurring bill due · 🟡 Goal deadline |
| **Net chip** | Compact `+1.5jt` / `-500rb` per day cell |
| **Day detail panel** | Slide-up transition on click — shows transactions, recurring bills, goal deadlines |
| **Month navigation** | ← Prev / Month Year label / Next → + "Today" shortcut |
| **Summary strip** | Monthly income, expense, tx count, bills-due count |
| **Mobile view** | Collapsible list grouped by day (no grid on small screens) |
| **Locale** | Full ID/EN day names, month names, date formatting via `toLocaleDateString` |
| **Data** | `transactionService` + `recurringService` + `goalService` — parallel `Promise.all` fetch |
| **Reactivity** | `watch([viewMonth, viewYear], fetchData)` — auto-refetches on month change |

---

## Verification Results

### Build
```
✓ built in 1.52s — zero errors, zero warnings
CalendarPage.CAg9JCQ4.js    12.43 kB │ gzip: 3.85 kB
TransactionsPage.D-eJNGs7.js  52.60 kB │ gzip: 17.29 kB
storageService bundled into vendor chunk
```

### Knowledge Graph
```
graphify update . → 1116 nodes, 1560 edges, 134 communities
```

### Manual Testing Checklist
- [ ] Scan a receipt → thumbnail shows in modal → save → 📎 appears in table
- [ ] Click 📎 → lightbox opens, click outside → closes
- [ ] Edit transaction with receipt → signed URL thumbnail loads
- [ ] Delete transaction → verify file removed from Supabase Dashboard → Storage → receipts
- [ ] Navigate to `/calendar` via sidebar
- [ ] Verify today's cell has primary-color highlighted day number
- [ ] Add a transaction → navigate to calendar → dot appears on correct date
- [ ] Click a day with transactions → detail panel slides in
- [ ] Navigate months ← → → data reloads
- [ ] Click Today → jumps to current month
- [ ] Switch to ID locale → verify day names, UI text translate correctly
- [ ] Resize to mobile → list view shows instead of grid
