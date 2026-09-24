# Tasks Checklist: Family Scheduler Integration into Finance Family

- [x] **1. Phase 1: Planning & Dependencies**
  - [x] Analyze `scheduler-family` architecture and repository structure
  - [x] Archive previous `implementation_plan.md` to `scratch/old_plan_2026_09_21.md`
  - [x] Obtain user approval on `implementation_plan.md`
  - [x] Install required frontend dependencies (`dexie`, `date-fns`, `lucide-vue-next`)

- [x] **2. Phase 2: Database Schema & Supabase Migration**
  - [x] Create `supabase/migrations/000035_family_scheduler.sql`
  - [x] Define `task_categories`, `tasks`, `task_reminders`, `task_recurrences` tables scoped to `family_id`
  - [x] Add foreign key to `members` table (`assigned_member_id`)
  - [x] Configure RLS policies using `public.get_auth_family_id()`
  - [x] Add default category seeding trigger/function

- [x] **3. Phase 3: Offline-First Storage & Service Engine**
  - [x] Implement Dexie DB in `frontend/src/db/schedulerDatabase.js`
  - [x] Create repositories (`taskRepository.js`, `categoryRepository.js`, `reminderRepository.js`)
  - [x] Create date utilities in `frontend/src/utils/schedulerDate.js`
  - [x] Implement `audioService.js` (Web Audio API synthesizer chimes)
  - [x] Implement `reminderService.js` (interval checker & active alarm trigger)
  - [x] Implement `schedulerSyncService.js` (Supabase background sync with Dexie)

- [x] **4. Phase 4: Pinia State Stores**
  - [x] Implement `schedulerTask.js` store (tasks, active view, filtering, CRUD)
  - [x] Implement `schedulerCategory.js` store (categories, colors, icons)
  - [x] Implement `schedulerAlarm.js` store (active alarms, snooze, dismiss)

- [x] **5. Phase 5: UI Views & Components (`components/scheduler/`)**
  - [x] Build `DayView.vue` (24-hour timeline + live "NOW" indicator)
  - [x] Build `WeekView.vue` (7-day strip + task cards)
  - [x] Build `MonthView.vue` (month calendar grid + category dots)
  - [x] Build `AgendaView.vue` (chronological list)
  - [x] Build `TaskCard.vue` (touch card, priority badge, member avatar, 1-tap checkbox)
  - [x] Build `TaskFormModal.vue` (create/edit task with member assignment & reminders)
  - [x] Build `TaskDetailModal.vue` (details modal)
  - [x] Build `AlarmModal.vue` (Web Audio alarm alert with snooze)
  - [x] Build `CategoryManageModal.vue` (category management)
  - [x] Create `frontend/src/pages/SchedulerPage.vue` (unified hub with calendar & task tabs)

- [x] **6. Phase 6: Layout, Navigation & Cross-App Integration**
  - [x] Register `/scheduler` route in `frontend/src/router/index.js`
  - [x] Add Scheduler item to `DashboardLayout.vue` sidebar & mobile navigation
  - [x] Mount global `AlarmModal.vue` and start reminder watcher
  - [x] Add "Today's Schedule & Chores" widget to `DashboardPage.vue`
  - [x] Add i18n localization in `frontend/src/locales/en.json` and `id.json`

- [x] **7. Phase 7: Google Calendar 2-Way Synchronization**
  - [x] Port `googleCalendarService.js` (GIS OAuth 2.0, event CRUD, 2-way sync, web export link, .ics export)
  - [x] Port `googleCalendar.js` Pinia store (account state, calendars, auto-sync, simulator)
  - [x] Create `GoogleCalendarModal.vue` configuration dialog (OAuth & Client ID setup)
  - [x] Add Google Calendar toggle in `TaskFormModal.vue` and direct calendar export & badges in `TaskDetailModal.vue`
  - [x] Add Google Calendar controls in `SchedulerPage.vue` and `SettingsPage.vue`
  - [x] Add Notification permission banner (`NotificationBanner.vue`) & sound test controls
  - [x] Add localization strings for Google Calendar in `en.json` and `id.json`

- [x] **8. Phase 8: Verification & Documentation**
  - [x] Run `npm run build` to verify clean build
  - [x] Test Google Calendar connection & sync workflow
  - [x] Update walkthrough artifact and knowledge graph

---

# Tasks Checklist: Smart Meal Planner & Pantry Inventory System

- [x] **1. Phase 1: Planning & Database Schema (Supabase)**
  - [x] Create implementation plan & archive previous plan to `scratch/old_plan_2026_09_22.md`
  - [x] Obtain user approval on implementation plan
  - [x] Write migration `supabase/migrations/000036_smart_meal_planner_and_pantry.sql` (`pantry_items`, `meal_plans`, `recipes` with RLS)

- [x] **2. Phase 2: Services & State Stores**
  - [x] Create `pantryService.js` (CRUD, storage zone filters, low stock & expiry querying)
  - [x] Create `mealPlanService.js` (week planner, meal slot CRUD, export missing ingredients to shopping list)
  - [x] Create `recipeService.js` (favorites, AI recipe generation from pantry via `aiService`)
  - [x] Create Pinia stores: `pantry.js` and `mealPlan.js`

- [x] **3. Phase 3: UI Components (`components/meals/`)**
  - [x] Build `PantryItemModal.vue` (add/edit pantry item with Fridge/Freezer/Pantry zones & expiry picker)
  - [x] Build `MealPlanModal.vue` (slot modal with date, meal type, cook member, and ingredients)
  - [x] Build `AiRecipeModal.vue` (*"Masak Apa Dari Kulkas?"* interactive recipe generator)
  - [x] Build `RecipeDetailModal.vue` (cooking steps, servings, ingredients pantry status)
  - [x] Build `ExportShoppingModal.vue` (1-click export missing meal ingredients to shopping plan)

- [x] **4. Phase 4: Master Page & Cross-App Integration**
  - [x] Create `frontend/src/pages/MealsPage.vue` (Weekly Meal Board, Pantry Inventory, Recipe Box, Expiry Alert Ribbon)
  - [x] Register `/meals` route in `router/index.js`
  - [x] Add sidebar navigation link in `DashboardLayout.vue`
  - [x] Add "Today's Menu & Expiring Groceries" dual widget to `DashboardPage.vue`
  - [x] Add 1-tap restock action in `ShoppingDetailPage.vue` (Shopping -> Pantry synergy)
  - [x] Add localization strings in `en.json` and `id.json`

- [x] **5. Phase 5: Verification, Walkthrough & Knowledge Graph**
  - [x] Run `npm run build` to ensure clean build (100% successful bundle)
  - [x] Execute automated background test suite (`frontend/scripts/test_meals_pure.js` - 6/6 tests passing)
  - [x] Update knowledge graph (`graphify update .`)
  - [x] Write walkthrough document (`docs/walkthrough_smart_meal_planner_and_pantry.md`)

- [x] **6. Phase 6: Post-Launch Accessibility & Schema Refinements**
  - [x] Fix dark mode contrast for "View Cooking Steps" button, instructions list, and chef tips
  - [x] Fix recipe saving schema cache error via resilient fallback in `recipeService.js` and migration `000037_add_recipe_details.sql`
  - [x] Make migration `000036_smart_meal_planner_and_pantry.sql` idempotent (`DROP POLICY IF EXISTS`)
  - [x] Fix Recipe Detail modal scrolling (`overflow-y: auto !important`) and add chef tips display

- [x] **7. Phase 7: Mobile PWA Responsiveness & Touch UX Optimization**
  - [x] Configure PWA safe-area viewport (`viewport-fit=cover` in `frontend/index.html`)
  - [x] Add global safe-area inset padding and modal height constraints (`max-height: 94vh`) in `frontend/src/style.css`
  - [x] Prevent iOS Safari auto-zoom by enforcing 16px font size on inputs
  - [x] Optimize `MealsPage.vue`:
    - [x] Add mobile day selector pill strip (`Hari Ini / Today`, `Semua Hari / All Days`, and day pills)
    - [x] Eliminate 3,000px+ vertical scroll on mobile by defaulting to Today's meals and setting column height to `auto`
    - [x] Convert navigation tabs into horizontal touch-scroll strip (`overflow-x: auto`)
    - [x] Make pantry & recipe grids single-column on mobile viewports
    - [x] Enlarge stepper touch targets to 34px for easy thumb tapping
  - [x] Optimize `SchedulerPage.vue`:
    - [x] Convert view switcher (`Day`, `Week`, `Month`, `Agenda`, `Filtered List`) into horizontal touch scroll strip
    - [x] Adjust Floating Action Button (`.scheduler-fab`) to thumb-level with safe-area bottom support
  - [x] Optimize Scheduler Sub-views:
    - [x] Make DayView slot task titles responsive (`max-width: 160px` on small phones)
    - [x] Enlarge TaskCard checkbox wrapper tap target to 36x36px to prevent accidental card navigation
  - [x] Optimize Meals Modals:
    - [x] Add 2-column grid fallback for MealPlan slot buttons on screens $\le 420px$
    - [x] Add responsive button sizing in AiRecipe modal
  - [x] Verify production bundle (`npm run build` exits 0 with 78 precached PWA items)
  - [x] Verify automated background tests (`node frontend/scripts/test_meals_pure.js` passes 6/6)

- [x] **8. Phase 8: 20 Pre-Launch Security Checks & Hardening**
  - [x] 1. API key aman (Supabase publishable key on client, Gemini keys isolated in DB per family)
  - [x] 2. env jangan public (`.env` & `.env.production` ignored in git; only `VITE_` exposed in bundle)
  - [x] 3. No hardcode secret (Scanned codebase; sanitized VAPID private key in `deploy/push-endpoint.js`)
  - [x] 4. Cek secret di Git (Git history and `git ls-files` verified clean of secrets)
  - [x] 5. Debug mode OFF (`sourcemap: false` and esbuild drop `console` & `debugger` on production build)
  - [x] 6. Error jangan bocor (Clean toast errors; no database schema or raw stack leaks)
  - [x] 7. Validasi input (HTML5 constraints + database `CHECK (amount > 0)` on transactions & budgets)
  - [x] 8. Sanitasi input (String trimming, safe escaping, PostgREST parameterization)
  - [x] 9. Anti SQL injection (PostgREST parameterized queries, static PL/pgSQL triggers)
  - [x] 10. Anti XSS (Vue mustache auto-escaping; HTML entities sanitized before markdown in `AiPage.vue`)
  - [x] 11. Server-side auth (Supabase Auth JWT verification enforced at PostgREST API gateway)
  - [x] 12. Cek akses user (Enforced RLS across all tables; added `trg_protect_profile_fields` against family_id tampering)
  - [x] 13. Role admin aman (Immutable profile role trigger prevents privilege escalation)
  - [x] 14. DB jangan public (Direct DB port 5432 blocked/restricted; HTTPS 443 API only)
  - [x] 15. DB permission ketat (Revoked `system_settings` client access; set `search_path = public, pg_temp` on RPCs)
  - [x] 16. Hash password (Supabase Auth industry-standard bcrypt/Argon2id hashing)
  - [x] 17. Session aman (JWT with automatic background refresh token rotation)
  - [x] 18. Reset password aman (PKCE one-time token email flow + password confirmation matching)
  - [x] 19. Batasi upload file (10MB client limit, 5MB Supabase Storage limit, image MIME whitelist)
  - [x] 20. Scan upload file (HTML5 Canvas re-encoding to JPEG strips EXIF and executes clean re-serialization)



