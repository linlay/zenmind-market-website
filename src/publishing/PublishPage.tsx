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

export function PublishPage({ t, locale, availableSkills = [], initialItem = null, onClose, onSubmit, isPublishing }) {
  const updateMode = Boolean(initialItem);
  const initialType = updateMode ? normalizeType(initialItem.type) : 'agent';
  const initialSkillKind = updateMode && initialType === 'skill' ? initialItem.skillKind || 'single' : 'single';
  const initialSandboxKind = updateMode ? initialItem.sandboxKind || 'environment-template' : 'environment-template';
  const initialWebsiteKind = updateMode ? initialItem.websiteKind || 'local-app' : 'local-app';
  const initialPlatformKey = updateMode ? preferredPlatformKey(initialItem) || 'universal' : 'universal';
  const initialPlatform = updateMode ? platformForKey(initialItem, initialPlatformKey) : null;
  const initialAsset = updateMode ? initialItem.assetMap?.[initialPlatformKey] : null;
  const [step, setStep] = useState(updateMode ? 'details' : 'type');
  const [type, setType] = useState(initialType);
  const [archiveType, setArchiveType] = useState(initialAsset?.archiveType || defaultArchiveTypeFor(initialType, { sandboxKind: initialSandboxKind, websiteKind: initialWebsiteKind }));
  const [sandboxKind, setSandboxKind] = useState(initialSandboxKind);
  const [websiteKind, setWebsiteKind] = useState(initialWebsiteKind);
  const [skillKind, setSkillKind] = useState(initialSkillKind);
  const [showAdvanced, setShowAdvanced] = useState(updateMode);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillIDs, setSelectedSkillIDs] = useState(updateMode ? (initialItem.includedSkills || []).map((skill) => skill.id) : []);

  const publishTypes = publishTypeOptions();
  const selectedTypeID = type === 'skill' && skillKind === 'package' ? 'skill-package' : type;
  const selectedType = publishTypes.find((entry) => entry.id === selectedTypeID) || publishTypes[0];
  const SelectedIcon = selectedType?.icon || PackageOpen;
  const artifactRequired = artifactRequiredFor(type, { websiteKind, skill: { kind: skillKind } });
  const supportsADP = supportsADPFor(type, { skill: { kind: skillKind } });
  const showAssetSection = !(type === 'skill' && skillKind === 'package') || supportsADP;
  const filteredSkills = filterPublishSkills(availableSkills, skillSearch, locale);

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
    setSkillSearch('');
    setSelectedSkillIDs([]);
    setStep('details');
  }

  function toggleIncludedSkill(skillID) {
    setSelectedSkillIDs((current) => (
      current.includes(skillID) ? current.filter((id) => id !== skillID) : [...current, skillID]
    ));
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
          {publishTypes.map((option) => {
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
          <button className="secondary-action" type="button" onClick={onClose} disabled={isPublishing}>
            <ArrowRight size={14} />
            <span>{t.backToMarket}</span>
          </button>
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
          <section className="publish-section full">
            <h3>{t.publishBasicInfo}</h3>
            <div className="publish-section-grid">
              <label>
                <span>{t.componentId}</span>
                <input name="id" required readOnly={updateMode} defaultValue={updateMode ? initialItem.id : ''} placeholder="my-agent" pattern="[a-z0-9._-]+" />
                {updateMode ? <small className="field-hint">{t.publishVersionLocked}</small> : null}
              </label>
              <label>
                <span>{t.name}</span>
                <input name="name" required defaultValue={updateMode ? localized(initialItem.name, locale) : ''} placeholder="My Agent" />
              </label>
              <label>
                <span>{t.version}</span>
                <input name="version" defaultValue={updateMode ? nextPatchVersion(initialItem.version) : '1.0.0'} />
              </label>
              <label>
                <span>{t.image}</span>
                <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
              </label>
              <label className="full">
                <span>{t.description}</span>
                <textarea name="description" rows="4" required defaultValue={updateMode ? localized(initialItem.description, locale) : ''} />
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
                <span>{t.skillCategoryTitle}</span>
                <select name="skillCategory" defaultValue={updateMode ? initialItem.skillCategory || 'other' : 'other'}>
                  {skillCategoryFilters.filter((category) => category !== 'all').map((category) => <option value={category} key={category}>{t.skillCategories[category]}</option>)}
                </select>
              </label>
              <label>
                <span>{t.skillScenario}</span>
                <select name="skillScenario" defaultValue={updateMode ? initialItem.skillScenario || 'productivity' : 'productivity'}>
                  {skillScenarioOptions.map((scenario) => <option value={scenario} key={scenario}>{t.skillScenarios[scenario]}</option>)}
                </select>
              </label>
              <label>
                <span>{t.skillLevel}</span>
                <select name="skillLevel" defaultValue={updateMode ? initialItem.skillLevel || 'beginner' : 'beginner'}>
                  {skillLevelOptions.map((level) => <option value={level} key={level}>{t.skillLevels[level]}</option>)}
                </select>
              </label>
              {skillKind === 'package' ? (
                <div className="skill-picker full">
                  <div className="skill-picker-head">
                    <span>{t.includedSkills}</span>
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
              <span>{t.sandboxKind}</span>
              <select name="sandboxKind" value={sandboxKind} onChange={handleSandboxKindChange}>
                <option value="environment-template">environment-template</option>
                <option value="container-image">container-image</option>
              </select>
            </label>
          ) : null}
          {type === 'website-app' ? (
            <label>
              <span>{t.websiteKind}</span>
              <select name="websiteKind" value={websiteKind} onChange={handleWebsiteKindChange}>
                <option value="local-app">local-app</option>
                <option value="external">external</option>
              </select>
            </label>
          ) : null}
          {type === 'website-app' && websiteKind === 'external' ? (
            <label className="full">
              <span>{t.metadataUrl}</span>
              <input name="metadataUrl" type="url" required defaultValue={updateMode ? initialItem.metadata?.url || '' : ''} placeholder="https://example.com/app" />
            </label>
          ) : null}
          {(type === 'software-package' || type === 'sandbox-image') ? (
            <label>
              <span>{t.archiveType}</span>
              <select name="archiveTypeVisible" value={archiveType} onChange={(event) => setArchiveType(event.target.value)}>
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
            <div className="publish-section-grid">
          {!(type === 'skill' && skillKind === 'package') ? (
            <label className="full">
              <span>{t.artifact}</span>
              <input name="artifact" type="file" required={artifactRequired} />
              {!artifactRequired ? <small className="field-hint">{t.artifactOptional}</small> : null}
            </label>
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
            <button className="advanced-toggle" type="button" onClick={() => setShowAdvanced((value) => !value)}>
              <span>{showAdvanced ? t.publishHideAdvanced : t.publishShowAdvanced}</span>
              <ArrowRight size={14} />
            </button>
            {showAdvanced ? (
              <div className="publish-section-grid">
                <label>
                  <span>{t.platformKey}</span>
                  <input name="platformKey" defaultValue={initialPlatformKey} placeholder="universal" />
                </label>
                <label>
                  <span>{t.os}</span>
                  <select name="platformOS" defaultValue={initialPlatform?.os || ''}>
                    <option value="">auto</option>
                    <option value="darwin">darwin</option>
                    <option value="linux">linux</option>
                    <option value="windows">windows</option>
                    <option value="universal">universal</option>
                  </select>
                </label>
                <label>
                  <span>{t.arch}</span>
                  <select name="platformArch" defaultValue={initialPlatform?.arch || ''}>
                    <option value="">auto</option>
                    <option value="arm64">arm64</option>
                    <option value="amd64">amd64</option>
                    <option value="arm">arm</option>
                    <option value="386">386</option>
                  </select>
                </label>
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
                  <input name="author" defaultValue={updateMode ? initialItem.author || '' : ''} placeholder="ZenMind" />
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
