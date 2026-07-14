# WhatsApp Notification System

## Overview
The WhatsApp notification system in FamFin has been fully integrated to provide real-time updates for family members when significant events occur in the application.

## Key Features

### 1. New Shopping List Alerts
When a user creates a new shopping list, they have the option to broadcast a notification.
- **Group Notifications**: Sends a message to the shared Family WhatsApp Group detailing the location, creator, and date.
- **Assigned Members**: Sends direct messages to members who are specifically assigned to the shopping list, provided they have notifications enabled.

### 2. Budget Over-Limit Alerts
When a user logs a transaction that pushes a specific category (e.g., Groceries, Entertainment) over its defined monthly budget limit, a `🚨 BUDGET ALERT` is sent to the Family WhatsApp Group.
- Displays the amount added, the total spent, the monthly limit, and the current percentage of the budget consumed.

### 3. Shopping Checkout Receipts (New)
When a family member finishes shopping and hits the **Checkout** button inside a Shopping List, a detailed receipt is sent to the Family WhatsApp Group.
- **Receipt Details**: Includes the Store Location, the Buyer's Name, an itemized list of all purchased goods with their exact prices, and a Grand Total.

### 4. Smart Localization (New)
The WhatsApp Notification System respects the user's localized app settings!
- **Indonesian (`id-ID`)**: If the user triggering the notification has their language set to Indonesian, the WhatsApp message will automatically translate to Indonesian.
- **English (`en-GB`)**: Defaults to English for all other users.

## Technical Architecture
- **Frontend Integration**: Vue 3 `fetch` requests inside `ShoppingPage.vue`, `ShoppingDetailPage.vue`, and `TransactionsPage.vue`.
- **Backend Service**: An Express microservice (`whatsapp-web.js`) hosted on Heroku at `https://finance-family-3ac25ba9b522.herokuapp.com/api/notify`.
- **Security**: The `/api/notify` endpoint is secured with an `x-api-key` header mapped to `VITE_WA_API_KEY`.
- **Data Flow**: The frontend pulls the target `whatsapp_group_id` or `whatsapp_number` from the Supabase `families` and `members` tables before dispatching the payload to the Heroku service.

## Validation & Testing
- ✅ Creating a shopping list successfully pings the group.
- ✅ Exceeding a budget successfully triggers an over-limit warning.
- ✅ Checking out a shopping list sends a fully formatted receipt.
- ✅ Changing the app language to Indonesian translates all incoming notifications.
