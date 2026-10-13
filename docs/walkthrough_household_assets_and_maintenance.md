# Walkthrough: Household Assets, Vehicle/Home Maintenance & Warranty Tracker

## Feature Overview
The **Household Assets, Vehicle/Home Maintenance & Warranty Tracker** provides a complete solution to manage the physical assets that make up a family's household and transportation infrastructure. It bridges physical asset management with the existing **Finance Family** financial ledger, family task scheduler, alerts hub, and secure cloud storage.

---

## 1. Database Schema (`000039_household_assets_and_maintenance.sql`)

### Tables Created:
1. `public.assets`:
   - Categorized under: `vehicle`, `appliance`, `electronics`, `property`, `furniture`, `other`.
   - Supports purchase price, current estimated value, brand, model, serial number, room/location, and assigned family custodian (`member_id`).
   - Vehicle-specific fields: `license_plate` (plat nomor), `current_odometer` (km).
2. `public.asset_warranties`:
   - Linked to `asset_id`.
   - Tracks `warranty_type` (`manufacturer`, `store`, `extended`, `lifetime`).
   - Start and end dates with countdown status (`active`, `expiring_soon`, `expired`).
   - Provider name, contact hotline, policy number, digital photo document URL, and claim instructions.
3. `public.asset_maintenance_schedules`:
   - Recurring maintenance intervals: `months`, `days`, `odometer`, `one_time`.
   - Next due date and next due odometer targets.
   - Estimated service cost and assigned family member.
4. `public.asset_maintenance_logs`:
   - Historical service records with performed date, technician/workshop, parts replaced, and invoice photo.
   - **Financial Cross-Posting**: Optional `transaction_id` referencing `public.transactions(id)`.
5. Trigger `trg_update_maintenance_schedule_on_log`:
   - Automatically advances `last_performed_date`, `last_performed_odometer`, and recalculates `next_due_date` and `next_due_odometer` when a service log is inserted.
   - Automatically advances `assets.current_odometer` if the service odometer is higher.
6. Row Level Security (RLS) policies scoped to `public.get_auth_family_id()`.

---

## 2. Service & State Store Architecture

- **`frontend/src/services/assetService.js`**:
  - Full CRUD for assets, warranties, maintenance schedules, and logs.
  - `recordMaintenanceWithExpense()`: Atomically posts a service log and writes an expense transaction to the ledger with account deduction and category mapping.
  - `syncMaintenanceToScheduler()`: Generates a scheduled chore/task in the Family Scheduler for the responsible member.
- **`frontend/src/stores/assets.js`**:
  - Reactive Pinia store managing assets, schedules, warranties, and logs.
  - Computed KPIs: Total Asset Valuation, Active Assets, Overdue & Due Soon Schedules, Expiring Warranties (<30 days), and Total Maintenance Spent.

---

## 3. UI/UX & Components (`frontend/src/components/assets/`)

- **`AssetFilterBar.vue`**: Touch-scrollable category pills (`Kendaraan`, `Peralatan Rumah`, `Elektronik`, `Fasilitas & Properti`, `Furnitur`, `Lainnya`), status filter dropdown, and search.
- **`AssetCard.vue`**: Rich card layout with category gradient banner / image, plate badge, odometer, custodian, valuation, and quick actions.
- **`AssetModal.vue`**: Add/edit modal with vehicle-specific inputs (plat nomor, odometer) and image upload with client-side canvas compression.
- **`AssetDetailModal.vue`**: 360° asset overview with specs, warranty cards, maintenance schedules, and service history timeline with invoice receipts.
- **`MaintenanceScheduleModal.vue`**: Recurring service setup with quick suggestions (Ganti Oli Mesin, Cuci AC, Pajak STNK, Kuras Toren).
- **`MaintenanceLogModal.vue`**: Service completion logger with 1-tap toggle to record directly as an expense transaction.
- **`WarrantyModal.vue`**: Warranty policy editor with photo upload and claim guidelines.

---

## 4. Main Hub & Cross-App Integration

- **Route `/assets`** on `frontend/src/pages/AssetsPage.vue` with 4 core views:
  1. *Semua Aset / All Assets*
  2. *Jadwal Servis / Maintenance Schedules*
  3. *Riwayat Servis / Service History*
  4. *Garansi & Bukti / Warranties Hub*
- **Navigation & Alerts Hub**:
  - Sidebar item in `DashboardLayout.vue` with badge counter for overdue service.
  - Integrated in the Header Bell Alerts Hub under the `Servis` tab.
- **Dashboard Widget**:
  - Compact alert ribbon on `DashboardPage.vue` notifying family members of overdue service, service due this week, or warranties expiring within 30 days.
- **Push Notification Templates**:
  - `MAINTENANCE_DUE` and `WARRANTY_EXPIRING` added to `pushDispatcherService.js`.
- **Bilingual Localization**:
  - Complete parity in `frontend/src/locales/en.json` and `frontend/src/locales/id.json`.

---

## 5. Verification & Testing

- Automated test suite `frontend/scripts/test_assets_pure.js` passed all 6 test suites:
  - Asset valuation fallback and category distribution.
  - Warranty status countdown (lifetime, expiring soon <30d, expired, active).
  - Schedule recurrence calculation (months, days, odometer, one-time).
  - Monotonic vehicle odometer progression.
  - Financial ledger expense cross-posting constraints.
  - Family Scheduler chore task generation.
