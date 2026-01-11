# GEMINI.md

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
- Do not proceed based on assumptions; ask questions if anything is unclear
- Break down complex tasks and confirm each step

## Safety Rules
- Do not directly touch production environments or production data
- Never commit or expose `.env` files or secrets
- Always confirm before deleting or overwriting files
- Break large changes into smaller steps and proceed incrementally
- Confirm with me before adding external packages
- Confirm with me before making API calls or sending data externally

## Project Information

- **Project purpose**: Digital Garden - A personal site for organically growing thoughts through blogs, poetry, and moments
- **Technologies used**:
  - React 19 / TypeScript / Vite
  - react-router-dom (routing)
  - gray-matter, marked (Markdown processing)
- **Main folder structure**:
  - `components/` - Shared UI components (Nav, FadeIn, Comet, CompostCanvas)
  - `pages/` - Page components (Home, ContentDetail, SimplePage, etc.)
  - `content/` - Markdown content (blog/, moments/, poem/)
  - `public/` - Static files
  - `scripts/` - Build scripts (RSS generation)
- **Files/folders not to touch**:
  - `node_modules/`, `dist/`, `.git/`
  - Markdown files in `content/` (managed by Obsidian, do not edit unless instructed)

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Generate RSS + sitemap + build
npm run preview  # Preview build output
npm run publish <file> <type>  # Publish article with images (e.g., npm run publish ~/draft/post.md blog)
```

## Your Role (Gemini)

As Gemini, you are responsible for:
- **Component implementation**: Creating new React components, updating existing ones
- **Styling**: CSS, animations, responsive design
- **Test creation**: Writing tests for components and utilities
- **Documentation**: Generating code comments and user-facing docs

Leave these tasks to Claude:
- Architecture and design decisions
- Security review
- Performance optimization strategies
- Complex logic (RSS generation, routing structure)

## AI Collaboration

### Shared Context
- **Agent Memory**: Read `.claude/skills/agent-memory/memories/` for project context, decisions, and background
- Before starting work, check `memories/project-context/` for optimization plan and user intentions
- Claude's instructions are in `CLAUDE.md`

### Handoff Protocol
1. Read agent-memory for context
2. Update "Current Progress" section when completing tasks
3. Add notes to "Development History" for significant changes

## Notes

- Content workflow: Edit in Obsidian (private vault) → `npm run publish` → git push
- Hosted on GitHub Pages (https://0xsalome.github.io/at-an-arbor/)
- Site philosophy: "Private garden that happens to be public" - avoid metrics, comments, over-categorization

---

## Current Progress (2026-01-11)

### Completed by Claude
- Created `robots.txt`
- Created `scripts/generate-sitemap.js`
- Updated `scripts/generate-rss.js` to include moments
- Created `scripts/publish.js` (article + image copy helper)
- Updated `package.json` with new scripts

### Pending
- **Image optimization**: `public/images/ogp.png` (1.5MB) and `contour.jpg` (1.5MB) need compression to < 200KB each

---

## Next Tasks

### 1. Image Optimization (Assigned to Gemini)
Compress large images to improve page load:

| File | Current | Target |
|------|---------|--------|
| `public/images/ogp.png` | 1.5MB | < 200KB |
| `public/images/contour.jpg` | 1.5MB | < 300KB |

Options:
- Use ImageMagick: `convert input.png -quality 85 -resize 1200x630 output.png`
- Use online tool (TinyPNG, Squoosh)
- Convert PNG to WebP for better compression

Requirements:
- OGP image must remain 1200x630 pixels (for social sharing)
- Maintain visual quality (no visible artifacts)

### 2. Future: Seedling/Evergreen Badges (Phase 2)
Add `stage` field to frontmatter and display badges in UI.
- Files to modify: `types.ts`, `lib/content.ts`, `pages/ContentDetail.tsx`

---

## Development History

### 2026-01-11: Phase 1 Foundation (Claude)
- Added SEO basics: robots.txt, sitemap.xml generation
- Improved content workflow: publish script for article + image copy
- Updated RSS to include all content types (blog, poem, moments)
- Set up AI collaboration: GEMINI.md, agent-memory with project context
