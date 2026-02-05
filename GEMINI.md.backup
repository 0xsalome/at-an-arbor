# GEMINI.md

> Gemini-specific AI configuration for at-an-arbor Digital Garden

## 🎯 AI Partner Protocol (Gemini)

**Important:** At startup, reference these files:
- `CLAUDE.md` - Project overview, communication rules, architecture, commands
- `agent.md` - AI partner protocols (Surgical Edit, Security, token optimization)
- `INVENTORY.md` - Available tools, skills, subagents, and plugins

### Required Protocols (from agent.md)
1. **Surgical Edit**: Apply 3-step process (Diagnosis → Approval → Surgery) for all code modifications
2. **Security Protocol**: Always perform XSS checks for input processing
3. **Gemini Workflow**: Receive tasks from Claude, handoff architectural issues back to Claude

## 🎨 Your Role (Gemini)

### Primary Responsibilities
- **UI component implementation**: Create/update React components with TypeScript
- **Styling**: CSS, animations, responsive design (Tailwind CSS)
- **Test creation**: Unit tests, integration tests for components and utilities
- **Documentation**: Code comments, user-facing documentation generation

### Leave to Claude
- Architecture decisions
- Security review
- Performance optimization strategies
- Complex logic (RSS generation, routing structure, WikiLink parsing, backlinks)

---

## 🚀 Auto-Suggestion Policy (Gemini)

Proactively suggest optimal tools based on task context from INVENTORY.md:

### Implementation Tasks
- **Component creation** → `document-skills:frontend-design` skill for production-grade UI
- **TypeScript types** → `javascript-typescript:typescript-pro` subagent for complex types
- **Testing** → `javascript-testing-patterns` skill for comprehensive test strategies

### CSS/Animation Tasks
- **Performance optimization** → Suggest CSS best practices and bundle optimization
- **Responsive design** → Reference `.claude/skills/design-system/` for consistency

### Handoff to Claude When
- **Architectural issues detected** → Use `workflows` skill to structure handoff
- **Security concerns found** → Report to Claude immediately
- **Performance bottlenecks identified** → Delegate to Claude for optimization strategy
- **Complex logic required** → Beyond UI implementation scope

### Suggestion Transparency
All suggestions must include:
- **Reason**: Why this tool is appropriate
- **Benefit**: What will improve (quality, speed, maintainability)
- **Confirmation**: Request user approval

### 🔄 Handoff Protocol

... (省略) ...

---

## 🎭 Dynamic Articles (GSAP + MDX)

MDX記事にアニメーションを導入する際は、以下の「Astroコンポーネントパターン」を推奨します。

### 基本ワークフロー
1. **部品作成**: `astro-blog/src/components/ui/` に `.astro` ファイルを作成し、`<script>` タグ内で GSAP をインポートしてアニメーションを記述する。
2. **記事で使用**: ルートの `content/blog/` 内の `.mdx` ファイルで、作成した部品をインポートして配置する。

### 注意事項
- **インポートパス**: ルートの `.mdx` からインポートする場合、パスは `../../astro-blog/src/components/ui/ComponentName.astro` となる（シンボリックリンクの実体からの相対パス）。
- **非React**: 複雑な状態管理が不要な演出（フェードイン等）には、React (.tsx) よりも Astro (.astro) コンポーネントの方が軽量で安定する。

### 既存の部品
- `FadeInText.astro`: テキストや要素をふわっと浮かび上がらせる。

---

## 📊 Current Progress (2026-01-28)
- ✅ Enabled external links in Moments (open in new tab).
- ✅ Integrated GSAP and MDX for dynamic blog articles.
- ✅ Established "Astro Component Pattern" for animations to avoid CSP/MDX parsing issues.

### Pending
- **Image Optimization**: `public/images/ogp.png` (1.5MB) and `contour.jpg` (1.5MB) need compression to < 200KB each

---

## 📋 Next Tasks

### 1. Image Optimization (Assigned to Gemini - LOW PRIORITY)
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

## 📜 Development History

### 2026-01-18: Astro Migration Phase 1 (Gemini)
- Migrated blog detail pages to Astro (Static HTML)
- Implemented WikiLink (`[[slug]]`) and Backlinks support
- Integrated React SPA (Home, Poem, Moment) with Astro Build
- Switched to `BrowserRouter` with `/at-an-arbor/` base path
- Updated RSS/Sitemap to use clean URLs
- **Bug Fix**: Fixed GitHub Pages routing (404 on reload) and navigation issues by adding `basename` and `404.html` fallback.


