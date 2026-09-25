---
name: final-finance-family-project
description: Workspace-specific architecture, database schema (migrations 000001-000038), service/store map, and implementation rules for the Final Finance Family repository (Vue 3, Vite, Pinia, Dexie.js, Supabase PostgreSQL/Auth/Storage/Realtime, Web Push). Apply whenever working inside the final-finance-family workspace.
---

# Final Finance Family — Workspace Architecture & Module Map

## 1. Workspace Stack & Architecture

This workspace (`final-finance-family`) implements the global `finance-family-core` and `finance-money-integrity` standards on the following stack:
- **Frontend**: Vue 3 (Composition API), Vite, Pinia (`frontend/src/stores/`), Vue Router (`frontend/src/router/index.js`), Bootstrap 5 + custom CSS (`frontend/src/style.css`), Chart.js, `driver.js` guided tours (`frontend/src/composables/useTour.js`).
- **Offline Storage**:
  - `idb-keyval` offline mutation queue (`frontend/src/services/syncService.js`) for general CRUD operations.
  - **Dexie.js** IndexedDB (`frontend/src/db/schedulerDatabase.js`, `taskRepository.js`, `categoryRepository.js`, `reminderRepository.js`) with 2-way Supabase sync (`frontend/src/services/scheduler/schedulerSyncService.js`) for the Family Scheduler.
- **Backend / Database**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage bucket `receipts`, Supabase Realtime `frontend/src/lib/realtime.js`, `pg_cron`, Row Level Security).
- **Push & External Integrations**: VAPID Web Push (`deploy/push-endpoint.js`, `pushNotificationService.js`, `pushDispatcherService.js`), Google Calendar OAuth 2.0 (`googleCalendarService.js`), Multi-AI Router (`aiService.js`), and WhatsApp webhooks (`000025`–`000030`).

---

## 2. Authoritative Database, Service & Store Map (`000001`–`000038`)

| Module & Route | PostgreSQL Tables / RPCs / Triggers | Frontend Services & Pinia Stores |
| :--- | :--- | :--- |
| **Auth, Tenancy & Members**<br>`/login`, `/register`, `/members`, `/settings` | `families`, `profiles` (`trg_protect_profile_fields` in `000038`), `members`, `public.get_auth_family_id()` | `authService.js`, `memberService.js`, `stores/auth.js`, `stores/members.js` |
| **Dashboard & Analytics**<br>`/` (`DashboardPage.vue`) | `get_dashboard_summary` RPC (`000007`, `000011`, `000014`, hardened in `000038`) | `dashboardService.js`, `composables/useDashboard.js` |
| **Accounts & Categories**<br>`/accounts`, `/categories` | `accounts`, `categories`, `000003_balance_transfer_engine.sql` | `accountService.js`, `categoryService.js`, `stores/accounts.js`, `stores/categories.js` |
| **Transactions & Financial Calendar**<br>`/transactions`, `/calendar` | `transactions` (`CHECK (amount > 0)` in `000038`, `receipt_url` in `000022`, `000010_cascade_delete_transfers.sql`) | `transactionService.js`, `stores/transactions.js`, `CalendarPage.vue` |
| **Budgets, Goals & Project Pockets**<br>`/budgets`, `/goals`, `/projects` | `budgets` (`CHECK (amount > 0)`), `check_budget_guardrail` RPC (`000006`, `000038`), `goals` (`000004_goal_sync_engine.sql`, `000018_project_pockets_refactor.sql`, `000019_goals_status_enum.sql`) | `budgetService.js`, `goalService.js`, `stores/budgets.js`, `stores/goals.js`, `ProjectPocketsPage.vue` |
| **Recurring Transactions**<br>`/recurring` (`RecurringPage.vue`) | `recurring_transactions`, `process_recurring_transactions()` (`000008`, `000024_fix_recurring_catchup_and_concurrency.sql`) | `recurringService.js` |
| **Shopping Plans & Checkout**<br>`/shopping`, `/shopping/:id` | `shopping_plans` (`000013`, `000027_shopping_plan_assignees.sql`, `000028_allow_locked_status.sql`, `000034_add_receipt_url_to_shopping_plans.sql`), `shopping_items` (`000012`, `000017`) | `shoppingPlanService.js`, `shoppingService.js`, `ShoppingPage.vue`, `ShoppingDetailPage.vue` |
| **Family Scheduler & Chores**<br>`/scheduler` (`SchedulerPage.vue`) | `000035_family_scheduler.sql`: `task_categories`, `tasks`, `task_reminders`, `task_recurrences`, `seed_default_task_categories()` | `db/schedulerDatabase.js`, `services/scheduler/` (`schedulerSyncService.js`, `reminderService.js`, `audioService.js`, `googleCalendarService.js`), `stores/schedulerTask.js`, `schedulerCategory.js`, `schedulerAlarm.js`, `googleCalendar.js` |
| **Smart Meal Planner, Pantry & Recipes**<br>`/meals` (`MealsPage.vue`) | `000036_smart_meal_planner_and_pantry.sql`, `000037_add_recipe_details.sql`: `pantry_items`, `meal_plans`, `recipes` | `pantryService.js`, `mealPlanService.js`, `recipeService.js`, `stores/pantry.js`, `stores/mealPlan.js` |
| **Receipts & Storage**<br>(Transactions, Calendar, Shopping) | Storage bucket `receipts` (`000023`, hardened in `000038` with 5MB limit & image MIME types) | `storageService.js` (10MB client cap, MIME validation, HTML5 Canvas JPEG re-encoding) |
| **Aurora AI & Vision OCR**<br>`/ai` (`AiPage.vue`) | `families.gemini_api_key` (`000021`) | `aiService.js` (Gemini 2.5 Flash/Lite, DeepSeek V3 & R1 Reasoner, Groq, OpenRouter) |
| **Push, Summaries & Alerts Hub**<br>(Header Bell, `/settings`) | `push_subscriptions` (`000029`), `system_settings` (`000031`, `service_role` only in `000038`), `000032_weekly_summary_engine.sql`, `000033_monthly_summary_engine.sql` | `pushNotificationService.js`, `pushDispatcherService.js` (`PUSH_TEMPLATES`), `DashboardLayout.vue` |

---

## 3. Workspace-Specific Implementation Rules

1. **`members.id` (`BIGINT`) vs. `auth.users.id` / `profiles.id` (`UUID`)**:
   - `public.members.id` is `BIGINT` (referenced by `transactions.member_id`, `tasks.assigned_member_id`, `meal_plans.assigned_member_id`).
   - `auth.users.id` and `public.profiles.id` are `UUID` (`created_by`, `shopping_items.added_by`).
2. **Project Pockets & Budget Exclusion**:
   - Project Pockets (`/projects`) use `public.goals` rows where `status = 'completed'` (active pocket) or `'done'` (finished pocket).
   - Per `000018_project_pockets_refactor.sql`, logging an expense with `goal_id` does **not** decrement `goals.current_amount`; remaining pocket balance is calculated as `current_amount - spent`.
   - `get_dashboard_summary` and `check_budget_guardrail` filter `AND t.goal_id IS NULL` so Project Pocket expenses never count toward monthly category budgets.
3. **Meals $\leftrightarrow$ Shopping $\leftrightarrow$ Pantry Loop**:
   - Export missing ingredients from `MealsPage.vue` to `shopping_items` via `mealPlanService.exportMissingIngredientsToShopping()`.
   - Restock purchased items from `ShoppingDetailPage.vue` (`done` or `locked` status) into `pantry_items` via `restockAllToPantry()`.
4. **Recipe Schema-Cache Resilience**:
   - Preserve the `PGRST204` fallback in `recipeService.js` when creating/updating `public.recipes` so environments where `000037_add_recipe_details.sql` is pending still function without error, and always keep `name` and `title` synchronized.
5. **Dual Responsive Views (`d-none d-md-block` & `d-md-none`)**:
   - When modifying UI on `TransactionsPage`, `ShoppingPage`, `ShoppingDetailPage`, `RecurringPage`, `ProjectPocketsPage`, `SchedulerPage`, or `MealsPage`, update both the desktop layout and the mobile touch layout (`d-md-none`), and update both `frontend/src/locales/en.json` and `frontend/src/locales/id.json`.
6. **Workspace Rules & Tooling**:
   - **Graphify**: Query `graphify` first for architecture questions and run `graphify update .` after code edits (`.agents/rules/graphify.md`).
   - **Supabase Port 5432 Restriction**: Office Ethernet blocks port `5432` (`.agents/rules/supabase_network_restriction.md`); use HTTPS (`443`) REST API or switch to hotspot for direct CLI `supabase db push`.
   - **Docs & Git Push Policy**: Sync `docs/task.md` and `docs/implementation_plan.md`, write feature-specific walkthroughs (`docs/walkthrough_<feature>.md`), and always call `ask_question` before `git push` (`.agents/rules/git_push_policy.md`).
