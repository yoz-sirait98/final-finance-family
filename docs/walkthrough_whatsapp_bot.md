# Walkthrough: WhatsApp Push Notifications

We have successfully implemented the architecture for automated WhatsApp notifications when a new Shopping List is created. To achieve a 100% free solution, we integrated your team's preferred `whatsapp-web.js` library.

## What Was Built

1. **Standalone WhatsApp Node.js Microservice**
   - Created a new Git repository at `C:\Projects\famfin-whatsapp-bot`.
   - Built an Express backend utilizing `whatsapp-web.js` and `qrcode-terminal`.
   - Setup `LocalAuth` session caching and configured `package.json` for Heroku deployment.
   - Protected the `/api/notify` webhook endpoint using an API Key.

2. **Supabase Database & Webhook Migrations**
   - Created migration `000025_add_whatsapp_numbers.sql` to track members' `whatsapp_number` and `notifications_enabled` preferences.
   - Created migration `000026_shopping_plan_webhook.sql` which utilizes the **`pg_net`** extension to automatically `HTTP POST` the payload (containing phone numbers and formatted message) directly to your Heroku bot URL whenever a new record is inserted into `shopping_plans`.

3. **Frontend UI Adjustments**
   - Updated the `MemberModal.vue` to include an input for the **WhatsApp Number** with country code formatting instructions.
   - Added a toggle switch to enable/disable WhatsApp notifications.
   - Updated the `MembersPage.vue` cards to display the member's WhatsApp number and a bell icon indicating their notification status.

## How to Deploy and Verify

> [!TIP]
> **Deployment Steps**
> 1. Push the `famfin-whatsapp-bot` folder to a new GitHub repository and deploy it to Heroku.
> 2. Once deployed, check the Heroku logs for the generated QR code and scan it with a WhatsApp account.
> 3. Update the `v_bot_url` and `v_api_key` variables inside `supabase/migrations/000026_shopping_plan_webhook.sql` with your live Heroku URL and API key before running the migrations in Production.
