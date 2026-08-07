// @ts-nocheck
import { ListChecks, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { errorMessage, requestJSON } from '../api/client';
import { apiBase, displayType, isSkillPackage } from '../domain/market';
import { formatVersionLabel } from '../domain/version';
import { formatDate } from '../shared/formatters';
import { EmptyInline, ReviewDetailModal } from '../shared/ManagementViews';
import { ComponentCell } from '../admin/AdminCenter';

export function SecurityReviewCenter({ pendingItems, locale, t, onReview, reviewingKey, onReload, isLoading }) {
  const [detailState, setDetailState] = useState({ item: null, status: 'idle', detail: null, error: '' });

  async function openDetail(item) {
    setDetailState({ item, status: 'loading', detail: null, error: '' });
    try {
      const detail = await requestJSON(`${apiBase}/security/reviews/${encodeURIComponent(item.type)}/${encodeURIComponent(item.id)}`);
      setDetailState({ item, status: 'ready', detail, error: '' });
    } catch (reason) {
      setDetailState({ item, status: 'error', detail: null, error: errorMessage(reason) });
    }
  }

  return (
    <section className="creator-center admin-center security-review-center">
      <div className="creator-hero">
        <div>
          <span className="section-kicker"><ShieldCheck size={14} />{t.securityReview}</span>
          <h1>{t.securityReview}</h1>
          <p>{t.securityReviewSubtitle}</p>
        </div>
      </div>
      <div className="admin-scroll">
        <section className="creator-table-section">
          <div className="table-head">
            <div><span className="section-kicker"><ListChecks size={14} />{t.securityPending}</span><h2>{t.securityPending}</h2></div>
            <button className="table-action" type="button" onClick={onReload} disabled={isLoading}><RefreshCw size={13} /><span>{t.reviewLoadAdminData}</span></button>
          </div>
          {pendingItems.length ? (
            <div className="admin-table" role="table" aria-label={t.securityPending}>
              <div className="admin-table-row is-head" role="row"><span>{t.name}</span><span>{t.type}</span><span>{t.creatorVersion}</span><span>{t.creatorUpdatedAt}</span><span>{t.manage}</span></div>
              {pendingItems.map((item) => <div className="admin-table-row" role="row" key={`${item.type}:${item.id}`}>
                <ComponentCell item={item} locale={locale} />
                <span>{isSkillPackage(item) ? t.skillPackage : displayType(item.type, t)}</span>
                <span>{formatVersionLabel(item.version || item.latestVersion) || '-'}</span>
                <span>{formatDate(item.updatedAt || item.publishedAt, locale)}</span>
                <span className="table-actions"><button className="table-action" type="button" disabled={reviewingKey === `${item.type}:${item.id}`} onClick={() => openDetail(item)}><ListChecks size={14} /><span>{t.reviewOpen}</span></button></span>
              </div>)}
            </div>
          ) : <EmptyInline title={t.securityNoPending} body={t.securityOnlyPendingHint} />}
        </section>
      </div>
      {detailState.item ? <ReviewDetailModal state={detailState} locale={locale} t={t} reviewingKey={reviewingKey} onReview={onReview} reviewScope="security" onClose={() => setDetailState({ item: null, status: 'idle', detail: null, error: '' })} /> : null}
    </section>
  );
}
