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

### 1. WikiLink & Backlinks Implementation (Assigned to Gemini - HIGH PRIORITY)

**目的：**デジタルガーデンにWiki風の双方向リンク機能を実装する。Maggie Appleton (https://maggieappleton.com/) のような記事間のつながりを可視化する。

#### 背景
- 現在：記事間のリンクは手動で`[text](/blog/slug)`を記述
- 目標：
  1. Obsidian風の`[[slug]]`記法をサポート + バックリンク自動生成（**blogのみ**）
  2. `unlisted`フラグで「公開記事」と「メモ記事」を区別
- 効果：
  - 記事間の関連性が一目でわかり、知識の有機的なつながりを表現できる
  - メモやリファレンス記事をホーム画面に表示せず、リンク経由でのみアクセス可能にする
- 適用範囲：**blog のみ**（poem と moment は対象外）

#### コンセプト：公開記事とメモ記事

```
公開記事 (unlisted: なし)
├─ ホーム画面に表示✅
├─ RSS配信される✅
└─ メイン記事として機能

メモ記事 (unlisted: true)
├─ ホーム画面に非表示❌
├─ RSS配信されない❌
├─ 直リンクでアクセス可能✅
├─ WikiLinkで参照可能✅
└─ バックリンクに表示される✅
```

**使用例：**
```yaml
# 公開記事（メイン）
---
title: デジタルガーデンについて
date: 2026-01-17
---
詳しくは[[terminology]]を参照。

# メモ記事（補足）
---
title: 用語集
unlisted: true
---
デジタルガーデンの用語をまとめたメモ。
```

#### 実装の全体像

```
Phase 1: unlisted フラグ + WikiLink構文のサポート (1.5時間)
  ↓
Phase 2: バックリンク解析スクリプト (2-3時間)
  ↓
Phase 3: Backlinksコンポーネント作成 (1-2時間)
  ↓
Phase 4: RSS生成スクリプトの修正 (30分)
  ↓
Phase 5: テスト・スタイリング調整 (1時間)
```

---

#### Phase 1: unlisted フラグ + WikiLink構文のサポート

**やること：**
1. `types.ts`に`unlisted`フィールドを追加
2. `lib/content.ts`でfrontmatterから`unlisted`を読み取る
3. `lib/content.ts`で`[[slug]]`を`<a href="/blog/slug">slug</a>`に変換
4. ホーム画面用のエクスポートで`unlisted`記事を除外

**修正ファイル：** `types.ts`, `lib/content.ts`

---

**1. `types.ts` の修正：**

`unlisted`フィールドを追加します。

```typescript
export interface ContentItem {
  slug: string;
  title: string;
  date: string;
  updated: string;
  type: ContentType;
  excerpt: string;
  content: string;
  rawContent: string;
  images?: string[];
  unlisted?: boolean;  // ← この行を追加
}
```

---

**2. `lib/content.ts` の修正（frontmatterパース部分）：**

`parseMarkdownFile`関数内で`unlisted`を読み取ります（lib/content.ts:52-106の範囲）。

```typescript
function parseMarkdownFile(
  filePath: string,
  rawContent: string,
  type: ContentType
): ContentItem {
  const { data, content: rawBody } = parseFrontmatter(rawContent);
  let content = rawBody;
  const slug = filePath.split('/').pop()?.replace('.md', '') || '';

  // ... excerpt処理（既存コード）...

  // Convert Obsidian wiki links to standard markdown images
  const wikiLinkRegex = /!\[\[(.*?)\]\]/g;
  content = content.replace(wikiLinkRegex, (match, filename) => {
    // ... 既存の画像処理
  });

  // ↓ この直後に以下を追加 ↓

  // Convert [[slug]] to internal links (blog only)
  if (type === 'blog') {
    const articleLinkRegex = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
    content = content.replace(articleLinkRegex, (match, slug, displayText) => {
      const text = displayText || slug;
      return `[${text}](/blog/${slug})`;
    });
  }

  // ... 画像抽出処理（既存コード）...

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    updated: data.updated || data.date || '',
    type,
    excerpt,
    content: DOMPurify.sanitize(marked.parse(content, { renderer, breaks: true }) as string, {
      ADD_ATTR: ['loading', 'decoding', 'class'],
    }),
    rawContent: content,
    images: images.length > 0 ? images : undefined,
    unlisted: data.unlisted === 'true' || data.unlisted === true,  // ← この行を追加
  };
}
```

---

**3. `lib/content.ts` の修正（エクスポート部分）：**

ホーム画面に表示される配列から`unlisted`記事を除外します（lib/content.ts:122-137の範囲）。

```typescript
// Parse all content
const allBlogPosts = parseFiles(blogFiles, 'blog');
const allPoems = parseFiles(poemFiles, 'poem');
const allMoments = parseFiles(momentFiles, 'moment');

// Sort by updated date (newest first)
function sortByUpdated(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.updated).getTime();
    const dateB = new Date(b.updated).getTime();
    return dateB - dateA;
  });
}

// Export sorted content (unlisted記事を除外)
export const BLOG_POSTS = sortByUpdated(allBlogPosts).filter(item => !item.unlisted);
export const POEMS = sortByUpdated(allPoems);
export const MOMENTS = sortByUpdated(allMoments);

// Combined blog + moments for left column (unlisted記事を除外)
export const LEFT_COLUMN_CONTENT = sortByUpdated([...allBlogPosts, ...allMoments])
  .filter(item => !item.unlisted);

// ↓ 以下を追加（バックリンク機能で必要） ↓
// 全記事（unlisted含む）を内部的に保持
const ALL_BLOG_POSTS_INCLUDING_UNLISTED = sortByUpdated(allBlogPosts);
```

---

**4. `lib/content.ts` の修正（getContentBySlug）：**

`getContentBySlug`は変更不要です。unlisted記事も直リンクでアクセス可能にするため、既存のまま使います。

```typescript
// Get single item by slug and type（既存コードそのまま）
export function getContentBySlug(
  slug: string,
  type: ContentType
): ContentItem | undefined {
  const sources = {
    blog: allBlogPosts,  // unlisted含む全記事
    poem: allPoems,
    moment: allMoments,
  };
  return sources[type].find(item => item.slug === slug);
}
```

---

**動作確認：**

1. **unlistedフラグのテスト**
   ```bash
   # 公開記事
   echo "---
   title: Public Article
   date: 2026-01-17
   updated: 2026-01-17
   ---
   This is a public article. See [[hidden-note]].
   " > content/blog/public-article.md

   # メモ記事（非表示）
   echo "---
   title: Hidden Note
   date: 2026-01-17
   updated: 2026-01-17
   unlisted: true
   ---
   This is a hidden note.
   " > content/blog/hidden-note.md

   npm run dev
   ```

2. **期待される動作**
   - ホーム画面：「Public Article」のみ表示、「Hidden Note」は非表示
   - `/blog/public-article`：WikiLinkが機能し、「hidden-note」がリンクになる
   - `/blog/hidden-note`：直リンクでアクセス可能

**注意点：**
- `[[slug|表示テキスト]]` の形式もサポート（Obsidianと同じ）
- 画像の `![[image.png]]` とは区別する（`!`がない）
- **blogのみに適用**（poemとmomentには適用しない）
- `unlisted: true`の記事はホーム画面に非表示、でも直リンクでアクセス可能

---

#### Phase 2: バックリンク解析スクリプト

**やること：** 全記事を走査して「どの記事がどの記事にリンクしているか」を解析し、JSONファイルに出力する。

**新規作成ファイル：** `scripts/generate-backlinks.js`

**完全なコード：**

```javascript
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'backlinks.json');

/**
 * バックリンクを生成
 *
 * 出力形式:
 * {
 *   "target-slug": ["source-slug-1", "source-slug-2"],
 *   "digital-gardening": ["obsidian-guide", "knowledge-management"]
 * }
 */
function generateBacklinks() {
  const backlinks = {};

  // blog のみ対象（poem と moment は除外）
  const folders = ['blog'];

  folders.forEach(folder => {
    const folderPath = path.join(CONTENT_DIR, folder);
    if (!fs.existsSync(folderPath)) return;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.md'));

    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const sourceSlug = file.replace('.md', '');

      // 1. WikiLink [[slug]] を検出
      const wikiLinkRegex = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;
      let match;
      while ((match = wikiLinkRegex.exec(content)) !== null) {
        const targetSlug = match[1].trim();
        if (!backlinks[targetSlug]) backlinks[targetSlug] = [];
        if (!backlinks[targetSlug].includes(sourceSlug)) {
          backlinks[targetSlug].push(sourceSlug);
        }
      }

      // 2. Markdown link [text](/blog/slug) を検出
      const mdLinkRegex = /\[([^\]]+)\]\(\/blog\/([^)]+)\)/g;
      while ((match = mdLinkRegex.exec(content)) !== null) {
        const targetSlug = match[2].trim();
        if (!backlinks[targetSlug]) backlinks[targetSlug] = [];
        if (!backlinks[targetSlug].includes(sourceSlug)) {
          backlinks[targetSlug].push(sourceSlug);
        }
      }
    });
  });

  // JSONとして出力
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(backlinks, null, 2));

  console.log(`✅ Backlinks generated: ${OUTPUT_FILE}`);
  console.log(`   Total target articles with backlinks: ${Object.keys(backlinks).length}`);

  // デバッグ表示（参照が多い記事トップ5）
  const sorted = Object.entries(backlinks)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 5);

  if (sorted.length > 0) {
    console.log('\n📊 Most referenced articles:');
    sorted.forEach(([slug, sources]) => {
      console.log(`   - ${slug}: ${sources.length} backlinks`);
    });
  }
}

generateBacklinks();
```

**`package.json`に追加：**

```json
{
  "scripts": {
    "backlinks": "node scripts/generate-backlinks.js",
    "build": "node scripts/copy-images.js && node scripts/generate-rss.js && node scripts/generate-sitemap.js && node scripts/generate-backlinks.js && vite build"
  }
}
```

**動作確認：**
```bash
npm run backlinks

# 出力例:
# ✅ Backlinks generated: /path/to/public/backlinks.json
#    Total target articles with backlinks: 2
#
# 📊 Most referenced articles:
#    - digital-gardening: 2 backlinks
```

**生成されるJSON例：**
```json
{
  "digital-gardening": ["obsidian-guide", "knowledge-management"],
  "obsidian-guide": ["morning-light"]
}
```

---

#### Phase 3: Backlinksコンポーネント作成

**やること：** 記事末尾に「この記事から参照されています」セクションを表示するコンポーネントを作成。

**新規作成ファイル：** `components/Backlinks.tsx`

**完全なコード：**

```tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContentBySlug } from '../lib/content';

interface BacklinksProps {
  /** 現在の記事のslug */
  slug: string;
}

interface BacklinkData {
  slug: string;
  title: string;
}

/**
 * バックリンク（この記事への参照）を表示するコンポーネント
 *
 * Maggie Appleton風のデザイン：
 * - シンプルなリスト形式
 * - 記事のタイトルを表示（slugではなく）
 * - ホバー時にアンダーライン
 * - blogのみに適用（momentとpoemは対象外）
 */
export default function Backlinks({ slug }: BacklinksProps) {
  const [backlinks, setBacklinks] = useState<BacklinkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBacklinks() {
      try {
        // public/backlinks.json を取得
        const response = await fetch('/at-an-arbor/backlinks.json');
        if (!response.ok) {
          console.warn('Backlinks file not found');
          setLoading(false);
          return;
        }

        const data: Record<string, string[]> = await response.json();
        const sourceSlugs = data[slug] || [];

        // slugからタイトルを取得（blogのみ）
        const linksWithTitles = sourceSlugs
          .map(sourceSlug => {
            const item = getContentBySlug(sourceSlug, 'blog');
            return item ? { slug: sourceSlug, title: item.title } : null;
          })
          .filter((item): item is BacklinkData => item !== null);

        setBacklinks(linksWithTitles);
      } catch (error) {
        console.error('Failed to load backlinks:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBacklinks();
  }, [slug]);

  // バックリンクがない場合は何も表示しない
  if (loading || backlinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4 tracking-wider">
        📎 REFERENCED BY
      </h3>
      <ul className="space-y-3">
        {backlinks.map(({ slug: linkSlug, title }) => (
          <li key={linkSlug}>
            <Link
              to={`/blog/${linkSlug}`}
              className="text-blue-600 dark:text-blue-400 hover:underline font-serif text-lg"
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**`pages/ContentDetail.tsx`に統合：**

既存のfooterセクションの直前に追加：

```tsx
// 1. importを追加（ファイル冒頭）
import Backlinks from '../components/Backlinks';

// 2. articleタグの直後、footerの直前に追加（Blog layoutの中のみ）
<article
  className="prose prose-stone dark:prose-invert prose-lg font-serif leading-loose text-gray-800 dark:text-gray-200"
  dangerouslySetInnerHTML={{ __html: item.content }}
/>

{/* ↓ ここに追加 ↓ */}
{type === 'blog' && (
  <Backlinks slug={item.slug} />
)}

<footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between font-mono text-sm">
  <button onClick={() => navigate(-1)} className="hover:underline">← BACK</button>
  <span>END OF RECORD</span>
</footer>
```

---

#### Phase 4: RSS生成スクリプトの修正

**やること：** `scripts/generate-rss.js`を修正して、`unlisted`記事をRSS配信から除外する。

**修正ファイル：** `scripts/generate-rss.js`

**変更内容：**

```javascript
// 現在のコード (scripts/generate-rss.js:30-62)
function readMarkdownFiles(dir, type) {
  const fullPath = path.join(process.cwd(), 'content', dir);
  if (!fs.existsSync(fullPath)) return [];

  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
    const { data, content: body } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    // ↓ ここに unlisted チェックを追加 ↓
    // unlisted記事はスキップ
    if (data.unlisted === 'true' || data.unlisted === true) {
      return null;
    }

    // Get excerpt
    const firstParagraph = body.trim().split('\n\n')[0] || '';
    const excerpt = firstParagraph.slice(0, 200).replace(/\n/g, ' ');

    // URL mapping based on type
    const urlMap = {
      blog: `${SITE_URL}/#/blog/${slug}`,
      poem: `${SITE_URL}/#/poems/${slug}`,
      moment: `${SITE_URL}/#/moments/${slug}`,
    };

    return {
      title: data.title || slug,
      date: data.updated || data.date || '',
      slug,
      type,
      excerpt,
      url: urlMap[type] || `${SITE_URL}/#/${type}/${slug}`
    };
  }).filter(item => item !== null);  // ← nullを除外
}
```

**動作確認：**
```bash
npm run rss
cat public/rss.xml
# unlisted: true の記事が含まれていないことを確認
```

---

#### Phase 5: テスト・スタイリング調整

**テストシナリオ：**

1. **WikiLink + unlisted の統合テスト**
   ```bash
   # 公開記事
   echo "---
   title: Article A (Public)
   date: 2026-01-17
   updated: 2026-01-17
   ---

   See [[article-b]] and [[hidden-note]] for more info.
   " > content/blog/article-a.md

   # 公開記事
   echo "---
   title: Article B (Public)
   date: 2026-01-17
   updated: 2026-01-17
   ---

   This is article B. Reference to [[article-a]].
   " > content/blog/article-b.md

   # メモ記事（unlisted）
   echo "---
   title: Hidden Note
   date: 2026-01-17
   updated: 2026-01-17
   unlisted: true
   ---

   This is a hidden note. Links back to [[article-a]].
   " > content/blog/hidden-note.md
   ```

2. **バックリンク生成**
   ```bash
   npm run backlinks
   cat public/backlinks.json
   # 期待される出力:
   # {
   #   "article-a": ["article-b", "hidden-note"],
   #   "article-b": ["article-a"],
   #   "hidden-note": ["article-a"]
   # }
   ```

3. **ホーム画面確認**
   ```bash
   npm run dev
   # http://localhost:5173/ にアクセス
   # 期待: "Article A" と "Article B" のみ表示
   # 期待: "Hidden Note" は非表示
   ```

4. **記事ページ確認**
   ```bash
   # http://localhost:5173/#/blog/article-a にアクセス
   # 期待: WikiLinkが機能（article-b と hidden-note がリンクになる）
   # 期待: バックリンクセクションに "Article B" と "Hidden Note" が表示される

   # http://localhost:5173/#/blog/hidden-note にアクセス（直リンク）
   # 期待: ページが表示される
   # 期待: バックリンクセクションに "Article A" が表示される
   ```

5. **RSS配信確認**
   ```bash
   npm run rss
   cat public/rss.xml | grep -i "hidden"
   # 期待: "Hidden Note" が含まれていない（unlisted除外）
   ```

6. **エッジケース確認**
   - リンクがない記事（バックリンクセクションが非表示）
   - 同じ記事から複数回リンク（重複排除）
   - 存在しないslugへのリンク（エラーなく無視される）
   - unlisted記事へのリンク（正常に機能する）
   - unlisted記事からのバックリンク（正常に表示される）

**スタイリング調整ポイント：**
- `Backlinks.tsx`のクラス名を調整して、既存のデザインに統一
- ダークモードでの見やすさ確認
- モバイル表示の確認（responsive design）

---

#### 実装順序の推奨

**推奨される実装フロー：**

1. **Phase 1（unlisted + WikiLink）** を完全に実装
   - `types.ts` の修正
   - `lib/content.ts` の修正（unlisted読み取り、WikiLink変換、フィルタリング）
   - 動作確認（ホーム画面でunlisted非表示、WikiLink機能）

2. **Phase 2（バックリンクスクリプト）** を実装
   - `scripts/generate-backlinks.js` を作成
   - `package.json` に `backlinks` コマンド追加
   - 動作確認（`npm run backlinks` で JSON生成）

3. **Phase 3（Backlinksコンポーネント）** を実装
   - `components/Backlinks.tsx` を作成
   - `pages/ContentDetail.tsx` に統合
   - 動作確認（記事末尾にバックリンク表示）

4. **Phase 4（RSS修正）** を実装
   - `scripts/generate-rss.js` を修正
   - 動作確認（unlisted記事がRSSに含まれない）

5. **Phase 5（統合テスト）** を実施
   - 全機能の統合テスト
   - スタイリング調整

**注意事項：**
- `public/backlinks.json` は `.gitignore` に追加不要（ビルド生成物だがコミットしてOK）
- 開発中は `npm run backlinks` を手動実行
- 本番ビルド時は自動生成される（`npm run build`に含まれる）
- **blogのみに適用**：poemとmomentではWikiLinkもバックリンクも表示されない
- **unlisted記事の仕様**：
  - ホーム画面に非表示
  - RSS配信されない
  - 直リンク（`/blog/slug`）でアクセス可能
  - WikiLinkで参照可能
  - バックリンクに表示される（つながりを可視化するため）

---

### 2. Image Optimization (Assigned to Gemini - LOW PRIORITY)
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

### 3. Future: Seedling/Evergreen Badges (Phase 2)
Add `stage` field to frontmatter and display badges in UI.
- Files to modify: `types.ts`, `lib/content.ts`, `pages/ContentDetail.tsx`

---

## Development History

### 2026-01-17: WikiLink & Backlinks Feature + Unlisted Flag (Claude + Gemini)
**Claude's contribution:**
- Researched implementation approaches (Quartz vs custom implementation)
- Decided on "Quartz-inspired custom implementation" to maintain design integrity
- Designed `unlisted` flag system for separating public articles from memo articles
- Created detailed implementation guide in GEMINI.md with 5 phases
- Reference: Maggie Appleton's digital garden (https://maggieappleton.com/)

**Gemini's task:**
- Phase 1: Implement `unlisted` flag + WikiLink syntax support in `types.ts` and `lib/content.ts`
- Phase 2: Create `scripts/generate-backlinks.js` for link analysis
- Phase 3: Build `components/Backlinks.tsx` for UI display
- Phase 4: Modify `scripts/generate-rss.js` to exclude unlisted articles
- Phase 5: Test and style adjustments

**Goals:**
- Support `[[slug]]` and `[[slug|display text]]` syntax (Obsidian-compatible)
- Auto-generate bidirectional links (backlinks)
- Visualize article connections like a wiki
- Separate public articles (listed) from memo/reference articles (unlisted)
- Unlisted articles: hidden from home, not in RSS, but accessible via direct link and backlinks

### 2026-01-11: Phase 1 Foundation (Claude)
- Added SEO basics: robots.txt, sitemap.xml generation
- Improved content workflow: publish script for article + image copy
- Updated RSS to include all content types (blog, poem, moments)
- Set up AI collaboration: GEMINI.md, agent-memory with project context
