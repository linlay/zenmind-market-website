export type ApiError = Error & { status?: number };

export async function requestJSON<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isAdminRequest = /\/api\/v1\/admin\//.test(url);
  const isSecurityRequest = /\/api\/v1\/security\//.test(url);
  const tokenKey = isAdminRequest ? 'zenmind-market:admin-token' : isSecurityRequest ? 'zenmind-market:security-token' : '';
  const token = tokenKey && typeof window !== 'undefined' ? window.sessionStorage.getItem(tokenKey) : '';
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { credentials: 'include', ...options, headers });
  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const error: ApiError = new Error(data?.error?.message || data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data as T;
}

export function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason || 'unknown error');
}
