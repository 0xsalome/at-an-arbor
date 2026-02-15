import { defineCollection, z } from 'astro:content';

// Helper: ローカル時間でYYYY-MM-DD形式に変換（タイムゾーン問題を回避）
const toLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Allow date or string, convert to YYYY-MM-DD string (local time)
    date: z.coerce.date().transform(d => toLocalDateString(d)),
    updated: z.coerce.date().optional().transform(d => d ? toLocalDateString(d) : undefined),
    type: z.literal('blog'),
    unlisted: z.boolean().optional().default(false),
    noindex: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default(['blog']),
    latestLog: z.string().optional(),
    versions: z.array(z.object({
      date: z.string(),
      summary: z.string().optional(),
      content: z.string(),
    })).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};