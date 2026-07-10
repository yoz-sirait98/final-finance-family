# Walkthrough: Recurring Transaction Concurrency & Catch-up Fix

**Date:** 2026-07-10  
**Branch:** `redesign-ui-supabase-stack`  
**Commit:** `542e524`

---

## Issue Description

The user reported that a recurring transaction set for the 5th of each month in June did not generate a corresponding transaction in the `transactions` table on July 5th.

### Cause of the Issue
1. **Cron Engine Dependencies**: The recurring transaction generation relies on the database function `process_recurring_transactions()` scheduled daily via the `pg_cron` extension. In serverless/free-tier or local environments, `pg_cron` may not be installed/enabled or can fail silently without executing the scheduled job.
2. **Missing Client-Side Trigger**: The frontend application had no fallback mechanism to evaluate and trigger the recurring transactions processing when a user loads their account session or page.
3. **No Overdue Catch-up**: If a recurring transaction misses its execution day, the original PL/pgSQL function only evaluated `next_due_date <= CURRENT_DATE` once per call. It had no loop logic to handle multi-month overdue items, making it difficult to recover missed periods automatically.

---

## Technical Solution

### 1. Database Migration: Concurrency Locks & Catch-up Loop
We created database migration [000024_fix_recurring_catchup_and_concurrency.sql](file:///C:/Users/Yosua Jan/.gemini/antigravity/worktrees/final-finance-family/redesign-ui-supabase-stack/supabase/migrations/000024_fix_recurring_catchup_and_concurrency.sql) which updates the `process_recurring_transactions()` function to:
* **Row Locks (`FOR UPDATE`)**: Prevents race conditions and duplicate transaction insertion when both the database cron and multiple active client sessions call the function concurrently.
* **Catch-up Loop (`LOOP ... END LOOP`)**: Wraps the processing cursor in an iterative catch-up loop. If a monthly recurring transaction is 2 months overdue, it will generate both missing transactions and advance the `next_due_date` appropriately in a single invocation.

### 2. Client-Side Fallback Trigger
We modified [auth.js](file:///C:/Users/Yosua Jan/.gemini/antigravity/worktrees/final-finance-family/redesign-ui-supabase-stack/frontend/src/stores/auth.js) to trigger the `process_recurring_transactions` RPC when loading the user profile upon app initialization or login. This runs a non-blocking catch-up execution whenever any family member logs in or opens the app.

---

## Verification Results

1. **Production Build**: Successfully compiled the frontend project with zero errors:
   ```bash
   npm run build
   ```
2. **AST Graph Rebuild**: Rebuilt the project AST knowledge graph using `graphify update .` (resulting in `1172 nodes`, `1613 edges`, and `136 communities`).
