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
