# Implementation Plan

## Shopping Plan Quantity (Qty) & Unit Support (November 2026)

### Problem Area & Target Architecture

| Problem Area | Current State | Target State |
|---|---|---|
| **Quantity Tracking** | `shopping_items` only has `name` and `price`. Qty is squeezed into the name string or missing. | Dedicated `qty` (NUMERIC, default 1) and `unit` (VARCHAR, default 'pcs') columns. |
| **Pantry Integration** | 1-click pantry restock hardcoded `shoppingItem.qty || 1` because `shopping_items` lacked `qty`. | Seamless restock using real quantities and units from shopping trip. |
| **WhatsApp Checkout Notification** | Checkout message shows `✅ Tomato - Rp 20.000` without volume/quantity. | Message displays `✅ Tomato (1 kg) - Rp 20.000`. |
| **Mobile & Desktop Item UI** | No quantity or unit input/badge on items list or modal. | Quantity and unit badge in lists, responsive inputs in Add/Edit item modal with quick unit pills. |

### Proposed Changes

#### Database Migration
- `supabase/migrations/000040_add_qty_and_unit_to_shopping_items.sql`: Add `qty NUMERIC DEFAULT 1` and `unit VARCHAR(50) DEFAULT 'pcs'` to `public.shopping_items`.
- `docs/finance-family.sql`: Update unified reference schema with new columns.

#### Frontend Services
- `frontend/src/services/shoppingService.js`: Support `qty` and `unit` in `create` and `update` with automatic schema fallback.
- `frontend/src/services/shoppingPlanService.js`: In `createFromReceipt`, forward `qty` and `unit`.
- `frontend/src/services/mealPlanService.js`: Ensure ingredient export maps `qty`, `unit`, and `is_checked: false`.

#### Frontend UI & Pages
- `frontend/src/pages/ShoppingDetailPage.vue`:
  - Add quantity and unit inputs in Add/Edit Item Modal with quick unit pills (`kg`, `gr`, `pcs`, `pack`, `ikat`, `liter`, `botol`, `dus`).
  - Add smart name parser (autofilling qty/unit if entered in item name).
  - Display quantity badges in both desktop table/list and mobile card views.
  - Format WhatsApp checkout summary message to show `(qty unit)`.

#### Locales
- `frontend/src/locales/en.json` & `id.json`: Add translation strings for quantity and unit.

---

## Family Scheduler Integration: Merging Task, Chore & Calendar Management into Finance Family (September 2026)

### Background & Architecture Overview

Currently, the user maintains two separate projects:
1. `final-finance-family`: Family finance management PWA (Vue 3, Vite, Bootstrap 5, Pinia, Supabase, Web Push).
2. `scheduler-family`: Personal & family task scheduler PWA (Vue 3, Vite, Tailwind CSS, Dexie.js offline storage, Web Audio alarm synthesizer, Supabase).

By merging Scheduler into Finance Family:
- **Single Deployment & VPS Host**: One unified frontend build served on one domain (e.g. `yjsfinance.web.id`), requiring zero extra domains or servers.
- **Single PWA & Auth**: Family members install a single app on their phones with shared login and single session.
- **Family Member Synergy**: Tasks and chores can be assigned directly to household members (`members` table: Dad, Mom, Children).
- **Financial & Schedule Cross-Linking**: Bill payment deadlines and shopping plans can be referenced on the schedule.

---

### Proposed Changes

#### Phase 1: Dependencies
##### `frontend/package.json`
- Add `dexie` (`^4.0.11`) for instant offline-first local storage.
- Add `date-fns` (`^4.1.0`) for timeline, week strip, and calendar calculations.
- Add `lucide-vue-next` (`^0.475.0`) for calendar, alarm, and chore icons.

#### Phase 2: Database Migration (Supabase)
##### `supabase/migrations/000035_family_scheduler.sql`
Create the family-scoped scheduler tables:
- `public.task_categories`: Categories (Family & Kids, Home & Chores, Work, Finance, Health & Medical, Personal), scoped by `family_id`.
- `public.tasks`: Family tasks with `task_date`, `start_time`, `end_time`, `priority`, `status`, `is_all_day`, `category_id`, and `assigned_member_id` referencing `public.members(id)`.
- `public.task_reminders`: Alarms and notifications (`reminder_type`, `minutes_before`, `is_enabled`, `is_triggered`).
- `public.task_recurrences`: Recurrence patterns (daily, weekly, monthly).
- RLS Policies using `public.get_auth_family_id()`.
- Default categories seeding function/trigger for new and existing families.

#### Phase 3: Offline Storage & Service Layer
##### `frontend/src/db/schedulerDatabase.js`
- Dexie IndexedDB setup (`tasks`, `categories`, `reminders`, `recurrences`, `syncQueue`, `settings`).

##### `frontend/src/db/taskRepository.js`, `categoryRepository.js`, `reminderRepository.js`
- Local repository pattern for offline-first CRUD and state queries.

##### `frontend/src/utils/schedulerDate.js`
- Date formatting, local date parsers, week generation, and timeline interval calculations.

##### `frontend/src/services/scheduler/`
- `audioService.js`: Web Audio synthesized chimes (C6/E6/G6 arpeggio alarm sequence with zero audio asset downloads).
- `reminderService.js`: 15-second timer checking for due tasks, triggering browser notifications and audio alarms.
- `schedulerSyncService.js`: Two-way synchronization between Dexie and Supabase PostgreSQL with conflict handling.

#### Phase 4: State Management (Pinia)
##### `frontend/src/stores/schedulerTask.js`, `schedulerCategory.js`, `schedulerAlarm.js`
- Pinia stores for tasks, active date/view filters, categories, and active alarm modals.

#### Phase 5: UI Components & Page
##### `frontend/src/components/scheduler/`
- `DayView.vue`, `WeekView.vue`, `MonthView.vue`, `AgendaView.vue`, `TaskCard.vue`, `TaskFormModal.vue`, `TaskDetailModal.vue`, `AlarmModal.vue`, `CategoryManageModal.vue`.

##### `frontend/src/pages/SchedulerPage.vue`
- Main family scheduler hub featuring Date Navigator, View Selector, Member & Category filters, and task management.

#### Phase 6: Layout & Cross-App Integration
##### `frontend/src/router/index.js`
- Register route `/scheduler` under `DashboardLayout`.

##### `frontend/src/layouts/DashboardLayout.vue`
- Add "Family Scheduler" item in sidebar navigation.
- Mount `<AlarmModal />` globally.
- Initialize `reminderService.start()` and `schedulerSyncService.triggerSync()` when authenticated.

##### `frontend/src/pages/DashboardPage.vue`
- Add a compact "Today's Family Schedule & Chores" widget to the main finance dashboard.

##### `frontend/src/locales/en.json` & `frontend/src/locales/id.json`
- Add bilingual English and Indonesian strings for Scheduler, tasks, categories, alarms, and views.

---

## Past Features History

### Multi-AI Provider Integration: DeepSeek V3 & R1 Reasoner for Aurora AI Advisor (August 2026)
- Multi-provider router for Google Gemini, DeepSeek V3/R1, Groq, and OpenRouter with reasoning accordion and settings key manager.

### Repurpose Header Bell Icon into In-App Alerts Hub (August 2026)
- Multi-category In-App Alerts Hub for Budgets, Goals, and Shopping with tabbed filter bar and direct routing.

### Mobile View Redesign for Project Pockets Page (August 2026)
- Touch-first mobile card list with status badges, progress bars, available/target balance displays, quick action drawers, and mobile KPI banner.

### Mobile View Redesign for Recurring Page (August 2026)
- Touch-first mobile card list with due date urgency badges, active switch toggle, touch action drawer, sticky floating action button (FAB), and mobile KPI banner.

### Mobile View Redesign for Shopping Plan Pages (August 2026)
- Touch-first mobile card list with store icons, assignee badges, progress bar, sticky bottom bar, and mobile KPI banner.

### Mobile View Style for Transactions Page (August 2026)
- Dedicated touch-optimized mobile view (`d-md-none`) with mobile KPI banner, compact search chips, grouped date feed, and card touch drawers.

---

## Smart Meal Planner & Pantry Management (September 2026)

### Background & Architecture Overview
An all-in-one family life platform needs a dedicated solution to solve daily meal decision fatigue (*"Mau masak apa hari ini?"*), food waste in the fridge, and grocery shopping disconnects.

### Proposed Changes

#### Phase 1: Database Migration
- `supabase/migrations/000036_smart_meal_planner_and_pantry.sql`:
  - `pantry_items`: multi-zone inventory (Fridge, Freezer, Pantry) with expiry tracking, status, and units.
  - `meal_plans`: 7-day visual meal matrix (Breakfast, Lunch, Dinner, Snack) with recipe details and member cook assignment.
  - `recipes`: family favorite recipe box and AI-generated recipes.
  - RLS policies scoped to `public.get_auth_family_id()`.

#### Phase 2: Service & Store Layer
- Services: `pantryService.js`, `mealPlanService.js`, `recipeService.js`.
- Pinia stores: `pantry.js`, `mealPlan.js`.

#### Phase 3: UI Components & Main Hub
- Components: `PantryItemModal.vue`, `MealPlanModal.vue`, `AiRecipeModal.vue`, `RecipeDetailModal.vue`.
- Page: `frontend/src/pages/MealsPage.vue` with 3 core tabs:
  1. *Weekly Meal Board* (Jadwal Menu Mingguan)
  2. *Pantry & Fridge Inventory* (Stok Kulkas & Dapur)
  3. *Family Recipe Box* (Buku Resep)
- Expiration alert banner (<3 days = warning, expired = alert) with 1-click AI cooking prompt.
- 1-click export of missing meal ingredients to active Shopping Lists (`shopping_plans`).

#### Phase 4: Navigation & Cross-App Synergy
- Register `/meals` in `router/index.js` and add sidebar navigation item in `DashboardLayout.vue`.
- Add compact "Today's Menu & Expiring Groceries" widget to `DashboardPage.vue`.
- Localization in `en.json` and `id.json`.

---

## Pre-Launch 20 Security Checks & Hardening (September 2026)

### Background & Objective
Perform an exhaustive security check and apply defensive protections across all 20 critical pre-launch security domains:
1. API Key Protection
2. Environment Variables Privacy
3. No Hardcoded Secrets
4. Git History Audit
5. Debug Mode Off (Stripping console/debugger & sourcemap disabled)
6. Error Information Leakage Suppression
7. Client & Database Input Validation
8. Input Sanitization & Parameterization
9. Anti SQL Injection (PostgREST & PL/pgSQL validation)
10. Anti XSS (Vue escaping & markdown sanitizer audit)
11. Server-Side Authentication
12. User Access & Multi-Tenant Family Isolation
13. Admin & Member Role Tamper Prevention
14. Database Non-Public Exposure
15. Strict Database Permissions & Search Path
16. Cryptographic Password Hashing (Supabase Auth)
17. Secure Session & Token Lifecycle
18. Secure Password Reset Flow
19. File Upload Size & MIME Type Limits
20. Safe Upload Processing & Pixel Re-encoding

### Applied Changes
- `supabase/migrations/000038_security_hardening.sql`: Profile immutability trigger (`family_id`, `role`), restricted `system_settings`, secured RPCs (`get_dashboard_summary`, `check_budget_guardrail`), positive amount DB constraints (`transactions`, `budgets`), and storage bucket restrictions (5MB, image types).
- `frontend/src/services/storageService.js`: MIME type and 10MB file limit validation function.
- `frontend/src/pages/TransactionsPage.vue`: File validation on receipt picker.
- `frontend/src/pages/SettingsPage.vue`: Password confirmation match validation.
- `frontend/vite.config.js`: Production esbuild drop console/debugger.
- `deploy/push-endpoint.js`: Neutralized plain text VAPID credentials in comments.

---

## Household Assets, Vehicle/Home Maintenance & Warranty Tracker (September 2026)

### Background & Architecture Overview
A complete household life platform must manage not only liquid cash and daily groceries, but also the physical assets that make up the family's home and transport infrastructure:
- **Vehicles** (Mobil, Sepeda Motor, Sepeda): Require scheduled oil changes, routine servicing, tire replacements, and annual/5-year vehicle tax renewals (STNK & Pajak Kendaraan).
- **Home Appliances & Electronics** (AC, Kulkas, Mesin Cuci, Water Heater, TV, Pompa Air, Kompor): Require periodic servicing (e.g. cuci AC every 3 months, ganti filter air) and warranty claim monitoring.
- **Home Infrastructure & Property** (Atap, Pipa/Plumbing, Kelistrikan, Cat, Toren Air): Require routine maintenance (kuras toren, inspeksi atap sebelum musim hujan).
- **Furniture & Valuables**: Track purchase value, warranty papers, and condition.

#### Core Synergies with Existing Finance Family Ecosystem:
1. **Ledger & Accounting Loop**: When a maintenance log is recorded with a monetary cost, the user can with 1 tap record it directly as an Expense Transaction (`transactions` table) with the appropriate Account (e.g. BCA, Cash) and Category (e.g. "Kendaraan" or "Perawatan Rumah"), seamlessly keeping family finances updated.
2. **Family Scheduler & Chores Loop**: Upcoming maintenance schedules (e.g. "Jadwal Cuci AC Rumah", "Servis Rutin Avanza") can be synced into the Family Scheduler (`tasks` table) and assigned to specific family members (e.g. Dad), with optional Google Calendar sync.
3. **In-App Alerts Hub & Web Push**: Automatic proactive notifications when warranties are expiring (within 30 days) and when scheduled maintenance is due (within 7 days or when mileage is reached).
4. **Receipts & Storage Hub**: Storage of warranty cards, receipts, and service invoices in the Supabase Storage `receipts` bucket with client-side canvas image re-encoding.
5. **Asset Valuation & Net Worth**: Displays aggregate household asset value alongside liquid accounts.

---

### Proposed Changes

#### Phase 1: Database Migration (Supabase)
##### `supabase/migrations/000039_household_assets_and_maintenance.sql`
- `public.assets`:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE`
  - `name TEXT NOT NULL`
  - `category TEXT NOT NULL CHECK (category IN ('vehicle', 'appliance', 'electronics', 'furniture', 'property', 'other'))`
  - `brand TEXT`, `model TEXT`, `serial_number TEXT`
  - `purchase_date DATE`
  - `purchase_price NUMERIC(16,2) DEFAULT 0`
  - `current_value NUMERIC(16,2)`
  - `location TEXT` (e.g. Garasi, Dapur, Ruang Tamu, Kamar Utama)
  - `assigned_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL`
  - `status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_repair', 'disposed', 'sold'))`
  - `image_url TEXT`
  - `notes TEXT`
  - `license_plate TEXT`, `current_odometer INT DEFAULT 0` (Vehicle specific)
  - `created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL`
  - `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
- `public.asset_warranties`:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE`
  - `asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE`
  - `warranty_type TEXT NOT NULL DEFAULT 'manufacturer' CHECK (warranty_type IN ('manufacturer', 'store', 'extended', 'lifetime'))`
  - `start_date DATE NOT NULL`
  - `end_date DATE` (nullable for lifetime)
  - `provider_name TEXT`, `provider_contact TEXT`, `policy_number TEXT`
  - `document_url TEXT`
  - `status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'claimed', 'void'))`
  - `claim_instructions TEXT`
  - `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
- `public.asset_maintenance_schedules`:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE`
  - `asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE`
  - `title TEXT NOT NULL`
  - `frequency_type TEXT NOT NULL DEFAULT 'months' CHECK (frequency_type IN ('days', 'months', 'odometer', 'one_time'))`
  - `interval_value INT` (e.g. 3 months, 5000 km, 365 days)
  - `last_performed_date DATE`, `last_performed_odometer INT`
  - `next_due_date DATE`, `next_due_odometer INT`
  - `estimated_cost NUMERIC(16,2) DEFAULT 0`
  - `assigned_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL`
  - `is_active BOOLEAN NOT NULL DEFAULT true`
  - `notes TEXT`
  - `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
- `public.asset_maintenance_logs`:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE`
  - `asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE`
  - `schedule_id UUID REFERENCES public.asset_maintenance_schedules(id) ON DELETE SET NULL`
  - `title TEXT NOT NULL`
  - `performed_date DATE NOT NULL`
  - `performed_by TEXT` (Bengkel / Teknisi / Vendor / Mandiri)
  - `cost NUMERIC(16,2) NOT NULL DEFAULT 0`
  - `odometer INT`
  - `transaction_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL`
  - `invoice_url TEXT`
  - `description TEXT`
  - `performed_member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL`
  - `created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL`
  - `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
- Indexes on `family_id`, `category`, `status`, `next_due_date`, and `end_date`.
- Comprehensive Row Level Security (RLS) policies scoped strictly to `public.get_auth_family_id()`.
- Trigger `trg_update_maintenance_schedule_on_log`: Automatically advances `last_performed_date`, `last_performed_odometer`, and updates `next_due_date` and `assets.current_odometer` when a maintenance log is inserted.

#### Phase 2: Service & State Management
##### `frontend/src/services/assetService.js`
- Full CRUD for assets, warranties, maintenance schedules, and maintenance logs.
- Helper method `recordMaintenanceWithExpense()`: Atomically posts a maintenance log and creates a linked `transaction` record under the selected financial account and expense category.
- Helper method `syncMaintenanceToScheduler()`: Generates a task on `public.tasks` for the assigned household member when maintenance is due.

##### `frontend/src/stores/assets.js`
- Pinia store managing `assets`, `warranties`, `schedules`, and `logs`.
- Computed KPIs: Total Asset Valuation, Active Assets Count, Maintenance Due / Overdue Count, Expiring Warranties Count (< 30 days).
- Multi-dimensional filters (by Category, Status, Room/Location, Search Query).

#### Phase 3: UI Components (`frontend/src/components/assets/`)
- `AssetCard.vue`: Card view with image/placeholder, category badge, custodian avatar, warranty pill, and next maintenance preview.
- `AssetModal.vue`: Comprehensive modal for creating/updating assets, conditional fields for vehicles (plat nomor, odometer), and image upload.
- `AssetDetailModal.vue`: 360° asset details modal with specifications, warranty card preview, maintenance history timeline, and total cost of ownership.
- `MaintenanceScheduleModal.vue`: Form for defining recurring maintenance rules (by time or odometer interval) and assigning responsible family member.
- `MaintenanceLogModal.vue`: Service log modal with cost, odometer, invoice upload, and 1-tap "Catat sebagai Pengeluaran Keuangan" toggle.
- `WarrantyModal.vue`: Form for adding/editing warranty policies, provider contacts, and uploading warranty certificates.
- `AssetFilterBar.vue`: Touch-scrollable category chips and search input.

#### Phase 4: Main Assets & Maintenance Hub Page
##### `frontend/src/pages/AssetsPage.vue`
- Tabbed interface with 4 core views:
  1. **Aset & Inventaris / All Assets**: Visual grid and table of family assets with quick filters and action drawers.
  2. **Jadwal Perawatan / Maintenance Schedules**: Upcoming, due soon, and overdue maintenance list with 1-tap "Servis Selesai" (Log Maintenance).
  3. **Riwayat Servis / Service History**: Chronological log of all maintenance, costs, invoice receipts, and linked expense transactions.
  4. **Garansi & Perlindungan / Warranties**: Warranty status overview, expiration timeline, and claim documentation.
- Mobile touch-optimized layout (`d-md-none`) featuring swipeable tabs, compact KPI banner, and thumb-friendly action buttons.

#### Phase 5: Layout, Dashboard & Alerts Hub Integration
##### `frontend/src/router/index.js`
- Register route `/assets` with `requiresAuth: true`.

##### `frontend/src/layouts/DashboardLayout.vue`
- Add "Assets & Maintenance" nav item in the sidebar and mobile drawer with an active badge indicator if maintenance is overdue.

##### `frontend/src/pages/DashboardPage.vue`
- Add a compact "Maintenance Due & Expiring Warranties" alert card on the main dashboard.

##### `frontend/src/services/pushDispatcherService.js`
- Add push templates:
  - `MAINTENANCE_DUE`: Maintenance is due soon for asset.
  - `WARRANTY_EXPIRING`: Warranty expires in 30 days.

##### `frontend/src/locales/en.json` & `frontend/src/locales/id.json`
- Comprehensive bilingual translation keys for assets, categories, maintenance frequencies, warranties, and action buttons.

#### Phase 6: Verification, Testing & Knowledge Graph
- Execute `npm run build` to verify clean bundle compilation.
- Automated unit / integration test script for asset CRUD, warranty tracking, and maintenance-to-expense cross-posting.
- Update knowledge graph (`graphify update .`).
- Write feature walkthrough document (`docs/walkthrough_household_assets_and_maintenance.md`).

---

## Audit & Double-Submit Protection on All CRUD Buttons (October 2026)

### Background & Objective
Ensure all CRUD buttons (Create, Edit, Delete, Transfer, Checkout, Restock, Export) across every module have bulletproof concurrency and double-click protection:
1. Prevent duplicate records when users rapidly double-click "Simpan" / "Save" / "Hapus" / "Delete".
2. Synchronously lock state via `isSubmitting` / `saving` / `deleting` before any async call.
3. Add early return guards (`if (saving.value) return;`) at the very top of each submit/delete function.
4. Disable buttons in the UI with `:disabled="saving"` and show loading spinners while an operation is in flight.
5. Reliably release locks in `finally` blocks.

### Scope of Changes
- `frontend/src/pages/TransactionsPage.vue`: Lock `saving.value` before budget pre-check in `saveTransaction()`; guard `doSaveTransaction()`; guard `saveTransfer()`.
- `frontend/src/pages/AccountsPage.vue`: Add `saving` and `deleting` refs; early return guards in `save()` and `doDelete()`; bind `:disabled` with spinners on Save and Delete modal buttons.
- `frontend/src/pages/CategoriesPage.vue`: Add `saving` and `deleting` refs; early return guards in `save()` and `doDelete()`; bind `:disabled` with spinners.
- `frontend/src/pages/BudgetsPage.vue`: Add `saving` and `deleting` refs; early return guards in `save()` and `doDelete()`; bind `:disabled` with spinners.
- `frontend/src/pages/GoalsPage.vue`: Early return guards in `save()`, `doContribute()`, and `doDelete()`.
- `frontend/src/pages/ProjectPocketsPage.vue`: Early return guards in `saveExpense()`, `deleteExpense()`, and `markPocketAsDone()`; disable buttons during operations.
- `frontend/src/pages/RecurringPage.vue`: Add `saving` and `deleting` refs; early return guards in `save()`, `doDelete()`, and `toggleActive()`; bind `:disabled` with spinners.
- `frontend/src/pages/ShoppingPage.vue`: Early return guards in `savePlan()` and `doDeletePlan()`.
- `frontend/src/pages/ShoppingDetailPage.vue`: Early return guards in `saveItem()`, `doDeleteItem()`, `processCheckout()`, and `restockAllToPantry()`.
- `frontend/src/pages/MembersPage.vue`: Add `saving` and `deleting` refs; early return guards in `save()`, `doDelete()`, and `toggleActive()`; bind `:disabled` with spinners.
- `frontend/src/pages/SettingsPage.vue`: Early return guards in all key/password save functions.
- `frontend/src/pages/LoginPage.vue` & `RegisterPage.vue`: Early return guards in `handleLogin()` and `handleRegister()`.
- `frontend/src/components/scheduler/TaskFormModal.vue`: Synchronously set `isSubmitting.value = true` in `handleSubmit()`; add early return guard.
- `frontend/src/components/scheduler/CategoryManageModal.vue`: Add `isSubmitting` and `isDeleting` guards.
- `frontend/src/pages/SchedulerPage.vue`: Concurrency guards on task and category operations.
- `frontend/src/components/meals/PantryItemModal.vue`: Early return guard and loading lock.
- `frontend/src/components/meals/MealPlanModal.vue`: Early return guard and loading lock.
- `frontend/src/components/meals/ExportShoppingModal.vue`: Early return guard in `handleSubmit()`.
- `frontend/src/components/meals/AiRecipeModal.vue`: Early return guard in `saveToRecipeBox()`.
- `frontend/src/pages/MealsPage.vue`: Add `isDeleting` ref and guard to `executeDelete()`; bind `:disabled="isDeleting"`; early return guards in `handleAiSaveRecipe()`, `handleSavePantryItem()`, and `handleSaveMealPlan()`.


