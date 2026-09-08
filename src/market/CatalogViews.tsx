// @ts-nocheck
import {
  AlertCircle,
  AlertOctagon,
  Bot,
  Box,
  Brain,
  Calendar,
  Cat,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
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
  MessageCircleMore,
  Pencil,
  Store,
  Star,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { errorMessage, requestJSON } from '../api/client';
import {
  apiBase,
  categoryMeta,
  skillCategoryFilters,
  localized,
  displayType,
  skillKindLabel,
  skillCategoryLabel,
  isSkillPackage,
  marketRoute,
  usageHintsFromMetadata,
} from '../domain/market';
import {
  availablePlatformKeys,
  preferredPlatformKey,
  platformForKey,
  downloadKeyForItem,
  commandEntries,
  hasArtifact,
  canInstallWithADP,
} from '../domain/platform';
import {
  formatCount,
  formatDate,
} from '../shared/formatters';

export function SkillCatalogView({ items, activeSkillCategory, isAuthenticated, locale, t, onDetails, onInstall, onDownload, onFavorite, downloadingKey, favoritingKey }) {
  const packages = items.filter((item) => item.skillKind === 'package');
  const regularSkills = items.filter((item) => item.skillKind !== 'package');
  const categories = (activeSkillCategory === 'all' ? skillCategoryFilters.filter((category) => category !== 'all') : [activeSkillCategory])
    .map((category) => ({
      id: category,
      title: t.skillCuratedTitles[category] || `${t.skillCategories[category] || category} ${t.skillSingle}`,
      items: regularSkills.filter((item) => item.skillCategory === category),
    }))
    .filter((section) => section.items.length);

  const renderCards = (sectionItems, variant = 'skill') => sectionItems.map((item) => (
    <MarketCard
      key={`${item.type}:${item.id}`}
      item={item}
      isAuthenticated={isAuthenticated}
      locale={locale}
      t={t}
      variant={variant}
      onDetails={() => onDetails(item)}
      onInstall={() => onInstall(item)}
      onDownload={() => onDownload(item)}
      onFavorite={() => onFavorite(item)}
      isDownloading={downloadingKey === downloadKeyForItem(item)}
      isFavoriting={favoritingKey === `${item.type}:${item.id}`}
    />
  ));

  return (
    <div className="skill-catalog-layout">
      {packages.length ? (
        <section className="skill-section">
          <div className="skill-section-title">
            <PackageOpen size={18} />
            <h2>{t.skillPackage}</h2>
          </div>
          <div className="skill-package-grid">
            {renderCards(packages, 'package')}
          </div>
        </section>
      ) : null}
      {categories.map((section) => (
        <section className="skill-section" key={section.id}>
          <div className="skill-section-title">
            <Brain size={18} />
            <h2>{section.title}</h2>
          </div>
          <div className="skill-single-grid">
            {renderCards(section.items)}
          </div>
        </section>
      ))}
    </div>
  );
}

export function MarketCard({ item, isAuthenticated, locale, t, onDetails, onInstall, onDownload, onFavorite, isDownloading, isFavoriting, variant = '' }) {
  const category = categoryMeta.find((entry) => entry.id === item.type);
  const Icon = category?.icon || PackageOpen;
  const platform = preferredPlatformKey(item);
  const canDownload = item.type === 'mcp' || hasArtifact(item, platform) || isSkillPackage(item);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  const usageHints = item.type === 'skill' ? usageHintsFromMetadata(item.metadata) : [];
  const usageHintKey = usageHints.join('\u0000');
  const cardRef = useRef(null);
  const [usageHintVisible, setUsageHintVisible] = useState(false);
  const [activeUsageHint, setActiveUsageHint] = useState(0);
  const cardClassName = ['market-card', variant ? `is-${variant}` : ''].filter(Boolean).join(' ');
  const itemName = localized(item.name, locale);
  useEffect(() => {
    if (!usageHints.length) {
      setUsageHintVisible(false);
      return undefined;
    }
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') {
      setUsageHintVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setUsageHintVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(card);
    return () => observer.disconnect();
  }, [usageHintKey]);
  useEffect(() => {
    setActiveUsageHint(0);
    if (!usageHintVisible || usageHints.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveUsageHint((current) => (current + 1) % usageHints.length), 3200);
    return () => window.clearInterval(timer);
  }, [usageHintKey, usageHintVisible]);
  function openCardDetails(event) {
    if (event.target.closest('button, a, input, select, textarea')) return;
    onDetails();
  }
  return (
    <article
      ref={cardRef}
      className={usageHintVisible ? `${cardClassName} is-usage-hint-visible` : cardClassName}
      tabIndex={0}
      aria-label={`${t.details}: ${itemName}`}
      onClick={openCardDetails}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
          event.preventDefault();
          onDetails();
        }
      }}
    >
      <div className="card-body">
        <div className="card-title-row">
          <span className="card-artwork" title={displayType(item.type, t)} aria-label={displayType(item.type, t)}>
            {item.icon ? <img src={item.icon} alt="" /> : <Icon className={category?.colorClass || 'is-muted'} size={18} />}
          </span>
          <h2>
            {itemName}
          </h2>
          <div className="card-head-meta">
            <span className="card-download-stat" title={t.downloads} aria-label={`${t.downloads}: ${formatCount(item.downloads)}`}>
              <Download size={13} />
              <span>{formatCount(item.downloads)}</span>
            </span>
            {isAuthenticated ? (
              <button
                className={item.favorited ? 'card-favorite-action is-active' : 'card-favorite-action'}
                type="button"
                onClick={onFavorite}
                disabled={isFavoriting}
                title={favoriteLabel}
                aria-label={`${favoriteLabel}: ${formatCount(item.favoriteCount)}`}
              >
                <Heart size={13} fill={item.favorited ? 'currentColor' : 'none'} />
                <span>{formatCount(item.favoriteCount)}</span>
              </button>
            ) : (
              <span className="card-favorite-stat" title={t.favorites} aria-label={`${t.favorites}: ${formatCount(item.favoriteCount)}`}>
                <Heart size={13} />
                <span>{formatCount(item.favoriteCount)}</span>
              </span>
            )}
          </div>
        </div>
        <p>{localized(item.description, locale) || t.noDescription}</p>
        {usageHints.length ? <div className="card-usage-hint" aria-label={t.usageHintTitle}><p className="card-usage-hint-text" key={activeUsageHint}><span className="usage-hint-icon" aria-hidden="true"><MessageCircleMore size={16} /></span><span>{usageHints[activeUsageHint]}</span></p></div> : null}
        <div className="card-author">
          <User size={13} />
          <span className="card-author-name" title={`${t.author}: ${item.author}`}>{item.author}</span>
        </div>
      </div>
      <footer className="card-hover-action">
        {isAuthenticated ? (
          <button className="primary-action" type="button" disabled={canInstall ? false : !canDownload || isDownloading} onClick={canInstall ? onInstall : onDownload}>
            {canInstall ? <Copy size={13} /> : <Download size={13} />}
            <span>{canInstall ? t.installWithADP : canDownload ? isDownloading ? t.downloading : t.downloadArtifact : t.noArtifact}</span>
          </button>
        ) : null}
      </footer>
    </article>
  );
}

export function DetailModal({ item, isAuthenticated, locale, t, videoPlaying, selectedPlatformKey, onPlatformChange, onToggleVideo, onClose, onInstall, onDownload, onFavorite, isDownloading, isFavoriting, onCommentsChanged }) {
  const Icon = categoryMeta.find((category) => category.id === item.type)?.icon || PackageOpen;
  const platformKeys = availablePlatformKeys(item);
  const activePlatformKey = preferredPlatformKey(item, selectedPlatformKey);
  const activePlatform = platformForKey(item, activePlatformKey);
  const specificPlatformKeys = platformKeys.filter((platform) => String(platform).toLowerCase() !== 'universal');
  const commands = commandEntries(activePlatform, t);
  const canDownload = item.type === 'mcp' || hasArtifact(item, activePlatformKey) || isSkillPackage(item);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  const readme = localized(item.readme, locale);
  const usageHints = item.type === 'skill' ? usageHintsFromMetadata(item.metadata) : [];
  const localizedFeatures = localized(item.features, locale);
  const features = Array.isArray(localizedFeatures) ? localizedFeatures.filter(Boolean) : [];
  const hasCoreFeatures = Boolean(String(readme || '').trim() || features.length);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-modal" role="dialog" aria-modal="true" aria-label={localized(item.name, locale)} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        <div className="detail-grid">
          <section className="detail-hero">
            <div className="detail-icon"><Icon size={30} /></div>
            <div className="detail-hero-copy">
              <div className="detail-overline">
                <span>{displayType(item.type, t)}</span>
                {item.type === 'skill' ? <span>{skillKindLabel(item.skillKind, t)}</span> : null}
                {item.type === 'skill' ? <span>{skillCategoryLabel(item.skillCategory, t)}</span> : null}
                {item.type === 'skill' && item.skillScenario ? <span>{t.skillScenarios[item.skillScenario] || item.skillScenario}</span> : null}
                {item.type === 'skill' && item.skillLevel ? <span>{t.skillLevels[item.skillLevel] || item.skillLevel}</span> : null}
                {item.type === 'skill' && item.skillFeatured ? <span>{t.skillFeatured}</span> : null}
                {(item.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}
                {specificPlatformKeys.map((platform) => <span key={platform}><Box size={13} />{platform}</span>)}
              </div>
              <div className="detail-heading">
                <h2>{localized(item.name, locale)}</h2>
                <p>{localized(item.description, locale)}</p>
              </div>
              <div className="detail-chip-row">
                <span>{item.version || item.latestVersion || '-'}</span>
                <span><User size={14} />{item.author || t.defaultAuthor}</span>
                <span><Download size={14} />{formatCount(item.downloads)}</span>
                {isAuthenticated ? (
                  <button className={item.favorited ? 'is-active' : ''} type="button" onClick={onFavorite} disabled={isFavoriting} aria-label={`${favoriteLabel}: ${formatCount(item.favoriteCount)}`}>
                    <Heart size={14} fill={item.favorited ? 'currentColor' : 'none'} />{formatCount(item.favoriteCount)}
                  </button>
                ) : <span><Heart size={14} />{formatCount(item.favoriteCount)}</span>}
              </div>
            </div>
          </section>
          <section className="detail-main">
            {item.type !== 'skill' && item.icon ? (
              <div className="media-panel">
                <img src={item.screenshot} alt="" />
              </div>
            ) : null}
            {item.hasVideo ? (
              <button className="video-panel" type="button" onClick={onToggleVideo}>
                <img src={item.videoThumb} alt="" />
                {videoPlaying ? <span className="video-running">{t.videoPlaying}</span> : <span className="play-overlay"><Play size={26} fill="currentColor" /></span>}
              </button>
            ) : null}
            {item.type === 'skill' && item.skillKind !== 'package' ? <SkillMarkdownCard item={item} t={t} /> : hasCoreFeatures ? (
              <section className="readme-section">
                <h3>{localized(item.readmeTitle, locale) || t.readmeFallback}</h3>
                {readme ? <p>{readme}</p> : null}
                {features.length ? <ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}
              </section>
            ) : null}
          </section>

          <section className="detail-side">
            {item.type === 'mcp' ? (
              <section className="side-section">
                <h3>MCP</h3>
                <div className="mcp-detail-facts">
                  <span><strong>{t.mcpSourceLabel}</strong><code>{item.mcpSource === 'custom' ? t.mcpSourceBadgeCustom : t.mcpSourceBadgeGateway}</code></span>
                  {item.mcpServerCode ? (
                    <span><strong>{t.componentId}</strong><code>{item.mcpServerCode}</code></span>
                  ) : null}
                  <span><strong>{t.mcpEndpoint}</strong><code>{item.mcpEndpointUrl}</code></span>
                </div>
                {item.mcpTools?.length ? (
                  <div className="skill-facts">
                    {item.mcpTools.map((tool) => <span key={tool}>{tool}</span>)}
                  </div>
                ) : null}
              </section>
            ) : null}

            {usageHints.length ? (
              <section className="side-section usage-hint-section">
                <h3>{t.usageHintTitle}</h3>
                <ol>{usageHints.map((hint) => <li key={hint}>{hint}</li>)}</ol>
              </section>
            ) : null}

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

          </section>
          <section className="detail-feedback">
            <RatingSection item={item} isAuthenticated={isAuthenticated} t={t} />
            <CommentSection item={item} isAuthenticated={isAuthenticated} locale={locale} t={t} onChanged={onCommentsChanged} />
          </section>
        </div>
        {isAuthenticated ? (
          <footer className="detail-action-bar">
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
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

export function SkillMarkdownCard({ item, t }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ status: 'loading', content: '', error: '' });
  useEffect(() => {
    const controller = new AbortController();
    requestJSON(`${apiBase}/skills/${encodeURIComponent(item.id)}/skill-md`, { signal: controller.signal })
      .then((data) => setState({ status: 'ready', content: String(data?.content || ''), error: '' }))
      .catch((reason) => reason?.name !== 'AbortError' && setState({ status: 'error', content: '', error: errorMessage(reason) }));
    return () => controller.abort();
  }, [item.id, item.version]);
  const readableContent = stripMarkdownFrontMatter(state.content);
  return (
    <section className={expanded ? 'skill-md-card is-expanded' : 'skill-md-card'}>
      <div className="skill-md-content">
        {state.status === 'loading' ? <p>{t.skillMdLoading}</p> : null}
        {state.error ? <p className="comment-error">{t.skillMdFailed(state.error)}</p> : null}
        {state.status === 'ready' ? (
          readableContent ? (
            <div className="skill-md-document">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
                }}
              >
                {readableContent}
              </ReactMarkdown>
            </div>
          ) : <p>{t.skillMdEmpty}</p>
        ) : null}
      </div>
      {state.status === 'ready' && readableContent ? <button className="skill-md-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? t.collapse : t.expand}<ChevronDown size={15} /></button> : null}
    </section>
  );
}

export function stripMarkdownFrontMatter(content) {
  const source = String(content || '').replace(/^\uFEFF/, '');
  if (!/^---[ \t]*\r?\n/.test(source)) return source;
  const closingFence = source.match(/\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/);
  if (!closingFence || closingFence.index === undefined) return source;
  return source.slice(closingFence.index + closingFence[0].length).replace(/^\s+/, '');
}

export function RatingSection({ item, isAuthenticated, t }) {
  const empty = { average: 0, total: 0, counts: [0, 0, 0, 0, 0], myRating: 0, canRate: false };
  const [summary, setSummary] = useState(empty);
  const [hovered, setHovered] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const route = marketRoute(item.type);
  const load = useCallback(() => requestJSON(`${apiBase}/${route}/${encodeURIComponent(item.id)}/rating`).then((data) => setSummary({ ...empty, ...data, counts: Array.isArray(data?.counts) ? data.counts : empty.counts })).catch((reason) => setError(t.ratingFailed(errorMessage(reason)))), [item.id, route, t]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const downloaded = (event) => { if (event.detail?.type === item.type && event.detail?.id === item.id) setSummary((current) => ({ ...current, canRate: true })); };
    window.addEventListener('market:downloaded', downloaded);
    return () => window.removeEventListener('market:downloaded', downloaded);
  }, [item.id, item.type]);
  async function rate(value) {
    if (!isAuthenticated || !summary.canRate || saving) return;
    setSaving(true); setError('');
    try {
      const updated = await requestJSON(`${apiBase}/${route}/${encodeURIComponent(item.id)}/rating`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rating: value }) });
      setSummary({ ...empty, ...updated, counts: updated.counts || empty.counts });
    } catch (reason) { setError(reason?.status === 403 ? t.ratingDownloadRequired : t.ratingFailed(errorMessage(reason))); }
    finally { setSaving(false); }
  }
  const max = Math.max(1, ...summary.counts);
  const active = hovered || summary.myRating;
  return (
    <section className="rating-section">
      <div className="rating-heading"><div><span>{t.ratingEyebrow}</span><h3>{t.ratingTitle}</h3></div><p>{t.ratingCount(summary.total)}</p></div>
      <div className="rating-overview">
        <div className="rating-score"><strong className={summary.total ? '' : 'is-empty'}>{summary.total ? Number(summary.average).toFixed(1) : t.ratingNone}</strong><div className="rating-static-stars">{[1,2,3,4,5].map((star) => <Star key={star} fill={star <= Math.round(summary.average) ? 'currentColor' : 'none'} />)}</div></div>
        <div className="rating-bars">{[5,4,3,2,1].map((star) => <div key={star}><span>{star} {t.starUnit}</span><i><b style={{ width: `${(summary.counts[star - 1] / max) * 100}%` }} /></i><small>{summary.counts[star - 1]}</small></div>)}</div>
      </div>
      <div className="rating-action"><strong>{summary.myRating ? t.ratingYours : t.ratingPrompt}</strong><div role="group" aria-label={t.ratingTitle} onMouseLeave={() => setHovered(0)}>{[1,2,3,4,5].map((star) => <button key={star} type="button" aria-label={t.rateStar(star)} disabled={!isAuthenticated || !summary.canRate || saving} onMouseEnter={() => setHovered(star)} onFocus={() => setHovered(star)} onClick={() => rate(star)}><Star fill={star <= active ? 'currentColor' : 'none'} /></button>)}</div></div>
      {!isAuthenticated ? <p className="rating-hint">{t.ratingLoginRequired}</p> : !summary.canRate ? <p className="rating-hint">{t.ratingDownloadRequired}</p> : null}
      {error ? <p className="comment-error">{error}</p> : null}
    </section>
  );
}

export function CommentSection({ item, isAuthenticated, locale, t, onChanged }) {
  const [state, setState] = useState({ status: 'loading', comments: [], summary: { total: 0, positive: 0, negative: 0, positiveRate: 0 }, error: '' });
  const [content, setContent] = useState('');
  const [editingID, setEditingID] = useState(0);
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const route = marketRoute(item.type);

  const loadComments = useCallback(async (signal) => {
    try {
      const data = await requestJSON(`${apiBase}/${route}/${encodeURIComponent(item.id)}/comments?limit=100`, { signal });
      setState({ status: 'ready', comments: Array.isArray(data.comments) ? data.comments : [], summary: data.summary || {}, error: '' });
    } catch (reason) {
      if (reason?.name !== 'AbortError') setState((current) => ({ ...current, status: 'error', error: errorMessage(reason) }));
    }
  }, [item.id, route]);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    loadComments(controller.signal);
    return () => controller.abort();
  }, [loadComments]);

  function beginEdit(comment) {
    setEditingID(comment.id);
    setContent(comment.content);
    setComposerOpen(true);
  }

  function cancelEdit() {
    setEditingID(0);
    setContent('');
    setRating(0);
    setHoveredRating(0);
    setComposerOpen(false);
  }

  async function submitComment(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const suffix = editingID ? `/${editingID}` : '';
      await requestJSON(`${apiBase}/${route}/${encodeURIComponent(item.id)}/comments${suffix}`, {
        method: editingID ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sentiment: rating && rating < 3 ? 'negative' : 'positive', content }),
      });
      if (rating) {
        await requestJSON(`${apiBase}/${route}/${encodeURIComponent(item.id)}/rating`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ rating }),
        });
      }
      cancelEdit();
      await loadComments();
      await onChanged?.();
    } catch (reason) {
      setState((current) => ({ ...current, error: t.commentFailed(errorMessage(reason)) }));
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment(comment) {
    if (!window.confirm(t.commentDeleteConfirm)) return;
    try {
      await requestJSON(`${apiBase}/${route}/${encodeURIComponent(item.id)}/comments/${comment.id}`, { method: 'DELETE' });
      await loadComments();
      await onChanged?.();
    } catch (reason) {
      setState((current) => ({ ...current, error: t.commentFailed(errorMessage(reason)) }));
    }
  }

  const summary = state.summary || {};
  if (state.status === 'ready' && !state.comments.length && !isComposerOpen && !state.error) {
    return isAuthenticated ? (
      <button className="comment-empty-trigger" type="button" onClick={() => setComposerOpen(true)}>
        <MessageSquare size={15} />
        <span>{t.commentStart}</span>
      </button>
    ) : null;
  }
  return (
    <section className="comment-section">
      <div className="comment-heading">
        <h3><MessageSquare size={16} />{t.commentTitle}</h3>
        <div className="comment-summary">
          <span>{t.comments} <strong>{formatCount(summary.total)}</strong></span>
        </div>
        {isAuthenticated ? <button className="comment-composer-toggle" type="button" onClick={() => isComposerOpen ? cancelEdit() : setComposerOpen(true)}><MessageSquare size={14} />{isComposerOpen ? t.commentCancelEdit : t.commentStart}</button> : null}
      </div>
      {isAuthenticated && isComposerOpen ? (
        <form className="comment-form" onSubmit={submitComment}>
          <div className="comment-rating-control" role="group" aria-label={t.ratingTitle} onMouseLeave={() => setHoveredRating(0)}>
            <span>{t.ratingTitle}</span>
            {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={t.rateStar(star)} onMouseEnter={() => setHoveredRating(star)} onFocus={() => setHoveredRating(star)} onClick={() => setRating(star)}><Star fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'} /></button>)}
          </div>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={5} maxLength={1000} required placeholder={t.commentPlaceholder} />
          <div className="comment-form-actions">
            <button className="secondary-action" type="button" onClick={cancelEdit}>{t.commentCancelEdit}</button>
            <button className="primary-action" type="submit" disabled={saving || content.trim().length < 5}>{editingID ? t.commentUpdate : t.commentSubmit}</button>
          </div>
        </form>
      ) : !isAuthenticated ? <p className="comment-login-hint">{t.commentLoginHint}</p> : null}
      {state.error ? <p className="comment-error">{state.error}</p> : null}
      {state.status === 'loading' ? <p className="comment-empty">{t.commentLoading}</p> : null}
      {state.status === 'ready' && !state.comments.length && !isComposerOpen ? <p className="comment-empty">{t.commentEmpty}</p> : null}
      <div className="comment-list">
        {state.comments.map((comment) => (
          <article className="comment-row" key={comment.id}>
            <div className="comment-row-head">
              <strong>{comment.author}</strong>
              <time>{formatDate(comment.createdAt, locale)}</time>
            </div>
            <p>{comment.content}</p>
            {comment.mine ? <div className="comment-actions"><button type="button" onClick={() => beginEdit(comment)}><Pencil size={13} />{t.commentEdit}</button><button type="button" onClick={() => deleteComment(comment)}><Trash2 size={13} />{t.commentDelete}</button></div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
