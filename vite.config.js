import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
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
