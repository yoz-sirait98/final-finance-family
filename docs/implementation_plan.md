# WhatsApp Checkout Notifications

The goal of this feature is to automatically send a detailed summary message to your family's WhatsApp Group the moment someone finishes shopping and clicks "Checkout" on a Shopping List.

## Proposed Changes

### [MODIFY] `frontend/src/pages/ShoppingDetailPage.vue`
We will inject a new notification function directly into the `processCheckout` flow.

1. **Extract Family Group ID:** Before sending the message, we will fetch the family's configured WhatsApp Group ID from the database using the authenticated user's `familyId`.
2. **Format the Receipt:** We will iterate through the `items` array and construct a beautiful, WhatsApp-formatted receipt that includes:
   - The Store / Location name.
   - The Family Member who checked out and paid.
   - A bulleted list of every item bought and its exact price.
   - The Grand Total amount.
3. **Dispatch Notification:** We will send this string payload directly to your existing `whatsapp-bot` Heroku server (`/api/notify`) using the `VITE_WA_API_KEY`.

Example of the generated message:
```text
*========================*
🛍️  *SHOPPING COMPLETED*  🛍️
*========================*

Great news! A shopping trip has just been completed and logged.

📍 *Location:* Supermarket
👤 *Bought by:* John Doe

*Items Purchased:*
✅ Apples - Rp 50.000
✅ Milk - Rp 25.000
✅ Bread - Rp 15.000

*------------------------*
💵 *Grand Total:* Rp 90.000
*------------------------*
```

## Verification Plan
1. Check that the Vue compilation succeeds.
2. We will need you to manually test completing a shopping list with prices to verify the WhatsApp message arrives perfectly formatted in the Family Group.
