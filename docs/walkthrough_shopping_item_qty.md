# Walkthrough — Shopping Plan Item Quantity (Qty) & Unit Support

We have implemented support for quantity (`qty`) and measurement unit (`unit`) tracking on **Shopping Plan** items (e.g. `Tomato 1kg 20000`, `Milk 2 pcs 30000`), complete with smart parsing, quick unit pills, desktop and mobile responsive views, WhatsApp checkout messages, and pantry restocking alignment.

---

## 1. Database Migration & Schema

### Migration File: [`000040_add_qty_and_unit_to_shopping_items.sql`](file:///c:/Projects/final-finance-family/supabase/migrations/000040_add_qty_and_unit_to_shopping_items.sql)
```sql
ALTER TABLE public.shopping_items 
ADD COLUMN IF NOT EXISTS qty NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'pcs';

UPDATE public.shopping_items SET qty = 1 WHERE qty IS NULL;
UPDATE public.shopping_items SET unit = 'pcs' WHERE unit IS NULL;
```

> [!NOTE]
> **Supabase Migration Instructions**:
> Because direct TCP port 5432 connections are restricted on the local office network, copy the contents of `supabase/migrations/000040_add_qty_and_unit_to_shopping_items.sql` and run it directly in your **Supabase Web Dashboard > SQL Editor**.
> The frontend services include built-in graceful schema fallback so item creation and updates continue to succeed even if the migration has not yet been executed in the dashboard.

---

## 2. Frontend Services & Resilience

- **[`shoppingService.js`](file:///c:/Projects/final-finance-family/frontend/src/services/shoppingService.js)**:
  - Supports `qty` and `unit` in `create()` and `update()`.
  - Automatic fallback handler: if remote columns do not exist yet (`code 42703` or `PGRST204`), strips `qty`/`unit` and retries cleanly without crashing the UI.
- **[`shoppingPlanService.js`](file:///c:/Projects/final-finance-family/frontend/src/services/shoppingPlanService.js)**:
  - In `createFromReceipt()`, forwards scanned line item quantities and units with fallback resilience.
- **[`mealPlanService.js`](file:///c:/Projects/final-finance-family/frontend/src/services/mealPlanService.js)**:
  - Forward ingredient quantities, units, and `is_checked: false` when exporting missing recipe ingredients to a shopping plan.
- **[`pantryService.js`](file:///c:/Projects/final-finance-family/frontend/src/services/pantryService.js)**:
  - Restocking items from shopping plan to pantry automatically preserves exact quantities and measurement units.

---

## 3. UI / UX Enhancements in `ShoppingDetailPage.vue`

### Add / Edit Item Modal
- **Smart Item Name Parser**: Typing e.g. `"Tomato 1kg"` or `"Tomat 500gr"` automatically extracts the name `"Tomato"`, sets Qty to `1`, and unit to `"kg"`.
- **Quantity Input**: Interactive input with +/- stepper buttons (`itemForm.qty`).
- **Unit Input & 1-Tap Pills**: Custom unit input plus 1-tap quick buttons for `kg`, `gr`, `pcs`, `pack`, `ikat`, `liter`, `botol`.
- **Price Calculation Helper**: If `qty > 1`, shows unit price estimate (e.g. `@ Rp 10.000 / kg` for a 2 kg item priced at Rp 20.000).

### Desktop & Mobile List Cards
- **Desktop View**: Renders item name with an emerald/primary quantity badge (e.g. `1 kg`), requester tag, and unit price subtext.
- **Mobile View**: Renders compact quantity badge in mobile cards with touch-optimized inline price editing.

### WhatsApp Checkout Summary
- WhatsApp checkout messages now include quantities:
  `✅ Tomato (1 kg) - Rp 20.000`
  `✅ Telur (10 butir) - Rp 28.000`

---

## 4. Verification & Build Results

- **Vite Production Build**: `npm --prefix frontend run build` exited with code 0 (`✓ built in 2.41s`, 0 errors).
- **Graceful Fallback**: Verified that missing remote columns fall back gracefully without error.
