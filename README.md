# At an Arbor

木陰のあずまやで、思考の種を蒔く小さな庭。

## About

「At an Arbor」は、Digital Gardenの思想を取り入れた実験的な個人サイトです。
ブログ、詩、呟きを通じて、思考を有機的に育てていく場所として設計されています。

### Digital Gardenとは

完成品や結論を提示するための場所ではなく、思考・学習・観察・試行錯誤の**プロセスそのもの**を育て、公開していくための空間です。

- 断片的なアイデア
- 途中段階の考察
- 未整理のメモ
- つながりかけている概念

そうしたものを、剪定しすぎず、時間をかけて育てていくことを目的としています。

### 完成を前提にしない

ここに置かれている内容は「未完成」であることを前提としています。
後から考えが変わること、矛盾が生まれること、書き直されることを許容します。

## Structure

```
左カラム          右カラム
─────────────    ──────────
Blog             Poem
Moments          （縦書き）
```

| セクション | 内容 |
|-----------|------|
| **Blog** | 思考の記録、エッセイ |
| **Moments** | 短い呟き、写真 |
| **Poem** | 言葉の結晶 |

---

<details>
<summary>Technical Details</summary>

## Content Management

コンテンツはMarkdownファイルで管理されています。

```
content/
├── blog/
│   └── *.md
├── moments/
│   └── *.md
└── poem/
    └── *.md
```

### Frontmatter形式

```yaml
---
title: "記事タイトル"
date: 2025-01-01
updated: 2025-01-01 12:00
type: "blog"  # blog | moment | poem
---
```

### ワークフロー

1. Obsidianで記事を編集
2. `content/` フォルダにコピー
3. `git push`
4. 自動デプロイ

## Development

```bash
npm install    # 依存関係のインストール
npm run dev    # 開発サーバー起動
npm run build  # ビルド
```

## Tech Stack

React + TypeScript / Vite / Tailwind CSS / Markdown

</details>

## License

Content: All Rights Reserved / Code: MIT
