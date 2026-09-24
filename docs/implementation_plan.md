# Implementation Plan

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

