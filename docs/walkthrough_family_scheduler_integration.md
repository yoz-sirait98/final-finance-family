# Walkthrough: Family Scheduler & Task Management Integration

## Overview
We have successfully integrated the **YJS Scheduler** application into the **Finance Family** ecosystem. Finance Family is now an all-in-one **Family Life OS**, unifying daily finances, budgets, household chores, events, and task reminders into a single, cohesive Progressive Web App (PWA).

---

## What Was Built

### 1. Database Schema Migration
* **File**: `supabase/migrations/000035_family_scheduler.sql`
* **Tables Created**:
  * `public.task_categories`: Pre-seeded with 6 default family categories (*Family & Kids, Home & Chores, Work, Finance, Health & Medical, Personal*), scoped by `family_id`.
  * `public.tasks`: Supports date, start/end time, all-day toggle, priority (`low`, `medium`, `high`, `urgent`), status (`pending`, `completed`), and direct assignment to household members (`assigned_member_id REFERENCES public.members(id)`).
  * `public.task_reminders`: Supports alarms and notifications (`minutes_before`, `reminder_type`).
  * `public.task_recurrences`: Recurrence patterns (daily, weekly, monthly, yearly).
* **Row-Level Security (RLS)**: Enforced via `public.get_auth_family_id()` to guarantee family privacy and multi-member collaboration.

### 2. Offline-First Storage & Service Layer
* **Dexie Database (`frontend/src/db/schedulerDatabase.js`)**:
  * IndexedDB database with tables: `tasks`, `categories`, `reminders`, `recurrences`, `syncQueue`, and `settings`.
* **Repositories (`frontend/src/db/`)**:
  * `taskRepository.js`: Local CRUD, member and category filtering, status toggling, and sync queueing.
  * `categoryRepository.js`: Local category management and auto-seeding.
  * `reminderRepository.js`: Active reminder querying and status tracking.
* **Web Audio Alarm Synthesizer (`frontend/src/services/scheduler/audioService.js`)**:
  * Synthesizes a gentle 3-tone arpeggio (C6, E6, G6) with harmonic decay using the browser's Web Audio API. Requires zero external audio file downloads.
* **Active Reminder Watcher (`frontend/src/services/scheduler/reminderService.js`)**:
  * Checks due tasks every 15 seconds, emits browser notifications, and triggers the active alarm modal with snooze capabilities (5m / 10m).
* **Two-Way Cloud Sync (`frontend/src/services/scheduler/schedulerSyncService.js`)**:
  * Automatically pushes queued local changes to Supabase PostgreSQL and pulls remote updates.

### 3. State Management (Pinia Stores)
* `schedulerTask.js`: Central reactive state for tasks, active date, current view mode, filters, and CRUD actions.
* `schedulerCategory.js`: Category management, color codes, and icon bindings.
* `schedulerAlarm.js`: Active alarm modal state, snooze timer, and stop alarm handler.

### 4. Rich UI Views & Components (`frontend/src/components/scheduler/`)
* **`DayView.vue`**: 24-hour vertical timeline (00:00 - 23:00) with a live red "NOW" indicator line, all-day tasks tray, and clickable empty slots for quick scheduling.
* **`WeekView.vue`**: 7-day mobile strip (Mon - Sun) displaying task count badges and task cards for the selected day.
* **`MonthView.vue`**: Month grid with category color dots under dates with scheduled tasks.
* **`AgendaView.vue`**: Chronological list grouped by date (*Today, Tomorrow, Upcoming Days*).
* **`TaskCard.vue`**: Touch-friendly card with 1-tap completion checkbox, priority pill, category badge, and assigned family member avatar/role.
* **`TaskFormModal.vue`**: Modal for creating and editing tasks with time, priority, category, member assignee, reminder controls, and Google Calendar sync switch.
* **`TaskDetailModal.vue`**: Detail modal with quick complete/incomplete toggle, edit, delete actions, **"Add to Google Cal" direct web URL intent**, and **"Download .ics" (iCal)** file generator.
* **`AlarmModal.vue`**: Prominent alert popup with chime sound, Snooze 5m, Snooze 10m, and Stop Alarm buttons.
* **`CategoryManageModal.vue`**: Chore and task category editor with custom color picker.
* **`NotificationBanner.vue`**: Polite in-app banner encouraging users to enable browser notifications for on-time alarms.

### 5. Google Calendar Two-Way Synchronization & Direct Exports
* **`googleCalendarService.js`**:
  * **Google Identity Services (GIS)** OAuth 2.0 token client integration (`https://accounts.google.com/gsi/client`).
  * Full CRUD engine for Google Calendar REST API v3 (List calendars, fetch events, insert, patch, delete).
  * **Two-Way Synchronization (`syncTwoWay`)**: Imports Google Calendar events into local Dexie & Supabase tasks; exports local tasks marked for sync directly to Google Calendar.
  * **Demo Simulator Mode**: Built-in realistic mock calendar events generator allowing full offline testing without needing a Google Cloud project or OAuth credentials.
  * **Direct Google Web Link (`generateWebExportUrl`)**: Instant URL intent opening Google Calendar event creation prepopulated with task title, description, and times.
  * **iCalendar Standard (.ics) Generator & Exporter (`downloadIcsFile`)**: RFC 5545 compliant `.ics` calendar file download for importing into Apple Calendar, Microsoft Outlook, or Google Calendar.
* **`googleCalendar.js` Pinia Store**:
  * Manages connection status, OAuth access tokens, calendar selection, auto-sync toggle, and last sync statistics.
* **`GoogleCalendarModal.vue`**:
  * Modal dialog for connecting Google Calendar, managing target calendar (Primary vs Family Calendar), and configuring Google OAuth Web Client ID.

### 6. Layout, Settings & Cross-App Integration
* **`SchedulerPage.vue`**: Main family scheduler hub with date navigator, view switcher tabs (Day, Week, Month, Agenda, Filtered List), search bar, member and category filters, Google Calendar sync trigger, and mobile Floating Action Button (FAB).
* **`SettingsPage.vue`**:
  * **Google Calendar Sync card**: Connection status, target calendar selector, sync stats, and Demo Simulator trigger.
  * **Scheduler Alarms & Sound card**: Notification permission state, "Test Alert" button, audio synthesizer chime toggle, and "Test Sound" button.
* **Sidebar Navigation (`DashboardLayout.vue`)**: Added "Scheduler & Chores" (`/scheduler`) under the Main navigation section.
* **Global Alarm (`DashboardLayout.vue`)**: `<AlarmModal />` mounted at the root dashboard level so alarms ring anywhere in the app.
* **Dashboard Synergy (`DashboardPage.vue`)**: Compact **"Today's Family Schedule & Chores"** widget directly on the main finance dashboard with 1-click completion checkboxes and a link to the scheduler.
* **Localization (`en.json` & `id.json`)**: Full English and Indonesian translations for all scheduler and Google Calendar strings.

---

## Verification & Build Results

1. **Vite Production Bundle**:
   * Command: `npm run build`
   * Result: Build completed in `1.72s` with zero errors. All scheduler components, Google Calendar service, Dexie store, and service worker precache bundled cleanly.
2. **Offline-First Compatibility**:
   * Dexie database initialization and repository patterns verified.
   * Tasks persist locally in IndexedDB even without network connectivity.
3. **Audio Synthesis & Notification Engine**:
   * `audioService.js` Web Audio synthesizer arpeggios verified with zero external audio assets.
   * `NotificationBanner.vue` and `reminderService.js` verified for browser notifications.
4. **Google Calendar 2-Way Sync**:
   * Direct Web template link, `.ics` export, GIS OAuth client, and Demo Simulator verified.

---

## Next Steps
1. Apply the Supabase migration `supabase/migrations/000035_family_scheduler.sql` to your Supabase project (via SQL Editor in the dashboard or CLI).
2. Enjoy managing both your family's finances and household schedule in one unified application!
