# CLAUDE.md

## 📚 Reference Files

**Important:** The common AI partner protocol for this project is documented in `AGENT.md`. Please refer to it first.

- `AGENT.md` - Common AI protocol for all AIs
- `README.md` - Project overview, technologies used, setup instructions

---

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

---

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

---

## Gemini Collaboration

- Gemini operates in a Docker environment
- Consider the Docker environment when instructing Gemini on tasks
- Gemini cannot execute `git push` or `npm run dev` (humans execute these)
- Receive reports from Gemini and instruct next steps

---

## AI Role Assignment (Claude + Gemini Collaboration)

### Claude's Responsibilities

- Architecture decisions
- Security reviews
- Performance optimization
- Complex logic (RSS generation, routing structure, WikiLink parsing, backlinks)

### Gemini's Responsibilities

- UI component implementation
- CSS/animations
- Test case creation
- Documentation generation

---

## Project-Specific Skills

### Design System
- Location: `.claude/skills/design-system/`
- Purpose: Consistent UI component definitions across the site (link styles, color palette, etc.)
- Usage: Reference when creating new components. Link styles are auto-applied
- See `.claude/skills/design-system/SKILL.md` for detailed specifications

---

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

---

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

### Obsidian互換マークダウン記法

ブログ記事で以下のObsidian記法が使用できます。

#### 見出し
```markdown
## h2見出し（大きめ）
### h3見出し（中程度）
#### h4見出し（小さめ）
```

#### リスト
```markdown
- 箇条書き
- ビュレットポイント付き

1. 番号付きリスト
2. 自動で番号表示
```

#### コールアウト（注意書きボックス）
```markdown
> [!note] メモ
> 補足情報を書く

> [!tip] ヒント
> 便利な情報

> [!warning] 注意
> 気をつけること

> [!important] 重要
> 必ず読んでほしいこと

> [!quote] 引用
> 誰かの言葉
```

#### ハイライト
```markdown
==強調したいテキスト==
```

#### タスクリスト
```markdown
- [ ] 未完了のタスク
- [x] 完了したタスク
```

#### 引用
```markdown
> 引用文
> 複数行もOK
```

#### テーブル
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |
```

#### インラインコード・コードブロック
```markdown
`インラインコード`

\`\`\`javascript
// コードブロック
const x = 1;
\`\`\`
```

#### WikiLink（内部リンク）
```markdown
[[記事スラッグ]]
[[記事スラッグ|表示テキスト]]
```

#### 画像（Obsidian形式）
```markdown
![[画像ファイル名.png]]
```

#### 記事の更新（Regrown機能）
記事を更新する場合：
1. frontmatterの`updated`を更新
2. 更新内容と初版の間に`---`を2つ連続で書く

```yaml
---
title: 記事タイトル
date: 2026-02-01
updated: 2026-02-11
type: blog
---
更新後の内容...

---
---

初版の内容...
```

これにより自動的に「᚛ 初版 / 日付」ヘッダーが挿入されます。

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

---

## Notes

- Content workflow: Edit in Obsidian → Copy to content/ folder → git push
- Hosted on GitHub Pages (https://0xsalome.github.io/at-an-arbor/)
