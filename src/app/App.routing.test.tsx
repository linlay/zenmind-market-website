import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    expect(screen.getByRole('link', { name: '功能市场' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全部功能/ })).toBeInTheDocument();
    expect(document.title).toBe('功能市场');
    expect(window.localStorage.getItem('zenmind-market:locale')).toBe('zh-CN');
  });

  it('hides disabled categories from the market navigation', async () => {
    stubMarketAPI();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByText('Demo plugin');
    expect(screen.queryByRole('button', { name: /Plugins/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sandboxes/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Desktop Pets/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /WebApps/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agents/ })).toBeInTheDocument();
  });

  it('hides disabled component types from new publications', async () => {
    stubMarketAPI({ id: 'creator-1', role: 'creator' });
    render(
      <MemoryRouter initialEntries={['/publish']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Choose what to publish' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Plugins/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sandboxes/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Desktop Pets/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /WebApps/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agents/ })).toBeInTheDocument();
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

  it('returns from publishing to the market through the single header action', async () => {
    stubMarketAPI({ id: 'creator-1', role: 'creator' });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/publish', state: { background: '/creator' } }]}>
        <CurrentPath />
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Back to Market' }));
    await waitFor(() => {
      expect(screen.getByLabelText('current path')).toHaveTextContent('/');
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

    expect(screen.getAllByRole('button', { name: 'Back to Market' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Back to Market' }));
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

  it('places sign out inside the rightmost user avatar menu', async () => {
    stubMarketAPI({ id: 'admin-1', role: 'admin' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    const avatar = await screen.findByRole('button', { name: 'admin-1, Admin' });
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).not.toBeInTheDocument();

    fireEvent.click(avatar);

    expect(screen.getByRole('menu', { name: 'admin-1' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('updates a favorite without reordering the current catalog view', async () => {
    const alpha = {
      id: 'alpha-agent',
      type: 'agent',
      name: 'Alpha Agent',
      description: 'Alpha',
      downloadCount: 0,
      favoriteCount: 0,
      favorited: false,
    };
    const beta = {
      id: 'beta-agent',
      type: 'agent',
      name: 'Beta Agent',
      description: 'Beta',
      downloadCount: 0,
      favoriteCount: 1,
      favorited: false,
    };
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/catalog')) return jsonResponse({ items: [alpha, beta] });
      if (url.endsWith('/auth/me')) return jsonResponse({ user: { id: 'user-1', role: 'creator' } });
      if (url.endsWith('/agents/alpha-agent/favorite')) {
        return jsonResponse({ ...alpha, favoriteCount: 2, favorited: true });
      }
      return jsonResponse({});
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: 'Alpha Agent' });
    const cardNames = () => screen.getAllByRole('article').map(
      (article) => within(article).getByRole('heading', { level: 2 }).textContent,
    );
    expect(cardNames()).toEqual(['Beta Agent', 'Alpha Agent']);

    fireEvent.click(screen.getByRole('button', { name: 'Favorite: 0' }));

    await screen.findByRole('button', { name: 'Unfavorite: 2' });
    expect(cardNames()).toEqual(['Beta Agent', 'Alpha Agent']);
  });
});
