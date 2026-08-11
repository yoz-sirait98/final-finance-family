# Tasks Checklist: Mobile View Redesign for Project Pockets Page

- [x] **1. CSS & Styling System (`frontend/src/style.css`)**
  - [x] Add `@media (max-width: 767.98px)` styles for mobile Project Pockets.
  - [x] Implement `.mobile-pocket-container` layout with proper bottom padding.
  - [x] Implement glassmorphism mobile KPI summary banner (`.mobile-pocket-kpi`).
  - [x] Implement touch-first pocket cards (`.mobile-pocket-card`, `.pocket-icon-avatar`).
  - [x] Implement progress bar variations, pocket status pills, and linked account badges.
  - [x] Implement mobile search bar and filter chips styling (`.mobile-filter-chips`).

- [x] **2. Project Pockets Page (`frontend/src/pages/ProjectPocketsPage.vue`)**
  - [x] Wrap existing desktop view in `<div class="d-none d-md-block">`.
  - [x] Build touch-optimized mobile view container `<div class="mobile-pocket-container d-md-none">`.
  - [x] Add mobile KPI banner showing: Total Available Balance, Active Pockets Count, Funding Phase Count, and Total Pocket Expenses.
  - [x] Add mobile search input and status filter chips (`Semua`, `Aktif`, `Pendanaan`, `Selesai`).
  - [x] Implement touch cards with status badges, progress bars, available/target balance displays, and quick action drawers ("Catat Pengeluaran", "Daftar Pengeluaran", "Selesai").
  - [x] Ensure onboarding tour targets (`#tour-projects-header`, `#tour-projects-add-btn`) remain functional across desktop and mobile.

- [x] **3. Build & Verification**
  - [x] Run `npm run build` to verify clean compilation.
  - [x] Test mobile viewport responsiveness (< 768px) vs desktop view (>= 768px).
