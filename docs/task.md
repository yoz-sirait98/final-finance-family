# Family Finance Migration & Integration Tasks

## Part 1 — Supabase Migration Tasks
- `[x]` Task 01: Supabase Schema & Auth Trigger
- `[x]` Task 02: Row Level Security Policies
- `[x]` Task 03: PostgreSQL Balance & Transfer Engine
- `[x]` Task 04: PostgreSQL Goal Sync Engine
- `[x]` Task 05: PostgreSQL Activity Logging Engine
- `[x]` Task 06: PostgreSQL Budget Guardrail RPC
- `[x]` Task 07: PostgreSQL Dashboard Analytics RPC
- `[x]` Task 08: Supabase Cron (Recurring Transactions)
- `[x]` Task 09: Frontend Setup (@supabase/supabase-js)
- `[x]` Task 10: Frontend Stores & Services Refactor
- `[x]` Task 11: Frontend Realtime Implementation
- `[x]` Task 12: GitHub Pages Hash Router
- `[x]` Task 13: Final Testing & Validation
- `[x]` Task 14: Dynamic Golden Ratio Chart Colors
- `[x]` Task 15: Historical Net Worth Dynamic Algorithm
- `[x]` Task 16: Fix Budget Alert Sync (80%)
- `[x]` Task 17: Enforce Expense-Only Recurring Transactions
- `[x]` Task 18: Data Hydration Fixes for UI Dropdowns
- `[x]` Task 19: PG Cron NULL Description Bugfix

## Part 2 — Indonesian Language Mode Tasks
- `[x]` Task 20: Translation dictionaries (`en.json`, `id.json`), Locale Store (`locale.js`), and main.js registration
- `[x]` Task 21: UI Switchers (Floating toggle on Login/Register, top-navbar dropdown) and Sidebar translation
- `[x]` Task 22: Settings Page language preference option and translation
- `[x]` Task 23: Translate Main Pages & Modals (Dashboard, Transactions, Accounts, Budgets, Categories, Goals, Recurring, Members, Reports, modals/toasts)
- `[x]` Task 24: Translate driver.js tours config and step definitions (`useTour.js` and `src/tours/*.js`)
- `[x]` Task 25: Local verification and quality polish

## Part 3 — Reports Page Filtering Fix
- `[x]` Task 26: Update `get_dashboard_summary` PostgreSQL RPC signature to accept member_id and support all months
- `[x]` Task 27: Modify `dashboardService.js` to accept and forward parameter filters to the RPC
- `[x]` Task 28: Refactor `ReportsPage.vue` to pass raw filter states directly to the service layer
- `[x]` Task 29: Compile/build the project and verify no syntax or module loading errors

## Part 4 — AI Assistant Graphify Integration
- `[x]` Task 30: Install pipx and graphifyy package
- `[x]` Task 31: Integrate Graphify skill for Antigravity assistant into `.agents` directory

## Part 5 — Modular Agent Rules and Knowledge Reorganization
- `[x]` Task 32: Create modular agent rules files under `.agents/rules/` (`supabase_network_restriction.md`, `documentation_lifecycle.md`, `walkthrough_artifacts.md`, `git_push_policy.md`)
- `[x]` Task 33: Reorganize root `.cursorrules` as a clean entry index
- `[x]` Task 34: Append rules reorganization plan to `docs/implementation_plan.md`
- `[x]` Task 35: Run `graphify update .` to rebuild AST knowledge graph

## Part 6 — Offline OCR Receipt Scanner & AI Financial Coach
- `[x]` Task 36: Install `tesseract.js` dependency
- `[x]` Task 37: Create `receiptScanner.js` OCR utility
- `[x]` Task 38: Integrate scanner into `TransactionsPage.vue` with scanner overlay
- `[x]` Task 39: Implement Gemini API Key setup in `SettingsPage.vue`
- `[x]` Task 40: Create `aiService.js` context connector
- `[x]` Task 41: Create `AiPage.vue` chat interface
- `[x]` Task 42: Add AI Advisor sidebar navigation to `DashboardLayout.vue`
- `[x]` Task 43: Add translation keys in `en.json` and `id.json`
- `[x]` Task 44: Run build verification and Graphify AST update

## Part 7 — Cross-Device Gemini API Key Syncing
- `[x]` Task 45: Create database migration `000021_add_gemini_api_key_to_families.sql`
- `[x]` Task 46: Update `auth.js` Pinia store to load family record and cache key in `localStorage`
- `[x]` Task 47: Update `SettingsPage.vue` to save/delete key from Supabase `families` table
- `[x]` Task 48: Rebuild and verify compilation

## Part 8 — Update Documentation
- `[x]` Task 49: Update root `README.md` with new features (OCR scanner, AI Coach, Gemini API key syncing)
- `[x]` Task 50: Update `frontend/README.md` with frontend configuration and package details for new features

## Part 9 — Receipt Image Storage & Financial Calendar View
- `[x]` Task 51: Create migration `000022_add_receipt_url_to_transactions.sql`
- `[x]` Task 52: Create `frontend/src/services/storageService.js` (upload/signed-URL/delete)
- `[x]` Task 53: Update `receiptScanner.js` to return `imageFile` reference in result
- `[x]` Task 54: Update `transactionService.js` to include `receipt_url` in select query
- `[x]` Task 55: Update `TransactionsPage.vue` — upload on save, thumbnail preview, lightbox, 📎 badge, cleanup on delete
- `[x]` Task 56: Create `frontend/src/pages/CalendarPage.vue` (7-col grid, dots, day detail panel, mobile list view)
- `[x]` Task 57: Add `/calendar` route to `router/index.js`
- `[x]` Task 58: Add Calendar nav item to `DashboardLayout.vue`
- `[x]` Task 59: Add `nav.calendar` translation keys to `en.json` and `id.json`
- `[x]` Task 60: Build verification (✓ 1.52s, zero errors) + graphify update (1116 nodes, 1560 edges)
- `[x]` Task 61: Audit and update `CalendarPage.vue` styles to use theme variables (`--input-border`, `--primary-color`) for full light/dark mode compatibility
- `[x]` Task 62: Rebuild and verify compilation
- `[x]` Task 63: Fix recurring bill amount badge visibility by using custom `.badge-recurring` and `.badge-goal` styling
- `[x]` Task 64: Expand mobile list view details container to display recurring bills and saving goals
- `[x]` Task 65: Fix blurry tour popover buttons rendering by forcing hardware acceleration (translate3d, backface-visibility, font-smoothing)

## Part 10 — Feature Description Accuracy Correction
- `[x]` Task 66: Correct inaccurate feature description in README.md by separating collaborative shopping list and offline OCR receipt scanner
- `[x]` Task 67: Refactor `receiptScanner.js` to improve OCR parsing accuracy, adding date range/2-digit validation and bottom-up total amount search





