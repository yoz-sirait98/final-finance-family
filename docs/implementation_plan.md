# Family Finance Architecture & Integration Plans

This document combines the implementation plans for the major architectural milestones of the Family Finance application: the Serverless Migration (Laravel to Supabase) and the Indonesian Language Mode Integration.

---

# Part 1 â€” Family Finance Architecture Migration: Laravel to Supabase (Completed)

This section outlines the complete strategy that was executed to migrate the Family Finance Management System from a Laravel + Vue 3 architecture to a Serverless Supabase + Vue 3 (GitHub Pages) architecture.

## Phase 1 â€” Project Discovery Report

### 1. Migrated System Architecture
- **Frontend**: Vue 3 SPA using Composition API, Vite, Pinia, Vue Router, and Bootstrap 5. Hosted on GitHub Pages (`yjsfinance.my.id`). Client-side features include PDF/CSV generation, interactive charts (Chart.js), and a guided tour (driver.js).
- **Backend**: Serverless architecture powered entirely by Supabase. Custom business logic, validation, and aggregations are handled via Supabase Auth, PostgreSQL Triggers, Row-Level Security (RLS) policies, database functions, and RPC endpoints. (The old Laravel REST API has been retired.)
- **Database**: PostgreSQL hosted on Supabase, utilizing triggers and constraints to enforce core business rules. Data is isolated per family using a `family_id` column.

### 2. Feature Inventory
- Authentication (Email/Password, Sanctum tokens)
- Member Management (Role-based: Father, Mother, Child)
- Account/Wallet Management (Bank, Cash, E-Wallet)
- Category Management (Income, Expense)
- Transaction Management (Income, Expense, Transfers)
- Budgeting with interactive Guardrail warnings
- Saving Goals with "Linked Pockets" (syncing to physical accounts)
- Recurring Transactions (Weekly, Monthly, Yearly)
- Dashboard Analytics (Trends, Income vs Expense, Net Worth)
- Activity Logs / Audit Trail (Tracking entity Create, Update, Delete)
- Client-side Report Generation (CSV, PDF)

### 3. Business Rules Inventory
- **Family Ownership**: Currently driven by `user_id` as the primary account. The migration requires explicit `family_id` ownership across all tables (users -> families -> members -> transactions).
- **Account Balance Integrity**: Balances must update atomically when a transaction is created, updated, or deleted. Transfers must update two accounts simultaneously.
- **Budget Guardrail**: Transactions exceeding a category's budget return a structured JSON response (not a hard database error) so the frontend can prompt the user for confirmation.
- **Goal Pocket Synchronization**: Saving goals linked to an `account_id` must automatically sync their `current_amount` when the account balance changes.
- **Activity Logging**: Every CUD operation on core entities must log the action, entity, user, and `before_data`/`after_data` in JSONB format.
- **Realtime**: The frontend must react to database changes instantly via Supabase Realtime (no manual polling).
- **Recurring Transactions**: Must automatically generate new transactions when due, without duplicating, and advance the `next_due_date`.

### 4. Dependencies Inventory
- **Frontend**: `vue`, `vue-router`, `pinia`, `@supabase/supabase-js`, `@tanstack/vue-query`, `bootstrap`, `bootstrap-icons`, `chart.js`, `jspdf`, `jspdf-autotable`, `driver.js`, `idb-keyval` (with the old `axios` package removed).
- **Backend**: Supabase Serverless suite, PostgreSQL database with the `pg_cron` extension for scheduling automated recurring tasks.

### 5. Risks
- **Data Integrity during Transition**: Moving balance calculations from PHP to Postgres PL/pgSQL triggers carries the risk of silent bugs if edge cases (like updating a transaction's amount *and* account simultaneously) are not handled correctly.
- **Budget Guardrail via SQL**: Standard Postgres functions throw exceptions. We need a way to validate budgets and return structured JSON via an RPC call instead of standard `INSERT`, or handle the guardrail logic directly in the Edge/RPC layer before insertion.
- **GitHub Pages Routing**: Replacing the current 404 fallback with Vue Hash Router (recommended) will change URLs (e.g., `/#/dashboard`).
- **Data Migration**: Existing data uses `user_id`. We must seamlessly migrate this to the new `family_id` structure without breaking relations.

### 6. Migration Complexity Assessment
**HIGH**. This is a complete architectural paradigm shift. We are moving from imperative application-layer logic to declarative database-layer logic (RLS, Triggers, RPC).

---

## Phase 2 â€” Migration Task Breakdown

| Task | Objective | Estimated Complexity | Dependencies |
|------|-----------|----------------------|--------------|
| **01: Supabase Setup & Schema** | Design new Postgres schema with `family_id`, UUIDs, and foreign keys. | Medium | None |
| **02: Auth & Profiles** | Setup Supabase Auth, trigger for profile/family creation on signup. | Low | Task 01 |
| **03: Row Level Security** | Write strict RLS policies isolating data by `family_id`. | High | Task 01, 02 |
| **04: Balance & Transfer Engine** | PL/pgSQL triggers for `accounts.balance` updates on `transactions` CUD. | High | Task 01 |
| **05: Goal Sync Engine** | PL/pgSQL triggers to sync `saving_goals` with linked `accounts`. | Medium | Task 04 |
| **06: Activity Logging Engine** | PL/pgSQL trigger to capture `before`/`after` JSONB to `activity_logs`. | Medium | Task 01 |
| **07: Budget Guardrail RPC** | Create `check_budget_guardrail()` RPC returning JSON for frontend checks. | Medium | Task 01 |
| **08: Dashboard Analytics RPC** | Move complex aggregations (trends, pie charts) to SQL Views / RPC. | Medium | Task 01 |
| **09: Recurring Transactions** | Configure `pg_cron` or Edge Function to process recurring txns hourly. | High | Task 04 |
| **10: Frontend Auth & Supabase JS** | Replace Axios/Sanctum with `@supabase/supabase-js`. Update Pinia auth. | Medium | Task 02 |
| **11: Frontend Stores & Services** | Refactor all API calls to use Supabase client. | High | Task 10, Schema |
| **12: Frontend Realtime** | Subscribe to Supabase Realtime in Pinia stores to auto-update UI. | Medium | Task 11 |
| **13: GitHub Pages Hash Router** | Switch Vue Router to `createWebHashHistory()` for static hosting stability. | Low | None |
| **14: Data Migration Script** | SQL script to map old `user_id` data to new `family_id` structure. | High | Schema |

---

## Phase 3 â€” Implementation Plan (Proposed Changes)

### [Task 01 & 02] Database Schema & Auth Setup

#### [NEW] `supabase/migrations/000001_core_schema.sql`
- Create tables: `families`, `profiles`, `members`, `accounts`, `categories`, `transactions`, `budgets`, `saving_goals`, `recurring_transactions`, `activity_logs`, `notifications`.
- Use UUIDs for `families` and `profiles`. Use `auth.users` for authentication.
- Add `family_id` to every table.
- Create trigger: `on_auth_user_created` to automatically create a `families` and `profiles` row when a user signs up.

### [Task 03] Row Level Security (RLS)

#### [NEW] `supabase/migrations/000002_rls_policies.sql`
- Enable RLS on all tables.
- Create policies using `(select family_id from profiles where id = auth.uid())` to ensure users only see their family's data.

### [Task 04 & 05 & 06] PostgreSQL Triggers (The Core Engine)

#### [NEW] `supabase/migrations/000003_business_logic_triggers.sql`
- **`update_account_balance()`**: Trigger on `transactions` (AFTER INSERT, UPDATE, DELETE). Atomically updates `accounts.balance`. Handles transfer logic internally.
- **`sync_goal_pocket()`**: Trigger on `accounts` (AFTER UPDATE). Updates `saving_goals.current_amount` if linked.
- **`log_activity()`**: Trigger on all main tables (AFTER INSERT, UPDATE, DELETE) to write to `activity_logs`.

### [Task 07 & 08] RPC Functions & Views

#### [NEW] `supabase/migrations/000004_rpc_and_views.sql`
- **`check_budget_guardrail(p_category_id, p_amount, p_date)`**: Returns `{ allowed, exceeded, remaining_budget, projected_balance }`.
- **`get_dashboard_summary(p_family_id, p_month, p_year)`**: Returns aggregated data for the charts.

### [Task 09] Recurring Transactions (Cron)

#### [NEW] `supabase/migrations/000005_cron_jobs.sql`
- **`process_recurring_transactions()`**: Function to find due transactions, insert them, and update `next_due_date`.
- Enable `pg_cron` to run this hourly.

### [Task 10-12] Frontend Refactor

#### [MODIFY] `frontend/package.json`
- Install `@supabase/supabase-js`. Remove `axios`.

#### [NEW] `frontend/src/lib/supabase.js`
- Initialize Supabase client.

#### [MODIFY] `frontend/src/stores/*` & `frontend/src/services/*`
- Rip out axios. Replace with `supabase.from().select()`.
- Implement `supabase.channel('custom-all-channel').on('postgres_changes', ...).subscribe()` in Pinia stores to achieve realtime reactivity.

#### [MODIFY] `frontend/src/router/index.js`
- Switch from HTML5 history to Hash history for GitHub pages.

---

## Verification Plan

### Automated / Database Verification
- For Tasks 1-9: Raw SQL tests simulating user signup, transaction insertion, and verifying that triggers correctly update account balances, sync goals, and create activity logs.

### Manual Verification
- Verify that Login/Signup works via Supabase Auth.
- Verify that adding an expense updates the Dashboard instantly (Realtime).
- Verify the Budget Guardrail modal appears exactly as it did before.

## Phase 4 â€” Post-Migration Polish (Completed)

After the core migration, several UI and analytical enhancements were completed:
1. **Dynamic Golden Ratio Colors**: All Chart.js pie and doughnut charts now mathematically generate distinct colors based on the golden ratio, preventing color collisions.
2. **Historical Net Worth**: A dynamic rolling algorithm computes the last 6 months of historical net worth by calculating backward from the current total balance using the monthly net income.
3. **Synchronized Budget Alerts**: The global notification bell and UI progress bars strictly trigger at `80%` capacity, syncing perfectly.
4. **Expense-Only Recurring Page**: Restricted the Recurring transactions exclusively to expenses, hiding income categories and hardcoding types to avoid data entry errors.
5. **Data Hydration Bugfixes**: Fixed missing relations (`category_name`, `account_name`) in the Recurring and Goals dashboards by overriding the base CRUD `list()` methods with enriched Supabase join queries.
6. **PG Cron Descriptions**: Pushed Migration 000009 to fix a concatenation bug that caused automated transactions to have `null` descriptions.

> [!NOTE]
> **MIGRATION COMPLETE**
> The application has been fully migrated to Supabase Serverless Architecture. All migration tasks are completed.

---

# Part 2 â€” Indonesian Language Mode Integration (Completed)

This plan outlines the strategy that was executed to add full multi-language (English and Indonesian) support to the Family Finance Vue 3 frontend application, allowing seamless translation of all views, charts, tours, and notifications.

## Implementation Details

### 1. Translation System Core (Dependencies & Stores)
A simple, clean localization layer was built utilizing Pinia and standard Vue reactivity.

- **[NEW] [en.json](file:///c:/Projects/final-finance-family/frontend/src/locales/en.json)**: Contains English strings categorized by context (auth, nav, dashboard, categories, budgets, goals, recurring, reports, settings, members, tours, common).
- **[NEW] [id.json](file:///c:/Projects/final-finance-family/frontend/src/locales/id.json)**: Contains corresponding Indonesian translations.
- **[NEW] [locale.js](file:///c:/Projects/final-finance-family/frontend/src/stores/locale.js)**: Persists active language selection in `localStorage`, updates HTML accessibility attributes, and handles key resolution with parameter interpolation.
- **[MODIFY] [main.js](file:///c:/Projects/final-finance-family/frontend/src/main.js)**: Configures and registers `$t` as a global helper for the application.

### 2. UI Layout & Switcher Integration
Language toggles have been integrated seamlessly across the front-end layout:
- **[MODIFY] [DashboardLayout.vue](file:///c:/Projects/final-finance-family/frontend/src/layouts/DashboardLayout.vue)**: Integrates language switcher next to the profile menu and dynamically updates sidebar elements.
- **[MODIFY] [LoginPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/LoginPage.vue)** & **[RegisterPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/RegisterPage.vue)**: Feature a beautiful floating selector (`EN | ID`).
- **[MODIFY] [SettingsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/SettingsPage.vue)**: Implements language settings.

### 3. Pages & Features Localization
All main templates have been updated to call the `$t()` global helper:
- **[MODIFY] [DashboardPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/DashboardPage.vue)**: Watches language changes and refreshes Month names and Chart labels dynamically.
- **[MODIFY] [TransactionsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/TransactionsPage.vue)**, **[AccountsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/AccountsPage.vue)**, **[BudgetsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/BudgetsPage.vue)**, **[CategoriesPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/CategoriesPage.vue)**, **[GoalsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/GoalsPage.vue)**, **[RecurringPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/RecurringPage.vue)**, **[MembersPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/MembersPage.vue)**, **[ReportsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/ReportsPage.vue)**.
- **[MODIFY] [GoalNotificationModal.vue](file:///c:/Projects/final-finance-family/frontend/src/components/GoalNotificationModal.vue)**.

### 4. Interactive Tours & Utilities
- **[MODIFY] [useTour.js](file:///c:/Projects/final-finance-family/frontend/src/composables/useTour.js)**: Maps the button labels (`Next`, `Back`, `Done`) and dynamically fetches localized titles and descriptions based on active language.
- **[MODIFY] [tours/*.js](file:///c:/Projects/final-finance-family/frontend/src/tours/)**: Converted all hardcoded English string elements to key strings matching JSON schema paths.

## Verification Plan

### Manual Verification
1. Navigate to `/login` and switch languages to verify dynamic translation.
2. Authenticate and select languages via the top navbar dropdown menu to see layout translations.
3. Test settings language persistence.
4. Launch interactive tours to verify the localized step details.

---

# Part 3 — Collaborative Shopping & Shared Bills

# Goal: Collaborative Shopping & Shared Bills

The goal of this feature is to allow family members to dynamically add items to a shared shopping list in realtime. When a parent or family member goes to the store, they can see the list, mark items as "purchasing", and automatically convert the purchased items into a logged **Expense Transaction** with a single click.

## Open Questions

Before we start coding, I have a few questions to make sure the design fits your vision exactly:

1. **Shared Bills**: The title mentions "Shared Bills". Do you want to implement a mechanism to split bills among members right now, or should we focus purely on the **Collaborative Shopping List** first?
2. **Post-Purchase Behavior**: When items are converted into a transaction, should we just mark them as `bought` (keeping a history), or should we completely delete them from the list to keep it clean?
3. **Transaction Conversion**: Should the app bundle all "checked" items into a single transaction (e.g., "Groceries: Milk, Eggs, Bread"), or separate transactions? (Bundling into one expense is usually better for accounting).

## Proposed Changes

### Supabase & Database
We will create a new migration file: `000012_shopping_list.sql`.
- **New Table**: `shopping_list`
  - `id` (BIGSERIAL)
  - `family_id` (UUID, references families)
  - `item_name` (VARCHAR)
  - `estimated_price` (NUMERIC) (Optional)
  - `purchased_by` (BIGINT, references members)
  - `status` (VARCHAR: `needed`, `claimed`, `bought`)
  - `created_at` / `updated_at`
- **RLS Policies**: Standard policies restricting access to the user's `family_id`.
- **Realtime**: We will enable Realtime for the `shopping_list` table so the UI updates instantly when another family member adds an item.

### Frontend
- **[NEW] `frontend/src/services/shoppingService.js`**: Functions to fetch, add, update, and convert items. It will also subscribe to Supabase Realtime channels.
- **[NEW] `frontend/src/pages/ShoppingPage.vue`**: 
  - A clean UI split into "To Buy" and "Purchased" tabs.
  - Checkboxes to check off items while walking down the supermarket aisle.
  - A "Checkout" button that takes the selected items and opens the existing Add Transaction modal pre-filled with the total cost and description.
- **[MODIFY] `frontend/src/layouts/DashboardLayout.vue`**: Add a "Shopping" link to the sidebar navigation. We can add a small numeric badge next to it indicating how many items are currently marked as `needed`.
- **[MODIFY] `frontend/src/locales/id.json`**: Add translation keys for the new shopping list UI.

## Verification Plan

### Automated Tests
- N/A (We will rely on frontend validation and DB constraints).

### Manual Verification
- Open two different browsers. Add an item in Browser A and verify it appears instantly in Browser B without reloading.
- Test the "Checkout" flow to ensure it correctly generates an Expense transaction and updates the account balance.



# OCR Receipt Scanner

The goal of this feature is to allow users to take a photo of a receipt (or upload an image) and automatically extract the transaction details (Merchant Name, Date, and Total Amount) to speed up manual data entry.

## Open Questions

> [!IMPORTANT]  
> **Which parsing engine do you prefer?**
> 1. **100% Free & Private (Recommended)**: We can install `tesseract.js` which runs entirely inside your browser/phone. It doesn't send images to any server. It uses Regex to find dates and totals. It is completely free forever, though slightly less accurate on crumpled receipts.
> 2. **AI-Powered (Requires API Key)**: We can build a Supabase Edge Function that uses the Gemini or OpenAI API to read the receipt with 99% accuracy. You will need to provide your own API key for this to work.
> 
> *The proposed plan below uses option #1 (Tesseract.js) to keep things simple and free.* Let me know if you prefer option 2.

## Proposed Changes

### Frontend App

#### [MODIFY] [TransactionsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/TransactionsPage.vue)
- Add a "Scan Receipt" button (`<i class="bi bi-camera"></i>`) next to the "Add Transaction" button.
- Implement a hidden file input `<input type="file" accept="image/*" capture="environment" />` to launch the phone's camera.
- Add a loading state overlay while parsing.
- Once parsing is complete, automatically pop open the existing "Add Transaction" modal, pre-filled with the extracted data.

#### [NEW] [receiptScanner.js](file:///c:/Projects/final-finance-family/frontend/src/utils/receiptScanner.js)
- A new utility file utilizing `tesseract.js` to process the image.
- Implement smart Regex rules to parse the raw text output:
  - **Date**: Find common date formats (DD/MM/YYYY, etc.).
  - **Total Amount**: Search for keywords like "TOTAL", "AMOUNT", "RP", and extract the largest currency value near the bottom of the receipt.
  - **Merchant Name**: Extract the first 2-3 lines of text, which typically contain the store name.

### Dependencies

#### [MODIFY] [package.json](file:///c:/Projects/final-finance-family/frontend/package.json)
- `npm install tesseract.js` for offline browser-based OCR.

## Verification Plan

### Manual Verification
1. Click "Scan Receipt" and upload a sample image of a supermarket receipt.
2. Verify the "Scanning..." UI appears.
3. Verify the "Add Transaction" modal opens automatically with the Total Amount, Date, and Merchant Name (Description) fields pre-filled.
4. The user can then select the Category and Account manually before saving.

---

# Part 5 — Modular Agent Rules and Knowledge Base Rearrangement (Completed)

This plan outlines the strategy that was executed to organize the agent instructions, system policies, constraints, and development guidelines into modular triggered rule files under `.agents/rules/` and restructure `.cursorrules` at the root directory.

## Implementation Details

### 1. Modular Rules Under `.agents/rules/`
We split the large consolidated `.cursorrules` file into individual markdown files with YAML frontmatter:
- **`supabase_network_restriction.md`**: Outlines the port `5432` block and HTTP REST client API or hotspot workarounds.
- **`documentation_lifecycle.md`**: Covers the auto-update policy for task lists and plans, and the implementation plan archiving process.
- **`walkthrough_artifacts.md`**: Covers guidelines for creating separate feature-specific walkthrough docs.
- **`git_push_policy.md`**: Focuses on clean, incremental commits and the mandatory `ask_question` authorization before pushing.

### 2. Root `.cursorrules` Reorganization
- Converted `.cursorrules` into a clean, well-indexed directory mapping categories to their modular rule files.
- Provided a consolidated reference outline for direct IDE use.

## Verification Plan

### Manual Verification
1. Confirm that `.agents/rules/` contains the correct rule files and YAML frontmatter headers.
2. Verify that the root `.cursorrules` file points to the correct absolute paths and lists the triggers correctly.
3. Run `graphify update .` to rebuild the AST graph.

---

# Part 6 — Offline OCR Receipt Scanner & AI Financial Coach

This plan outlines the implementation details for integrating Tesseract.js offline receipt scanning inside the transactions workflow, and adding a conversational Gemini AI Coach for family finance metrics.

## Implementation Details

### 1. Offline Receipt OCR Parsing
- **Dependency**: Add `"tesseract.js": "^5.1.0"` in `frontend/package.json`.
- **Parsing Engine (`receiptScanner.js`)**: Initialize Tesseract to recognize text locally in the browser. Regex engines extract the merchant name, currency amount, and date.
- **Scanner integration (`TransactionsPage.vue`)**: Capture user uploads, display the visual laser scanning overlay, and pre-fill form parameters on finished OCR.

### 2. Conversational AI Coach
- **Gemini Key Configuration (`SettingsPage.vue`)**: Provide a text field to save user's Gemini API key locally in `localStorage` (`gemini_api_key`).
- **Data Integration service (`aiService.js`)**: Query local Supabase assets, budget capacities, and category transaction sums. Format these metrics into a system prompt.
- **Chat page (`AiPage.vue`)**: Add an interactive chat container styled with frosted glassmorphism elements, supporting streaming, loading states, and API key missing prompts.
- **Navigation (`DashboardLayout.vue`)**: Link the new chat tab with a sparkling `bi-stars` icon in the sidebar.

## Verification Plan

### Automated / Build Verification
- Execute `npm run build` inside `/frontend` to verify clean compilation with the new packages.

### Manual Verification
1. Configure a free Gemini API Key in the Settings panel.
2. Open the AI Coach tab and verify that sending a message successfully retrieves financial advice based on the actual database numbers.
3. Open the Transactions page, click the camera icon to upload a receipt image, and verify the scanning animation triggers and pre-fills the transaction details.

---

# Part 7 — Cross-Device Gemini API Key Syncing (Completed)

This section outlines the strategy to synchronize the user's Gemini API Key across multiple devices and family members. It stores the verified key in the Supabase database (`families` table) and caches it in `localStorage` upon profile hydration.

## Implementation Details

1. **Database Schema Update**: Adds a `gemini_api_key TEXT` column to the `families` table. This column is secured by existing RLS policies, ensuring only family members can access it.
2. **Auto-Hydration**: Upon logging in on any device, the user's profile and family details are loaded, and the API key is automatically cached in `localStorage`.
3. **Backward Compatibility**: Preserves all direct `localStorage` read operations, preventing regressions in other parts of the app.

## Proposed Changes

### Supabase Database Migration
- **[NEW] `supabase/migrations/000021_add_gemini_api_key_to_families.sql`**:
  ```sql
  ALTER TABLE public.families ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
  ```

### Frontend Services & Stores
- **[MODIFY] `frontend/src/stores/auth.js`**:
  - Add `family` to state.
  - Modify `fetchProfile` to fetch the linked family record and automatically cache `family.gemini_api_key` in `localStorage` if it exists.
- **[MODIFY] `frontend/src/pages/SettingsPage.vue`**:
  - Update `saveGeminiKey` to update the `families` table record with the verified key or set it to `null` if cleared.

## Verification Plan

### Automated Tests
- Run `npm run build` to check client compilation.

### Manual Verification
1. Input and save a valid key on Device A, and verify it writes to the database.
2. Login to the same account on Device B, and verify the key is populated automatically in the Settings page.
3. Chat with the AI Advisor on both devices.

---

# Part 8 — Update Documentation (Completed)

This section outlines the final task of documenting the new features across all project README files.

## Proposed Changes

### Root Documentation
- **[MODIFY] [README.md](file:///C:/Users/Yosua Jan/.gemini/antigravity/worktrees/final-finance-family/redesign-ui-supabase-stack/README.md)**: Updated Arsitektur, Fitur Utama, and screenshots list to document the offline OCR receipt scanner, Gemini AI Advisor, and the Supabase API Key synchronization.

### Frontend Documentation
- **[MODIFY] [frontend/README.md](file:///C:/Users/Yosua Jan/.gemini/antigravity/worktrees/final-finance-family/redesign-ui-supabase-stack/frontend/README.md)**: Added technical details on offline scanning (Tesseract.js, regex heuristics, camera capture) and Gemini AI integration (glassmorphic styling, Pinia auth syncing, model selection).

---

# Part 9 — Receipt Image Storage & Financial Calendar View (Completed 2026-06-11)

Two new user-selected features implemented and shipped to `origin/redesign-ui-supabase-stack`.

## Feature 1: Receipt Image Storage

Scanned receipt photos are now compressed client-side (canvas 1200px max, JPEG 82%) and uploaded to a private Supabase Storage bucket (`receipts/{familyId}/{uuid}.jpg`), then linked to the transaction record via a new `receipt_url` column.

### Key Files
- **[NEW]** `supabase/migrations/000022_add_receipt_url_to_transactions.sql` — adds `receipt_url TEXT` column
- **[NEW]** `frontend/src/services/storageService.js` — `uploadReceipt`, `getReceiptSignedUrl`, `deleteReceipt`
- **[MODIFY]** `frontend/src/utils/receiptScanner.js` — returns `imageFile` in result
- **[MODIFY]** `frontend/src/services/transactionService.js` — `receipt_url` in select query
- **[MODIFY]** `frontend/src/pages/TransactionsPage.vue` — upload flow, thumbnail, lightbox, 📎 badge, delete cleanup

## Feature 2: Financial Calendar View

Monthly calendar page with 7-column grid (Mon-Sun), colored dots per day (🟢 income, 🔴 expense, 🔵 recurring, 🟡 goal), net chip, slide-up day detail panel, month navigation, summary strip, and mobile list-view fallback.

### Key Files
- **[NEW]** `frontend/src/pages/CalendarPage.vue`
- **[MODIFY]** `frontend/src/router/index.js` — `/calendar` route
- **[MODIFY]** `frontend/src/layouts/DashboardLayout.vue` — Calendar nav item
- **[MODIFY]** `frontend/src/locales/en.json` & `id.json` — `nav.calendar` key

## Theming Compatibility (Theme Audit & Mobile Bugfixes)
- **[MODIFY]** `frontend/src/pages/CalendarPage.vue` — updated styles to use theme variables (`--input-border`, `--primary-color`) rather than undefined/fallback variables (`--border-color`, `--primary`), solving invisible grid cells in light mode. Expanded the mobile list details container to display recurring bills and saving goals, matching the desktop experience.
- **[MODIFY]** `frontend/src/style.css` — added custom `.badge-recurring` and `.badge-goal` styles to prevent solid color overrides blocking amount visibility. Added custom `.btn-outline-primary` and `.btn-outline-secondary` overrides for premium theme-aware button colors. Fixed blurry tour popover buttons and text by forcing GPU hardware acceleration using `translate3d(0, 0, 0)`, `backface-visibility: hidden`, and proper font-smoothing configurations.

## Verification
- Build: compiled cleanly (`npm run build`)
- Git commit + push to origin

## Feature Description Accuracy Correction
- **[MODIFY]** `README.md` — corrected inaccurate description of Feature 6 (which combined collaborative shopping list and offline OCR scanner into one item). Separated them into Feature 6 (**Daftar Belanja Kolaboratif**) and Feature 7 (**Scan Struk Offline (OCR)**) and renumbered subsequent items up to 15.
- **[MODIFY]** `frontend/src/utils/receiptScanner.js` — refined Tesseract parsing with robust date formatting (2-digit years, dots/slashes), cash/change exclusions, and bottom-up scanner heuristics to solve inaccurate pre-fill issues.
- **[MODIFY]** `frontend/src/pages/TransactionsPage.vue` — added dynamic family member matching by searching the scanned receipt's raw text for active family members' names.
- **[MODIFY]** `frontend/src/services/storageService.js` — removed redundant `receipts/` path prefix from upload target to correctly conform to the Supabase Storage folder-level RLS policy.
- **[NEW]** `supabase/migrations/000023_add_storage_bucket_and_rls_policies.sql` — database migration defining private `receipts` bucket and folder-level storage RLS policies for uploads/reads/deletes.

---

# Part 11 — Magic UI/UX Pass: Compact & Elegant Action Buttons

This section outlines the UI/UX pass to refine all action buttons (Add Transaction, Transfer, Add Account, etc.) to make them compact, device-responsive, and elegant across Light and Dark themes.

## Proposed Changes

### [MODIFY] [style.css](file:///c:/Projects/final-finance-family/frontend/src/style.css)

1. **Modern Typography & Padding**:
   - Re-style the base `.btn` utility with a clean border-radius (`10px` for standard, `30px` pill style for main actions), medium font weight, and compact responsive padding.
   - Introduce smooth transitions (`all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`) and subtle click scales (`scale(0.97)` on active).

2. **Subtle Glows & Premium Gradients**:
   - Set up custom colored shadows for gradient and outline buttons that match their specific theme color instead of a flat gray shadow.
   - Design custom states for `.btn-primary-gradient`, `.btn-outline-primary`, `.btn-outline-secondary`, `.btn-secondary`, `.btn-danger`, `.btn-warning`, `.btn-info`, and `.btn-success` across both **Light** and **Dark** themes.

3. **Smart Mobile Compaction (Responsive layout)**:
   - On screens smaller than `576px`, automatically convert header buttons with icons (e.g. `Add Transaction`, `Transfer`, `Add Account`) into elegant circular icon-only buttons.
   - This is achieved in pure CSS using the `:has(i)` selector (e.g. `.page-header .btn:has(i)`), which sets the text font-size to `0`, overrides the icon margin to `0`, and applies a `50%` border-radius.

## Verification Plan

### Manual Verification
1. **Desktop view**:
   - Verify that all buttons have premium rounded borders, hover animations (lift, shadow glow), and standard texts.
2. **Mobile view / Responsive mode**:
   - Shrink browser width to `< 576px` and verify that header actions automatically condense into sleek, round icon-only action pills.
   - Verify that light/dark theme contrast remains perfect on all buttons.

---

# Part 12 — Production Synchronization

This plan details the steps required to synchronize the latest codebase and database migrations with the production environment.

## User Review Required

> [!IMPORTANT]
> **Supabase Database Port Restriction Workaround**
> Because the current network connection blocks port `5432` (PostgreSQL), the Supabase CLI cannot push migrations directly to production (`rvevxviktjncrtdkleda`). 
> **To proceed with the database synchronization, please temporarily switch your computer's internet connection to a phone hotspot.** Once connected, we will execute the migration push and you can switch back to the office ethernet.

## Proposed Steps

1. **Verify Code Status**: The local branch `main` is already completely up to date with `origin/main` (commit `14ab442`). Pushing code to `main` triggers the automated GitHub Pages deployment for the frontend `yjsfinance.my.id`.
2. **Build Validation**: A local production build of the frontend was run and verified to compile successfully with zero errors.
3. **Database Migration Sync**: 
   - A local branch `sync-with-prod` was created.
   - Once the user switches to a phone hotspot, we will run `npx supabase db push` to apply any pending database migrations (up to migration `000023`) to the production Supabase database instance.

## Verification Plan

### Manual Verification
- After switching to a hotspot, check the status of remote migrations:
  ```bash
  npx supabase migration list
  ```
- Run the migration push to sync with production:
  ```bash
  npx supabase db push
  ```

