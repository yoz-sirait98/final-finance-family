# Tasks Checklist: Multi-AI Provider & DeepSeek Integration for AI Advisor

- [x] **1. AI Service Provider Layer (`frontend/src/services/aiService.js`)**
  - [x] Implement `chatWithOpenAiCompatible` targeting DeepSeek, Groq, OpenRouter, and OpenAI-compatible completions.
  - [x] Support DeepSeek-R1 `reasoning_content` and Groq `reasoning` / `<think>` tag extraction alongside standard `content`.
  - [x] Build unified `chatWithCoach` routing mechanism supporting provider selection (`gemini`, `deepseek-chat`, `deepseek-reasoner`, `groq`, `openrouter`).
  - [x] Implement error handling and diagnostic hints (Insufficient Balance, rate limits, network timeouts).

- [x] **2. AI Advisor Chat Interface (`frontend/src/pages/AiPage.vue`)**
  - [x] Add model & provider selector toggle dropdown in the chat header.
  - [x] Render expandable **💭 DeepSeek / Groq Reasoning & Thinking Process** accordion for reasoning responses.
  - [x] Adapt API key missing state to dynamically check active provider keys.

- [x] **3. Settings Page AI Configuration (`frontend/src/pages/SettingsPage.vue`)**
  - [x] Add DeepSeek API key configuration card with save & remove handlers.
  - [x] Add Groq and OpenRouter API key cards with live connection verification.
  - [x] Add Default AI Advisor Provider preference selector.
  - [x] Store preferences in `localStorage` with fallback family database sync.

- [x] **4. Localization & i18n (`frontend/src/locales/en.json` & `id.json`)**
  - [x] Add translation keys for DeepSeek models, reasoning accordion labels, and balance diagnostics.

- [x] **5. Verification & Testing**
  - [x] Run `npm run build` to ensure error-free compilation.
  - [x] Test switching between Gemini, DeepSeek, Groq, and OpenRouter models.
  - [x] Verify thought accordion rendering and response formatting.
  - [x] Update knowledge graph (`graphify update .`).

