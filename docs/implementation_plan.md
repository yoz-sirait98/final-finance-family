# Implementation Plan

## Mobile View Redesign for Recurring Page (August 2026)

### Problem Area & Target Architecture

| Feature Component | Current State (Desktop-Centric) | Target Mobile Architecture |
|---|---|---|
| **Layout Structure** | 6-column Bootstrap table requiring horizontal scrolling on small screens | Dual view: Desktop table (`d-none d-md-block`) + Mobile card feed (`d-md-none`) |
| **KPI & Metrics** | No header summary or commitment breakdown | Mobile KPI banner displaying Total Active Monthly Commitment, Active Count, and Due Soon Count |
| **Filtering & Search** | No inline search or interval filtering | Mobile search bar + Frequency filter chips (`All`, `Monthly`, `Weekly`, `Yearly`) + Status chips |
| **Card Design & Actions** | Tiny action buttons in table cell | Glassmorphism mobile cards with category avatar, member badge, urgency-colored due badge ("Hari Ini", "H-2"), inline active toggle switch, and expandable touch action drawer |
| **Quick Add Action** | Header button requires scrolling to top on long lists | Sticky Mobile Floating Action Button (FAB) at bottom right |

---

### Proposed Changes

#### Frontend — Recurring Page & CSS

##### `frontend/src/style.css`
- Add mobile Recurring component styles under `@media (max-width: 767.98px)`:
  - `.mobile-recurring-container`, `.mobile-recurring-kpi`, `.mobile-recurring-card`, `.recurring-icon-avatar`, `.due-badge`, `.mobile-fab-btn`.

##### `frontend/src/pages/RecurringPage.vue`
- Wrap existing desktop view in `<div class="d-none d-md-block">`.
- Add `<div class="mobile-recurring-container d-md-none">` containing:
  - Mobile header with title & create button.
  - Mobile KPI Summary banner (Total Active Monthly Commitment, Active Count, Due Soon Count).
  - Search bar + interval/status filter chips.
  - Mobile cards with category avatar, urgency due badges, member tag, inline active toggle, and action drawer.
  - Sticky Floating Action Button (FAB) for quick creation.

---

## Past Features History

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

### WhatsApp Checkout Notifications
- Added automatic WhatsApp notification dispatch when completing checkout in `ShoppingDetailPage.vue`.
