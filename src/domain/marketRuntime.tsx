// @ts-nocheck -- migrated domain helpers are typed incrementally.
import { normalizeDetailViewCount } from '../detailViews';
import {
  Bot,
  Box,
  Brain,
  Cat,
  Globe,
  HardDrive,
  LayoutGrid,
  PackageOpen,
  Puzzle,
  Terminal,
} from 'lucide-react';

export const apiBase = import.meta.env.VITE_MARKET_API_BASE || '/api/v1';
export const brandId = import.meta.env.VITE_MARKET_BRAND || 'zenmind';
export const locales = ['zh-CN', 'en-US'];
export const canonicalTypes = ['skill', 'plugin', 'agent', 'sandbox-image', 'pet', 'cli-tool', 'website-app', 'software-package'];
export const defaultMediaImage = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#eef2ff"/>
        <stop offset="0.55" stop-color="#f8fafc"/>
        <stop offset="1" stop-color="#dbeafe"/>
      </linearGradient>
    </defs>
    <rect width="960" height="540" fill="url(#bg)"/>
    <rect x="72" y="72" width="816" height="396" rx="30" fill="#ffffff" fill-opacity="0.74" stroke="#cbd5e1"/>
    <circle cx="204" cy="192" r="52" fill="#2563eb" fill-opacity="0.16"/>
    <rect x="296" y="160" width="408" height="26" rx="13" fill="#0f172a" fill-opacity="0.18"/>
    <rect x="296" y="214" width="520" height="18" rx="9" fill="#0f172a" fill-opacity="0.1"/>
    <rect x="296" y="252" width="452" height="18" rx="9" fill="#0f172a" fill-opacity="0.1"/>
    <rect x="144" y="346" width="672" height="58" rx="18" fill="#2563eb" fill-opacity="0.13"/>
  </svg>
`);

export const brandNames = {
  zenmind: { 'zh-CN': 'ZenMind 市场', 'en-US': 'ZenMind Market' },
  cutej: { 'zh-CN': '小君 AI 市场', 'en-US': 'CuteJ Market' },
};

export const marketBrand = resolveMarketBrand(brandId);

export const categoryMeta = [
  { id: 'all', icon: LayoutGrid, colorClass: 'is-muted' },
  { id: 'skill', icon: Brain, colorClass: 'is-purple' },
  { id: 'plugin', icon: Puzzle, colorClass: 'is-blue' },
  { id: 'agent', icon: Bot, colorClass: 'is-indigo' },
  { id: 'sandbox-image', icon: Box, colorClass: 'is-emerald' },
  { id: 'pet', icon: Cat, colorClass: 'is-amber' },
  { id: 'cli-tool', icon: Terminal, colorClass: 'is-rose' },
  { id: 'website-app', icon: Globe, colorClass: 'is-cyan' },
  { id: 'software-package', icon: HardDrive, colorClass: 'is-emerald' },
];

export function publishTypeOptions() {
  return [
    { id: 'skill', type: 'skill', skillKind: 'single', icon: Brain, label: (t) => t.skillSingle },
    { id: 'skill-package', type: 'skill', skillKind: 'package', icon: PackageOpen, label: (t) => t.skillPackage },
    { id: 'plugin', type: 'plugin', icon: Puzzle, label: (t) => t.categories.plugin },
    { id: 'agent', type: 'agent', icon: Bot, label: (t) => t.categories.agent },
    { id: 'sandbox-image', type: 'sandbox-image', icon: Box, label: (t) => t.categories['sandbox-image'] },
    { id: 'cli-tool', type: 'cli-tool', icon: Terminal, label: (t) => t.categories['cli-tool'] },
    { id: 'website-app', type: 'website-app', icon: Globe, label: (t) => t.categories['website-app'] },
    { id: 'software-package', type: 'software-package', icon: HardDrive, label: (t) => t.categories['software-package'] },
    { id: 'pet', type: 'pet', icon: Cat, label: (t) => t.categories.pet },
  ];
}

export const sidebarCategoryMeta = categoryMeta.filter((category) => category.id !== 'pet');
export const skillCategoryFilters = ['all', 'document', 'data', 'coding', 'browser', 'office', 'content', 'media', 'search', 'system', 'integration', 'automation', 'other'];
export const skillScenarioOptions = ['productivity', 'developer', 'research', 'enterprise', 'education', 'creator'];
export const skillLevelOptions = ['beginner', 'intermediate', 'advanced'];

export function initialTheme() {
  const saved = localStorage.getItem('zenmind-market:theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function mergeCatalogItem(apiItem) {
  const type = normalizeType(apiItem.type);
  const assetMap = apiItem.assets || {};
  const platformMap = synthesizePlatformMap(apiItem.platforms || {}, assetMap);
  const skill = normalizeSkillProfile(apiItem.skill, type);
  const assets = Object.entries(assetMap).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'} ${formatBytes(asset.sizeBytes)}`);
  const downloadCount = parseCount(apiItem.downloadCount ?? apiItem.metadata?.downloads ?? 0);
  const favoriteCount = parseCount(apiItem.favoriteCount ?? apiItem.metadata?.favorites ?? 0);
  const commentCount = parseCount(apiItem.commentCount ?? 0);
  const dependencies = apiItem.dependencies?.length ? apiItem.dependencies.map((dep) => ({
    ...dep,
    id: dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
    name: dep.displayName || dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
  })) : [];
  return {
    ...apiItem,
    type,
    name: apiItem.name || apiItem.id,
    description: apiItem.description || '',
    readme: apiItem.readme || '',
    tags: apiItem.tags || [],
    assets,
    assetMap,
    platformMap,
    platformOptions: sortPlatformKeys(Object.keys(platformMap)),
    dependencies,
    skill,
    skillKind: skill.kind,
    skillCategory: skill.category,
    skillScenario: skill.scenario,
    skillLevel: skill.level,
    skillPackageMode: skill.packageMode,
    skillFeatured: Boolean(skill.featured),
    includedSkills: skill.includedSkills,
    icon: apiItem.metadata?.icon || apiItem.metadata?.screenshot || '',
    screenshot: apiItem.metadata?.screenshot || apiItem.metadata?.icon || defaultMediaImage,
    videoThumb: apiItem.metadata?.videoThumb || '',
    hasVideo: Boolean(apiItem.metadata?.videoThumb || apiItem.metadata?.videoUrl),
    author: apiItem.author || apiItem.metadata?.author || 'ZenMind',
    createdAt: apiItem.createdAt || apiItem.publishedAt || '',
    size: formatAssetSize(apiItem),
    downloadCount,
    downloads: downloadCount,
    detailViewCount: normalizeDetailViewCount(apiItem.detailViewCount),
    favoriteCount,
    commentCount,
    positiveCount: parseCount(apiItem.positiveCount ?? 0),
    negativeCount: parseCount(apiItem.negativeCount ?? 0),
    positiveRate: Number(apiItem.positiveRate || 0),
    favorited: Boolean(apiItem.favorited),
    reviewStatus: normalizeReviewStatusForUI(apiItem.reviewStatus),
    reviewNote: apiItem.reviewNote || '',
    reviewedAt: apiItem.reviewedAt || '',
    reviewedBy: apiItem.reviewedBy || '',
  };
}

export function normalizeType(type) {
  if (type === 'webapps' || type === 'webapp' || type === 'website' || type === 'website-apps') return 'website-app';
  if (type === 'agents') return 'agent';
  if (type === 'software' || type === 'softwares' || type === 'software-packages' || type === 'dependency-package' || type === 'dependency-packages') return 'software-package';
  return canonicalTypes.includes(type) ? type : 'skill';
}

export function normalizeSkillProfile(skill, type) {
  if (type !== 'skill') {
    return { kind: '', category: '', scenario: '', level: '', packageMode: '', featured: false, includedSkills: [] };
  }
  const kind = skill?.kind === 'package' ? 'package' : 'single';
  const category = skillCategoryFilters.includes(skill?.category) && skill.category !== 'all' ? skill.category : 'other';
  const scenario = skillScenarioOptions.includes(skill?.scenario) ? skill.scenario : 'productivity';
  const level = skillLevelOptions.includes(skill?.level) ? skill.level : 'beginner';
  const packageMode = kind === 'package' ? 'collection' : '';
  const includedSkills = Array.isArray(skill?.includedSkills)
    ? skill.includedSkills.map((entry) => ({
      id: String(entry.id || '').trim(),
      name: entry.name || '',
      optional: Boolean(entry.optional),
      sortOrder: Number(entry.sortOrder || 0),
    })).filter((entry) => entry.id)
    : [];
  return { kind, category, scenario, level, packageMode, featured: Boolean(skill?.featured), includedSkills };
}

export function normalizeReviewStatusForUI(status) {
  status = String(status || '').trim().toLowerCase();
  return ['approved', 'rejected', 'pending'].includes(status) ? status : 'approved';
}

export function localized(value, locale) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return value[locale] || value['zh-CN'] || value['en-US'] || '';
  return value || '';
}

export function resolveMarketBrand(value) {
  const raw = String(value || 'zenmind').trim() || 'zenmind';
  const key = raw.toLowerCase();
  if (brandNames[key]) return { id: key, name: brandNames[key] };
  const fallbackName = formatBrandLabel(raw);
  return {
    id: key,
    name: {
      'zh-CN': `${fallbackName} 市场`,
      'en-US': `${fallbackName} Market`,
    },
  };
}

export function formatBrandLabel(value) {
  const words = String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 'ZenMind';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function displayType(type, t) {
  return t?.categories?.[type] || (type === 'website-app' ? 'webapps' : type);
}

export function skillKindLabel(kind, t) {
  return kind === 'package' ? t.skillPackage : t.skillSingle;
}

export function skillCategoryLabel(category, t) {
  return t.skillCategories?.[category] || t.skillCategories?.other || category;
}

export function isSkillPackage(item) {
  return item?.type === 'skill' && item?.skillKind === 'package';
}

export function canonicalVersion(value) {
  const version = String(value || '').trim();
  if (/^[vV]\d/.test(version)) return version.slice(1);
  return version;
}

export function semanticVersionParts(value) {
  const match = canonicalVersion(value).match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) return null;
  return { core: match.slice(1, 4).map(Number), pre: match[4] || '' };
}

export function compareSemanticVersionStrings(left, right) {
  const a = semanticVersionParts(left);
  const b = semanticVersionParts(right);
  if (!a || !b) return -1;
  for (let index = 0; index < 3; index += 1) {
    if (a.core[index] !== b.core[index]) return a.core[index] > b.core[index] ? 1 : -1;
  }
  if (!a.pre && b.pre) return 1;
  if (a.pre && !b.pre) return -1;
  return a.pre.localeCompare(b.pre, undefined, { numeric: true });
}

export function nextPatchVersion(value) {
  const parsed = semanticVersionParts(value);
  if (!parsed) return '1.0.0';
  return `${parsed.core[0]}.${parsed.core[1]}.${parsed.core[2] + 1}`;
}

export function formatVersionLabel(value) {
  const version = canonicalVersion(value);
  return version ? `v${version}` : '';
}

export function synthesizePlatformMap(platforms = {}, assets = {}) {
  const result = {};
  for (const [key, spec] of Object.entries(platforms || {})) {
    const platform = sanitizePlatformKey(spec?.platform || key) || 'universal';
    result[platform] = normalizePlatformSpec(platform, spec);
  }
  for (const [key] of Object.entries(assets || {})) {
    const platform = sanitizePlatformKey(key) || 'universal';
    if (!result[platform]) {
      result[platform] = normalizePlatformSpec(platform, { platform });
    }
  }
  return result;
}

export function normalizePlatformSpec(platform, spec = {}) {
  return {
    platform,
    os: spec.os || inferOSFromPlatform(platform),
    arch: spec.arch || inferArchFromPlatform(platform),
    description: spec.description || '',
    readme: spec.readme || '',
    minDesktopVersion: spec.minDesktopVersion || '',
    metadata: spec.metadata || {},
    dependencies: normalizeDependenciesForUI(spec.dependencies || []),
    install: spec.install || null,
    uninstall: spec.uninstall || null,
    detect: spec.detect || null,
  };
}

export function normalizeDependenciesForUI(dependencies) {
  return (dependencies || []).map((dep) => ({
    ...dep,
    id: dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
    name: dep.displayName || dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
  }));
}

export function availablePlatformKeys(item) {
  const keys = item?.platformOptions?.length
    ? item.platformOptions
    : sortPlatformKeys([
      ...Object.keys(item?.platformMap || {}),
      ...Object.keys(item?.assetMap || {}),
    ]);
  return keys;
}

export function sortPlatformKeys(keys) {
  return [...new Set(keys.map(sanitizePlatformKey).filter(Boolean))].sort((a, b) => {
    if (a === 'universal') return -1;
    if (b === 'universal') return 1;
    return a.localeCompare(b);
  });
}

export function preferredPlatformKey(item, requested = '') {
  const keys = availablePlatformKeys(item);
  if (!keys.length) return '';
  const detected = detectClientPlatform();
  const preferred = requested || detected.key;
  for (const candidate of platformFallbackCandidates(preferred)) {
    if (keys.includes(candidate)) return candidate;
  }
  for (const candidate of platformFallbackCandidates(detected.os)) {
    if (keys.includes(candidate)) return candidate;
  }
  if (keys.includes('universal')) return 'universal';
  return keys[0];
}

export function platformForKey(item, key) {
  const resolvedKey = preferredPlatformKey(item, key);
  return item?.platformMap?.[resolvedKey] || (resolvedKey ? normalizePlatformSpec(resolvedKey, { platform: resolvedKey }) : null);
}

export function downloadKeyForItem(item, platformKey = '') {
  if (!item) return '';
  if (item.type === 'skill' && item.skillKind === 'package') return `${item.type}:${item.id}:package`;
  return `${item.type}:${item.id}:${preferredPlatformKey(item, platformKey) || 'any'}`;
}

export function platformDependencies(platform, item) {
  if (platform?.dependencies?.length) return platform.dependencies;
  return item?.dependencies || [];
}

export function platformFallbackCandidates(platform) {
  platform = sanitizePlatformKey(platform);
  if (!platform || platform === 'universal') return ['universal'];
  const candidates = [];
  const add = (value) => {
    value = sanitizePlatformKey(value);
    if (value && !candidates.includes(value)) candidates.push(value);
  };
  add(platform);
  const parts = platform.split('-');
  if (parts.length >= 2) add(`${parts[0]}-${parts[1]}`);
  if (parts.length >= 1) add(parts[0]);
  add('universal');
  return candidates;
}

export function detectClientPlatform() {
  const rawPlatform = `${navigator.platform || ''} ${navigator.userAgent || ''}`.toLowerCase();
  let os = 'universal';
  if (rawPlatform.includes('mac') || rawPlatform.includes('darwin')) os = 'darwin';
  else if (rawPlatform.includes('win')) os = 'windows';
  else if (rawPlatform.includes('linux') || rawPlatform.includes('x11')) os = 'linux';

  let arch = '';
  if (rawPlatform.includes('arm64') || rawPlatform.includes('aarch64')) arch = 'arm64';
  else if (rawPlatform.includes('x86_64') || rawPlatform.includes('x64') || rawPlatform.includes('win64') || rawPlatform.includes('amd64')) arch = 'amd64';
  else if (rawPlatform.includes('i686') || rawPlatform.includes('i386')) arch = '386';
  if (!arch && os === 'darwin') arch = 'arm64';
  if (!arch && os !== 'universal') arch = 'amd64';

  return { os, arch, key: os === 'universal' ? 'universal' : `${os}-${arch}` };
}

export function sanitizePlatformKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function inferOSFromPlatform(platform) {
  const key = sanitizePlatformKey(platform);
  if (key.startsWith('darwin')) return 'darwin';
  if (key.startsWith('linux')) return 'linux';
  if (key.startsWith('windows') || key.startsWith('win32')) return 'windows';
  return key === 'universal' ? 'universal' : '';
}

export function inferArchFromPlatform(platform) {
  const parts = sanitizePlatformKey(platform).split('-');
  return parts.find((part) => ['arm64', 'amd64', '386', 'arm'].includes(part)) || '';
}

export function marketRoute(type) {
  switch (normalizeType(type)) {
    case 'skill':
      return 'skills';
    case 'plugin':
      return 'plugins';
    case 'agent':
      return 'agents';
    case 'sandbox-image':
      return 'sandbox-images';
    case 'pet':
      return 'pets';
    case 'cli-tool':
      return 'cli-tools';
    case 'website-app':
      return 'webapps';
    case 'software-package':
      return 'software-packages';
    default:
      return 'skills';
  }
}

export function dependencyKey(dep) {
  return dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind || 'unknown';
}

export function commandEntries(platform, t) {
  const entries = [];
  if (platform?.install?.command) entries.push({ label: t.installCommand, value: platform.install.command });
  if (platform?.uninstall?.command) entries.push({ label: t.uninstallCommand, value: platform.uninstall.command });
  for (const command of platform?.detect?.commands || []) {
    if (command) entries.push({ label: t.detectCommands, value: command });
  }
  if (platform?.detect?.versionCommand) entries.push({ label: t.versionCommand, value: platform.detect.versionCommand });
  return entries;
}

export function assetList(item) {
  if (Array.isArray(item.assets)) return item.assets;
  return Object.entries(item.assets || {}).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'}`);
}

export function assetEntries(item) {
  const assets = item.assetMap || item.assets || {};
  if (Array.isArray(assets)) return assets.map((label) => ({ label, platform: label.split('/')[0] }));
  return Object.entries(assets).map(([platform, asset]) => ({
    platform,
    label: `${platform}/${asset.archiveType || 'artifact'} ${formatBytes(asset.sizeBytes)}`,
    asset,
  }));
}

export function formatAssetSize(item) {
  const values = Object.values(item.assets || {});
  if (!values.length || !values[0]?.sizeBytes) return 'size unknown';
  return formatBytes(values.reduce((sum, asset) => sum + (asset.sizeBytes || 0), 0));
}

export function formatAssetSizeForPlatform(item, platformKey) {
  const asset = getAssetForPlatform(item, platformKey);
  return asset?.sizeBytes ? formatBytes(asset.sizeBytes) : '';
}

export function formatBytes(value) {
  if (!value) return 'size unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function parseCount(value) {
  return Number(String(value || '0').replace(/[^0-9]/g, '')) || 0;
}

export function parseDownloads(value) {
  return parseCount(value);
}

export function formatCount(value) {
  return parseCount(value).toLocaleString();
}

export function formatDownloads(value) {
  return formatCount(value);
}

export function formatDate(value, locale) {
  const timestamp = dateValue(value);
  if (!timestamp) return locale === 'zh-CN' ? '未知' : 'Unknown';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

export function dateValue(value) {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function getAssetForPlatform(item, platformKey = '') {
  const assetMap = item?.assetMap || {};
  if (!Object.keys(assetMap).length) return null;
  if (!platformKey) return Object.values(assetMap)[0] || null;
  for (const candidate of platformFallbackCandidates(platformKey)) {
    if (assetMap[candidate]) return assetMap[candidate];
  }
  return null;
}

export function hasArtifact(item, platformKey = '') {
  if (platformKey) return Boolean(getAssetForPlatform(item, platformKey));
  return Boolean(Object.keys(item?.assetMap || {}).length || assetList(item).length);
}

export function creatorQualityIssues(item, t) {
  const issues = [];
  if (!item?.icon) issues.push(t.creatorQualityImage);
  if (!String(item?.readme || '').trim()) issues.push(t.creatorQualityReadme);
  if (!isSkillPackage(item) && item?.websiteKind !== 'external' && !hasArtifact(item)) issues.push(t.creatorQualityArtifact);
  return issues;
}

export function triggerBrowserDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function canInstallWithADP(item) {
  return Boolean(item?.adpInstallUrl && (item.type === 'cli-tool' || item.type === 'skill'));
}

export function adpInstallCommand(item) {
  if (!canInstallWithADP(item)) return '';
  return `adp install ${absoluteInstallURL(item.adpInstallUrl)}`;
}

export function absoluteInstallURL(value) {
  if (!value) return '';
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return String(value);
  }
}

export function parseTags(value) {
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function filterPublishSkills(skills, query, locale) {
  const needle = String(query || '').trim().toLowerCase();
  const sorted = [...(skills || [])].sort((a, b) => localized(a.name, locale).localeCompare(localized(b.name, locale)));
  if (!needle) return sorted;
  return sorted.filter((skill) => [
    skill.id,
    localized(skill.name, locale),
    localized(skill.description, locale),
    ...(skill.tags || []),
  ].join(' ').toLowerCase().includes(needle));
}

export function parseIncludedSkills(value) {
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((entry) => String(entry || '').split(/[\n,]/))
    .map((id, index) => ({ id: id.trim().toLowerCase(), sortOrder: index + 1 }))
    .filter((entry) => entry.id);
}

export function parseJSONField(value, fallback, label, expectedType, invalidJSON) {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(invalidJSON ? invalidJSON(label) : `${label} is not valid JSON.`);
  }
  if (expectedType === 'array' && !Array.isArray(parsed)) {
    throw new Error(invalidJSON ? invalidJSON(label) : `${label} must be an array.`);
  }
  if (expectedType === 'object' && (Array.isArray(parsed) || parsed === null || typeof parsed !== 'object')) {
    throw new Error(invalidJSON ? invalidJSON(label) : `${label} must be an object.`);
  }
  return parsed;
}

export function scriptSpecFromCommand(value) {
  const command = String(value || '').trim();
  return command ? { command } : null;
}

export function detectSpecFromForm(form) {
  const commands = String(form.get('detectCommands') || '')
    .split(/\n|,/)
    .map((command) => command.trim())
    .filter(Boolean);
  const versionCommand = String(form.get('versionCommand') || '').trim();
  if (!commands.length && !versionCommand) return null;
  return { commands, versionCommand };
}

export function artifactRequiredFor(type, options = {}) {
  type = normalizeType(type);
  if (type === 'cli-tool') return false;
  if (type === 'website-app' && options.websiteKind === 'external') return false;
  if (type === 'skill' && options.skill?.kind === 'package') return false;
  return true;
}

export function supportsADPFor(type, options = {}) {
  type = normalizeType(type);
  if (type === 'skill' && options.skill?.kind === 'package') return false;
  return type === 'cli-tool' || type === 'skill';
}

export function archiveOptionsFor(type, options = {}) {
  switch (normalizeType(type)) {
    case 'skill':
    case 'plugin':
    case 'agent':
    case 'pet':
    case 'cli-tool':
    case 'website-app':
      return ['zip'];
    case 'software-package':
      return ['zip', 'tar.gz'];
    case 'sandbox-image':
      return options.sandboxKind === 'container-image' ? ['tar.gz'] : ['zip'];
    default:
      return ['zip'];
  }
}

export function defaultArchiveTypeFor(type, options = {}) {
  return archiveOptionsFor(type, options)[0] || 'zip';
}

export function svgDataUri(markup) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}
