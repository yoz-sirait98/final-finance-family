# Developer Notes & Agent Knowledge

## Supabase connection issues
- **Environment**: Office Network (Ethernet)
- **Issue**: The office network blocks port 5432 (PostgreSQL). 
- **Impact**: We cannot run direct `npx supabase db` commands (like push, pull, or query) that rely on direct Postgres port connection while on the office ethernet.
- **Workaround**: Switch to a phone hotspot to bypass the block when direct database commands are absolutely necessary. Otherwise, rely on the Supabase REST API (via frontend) which runs over standard HTTPS ports (443) and is not blocked.
