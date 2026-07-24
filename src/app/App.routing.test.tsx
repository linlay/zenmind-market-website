import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import i18n from '../i18n';
import { App } from './App';

function CurrentPath() {
  return <output aria-label="current path">{useLocation().pathname}</output>;
}

function jsonResponse(data: unknown) {
  return Promise.resolve(new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  }));
}

function stubMarketAPI(user?: { id: string; role: string }) {
  vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/catalog')) {
      return jsonResponse({
        items: [{
          id: 'demo-plugin',
          type: 'plugin',
          name: { 'zh-CN': '演示插件', 'en-US': 'Demo plugin' },
          description: { 'zh-CN': '用于路由测试', 'en-US': 'Used for routing tests' },
        }],
      });
    }
    if (url.endsWith('/auth/me')) return jsonResponse(user ? { user } : {});
    if (url.endsWith('/view')) return jsonResponse({});
    return jsonResponse({});
  }));
}

afterEach(() => vi.unstubAllGlobals());
beforeEach(async () => {
  await i18n.changeLanguage('en-US');
});

describe('market routing', () => {
  it('switches the visible interface language through i18next', async () => {
    stubMarketAPI();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Language' }));

    expect(await screen.findByPlaceholderText('搜索扩展、插件、沙箱、工具...')).toBeInTheDocument();
    expect(localStorage.getItem('zenmind-market:locale')).toBe('zh-CN');
  });

  it('updates the URL when a visitor chooses a market category', async () => {
    stubMarketAPI();
    render(
      <MemoryRouter initialEntries={['/']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    await screen.findByText('Demo plugin');
    fireEvent.click(screen.getByRole('button', { name: /Plugins/ }));

    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/category/plugin');
    });
    expect(screen.getByRole('heading', { name: 'Plugins' })).toBeInTheDocument();
  });

  it('stores a skill subcategory selection in the URL', async () => {
    stubMarketAPI();
    render(
      <MemoryRouter initialEntries={['/']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    await screen.findByText('Demo plugin');
    fireEvent.click(screen.getByRole('button', { name: /Skills/ }));
    fireEvent.click(screen.getByRole('button', { name: /Coding/ }));

    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/skills/coding');
    });
  });

  it('opens component details in a modal without changing the current URL', async () => {
    stubMarketAPI();
    render(
      <MemoryRouter initialEntries={['/category/plugin']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    await screen.findByText('Demo plugin');
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Demo plugin' })).toBeInTheDocument();
    });
    expect(screen.getByLabelText('current path')).toHaveTextContent('/category/plugin');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/category/plugin');
      expect(screen.queryByRole('dialog', { name: 'Demo plugin' })).not.toBeInTheDocument();
    });
  });

  it('treats a legacy component detail URL as an unknown interface URL', async () => {
    stubMarketAPI();
    render(
      <MemoryRouter initialEntries={['/item/plugin/missing-plugin']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    await screen.findByText('Demo plugin');
    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/');
    });
  });

  it('restores version publishing mode from a component URL', async () => {
    stubMarketAPI({ id: 'creator-1', role: 'creator' });
    render(
      <MemoryRouter initialEntries={['/publish/plugin/demo-plugin']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Publish New Version' })).toBeInTheDocument();
    expect(screen.getByLabelText('current path')).toHaveTextContent('/publish/plugin/demo-plugin');
  });

  it('returns an unknown version publishing URL to the creator workspace', async () => {
    stubMarketAPI({ id: 'creator-1', role: 'creator' });
    render(
      <MemoryRouter initialEntries={['/publish/plugin/missing-plugin']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/creator');
    });
  });

  it('returns from publishing to the workspace that opened it', async () => {
    stubMarketAPI({ id: 'creator-1', role: 'creator' });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/publish', state: { background: '/creator' } }]}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Back to Market' }));
    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/creator');
    });
  });

  it('navigates an authenticated creator through a visible workspace route', async () => {
    stubMarketAPI({ id: 'creator-1', role: 'creator' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Creator Center' }));
    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/creator');
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Back to Market' })[0]);
    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/');
    });
  });

  it('redirects an anonymous visitor away from a protected workspace route', async () => {
    stubMarketAPI();
    render(
      <MemoryRouter initialEntries={['/creator']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/');
    });
  });

  it('exposes the admin workspace through its own URL only to administrators', async () => {
    stubMarketAPI({ id: 'admin-1', role: 'admin' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Review Admin' }));
    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/admin');
    });
    expect(screen.getByRole('heading', { name: 'Management Center' })).toBeInTheDocument();
  });
});
