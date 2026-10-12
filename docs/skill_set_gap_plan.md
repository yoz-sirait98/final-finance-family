# Skill-Set Gap Plan — Final Finance Family
_Reviewed 2026-10-09. Living doc; append, don't overwrite (see .agents/rules/documentation_lifecycle.md)._

## Purpose
This is NOT a feature implementation plan (that lives in `docs/implementation_plan.md`).
This document plans how to grow the Hermes agent skill set so future work in this
repo starts warm instead of cold. It answers: "what here is outside my loaded skills,
how much does it matter, and how do I close the gap safely?"

## What already covers the repo (no skill to build)
- **`.agents/skills/final-finance-family-project/SKILL.md`** — the authoritative
  architecture + DB-schema (migrations 000001-000038) + service/store map + 6 workspace
  implementation rules. This already encodes Supabase/RLS, the Dexie offline scheduler,
  the AI router, dual responsive views, BIGINT-vs-UUID, Pockets semantics, etc.
- **`.agents/skills/supabase`** + **`supabase-postgres-best-practices`** — locked via
  `skills-lock.json` (from `supabase/agent-skills`).
- **`.agents/skills/graphify`** + `graphify-out/` knowledge graph.
- Hermes memory: SAP/ABAP is unrelated to this repo; ignore those skills here.

So Supabase, Postgres, RLS, offline Dexie sync, pg_cron, multi-AI router — all covered.
The gaps below are what ISN'T encoded anywhere reusable for an agent that only loads
Hermes' default skill set.

## Gap inventory (scored)
| # | Gap area | Why it's new/risky | Severity | Existing coverage |
|---|----------|--------------------|----------|-------------------|
| G1 | **Vue 3 + Vite PWA offline-first** (Dexie/idb-keyval queues, vite-plugin-pwa `InjectManifest`, `sw.js`, cache-first, update flow) | No Vue skill at all. The offline→Supabase conflict-resolution rules are NOT in any skill; getting them wrong loses user data. | **HIGH** | none |
| G2 | **Build/test loop** (`npm run build`, `test_meals_pure.js` pure-logic suite, how to run without dev server) | Cheap and high-frequency; knowing the loop prevents "I couldn't run it" stalls. | **HIGH (cheap)** | none |
| G3 | **Supabase port-5432 network workaround** (office Ethernet blocks 5432; use REST/443 or hotspot for `db push`/`pull`) | If I don't know this, migrations/tests appear to "hang." Pure gotcha, one line, huge. | **HIGH (cheap)** | `.agents/rules/supabase_network_restriction.md` (repo-local only) |
| G4 | **VAPID Web Push + Heroku relay** (`deploy/push-endpoint.js`, `pushDispatcherService.js`, subscription lifecycle) | Push setup/keys/test is fiddly; no skill. | MEDIUM | none |
| G5 | **Client-side OCR + receipt extraction** (Tesseract.js offline + Gemini vision fallback, auto-fill) | Two backends with fallback; no skill. | MEDIUM | walkthrough docs only |
| G6 | **Google Calendar OAuth 2.0 PKCE** | OAuth PKCE is standard; the service wrapper is thin. | LOW | walkthrough doc |
| G7 | **WhatsApp bot / webhook** (`000025`-`000030`) | External Heroku bot; niche. | LOW | walkthrough doc |
| G8 | **Dual responsive view rule** (edit desktop + mobile + both locales) | Already in project skill §5. | — | covered |
| G9 | **BIGINT member vs UUID profile** | Already in project skill §1. | — | covered |

## Decisions on skill placement
- The repo-local `.agents/skills/` tree is consumed by a DIFFERENT agent runtime
  (Gemini/Antigravity), not Hermes. Hermes loads `~/.hermes/skills/<category>/<name>/SKILL.md`.
- So Hermes-useful skills go user-local via `skill_manage(create)` (category
  `software-development`), and stay **cross-project-reusable**: Vue PWA offline-first,
  Supabase-over-blocked-port. Repo-specific trivia (exact store map) stays in the repo's
  own project skill — not duplicated into Hermes memory (memory budget rule).

## Implementation plan (phased, with completion criteria)
### Phase 1 — HIGH value, low cost (do now / next sessions)
- [x] **S1. Vue 3 + Vite PWA offline-first skill** (`vue-pwa-offline-first`).
      Covers: composition-API conventions, Pinia store shape, the two offline queues
      (idb-keyval mutation queue + Dexie scheduler sync), vite-plugin-pwa InjectManifest +
      precache + update flow, offline→online reconciliation order, dual d-md-block/d-md-none
      views + en/id locale pairs. DONE this session.
      Criterion: `skill_view('vue-pwa-offline-first')` loads with When to Use + Procedure + Pitfalls + Verification.
- [ ] **S2. Build/test-loop appendix** inside S1 or a tiny `vite-build-loop` skill: exact
      `cd frontend && npm run build` and `node frontend/scripts/test_meals_pure.js` commands,
      "no dev server needed for logic tests" note. Criterion: commands copy-paste runnable.
- [ ] **S3. Supabase-over-blocked-port gotcha skill** (`supabase-blocked-port`): detect a
      hanging `supabase db push/pull` = blocked 5432; route to HTTPS REST (443) for queries,
      hotspot for direct CLI. Criterion: agent stops guessing and names the workaround in 1 step.

### Phase 2 — MEDIUM value
- [ ] **S4. VAPID web-push skill**: key generation, subscription storage in
      `push_subscriptions`, the Heroku relay endpoint contract, test path.
- [ ] **S5. Client-side OCR + vision fallback skill**: Tesseract.js worker setup,
      when Gemini vision beats OCR, the auto-fill→category pipeline.

### Phase 3 — LOW / as-needed (don't pre-build; make on first encounter)
- [ ] S6 Google Calendar OAuth PKCE skill.
- [ ] S7 WhatsApp bot skill.

## Anti-churn guardrail
Do NOT create S4-S7 speculatively. The Hermes guidance ("prefer extending over
narrow sibling; create when a recurring workflow demands it") means: build each
Phase-2/3 skill only the first time a task actually exercises that subsystem, then
capture it from real work, not from the README.
