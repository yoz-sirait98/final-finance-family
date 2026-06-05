# Family Finance Architecture Migration: Laravel to Supabase

This document outlines the complete strategy to migrate the Family Finance Management System from a Laravel + Vue 3 architecture to a Serverless Supabase + Vue 3 (GitHub Pages) architecture.

## Phase 1 — Project Discovery Report

### 1. Current System Architecture
- **Frontend**: Vue 3 SPA using Composition API, Vite, Pinia, Vue Router, and Bootstrap 5. Hosted on GitHub Pages (`yjsfinance.my.id`). Client-side features include PDF/CSV generation, interactive charts (Chart.js), and a guided tour (driver.js).
- **Backend**: Laravel 11/12 REST API providing business logic, validation, and Sanctum token-based authentication. Hosted on Render via Docker.
- **Database**: Currently using PostgreSQL hosted on Supabase (`db.bgauaxdtkiubfklllepf.supabase.co`), but all business logic resides in the Laravel layer. The schema relies on `user_id` to separate data per user/family.

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
- **Frontend**: `vue`, `vue-router`, `pinia`, `axios`, `@tanstack/vue-query`, `bootstrap`, `bootstrap-icons`, `chart.js`, `jspdf`, `jspdf-autotable`, `driver.js`, `idb-keyval`.
- **Backend (to be retired)**: Laravel framework, Sanctum.
- **New Backend (Supabase)**: `@supabase/supabase-js`, `pg_cron` (Postgres extension).

### 5. Risks
- **Data Integrity during Transition**: Moving balance calculations from PHP to Postgres PL/pgSQL triggers carries the risk of silent bugs if edge cases (like updating a transaction's amount *and* account simultaneously) are not handled correctly.
- **Budget Guardrail via SQL**: Standard Postgres functions throw exceptions. We need a way to validate budgets and return structured JSON via an RPC call instead of standard `INSERT`, or handle the guardrail logic directly in the Edge/RPC layer before insertion.
- **GitHub Pages Routing**: Replacing the current 404 fallback with Vue Hash Router (recommended) will change URLs (e.g., `/#/dashboard`).
- **Data Migration**: Existing data uses `user_id`. We must seamlessly migrate this to the new `family_id` structure without breaking relations.

### 6. Migration Complexity Assessment
**HIGH**. This is a complete architectural paradigm shift. We are moving from imperative application-layer logic to declarative database-layer logic (RLS, Triggers, RPC).

---

## Phase 2 — Migration Task Breakdown

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

## Phase 3 — Implementation Plan (Proposed Changes)

> [!WARNING]
> We will execute these tasks **ONE AT A TIME**. After each task, I will stop and await your explicit approval before proceeding to the next. Do not approve until the current task is fully validated.

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
- **`get_dashboard_summary(p_family_id, p_month, p_year)`**: Returns aggregated data for the charts to replace the old Laravel DashboardService.

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

#### [MODIFY] `frontend/src/router/index.js` (Task 13)
- Switch from HTML5 history to Hash history for GitHub pages.

---

## Verification Plan

### Automated / Database Verification
- For Tasks 1-9: I will write and execute raw SQL tests using `execute_sql` via the MCP tool to simulate user signup, transaction insertion, and verify that triggers correctly update account balances, sync goals, and create activity logs.

### Manual Verification
- For Tasks 10-13: You will need to run the Vue app locally (`npm run dev`) and test the UI.
- Verify that Login/Signup works via Supabase Auth.
- Verify that adding an expense updates the Dashboard instantly (Realtime).
- Verify the Budget Guardrail modal appears exactly as it did before.

## Phase 4 — Post-Migration Polish (Completed)

After the core migration, several UI and analytical enhancements were completed:
1. **Dynamic Golden Ratio Colors**: All Chart.js pie and doughnut charts now mathematically generate distinct colors based on the golden ratio, preventing color collisions.
2. **Historical Net Worth**: A dynamic rolling algorithm computes the last 6 months of historical net worth by calculating backward from the current total balance using the monthly net income.
3. **Synchronized Budget Alerts**: The global notification bell and UI progress bars strictly trigger at `80%` capacity, syncing perfectly.
4. **Expense-Only Recurring Page**: Restricted the Recurring transactions exclusively to expenses, hiding income categories and hardcoding types to avoid data entry errors.
5. **Data Hydration Bugfixes**: Fixed missing relations (`category_name`, `account_name`) in the Recurring and Goals dashboards by overriding the base CRUD `list()` methods with enriched Supabase join queries.
6. **PG Cron Descriptions**: Pushed Migration 000009 to fix a concatenation bug that caused automated transactions to have `null` descriptions.

---

> [!NOTE]
> **MIGRATION COMPLETE**
> The application has been fully migrated to Supabase Serverless Architecture. All tasks are completed.
