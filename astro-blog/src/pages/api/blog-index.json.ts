import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  // unlisted記事を除外
  const blogEntries = await getCollection('blog', ({ data }) => {
    return !data.unlisted;
  });

  const blogIndex = blogEntries.map((entry) => {
    // 最初の段落を抽出（画像参照を除外）
    const firstParagraph = entry.body.trim().split('\n\n')[0] || '';
    const excerptWithoutImages = firstParagraph.replace(/!\\\[.*?\]/g, '').trim();
    const excerpt = excerptWithoutImages.slice(0, 100) +
                   (excerptWithoutImages.length > 100 ? '...' : '');

    return {
      slug: entry.slug,
      title: entry.data.title,
      date: entry.data.date,
      updated: entry.data.updated || entry.data.date,
      type: 'blog',
      excerpt,
    };
  });

  // 更新日順にソート（新しい順）
  blogIndex.sort((a, b) =>
    new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );

  return new Response(JSON.stringify(blogIndex, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
