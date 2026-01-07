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
- If you seem to have forgotten previous instructions, confirm with me before continuing

## Safety Rules
- Do not directly touch production environments or production data
- Never commit or expose `.env` files or secrets
- Always confirm before deleting or overwriting files
- Break large changes into smaller steps and proceed incrementally
- Confirm with me before adding external packages
- Confirm with me before making API calls or sending data externally

## Project Information

- Project purpose: Digital Garden - ブログ、詩、呟きを通じて思考を有機的に育てる個人サイト
- Technologies used: React 19 / TypeScript / Vite / react-router-dom / Markdown (gray-matter, marked)
- Main folder structure:
  - `components/` - 共通UIコンポーネント（Nav, FadeIn, Comet, CompostCanvas）
  - `pages/` - ページコンポーネント（Home, ContentDetail, SimplePage等）
  - `content/` - Markdownコンテンツ（blog/, moments/, poem/）
  - `public/` - 静的ファイル
  - `scripts/` - ビルドスクリプト（RSS生成）
- Files/folders not to touch:
  - `node_modules/`
  - `dist/`
  - `.git/`
  - `content/` 内のMarkdownファイル（Obsidianで管理、指示がない限り編集しない）

## Development Commands

```bash
npm run dev      # 開発サーバー起動
npm run build    # RSS生成 + ビルド
npm run preview  # ビルド結果プレビュー
```

## Notes

- コンテンツはObsidianで編集 → content/フォルダにコピー → git pushのワークフロー
- GitHub Pagesでホスティング（https://0xsalome.github.io/at-an-arbor/）
