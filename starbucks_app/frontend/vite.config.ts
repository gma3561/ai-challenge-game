import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sw: resolve(__dirname, 'src/sw.ts'),
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'sw' ? '[name].js' : 'assets/js/[name]-[hash].js';
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  // Configure static assets handling
  assetsInclude: ['**/*.webmanifest'],
});