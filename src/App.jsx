import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  ArrowRight,
  Bot,
  Box,
  Brain,
  Calendar,
  Cat,
  CheckCircle2,
  Copy,
  Download,
  File,
  Folder,
  Globe,
  HardDrive,
  Heart,
  Info,
  Languages,
  LayoutGrid,
  Moon,
  PackageOpen,
  Play,
  Plus,
  Puzzle,
  Search,
  Shapes,
  Sun,
  Terminal,
  Upload,
  User,
  X,
} from 'lucide-react';

const apiBase = import.meta.env.VITE_MARKET_API_BASE || '/api/v1';
const brandId = import.meta.env.VITE_MARKET_BRAND || 'zenmind';
const locales = ['zh-CN', 'en-US'];
const canonicalTypes = ['skill', 'plugin', 'agent', 'sandbox-image', 'pet', 'cli-tool', 'website-app'];
const adminTokenStorageKey = 'zenmind-market:admin-token';
const defaultMediaImage = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#eef2ff"/>
        <stop offset="0.55" stop-color="#f8fafc"/>
        <stop offset="1" stop-color="#dbeafe"/>
      </linearGradient>
    </defs>
    <rect width="960" height="540" fill="url(#bg)"/>
    <rect x="72" y="72" width="816" height="396" rx="30" fill="#ffffff" fill-opacity="0.74" stroke="#cbd5e1"/>
    <circle cx="204" cy="192" r="52" fill="#2563eb" fill-opacity="0.16"/>
    <rect x="296" y="160" width="408" height="26" rx="13" fill="#0f172a" fill-opacity="0.18"/>
    <rect x="296" y="214" width="520" height="18" rx="9" fill="#0f172a" fill-opacity="0.1"/>
    <rect x="296" y="252" width="452" height="18" rx="9" fill="#0f172a" fill-opacity="0.1"/>
    <rect x="144" y="346" width="672" height="58" rx="18" fill="#2563eb" fill-opacity="0.13"/>
  </svg>
`);

const brandNames = {
  zenmind: { 'zh-CN': 'ZenMind 市场', 'en-US': 'ZenMind Market' },
  cutej: { 'zh-CN': '小君 AI 市场', 'en-US': 'CuteJ Market' },
};

const marketBrand = resolveMarketBrand(brandId);

const translations = {
  'zh-CN': {
    searchPlaceholder: '搜索扩展、插件、沙箱、工具...',
    publish: '开发者发布',
    categoriesTitle: '市场分类',
    footer: '© 2026 ZenMind Technologies.\n标准扩展协议 v1.0',
    sortLabel: '排序:',
    sortPopular: '热门推荐',
    sortLatest: '最新发布',
    sortRating: '名称排序',
    count: (value) => `(${value})`,
    all: '全部组件',
    manage: '管理',
    details: '详情',
    emptyTitle: '未找到相关组件',
    emptyBody: '请尝试其他搜索词或分类。',
    emptyCatalogTitle: '市场暂无组件',
    emptyCatalogBody: '后端 SQLite 目录为空，请通过开发者发布上传真实制品。',
    loadingTitle: '正在加载市场',
    loadingBody: '正在获取官方目录。',
    loadingErrorTitle: '市场加载失败',
    loadingErrorBody: '无法连接后端目录。',
    cancel: '取消',
    close: '关闭',
    wait: '请稍候...',
    returnDeps: '返回依赖管理',
    complete: '完成',
    themeToggle: '切换主题',
    languageToggle: '切换语言',
    terminalShell: 'bash',
    depRequired: '必需',
    depOptional: '可选',
    developer: '开发者',
    createdAt: '创建日期',
    size: '大小',
    downloads: '下载',
    favorites: '收藏',
    favoriteAction: '收藏',
    unfavoriteAction: '取消收藏',
    favoriteFailed: (reason) => `收藏失败：${reason}`,
    favoriteAuthRequired: '需要登录或授权后才能收藏。',
    features: '核心特性',
    dependencies: '依赖图谱',
    assets: '制品内容',
    readmeFallback: '组件核心特性',
    noDescription: '暂无描述。',
    noDependencies: '暂无依赖。',
    downloadArtifact: '下载',
    downloading: '准备下载...',
    noArtifact: '暂无制品',
    downloadStarted: (name) => `[${name}] 制品下载已开始。`,
    downloadUnavailable: '后端未返回可下载制品。',
    downloadFailed: (reason) => `下载失败：${reason}`,
    installWithADP: '一键安装',
    installCopied: (command) => `已复制安装命令：${command}`,
    installCopyFailed: (reason) => `复制安装命令失败：${reason}`,
    installUnavailable: '该组件暂无 ADP 安装协议。',
    videoPlaying: '演示运行中',
    publishTitle: '发布到市场',
    publishBody: '填写组件元数据并上传制品包，发布后写入后端 SQLite。',
    type: '类型',
    componentId: '组件 ID',
    name: '名称',
    version: '版本',
    description: '描述',
    publishSubmit: '发布并上架',
    duplicate: (id) => `发布失败：组件 ID [${id}] 已存在于市场中。`,
    publishSuccess: (name) => `组件 [${name}] 发布成功并上架！`,
    publishFailed: (reason) => `发布失败：${reason}`,
    publishing: '正在发布...',
    adminToken: '管理员 Token',
    adminTokenRequired: '请输入管理员 Token。',
    artifact: '制品包',
    artifactRequired: '请选择要上传的制品包。',
    adpManifest: 'ADP 安装协议',
    adpManifestRequired: 'CLI 工具和技能必须上传 adp.yaml。',
    adpManifestHint: '上传 adp.yaml；服务器会绑定本次制品 URL 和 SHA-256。',
    archiveType: '制品类型',
    platformKey: '平台',
    platforms: '平台支持',
    currentPlatform: '当前平台',
    selectedPlatform: '已选平台',
    os: '系统',
    arch: '架构',
    minDesktopVersion: '最低桌面版本',
    platformDescription: '平台说明',
    platformMetadata: '平台元数据 JSON',
    platformDependencies: '平台依赖 JSON',
    installProtocol: '安装协议',
    installCommand: '安装命令',
    uninstallCommand: '卸载命令',
    detectCommands: '检测命令',
    versionCommand: '版本命令',
    noPlatformDetails: '暂无平台详情。',
    noInstallProtocol: '暂无安装脚本。',
    artifactOptional: '未选择制品时将发布元数据。',
    invalidJSON: (field) => `${field} 不是有效 JSON。`,
    tags: '标签',
    readme: 'README',
    author: '作者',
    metadataUrl: '外部 URL',
    sandboxKind: '沙箱类型',
    websiteKind: '网站类型',
    categories: {
      all: '全部组件',
      skill: '技能',
      plugin: '插件',
      agent: '智能体',
      'sandbox-image': '沙箱',
      pet: '桌面宠物',
      'cli-tool': 'CLI 工具',
      'website-app': '网站应用',
    },
  },
  'en-US': {
    searchPlaceholder: 'Search extensions, plugins, sandboxes, tools...',
    publish: 'Developer publish',
    categoriesTitle: 'Market Categories',
    footer: '© 2026 ZenMind Technologies.\nStandard Extension Protocol v1.0',
    sortLabel: 'Sort:',
    sortPopular: 'Popular',
    sortLatest: 'Latest',
    sortRating: 'Name',
    count: (value) => `(${value})`,
    all: 'All Components',
    manage: 'Manage',
    details: 'Details',
    emptyTitle: 'No matching components',
    emptyBody: 'Try another search term or category.',
    emptyCatalogTitle: 'No market items yet',
    emptyCatalogBody: 'The backend SQLite catalog is empty. Publish a real artifact to list it here.',
    loadingTitle: 'Loading market',
    loadingBody: 'Fetching the official catalog.',
    loadingErrorTitle: 'Market load failed',
    loadingErrorBody: 'Unable to connect to the backend catalog.',
    cancel: 'Cancel',
    close: 'Close',
    wait: 'Please wait...',
    returnDeps: 'Back to dependencies',
    complete: 'Done',
    themeToggle: 'Theme',
    languageToggle: 'Language',
    terminalShell: 'bash',
    depRequired: 'Required',
    depOptional: 'Optional',
    developer: 'Developer',
    createdAt: 'Created',
    size: 'Size',
    downloads: 'Downloads',
    favorites: 'Favorites',
    favoriteAction: 'Favorite',
    unfavoriteAction: 'Unfavorite',
    favoriteFailed: (reason) => `Favorite failed: ${reason}`,
    favoriteAuthRequired: 'Sign in or authorize this session before favoriting.',
    features: 'Core features',
    dependencies: 'Dependency graph',
    assets: 'Artifacts',
    readmeFallback: 'Component highlights',
    noDescription: 'No description provided.',
    noDependencies: 'No dependencies.',
    downloadArtifact: 'Download',
    downloading: 'Preparing...',
    noArtifact: 'No artifact',
    downloadStarted: (name) => `[${name}] artifact download started.`,
    downloadUnavailable: 'The backend did not return a downloadable artifact.',
    downloadFailed: (reason) => `Download failed: ${reason}`,
    installWithADP: 'Install',
    installCopied: (command) => `Install command copied: ${command}`,
    installCopyFailed: (reason) => `Failed to copy install command: ${reason}`,
    installUnavailable: 'This item has no ADP install protocol.',
    videoPlaying: 'Demo running',
    publishTitle: 'Publish to local market',
    publishBody: 'Add metadata, upload an artifact, and persist it to the backend SQLite catalog.',
    type: 'Type',
    componentId: 'Component ID',
    name: 'Name',
    version: 'Version',
    description: 'Description',
    publishSubmit: 'Publish',
    duplicate: (id) => `Publish failed: component ID [${id}] already exists.`,
    publishSuccess: (name) => `Component [${name}] published!`,
    publishFailed: (reason) => `Publish failed: ${reason}`,
    publishing: 'Publishing...',
    adminToken: 'Admin token',
    adminTokenRequired: 'Enter an admin token.',
    artifact: 'Artifact package',
    artifactRequired: 'Choose an artifact package to upload.',
    adpManifest: 'ADP manifest',
    adpManifestRequired: 'CLI tools and skills must upload adp.yaml.',
    adpManifestHint: 'Upload adp.yaml; the server binds this artifact URL and SHA-256.',
    archiveType: 'Archive type',
    platformKey: 'Platform',
    platforms: 'Platforms',
    currentPlatform: 'Current platform',
    selectedPlatform: 'Selected platform',
    os: 'OS',
    arch: 'Arch',
    minDesktopVersion: 'Minimum desktop',
    platformDescription: 'Platform description',
    platformMetadata: 'Platform metadata JSON',
    platformDependencies: 'Platform dependencies JSON',
    installProtocol: 'Install protocol',
    installCommand: 'Install command',
    uninstallCommand: 'Uninstall command',
    detectCommands: 'Detect commands',
    versionCommand: 'Version command',
    noPlatformDetails: 'No platform details.',
    noInstallProtocol: 'No install script.',
    artifactOptional: 'Publishing metadata only when no artifact is selected.',
    invalidJSON: (field) => `${field} is not valid JSON.`,
    tags: 'Tags',
    readme: 'README',
    author: 'Author',
    metadataUrl: 'External URL',
    sandboxKind: 'Sandbox kind',
    websiteKind: 'Website kind',
    categories: {
      all: 'All Components',
      skill: 'Skills',
      plugin: 'Plugins',
      agent: 'Agents',
      'sandbox-image': 'Sandboxes',
      pet: 'Desktop Pets',
      'cli-tool': 'CLI Tools',
      'website-app': 'WebApps',
    },
  },
};

const categoryMeta = [
  { id: 'all', icon: LayoutGrid, colorClass: 'is-muted' },
  { id: 'skill', icon: Brain, colorClass: 'is-purple' },
  { id: 'plugin', icon: Puzzle, colorClass: 'is-blue' },
  { id: 'agent', icon: Bot, colorClass: 'is-indigo' },
  { id: 'sandbox-image', icon: Box, colorClass: 'is-emerald' },
  { id: 'pet', icon: Cat, colorClass: 'is-amber' },
  { id: 'cli-tool', icon: Terminal, colorClass: 'is-rose' },
  { id: 'website-app', icon: Globe, colorClass: 'is-cyan' },
];

function initialTheme() {
  const saved = localStorage.getItem('zenmind-market:theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initialLocale() {
  const saved = localStorage.getItem('zenmind-market:locale');
  if (locales.includes(saved)) return saved;
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}

export function App() {
  const [apiItems, setApiItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('popular');
  const [theme, setTheme] = useState(initialTheme);
  const [locale, setLocale] = useState(initialLocale);
  const [selected, setSelected] = useState(null);
  const [selectedPlatformKey, setSelectedPlatformKey] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPublishOpen, setPublishOpen] = useState(false);
  const [isPublishing, setPublishing] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState('');
  const [favoritingKey, setFavoritingKey] = useState('');

  const t = translations[locale];

  const loadCatalog = useCallback(async (signal) => {
    setStatus('loading');
    setError('');
    try {
      const data = await requestJSON(`${apiBase}/catalog`, { signal });
      setApiItems(Array.isArray(data.items) ? data.items : []);
      setStatus('ready');
    } catch (reason) {
      if (reason?.name === 'AbortError') return;
      setApiItems([]);
      setError(errorMessage(reason));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('zenmind-market:theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem('zenmind-market:locale', locale);
  }, [locale]);

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal);
    return () => controller.abort();
  }, [loadCatalog]);

  const catalog = useMemo(() => {
    return apiItems.map((item) => mergeCatalogItem(item));
  }, [apiItems]);

  const categoryCounts = useMemo(() => {
    const counts = { all: catalog.length };
    for (const type of canonicalTypes) counts[type] = catalog.filter((item) => item.type === type).length;
    return counts;
  }, [catalog]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = catalog.filter((item) => {
      if (activeCategory !== 'all' && item.type !== activeCategory) return false;
      if (!needle) return true;
      return [
        item.id,
        localized(item.name, locale),
        localized(item.description, locale),
        item.author,
        ...(item.tags || []),
      ].join(' ').toLowerCase().includes(needle);
    });
    return [...result].sort((a, b) => {
      if (sortMode === 'latest') return dateValue(b.updatedAt || b.publishedAt) - dateValue(a.updatedAt || a.publishedAt);
      if (sortMode === 'rating') return localized(a.name, locale).localeCompare(localized(b.name, locale));
      return (parseCount(b.downloads) - parseCount(a.downloads))
        || (parseCount(b.favoriteCount) - parseCount(a.favoriteCount))
        || localized(a.name, locale).localeCompare(localized(b.name, locale));
    });
  }, [activeCategory, catalog, locale, query, sortMode]);

  const currentCategoryName = activeCategory === 'all' ? t.all : t.categories[activeCategory];
  const emptyCopy = catalog.length === 0
    ? { title: t.emptyCatalogTitle, body: t.emptyCatalogBody }
    : { title: t.emptyTitle, body: t.emptyBody };
  const brandTitle = localized(marketBrand.name, locale);

  function notify(message, tone = 'info') {
    const id = window.setTimeout(() => setToast(null), 3000);
    setToast({ message, tone, id });
  }

  function openDetails(item) {
    setSelected(item);
    setSelectedPlatformKey(preferredPlatformKey(item));
    setVideoPlaying(false);
  }

  function closeDetails() {
    setSelected(null);
    setSelectedPlatformKey('');
    setVideoPlaying(false);
  }

  async function handleDownload(item, platformOverride = '') {
    if (!item || downloadingKey) return;
    const platform = preferredPlatformKey(item, platformOverride);
    if (!hasArtifact(item, platform)) {
      notify(t.downloadUnavailable, 'error');
      return;
    }
    const key = `${item.type}:${item.id}:${platform || 'any'}`;
    setDownloadingKey(key);
    try {
      const route = marketRoute(item.type);
      const id = encodeURIComponent(item.id);
      const platformQuery = platform ? `?platform=${encodeURIComponent(platform)}` : '';
      const resolved = await requestJSON(`${apiBase}/${route}/${id}/resolve${platformQuery}`);
      if (!resolved?.asset?.url) {
        throw new Error(t.downloadUnavailable);
      }
      const resolvedPlatform = resolved.platform || platform;
      const downloadQuery = resolvedPlatform ? `?platform=${encodeURIComponent(resolvedPlatform)}` : '';
      triggerBrowserDownload(`${apiBase}/${route}/${id}/download${downloadQuery}`);
      notify(t.downloadStarted(`${localized(item.name, locale) || item.id}${resolvedPlatform ? ` (${resolvedPlatform})` : ''}`), 'success');
    } catch (reason) {
      notify(t.downloadFailed(errorMessage(reason)), 'error');
    } finally {
      setDownloadingKey('');
    }
  }

  async function handleInstall(item) {
    const command = adpInstallCommand(item);
    if (!command) {
      notify(t.installUnavailable, 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(command);
      notify(t.installCopied(command), 'success');
    } catch (reason) {
      notify(t.installCopyFailed(errorMessage(reason)), 'error');
    }
  }

  async function handleFavorite(item) {
    if (!item || favoritingKey) return;
    const key = `${item.type}:${item.id}`;
    setFavoritingKey(key);
    try {
      const route = marketRoute(item.type);
      const id = encodeURIComponent(item.id);
      const updated = await requestJSON(`${apiBase}/${route}/${id}/favorite`, {
        method: item.favorited ? 'DELETE' : 'POST',
      });
      const updatedType = normalizeType(updated.type);
      setApiItems((items) => items.map((entry) => (
        normalizeType(entry.type) === updatedType && entry.id === updated.id ? updated : entry
      )));
      const merged = mergeCatalogItem(updated);
      setSelected((current) => (
        current && current.id === merged.id && current.type === merged.type ? merged : current
      ));
    } catch (reason) {
      notify(reason?.status === 401 ? t.favoriteAuthRequired : t.favoriteFailed(errorMessage(reason)), 'error');
    } finally {
      setFavoritingKey('');
    }
  }

  async function handlePublish(event) {
    event.preventDefault();
    if (isPublishing) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const type = normalizeType(form.get('type'));
    const id = String(form.get('id') || '').trim().toLowerCase();
    const name = String(form.get('name') || '').trim();
    const version = canonicalVersion(form.get('version')) || '1.0.0';
    const description = String(form.get('description') || '').trim();
    const token = String(form.get('adminToken') || '').trim();
    const artifact = form.get('artifact');
    const hasSelectedArtifact = artifact instanceof File && artifact.size > 0;
    const adpManifest = form.get('adpManifest');
    const hasSelectedADPManifest = adpManifest instanceof File && adpManifest.size > 0;
    if (!token) {
      notify(t.adminTokenRequired, 'error');
      return;
    }
    if (artifactRequiredFor(type, { websiteKind: String(form.get('websiteKind') || '').trim() }) && !hasSelectedArtifact) {
      notify(t.artifactRequired, 'error');
      return;
    }
    if (adpRequiredFor(type) && !hasSelectedADPManifest) {
      notify(t.adpManifestRequired, 'error');
      return;
    }
    let platformMetadata;
    let platformDependencies;
    try {
      platformMetadata = parseJSONField(form.get('platformMetadata'), {}, t.platformMetadata, 'object', t.invalidJSON);
      platformDependencies = parseJSONField(form.get('platformDependencies'), [], t.platformDependencies, 'array', t.invalidJSON);
    } catch (reason) {
      notify(errorMessage(reason), 'error');
      return;
    }

    const platformKey = String(form.get('platformKey') || '').trim() || 'universal';
    const platformMinDesktopVersion = String(form.get('platformMinDesktopVersion') || '').trim();
    const install = scriptSpecFromCommand(form.get('installCommand'));
    const uninstall = scriptSpecFromCommand(form.get('uninstallCommand'));
    const detect = detectSpecFromForm(form);
    const platform = {
      key: platformKey,
      os: String(form.get('platformOS') || '').trim(),
      arch: String(form.get('platformArch') || '').trim(),
      description: String(form.get('platformDescription') || '').trim(),
      minDesktopVersion: platformMinDesktopVersion,
      metadata: platformMetadata,
      dependencies: platformDependencies,
    };
    if (install) platform.install = install;
    if (uninstall) platform.uninstall = uninstall;
    if (detect) platform.detect = detect;

    const metadata = {
      id,
      type,
      name: name || id,
      version,
      description,
      readme: String(form.get('readme') || '').trim(),
      tags: parseTags(form.get('tags')),
      minDesktopVersion: platformMinDesktopVersion,
      sandboxKind: type === 'sandbox-image' ? String(form.get('sandboxKind') || '').trim() || 'environment-template' : '',
      websiteKind: type === 'website-app' ? String(form.get('websiteKind') || '').trim() || 'local-app' : '',
      platformKey,
      assetRole: 'primary',
      archiveType: String(form.get('archiveType') || '').trim() || defaultArchiveTypeFor(type),
      metadata: {},
      dependencies: platformDependencies,
      platform,
    };
    if (type === 'cli-tool') {
      if (install) metadata.install = install;
      if (uninstall) metadata.uninstall = uninstall;
      if (detect) metadata.detect = detect;
    }
    const author = String(form.get('author') || '').trim();
    const metadataUrl = String(form.get('metadataUrl') || '').trim();
    if (author) metadata.metadata.author = author;
    if (metadataUrl) metadata.metadata.url = metadataUrl;
    if (hasSelectedADPManifest && !hasSelectedArtifact) {
      metadata.adpYaml = await adpManifest.text();
    }

    setPublishing(true);
    try {
      if (hasSelectedArtifact) {
        const body = new FormData();
        body.append('metadata', JSON.stringify(metadata));
        body.append('artifact', artifact);
        if (hasSelectedADPManifest) body.append('adp', adpManifest);
        await requestJSON(`${apiBase}/admin/${marketRoute(type)}/publish`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
      } else {
        await requestJSON(`${apiBase}/admin/${marketRoute(type)}/publish`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify(metadata),
        });
      }
      saveAdminToken(token);
      await loadCatalog();
      setActiveCategory(type);
      setPublishOpen(false);
      formElement.reset();
      notify(t.publishSuccess(name || id), 'success');
    } catch (reason) {
      notify(t.publishFailed(errorMessage(reason)), 'error');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="market-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label={brandTitle}>
          <span className="brand-mark"><Shapes size={20} /></span>
          <span className="brand-copy">
            <strong>{brandTitle}</strong>
          </span>
        </a>

        <label className="global-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} />
        </label>

        <div className="top-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={t.themeToggle} aria-label={t.themeToggle}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="language-button" type="button" onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')} title={t.languageToggle} aria-label={t.languageToggle}>
            <Languages size={15} />
            <span>{locale === 'zh-CN' ? '中' : 'EN'}</span>
          </button>
          <button className="publish-button" type="button" onClick={() => setPublishOpen(true)}>
            <Plus size={15} />
            <span>{t.publish}</span>
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-main">
            <section>
              <h3>{t.categoriesTitle}</h3>
              <nav className="category-nav" aria-label={t.categoriesTitle}>
                {categoryMeta.map((category) => {
                  const Icon = category.icon;
                  const active = activeCategory === category.id;
                  return (
                    <button key={category.id} className={active ? 'category-button is-active' : 'category-button'} type="button" onClick={() => setActiveCategory(category.id)}>
                      <span className="category-label">
                        <Icon className={category.colorClass} size={15} />
                        <span>{category.id === 'all' ? t.all : t.categories[category.id]}</span>
                      </span>
                      <span className="category-count">{categoryCounts[category.id] || 0}</span>
                    </button>
                  );
                })}
              </nav>
            </section>
          </div>
          <p className="sidebar-footer">{t.footer}</p>
        </aside>

        <section className="content-pane">
          <div className="content-header">
            <div className="content-title">
              <h1>{currentCategoryName}</h1>
              <span>{t.count(filtered.length)}</span>
            </div>
            <label className="sort-control">
              <span>{t.sortLabel}</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="popular">{t.sortPopular}</option>
                <option value="latest">{t.sortLatest}</option>
                <option value="rating">{t.sortRating}</option>
              </select>
            </label>
          </div>

          {status === 'loading' ? <StateNotice title={t.loadingTitle} body={t.loadingBody} /> : null}
          {status === 'error' ? <StateNotice tone="error" title={t.loadingErrorTitle} body={`${t.loadingErrorBody} ${error ? `(${error})` : ''}`} /> : null}

          <div className="catalog-scroll">
            {filtered.length ? (
              <div className="catalog-grid">
                {filtered.map((item) => (
                  <MarketCard
                    key={`${item.type}:${item.id}`}
                    item={item}
                    locale={locale}
                    t={t}
                    onDetails={() => openDetails(item)}
                    onInstall={() => handleInstall(item)}
                    onDownload={() => handleDownload(item)}
                    onFavorite={() => handleFavorite(item)}
                    isDownloading={downloadingKey === `${item.type}:${item.id}:${preferredPlatformKey(item) || 'any'}`}
                    isFavoriting={favoritingKey === `${item.type}:${item.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <PackageOpen size={34} />
                <strong>{emptyCopy.title}</strong>
                <span>{emptyCopy.body}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {selected ? (
        <DetailModal
          item={selected}
          locale={locale}
          t={t}
          videoPlaying={videoPlaying}
          selectedPlatformKey={selectedPlatformKey || preferredPlatformKey(selected)}
          onPlatformChange={setSelectedPlatformKey}
          onToggleVideo={() => setVideoPlaying((value) => !value)}
          onClose={closeDetails}
          onDownload={() => handleDownload(selected, selectedPlatformKey)}
          onInstall={() => handleInstall(selected)}
          onFavorite={() => handleFavorite(selected)}
          isDownloading={downloadingKey === `${selected.type}:${selected.id}:${preferredPlatformKey(selected, selectedPlatformKey) || 'any'}`}
          isFavoriting={favoritingKey === `${selected.type}:${selected.id}`}
        />
      ) : null}

      {isPublishOpen ? <PublishModal t={t} onClose={() => setPublishOpen(false)} onSubmit={handlePublish} isPublishing={isPublishing} /> : null}
      {toast ? <Toast toast={toast} /> : null}
    </main>
  );
}

function MarketCard({ item, locale, t, onDetails, onInstall, onDownload, onFavorite, isDownloading, isFavoriting }) {
  const category = categoryMeta.find((entry) => entry.id === item.type);
  const Icon = category?.icon || PackageOpen;
  const platform = preferredPlatformKey(item);
  const canDownload = hasArtifact(item, platform);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  return (
    <article className="market-card">
      <div className="card-body">
        <div className="card-title-row">
          <span className={`card-type-icon ${category?.colorClass || 'is-muted'}`} title={displayType(item.type, t)} aria-label={displayType(item.type, t)}>
            <Icon size={16} />
          </span>
          <h2>
            {localized(item.name, locale)}
          </h2>
          <span className="card-version">{formatVersionLabel(item.version)}</span>
        </div>
        <p>{localized(item.description, locale) || t.noDescription}</p>
        <div className="tag-row">
          {(item.tags || []).slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}
          {platform ? <span className="platform-chip">{platform}</span> : null}
        </div>
      </div>
      <footer>
        <div className="card-footer-meta">
          <button className="link-button" type="button" onClick={onDetails}>
            <span>{t.details}</span>
            <ArrowRight size={13} />
          </button>
          {canInstall && canDownload ? (
            <button className="link-button" type="button" onClick={onDownload} disabled={isDownloading}>
              <span>{isDownloading ? t.downloading : t.downloadArtifact}</span>
            </button>
          ) : null}
          <div className="card-stats">
            <span className="stat-pill" title={t.downloads} aria-label={`${t.downloads}: ${formatCount(item.downloads)}`}>
              <Download size={13} />
              <span>{formatCount(item.downloads)}</span>
            </span>
            <button
              className={item.favorited ? 'stat-pill stat-button is-active' : 'stat-pill stat-button'}
              type="button"
              onClick={onFavorite}
              disabled={isFavoriting}
              title={favoriteLabel}
              aria-label={`${favoriteLabel}: ${formatCount(item.favoriteCount)}`}
            >
              <Heart size={13} fill={item.favorited ? 'currentColor' : 'none'} />
              <span>{formatCount(item.favoriteCount)}</span>
            </button>
          </div>
        </div>
        <button className="primary-action" type="button" disabled={canInstall ? false : !canDownload || isDownloading} onClick={canInstall ? onInstall : onDownload}>
          {canInstall ? <Copy size={13} /> : <Download size={13} />}
          <span>{canInstall ? t.installWithADP : canDownload ? isDownloading ? t.downloading : t.downloadArtifact : t.noArtifact}</span>
        </button>
      </footer>
    </article>
  );
}

function DetailModal({ item, locale, t, videoPlaying, selectedPlatformKey, onPlatformChange, onToggleVideo, onClose, onInstall, onDownload, onFavorite, isDownloading, isFavoriting }) {
  const Icon = categoryMeta.find((category) => category.id === item.type)?.icon || PackageOpen;
  const platformKeys = availablePlatformKeys(item);
  const activePlatformKey = preferredPlatformKey(item, selectedPlatformKey);
  const activePlatform = platformForKey(item, activePlatformKey);
  const deps = platformDependencies(activePlatform, item);
  const commands = commandEntries(activePlatform, t);
  const canDownload = hasArtifact(item, activePlatformKey);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-modal" role="dialog" aria-modal="true" aria-label={localized(item.name, locale)} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        <div className="detail-grid">
          <section className="detail-main">
            <div className="media-panel">
              <img src={item.screenshot} alt="" />
            </div>
            <button className="video-panel" type="button" onClick={onToggleVideo}>
              <img src={item.videoThumb} alt="" />
              {videoPlaying ? <span className="video-running">{t.videoPlaying}</span> : <span className="play-overlay"><Play size={26} fill="currentColor" /></span>}
            </button>
            <section className="readme-section">
              <h3>{localized(item.readmeTitle, locale) || t.readmeFallback}</h3>
              <p>{localized(item.readme, locale)}</p>
              <ul>
                {(localized(item.features, locale) || []).map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </section>
          </section>

          <section className="detail-side">
            <div className="detail-heading">
              <div className="detail-icon"><Icon size={30} /></div>
              <span>{displayType(item.type, t)}</span>
              <h2>{localized(item.name, locale)}</h2>
              <p>{localized(item.description, locale)}</p>
            </div>

            <div className="meta-grid">
              <div className="meta-row">
                <User size={14} />
                <span>{t.developer}</span>
                <strong>{item.author || 'ZenMind'}</strong>
              </div>
              <div className="meta-row">
                <Calendar size={14} />
                <span>{t.createdAt}</span>
                <strong>{formatDate(item.createdAt || item.publishedAt, locale)}</strong>
              </div>
              <div className="meta-row">
                <HardDrive size={14} />
                <span>{t.size}</span>
                <strong>{formatAssetSizeForPlatform(item, activePlatformKey) || item.size || formatAssetSize(item)}</strong>
              </div>
              <div className="meta-row">
                <Download size={14} />
                <span>{t.downloads}</span>
                <strong>{formatCount(item.downloads)}</strong>
              </div>
              <button
                className={item.favorited ? 'meta-row meta-button is-active' : 'meta-row meta-button'}
                type="button"
                onClick={onFavorite}
                disabled={isFavoriting}
                title={favoriteLabel}
                aria-label={`${favoriteLabel}: ${formatCount(item.favoriteCount)}`}
              >
                <Heart size={14} fill={item.favorited ? 'currentColor' : 'none'} />
                <span>{t.favorites}</span>
                <strong>{formatCount(item.favoriteCount)}</strong>
              </button>
            </div>

            <section className="side-section">
              <h3>{t.platforms}</h3>
              {platformKeys.length ? (
                <div className="platform-detail">
                  {platformKeys.length > 1 ? (
                    <label className="platform-select">
                      <span>{t.currentPlatform}</span>
                      <select value={activePlatformKey} onChange={(event) => onPlatformChange(event.target.value)}>
                        {platformKeys.map((platform) => <option value={platform} key={platform}>{platform}</option>)}
                      </select>
                    </label>
                  ) : (
                    <div className="platform-single">
                      <Box size={13} />
                      <span>{activePlatformKey}</span>
                    </div>
                  )}
                  <div className="platform-facts">
                    {activePlatform?.os ? <span>{t.os}: {activePlatform.os}</span> : null}
                    {activePlatform?.arch ? <span>{t.arch}: {activePlatform.arch}</span> : null}
                    {activePlatform?.minDesktopVersion ? <span>{t.minDesktopVersion}: {activePlatform.minDesktopVersion}</span> : null}
                    {hasArtifact(item, activePlatformKey) ? <span>{t.assets}: {formatAssetSizeForPlatform(item, activePlatformKey)}</span> : null}
                  </div>
                  {activePlatform?.description ? <p className="platform-copy">{activePlatform.description}</p> : null}
                </div>
              ) : <p className="empty-detail">{t.noPlatformDetails}</p>}
            </section>

            <section className="side-section">
              <h3>{t.dependencies}</h3>
              <div className="dependency-list">
                {deps.length ? deps.map((dep) => {
                  const key = dependencyKey(dep);
                  return (
                    <div className="dep-row" key={`${key}:${dep.name || dep.displayName || dep.kind}`}>
                      <span className={dep.required ? 'dep-dot warn' : 'dep-dot optional'} />
                      <strong>{localized(dep.name || dep.displayName || key, locale)}</strong>
                      <small>{dep.required ? t.depRequired : t.depOptional}</small>
                    </div>
                  );
                }) : <p className="empty-detail">{t.noDependencies}</p>}
              </div>
            </section>

            {commands.length ? (
              <section className="side-section">
                <h3>{t.installProtocol}</h3>
                <div className="command-list">
                  {commands.map((entry) => (
                    <div className="command-row" key={`${entry.label}:${entry.value}`}>
                      <Terminal size={13} />
                      <div>
                        <small>{entry.label}</small>
                        <code>{entry.value}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="side-section">
              <h3>{t.assets}</h3>
              <div className="asset-tree">
                {(assetEntries(item) || []).map((asset) => {
                  const isDir = asset.label.includes('/');
                  const AssetIcon = isDir ? Folder : File;
                  return (
                    <div className={asset.platform === activePlatformKey ? 'is-selected' : ''} key={asset.label}>
                      <AssetIcon size={14} />
                      <span>{asset.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="detail-action">
              <button className="primary-action wide" type="button" disabled={canInstall ? false : !canDownload || isDownloading} onClick={canInstall ? onInstall : onDownload}>
                {canInstall ? <Copy size={16} /> : <Download size={16} />}
                <span>{canInstall ? t.installWithADP : canDownload ? isDownloading ? t.downloading : t.downloadArtifact : t.noArtifact}</span>
              </button>
              {canInstall && canDownload ? (
                <button className="secondary-action wide" type="button" disabled={isDownloading} onClick={onDownload}>
                  <Download size={16} />
                  <span>{isDownloading ? t.downloading : t.downloadArtifact}</span>
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function PublishModal({ t, onClose, onSubmit, isPublishing }) {
  const [type, setType] = useState('agent');
  const [archiveType, setArchiveType] = useState(defaultArchiveTypeFor('agent'));
  const [sandboxKind, setSandboxKind] = useState('environment-template');
  const [websiteKind, setWebsiteKind] = useState('local-app');

  function handleTypeChange(event) {
    const nextType = normalizeType(event.target.value);
    setType(nextType);
    setArchiveType(defaultArchiveTypeFor(nextType, { sandboxKind: 'environment-template' }));
    if (nextType === 'sandbox-image') setSandboxKind('environment-template');
    if (nextType === 'website-app') setWebsiteKind('local-app');
  }

  function handleSandboxKindChange(event) {
    const nextKind = event.target.value === 'container-image' ? 'container-image' : 'environment-template';
    setSandboxKind(nextKind);
    setArchiveType(defaultArchiveTypeFor('sandbox-image', { sandboxKind: nextKind }));
  }

  function handleWebsiteKindChange(event) {
    const nextKind = event.target.value;
    setWebsiteKind(nextKind);
    setArchiveType(defaultArchiveTypeFor('website-app'));
  }

  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal" role="dialog" aria-modal="true" aria-label={t.publishTitle} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{t.publishTitle}</h2>
            <p>{t.publishBody}</p>
          </div>
          <button className="modal-close inline" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        </div>
        <form className="publish-form" onSubmit={onSubmit}>
          <label className="full">
            <span>{t.adminToken}</span>
            <input name="adminToken" type="password" required defaultValue={savedAdminToken()} autoComplete="off" />
          </label>
          <label>
            <span>{t.type}</span>
            <select name="type" value={type} onChange={handleTypeChange}>
              {canonicalTypes.map((type) => <option value={type} key={type}>{t.categories[type]}</option>)}
            </select>
          </label>
          <label>
            <span>{t.componentId}</span>
            <input name="id" required placeholder="my-agent" pattern="[a-z0-9._-]+" />
          </label>
          <label>
            <span>{t.name}</span>
            <input name="name" required placeholder="My Agent" />
          </label>
          <label>
            <span>{t.version}</span>
            <input name="version" defaultValue="1.0.0" />
          </label>
          <label>
            <span>{t.archiveType}</span>
            <select name="archiveType" value={archiveType} onChange={(event) => setArchiveType(event.target.value)}>
              {archiveOptionsFor(type, { sandboxKind }).map((option) => <option value={option} key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>{t.platformKey}</span>
            <input name="platformKey" defaultValue="universal" placeholder="universal" />
          </label>
          <label>
            <span>{t.os}</span>
            <select name="platformOS" defaultValue="">
              <option value="">auto</option>
              <option value="darwin">darwin</option>
              <option value="linux">linux</option>
              <option value="windows">windows</option>
              <option value="universal">universal</option>
            </select>
          </label>
          <label>
            <span>{t.arch}</span>
            <select name="platformArch" defaultValue="">
              <option value="">auto</option>
              <option value="arm64">arm64</option>
              <option value="amd64">amd64</option>
              <option value="arm">arm</option>
              <option value="386">386</option>
            </select>
          </label>
          <label>
            <span>{t.minDesktopVersion}</span>
            <input name="platformMinDesktopVersion" placeholder="1.2.0" />
          </label>
          {type === 'sandbox-image' ? (
            <label>
              <span>{t.sandboxKind}</span>
              <select name="sandboxKind" value={sandboxKind} onChange={handleSandboxKindChange}>
                <option value="environment-template">environment-template</option>
                <option value="container-image">container-image</option>
              </select>
            </label>
          ) : null}
          {type === 'website-app' ? (
            <label>
              <span>{t.websiteKind}</span>
              <select name="websiteKind" value={websiteKind} onChange={handleWebsiteKindChange}>
                <option value="local-app">local-app</option>
                <option value="external">external</option>
              </select>
            </label>
          ) : null}
          {type === 'website-app' && websiteKind === 'external' ? (
            <label className="full">
              <span>{t.metadataUrl}</span>
              <input name="metadataUrl" type="url" required placeholder="https://example.com/app" />
            </label>
          ) : null}
          <label>
            <span>{t.tags}</span>
            <input name="tags" placeholder="AI, Tool" />
          </label>
          <label>
            <span>{t.author}</span>
            <input name="author" placeholder="ZenMind" />
          </label>
          <label className="full">
            <span>{t.artifact}</span>
            <input name="artifact" type="file" required={artifactRequiredFor(type, { websiteKind })} />
            {!artifactRequiredFor(type, { websiteKind }) ? <small className="field-hint">{t.artifactOptional}</small> : null}
          </label>
          {adpRequiredFor(type) ? (
            <label className="full">
              <span>{t.adpManifest}</span>
              <input name="adpManifest" type="file" accept=".yaml,.yml,text/yaml,application/x-yaml" required />
              <small className="field-hint">{t.adpManifestHint}</small>
            </label>
          ) : null}
          <label className="full">
            <span>{t.description}</span>
            <textarea name="description" rows="4" required />
          </label>
          <label className="full">
            <span>{t.platformDescription}</span>
            <textarea name="platformDescription" rows="3" />
          </label>
          <label className="full">
            <span>{t.platformMetadata}</span>
            <textarea name="platformMetadata" rows="4" defaultValue="{}" spellCheck="false" />
          </label>
          <label className="full">
            <span>{t.platformDependencies}</span>
            <textarea name="platformDependencies" rows="5" defaultValue="[]" spellCheck="false" />
          </label>
          {type === 'cli-tool' ? (
            <>
              <label className="full">
                <span>{t.installCommand}</span>
                <input name="installCommand" placeholder="brew install zmctl" />
              </label>
              <label className="full">
                <span>{t.uninstallCommand}</span>
                <input name="uninstallCommand" placeholder="brew uninstall zmctl" />
              </label>
              <label className="full">
                <span>{t.detectCommands}</span>
                <textarea name="detectCommands" rows="3" placeholder="zmctl" />
              </label>
              <label className="full">
                <span>{t.versionCommand}</span>
                <input name="versionCommand" placeholder="zmctl --version" />
              </label>
            </>
          ) : null}
          <label className="full">
            <span>{t.readme}</span>
            <textarea name="readme" rows="5" />
          </label>
          <footer className="modal-actions">
            <button className="secondary-action" type="button" onClick={onClose} disabled={isPublishing}>{t.cancel}</button>
            <button className="primary-action" type="submit" disabled={isPublishing}>
              <Upload size={15} />
              <span>{isPublishing ? t.publishing : t.publishSubmit}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function StateNotice({ title, body, tone = 'neutral' }) {
  const NoticeIcon = tone === 'warning' || tone === 'error' ? AlertCircle : Info;
  return (
    <div className={`state-notice is-${tone}`}>
      <NoticeIcon size={16} />
      <span><strong>{title}</strong>{body}</span>
    </div>
  );
}

function Toast({ toast }) {
  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertOctagon : Info;
  return (
    <div className={`toast is-${toast.tone}`}>
      <Icon size={17} />
      <span>{toast.message}</span>
    </div>
  );
}

function mergeCatalogItem(apiItem) {
  const type = normalizeType(apiItem.type);
  const assetMap = apiItem.assets || {};
  const platformMap = synthesizePlatformMap(apiItem.platforms || {}, assetMap);
  const assets = Object.entries(assetMap).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'} ${formatBytes(asset.sizeBytes)}`);
  const downloadCount = parseCount(apiItem.downloadCount ?? apiItem.metadata?.downloads ?? 0);
  const favoriteCount = parseCount(apiItem.favoriteCount ?? apiItem.metadata?.favorites ?? 0);
  const dependencies = apiItem.dependencies?.length ? apiItem.dependencies.map((dep) => ({
    ...dep,
    id: dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
    name: dep.displayName || dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
  })) : [];
  return {
    ...apiItem,
    type,
    name: apiItem.name || apiItem.id,
    description: apiItem.description || '',
    readme: apiItem.readme || '',
    tags: apiItem.tags || [],
    assets,
    assetMap,
    platformMap,
    platformOptions: sortPlatformKeys(Object.keys(platformMap)),
    dependencies,
    screenshot: apiItem.metadata?.screenshot || defaultMediaImage,
    videoThumb: apiItem.metadata?.videoThumb || apiItem.metadata?.screenshot || defaultMediaImage,
    author: apiItem.author || apiItem.metadata?.author || 'ZenMind',
    createdAt: apiItem.createdAt || apiItem.publishedAt || '',
    size: formatAssetSize(apiItem),
    downloadCount,
    downloads: downloadCount,
    favoriteCount,
    favorited: Boolean(apiItem.favorited),
  };
}

function normalizeType(type) {
  if (type === 'webapps' || type === 'webapp' || type === 'website' || type === 'website-apps') return 'website-app';
  if (type === 'agents') return 'agent';
  return canonicalTypes.includes(type) ? type : 'skill';
}

function localized(value, locale) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return value[locale] || value['zh-CN'] || value['en-US'] || '';
  return value || '';
}

function resolveMarketBrand(value) {
  const raw = String(value || 'zenmind').trim() || 'zenmind';
  const key = raw.toLowerCase();
  if (brandNames[key]) return { id: key, name: brandNames[key] };
  const fallbackName = formatBrandLabel(raw);
  return {
    id: key,
    name: {
      'zh-CN': `${fallbackName} 市场`,
      'en-US': `${fallbackName} Market`,
    },
  };
}

function formatBrandLabel(value) {
  const words = String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 'ZenMind';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function displayType(type, t) {
  return t?.categories?.[type] || (type === 'website-app' ? 'webapps' : type);
}

function canonicalVersion(value) {
  const version = String(value || '').trim();
  if (/^[vV]\d/.test(version)) return version.slice(1);
  return version;
}

function formatVersionLabel(value) {
  const version = canonicalVersion(value);
  return version ? `v${version}` : '';
}

function synthesizePlatformMap(platforms = {}, assets = {}) {
  const result = {};
  for (const [key, spec] of Object.entries(platforms || {})) {
    const platform = sanitizePlatformKey(spec?.platform || key) || 'universal';
    result[platform] = normalizePlatformSpec(platform, spec);
  }
  for (const [key] of Object.entries(assets || {})) {
    const platform = sanitizePlatformKey(key) || 'universal';
    if (!result[platform]) {
      result[platform] = normalizePlatformSpec(platform, { platform });
    }
  }
  return result;
}

function normalizePlatformSpec(platform, spec = {}) {
  return {
    platform,
    os: spec.os || inferOSFromPlatform(platform),
    arch: spec.arch || inferArchFromPlatform(platform),
    description: spec.description || '',
    readme: spec.readme || '',
    minDesktopVersion: spec.minDesktopVersion || '',
    metadata: spec.metadata || {},
    dependencies: normalizeDependenciesForUI(spec.dependencies || []),
    install: spec.install || null,
    uninstall: spec.uninstall || null,
    detect: spec.detect || null,
  };
}

function normalizeDependenciesForUI(dependencies) {
  return (dependencies || []).map((dep) => ({
    ...dep,
    id: dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
    name: dep.displayName || dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
  }));
}

function availablePlatformKeys(item) {
  const keys = item?.platformOptions?.length
    ? item.platformOptions
    : sortPlatformKeys([
      ...Object.keys(item?.platformMap || {}),
      ...Object.keys(item?.assetMap || {}),
    ]);
  return keys;
}

function sortPlatformKeys(keys) {
  return [...new Set(keys.map(sanitizePlatformKey).filter(Boolean))].sort((a, b) => {
    if (a === 'universal') return -1;
    if (b === 'universal') return 1;
    return a.localeCompare(b);
  });
}

function preferredPlatformKey(item, requested = '') {
  const keys = availablePlatformKeys(item);
  if (!keys.length) return '';
  const detected = detectClientPlatform();
  const preferred = requested || detected.key;
  for (const candidate of platformFallbackCandidates(preferred)) {
    if (keys.includes(candidate)) return candidate;
  }
  for (const candidate of platformFallbackCandidates(detected.os)) {
    if (keys.includes(candidate)) return candidate;
  }
  if (keys.includes('universal')) return 'universal';
  return keys[0];
}

function platformForKey(item, key) {
  const resolvedKey = preferredPlatformKey(item, key);
  return item?.platformMap?.[resolvedKey] || (resolvedKey ? normalizePlatformSpec(resolvedKey, { platform: resolvedKey }) : null);
}

function platformDependencies(platform, item) {
  if (platform?.dependencies?.length) return platform.dependencies;
  return item?.dependencies || [];
}

function platformFallbackCandidates(platform) {
  platform = sanitizePlatformKey(platform);
  if (!platform || platform === 'universal') return ['universal'];
  const candidates = [];
  const add = (value) => {
    value = sanitizePlatformKey(value);
    if (value && !candidates.includes(value)) candidates.push(value);
  };
  add(platform);
  const parts = platform.split('-');
  if (parts.length >= 2) add(`${parts[0]}-${parts[1]}`);
  if (parts.length >= 1) add(parts[0]);
  add('universal');
  return candidates;
}

function detectClientPlatform() {
  const rawPlatform = `${navigator.platform || ''} ${navigator.userAgent || ''}`.toLowerCase();
  let os = 'universal';
  if (rawPlatform.includes('mac') || rawPlatform.includes('darwin')) os = 'darwin';
  else if (rawPlatform.includes('win')) os = 'windows';
  else if (rawPlatform.includes('linux') || rawPlatform.includes('x11')) os = 'linux';

  let arch = '';
  if (rawPlatform.includes('arm64') || rawPlatform.includes('aarch64')) arch = 'arm64';
  else if (rawPlatform.includes('x86_64') || rawPlatform.includes('x64') || rawPlatform.includes('win64') || rawPlatform.includes('amd64')) arch = 'amd64';
  else if (rawPlatform.includes('i686') || rawPlatform.includes('i386')) arch = '386';
  if (!arch && os === 'darwin') arch = 'arm64';
  if (!arch && os !== 'universal') arch = 'amd64';

  return { os, arch, key: os === 'universal' ? 'universal' : `${os}-${arch}` };
}

function sanitizePlatformKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferOSFromPlatform(platform) {
  const key = sanitizePlatformKey(platform);
  if (key.startsWith('darwin')) return 'darwin';
  if (key.startsWith('linux')) return 'linux';
  if (key.startsWith('windows') || key.startsWith('win32')) return 'windows';
  return key === 'universal' ? 'universal' : '';
}

function inferArchFromPlatform(platform) {
  const parts = sanitizePlatformKey(platform).split('-');
  return parts.find((part) => ['arm64', 'amd64', '386', 'arm'].includes(part)) || '';
}

function marketRoute(type) {
  switch (normalizeType(type)) {
    case 'skill':
      return 'skills';
    case 'plugin':
      return 'plugins';
    case 'agent':
      return 'agents';
    case 'sandbox-image':
      return 'sandbox-images';
    case 'pet':
      return 'pets';
    case 'cli-tool':
      return 'cli-tools';
    case 'website-app':
      return 'webapps';
    default:
      return 'skills';
  }
}

function dependencyKey(dep) {
  return dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind || 'unknown';
}

function commandEntries(platform, t) {
  const entries = [];
  if (platform?.install?.command) entries.push({ label: t.installCommand, value: platform.install.command });
  if (platform?.uninstall?.command) entries.push({ label: t.uninstallCommand, value: platform.uninstall.command });
  for (const command of platform?.detect?.commands || []) {
    if (command) entries.push({ label: t.detectCommands, value: command });
  }
  if (platform?.detect?.versionCommand) entries.push({ label: t.versionCommand, value: platform.detect.versionCommand });
  return entries;
}

function assetList(item) {
  if (Array.isArray(item.assets)) return item.assets;
  return Object.entries(item.assets || {}).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'}`);
}

function assetEntries(item) {
  const assets = item.assetMap || item.assets || {};
  if (Array.isArray(assets)) return assets.map((label) => ({ label, platform: label.split('/')[0] }));
  return Object.entries(assets).map(([platform, asset]) => ({
    platform,
    label: `${platform}/${asset.archiveType || 'artifact'} ${formatBytes(asset.sizeBytes)}`,
    asset,
  }));
}

function formatAssetSize(item) {
  const values = Object.values(item.assets || {});
  if (!values.length || !values[0]?.sizeBytes) return 'size unknown';
  return formatBytes(values.reduce((sum, asset) => sum + (asset.sizeBytes || 0), 0));
}

function formatAssetSizeForPlatform(item, platformKey) {
  const asset = getAssetForPlatform(item, platformKey);
  return asset?.sizeBytes ? formatBytes(asset.sizeBytes) : '';
}

function formatBytes(value) {
  if (!value) return 'size unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function parseCount(value) {
  return Number(String(value || '0').replace(/[^0-9]/g, '')) || 0;
}

function parseDownloads(value) {
  return parseCount(value);
}

function formatCount(value) {
  return parseCount(value).toLocaleString();
}

function formatDownloads(value) {
  return formatCount(value);
}

function formatDate(value, locale) {
  const timestamp = dateValue(value);
  if (!timestamp) return locale === 'zh-CN' ? '未知' : 'Unknown';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

function dateValue(value) {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getAssetForPlatform(item, platformKey = '') {
  const assetMap = item?.assetMap || {};
  if (!Object.keys(assetMap).length) return null;
  if (!platformKey) return Object.values(assetMap)[0] || null;
  for (const candidate of platformFallbackCandidates(platformKey)) {
    if (assetMap[candidate]) return assetMap[candidate];
  }
  return null;
}

function hasArtifact(item, platformKey = '') {
  if (platformKey) return Boolean(getAssetForPlatform(item, platformKey));
  return Boolean(Object.keys(item?.assetMap || {}).length || assetList(item).length);
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function errorMessage(reason) {
  return reason instanceof Error ? reason.message : String(reason || 'unknown error');
}

function triggerBrowserDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function canInstallWithADP(item) {
  return Boolean(item?.adpInstallUrl && (item.type === 'cli-tool' || item.type === 'skill'));
}

function adpInstallCommand(item) {
  if (!canInstallWithADP(item)) return '';
  return `adp install ${absoluteInstallURL(item.adpInstallUrl)}`;
}

function absoluteInstallURL(value) {
  if (!value) return '';
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return String(value);
  }
}

function parseTags(value) {
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseJSONField(value, fallback, label, expectedType, invalidJSON) {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(invalidJSON ? invalidJSON(label) : `${label} is not valid JSON.`);
  }
  if (expectedType === 'array' && !Array.isArray(parsed)) {
    throw new Error(invalidJSON ? invalidJSON(label) : `${label} must be an array.`);
  }
  if (expectedType === 'object' && (Array.isArray(parsed) || parsed === null || typeof parsed !== 'object')) {
    throw new Error(invalidJSON ? invalidJSON(label) : `${label} must be an object.`);
  }
  return parsed;
}

function scriptSpecFromCommand(value) {
  const command = String(value || '').trim();
  return command ? { command } : null;
}

function detectSpecFromForm(form) {
  const commands = String(form.get('detectCommands') || '')
    .split(/\n|,/)
    .map((command) => command.trim())
    .filter(Boolean);
  const versionCommand = String(form.get('versionCommand') || '').trim();
  if (!commands.length && !versionCommand) return null;
  return { commands, versionCommand };
}

function artifactRequiredFor(type, options = {}) {
  type = normalizeType(type);
  if (type === 'cli-tool') return false;
  if (type === 'website-app' && options.websiteKind === 'external') return false;
  return true;
}

function adpRequiredFor(type) {
  type = normalizeType(type);
  return type === 'cli-tool' || type === 'skill';
}

function archiveOptionsFor(type, options = {}) {
  switch (normalizeType(type)) {
    case 'skill':
    case 'plugin':
    case 'agent':
    case 'pet':
    case 'cli-tool':
    case 'website-app':
      return ['zip'];
    case 'sandbox-image':
      return options.sandboxKind === 'container-image' ? ['tar.gz'] : ['zip'];
    default:
      return ['zip'];
  }
}

function defaultArchiveTypeFor(type, options = {}) {
  return archiveOptionsFor(type, options)[0] || 'zip';
}

function savedAdminToken() {
  try {
    return sessionStorage.getItem(adminTokenStorageKey) || '';
  } catch {
    return '';
  }
}

function saveAdminToken(token) {
  try {
    sessionStorage.setItem(adminTokenStorageKey, token);
  } catch {
    // Ignore storage failures; the publish request has already succeeded.
  }
}

function svgDataUri(markup) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}
