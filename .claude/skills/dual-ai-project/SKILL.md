---
name: dual-ai-project
description: "Use when setting up Claude+Gemini collaboration. Triggers: 'setup dual AI', 'Claude and Gemini project', 'create GEMINI.md', 'AI collaboration setup', 'multi-AI development'."
---

# Dual AI Project

Setup and management guide for projects using both Claude and Gemini.

## When to Use

- Starting a new project with Claude + Gemini collaboration
- Setting up CLAUDE.md and GEMINI.md for an existing project
- Reviewing or updating the AI collaboration structure

## Role Assignment

| AI | Responsibilities | Strengths |
|----|------------------|-----------|
| Claude | Design, review, bug fixes, complex decisions | Reasoning, nuanced judgment |
| Gemini | Implementation, refactoring, test creation | Fast code generation, cost-efficient |

## Setup

Create two files at project root:

### CLAUDE.md (Concise)
- Communication / Workflow / Safety Rules
- Project Information (overview only)
- Design Philosophy
- Efficiency Guidelines (subagent usage)

### GEMINI.md (Detailed)
- Same base rules
- Current Progress (completed work)
- Next Tasks (what to do next)
- Development History (who did what, when)

## Handoff Flow

```
Claude                    Gemini                    Claude
  │                         │                         │
  ▼                         │                         │
Design & Specs ───────────▶ │                         │
  │                         ▼                         │
  │                    Implementation ───────────────▶│
  │                         │                         ▼
  │                         │                      Review
```

1. **Claude → Gemini**: Write tasks in "Next Tasks" section
2. **Gemini → Claude**: Record completed work in "Development History"
3. **Claude reviews**: Fix bugs, suggest improvements as needed

## File Templates

Use templates from `templates/` folder:
- `CLAUDE.md.template` - Base template with efficiency guidelines
- `GEMINI.md.template` - Template with progress tracking sections

## Setup Commands

```bash
# Copy templates to project root
cp ~/src/skills-repo/dual-ai-project/templates/CLAUDE.md.template ./CLAUDE.md
cp ~/src/skills-repo/dual-ai-project/templates/GEMINI.md.template ./GEMINI.md

# Edit Project Information section in both files
```

## Best Practices

1. **Keep CLAUDE.md stable** - Update only when project scope changes
2. **Update GEMINI.md frequently** - Track all progress and tasks
3. **Clear handoffs** - Write specific, actionable tasks
4. **Record decisions** - Document why, not just what
