# Walkthrough: Shopping List Revamp & Done/Locked Refinement

## Overview
This update refines the Shopping List feature to distinguish between **Done** and **Locked** statuses:

1. **Flexible Checkout Flow**:
   - **Mark as Done**: Sets status to `done`. Items remain editable, and the plan **can still be deleted**. A "Lock Plan" button is provided for manual locking.
   - **Checkout & Record Transaction**: Sets status to `locked` automatically, creating a linked expense transaction.

2. **Done vs. Locked States**:
   - **`done` status**: Plan can be deleted. Items inside the plan (prices, checkboxes, add/delete item) remain **editable**.
   - **`locked` status**: Plan **cannot be deleted** (protected with "🔒 Locked" badge). Items inside become **read-only/disabled**.

---

## Changes Made

### Modified: `shoppingPlanService.js`
- **`lock(planId)`**: Sets plan status to `locked`.
- **`checkout(...)`**: Sets plan status to `locked` automatically upon recording a transaction.
- **`delete(id)`**: Guard now only prevents deletion if `plan.status === 'locked'`.

### Modified: `ShoppingDetailPage.vue`
- **Item Editability**: Checkboxes, prices, add item, and delete item remain enabled for `progress` and `done` plans; disabled/read-only for `locked` plans.
- **Lock Plan Button**: Added a "🔒 Lock Plan" (`Kunci Rencana`) button when a plan is in `done` status.
- **Header Badge**: Shows "Done" (`bg-success`) for `done` status, and "Locked" (`bg-secondary` with lock icon) for `locked` status.

### Modified: `ShoppingPage.vue`
- **Tabs**: "Done" tab includes both `done` and `locked` plans.
- **Deletion Protection**: Shows trash delete button for `progress` and `done` plans; shows "🔒 Locked" badge for `locked` plans.

---

## Verification
- ✅ Production build (`vite build`) compiled cleanly with zero errors.
