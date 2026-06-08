# Walkthrough: AI Assistant Graphify Integration

This walkthrough details the setup and integration of the [Graphify](https://github.com/safishamsi/graphify) skill for AI coding assistants within this repository. 

Graphify enables AI agents to query a structured knowledge graph built from the codebase rather than manually grepping files, significantly speeding up architecture discovery, onboarding, and impact analysis.

## What Was Done

### 1. Installation of Dependencies
- Installed **pipx** globally to ensure isolated Python CLI package environments.
- Installed **graphifyy** via pipx, which exposed the `graphify` executable to the environment.

### 2. Antigravity Skill Registration
- Executed the integration command:
  ```powershell
  graphify install --platform antigravity --project
  ```
- This securely registered Graphify as a project-scoped skill for Google Antigravity inside the `.agents/` directory, specifically writing to:
  - `.agents/skills/graphify/SKILL.md`
  - `.agents/rules/graphify.md`
  - `.agents/workflows/graphify.md`
  - `.agents/skills/graphify/references/`

## How To Use It

Now that Graphify is installed, you can simply type `/graphify .` in your AI coding assistant prompt to generate or update the knowledge graph for the entire project.

The tool will produce:
- `graph.html`: A visual representation of the codebase.
- `GRAPH_REPORT.md`: Highlights of key concepts and god nodes.
- `graph.json`: The fully queryable graph data.

Once the graph is built, the AI assistant will automatically prioritize querying it when you ask architectural questions, saving time and tokens.

## Verification
- We verified the `.agents` integration files were created correctly.
- The files were staged to the git repository, ensuring any other agents connecting to this repository will automatically pick up the skill.
