# Implementation Plan

## Multi-AI Provider Integration: DeepSeek V3 & R1 Reasoner for Aurora AI Advisor (August 2026)

### Problem Area & Target Architecture

Currently, the Aurora AI Financial Coach (`aiService.js` and `AiPage.vue`) is hardcoded to Google Gemini. With the emergence of DeepSeek (V3 and R1 Reasoner), we want to give users the freedom to select their preferred AI intelligence engine, experience DeepSeek-R1's step-by-step mathematical reasoning ("Chain of Thought"), and have seamless fallback across providers.

| Feature Component | Current Implementation | Target Architecture |
|---|---|---|
| **AI Provider Support** | Google Gemini (`gemini-flash-lite-latest`) only | Multi-provider router: **Google Gemini**, **DeepSeek V3** (`deepseek-chat`), **DeepSeek R1** (`deepseek-reasoner`), and OpenAI-compatible endpoints |
| **Model Switcher** | Fixed single model | Interactive quick-switch pill directly inside AI Advisor chat & default configuration in Settings |
| **Reasoning / Thinking UI** | Plain single text stream | Dedicated collapsible accordion showing DeepSeek-R1's step-by-step reasoning process before the final advice |
| **Settings & Key Management** | Gemini API Key only | Multi-key manager with live verification tests and balance diagnostics |

---

### Proposed Changes

#### AI Service Layer

##### `frontend/src/services/aiService.js`
- Create a unified multi-provider chat dispatcher `chatWithCoach(messages, locale, providerOverride)`.
- Implement `chatWithDeepSeek({ messages, model, locale, apiKey, baseUrl })` targeting `https://api.deepseek.com/chat/completions`.
- Support extracting `reasoning_content` (for R1) alongside `content`.
- Graceful error mapping for DeepSeek (handling `Insufficient Balance`, rate limits, quota issues).

#### AI Advisor Chat Page

##### `frontend/src/pages/AiPage.vue`
- Add model switcher header bar (Gemini Flash vs DeepSeek V3 vs DeepSeek R1).
- Add collapsible *💭 DeepSeek Thinking Process* accordion for messages containing `reasoning_content`.
- Display dynamic API key missing banners tailored to the currently selected provider.

#### Settings Page

##### `frontend/src/pages/SettingsPage.vue`
- Add DeepSeek API Key configuration with test button and balance diagnostic feedback.
- Add Active AI Provider selector for default chat coach experience.

#### Localization

##### `frontend/src/locales/en.json` & `frontend/src/locales/id.json`
- Add translation keys for DeepSeek, provider switching, reasoning labels, and error states.

---

## Past Features History

### Repurpose Header Bell Icon into In-App Alerts Hub (August 2026)
- Multi-category In-App Alerts Hub for Budgets, Goals, and Shopping with tabbed filter bar and direct routing.

## Past Features History

### Mobile View Redesign for Project Pockets Page (August 2026)
- Touch-first mobile card list with status badges, progress bars, available/target balance displays, quick action drawers, and mobile KPI banner.

### Mobile View Redesign for Recurring Page (August 2026)
- Touch-first mobile card list with due date urgency badges, active switch toggle, touch action drawer, sticky floating action button (FAB), and mobile KPI banner.

### Mobile View Redesign for Shopping Plan Pages (August 2026)
- Touch-first mobile card list with store icons, assignee badges, progress bar, sticky bottom bar, and mobile KPI banner.

### Mobile View Style for Transactions Page (August 2026)
- Dedicated touch-optimized mobile view (`d-md-none`) with mobile KPI banner, compact search chips, grouped date feed, and card touch drawers.
