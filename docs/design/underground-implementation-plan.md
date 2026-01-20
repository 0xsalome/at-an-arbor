# Underground ページ実装計画書 (Deep Dive Concept)

## 1. 概要 (Overview)

本プロジェクト「at-an-arbor」における隠しページ的な位置づけである `/underground` を刷新し、GitHubのコントリビューション活動（草）を「地層」に見立てた没入型ビジュアライゼーションとして実装する。

ユーザーはスクロールすることで「現在（地表）」から「過去（地下深部）」へと潜行し、日々の活動の積み重ねを地質学的なメタファーを通じて体験する。

## 2. コンセプト: "Deep Dive" (地層への潜行)

*   **メタファー**:
    *   **時間**: 垂直方向の深度（上＝現在、下＝過去）。
    *   **活動量 (Contribution)**: 地層に含まれる鉱物の密度や種類。
    *   **視覚表現**: ターミナル/CLI美学に基づいたモノクロ・アスキーアート。
*   **体験**:
    *   暗闇の中をライトで照らしながら降りていくような探索感。
    *   Neo-Brutalism的な「粗さ」と、React/Framer Motionによる「滑らかさ」の融合。

## 3. 技術スタック (Tech Stack)

*   **Frontend Framework**: React 19 (Vite)
*   **Styling**: Tailwind CSS (Utility-first CSS)
*   **Animation**: `framer-motion`
    *   スクロール連動アニメーション (Scroll-triggered animations)
    *   パララックス効果 (Parallax effects)
*   **Data Source**: GitHub Contributions API (Proxy)
    *   Endpoint: `https://github-contributions-api.jogruber.de/v4/{username}`

## 4. データ構造と変換ロジック

取得したGitHubのコントリビューションデータを、視覚的な「地層」データへ変換する。

### 4.1 データマッピング

| Activity Level | Metaphor | ASCII Texture | Description |
| :--- | :--- | :--- | :--- |
| 0 (None) | 空隙/土 | ` ` (空白), `.` | 活動なし、あるいは微細な塵 |
| 1 (Low) | 砂/土壌 | `.` , `..` | 日常的な軽微な活動 |
| 2 (Medium) | 礫 (Gravel) | `+`, `+.` | 安定した活動 |
| 3 (High) | 岩 (Rock) | `*`, `#` | 活発な開発日 |
| 4 (Peak) | 鉱石 (Ore) | `@`, `%`, `&` | 集中的なスプリント、リリース |

### 4.2 レイヤー生成ロジック (`lib/github-landscape.ts`)

*   配列を反転させ、最新の日付をインデックス0（最上部）とする。
*   各日を1つの `Layer` オブジェクトに変換。
*   日付文字列をシードとした擬似ランダム処理により、同じレベルでもテクスチャのパターンに揺らぎを持たせる（有機的な表現）。
*   深度（インデックス）に応じて、テキストカラーを徐々に暗い色へシフトさせる。

## 5. UI/UX デザイン仕様

### 5.1 コンポーネント構成 (`pages/Underground.tsx`)

*   **Container**: 画面全体の背景色（黒）、スクロールコンテナ。
*   **Background Elements**:
    *   `FloatingParticles`: 画面奥で浮遊する微細な粒子（塵）。
    *   `ParallaxBackground`: スクロール深度に応じて不透明度が変化するオーバーレイ。
*   **Strata (地層レイヤー)**:
    *   各日付に対応する行。
    *   `WhileInView`: 画面内に入った瞬間、ふわっと浮き上がる（opacity 0 -> 1）。
    *   **Interaction**:
        *   通常時: 抽象的なアスキーアートの帯。
        *   Hover時: 詳細情報（日付、コミット数）を表示。ハイライト処理。

### 5.2 アニメーション設定

*   **Entry**:
    *   各レイヤーは画面下部からフェードイン。
    *   遅延（stagger）をかけず、スクロールに合わせて逐次表示させることで「照らしている」感覚を演出。
*   **Ambience**:
    *   パーティクルはゆっくりとY軸方向に漂う（無限ループ）。

## 6. 今後の拡張アイデア (Phase 2+)

*   **考古学的発見**: 特定の記念日（リポジトリ作成日など）に特別なアイコン（化石）を埋め込む。
*   **サウンドスケープ**: スクロール速度に応じた重低音や、土を掘るようなSE。
*   **フィルタリング**: 言語ごと、リポジトリごとの地層の色の変化。

---
*Created by Gemini for at-an-arbor project*
*Date: 2026-01-20*
