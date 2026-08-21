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
  publishTypeOptions,
  filterPublishSkills,
  artifactRequiredFor,
  supportsADPFor,
  archiveOptionsFor,
  defaultArchiveTypeFor,
} from '../domain/publishing';
import {
  apiBase,
  isMarketTypeVisible,
  localized,
  normalizeType,
  skillCategoryFilters,
  skillLevelOptions,
  skillScenarioOptions,
} from '../domain/market';
import { nextPatchVersion } from '../domain/version';
import {
  platformDependencies,
  platformForKey,
  preferredPlatformKey,
} from '../domain/platform';

export function PublishPage({ t, locale, availableSkills = [], initialItem = null, currentUser = null, onClose, onSubmit, isPublishing }) {
  const updateMode = Boolean(initialItem);
  const initialType = updateMode ? normalizeType(initialItem.type) : 'agent';
  const initialSkillKind = updateMode && initialType === 'skill' ? initialItem.skillKind || 'single' : 'single';
  const initialSandboxKind = updateMode ? initialItem.sandboxKind || 'environment-template' : 'environment-template';
  const initialWebsiteKind = updateMode ? initialItem.websiteKind || 'local-app' : 'local-app';
  const initialPlatformKey = updateMode ? preferredPlatformKey(initialItem) || 'universal' : 'universal';
  const initialPlatform = updateMode ? platformForKey(initialItem, initialPlatformKey) : null;
  const initialAsset = updateMode ? initialItem.assetMap?.[initialPlatformKey] : null;
  const initialPlatformOS = initialPlatform?.os && initialPlatform.os !== 'universal' ? initialPlatform.os : 'universal';
  const initialPlatformArch = initialPlatformOS === 'universal' ? '' : initialPlatform?.arch || '';
	const initialVariants = updateMode && initialItem.platformOptions?.length
	  ? initialItem.platformOptions.map((key, index) => {
	    const spec = platformForKey(initialItem, key) || {};
	    return { id: index + 1, os: spec.os || (key === 'universal' ? 'universal' : key.split('-')[0]), arch: spec.arch || key.split('-')[1] || '', archiveType: initialItem.assetMap?.[key]?.archiveType || defaultArchiveTypeFor(initialType, { sandboxKind: initialSandboxKind, websiteKind: initialWebsiteKind }) };
	  })
	  : [{ id: 1, os: initialPlatformOS, arch: initialPlatformArch, archiveType: initialAsset?.archiveType || defaultArchiveTypeFor(initialType, { sandboxKind: initialSandboxKind, websiteKind: initialWebsiteKind }) }];
  const [step, setStep] = useState(updateMode ? 'details' : 'type');
  const [type, setType] = useState(initialType);
  const [archiveType, setArchiveType] = useState(initialAsset?.archiveType || defaultArchiveTypeFor(initialType, { sandboxKind: initialSandboxKind, websiteKind: initialWebsiteKind }));
  const [sandboxKind, setSandboxKind] = useState(initialSandboxKind);
  const [websiteKind, setWebsiteKind] = useState(initialWebsiteKind);
  const [skillKind, setSkillKind] = useState(initialSkillKind);
  const [showAdvanced, setShowAdvanced] = useState(updateMode);
	const [platformVariants, setPlatformVariants] = useState(initialVariants);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillIDs, setSelectedSkillIDs] = useState(updateMode ? (initialItem.includedSkills || []).map((skill) => skill.id) : []);
  const [mcpSearch, setMCPSearch] = useState('');
  const [mcpServers, setMCPServers] = useState([]);
  const [mcpStatus, setMCPStatus] = useState('idle');
  const [selectedMCP, setSelectedMCP] = useState(updateMode && initialType === 'mcp' ? {
    code: initialItem.mcpServerCode,
    name: localized(initialItem.name, locale),
    description: localized(initialItem.description, locale),
    endpointUrl: initialItem.mcpEndpointUrl,
    configVersion: initialItem.mcpGatewayConfigVersion,
    tools: initialItem.mcpTools || [],
  } : null);
  const initialAccessPolicy = initialItem?.accessPolicy || { mode: 'all', departmentIds: [], userIds: [] };
  const [accessMode, setAccessMode] = useState(initialAccessPolicy.mode === 'all' ? 'all' : 'restricted');
  const departments = currentUser?.organization?.departments || [];
  const [selectedDepartmentIDs, setSelectedDepartmentIDs] = useState(
    updateMode
      ? initialAccessPolicy.departmentIds || []
      : (initialAccessPolicy.departmentIds?.length
        ? initialAccessPolicy.departmentIds
        : departments.filter((department) => department.primary).map((department) => department.id)),
  );
  const [selectedUsers, setSelectedUsers] = useState(
    (initialAccessPolicy.userIds || []).map((userId) => ({ userId, name: userId })),
  );
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directoryResults, setDirectoryResults] = useState([]);
  const [directoryStatus, setDirectoryStatus] = useState('idle');

  const publishTypes = publishTypeOptions();
  const visiblePublishTypes = updateMode
    ? publishTypes
    : publishTypes.filter((option) => isMarketTypeVisible(option.type));
  const selectedTypeID = type === 'skill' && skillKind === 'package' ? 'skill-package' : type;
  const selectedType = publishTypes.find((entry) => entry.id === selectedTypeID) || publishTypes[0];
  const SelectedIcon = selectedType?.icon || PackageOpen;
  const artifactRequired = artifactRequiredFor(type, { websiteKind, skill: { kind: skillKind } });
  const supportsADP = supportsADPFor(type, { skill: { kind: skillKind } });
  const showAssetSection = type !== 'mcp' && (!(type === 'skill' && skillKind === 'package') || supportsADP);
  const filteredSkills = filterPublishSkills(availableSkills, skillSearch, locale);
  const selectedMCPMarketID = String(selectedMCP?.code || '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');

  const loadMCPServers = useCallback(async (query = '') => {
    setMCPStatus('loading');
    try {
      const result = await requestJSON(`${apiBase}/mcp-gateway/servers${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
      setMCPServers(result.items || []);
      setMCPStatus('ready');
    } catch (reason) {
      setMCPServers([]);
      setMCPStatus('error');
    }
  }, []);

  useEffect(() => {
    if (type === 'mcp' && step === 'details' && !updateMode && mcpStatus === 'idle') loadMCPServers();
  }, [loadMCPServers, mcpStatus, step, type, updateMode]);

  function applyPublishType(option) {
    const nextType = normalizeType(option.type);
    const nextSkillKind = option.skillKind || 'single';
    setType(nextType);
    setSkillKind(nextType === 'skill' ? nextSkillKind : 'single');
    const nextSandboxKind = nextType === 'sandbox-image' ? 'environment-template' : sandboxKind;
    const nextWebsiteKind = nextType === 'website-app' ? 'local-app' : websiteKind;
    if (nextType === 'sandbox-image') setSandboxKind(nextSandboxKind);
    if (nextType === 'website-app') setWebsiteKind(nextWebsiteKind);
    setArchiveType(defaultArchiveTypeFor(nextType, { sandboxKind: nextSandboxKind, websiteKind: nextWebsiteKind }));
    setShowAdvanced(false);
	setPlatformVariants([{ id: Date.now(), os: 'universal', arch: '', archiveType: defaultArchiveTypeFor(nextType, { sandboxKind: nextSandboxKind, websiteKind: nextWebsiteKind }) }]);
    setSkillSearch('');
    setSelectedSkillIDs([]);
    setSelectedMCP(null);
    setStep('details');
  }

	function updatePlatformVariant(id, patch) {
	  setPlatformVariants((current) => current.map((variant) => variant.id === id ? { ...variant, ...patch } : variant));
	}

	function addPlatformVariant() {
	  setPlatformVariants((current) => [...current, { id: Date.now(), os: 'windows', arch: 'amd64', archiveType: defaultArchiveTypeFor(type, { sandboxKind, websiteKind }) }]);
	}

	function removePlatformVariant(id) {
	  setPlatformVariants((current) => current.length > 1 ? current.filter((variant) => variant.id !== id) : current);
	}

  function toggleIncludedSkill(skillID) {
    setSelectedSkillIDs((current) => (
      current.includes(skillID) ? current.filter((id) => id !== skillID) : [...current, skillID]
    ));
  }

  function toggleDepartment(departmentID) {
    setSelectedDepartmentIDs((current) => current.includes(departmentID)
      ? current.filter((id) => id !== departmentID)
      : [...current, departmentID]);
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

  function addAccessUser(user) {
    setSelectedUsers((current) => current.some((entry) => entry.userId === user.userId) ? current : [...current, user]);
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

  function renderStepIndicator() {
    return (
      <div className="publish-steps" aria-label={t.publishTitle}>
        <span className="is-active"><strong>1</strong>{t.publishStepType}</span>
        <i />
        <span className={step === 'details' ? 'is-active' : ''}><strong>2</strong>{t.publishStepDetails}</span>
      </div>
    );
  }

  function renderTypePicker() {
    return (
      <div className="publish-picker">
        <div className="publish-picker-head">
          <h3>{t.publishChooseType}</h3>
          <p>{t.publishChooseTypeBody}</p>
        </div>
        <div className="publish-type-grid">
          {visiblePublishTypes.map((option) => {
            const Icon = option.icon;
            return (
              <button className="publish-type-card" type="button" key={option.id} onClick={() => applyPublishType(option)}>
                <span className="publish-type-icon"><Icon size={20} /></span>
                <strong>{option.label(t)}</strong>
                <small>{t.publishTypeDescriptions[option.id]}</small>
                <em>{t.publishTypeRequirements}: {t.publishTypeRequirementsMap[option.id]}</em>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
      <section className="publish-page" aria-label={updateMode ? t.publishVersionTitle : t.publishTitle}>
        <div className="publish-page-head">
          <div>
            <h2>{updateMode ? t.publishVersionTitle : t.publishTitle}</h2>
            <p>{updateMode ? t.publishVersionBody : t.publishBody}</p>
          </div>
        </div>
        {!updateMode ? renderStepIndicator() : null}
        {step === 'type' ? renderTypePicker() : null}
        {step === 'details' ? (
        <form className="publish-form publish-form-guided" onSubmit={onSubmit} key={`${type}:${skillKind}`}>
          <div className="publish-selected full">
            {!updateMode ? <button className="secondary-action" type="button" onClick={() => setStep('type')} disabled={isPublishing}>
              <ArrowRight size={14} />
              <span>{t.publishBackToTypes}</span>
            </button> : null}
            <span className="publish-selected-card">
              <SelectedIcon size={18} />
              <strong>{selectedType.label(t)}</strong>
              <small>{t.publishTypeRequirementsMap[selectedType.id]}</small>
            </span>
          </div>
          <input name="type" type="hidden" value={type} />
          <input name="archiveType" type="hidden" value={archiveType} />
          {updateMode ? <input name="existingMetadata" type="hidden" value={JSON.stringify(initialItem.metadata || {})} /> : null}
          {type === 'skill' ? <input name="skillKind" type="hidden" value={skillKind} /> : null}
          {type === 'mcp' ? (
            <section className="publish-section full">
              <h3>{t.mcpGatewaySource}</h3>
              {updateMode ? (
                <div className="mcp-selected-source">
                  <strong>{selectedMCP?.name || selectedMCP?.code}</strong>
                  <code>{selectedMCP?.endpointUrl}</code>
                </div>
              ) : (
                <div className="mcp-picker">
                  <div className="mcp-picker-search">
                    <Search size={15} />
                    <input value={mcpSearch} onChange={(event) => setMCPSearch(event.target.value)} placeholder={t.mcpGatewaySearch} />
                    <button className="secondary-action" type="button" onClick={() => loadMCPServers(mcpSearch)}>{t.mcpGatewaySearchAction}</button>
                  </div>
                  {mcpStatus === 'loading' ? <p className="skill-picker-empty">{t.mcpGatewayLoading}</p> : null}
                  {mcpStatus !== 'loading' && !mcpServers.length ? <p className="skill-picker-empty">{t.mcpGatewayEmpty}</p> : null}
                  <div className="mcp-picker-list">
                    {mcpServers.map((server) => (
                      <button
                        className={selectedMCP?.code === server.code ? 'mcp-picker-option is-selected' : 'mcp-picker-option'}
                        type="button"
                        key={server.code}
                        onClick={() => setSelectedMCP(server)}
                      >
                        <span><strong>{server.name || server.code}</strong><small>{server.code} · {server.toolCount} tools</small></span>
                        <small>{server.description || server.endpointUrl}</small>
                        {selectedMCP?.code === server.code ? <CheckCircle2 size={16} /> : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <input name="mcpServerCode" type="hidden" value={selectedMCP?.code || ''} />
              <input name="mcpEndpointUrl" type="hidden" value={selectedMCP?.endpointUrl || ''} />
              <input name="mcpGatewayConfigVersion" type="hidden" value={selectedMCP?.configVersion || ''} />
              <input name="mcpTools" type="hidden" value={JSON.stringify(selectedMCP?.tools || [])} />
            </section>
          ) : null}
          <section className="publish-section full" key={type === 'mcp' ? selectedMCP?.code || 'mcp-empty' : 'basic'}>
            <h3>{t.publishBasicInfo}</h3>
            <div className="publish-section-grid">
              <label>
                <span className="required-field-label">{t.componentId}</span>
                <input name="id" required readOnly={updateMode || type === 'mcp'} defaultValue={updateMode ? initialItem.id : type === 'mcp' ? selectedMCPMarketID : ''} placeholder="my-agent" pattern="[a-z0-9._-]+" />
                {updateMode ? <small className="field-hint">{t.publishVersionLocked}</small> : null}
              </label>
              <label>
                <span className="required-field-label">{t.name}</span>
                <input name="name" required defaultValue={updateMode ? localized(initialItem.name, locale) : type === 'mcp' ? selectedMCP?.name || '' : ''} placeholder="My Agent" />
              </label>
              <label>
                <span className="required-field-label">{t.version}</span>
                <input name="version" required defaultValue={updateMode ? nextPatchVersion(initialItem.version) : '1.0.0'} />
              </label>
              <label>
                <span>{t.image}</span>
                <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
              </label>
              <label className="full">
                <span className="required-field-label">{t.description}</span>
                <textarea name="description" rows="4" required defaultValue={updateMode ? localized(initialItem.description, locale) : type === 'mcp' ? selectedMCP?.description || '' : ''} />
              </label>
            </div>
          </section>

          {(type === 'skill' || type === 'sandbox-image' || type === 'website-app' || type === 'software-package') ? (
            <section className="publish-section full">
              <h3>{t.publishTypeSettings}</h3>
              <div className="publish-section-grid">
          {type === 'skill' ? (
            <>
              <label>
                <span className="required-field-label">{t.skillCategoryTitle}</span>
                <select name="skillCategory" required defaultValue={updateMode ? initialItem.skillCategory || 'other' : 'other'}>
                  {skillCategoryFilters.filter((category) => category !== 'all').map((category) => <option value={category} key={category}>{t.skillCategories[category]}</option>)}
                </select>
              </label>
              <label>
                <span className="required-field-label">{t.skillScenario}</span>
                <select name="skillScenario" required defaultValue={updateMode ? initialItem.skillScenario || 'productivity' : 'productivity'}>
                  {skillScenarioOptions.map((scenario) => <option value={scenario} key={scenario}>{t.skillScenarios[scenario]}</option>)}
                </select>
              </label>
              <label>
                <span className="required-field-label">{t.skillLevel}</span>
                <select name="skillLevel" required defaultValue={updateMode ? initialItem.skillLevel || 'beginner' : 'beginner'}>
                  {skillLevelOptions.map((level) => <option value={level} key={level}>{t.skillLevels[level]}</option>)}
                </select>
              </label>
              {skillKind === 'package' ? (
                <div className="skill-picker full">
                  <div className="skill-picker-head">
                    <span className="required-field-label">{t.includedSkills}</span>
                    <small>{t.includedSkillsSelected(selectedSkillIDs.length)}</small>
                  </div>
                  <label className="skill-picker-search">
                    <Search size={14} />
                    <input value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} placeholder={t.includedSkillsSearch} />
                  </label>
                  <div className="skill-picker-list">
                    {filteredSkills.length ? filteredSkills.map((skill) => {
                      const checked = selectedSkillIDs.includes(skill.id);
                      return (
                        <label className={checked ? 'skill-picker-option is-selected' : 'skill-picker-option'} key={skill.id}>
                          <input
                            name="includedSkills"
                            type="checkbox"
                            value={skill.id}
                            checked={checked}
                            onChange={() => toggleIncludedSkill(skill.id)}
                          />
                          <span>
                            <strong>{localized(skill.name, locale) || skill.id}</strong>
                            <small>{skill.id}</small>
                          </span>
                          {checked ? <CheckCircle2 size={15} /> : null}
                        </label>
                      );
                    }) : (
                      <p className="skill-picker-empty">{availableSkills.length ? t.emptyTitle : t.noAvailableSkills}</p>
                    )}
                  </div>
                  <small className="field-hint">{availableSkills.length ? t.includedSkillsHint : t.noAvailableSkills}</small>
                </div>
              ) : null}
              <label className="checkbox-field">
                <input name="skillFeatured" type="checkbox" defaultChecked={updateMode && initialItem.skillFeatured} />
                <span>{t.skillFeatured}</span>
              </label>
            </>
          ) : null}
          {type === 'sandbox-image' ? (
            <label>
              <span className="required-field-label">{t.sandboxKind}</span>
              <select name="sandboxKind" required value={sandboxKind} onChange={handleSandboxKindChange}>
                <option value="environment-template">environment-template</option>
                <option value="container-image">container-image</option>
              </select>
            </label>
          ) : null}
          {type === 'website-app' ? (
            <label>
              <span className="required-field-label">{t.websiteKind}</span>
              <select name="websiteKind" required value={websiteKind} onChange={handleWebsiteKindChange}>
                <option value="local-app">local-app</option>
                <option value="external">external</option>
              </select>
            </label>
          ) : null}
          {type === 'website-app' && websiteKind === 'external' ? (
            <label className="full">
              <span className="required-field-label">{t.metadataUrl}</span>
              <input name="metadataUrl" type="url" required defaultValue={updateMode ? initialItem.metadata?.url || '' : ''} placeholder="https://example.com/app" />
            </label>
          ) : null}
          {(type === 'software-package' || type === 'sandbox-image') ? (
            <label>
              <span className="required-field-label">{t.archiveType}</span>
              <select name="archiveTypeVisible" required value={archiveType} onChange={(event) => setArchiveType(event.target.value)}>
                {archiveOptionsFor(type, { sandboxKind }).map((option) => <option value={option} key={option}>{option}</option>)}
              </select>
            </label>
          ) : null}
              </div>
            </section>
          ) : null}

          {showAssetSection ? (
            <section className="publish-section full">
              <h3>{t.publishRequiredAssets}</h3>
              <div className="publish-section-grid platform-variant-list">
                {!(type === 'skill' && skillKind === 'package') ? (
                  <>
                    {platformVariants.map((variant, index) => (
                      <div className="publish-field-card platform-variant-card full" key={variant.id}>
                        <input name="variantIndex" type="hidden" value={index} />
                        <label>
                          <span>{t.os}</span>
                          <select name={`variantOS.${index}`} value={variant.os} onChange={(event) => updatePlatformVariant(variant.id, { os: event.target.value, arch: event.target.value === 'universal' ? '' : variant.arch })}>
                            <option value="universal">universal</option><option value="darwin">darwin</option><option value="linux">linux</option><option value="windows">windows</option>
                          </select>
                        </label>
                        <label>
                          <span>{t.arch}</span>
                          <select name={`variantArch.${index}`} required={variant.os !== 'universal'} disabled={variant.os === 'universal'} value={variant.arch} onChange={(event) => updatePlatformVariant(variant.id, { arch: event.target.value })}>
                            <option value="">—</option><option value="arm64">arm64</option><option value="amd64">amd64</option><option value="arm">arm</option><option value="386">386</option>
                          </select>
                        </label>
                        <label>
                          <span>{t.archiveType}</span>
                          <select name={`variantArchiveType.${index}`} value={variant.archiveType} onChange={(event) => updatePlatformVariant(variant.id, { archiveType: event.target.value })}>
                            {archiveOptionsFor(type, { sandboxKind }).map((option) => <option value={option} key={option}>{option}</option>)}
                          </select>
                        </label>
                        <label>
                          <span className={artifactRequired ? 'required-field-label' : ''}>{t.artifact}</span>
                          <input name={`variantArtifact.${index}`} type="file" required={artifactRequired} />
                        </label>
                        <button className="secondary-action" type="button" disabled={platformVariants.length === 1} onClick={() => removePlatformVariant(variant.id)}><Trash2 size={14} /><span>{t.removePlatformVariant}</span></button>
                      </div>
                    ))}
                    <button className="secondary-action" type="button" onClick={addPlatformVariant}><Plus size={14} /><span>{t.addPlatformVariant}</span></button>
                    {type === 'skill' ? <small className="field-hint full">{t.skillArtifactVersionHint}</small> : null}
                    {!artifactRequired ? <small className="field-hint full">{t.artifactOptional}</small> : null}
                  </>
                ) : null}
                {supportsADP ? (
                  <label className="full">
                    <span>{t.adpManifest}</span>
                    <input name="adpManifest" type="file" accept=".yaml,.yml,text/yaml,application/x-yaml" />
                    <small className="field-hint">{t.adpManifestHint}</small>
                  </label>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="publish-section full">
            <h3>{t.accessScope}</h3>
            <div className="publish-section-grid">
              <label className="checkbox-field">
                <input name="accessMode" type="radio" value="all" checked={accessMode === 'all'} onChange={() => setAccessMode('all')} />
                <span>{t.accessAll}</span>
              </label>
              <label className="checkbox-field">
                <input name="accessMode" type="radio" value="restricted" checked={accessMode === 'restricted'} onChange={() => setAccessMode('restricted')} />
                <span>{t.accessRestricted}</span>
              </label>
              {accessMode === 'all' ? <small className="field-hint full">{t.accessAllHint}</small> : null}
              {accessMode === 'restricted' ? (
                <div className="skill-picker full">
                  <strong className="access-picker-title">{t.accessDepartment}</strong>
                  {departments.length ? departments.map((department) => (
                    <label className={selectedDepartmentIDs.includes(department.id) ? 'skill-picker-option is-selected' : 'skill-picker-option'} key={department.id}>
                      <input name="accessDepartmentIds" type="checkbox" value={department.id} checked={selectedDepartmentIDs.includes(department.id)} onChange={() => toggleDepartment(department.id)} />
                      <span><strong>{department.name || department.id}</strong><small>{department.id}</small></span>
                    </label>
                  )) : <p className="skill-picker-empty">{t.accessNoDepartment}</p>}
                </div>
              ) : null}
              {accessMode === 'restricted' ? (
                <div className="skill-picker full">
                  <strong className="access-picker-title">{t.accessExtraUsers}</strong>
                  {selectedUsers.map((user) => <input name="accessUserIds" type="hidden" value={user.userId} key={user.userId} />)}
                  <div className="skill-picker-search">
                    <Search size={14} />
                    <input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); searchDirectory(); } }} placeholder={t.accessUserSearch} />
                    <button type="button" className="secondary-action" onClick={searchDirectory} disabled={directoryStatus === 'loading'}>{directoryStatus === 'loading' ? t.loading : t.accessSearch}</button>
                  </div>
                  {selectedUsers.map((user) => (
                    <button type="button" className="skill-picker-option is-selected" onClick={() => setSelectedUsers((current) => current.filter((entry) => entry.userId !== user.userId))} key={`selected-${user.userId}`}>
                      <span><strong>{user.name || user.userId}</strong><small>{user.userId}</small></span><X size={15} />
                    </button>
                  ))}
                  {directoryResults.filter((user) => !selectedUsers.some((entry) => entry.userId === user.userId)).map((user) => (
                    <button type="button" className="skill-picker-option" onClick={() => addAccessUser(user)} key={user.userId}>
                      <span><strong>{user.name || user.userId}</strong><small>{user.userId} · {user.departmentName || '—'}</small></span><Plus size={15} />
                    </button>
                  ))}
                  {directoryStatus === 'error' ? <small className="field-hint">{t.accessDirectoryError}</small> : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="publish-section full">
            <button className="advanced-toggle" type="button" onClick={() => setShowAdvanced((value) => !value)}>
              <span>{showAdvanced ? t.publishHideAdvanced : t.publishShowAdvanced}</span>
              <ArrowRight size={14} />
            </button>
            {showAdvanced ? (
              <div className="publish-section-grid">
                <label>
                  <span>{t.minDesktopVersion}</span>
                  <input name="platformMinDesktopVersion" defaultValue={initialPlatform?.minDesktopVersion || initialItem?.minDesktopVersion || ''} placeholder="1.2.0" />
                </label>
                <label>
                  <span>{t.tags}</span>
                  <input name="tags" defaultValue={updateMode ? (initialItem.tags || []).join(', ') : ''} placeholder="AI, Tool" />
                </label>
                <label>
                  <span>{t.author}</span>
                  <input name="author" defaultValue={updateMode ? initialItem.author || '' : ''} placeholder={t.defaultAuthor} />
                </label>
                <label className="full">
                  <span>{t.platformDescription}</span>
                  <textarea name="platformDescription" rows="3" defaultValue={initialPlatform?.description || ''} />
                </label>
                <label className="full">
                  <span>{t.platformMetadata}</span>
                  <textarea name="platformMetadata" rows="4" defaultValue={JSON.stringify(initialPlatform?.metadata || {}, null, 2)} spellCheck="false" />
                </label>
                <label className="full">
                  <span>{t.platformDependencies}</span>
                  <textarea name="platformDependencies" rows="5" defaultValue={JSON.stringify(initialPlatform?.dependencies?.length ? initialPlatform.dependencies : initialItem?.dependencies || [], null, 2)} spellCheck="false" />
                </label>
          {type === 'cli-tool' ? (
            <>
              <label className="full">
                <span>{t.installCommand}</span>
                <input name="installCommand" defaultValue={initialPlatform?.install?.command || initialItem?.install?.command || ''} placeholder="brew install zmctl" />
              </label>
              <label className="full">
                <span>{t.uninstallCommand}</span>
                <input name="uninstallCommand" defaultValue={initialPlatform?.uninstall?.command || initialItem?.uninstall?.command || ''} placeholder="brew uninstall zmctl" />
              </label>
              <label className="full">
                <span>{t.detectCommands}</span>
                <textarea name="detectCommands" rows="3" defaultValue={(initialPlatform?.detect?.commands || initialItem?.detect?.commands || []).join('\n')} placeholder="zmctl" />
              </label>
              <label className="full">
                <span>{t.versionCommand}</span>
                <input name="versionCommand" defaultValue={initialPlatform?.detect?.versionCommand || initialItem?.detect?.versionCommand || ''} placeholder="zmctl --version" />
              </label>
            </>
          ) : null}
                <label className="full">
                  <span>{t.readme}</span>
                  <textarea name="readme" rows="5" defaultValue={updateMode ? localized(initialItem.readme, locale) : ''} />
                </label>
              </div>
            ) : null}
          </section>
          <footer className="modal-actions">
            <button className="secondary-action" type="button" onClick={onClose} disabled={isPublishing}>{t.cancel}</button>
            <button className="primary-action" type="submit" disabled={isPublishing}>
              <Upload size={15} />
              <span>{isPublishing ? t.publishing : updateMode ? t.publishVersionSubmit : t.publishSubmit}</span>
            </button>
          </footer>
        </form>
        ) : null}
      </section>
  );
}
