# Graph Report - .  (2026-06-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 635 nodes · 904 edges · 75 communities (59 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3cb35f0`
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
- [[_COMMUNITY_Database Backup Script|Database Backup Script]]
- [[_COMMUNITY_UI Assets and Icons|UI Assets and Icons]]
- [[_COMMUNITY_Toast Notification Store|Toast Notification Store]]
- [[_COMMUNITY_Budget Tour Steps|Budget Tour Steps]]
- [[_COMMUNITY_Dashboard Tour Steps|Dashboard Tour Steps]]
- [[_COMMUNITY_Goals Tour Steps|Goals Tour Steps]]
- [[_COMMUNITY_Recurring Transaction Tour|Recurring Transaction Tour]]
- [[_COMMUNITY_Reports Tour Steps|Reports Tour Steps]]
- [[_COMMUNITY_Transactions Tour Steps|Transactions Tour Steps]]
- [[_COMMUNITY_VS Code Extensions|VS Code Extensions]]
- [[_COMMUNITY_Frontend Entry Point|Frontend Entry Point]]
- [[_COMMUNITY_Indonesian Language Integration|Indonesian Language Integration]]
- [[_COMMUNITY_Supabase Setup Guide|Supabase Setup Guide]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_Vue Logo Asset|Vue Logo Asset]]
- [[_COMMUNITY_Graphify Integration Guide|Graphify Integration Guide]]

## God Nodes (most connected - your core abstractions)
1. `transactions` - 39 edges
2. `common` - 37 edges
3. `common` - 37 edges
4. `dashboard` - 24 edges
5. `validation` - 24 edges
6. `dashboard` - 24 edges
7. `validation` - 24 edges
8. `budgets` - 20 edges
9. `budgets` - 20 edges
10. `nav` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Accounts Page Screenshot` --references--> `Vue 3 Frontend`  [INFERRED]
  docs/screenshots/page_accounts_1773716805706.png → README.md
- `Budgets Page Screenshot` --references--> `Vue 3 Frontend`  [INFERRED]
  docs/screenshots/page_budgets_1773716816705.png → README.md
- `Categories Page Screenshot` --references--> `Vue 3 Frontend`  [INFERRED]
  docs/screenshots/page_categories_1773716814084.png → README.md
- `Dashboard Page Screenshot` --references--> `Vue 3 Frontend`  [INFERRED]
  docs/screenshots/page_dashboard_1773716785210.png → README.md
- `Saving Goals Page Screenshot` --references--> `Vue 3 Frontend`  [INFERRED]
  docs/screenshots/page_goals_1773716819480.png → README.md

## Import Cycles
- None detected.

## Communities (75 total, 16 thin omitted)

### Community 0 - "Common UI Actions"
Cohesion: 0.06
Nodes (42): done, next, prev, common, account, actions, active, all (+34 more)

### Community 1 - "Common UI Actions"
Cohesion: 0.06
Nodes (41): done, next, prev, common, account, actions, active, all (+33 more)

### Community 2 - "Core Services and Routing"
Cohesion: 0.12
Nodes (16): initializeRealtime(), supabase, router, routes, crud, createCrudService(), crud, crud (+8 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.07
Nodes (29): dependencies, bootstrap, chart.js, driver.js, idb-keyval, jspdf, jspdf-autotable, pinia (+21 more)

### Community 4 - "Authentication Forms"
Cohesion: 0.08
Nodes (29): login, register, success, createAccount, email, emailPlaceholder, failed, newHere (+21 more)

### Community 5 - "Authentication Forms"
Cohesion: 0.08
Nodes (29): login, register, success, createAccount, email, emailPlaceholder, failed, newHere (+21 more)

### Community 6 - "Transaction and Budget Logic"
Cohesion: 0.07
Nodes (28): transactions, addTransaction, allAccounts, allCategories, allMembers, alreadySpent, amountPlaceholder, budgetExceeded (+20 more)

### Community 7 - "Transaction Management"
Cohesion: 0.07
Nodes (26): addTransaction, allAccounts, allCategories, allMembers, alreadySpent, amountPlaceholder, budgetExceeded, budgetExceededProceed (+18 more)

### Community 8 - "Dashboard Layout Components"
Cohesion: 0.09
Nodes (11): bellDropdownRef, bellOpen, budgetAlerts, currentPageTitle, langDropdownRef, langOpen, mobileOpen, routeNamesToPollAlerts (+3 more)

### Community 9 - "Navigation and Management"
Cohesion: 0.11
Nodes (19): auth, addCategory, color, editCategory, icon, subtitle, members, addMember (+11 more)

### Community 10 - "Account and Recurring Management"
Cohesion: 0.14
Nodes (16): accounts, accountName, accountNamePlaceholder, addAccount, balancePlaceholder, editAccount, walletDetails, add (+8 more)

### Community 11 - "Account and Recurring Management"
Cohesion: 0.14
Nodes (16): accounts, accountName, accountNamePlaceholder, addAccount, balancePlaceholder, editAccount, walletDetails, add (+8 more)

### Community 12 - "Project Documentation and Screenshots"
Cohesion: 0.14
Nodes (15): Frontend Architecture, Serverless Migration (Laravel to Supabase), Vue 3 Frontend, Sistem Manajemen Keuangan Keluarga, Supabase Backend, Accounts Page Screenshot, Budgets Page Screenshot, Categories Page Screenshot (+7 more)

### Community 13 - "Financial Insights and Charts"
Cohesion: 0.25
Nodes (15): balance, alerts, expense, income, transfer, insights, net, period (+7 more)

### Community 14 - "Month Labels"
Cohesion: 0.26
Nodes (14): months, monthsAbbr, 1, 10, 11, 12, 2, 3 (+6 more)

### Community 15 - "Financial Data Export"
Cohesion: 0.26
Nodes (14): balance, alerts, expense, income, transfer, insights, net, period (+6 more)

### Community 16 - "Month Labels"
Cohesion: 0.26
Nodes (14): months, monthsAbbr, 1, 10, 11, 12, 2, 3 (+6 more)

### Community 17 - "Dashboard Analytics Metrics"
Cohesion: 0.15
Nodes (13): dashboard, expenseByCategory, expenseTrend, incomeVsExpense, insightsNew, monthlyExpense, monthlyIncome, monthlyNet (+5 more)

### Community 18 - "Dashboard Analytics Metrics"
Cohesion: 0.15
Nodes (13): dashboard, expenseByCategory, expenseTrend, incomeVsExpense, insightsNew, monthlyExpense, monthlyIncome, monthlyNet (+5 more)

### Community 19 - "State and Tour Management"
Cohesion: 0.24
Nodes (6): useTour(), app, localeStore, pinia, useLocaleStore, useTourStore

### Community 20 - "Virtual Scroll Component"
Cohesion: 0.18
Nodes (9): container, containerHeight, offsetY, props, scrollTop, startIndex, totalHeight, visibleCount (+1 more)

### Community 21 - "Budget Limits and Alerts"
Cohesion: 0.18
Nodes (11): budgets, addBudget, alertThreshold, alertThresholdPlaceholder, editBudget, limit, limitPlaceholder, remaining (+3 more)

### Community 22 - "Indonesian Localization"
Cohesion: 0.20
Nodes (10): auth, categories, addCategory, color, editCategory, icon, subtitle, members (+2 more)

### Community 23 - "Budget Limits and Alerts"
Cohesion: 0.18
Nodes (11): budgets, addBudget, alertThreshold, alertThresholdPlaceholder, editBudget, limit, limitPlaceholder, remaining (+3 more)

### Community 24 - "Savings Goals Management"
Cohesion: 0.18
Nodes (11): goals, addGoal, completedManuallyError, currentAmount, deadline, editGoal, linkedAccount, linkedAccountInfo (+3 more)

### Community 25 - "Savings Goals Management"
Cohesion: 0.20
Nodes (10): goals, addGoal, completedManuallyError, currentAmount, deadline, editGoal, linkedAccount, selectAccount (+2 more)

### Community 26 - "Navigation and Sidebar"
Cohesion: 0.22
Nodes (9): nav, analytics, brand, budgetAlerts, logout, main, management, noAlerts (+1 more)

### Community 27 - "Supabase Skill Configuration"
Cohesion: 0.33
Nodes (8): skills, supabase, supabase-postgres-best-practices, computedHash, skillPath, source, sourceType, version

### Community 28 - "Report Generation and Export"
Cohesion: 0.29
Nodes (7): header, reports, endDate, exportCsv, exportPdf, generating, startDate

### Community 29 - "Report Generation and Export"
Cohesion: 0.33
Nodes (6): reports, endDate, exportCsv, exportPdf, generating, startDate

### Community 30 - "Social Media Icons"
Cohesion: 0.40
Nodes (5): Bluesky Icon, Discord Icon, GitHub Icon, Social Icon, X Icon

### Community 31 - "Supabase Project Metadata"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 32 - "Supabase Project Metadata"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 33 - "Time Intervals"
Cohesion: 0.50
Nodes (4): monthly, weekly, yearly, intervals

### Community 34 - "Family Member Roles"
Cohesion: 0.50
Nodes (4): roles, child, father, mother

### Community 35 - "Time Intervals"
Cohesion: 0.50
Nodes (4): monthly, weekly, yearly, intervals

### Community 36 - "Family Member Roles"
Cohesion: 0.50
Nodes (4): roles, child, father, mother

## Knowledge Gaps
- **370 isolated node(s):** `backup.sh script`, `recommendations`, `name`, `private`, `version` (+365 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `common` connect `Common UI Actions` to `Account and Recurring Management`, `Authentication Forms`, `Indonesian Localization`, `Financial Data Export`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `common` connect `Common UI Actions` to `Navigation and Management`, `Account and Recurring Management`, `Authentication Forms`, `Financial Insights and Charts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `transactions` connect `Transaction and Budget Logic` to `Common UI Actions`, `Account and Recurring Management`, `Financial Data Export`, `Indonesian Localization`, `Savings Goals Management`, `Navigation and Sidebar`, `Report Generation and Export`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `backup.sh script`, `recommendations`, `name` to the rest of the system?**
  _373 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Common UI Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05574912891986063 - nodes in this community are weakly interconnected._
- **Should `Common UI Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05731707317073171 - nodes in this community are weakly interconnected._
- **Should `Core Services and Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.12012012012012012 - nodes in this community are weakly interconnected._