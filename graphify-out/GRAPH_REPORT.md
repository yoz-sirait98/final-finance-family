# Graph Report - redesign-ui-supabase-stack  (2026-06-11)

## Corpus Check
- 110 files · ~93,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1144 nodes · 1588 edges · 133 communities (97 shown, 36 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc7c7db6`
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
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Supabase Skill Configuration|Supabase Skill Configuration]]
- [[_COMMUNITY_Report Generation and Export|Report Generation and Export]]
- [[_COMMUNITY_Report Generation and Export|Report Generation and Export]]
- [[_COMMUNITY_Social Media Icons|Social Media Icons]]
- [[_COMMUNITY_Supabase Project Metadata|Supabase Project Metadata]]
- [[_COMMUNITY_Supabase Project Metadata|Supabase Project Metadata]]
- [[_COMMUNITY_Time Intervals|Time Intervals]]
- [[_COMMUNITY_Family Member Roles|Family Member Roles]]
- [[_COMMUNITY_Community 35|Community 35]]
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
- [[_COMMUNITY_Community 46|Community 46]]
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
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 129|Community 129]]
- [[_COMMUNITY_Community 131|Community 131]]
- [[_COMMUNITY_Community 132|Community 132]]
- [[_COMMUNITY_Community 134|Community 134]]
- [[_COMMUNITY_Community 136|Community 136]]
- [[_COMMUNITY_Community 137|Community 137]]

## God Nodes (most connected - your core abstractions)
1. `common` - 44 edges
2. `common` - 44 edges
3. `transactions` - 43 edges
4. `transactions` - 43 edges
5. `nav` - 34 edges
6. `nav` - 32 edges
7. `validation` - 30 edges
8. `validation` - 27 edges
9. `register` - 26 edges
10. `register` - 26 edges

## Surprising Connections (you probably didn't know these)
- `useDashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/composables/useDashboard.js → frontend/src/stores/auth.js
- `useTour()` --calls--> `useLocaleStore`  [EXTRACTED]
  frontend/src/composables/useTour.js → frontend/src/stores/locale.js
- `useTour()` --calls--> `useTourStore`  [EXTRACTED]
  frontend/src/composables/useTour.js → frontend/src/stores/tour.js
- `initializeRealtime()` --calls--> `useAccountStore`  [EXTRACTED]
  frontend/src/lib/realtime.js → frontend/src/stores/accounts.js
- `initializeRealtime()` --calls--> `useBudgetStore`  [EXTRACTED]
  frontend/src/lib/realtime.js → frontend/src/stores/budgets.js

## Import Cycles
- None detected.

## Communities (133 total, 36 thin omitted)

### Community 0 - "Common UI Actions"
Cohesion: 0.08
Nodes (33): useDashboard(), initializeRealtime(), supabase, router, routes, accountService, aiService, authService (+25 more)

### Community 1 - "Common UI Actions"
Cohesion: 0.07
Nodes (30): common, actions, active, add, all, back, cancel, cancelled (+22 more)

### Community 2 - "Core Services and Routing"
Cohesion: 0.18
Nodes (13): Dependencies, Frontend, Frontend App, Manual Verification, [MODIFY] [package.json](file:///c:/Projects/final-finance-family/frontend/package.json), [MODIFY] [TransactionsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/TransactionsPage.vue), [NEW] [receiptScanner.js](file:///c:/Projects/final-finance-family/frontend/src/utils/receiptScanner.js), OCR Receipt Scanner (+5 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.06
Nodes (31): dependencies, bootstrap, bootstrap-icons, chart.js, driver.js, idb-keyval, jspdf, jspdf-autotable (+23 more)

### Community 4 - "Authentication Forms"
Cohesion: 0.10
Nodes (35): selectAccount, description, title, transactions, addTransaction, allAccounts, allCategories, allMembers (+27 more)

### Community 5 - "Authentication Forms"
Cohesion: 0.12
Nodes (16): confirmPassword, settings, aiConfig, changePassword, confirmPassword, currentPassword, geminiApiKey, languagePref (+8 more)

### Community 6 - "Transaction and Budget Logic"
Cohesion: 0.05
Nodes (43): validation, validation, transactions, addTransaction, allAccounts, allCategories, allMembers, alreadySpent (+35 more)

### Community 8 - "Dashboard Layout Components"
Cohesion: 0.07
Nodes (29): common, actions, active, add, all, back, cancel, cancelled (+21 more)

### Community 9 - "Navigation and Management"
Cohesion: 0.06
Nodes (33): members, addMember, editMember, roles, subtitle, title, validation, nav (+25 more)

### Community 10 - "Account and Recurring Management"
Cohesion: 0.08
Nodes (28): login, register, success, createAccount, email, emailPlaceholder, failed, newHere (+20 more)

### Community 11 - "Account and Recurring Management"
Cohesion: 0.06
Nodes (39): validation, validation, validation, validation, validation, shopping, addedBy, addItem (+31 more)

### Community 12 - "Project Documentation and Screenshots"
Cohesion: 0.10
Nodes (20): shopping, addedBy, addItem, bought, checkout, checkoutConfirm, checkoutSuccess, createPlan (+12 more)

### Community 13 - "Financial Insights and Charts"
Cohesion: 0.12
Nodes (16): [MODIFY] `frontend/package.json`, [MODIFY] `frontend/src/router/index.js`, [MODIFY] `frontend/src/stores/*` & `frontend/src/services/*`, [NEW] `frontend/src/lib/supabase.js`, [NEW] `supabase/migrations/000001_core_schema.sql`, [NEW] `supabase/migrations/000002_rls_policies.sql`, [NEW] `supabase/migrations/000003_business_logic_triggers.sql`, [NEW] `supabase/migrations/000004_rpc_and_views.sql` (+8 more)

### Community 14 - "Month Labels"
Cohesion: 0.20
Nodes (10): 1. Migrated System Architecture, 2. Feature Inventory, 3. Business Rules Inventory, 4. Dependencies Inventory, 5. Risks, 6. Migration Complexity Assessment, Part 1 â€” Family Finance Architecture Migration: Laravel to Supabase (Completed), Phase 1 â€” Project Discovery Report (+2 more)

### Community 15 - "Financial Data Export"
Cohesion: 0.15
Nodes (13): description, title, balance, expense, income, period, description, title (+5 more)

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
Cohesion: 0.18
Nodes (12): validation, categories, addCategory, color, editCategory, icon, subtitle, title (+4 more)

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
Cohesion: 0.17
Nodes (12): goals, addGoal, completedManuallyError, currentAmount, deadline, editGoal, linkedAccount, linkedAccountInfo (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (14): add, list, description, title, add, list, list, description (+6 more)

### Community 27 - "Supabase Skill Configuration"
Cohesion: 0.15
Nodes (13): budgets, addBudget, alertThreshold, alertThresholdPlaceholder, editBudget, limit, limitPlaceholder, remaining (+5 more)

### Community 28 - "Report Generation and Export"
Cohesion: 0.17
Nodes (11): Aplikasi Web Frontend Family Finance, Asisten Keuangan AI & Sinkronisasi API Key (Gemini & Supabase), Catatan Arsitektur & Desain, Eksport Laporan Client-Side, Global State (Pinia), Integritas Sistem & Visual Guardrail, Notifikasi Toast Real-Time, Penanganan Event Native Vue (+3 more)

### Community 29 - "Report Generation and Export"
Cohesion: 0.14
Nodes (15): description, title, charts, description, title, reports, charts, endDate (+7 more)

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
Cohesion: 0.09
Nodes (22): nav, accounts, aiadvisor, analytics, brand, budgetAlerts, budgets, calendar (+14 more)

### Community 34 - "Family Member Roles"
Cohesion: 0.18
Nodes (18): add, list, description, title, add, list, list, description (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (8): Automated / Database Verification, Automated Tests, Goal: Collaborative Shopping & Shared Bills, Manual Verification, Manual Verification, Open Questions, Verification Plan, Verification Plan

### Community 36 - "Family Member Roles"
Cohesion: 0.12
Nodes (20): description, title, charts, description, title, description, title, reports (+12 more)

### Community 37 - "Date Formatting Utilities"
Cohesion: 0.29
Nodes (6): 1. Installation of Dependencies, 2. Antigravity Skill Registration, How To Use It, Verification, Walkthrough: AI Assistant Graphify Integration, What Was Done

### Community 38 - "Currency Formatting Utilities"
Cohesion: 0.20
Nodes (10): subtitle, members, addMember, editMember, roles, subtitle, title, child (+2 more)

### Community 39 - "Database Backup Script"
Cohesion: 0.15
Nodes (13): description, title, balance, expense, income, insights, description, title (+5 more)

### Community 40 - "UI Assets and Icons"
Cohesion: 0.17
Nodes (11): Family Finance Migration & Integration Tasks, Part 10 — Feature Description Accuracy Correction, Part 1 — Supabase Migration Tasks, Part 2 — Indonesian Language Mode Tasks, Part 3 — Reports Page Filtering Fix, Part 4 — AI Assistant Graphify Integration, Part 5 — Modular Agent Rules and Knowledge Reorganization, Part 6 — Offline OCR Receipt Scanner & AI Financial Coach (+3 more)

### Community 41 - "Accounts Page View"
Cohesion: 0.18
Nodes (10): 1. Offline Receipt OCR Parser (`receiptScanner.js`), 1. Production Build Successful, 2. AST Knowledge Graph Update, 2. Scanner Page Integration (`TransactionsPage.vue`), 3. API Key Configuration (`SettingsPage.vue`), 4. Chat Coach Page (`AiPage.vue` & `aiService.js`), Features Implemented, How to Test Manually (+2 more)

### Community 42 - "Budgets Page View"
Cohesion: 0.25
Nodes (8): Automated Tests, Frontend Services & Stores, Implementation Details, Manual Verification, Part 7 — Cross-Device Gemini API Key Syncing (Completed), Proposed Changes, Supabase Database Migration, Verification Plan

### Community 43 - "Members Page View"
Cohesion: 0.53
Nodes (5): cleanLineOfDatesAndTimes(), extractNumbers(), fuzzyMonths, parseDate(), scanReceipt()

### Community 45 - "Transactions Page View"
Cohesion: 0.60
Nodes (5): type, type, bank, cash, e_wallet

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (12): account, amount, category, member, name, role, validation, validation (+4 more)

### Community 47 - "Budget Tour Steps"
Cohesion: 0.18
Nodes (11): monthly, weekly, yearly, recurring, addRecurring, editRecurring, interval, intervals (+3 more)

### Community 105 - "Community 105"
Cohesion: 0.20
Nodes (16): balance, description, title, alerts, expense, income, transfer, net (+8 more)

### Community 106 - "Community 106"
Cohesion: 0.05
Nodes (45): auth, login, register, createAccount, email, emailPlaceholder, failed, newHere (+37 more)

### Community 107 - "Community 107"
Cohesion: 0.33
Nodes (5): ai, subtitle, title, welcome, auth

### Community 108 - "Community 108"
Cohesion: 0.15
Nodes (13): dashboard, expenseByCategory, expenseTrend, incomeVsExpense, insightsNew, monthlyExpense, monthlyIncome, monthlyNet (+5 more)

### Community 110 - "Community 110"
Cohesion: 0.18
Nodes (17): balance, description, title, alerts, expense, income, transfer, insights (+9 more)

### Community 111 - "Community 111"
Cohesion: 0.24
Nodes (12): header, header, header, description, title, header, header, transactions (+4 more)

### Community 112 - "Community 112"
Cohesion: 0.18
Nodes (10): 1. Build Compilation, 1. Database Schema Update (`000021_add_gemini_api_key_to_families.sql`), 2. Auto-Hydration on Login (`auth.js` Pinia Store), 2. How to Verify Manually, 3. Settings Page Sync (`SettingsPage.vue`), Features Implemented, Step A: Apply Migration, Step B: Test Syncing (+2 more)

### Community 113 - "Community 113"
Cohesion: 0.67
Nodes (4): description, title, filters, filters

### Community 114 - "Community 114"
Cohesion: 0.33
Nodes (6): 1. Modular Rules Under `.agents/rules/`, 2. Root `.cursorrules` Reorganization, Implementation Details, Manual Verification, Part 5 — Modular Agent Rules and Knowledge Base Rearrangement (Completed), Verification Plan

### Community 115 - "Community 115"
Cohesion: 0.25
Nodes (8): 1. Translation System Core (Dependencies & Stores), 2. UI Layout & Switcher Integration, 3. Pages & Features Localization, 4. Interactive Tours & Utilities, Implementation Details, Manual Verification, Part 2 â€” Indonesian Language Mode Integration (Completed), Verification Plan

### Community 116 - "Community 116"
Cohesion: 0.50
Nodes (3): Answer, Q: recurring, Source Nodes

### Community 117 - "Community 117"
Cohesion: 0.50
Nodes (3): Answer, Q: Explain recurringService.js, Source Nodes

### Community 118 - "Community 118"
Cohesion: 0.50
Nodes (3): Answer, Q: Explain shopping, Source Nodes

### Community 120 - "Community 120"
Cohesion: 0.29
Nodes (7): 1. Offline Receipt OCR Parsing, 2. Conversational AI Coach, Automated / Build Verification, Implementation Details, Manual Verification, Part 6 — Offline OCR Receipt Scanner & AI Financial Coach, Verification Plan

### Community 124 - "Community 124"
Cohesion: 0.19
Nodes (15): header, header, description, title, header, header, tours, budgets (+7 more)

### Community 126 - "Community 126"
Cohesion: 0.50
Nodes (4): done, next, prev, btn

### Community 127 - "Community 127"
Cohesion: 0.25
Nodes (9): categories, addCategory, color, editCategory, icon, subtitle, title, categoryService (+1 more)

### Community 129 - "Community 129"
Cohesion: 0.12
Nodes (15): Auditing & Theming Compatibility (2026-06-11), Build, Feature 1: 📸 Receipt Image Storage (Supabase Storage), Feature 2: 📅 Financial Calendar View, Features Detail, Files Changed, Files Changed, Key Architecture Decisions (+7 more)

### Community 131 - "Community 131"
Cohesion: 0.60
Nodes (5): type, type, bank, cash, e_wallet

### Community 132 - "Community 132"
Cohesion: 0.50
Nodes (4): done, next, prev, btn

### Community 134 - "Community 134"
Cohesion: 0.14
Nodes (13): accounts, accountName, accountNamePlaceholder, addAccount, balancePlaceholder, editAccount, subtitle, title (+5 more)

### Community 136 - "Community 136"
Cohesion: 0.29
Nodes (6): Family Finance Architecture & Integration Plans, Frontend Documentation, Part 3 — Collaborative Shopping & Shared Bills, Part 8 — Update Documentation (Completed), Proposed Changes, Root Documentation

### Community 137 - "Community 137"
Cohesion: 0.25
Nodes (8): Feature 1: Receipt Image Storage, Feature 2: Financial Calendar View, Feature Description Accuracy Correction, Key Files, Key Files, Part 9 — Receipt Image Storage & Financial Calendar View (Completed 2026-06-11), Theming Compatibility (Theme Audit & Mobile Bugfixes), Verification

## Knowledge Gaps
- **652 isolated node(s):** `recommendations`, `name`, `private`, `version`, `type` (+647 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dashboard` connect `Virtual Scroll Component` to `Time Intervals`, `Database Backup Script`, `Community 105`, `Community 107`, `Dashboard Analytics Metrics`, `Community 124`, `Report Generation and Export`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `common` connect `Common UI Actions` to `Community 134`, `Transactions Page View`, `Community 46`, `Community 110`, `Community 126`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `dashboard` connect `Community 108` to `Family Member Roles`, `Family Member Roles`, `Community 134`, `Navigation and Management`, `Community 110`, `Financial Data Export`, `Dashboard Analytics Metrics`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `recommendations`, `name`, `private` to the rest of the system?**
  _655 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Common UI Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07656341320864991 - nodes in this community are weakly interconnected._
- **Should `Common UI Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Project Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._