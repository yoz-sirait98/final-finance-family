# Graph Report - .  (2026-06-09)

## Corpus Check
- 36 files · ~77,883 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 779 nodes · 1104 edges · 105 communities (73 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]

## God Nodes (most connected - your core abstractions)
1. `common` - 39 edges
2. `transactions` - 39 edges
3. `common` - 39 edges
4. `transactions` - 39 edges
5. `validation` - 28 edges
6. `validation` - 25 edges
7. `dashboard` - 24 edges
8. `dashboard` - 24 edges
9. `nav` - 21 edges
10. `shopping` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Serverless Migration (Laravel to Supabase)` --rationale_for--> `Supabase Backend`  [EXTRACTED]
  docs/implementation_plan.md → README.md
- `useDashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/composables/useDashboard.js → frontend/src/stores/auth.js
- `useTour()` --calls--> `useLocaleStore`  [EXTRACTED]
  frontend/src/composables/useTour.js → frontend/src/stores/locale.js
- `useTour()` --calls--> `useTourStore`  [EXTRACTED]
  frontend/src/composables/useTour.js → frontend/src/stores/tour.js
- `initializeRealtime()` --calls--> `useAccountStore`  [EXTRACTED]
  frontend/src/lib/realtime.js → frontend/src/stores/accounts.js

## Import Cycles
- None detected.

## Communities (105 total, 32 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (31): useDashboard(), initializeRealtime(), supabase, router, routes, accountService, authService, budgetService (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (35): done, next, prev, common, actions, active, all, amount (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (32): 1. Migrated System Architecture, 1. Translation System Core (Dependencies & Stores), 2. Feature Inventory, 2. UI Layout & Switcher Integration, 3. Business Rules Inventory, 3. Pages & Features Localization, 4. Dependencies Inventory, 4. Interactive Tours & Utilities (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (31): dependencies, bootstrap, bootstrap-icons, chart.js, driver.js, idb-keyval, jspdf, jspdf-autotable (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (28): transactions, addTransaction, allAccounts, allCategories, allMembers, alreadySpent, amountPlaceholder, budgetExceeded (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (29): login, register, success, createAccount, email, emailPlaceholder, failed, newHere (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (28): transactions, addTransaction, allAccounts, allCategories, allMembers, alreadySpent, amountPlaceholder, budgetExceeded (+20 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (14): bellDropdownRef, bellOpen, budgetAlerts, currentPageTitle, fetchPendingShopping(), handleShoppingUpdated(), langDropdownRef, langOpen (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (24): common, actions, active, all, back, cancel, cancelled, close (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (19): auth, categories, addCategory, color, editCategory, icon, subtitle, members (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (19): auth, login, register, success, createAccount, email, emailPlaceholder, failed (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): shopping, addedBy, addItem, bought, checkout, checkoutConfirm, checkoutSuccess, createPlan (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (17): shopping, addedBy, addItem, bought, checkout, checkoutConfirm, checkoutSuccess, createPlan (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (16): [MODIFY] `frontend/package.json`, [MODIFY] `frontend/src/router/index.js`, [MODIFY] `frontend/src/stores/*` & `frontend/src/services/*`, [NEW] `frontend/src/lib/supabase.js`, [NEW] `supabase/migrations/000001_core_schema.sql`, [NEW] `supabase/migrations/000002_rls_policies.sql`, [NEW] `supabase/migrations/000003_business_logic_triggers.sql`, [NEW] `supabase/migrations/000004_rpc_and_views.sql` (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.23
Nodes (16): balance, alerts, expense, income, transfer, insights, net, period (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (16): account, category, member, deadline, header, validation, recurring, addRecurring (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (15): balance, alerts, expense, income, transfer, insights, net, period (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.26
Nodes (14): months, monthsAbbr, 1, 10, 11, 12, 2, 3 (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.26
Nodes (14): months, monthsAbbr, 1, 10, 11, 12, 2, 3 (+6 more)

### Community 19 - "Community 19"
Cohesion: 0.23
Nodes (7): useTour(), app, localeStore, pinia, useLocaleStore, useTourStore, queryClient

### Community 20 - "Community 20"
Cohesion: 0.15
Nodes (13): dashboard, expenseByCategory, expenseTrend, incomeVsExpense, insightsNew, monthlyExpense, monthlyIncome, monthlyNet (+5 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (13): dashboard, expenseByCategory, expenseTrend, incomeVsExpense, insightsNew, monthlyExpense, monthlyIncome, monthlyNet (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (12): account, amount, category, member, name, role, validation, dates (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (9): container, containerHeight, offsetY, props, scrollTop, startIndex, totalHeight, visibleCount (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (11): budgets, addBudget, alertThreshold, alertThresholdPlaceholder, editBudget, limit, limitPlaceholder, remaining (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (11): goals, addGoal, completedManuallyError, currentAmount, deadline, editGoal, linkedAccount, linkedAccountInfo (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (11): confirmPassword, settings, changePassword, currentPassword, languagePref, newPassword, passwordSuccess, profile (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (11): budgets, addBudget, alertThreshold, alertThresholdPlaceholder, editBudget, limit, limitPlaceholder, remaining (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.20
Nodes (9): Aplikasi Web Frontend Family Finance, Catatan Arsitektur & Desain, Eksport Laporan Client-Side, Global State (Pinia), Integritas Sistem & Visual Guardrail, Notifikasi Toast Real-Time, Penanganan Event Native Vue, Setup Pengembangan Lokal (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (9): header, reports, endDate, exportCsv, exportPdf, generating, startDate, tours (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.20
Nodes (10): goals, addGoal, completedManuallyError, currentAmount, editGoal, linkedAccount, linkedAccountInfo, selectAccount (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (8): Langkah 1: Persiapan Project Supabase, Langkah 2: Setup Database & Migrasi, Langkah 3: Konfigurasi Frontend (Environment Variables), Langkah 4: Menjalankan Aplikasi, Opsi A: Menggunakan Supabase CLI (Direkomendasikan), Opsi B: Eksekusi Manual via Dashboard, Panduan Konfigurasi & Integrasi Supabase, Prasyarat

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (9): monthly, weekly, yearly, recurring, addRecurring, editRecurring, interval, intervals (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (9): nav, analytics, brand, budgetAlerts, logout, main, management, noAlerts (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (8): accounts, accountName, accountNamePlaceholder, addAccount, balancePlaceholder, editAccount, walletDetails, add

### Community 35 - "Community 35"
Cohesion: 0.39
Nodes (7): categories, addCategory, color, editCategory, icon, subtitle, useCategoryStore

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (8): reports, endDate, exportCsv, exportPdf, generating, startDate, tours, progress

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): 1. Installation of Dependencies, 2. Antigravity Skill Registration, How To Use It, Verification, Walkthrough: AI Assistant Graphify Integration, What Was Done

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (7): members, addMember, editMember, roles, child, father, mother

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (7): accounts, accountName, accountNamePlaceholder, addAccount, balancePlaceholder, editAccount, walletDetails

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (5): Family Finance Migration & Integration Tasks, Part 1 — Supabase Migration Tasks, Part 2 — Indonesian Language Mode Tasks, Part 3 — Reports Page Filtering Fix, Part 4 — AI Assistant Graphify Integration

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 43 - "Community 43"
Cohesion: 0.70
Nodes (4): extractNumber(), parseReceiptText(), preprocessImage(), scanReceipt()

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (4): Serverless Migration (Laravel to Supabase), Vue 3 Frontend, Sistem Manajemen Keuangan Keluarga, Supabase Backend

### Community 45 - "Community 45"
Cohesion: 0.50
Nodes (4): done, next, prev, btn

### Community 46 - "Community 46"
Cohesion: 0.50
Nodes (4): type, bank, cash, e_wallet

### Community 47 - "Community 47"
Cohesion: 0.50
Nodes (4): monthly, weekly, yearly, intervals

### Community 48 - "Community 48"
Cohesion: 0.50
Nodes (4): roles, child, father, mother

## Knowledge Gaps
- **439 isolated node(s):** `recommendations`, `name`, `private`, `version`, `type` (+434 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `common` connect `Community 1` to `Community 9`, `Community 5`, `Community 14`, `Community 15`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `common` connect `Community 8` to `Community 34`, `Community 10`, `Community 45`, `Community 46`, `Community 16`, `Community 22`, `Community 29`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `transactions` connect `Community 6` to `Community 36`, `Community 9`, `Community 14`, `Community 15`, `Community 30`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `recommendations`, `name`, `private` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07966457023060797 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07007575757575757 - nodes in this community are weakly interconnected._