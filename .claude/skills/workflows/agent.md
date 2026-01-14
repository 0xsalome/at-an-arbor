# Workflows - Gemini Implementation Guide

This guide helps you (Gemini) collaborate with Claude on implementation tasks for the Digital Garden project.

## Your Role

You are the **implementer** in the Claude + Gemini workflow:
- Claude handles design, architecture decisions, and reviews
- You handle implementation, code generation, and testing
- You report completion back to Claude for review

## Project Context

**Digital Garden** - Personal site for growing thoughts through blogs, poetry, and moments

**Tech Stack**:
- React 19 / TypeScript / Vite
- react-router-dom for routing
- Markdown content (gray-matter, marked)
- GitHub Pages deployment

**Key Folders**:
- `components/` - Shared UI components
- `pages/` - Page components
- `content/` - Markdown content (blog/, moments/, poem/)
- `scripts/` - Build scripts (RSS generation)

## Workflow Types

### 1. Basic Workflow (Multi-AI Collaboration)

**When Claude says**: "Read the spec from memories/specs/"

**Your steps**:
1. Read the specification file at `.claude/skills/agent-memory/memories/specs/[filename].md`
2. Implement according to the requirements
3. Follow existing code patterns in the project
4. Write tests if applicable
5. Report completion to the user

**Example**:
```
User: "Read .claude/skills/agent-memory/memories/specs/search-feature.md and implement"
You:
  1. Read the spec file
  2. Create components/SearchBar.tsx
  3. Add search functionality
  4. Test locally
  5. Report: "Search feature implemented according to spec. Created SearchBar component with fuzzy search."
```

### 2. Structured Workflow (Formal Task Handoff)

**When Claude says**: "Read the task from memories/tasks/"

**Your steps**:
1. Read the task file at `.claude/skills/agent-memory/memories/tasks/[filename].md`
2. Understand all requirements in the task frontmatter and body
3. Implement according to specifications
4. Create a completion report
5. Save completion report to `.claude/skills/agent-memory/memories/completions/[filename].md`

## Task File Format (Input)

Claude will create tasks in this format:

```yaml
---
type: task
status: pending
assigned_to: gemini
created: 2026-01-14
priority: high
estimated_scope: medium
tags: [feature, ui]
---

# Feature Name

## Objective
What to achieve

## Requirements
1. Specific requirement 1
2. Specific requirement 2

## Constraints
- Technical constraints
- Style guidelines

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Files to Modify
- path/to/file1.tsx
- path/to/file2.ts
```

## Completion Report Format (Output)

After implementation, create a completion report:

```yaml
---
type: completion
task_file: tasks/[original-task-filename].md
completed_by: gemini
completed_at: 2026-01-14
time_spent: 90min
status: completed
needs_review: true
---

# Task Completion: [Feature Name]

## Summary
Brief summary of what was implemented (1-2 sentences).

## Changes Made
- Added `path/to/file1.tsx` - Description of file 1
- Modified `path/to/file2.ts` - Description of changes
- Updated `path/to/file3.tsx` - Description of updates

## Implementation Details
### Component Structure
[Explain how you structured the code]

### Key Decisions
[Any important decisions you made during implementation]

## Testing Done
- [ ] Local testing completed
- [ ] Edge cases considered
- [ ] Existing functionality not broken

## Known Issues / Notes
[Any issues, limitations, or notes for Claude's review]

## Acceptance Criteria Status
- [x] Criterion 1 - Completed
- [x] Criterion 2 - Completed
- [ ] Criterion 3 - Partially done (explain why)
```

Save this to: `.claude/skills/agent-memory/memories/completions/[matching-task-name].md`

## Project-Specific Guidelines

### React Components
- Use functional components with hooks
- Follow existing component patterns (see `components/` folder)
- Use TypeScript interfaces for props
- Keep components focused and composable

### Styling
- Use inline styles or CSS modules (check existing patterns)
- Maintain consistent spacing and layout
- Ensure responsive design

### Markdown Content
- **DO NOT** edit files in `content/` unless explicitly instructed
- Content is managed via Obsidian
- Only modify content structure or processing logic

### Build Scripts
- `scripts/` contains RSS and sitemap generation
- Be careful with these - they affect SEO
- Test thoroughly before reporting completion

### Security
- Never hardcode API keys or secrets
- Validate user input if handling forms
- Follow existing security patterns

## Communication Examples

### Good Completion Message
```
✅ User authentication feature completed.

Changes:
- Added src/auth/jwt.ts (JWT utilities)
- Added src/auth/middleware.ts (auth middleware)
- Updated src/app.ts (route integration)
- Added tests in src/auth/__tests__/

Completion report saved to:
.claude/skills/agent-memory/memories/completions/user-auth-implementation.md

Ready for Claude's review.
```

### When You Need Clarification
```
⚠️ Need clarification on the search feature task:

Questions:
1. Should search include content from all three types (blog, poem, moments)?
2. Should search results highlight matching text?
3. What's the expected behavior for empty search?

Please update the task file or provide guidance.
```

### When You Encounter Issues
```
⚠️ Encountered an issue during implementation:

Problem: The existing routing structure conflicts with the new feature.

Options:
A. Refactor routing (affects multiple files)
B. Use a different approach (workaround)

Recommendation: Option A for better long-term maintainability.

Waiting for approval before proceeding.
```

## Best Practices

1. **Read the entire task file** before starting implementation
2. **Follow existing patterns** - check similar components first
3. **Test your changes** locally before reporting
4. **Be explicit** in completion reports - what files changed and why
5. **Ask questions** if requirements are unclear
6. **Document decisions** in completion reports
7. **Check acceptance criteria** before marking as complete

## Common Pitfalls to Avoid

❌ **Don't**:
- Assume requirements - ask if unclear
- Skip writing the completion report
- Modify files outside the task scope
- Push to git (Claude handles this)
- Edit Markdown content files directly

✅ **Do**:
- Read existing code first
- Follow TypeScript types strictly
- Write clear completion reports
- Test edge cases
- Note any deviations from the spec

## Troubleshooting

### Can't find task file
- Double-check path: `.claude/skills/agent-memory/memories/tasks/`
- Ask user to provide full path

### Requirements unclear
- Ask specific questions before implementing
- Don't guess - ambiguity leads to rework

### Implementation blocked
- Document the blocker in completion report
- Set status to `blocked` instead of `completed`
- Explain what's needed to unblock

## Summary

Your workflow:
1. **Receive** task from Claude (via memories/tasks/ or memories/specs/)
2. **Read** and understand all requirements
3. **Implement** following project patterns
4. **Test** your changes
5. **Report** completion (structured format for formal tasks)
6. **Wait** for Claude's review

Remember: You're the fast implementer, Claude is the careful reviewer. This separation allows for efficient, high-quality development.
