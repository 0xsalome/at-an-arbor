# Multi-AI Collaboration Workflow

複数のAI（Claude + Gemini等）を連携させて開発するワークフロー。

---

## 概要

```
Claude Code          Gemini CLI           Claude Code
    │                    │                    │
    ▼                    │                    │
設計・仕様作成 ─────────▶│                    │
    │                    ▼                    │
    │               実装作業 ────────────────▶│
    │                    │                    ▼
    │                    │               レビュー
```

**役割分担：**
- **Claude**: 設計、仕様書作成、レビュー（思考・判断が得意）
- **Gemini**: 実装（コード生成が得意、コスト面で有利な場合も）

---

## ワークフロー

### Step 1: Claude で設計・仕様書作成

```bash
cd your-project

# Claude Codeを起動して設計を依頼
claude

# Claude内で:
# 「この機能の設計書を作ってmemoriesに保存して」
# または
# 「仕様書を memories/specs/ に保存して」
```

**出力例：** `.claude/skills/agent-memory/memories/specs/feature-x.md`

```markdown
---
summary: "Feature X の設計仕様 - ユーザー認証フローの実装方針"
created: 2025-01-09
status: in-progress
tags: [auth, feature-x]
---

# Feature X 設計仕様

## 目的
...

## 実装方針
...

## ファイル構成
...
```

---

### Step 2: Gemini で実装

```bash
# Gemini CLIを起動（またはAI Studio等）
gemini

# Gemini内で:
# 「.claude/skills/agent-memory/memories/specs/feature-x.md を読んで実装して」
```

**ポイント：**
- memoriesのパスを明示的に伝える
- 設計書の内容をコピペしてもOK
- 必要に応じて追加の指示を与える

---

### Step 3: Claude でレビュー

```bash
# Claude Codeに戻る
claude

# Claude内で:
# 「Geminiが実装したコードをレビューして」
# 「レビュー結果を memories/reviews/ に保存して」
```

**出力例：** `.claude/skills/agent-memory/memories/reviews/feature-x-review.md`

```markdown
---
summary: "Feature X 実装レビュー - 修正3点、改善提案2点"
created: 2025-01-09
status: in-progress
related: [memories/specs/feature-x.md]
---

# Feature X レビュー

## 修正必須
1. ...

## 改善提案
1. ...
```

---

### Step 4: 修正サイクル（必要に応じて）

```
レビュー結果 → Geminiで修正 → Claudeで再レビュー → 完了
```

---

## Tips

### memoriesの活用

| フォルダ | 用途 |
|---------|------|
| `memories/specs/` | 設計書・仕様書 |
| `memories/reviews/` | レビュー結果 |
| `memories/context/` | プロジェクト背景・決定事項 |
| `memories/handoff/` | AI間の引き継ぎメモ |

### 引き継ぎを明確にする

Geminiに渡す時は、以下を明示すると精度が上がる：

```
以下の設計書に従って実装してください：

[設計書の内容をここにコピー]

制約：
- TypeScriptで実装
- 既存の src/utils/ を活用
- テストも書く
```

### コンテキストが大きい場合

repomixでプロジェクトをまとめて渡す：

```bash
# プロジェクト全体を1ファイルにまとめる
npx repomix

# 出力されたファイルをGeminiに渡す
```

---

## なぜこの分担か

| AI | 得意 | 苦手 |
|----|------|------|
| Claude | 設計、レビュー、複雑な判断 | - |
| Gemini | 大量コード生成、高速 | 細かいニュアンス |

**コスト面でもメリット：**
- 設計・レビュー（重要）→ Claude（精度重視）
- 実装（量が多い）→ Gemini（コスト効率）

---

## 参考

- [agent-memory SKILL.md](../agent-memory/SKILL.md) - メモリの詳細な使い方
- [README.md](../README.md) - skills-repo全体の説明
