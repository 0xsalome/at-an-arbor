# 記事のnoindex設定機能

## 使い方
記事のfrontmatterに `noindex: true` を追加すると、検索エンジンにインデックスされなくなる。

```yaml
---
title: 記事タイトル
noindex: true
---
```

## 適用済み記事
- アルゴリズムのはずれに（2026-02-15）

## 技術詳細
- `astro-blog/src/content/config.ts` にスキーマ追加
- `BlogPost.astro` で `<meta name="robots" content="noindex, nofollow">` を出力
- `[slug].astro` でpropsとして渡す
