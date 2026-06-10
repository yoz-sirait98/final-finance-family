# Walkthrough: Cross-Device Gemini API Key Syncing

This walkthrough documents the technical details and verification steps for synchronizing the Gemini API Key across multiple browsers, devices, and family members.

---

## Features Implemented

### 1. Database Schema Update (`000021_add_gemini_api_key_to_families.sql`)
* Added a `gemini_api_key TEXT` column to the `public.families` table.
* Since the `families` table is protected by existing Row-Level Security (RLS) policies, only authenticated members belonging to that family profile can read or write to this column.

### 2. Auto-Hydration on Login (`auth.js` Pinia Store)
* Added `family` to the auth store state.
* Enhanced `fetchProfile(userId)` to query the user's family record from Supabase upon login.
* If a `gemini_api_key` exists for the family in the database, it is automatically saved to the browser's `localStorage` (`gemini_api_key`).
* This achieves **backward compatibility**: all existing components and services that fetch the key using `localStorage.getItem('gemini_api_key')` continue to work out of the box.

### 3. Settings Page Sync (`SettingsPage.vue`)
* Updated the `saveGeminiKey` action:
  * When a valid key is saved, it is saved in local storage and written to the database:
    ```javascript
    await supabase.from('families').update({ gemini_api_key: trimmedKey }).eq('id', authStore.familyId);
    ```
  * When a key is cleared/removed, it is deleted from both local storage and the database:
    ```javascript
    await supabase.from('families').update({ gemini_api_key: null }).eq('id', authStore.familyId);
    ```

---

## Verification Plan

### 1. Build Compilation
Run the Vite production bundler in the `frontend` folder:
```bash
npm run build
```
* **Result**: `✓ built in 1.44s` generating clean optimized chunks (with no typescript/linting errors).

### 2. How to Verify Manually

#### Step A: Apply Migration
If you are running Supabase locally, make sure to apply the new migration:
```bash
npx supabase db push
```
*(Alternatively, you can copy the contents of `supabase/migrations/000021_add_gemini_api_key_to_families.sql` and run it directly in your Supabase Dashboard SQL Editor).*

#### Step B: Test Syncing
1. Open your browser, login to your account, and navigate to the **Settings** page.
2. Enter your Gemini API Key and click **Save**. You should see the *"Settings saved successfully!"* toast.
3. Open a **different web browser** (or an **Incognito Window**) and go to your app.
4. Log in to the same account (or a different member profile belonging to your family).
5. Go to the **Settings** page and verify that the Gemini API Key is already pre-filled!
6. Go to the **AI Advisor** page and verify that you can chat with the coach immediately without having to enter the API Key.
