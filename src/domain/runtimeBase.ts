declare global {
  interface Window {
    __MARKET_BASE_PATH__?: string;
  }
}

export function normalizeBasePath(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === '/' || trimmed === './') return '';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`;
}

function configuredBasePath() {
  const runtimeBase = typeof window === 'undefined' ? '' : window.__MARKET_BASE_PATH__;
  if (runtimeBase) return runtimeBase;

  const buildBase = import.meta.env.BASE_URL;
  return buildBase?.startsWith('/') ? buildBase : '';
}

export const marketBasePath = normalizeBasePath(configuredBasePath());
export const marketHomePath = `${marketBasePath}/`;
