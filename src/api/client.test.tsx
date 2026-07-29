import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestJSON } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('same-origin Market API client', () => {
  it('adds the official-site CSRF token to unsafe requests', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ csrfToken: 'csrf-token-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);

    await requestJSON('/market/api/v1/plugins/demo/favorite', { method: 'POST' });

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/auth/csrf', expect.objectContaining({
      credentials: 'include',
      method: 'GET',
    }));
    const request = fetchMock.mock.calls[1][1];
    expect(request.credentials).toBe('include');
    expect(new Headers(request.headers).get('X-CSRF-Token')).toBe('csrf-token-1');
  });
});
