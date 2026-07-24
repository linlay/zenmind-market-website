// @ts-nocheck
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
import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '../domain/market';
import { formatVersionLabel } from '../domain/version';
import {
  availablePlatformKeys,
  preferredPlatformKey,
  platformForKey,
  downloadKeyForItem,
  platformDependencies,
  dependencyKey,
  commandEntries,
  assetEntries,
  formatAssetSize,
  formatAssetSizeForPlatform,
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
  const canDownload = hasArtifact(item, platform) || isSkillPackage(item);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  const skillLabel = item.type === 'skill' ? skillKindLabel(item.skillKind, t) : '';
  const skillCategory = item.type === 'skill' ? skillCategoryLabel(item.skillCategory, t) : '';
  const cardClassName = ['market-card', variant ? `is-${variant}` : ''].filter(Boolean).join(' ');
  return (
    <article className={cardClassName}>
      <div className="card-body">
        <div className="card-title-row">
          <span className="card-artwork" title={displayType(item.type, t)} aria-label={displayType(item.type, t)}>
            {item.icon ? <img src={item.icon} alt="" /> : <Icon className={category?.colorClass || 'is-muted'} size={18} />}
          </span>
          <h2>
            {localized(item.name, locale)}
          </h2>
          <div className="card-head-meta">
            <span className="card-version">{formatVersionLabel(item.version)}</span>
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
        <div className="card-author">
          <User size={13} />
          <span className="card-author-name" title={`${t.author}: ${item.author}`}>{item.author}</span>
          <span className="card-author-separator" aria-hidden="true">·</span>
          <span className="card-download-stat" title={t.downloads} aria-label={`${t.downloads}: ${formatCount(item.downloads)}`}>
            <Download size={13} />
            <span>{formatCount(item.downloads)}</span>
          </span>
        </div>
        <div className="tag-row">
          {skillLabel ? <span className={item.skillKind === 'package' ? 'skill-kind-chip package' : 'skill-kind-chip'}>{skillLabel}</span> : null}
          {skillCategory ? <span>{skillCategory}</span> : null}
          {(item.tags || []).slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}
          {platform ? <span className="platform-chip">{platform}</span> : null}
        </div>
        {item.skillKind === 'package' && item.includedSkills.length ? (
          <div className="card-included">
            <strong>{t.skillIncluded}</strong>
            {item.includedSkills.slice(0, 4).map((skill) => (
              <span key={skill.id}>{skill.name || skill.id}</span>
            ))}
          </div>
        ) : null}
      </div>
      <footer className={isAuthenticated ? '' : 'is-browse-only'}>
        <button className="link-button" type="button" onClick={onDetails}>
          <span>{t.details}</span>
          <ArrowRight size={13} />
        </button>
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
  const deps = platformDependencies(activePlatform, item);
  const commands = commandEntries(activePlatform, t);
  const canDownload = hasArtifact(item, activePlatformKey) || isSkillPackage(item);
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
            {item.hasVideo ? (
              <button className="video-panel" type="button" onClick={onToggleVideo}>
                <img src={item.videoThumb} alt="" />
                {videoPlaying ? <span className="video-running">{t.videoPlaying}</span> : <span className="play-overlay"><Play size={26} fill="currentColor" /></span>}
              </button>
            ) : null}
            <section className="readme-section">
              <h3>{localized(item.readmeTitle, locale) || t.readmeFallback}</h3>
              <p>{localized(item.readme, locale)}</p>
              <ul>
                {(localized(item.features, locale) || []).map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </section>
            <CommentSection item={item} isAuthenticated={isAuthenticated} locale={locale} t={t} onChanged={onCommentsChanged} />
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
              {isAuthenticated ? (
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
              ) : (
                <div className="meta-row">
                  <Heart size={14} />
                  <span>{t.favorites}</span>
                  <strong>{formatCount(item.favoriteCount)}</strong>
                </div>
              )}
            </div>

            {item.type === 'skill' ? (
              <section className="side-section">
                <h3>{t.skillCategoryTitle}</h3>
                <div className="skill-facts">
                  <span>{skillKindLabel(item.skillKind, t)}</span>
                  <span>{skillCategoryLabel(item.skillCategory, t)}</span>
                  {item.skillScenario ? <span>{t.skillScenarios[item.skillScenario] || item.skillScenario}</span> : null}
                  {item.skillLevel ? <span>{t.skillLevels[item.skillLevel] || item.skillLevel}</span> : null}
                  {item.skillFeatured ? <span>{t.skillFeatured}</span> : null}
                </div>
                {item.skillKind === 'package' ? (
                  <div className="included-skill-list">
                    <strong>{t.skillIncluded}</strong>
                    {item.includedSkills.length ? item.includedSkills.map((skill) => (
                      <div className="included-skill" key={skill.id}>
                        <span>{skill.name || skill.id}</span>
                        <small>{skill.id}</small>
                      </div>
                    )) : <p className="empty-detail">{t.noDependencies}</p>}
                  </div>
                ) : null}
              </section>
            ) : null}

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

            {isAuthenticated ? (
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
            ) : null}
          </section>
        </div>
      </aside>
    </div>
  );
}

export function CommentSection({ item, isAuthenticated, locale, t, onChanged }) {
  const [state, setState] = useState({ status: 'loading', comments: [], summary: { total: 0, positive: 0, negative: 0, positiveRate: 0 }, error: '' });
  const [sentiment, setSentiment] = useState('positive');
  const [content, setContent] = useState('');
  const [editingID, setEditingID] = useState(0);
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
    setSentiment(comment.sentiment);
    setContent(comment.content);
  }

  function cancelEdit() {
    setEditingID(0);
    setSentiment('positive');
    setContent('');
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
        body: JSON.stringify({ sentiment, content }),
      });
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
  return (
    <section className="comment-section">
      <div className="comment-heading">
        <h3><MessageSquare size={16} />{t.commentTitle}</h3>
        <div className="comment-summary">
          <span>{t.comments} <strong>{formatCount(summary.total)}</strong></span>
          <span>{t.commentPositiveRate} <strong>{summary.total ? `${Math.round(summary.positiveRate || 0)}%` : '-'}</strong></span>
        </div>
      </div>
      {isAuthenticated ? (
        <form className="comment-form" onSubmit={submitComment}>
          <div className="sentiment-control">
            <button className={sentiment === 'positive' ? 'is-active positive' : ''} type="button" onClick={() => setSentiment('positive')}><ThumbsUp size={14} />{t.commentPositive}</button>
            <button className={sentiment === 'negative' ? 'is-active negative' : ''} type="button" onClick={() => setSentiment('negative')}><ThumbsDown size={14} />{t.commentNegative}</button>
          </div>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={5} maxLength={1000} required placeholder={t.commentPlaceholder} />
          <div className="comment-form-actions">
            {editingID ? <button className="secondary-action" type="button" onClick={cancelEdit}>{t.commentCancelEdit}</button> : null}
            <button className="primary-action" type="submit" disabled={saving || content.trim().length < 5}>{editingID ? t.commentUpdate : t.commentSubmit}</button>
          </div>
        </form>
      ) : <p className="comment-login-hint">{t.commentLoginHint}</p>}
      {state.error ? <p className="comment-error">{state.error}</p> : null}
      {state.status === 'loading' ? <p className="comment-empty">{t.commentLoading}</p> : null}
      {state.status === 'ready' && !state.comments.length ? <p className="comment-empty">{t.commentEmpty}</p> : null}
      <div className="comment-list">
        {state.comments.map((comment) => (
          <article className="comment-row" key={comment.id}>
            <div className="comment-row-head">
              <strong>{comment.author}</strong>
              <span className={`comment-sentiment is-${comment.sentiment}`}>{comment.sentiment === 'positive' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}{comment.sentiment === 'positive' ? t.commentPositive : t.commentNegative}</span>
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
