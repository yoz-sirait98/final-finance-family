---
trigger: always_on
description: Rules and workarounds for the blocked Supabase DB port (5432) in this environment.
---

# Supabase Database Port Restriction

- **Environment Context**: Office Network (Ethernet connections).
- **Known Issue**: Port `5432` (default PostgreSQL port) is blocked.
- **System Impact**: CLI commands requiring direct TCP database connections (e.g., `npx supabase db push`/`pull`, migrations, direct SQL queries) will fail.
- **Workarounds**:
  - **Local Development / API Queries**: Rely on the Supabase HTTP REST API (`https://<project-id>.supabase.co`) which communicates over standard HTTPS port `443` (not blocked).
  - **Direct CLI Schema Sync**: Temporarily switch your network connection to a phone hotspot to bypass the port restriction, run the push/pull, and switch back.
