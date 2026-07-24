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
  mergeCatalogItem,
  normalizeReviewStatusForUI,
  localized,
  displayType,
} from '../domain/market';
import { formatVersionLabel } from '../domain/version';
import {
  formatBytes,
  formatDate,
} from './formatters';

export function VersionHistoryModal({ state, locale, t, onClose }) {
  const item = state.item;
  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={onClose}>
      <section className="version-modal" role="dialog" aria-modal="true" aria-label={t.creatorVersionHistory} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{t.creatorVersionHistory}</h2>
            <p>{localized(item?.name, locale) || item?.id}</p>
          </div>
          <button className="modal-close inline" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        </div>
        {state.status === 'loading' ? <StateNotice title={t.loadingTitle} body={t.loadingBody} /> : null}
        {state.status === 'error' ? <StateNotice tone="error" title={t.loadingErrorTitle} body={state.error} /> : null}
        {state.status === 'ready' && state.versions.length ? (
          <div className="version-list">
            {state.versions.map((version) => (
              <div className="version-row" key={version.version}>
                <span>
                  <strong>{formatVersionLabel(version.version)}</strong>
                  {version.version === (item.version || item.latestVersion) ? <small>{t.creatorCurrentVersion}</small> : null}
                </span>
                <span>{formatDate(version.publishedAt, locale)}</span>
                <span>{Object.keys(version.assets || {}).length || Object.keys(version.platforms || {}).length} {t.assets}</span>
              </div>
            ))}
          </div>
        ) : null}
        {state.status === 'ready' && !state.versions.length ? <EmptyInline title={t.creatorNoVersions} body={t.emptyBody} /> : null}
      </section>
    </div>
  );
}

export function ReviewBadge({ status, t }) {
  const normalized = normalizeReviewStatusForUI(status);
  const label = normalized === 'approved' ? t.reviewApproved : normalized === 'rejected' ? t.reviewRejected : t.reviewPending;
  return <span className={`review-badge is-${normalized}`}>{label}</span>;
}

export function EmptyInline({ title, body }) {
  return (
    <div className="empty-inline">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

export function ReviewDetailModal({ state, locale, t, reviewingKey, onReview, onClose }) {
  const [tab, setTab] = useState('review');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const rawItem = state.detail?.item || state.item;
  const item = rawItem ? mergeCatalogItem(rawItem) : null;
  const busy = item ? reviewingKey === `${item.type}:${item.id}` : false;

  async function decide(status) {
    const normalizedNote = note.trim();
    if (status === 'rejected' && !normalizedNote) {
      setNoteError(t.reviewRejectReasonRequired);
      return;
    }
    setNoteError('');
    if (await onReview(item, status, normalizedNote)) onClose();
  }

  return (
    <div className="modal-backdrop review-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="review-detail-modal" role="dialog" aria-modal="true" aria-label={t.reviewDetailTitle} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        <header className="review-detail-header">
          <span className="section-kicker"><ShieldCheck size={14} />{t.reviewDetailTitle}</span>
          <div>
            <h2>{item ? localized(item.name, locale) || item.id : t.reviewDetailTitle}</h2>
            {item ? <code>{item.type}:{item.id}@{formatVersionLabel(item.version)}</code> : null}
          </div>
          {item ? <ReviewBadge status={item.reviewStatus} t={t} /> : null}
        </header>

        <nav className="review-tabs" aria-label={t.reviewDetailTitle}>
          <button className={tab === 'review' ? 'is-active' : ''} type="button" onClick={() => setTab('review')}>{t.reviewOverview}</button>
          <button className={tab === 'preview' ? 'is-active' : ''} type="button" onClick={() => setTab('preview')}>{t.reviewMarketPreview}</button>
        </nav>

        <div className="review-detail-scroll">
          {state.status === 'loading' ? <StateNotice title={t.reviewLoading} body="" /> : null}
          {state.status === 'error' ? <StateNotice title={t.reviewLoadFailed(state.error)} body={state.error} tone="error" /> : null}
          {state.status === 'ready' && item && tab === 'review' ? (
            <div className="review-workbench">
              <section className="review-summary-grid">
                <div><span>{t.reviewSubmittedBy}</span><strong>{state.detail.creator?.name || state.detail.creator?.username || state.detail.creator?.id || '-'}</strong><small>{state.detail.creator?.id || '-'}</small></div>
                <div><span>{t.reviewSubmittedAt}</span><strong>{formatDate(state.detail.submittedAt, locale)}</strong></div>
                <div><span>{t.reviewSubmissionType}</span><strong>{state.detail.isUpdate ? t.reviewVersionUpdate : t.reviewFirstPublish}</strong></div>
                <div><span>{t.type}</span><strong>{displayType(item.type, t)}</strong></div>
              </section>

              <ReviewSection title={t.reviewChecks} icon={ShieldCheck}>
                <div className="review-check-list">
                  {(state.detail.validationChecks || []).map((check) => (
                    <div className={`review-check is-${check.status}`} key={check.key}>
                      {check.status === 'passed' ? <CheckCircle2 size={16} /> : check.status === 'warning' ? <AlertCircle size={16} /> : <Info size={16} />}
                      <div><strong>{check.key}</strong><span>{check.message}</span></div>
                    </div>
                  ))}
                </div>
              </ReviewSection>

              <ReviewSection title={t.reviewArtifacts} icon={PackageOpen}>
                {(state.detail.artifacts || []).length ? state.detail.artifacts.map((artifact) => (
                  <article className="review-artifact" key={`${artifact.assetRole}:${artifact.platformKey}`}>
                    <div className="review-artifact-head">
                      <div><strong>{artifact.fileName || artifact.platformKey}</strong><span>{artifact.archiveType} · {formatBytes(artifact.sizeBytes)}</span></div>
                      <span>{artifact.platformKey}</span>
                    </div>
                    <dl className="review-hashes"><dt>SHA-256</dt><dd><code>{artifact.sha256}</code></dd><dt>Integrity</dt><dd><code>{artifact.integrity}</code></dd></dl>
                    <details>
                      <summary>{t.reviewFiles} ({(artifact.files || []).length})</summary>
                      <div className="review-file-list">
                        {(artifact.files || []).map((file) => <div key={file.path}><File size={13} /><code>{file.path}</code><span>{file.directory ? '-' : formatBytes(file.sizeBytes)}</span></div>)}
                      </div>
                    </details>
                  </article>
                )) : <p className="empty-detail">{t.reviewNoArtifacts}</p>}
              </ReviewSection>

              <ReviewSection title={t.dependencies} icon={Shapes}>
                <div className="review-technical-grid">
                  <ReviewCodeBlock label={t.dependencies} value={item.dependencies} />
                  <ReviewCodeBlock label={t.platforms} value={item.platforms} />
                  {item.install ? <ReviewCodeBlock label={t.installProtocol} value={item.install} /> : null}
                  {item.uninstall ? <ReviewCodeBlock label="Uninstall" value={item.uninstall} /> : null}
                  {item.detect ? <ReviewCodeBlock label="Detect" value={item.detect} /> : null}
                </div>
              </ReviewSection>

              <ReviewSection title={t.reviewChanges} icon={RefreshCw}>
                {(state.detail.changes || []).length ? (
                  <div className="review-change-list">
                    {(state.detail.changes || []).map((change) => (
                      <article key={change.field}>
                        <strong>{change.field}</strong>
                        <div><span>{t.reviewPrevious}</span><pre>{change.previous || '-'}</pre></div>
                        <div><span>{t.reviewCurrent}</span><pre>{change.current || '-'}</pre></div>
                      </article>
                    ))}
                  </div>
                ) : <p className="empty-detail">{t.reviewNoChanges}</p>}
              </ReviewSection>

              {state.detail.adpYaml ? <ReviewSection title={t.reviewADP} icon={Terminal}><pre className="review-adp">{state.detail.adpYaml}</pre></ReviewSection> : null}

              <ReviewSection title={t.reviewHistory} icon={Calendar}>
                {(state.detail.history || []).length ? (
                  <div className="review-history">
                    {(state.detail.history || []).map((event) => <div key={event.id}><ReviewBadge status={event.toStatus} t={t} /><strong>{event.actorId || '-'}</strong><span>{formatDate(event.createdAt, locale)}</span>{event.note ? <p>{event.note}</p> : null}</div>)}
                  </div>
                ) : <p className="empty-detail">{t.reviewNoHistory}</p>}
              </ReviewSection>
            </div>
          ) : null}

          {state.status === 'ready' && item && tab === 'preview' ? (
            <div className="review-market-preview">
              <div className="media-panel"><img src={item.screenshot} alt="" /></div>
              <div><span className="section-kicker">{displayType(item.type, t)}</span><h2>{localized(item.name, locale)}</h2><p>{localized(item.description, locale)}</p><div className="tag-row">{(item.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}</div></div>
              <section className="readme-section"><h3>{t.readmeFallback}</h3><p>{localized(item.readme, locale)}</p></section>
            </div>
          ) : null}
        </div>

        {state.status === 'ready' && item?.reviewStatus === 'pending' ? (
          <footer className="review-decision-bar">
            <label><span>{t.reviewDecisionNote}</span><textarea value={note} onChange={(event) => { setNote(event.target.value); setNoteError(''); }} placeholder={t.reviewDecisionPlaceholder} /></label>
            {noteError ? <small>{noteError}</small> : null}
            <div><button className="secondary-action is-danger" type="button" disabled={busy} onClick={() => decide('rejected')}><AlertCircle size={15} />{t.reviewReject}</button><button className="primary-action" type="button" disabled={busy} onClick={() => decide('approved')}><CheckCircle2 size={15} />{t.reviewApprove}</button></div>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

export function ReviewSection({ title, icon: Icon, children }) {
  return <section className="review-section"><h3><Icon size={16} />{title}</h3>{children}</section>;
}

export function ReviewCodeBlock({ label, value }) {
  return <div className="review-code-block"><strong>{label}</strong><pre>{JSON.stringify(value ?? null, null, 2)}</pre></div>;
}
