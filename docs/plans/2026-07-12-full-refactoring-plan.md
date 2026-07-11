# at-an-arbor 全面リファクタリング実装計画

> **For Claude:** REQUIRED SUB-SKILL: Claude Code 担当タスクの実行には superpowers:executing-plans を使い、タスク単位で進めること。
> **実行体制:** 実装の主担当は **Codex**。Claude Code は Phase 0・破壊的操作・フェーズ末レビュー・進捗管理（bd）のみを担当する（「実行体制」セクション参照）。
> **重要:** 各フェーズのコミットまでは自由に実行してよいが、`git push` はユーザーの明示的な確認後のみ（グローバル CLAUDE.md の Git ルールに従う）。
> **重要:** `content/` 配下の Markdown は Obsidian 管理のため、指示がない限り本文を編集しない。

**Goal:** 機能・見た目を一切変えずに、蓄積した不要ファイル・重複コード・未使用依存・構造の歪みを段階的に除去し、保守可能な状態にする。

**Architecture:** React SPA（現在ルート直下 → `src/` へ正規化）+ Astro ブログ（`astro-blog/`）+ Node ビルドスクリプト群（`scripts/`）のハイブリッド構成は維持する。変更するのは「配置・重複・依存・ツーリング」であり、ルーティング構造やビルド成果物の内容は変えない。

**Tech Stack:** React 19 / TypeScript / Vite 6 / Astro 5 / Tailwind CSS / GitHub Pages (Actions)

---

## 調査サマリー（2026-07-12 時点の問題一覧）

### A. ゴミファイル・死蔵コード（確認済み）
| 対象 | 状態 | 根拠 |
|---|---|---|
| `lib/content.ts.bak` | バックアップファイル（140行） | 未参照 |
| `test-marked.js` | marked の挙動確認用の一時スクリプト | 未参照 |
| `server.log` | ログファイル（gitignore 対象だが残存） | 生成物 |
| `repomix-output.md` | 1.3MB のツール出力（gitignore 済みだが残存） | 生成物 |
| `blog.md` | Markdown 記法ガイド（ルート直下に放置） | ドキュメント置き場が誤り |
| `metadata.json` | AI Studio エクスポートの残骸 | 未参照 |
| `NEXT_STEPS.md` | Underground 移行計画（チェック済み＝完了済み） | 役目を終えた |
| `PROJECT_CONTEXT.md` / `project-context-20260117.md` | 旧 AI 用コンテキスト（CLAUDE.md と重複） | 陳腐化 |
| `astro-wikilinks.ts` / `astro-backlinks.ts`（ルート直下） | `astro-blog/src/utils/` の**古い分岐コピー**（diff で相違確認済み） | astro.config が参照するのは astro-blog 側のみ |
| `code-strata-demo/` | `components/underground/` へ移植済みの旧デモ（分岐コピー） | どこからも import されていない（grep 確認済み） |
| `git/`（サブモジュール） | Underground 移植の参照元。移植完了済み（NEXT_STEPS.md 参照） | どこからも import されていない |
| `lib/github-landscape.ts` | 未使用（69行） | import 箇所ゼロ |
| `public/images/moments/2026-01-26.md` / `content/moments/images/2026-01-26.md` | 画像フォルダに紛れ込んだ .md（前者は git 追跡中） | 配置ミス |
| `content/moments/2026.1/2056-01-13.md` | 年が 2056 の typo ファイル名 | 要ユーザー確認 |
| `astro-blog/src/components/ui/FadeInText.astro` | 未使用コンポーネント（gsap の唯一の利用箇所） | import 箇所ゼロ |
| `public/ogp.html` / `public/ogp-preview.html` | OGP 画像作成用の一時ツールが本番配信されている | 要ユーザー確認 |

### B. 未使用・誤配置の依存関係（grep で確認済み）
- **ルート `package.json`:** `clsx`, `framer-motion`, `tailwind-merge` → **import ゼロ、完全に未使用**
- **ルート:** `sharp`, `gray-matter` → scripts でのみ使用（ビルド時のみ）なのに `dependencies` にある
- **ルート:** `@types/dompurify`, `@types/marked` → 両ライブラリとも型を同梱しており不要（deprecated スタブ）
- **astro-blog:** `gsap` → 未使用の FadeInText.astro のみが参照
- **astro-blog:** `@astrojs/react`, `react`, `react-dom`, `@types/react`, `@types/react-dom` → astro-blog 内に React コンポーネントなし（grep 確認済み）
- **astro-blog:** `@astrojs/mdx` → `.mdx` ファイルは存在しない（要最終確認）

### C. 構造の歪み
- **React アプリがリポジトリのルート直下に展開されている**（`App.tsx`, `index.tsx`, `components/`, `pages/`, `lib/`, `hooks/`, `types.ts`）。CLAUDE.md には `src/` と書かれており、ドキュメントと実態が乖離。
- **`index.html` に esm.sh の importmap が残存**（AI Studio 由来）。Vite がバンドルするため実質不要だが、本番 HTML に配信され続けている。
- **Tailwind が CDN（`cdn.tailwindcss.com`）+ インライン設定**。本番非推奨の構成で、ランタイムに ~300KB の JS を読み込み FOUC の原因になる。astro-blog 側はビルド版 Tailwind 3.4 で、**カラー・フォント等のデザイントークンが 2 箇所に分岐**している。
- **`lib/slug.js`** だけ TS プロジェクト内で素の JS。

### D. 重複ロジック
- **フロントマターパーサーが 4 箇所に手書き実装**: `lib/content.ts`, `scripts/generate-rss.js`, `scripts/generate-sitemap.js`, `scripts/generate-spa-og-pages.js`（gray-matter がインストール済みなのに）
- **WikiLink（`[[slug]]` / `![[image]]`）変換ロジックが 2 実装**: `lib/content.ts`（SPA 用 regex）と `astro-blog/src/utils/wikilinks.ts`(remark プラグイン) ＋ルートの古いコピー 2 ファイル
- **`components/underground/` と `code-strata-demo/` と `git/` に同名コンポーネントが 3 重存在**（それぞれ分岐）

### E. 画像・生成物パイプライン
- `content/**/images/`（111MB+）→ `scripts/copy-images.js` で `public/images/`（33MB）へ複製。**両方 git 追跡**で `.git` が 195MB に肥大。
- `public/images/` 配下に**未追跡の画像 27 件**が滞留（git status のノイズ源）。
- `.heic` ファイルが public に配信されている（Safari 以外で表示不可）。
- **ビルド生成物が git にコミットされている**: `public/rss.xml`, `public/sitemap.xml`（ビルドで毎回再生成される）

### F. 開発基盤の欠如
- ESLint / Prettier / テスト / typecheck スクリプト、**すべてなし**
- `tsconfig.json` に `strict` なし（型チェックがほぼ機能していない）
- CI はビルド＆デプロイのみで品質ゲートなし（直近にも RSS 日付ソートのバグ修正あり = テストがあれば防げた類）

---

## 全体方針

1. **各フェーズは独立して完結**し、フェーズ末に必ず「ビルド＋スモークチェック＋コミット」を行う。途中で止めても壊れない。
2. **削除 → 依存 → 構造 → 重複統合 → Tailwind → 画像 → ツーリング → ドキュメント**の順。リスクの低いものから着手し、後半の大きな変更時には表面積が減っている状態にする。
3. 機能追加・デザイン変更は**一切しない**。

## 実行体制: Codex メイン / Claude Code は要所のみ

### 分担の原則

技術的に Codex で不可能な作業はほぼないため、分担は「能力」ではなく**リスクと判断の所在**で切る:

- **Codex（主担当）**: 計画書に手順が明記されている機械的な実装作業すべて。ファイルの削除・移動、依存の付け替え、コードの切り出し、テスト作成、設定ファイル作成、ドキュメント更新。
- **Claude Code（要所のみ）**:
  1. **ユーザーとの意思決定**（Phase 0 の確認事項、デザイントークンの正の裁定など）
  2. **破壊的・復元困難な操作**（サブモジュール削除、git 履歴書き換え、`git rm --cached` による追跡解除）
  3. **フェーズ末レビュー**（Codex の成果物 diff の確認、検証プロトコルの実施、コミット内容の承認）
  4. **デプロイ経路に触れる変更**（`.github/workflows/deploy.yml`）
  5. **進捗管理**（bd issue の作成・更新、ユーザーへのデモ提示、push の実行）

### タスク別担当一覧

デフォルトは **Codex**。以下のみ **Claude Code 専任**:

| タスク | 理由 |
|---|---|
| Phase 0 全体（Task 0-1, 0-2） | ベースライン確定とユーザー意思決定が中心 |
| Task 1-3（git サブモジュール削除） | 復元に手間がかかる操作 + `.git/modules` 直接削除を含む |
| Task 5-2 のトークン値裁定 | 両実装で値が食い違う場合のユーザー確認 |
| Task 6-1（生成物の追跡解除） | `git rm --cached` の対象選定ミスが公開サイトの欠落に直結 |
| Task 6-4（git 履歴書き換え） | 破壊的操作。実施自体が別途承認制 |
| Task 7-3（CI への品質ゲート追加） | デプロイワークフローの変更 |
| 各フェーズ末の検証・コミット承認・push | レビュー責務 |

### Codex へのハンドオフ手順（各フェーズ共通）

1. **Claude Code**: フェーズ開始時に bd issue を `in_progress` にし、Codex へ渡すプロンプトを作る。渡すものは次の3点で足りる:
   - 本計画書の該当フェーズのセクション全文
   - 「検証プロトコル（全フェーズ共通）」セクション全文
   - 制約の明示:「`content/` 配下の md は編集禁止」「`git push` 禁止（コミットまで）」「Claude Code 専任と書かれたタスクはスキップ」
2. **Codex**: タスクを順に実行し、タスク単位でコミット（コミットメッセージは計画書の指定に従う）。
3. **Claude Code**: フェーズ完了報告を受けたら `git log --oneline` と `git diff <フェーズ開始時点>..HEAD` をレビューし、検証プロトコル（ビルド + スモークチェック）を自分で再実行。問題なければユーザーにローカルデモを提示し、OK 後に push。
4. 問題があれば修正指示を Codex に差し戻す（Claude Code が直接直すのは専任タスクに関わる箇所のみ）。

### 公開リポジトリへの push に関する注記

本計画書および Phase 0 で生成する記録ファイルに秘密情報は含まれない（リポジトリは公開済みで、言及しているパス・ファイル名・Cloudflare ビーコンはすべて既公開情報）。push して問題ない。個人的な画像ファイル名の一覧が気になる場合のみ、`docs/plans/baseline-*.txt` を `.gitignore` に追加してローカル記録に留めること。

### 検証プロトコル（全フェーズ共通）

各フェーズの最後に必ず実行する:

```bash
npm run build          # フルビルド（Astro + React + merge + RSS + Sitemap）
npm run preview:built  # http://127.0.0.1:3000 で確認
```

スモークチェック項目（ブラウザで目視）:
- [ ] `/at-an-arbor/` — ホーム（2カラム、moments 一覧、詩）
- [ ] `/at-an-arbor/blog` — ブログ一覧
- [ ] `/at-an-arbor/blog/digital-gardening` — Astro 静的ページ（WikiLink・バックリンク表示）
- [ ] `/at-an-arbor/moments/<最新slug>` — moment 詳細（画像表示）
- [ ] `/at-an-arbor/poems` と詩の詳細（縦書き表示）
- [ ] `/at-an-arbor/underground` — Code Strata 表示
- [ ] `/at-an-arbor/compost` — CompostCanvas
- [ ] `dist/rss.xml` / `dist/sitemap.xml` が生成されている
- [ ] DevTools でコンソールエラーなし
- [ ] スマホ幅（414px）でレイアウト崩れなし

---

## Phase 0: セーフティネット構築（リスク: なし / 目安: 15分）【担当: Claude Code】

**目的:** 変更前の状態を確実に復元できるようにし、比較基準を作る。

### Task 0-1: ベースライン記録

**Step 1:** 現在の未追跡ファイルを整理判断のため記録する
```bash
git status --porcelain > docs/plans/baseline-git-status.txt
```

**Step 2:** ベースラインビルドを実行し、成果物一覧を記録
```bash
npm run build
find dist -type f | sort > docs/plans/baseline-dist-files.txt
du -sh dist >> docs/plans/baseline-dist-files.txt
```
Expected: ビルド成功。この一覧が以後のフェーズでの差分比較基準になる。

**Step 3:** ベースラインタグを打つ
```bash
git add docs/plans/
git commit -m "docs: リファクタリング前のベースラインを記録"
git tag refactor-baseline
```

### Task 0-2: ユーザー確認事項（実行前に回答をもらう）

以下は削除・変更してよいかユーザーの判断が必要:

1. **`git/` サブモジュール削除** — Underground 移植の参照元。移植は完了済みだが、リモート（github.com/0xsalome/git）は残るので復元可能。→ 削除してよいか？
2. **`content/moments/2026.1/2056-01-13.md`** — 年の typo と思われる。リネームは Obsidian 側との同期に影響しうる。→ Obsidian 側で直すか、触らないか？
3. **`public/ogp.html` / `ogp-preview.html`** — OGP 作成用ツール。削除 or `docs/tools/` へ移動？
4. **`public/images/` と `public/rss.xml` / `sitemap.xml` の gitignore 化**（Phase 6）— ビルドで毎回生成されるため git 追跡を外せるが、リポジトリを直接見たとき画像が見えなくなる。→ 許容するか？
5. **git 履歴の画像肥大（.git 195MB）** — 解消には `git-filter-repo` による履歴書き換え＋force push が必要。**破壊的操作**のため本計画では**オプション扱い**（Phase 6 の付録）。→ やるか、見送るか？
6. **Tailwind のバージョン** — astro-blog に合わせて v3.4 で統一を推奨（v4 移行は別プロジェクトとする）。→ 同意するか？

---

## Phase 1: 不要ファイル・死蔵コードの削除（リスク: 低 / 目安: 30分）【担当: Codex（Task 1-3 のみ Claude Code）】

**目的:** 参照されていないファイルを消し、リポジトリの表面積を減らす。**1 グループ削除するごとにビルド確認**する。

### Task 1-1: ルート直下のゴミファイル削除

**Files:**
- Delete: `lib/content.ts.bak`, `test-marked.js`, `server.log`, `repomix-output.md`, `metadata.json`, `NEXT_STEPS.md`, `PROJECT_CONTEXT.md`, `project-context-20260117.md`
- Move: `blog.md` → `docs/markdown-guide.md`（記法ガイドとして有用なため移動）

**Step 1:** 削除前に最終参照チェック（ヒットが `repomix-output.md` 自身と `.gitignore` のみであること）
```bash
grep -rn "metadata.json\|PROJECT_CONTEXT\|NEXT_STEPS\|test-marked" \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.html' --include='*.yml' \
  . | grep -v node_modules | grep -v repomix-output
```
Expected: ヒットなし（あれば削除を保留し原因調査）

**Step 2:** 削除・移動を実行
```bash
git rm lib/content.ts.bak test-marked.js metadata.json NEXT_STEPS.md 2>/dev/null
git mv blog.md docs/markdown-guide.md
rm -f server.log repomix-output.md PROJECT_CONTEXT.md project-context-20260117.md  # 未追跡分
```
※ `git rm` が「not tracked」エラーを返したファイルは `rm` に切り替える。

**Step 3:** ビルド確認 → コミット
```bash
npm run build
git add -A && git commit -m "chore: ルート直下の不要ファイルを削除、記法ガイドをdocsへ移動"
```

### Task 1-2: 古い分岐コピーの削除（astro utils / code-strata-demo）

**Files:**
- Delete: `astro-wikilinks.ts`, `astro-backlinks.ts`（正は `astro-blog/src/utils/` 側。astro.config.ts が参照しているのも astro-blog 側のみ）
- Delete: `code-strata-demo/` 全体（正は `components/underground/` + `lib/github-strata.ts` + `lib/strata-types.ts`。Underground.tsx の import で確認済み）

**Step 1:** 参照チェック
```bash
grep -rn "astro-wikilinks\|astro-backlinks\|code-strata-demo" \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' --include='*.astro' \
  . astro-blog/src | grep -v node_modules
```
Expected: ヒットなし

**Step 2:** 削除 → ビルド確認 → コミット
```bash
git rm astro-wikilinks.ts astro-backlinks.ts
git rm -r code-strata-demo
npm run build
git commit -m "chore: astro utilsの旧コピーとcode-strata-demoを削除（正はastro-blog側とcomponents/underground）"
```

### Task 1-3: `git/` サブモジュールの削除（**Task 0-2 の確認 1 が OK の場合のみ**）【担当: Claude Code】

**Step 1:** サブモジュールを解除・削除
```bash
git submodule deinit -f git
git rm -f git
rm -rf .git/modules/git
```

**Step 2:** `.gitmodules` が空になったら削除
```bash
cat .gitmodules   # [submodule "git"] セクションが消えていること
git rm .gitmodules  # 他のサブモジュールがない場合のみ
```

**Step 3:** ビルド確認 → コミット
```bash
npm run build
git commit -m "chore: 移植完了済みのgitサブモジュール（Underground参照元）を削除"
```

### Task 1-4: 未使用モジュール・配置ミスファイルの削除

**Files:**
- Delete: `lib/github-landscape.ts`（import ゼロ）
- Delete: `astro-blog/src/components/ui/FadeInText.astro`（import ゼロ）
- Delete: `public/images/moments/2026-01-26.md`, `content/moments/images/2026-01-26.md`（画像フォルダ内の .md。**削除前に中身を開いて本文を確認**し、必要な記事なら `content/moments/` へ移動する）

**Step 1:** 参照チェックと中身確認
```bash
grep -rn "github-landscape\|FadeInText" --include='*.ts' --include='*.tsx' --include='*.astro' . astro-blog/src | grep -v node_modules
cat "content/moments/images/2026-01-26.md"
```

**Step 2:** 削除 → ビルド確認 → コミット
```bash
git rm lib/github-landscape.ts astro-blog/src/components/ui/FadeInText.astro
git rm "public/images/moments/2026-01-26.md"
rm -f "content/moments/images/2026-01-26.md"   # content側は未追跡なら rm
npm run build
git commit -m "chore: 未使用モジュールと画像フォルダ内の迷子mdを削除"
```

---

## Phase 2: 依存関係クリーンアップ（リスク: 低 / 目安: 30分）【担当: Codex】

**目的:** 未使用パッケージを削除し、ビルド時専用パッケージを devDependencies へ移す。node_modules（ルート 152MB + astro 258MB）とインストール時間を削減。

### Task 2-1: ルート package.json の整理

**Files:**
- Modify: `package.json`

**Step 1:** 未使用 3 パッケージの最終確認（ヒットゼロであること）
```bash
grep -rn "clsx\|framer-motion\|tailwind-merge" --include='*.ts' --include='*.tsx' . | grep -v node_modules
```

**Step 2:** 削除と移動
```bash
npm uninstall clsx framer-motion tailwind-merge @types/dompurify @types/marked
npm uninstall sharp gray-matter && npm install -D sharp gray-matter
```
※ `sharp`/`gray-matter` は `scripts/` でのみ使用（ビルド時実行）。GitHub Actions の `npm ci` は devDependencies も入れるためデプロイに影響なし。

**Step 3:** 型エラーが出ないか確認（@types 削除の影響チェック）
```bash
npx tsc --noEmit
```
Expected: `@types/dompurify` / `@types/marked` 起因のエラーなし（marked v17・dompurify v3 は型同梱）。エラーが出た場合はその場で import 文を修正（`import type ... from 'marked'` 等）。

**Step 4:** ビルド確認 → コミット
```bash
npm run build
git add package.json package-lock.json && git commit -m "chore: 未使用依存を削除、ビルド時専用パッケージをdevDependenciesへ移動"
```

### Task 2-2: astro-blog package.json の整理

**Files:**
- Modify: `astro-blog/package.json`, `astro-blog/astro.config.ts`

**Step 1:** 削除可否の最終確認
```bash
find astro-blog/src -name '*.mdx' | wc -l          # 0 なら @astrojs/mdx 不要
grep -rn "client:" astro-blog/src                   # ヒットなしなら React 統合不要
grep -rn "gsap" astro-blog/src                      # FadeInText削除後はヒットなしのはず
```

**Step 2:** `astro-blog/astro.config.ts` から `react()` と `mdx()` の integration と import 行を削除

**Step 3:** アンインストール
```bash
cd astro-blog
npm uninstall gsap @astrojs/react @astrojs/mdx react react-dom @types/react @types/react-dom
cd ..
```

**Step 4:** ビルド確認 → コミット
```bash
npm run build
git add astro-blog/ && git commit -m "chore: astro-blogの未使用依存（gsap/react/mdx統合）を削除"
```

---

## Phase 3: ソースレイアウト正規化（リスク: 中 / 目安: 1時間）【担当: Codex】

**目的:** ルート直下に散らばる React アプリを `src/` に集約し、AI Studio 由来の残骸（importmap）を除去。CLAUDE.md の記述と実態を一致させる。

### Task 3-1: React アプリを `src/` へ移動

**Files:**
- Move: `App.tsx`, `index.tsx`, `types.ts`, `components/`, `pages/`, `lib/`, `hooks/` → すべて `src/` 配下へ
- Modify: `index.html`（script src）, `vite.config.ts`（alias）, `tsconfig.json`（paths）, `src/lib/content.ts`（glob パス）

**Step 1:** git mv で移動（履歴を保つ）
```bash
mkdir -p src
git mv App.tsx index.tsx types.ts components pages lib hooks src/
```

**Step 2:** 参照パスを修正
- `index.html:179` — `<script type="module" src="/index.tsx">` → `src="/src/index.tsx"`
- `vite.config.ts:34` — alias `'@': path.resolve(__dirname, '.')` → `path.resolve(__dirname, './src')`
- `tsconfig.json` — `"paths": { "@/*": ["./src/*"] }`
- `src/lib/content.ts:66-86` — `import.meta.glob('../content/...')` → `import.meta.glob('../../content/...')`（3 箇所。src/lib からの相対に変わるため）

**Step 3:** 他に相対パスで content や public を参照している箇所がないか確認
```bash
grep -rn "\.\./content\|\.\./public" src/ scripts/ --include='*.ts' --include='*.tsx'
```

**Step 4:** 開発サーバーとビルドの両方で確認
```bash
npm run dev   # 全ルートを目視（特に moments/poems の一覧 = glob が正しく効いているか）
npm run build
```
Expected: ホームに moments/blog/poem が**移動前と同じ件数**表示される（glob パス誤りは「一覧が空になる」形で現れるため必ず件数を見る）。

**Step 5:** コミット
```bash
git add -A && git commit -m "refactor: ReactアプリをルートからsrcへStandardレイアウトに移動"
```

### Task 3-2: `lib/slug.js` の TypeScript 化

**Files:**
- Move: `src/lib/slug.js` → `src/lib/slug.ts`
- Modify: `src/lib/content.ts:4`（`from './slug.js'` → `from './slug'`）、scripts 側から参照があればそちらも確認

**Step 1:** scripts からの参照を確認
```bash
grep -rn "slug" scripts/*.js | grep -i "import\|require"
```
※ scripts が `lib/slug.js` を import している場合、この Task は Phase 4-1（共有モジュール整備）に統合する。

**Step 2:** リネームして型を付け、ビルド確認 → コミット
```bash
npm run build && npx tsc --noEmit
git add -A && git commit -m "refactor: slug.jsをTypeScript化"
```

### Task 3-3: index.html から esm.sh importmap を削除

**Files:**
- Modify: `index.html:166-175`（importmap の `<script type="importmap">` ブロックを削除）

**Step 1:** importmap ブロックを削除する（Vite が react/react-dom/react-router-dom をバンドルするため不要。AI Studio エクスポートの残骸）

**Step 2:** dev とビルド両方で動作確認（React が二重ロードされていないこと、コンソールエラーなし）
```bash
npm run dev      # ホームで DevTools Network を開き esm.sh へのリクエストがないこと
npm run build && npm run preview:built
```

**Step 3:** コミット
```bash
git add index.html && git commit -m "refactor: AI Studio由来のesm.sh importmapを削除（Viteがバンドル済み）"
```

---

## Phase 4: 重複ロジックの一元化（リスク: 中 / 目安: 2時間）【担当: Codex】

**目的:** 4 重実装のフロントマターパーサーと 2 重実装の WikiLink 変換を統合し、「直すときに 1 箇所直せば済む」状態にする。**このフェーズから先に Phase 7 の Vitest を前倒しで最小導入し、TDD で進める。**

### Task 4-0: Vitest の最小セットアップ（テスト基盤の前倒し）

**Step 1:** インストールと設定
```bash
npm install -D vitest
```
`package.json` の scripts に `"test": "vitest run"` を追加。

**Step 2:** 動作確認用のダミーテスト `src/lib/__tests__/smoke.test.ts` を作り、実行して PASS を確認したら削除せずそのまま次へ。
```bash
npx vitest run
```

**Step 3:** コミット
```bash
git add -A && git commit -m "test: Vitestを導入"
```

### Task 4-1: フロントマターパーサーの統合

**Files:**
- Create: `src/lib/frontmatter.ts`（ブラウザ・Node 両対応、依存ゼロの単一実装）
- Create: `src/lib/__tests__/frontmatter.test.ts`
- Modify: `src/lib/content.ts`（手書きパーサー 7-63 行目を削除して import に置換）
- Modify: `scripts/generate-rss.js`, `scripts/generate-sitemap.js`, `scripts/generate-spa-og-pages.js`（各自の手書きパーサーを削除し、gray-matter に置換）

**方針:** ブラウザ側（content.ts）は gray-matter が使えない（Buffer 依存）ため、現行の手書きパーサーを `src/lib/frontmatter.ts` に**そのまま切り出して**テストで挙動を固定する。Node スクリプト側はインストール済みの gray-matter に寄せて手書き実装を捨てる。

**Step 1: 失敗するテストを書く** — 現行パーサーの挙動を仕様化するテストを先に書く:
```typescript
// src/lib/__tests__/frontmatter.test.ts の例
import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../frontmatter';

describe('parseFrontmatter', () => {
  it('title と date を抽出する', () => {
    const { data } = parseFrontmatter('---\ntitle: "テスト"\ndate: 2026-07-12\n---\n本文');
    expect(data.title).toBe('テスト');
    expect(data.date).toBe('2026-07-12');
  });
  it('インライン tags 配列を配列にする', () => {
    const { data } = parseFrontmatter('---\ntags: [blog, essay]\n---\n');
    expect(data.tags).toEqual(['blog', 'essay']);
  });
  it('複数行 tags 配列を配列にする', () => {
    const { data } = parseFrontmatter('---\ntags:\n  - blog\n  - essay\n---\n');
    expect(data.tags).toEqual(['blog', 'essay']);
  });
  it('frontmatter がない場合は data が空で content が全文', () => {
    const { data, content } = parseFrontmatter('本文だけ');
    expect(data).toEqual({});
    expect(content).toBe('本文だけ');
  });
  it('unlisted: true を文字列として保持する（content.ts 側で解釈）', () => {
    const { data } = parseFrontmatter('---\nunlisted: true\n---\n');
    expect(data.unlisted).toBe('true');
  });
});
```

**Step 2:** `npx vitest run` → FAIL（frontmatter.ts が存在しない）を確認

**Step 3:** `src/lib/content.ts` の 7-63 行目 `parseFrontmatter` を `src/lib/frontmatter.ts` へ移動して export し、content.ts で import する

**Step 4:** `npx vitest run` → PASS を確認

**Step 5:** Node スクリプト 3 本の手書き `parseFrontmatter` を gray-matter に置換:
```javascript
import matter from 'gray-matter';
const { data, content: body } = matter(raw);
```
※ 注意: gray-matter は `date:` を Date オブジェクトにパースすることがある。RSS/sitemap の日付出力が変わらないよう、置換後に `node scripts/generate-rss.js` を実行して `public/rss.xml` の diff を確認する（**pubDate が 1 件も変わらないこと**）。変わる場合は `String(data.date)` で正規化する。

**Step 6:** 生成物 diff で検証 → コミット
```bash
node scripts/generate-rss.js && node scripts/generate-sitemap.js
git diff public/rss.xml public/sitemap.xml   # 差分ゼロ（または日時のみ）であること
npm run build
git add -A && git commit -m "refactor: フロントマターパーサーを4実装から一元化（ブラウザ用1実装+scripts側はgray-matter）"
```

### Task 4-2: WikiLink 変換の切り出しとテスト固定

**Files:**
- Create: `src/lib/wikilinks.ts`（`![[image]]` → img パス変換、`[[slug|text]]` → リンク変換の regex とロジックを content.ts から切り出し）
- Create: `src/lib/__tests__/wikilinks.test.ts`
- Modify: `src/lib/content.ts:150-168`（切り出した関数の呼び出しに置換）

**Step 1: 失敗するテストを書く**（現行挙動の固定）:
- `![[photo.png]]` → `![](/at-an-arbor/images/moments/photo.png)`（type=moment、URL エンコード込み）
- `[[digital-gardening]]` → `[digital-gardening](/at-an-arbor/blog/digital-gardening)`（blog のみ）
- `[[slug|表示名]]` → `[表示名](/at-an-arbor/blog/slug)`
- `![[...]]`（画像）が記事リンク変換の対象に**ならない**こと（negative lookbehind の検証）

**Step 2:** FAIL 確認 → 切り出し実装 → PASS 確認

**Step 3:** astro 側 `astro-blog/src/utils/wikilinks.ts` との挙動差（あれば）をテストのコメントに明記する。※ ランタイムが異なるため実装統合はしない。**「正規表現パターンと変換規則の仕様をテストで共有する」ところまで**を本計画のスコープとする。

**Step 4:** ビルド＋スモークチェック（moments 詳細の画像、blog の WikiLink）→ コミット
```bash
npm run build && npx vitest run
git add -A && git commit -m "refactor: WikiLink変換をcontent.tsから切り出しテストで挙動を固定"
```

### Task 4-3: RSS 日付ソートの回帰テスト

直近コミット `3a1b5e8 Fix RSS date sorting` で修正したバグの再発防止。

**Files:**
- Create: `scripts/__tests__/rss-sort.test.js`（generate-rss.js からソート関数を export して単体テスト。export 化のための小さなリファクタを伴う）

**Step 1:** generate-rss.js のソート部分を関数として export（デフォルト実行は維持: `import.meta.url` ガードを使用）
**Step 2:** 「日付降順に並ぶ」「同日複数記事の順序が安定」のテストを書き PASS 確認
**Step 3:** `node scripts/generate-rss.js` で rss.xml の diff がないこと → コミット
```bash
git add -A && git commit -m "test: RSS日付ソートの回帰テストを追加"
```

---

## Phase 5: Tailwind CDN 脱却とデザイントークン統一（リスク: 中〜高（視覚差リスク） / 目安: 2時間）【担当: Codex（トークン裁定のみ Claude Code）】

**目的:** 本番非推奨の CDN Tailwind をビルド版に置換し、index.html に埋め込まれた設定・スタイルをファイルに出す。astro-blog と重複するデザイントークンを単一ソース化する。

**注意: このフェーズは視覚回帰のリスクが最も高い。フェーズ前後で主要ページのスクリーンショットを撮って比較すること。**

### Task 5-1: 変更前スクリーンショットの取得

```bash
npm run build && npm run preview:built
```
ホーム / blog 一覧 / blog 詳細 / moments 詳細 / poems / underground / compost を PC 幅・414px 幅で撮影し `docs/plans/screenshots/before/` に保存。

### Task 5-2: 共有デザイントークンの作成【担当: Codex／値の食い違い裁定のみ Claude Code】

**Files:**
- Create: `design-tokens/tailwind-preset.mjs` — `index.html:36-63` の tailwind.config（colors: paper-white / ink-black / text-main / text-inv、fontFamily: serif / mono / pixel / pixel-jp、fade-in アニメーション）を Tailwind preset 形式で定義
- Modify: `astro-blog/tailwind.config.mjs` — 自前定義を `presets: [preset]` 参照に置換（**置換前に両者の値を diff し、相違があればユーザーに提示して正を決めてもらう**）

### Task 5-3: ルート Vite アプリへの Tailwind v3.4 導入

**Files:**
- Modify: `package.json`（`tailwindcss@^3.4 postcss autoprefixer` を devDependencies に追加）
- Create: `tailwind.config.mjs`（content: `['./index.html', './src/**/*.{ts,tsx}']`、presets に design-tokens を指定。※ CDN 版と異なりビルド版は**使用クラスをスキャンする**ため、`lib/content.ts` の renderer が動的に出力するクラス（`lazy-load` 等）は Tailwind クラスではないので影響なし。ただし動的に組み立てている Tailwind クラス名がないか `grep -rn 'className={' src/` で連結パターンを確認する）
- Create: `postcss.config.mjs`
- Create: `src/styles/global.css` — `@tailwind base/components/utilities;` + `index.html:65-165` のインライン `<style>` 全文を移設
- Modify: `src/index.tsx` — `import './styles/global.css';` を追加
- Modify: `index.html` — `<script src="https://cdn.tailwindcss.com">`、インライン tailwind.config、インライン `<style>` の 3 ブロックを削除

**Step 1:** 上記ファイルを作成・修正
**Step 2:** dev サーバーで全ページ目視（dark mode 切替も確認: `darkMode: 'class'` の維持を忘れない）
**Step 3:** ビルドして after スクリーンショットを撮り、before と比較
**Step 4:** 差異ゼロを確認してコミット
```bash
git add -A && git commit -m "refactor: Tailwind CDNをビルド版に置換、デザイントークンをastro-blogと単一ソース化"
```

### Task 5-4: （オプション）Google Fonts のままとするか自己ホストするかの判断

5 ファミリーの Web フォントを読み込んでいる。パフォーマンス改善余地はあるが**視覚・ライセンス確認が必要なため本計画では現状維持**とし、判断のみユーザーに仰ぐ。

---

## Phase 6: 画像・コンテンツパイプライン整理（リスク: 中 / 目安: 1.5時間）【担当: 混在（Task 6-1/6-4 は Claude Code、6-2/6-3 は Codex）】

**目的:** 「content と public への画像二重コミット」「未追跡ファイル 27 件の滞留」「生成物のコミット」をやめ、git status が常にクリーンな状態にする。

### Task 6-1: 生成物の gitignore 化（**Task 0-2 の確認 4 が OK の場合のみ**）【担当: Claude Code】

**Files:**
- Modify: `.gitignore` — 追加: `public/images/blog/`, `public/images/moments/`, `public/images/poem/`, `public/rss.xml`, `public/sitemap.xml`
- ※ `public/images/` 直下の手置きファイル（`ogp.jpg`, `contour.jpg`, `compost-bg.jpeg`, `moonhallucinogen.png`, `twitter-card.jpg`, `ogp.png`）は**コンテンツ由来ではない**ため追跡を維持する（ディレクトリ単位で ignore する理由）。

**Step 1:** これらが本当にビルドで再生成されることを確認
```bash
rm -rf public/images/blog public/images/moments public/rss.xml public/sitemap.xml
npm run build
ls public/images/blog | wc -l   # copy-images により復元されていること
ls dist/images/blog | wc -l     # dist にも入っていること
```
Expected: `scripts/copy-images.js`（build の第 2 ステップ）と `generate-rss.js`/`generate-sitemap.js` により全ファイル復元。**復元されなかったファイルがあれば、その画像はどの md からも参照されていない孤児**なので一覧化してユーザーに報告する。

**Step 2:** git から追跡を外す（ワーキングツリーには残す）
```bash
git rm -r --cached public/images/blog public/images/moments
git rm --cached public/rss.xml public/sitemap.xml
git add .gitignore
git commit -m "chore: ビルド生成物（コピー画像・RSS・sitemap）をgit追跡から除外"
```
効果: 冒頭の未追跡 27 ファイル問題も同時に解消。以後 Obsidian から画像を足しても git status が汚れない。

### Task 6-2: HEIC 画像の変換対応

**Files:**
- Modify: `scripts/copy-images.js` — `.heic` を検出したら sharp で `.jpeg` に変換してコピーし、md 内の参照パス書き換えが必要なケースを警告出力する

**Step 1:** まず sharp の heic 対応を確認（環境依存）
```bash
node -e "const s=require('sharp'); s('content/moments/2026.5/images/CF96D535-8FA0-4803-97CC-06DB083959DD.heic').jpeg().toBuffer().then(()=>console.log('OK')).catch(e=>console.log('NG:', e.message))"
```
- OK の場合: copy-images.js に変換処理を追加（変換後のファイル名を `<元名>.jpeg` とし、コピー時に拡張子を差し替え。md 側は Obsidian 管理のため**書き換えず**、`![[xxx.heic]]` 参照の解決時に `.jpeg` へフォールバックするロジックを copy-images ではなく表示側パス変換（`src/lib/wikilinks.ts` と astro 側）に足すか、警告に留めるかをユーザーに確認）
- NG の場合: copy-images.js に「heic を検出したら警告を出す」だけ追加し、変換は手動運用とする

**Step 2:** テスト実行 → ビルド → コミット

### Task 6-3: publish.js / copy-images.js の共通化

**Files:**
- Create: `scripts/lib/images.js` — 画像探索（`findImageFile`）・コピー・（あれば）リサイズ処理を共通化
- Modify: `scripts/copy-images.js`, `scripts/publish.js`

**Step 1:** 両スクリプトの画像処理の重複箇所を特定し共通関数に抽出
**Step 2:** `node scripts/copy-images.js` 実行で public/images の内容が変わらないこと（`find public/images -type f | sort` の前後 diff）を確認 → コミット

### Task 6-4: （オプション・別途承認制）git 履歴の画像肥大解消【担当: Claude Code】

`.git` が 195MB。過去にコミットされた大量画像が原因。解消するには:
```bash
# 参考手順（実行はユーザーの明示承認 + バックアップ後のみ）
brew install git-filter-repo
git clone --mirror <repo> backup.git   # 完全バックアップ
git filter-repo --path-glob 'content/*/images/*' --invert-paths --dry-run
```
**force push が必要な破壊的操作**であり、GitHub Pages のデプロイ履歴・クローン済み環境（Gemini の Docker 環境含む）すべてに影響する。**本計画のデフォルトは「見送り」**。実施する場合は独立した計画を別途作成する。

---

## Phase 7: 開発基盤整備（リスク: 低〜中 / 目安: 2時間）【担当: Codex（Task 7-3 のみ Claude Code）】

**目的:** 「壊れたことに気づける」仕組みを入れる。Vitest は Phase 4 で導入済みなので、typecheck / lint / CI を足す。

### Task 7-1: typecheck スクリプトと strict モード

**Files:**
- Modify: `tsconfig.json`, `package.json`

**Step 1:** まず現状のエラー数を測る
```bash
npx tsc --noEmit 2>&1 | tail -5
```

**Step 2:** `package.json` に `"typecheck": "tsc --noEmit"` を追加し、現状 0 エラーならこの時点でコミット

**Step 3:** `tsconfig.json` に `"strict": true` を追加してエラー数を再測定
- **20 件以下**: このタスク内で全部直す（型注釈追加のみ。ロジック変更禁止）
- **21 件以上**: `"strict": true` は入れたうえで、一時的に `"noImplicitAny": false` 等の緩和を明示的に書き、緩和項目を 1 つずつ外す後続タスクを bd issue として登録する

**Step 4:** `npm run build && npm run typecheck && npx vitest run` → コミット

### Task 7-2: ESLint + Prettier 導入

**Files:**
- Create: `eslint.config.mjs`（flat config: `typescript-eslint` + `eslint-plugin-react-hooks` の recommended のみ。ルールの追加カスタマイズはしない）
- Create: `.prettierrc`（デフォルト + 既存コードに合わせて `singleQuote: true`）
- Modify: `package.json` — `"lint": "eslint src scripts"`, `"format": "prettier --write ."`

**Step 1:** インストールと設定ファイル作成
```bash
npm install -D eslint typescript-eslint eslint-plugin-react-hooks prettier
```
**Step 2:** `npm run lint` のエラーを修正（auto-fix 可能なものは `--fix`。手修正が必要なものでロジックに触れる場合は修正せず bd issue 化）
**Step 3:** フォーマット一括適用は**単独コミット**にする（`git blame` 汚染を 1 コミットに閉じ込めるため）:
```bash
npm run format
git add -A && git commit -m "style: Prettierによる一括フォーマット（ロジック変更なし）"
```

### Task 7-3: CI に品質ゲートを追加【担当: Claude Code】

**Files:**
- Modify: `.github/workflows/deploy.yml` — build ジョブの `npm run build` の前に追加:
```yaml
      - name: Typecheck
        run: npm run typecheck
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm test
```

**Step 1:** ローカルで 3 コマンドすべて PASS を確認してから deploy.yml を修正 → コミット
**Step 2:** push はユーザー確認後。push 後に Actions の成功を確認する。

---

## Phase 8: ドキュメント最終化（リスク: なし / 目安: 30分）【担当: Codex（完了記録と bd クローズは Claude Code）】

**目的:** ドキュメントを実態に一致させ、次のセッション・Gemini・将来の自分が迷わないようにする。

### Task 8-1: CLAUDE.md / README.md / AGENT.md の更新

- `CLAUDE.md` — フォルダ構造を `src/` 移動後の実態に更新。「Directory Structure」セクションのパス `/Users/r/src/at-an-arbor/` は実際の `/Users/r/src/apps/at-an-arbor/` に修正。新設した `npm run typecheck` / `lint` / `test` を Development Commands に追記
- `README.md` — 同様に構造・コマンドを更新
- `.gemini/GEMINI.md` — フォルダ構造変更を Gemini にも伝わるよう更新

### Task 8-2: リファクタリング完了記録

- `docs/plans/2026-07-12-full-refactoring-plan.md`（本ファイル）の各タスクにチェックを付け、想定と違った点を「実施メモ」として追記
- ベースライン比較: `find dist -type f | sort` を再取得し `baseline-dist-files.txt` と diff、**意図した差分のみ**であることを確認
- `git tag refactor-complete`

---

## フェーズ間の依存関係と推奨実行単位

```
Phase 0（必須・最初）
  └→ Phase 1（削除）→ Phase 2（依存）→ Phase 3（レイアウト）→ Phase 4（重複統合）
                                                                  └→ Phase 5（Tailwind）
     Phase 6（画像）は Phase 1 完了後ならいつでも可（Phase 5 と独立）
     Phase 7 は Phase 3・4 完了後（src/ 確定 + Vitest 導入済みが前提）
     Phase 8（最後）
```

- **1 セッション 1〜2 フェーズ**を推奨（各フェーズ末が安全な中断点）
- 各フェーズは「Claude Code が Codex へハンドオフ → Codex 実装 → Claude Code レビュー・検証 → ユーザーにローカルデモ提示 → OK 後に push」のサイクルで回す（グローバル Git ルール準拠）
- 複数セッションにまたがるため、フェーズごとに bd issue を作成して進捗を追跡する（**bd 操作は Claude Code 担当**）:
  ```bash
  bd create --title="Refactor Phase 1: 不要ファイル削除" --type=task --priority=1
  # Phase 2〜8 も同様に作成し、bd dep add で順序依存を張る
  ```

## 総見積り

| フェーズ | 内容 | 主担当 | リスク | 目安 |
|---|---|---|---|---|
| 0 | セーフティネット + ユーザー確認 | Claude Code | なし | 15分 |
| 1 | 不要ファイル削除 | Codex（1-3 のみ CC） | 低 | 30分 |
| 2 | 依存クリーンアップ | Codex | 低 | 30分 |
| 3 | src/ レイアウト正規化 | Codex | 中 | 1時間 |
| 4 | 重複ロジック統合（+Vitest） | Codex | 中 | 2時間 |
| 5 | Tailwind CDN 脱却 | Codex（裁定のみ CC） | 中〜高 | 2時間 |
| 6 | 画像パイプライン | 混在（6-1/6-4 は CC） | 中 | 1.5時間 |
| 7 | typecheck / lint / CI | Codex（7-3 のみ CC） | 低〜中 | 2時間 |
| 8 | ドキュメント | Codex | なし | 30分 |

※ CC = Claude Code。各フェーズ末のレビュー・検証・push は常に Claude Code。

**合計: 約 10 時間強（3〜5 セッション想定）**

## 本計画で「やらない」こと（スコープ外）

- デザイン・機能の変更、新機能追加
- Tailwind v4 への移行（v3.4 統一まで）
- Google Fonts の自己ホスト化（判断のみ仰ぐ）
- git 履歴書き換えによる .git 縮小（オプション扱い、別計画）
- `content/` 配下 Markdown の本文修正（Obsidian 管理）
- React SPA と Astro の統合（どちらかへの一本化）— 現ハイブリッド構成は意図した設計のため維持
