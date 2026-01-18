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

## Skills

### Agent Memory
- Location: `.claude/skills/agent-memory/`
- Purpose: Persistent memory space for storing knowledge that survives across conversations
- Usage: Save research findings, codebase patterns, architectural decisions, and in-progress work
- See `.claude/skills/agent-memory/SKILL.md` for detailed instructions

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

## Astro + React ハイブリッド構成

### アーキテクチャ
- **ブログ詳細ページ**: Astroで静的HTML生成（SEO最適化、WikiLink、バックリンク）
- **ホーム/一覧ページ**: React SPA（インタラクティブなUI）
- **Poem/Moment**: React SPA（既存のまま）

### ビルドコマンド
```bash
npm run build       # フルビルド（Astro + React + マージ + RSS + Sitemap）
npm run dev         # React開発サーバー
npm run dev:astro   # Astro開発サーバー
npm run preview     # ビルド結果のプレビュー
```

### WikiLink機能
記事内で`[[slug]]`または`[[slug|表示テキスト]]`と書くと、自動的に`/at-an-arbor/blog/slug`へのリンクに変換されます。

**例**:
```markdown
詳しくは[[digital-gardening]]を参照。
[[terminology|用語集]]もご覧ください。
```

### バックリンク
各記事の末尾に「📎 REFERENCED BY」セクションが自動生成され、その記事を参照している他の記事が表示されます。

### unlisted記事
frontmatterに`unlisted: true`を設定すると、メモ/リファレンス記事として扱われます。

**動作**:
- ホーム画面に非表示
- RSS配信されない
- 直リンク（`/at-an-arbor/blog/slug`）でアクセス可能
- WikiLinkで参照可能
- バックリンクに表示される

**例**:
```yaml
---
title: 用語集
unlisted: true
---
```

### ディレクトリ構造
```
/Users/r/src/at-an-arbor/
├── astro-blog/           # Astroプロジェクト
│   ├── src/
│   │   ├── pages/blog/[slug].astro
│   │   ├── layouts/BlogPost.astro
│   │   └── utils/
│   │       ├── wikilinks.ts
│   │       └── backlinks.ts
│   └── astro.config.ts
├── src/                  # React SPA
├── content/              # Markdown（共有）
├── public/               # 静的ファイル（共有）
├── scripts/
│   └── merge-builds.js   # ビルド統合
└── dist/                 # 最終出力
```