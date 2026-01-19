# Design System - at an arbor

このスキルは、at-an-arborサイトのデザインシステムを定義し、一貫したUIコンポーネントの使用を保証します。

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

### 更新履歴

- 2026-01-19: 初版作成、リンクスタイルを紫色に統一、下線を削除
