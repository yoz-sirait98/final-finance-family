-- ============================================================
-- Family Finance — Supabase PostgreSQL Migration Script
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- This script is equivalent to running:
--   php artisan migrate --force
--
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).
-- ============================================================


-- ── 1. users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
    "id"                BIGSERIAL PRIMARY KEY,
    "name"              VARCHAR(255) NOT NULL,
    "email"             VARCHAR(255) NOT NULL UNIQUE,
    "email_verified_at" TIMESTAMP(0) WITHOUT TIME ZONE,
    "password"          VARCHAR(255) NOT NULL,
    "remember_token"    VARCHAR(100),
    "created_at"        TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"        TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 2. password_reset_tokens ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "email"      VARCHAR(255) NOT NULL,
    "token"      VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE,
    PRIMARY KEY ("email")
);

-- ── 3. sessions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "sessions" (
    "id"            VARCHAR(255) NOT NULL,
    "user_id"       BIGINT,
    "ip_address"    VARCHAR(45),
    "user_agent"    TEXT,
    "payload"       TEXT NOT NULL,
    "last_activity" INTEGER NOT NULL,
    PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "sessions_user_id_index"       ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_last_activity_index" ON "sessions" ("last_activity");

-- ── 4. cache ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "cache" (
    "key"        VARCHAR(255) NOT NULL,
    "value"      TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,
    PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "cache_locks" (
    "key"        VARCHAR(255) NOT NULL,
    "owner"      VARCHAR(255) NOT NULL,
    "expiration" INTEGER NOT NULL,
    PRIMARY KEY ("key")
);

-- ── 5. jobs / failed_jobs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "jobs" (
    "id"           BIGSERIAL PRIMARY KEY,
    "queue"        VARCHAR(255) NOT NULL,
    "payload"      TEXT NOT NULL,
    "attempts"     SMALLINT NOT NULL,
    "reserved_at"  INTEGER,
    "available_at" INTEGER NOT NULL,
    "created_at"   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "jobs_queue_index" ON "jobs" ("queue");

CREATE TABLE IF NOT EXISTS "job_batches" (
    "id"             VARCHAR(255) NOT NULL,
    "name"           VARCHAR(255) NOT NULL,
    "total_jobs"     INTEGER NOT NULL,
    "pending_jobs"   INTEGER NOT NULL,
    "failed_jobs"    INTEGER NOT NULL,
    "failed_job_ids" TEXT NOT NULL,
    "options"        TEXT,
    "cancelled_at"   INTEGER,
    "created_at"     INTEGER NOT NULL,
    "finished_at"    INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "failed_jobs" (
    "id"         BIGSERIAL PRIMARY KEY,
    "uuid"       VARCHAR(255) NOT NULL UNIQUE,
    "connection" TEXT NOT NULL,
    "queue"      TEXT NOT NULL,
    "payload"    TEXT NOT NULL,
    "exception"  TEXT NOT NULL,
    "failed_at"  TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. members ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "members" (
    "id"         BIGSERIAL PRIMARY KEY,
    "user_id"    BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "name"       VARCHAR(255) NOT NULL,
    "role"       VARCHAR(255) NOT NULL DEFAULT 'child'
                    CHECK ("role" IN ('father','mother','child')),
    "is_active"  BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 7. accounts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "accounts" (
    "id"              BIGSERIAL PRIMARY KEY,
    "user_id"         BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "name"            VARCHAR(255) NOT NULL,
    "type"            VARCHAR(255) NOT NULL
                         CHECK ("type" IN ('bank','cash','ewallet')),
    "balance"         NUMERIC(16,2) NOT NULL DEFAULT 0,
    "initial_balance" NUMERIC(16,2) NOT NULL DEFAULT 0,
    "icon"            VARCHAR(255),
    "is_active"       BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at"      TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"      TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 8. categories ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "categories" (
    "id"         BIGSERIAL PRIMARY KEY,
    "user_id"    BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "name"       VARCHAR(255) NOT NULL,
    "type"       VARCHAR(255) NOT NULL
                    CHECK ("type" IN ('income','expense')),
    "icon"       VARCHAR(255),
    "color"      VARCHAR(255),
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 9. transactions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "transactions" (
    "id"               BIGSERIAL PRIMARY KEY,
    "user_id"          BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "member_id"        BIGINT NOT NULL REFERENCES "members" ("id") ON DELETE CASCADE,
    "account_id"       BIGINT NOT NULL REFERENCES "accounts" ("id") ON DELETE CASCADE,
    "category_id"      BIGINT REFERENCES "categories" ("id") ON DELETE SET NULL,
    "type"             VARCHAR(255) NOT NULL
                          CHECK ("type" IN ('income','expense','transfer')),
    "amount"           NUMERIC(16,2) NOT NULL,
    "description"      VARCHAR(255),
    "transaction_date" DATE NOT NULL,
    "transfer_id"      BIGINT REFERENCES "transactions" ("id") ON DELETE SET NULL,
    "created_at"       TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"       TIMESTAMP(0) WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS "transactions_user_id_transaction_date_index" ON "transactions" ("user_id","transaction_date");
CREATE INDEX IF NOT EXISTS "transactions_user_id_type_index"             ON "transactions" ("user_id","type");

-- ── 10. budgets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "budgets" (
    "id"          BIGSERIAL PRIMARY KEY,
    "user_id"     BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "category_id" BIGINT REFERENCES "categories" ("id") ON DELETE SET NULL,
    "amount"      NUMERIC(16,2) NOT NULL,
    "month"       INTEGER NOT NULL,
    "year"        INTEGER NOT NULL,
    "created_at"  TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"  TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 11. recurring_transactions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "recurring_transactions" (
    "id"               BIGSERIAL PRIMARY KEY,
    "user_id"          BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "member_id"        BIGINT NOT NULL REFERENCES "members" ("id") ON DELETE CASCADE,
    "account_id"       BIGINT NOT NULL REFERENCES "accounts" ("id") ON DELETE CASCADE,
    "category_id"      BIGINT REFERENCES "categories" ("id") ON DELETE SET NULL,
    "type"             VARCHAR(255) NOT NULL CHECK ("type" IN ('income','expense')),
    "amount"           NUMERIC(16,2) NOT NULL,
    "description"      VARCHAR(255),
    "frequency"        VARCHAR(255) NOT NULL CHECK ("frequency" IN ('weekly','monthly','yearly')),
    "next_run_date"    DATE NOT NULL,
    "is_active"        BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at"       TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"       TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 12. goals ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "goals" (
    "id"             BIGSERIAL PRIMARY KEY,
    "user_id"        BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "account_id"     BIGINT REFERENCES "accounts" ("id") ON DELETE SET NULL,
    "name"           VARCHAR(255) NOT NULL,
    "target_amount"  NUMERIC(16,2) NOT NULL,
    "current_amount" NUMERIC(16,2) NOT NULL DEFAULT 0,
    "deadline"       DATE,
    "status"         VARCHAR(255) NOT NULL DEFAULT 'active'
                        CHECK ("status" IN ('active','completed','cancelled')),
    "created_at"     TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"     TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 13. goal_transactions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "goal_transactions" (
    "id"         BIGSERIAL PRIMARY KEY,
    "goal_id"    BIGINT NOT NULL REFERENCES "goals" ("id") ON DELETE CASCADE,
    "amount"     NUMERIC(16,2) NOT NULL,
    "note"       VARCHAR(255),
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 14. transaction_attachments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "transaction_attachments" (
    "id"             BIGSERIAL PRIMARY KEY,
    "transaction_id" BIGINT NOT NULL REFERENCES "transactions" ("id") ON DELETE CASCADE,
    "file_path"      VARCHAR(255) NOT NULL,
    "created_at"     TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"     TIMESTAMP(0) WITHOUT TIME ZONE
);

-- ── 15. personal_access_tokens (Sanctum) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "personal_access_tokens" (
    "id"             BIGSERIAL PRIMARY KEY,
    "tokenable_type" VARCHAR(255) NOT NULL,
    "tokenable_id"   BIGINT NOT NULL,
    "name"           VARCHAR(255) NOT NULL,
    "token"          VARCHAR(64) NOT NULL UNIQUE,
    "abilities"      TEXT,
    "last_used_at"   TIMESTAMP(0) WITHOUT TIME ZONE,
    "expires_at"     TIMESTAMP(0) WITHOUT TIME ZONE,
    "created_at"     TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"     TIMESTAMP(0) WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS "personal_access_tokens_tokenable_type_tokenable_id_index"
    ON "personal_access_tokens" ("tokenable_type","tokenable_id");

-- ── 16. activity_logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id"          BIGSERIAL PRIMARY KEY,
    "user_id"     BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "member_id"   BIGINT REFERENCES "members" ("id") ON DELETE SET NULL,
    "action"      VARCHAR(255) NOT NULL CHECK ("action" IN ('CREATE','UPDATE','DELETE')),
    "entity_type" VARCHAR(255) NOT NULL,
    "entity_id"   BIGINT NOT NULL,
    "before_data" JSONB,
    "after_data"  JSONB,
    "created_at"  TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"  TIMESTAMP(0) WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS "activity_logs_user_id_created_at_index"  ON "activity_logs" ("user_id","created_at");
CREATE INDEX IF NOT EXISTS "activity_logs_entity_type_entity_id_index" ON "activity_logs" ("entity_type","entity_id");

-- ── 17. net_worth_histories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "net_worth_histories" (
    "id"            BIGSERIAL PRIMARY KEY,
    "user_id"       BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "total_balance" NUMERIC(16,2) NOT NULL DEFAULT 0,
    "recorded_at"   DATE NOT NULL,
    "created_at"    TIMESTAMP(0) WITHOUT TIME ZONE,
    "updated_at"    TIMESTAMP(0) WITHOUT TIME ZONE,
    UNIQUE ("user_id", "recorded_at")
);

-- ── 18. Performance indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "budgets_user_month_year"
    ON "budgets" ("user_id","month","year");

CREATE INDEX IF NOT EXISTS "transactions_dashboard_lookup"
    ON "transactions" ("user_id","type","transfer_id","transaction_date");

CREATE INDEX IF NOT EXISTS "transactions_category_lookup"
    ON "transactions" ("user_id","category_id","type","transaction_date");

-- ── 19. migrations table (Laravel tracking) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "migrations" (
    "id"        SERIAL PRIMARY KEY,
    "migration" VARCHAR(255) NOT NULL,
    "batch"     INTEGER NOT NULL
);

-- Insert migration records so Laravel doesn't re-run them
INSERT INTO "migrations" ("migration", "batch") VALUES
    ('0001_01_01_000000_create_users_table', 1),
    ('0001_01_01_000001_create_cache_table', 1),
    ('0001_01_01_000002_create_jobs_table', 1),
    ('2024_01_01_000001_create_members_table', 1),
    ('2024_01_01_000002_create_accounts_table', 1),
    ('2024_01_01_000003_create_categories_table', 1),
    ('2024_01_01_000004_create_transactions_table', 1),
    ('2024_01_01_000005_create_budgets_table', 1),
    ('2024_01_01_000006_create_recurring_transactions_table', 1),
    ('2024_01_01_000007_create_goals_table', 1),
    ('2024_01_01_000008_create_goal_transactions_table', 1),
    ('2024_01_01_000009_create_transaction_attachments_table', 1),
    ('2026_03_13_180326_create_personal_access_tokens_table', 1),
    ('2026_03_24_000000_create_activity_logs_table', 1),
    ('2026_03_24_024946_add_performance_indexes', 1),
    ('2026_03_24_031106_add_initial_balance_to_accounts_table', 1),
    ('2026_03_24_062602_add_account_id_to_goals_table', 1),
    ('2026_03_24_080058_create_net_worth_histories_table', 1)
ON CONFLICT DO NOTHING;

-- ── Done ──────────────────────────────────────────────────────────────────────
SELECT 'Migration complete. Tables created: ' || count(*)::text
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
