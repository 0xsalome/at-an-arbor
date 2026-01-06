import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteRestart from 'vite-plugin-restart';

export default defineConfig({
  base: '/at-an-arbor/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    ViteRestart({
      restart: ['content/**/*.md'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  assetsInclude: ['**/*.md'],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
