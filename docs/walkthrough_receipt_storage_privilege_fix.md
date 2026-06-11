# Walkthrough: Supabase Storage RLS Privileges Fix

**Date:** 2026-06-11  
**Branch:** `redesign-ui-supabase-stack`  
**Commit:** `678e75b`

---

## Issue Description

When attempting to deploy migration `000023_add_storage_bucket_and_rls_policies.sql` via the Supabase Dashboard SQL Editor or direct migrations, the following database error was encountered:

```
ERROR: 42501: must be owner of table objects
```

### Cause of the Error
* **Internal Schema Ownership**: The `storage` schema (specifically the `storage.objects` and `storage.buckets` tables) is managed internally by Supabase and is owned by a system user role (`supabase_storage_admin`).
* **Privilege Restrictions**: Because the user-facing role in the Supabase Dashboard SQL Editor (typically `postgres`) is not the owner of `storage.objects`, executing structural changes like `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;` triggers a PostgreSQL ownership violation error (code `42501`).

---

## Technical Solution

Row Level Security (RLS) is already enabled by default on the `storage.objects` table in modern Supabase projects. Therefore, explicitly running an `ALTER TABLE` statement to enable RLS is redundant.

### File Modifications

#### `supabase/migrations/000023_add_storage_bucket_and_rls_policies.sql`
Removed the redundant `ALTER TABLE` statement so that only the necessary bucket insertion and policy definitions are executed:

```diff
 -- Ensure the receipts bucket exists in storage
 INSERT INTO storage.buckets (id, name, public)
 VALUES ('receipts', 'receipts', false)
 ON CONFLICT (id) DO NOTHING;
 
--- Enable Row Level Security on storage.objects
-ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-
 -- Allow authenticated users to upload/insert files to their own family_id folder in the receipts bucket
 DROP POLICY IF EXISTS "Allow authenticated uploads to family receipts folder" ON storage.objects;
 CREATE POLICY "Allow authenticated uploads to family receipts folder"
```

---

## Verification Plan & Results

1. **SQL Policy Validation**: Successfully tested running the SQL policy creation queries without the `ALTER TABLE` line in the Supabase Dashboard SQL Editor. The bucket creation and RLS policies deployed cleanly with zero errors.
2. **Graphify AST Rebuild**: Ran the `graphify update .` command to update the AST graph database representation:
   ```bash
   graphify update .
   ```
   * **Result**: `Re-extracting code files in . (no LLM needed)... AST extraction: 111/111 files (100%)`
3. **Remote Push**: Pushed the updated migration file containing the fix to the origin repository branch:
   ```bash
   git push origin redesign-ui-supabase-stack
   ```
