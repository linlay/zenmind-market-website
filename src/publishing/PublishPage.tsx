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
  Trash2,
  Upload,
  User,
  BarChart3,
  ListChecks,
  MessageSquare,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  usageHintsFromMetadata,
} from '../domain/market';
import { nextPatchVersion } from '../domain/version';
import { platformForKey, preferredPlatformKey } from '../domain/platform';

export function PublishPage({ t, locale, availableSkills = [], initialItem = null, currentUser = null, onClose, onSubmit, isPublishing }) {
  const updateMode = Boolean(initialItem);
  let initialConnectorConfig = null;
  try {
    initialConnectorConfig = updateMode && initialItem.metadata?.connectorPublishConfig
      ? JSON.parse(initialItem.metadata.connectorPublishConfig)
      : null;
  } catch {
    initialConnectorConfig = null;
  }
  const initialType = updateMode ? normalizeType(initialItem.type) : 'agent';
  const initialSkillKind = updateMode && initialType === 'skill' ? initialItem.skillKind || 'single' : 'single';
  const initialSandboxKind = updateMode ? initialItem.sandboxKind || 'environment-template' : 'environment-template';
  const initialWebsiteKind = updateMode ? initialItem.websiteKind || 'local-app' : 'local-app';
  const initialPlatformKey = updateMode ? preferredPlatformKey(initialItem) || 'universal' : 'universal';
  const initialPlatform = updateMode ? platformForKey(initialItem, initialPlatformKey) : null;
  const initialAsset = updateMode ? initialItem.assetMap?.[initialPlatformKey] : null;
  const initialUsageHints = usageHintsFromMetadata(initialItem?.metadata);
  const initialPlatformOS = initialPlatform?.os && initialPlatform.os !== 'universal' ? initialPlatform.os : 'universal';
  const initialPlatformArch = initialPlatformOS === 'universal' ? '' : initialPlatform?.arch || '';
	const initialVariants = updateMode && initialItem.platformOptions?.length
	  ? initialItem.platformOptions.map((key, index) => {
	    const spec = platformForKey(initialItem, key) || {};
	    return { id: index + 1, os: spec.os || (key === 'universal' ? 'universal' : key.split('-')[0]), arch: spec.arch || key.split('-')[1] || '', archiveType: initialItem.assetMap?.[key]?.archiveType || defaultArchiveTypeFor(initialType, { sandboxKind: initialSandboxKind, websiteKind: initialWebsiteKind }) };
	  })
	  : [{ id: 1, os: initialPlatformOS, arch: initialPlatformArch, archiveType: initialAsset?.archiveType || defaultArchiveTypeFor(initialType, { sandboxKind: initialSandboxKind, websiteKind: initialWebsiteKind }) }];
  const [step, setStep] = useState(updateMode ? 'artifact' : 'type');
  const [type, setType] = useState(initialType);
  const [archiveType, setArchiveType] = useState(initialAsset?.archiveType || defaultArchiveTypeFor(initialType, { sandboxKind: initialSandboxKind, websiteKind: initialWebsiteKind }));
  const [sandboxKind, setSandboxKind] = useState(initialSandboxKind);
  const [websiteKind, setWebsiteKind] = useState(initialWebsiteKind);
  const [skillKind, setSkillKind] = useState(initialSkillKind);
  const [artifactSource, setArtifactSource] = useState('upload');
  const [connectorPackageMode, setConnectorPackageMode] = useState(initialConnectorConfig?.packageMode === 'complete' ? 'complete' : 'parts');
  const [connectorCapabilities, setConnectorCapabilities] = useState({ mcp: Boolean(initialConnectorConfig?.mcp ?? true), cli: Boolean(initialConnectorConfig?.cli), skill: Boolean(initialConnectorConfig?.hasSkill) });
  const [connectorPrimaryType, setConnectorPrimaryType] = useState(initialConnectorConfig?.primaryType || 'mcp');
  const [connectorAuthMode, setConnectorAuthMode] = useState(initialConnectorConfig?.authMode || 'null');
  const [connectorAuthBrowser, setConnectorAuthBrowser] = useState(initialConnectorConfig?.authBrowser || 'system');
  const [mcpTransport, setMCPTransport] = useState(initialConnectorConfig?.mcp?.transport || 'streamableHttp');
  const [mcpHasRuntime, setMCPHasRuntime] = useState(Boolean(initialConnectorConfig?.mcp?.runtimeType));
  const [connectorHasCLIAuth, setConnectorHasCLIAuth] = useState(Boolean(initialConnectorConfig?.cli && Object.keys(initialConnectorConfig.cli.auth || {}).length));
  const [connectorHasRuntime, setConnectorHasRuntime] = useState(Boolean(initialConnectorConfig?.cli?.runtimeType));
  const [connectorTokenFields, setConnectorTokenFields] = useState(initialConnectorConfig?.tokenSchema?.fields?.length
    ? initialConnectorConfig.tokenSchema.fields.map((field, index) => ({ ...field, id: index + 1, env: Object.entries(initialConnectorConfig.mcp?.credentialEnv || {}).find(([, key]) => key === field.key)?.[0] || field.key }))
    : [{ id: 1, key: 'API_KEY', label: 'API Key', type: 'password', env: 'API_KEY' }]);
  const [mcpStaticEnv, setMCPStaticEnv] = useState(Object.keys(initialConnectorConfig?.mcp?.staticEnv || {}).length
    ? Object.entries(initialConnectorConfig.mcp.staticEnv).map(([name, value], index) => ({ id: index + 1, name, value }))
    : [{ id: 1, name: '', value: '' }]);
  const [showConnectorAdvanced, setShowConnectorAdvanced] = useState(Boolean(initialConnectorConfig));
  const [connectorCapabilityError, setConnectorCapabilityError] = useState(false);
  const [cliTargetSystem, setCLITargetSystem] = useState(Object.keys(initialConnectorConfig?.cli?.versionCommand || {})[0] || 'darwin');
  const [cliSystemCommands, setCLISystemCommands] = useState({
    darwin: { version: initialConnectorConfig?.cli?.versionCommand?.darwin || '', init: initialConnectorConfig?.cli?.init?.darwin || '', auth: initialConnectorConfig?.cli?.auth?.darwin || '', status: initialConnectorConfig?.cli?.status?.darwin || '', unAuth: initialConnectorConfig?.cli?.unAuth?.darwin || '' },
    linux: { version: initialConnectorConfig?.cli?.versionCommand?.linux || '', init: initialConnectorConfig?.cli?.init?.linux || '', auth: initialConnectorConfig?.cli?.auth?.linux || '', status: initialConnectorConfig?.cli?.status?.linux || '', unAuth: initialConnectorConfig?.cli?.unAuth?.linux || '' },
    win32: { version: initialConnectorConfig?.cli?.versionCommand?.win32 || '', init: initialConnectorConfig?.cli?.init?.win32 || '', auth: initialConnectorConfig?.cli?.auth?.win32 || '', status: initialConnectorConfig?.cli?.status?.win32 || '', unAuth: initialConnectorConfig?.cli?.unAuth?.win32 || '' },
  });
  const [connectorTargets, setConnectorTargets] = useState([]);
  const [connectorSkillCopy, setConnectorSkillCopy] = useState(() => Object.entries(initialConnectorConfig?.skillDescriptions || {}).map(([name, description], index) => ({ id: index + 1, name, description })));
  const [showAdvanced, setShowAdvanced] = useState(updateMode);
	const [showDiscovery, setShowDiscovery] = useState(updateMode);
	const [showAccess, setShowAccess] = useState(updateMode && initialItem?.accessPolicy?.mode !== 'all');
	const [platformVariants, setPlatformVariants] = useState(initialVariants);
  const [artifactFiles, setArtifactFiles] = useState({});
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillIDs, setSelectedSkillIDs] = useState(updateMode ? (initialItem.includedSkills || []).map((skill) => skill.id) : []);
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
  const [descriptionLength, setDescriptionLength] = useState(updateMode ? localized(initialItem.description, locale).length : 0);
  const [marketPreview, setMarketPreview] = useState({
    id: updateMode ? initialItem.id : '',
    name: updateMode ? localized(initialItem.name, locale) : '',
    version: updateMode ? nextPatchVersion(initialItem.version) : '1.0.0',
    description: updateMode ? localized(initialItem.description, locale) : '',
    imageName: '',
  });

  const publishTypes = publishTypeOptions();
  const visiblePublishTypes = updateMode
    ? publishTypes
    : publishTypes.filter((option) => isMarketTypeVisible(option.type));
  const selectedTypeID = type === 'skill' && skillKind === 'package' ? 'skill-package' : type;
  const selectedType = publishTypes.find((entry) => entry.id === selectedTypeID) || publishTypes[0];
  const SelectedIcon = selectedType?.icon || PackageOpen;
  const artifactRequired = artifactRequiredFor(type, { websiteKind, skill: { kind: skillKind } });
  const supportsADP = supportsADPFor(type, { skill: { kind: skillKind } });
  const showAssetSection = !(type === 'skill' && skillKind === 'package') || supportsADP;
  const filteredSkills = filterPublishSkills(availableSkills, skillSearch, locale);
  const artifactReady = (type === 'connector' && connectorPackageMode === 'parts') || artifactSource === 'repository' || Object.values(artifactFiles).some(Boolean);
  const basicReady = Boolean(marketPreview.id.trim() && marketPreview.name.trim() && marketPreview.version.trim() && marketPreview.description.trim());
  const readiness = [true, artifactReady, basicReady].filter(Boolean).length;
  const readinessPercent = Math.round((readiness / 3) * 100);
  const enabledPrimaryCapabilities = ['mcp', 'cli'].filter((capability) => connectorCapabilities[capability]);

  function updateMarketPreview(field, value) {
    setMarketPreview((current) => ({ ...current, [field]: value }));
  }

  function applyPublishType(option) {
    const nextType = normalizeType(option.type);
    const nextSkillKind = option.skillKind || 'single';
    setType(nextType);
    setSkillKind(nextType === 'skill' ? nextSkillKind : 'single');
    setArtifactSource('upload');
    const nextSandboxKind = nextType === 'sandbox-image' ? 'environment-template' : sandboxKind;
    const nextWebsiteKind = nextType === 'website-app' ? 'local-app' : websiteKind;
    if (nextType === 'sandbox-image') setSandboxKind(nextSandboxKind);
    if (nextType === 'website-app') setWebsiteKind(nextWebsiteKind);
    setArchiveType(defaultArchiveTypeFor(nextType, { sandboxKind: nextSandboxKind, websiteKind: nextWebsiteKind }));
    setShowAdvanced(false);
	setPlatformVariants([{ id: Date.now(), os: 'universal', arch: '', archiveType: defaultArchiveTypeFor(nextType, { sandboxKind: nextSandboxKind, websiteKind: nextWebsiteKind }) }]);
    setSkillSearch('');
    setSelectedSkillIDs([]);
    setStep('artifact');
  }

	function updatePlatformVariant(id, patch) {
	  setPlatformVariants((current) => current.map((variant) => variant.id === id ? { ...variant, ...patch } : variant));
	}

  function addPlatformVariant() {
	  setPlatformVariants((current) => [...current, { id: Date.now(), os: 'windows', arch: 'amd64', archiveType: defaultArchiveTypeFor(type, { sandboxKind, websiteKind }) }]);
	}

  function selectArtifactSource(source) {
    setArtifactSource(source);
    if (source === 'repository') setPlatformVariants((current) => current.slice(0, 1));
  }

  function removePlatformVariant(id) {
	  setPlatformVariants((current) => current.length > 1 ? current.filter((variant) => variant.id !== id) : current);
	  setArtifactFiles((current) => {
	    const next = { ...current };
	    delete next[id];
	    return next;
	  });
	}

  function selectArtifactFile(variantID, file) {
    setArtifactFiles((current) => ({ ...current, [variantID]: file || null }));
  }

  function formatBytes(size) {
    if (!size) return '';
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  function invalidControlIn(root) {
    return Array.from(root?.querySelectorAll('input, select, textarea') || []).find((control) => !control.checkValidity());
  }

  function advanceWizard(event, nextStep) {
    if (type === 'connector' && connectorPackageMode === 'parts' && !connectorCapabilities.mcp && !connectorCapabilities.cli) {
      setConnectorCapabilityError(true);
      return;
    }
    const form = event.currentTarget.form;
    const selector = step === 'artifact'
      ? (type === 'connector' ? '.publish-section-settings, .publish-section-assets' : '.publish-section-assets')
      : '.publish-section-basic, .publish-section-settings, .publish-section-access, .publish-section-advanced';
    const invalid = invalidControlIn(form?.querySelector(selector));
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep(nextStep);
  }

  function submitWizard(event) {
    if (type === 'connector' && connectorPackageMode === 'parts' && !connectorCapabilities.mcp && !connectorCapabilities.cli) {
      setConnectorCapabilityError(true);
      setStep('artifact');
      return;
    }
    const form = event.currentTarget.form;
    const invalid = invalidControlIn(form);
    if (invalid) {
      const artifactInvalid = invalid.closest('.publish-section-assets') || (type === 'connector' && invalid.closest('.publish-section-settings'));
      setStep(artifactInvalid ? 'artifact' : 'details');
      window.setTimeout(() => invalid.reportValidity(), 0);
      return;
    }
    form.requestSubmit();
  }

  function toggleIncludedSkill(skillID) {
    setSelectedSkillIDs((current) => (
      current.includes(skillID) ? current.filter((id) => id !== skillID) : [...current, skillID]
    ));
  }

  function toggleConnectorCapability(capability, enabled) {
    if (enabled && (capability === 'mcp' || capability === 'cli') && !connectorCapabilities.mcp && !connectorCapabilities.cli) setConnectorPrimaryType(capability);
    if (capability === 'mcp' && !enabled && connectorPrimaryType === 'mcp') setConnectorPrimaryType('cli');
    if (capability === 'cli' && !enabled && connectorPrimaryType === 'cli') setConnectorPrimaryType('mcp');
    setConnectorCapabilities((current) => ({ ...current, [capability]: enabled }));
    if (enabled && (capability === 'mcp' || capability === 'cli')) setConnectorCapabilityError(false);
  }

  function changeConnectorAuthMode(mode) {
    setConnectorAuthMode(mode);
    if (mode === 'mcp') {
      setConnectorCapabilities((current) => ({ ...current, mcp: true }));
      setConnectorPrimaryType('mcp');
      setMCPTransport('streamableHttp');
    }
    if (mode !== 'null') setConnectorHasCLIAuth(false);
  }

  function updateCLISystemCommand(field, value) {
    setCLISystemCommands((current) => ({
      ...current,
      [cliTargetSystem]: { ...current[cliTargetSystem], [field]: value },
    }));
  }

  function updateConnectorTokenField(id, patch) {
    setConnectorTokenFields((current) => current.map((field) => field.id === id ? { ...field, ...patch } : field));
  }

  function updateMCPStaticEnv(id, patch) {
    setMCPStaticEnv((current) => current.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  }

  function updateConnectorTarget(id, patch) {
    setConnectorTargets((current) => current.map((target) => target.id === id ? { ...target, ...patch } : target));
  }

  function addConnectorTarget() {
	  const preferredOS = cliTargetSystem === 'win32' ? 'windows' : cliTargetSystem;
	  const preferredArch = preferredOS === 'darwin' ? 'arm64' : 'amd64';
	  const candidates = [
		{ os: preferredOS, arch: preferredArch },
		{ os: 'darwin', arch: 'arm64' },
		{ os: 'darwin', arch: 'amd64' },
		{ os: 'linux', arch: 'amd64' },
		{ os: 'linux', arch: 'arm64' },
		{ os: 'windows', arch: 'amd64' },
		{ os: 'windows', arch: 'arm64' },
	  ];
	  setConnectorTargets((current) => {
		const target = candidates.find((candidate) => !current.some((item) => item.os === candidate.os && item.arch === candidate.arch));
		return target ? [...current, { id: Date.now(), ...target }] : current;
	  });
  }

  function removeConnectorTarget(id) {
    setConnectorTargets((current) => current.filter((target) => target.id !== id));
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
    const labels = locale === 'zh-CN'
      ? ['选择类型', '上传产物', '发布信息', '确认提交']
      : ['Type', 'Artifact', 'Details', 'Review'];
    const order = ['type', 'artifact', 'details', 'review'];
    const activeIndex = order.indexOf(step);
    return (
      <div className="publish-steps" aria-label={t.publishTitle}>
        {labels.map((label, index) => <div className="publish-step-wrap" key={label}>
          <span className={index <= activeIndex ? 'is-active' : ''}><strong>{index < activeIndex ? <CheckCircle2 size={13} /> : index + 1}</strong>{label}</span>
          {index < labels.length - 1 ? <i /> : null}
        </div>)}
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
        {step !== 'type' ? (
        <form className={`publish-form publish-form-guided is-${step} is-${type}`} onSubmit={onSubmit} key={`${type}:${skillKind}`}>
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
          <div className="publish-phase-intro full">
            <span>{step === 'artifact' ? '01' : step === 'details' ? '02' : '03'}</span>
            <div>
              <h3>{step === 'artifact' ? (type === 'connector' ? '配置并组装连接器' : '上传并配置发布产物') : step === 'details' ? '填写市场展示信息' : '确认本次发布'}</h3>
              <p>{step === 'artifact' ? (type === 'connector' ? '填写能力、认证和运行配置；市场会生成规范包并在入库前完成校验。' : '选择目标平台并添加对应文件，上传后将自动执行结构和安全检查。') : step === 'details' ? '这些内容会展示在市场详情页中，高级技术参数可以稍后补充。' : '检查发布类型、产物和访问范围，确认无误后提交审核。'}</p>
            </div>
          </div>
          <input name="type" type="hidden" value={type} />
          <input name="archiveType" type="hidden" value={archiveType} />
          {updateMode ? <input name="existingMetadata" type="hidden" value={JSON.stringify(initialItem.metadata || {})} /> : null}
          {type === 'skill' ? <input name="skillKind" type="hidden" value={skillKind} /> : null}
          <section className="publish-section publish-section-basic full">
            <div className="publish-section-heading">
              <span className="publish-section-kicker">02 · MARKET LISTING</span>
              <div><h3>{t.publishBasicInfo}</h3><p>这些信息会出现在市场卡片和详情页中。先让用户一眼知道它能解决什么问题。</p></div>
            </div>
            <div className="publish-section-grid publish-basic-grid">
              <label>
                <span className="required-field-label">{t.componentId}</span>
                <input className="publish-code-input" name="id" required readOnly={updateMode} defaultValue={updateMode ? initialItem.id : ''} onChange={(event) => updateMarketPreview('id', event.target.value)} placeholder="例如：pdf-extractor" pattern="[a-z0-9._-]+" maxLength="80" autoCapitalize="none" autoCorrect="off" spellCheck="false" />
                <small className="field-hint">{updateMode ? t.publishVersionLocked : '仅支持小写字母、数字、连字符、下划线和英文句点；发布后不可修改。'}</small>
              </label>
              <label>
                <span className="required-field-label">{t.name}</span>
                <input name="name" required maxLength="60" defaultValue={updateMode ? localized(initialItem.name, locale) : ''} onChange={(event) => updateMarketPreview('name', event.target.value)} placeholder="例如：PDF 智能提取助手" />
                <small className="field-hint">使用动词或结果描述，避免只写内部项目代号。</small>
              </label>
              {updateMode ? <label>
                <span className="required-field-label">{t.version}</span>
                <input name="version" required defaultValue={nextPatchVersion(initialItem.version)} onChange={(event) => updateMarketPreview('version', event.target.value)} placeholder="1.0.0" />
                <small className="field-hint">已自动递增补丁版本，可按语义化版本规则调整。</small>
              </label> : <input name="version" type="hidden" value="1.0.0" />}
              <label className="publish-image-input full">
                <span>{t.image}</span>
                <span className="publish-image-control"><span className="publish-image-placeholder"><LayoutGrid size={18} /></span><span><strong>{marketPreview.imageName || '添加封面图'}</strong><small>PNG、JPG、WebP 或 GIF</small></span><Upload size={15} /></span>
                <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => updateMarketPreview('imageName', event.target.files?.[0]?.name || '')} />
              </label>
              <label className="full">
                <span className="publish-label-row"><span className="required-field-label">{t.description}</span><small>{descriptionLength}/200</small></span>
                <textarea name="description" rows="4" required maxLength="200" defaultValue={updateMode ? localized(initialItem.description, locale) : ''} onChange={(event) => { updateMarketPreview('description', event.target.value); setDescriptionLength(event.target.value.length); }} placeholder="例如：从 PDF、扫描件或图片中提取表格和关键信息，并输出为结构化数据。" />
                <small className="field-hint">推荐 40–100 字：说明适用对象、输入内容和交付结果。</small>
              </label>
            </div>
          </section>

          {(type === 'connector' || type === 'skill' || type === 'sandbox-image' || type === 'website-app' || type === 'software-package') ? (
            <section className="publish-section publish-section-settings full" hidden={step === 'details' && type === 'connector'}>
              <h3>{t.publishTypeSettings}</h3>
              <div className="publish-section-grid">
          {type === 'skill' ? (
            <>
              {!showDiscovery ? <div className="publish-default-card full">
                <span><CheckCircle2 size={16} /><span><strong>已应用推荐分类</strong><small>{t.skillCategories.other} · {t.skillScenarios.productivity} · {t.skillLevels.beginner}</small></span></span>
                <button type="button" className="text-action" onClick={() => setShowDiscovery(true)}>调整</button>
                <input type="hidden" name="skillCategory" value={updateMode ? initialItem.skillCategory || 'other' : 'other'} />
                <input type="hidden" name="skillScenario" value={updateMode ? initialItem.skillScenario || 'productivity' : 'productivity'} />
                <input type="hidden" name="skillLevel" value={updateMode ? initialItem.skillLevel || 'beginner' : 'beginner'} />
              </div> : <>
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
              <div className="full publish-inline-actions"><button type="button" className="text-action" onClick={() => setShowDiscovery(false)}>使用推荐值并收起</button></div>
              </>}
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
            </>
          ) : null}
          {type === 'connector' ? (
            <div className="connector-part-upload full">
              <p className="field-hint">{t.connectorPartUploadHint}</p>
              <div className="connector-capability-picker">
                <label className="checkbox-field"><input name="connectorPackageMode" type="radio" value="parts" checked={connectorPackageMode === 'parts'} onChange={() => setConnectorPackageMode('parts')} /><span>表单组装连接器</span></label>
                <label className="checkbox-field"><input name="connectorPackageMode" type="radio" value="complete" checked={connectorPackageMode === 'complete'} onChange={() => setConnectorPackageMode('complete')} /><span>上传完整连接器 ZIP</span></label>
              </div>
              {connectorPackageMode === 'complete' ? <div className="publish-default-card"><span><PackageOpen size={16} /><span><strong>保留完整连接器规范</strong><small>适用于多个 MCP Server、多步骤 CLI 登录或其他高级配置；请在下方为每个平台上传包含 connector.json 的完整 ZIP。</small></span></span></div> : null}
              <fieldset className="connector-structured-fields" hidden={connectorPackageMode === 'complete'} disabled={connectorPackageMode === 'complete'}>
              <div className={connectorCapabilityError ? 'connector-capability-picker is-invalid' : 'connector-capability-picker'} aria-describedby={connectorCapabilityError ? 'connector-capability-error' : undefined}>
                {connectorAuthMode === 'mcp' ? <input name="connectorHasMCP" type="hidden" value="on" /> : null}
                {['mcp', 'cli', 'skill'].map((capability) => (
                  <label className="checkbox-field" key={capability}>
                    <input name={`connectorHas${capability.toUpperCase()}`} type="checkbox" checked={connectorCapabilities[capability]} disabled={capability === 'mcp' && connectorAuthMode === 'mcp'} onChange={(event) => toggleConnectorCapability(capability, event.target.checked)} />
                    <span>{capability === 'skill' ? 'Skill' : capability.toUpperCase()}</span>
                  </label>
                ))}
              </div>
              {connectorCapabilityError ? <p className="connector-capability-error" id="connector-capability-error" role="alert">请至少选择 MCP 或 CLI；Skill 只能作为附加能力。</p> : null}
              <div className="publish-section-grid">
                {enabledPrimaryCapabilities.length > 1 ? <label>
                  <span className="required-field-label">{t.connectorPrimaryTypeField}</span>
                  <select name="connectorPrimaryType" value={connectorPrimaryType} onChange={(event) => setConnectorPrimaryType(event.target.value)} required>
                    {connectorCapabilities.mcp ? <option value="mcp">MCP</option> : null}
                    {connectorCapabilities.cli ? <option value="cli">CLI</option> : null}
                  </select>
                </label> : <input name="connectorPrimaryType" type="hidden" value={enabledPrimaryCapabilities[0] || connectorPrimaryType} />}
                <label>
                  <span className="required-field-label">{t.connectorAuthModeField}</span>
                  <select name="connectorAuthMode" value={connectorAuthMode} onChange={(event) => changeConnectorAuthMode(event.target.value)} required>
                    <option value="null">{t.connectorAuthNull}</option>
                    <option value="token">Token</option>
                    <option value="oneid-token">OneID Token</option>
                    <option value="oauth">OAuth 2.0</option>
                    <option value="mcp">MCP OAuth 2.1</option>
                  </select>
                </label>
                <label>
                  <span className="required-field-label">{t.connectorAuthBrowserField}</span>
                  <select name="connectorAuthBrowser" value={connectorAuthBrowser} onChange={(event) => setConnectorAuthBrowser(event.target.value)} required>
                    <option value="system">{t.connectorAuthBrowserSystem}</option>
                    <option value="embedded">{t.connectorAuthBrowserEmbedded}</option>
                  </select>
                  <small className="field-hint">{t.connectorAuthBrowserHint}</small>
                </label>
              </div>

              {connectorAuthMode === 'token' ? (
                <div className="publish-field-card connector-runtime-panel full">
                  <h4>{t.connectorTokenTitle}</h4>
                  {!showConnectorAdvanced ? <div className="publish-default-card">
                    <span><CheckCircle2 size={16} /><span><strong>使用标准 API Key 凭据</strong><small>API_KEY · 密码输入框 · 自动安全注入</small></span></span>
                    <button type="button" className="text-action" onClick={() => setShowConnectorAdvanced(true)}>调整</button>
                    <input name="connectorTokenKey" type="hidden" value="API_KEY" />
                    <input name="connectorTokenLabel" type="hidden" value="API Key" />
                    <input name="connectorTokenType" type="hidden" value="password" />
                    {connectorCapabilities.mcp ? <input name="connectorMCPAuthHeader" type="hidden" value={mcpTransport === 'stdio' ? 'API_KEY' : 'X-API-Key'} /> : null}
                    {connectorCapabilities.cli ? <input name="connectorCLIAuthEnv" type="hidden" value="API_KEY" /> : null}
                  </div> : <div className="publish-section-grid">
                    <label className="full"><span>{t.connectorTokenFormTitle}</span><input name="connectorTokenTitle" defaultValue={initialConnectorConfig?.tokenSchema?.title || ''} placeholder="服务凭据" /></label>
                    {connectorTokenFields.map((field, index) => <div className="connector-env-row full" key={field.id}>
                      <label><span className="required-field-label">凭据变量名</span><input name="connectorTokenKey" required value={field.key} onChange={(event) => updateConnectorTokenField(field.id, { key: event.target.value })} pattern="[A-Z][A-Z0-9_]*" /></label>
                      <label><span className="required-field-label">显示名称</span><input name="connectorTokenLabel" required value={field.label} onChange={(event) => updateConnectorTokenField(field.id, { label: event.target.value })} /></label>
                      <label><span>输入类型</span><select name="connectorTokenType" value={field.type} onChange={(event) => updateConnectorTokenField(field.id, { type: event.target.value })}><option value="password">password</option><option value="text">text</option></select></label>
                      <label><span>注入环境变量</span><input name="connectorTokenEnvName" required={connectorCapabilities.mcp && mcpTransport === 'stdio'} value={field.env} onChange={(event) => updateConnectorTokenField(field.id, { env: event.target.value })} pattern="[A-Z][A-Z0-9_]*" /></label>
                      {index ? <button className="secondary-action" type="button" onClick={() => setConnectorTokenFields((current) => current.filter((entry) => entry.id !== field.id))}><Trash2 size={14} /><span>移除凭据</span></button> : null}
                    </div>)}
                    <button className="secondary-action" type="button" onClick={() => setConnectorTokenFields((current) => [...current, { id: Date.now(), key: '', label: '', type: 'password', env: '' }])}><Plus size={14} /><span>添加凭据字段</span></button>
                    <label><span>{t.connectorTokenDocURL}</span><input name="connectorTokenDocURL" type="url" defaultValue={initialConnectorConfig?.tokenSchema?.docUrl || ''} placeholder="https://docs.example.com/api-keys" /></label>
                    {connectorCapabilities.mcp ? <label key={mcpTransport}><span>{mcpTransport === 'stdio' ? t.connectorMCPAuthEnv : t.connectorMCPAuthHeader}</span><input name="connectorMCPAuthHeader" defaultValue={initialConnectorConfig?.mcp?.authHeader || (mcpTransport === 'stdio' ? 'API_KEY' : 'X-API-Key')} /></label> : null}
                    {connectorCapabilities.mcp && mcpTransport === 'streamableHttp' ? <label><span>{t.connectorMCPAuthPrefix}</span><input name="connectorMCPAuthPrefix" defaultValue={initialConnectorConfig?.mcp?.authPrefix || ''} placeholder="Bearer " /></label> : null}
                    {connectorCapabilities.cli ? <label><span>{t.connectorCLIAuthEnv}</span><input name="connectorCLIAuthEnv" defaultValue={initialConnectorConfig?.cli?.authEnv || 'API_KEY'} pattern="[A-Z_][A-Z0-9_]*" /></label> : null}
                  </div>}
                </div>
              ) : null}

              {connectorAuthMode === 'oauth' ? (
                <div className="publish-field-card connector-runtime-panel full">
                  <h4>{t.connectorOAuthTitle}</h4>
                  <div className="publish-section-grid">
                    <label><span className="required-field-label">issuer</span><input name="connectorOAuthIssuer" type="url" required defaultValue={initialConnectorConfig?.oauth?.issuer || ''} placeholder="https://accounts.example.com" /></label>
                    <label><span className="required-field-label">resource</span><input name="connectorOAuthResource" type="url" required defaultValue={initialConnectorConfig?.oauth?.resource || ''} placeholder="https://api.example.com/mcp" /></label>
                    {showConnectorAdvanced ? <><label className="full"><span>{t.connectorOAuthScopes}</span><input name="connectorOAuthScopes" defaultValue={(initialConnectorConfig?.oauth?.scopes || []).join(' ')} placeholder="documents.read documents.write" /></label>
                    <label><span>authorization_endpoint</span><input name="connectorOAuthAuthorizationEndpoint" type="url" defaultValue={initialConnectorConfig?.oauth?.authorizationEndpoint || ''} /></label>
                    <label><span>token_endpoint</span><input name="connectorOAuthTokenEndpoint" type="url" defaultValue={initialConnectorConfig?.oauth?.tokenEndpoint || ''} /></label>
                    <label><span>revocation_endpoint</span><input name="connectorOAuthRevocationEndpoint" type="url" defaultValue={initialConnectorConfig?.oauth?.revocationEndpoint || ''} /></label></> : null}
                  </div>
                </div>
              ) : null}

              {connectorCapabilities.mcp ? (
                <div className="publish-field-card connector-runtime-panel full">
                  <h4>MCP</h4>
                  {mcpTransport === 'stdio' && showConnectorAdvanced ? <div className="connector-capability-picker"><label className="checkbox-field"><input type="checkbox" checked={mcpHasRuntime} onChange={(event) => setMCPHasRuntime(event.target.checked)} /><span>{t.cliRuntimeToggle}</span></label></div> : null}
                  <div className="publish-section-grid">
                    {showConnectorAdvanced ? <label><span>{t.mcpServerName}</span><input name="mcpServerName" defaultValue={initialConnectorConfig?.mcp?.serverName || 'main'} /></label> : <input name="mcpServerName" type="hidden" value={initialConnectorConfig?.mcp?.serverName || 'main'} />}
                    <label className="full"><span>组件简介</span><textarea name="connectorMCPDescription" rows={2} maxLength={500} defaultValue={initialConnectorConfig?.mcp?.description || ''} placeholder="说明这个 MCP 服务能为智能体完成什么。" /><small className="field-hint">展示在连接器详情页；留空时使用系统默认说明。</small></label>
                    <label><span className="required-field-label">{t.mcpTransport}</span><select name="mcpTransport" value={mcpTransport} onChange={(event) => setMCPTransport(event.target.value)} disabled={connectorAuthMode === 'mcp'}><option value="streamableHttp">HTTP / streamableHttp</option><option value="stdio">stdio</option></select></label>
                    <label className="full"><span className="required-field-label">{mcpTransport === 'stdio' ? t.mcpCommand : t.mcpURL}</span><input name="mcpAddress" type={mcpTransport === 'stdio' ? 'text' : 'url'} required defaultValue={initialConnectorConfig?.mcp?.address || ''} placeholder={mcpTransport === 'stdio' ? 'office-cli' : 'https://example.com/mcp'} /></label>
                    {mcpTransport === 'stdio' ? <label className="full"><span>{t.connectorArgs}</span><textarea name="mcpArgs" rows={3} defaultValue={(initialConnectorConfig?.mcp?.args || []).join('\n')} placeholder={'mcp\nserve'} /><small className="field-hint">{t.connectorArgsHint}</small></label> : null}
                    {mcpTransport === 'stdio' && mcpHasRuntime && showConnectorAdvanced ? <><label><span className="required-field-label">runtime.type</span><input name="mcpRuntimeType" required defaultValue={initialConnectorConfig?.mcp?.runtimeType || ''} placeholder="node" /></label><label><span className="required-field-label">runtime.version</span><input name="mcpRuntimeVersion" required defaultValue={initialConnectorConfig?.mcp?.runtimeVersion || ''} placeholder=">=20" /></label></> : null}
                    {showConnectorAdvanced ? <><label><span>{t.mcpTimeout}</span><input name="mcpTimeout" type="number" min="1" defaultValue={initialConnectorConfig?.mcp?.timeout || 30000} /></label>
                    {mcpTransport === 'streamableHttp' ? <><label><span>{t.mcpStaticHeaderName}</span><input name="mcpStaticHeaderName" defaultValue={initialConnectorConfig?.mcp?.staticHeaderName || ''} placeholder="X-Client" /></label><label><span>{t.mcpStaticHeaderValue}</span><input name="mcpStaticHeaderValue" defaultValue={initialConnectorConfig?.mcp?.staticHeaderValue || ''} placeholder="AgentHost" /></label></> : null}
                    {mcpTransport === 'stdio' ? <div className="full connector-env-list"><span>公开环境变量</span>{mcpStaticEnv.map((entry, index) => <div className="connector-env-row" key={entry.id}><label><span>{t.staticEnvName}</span><input name="mcpStaticEnvName" value={entry.name} onChange={(event) => updateMCPStaticEnv(entry.id, { name: event.target.value })} placeholder="JIRA_URL" /></label><label><span>{t.staticEnvValue}</span><input name="mcpStaticEnvValue" value={entry.value} onChange={(event) => updateMCPStaticEnv(entry.id, { value: event.target.value })} placeholder="https://company.atlassian.net" /></label>{index ? <button className="secondary-action" type="button" onClick={() => setMCPStaticEnv((current) => current.filter((item) => item.id !== entry.id))}><Trash2 size={14} /><span>移除</span></button> : null}</div>)}<button className="secondary-action" type="button" onClick={() => setMCPStaticEnv((current) => [...current, { id: Date.now(), name: '', value: '' }])}><Plus size={14} /><span>添加环境变量</span></button></div> : null}</> : <input name="mcpTimeout" type="hidden" value="30000" />}
                  </div>
                  {mcpTransport === 'stdio' && !connectorCapabilities.cli ? <div className="publish-section-grid">
                    {connectorTargets.length ? <div className="publish-field-card full">
                      <h4>随包 stdio 可执行文件</h4>
                      <small className="field-hint">为每个目标平台上传 ZIP；ZIP 中的文件会被放入连接器包的 bin/ 目录。运行时会将 bin/ 加入受控 PATH，因此命令可直接填写文件名，例如 uvx 或 uvx.exe。</small>
                      <div className="publish-section-grid platform-variant-list">
                        {connectorTargets.map((target, index) => {
                          const key = `${target.os}-${target.arch}`;
                          return <div className="publish-field-card platform-variant-card full" key={target.id}>
                            <input name="connectorTargetIndex" type="hidden" value={index} />
                            <label><span className="required-field-label">{t.os}</span><select name={`connectorTargetOS.${index}`} value={target.os} onChange={(event) => updateConnectorTarget(target.id, { os: event.target.value })}><option value="darwin">macOS</option><option value="linux">Linux</option><option value="windows">Windows</option></select></label>
                            <label><span className="required-field-label">{t.arch}</span><select name={`connectorTargetArch.${index}`} value={target.arch} onChange={(event) => updateConnectorTarget(target.id, { arch: event.target.value })}><option value="arm64">arm64</option><option value="amd64">amd64 / x64</option></select></label>
                            <label className="full"><span>可执行文件 ZIP · {key}</span><input name={`connectorCLIArchive.${key}`} type="file" accept="application/zip,.zip" /><small className="field-hint">ZIP 内直接放可执行文件；发布后会自动归档到 bin/。</small></label>
                            <button className="secondary-action" type="button" onClick={() => removeConnectorTarget(target.id)}><Trash2 size={14} /><span>{t.removePlatformVariant}</span></button>
                          </div>;
                        })}
                      </div>
                    </div> : null}
                    <button className="secondary-action connector-add-artifact" type="button" onClick={addConnectorTarget}><Plus size={14} /><span>添加随包 stdio 可执行文件（可选）</span></button>
                  </div> : null}
                </div>
              ) : null}

              {connectorCapabilities.cli ? (
                <div className="publish-field-card connector-runtime-panel full">
                  <h4>CLI</h4>
                  <div className="connector-capability-picker">
                    {showConnectorAdvanced ? <label className="checkbox-field"><input type="checkbox" checked={connectorHasRuntime} onChange={(event) => setConnectorHasRuntime(event.target.checked)} /><span>{t.cliRuntimeToggle}</span></label> : null}
                    {connectorAuthMode === 'null' ? <label className="checkbox-field"><input type="checkbox" checked={connectorHasCLIAuth} onChange={(event) => setConnectorHasCLIAuth(event.target.checked)} /><span>{t.cliAuthToggle}</span></label> : null}
                  </div>
                  <div className="publish-section-grid">
                    <label><span>组件名称</span><input name="connectorCLIName" maxLength={100} defaultValue={initialConnectorConfig?.cli?.name || ''} placeholder="例如：Office CLI" /></label>
                    <label className="full"><span>组件简介</span><textarea name="connectorCLIDescription" rows={2} maxLength={500} defaultValue={initialConnectorConfig?.cli?.description || ''} placeholder="说明此命令行工具能为智能体完成什么。" /><small className="field-hint">展示在连接器详情页；留空时使用系统默认说明。</small></label>
                    <label className="full"><span className="required-field-label">{t.cliTargetSystem}</span><select name="cliTargetSystem" value={cliTargetSystem} onChange={(event) => setCLITargetSystem(event.target.value)}><option value="darwin">macOS (darwin)</option><option value="linux">Linux</option><option value="win32">Windows (win32)</option></select><small className="field-hint">{t.cliTargetSystemHint}</small></label>
                    {connectorHasRuntime ? <><label><span className="required-field-label">runtime.type</span><input name="cliRuntimeType" required defaultValue={initialConnectorConfig?.cli?.runtimeType || ''} placeholder="node" /></label><label><span className="required-field-label">runtime.version</span><input name="cliRuntimeVersion" required defaultValue={initialConnectorConfig?.cli?.runtimeVersion || ''} placeholder=">=20" /></label></> : null}
                    <label><span className="required-field-label">CLI 最低版本</span><input name="cliMinVersion" required pattern="[0-9]+\.[0-9]+\.[0-9]+" defaultValue={initialConnectorConfig?.cli?.minVersion || ''} placeholder="例如：1.3.0" /><small className="field-hint">这是用户本机安装的 CLI 最低版本，与连接器发布版本无关。</small></label>
                    {Object.entries(cliSystemCommands).filter(([system]) => system !== cliTargetSystem).flatMap(([system, commands]) => {
                      const suffix = system === 'darwin' ? 'Darwin' : system === 'linux' ? 'Linux' : 'Win32';
                      return Object.entries(commands).filter(([field]) => connectorHasCLIAuth || !['auth', 'status', 'unAuth'].includes(field)).map(([field, value]) => <input key={`${system}-${field}`} type="hidden" name={`cli${field[0].toUpperCase()}${field.slice(1)}${suffix}`} value={value} />);
                    })}
                    <label className="full"><span className="required-field-label">版本检查命令</span><input required name={`cliVersion${cliTargetSystem === 'darwin' ? 'Darwin' : cliTargetSystem === 'linux' ? 'Linux' : 'Win32'}`} value={cliSystemCommands[cliTargetSystem].version} onChange={(event) => updateCLISystemCommand('version', event.target.value)} placeholder={cliTargetSystem === 'win32' ? 'office-cli.exe --version' : 'office-cli --version'} /><small className="field-hint">用于确认 CLI 已安装且版本符合要求；最低版本自动跟随本次发布版本。</small></label>
                    {showConnectorAdvanced ? <><label><span>versionPattern</span><input name="cliVersionPattern" defaultValue={initialConnectorConfig?.cli?.versionPattern || ''} placeholder="v?(\\d+\\.\\d+\\.\\d+)" /></label>
                    <label><span>init</span><input name={`cliInit${cliTargetSystem === 'darwin' ? 'Darwin' : cliTargetSystem === 'linux' ? 'Linux' : 'Win32'}`} value={cliSystemCommands[cliTargetSystem].init} onChange={(event) => updateCLISystemCommand('init', event.target.value)} /></label></> : null}
                    {connectorHasCLIAuth ? <><label><span>auth</span><input name={`cliAuth${cliTargetSystem === 'darwin' ? 'Darwin' : cliTargetSystem === 'linux' ? 'Linux' : 'Win32'}`} value={cliSystemCommands[cliTargetSystem].auth} onChange={(event) => updateCLISystemCommand('auth', event.target.value)} /></label><label><span>status</span><input name={`cliStatus${cliTargetSystem === 'darwin' ? 'Darwin' : cliTargetSystem === 'linux' ? 'Linux' : 'Win32'}`} value={cliSystemCommands[cliTargetSystem].status} onChange={(event) => updateCLISystemCommand('status', event.target.value)} /></label><label><span>unAuth</span><input name={`cliUnAuth${cliTargetSystem === 'darwin' ? 'Darwin' : cliTargetSystem === 'linux' ? 'Linux' : 'Win32'}`} value={cliSystemCommands[cliTargetSystem].unAuth} onChange={(event) => updateCLISystemCommand('unAuth', event.target.value)} /></label><label className="full"><span>statusMatch</span><input name="cliStatusMatch" defaultValue={initialConnectorConfig?.cli?.statusMatch || ''} /></label><label className="full"><span>statusMatchJson</span><textarea name="cliStatusMatchJSON" rows={2} defaultValue={initialConnectorConfig?.cli?.statusMatchJSON || ''} placeholder={'{"authenticated":true}'} /></label><label><span>authUrlDomain</span><input name="cliAuthURLDomain" defaultValue={initialConnectorConfig?.cli?.authURLDomain || ''} placeholder="accounts.example.com" /></label><label className="checkbox-field"><input name="cliAuthWaitForExit" type="checkbox" defaultChecked={initialConnectorConfig?.cli?.authWaitForExit ?? true} /><span>authWaitForExit</span></label><label className="checkbox-field"><input name="cliAuthSuppressBrowser" type="checkbox" defaultChecked={Boolean(initialConnectorConfig?.cli?.authSuppressBrowser)} /><span>authSuppressBrowser</span></label></> : null}
                    {showConnectorAdvanced ? <><label><span>{t.staticEnvName}</span><input name="cliStaticEnvName" defaultValue={initialConnectorConfig?.cli?.staticEnvName || ''} placeholder="REGION" /></label><label><span>{t.staticEnvValue}</span><input name="cliStaticEnvValue" defaultValue={initialConnectorConfig?.cli?.staticEnvValue || ''} placeholder="cn" /></label></> : null}
                    {connectorTargets.length ? <div className="publish-field-card full">
                      <h4>{t.connectorPlatformTargets}</h4>
                      <small className="field-hint">仅在随包提供可执行文件时指定目标平台；ZIP 中的文件会被放入 bin/，由运行时加入受控 PATH。</small>
                      <div className="publish-section-grid platform-variant-list">
                        {connectorTargets.map((target, index) => {
                          const key = `${target.os}-${target.arch}`;
                          return <div className="publish-field-card platform-variant-card full" key={target.id}>
                            <input name="connectorTargetIndex" type="hidden" value={index} />
                            <label><span className="required-field-label">{t.os}</span><select name={`connectorTargetOS.${index}`} value={target.os} onChange={(event) => updateConnectorTarget(target.id, { os: event.target.value })}><option value="darwin">macOS</option><option value="linux">Linux</option><option value="windows">Windows</option></select></label>
                            <label><span className="required-field-label">{t.arch}</span><select name={`connectorTargetArch.${index}`} value={target.arch} onChange={(event) => updateConnectorTarget(target.id, { arch: event.target.value })}><option value="arm64">arm64</option><option value="amd64">amd64 / x64</option></select></label>
                            <label className="full"><span>随包可执行文件 ZIP · {key}</span><input name={`connectorCLIArchive.${key}`} type="file" accept="application/zip,.zip" /><small className="field-hint">ZIP 内文件会被放入 bin/；运行时会以受控 PATH 调用。</small></label>
                            <button className="secondary-action" type="button" onClick={() => removeConnectorTarget(target.id)}><Trash2 size={14} /><span>{t.removePlatformVariant}</span></button>
                          </div>;
                        })}
                      </div>
                    </div> : null}
                    <button className="secondary-action connector-add-artifact" type="button" onClick={addConnectorTarget}><Plus size={14} /><span>添加随包可执行文件（可选）</span></button>
                  </div>
                </div>
              ) : null}

              {connectorCapabilities.skill ? (
                <div className="publish-field-card full">
                  <h4>Skill</h4>
                  <label className="full"><span className="required-field-label">{t.connectorSkillsArchive}</span><input name="connectorSkillsArchive" type="file" accept="application/zip,.zip" required /><small className="field-hint">{t.connectorSkillsArchiveHint}</small></label>
                  <div className="connector-env-list"><span>组件简介（可选）</span><small className="field-hint">填写 SKILL.md frontmatter 中的 name 后可覆写该 Skill 在详情页的简介；未填写时展示 SKILL.md 的 description。</small>{connectorSkillCopy.map((entry) => <div className="connector-env-row" key={entry.id}><label><span>Skill 名称</span><input name="connectorSkillName" value={entry.name} onChange={(event) => setConnectorSkillCopy((current) => current.map((item) => item.id === entry.id ? { ...item, name: event.target.value } : item))} placeholder="例如：meeting-summary" /></label><label><span>组件简介</span><textarea name="connectorSkillDescription" rows={2} maxLength={500} value={entry.description} onChange={(event) => setConnectorSkillCopy((current) => current.map((item) => item.id === entry.id ? { ...item, description: event.target.value } : item))} /></label><button className="secondary-action" type="button" onClick={() => setConnectorSkillCopy((current) => current.filter((item) => item.id !== entry.id))}><Trash2 size={14} /><span>移除</span></button></div>)}<button className="secondary-action" type="button" onClick={() => setConnectorSkillCopy((current) => [...current, { id: Date.now(), name: '', description: '' }])}><Plus size={14} /><span>添加 Skill 简介</span></button></div>
                </div>
              ) : null}
              <button className="advanced-toggle connector-advanced-toggle full" type="button" onClick={() => setShowConnectorAdvanced((value) => !value)}>
                <span><strong>{showConnectorAdvanced ? '收起连接器高级配置' : '连接器高级配置'}</strong><small>运行时、固定 Header / 环境变量、OAuth 端点和版本解析</small></span>
                <ArrowRight size={14} />
              </button>
              <small className="field-hint">{t.connectorPartUploadRequirement}</small>
              </fieldset>
            </div>
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

          {showAssetSection && (type !== 'connector' || connectorPackageMode === 'complete') ? (
            <section className="publish-section publish-section-assets full">
              <div className="publish-section-title-row">
                <div>
                  <span className="publish-section-kicker">01 · {t.publishStepDetails}</span>
                  <h3>{t.publishRequiredAssets}</h3>
                  <p>先上传发布包，我们会自动识别格式并检查平台信息。</p>
                </div>
                <span className="publish-section-badge">{platformVariants.length} 个目标</span>
              </div>
              <div className="publish-section-grid platform-variant-list">
                {!(type === 'skill' && skillKind === 'package') ? (
                  <>
                    {type === 'skill' && skillKind === 'single' ? (
                      <div className="repository-source-picker full">
                        <label className="checkbox-field">
                          <input name="artifactSource" type="radio" value="upload" checked={artifactSource === 'upload'} onChange={() => selectArtifactSource('upload')} />
                          <span>{t.artifactSourceUpload}</span>
                        </label>
                        <label className="checkbox-field">
                          <input name="artifactSource" type="radio" value="repository" checked={artifactSource === 'repository'} onChange={() => selectArtifactSource('repository')} />
                          <span>{t.artifactSourceRepository}</span>
                        </label>
                      </div>
                    ) : <input name="artifactSource" type="hidden" value="upload" />}
                    {artifactSource === 'repository' && type === 'skill' && skillKind === 'single' ? (
                      <div className="publish-field-card repository-source-card full">
                        <label>
                          <span className="required-field-label">{t.repositoryProvider}</span>
                          <select name="repositoryProvider" defaultValue="gitlab" required>
                            <option value="gitlab">GitLab</option>
                            <option value="github">GitHub</option>
                          </select>
                        </label>
                        <label className="full">
                          <span className="required-field-label">{t.repositoryUrl}</span>
                          <input name="repositoryUrl" type="url" required placeholder="https://gitlab.example.com/group/skill.git" />
                        </label>
                        <label>
                          <span>{t.repositoryRef}</span>
                          <input name="repositoryRef" placeholder="main / v1.0.0 / commit SHA" />
                        </label>
                        <label>
                          <span>{t.repositoryPath}</span>
                          <input name="repositoryPath" placeholder="skills/my-skill" />
                        </label>
                        <label className="full">
                          <span>{t.repositoryAccessToken}</span>
                          <input name="repositoryAccessToken" type="password" autoComplete="new-password" placeholder={t.repositoryAccessTokenPlaceholder} />
                          <small className="field-hint">{t.repositoryAccessTokenHint}</small>
                        </label>
                      </div>
                    ) : null}
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
                        <label className={`${artifactSource === 'repository' && type === 'skill' && skillKind === 'single' ? 'repository-upload-hidden' : ''} artifact-dropzone ${artifactFiles[variant.id] ? 'has-file' : ''}`}>
                          <span className="artifact-drop-icon"><Upload size={20} /></span>
                          <span className={artifactRequired ? 'required-field-label' : ''}>{artifactFiles[variant.id] ? artifactFiles[variant.id].name : '拖拽发布包到这里，或点击选择文件'}</span>
                          <small>{artifactFiles[variant.id] ? `${formatBytes(artifactFiles[variant.id].size)} · 已准备上传` : type === 'connector' ? t.connectorPackageHint : `${t.artifact} · ZIP / TAR.GZ / DMG`}</small>
                          <input name={`variantArtifact.${index}`} type="file" accept={type === 'connector' ? 'application/zip,.zip' : undefined} required={artifactRequired && !(artifactSource === 'repository' && type === 'skill' && skillKind === 'single')} onChange={(event) => selectArtifactFile(variant.id, event.target.files?.[0])} />
                        </label>
                        <button className="secondary-action" type="button" disabled={platformVariants.length === 1 || artifactSource === 'repository'} onClick={() => removePlatformVariant(variant.id)}><Trash2 size={14} /><span>{t.removePlatformVariant}</span></button>
                      </div>
                    ))}
                    {artifactSource !== 'repository' ? <button className="secondary-action" type="button" onClick={addPlatformVariant}><Plus size={14} /><span>{t.addPlatformVariant}</span></button> : null}
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

          <section className="publish-section publish-section-access full">
            <div className="publish-section-heading">
              <span className="publish-section-kicker">03 · DISTRIBUTION</span>
              <div><h3>{t.accessScope}</h3><p>审核通过后，按此范围将组件展示给组织成员。</p></div>
            </div>
            {!showAccess && accessMode === 'all' ? <div className="publish-default-card">
              <span><CheckCircle2 size={16} /><span><strong>{t.accessAll}</strong><small>{t.accessAllHint}</small></span></span>
              <button type="button" className="text-action" onClick={() => setShowAccess(true)}>调整范围</button>
              <input name="accessMode" type="hidden" value="all" />
            </div> : <div className="publish-section-grid">
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
              <div className="full publish-inline-actions"><button type="button" className="text-action" onClick={() => { setAccessMode('all'); setShowAccess(false); }}>恢复全员可见并收起</button></div>
            </div>}
          </section>

          <section className="publish-section publish-section-advanced full">
            <button className="advanced-toggle" type="button" onClick={() => setShowAdvanced((value) => !value)}>
              <span><strong>{showAdvanced ? t.publishHideAdvanced : t.publishShowAdvanced}</strong><small>兼容性、标签、使用提示和技术元数据</small></span>
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
                {type === 'skill' || type === 'connector' ? (
                  <label className="full">
                    <span>{t.usageHint}</span>
                    {[0, 1, 2].map((index) => <input key={index} name="usageHints" maxLength="80" defaultValue={initialUsageHints[index] || ''} placeholder={index ? t.usageHintPlaceholder : t.usageHintPlaceholder} />)}
                    <small className="field-hint">{t.usageHintHint}</small>
                  </label>
                ) : null}
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
                  <span>{t.readme}</span>
                  <textarea name="readme" rows="5" defaultValue={updateMode ? localized(initialItem.readme, locale) : ''} />
                </label>
              </div>
            ) : null}
          </section>
          <aside className="publish-review-panel">
            <div className="publish-review-head">
              <span>发布准备度</span>
              <strong>{readinessPercent}%</strong>
            </div>
            <div className="publish-readiness"><span style={{ width: `${readinessPercent}%` }} /></div>
            <div className="publish-review-product">
              <span className="publish-preview-icon"><SelectedIcon size={20} /></span>
              <div><span className="publish-preview-eyebrow">市场卡片预览</span><strong>{marketPreview.name || '组件名称'}</strong><small>{marketPreview.description || '填写一句清晰的说明，让用户知道它能完成什么。'}</small><em>{selectedType.label(t)} · v{marketPreview.version || '1.0.0'}</em></div>
            </div>
            <div className="publish-review-list">
              <span className="is-done"><CheckCircle2 size={16} /><span><strong>发布类型</strong><small>已选择 {selectedType.label(t)}</small></span></span>
              <span className={artifactReady ? 'is-done' : ''}><CheckCircle2 size={16} /><span><strong>发布产物</strong><small>{Object.values(artifactFiles).filter(Boolean).length ? `已添加 ${Object.values(artifactFiles).filter(Boolean).length} 个文件` : artifactSource === 'repository' ? '将从代码仓库获取' : type === 'connector' ? '由连接器配置自动生成' : '等待上传文件'}</small></span></span>
              <span className={basicReady ? 'is-done' : ''}><CheckCircle2 size={16} /><span><strong>基础信息</strong><small>{basicReady ? '名称、标识、版本和说明已填写' : '还需要名称、标识、版本或说明'}</small></span></span>
              <span><ShieldCheck size={16} /><span><strong>安全扫描</strong><small>上传后执行依赖与内容检查</small></span></span>
            </div>
            <div className="publish-review-tip"><Info size={15} /><span>发布前可以保存草稿，审核通过后再对组织成员开放。</span></div>
          </aside>
          <footer className="modal-actions publish-wizard-actions">
            <button className="secondary-action" type="button" onClick={step === 'artifact' ? onClose : () => setStep(step === 'review' ? 'details' : 'artifact')} disabled={isPublishing}>{step === 'artifact' ? t.cancel : '上一步'}</button>
            {step === 'artifact' ? <button className="primary-action" type="button" onClick={(event) => advanceWizard(event, 'details')}><ArrowRight size={15} /><span>下一步：填写发布信息</span></button> : null}
            {step === 'details' ? <button className="primary-action" type="button" onClick={(event) => advanceWizard(event, 'review')}><ArrowRight size={15} /><span>下一步：确认发布</span></button> : null}
            {step === 'review' ? <button className="primary-action" type="button" onClick={submitWizard} disabled={isPublishing}>
              <Upload size={15} />
              <span>{isPublishing ? t.publishing : updateMode ? t.publishVersionSubmit : t.publishSubmit}</span>
            </button> : null}
          </footer>
        </form>
        ) : null}
      </section>
  );
}
