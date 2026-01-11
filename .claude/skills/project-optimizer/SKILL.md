---
name: project-optimizer
description: "Analyze project and recommend optimal AI collaboration setup. Triggers: 'optimize this project', 'recommend AI setup', 'efficient development setup', 'analyze project structure', 'what subagents should I use'."
---

# Project Optimizer

Analyze a project and recommend the optimal AI collaboration configuration.

## When to Use

- Starting work on a new or unfamiliar project
- Want to optimize token usage and development efficiency
- Need recommendations for subagent and skill usage
- Setting up Claude + Gemini collaboration

## Analysis Process

### Step 1: Analyze Project Structure

```bash
# Check project type indicators
ls -la
cat package.json 2>/dev/null | head -20
cat Cargo.toml 2>/dev/null | head -20
cat go.mod 2>/dev/null | head -10
cat requirements.txt 2>/dev/null | head -10
ls src/ 2>/dev/null
```

### Step 2: Identify Project Type

| Indicators | Project Type |
|------------|--------------|
| package.json + react/next | React/Next.js Web App |
| package.json + express/fastify | Node.js API |
| Cargo.toml | Rust Project |
| go.mod | Go Project |
| requirements.txt + django/flask | Python Web App |
| requirements.txt + pandas/numpy | Data Science |
| bin/ or CLI indicators | CLI Tool |

### Step 3: Generate Recommendations

Based on project type, recommend:
1. **Subagent usage patterns**
2. **Skills to install**
3. **Claude vs Gemini task allocation**
4. **Token optimization strategies**

## Recommendations by Project Type

### React/Next.js Web App

**Subagents:**
- Explore: Component discovery, understanding data flow
- Plan: Feature implementation planning

**Gemini Tasks:**
- Component implementation
- Styling (CSS/Tailwind)
- Test creation

**Claude Tasks:**
- State management design
- API integration review
- Performance optimization decisions

**Skills:** agent-memory, dual-ai-project

---

### Node.js API / Backend

**Subagents:**
- Explore: Route discovery, middleware understanding
- Plan: API design, database schema planning

**Gemini Tasks:**
- CRUD endpoint implementation
- Validation logic
- Test creation

**Claude Tasks:**
- Security review
- Error handling design
- Database query optimization

**Skills:** agent-memory, dual-ai-project

---

### CLI Tool

**Subagents:**
- Explore: Command structure discovery
- Bash: Testing commands

**Gemini Tasks:**
- Command implementation
- Help text generation
- Argument parsing

**Claude Tasks:**
- UX design (flags, output format)
- Edge case handling
- Documentation review

**Skills:** agent-memory

---

### Data Science / ML

**Subagents:**
- Explore: Dataset understanding, pipeline discovery

**Gemini Tasks:**
- Data preprocessing scripts
- Visualization code
- Boilerplate notebooks

**Claude Tasks:**
- Algorithm selection
- Results interpretation
- Statistical validation

**Skills:** agent-memory

---

### Library / Package

**Subagents:**
- Explore: API surface discovery
- Plan: API design planning

**Gemini Tasks:**
- Implementation
- Test coverage expansion
- Documentation generation

**Claude Tasks:**
- API design decisions
- Breaking change review
- Type system design

**Skills:** agent-memory, dual-ai-project

---

## Output Format

After analysis, create or update CLAUDE.md with:

```markdown
## Efficiency Guidelines

### Recommended Subagents
- [SUBAGENT]: [WHEN_TO_USE]

### Token Optimization
- [STRATEGY]

### AI Role Assignment
- Claude: [TASKS]
- Gemini: [TASKS]

### Recommended Skills
- [SKILL_NAME]: [WHY]
```

## Quick Setup

```bash
# Install recommended skills
mkdir -p .claude/skills/agent-memory/memories
cp ~/src/skills-repo/agent-memory/SKILL.md .claude/skills/agent-memory/
cp ~/src/skills-repo/agent-memory/.gitignore .claude/skills/agent-memory/

# For dual-AI projects
cp ~/src/skills-repo/dual-ai-project/templates/CLAUDE.md.template ./CLAUDE.md
cp ~/src/skills-repo/dual-ai-project/templates/GEMINI.md.template ./GEMINI.md
```
