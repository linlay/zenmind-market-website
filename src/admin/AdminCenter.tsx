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
  canonicalTypes,
  localized,
  displayType,
  isSkillPackage,
  marketRoute,
} from '../domain/market';
import { formatVersionLabel } from '../domain/version';
import {
  formatDate,
  dateValue,
} from '../shared/formatters';

import { EmptyInline, ReviewDetailModal, VersionHistoryModal } from '../shared/ManagementViews';
export function AdminCenter({
  pendingItems,
  publishedItems,
  comments,
  locale,
  t,
  onBack,
  onPublish,
  onDetails,
  onReview,
  reviewingKey,
  onUnpublishLatest,
  unpublishingKey,
  onLoadAdminReviews,
  isLoadingAdminReviews,
  onModerateComment,
  moderatingCommentID,
}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [itemQuery, setItemQuery] = useState('');
  const [versionState, setVersionState] = useState({ item: null, status: 'idle', versions: [], error: '' });
  const [reviewDetailState, setReviewDetailState] = useState({ item: null, status: 'idle', detail: null, error: '' });
  const published = useMemo(
    () => [...publishedItems].sort((a, b) => dateValue(b.updatedAt || b.publishedAt) - dateValue(a.updatedAt || a.publishedAt)),
    [publishedItems],
  );
  const visiblePublished = published.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    const needle = itemQuery.trim().toLowerCase();
    if (!needle) return true;
    return [item.id, localized(item.name, locale), localized(item.description, locale), displayType(item.type, t), ...(item.tags || [])]
      .join(' ').toLowerCase().includes(needle);
  });

  async function openVersions(item) {
    setVersionState({ item, status: 'loading', versions: [], error: '' });
    try {
      const data = await requestJSON(`${apiBase}/${marketRoute(item.type)}/${encodeURIComponent(item.id)}/versions`);
      setVersionState({ item, status: 'ready', versions: Array.isArray(data.versions) ? data.versions : [], error: '' });
    } catch (reason) {
      setVersionState({ item, status: 'error', versions: [], error: errorMessage(reason) });
    }
  }

  async function openReviewDetail(item) {
    setReviewDetailState({ item, status: 'loading', detail: null, error: '' });
    try {
      const detail = await requestJSON(`${apiBase}/admin/reviews/${encodeURIComponent(item.type)}/${encodeURIComponent(item.id)}`);
      setReviewDetailState({ item, status: 'ready', detail, error: '' });
    } catch (reason) {
      setReviewDetailState({ item, status: 'error', detail: null, error: errorMessage(reason) });
    }
  }

  return (
    <section className="creator-center admin-center">
      <div className="creator-hero">
        <div>
          <span className="section-kicker"><ShieldCheck size={14} />{t.adminManagement}</span>
          <h1>{t.adminManagement}</h1>
          <p>{t.adminManagementSubtitle}</p>
        </div>
        <div className="creator-actions">
          <button className="secondary-action" type="button" onClick={onBack}><Store size={15} /><span>{t.backToMarket}</span></button>
          <button className="primary-action" type="button" onClick={onPublish}><Upload size={15} /><span>{t.publish}</span></button>
        </div>
      </div>

      <div className="admin-scroll">
        <section className="creator-table-section">
          <div className="table-head">
            <div>
              <span className="section-kicker"><ListChecks size={14} />{t.adminPendingPublications}</span>
              <h2>{t.adminPendingPublications}</h2>
            </div>
            <button className="table-action" type="button" onClick={onLoadAdminReviews} disabled={isLoadingAdminReviews}>
              <RefreshCw size={13} /><span>{t.reviewLoadAdminData}</span>
            </button>
          </div>
          {pendingItems.length ? (
            <div className="admin-table" role="table" aria-label={t.adminPendingPublications}>
              <div className="admin-table-row is-head" role="row"><span>{t.name}</span><span>{t.type}</span><span>{t.creatorVersion}</span><span>{t.creatorUpdatedAt}</span><span>{t.manage}</span></div>
              {pendingItems.map((item) => (
                <div className="admin-table-row" role="row" key={`${item.type}:${item.id}`}>
                  <ComponentCell item={item} locale={locale} />
                  <span>{isSkillPackage(item) ? t.skillPackage : displayType(item.type, t)}</span>
                  <span>{formatVersionLabel(item.version || item.latestVersion) || '-'}</span>
                  <span>{formatDate(item.updatedAt || item.publishedAt, locale)}</span>
                  <span className="table-actions">
                    <button className="table-action" type="button" disabled={reviewingKey === `${item.type}:${item.id}`} onClick={() => openReviewDetail(item)}><ListChecks size={14} /><span>{t.reviewOpen}</span></button>
                  </span>
                </div>
              ))}
            </div>
          ) : <EmptyInline title={t.adminNoPendingPublications} body={t.reviewAdminTokenHint} />}
        </section>

        <section className="creator-table-section">
          <div className="table-head">
            <div>
              <span className="section-kicker"><Folder size={14} />{t.adminPublishedComponents}</span>
              <h2>{t.adminPublishedComponents}</h2>
            </div>
            <div className="creator-filters">
              <label className="creator-search"><Search size={15} /><input value={itemQuery} onChange={(event) => setItemQuery(event.target.value)} placeholder={t.adminSearchPublished} /></label>
              <label className="sort-control"><span>{t.creatorTypeFilter}</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">{t.creatorAllTypes}</option>{canonicalTypes.filter((type) => type !== 'pet').map((type) => <option value={type} key={type}>{displayType(type, t)}</option>)}</select></label>
            </div>
          </div>
          {visiblePublished.length ? (
            <div className="admin-table admin-published-table" role="table" aria-label={t.adminPublishedComponents}>
              <div className="admin-table-row is-head" role="row"><span>{t.name}</span><span>{t.type}</span><span>{t.creatorVersion}</span><span>{t.creatorUpdatedAt}</span><span>{t.manage}</span></div>
              {visiblePublished.map((item) => {
                const key = `${item.type}:${item.id}`;
                return <div className="admin-table-row" role="row" key={key}>
                  <ComponentCell item={item} locale={locale} />
                  <span>{isSkillPackage(item) ? t.skillPackage : displayType(item.type, t)}</span>
                  <span>{formatVersionLabel(item.latestVersion || item.version) || '-'}</span>
                  <span>{formatDate(item.updatedAt || item.publishedAt, locale)}</span>
                  <span className="table-actions">
                    <button className="table-action" type="button" onClick={() => openVersions(item)}><Calendar size={14} /><span>{t.creatorVersions}</span></button>
                    <button className="table-action" type="button" onClick={() => onDetails(item)}><ArrowRight size={14} /><span>{t.creatorOpenMarket}</span></button>
                    <button className="table-action is-danger" type="button" disabled={unpublishingKey === key} onClick={() => onUnpublishLatest(item)}><Trash2 size={14} /><span>{t.adminUnpublishLatest}</span></button>
                  </span>
                </div>;
              })}
            </div>
          ) : <EmptyInline title={t.adminNoPublishedComponents} body={t.emptyBody} />}
        </section>

        <section className="creator-table-section">
          <div className="table-head">
            <div><span className="section-kicker"><MessageSquare size={14} />{t.adminComments}</span><h2>{t.adminComments}</h2></div>
          </div>
          {comments.length ? (
            <div className="admin-comment-table" role="table" aria-label={t.adminComments}>
              <div className="admin-comment-row is-head" role="row"><span>{t.name}</span><span>{t.adminCommentAuthor}</span><span>{t.adminCommentContent}</span><span>{t.adminCommentStatus}</span><span>{t.manage}</span></div>
              {comments.map((comment) => (
                <div className="admin-comment-row" role="row" key={comment.id}>
                  <span><strong>{comment.itemId}</strong><small>{displayType(comment.itemType, t)}</small></span>
                  <span><strong>{comment.author}</strong><small>{comment.userId}</small></span>
                  <span className="admin-comment-content"><small>{comment.sentiment === 'positive' ? t.commentPositive : t.commentNegative}</small>{comment.content}</span>
                  <span>{comment.status === 'hidden' ? t.adminCommentHidden : t.adminCommentVisible}</span>
                  <span className="table-actions"><button className={comment.status === 'hidden' ? 'table-action' : 'table-action is-danger'} type="button" disabled={moderatingCommentID === comment.id} onClick={() => onModerateComment(comment)}>{comment.status === 'hidden' ? <RefreshCw size={13} /> : <X size={13} />}<span>{comment.status === 'hidden' ? t.adminCommentRestore : t.adminCommentHide}</span></button></span>
                </div>
              ))}
            </div>
          ) : <EmptyInline title={t.adminNoComments} body={t.commentEmpty} />}
        </section>
      </div>
      {versionState.item ? <VersionHistoryModal state={versionState} locale={locale} t={t} onClose={() => setVersionState({ item: null, status: 'idle', versions: [], error: '' })} /> : null}
      {reviewDetailState.item ? (
        <ReviewDetailModal
          state={reviewDetailState}
          locale={locale}
          t={t}
          reviewingKey={reviewingKey}
          onReview={onReview}
          onClose={() => setReviewDetailState({ item: null, status: 'idle', detail: null, error: '' })}
        />
      ) : null}
    </section>
  );
}

export function ComponentCell({ item, locale }) {
  return <span className="component-cell"><img src={item.icon || item.screenshot} alt="" /><span><strong>{localized(item.name, locale) || item.id}</strong><small>{item.id}</small></span></span>;
}
