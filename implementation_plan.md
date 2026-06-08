# Indonesian Language Mode Integration

This plan outlines the strategy to add full multi-language (English and Indonesian) support to the Family Finance Vue 3 frontend application, allowing seamless translation of all views, charts, tours, and notifications.

## User Review Required

> [!IMPORTANT]
> **Custom Lightweight Store vs. `vue-i18n` library**:
> We propose using a lightweight custom reactive store (`useLocaleStore`) for translation.
> - **Why?** It avoids adding external dependency overhead to Vite, prevents potential package compatibility issues with Vue 3.5+, and allows us to easily translate complex dynamic structures like standard arrays (e.g., the interactive guide tours and backend validation messages).
> - **How it works:** We will define translations in `en.json` and `id.json`, create a simple store to track state, and register a global `$t` function in `main.js` so templates can use it natively.
> 
> If you prefer standard `vue-i18n`, please let us know. Otherwise, we will proceed with this robust custom solution.

> [!NOTE]
> **Scope of Translation**:
> All page text, labels, placeholders, buttons, toasts, and the step-by-step onboarding tours will be fully translated. Backend database schema data (e.g., actual category names like "Food" created by users in the database) will remain as entered, but predefined UI labels and templates will be fully localized.

## Open Questions

> [!IMPORTANT]
> 1. **Floating Language Toggle on Auth Pages**: Do you agree with adding a premium floating toggle (e.g. `EN | ID`) on the top right of the Login/Register screens?
> 2. **Chart Labels**: Chart labels (like dataset names "Income" vs. "Expense") will be dynamically translated based on the active language. Is that alignment correct?

---

## Proposed Changes

### 1. Translation System Core (Dependencies & Stores)

We will build a simple, clean localization layer utilizing Pinia and standard Vue reactivity.

#### [NEW] [en.json](file:///c:/Projects/final-finance-family/frontend/src/locales/en.json)
- Define all English strings categorized by context (auth, nav, dashboard, categories, budgets, goals, recurring, reports, settings, members, tours, common).

#### [NEW] [id.json](file:///c:/Projects/final-finance-family/frontend/src/locales/id.json)
- Define corresponding Indonesian translations for all keys.

#### [NEW] [locale.js](file:///c:/Projects/final-finance-family/frontend/src/stores/locale.js)
- Pinia store that:
  - Holds `currentLocale` state (persisted via `localStorage`, default `'en'`).
  - Implements a reactive `t(key, params)` helper mapping dot-notation strings to locale values.
  - Implements `setLocale(lang)` to change language dynamically.

#### [MODIFY] [main.js](file:///c:/Projects/final-finance-family/frontend/src/main.js)
- Register `localeStore.t` as a global helper (`app.config.globalProperties.$t`) so templates can use `$t('key')` directly without manual import.

---

### 2. UI Layout & Switcher Integration

We will provide seamless language selection toggles across the application.

#### [MODIFY] [DashboardLayout.vue](file:///c:/Projects/final-finance-family/frontend/src/layouts/DashboardLayout.vue)
- Add a dropdown or selector button in the top navbar (next to the profile menu) showing the current active flag/language.
- Localize sidebar navigation items.

#### [MODIFY] [LoginPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/LoginPage.vue)
- Add floating pill switcher (`EN | ID`) at the top right of the viewport.
- Localize card text, validation messages, inputs, and placeholders.

#### [MODIFY] [RegisterPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/RegisterPage.vue)
- Add floating pill switcher at the top right of the viewport.
- Localize fields, placeholders, error toasts, and signup options.

#### [MODIFY] [SettingsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/SettingsPage.vue)
- Add a "Language Preference" section in the settings panel with a select dropdown.
- Localize the profile detail list and password update form.

---

### 3. Pages & Features Localization

Each page's text templates and options will be modified to use the `$t()` global helper.

#### [MODIFY] [DashboardPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/DashboardPage.vue)
- Localize page titles, cards, labels, and helper texts.
- Dynamically translate month names, chart labels (Income, Expense, Net Worth), and AI insights headings.

#### [MODIFY] [TransactionsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/TransactionsPage.vue)
- Localize transaction filters, action buttons, table columns, edit modals, type tabs, and placeholder labels.

#### [MODIFY] [AccountsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/AccountsPage.vue)
- Localize card details, table metrics, and wallet create/edit forms.

#### [MODIFY] [BudgetsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/BudgetsPage.vue)
- Localize guardrails, metrics, warnings, and settings forms.

#### [MODIFY] [CategoriesPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/CategoriesPage.vue)
- Localize parent category selectors, type tags, and CRUD dialogs.

#### [MODIFY] [GoalsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/GoalsPage.vue)
- Localize goal status values (`active`, `completed`, `cancelled`, `inactive`) and edit panel.

#### [MODIFY] [RecurringPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/RecurringPage.vue)
- Localize intervals, next due dates, and alerts.

#### [MODIFY] [MembersPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/MembersPage.vue)
- Localize roles (Father, Mother, Child), active toggles, and invites.

#### [MODIFY] [ReportsPage.vue](file:///c:/Projects/final-finance-family/frontend/src/pages/ReportsPage.vue)
- Localize PDF/CSV download layouts, parameters, summary statistics, and headers.

#### [MODIFY] [GoalNotificationModal.vue](file:///c:/Projects/final-finance-family/frontend/src/components/GoalNotificationModal.vue)
- Localize popups, reminder triggers, and action headers.

---

### 4. Interactive Tours & Utilities

We will translate user guide steps and standard components.

#### [MODIFY] [useTour.js](file:///c:/Projects/final-finance-family/frontend/src/composables/useTour.js)
- Update standard driver.js navigation controls (`Next`, `Back`, `Done`) based on the active locale.
- Translate popover titles and descriptions on-the-fly using the store's translator.

#### [MODIFY] [tours/*.js](file:///c:/Projects/final-finance-family/frontend/src/tours/dashboardTour.js)
- Update all 7 tour step files (accounts, budgets, dashboard, goals, recurring, reports, transactions) to define translation key paths rather than hardcoded English strings.

---

## Verification Plan

### Manual Verification
1. Run the server locally using `npm run dev`.
2. Navigate to `/login` and switch between English and Indonesian. Verify the entire page translates immediately.
3. Authenticate and verify that the language selector works from the top navbar.
4. Navigate through each page (Dashboard, Transactions, Budgets, Settings, etc.) and check that all text content, charts, modals, and tables switch correctly.
5. Replay the guide tour on the Dashboard and confirm that the tour cards and navigation buttons are fully in Indonesian when Indonesian is selected.
6. Verify settings preference preserves language choice across page reloads.
