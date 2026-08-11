# Implementation Plan

## Repurpose Header Bell Icon into In-App Alerts Hub (August 2026)

### Problem Area & Target Architecture

Currently, the top header bar (`DashboardLayout.vue`) contains two confusing bell icons:
1. `<PushNotificationToggle />` using `bi-bell-fill` / `bi-bell-slash` for PWA Web Push subscription.
2. `#tour-bell-icon` using `bi-bell` strictly for Budget Overrun alerts.

This creates visual redundancy and limits the bell dropdown from serving as a true in-app notification hub for other critical financial alerts (such as completed goals or pending shopping lists).

| Feature Component | Current Implementation | Target Architecture |
|---|---|---|
| **Push Notification Toggle** | Standalone bell icon in top header bar next to theme toggle | Exclusively managed in Settings page (`SettingsPage.vue`) |
| **Header Bell Icon** | Displays only Budget Overrun alerts | Multi-category **In-App Alerts Hub** (Budgets, Goals, Shopping) |
| **Alert Filtering & Navigation** | Plain list of budget warnings | Tabbed filter bar (`Semua`, `Anggaran`, `Target`, `Belanja`), color-coded icons, and direct route navigation on click |

---

### Proposed Changes

#### Top Navbar & Layout

##### `frontend/src/layouts/DashboardLayout.vue`
- Remove `<PushNotificationToggle />` from top header elements.
- Expand Bell dropdown into an interactive **Alerts Hub**:
  - Combined active alert badge counter (`totalAlertsCount = budgetAlerts + goalAlerts + pendingShoppingCount`).
  - Add tabbed filter bar inside dropdown header (`Semua` / `Anggaran` / `Target` / `Belanja`).
  - Render categorized alert items with color-coded icons (danger for budget overruns, success/warning for goals, primary for shopping).
  - Add clickable navigation handlers for each alert type to open `/budgets`, `/goals`, or `/shopping`.
  - Add empty state message when no active alerts exist.

#### Settings Page

##### `frontend/src/pages/SettingsPage.vue`
- Verify and polish the PWA Push Notifications card section to ensure clear instructions and seamless toggle experience.

#### Localization

##### `frontend/src/locales/en.json` & `frontend/src/locales/id.json`
- Add i18n keys for Alerts Hub headers, tab categories, and alert status labels.

---

## Past Features History

### Mobile View Redesign for Project Pockets Page (August 2026)
- Touch-first mobile card list with status badges, progress bars, available/target balance displays, quick action drawers, and mobile KPI banner.

### Mobile View Redesign for Recurring Page (August 2026)
- Touch-first mobile card list with due date urgency badges, active switch toggle, touch action drawer, sticky floating action button (FAB), and mobile KPI banner.

### Mobile View Redesign for Shopping Plan Pages (August 2026)
- Touch-first mobile card list with store icons, assignee badges, progress bar, sticky bottom bar, and mobile KPI banner.

### Mobile View Style for Transactions Page (August 2026)
- Dedicated touch-optimized mobile view (`d-md-none`) with mobile KPI banner, compact search chips, grouped date feed, and card touch drawers.
