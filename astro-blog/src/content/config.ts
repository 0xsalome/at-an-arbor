import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Allow date or string, convert to YYYY-MM-DD string
    date: z.coerce.date().transform(d => d.toISOString().slice(0, 10)),
    updated: z.coerce.date().optional().transform(d => d ? d.toISOString().slice(0, 10) : undefined),
    type: z.literal('blog'),
    unlisted: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};