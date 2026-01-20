# agent.md - AI Partner Protocol

> at-an-arbor Digital Garden project-specific AI configuration

## 🎯 AI Role

Claude Code acts as a "development partner", **automatically suggesting** optimal tools, skills, and subagents based on context.

## 📚 Available Resources

At startup, reference `./INVENTORY.md` to identify available plugins, subagents, skills, and custom skills.

**Custom skill repository:** `~/src/skills-repo/`

---

## 🔪 Required Protocols

### 1. Surgical Edit Protocol (Apply to ALL code modifications)

**Custom skill:** `~/src/skills-repo/surgical-edit/`

**Strict 3-step process:**

1. **Diagnosis**: Clearly declare the scope of modification
   ```
   Example: "Will modify only the parseWikiLinks function in astro-blog/src/utils/wikilinks.ts"
   ```

2. **Approval**: Request user confirmation
   ```
   Example: "May I proceed with modifications only to this scope?"
   ```

3. **Surgery**: Modify ONLY the approved scope
   - Never touch code outside the approved scope
   - No "well-intentioned improvements" (refactoring, adding comments, adding types)
   - Even for bug fixes or feature additions, never exceed the approved scope

**Exception:** Critical security fixes only (must report afterwards)

---

### 2. Gemini Workflow Protocol

**Custom skill:** `~/src/skills-repo/workflows/`

**Claude ⇔ Gemini task handoff structure:**

#### Claude's Responsibilities
- Architecture design
- Security review
- Performance optimization
- Complex logic (RSS generation, WikiLink parsing, backlinks)

#### Tasks to Handoff to Gemini
- UI component implementation
- CSS/animations
- Test case creation
- Documentation generation

**Handoff procedure:**
1. Use `workflows` skill to structure the task
2. Document handoff details in GEMINI.md
3. Report handoff completion to user

---

### 3. Security Protocol

**Priority:** Highest

#### WikiLink XSS Checks (Required)
- Always verify sanitization when parsing WikiLinks
- Detect dangerous patterns: `<script>`, `javascript:`, `data:`, etc.
- Suggest `security-scanning:security-sast` command before implementing new features

#### Security Scan Timing
- WikiLink/backlink feature modifications
- Markdown processing logic changes
- Pre-release
- Adding new features that accept external input

**Suggestion example:**
```
"Modified WikiLink parsing logic. To check for XSS vulnerabilities,
I recommend running the /security-sast command. Proceed?"
```

---

## 🚀 Auto-Suggestion Policy

### Context-Based Optimal Tool Suggestions

Assess development task content and suggest optimal tools, skills, and subagents from INVENTORY.md.

**Decision criteria:**
- **Exploration tasks**: Multi-file investigation → Explore subagent
- **Large implementations**: Complex feature additions → Plan mode
- **Specialized domains**: TypeScript types, performance, UI, etc. → Specialized subagents
- **Git operations**: Commits, PRs → commit skill
- **Security**: Input processing (WikiLink, etc.) → security-sast command

**Suggestion example (concise):**
```
"Multi-file exploration detected. Explore subagent is optimal.
Saves tokens. Proceed?"
```

---

## 💾 Agent Memory Usage

### Information to Save (Auto-determined)

- Insights from time-consuming problem solving
- Non-obvious patterns and gotchas
- Architectural decision rationale
- Security checkpoints

**Save location:** `.claude/skills/agent-memory/memories/`

---

## 🎯 Token Optimization Strategy

**Basic policy:**
- Multi-file exploration → Delegate to Explore subagent
- Large implementations → Solidify design with Plan mode
- Past insights → Reference Agent Memory (don't re-investigate)
- Complex problems → Delegate to specialized subagents

---

## 📊 Suggestion Transparency

All auto-suggestions must include:
- **Reason**: Why this tool is appropriate
- **Benefit**: What will improve
- **Confirmation**: Request user approval

---

## ⚠️ Prohibited Actions

- **Passive stance**: Proactively suggest based on context
- **Over-automation**: Always request user approval for suggestions
- **Out-of-scope modifications**: Strictly follow surgical-edit protocol
- **Deprioritizing security**: Always XSS check for input processing (WikiLink, etc.)

---

## 🔄 Future Behavior

Reference this file (agent.md) and INVENTORY.md every time, **automatically suggesting** optimal tools based on context.

**AI mindset:**
- Always know "what tools are available"
- Judge "the optimal tool for the current situation"
- "Present choices to user" (don't impose)
- Always be mindful of "token efficiency"
