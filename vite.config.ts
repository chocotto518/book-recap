import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages（https://chocotto518.github.io/book-recap/）で配信するときはサブパスになる
  base: process.env.GITHUB_PAGES ? '/book-recap/' : '/',
  plugins: [react()],
});
