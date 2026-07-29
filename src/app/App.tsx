// @ts-nocheck -- legacy controller types are being tightened feature-by-feature.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppSurface } from './AppSurface';
import { errorMessage, requestJSON } from '../api/client';
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
  LogIn,
  LogOut,
  Moon,
  PackageOpen,
  Play,
  Plus,
  Puzzle,
  RefreshCw,
  Search,
  Shapes,
  ShieldCheck,
  Sun,
  Terminal,
  Trash2,
  Upload,
  User,
  BarChart3,
  ListChecks,
  MessageSquare,
  Pencil,
  Store,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { selectedFormFile } from '../fileInputs';
import { reportDetailView, selectDetailOpener } from '../detailViews';

import { AdminCenter } from '../admin/AdminCenter';
import { CreatorCenter } from '../creator/CreatorCenter';
import { DetailModal, MarketCard, SkillCatalogView } from '../market/CatalogViews';
import { MarketPage } from '../market/MarketPage';
import { PublishPage } from '../publishing/PublishPage';
import { Toast } from '../shared/Feedback';
import { getMarketCopy } from '../i18n/marketCopy';
import {
  apiBase,
  canonicalTypes,
  marketBrand,
  sidebarCategoryMeta,
  skillCategoryFilters,
  mergeCatalogItem,
  normalizeType,
  localized,
  marketRoute,
} from '../domain/market';
import {
  canonicalVersion,
  compareSemanticVersionStrings,
  formatVersionLabel,
} from '../domain/version';
import {
  preferredPlatformKey,
  downloadKeyForItem,
  platformDependencies,
  hasArtifact,
  triggerBrowserDownload,
  adpInstallCommand,
} from '../domain/platform';
import {
  artifactRequiredFor,
  defaultArchiveTypeFor,
  detectSpecFromForm,
  parseIncludedSkills,
  parseJSONField,
  parseTags,
  scriptSpecFromCommand,
} from '../domain/publishing';
import {
  parseCount,
  dateValue,
} from '../shared/formatters';
import { initialTheme } from '../shared/theme';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en-US' ? 'en-US' : 'zh-CN';
  const categoryMatch = matchPath('/category/:type', location.pathname);
  const skillMatch = matchPath('/skills/:category', location.pathname);
  const publishMatch = matchPath('/publish/:type/:id', location.pathname);
  const activeCategory = skillMatch ? 'skill' : categoryMatch?.params.type || 'all';
  const activeSkillCategory = skillMatch?.params.category || 'all';
  const isPublishOpen = location.pathname === '/publish' || Boolean(publishMatch);
  const isCreatorOpen = location.pathname === '/creator';
  const isAdminOpen = location.pathname === '/admin';
  const [apiItems, setApiItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('popular');
  const [theme, setTheme] = useState(initialTheme);
  const [selected, setSelected] = useState(null);
  const [selectedPlatformKey, setSelectedPlatformKey] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [toast, setToast] = useState(null);
  const [publishSource, setPublishSource] = useState(null);
  const [isPublishing, setPublishing] = useState(false);
  const [authSession, setAuthSession] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');
  const [creatorItems, setCreatorItems] = useState([]);
  const [creatorItemsStatus, setCreatorItemsStatus] = useState('idle');
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [adminItems, setAdminItems] = useState([]);
  const [adminComments, setAdminComments] = useState([]);
  const [isLoadingAdminReviews, setLoadingAdminReviews] = useState(false);
  const [moderatingCommentID, setModeratingCommentID] = useState(0);
  const [reviewingKey, setReviewingKey] = useState('');
  const [unpublishingKey, setUnpublishingKey] = useState('');
  const [downloadingKey, setDownloadingKey] = useState('');
  const [favoritingKey, setFavoritingKey] = useState('');
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const t = getMarketCopy(
    locale,
    (key, fallback, values) => i18n.t(`market.${key}`, {
      lng: locale,
      defaultValue: fallback,
      ...values,
    }),
  );
  const isAuthenticated = Boolean(authSession?.user?.id);
  const userRoleLabel = authSession?.user?.role === 'admin' ? t.loginAsAdmin : t.loginAsCreator;
  const userDisplayName = authSession?.user?.name
    || authSession?.user?.username
    || authSession?.user?.id
    || userRoleLabel;
  const userInitial = Array.from(String(userDisplayName).trim())[0]?.toUpperCase() || 'U';

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;
    const closeOnOutsidePress = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isUserMenuOpen]);

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

  const loadCreatorItems = useCallback(async (signal, sessionOverride = null) => {
    const session = sessionOverride || authSession;
    if (!session?.user?.id) {
      setCreatorItems([]);
      setCreatorItemsStatus('ready');
      return { ok: false, reason: 'missing-token' };
    }
    setCreatorItemsStatus('loading');
    try {
      const data = await requestJSON(`${apiBase}/creator/items`, {
        signal,
      });
      setCreatorItems(Array.isArray(data.items) ? data.items : []);
      setCreatorItemsStatus('ready');
      return { ok: true };
    } catch (reason) {
      if (reason?.name === 'AbortError') return { ok: false, reason };
      setCreatorItems([]);
      setCreatorItemsStatus('error');
      return { ok: false, reason };
    }
  }, [authSession]);

  const loadAdminReviews = useCallback(async (signal, sessionOverride = null) => {
    const session = sessionOverride || authSession;
    if (!session?.user?.id || session.user?.role !== 'admin') {
      setAdminItems([]);
      return { ok: false, reason: 'missing-token' };
    }
    try {
      const data = await requestJSON(`${apiBase}/admin/reviews?status=pending`, {
        signal,
      });
      setAdminItems(Array.isArray(data.items) ? data.items : []);
      return { ok: true };
    } catch (reason) {
      if (reason?.name === 'AbortError') return { ok: false, reason };
      setAdminItems([]);
      return { ok: false, reason };
    }
  }, [authSession]);

  const loadFavoriteItems = useCallback(async (signal, sessionOverride = null) => {
    const session = sessionOverride || authSession;
    if (!session?.user?.id) {
      setFavoriteItems([]);
      return { ok: false, reason: 'missing-user' };
    }
    try {
      const data = await requestJSON(`${apiBase}/me/favorites`, { signal });
      setFavoriteItems(Array.isArray(data.items) ? data.items : []);
      return { ok: true };
    } catch (reason) {
      if (reason?.name === 'AbortError') return { ok: false, reason };
      setFavoriteItems([]);
      return { ok: false, reason };
    }
  }, [authSession]);

  const loadAdminComments = useCallback(async (signal, sessionOverride = null) => {
    const session = sessionOverride || authSession;
    if (!session?.user?.id || session.user?.role !== 'admin') {
      setAdminComments([]);
      return;
    }
    try {
      const data = await requestJSON(`${apiBase}/admin/comments?limit=500`, { signal });
      setAdminComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (reason) {
      if (reason?.name !== 'AbortError') setAdminComments([]);
    }
  }, [authSession]);

  const handleLoadAdminReviews = useCallback(async () => {
    if (!authSession?.user?.id || authSession.user?.role !== 'admin') {
      notify(t.adminOnly, 'error');
      return;
    }
    setLoadingAdminReviews(true);
    try {
      const [result] = await Promise.all([
        loadAdminReviews(undefined, authSession),
        loadAdminComments(undefined, authSession),
      ]);
      if (result.ok) {
        await loadCatalog();
        notify(t.reviewLoadSuccess, 'success');
      } else {
        notify(t.reviewLoadFailed(errorMessage(result.reason)), 'error');
      }
    } catch {
      notify(t.reviewLoadFailed('unknown error'), 'error');
    } finally {
      setLoadingAdminReviews(false);
    }
  }, [authSession, loadAdminComments, loadAdminReviews, loadCatalog, t]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('zenmind-market:theme', theme);
  }, [theme]);

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal);
    return () => controller.abort();
  }, [loadCatalog]);

  useEffect(() => {
    const controller = new AbortController();
    requestJSON(`${apiBase}/auth/me`, { signal: controller.signal })
      .then((data) => {
        if (data?.user?.id) setAuthSession({ user: data.user });
      })
      .catch((reason) => {
        if (reason?.name !== 'AbortError') setAuthSession(null);
      })
      .finally(() => setAuthStatus('ready'));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadCatalog();
  }, [isAuthenticated, loadCatalog]);

  useEffect(() => {
    if (!isCreatorOpen && !publishMatch) return undefined;
    const controller = new AbortController();
    loadCreatorItems(controller.signal);
    loadFavoriteItems(controller.signal);
    return () => controller.abort();
  }, [isCreatorOpen, loadCreatorItems, loadFavoriteItems, publishMatch?.params.id, publishMatch?.params.type]);

  useEffect(() => {
    if (!isAdminOpen || authSession?.user?.role !== 'admin') return undefined;
    const controller = new AbortController();
    loadAdminReviews(controller.signal);
    loadAdminComments(controller.signal);
    return () => controller.abort();
  }, [isAdminOpen, authSession, loadAdminComments, loadAdminReviews]);

  const catalog = useMemo(() => {
    return apiItems.map((item) => mergeCatalogItem(item));
  }, [apiItems]);

  useEffect(() => {
    if (categoryMatch && !canonicalTypes.includes(categoryMatch.params.type)) {
      navigate('/', { replace: true });
      return;
    }
    if (skillMatch && !skillCategoryFilters.includes(skillMatch.params.category)) {
      navigate('/category/skill', { replace: true });
    }
  }, [categoryMatch?.params.type, navigate, skillMatch?.params.category]);

  const creatorCatalog = useMemo(() => {
    return creatorItems.map((item) => mergeCatalogItem(item));
  }, [creatorItems]);

  useEffect(() => {
    if (!publishMatch) return;
    const type = normalizeType(publishMatch.params.type);
    const source = [...creatorCatalog, ...catalog].find(
      (entry) => entry.type === type && entry.id === publishMatch.params.id,
    );
    if (source) {
      setPublishSource(source);
    } else if (status === 'ready' && creatorItemsStatus === 'ready') {
      navigate('/creator', { replace: true });
    }
  }, [catalog, creatorCatalog, creatorItemsStatus, navigate, publishMatch?.params.id, publishMatch?.params.type, status]);

  const favoriteCatalog = useMemo(() => {
    return favoriteItems.map((item) => mergeCatalogItem(item));
  }, [favoriteItems]);

  const publishableSkills = useMemo(() => {
    return catalog.filter((item) => item.type === 'skill' && item.skillKind !== 'package');
  }, [catalog]);

  const adminReviewCatalog = useMemo(() => {
    return adminItems.map((item) => mergeCatalogItem(item));
  }, [adminItems]);

  const categoryCounts = useMemo(() => {
    const counts = { all: catalog.length };
    for (const type of canonicalTypes) counts[type] = catalog.filter((item) => item.type === type).length;
    return counts;
  }, [catalog]);

  const skillCounts = useMemo(() => {
    const skills = catalog.filter((item) => item.type === 'skill');
    const categories = { all: skills.length };
    for (const category of skillCategoryFilters) categories[category] = category === 'all' ? skills.length : 0;
    for (const item of skills) {
      categories[item.skillCategory] = (categories[item.skillCategory] || 0) + 1;
    }
    return { categories };
  }, [catalog]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = catalog.filter((item) => {
      if (activeCategory !== 'all' && item.type !== activeCategory) return false;
      if (activeCategory === 'skill') {
        if (activeSkillCategory !== 'all' && item.skillCategory !== activeSkillCategory) return false;
      }
      if (!needle) return true;
      return [
        item.id,
        localized(item.name, locale),
        localized(item.description, locale),
        item.author,
        item.skillKind,
        item.skillCategory,
        item.skillScenario,
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
  }, [activeCategory, activeSkillCategory, catalog, locale, query, sortMode]);

  const currentCategoryName = activeCategory === 'all' ? t.all : t.categories[activeCategory];
  const emptyCopy = catalog.length === 0
    ? { title: t.emptyCatalogTitle, body: t.emptyCatalogBody }
    : { title: t.emptyTitle, body: t.emptyBody };
  const brandTitle = localized(marketBrand.name, locale);

  function notify(message, tone = 'info') {
    const id = window.setTimeout(() => setToast(null), 3000);
    setToast({ message, tone, id });
  }

  function startLogin() {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const returnTo = currentPath.startsWith('/market') ? currentPath : '/market/';
    window.location.assign(`/login?return_to=${encodeURIComponent(returnTo)}`);
  }

  async function handleLogout() {
    setUserMenuOpen(false);
    try {
      await requestJSON('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthSession(null);
      window.location.assign('/login?return_to=%2Fmarket%2F');
    }
  }

  function chooseCategory(category) {
    navigate(category === 'all' ? '/' : `/category/${encodeURIComponent(category)}`);
  }

  function openDetails(item) {
    setSelected(item);
    setSelectedPlatformKey(preferredPlatformKey(item));
    setVideoPlaying(false);
  }

  function handleOpenMarketDetails(item) {
    openDetails(item);
    void reportDetailView({
      apiBase,
      route: marketRoute(item.type),
      id: item.id,
      requestJSON,
    });
  }

  const detailSurface = isAdminOpen ? 'admin' : isCreatorOpen ? 'creator' : 'market';
  const openDetailsForSurface = selectDetailOpener(detailSurface, {
    market: handleOpenMarketDetails,
    plain: openDetails,
  });

  function closeDetails() {
    setSelected(null);
    setSelectedPlatformKey('');
    setVideoPlaying(false);
  }

  function closePublish() {
    const background = location.state?.background;
    setPublishSource(null);
    navigate(typeof background === 'string' ? background : '/');
  }

  async function handleDownload(item, platformOverride = '') {
    if (!item || downloadingKey) return;
    if (item.type === 'skill' && item.skillKind === 'package') {
      const key = `${item.type}:${item.id}:package`;
      setDownloadingKey(key);
      try {
        triggerBrowserDownload(`${apiBase}/skills/${encodeURIComponent(item.id)}/package/download`);
        notify(t.downloadStarted(localized(item.name, locale) || item.id), 'success');
      } catch (reason) {
        notify(t.downloadFailed(errorMessage(reason)), 'error');
      } finally {
        setDownloadingKey('');
      }
      return;
    }
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
      if (isCreatorOpen) await loadFavoriteItems();
    } catch (reason) {
      if (reason?.status === 401) {
        notify(t.favoriteAuthRequired, 'error');
        startLogin();
      } else {
        notify(t.favoriteFailed(errorMessage(reason)), 'error');
      }
    } finally {
      setFavoritingKey('');
    }
  }

  async function handleReviewUpdate(item, status, suppliedNote) {
    if (!item || reviewingKey) return false;
    if (!authSession?.user?.id || authSession.user?.role !== 'admin') {
      notify(t.adminOnly, 'error');
      return false;
    }
    let note = typeof suppliedNote === 'string' ? suppliedNote.trim() : '';
    if (status === 'rejected' && suppliedNote === undefined) {
      note = window.prompt(t.reviewNotePrompt, item.reviewNote || '') || '';
    }
    if (status === 'rejected' && !note) {
      notify(t.reviewRejectReasonRequired, 'error');
      return false;
    }
    const key = `${item.type}:${item.id}`;
    setReviewingKey(key);
    try {
      await requestJSON(`${apiBase}/admin/reviews/${encodeURIComponent(item.type)}/${encodeURIComponent(item.id)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      await loadCatalog();
      await loadCreatorItems(undefined, authSession);
      await loadAdminReviews(undefined, authSession);
      notify(t.reviewUpdateSuccess, 'success');
      return true;
    } catch (reason) {
      notify(t.reviewUpdateFailed(errorMessage(reason)), 'error');
      return false;
    } finally {
      setReviewingKey('');
    }
  }

  async function handleUnpublishLatest(item) {
    if (!item || unpublishingKey) return;
    if (!authSession?.user?.id || authSession.user?.role !== 'admin') {
      notify(t.adminOnly, 'error');
      return;
    }
    const version = item.latestVersion || item.version;
    if (!version) {
      notify(t.adminUnpublishFailed('missing latest version'), 'error');
      return;
    }
    const name = localized(item.name, locale) || item.id;
    if (!window.confirm(t.adminUnpublishConfirm(name, formatVersionLabel(version)))) return;

    const key = `${item.type}:${item.id}`;
    setUnpublishingKey(key);
    try {
      await requestJSON(`${apiBase}/admin/unpublish`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: item.type, id: item.id, version }),
      });
      await Promise.all([
        loadCatalog(),
        loadAdminReviews(undefined, authSession),
      ]);
      notify(t.adminUnpublishSuccess, 'success');
    } catch (reason) {
      notify(t.adminUnpublishFailed(errorMessage(reason)), 'error');
    } finally {
      setUnpublishingKey('');
    }
  }

  async function handleModerateComment(comment) {
    if (!comment || moderatingCommentID) return;
    setModeratingCommentID(comment.id);
    try {
      await requestJSON(`${apiBase}/admin/comments/${comment.id}/moderate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: comment.status === 'hidden' ? 'visible' : 'hidden' }),
      });
      await Promise.all([
        loadAdminComments(undefined, authSession),
        loadCatalog(),
        loadCreatorItems(undefined, authSession),
      ]);
    } catch (reason) {
      notify(t.commentFailed(errorMessage(reason)), 'error');
    } finally {
      setModeratingCommentID(0);
    }
  }

  async function handlePublish(event) {
    event.preventDefault();
    if (isPublishing) return;
    const formElement = event.currentTarget;
    setPublishing(true);
    try {
      const form = new FormData(formElement);
      const type = normalizeType(form.get('type'));
      const id = String(form.get('id') || '').trim().toLowerCase();
      const name = String(form.get('name') || '').trim();
      const version = canonicalVersion(form.get('version')) || '1.0.0';
      if (publishSource && compareSemanticVersionStrings(version, publishSource.version) <= 0) {
        notify(t.publishVersionMustAdvance(formatVersionLabel(publishSource.version)), 'error');
        return;
      }
      const description = String(form.get('description') || '').trim();
      const artifact = selectedFormFile(formElement, form, 'artifact');
      const hasSelectedArtifact = Boolean(artifact);
      const image = selectedFormFile(formElement, form, 'image');
      const hasSelectedImage = Boolean(image);
      const adpManifest = selectedFormFile(formElement, form, 'adpManifest');
      const hasSelectedADPManifest = Boolean(adpManifest);
      const skillKind = type === 'skill' && form.get('skillKind') === 'package' ? 'package' : 'single';
      const skill = type === 'skill' ? {
        kind: skillKind,
        category: String(form.get('skillCategory') || 'other').trim(),
        scenario: String(form.get('skillScenario') || 'productivity').trim(),
        level: String(form.get('skillLevel') || 'beginner').trim(),
        packageMode: skillKind === 'package' ? 'collection' : '',
        featured: form.get('skillFeatured') === 'on',
        includedSkills: parseIncludedSkills(form.getAll('includedSkills')),
      } : null;
      if (skill?.kind === 'package' && !skill.includedSkills.length) {
        notify(t.includedSkillsRequired, 'error');
        return;
      }
      if (!isAuthenticated) {
        notify(t.loginRequired, 'error');
        startLogin();
        return;
      }
      if (artifactRequiredFor(type, { websiteKind: String(form.get('websiteKind') || '').trim(), skill }) && !hasSelectedArtifact) {
        notify(t.artifactRequired, 'error');
        return;
      }
      let platformMetadata;
      let platformDependencies;
      let existingMetadata;
      try {
        platformMetadata = parseJSONField(form.get('platformMetadata'), {}, t.platformMetadata, 'object', t.invalidJSON);
        platformDependencies = parseJSONField(form.get('platformDependencies'), [], t.platformDependencies, 'array', t.invalidJSON);
        existingMetadata = parseJSONField(form.get('existingMetadata'), {}, t.publishBasicInfo, 'object', t.invalidJSON);
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
        metadata: existingMetadata,
        dependencies: platformDependencies,
        platform,
        reviewStatus: 'pending',
      };
      if (skill) metadata.skill = skill;
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

      if (hasSelectedArtifact || hasSelectedImage) {
        const body = new FormData();
        body.append('metadata', JSON.stringify(metadata));
        if (hasSelectedArtifact) body.append('artifact', artifact);
        if (hasSelectedImage) body.append('image', image);
        if (hasSelectedADPManifest) body.append('adp', adpManifest);
        await requestJSON(authSession.user?.role === 'admin' ? `${apiBase}/admin/${marketRoute(type)}/publish` : `${apiBase}/creator/publish`, {
          method: 'POST',
          body,
        });
      } else {
        await requestJSON(authSession.user?.role === 'admin' ? `${apiBase}/admin/${marketRoute(type)}/publish` : `${apiBase}/creator/publish`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(metadata),
        });
      }
      await loadCatalog();
      await loadCreatorItems(undefined, authSession);
      if (authSession.user?.role === 'admin') await loadAdminReviews(undefined, authSession);
      navigate(`/category/${type}`);
      navigate('/');
      setPublishSource(null);
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
        <a className="brand" href={import.meta.env.BASE_URL} aria-label={brandTitle}>
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
          <button className="language-button" type="button" onClick={() => void i18n.changeLanguage(locale === 'zh-CN' ? 'en-US' : 'zh-CN')} title={t.languageToggle} aria-label={t.languageToggle}>
            <Languages size={15} />
            <span>{locale === 'zh-CN' ? '中' : 'EN'}</span>
          </button>
          {!authSession ? (
            <button className="language-button" type="button" onClick={startLogin}>
              <LogIn size={15} />
              <span>{t.login}</span>
            </button>
          ) : null}
          {authSession?.user?.role === 'admin' ? (
            <button className="creator-button" type="button" onClick={() => navigate(isAdminOpen ? '/' : '/admin')}>
              <ShieldCheck size={15} />
              <span>{isAdminOpen ? t.backToMarket : t.adminReviewEntry}</span>
            </button>
          ) : null}
          {isAuthenticated ? (
            <>
              <button
                className="creator-button"
                type="button"
                onClick={() => navigate(isCreatorOpen ? '/' : '/creator')}
              >
                {isCreatorOpen ? <Store size={15} /> : <User size={15} />}
                <span>{isCreatorOpen ? t.backToMarket : t.creatorCenter}</span>
              </button>
              <button
                className="publish-button"
                type="button"
                onClick={() => {
                  setPublishSource(null);
                  navigate('/publish', { state: { background: location.pathname } });
                }}
              >
                <Plus size={15} />
                <span>{t.publish}</span>
              </button>
            </>
          ) : null}
          {authSession ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-avatar-button"
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label={`${userDisplayName}, ${userRoleLabel}`}
                title={userDisplayName}
              >
                <span>{userInitial}</span>
              </button>
              {isUserMenuOpen ? (
                <div className="user-menu-popover" role="menu" aria-label={userDisplayName}>
                  <div className="user-menu-profile">
                    <span className="user-menu-avatar" aria-hidden="true">{userInitial}</span>
                    <div>
                      <strong title={userDisplayName}>{userDisplayName}</strong>
                      <span>{userRoleLabel}</span>
                    </div>
                  </div>
                  <button className="user-menu-logout" type="button" role="menuitem" onClick={handleLogout}>
                    <LogOut size={15} />
                    <span>{t.logout}</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <AppSurface
        publishing={authStatus === 'loading' ? null : isAuthenticated ? (
          <PublishPage
            key={publishSource ? `${publishSource.type}:${publishSource.id}` : 'new'}
            t={t}
            locale={locale}
            availableSkills={publishableSkills}
            initialItem={publishSource}
            onClose={closePublish}
            onSubmit={handlePublish}
            isPublishing={isPublishing}
          />
        ) : <Navigate to="/" replace />}
        admin={authStatus === 'loading' ? null : authSession?.user?.role === 'admin' ? (
          <AdminCenter
            pendingItems={adminReviewCatalog}
            publishedItems={catalog}
            comments={adminComments}
            locale={locale}
            t={t}
            onBack={() => navigate('/')}
            onPublish={() => {
              setPublishSource(null);
              navigate('/publish', { state: { background: '/admin' } });
            }}
            onDetails={openDetailsForSurface}
            onReview={handleReviewUpdate}
            reviewingKey={reviewingKey}
            onUnpublishLatest={handleUnpublishLatest}
            unpublishingKey={unpublishingKey}
            onLoadAdminReviews={handleLoadAdminReviews}
            isLoadingAdminReviews={isLoadingAdminReviews}
            onModerateComment={handleModerateComment}
            moderatingCommentID={moderatingCommentID}
          />
        ) : <Navigate to="/" replace />}
        creator={authStatus === 'loading' ? null : isAuthenticated ? (
          <CreatorCenter
            mode="creator"
            items={creatorCatalog}
            favoriteItems={favoriteCatalog}
            authSession={authSession}
            locale={locale}
            t={t}
            onBack={() => navigate('/')}
            onPublish={() => {
              setPublishSource(null);
              navigate('/publish', { state: { background: '/creator' } });
            }}
            onPublishVersion={(item) => {
              setPublishSource(item);
              navigate(`/publish/${encodeURIComponent(item.type)}/${encodeURIComponent(item.id)}`, {
                state: { background: '/creator' },
              });
            }}
            onDetails={openDetailsForSurface}
            onReview={null}
            reviewingKey={reviewingKey}
          />
        ) : <Navigate to="/" replace />}
        market={(
          <MarketPage
          activeCategory={activeCategory}
          activeSkillCategory={activeSkillCategory}
          categories={sidebarCategoryMeta}
          categoryCounts={categoryCounts}
          currentCategoryName={currentCategoryName}
          emptyCopy={emptyCopy}
          filtered={filtered}
          isAuthenticated={isAuthenticated}
          locale={locale}
          skillCategories={skillCategoryFilters}
          skillCounts={skillCounts.categories}
          sortMode={sortMode}
          status={status}
          error={error}
          t={t}
          onCategoryChange={chooseCategory}
          onSkillCategoryChange={(category) => navigate(category === 'all' ? '/category/skill' : `/skills/${encodeURIComponent(category)}`)}
          onSortModeChange={setSortMode}
          renderCatalog={() => activeCategory === 'skill' ? (
            <SkillCatalogView
              items={filtered}
              activeSkillCategory={activeSkillCategory}
              isAuthenticated={isAuthenticated}
              locale={locale}
              t={t}
              onDetails={openDetailsForSurface}
              onInstall={handleInstall}
              onDownload={handleDownload}
              onFavorite={handleFavorite}
              downloadingKey={downloadingKey}
              favoritingKey={favoritingKey}
            />
          ) : (
            <div className="catalog-grid">
              {filtered.map((item) => (
                <MarketCard
                  key={`${item.type}:${item.id}`}
                  item={item}
                  isAuthenticated={isAuthenticated}
                  locale={locale}
                  t={t}
                  onDetails={() => openDetailsForSurface(item)}
                  onInstall={() => handleInstall(item)}
                  onDownload={() => handleDownload(item)}
                  onFavorite={() => handleFavorite(item)}
                  isDownloading={downloadingKey === downloadKeyForItem(item)}
                  isFavoriting={favoritingKey === `${item.type}:${item.id}`}
                />
              ))}
            </div>
          )}
          />
        )}
      />

      {selected ? (
        <DetailModal
          item={selected}
          isAuthenticated={isAuthenticated}
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
          isDownloading={downloadingKey === downloadKeyForItem(selected, selectedPlatformKey)}
          isFavoriting={favoritingKey === `${selected.type}:${selected.id}`}
          onCommentsChanged={() => Promise.all([loadCatalog(), loadCreatorItems(undefined, authSession)])}
        />
      ) : null}

      {toast ? <Toast toast={toast} /> : null}
    </main>
  );
}
