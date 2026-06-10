# Walkthrough: Offline OCR Receipt Scanner & AI Financial Coach

This walkthrough documents the technical implementation and manual verification steps for the offline receipt scanner (Tesseract.js) and conversational AI Financial Advisor (Gemini API) features.

---

## Features Implemented

### 1. Offline Receipt OCR Parser (`receiptScanner.js`)
* **Tesseract.js static call**: Utilizes the Tesseract static engine to recognize Indonesian and English text locally inside the client's browser without external API costs or server requests.
* **Regex Parsers**:
  * **Store Name (Description)**: Extracts first few lines of text while ignoring blacklisted retail metadata (address, cashier name, welcome headings, phone numbers).
  * **Amount**: Searches for currency indicators (`Rp`, `Total`, `Grand Total`, `Bayar`, `Due`) and parses out values, discarding non-currency integers (like years or taxation rates) and choosing the largest number.
  * **Date**: Parses common standard date structures (`DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MM-YYYY`) and local Indonesian month words (e.g., `Jun`, `Juni`, `Okt`), returning standard `YYYY-MM-DD` string values.
* **Smart Heuristics recommendation**: Recommends the default account type (Cash, Bank, E-Wallet) and category type (Groceries, Food & Drink, Medical, Transport, Utilities) based on keyword matching on parsed merchant names.

### 2. Scanner Page Integration (`TransactionsPage.vue`)
* Triggers file selection using camera capture overlay (`capture="environment"`).
* Renders a camera-preview container overlay with the laser scanning animation during OCR parsing.
* Dynamically map recommendations (heuristics) to active database records (IDs for account and category) using case-insensitive keyword searches on local references (`accounts.value` and `categories.value`), defaulting to the first index if no matches are found.
* Auto-fills the `form.value` and pops open the transaction details modal for the user to review.

### 3. API Key Configuration (`SettingsPage.vue`)
* Added an "AI Configuration" card on the settings page allowing users to configure and save their **Gemini API Key**.
* Saves the key securely in browser local storage (`localStorage.setItem('gemini_api_key', key)`), keeping it completely private.

### 4. Chat Coach Page (`AiPage.vue` & `aiService.js`)
* Created an interactive chat UI styled with Aurora Glassmorphic background blur overlays, custom gradient user bubbles, sparkling advisor avatars, typing loader bubbles, and pre-populated quick suggestion chips.
* **`aiService` context connector**: Automatically runs DB queries (`accountService`, `budgetService`, `transactionService`, `goalService`, `memberService`) and translates active balances, spent percentages, targets, and histories into a structured text snapshot.
* **Gemini direct client-side call**: Appends the current conversation history and injects the snapshot as a system instruction configuration before calling the Gemini API. It handles Indonesian and English conversation modes depending on the current locale setting.
* Features a custom markdown parser supporting list items (`- item`), bold text (`**text**`), and line breaks for premium formatting.

---

## Verification Results

### 1. Production Build Successful
Ran the Vite production bundler in `/frontend` to verify all Vue templates and typescript models:
```bash
npm run build
```
* **Result**: `✓ built in 1.45s` generating optimized chunks:
  * `dist/assets/AiPage.Cp6mGr3c.js` (9.02 KiB)
  * `dist/assets/AiPage.CPzdVOGu.css` (2.01 kB)
  * `dist/assets/TransactionsPage.CECciSXW.js` (47.90 kB)

### 2. AST Knowledge Graph Update
Rebuilt the project index:
```bash
.\graphify.ps1 update .
```
* **Result**: Rebuilt 1068 nodes, 1513 edges, 129 communities.

---

## How to Test Manually
1. Open the `/frontend` folder in your terminal and run:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:5173`.
3. **Test OCR Receipt Scanner**:
   * Go to the **Transactions** page.
   * Click **Scan Receipt** next to the Add Transaction button.
   * Upload a receipt image (e.g. from Indomaret or Starbucks containing a date, Rp currency amount, and merchant name).
   * Verify the laser scanning animation displays processing progress.
   * Verify the transaction modal pops open with the pre-filled store name, parsed date, mapped category (e.g. Groceries), and total amount.
4. **Test AI Financial Coach**:
   * Go to **Settings** and enter a valid Gemini API Key from Google AI Studio, then click **Save**.
   * Click **AI Advisor** in the sidebar.
   * Send a question (e.g., *"How is our food budget?"* or *"Bagaimana kondisi keuangan kami?"*).
   * Verify the advisor responds with advice utilizing the actual numbers from your accounts, budgets, and transactions database.
