---
name: workflows
description: "Daily AI collaboration workflows. Triggers: 'create task for Gemini', 'handoff to Gemini', 'structured workflow', 'multi-AI collaboration'."
---

# Workflows

Practical Multi-AI Collaboration workflow guides for daily Claude + Gemini coordination.

## When to Use

- Delegating implementation tasks to Gemini
- Executing Claude → Gemini → Claude workflows
- Performing structured task handoffs
- Recording and managing work between AIs

## Available Workflows

### 1. Multi-AI Collaboration (Basic Workflow)

**File**: `multi-ai-collaboration.md`

**Flow**:
```
Claude: Design & Specs
   ↓
Gemini: Implementation
   ↓
Claude: Review
```

**Usage**:
- Claude saves design docs to `memories/specs/`
- Gemini reads specs and implements
- Claude reviews implementation and saves to `memories/reviews/`

**Best for**:
- Simple feature additions
- Implementations following existing patterns
- Small to medium tasks

### 2. Structured AI Handoff (Formalized Workflow)

**File**: `structured-ai-handoff.md`

**Flow**:
```
Claude: Create standardized task file (memories/tasks/)
   ↓
Gemini: Implement + Create completion report (memories/completions/)
   ↓
Claude: Automated review + Report to user
   ↓
User: Final approval + Git Push
```

**Usage**:
- Claude creates task in standard format
- Gemini implements and reports completion in standard format
- Claude performs automated review and reports to user
- User gives final approval and pushes

**Best for**:
- Complex feature implementations
- Multi-file changes
- Security or performance-critical tasks
- Changes requiring strict review

## Integration with agent-memory

Both workflows integrate with the `agent-memory` skill:

```
.claude/skills/agent-memory/memories/
├── specs/          ← Design docs & specifications (Claude creates)
├── tasks/          ← Task instruction files (Claude creates)
├── completions/    ← Completion reports (Gemini creates)
├── reviews/        ← Review results (Claude creates)
└── handoff/        ← AI-to-AI handoff notes
```

## Quick Start

### For Simple Tasks

```
You: "Add login functionality"
Claude: [Creates design doc, saves to memories/specs/]
You: [Switch to Gemini] "Read .claude/skills/agent-memory/memories/specs/login-feature.md and implement"
Gemini: [Implements]
You: [Switch to Claude] "Review the implementation"
Claude: [Performs review]
```

### For Complex Tasks

```
You: "Implement authentication system"
Claude: [Creates task file, saves to memories/tasks/]
You: [Switch to Gemini] "Read .claude/skills/agent-memory/memories/tasks/auth-system.md and implement"
Gemini: [Implements + saves completion report to memories/completions/]
You: [Switch to Claude] "Review Gemini's completion report"
Claude: [Automated review + reports to user (no auto-push)]
You: [After review, manually commit & push]
```

## Commands for Claude

Example phrases to use this skill:

```
"Create a task for Gemini: user profile edit feature"
"Use multi-ai-collaboration workflow"
"Use structured-ai-handoff for strict review"
"Review the completion report"
```

## Project-Specific Recommendations

For this project (Digital Garden):

- **Simple UI changes**: Multi-AI Collaboration
- **New content type additions**: Structured AI Handoff
- **RSS/Sitemap feature changes**: Structured AI Handoff (security-critical)
- **New component creation**: Multi-AI Collaboration

## Best Practices

1. **Task granularity**: 1 task = 1-3 file changes as a guideline
2. **Clear instructions**: Ambiguous requirements lead to implementation drift
3. **Review focus**: Security, requirement compliance, code quality
4. **Keep records**: Saving to memories enables traceability

## Related Skills

- [agent-memory](../agent-memory/SKILL.md) - Persistent memory system
- [dual-ai-project](../dual-ai-project/SKILL.md) - Initial project setup

## Documentation

See individual workflow files for details:
- `multi-ai-collaboration.md` - Basic workflow details
- `structured-ai-handoff.md` - Structured workflow details
