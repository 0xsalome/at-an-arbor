# CLAUDE.md

## Communication
- Respond in Japanese
- Explain in a way that is easy for non-engineers to understand
- Add brief explanations when using technical terms
- Briefly explain the reason ("why") for each change

## Workflow
- Prioritize security above all else
- Propose options as needed and explain briefly
- Explain what you will do before taking action, and proceed only after my approval
- When possible, show demo pages or previews as we progress

## Safety Rules
- Do not directly touch production environments or production data
- Never commit or expose `.env` files or secrets
- Always confirm before deleting or overwriting files
- Break large changes into smaller steps and proceed incrementally
- Confirm with me before adding external packages
- Confirm with me before making API calls or sending data externally

## Project Information

- Project purpose: Digital Garden - A personal site for organically growing thoughts through blogs, poetry, and moments
- Technologies used: React 19 / TypeScript / Vite / react-router-dom / Markdown (gray-matter, marked)
- Main folder structure:
  - `components/` - Shared UI components (Nav, FadeIn, Comet, CompostCanvas)
  - `pages/` - Page components (Home, ContentDetail, SimplePage, etc.)
  - `content/` - Markdown content (blog/, moments/, poem/)
  - `public/` - Static files
  - `scripts/` - Build scripts (RSS generation)
- Files/folders not to touch:
  - `node_modules/`
  - `dist/`
  - `.git/`
  - Markdown files in `content/` (managed by Obsidian, do not edit unless instructed)

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Generate RSS + sitemap + build
npm run preview  # Preview build output
npm run publish <file> <type>  # Publish article with images
```

### Publishing Workflow
```bash
# Example: Publish a blog post from your draft vault
npm run publish ~/my-vault/drafts/new-post.md blog

# This copies:
# - new-post.md → content/blog/
# - Referenced images (![[image.png]]) → content/blog/images/
```

## AI Partner Protocol

**Important:** Claude acts as a development partner, automatically suggesting optimal tools, skills, and subagents based on context.

- Detailed settings: See `agent.md`
- Available tools inventory: See `INVENTORY.md` (auto-loaded at startup)

### Required Protocols
1. **Surgical Edit**: Apply 3-step process (Diagnosis → Approval → Surgery) for all code modifications
2. **Gemini Workflow**: Role division - Claude (architecture) ⇔ Gemini (implementation)
3. **Security Protocol**: Always perform XSS checks for input processing (WikiLink, etc.)

## Project-Specific Skills

### Design System
- Location: `.claude/skills/design-system/`
- Purpose: Consistent UI component definitions across the site (link styles, color palette, etc.)
- Usage: Reference when creating new components. Link styles are auto-applied
- See `.claude/skills/design-system/SKILL.md` for detailed specifications

## Efficiency Guidelines

### Recommended Subagents
- **Explore**: Codebase exploration (e.g., "Where is X processed?", "How does data flow between components?")
- **Plan**: Feature design planning (e.g., search functionality, new content types)
- **Bash**: Build execution, preview, and testing

### Token Optimization
- Delegate multi-file exploration to Explore subagent instead of manual Glob/Grep
- Save project patterns and decisions in agent-memory for reuse across sessions
- Use Plan mode before implementing large features to solidify design first

### AI Role Assignment (Claude + Gemini)
- **Claude**: Architecture decisions, security review, performance optimization, complex logic (RSS generation, routing)
- **Gemini**: Component implementation, CSS/animations, test creation, documentation generation

## Notes

- Content workflow: Edit in Obsidian → Copy to content/ folder → git push
- Hosted on GitHub Pages (https://0xsalome.github.io/at-an-arbor/)

## Astro + React Hybrid Architecture

### Architecture
- **Blog detail pages**: Static HTML generation with Astro (SEO optimized, WikiLink, backlinks)
- **Home/list pages**: React SPA (interactive UI)
- **Poem/Moment**: React SPA (unchanged)

### Build Commands
```bash
npm run build       # Full build (Astro + React + merge + RSS + Sitemap)
npm run dev         # React dev server
npm run dev:astro   # Astro dev server
npm run preview     # Preview build output
```

### WikiLink Feature
Writing `[[slug]]` or `[[slug|display text]]` in articles automatically converts to links to `/at-an-arbor/blog/slug`.

**Example**:
```markdown
See [[digital-gardening]] for details.
Check out [[terminology|glossary]] as well.
```

### Backlinks
A "📎 REFERENCED BY" section is auto-generated at the end of each article, showing other articles that reference it.

### Unlisted Articles
Setting `unlisted: true` in frontmatter treats articles as memo/reference content.

**Behavior**:
- Hidden from home screen
- Not included in RSS feed
- Accessible via direct link (`/at-an-arbor/blog/slug`)
- Referenceable via WikiLink
- Displayed in backlinks

**Example**:
```yaml
---
title: Glossary
unlisted: true
---
```

### Directory Structure
```
/Users/r/src/at-an-arbor/
├── astro-blog/           # Astro project
│   ├── src/
│   │   ├── pages/blog/[slug].astro
│   │   ├── layouts/BlogPost.astro
│   │   └── utils/
│   │       ├── wikilinks.ts
│   │       └── backlinks.ts
│   └── astro.config.ts
├── src/                  # React SPA
├── content/              # Markdown (shared)
├── public/               # Static files (shared)
├── scripts/
│   └── merge-builds.js   # Build integration
└── dist/                 # Final output
```