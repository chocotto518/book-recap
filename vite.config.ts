import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages（https://chocotto518.github.io/my-bookshelf-maker/）で配信するときはサブパスになる（リポジトリ名と同じ）
  base: process.env.GITHUB_PAGES ? '/my-bookshelf-maker/' : '/',
  plugins: [react()],
});
