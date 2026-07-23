# Walkthrough: PWA Web Push Notifications (Multi-Language Support)

## Overview
This feature implements native **PWA Web Push Notifications** for Family Finance (FamFin) with full **multi-language support** matching each user's selected app language preference (`Bahasa Indonesia` or `English`).

---

## What Was Implemented

### 1. Database Schema (`supabase/migrations/000029_push_subscriptions.sql`)
- Created `push_subscriptions` table in Supabase.
- Stores `user_id`, `family_id`, `endpoint`, `p256dh`, `auth`, `locale` (`id` or `en`), and `user_agent`.

### 2. Custom PWA Service Worker (`src/sw.js` & `vite.config.js`)
- Configured VitePWA plugin with `injectManifest` strategy.
- Created `src/sw.js` with:
  - Workbox static asset precaching.
  - `push` event listener to show OS-level notification cards.
  - `notificationclick` event listener to focus/open app and deep-link directly to target pages (e.g. `/shopping/123`, `/transactions`).

### 3. Subscription & Auto-Locale Sync Service (`src/services/pushNotificationService.js`)
- **Permission & Subscribe**: Handles `Notification.requestPermission()`, `reg.pushManager.subscribe()`, and upserts subscription details to Supabase.
- **Language Sync**: Automatically updates `locale` in Supabase whenever the user switches language in `useLocaleStore.setLocale()`.

### 4. Multi-Language Push Dispatcher (`src/services/pushDispatcherService.js`)
- Defines dual-language templates (`id` / `en`) for:
  - 🛒 Shopping Plan Created & Assigned
  - 🔒 Shopping Plan Done & Locked
  - ⚠️ Budget Warning & Limit Exceeded
  - 💸 Large Expense Recorded
  - 🎯 Project Pocket Savings Goal Reached
- Reads each recipient member's preferred `locale` and formats titles/bodies in their chosen language.

### 5. UI Integration & Settings Toggle (`src/components/PushNotificationToggle.vue`)
- Created a `<PushNotificationToggle />` component with active bell indicator and subscription toggle.
- Added toggle to the Top Navbar in `DashboardLayout.vue` and a dedicated PWA Push section in `SettingsPage.vue`.

---

## Verification
- ✅ Executed `npx vite build` — `injectManifest` built `dist/sw.js` with zero errors.
- ✅ Verified `useLocaleStore.setLocale()` automatically syncs `locale` to `push_subscriptions`.
