export type ApiError = Error & { status?: number };

let csrfToken = '';
let csrfRequest: Promise<string> | null = null;

function isUnsafeMethod(method = 'GET') {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

async function readCSRFToken() {
  if (csrfToken) return csrfToken;
  if (csrfRequest) return csrfRequest;
  csrfRequest = fetch('/api/auth/csrf', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  }).then(async (response) => {
    if (!response.ok) return '';
    const body = await response.json().catch(() => ({}));
    csrfToken = typeof body?.csrfToken === 'string' ? body.csrfToken.trim() : '';
    return csrfToken;
  }).finally(() => {
    csrfRequest = null;
  });
  return csrfRequest;
}

export async function requestJSON<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (isUnsafeMethod(options.method)) {
    const token = await readCSRFToken();
    if (token) headers.set('X-CSRF-Token', token);
  }
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
