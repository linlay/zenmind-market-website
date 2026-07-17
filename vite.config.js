import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const marketBrand = process.env.BRAND?.trim() || 'zenmind';

export default defineConfig({
  // Relative base so the same build works at any sub-path.
  // e.g. deployed at /market/ → assets resolve to /market/assets/...
  base: './',
  define: {
    'import.meta.env.VITE_MARKET_BRAND': JSON.stringify(marketBrand),
  },
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/npm': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/artifacts': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
    },
  },
});
