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
import type { Root, Text, Link, Image, Parent } from 'mdast';

const BASE_PATH = '/at-an-arbor';

export function remarkWikiLinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | null, parent: Parent | null) => {
      if (!parent || index === null) return;

      const text = node.value;
      const imageWikiRegex = /!\[\[(.*?)\]\]/g;
      const wikiLinkRegex = /(?<!!)(\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\])/g;

      // 画像 or 通常WikiLinkが含まれていない場合は何もしない
      if (!imageWikiRegex.test(text) && !wikiLinkRegex.test(text)) return;
      imageWikiRegex.lastIndex = 0;
      wikiLinkRegex.lastIndex = 0;

      const tokenRegex = /!\[\[(.*?)\]\]|(?<!!)(\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\])/g;
      const newNodes: Array<Text | Link | Image> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = tokenRegex.exec(text)) !== null) {
        const fullMatch = match[0];
        const offset = match.index;

        // マッチの前のテキストを追加
        if (offset > lastIndex) {
          newNodes.push({
            type: 'text',
            value: text.slice(lastIndex, offset),
          });
        }

        // ![[image.ext]] を画像ノードに変換
        if (fullMatch.startsWith('![[')) {
          const imageName = (match[1] || '').trim();
          if (imageName) {
            const encodedName = encodeURIComponent(imageName);
            newNodes.push({
              type: 'image',
              url: `${BASE_PATH}/images/blog/${encodedName}`,
              alt: '',
              title: null,
            } as Image);
          }
        } else {
          const slug = match[3].trim();
          const displayText = match[4] ? match[4].trim() : slug;

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
        }

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
 * HTML文字列内のWikiLink記法を変換する関数
 *
 * marked()で変換されたHTML内に残っている [[slug]] 記法を
 * HTMLリンクに変換します。
 *
 * @param html - 変換対象のHTML文字列
 * @returns WikiLinkが変換されたHTML文字列
 */
export function convertWikiLinksInHTML(html: string): string {
  const imageWikiRegex = /!\[\[(.*?)\]\]/g;
  // WikiLink [[slug]] または [[slug|display]] のパターン
  // 画像の ![[image]] は除外するため、前に!がないことを確認
  const wikiLinkRegex = /(?<!!)(\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\])/g;

  const withImages = html.replace(imageWikiRegex, (_match, imageName) => {
    const encodedName = encodeURIComponent((imageName || '').trim());
    return `<img src="${BASE_PATH}/images/blog/${encodedName}" alt="" loading="lazy" decoding="async" />`;
  });

  return withImages.replace(wikiLinkRegex, (match, full, slug, displayText) => {
    const text = displayText ? displayText.trim() : slug.trim();
    const normalizedSlug = slug.trim();
    return `<a href="${BASE_PATH}/blog/${normalizedSlug}" class="wikilink">${text}</a>`;
  });
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
