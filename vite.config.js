import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function envPort(value, fallback) {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const marketBrand = env.VITE_MARKET_BRAND?.trim() || env.BRAND?.trim() || 'zenmind';
  const apiProxyTarget = env.MARKET_API_PROXY_TARGET?.trim() || 'http://127.0.0.1:8088';
  const proxyToken = env.MARKET_DEV_PROXY_TOKEN?.trim();
  const proxyUserID = env.MARKET_DEV_USER_ID?.trim();
  const proxyHeaders = proxyToken && proxyUserID
    ? {
        'X-ZenMind-Market-Proxy-Token': proxyToken,
        'X-ZenMind-User-ID': proxyUserID,
        'X-ZenMind-User-Role': env.MARKET_DEV_USER_ROLE?.trim() || 'creator',
      }
    : undefined;

  return {
    base: env.VITE_BASE_PATH?.trim() || '/market/',
    define: {
      'import.meta.env.VITE_MARKET_BRAND': JSON.stringify(marketBrand),
    },
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    server: {
      host: env.VITE_DEV_HOST?.trim() || '127.0.0.1',
      port: envPort(env.VITE_DEV_PORT, 5173),
      strictPort: env.VITE_DEV_STRICT_PORT?.trim().toLowerCase() !== 'false',
      proxy: {
        '/market/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          headers: proxyHeaders,
          rewrite: (path) => path.replace(/^\/market\/api/, '/api'),
        },
        '/market/npm': {
          target: env.MARKET_NPM_PROXY_TARGET?.trim() || apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/market\/npm/, '/npm'),
        },
        '/market/artifacts': {
          target: env.MARKET_ARTIFACT_PROXY_TARGET?.trim() || apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/market\/artifacts/, '/artifacts'),
        },
      },
    },
  };
});
