import { useEffect, useMemo, useState } from 'react';

const apiBase = import.meta.env.VITE_MARKET_API_BASE || '/market/api/v1';
const tabs = [
  { id: 'skill', label: 'Skills', title: 'Skill Market', empty: 'No skills match this view.' },
  { id: 'plugin', label: 'Plugins', title: 'Plugin Market', empty: 'No plugins match this view.' },
  { id: 'sandbox-image', label: 'Sandboxes', title: 'Sandbox Market', empty: 'No sandbox templates match this view.' },
];
const themeModes = ['auto', 'light', 'dark'];

function resolveTheme(mode) {
  if (mode === 'light' || mode === 'dark') return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode) {
  const nextMode = themeModes.includes(mode) ? mode : 'auto';
  const theme = resolveTheme(nextMode);
  document.documentElement.dataset.themeMode = nextMode;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function App() {
  const [catalog, setCatalog] = useState({ items: [] });
  const [activeTab, setActiveTab] = useState('skill');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [platform, setPlatform] = useState('all');
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('zenmind:theme') || 'auto');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('zenmind:theme', theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => theme === 'auto' && applyTheme('auto');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(`${apiBase}/catalog`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setCatalog(data);
          setStatus('ready');
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : String(reason));
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentTab = tabs.find((item) => item.id === activeTab) || tabs[0];
  const allTags = useMemo(() => {
    const values = new Set();
    for (const item of catalog.items) {
      if (item.type === activeTab) {
        item.tags?.forEach((entry) => values.add(entry));
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [catalog.items, activeTab]);
  const platforms = useMemo(() => {
    const values = new Set(['all']);
    for (const item of catalog.items) {
      if (item.type === activeTab) {
        Object.keys(item.assets || {}).forEach((entry) => values.add(entry));
      }
    }
    return [...values];
  }, [catalog.items, activeTab]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog.items.filter((item) => {
      if (item.type !== activeTab) return false;
      if (tag && !item.tags?.includes(tag)) return false;
      if (platform !== 'all' && !item.assets?.[platform]) return false;
      if (!needle) return true;
      return [item.id, item.name, item.description, ...(item.tags || [])].join(' ').toLowerCase().includes(needle);
    });
  }, [activeTab, catalog.items, platform, query, tag]);

  function switchTab(tabId) {
    setActiveTab(tabId);
    setSelected(null);
    setTag('');
    setPlatform('all');
    setQuery('');
  }

  return (
    <main className="market-app">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-mark">Z</span><span>ZenMind Market</span></a>
        <div className="theme-segment" role="group" aria-label="Theme">
          {themeModes.map((mode) => (
            <button key={mode} type="button" className={theme === mode ? 'is-active' : ''} onClick={() => setTheme(mode)} aria-label={mode} title={mode}>
              {mode === 'auto' ? 'A' : mode === 'light' ? 'L' : 'D'}
            </button>
          ))}
        </div>
      </header>

      <section className="market-workspace">
        <aside className="sidebar">
          <div className="tab-list" role="tablist" aria-label="Market sections">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" className={activeTab === tab.id ? 'tab is-active' : 'tab'} onClick={() => switchTab(tab.id)}>
                <span className={`tab-icon icon-${tab.id}`} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-stat">
            <strong>{catalog.items.length}</strong>
            <span>published items</span>
          </div>
        </aside>

        <section className="content-pane">
          <div className="content-header">
            <div>
              <p className="eyebrow">Official curated catalog</p>
              <h1>{currentTab.title}</h1>
            </div>
            <a className="doc-link" href={`${apiBase}/desktop/catalog`}>Desktop catalog</a>
          </div>

          <div className="filter-row">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${currentTab.label.toLowerCase()}`} />
            </label>
            <select value={tag} onChange={(event) => setTag(event.target.value)} aria-label="Tag filter">
              <option value="">All tags</option>
              {allTags.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)} aria-label="Platform filter">
              {platforms.map((entry) => <option key={entry} value={entry}>{entry === 'all' ? 'All platforms' : entry}</option>)}
            </select>
          </div>

          {status === 'loading' ? <StateNotice title="Loading market" body="Fetching the latest official catalog." /> : null}
          {status === 'error' ? <StateNotice tone="error" title="Market unavailable" body={error} /> : null}
          {status === 'ready' && filtered.length === 0 ? <StateNotice title={currentTab.empty} body="Try another tag, platform, or search term." /> : null}

          <div className="item-grid">
            {filtered.map((item) => (
              <MarketCard key={`${item.type}:${item.id}`} item={item} onSelect={() => setSelected(item)} />
            ))}
          </div>
        </section>
      </section>

      {selected ? <DetailPanel item={selected} onClose={() => setSelected(null)} /> : null}
    </main>
  );
}

function MarketCard({ item, onSelect }) {
  const assetCount = Object.keys(item.assets || {}).length;
  return (
    <article className="market-card" onClick={onSelect} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect();
      }
    }} role="button" tabIndex={0}>
      <div className="card-head">
        <span className={`card-icon icon-${item.type}`} aria-hidden="true" />
        <div>
          <h2>{item.name}</h2>
          <p>{item.id}</p>
        </div>
      </div>
      <p className="description">{item.description || 'No description provided.'}</p>
      <div className="tag-row">
        {(item.tags || []).slice(0, 4).map((entry) => <span key={entry}>{entry}</span>)}
      </div>
      <footer>
        <span>v{item.version}</span>
        <span>{assetCount} asset{assetCount === 1 ? '' : 's'}</span>
      </footer>
    </article>
  );
}

function DetailPanel({ item, onClose }) {
  const viewCommand = `npx @zenmind/market-cli ${cliType(item.type)} view ${item.id}`;
  const npmCommand = item.npmPackage ? `npm view --registry ${location.origin}/market/npm ${item.npmPackage}` : '';
  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-panel" role="dialog" aria-modal="true" aria-label={`${item.name} details`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close">×</button>
        <div className="detail-heading">
          <span className={`card-icon icon-${item.type}`} aria-hidden="true" />
          <div>
            <p className="eyebrow">{item.type}{item.sandboxKind ? ` · ${item.sandboxKind}` : ''}</p>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
          </div>
        </div>
        <CommandBlock label="CLI view" value={viewCommand} />
        {npmCommand ? <CommandBlock label="npm view" value={npmCommand} /> : null}
        <section className="detail-section">
          <h3>Assets</h3>
          <div className="asset-list">
            {Object.entries(item.assets || {}).map(([platform, asset]) => (
              <a key={platform} href={asset.url}>
                <span>{platform}</span>
                <span>{asset.archiveType}</span>
                <span>{formatBytes(asset.sizeBytes)}</span>
              </a>
            ))}
          </div>
        </section>
        {item.readme ? (
          <section className="detail-section">
            <h3>README</h3>
            <pre className="readme">{item.readme}</pre>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

function CommandBlock({ label, value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <section className="command-block">
      <span>{label}</span>
      <code>{value}</code>
      <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
    </section>
  );
}

function StateNotice({ title, body, tone = 'neutral' }) {
  return (
    <div className={`state-notice is-${tone}`}>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function cliType(type) {
  return type === 'sandbox-image' ? 'sandbox' : type;
}

function formatBytes(value) {
  if (!value) return 'size unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
