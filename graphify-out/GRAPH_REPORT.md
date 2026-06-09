# Graph Report - final-finance-family  (2026-06-09)

## Corpus Check
- 93 files · ~78,282 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1064 nodes · 1503 edges · 122 communities (89 shown, 33 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9165d5b6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Common UI Actions|Common UI Actions]]
- [[_COMMUNITY_Common UI Actions|Common UI Actions]]
- [[_COMMUNITY_Core Services and Routing|Core Services and Routing]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Authentication Forms|Authentication Forms]]
- [[_COMMUNITY_Authentication Forms|Authentication Forms]]
- [[_COMMUNITY_Transaction and Budget Logic|Transaction and Budget Logic]]
- [[_COMMUNITY_Transaction Management|Transaction Management]]
- [[_COMMUNITY_Dashboard Layout Components|Dashboard Layout Components]]
- [[_COMMUNITY_Navigation and Management|Navigation and Management]]
- [[_COMMUNITY_Account and Recurring Management|Account and Recurring Management]]
- [[_COMMUNITY_Account and Recurring Management|Account and Recurring Management]]
- [[_COMMUNITY_Project Documentation and Screenshots|Project Documentation and Screenshots]]
- [[_COMMUNITY_Financial Insights and Charts|Financial Insights and Charts]]
- [[_COMMUNITY_Month Labels|Month Labels]]
- [[_COMMUNITY_Financial Data Export|Financial Data Export]]
- [[_COMMUNITY_Month Labels|Month Labels]]
- [[_COMMUNITY_Dashboard Analytics Metrics|Dashboard Analytics Metrics]]
- [[_COMMUNITY_Dashboard Analytics Metrics|Dashboard Analytics Metrics]]
- [[_COMMUNITY_State and Tour Management|State and Tour Management]]
- [[_COMMUNITY_Virtual Scroll Component|Virtual Scroll Component]]
- [[_COMMUNITY_Budget Limits and Alerts|Budget Limits and Alerts]]
- [[_COMMUNITY_Indonesian Localization|Indonesian Localization]]
- [[_COMMUNITY_Budget Limits and Alerts|Budget Limits and Alerts]]
- [[_COMMUNITY_Savings Goals Management|Savings Goals Management]]
- [[_COMMUNITY_Savings Goals Management|Savings Goals Management]]
- [[_COMMUNITY_Navigation and Sidebar|Navigation and Sidebar]]
- [[_COMMUNITY_Supabase Skill Configuration|Supabase Skill Configuration]]
- [[_COMMUNITY_Report Generation and Export|Report Generation and Export]]
- [[_COMMUNITY_Report Generation and Export|Report Generation and Export]]
- [[_COMMUNITY_Social Media Icons|Social Media Icons]]
- [[_COMMUNITY_Supabase Project Metadata|Supabase Project Metadata]]
- [[_COMMUNITY_Supabase Project Metadata|Supabase Project Metadata]]
- [[_COMMUNITY_Time Intervals|Time Intervals]]
- [[_COMMUNITY_Family Member Roles|Family Member Roles]]
- [[_COMMUNITY_Time Intervals|Time Intervals]]
- [[_COMMUNITY_Family Member Roles|Family Member Roles]]
- [[_COMMUNITY_Date Formatting Utilities|Date Formatting Utilities]]
- [[_COMMUNITY_Currency Formatting Utilities|Currency Formatting Utilities]]
- [[_COMMUNITY_Database Backup Script|Database Backup Script]]
- [[_COMMUNITY_UI Assets and Icons|UI Assets and Icons]]
- [[_COMMUNITY_Accounts Page View|Accounts Page View]]
- [[_COMMUNITY_Budgets Page View|Budgets Page View]]
- [[_COMMUNITY_Members Page View|Members Page View]]
- [[_COMMUNITY_Reports Page View|Reports Page View]]
- [[_COMMUNITY_Transactions Page View|Transactions Page View]]
- [[_COMMUNITY_Toast Notification Store|Toast Notification Store]]
- [[_COMMUNITY_Budget Tour Steps|Budget Tour Steps]]
- [[_COMMUNITY_Dashboard Tour Steps|Dashboard Tour Steps]]
- [[_COMMUNITY_Goal Notification Modal|Goal Notification Modal]]
- [[_COMMUNITY_Hello World Component|Hello World Component]]
- [[_COMMUNITY_Bootstrap Integration|Bootstrap Integration]]
- [[_COMMUNITY_Frontend Entry Point|Frontend Entry Point]]
- [[_COMMUNITY_Vite Configuration|Vite Configuration]]
- [[_COMMUNITY_Indonesian Language Integration|Indonesian Language Integration]]
- [[_COMMUNITY_Categories Page View|Categories Page View]]
- [[_COMMUNITY_Goals Page View|Goals Page View]]
- [[_COMMUNITY_Registration Page View|Registration Page View]]
- [[_COMMUNITY_Settings Page View|Settings Page View]]
- [[_COMMUNITY_Accounts Tour Steps|Accounts Tour Steps]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_Vue Logo Asset|Vue Logo Asset]]
- [[_COMMUNITY_Graphify Integration Guide|Graphify Integration Guide]]
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
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]

## God Nodes (most connected - your core abstractions)
1. `common` - 43 edges
2. `transactions` - 43 edges
3. `common` - 43 edges
4. `transactions` - 43 edges
5. `nav` - 31 edges
6. `validation` - 30 edges
7. `nav` - 29 edges
8. `validation` - 27 edges
9. `register` - 26 edges
10. `register` - 26 edges

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

## Communities (122 total, 33 thin omitted)

### Community 0 - "Common UI Actions"
Cohesion: 0.08
Nodes (31): useDashboard(), initializeRealtime(), supabase, router, routes, accountService, authService, budgetService (+23 more)

### Community 1 - "Common UI Actions"
Cohesion: 0.07
Nodes (28): common, actions, active, add, all, back, cancel, cancelled (+20 more)

### Community 2 - "Core Services and Routing"
Cohesion: 0.06
Nodes (40): 1. Migrated System Architecture, 1. Translation System Core (Dependencies & Stores), 2. Feature Inventory, 2. UI Layout & Switcher Integration, 3. Business Rules Inventory, 3. Pages & Features Localization, 4. Dependencies Inventory, 4. Interactive Tours & Utilities (+32 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.06
Nodes (31): dependencies, bootstrap, bootstrap-icons, chart.js, driver.js, idb-keyval, jspdf, jspdf-autotable (+23 more)

### Community 4 - "Authentication Forms"
Cohesion: 0.11
Nodes (31): transactions, addTransaction, allAccounts, allCategories, allMembers, alreadySpent, amountPlaceholder, budgetExceeded (+23 more)

### Community 5 - "Authentication Forms"
Cohesion: 0.14
Nodes (14): confirmPassword, settings, changePassword, confirmPassword, currentPassword, languagePref, newPassword, passwordSuccess (+6 more)

### Community 6 - "Transaction and Budget Logic"
Cohesion: 0.05
Nodes (43): validation, validation, transactions, addTransaction, allAccounts, allCategories, allMembers, alreadySpent (+35 more)

### Community 7 - "Transaction Management"
Cohesion: 0.08
Nodes (14): bellDropdownRef, bellOpen, budgetAlerts, currentPageTitle, fetchPendingShopping(), handleShoppingUpdated(), langDropdownRef, langOpen (+6 more)

### Community 8 - "Dashboard Layout Components"
Cohesion: 0.07
Nodes (28): common, actions, active, add, all, back, cancel, cancelled (+20 more)

### Community 9 - "Navigation and Management"
Cohesion: 0.11
Nodes (19): nav, accounts, analytics, brand, budgetAlerts, budgets, categories, dashboard (+11 more)

### Community 10 - "Account and Recurring Management"
Cohesion: 0.08
Nodes (29): auth, login, register, success, createAccount, email, emailPlaceholder, failed (+21 more)

### Community 11 - "Account and Recurring Management"
Cohesion: 0.08
Nodes (27): validation, validation, validation, shopping, addedBy, addItem, bought, checkout (+19 more)

### Community 12 - "Project Documentation and Screenshots"
Cohesion: 0.10
Nodes (20): shopping, addedBy, addItem, bought, checkout, checkoutConfirm, checkoutSuccess, createPlan (+12 more)

### Community 13 - "Financial Insights and Charts"
Cohesion: 0.12
Nodes (16): [MODIFY] `frontend/package.json`, [MODIFY] `frontend/src/router/index.js`, [MODIFY] `frontend/src/stores/*` & `frontend/src/services/*`, [NEW] `frontend/src/lib/supabase.js`, [NEW] `supabase/migrations/000001_core_schema.sql`, [NEW] `supabase/migrations/000002_rls_policies.sql`, [NEW] `supabase/migrations/000003_business_logic_triggers.sql`, [NEW] `supabase/migrations/000004_rpc_and_views.sql` (+8 more)

### Community 14 - "Month Labels"
Cohesion: 0.15
Nodes (19): balance, description, title, alerts, expense, income, transfer, insights (+11 more)

### Community 15 - "Financial Data Export"
Cohesion: 0.18
Nodes (12): account, amount, category, member, name, role, validation, validation (+4 more)

### Community 16 - "Month Labels"
Cohesion: 0.22
Nodes (9): accounts, accountName, accountNamePlaceholder, addAccount, balancePlaceholder, editAccount, subtitle, title (+1 more)

### Community 17 - "Dashboard Analytics Metrics"
Cohesion: 0.11
Nodes (26): months, monthsAbbr, 1, 10, 11, 12, 2, 3 (+18 more)

### Community 18 - "Dashboard Analytics Metrics"
Cohesion: 0.11
Nodes (26): months, monthsAbbr, 1, 10, 11, 12, 2, 3 (+18 more)

### Community 19 - "State and Tour Management"
Cohesion: 0.23
Nodes (7): useTour(), app, localeStore, pinia, useLocaleStore, useTourStore, queryClient

### Community 20 - "Virtual Scroll Component"
Cohesion: 0.15
Nodes (13): dashboard, expenseByCategory, expenseTrend, incomeVsExpense, insightsNew, monthlyExpense, monthlyIncome, monthlyNet (+5 more)

### Community 21 - "Budget Limits and Alerts"
Cohesion: 0.15
Nodes (13): dashboard, expenseByCategory, expenseTrend, incomeVsExpense, insightsNew, monthlyExpense, monthlyIncome, monthlyNet (+5 more)

### Community 22 - "Indonesian Localization"
Cohesion: 0.18
Nodes (12): account, amount, category, member, name, role, validation, validation (+4 more)

### Community 23 - "Budget Limits and Alerts"
Cohesion: 0.18
Nodes (9): container, containerHeight, offsetY, props, scrollTop, startIndex, totalHeight, visibleCount (+1 more)

### Community 24 - "Savings Goals Management"
Cohesion: 0.15
Nodes (13): budgets, addBudget, alertThreshold, alertThresholdPlaceholder, editBudget, limit, limitPlaceholder, remaining (+5 more)

### Community 25 - "Savings Goals Management"
Cohesion: 0.15
Nodes (13): goals, addGoal, completedManuallyError, currentAmount, deadline, editGoal, linkedAccount, linkedAccountInfo (+5 more)

### Community 26 - "Navigation and Sidebar"
Cohesion: 0.14
Nodes (14): confirmPassword, settings, changePassword, confirmPassword, currentPassword, languagePref, newPassword, passwordSuccess (+6 more)

### Community 27 - "Supabase Skill Configuration"
Cohesion: 0.15
Nodes (13): budgets, addBudget, alertThreshold, alertThresholdPlaceholder, editBudget, limit, limitPlaceholder, remaining (+5 more)

### Community 28 - "Report Generation and Export"
Cohesion: 0.20
Nodes (9): Aplikasi Web Frontend Family Finance, Catatan Arsitektur & Desain, Eksport Laporan Client-Side, Global State (Pinia), Integritas Sistem & Visual Guardrail, Notifikasi Toast Real-Time, Penanganan Event Native Vue, Setup Pengembangan Lokal (+1 more)

### Community 29 - "Report Generation and Export"
Cohesion: 0.14
Nodes (16): description, title, charts, description, title, reports, charts, endDate (+8 more)

### Community 30 - "Social Media Icons"
Cohesion: 0.15
Nodes (13): goals, addGoal, completedManuallyError, currentAmount, deadline, editGoal, linkedAccount, linkedAccountInfo (+5 more)

### Community 31 - "Supabase Project Metadata"
Cohesion: 0.22
Nodes (8): Langkah 1: Persiapan Project Supabase, Langkah 2: Setup Database & Migrasi, Langkah 3: Konfigurasi Frontend (Environment Variables), Langkah 4: Menjalankan Aplikasi, Opsi A: Menggunakan Supabase CLI (Direkomendasikan), Opsi B: Eksekusi Manual via Dashboard, Panduan Konfigurasi & Integrasi Supabase, Prasyarat

### Community 32 - "Supabase Project Metadata"
Cohesion: 0.18
Nodes (11): monthly, weekly, yearly, recurring, addRecurring, editRecurring, interval, intervals (+3 more)

### Community 33 - "Time Intervals"
Cohesion: 0.11
Nodes (19): nav, accounts, analytics, brand, budgetAlerts, budgets, categories, dashboard (+11 more)

### Community 34 - "Family Member Roles"
Cohesion: 0.16
Nodes (22): add, header, description, title, add, header, add, header (+14 more)

### Community 35 - "Time Intervals"
Cohesion: 0.27
Nodes (9): categories, addCategory, color, editCategory, icon, subtitle, title, subtitle (+1 more)

### Community 36 - "Family Member Roles"
Cohesion: 0.12
Nodes (20): description, title, charts, description, title, description, title, reports (+12 more)

### Community 37 - "Date Formatting Utilities"
Cohesion: 0.29
Nodes (6): 1. Installation of Dependencies, 2. Antigravity Skill Registration, How To Use It, Verification, Walkthrough: AI Assistant Graphify Integration, What Was Done

### Community 38 - "Currency Formatting Utilities"
Cohesion: 0.22
Nodes (9): members, addMember, editMember, roles, subtitle, title, child, father (+1 more)

### Community 39 - "Database Backup Script"
Cohesion: 0.18
Nodes (14): accounts, accountName, accountNamePlaceholder, addAccount, balancePlaceholder, editAccount, subtitle, title (+6 more)

### Community 40 - "UI Assets and Icons"
Cohesion: 0.33
Nodes (5): Family Finance Migration & Integration Tasks, Part 1 — Supabase Migration Tasks, Part 2 — Indonesian Language Mode Tasks, Part 3 — Reports Page Filtering Fix, Part 4 — AI Assistant Graphify Integration

### Community 41 - "Accounts Page View"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 42 - "Budgets Page View"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 43 - "Members Page View"
Cohesion: 0.70
Nodes (4): extractNumber(), parseReceiptText(), preprocessImage(), scanReceipt()

### Community 44 - "Reports Page View"
Cohesion: 0.67
Nodes (4): Serverless Migration (Laravel to Supabase), Vue 3 Frontend, Sistem Manajemen Keuangan Keluarga, Supabase Backend

### Community 45 - "Transactions Page View"
Cohesion: 0.50
Nodes (4): done, next, prev, btn

### Community 46 - "Toast Notification Store"
Cohesion: 0.60
Nodes (5): type, type, bank, cash, e_wallet

### Community 47 - "Budget Tour Steps"
Cohesion: 0.18
Nodes (11): monthly, weekly, yearly, recurring, addRecurring, editRecurring, interval, intervals (+3 more)

### Community 48 - "Dashboard Tour Steps"
Cohesion: 0.20
Nodes (10): subtitle, members, addMember, editMember, roles, subtitle, title, child (+2 more)

### Community 105 - "Community 105"
Cohesion: 0.18
Nodes (18): add, list, description, title, add, list, list, description (+10 more)

### Community 106 - "Community 106"
Cohesion: 0.12
Nodes (17): register, success, alreadyHaveAccount, confirmPasswordPlaceholder, createAccount, creatingAccount, email, emailPlaceholder (+9 more)

### Community 107 - "Community 107"
Cohesion: 0.15
Nodes (13): description, title, balance, expense, income, period, description, title (+5 more)

### Community 108 - "Community 108"
Cohesion: 0.21
Nodes (12): validation, validation, validation, account, amount, category, interval, limit (+4 more)

### Community 109 - "Community 109"
Cohesion: 0.18
Nodes (11): login, createAccount, email, emailPlaceholder, failed, newHere, password, passwordPlaceholder (+3 more)

### Community 110 - "Community 110"
Cohesion: 0.20
Nodes (10): description, title, balance, expense, income, description, title, description (+2 more)

### Community 111 - "Community 111"
Cohesion: 0.29
Nodes (8): description, title, filters, transactions, filters, transfer, description, title

### Community 112 - "Community 112"
Cohesion: 0.22
Nodes (8): auth, categories, addCategory, color, editCategory, icon, subtitle, title

### Community 113 - "Community 113"
Cohesion: 0.33
Nodes (7): validation, validation, validation, validation, name, role, type

### Community 114 - "Community 114"
Cohesion: 0.53
Nodes (6): list, list, list, description, title, list

### Community 115 - "Community 115"
Cohesion: 0.50
Nodes (4): done, next, prev, btn

### Community 116 - "Community 116"
Cohesion: 0.50
Nodes (3): Answer, Q: recurring, Source Nodes

### Community 117 - "Community 117"
Cohesion: 0.50
Nodes (3): Answer, Q: Explain recurringService.js, Source Nodes

### Community 118 - "Community 118"
Cohesion: 0.50
Nodes (3): Answer, Q: Explain shopping, Source Nodes

### Community 119 - "Community 119"
Cohesion: 0.67
Nodes (3): transfer, description, title

### Community 120 - "Community 120"
Cohesion: 0.18
Nodes (17): balance, description, title, alerts, expense, income, transfer, insights (+9 more)

### Community 121 - "Community 121"
Cohesion: 0.43
Nodes (8): header, header, header, description, title, header, header, header

## Knowledge Gaps
- **599 isolated node(s):** `recommendations`, `name`, `private`, `version`, `type` (+594 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dashboard` connect `Virtual Scroll Component` to `Time Intervals`, `Time Intervals`, `Community 105`, `Community 107`, `Dashboard Analytics Metrics`, `Community 120`, `Report Generation and Export`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `common` connect `Common UI Actions` to `Family Member Roles`, `Database Backup Script`, `Community 106`, `Month Labels`, `Financial Data Export`, `Community 112`, `Community 115`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `tours` connect `Community 105` to `Supabase Project Metadata`, `Time Intervals`, `Authentication Forms`, `Community 107`, `Transactions Page View`, `Community 111`, `Month Labels`, `Virtual Scroll Component`, `Savings Goals Management`, `Savings Goals Management`, `Report Generation and Export`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `recommendations`, `name`, `private` to the rest of the system?**
  _602 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Common UI Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07966457023060797 - nodes in this community are weakly interconnected._
- **Should `Common UI Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Core Services and Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.05853658536585366 - nodes in this community are weakly interconnected._