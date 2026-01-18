/**
 * Backlinks Calculation Logic for Astro
 *
 * このモジュールは、Astro Content Collectionsから全記事を読み取り、
 * WikiLinkとMarkdownリンクを解析してバックリンクマップを生成します。
 *
 * バックリンクマップの構造:
 * {
 *   "target-slug": [
 *     { slug: "source-slug-1", title: "記事タイトル1", updated: "2026-01-18" },
 *     { slug: "source-slug-2", title: "記事タイトル2", updated: "2026-01-17" }
 *   ]
 * }
 */

import type { CollectionEntry } from 'astro:content';

export interface Backlink {
  slug: string;
  title: string;
  updated: string;
}

export type BacklinksMap = Map<string, Backlink[]>;

/**
 * WikiLinkとMarkdownリンクからターゲットslugを抽出する
 *
 * 検出するパターン:
 * 1. [[slug]] → slug
 * 2. [[slug|表示テキスト]] → slug
 * 3. [text](/blog/slug) → slug
 * 4. [text](/at-an-arbor/blog/slug) → slug
 *
 * @param content - Markdownコンテンツ
 * @returns 抽出されたslugの配列（重複なし）
 */
function extractLinkedSlugs(content: string): string[] {
  const linkedSlugs = new Set<string>();

  // 1. WikiLink [[slug]] または [[slug|display]] を検出
  // 画像の ![[image]] は除外
  const wikiLinkRegex = /(?<!!)(\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\])/g;
  let match: RegExpExecArray | null;

  while ((match = wikiLinkRegex.exec(content)) !== null) {
    const slug = match[2].trim();
    linkedSlugs.add(slug);
  }

  // 2. Markdown link [text](/blog/slug) または [text](/at-an-arbor/blog/slug) を検出
  const mdLinkRegex = /\[([^\]]+)\]\((?:\/at-an-arbor)?\/blog\/([^)#]+?)(?:[#)])/g;
  const mdLinkRegex2 = /\[([^\]]+)\]\((?:\/at-an-arbor)?\/blog\/([^)]+)\)/g;

  while ((match = mdLinkRegex.exec(content)) !== null) {
    const slug = match[2].trim();
    linkedSlugs.add(slug);
  }

  mdLinkRegex2.lastIndex = 0;
  while ((match = mdLinkRegex2.exec(content)) !== null) {
    const slug = match[2].trim();
    linkedSlugs.add(slug);
  }

  return Array.from(linkedSlugs);
}

/**
 * 全記事を解析してバックリンクマップを構築する
 *
 * @param allPosts - Astro Content Collectionsから取得した全記事
 * @returns バックリンクマップ（slug -> リンク元記事の配列）
 */
export async function buildBacklinksMap(
  allPosts: CollectionEntry<'blog'>[]
): Promise<BacklinksMap> {
  const backlinksMap = new Map<string, Backlink[]>();

  // 各記事を解析
  for (const post of allPosts) {
    const sourceSlug = post.slug;
    const sourceTitle = post.data.title;
    const sourceUpdated = post.data.updated || post.data.date;

    // Markdown本文からリンク先slugを抽出
    const linkedSlugs = extractLinkedSlugs(post.body);

    // 各リンク先に対してバックリンクを追加
    for (const targetSlug of linkedSlugs) {
      if (!backlinksMap.has(targetSlug)) {
        backlinksMap.set(targetSlug, []);
      }

      const backlinks = backlinksMap.get(targetSlug)!;

      // 重複チェック（同じ記事から複数回リンクされても1つだけ表示）
      const alreadyExists = backlinks.some(bl => bl.slug === sourceSlug);
      if (!alreadyExists) {
        backlinks.push({
          slug: sourceSlug,
          title: sourceTitle,
          updated: sourceUpdated,
        });
      }
    }
  }

  // バックリンクを更新日順にソート（新しい順）
  for (const [, backlinks] of backlinksMap) {
    backlinks.sort((a, b) => {
      const dateA = new Date(a.updated).getTime();
      const dateB = new Date(b.updated).getTime();
      return dateB - dateA;
    });
  }

  return backlinksMap;
}

/**
 * 特定の記事のバックリンクを取得する
 *
 * @param slug - 記事のslug
 * @param backlinksMap - バックリンクマップ
 * @returns バックリンクの配列（なければ空配列）
 */
export function getBacklinksForSlug(
  slug: string,
  backlinksMap: BacklinksMap
): Backlink[] {
  return backlinksMap.get(slug) || [];
}

/**
 * 使用方法（Astro pages/blog/[slug].astro）:
 *
 * import { getCollection } from 'astro:content';
 * import { buildBacklinksMap, getBacklinksForSlug } from '../../utils/backlinks';
 *
 * export async function getStaticPaths() {
 *   const allPosts = await getCollection('blog');
 *   const backlinksMap = await buildBacklinksMap(allPosts);
 *
 *   return allPosts.map(post => ({
 *     params: { slug: post.slug },
 *     props: {
 *       post,
 *       backlinks: getBacklinksForSlug(post.slug, backlinksMap),
 *     },
 *   }));
 * }
 */
