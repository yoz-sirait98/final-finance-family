# Tasks Checklist: Repurpose Header Bell Icon into In-App Alerts Hub

- [x] **1. Localization (`frontend/src/locales/en.json` & `id.json`)**
  - [x] Add i18n translation keys for Alerts Hub (`alertsHub`, `allAlerts`, `budgetAlerts`, `goalAlerts`, `shoppingAlerts`, `noAlertsFound`).

- [x] **2. Header Bar & Alerts Hub (`frontend/src/layouts/DashboardLayout.vue`)**
  - [x] Remove redundant `<PushNotificationToggle />` from header bar.
  - [x] Fetch/compute combined active alerts (Budget overruns, Goal milestones, Pending shopping lists).
  - [x] Update Bell icon badge counter to display total active alert count.
  - [x] Build interactive tabbed dropdown menu (`Semua`, `Anggaran`, `Target`, `Belanja`).
  - [x] Add clickable routing handlers to navigate to `/budgets`, `/goals`, and `/shopping`.

- [x] **3. Settings Page (`frontend/src/pages/SettingsPage.vue`)**
  - [x] Verify PWA Push Notifications toggle remains clear and prominent in Settings.

- [x] **4. Build & Verification**
  - [x] Run `npm run build` to verify clean compilation.
  - [x] Update graphify knowledge graph (`graphify update .`).
  - [x] Verify Bell icon dropdown popover, tab switching, and navigation in browser.
