# Structured AI Handoff Workflow

複数のAI（Claude + Gemini等）を構造化されたタスクファイルで連携させる、ユーザー承認フロー付きワークフロー。

---

## 概要

```
Claude Code          Gemini CLI          Claude Code         User
    │                    │                    │                │
    ▼                    │                    │                │
タスク指示              │                    │                │
ファイル作成 ──────────▶│                    │                │
    │                    ▼                    │                │
    │               実装作業                  │                │
    │                    │                    │                │
    │                    ▼                    │                │
    │               完了報告 ────────────────▶│                │
    │                ファイル作成              ▼                │
    │                    │              レビュー実施            │
    │                    │                    │                │
    │                    │                    ▼                │
    │                    │              レビュー報告 ─────────▶│
    │                    │                    │                ▼
    │                    │                    │           最終確認
    │                    │                    │                │
    │                    │                    │                ▼
    │                    │                    │←──────── Git Push
```

**特徴：**
- 標準化されたタスクファイルフォーマット
- 明確な完了報告とレビュープロセス
- **ユーザーによる最終承認とプッシュ**（自動化なし）
- プロジェクト横断で使える汎用的な仕組み

---

## 必要なスキル

| スキル | 役割 | 使用者 |
|--------|------|--------|
| `task-handoff` | タスク指示ファイルの作成 | Claude (指示側) |
| `review-handback` | 完了報告のレビューとユーザー報告 | Claude (レビュー側) |
| `agent-memory` | タスク・完了報告の保存場所 | 両方 |

---

## セットアップ

### 1. スキルのインストール

```bash
cd your-project

# agent-memory スキルをセットアップ（まだの場合）
mkdir -p .claude/skills/agent-memory/memories
cp ~/src/skills-repo/agent-memory/SKILL.md .claude/skills/agent-memory/
cp ~/src/skills-repo/agent-memory/.gitignore .claude/skills/agent-memory/

# task-handoff スキルをインストール
mkdir -p .claude/skills/task-handoff
cp ~/src/skills-repo/task-handoff/SKILL.md .claude/skills/task-handoff/

# review-handback スキルをインストール
mkdir -p .claude/skills/review-handback
cp ~/src/skills-repo/review-handback/SKILL.md .claude/skills/review-handback/
```

### 2. フォルダ構造の作成

```bash
# タスクと完了報告用のフォルダを作成
mkdir -p .claude/skills/agent-memory/memories/tasks
mkdir -p .claude/skills/agent-memory/memories/completions
```

最終的な構造：
```
your-project/
├── .claude/
│   └── skills/
│       ├── agent-memory/
│       │   ├── SKILL.md
│       │   ├── .gitignore
│       │   └── memories/
│       │       ├── tasks/           ← タスク指示ファイル
│       │       └── completions/     ← 完了報告ファイル
│       ├── task-handoff/
│       │   └── SKILL.md
│       └── review-handback/
│           └── SKILL.md
```

---

## ワークフロー詳細

### Step 1: Claude でタスク指示ファイル作成

```bash
# Claude Code を起動
claude

# Claude内で:
# 「Geminiに実装タスクを作成して」
# または
# 「タスクファイルを作って: ユーザー認証機能の実装」
```

**Claudeがやること：**
1. タスク要件を整理
2. 標準フォーマットでタスクファイルを作成
3. `.claude/skills/agent-memory/memories/tasks/task-name.md` に保存

**出力例：**
```yaml
---
type: task
status: pending
assigned_to: gemini
created: 2025-01-14
priority: high
estimated_scope: medium
tags: [feature, auth]
---

# ユーザー認証機能の実装

## Objective
JWTベースのユーザー認証システムを実装する。

## Requirements
1. ログインエンドポイント（POST /api/auth/login）
2. JWTトークン生成と検証
3. ミドルウェアでの認証チェック

[...詳細な要件...]
```

---

### Step 2: Gemini で実装

```bash
# Gemini CLI を起動
gemini

# Gemini内で:
# 「.claude/skills/agent-memory/memories/tasks/task-name.md を読んで実装して」
```

**Geminiがやること：**
1. タスクファイルを読む
2. 要件に従って実装
3. テストを書く
4. 完了報告ファイルを作成
5. `.claude/skills/agent-memory/memories/completions/completion-name.md` に保存

**完了報告の例：**
```yaml
---
type: completion
task_file: tasks/user-auth-implementation.md
completed_by: gemini
completed_at: 2025-01-14
time_spent: 90min
status: completed
needs_review: true
---

# Task Completion: ユーザー認証機能の実装

## Summary
JWTベースの認証システムを実装しました。ログイン、トークン検証、認証ミドルウェアを含みます。

## Changes Made
- Added `src/auth/jwt.ts` - JWT生成・検証ユーティリティ
- Added `src/auth/middleware.ts` - 認証ミドルウェア
- Added `src/routes/auth.ts` - 認証エンドポイント
- Updated `src/app.ts` - 認証ルートの統合

[...詳細な報告...]
```

---

### Step 3: Claude でレビュー

```bash
# Claude Code に戻る
claude

# Claude内で:
# 「Geminiの完了報告をレビューして」
```

**Claudeがやること：**
1. 完了報告ファイルを読む
2. 変更されたコードを確認（`git diff` 等）
3. 元のタスク要件と照合
4. セキュリティ・品質チェック
5. レビュー結果をユーザーに報告（**自動プッシュはしない**）

**ユーザーへの報告例：**
```markdown
## レビュー完了: ユーザー認証機能の実装

実装をレビューしました。以下が結果です：

### ✅ 完了した要件
- ログインエンドポイント: 実装完了
- JWT生成・検証: 実装完了
- 認証ミドルウェア: 実装完了

### ⚠️ 確認が必要な点
- JWT秘密鍵が環境変数から読み込まれていることを確認してください
- トークンの有効期限が適切か確認してください（現在24時間）

### 📝 変更されたファイル
- `src/auth/jwt.ts` - JWT関連ユーティリティ（新規作成）
- `src/auth/middleware.ts` - 認証ミドルウェア（新規作成）
- `src/routes/auth.ts` - 認証エンドポイント（新規作成）
- `src/app.ts` - ルート統合（変更）

### 🔒 セキュリティチェック
- ✅ パスワードのハッシュ化: bcrypt使用
- ✅ JWT秘密鍵: 環境変数から読み込み
- ✅ 入力バリデーション: 実装済み
- ⚠️ レート制限: 未実装（追加推奨）

### 推奨アクション
**承認の場合:**
以下のコマンドで差分を確認し、問題がなければプッシュしてください：

```bash
git diff
git add .
git commit -m "feat: JWT-based user authentication system

- Add JWT token generation and verification
- Implement authentication middleware
- Create login endpoint

Co-Authored-By: Gemini <noreply@google.com>"
git push
```

**変更が必要な場合:**
具体的な修正点をお知らせください。

ご確認いただけますか？
```

---

### Step 4: ユーザーが最終確認とプッシュ

**ユーザーがやること：**
1. 報告内容を確認
2. 実際のコードを手動で確認（重要な部分）
3. 必要に応じてローカルテスト
4. 承認する場合、Claudeが提案したコマンドを実行
5. Git プッシュ

```bash
# 差分確認
git diff

# ローカルテストがある場合
npm test

# 承認してコミット
git add .
git commit -m "feat: user authentication implementation"

# プッシュ
git push
```

**変更が必要な場合：**
- Claudeに修正を依頼
- または、Geminiに再実装を依頼

---

## Tips

### タスクファイルを詳細に書く

曖昧な指示は実装のずれを生みます：

❌ **悪い例:**
```markdown
## Requirements
- ユーザー認証を追加
```

✅ **良い例:**
```markdown
## Requirements
1. POST /api/auth/login エンドポイント
   - Input: { email: string, password: string }
   - Output: { token: string, user: User }
2. JWT トークン（有効期限24時間）
3. 認証ミドルウェア（Bearerトークン検証）
4. エラーハンドリング（401, 400）
```

### レビュー時の重点確認項目

- **セキュリティ**: 秘密情報、バリデーション、認証
- **要件適合**: すべての受け入れ基準を満たしているか
- **コード品質**: 可読性、保守性、テスト
- **パフォーマンス**: 明らかなボトルネックがないか

### 複雑なタスクは分割する

大きなタスクは複数の小さなタスクに分けると：
- 実装が正確になる
- レビューが容易になる
- 問題の切り分けがしやすい

---

## 既存ワークフローとの比較

### 従来の方法（memories経由）

```
Claude → 設計書をmemoriesに保存 → Gemini実装 → Claude手動レビュー
```

**課題：**
- フォーマットが統一されていない
- 完了報告が標準化されていない
- レビュープロセスが曖昧

### 新しい方法（構造化ハンドオフ）

```
Claude → 標準タスクファイル作成 → Gemini実装 → 標準完了報告 → Claude自動レビュー → ユーザー承認
```

**メリット：**
- ✅ 標準化されたフォーマット
- ✅ 明確なレビュープロセス
- ✅ 複数プロジェクトで再利用可能
- ✅ ユーザーが最終承認（安全）

---

## トラブルシューティング

### Q: Geminiがタスクファイルを読めない

```bash
# ファイルパスを明示的に伝える
cat .claude/skills/agent-memory/memories/tasks/task-name.md
# 内容をGeminiに貼り付ける
```

### Q: 完了報告がない

Geminiに明示的に依頼：
```
「完了報告ファイルを .claude/skills/agent-memory/memories/completions/ に作成してください。
フォーマットはreview-handbackスキルの例に従ってください。」
```

### Q: レビューが厳しすぎる/甘すぎる

レビュー基準をタスクファイルに明示：
```yaml
## Review Focus
- Security: High priority
- Performance: Medium priority
- Code style: Low priority (follow existing patterns)
```

---

## 関連スキル

- [task-handoff SKILL.md](../task-handoff/SKILL.md) - タスク指示の詳細
- [review-handback SKILL.md](../review-handback/SKILL.md) - レビューの詳細
- [agent-memory SKILL.md](../agent-memory/SKILL.md) - メモリシステムの詳細
- [dual-ai-project SKILL.md](../dual-ai-project/SKILL.md) - プロジェクト設定

---

## まとめ

このワークフローは：

1. **標準化**: すべてのプロジェクトで同じフォーマット
2. **明確性**: タスク→実装→レビュー→承認の流れが明確
3. **安全性**: ユーザーが最終承認するまで自動プッシュなし
4. **汎用性**: Claude/Gemini以外の組み合わせでも使える

**次のステップ:**
1. プロジェクトにスキルをインストール
2. 小さなタスクで試す
3. フローに慣れたら大きなタスクに適用
