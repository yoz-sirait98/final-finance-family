# Implementation Plan

## Mobile View Redesign for Project Pockets Page (August 2026)

### Problem Area & Target Architecture

Currently, on small mobile viewports (`< 768px`), `ProjectPocketsPage.vue` relies on generic Bootstrap column cards without dedicated mobile layout optimizations. This creates several UX limitations:
- **Lack of High-Level Summary**: Users cannot quickly see their total available balance across pockets, total spent, or how many pockets are active vs in funding phase.
- **No Search or Filter Capabilities**: Finding specific pockets requires scrolling through the entire list.
- **Card Spacing & Touch Ergonomics**: Action buttons inside card footers can feel cramped or hard to tap on smaller mobile screens.

| Feature Component | Current Desktop View | Target Mobile Architecture (`< 768px`) |
|---|---|---|
| **Layout Structure** | 3-column Bootstrap grid (`col-md-6 col-lg-4`) | Dual view: Desktop view (`d-none d-md-block`) + Mobile card feed (`d-md-none`) |
| **KPI & Metrics Banner** | Header text only | Glassmorphic Mobile KPI banner displaying: Total Available Pocket Balance, Active Pockets Count, Funding Phase Count, and Total Pocket Spent |
| **Search & Filtering** | None | Touch-friendly mobile search bar + Status filter chips (`Semua`, `Aktif`, `Pendanaan`, `Selesai`) |
| **Card Design & Touch Actions** | Standard card with bottom buttons | Touch-optimized glassmorphic card with gradient icon avatar, status badge (`Aktif` / `Pendanaan` / `Selesai`), bold financial numbers, custom progress bar, and touch action drawer |
| **Onboarding Compatibility** | Tour steps target header and add buttons | All tour element IDs (`#tour-projects-header`, `#tour-projects-add-btn`) preserved across viewports |

---

### Proposed Changes

#### Frontend Component & Styling

##### `frontend/src/style.css`
- Add `@media (max-width: 767.98px)` mobile pocket styling rules:
  - `.mobile-pocket-container`: Touch container with 85px bottom padding.
  - `.mobile-pocket-kpi`: Glassmorphic summary banner with blur backdrop, border highlight, and 4 KPI metrics.
  - `.mobile-filter-chips`: Horizontal scroll filter chips and mobile search bar.
  - `.mobile-pocket-card`: Touch-first card design with active feedback (`transform: scale(0.985)`), colorful pocket icon avatar, status pill badges, financial metrics, and progress meter.
  - `.pocket-icon-avatar`: Gradient icon box with briefcase/wallet theme.

##### `frontend/src/pages/ProjectPocketsPage.vue`
- Wrap existing desktop view in `<div class="d-none d-md-block">`.
- Create touch-optimized mobile view container `<div class="mobile-pocket-container d-md-none">`:
  - **Mobile Header**: Page title, subtitle, and link to Goals page.
  - **Mobile KPI Summary Banner**: Calculated totals for Available Balance, Active Pockets Count, Funding Phase Count, and Total Pocket Spent.
  - **Search Bar & Quick Filter Chips**:
    - Search by pocket name or linked account name.
    - Status chips: `Semua` (All), `Aktif` (Active / Ready to Spend), `Pendanaan` (Funding Phase), `Selesai` (Done).
  - **Mobile Touch Cards Feed**:
    - Pocket icon avatar, title, linked account badge, and status pill.
    - Prominent Available Balance (`Tersedia`), Target Amount, and Total Spent (`Terpakai`).
    - Visual progress bar.
    - Quick Action Buttons / Touch Drawer:
      - `Catat Pengeluaran` (Log Expense) for active pockets.
      - `Daftar Pengeluaran` (Expense List).
      - `Tandai Selesai` (Mark as Done).
  - **Empty State**: Friendly mobile empty state when search/filter returns no results or no pockets exist.
- Preserve driver.js tour IDs (`#tour-projects-header`, `#tour-projects-add-btn`) for tutorial compatibility.

---

## Past Features History

### Mobile View Redesign for Recurring Page (August 2026)
- Touch-first mobile card list with due date urgency badges, active switch toggle, touch action drawer, sticky floating action button (FAB), and mobile KPI banner.

### Mobile View Redesign for Shopping Plan Pages (August 2026)
- Touch-first mobile card list with store icons, assignee badges, progress bar, sticky bottom bar, and mobile KPI banner.

### Mobile View Style for Transactions Page (August 2026)
- Dedicated touch-optimized mobile view (`d-md-none`) with mobile KPI banner, compact search chips, grouped date feed, and card touch drawers.

### Auto-Create Shopping Plan from Transaction Receipt Scanning (August 2026)
- Consolidated scan entry point into Transactions Page.
- Linked transaction ID directly to auto-created shopping plan.

### Receipt Scanner Module — Full Rebuild (July 2026)
- Consolidated scanner logic into `useReceiptScanner` and `useScannerMapping` composables.
- Added adaptive binarization preprocessing and candidate-scoring date engine.
