/**
 * WikiLink Remark Plugin for Astro
 *
 * このプラグインは、Markdown内の [[slug]] 記法を
 * HTMLリンク <a href="/at-an-arbor/blog/slug"> に変換します。
 *
 * サポートする記法:
 * - [[slug]] → [slug](/at-an-arbor/blog/slug)
 * - [[slug|表示テキスト]] → [表示テキスト](/at-an-arbor/blog/slug)
 *
 * 画像の ![[image.png]] とは区別します（!がある場合は処理しない）
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, Link, Parent } from 'mdast';

const BASE_PATH = '/at-an-arbor';

export function remarkWikiLinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | null, parent: Parent | null) => {
      if (!parent || index === null) return;

      const text = node.value;

      // WikiLink [[slug]] または [[slug|display]] のパターン
      // 画像の ![[image]] は除外するため、前に!がないことを確認
      const wikiLinkRegex = /(?<!!)(\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\])/g;

      // WikiLinkが含まれているかチェック
      if (!wikiLinkRegex.test(text)) return;

      // 正規表現をリセット
      wikiLinkRegex.lastIndex = 0;

      const newNodes: Array<Text | Link> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = wikiLinkRegex.exec(text)) !== null) {
        const fullMatch = match[0];  // [[slug]] または [[slug|display]]
        const slug = match[2].trim();
        const displayText = match[3] ? match[3].trim() : slug;
        const offset = match.index;

        // マッチの前のテキストを追加
        if (offset > lastIndex) {
          newNodes.push({
            type: 'text',
            value: text.slice(lastIndex, offset),
          });
        }

        // WikiLinkをリンクノードに変換
        newNodes.push({
          type: 'link',
          url: `${BASE_PATH}/blog/${slug}`,
          title: null,
          children: [
            {
              type: 'text',
              value: displayText,
            },
          ],
          data: {
            hProperties: {
              className: ['wikilink'],
            },
          },
        } as Link);

        lastIndex = offset + fullMatch.length;
      }

      // 残りのテキストを追加
      if (lastIndex < text.length) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex),
        });
      }

      // 元のテキストノードを新しいノードで置き換え
      parent.children.splice(index, 1, ...newNodes);
    });
  };
}

/**
 * 使用方法（astro.config.mjs）:
 *
 * import { remarkWikiLinks } from './astro-wikilinks';
 *
 * export default defineConfig({
 *   markdown: {
 *     remarkPlugins: [remarkWikiLinks],
 *   },
 * });
 */
