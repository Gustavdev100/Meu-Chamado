import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'client',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@': path.resolve(__dirname, './client'),
    },
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  }
});
