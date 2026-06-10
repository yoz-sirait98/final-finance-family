---
trigger: always_on
description: Rules for managing and updating implementation plans, tasks, and walkthrough lifecycle documents.
---

# Documentation & Artifact Lifecycle

## Auto-Update Rule
- Automatically update relevant planning, checklists, and status documents upon completing code updates. This ensures the workspace state matches implementation:
  - **Brain/Scratch Artifacts**: Update `task.md` and `implementation_plan.md` in the current conversation directory.
  - **Local Directory Docs**: Synchronize changes to `docs/task.md` and `docs/implementation_plan.md`.

## Implementation Plan Lifecycle & Archiving
- Before initiating a new feature's design:
  1. Archive the current `implementation_plan.md` by saving a copy to the scratch/artifacts folder named `old_plan_YYYY_MM_DD.md`.
  2. For the new plan, **append and combine** the detailed sections into `docs/implementation_plan.md` instead of overwriting the document.
