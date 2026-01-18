#!/bin/bash
# at-an-arbor プロジェクトコンテキスト生成スクリプト
#
# 使い方: ./scripts/generate-project-context.sh
# 出力: project-context-YYYYMMDD.md

OUTPUT_FILE="project-context-$(date +%Y%m%d).md"

echo "# at-an-arbor Project Context" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Generated: $(date +%Y-%m-%d)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "このファイルは、at-an-arborプロジェクトの主要なファイルをまとめたものです。" >> "$OUTPUT_FILE"
echo "Chat AI、Notebook LMなどに渡すことで、プロジェクトの全体像を理解させることができます。" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## CLAUDE.md" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
cat CLAUDE.md >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## GEMINI.md" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
cat GEMINI.md >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## package.json" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```json' >> "$OUTPUT_FILE"
cat package.json >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## types.ts" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```typescript' >> "$OUTPUT_FILE"
cat types.ts >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## lib/content.ts" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```typescript' >> "$OUTPUT_FILE"
cat lib/content.ts >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## App.tsx" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```typescript' >> "$OUTPUT_FILE"
cat App.tsx >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## pages/ContentDetail.tsx" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```typescript' >> "$OUTPUT_FILE"
cat pages/ContentDetail.tsx >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "✅ Generated: $OUTPUT_FILE"
echo "📊 File size: $(wc -l < "$OUTPUT_FILE") lines"
