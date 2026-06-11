import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/market/',
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/market/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/market\/api/u, '/api'),
      },
      '/market/npm': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/market\/npm/u, '/npm'),
      },
      '/market/artifacts': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/market\/artifacts/u, '/artifacts'),
      },
    },
  },
});
