// @ts-nocheck
import {
  AlertCircle,
  AlertOctagon,
  Bot,
  Box,
  Brain,
  Calendar,
  Cat,
  Check,
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
  LibraryBig,
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
  Unplug,
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
import { formatVersionLabel } from '../domain/version';
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
  const isSkillPackageCard = item.type === 'skill' && item.skillKind === 'package';
  const Icon = isSkillPackageCard ? PackageOpen : category?.icon || PackageOpen;
  const cardTypeLabel = isSkillPackageCard ? skillKindLabel(item.skillKind, t) : displayType(item.type, t);
  const featuredTypeLabel = String(locale).toLowerCase().startsWith('zh')
    ? `精选${displayType(item.type, t)}`
    : `Featured ${displayType(item.type, t)}`;
  const platform = preferredPlatformKey(item);
  const canDownload = (Boolean(platform) && hasArtifact(item, platform)) || isSkillPackage(item);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  const usageHints = item.type === 'skill' || item.type === 'connector' ? usageHintsFromMetadata(item.metadata) : [];
  const primaryTag = (item.tags || []).map((tag) => String(tag || '').trim()).find(Boolean);
  const primaryTagLabel = primaryTag || (item.type === 'skill' ? skillCategoryLabel(item.skillCategory, t) : '');
  const usageHintKey = usageHints.join('\u0000');
  const loginDownloadTipId = `card-login-download-tip-${item.type}-${item.id}`;
  const cardRef = useRef(null);
  const [usageHintVisible, setUsageHintVisible] = useState(false);
  const [activeUsageHint, setActiveUsageHint] = useState(0);
  const cardClassName = ['market-card', item.featured ? 'is-featured' : '', variant ? `is-${variant}` : ''].filter(Boolean).join(' ');
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
    if (event.target.closest('button, a, input, select, textarea, [data-card-action]')) return;
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
      <span className={item.featured ? 'card-type-badge is-featured' : 'card-type-badge'} aria-label={`${t.typeLabel || '类型'}: ${item.featured ? featuredTypeLabel : cardTypeLabel}`}>
        {item.featured ? featuredTypeLabel : cardTypeLabel}
      </span>
      <div className="card-body">
        <div className="card-title-row">
          <span className="card-artwork" title={cardTypeLabel} aria-label={cardTypeLabel}>
            {item.icon || item.screenshot ? <img src={item.icon || item.screenshot} alt="" /> : <Icon className={category?.colorClass || 'is-muted'} size={18} />}
          </span>
          <h2>
            {itemName}
            {primaryTagLabel ? <span className={primaryTag ? 'card-primary-tag' : 'card-primary-tag is-category'} title={primaryTag ? `${t.tags}: ${primaryTag}` : primaryTagLabel}>{primaryTagLabel}</span> : null}
          </h2>
        </div>
        <p>{localized(item.description, locale) || t.noDescription}</p>
        {usageHints.length ? <div className="card-usage-hint" aria-label={t.usageHintTitle}><p className="card-usage-hint-text" key={activeUsageHint}><span className="usage-hint-icon" aria-hidden="true"><MessageCircleMore size={16} /></span><span>{usageHints[activeUsageHint]}</span></p></div> : null}
        <div className="card-author">
          <User size={13} />
          <span className="card-author-name" title={`${t.author}: ${item.author}`}>{item.author}</span>
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
      </div>
      <footer className="card-hover-action">
        {isAuthenticated ? (
          <button className="primary-action" type="button" disabled={canInstall ? false : !canDownload || isDownloading} onClick={canInstall ? onInstall : onDownload}>
            {canInstall ? <Copy size={13} /> : <Download size={13} />}
            <span>{canInstall ? t.installWithADP : canDownload ? isDownloading ? t.downloading : t.downloadArtifact : t.noArtifact}</span>
          </button>
        ) : (
          <span className="card-login-download" data-card-action tabIndex={0} aria-describedby={loginDownloadTipId}>
            <button className="primary-action" type="button" disabled aria-label={t.downloadLoginRequired}>
              <Download size={13} />
              <span>{t.downloadArtifact}</span>
            </button>
            <span className="card-login-download-tip" id={loginDownloadTipId} role="tooltip">{t.downloadLoginRequired}</span>
          </span>
        )}
      </footer>
    </article>
  );
}

export function DetailModal({ item, isAuthenticated, locale, t, videoPlaying, selectedVersion, versionOptions = [], onVersionChange, selectedPlatformKey, onPlatformChange, onToggleVideo, onClose, onInstall, onDownload, onFavorite, isDownloading, isFavoriting, onCommentsChanged }) {
  const Icon = categoryMeta.find((category) => category.id === item.type)?.icon || PackageOpen;
  const platformKeys = availablePlatformKeys(item);
  const activePlatformKey = preferredPlatformKey(item, selectedPlatformKey);
  const activePlatform = platformForKey(item, activePlatformKey);
  const commands = commandEntries(activePlatform, t);
  const canDownload = (Boolean(activePlatformKey) && hasArtifact(item, activePlatformKey)) || isSkillPackage(item);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  const readme = localized(item.readme, locale);
  const usageHints = item.type === 'skill' || item.type === 'connector' ? usageHintsFromMetadata(item.metadata) : [];
  const localizedFeatures = localized(item.features, locale);
  const features = Array.isArray(localizedFeatures) ? localizedFeatures.filter(Boolean) : [];
  const hasCoreFeatures = Boolean(String(readme || '').trim() || features.length);
  const [copiedUsageHint, setCopiedUsageHint] = useState('');
  async function copyUsageHint(hint) {
    try {
      await navigator.clipboard.writeText(hint);
      setCopiedUsageHint(hint);
      window.setTimeout(() => setCopiedUsageHint((current) => current === hint ? '' : current), 1600);
    } catch {
      setCopiedUsageHint('');
    }
  }
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-modal" role="dialog" aria-modal="true" aria-label={localized(item.name, locale)} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        <div className="detail-grid">
          <section className="detail-hero">
            <div className="detail-icon">
              {item.icon ? <img src={item.icon} alt="" /> : <Icon size={30} />}
            </div>
            <div className="detail-hero-copy">
              <div className="detail-overline">
                <span>{displayType(item.type, t)}</span>
                {item.type === 'skill' ? <span>{skillKindLabel(item.skillKind, t)}</span> : null}
                {item.type === 'skill' ? <span>{skillCategoryLabel(item.skillCategory, t)}</span> : null}
                {item.type === 'skill' && item.skillScenario ? <span>{t.skillScenarios[item.skillScenario] || item.skillScenario}</span> : null}
                {item.type === 'skill' && item.skillLevel ? <span>{t.skillLevels[item.skillLevel] || item.skillLevel}</span> : null}
                {item.featured ? <span>{t.officialFeatured}</span> : null}
                {(item.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}
              </div>
              <PlatformArtifactPicker
                platformKeys={platformKeys}
                activePlatformKey={activePlatformKey}
                label={t.selectedPlatform}
                selectLabel={t.selectPlatform}
                onChange={onPlatformChange}
              />
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
            {item.type === 'connector' && usageHints.length ? (
              <section className="connector-usage-showcase" aria-label={t.connectorUsageTitle}>
                <h3>{t.connectorUsageTitle}</h3>
                <div className="connector-usage-list">
                  {usageHints.map((hint) => <div className="connector-usage-row" key={hint}>
                    <span className="connector-usage-message" aria-hidden="true"><MessageCircleMore size={15} /></span>
                    <span className="connector-usage-copy">{hint}</span>
                    <button className={copiedUsageHint === hint ? 'connector-usage-copy-button is-copied' : 'connector-usage-copy-button'} type="button" onClick={() => copyUsageHint(hint)} aria-label={copiedUsageHint === hint ? t.usageHintCopied : t.copyUsageHint} title={copiedUsageHint === hint ? t.usageHintCopied : t.copyUsageHint}>
                      {copiedUsageHint === hint ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>)}
                </div>
              </section>
            ) : null}
            {item.type !== 'skill' && item.screenshot && item.screenshot !== item.icon ? (
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
            {item.type === 'skill' && item.skillKind !== 'package' ? <SkillMarkdownCard item={item} t={t} /> : hasCoreFeatures && item.type !== 'connector' ? (
              <section className="readme-section">
                <h3>{localized(item.readmeTitle, locale) || t.readmeFallback}</h3>
                {readme ? <p>{readme}</p> : null}
                {features.length ? <ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}
              </section>
            ) : null}
            {isSkillPackage(item) && Array.isArray(item.includedSkills) && item.includedSkills.length ? (
              <IncludedSkillsSection item={item} locale={locale} t={t} />
            ) : null}
            {item.type === 'connector' ? <ConnectorComponentsSection item={item} t={t} /> : null}
          </section>

          <section className="detail-side">
            {versionOptions.length > 1 ? (
              <label className="platform-select">
                <span>{t.version}</span>
                <select aria-label={t.version} value={selectedVersion || item.version} onChange={(event) => onVersionChange(event.target.value)}>
                  {versionOptions.map((version) => <option value={version} key={version}>{formatVersionLabel(version)}</option>)}
                </select>
              </label>
            ) : null}
            {item.type !== 'connector' && usageHints.length ? (
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

export function PlatformArtifactPicker({ platformKeys = [], activePlatformKey = '', label, selectLabel, onChange }) {
  if (!platformKeys.length) return null;
  if (platformKeys.length === 1) {
    return <div className="detail-platform-picker is-single" aria-label={label}>
      <span className="detail-platform-choice is-active"><Box size={13} />{platformKeys[0]}</span>
    </div>;
  }
  return (
    <fieldset className="detail-platform-picker" aria-label={label}>
      <legend>{activePlatformKey ? label : selectLabel}</legend>
      {platformKeys.map((platform) => {
        const checked = platform === activePlatformKey;
        return <label className={checked ? 'detail-platform-choice is-active' : 'detail-platform-choice'} key={platform}>
          <input type="radio" name="detail-platform-artifact" value={platform} checked={checked} onChange={() => onChange(platform)} />
          {checked ? <Check size={13} /> : <Box size={13} />}
          <span>{platform}</span>
        </label>;
      })}
    </fieldset>
  );
}

export function ConnectorComponentsSection({ item, t }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const capabilities = new Set((item.connectorCapabilities || []).map((capability) => String(capability).toLowerCase()));
  const config = item.connectorConfig || {};
  const componentIndex = Array.isArray(item.connectorComponents) ? item.connectorComponents : [];
  const skills = Array.isArray(item.connectorSkillNames) ? item.connectorSkillNames.filter(Boolean) : [];
  const mcp = config.mcp || {};
  const cli = config.cli || {};
  const mcpTransports = (item.connectorMCPTransports || []).filter(Boolean);
  const cliPlatforms = Object.entries(cli.versionCommand || {})
    .filter(([, command]) => Boolean(command))
    .map(([platform]) => platform);
  const skillComponents = componentIndex.filter((component) => component.type === 'skill');
  const mcpComponents = componentIndex.filter((component) => component.type === 'mcp');
  const cliComponents = componentIndex.filter((component) => component.type === 'cli');
  const skillItems = skillComponents.length
    ? skillComponents.map((component) => ({ name: component.name, description: component.description || t.connectorSkillDescription(component.name) }))
    : skills.map((name) => ({ name, description: t.connectorSkillDescription(name) }));
  const mcpItems = mcpComponents.length
    ? mcpComponents.map((component) => ({ name: component.name, badge: mcpTransports.length ? t.connectorToolCount(mcpTransports.length) : '', description: component.description || (mcpTransports.length ? t.connectorMCPDescription(mcpTransports.join(' · ')) : t.connectorMCPFallbackDescription) }))
    : [{ name: mcp.serverName || t.connectorMCPFallbackName, badge: mcpTransports.length ? t.connectorToolCount(mcpTransports.length) : '', description: mcpTransports.length ? t.connectorMCPDescription(mcpTransports.join(' · ')) : t.connectorMCPFallbackDescription }];
  const cliItems = cliComponents.length
    ? cliComponents.map((component) => ({ name: component.name || t.connectorCLIName, badge: cliPlatforms.length ? t.connectorPlatformCount(cliPlatforms.length) : '', description: component.description || (cliPlatforms.length ? t.connectorCLIDescription(cliPlatforms.join(' · ')) : t.connectorCLIFallbackDescription) }))
    : [{ name: t.connectorCLIName, badge: cliPlatforms.length ? t.connectorPlatformCount(cliPlatforms.length) : '', description: cliPlatforms.length ? t.connectorCLIDescription(cliPlatforms.join(' · ')) : t.connectorCLIFallbackDescription }];
  const sections = [
    capabilities.has('skill') ? {
      id: 'skill',
      title: t.connectorSkillsTitle,
      Icon: LibraryBig,
      items: skillItems.length ? skillItems : [{ name: t.connectorSkillFallbackName, description: t.connectorSkillFallbackDescription }],
    } : null,
    capabilities.has('mcp') ? {
      id: 'mcp',
      title: 'MCP',
      Icon: Unplug,
      items: mcpItems,
    } : null,
    capabilities.has('cli') ? {
      id: 'cli',
      title: 'CLI',
      Icon: Terminal,
      items: cliItems,
    } : null,
  ].filter(Boolean);

  if (!sections.length) return null;
  return (
    <section className="connector-components" aria-label={t.connectorComponentsTitle}>
      {sections.map(({ id, title, Icon, items }) => {
        const expanded = Boolean(expandedGroups[id]);
        const visibleItems = expanded ? items : items.slice(0, 3);
        const hiddenCount = Math.max(0, items.length - 3);
        return <section className="connector-component-group" key={id}>
          <div className="connector-component-group-heading"><h4>{title}</h4><span>{t.connectorComponentCount(items.length)}</span></div>
          <div className="connector-component-list">
            {visibleItems.map((component) => (
              <article className="connector-component-card" key={`${id}:${component.name}`}>
                <span className={`connector-component-icon is-${id}`} aria-hidden="true"><Icon size={20} /></span>
                <div className="connector-component-copy">
                  <div><strong>{component.name}</strong>{component.badge ? <span>{component.badge}</span> : null}</div>
                  <p>{component.description}</p>
                </div>
              </article>
            ))}
          </div>
          {hiddenCount ? <button
            className={expanded ? 'connector-components-toggle is-expanded' : 'connector-components-toggle'}
            type="button"
            onClick={() => setExpandedGroups((current) => ({ ...current, [id]: !expanded }))}
          >
            <span>{expanded ? t.connectorCollapseComponents : t.connectorExpandComponents(hiddenCount)}</span>
            <ChevronDown size={14} />
          </button> : null}
        </section>;
      })}
    </section>
  );
}

export function IncludedSkillsSection({ item, locale, t }) {
  const includedSkills = useMemo(
    () => (Array.isArray(item.includedSkills) ? item.includedSkills.filter((skill) => skill && skill.id) : []),
    [item.includedSkills],
  );
  const includedKey = includedSkills.map((skill) => skill.id).join('\u0000');
  const [details, setDetails] = useState({});
  useEffect(() => {
    if (!includedKey) return undefined;
    const controller = new AbortController();
    const route = marketRoute(item.type);
    includedKey.split('\u0000').forEach((skillID) => {
      requestJSON(`${apiBase}/${route}/${encodeURIComponent(skillID)}`, { signal: controller.signal })
        .then((data) => setDetails((current) => ({ ...current, [skillID]: data })))
        .catch(() => {});
    });
    return () => controller.abort();
  }, [item.type, includedKey]);
  return (
    <section className="included-skills-section">
      <h3>{t.skillIncludedCount(includedSkills.length)}</h3>
      <div className="included-skill-list">
        {includedSkills.map((skill) => {
          const detail = details[skill.id];
          const name = localized(detail?.name, locale) || skill.name || skill.id;
          const description = localized(detail?.description, locale) || '';
          const icon = detail?.metadata?.icon || '';
          return (
            <article className="included-skill" key={skill.id}>
              <span className="included-skill-artwork" aria-hidden="true">
                {icon ? <img src={icon} alt="" /> : <Brain size={18} />}
              </span>
              <div className="included-skill-copy">
                <strong title={name}>{name}</strong>
                {description ? <p>{description}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
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
