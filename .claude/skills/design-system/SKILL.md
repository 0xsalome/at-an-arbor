# Design System - at an arbor

このスキルは、at-an-arborサイトのデザインシステムを定義し、一貫したUIコンポーネントの使用を保証します。

## タイポグラフィ

### フォントファミリー

**メインフォント（本文・タイトル）:**
- `font-serif`: Shippori Mincho, Noto Serif JP, serif
- 用途: 記事本文、タイトル、詩の本文

**モノスペースフォント:**
- `font-mono`: JetBrains Mono, monospace
- 用途: 日付、メタ情報、コードブロック

**ピクセルフォント:**
- `font-pixel`: Press Start 2P, cursive (英字)
- `font-pixel-jp`: DotGothic16, sans-serif (日本語)
- 用途: 特殊な装飾

### フォント設定

```html
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&family=Noto+Serif+JP:wght@300;400;700&family=Shippori+Mincho:wght@400;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Tailwind設定

```javascript
fontFamily: {
  serif: ['"Shippori Mincho"', '"Noto Serif JP"', 'serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
  pixel: ['"Press Start 2P"', 'cursive'],
  'pixel-jp': ['"DotGothic16"', 'sans-serif'],
}
```

## カラーパレット

### ベースカラー

**背景色:**
- `paper-white`: `#f8f7f4` (ライトモード背景)
- `ink-black`: `#383c3c` (ダークモード背景)

**テキストカラー:**
- `text-main`: `#111111` (ライトモード本文)
- `text-inv`: `#f5f5f5` (ダークモード本文)

**記事本文（詳細）:**
- ライトモード: `text-gray-800` (`#1f2937`)
- ダークモード: `text-gray-200` (`#e5e7eb`)

### Tailwind設定

```javascript
colors: {
  'paper-white': '#f8f7f4',
  'ink-black': '#383c3c',
  'text-main': '#111111',
  'text-inv': '#f5f5f5',
}
```

### 使用例

**Poem（ダークモード固定）:**
```tsx
<div className="bg-ink-black text-text-inv">
  <div className="font-serif text-gray-300">
    詩の本文
  </div>
</div>
```

**Blog/Moment（ライト・ダークモード対応）:**
```tsx
<div className="bg-paper-white dark:bg-ink-black text-text-main dark:text-text-inv">
  <article className="prose prose-stone dark:prose-invert prose-lg font-serif leading-loose text-gray-800 dark:text-gray-200">
    記事本文
  </article>
</div>
```

## リンクスタイル

### 定義

サイト全体で統一された紫色のリンクスタイルを使用します。

#### カラーパレット

**ライトモード:**
- 通常: `#7c3aed` (濃い紫)
- ホバー: `#6d28d9` (より濃い紫)
- ホバー背景: `rgba(124, 58, 237, 0.1)` (薄紫)

**ダークモード:**
- 通常: `#c4b5fd` (明るい紫)
- ホバー: `#e9d5ff` (より明るい紫)
- ホバー背景: `rgba(196, 181, 253, 0.15)` (薄紫)

#### スタイル定義

```css
.prose a,
.prose .wikilink {
  color: #7c3aed !important;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.prose a:hover,
.prose .wikilink:hover {
  color: #6d28d9 !important;
  background-color: rgba(124, 58, 237, 0.1);
  padding: 0 4px;
  border-radius: 3px;
}

.dark .prose a,
.dark .prose .wikilink {
  color: #c4b5fd !important;
}

.dark .prose a:hover,
.dark .prose .wikilink:hover {
  color: #e9d5ff !important;
  background-color: rgba(196, 181, 253, 0.15);
}
```

### 実装場所

#### Astroブログページ

**ファイル:** `astro-blog/src/styles/global.css`

全てのAstroブログページで自動的に読み込まれます。

**インポート:** `astro-blog/src/layouts/BlogPost.astro`
```typescript
import '../styles/global.css';
```

#### React SPAページ

**ファイル:** `src/index.css`

全てのReactページで自動的に読み込まれます。

**インポート:** `index.tsx`
```typescript
import './src/index.css';
```

### 適用対象

- WikiLink (`[[slug]]` 記法で生成されたリンク)
- 本文内の通常リンク
- バックリンクセクションのリンク
- ナビゲーションリンク (HOME, BACK)
- その他サイト内の全てのリンク

### 使用方法

新しいコンポーネントやページを作成する際は、リンクに特別なスタイルを指定する必要はありません。グローバルCSSが自動的に適用されます。

#### 例: Astroコンポーネント

```astro
<a href="/at-an-arbor/blog/example">リンク</a>
```

自動的に紫色のスタイルが適用されます。

#### 例: Reactコンポーネント

```tsx
<a href="/at-an-arbor/poems/example">詩を読む</a>
```

自動的に紫色のスタイルが適用されます。

#### カスタムクラスを使用する場合

Tailwindのクラスを直接指定する場合は、以下のクラスを使用してください：

```tsx
<a
  href="/link"
  className="text-purple-600 dark:text-purple-300
             hover:text-purple-700 dark:hover:text-purple-200
             transition-colors"
>
  リンク
</a>
```

### 注意事項

- **下線なし**: リンクには下線を表示しません（`text-decoration: none`）
- **!important使用**: 他のスタイルに上書きされないよう`!important`を使用しています
- **ホバーアニメーション**: ホバー時に背景色が表示される際、0.2秒のトランジションが適用されます

## まとめ

### 記事本文の標準スタイル

**Astro (BlogPost.astro):**
```tsx
<article class="prose prose-stone dark:prose-invert prose-lg font-serif leading-loose">
  <!-- 本文 -->
</article>
```

**React (ContentDetail.tsx):**
```tsx
<article className="prose prose-stone dark:prose-invert prose-lg font-serif leading-loose text-gray-800 dark:text-gray-200">
  <!-- 本文 -->
</article>
```

### ページレイアウトの標準スタイル

**ライト・ダークモード対応:**
```tsx
<div className="min-h-screen bg-paper-white dark:bg-ink-black text-text-main dark:text-text-inv">
  <!-- コンテンツ -->
</div>
```

**詩ページ（ダークモード固定）:**
```tsx
<div className="h-screen bg-ink-black text-text-inv">
  <!-- コンテンツ -->
</div>
```

### 更新履歴

- 2026-01-19: 初版作成、リンクスタイルを紫色に統一、下線を削除
- 2026-01-19: タイポグラフィとカラーパレット定義を追加
