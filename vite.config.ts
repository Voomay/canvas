import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3001,
    open: false,
    host: true
  },
  preview: {
    port: 3001,
    host: true
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0
  }
});
