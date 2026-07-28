export type ApiError = Error & { status?: number };

export async function requestJSON<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...options });
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
