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
import { summarizeDetailViews } from '../detailViews';
import {
  apiBase,
  canonicalTypes,
  localized,
  displayType,
  isSkillPackage,
  marketRoute,
  creatorQualityIssues,
} from '../domain/market';
import { formatVersionLabel } from '../domain/version';
import {
  parseCount,
  formatCount,
  formatDate,
  dateValue,
} from '../shared/formatters';

import { EmptyInline, ReviewBadge, VersionHistoryModal } from '../shared/ManagementViews';
export function CreatorCenter({
  mode = 'creator',
  items,
  favoriteItems = [],
  authSession,
  locale,
  t,
  onBack,
  onPublish,
  onPublishVersion,
  onDetails,
  onReview,
  reviewingKey,
  onLoadAdminReviews,
  isLoadingAdminReviews,
}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [itemQuery, setItemQuery] = useState('');
  const [versionState, setVersionState] = useState({ item: null, status: 'idle', versions: [], error: '' });
  const creatorItems = useMemo(() => [...items].sort((a, b) => dateValue(b.updatedAt || b.publishedAt) - dateValue(a.updatedAt || a.publishedAt)), [items]);
  const visibleItems = creatorItems.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    const needle = itemQuery.trim().toLowerCase();
    if (!needle) return true;
    return [
      item.id,
      localized(item.name, locale),
      localized(item.description, locale),
      displayType(item.type, t),
      ...(item.tags || []),
    ].join(' ').toLowerCase().includes(needle);
  });
  const totalDownloads = creatorItems.reduce((sum, item) => sum + parseCount(item.downloads), 0);
  const totalDetailViews = summarizeDetailViews(creatorItems);
  const totalFavorites = creatorItems.reduce((sum, item) => sum + parseCount(item.favoriteCount), 0);
  const totalComments = creatorItems.reduce((sum, item) => sum + parseCount(item.commentCount), 0);
  const skillPackages = creatorItems.filter(isSkillPackage).length;
  const pendingReviews = creatorItems.filter((item) => (item.pendingReviewStatus || item.reviewStatus) === 'pending').length;
  const rejectedReviews = creatorItems.filter((item) => (item.pendingReviewStatus || item.reviewStatus) === 'rejected').length;
  const recentItems = creatorItems.slice(0, 4);
  const qualityRows = creatorItems.map((item) => ({ item, issues: creatorQualityIssues(item, t) }));
  const qualityRowsWithIssues = qualityRows.filter((row) => row.issues.length);
  const issueCount = qualityRowsWithIssues.reduce((sum, row) => sum + row.issues.length, 0);
  const topDownloads = [...creatorItems].sort((a, b) => parseCount(b.downloads) - parseCount(a.downloads)).slice(0, 5);
  const topFavorites = [...creatorItems].sort((a, b) => parseCount(b.favoriteCount) - parseCount(a.favoriteCount)).slice(0, 5);
  const maxDownloads = Math.max(1, ...topDownloads.map((item) => parseCount(item.downloads)));
  const maxFavorites = Math.max(1, ...topFavorites.map((item) => parseCount(item.favoriteCount)));
  const typeBreakdown = canonicalTypes.filter((type) => type !== 'pet').map((type) => ({
    type,
    count: creatorItems.filter((item) => item.type === type).length,
  })).filter((entry) => entry.count);
  const metricCards = [
    { label: t.creatorTotalItems, value: formatCount(creatorItems.length), icon: Folder },
    { label: t.creatorTotalDownloads, value: formatCount(totalDownloads), icon: Download },
    { label: t.creatorTotalDetailViews, value: formatCount(totalDetailViews), icon: BarChart3 },
    { label: t.creatorTotalFavorites, value: formatCount(totalFavorites), icon: Heart },
    { label: t.comments, value: formatCount(totalComments), icon: MessageSquare },
    { label: t.creatorSkillPackages, value: formatCount(skillPackages), icon: PackageOpen },
    { label: t.reviewPending, value: formatCount(pendingReviews), icon: ListChecks },
    { label: t.reviewRejected, value: formatCount(rejectedReviews), icon: AlertCircle },
  ];
  const isAdminMode = mode === 'admin';
  const profile = authSession?.user || {};
  const profileName = profile.name || profile.username || profile.id || t.creatorProfileName;
  const profileEmail = profile.email || t.profileUnavailable;
  const profileRole = profile.role === 'admin' ? t.loginAsAdmin : t.loginAsCreator;

  async function openVersions(item) {
    setVersionState({ item, status: 'loading', versions: [], error: '' });
    try {
      const route = marketRoute(item.type);
      const data = await requestJSON(`${apiBase}/${route}/${encodeURIComponent(item.id)}/versions`);
      setVersionState({ item, status: 'ready', versions: Array.isArray(data.versions) ? data.versions : [], error: '' });
    } catch (reason) {
      setVersionState({ item, status: 'error', versions: [], error: errorMessage(reason) });
    }
  }

  return (
    <section className="creator-center">
      <div className="creator-hero">
        <div>
          <span className="section-kicker">{isAdminMode ? <ShieldCheck size={14} /> : <User size={14} />}{isAdminMode ? t.reviewCenter : t.creatorDashboard}</span>
          <h1>{isAdminMode ? t.reviewCenter : t.creatorTitle}</h1>
          <p>{isAdminMode ? t.reviewAdminTokenHint : t.creatorSubtitle}</p>
        </div>
        <div className="creator-actions">
          <button className="secondary-action" type="button" onClick={onBack}>
            <Store size={15} />
            <span>{t.backToMarket}</span>
          </button>
          <button className="primary-action" type="button" onClick={onPublish}>
            <Upload size={15} />
            <span>{t.publish}</span>
          </button>
        </div>
      </div>

      <div className="creator-scroll">
        <aside className="creator-side">
          <section className="creator-profile-panel">
            <div className="creator-profile-avatar"><User size={22} /></div>
            <div>
              <span className="section-kicker"><User size={14} />{t.creatorProfile}</span>
              <h2>{profileName}</h2>
              <p>{t.creatorProfileBio}</p>
            </div>
          </section>

          <section className="creator-profile-details" aria-label={t.creatorProfile}>
            <div><span>{t.profileEmail}</span><strong>{profileEmail}</strong></div>
            <div><span>{t.profileRole}</span><strong>{profileRole}</strong></div>
          </section>

          <section className="creator-local-banner">
            <AlertCircle size={17} />
            <div className="creator-local-copy">
              <strong>{t.creatorLocalMode}</strong>
              <small>{t.creatorLocalModeBody}</small>
            </div>
            {isAdminMode ? (
              <div className="creator-review-loader">
                <button className="table-action" type="button" onClick={onLoadAdminReviews} disabled={isLoadingAdminReviews}>
                  <RefreshCw size={13} />
                  <span>{t.reviewLoadAdminData}</span>
                </button>
              </div>
            ) : null}
          </section>

          <section className="creator-panel compact">
            <div className="panel-head">
              <span><LayoutGrid size={16} />{t.creatorTypeBreakdown}</span>
            </div>
            {typeBreakdown.length ? (
              <div className="type-breakdown">
                {typeBreakdown.map((entry) => (
                  <div className="type-breakdown-row" key={entry.type}>
                    <span>{displayType(entry.type, t)}</span>
                    <strong>{formatCount(entry.count)}</strong>
                    <i style={{ width: `${Math.max(8, (entry.count / Math.max(creatorItems.length, 1)) * 100)}%` }} />
                </div>
                ))}
              </div>
            ) : <EmptyInline title={t.creatorEmptyTitle} body={t.creatorEmptyBody} />}
          </section>
        </aside>

        <div className="creator-main">
          <section className="creator-metrics" aria-label={t.creatorDashboard}>
            {metricCards.map(({ label, value, icon: Icon }) => (
              <div className="metric-card" key={label}>
                <span className="metric-icon"><Icon size={17} /></span>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>

          <div className="creator-panel-grid">
          <section className="creator-panel">
              <div className="panel-head">
                <span><BarChart3 size={16} />{t.creatorRecent}</span>
              </div>
              {recentItems.length ? (
                <div className="recent-list">
                  {recentItems.map((item) => (
                    <button className="recent-row" type="button" key={`${item.type}:${item.id}`} onClick={() => onDetails(item)}>
                      <img src={item.icon || item.screenshot} alt="" />
                      <span>
                        <strong>{localized(item.name, locale) || item.id}</strong>
                        <small>{displayType(item.type, t)} · {formatDate(item.updatedAt || item.publishedAt, locale)}</small>
                      </span>
                    </button>
                  ))}
                </div>
              ) : <EmptyInline title={t.creatorEmptyTitle} body={t.creatorEmptyBody} />}
            </section>

            <section className="creator-panel">
              <div className="panel-head">
                <span><ListChecks size={16} />{t.creatorQuality}</span>
                <small>{issueCount ? `${issueCount}` : t.creatorNoIssues}</small>
              </div>
              {qualityRows.length ? (
                <div className="quality-list">
                  {(qualityRowsWithIssues.length ? qualityRowsWithIssues : qualityRows).slice(0, 6).map(({ item, issues }) => (
                    <div className="quality-row" key={`${item.type}:${item.id}`}>
                      <span>
                        <strong>{localized(item.name, locale) || item.id}</strong>
                        <small>{issues.length ? issues.join(' · ') : t.creatorQualityGood}</small>
                      </span>
                      <CheckCircle2 className={issues.length ? 'is-warning' : 'is-ok'} size={16} />
                    </div>
                  ))}
                </div>
              ) : <EmptyInline title={t.creatorEmptyTitle} body={t.creatorEmptyBody} />}
            </section>

            <section className="creator-panel">
              <div className="panel-head">
                <span><BarChart3 size={16} />{t.creatorTopDownloads}</span>
              </div>
              {topDownloads.length ? (
                <div className="chart-list">
                  {topDownloads.map((item, index) => (
                    <button className="chart-row" type="button" key={`${item.type}:${item.id}`} onClick={() => onDetails(item)}>
                      <strong>{index + 1}</strong>
                      <span>
                        <b>{localized(item.name, locale) || item.id}</b>
                        <small>{displayType(item.type, t)}</small>
                      </span>
                      <em>{formatCount(item.downloads)}</em>
                      <i style={{ width: `${Math.max(4, (parseCount(item.downloads) / maxDownloads) * 100)}%` }} />
                    </button>
                  ))}
                </div>
              ) : <EmptyInline title={t.creatorEmptyTitle} body={t.creatorEmptyBody} />}
            </section>

            <section className="creator-panel">
              <div className="panel-head">
                <span><Heart size={16} />{t.favorites}</span>
              </div>
              {topFavorites.length ? (
                <div className="chart-list">
                  {topFavorites.map((item, index) => (
                    <button className="chart-row is-favorite" type="button" key={`${item.type}:${item.id}`} onClick={() => onDetails(item)}>
                      <strong>{index + 1}</strong>
                      <span>
                        <b>{localized(item.name, locale) || item.id}</b>
                        <small>{displayType(item.type, t)}</small>
                      </span>
                      <em>{formatCount(item.favoriteCount)}</em>
                      <i style={{ width: `${Math.max(4, (parseCount(item.favoriteCount) / maxFavorites) * 100)}%` }} />
                    </button>
                  ))}
                </div>
              ) : <EmptyInline title={t.creatorEmptyTitle} body={t.creatorEmptyBody} />}
            </section>
          </div>

          <section className="creator-table-section">
            <div className="table-head">
              <div>
                <span className="section-kicker"><Folder size={14} />{t.creatorInventory}</span>
                <h2>{t.creatorInventory}</h2>
              </div>
              <div className="creator-filters">
                <label className="creator-search">
                  <Search size={15} />
                  <input value={itemQuery} onChange={(event) => setItemQuery(event.target.value)} placeholder={t.creatorSearch} />
                </label>
                <label className="sort-control">
                  <span>{t.creatorTypeFilter}</span>
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    <option value="all">{t.creatorAllTypes}</option>
                    {canonicalTypes.filter((type) => type !== 'pet').map((type) => (
                      <option value={type} key={type}>{displayType(type, t)}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            {visibleItems.length ? (
              <div className="creator-table" role="table" aria-label={t.creatorInventory}>
                <div className="creator-table-row is-head" role="row">
                  <span>{t.name}</span>
                  <span>{t.type}</span>
                  <span>{t.reviewStatus}</span>
                  <span>{t.creatorVersion}</span>
                  <span>{t.downloads}</span>
                  <span>{t.detailViews}</span>
                  <span>{t.favorites}</span>
                  <span>{t.comments}</span>
                  <span>{t.commentPositiveRate}</span>
                  <span>{t.creatorUpdatedAt}</span>
                  <span>{t.manage}</span>
                </div>
                {visibleItems.map((item) => (
                  <div className="creator-table-row" role="row" key={`${item.type}:${item.id}`}>
                    <span className="component-cell">
                      <img src={item.icon || item.screenshot} alt="" />
                      <span>
                        <strong>{localized(item.name, locale) || item.id}</strong>
                        <small>{item.id}</small>
                    </span>
                  </span>
                  <span>{isSkillPackage(item) ? t.skillPackage : displayType(item.type, t)}</span>
                  <span className="review-status-cell">
                    <ReviewBadge status={item.pendingReviewStatus || item.reviewStatus} t={t} />
                    {item.pendingReviewStatus === 'pending' ? <small>{t.creatorPendingVersion(formatVersionLabel(item.pendingVersion))}</small> : null}
                    {item.pendingReviewStatus === 'rejected' ? <small title={item.pendingReviewNote || ''}>{t.creatorRejectedVersion(formatVersionLabel(item.pendingVersion))}{item.pendingReviewNote ? `：${item.pendingReviewNote}` : ''}</small> : null}
                    {!item.pendingReviewStatus && item.reviewStatus === 'rejected' && item.reviewNote ? (
                      <small title={`${t.reviewRejectReason}: ${item.reviewNote}`}>{t.reviewRejectReason}: {item.reviewNote}</small>
                    ) : null}
                  </span>
                  <span>{formatVersionLabel(item.version || item.latestVersion) || '-'}</span>
                  <span>{formatCount(item.downloads)}</span>
                  <span>{formatCount(item.detailViewCount)}</span>
                  <span>{formatCount(item.favoriteCount)}</span>
                  <span>{formatCount(item.commentCount)}</span>
                  <span>{item.commentCount ? `${Math.round(item.positiveRate)}%` : '-'}</span>
                  <span>{formatDate(item.updatedAt || item.publishedAt, locale)}</span>
                  <span>
                    <span className="table-actions">
                      {isAdminMode && onReview && item.reviewStatus !== 'approved' ? (
                        <button className="table-action" type="button" disabled={reviewingKey === `${item.type}:${item.id}`} onClick={() => onReview(item, 'approved')}>
                          <CheckCircle2 size={14} />
                          <span>{t.reviewApprove}</span>
                        </button>
                      ) : null}
                      {isAdminMode && onReview && item.reviewStatus !== 'rejected' ? (
                        <button className="table-action" type="button" disabled={reviewingKey === `${item.type}:${item.id}`} onClick={() => onReview(item, 'rejected')}>
                          <AlertCircle size={14} />
                          <span>{t.reviewReject}</span>
                        </button>
                      ) : null}
                      <button className="table-action" type="button" onClick={() => openVersions(item)}>
                        <Calendar size={14} />
                        <span>{t.creatorVersions}</span>
                      </button>
                      {!isAdminMode && item.reviewStatus === 'approved' && onPublishVersion ? (
                        <button className="table-action" type="button" disabled={item.pendingReviewStatus === 'pending'} onClick={() => onPublishVersion(item)}>
                          <Upload size={14} />
                          <span>{t.creatorPublishVersion}</span>
                        </button>
                      ) : null}
                      <button className="table-action" type="button" onClick={() => onDetails(item)}>
                        <ArrowRight size={14} />
                        <span>{t.creatorOpenMarket}</span>
                      </button>
                    </span>
                  </span>
                  </div>
                ))}
              </div>
            ) : <EmptyInline title={t.creatorEmptyTitle} body={t.creatorEmptyBody} />}
          </section>

          <section className="creator-panel">
            <div className="panel-head">
              <span><Heart size={16} />{t.creatorMyFavorites}</span>
            </div>
            {favoriteItems.length ? (
              <div className="recent-list">
                {favoriteItems.slice(0, 5).map((item) => (
                  <button className="recent-row" type="button" key={`${item.type}:${item.id}`} onClick={() => onDetails(item)}>
                    <img src={item.icon || item.screenshot} alt="" />
                    <span>
                      <strong>{localized(item.name, locale) || item.id}</strong>
                      <small>{item.author || 'ZenMind'} · {displayType(item.type, t)}</small>
                    </span>
                  </button>
                ))}
              </div>
            ) : <EmptyInline title={t.creatorNoFavorites} body={t.creatorNoFavoritesBody} />}
          </section>
        </div>
      </div>
      {versionState.item ? (
        <VersionHistoryModal
          state={versionState}
          locale={locale}
          t={t}
          onClose={() => setVersionState({ item: null, status: 'idle', versions: [], error: '' })}
        />
      ) : null}
    </section>
  );
}
