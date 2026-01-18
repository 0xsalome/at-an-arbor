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

---

## Astro Migration Project - Phase 1 (2026-01-18)

### プロジェクト概要

**目的**: ブログ詳細ページをAstroで静的HTML生成し、SEO改善とWikiLink/バックリンク機能を追加。ホーム/一覧ページは既存のReact SPAとして維持。

**Claude（完了済み）が実装したコアロジック**:
1. ✅ **WikiLink remarkプラグイン** (`astro-wikilinks.ts`) - `[[slug]]`をリンクに変換
2. ✅ **バックリンク計算ロジック** (`astro-backlinks.ts`) - 記事間の参照関係を解析
3. ✅ **ビルド統合スクリプト** (`scripts/merge-builds.js`) - AstroとReactのビルドをマージ
4. ✅ **アーキテクチャレビュー** - 設計の妥当性確認と修正

**Geminiが実装するタスク**（このセクション以降に詳細あり）:
- Astroプロジェクトのセットアップ
- ブログ詳細ページの作成
- React側の修正
- RSS/Sitemap URL修正
- テストと検証

---

### 重要な設計決定（Claude by アーキテクチャレビュー）

**問題**: 当初プランではblog-index.json APIをReactのlib/content.tsでfetchする想定だったが、ビルド時にJSONが存在しないため矛盾が発生。

**解決策（採用）**: Option A - Reactは引き続きimport.meta.globを使用
- lib/content.tsの既存ロジックをほぼ維持
- ブログ記事のメタデータはAstroとReact両方で保持（重複するが安全）
- blog-index.json APIは生成するが、Reactは使用しない（将来の拡張用として残す）

**変更点**:
- `lib/content.ts`: unlistedフィルタリングのみ追加
- `App.tsx`: ブログ詳細ルート削除、BrowserRouterに変更

---

### Claudeが作成したファイル

以下の3つのファイルがプロジェクトルートに配置されています：

#### 1. `astro-wikilinks.ts` - WikiLink remarkプラグイン

**役割**: Markdown内の`[[slug]]`記法をHTMLリンクに変換するremarkプラグイン

**サポートする記法**:
- `[[slug]]` → `[slug](/at-an-arbor/blog/slug)`
- `[[slug|表示テキスト]]` → `[表示テキスト](/at-an-arbor/blog/slug)`
- 画像の`![[image.png]]`とは区別（`!`がある場合は処理しない）

**使用方法**:
```javascript
// astro-blog/astro.config.mjs
import { remarkWikiLinks } from '../astro-wikilinks';

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkWikiLinks],
  },
});
```

**配置場所**: このファイルを`astro-blog/src/utils/wikilinks.ts`にコピーして使用

---

#### 2. `astro-backlinks.ts` - バックリンク計算ロジック

**役割**: Astro Content Collectionsから全記事を読み取り、WikiLinkとMarkdownリンクを解析してバックリンクマップを生成

**検出するパターン**:
1. `[[slug]]` → slug
2. `[[slug|表示テキスト]]` → slug
3. `[text](/blog/slug)` → slug
4. `[text](/at-an-arbor/blog/slug)` → slug

**使用方法**:
```typescript
// astro-blog/src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';
import { buildBacklinksMap, getBacklinksForSlug } from '../../utils/backlinks';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const backlinksMap = await buildBacklinksMap(allPosts);

  return allPosts.map(post => ({
    params: { slug: post.slug },
    props: {
      post,
      backlinks: getBacklinksForSlug(post.slug, backlinksMap),
    },
  }));
}
```

**配置場所**: このファイルを`astro-blog/src/utils/backlinks.ts`にコピーして使用

---

#### 3. `scripts/merge-builds.js` - ビルド統合スクリプト

**役割**: AstroとReactのビルド結果をマージして最終的なdist/ディレクトリを作成

**処理フロー**:
1. `astro-blog/dist/`をベースとしてコピー
2. `dist-react/`をマージ（Reactのindex.htmlでAstroのindex.htmlを上書き）
3. 一時ディレクトリ（dist-react）を削除
4. 最終構造を表示

**最終的なdist/の構造**:
```
dist/
├── index.html           (React SPA - ホーム、一覧)
├── blog/
│   ├── slug-1/
│   │   └── index.html   (Astro生成 - SEO最適化)
│   └── slug-2/
│       └── index.html   (Astro生成)
├── api/
│   └── blog-index.json  (Astro生成 - 将来の拡張用)
├── _astro/              (Astroアセット)
└── assets/              (Reactアセット)
```

---

### Geminiへのタスク一覧

以下のタスクを順番に実装してください。各タスクの詳細は次のセクションにあります。

**優先度順**:
1. ⬜ **Task 1: Astroプロジェクトのセットアップ** (1-2時間)
2. ⬜ **Task 2: Content Collections設定** (30分)
3. ⬜ **Task 3: ブログ詳細ページの作成** (2-3時間)
4. ⬜ **Task 4: blog-index.json API作成** (30分)
5. ⬜ **Task 5: React側の修正** (1-2時間)
6. ⬜ **Task 6: ビルドスクリプト統合** (1時間)
7. ⬜ **Task 7: RSS/Sitemap URL修正** (30分)
8. ⬜ **Task 8: GitHub Actions更新** (30分)
9. ⬜ **Task 9: 統合テスト** (1-2時間)
10. ⬜ **Task 10: ドキュメント更新** (30分)

**合計見積もり**: 10-15時間

---

### Task 1: Astroプロジェクトのセットアップ (1-2時間)

**目的**: Astroプロジェクトを作成し、React/Tailwind統合を設定

**手順**:

1. **Astroプロジェクト作成**:
```bash
cd /Users/r/src/at-an-arbor
npm create astro@latest astro-blog -- --template minimal --yes --typescript strict
```

2. **依存関係インストール**:
```bash
cd astro-blog
npm install @astrojs/react @astrojs/tailwind @astrojs/mdx
npm install react react-dom gray-matter unist-util-visit
npm install -D tailwindcss @types/react @types/react-dom @types/mdast
```

3. **astro.config.mjs作成**:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import { remarkWikiLinks } from '../astro-wikilinks';

export default defineConfig({
  base: '/at-an-arbor/',
  outDir: 'dist',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // 既存のスタイルを維持
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkWikiLinks],
  },
  build: {
    format: 'directory',
  },
});
```

4. **tailwind.config.mjs作成**:
```javascript
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'paper-white': '#f8f7f4',
        'ink-black': '#383c3c',
        'text-main': '#111111',
        'text-inv': '#f5f5f5',
      },
      fontFamily: {
        serif: ['"Shippori Mincho"', '"Noto Serif JP"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
};
```

5. **シンボリックリンク作成**:
```bash
# content/blog/ へのリンク
cd /Users/r/src/at-an-arbor/astro-blog/src
mkdir -p content
ln -s ../../../content/blog content/blog

# public/ へのリンク
cd /Users/r/src/at-an-arbor/astro-blog
ln -s ../public public
```

6. **Claudeのファイルをコピー**:
```bash
cd /Users/r/src/at-an-arbor/astro-blog/src
mkdir -p utils
cp ../../astro-wikilinks.ts utils/wikilinks.ts
cp ../../astro-backlinks.ts utils/backlinks.ts
```

**検証**:
```bash
cd astro-blog
npm run dev
# http://localhost:4321 でAstroが起動することを確認
```

**完了条件**:
- Astroプロジェクトが正常に起動する
- シンボリックリンクが機能している（content/blog/とpublic/が参照できる）
- Claudeのユーティリティファイルが配置されている

---

### Task 2: Content Collections設定 (30分)

**目的**: Astro Content Collectionsでblog記事を読み込めるようにする

**手順**:

1. **src/content/config.ts作成**:
```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    type: z.literal('blog'),
    unlisted: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

**注意**: シンボリックリンクを使用しているため、`src/content/blog/`は実際には`/Users/r/src/at-an-arbor/content/blog/`を参照します。

**検証**:
```bash
cd astro-blog
npm run dev
# エラーが出ないことを確認
```

開発サーバーのコンソールで、以下のようなログが出ればOK:
```
Content collections enabled
✓ blog: 3 entries
```

**完了条件**:
- Content Collectionsが正常に機能する
- blog記事が認識されている

---

### Task 3: ブログ詳細ページの作成 (2-3時間)

**目的**: Astroでブログ詳細ページを生成し、Reactコンポーネントを統合

**手順**:

1. **BlogPost.astroレイアウト作成** (`src/layouts/BlogPost.astro`):

```astro
---
import type { Backlink } from '../utils/backlinks';

interface Props {
  title: string;
  date: string;
  updated: string;
  backlinks: Backlink[];
}

const { title, date, updated, backlinks } = Astro.props;
---

<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} - at an arbor</title>
    <meta name="description" content={title} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={title} />
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`https://0xsalome.github.io/at-an-arbor/blog/${Astro.params.slug}`} />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700&family=Noto+Serif+JP:wght@400;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <script is:inline>
      (function() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) document.documentElement.classList.add('dark');
      })();
    </script>
    <style>
      /* Proseスタイル（Tailwind Typography互換） */
      .prose {
        color: #374151;
        max-width: 65ch;
      }
      .prose :where(p):not(:where([class~="not-prose"] *)) {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
      }
      .prose :where(a):not(:where([class~="not-prose"] *)) {
        color: #2563eb;
        text-decoration: underline;
        font-weight: 500;
      }
      .prose :where(strong):not(:where([class~="not-prose"] *)) {
        color: #111827;
        font-weight: 600;
      }
      .prose :where(h1):not(:where([class~="not-prose"] *)) {
        color: #111827;
        font-weight: 800;
        font-size: 2.25em;
        margin-top: 0;
        margin-bottom: 0.8888889em;
        line-height: 1.1111111;
      }
      .prose :where(h2):not(:where([class~="not-prose"] *)) {
        color: #111827;
        font-weight: 700;
        font-size: 1.5em;
        margin-top: 2em;
        margin-bottom: 1em;
        line-height: 1.3333333;
      }
      .prose :where(code):not(:where([class~="not-prose"] *)) {
        color: #111827;
        font-weight: 600;
        font-size: 0.875em;
      }
      .prose :where(pre):not(:where([class~="not-prose"] *)) {
        color: #e5e7eb;
        background-color: #1f2937;
        overflow-x: auto;
        font-weight: 400;
        font-size: 0.875em;
        line-height: 1.7142857;
        margin-top: 1.7142857em;
        margin-bottom: 1.7142857em;
        border-radius: 0.375rem;
        padding: 0.8571429em 1.1428571em;
      }
      .dark .prose {
        color: #d1d5db;
      }
      .dark .prose :where(a):not(:where([class~="not-prose"] *)) {
        color: #60a5fa;
      }
      .dark .prose :where(strong):not(:where([class~="not-prose"] *)) {
        color: #f9fafb;
      }
      .dark .prose :where(h1):not(:where([class~="not-prose"] *)),
      .dark .prose :where(h2):not(:where([class~="not-prose"] *)) {
        color: #f9fafb;
      }
      /* WikiLinkスタイル */
      .wikilink {
        color: #7c3aed;
        text-decoration: underline;
        text-decoration-style: dotted;
      }
      .dark .wikilink {
        color: #a78bfa;
      }
    </style>
  </head>
  <body class="min-h-screen bg-paper-white dark:bg-ink-black text-text-main dark:text-text-inv transition-colors">
    <div class="flex flex-col md:flex-row">
      <!-- Sidebar -->
      <aside class="w-full md:w-1/6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <nav class="space-y-6">
          <a href="/at-an-arbor/" class="block text-sm font-mono hover:underline">← HOME</a>
          <div class="text-xs font-mono text-gray-500 dark:text-gray-400">
            at an arbor
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="w-full md:w-5/6 p-6 md:p-16 lg:p-24 max-w-4xl mx-auto">
        <header class="mb-12 border-b border-gray-900 dark:border-gray-600 pb-8">
          <div class="font-mono text-sm text-gray-500 dark:text-gray-400 mb-4">
            {updated}
            <span class="mx-2">/</span>
            BLOG
          </div>
          <h1 class="text-3xl md:text-5xl font-serif font-bold leading-tight">{title}</h1>
        </header>

        <article class="prose prose-stone dark:prose-invert prose-lg font-serif leading-loose">
          <slot />
        </article>

        {backlinks.length > 0 && (
          <section class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 class="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4 tracking-wider">
              📎 REFERENCED BY
            </h2>
            <ul class="space-y-3">
              {backlinks.map((link) => (
                <li>
                  <a
                    href={`/at-an-arbor/blog/${link.slug}`}
                    class="text-blue-600 dark:text-blue-400 hover:underline font-serif text-lg"
                  >
                    {link.title}
                  </a>
                  <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({link.updated})</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between font-mono text-sm">
          <a href="/at-an-arbor/" class="hover:underline">← BACK</a>
          <span class="text-gray-500 dark:text-gray-400">END OF RECORD</span>
        </footer>
      </main>
    </div>
  </body>
</html>
```

2. **[slug].astroページ作成** (`src/pages/blog/[slug].astro`):

```astro
---
import { getCollection } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';
import { buildBacklinksMap, getBacklinksForSlug } from '../../utils/backlinks';

export async function getStaticPaths() {
  // unlisted記事も含めて全て取得（直リンクでアクセス可能にするため）
  const blogEntries = await getCollection('blog');

  const backlinksMap = await buildBacklinksMap(blogEntries);

  return blogEntries.map((entry) => ({
    params: { slug: entry.slug },
    props: {
      entry,
      backlinks: getBacklinksForSlug(entry.slug, backlinksMap),
    },
  }));
}

const { entry, backlinks } = Astro.props;
const { Content } = await entry.render();
---

<BlogPost
  title={entry.data.title}
  date={entry.data.date}
  updated={entry.data.updated || entry.data.date}
  backlinks={backlinks}
>
  <Content />
</BlogPost>
```

**検証**:
```bash
cd astro-blog
npm run build
ls -la dist/blog/
# 各記事のindex.htmlが生成されていることを確認

# 特定の記事を確認
cat dist/blog/digital-gardening/index.html | grep "Digital_Gardening"
# タイトルが含まれることを確認
```

**完了条件**:
- ブログ詳細ページが静的HTMLとして生成される
- バックリンクセクションが表示される（該当する場合）
- WikiLinkが機能している（検証はTask 9で実施）

---

### Task 4: blog-index.json API作成 (30分)

**目的**: 将来の拡張用にブログ記事のメタデータAPIを生成

**注意**: このAPIは現在Reactでは使用されませんが、将来のRSS生成や検索機能で利用可能です。

**手順**:

1. **src/pages/api/blog-index.json.ts作成**:

```typescript
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  // unlisted記事を除外
  const blogEntries = await getCollection('blog', ({ data }) => {
    return !data.unlisted;
  });

  const blogIndex = blogEntries.map((entry) => {
    // 最初の段落を抽出（画像参照を除外）
    const firstParagraph = entry.body.trim().split('\n\n')[0] || '';
    const excerptWithoutImages = firstParagraph.replace(/!\[\[.*?\]\]/g, '').trim();
    const excerpt = excerptWithoutImages.slice(0, 100) +
                   (excerptWithoutImages.length > 100 ? '...' : '');

    return {
      slug: entry.slug,
      title: entry.data.title,
      date: entry.data.date,
      updated: entry.data.updated || entry.data.date,
      type: 'blog',
      excerpt,
    };
  });

  // 更新日順にソート（新しい順）
  blogIndex.sort((a, b) =>
    new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );

  return new Response(JSON.stringify(blogIndex, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
```

**検証**:
```bash
cd astro-blog
npm run build
cat dist/api/blog-index.json | head -30
# JSONが正しく生成されることを確認
```

**完了条件**:
- `dist/api/blog-index.json`が生成される
- unlisted記事が除外されている
- 更新日順にソートされている

---

### Task 5: React側の修正 (1-2時間)

**目的**: Reactのルーティングとコンテンツ取得を修正

**手順**:

1. **types.tsにunlistedフィールド追加** (`/Users/r/src/at-an-arbor/types.ts`):

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

2. **lib/content.ts修正** (`/Users/r/src/at-an-arbor/lib/content.ts`):

**修正箇所1: parseMarkdownFile関数（56行目付近）にunlisted読み取りを追加**

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

  // ↓↓↓ ここから追加 ↓↓↓
  // Convert [[slug]] to internal links (blog only)
  if (type === 'blog') {
    const articleLinkRegex = /(?<!!)(\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\])/g;
    content = content.replace(articleLinkRegex, (match, fullMatch, slug, displayText) => {
      const text = displayText || slug;
      return `[${text}](/at-an-arbor/#/blog/${slug})`;
    });
  }
  // ↑↑↑ ここまで追加 ↑↑↑

  // Extract images from markdown
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }

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

**修正箇所2: エクスポート部分（134行目付近）にunlistedフィルタリング追加**

```typescript
// Export sorted content（unlisted記事を除外）
export const BLOG_POSTS = sortByUpdated(allBlogPosts).filter(item => !item.unlisted);
export const POEMS = sortByUpdated(allPoems);
export const MOMENTS = sortByUpdated(allMoments);

// Combined blog + moments for left column (unlisted記事を除外)
export const LEFT_COLUMN_CONTENT = sortByUpdated([...allBlogPosts, ...allMoments])
  .filter(item => !item.unlisted);
```

**注意**: getContentBySlug関数は変更不要です（unlisted記事も直リンクでアクセス可能にするため）

3. **App.tsx修正** (`/Users/r/src/at-an-arbor/App.tsx`):

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// ↑ HashRouter → BrowserRouter に変更

// ... (他は同じ)

<Router>
  <Routes>
    <Route path="/at-an-arbor/" element={<Home />} />

    {/* ↓↓↓ ブログ詳細ルートを削除（Astroが担当） ↓↓↓ */}
    {/* <Route path="/at-an-arbor/blog/:slug" element={<ContentDetail type="blog" />} /> */}

    <Route path="/at-an-arbor/poems/:slug" element={<ContentDetail type="poem" />} />
    <Route path="/at-an-arbor/moments/:slug" element={<ContentDetail type="moment" />} />
    <Route path="/at-an-arbor/poems" element={<SimplePage type="poem" />} />
    <Route path="/at-an-arbor/*" element={<div>404</div>} />
  </Routes>
</Router>
```

**検証**:
```bash
cd /Users/r/src/at-an-arbor
npm run dev
# http://localhost:5173/at-an-arbor/ にアクセス
# ホームページが表示される
# ブログ一覧が表示される（unlisted記事は除外）
# ブログ記事クリック → 404になる（正常、Astroページはまだマージされていないため）
```

**完了条件**:
- types.tsにunlistedフィールドが追加されている
- lib/content.tsでWikiLink変換とunlistedフィルタリングが機能している
- App.tsxからブログ詳細ルートが削除されている
- 開発サーバーでホームページと一覧が正常に表示される

---

### Task 6: ビルドスクリプト統合 (1時間)

**目的**: package.jsonを更新し、ビルドフローを統合

**手順**:

1. **package.json修正** (`/Users/r/src/at-an-arbor/package.json`):

```json
{
  "scripts": {
    "dev": "node scripts/copy-images.js && vite",
    "dev:astro": "cd astro-blog && npm run dev",
    "build:astro": "cd astro-blog && npm run build",
    "build:react": "vite build --outDir dist-react",
    "build:merge": "node scripts/merge-builds.js",
    "build": "npm run copy-images && npm run build:astro && npm run build:react && npm run build:merge && npm run rss && npm run sitemap",
    "preview": "vite preview --outDir dist",
    "rss": "node scripts/generate-rss.js",
    "sitemap": "node scripts/generate-sitemap.js",
    "copy-images": "node scripts/copy-images.js",
    "publish": "node scripts/publish.js"
  }
}
```

**検証**:
```bash
cd /Users/r/src/at-an-arbor
npm run build

# エラーがないことを確認
# 以下のような出力が表示される:
# ℹ️  Starting build merge process...
# ✅ Copied XXX files from Astro build
# ✅ Merged XXX files from React build
# ✅ Build merge complete! Total files: XXX
```

**完了条件**:
- npm run buildがエラーなく完了する
- dist/ディレクトリに以下が含まれる:
  - index.html（React SPA）
  - blog/slug/index.html（Astro生成）
  - api/blog-index.json（Astro生成）
  - _astro/（Astroアセット）
  - assets/（Reactアセット）

---

### Task 7: RSS/Sitemap URL修正 (30分)

**目的**: ブログURLをハッシュルート（#/blog/slug）からクリーンパス（/blog/slug）に変更

**手順**:

1. **scripts/generate-rss.js修正**:

**修正箇所: 47-51行目付近のurlMap**

```javascript
// URL mapping based on type
const urlMap = {
  blog: `${SITE_URL}/blog/${slug}`,      // ← ハッシュ削除
  poem: `${SITE_URL}/#/poems/${slug}`,
  moment: `${SITE_URL}/#/moments/${slug}`,
};
```

2. **scripts/generate-sitemap.js修正**:

**修正箇所: blogUrlsの生成部分**

```javascript
// Blog posts
const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
const blogUrls = blogFiles.map(file => {
  const slug = path.basename(file, '.md');
  return `${SITE_URL}/blog/${slug}`;  // ← ハッシュ削除
});
```

**検証**:
```bash
npm run rss
cat public/rss.xml | grep "<link>"
# /blog/slug 形式のURLが含まれることを確認

npm run sitemap
cat public/sitemap.xml | grep "blog"
# /blog/slug 形式のURLが含まれることを確認
```

**完了条件**:
- RSS feedのブログURLが`/blog/slug`形式になっている
- Sitemapのブログエントリーが`/blog/slug`形式になっている
- Poem/MomentはハッシュURLのまま（`/#/poems/slug`）

---

### Task 8: GitHub Actions更新 (30分)

**目的**: デプロイワークフローにAstro依存関係インストールを追加

**手順**:

1. **.github/workflows/deploy.yml修正**:

**修正箇所: Install dependencies の後に追加**

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Astro dependencies
  run: cd astro-blog && npm ci

- name: Build
  run: npm run build
```

**ローカルで同じコマンドを実行して検証**:
```bash
cd /Users/r/src/at-an-arbor
rm -rf node_modules astro-blog/node_modules
npm ci
cd astro-blog && npm ci && cd ..
npm run build
# エラーなく完了することを確認
```

**完了条件**:
- GitHub Actionsワークフローが更新されている
- ローカルでクリーンインストール→ビルドが成功する

---

### Task 9: 統合テスト (1-2時間)

**目的**: 全機能が正常に動作することを確認

**テストケース**:

1. **WikiLinkテスト**:

```bash
# テスト記事作成
cat > /Users/r/src/at-an-arbor/content/blog/test-article-a.md << 'EOF'
---
title: Test Article A
date: 2026-01-18
type: blog
---

This references [[digital-gardening]] and [[test-article-b]].
EOF

cat > /Users/r/src/at-an-arbor/content/blog/test-article-b.md << 'EOF'
---
title: Test Article B
date: 2026-01-18
type: blog
---

Content here. Links to [[test-article-a]].
EOF

npm run build
npm run preview
# http://localhost:4173/at-an-arbor/blog/test-article-a にアクセス
# - digital-gardening へのリンクが表示される
# - test-article-b へのリンクが表示される
# - test-article-b のバックリンクセクションに test-article-a が表示される
```

2. **unlistedフラグテスト**:

```bash
# メモ記事作成
cat > /Users/r/src/at-an-arbor/content/blog/hidden-note.md << 'EOF'
---
title: Hidden Note
date: 2026-01-18
unlisted: true
type: blog
---

This is a hidden note. Links to [[test-article-a]].
EOF

npm run build
npm run preview
# http://localhost:4173/at-an-arbor/ にアクセス
# - ホーム画面に"Hidden Note"が表示されない ✅
# - test-article-a にバックリンクとして"Hidden Note"が表示される ✅

# http://localhost:4173/at-an-arbor/blog/hidden-note にアクセス
# - 直リンクでページが表示される ✅
```

3. **React SPA動作確認**:

```bash
npm run preview
# http://localhost:4173/at-an-arbor/ にアクセス
# - ホームページが表示される
# - ブログ一覧が表示される
# - Poemクリック → /#/poems/slug に遷移
# - Momentクリック → /#/moments/slug に遷移
```

4. **ダークモード確認**:

```bash
# ブログ詳細ページでダークモード切り替え
# LocalStorageに保存され、ページリロードしても状態が維持される
```

5. **RSS/Sitemap確認**:

```bash
cat public/rss.xml | grep "test-article-a"
# /blog/test-article-a のURLが含まれる

cat public/rss.xml | grep "hidden-note"
# 含まれない（unlisted除外）

cat public/sitemap.xml | grep "blog"
# /blog/slug 形式のURLが含まれる
```

**完了条件**:
- 全てのテストケースが成功する
- WikiLinkが機能している
- バックリンクが表示される
- unlistedフラグが機能している
- React SPAが正常に動作している
- ダークモードが機能している
- RSS/Sitemapが正しく生成されている

---

### Task 10: ドキュメント更新 (30分)

**目的**: 新しいビルドフローとAstro機能をドキュメント化

**手順**:

1. **CLAUDE.md更新** - 以下のセクションを追加:

```markdown
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
記事内で`[[slug]]`または`[[slug|表示テキスト]]`と書くと、自動的に`/blog/slug`へのリンクに変換されます。

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
- 直リンク（`/blog/slug`）でアクセス可能
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
│   └── astro.config.mjs
├── src/                  # React SPA
├── content/              # Markdown（共有）
├── public/               # 静的ファイル（共有）
├── scripts/
│   └── merge-builds.js   # ビルド統合
└── dist/                 # 最終出力
```
```

2. **テストファイルのクリーンアップ**:

```bash
rm /Users/r/src/at-an-arbor/content/blog/test-*.md
rm /Users/r/src/at-an-arbor/content/blog/hidden-note.md
```

**完了条件**:
- CLAUDE.mdに新しいセクションが追加されている
- テスト用の記事が削除されている

---

### 実装時の注意点

1. **シンボリックリンクの扱い**:
   - `astro-blog/src/content/blog/` → `../../../content/blog/`
   - `astro-blog/public/` → `../public/`
   - これにより、既存のMarkdownファイルと画像を共有できます

2. **BASE_PATHの一貫性**:
   - Astro: `/at-an-arbor/`
   - React: `/at-an-arbor/`
   - 全てのパスに`/at-an-arbor/`プレフィックスが必要（GitHub Pages用）

3. **ビルド順序の重要性**:
   ```
   1. copy-images.js    # 画像最適化
   2. Astro build       # ブログ詳細ページ生成
   3. React build       # SPA生成
   4. merge-builds.js   # 統合
   5. RSS/Sitemap       # メタデータ生成
   ```
   この順序を守らないと、ビルドが失敗します。

4. **Reactのimport.meta.glob**:
   - 開発時・本番時ともに同じロジックを使用
   - blog-index.json APIは生成されますが、Reactでは使用しません
   - 将来的に検索機能などで利用可能

5. **エラーハンドリング**:
   - merge-builds.jsは、Astro/Reactのビルドが存在しない場合にエラーを出します
   - 必ず両方のビルドが完了してから実行してください

---

### トラブルシューティング

**問題1**: シンボリックリンクが機能しない
```bash
# 解決策: 絶対パスで再作成
cd /Users/r/src/at-an-arbor/astro-blog/src/content
rm -rf blog
ln -s /Users/r/src/at-an-arbor/content/blog blog
```

**問題2**: Astro buildでContent Collectionsエラー
```bash
# 解決策: スキーマとfrontmatterが一致しているか確認
# content/blog/*.md のfrontmatterに必須フィールド（title, date, type）があるか確認
```

**問題3**: merge-builds.jsで"build not found"エラー
```bash
# 解決策: 個別にビルドを実行
cd astro-blog && npm run build && cd ..
npm run build:react
npm run build:merge
```

**問題4**: React開発サーバーでブログ記事が表示されない
```bash
# 原因: lib/content.tsのWikiLink変換が開発サーバーで動作していない可能性
# 確認: ブラウザのコンソールでエラーがないか確認
# 解決策: npm run devを再起動
```

---

### 完了後のチェックリスト

- [ ] Astroプロジェクトが正常に起動する
- [ ] Content Collectionsが機能する
- [ ] WikiLinkが機能する（`[[slug]]`がリンクに変換される）
- [ ] バックリンクが表示される
- [ ] unlisted記事がホーム画面に非表示になる
- [ ] unlisted記事が直リンクでアクセス可能
- [ ] blog-index.json APIが生成される
- [ ] React SPAが正常に動作する（ホーム、一覧、poem、moment）
- [ ] ビルドフローが正常に動作する（npm run build）
- [ ] RSS feedのURLが`/blog/slug`形式になっている
- [ ] SitemapのURLが`/blog/slug`形式になっている
- [ ] GitHub Actionsが更新されている
- [ ] ドキュメントが更新されている
- [ ] テストファイルが削除されている

---

## 質問・サポート

実装中に不明点があれば、Claudeに質問してください。以下の観点でサポートします：

1. **設計判断**: アーキテクチャやアプローチについての質問
2. **デバッグ支援**: エラーの原因調査と解決策の提案
3. **コードレビュー**: 実装したコードのレビューと改善提案
4. **パフォーマンス**: ビルド時間や実行速度の最適化

**Claudeの役割**:
- アーキテクチャ設計の監督
- 複雑なロジックのレビュー
- セキュリティチェック
- パフォーマンス最適化の提案

**Geminiの役割**:
- 実装（UI、ページ作成、統合）
- テスト実行
- ドキュメント更新
- デバッグ

---

## 参考リンク

- Astro公式ドキュメント: https://docs.astro.build/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Remark plugins: https://github.com/remarkjs/remark
- Maggie Appleton (参考サイト): https://maggieappleton.com/
