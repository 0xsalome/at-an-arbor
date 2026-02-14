import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import remarkBreaks from 'remark-breaks';
import rehypeExternalLinks from 'rehype-external-links';
import { remarkWikiLinks } from './src/utils/wikilinks';
import { remarkPreserveBlankLines } from './src/utils/remark-preserve-blank-lines';

export default defineConfig({
  base: '/at-an-arbor/',
  outDir: 'dist',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true, // Tailwindベーススタイルを適用
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkPreserveBlankLines, remarkBreaks, remarkWikiLinks],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
    ],
    gfm: true, // GitHub Flavored Markdown を有効化
  },
  build: {
    format: 'directory',
  },
});
