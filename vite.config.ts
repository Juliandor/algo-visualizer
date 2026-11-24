import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' → works on GitHub Pages (sub-path) and Vercel alike.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
