import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import { remarkWikiLinks } from './src/utils/wikilinks';

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
    remarkPlugins: [remarkWikiLinks],
  },
  build: {
    format: 'directory',
  },
});
