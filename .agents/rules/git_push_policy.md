---
trigger: always_on
description: Rules for Git commit frequencies and mandatory push authorization flows using the ask_question tool.
---

# Git Operations & Push Policy

## Commit Frequency
- Create clean, incremental Git commits as tasks are checked off.

## Push Authorization Modal
- **CRITICAL**: BEFORE running any `git push` command, you MUST invoke the `ask_question` tool.
- Render options to the user (e.g., `"Yes, push to origin"` / `"No, wait"`).
- **STOP and wait** for explicit user approval via the interactive modal before executing the push command.
