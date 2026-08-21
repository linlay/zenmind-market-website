// @ts-nocheck
import { ArrowLeft, CheckCircle2, Plus, Save, Search, X } from 'lucide-react';
import { useState } from 'react';
import { requestJSON } from '../api/client';
import { apiBase, localized } from '../domain/market';
import { formatVersionLabel } from '../domain/version';

export function MetadataEditPage({ item, currentUser, locale, t, onClose, onSubmit, isSaving }) {
  const initialPolicy = item?.accessPolicy || { mode: 'all', departmentIds: [], userIds: [] };
  const [accessMode, setAccessMode] = useState(initialPolicy.mode || 'all');
  const departments = currentUser?.organization?.departments || [];
  const [selectedDepartmentIDs, setSelectedDepartmentIDs] = useState(initialPolicy.departmentIds || []);
  const [selectedUsers, setSelectedUsers] = useState((initialPolicy.userIds || []).map((userId) => ({ userId, name: userId })));
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directoryResults, setDirectoryResults] = useState([]);
  const [directoryStatus, setDirectoryStatus] = useState('idle');

  if (!item) return null;

  function toggleDepartment(id) {
    setSelectedDepartmentIDs((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  async function searchDirectory() {
    const query = directoryQuery.trim();
    if (query.length < 2) return;
    setDirectoryStatus('loading');
    try {
      const result = await requestJSON(`${apiBase}/directory/users?q=${encodeURIComponent(query)}&limit=20`);
      setDirectoryResults(result.items || []);
      setDirectoryStatus('ready');
    } catch {
      setDirectoryResults([]);
      setDirectoryStatus('error');
    }
  }

  return (
    <section className="publish-page" aria-label={t.editMetadataTitle}>
      <div className="publish-page-head">
        <div>
          <h2>{t.editMetadataTitle}</h2>
          <p>{t.editMetadataBody(formatVersionLabel(item.version || item.latestVersion))}</p>
        </div>
      </div>
      <form className="publish-form publish-form-guided" onSubmit={onSubmit}>
        <input name="type" type="hidden" value={item.type} />
        <input name="id" type="hidden" value={item.id} />
        <input name="version" type="hidden" value={item.version || item.latestVersion} />

        <section className="publish-section full">
          <h3>{t.publishBasicInfo}</h3>
          <div className="publish-section-grid">
            <label>
              <span>{t.componentId}</span>
              <input value={item.id} readOnly />
              <small className="field-hint">{t.editMetadataLocked}</small>
            </label>
            <label>
              <span>{t.version}</span>
              <input value={formatVersionLabel(item.version || item.latestVersion)} readOnly />
              <small className="field-hint">{t.editMetadataLocked}</small>
            </label>
            <label className="full">
              <span className="required-field-label">{t.name}</span>
              <input name="name" required defaultValue={localized(item.name, locale)} />
            </label>
            <label className="full">
              <span className="required-field-label">{t.description}</span>
              <textarea name="description" rows="4" required defaultValue={localized(item.description, locale)} />
            </label>
            <label className="full">
              <span>{t.tags}</span>
              <input name="tags" defaultValue={(item.tags || []).join(', ')} placeholder="AI, Tool" />
            </label>
            <label className="full">
              <span>{t.readme}</span>
              <textarea name="readme" rows="7" defaultValue={localized(item.readme, locale)} />
            </label>
            <label className="full">
              <span>{t.editMetadataJSON}</span>
              <textarea name="metadata" rows="7" defaultValue={JSON.stringify(item.metadata || {}, null, 2)} spellCheck="false" />
              <small className="field-hint">{t.editMetadataJSONHint}</small>
            </label>
          </div>
        </section>

        <section className="publish-section full">
          <h3>{t.accessScope}</h3>
          <div className="publish-section-grid">
            {['all', 'department', 'users'].map((mode) => (
              <label className="checkbox-field" key={mode}>
                <input name="accessMode" type="radio" value={mode} checked={accessMode === mode} onChange={() => setAccessMode(mode)} />
                <span>{mode === 'all' ? t.accessAll : mode === 'department' ? t.accessDepartment : t.accessUsers}</span>
              </label>
            ))}
            {accessMode === 'all' ? <small className="field-hint full">{t.accessAllHint}</small> : null}
            {accessMode === 'department' ? (
              <div className="skill-picker full">
                {departments.length ? departments.map((department) => (
                  <label className={selectedDepartmentIDs.includes(department.id) ? 'skill-picker-option is-selected' : 'skill-picker-option'} key={department.id}>
                    <input name="accessDepartmentIds" type="checkbox" value={department.id} checked={selectedDepartmentIDs.includes(department.id)} onChange={() => toggleDepartment(department.id)} />
                    <span><strong>{department.name || department.id}</strong><small>{department.id}</small></span>
                    {selectedDepartmentIDs.includes(department.id) ? <CheckCircle2 size={15} /> : null}
                  </label>
                )) : <p className="skill-picker-empty">{t.accessNoDepartment}</p>}
              </div>
            ) : null}
            {accessMode === 'users' ? (
              <div className="skill-picker full">
                {selectedUsers.map((user) => <input name="accessUserIds" type="hidden" value={user.userId} key={user.userId} />)}
                <div className="skill-picker-search">
                  <Search size={14} />
                  <input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void searchDirectory(); } }} placeholder={t.accessUserSearch} />
                  <button type="button" className="secondary-action" onClick={() => void searchDirectory()} disabled={directoryStatus === 'loading'}>{directoryStatus === 'loading' ? t.loading : t.accessSearch}</button>
                </div>
                {selectedUsers.map((user) => (
                  <button type="button" className="skill-picker-option is-selected" onClick={() => setSelectedUsers((current) => current.filter((entry) => entry.userId !== user.userId))} key={`selected-${user.userId}`}>
                    <span><strong>{user.name || user.userId}</strong><small>{user.userId}</small></span><X size={15} />
                  </button>
                ))}
                {directoryResults.filter((user) => !selectedUsers.some((entry) => entry.userId === user.userId)).map((user) => (
                  <button type="button" className="skill-picker-option" onClick={() => setSelectedUsers((current) => [...current, user])} key={user.userId}>
                    <span><strong>{user.name || user.userId}</strong><small>{user.userId} · {user.departmentName || '—'}</small></span><Plus size={15} />
                  </button>
                ))}
                {directoryStatus === 'error' ? <small className="field-hint">{t.accessDirectoryError}</small> : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="publish-section full artifact-guardrail">
          <h3>{t.editMetadataArtifactTitle}</h3>
          <p>{t.editMetadataArtifactBody}</p>
        </section>
        <footer className="modal-actions">
          <button className="secondary-action" type="button" onClick={onClose} disabled={isSaving}><ArrowLeft size={15} /><span>{t.cancel}</span></button>
          <button className="primary-action" type="submit" disabled={isSaving}><Save size={15} /><span>{isSaving ? t.editMetadataSaving : t.editMetadataSubmit}</span></button>
        </footer>
      </form>
    </section>
  );
}
