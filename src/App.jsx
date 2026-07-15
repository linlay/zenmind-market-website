import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Store,
  X,
} from 'lucide-react';
import { selectedFormFile } from './fileInputs.js';

const apiBase = import.meta.env.VITE_MARKET_API_BASE || '/api/v1';
const brandId = import.meta.env.VITE_MARKET_BRAND || 'zenmind';
const locales = ['zh-CN', 'en-US'];
const canonicalTypes = ['skill', 'plugin', 'agent', 'sandbox-image', 'pet', 'cli-tool', 'website-app', 'software-package'];
const defaultMediaImage = svgDataUri(`
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

const brandNames = {
  zenmind: { 'zh-CN': 'ZenMind 市场', 'en-US': 'ZenMind Market' },
  cutej: { 'zh-CN': '小君 AI 市场', 'en-US': 'CuteJ Market' },
};

const marketBrand = resolveMarketBrand(brandId);

const translations = {
  'zh-CN': {
    searchPlaceholder: '搜索扩展、插件、沙箱、工具...',
    publish: '开发者发布',
    login: '登录',
    logout: '退出登录',
    loginAsCreator: '普通用户',
    loginAsAdmin: '管理员',
    loginRequired: '请先登录。',
    adminReviewEntry: '审核管理',
    adminOnly: '需要管理员角色。',
    creatorCenter: '创作者中心',
    backToMarket: '返回市场',
    creatorTitle: '创作者中心',
    creatorSubtitle: '管理本地市场中的组件供给、发布质量和基础表现。',
    creatorDashboard: '工作台',
    creatorInventory: '我的组件',
    creatorQuality: '发布检查',
    creatorTotalItems: '已发布组件',
    creatorTotalDownloads: '总下载量',
    creatorTotalFavorites: '总收藏量',
    creatorSkillPackages: '技能包',
    creatorRecent: '最近更新',
    creatorTypeFilter: '组件类型',
    creatorAllTypes: '全部类型',
    creatorOpenMarket: '查看',
    creatorEmptyTitle: '还没有组件',
    creatorEmptyBody: '先发布一个技能、插件或工具，创作者中心会自动汇总它的表现。',
    creatorQualityImage: '补充展示图片',
    creatorQualityReadme: '完善 README',
    creatorQualityArtifact: '补充可下载制品',
    creatorQualityGood: '基础信息完整',
    creatorNoIssues: '暂无待优化项',
    creatorVersion: '版本',
    creatorUpdatedAt: '更新时间',
    creatorSearch: '搜索我的组件',
    creatorAnalytics: '数据分析',
    creatorTopDownloads: '下载排行',
    creatorMyFavorites: '我的收藏',
    creatorNoFavorites: '还没有收藏组件',
    creatorNoFavoritesBody: '在市场中收藏组件后，会显示在这里。',
    creatorTypeBreakdown: '类型分布',
    creatorReady: '完整组件',
    creatorNeedsWork: '待优化组件',
    creatorVersions: '版本',
    creatorVersionHistory: '版本历史',
    creatorLoadVersions: '查看版本',
    creatorNoVersions: '暂无版本记录',
    creatorCurrentVersion: '当前版本',
    creatorPublishedAt: '发布时间',
    creatorProfile: '创作者资料',
    creatorProfileName: 'ZenMind 创作者',
    creatorProfileBio: '当前登录的创作者身份会用于管理组件、发布内容和查看基础表现。',
    profileEmail: '邮箱',
    profileRole: '角色',
    profileUnavailable: '认证中心未提供',
    creatorLocalMode: '已通过 OIDC 登录',
    creatorLocalModeBody: '身份由配置的第三方认证服务验证，市场仅使用服务端会话 Cookie。',
    reviewCenter: '审核中心',
    reviewStatus: '审核状态',
    reviewPending: '待审核',
    reviewApproved: '已通过',
    reviewRejected: '已驳回',
    reviewApprove: '通过',
    reviewReject: '驳回',
    reviewRejectReason: '驳回原因',
    reviewSubmitMode: '发布方式',
    reviewSubmitPending: '提交审核',
    reviewSubmitApproved: '直接发布',
    reviewUpdateSuccess: '审核状态已更新。',
    reviewUpdateFailed: (reason) => `审核更新失败：${reason}`,
    reviewNotePrompt: '请输入驳回原因',
    reviewAdminTokenHint: '管理员可以查看待审核组件，并执行通过或驳回操作。',
    reviewLoadAdminData: '加载审核数据',
    reviewLoadSuccess: '审核数据已加载。',
    reviewLoadFailed: (reason) => `审核数据加载失败：${reason}`,
    adminManagement: '管理中心',
    adminManagementSubtitle: '审批待发布组件，并管理已上架制品。',
    adminPendingPublications: '待审核发布',
    adminPublishedComponents: '已上架组件',
    adminNoPendingPublications: '当前没有待审核发布。',
    adminNoPublishedComponents: '当前没有已上架组件。',
    adminSearchPublished: '搜索已上架组件',
    adminUnpublishLatest: '下架最新版本',
    adminUnpublishConfirm: (name, version) => `确认下架「${name}」的最新版本 ${version} 吗？若存在已发布的历史版本，市场将自动回退到该版本。`,
    adminUnpublishSuccess: '最新版本已下架，市场列表已刷新。',
    adminUnpublishFailed: (reason) => `下架失败：${reason}`,
    categoriesTitle: '市场分类',
    skillKindTitle: '技能类型',
    skillCategoryTitle: '技能分类',
    skillSingle: '单个技能',
    skillPackage: '技能包',
    skillIncluded: '包含以下技能',
    includedSkills: '选择包含技能',
    includedSkillsHint: '可多选当前市场中已发布的单个技能。',
    includedSkillsSearch: '搜索技能名称或 ID',
    includedSkillsSelected: (count) => `已选择 ${count} 个技能`,
    includedSkillsRequired: '请至少选择一个要包含的技能。',
    noAvailableSkills: '暂无可关联的单个技能，请先发布技能。',
    skillScenario: '使用场景',
    skillLevel: '难度',
    skillFeatured: '官方推荐',
    skillCategories: {
      all: '全部技能',
      document: '文档处理',
      data: '数据分析',
      coding: '编程开发',
      browser: '浏览器自动化',
      office: '办公效率',
      content: '内容创作',
      media: '图像多媒体',
      search: '搜索阅读',
      system: '系统操作',
      integration: 'API 集成',
      automation: '自动化',
      other: '其他',
    },
    skillCuratedTitles: {
      document: '文档严选技能',
      data: '数据严选技能',
      coding: '编程严选技能',
      browser: '浏览器严选技能',
      office: '办公严选技能',
      content: '内容严选技能',
      media: '多媒体严选技能',
      search: '搜索阅读严选技能',
      system: '系统严选技能',
      integration: 'API 严选技能',
      automation: '自动化严选技能',
      other: '其他严选技能',
    },
    skillScenarios: {
      productivity: '效率',
      developer: '开发者',
      research: '研究',
      enterprise: '企业',
      education: '教育',
      creator: '创作者',
    },
    skillLevels: {
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级',
    },
    footer: '© 2026 ZenMind Technologies.\n标准扩展协议 v1.0',
    sortLabel: '排序:',
    sortPopular: '热门推荐',
    sortLatest: '最新发布',
    sortRating: '名称排序',
    count: (value) => `(${value})`,
    all: '全部组件',
    manage: '管理',
    details: '详情',
    emptyTitle: '未找到相关组件',
    emptyBody: '请尝试其他搜索词或分类。',
    emptyCatalogTitle: '市场暂无组件',
    emptyCatalogBody: '后端 SQLite 目录为空，请通过开发者发布上传真实制品。',
    loadingTitle: '正在加载市场',
    loadingBody: '正在获取官方目录。',
    loadingErrorTitle: '市场加载失败',
    loadingErrorBody: '无法连接后端目录。',
    cancel: '取消',
    close: '关闭',
    wait: '请稍候...',
    returnDeps: '返回依赖管理',
    complete: '完成',
    themeToggle: '切换主题',
    languageToggle: '切换语言',
    terminalShell: 'bash',
    depRequired: '必需',
    depOptional: '可选',
    developer: '开发者',
    createdAt: '创建日期',
    size: '大小',
    downloads: '下载',
    favorites: '收藏',
    favoriteAction: '收藏',
    unfavoriteAction: '取消收藏',
    favoriteFailed: (reason) => `收藏失败：${reason}`,
    favoriteAuthRequired: '需要登录或授权后才能收藏。',
    features: '核心特性',
    dependencies: '依赖图谱',
    assets: '制品内容',
    readmeFallback: '组件核心特性',
    noDescription: '暂无描述。',
    noDependencies: '暂无依赖。',
    downloadArtifact: '下载',
    downloading: '准备下载...',
    noArtifact: '暂无制品',
    downloadStarted: (name) => `[${name}] 制品下载已开始。`,
    downloadUnavailable: '后端未返回可下载制品。',
    downloadFailed: (reason) => `下载失败：${reason}`,
    installWithADP: '一键安装',
    installCopied: (command) => `已复制安装命令：${command}`,
    installCopyFailed: (reason) => `复制安装命令失败：${reason}`,
    installUnavailable: '该组件暂无 ADP 安装协议。',
    videoPlaying: '演示运行中',
    publishTitle: '发布到市场',
    publishBody: '先选择组件类型，再填写该类型需要的发布信息。',
    publishStepType: '选择类型',
    publishStepDetails: '填写信息',
    publishChooseType: '选择要发布的组件',
    publishChooseTypeBody: '不同组件需要提交的内容不同，先选类型可以减少不必要的配置项。',
    publishBackToTypes: '返回类型选择',
    publishBasicInfo: '基础信息',
    publishRequiredAssets: '必需材料',
    publishTypeSettings: '类型设置',
    publishAdvanced: '高级选项',
    publishShowAdvanced: '展开高级选项',
    publishHideAdvanced: '收起高级选项',
    publishTypeRequirements: '需要准备',
    publishTypeDescriptions: {
      skill: '上传单个技能，支持一键安装。',
      'skill-package': '关联已有技能，生成可一键下载的技能组合。',
      plugin: '上传插件制品，提供扩展能力。',
      agent: '上传智能体定义和运行资源。',
      'sandbox-image': '发布运行环境模板或容器镜像。',
      pet: '上传桌面宠物资源包。',
      'cli-tool': '发布命令行工具；需要额外安装依赖时可附加 ADP 协议。',
      'website-app': '发布本地网站应用或外部链接。',
      'software-package': '发布 Python、Node.js 等软件依赖包。',
    },
    publishTypeRequirementsMap: {
      skill: 'zip 制品、SKILL.md；可选 adp.yaml',
      'skill-package': '至少 1 个已存在技能 ID',
      plugin: 'zip 制品、manifest.json',
      agent: 'zip 制品、agent.yml / agent.yaml',
      'sandbox-image': 'environment.json 或 tar.gz 镜像',
      pet: 'pet.json、pet-idle.png',
      'cli-tool': '可选 zip 制品、可选 adp.yaml',
      'website-app': 'website.json 或外部 URL',
      'software-package': 'zip / tar.gz 依赖包',
    },
    type: '类型',
    componentId: '组件 ID',
    name: '名称',
    version: '版本',
    description: '描述',
    publishSubmit: '发布并上架',
    duplicate: (id) => `发布失败：组件 ID [${id}] 已存在于市场中。`,
    publishSuccess: (name) => `组件 [${name}] 发布成功并上架！`,
    publishFailed: (reason) => `发布失败：${reason}`,
    publishing: '正在发布...',
    artifact: '制品包',
    image: '展示图片',
    artifactRequired: '请选择要上传的制品包。',
    adpManifest: 'ADP 0.1 最新协议',
    adpManifestHint: '仅在需要额外安装依赖时上传 ADP 0.1 协议 adp.yaml；服务器会校验 hooks 并绑定本次制品 URL 和 SHA-256。',
    archiveType: '制品类型',
    platformKey: '平台',
    platforms: '平台支持',
    currentPlatform: '当前平台',
    selectedPlatform: '已选平台',
    os: '系统',
    arch: '架构',
    minDesktopVersion: '最低桌面版本',
    platformDescription: '平台说明',
    platformMetadata: '平台元数据 JSON',
    platformDependencies: '平台依赖 JSON',
    installProtocol: '安装协议',
    installCommand: '安装命令',
    uninstallCommand: '卸载命令',
    detectCommands: '检测命令',
    versionCommand: '版本命令',
    noPlatformDetails: '暂无平台详情。',
    noInstallProtocol: '暂无安装脚本。',
    artifactOptional: '未选择制品时将发布元数据。',
    invalidJSON: (field) => `${field} 不是有效 JSON。`,
    tags: '标签',
    readme: 'README',
    author: '作者',
    metadataUrl: '外部 URL',
    sandboxKind: '沙箱类型',
    websiteKind: '网站类型',
    categories: {
      all: '全部组件',
      skill: '技能',
      plugin: '插件',
      agent: '智能体',
      'sandbox-image': '沙箱',
      pet: '桌面宠物',
      'cli-tool': 'CLI 工具',
      'website-app': '网站应用',
      'software-package': '软件依赖包',
    },
  },
  'en-US': {
    searchPlaceholder: 'Search extensions, plugins, sandboxes, tools...',
    publish: 'Developer publish',
    login: 'Sign in',
    logout: 'Sign out',
    loginAsCreator: 'User',
    loginAsAdmin: 'Admin',
    loginRequired: 'Sign in first.',
    adminReviewEntry: 'Review Admin',
    adminOnly: 'Admin role required.',
    creatorCenter: 'Creator Center',
    backToMarket: 'Back to Market',
    creatorTitle: 'Creator Center',
    creatorSubtitle: 'Manage local market supply, publishing quality, and basic performance.',
    creatorDashboard: 'Dashboard',
    creatorInventory: 'My Components',
    creatorQuality: 'Publish checks',
    creatorTotalItems: 'Published items',
    creatorTotalDownloads: 'Total downloads',
    creatorTotalFavorites: 'Total favorites',
    creatorSkillPackages: 'Skill packages',
    creatorRecent: 'Recently updated',
    creatorTypeFilter: 'Type',
    creatorAllTypes: 'All types',
    creatorOpenMarket: 'View',
    creatorEmptyTitle: 'No components yet',
    creatorEmptyBody: 'Publish a skill, plugin, or tool first; Creator Center will summarize its performance automatically.',
    creatorQualityImage: 'Add display image',
    creatorQualityReadme: 'Improve README',
    creatorQualityArtifact: 'Add downloadable artifact',
    creatorQualityGood: 'Basic information complete',
    creatorNoIssues: 'No issues',
    creatorVersion: 'Version',
    creatorUpdatedAt: 'Updated',
    creatorSearch: 'Search my components',
    creatorAnalytics: 'Analytics',
    creatorTopDownloads: 'Top downloads',
    creatorMyFavorites: 'My favorites',
    creatorNoFavorites: 'No favorites yet',
    creatorNoFavoritesBody: 'Components you favorite in the Market will appear here.',
    creatorTypeBreakdown: 'Type breakdown',
    creatorReady: 'Ready items',
    creatorNeedsWork: 'Needs work',
    creatorVersions: 'Versions',
    creatorVersionHistory: 'Version history',
    creatorLoadVersions: 'View versions',
    creatorNoVersions: 'No version records yet',
    creatorCurrentVersion: 'Current version',
    creatorPublishedAt: 'Published',
    creatorProfile: 'Creator profile',
    creatorProfileName: 'ZenMind Creator',
    creatorProfileBio: 'The current creator identity is used to manage components, publish content, and view basic performance.',
    profileEmail: 'Email',
    profileRole: 'Role',
    profileUnavailable: 'Not provided by the identity provider',
    creatorLocalMode: 'Signed in with OIDC',
    creatorLocalModeBody: 'Identity is verified by the configured third-party provider; Market uses only a server-side session cookie.',
    reviewCenter: 'Review Center',
    reviewStatus: 'Review status',
    reviewPending: 'Pending',
    reviewApproved: 'Approved',
    reviewRejected: 'Rejected',
    reviewApprove: 'Approve',
    reviewReject: 'Reject',
    reviewRejectReason: 'Rejection reason',
    reviewSubmitMode: 'Publish mode',
    reviewSubmitPending: 'Submit for review',
    reviewSubmitApproved: 'Publish directly',
    reviewUpdateSuccess: 'Review status updated.',
    reviewUpdateFailed: (reason) => `Review update failed: ${reason}`,
    reviewNotePrompt: 'Enter rejection reason',
    reviewAdminTokenHint: 'Admins can review pending submissions and approve or reject them.',
    reviewLoadAdminData: 'Load review data',
    reviewLoadSuccess: 'Review data loaded.',
    reviewLoadFailed: (reason) => `Failed to load review data: ${reason}`,
    adminManagement: 'Management Center',
    adminManagementSubtitle: 'Review pending publications and manage published artifacts.',
    adminPendingPublications: 'Pending publications',
    adminPublishedComponents: 'Published components',
    adminNoPendingPublications: 'There are no pending publications.',
    adminNoPublishedComponents: 'There are no published components.',
    adminSearchPublished: 'Search published components',
    adminUnpublishLatest: 'Unpublish latest version',
    adminUnpublishConfirm: (name, version) => `Unpublish the latest version ${version} of “${name}”? The market will fall back to an earlier published version when available.`,
    adminUnpublishSuccess: 'Latest version unpublished and the market list refreshed.',
    adminUnpublishFailed: (reason) => `Unpublish failed: ${reason}`,
    categoriesTitle: 'Market Categories',
    skillKindTitle: 'Skill Type',
    skillCategoryTitle: 'Skill Categories',
    skillSingle: 'Single skill',
    skillPackage: 'Skill package',
    skillIncluded: 'Included skills',
    includedSkills: 'Included skills',
    includedSkillsHint: 'Select one or more published single skills from the current market.',
    includedSkillsSearch: 'Search skill name or ID',
    includedSkillsSelected: (count) => `${count} selected`,
    includedSkillsRequired: 'Select at least one included skill.',
    noAvailableSkills: 'No single skills available. Publish a skill first.',
    skillScenario: 'Scenario',
    skillLevel: 'Level',
    skillFeatured: 'Featured',
    skillCategories: {
      all: 'All skills',
      document: 'Documents',
      data: 'Data analysis',
      coding: 'Coding',
      browser: 'Browser automation',
      office: 'Office',
      content: 'Content',
      media: 'Media',
      search: 'Search',
      system: 'System',
      integration: 'API integration',
      automation: 'Automation',
      other: 'Other',
    },
    skillCuratedTitles: {
      document: 'Selected document skills',
      data: 'Selected data skills',
      coding: 'Selected coding skills',
      browser: 'Selected browser skills',
      office: 'Selected office skills',
      content: 'Selected content skills',
      media: 'Selected media skills',
      search: 'Selected search skills',
      system: 'Selected system skills',
      integration: 'Selected API skills',
      automation: 'Selected automation skills',
      other: 'Selected other skills',
    },
    skillScenarios: {
      productivity: 'Productivity',
      developer: 'Developer',
      research: 'Research',
      enterprise: 'Enterprise',
      education: 'Education',
      creator: 'Creator',
    },
    skillLevels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    footer: '© 2026 ZenMind Technologies.\nStandard Extension Protocol v1.0',
    sortLabel: 'Sort:',
    sortPopular: 'Popular',
    sortLatest: 'Latest',
    sortRating: 'Name',
    count: (value) => `(${value})`,
    all: 'All Components',
    manage: 'Manage',
    details: 'Details',
    emptyTitle: 'No matching components',
    emptyBody: 'Try another search term or category.',
    emptyCatalogTitle: 'No market items yet',
    emptyCatalogBody: 'The backend SQLite catalog is empty. Publish a real artifact to list it here.',
    loadingTitle: 'Loading market',
    loadingBody: 'Fetching the official catalog.',
    loadingErrorTitle: 'Market load failed',
    loadingErrorBody: 'Unable to connect to the backend catalog.',
    cancel: 'Cancel',
    close: 'Close',
    wait: 'Please wait...',
    returnDeps: 'Back to dependencies',
    complete: 'Done',
    themeToggle: 'Theme',
    languageToggle: 'Language',
    terminalShell: 'bash',
    depRequired: 'Required',
    depOptional: 'Optional',
    developer: 'Developer',
    createdAt: 'Created',
    size: 'Size',
    downloads: 'Downloads',
    favorites: 'Favorites',
    favoriteAction: 'Favorite',
    unfavoriteAction: 'Unfavorite',
    favoriteFailed: (reason) => `Favorite failed: ${reason}`,
    favoriteAuthRequired: 'Sign in or authorize this session before favoriting.',
    features: 'Core features',
    dependencies: 'Dependency graph',
    assets: 'Artifacts',
    readmeFallback: 'Component highlights',
    noDescription: 'No description provided.',
    noDependencies: 'No dependencies.',
    downloadArtifact: 'Download',
    downloading: 'Preparing...',
    noArtifact: 'No artifact',
    downloadStarted: (name) => `[${name}] artifact download started.`,
    downloadUnavailable: 'The backend did not return a downloadable artifact.',
    downloadFailed: (reason) => `Download failed: ${reason}`,
    installWithADP: 'Install',
    installCopied: (command) => `Install command copied: ${command}`,
    installCopyFailed: (reason) => `Failed to copy install command: ${reason}`,
    installUnavailable: 'This item has no ADP install protocol.',
    videoPlaying: 'Demo running',
    publishTitle: 'Publish to local market',
    publishBody: 'Choose a component type first, then fill in the fields required for that type.',
    publishStepType: 'Choose type',
    publishStepDetails: 'Details',
    publishChooseType: 'Choose what to publish',
    publishChooseTypeBody: 'Different component types need different inputs. Starting with the type keeps the form focused.',
    publishBackToTypes: 'Back to types',
    publishBasicInfo: 'Basic info',
    publishRequiredAssets: 'Required assets',
    publishTypeSettings: 'Type settings',
    publishAdvanced: 'Advanced options',
    publishShowAdvanced: 'Show advanced options',
    publishHideAdvanced: 'Hide advanced options',
    publishTypeRequirements: 'Requires',
    publishTypeDescriptions: {
      skill: 'Upload a single skill; add ADP only when extra dependencies need installation.',
      'skill-package': 'Link existing skills into a downloadable package.',
      plugin: 'Upload a plugin artifact for extension capabilities.',
      agent: 'Upload an agent definition and runtime resources.',
      'sandbox-image': 'Publish an environment template or container image.',
      pet: 'Upload a desktop pet resource package.',
      'cli-tool': 'Publish a CLI tool; add ADP only when extra dependencies need installation.',
      'website-app': 'Publish a local web app or external URL.',
      'software-package': 'Publish software dependencies such as Python or Node.js.',
    },
    publishTypeRequirementsMap: {
      skill: 'zip artifact, SKILL.md; optional adp.yaml',
      'skill-package': 'At least one existing skill ID',
      plugin: 'zip artifact, manifest.json',
      agent: 'zip artifact, agent.yml / agent.yaml',
      'sandbox-image': 'environment.json or tar.gz image',
      pet: 'pet.json, pet-idle.png',
      'cli-tool': 'optional zip artifact and adp.yaml',
      'website-app': 'website.json or external URL',
      'software-package': 'zip / tar.gz dependency package',
    },
    type: 'Type',
    componentId: 'Component ID',
    name: 'Name',
    version: 'Version',
    description: 'Description',
    publishSubmit: 'Publish',
    duplicate: (id) => `Publish failed: component ID [${id}] already exists.`,
    publishSuccess: (name) => `Component [${name}] published!`,
    publishFailed: (reason) => `Publish failed: ${reason}`,
    publishing: 'Publishing...',
    artifact: 'Artifact package',
    image: 'Display image',
    artifactRequired: 'Choose an artifact package to upload.',
    adpManifest: 'ADP 0.1 latest manifest',
    adpManifestHint: 'Upload an ADP 0.1 manifest only when extra dependencies need installation; the server validates hooks and binds this artifact URL and SHA-256.',
    archiveType: 'Archive type',
    platformKey: 'Platform',
    platforms: 'Platforms',
    currentPlatform: 'Current platform',
    selectedPlatform: 'Selected platform',
    os: 'OS',
    arch: 'Arch',
    minDesktopVersion: 'Minimum desktop',
    platformDescription: 'Platform description',
    platformMetadata: 'Platform metadata JSON',
    platformDependencies: 'Platform dependencies JSON',
    installProtocol: 'Install protocol',
    installCommand: 'Install command',
    uninstallCommand: 'Uninstall command',
    detectCommands: 'Detect commands',
    versionCommand: 'Version command',
    noPlatformDetails: 'No platform details.',
    noInstallProtocol: 'No install script.',
    artifactOptional: 'Publishing metadata only when no artifact is selected.',
    invalidJSON: (field) => `${field} is not valid JSON.`,
    tags: 'Tags',
    readme: 'README',
    author: 'Author',
    metadataUrl: 'External URL',
    sandboxKind: 'Sandbox kind',
    websiteKind: 'Website kind',
    categories: {
      all: 'All Components',
      skill: 'Skills',
      plugin: 'Plugins',
      agent: 'Agents',
      'sandbox-image': 'Sandboxes',
      pet: 'Desktop Pets',
      'cli-tool': 'CLI Tools',
      'website-app': 'WebApps',
      'software-package': 'Software Packages',
    },
  },
};

const categoryMeta = [
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

function publishTypeOptions() {
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

const sidebarCategoryMeta = categoryMeta.filter((category) => category.id !== 'pet');
const skillCategoryFilters = ['all', 'document', 'data', 'coding', 'browser', 'office', 'content', 'media', 'search', 'system', 'integration', 'automation', 'other'];
const skillScenarioOptions = ['productivity', 'developer', 'research', 'enterprise', 'education', 'creator'];
const skillLevelOptions = ['beginner', 'intermediate', 'advanced'];

function initialTheme() {
  const saved = localStorage.getItem('zenmind-market:theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initialLocale() {
  const saved = localStorage.getItem('zenmind-market:locale');
  if (locales.includes(saved)) return saved;
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}

export function App() {
  const [apiItems, setApiItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSkillCategory, setActiveSkillCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('popular');
  const [theme, setTheme] = useState(initialTheme);
  const [locale, setLocale] = useState(initialLocale);
  const [selected, setSelected] = useState(null);
  const [selectedPlatformKey, setSelectedPlatformKey] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPublishOpen, setPublishOpen] = useState(false);
  const [isPublishing, setPublishing] = useState(false);
  const [isCreatorOpen, setCreatorOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [authSession, setAuthSession] = useState(null);
  const [creatorItems, setCreatorItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [adminItems, setAdminItems] = useState([]);
  const [isLoadingAdminReviews, setLoadingAdminReviews] = useState(false);
  const [reviewingKey, setReviewingKey] = useState('');
  const [unpublishingKey, setUnpublishingKey] = useState('');
  const [downloadingKey, setDownloadingKey] = useState('');
  const [favoritingKey, setFavoritingKey] = useState('');

  const t = translations[locale];
  const isAuthenticated = Boolean(authSession?.user?.id);

  const loadCatalog = useCallback(async (signal) => {
    setStatus('loading');
    setError('');
    try {
      const data = await requestJSON(`${apiBase}/catalog`, { signal });
      setApiItems(Array.isArray(data.items) ? data.items : []);
      setStatus('ready');
    } catch (reason) {
      if (reason?.name === 'AbortError') return;
      setApiItems([]);
      setError(errorMessage(reason));
      setStatus('error');
    }
  }, []);

  const loadCreatorItems = useCallback(async (signal, sessionOverride = null) => {
    const session = sessionOverride || authSession;
    if (!session?.user?.id) {
      setCreatorItems([]);
      return { ok: false, reason: 'missing-token' };
    }
    try {
      const data = await requestJSON(`${apiBase}/creator/items`, {
        signal,
      });
      setCreatorItems(Array.isArray(data.items) ? data.items : []);
      return { ok: true };
    } catch (reason) {
      if (reason?.name === 'AbortError') return { ok: false, reason };
      setCreatorItems([]);
      return { ok: false, reason };
    }
  }, [authSession]);

  const loadAdminReviews = useCallback(async (signal, sessionOverride = null) => {
    const session = sessionOverride || authSession;
    if (!session?.user?.id || session.user?.role !== 'admin') {
      setAdminItems([]);
      return { ok: false, reason: 'missing-token' };
    }
    try {
      const data = await requestJSON(`${apiBase}/admin/reviews?status=pending`, {
        signal,
      });
      setAdminItems(Array.isArray(data.items) ? data.items : []);
      return { ok: true };
    } catch (reason) {
      if (reason?.name === 'AbortError') return { ok: false, reason };
      setAdminItems([]);
      return { ok: false, reason };
    }
  }, [authSession]);

  const loadFavoriteItems = useCallback(async (signal, sessionOverride = null) => {
    const session = sessionOverride || authSession;
    if (!session?.user?.id) {
      setFavoriteItems([]);
      return { ok: false, reason: 'missing-user' };
    }
    try {
      const data = await requestJSON(`${apiBase}/me/favorites`, { signal });
      setFavoriteItems(Array.isArray(data.items) ? data.items : []);
      return { ok: true };
    } catch (reason) {
      if (reason?.name === 'AbortError') return { ok: false, reason };
      setFavoriteItems([]);
      return { ok: false, reason };
    }
  }, [authSession]);

  const handleLoadAdminReviews = useCallback(async () => {
    if (!authSession?.user?.id || authSession.user?.role !== 'admin') {
      notify(t.adminOnly, 'error');
      return;
    }
    setLoadingAdminReviews(true);
    try {
      const result = await loadAdminReviews(undefined, authSession);
      if (result.ok) {
        await loadCatalog();
        notify(t.reviewLoadSuccess, 'success');
      } else {
        notify(t.reviewLoadFailed(errorMessage(result.reason)), 'error');
      }
    } catch {
      notify(t.reviewLoadFailed('unknown error'), 'error');
    } finally {
      setLoadingAdminReviews(false);
    }
  }, [authSession, loadAdminReviews, loadCatalog, t]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('zenmind-market:theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem('zenmind-market:locale', locale);
  }, [locale]);

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal);
    return () => controller.abort();
  }, [loadCatalog]);

  useEffect(() => {
    const controller = new AbortController();
    requestJSON(`${apiBase}/auth/me`, { signal: controller.signal })
      .then((data) => {
        if (data?.user?.id) setAuthSession({ user: data.user });
      })
      .catch((reason) => {
        if (reason?.name !== 'AbortError') setAuthSession(null);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadCatalog();
  }, [isAuthenticated, loadCatalog]);

  useEffect(() => {
    if (!isCreatorOpen) return undefined;
    const controller = new AbortController();
    loadCreatorItems(controller.signal);
    loadFavoriteItems(controller.signal);
    return () => controller.abort();
  }, [isCreatorOpen, loadCreatorItems, loadFavoriteItems]);

  useEffect(() => {
    if (!isAdminOpen || authSession?.user?.role !== 'admin') return undefined;
    const controller = new AbortController();
    loadAdminReviews(controller.signal);
    return () => controller.abort();
  }, [isAdminOpen, authSession, loadAdminReviews]);

  const catalog = useMemo(() => {
    return apiItems.map((item) => mergeCatalogItem(item));
  }, [apiItems]);

  const creatorCatalog = useMemo(() => {
    return creatorItems.map((item) => mergeCatalogItem(item));
  }, [creatorItems]);

  const favoriteCatalog = useMemo(() => {
    return favoriteItems.map((item) => mergeCatalogItem(item));
  }, [favoriteItems]);

  const publishableSkills = useMemo(() => {
    return catalog.filter((item) => item.type === 'skill' && item.skillKind !== 'package');
  }, [catalog]);

  const adminReviewCatalog = useMemo(() => {
    return adminItems.map((item) => mergeCatalogItem(item));
  }, [adminItems]);

  const categoryCounts = useMemo(() => {
    const counts = { all: catalog.length };
    for (const type of canonicalTypes) counts[type] = catalog.filter((item) => item.type === type).length;
    return counts;
  }, [catalog]);

  const skillCounts = useMemo(() => {
    const skills = catalog.filter((item) => item.type === 'skill');
    const categories = { all: skills.length };
    for (const category of skillCategoryFilters) categories[category] = category === 'all' ? skills.length : 0;
    for (const item of skills) {
      categories[item.skillCategory] = (categories[item.skillCategory] || 0) + 1;
    }
    return { categories };
  }, [catalog]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = catalog.filter((item) => {
      if (activeCategory !== 'all' && item.type !== activeCategory) return false;
      if (activeCategory === 'skill') {
        if (activeSkillCategory !== 'all' && item.skillCategory !== activeSkillCategory) return false;
      }
      if (!needle) return true;
      return [
        item.id,
        localized(item.name, locale),
        localized(item.description, locale),
        item.author,
        item.skillKind,
        item.skillCategory,
        item.skillScenario,
        ...(item.tags || []),
      ].join(' ').toLowerCase().includes(needle);
    });
    return [...result].sort((a, b) => {
      if (sortMode === 'latest') return dateValue(b.updatedAt || b.publishedAt) - dateValue(a.updatedAt || a.publishedAt);
      if (sortMode === 'rating') return localized(a.name, locale).localeCompare(localized(b.name, locale));
      return (parseCount(b.downloads) - parseCount(a.downloads))
        || (parseCount(b.favoriteCount) - parseCount(a.favoriteCount))
        || localized(a.name, locale).localeCompare(localized(b.name, locale));
    });
  }, [activeCategory, activeSkillCategory, catalog, locale, query, sortMode]);

  const currentCategoryName = activeCategory === 'all' ? t.all : t.categories[activeCategory];
  const emptyCopy = catalog.length === 0
    ? { title: t.emptyCatalogTitle, body: t.emptyCatalogBody }
    : { title: t.emptyTitle, body: t.emptyBody };
  const brandTitle = localized(marketBrand.name, locale);

  function notify(message, tone = 'info') {
    const id = window.setTimeout(() => setToast(null), 3000);
    setToast({ message, tone, id });
  }

  function startLogin() {
    window.location.assign(`${apiBase}/auth/oidc/login`);
  }

  async function handleLogout() {
    try {
      await requestJSON(`${apiBase}/auth/oidc/logout`, { method: 'POST' });
    } catch {
      // Clear the local view even if the session has already expired server-side.
    }
    setAuthSession(null);
    setCreatorItems([]);
    setFavoriteItems([]);
    setAdminItems([]);
    setAdminOpen(false);
    setCreatorOpen(false);
    await loadCatalog();
  }

  function chooseCategory(category) {
    setActiveCategory(category);
    if (category !== 'skill') {
      setActiveSkillCategory('all');
    }
  }

  function openDetails(item) {
    setSelected(item);
    setSelectedPlatformKey(preferredPlatformKey(item));
    setVideoPlaying(false);
  }

  function closeDetails() {
    setSelected(null);
    setSelectedPlatformKey('');
    setVideoPlaying(false);
  }

  async function handleDownload(item, platformOverride = '') {
    if (!item || downloadingKey) return;
    if (item.type === 'skill' && item.skillKind === 'package') {
      const key = `${item.type}:${item.id}:package`;
      setDownloadingKey(key);
      try {
        triggerBrowserDownload(`${apiBase}/skills/${encodeURIComponent(item.id)}/package/download`);
        notify(t.downloadStarted(localized(item.name, locale) || item.id), 'success');
      } catch (reason) {
        notify(t.downloadFailed(errorMessage(reason)), 'error');
      } finally {
        setDownloadingKey('');
      }
      return;
    }
    const platform = preferredPlatformKey(item, platformOverride);
    if (!hasArtifact(item, platform)) {
      notify(t.downloadUnavailable, 'error');
      return;
    }
    const key = `${item.type}:${item.id}:${platform || 'any'}`;
    setDownloadingKey(key);
    try {
      const route = marketRoute(item.type);
      const id = encodeURIComponent(item.id);
      const platformQuery = platform ? `?platform=${encodeURIComponent(platform)}` : '';
      const resolved = await requestJSON(`${apiBase}/${route}/${id}/resolve${platformQuery}`);
      if (!resolved?.asset?.url) {
        throw new Error(t.downloadUnavailable);
      }
      const resolvedPlatform = resolved.platform || platform;
      const downloadQuery = resolvedPlatform ? `?platform=${encodeURIComponent(resolvedPlatform)}` : '';
      triggerBrowserDownload(`${apiBase}/${route}/${id}/download${downloadQuery}`);
      notify(t.downloadStarted(`${localized(item.name, locale) || item.id}${resolvedPlatform ? ` (${resolvedPlatform})` : ''}`), 'success');
    } catch (reason) {
      notify(t.downloadFailed(errorMessage(reason)), 'error');
    } finally {
      setDownloadingKey('');
    }
  }

  async function handleInstall(item) {
    const command = adpInstallCommand(item);
    if (!command) {
      notify(t.installUnavailable, 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(command);
      notify(t.installCopied(command), 'success');
    } catch (reason) {
      notify(t.installCopyFailed(errorMessage(reason)), 'error');
    }
  }

  async function handleFavorite(item) {
    if (!item || favoritingKey) return;
    const key = `${item.type}:${item.id}`;
    setFavoritingKey(key);
    try {
      const route = marketRoute(item.type);
      const id = encodeURIComponent(item.id);
      const updated = await requestJSON(`${apiBase}/${route}/${id}/favorite`, {
        method: item.favorited ? 'DELETE' : 'POST',
      });
      const updatedType = normalizeType(updated.type);
      setApiItems((items) => items.map((entry) => (
        normalizeType(entry.type) === updatedType && entry.id === updated.id ? updated : entry
      )));
      const merged = mergeCatalogItem(updated);
      setSelected((current) => (
        current && current.id === merged.id && current.type === merged.type ? merged : current
      ));
      if (isCreatorOpen) await loadFavoriteItems();
    } catch (reason) {
      if (reason?.status === 401) {
        notify(t.favoriteAuthRequired, 'error');
        startLogin();
      } else {
        notify(t.favoriteFailed(errorMessage(reason)), 'error');
      }
    } finally {
      setFavoritingKey('');
    }
  }

  async function handleReviewUpdate(item, status) {
    if (!item || reviewingKey) return;
    if (!authSession?.user?.id || authSession.user?.role !== 'admin') {
      notify(t.adminOnly, 'error');
      return;
    }
    let note = '';
    if (status === 'rejected') {
      note = window.prompt(t.reviewNotePrompt, item.reviewNote || '') || '';
    }
    const key = `${item.type}:${item.id}`;
    setReviewingKey(key);
    try {
      await requestJSON(`${apiBase}/admin/reviews/${encodeURIComponent(item.type)}/${encodeURIComponent(item.id)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      await loadCatalog();
      await loadCreatorItems(undefined, authSession);
      await loadAdminReviews(undefined, authSession);
      notify(t.reviewUpdateSuccess, 'success');
    } catch (reason) {
      notify(t.reviewUpdateFailed(errorMessage(reason)), 'error');
    } finally {
      setReviewingKey('');
    }
  }

  async function handleUnpublishLatest(item) {
    if (!item || unpublishingKey) return;
    if (!authSession?.user?.id || authSession.user?.role !== 'admin') {
      notify(t.adminOnly, 'error');
      return;
    }
    const version = item.latestVersion || item.version;
    if (!version) {
      notify(t.adminUnpublishFailed('missing latest version'), 'error');
      return;
    }
    const name = localized(item.name, locale) || item.id;
    if (!window.confirm(t.adminUnpublishConfirm(name, formatVersionLabel(version)))) return;

    const key = `${item.type}:${item.id}`;
    setUnpublishingKey(key);
    try {
      await requestJSON(`${apiBase}/admin/unpublish`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: item.type, id: item.id, version }),
      });
      await Promise.all([
        loadCatalog(),
        loadAdminReviews(undefined, authSession),
      ]);
      notify(t.adminUnpublishSuccess, 'success');
    } catch (reason) {
      notify(t.adminUnpublishFailed(errorMessage(reason)), 'error');
    } finally {
      setUnpublishingKey('');
    }
  }

  async function handlePublish(event) {
    event.preventDefault();
    if (isPublishing) return;
    const formElement = event.currentTarget;
    setPublishing(true);
    try {
      const form = new FormData(formElement);
      const type = normalizeType(form.get('type'));
      const id = String(form.get('id') || '').trim().toLowerCase();
      const name = String(form.get('name') || '').trim();
      const version = canonicalVersion(form.get('version')) || '1.0.0';
      const description = String(form.get('description') || '').trim();
      const artifact = selectedFormFile(formElement, form, 'artifact');
      const hasSelectedArtifact = Boolean(artifact);
      const image = selectedFormFile(formElement, form, 'image');
      const hasSelectedImage = Boolean(image);
      const adpManifest = selectedFormFile(formElement, form, 'adpManifest');
      const hasSelectedADPManifest = Boolean(adpManifest);
      const skillKind = type === 'skill' && form.get('skillKind') === 'package' ? 'package' : 'single';
      const skill = type === 'skill' ? {
        kind: skillKind,
        category: String(form.get('skillCategory') || 'other').trim(),
        scenario: String(form.get('skillScenario') || 'productivity').trim(),
        level: String(form.get('skillLevel') || 'beginner').trim(),
        packageMode: skillKind === 'package' ? 'collection' : '',
        featured: form.get('skillFeatured') === 'on',
        includedSkills: parseIncludedSkills(form.getAll('includedSkills')),
      } : null;
      if (skill?.kind === 'package' && !skill.includedSkills.length) {
        notify(t.includedSkillsRequired, 'error');
        return;
      }
      if (!isAuthenticated) {
        notify(t.loginRequired, 'error');
        startLogin();
        return;
      }
      if (artifactRequiredFor(type, { websiteKind: String(form.get('websiteKind') || '').trim(), skill }) && !hasSelectedArtifact) {
        notify(t.artifactRequired, 'error');
        return;
      }
      let platformMetadata;
      let platformDependencies;
      try {
        platformMetadata = parseJSONField(form.get('platformMetadata'), {}, t.platformMetadata, 'object', t.invalidJSON);
        platformDependencies = parseJSONField(form.get('platformDependencies'), [], t.platformDependencies, 'array', t.invalidJSON);
      } catch (reason) {
        notify(errorMessage(reason), 'error');
        return;
      }

      const platformKey = String(form.get('platformKey') || '').trim() || 'universal';
      const platformMinDesktopVersion = String(form.get('platformMinDesktopVersion') || '').trim();
      const install = scriptSpecFromCommand(form.get('installCommand'));
      const uninstall = scriptSpecFromCommand(form.get('uninstallCommand'));
      const detect = detectSpecFromForm(form);
      const platform = {
        key: platformKey,
        os: String(form.get('platformOS') || '').trim(),
        arch: String(form.get('platformArch') || '').trim(),
        description: String(form.get('platformDescription') || '').trim(),
        minDesktopVersion: platformMinDesktopVersion,
        metadata: platformMetadata,
        dependencies: platformDependencies,
      };
      if (install) platform.install = install;
      if (uninstall) platform.uninstall = uninstall;
      if (detect) platform.detect = detect;

      const metadata = {
        id,
        type,
        name: name || id,
        version,
        description,
        readme: String(form.get('readme') || '').trim(),
        tags: parseTags(form.get('tags')),
        minDesktopVersion: platformMinDesktopVersion,
        sandboxKind: type === 'sandbox-image' ? String(form.get('sandboxKind') || '').trim() || 'environment-template' : '',
        websiteKind: type === 'website-app' ? String(form.get('websiteKind') || '').trim() || 'local-app' : '',
        platformKey,
        assetRole: 'primary',
        archiveType: String(form.get('archiveType') || '').trim() || defaultArchiveTypeFor(type),
        metadata: {},
        dependencies: platformDependencies,
        platform,
        reviewStatus: authSession.user?.role === 'admin' ? String(form.get('reviewStatus') || 'approved').trim() : 'pending',
      };
      if (skill) metadata.skill = skill;
      if (type === 'cli-tool') {
        if (install) metadata.install = install;
        if (uninstall) metadata.uninstall = uninstall;
        if (detect) metadata.detect = detect;
      }
      const author = String(form.get('author') || '').trim();
      const metadataUrl = String(form.get('metadataUrl') || '').trim();
      if (author) metadata.metadata.author = author;
      if (metadataUrl) metadata.metadata.url = metadataUrl;
      if (hasSelectedADPManifest && !hasSelectedArtifact) {
        metadata.adpYaml = await adpManifest.text();
      }

      if (hasSelectedArtifact || hasSelectedImage) {
        const body = new FormData();
        body.append('metadata', JSON.stringify(metadata));
        if (hasSelectedArtifact) body.append('artifact', artifact);
        if (hasSelectedImage) body.append('image', image);
        if (hasSelectedADPManifest) body.append('adp', adpManifest);
        await requestJSON(authSession.user?.role === 'admin' ? `${apiBase}/admin/${marketRoute(type)}/publish` : `${apiBase}/creator/publish`, {
          method: 'POST',
          body,
        });
      } else {
        await requestJSON(authSession.user?.role === 'admin' ? `${apiBase}/admin/${marketRoute(type)}/publish` : `${apiBase}/creator/publish`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(metadata),
        });
      }
      await loadCatalog();
      await loadCreatorItems(undefined, authSession);
      if (authSession.user?.role === 'admin') await loadAdminReviews(undefined, authSession);
      setActiveCategory(type);
      setPublishOpen(false);
      formElement.reset();
      notify(t.publishSuccess(name || id), 'success');
    } catch (reason) {
      notify(t.publishFailed(errorMessage(reason)), 'error');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="market-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label={brandTitle}>
          <span className="brand-mark"><Shapes size={20} /></span>
          <span className="brand-copy">
            <strong>{brandTitle}</strong>
          </span>
        </a>

        <label className="global-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} />
        </label>

        <div className="top-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={t.themeToggle} aria-label={t.themeToggle}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="language-button" type="button" onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')} title={t.languageToggle} aria-label={t.languageToggle}>
            <Languages size={15} />
            <span>{locale === 'zh-CN' ? '中' : 'EN'}</span>
          </button>
          {authSession ? (
            <button className="language-button" type="button" onClick={handleLogout} title={t.logout}>
              <LogOut size={15} />
              <span>{authSession.user?.role === 'admin' ? t.loginAsAdmin : t.loginAsCreator}</span>
            </button>
          ) : (
            <button className="language-button" type="button" onClick={startLogin}>
              <LogIn size={15} />
              <span>{t.login}</span>
            </button>
          )}
          {authSession?.user?.role === 'admin' ? (
            <button className="creator-button" type="button" onClick={() => { setAdminOpen((value) => !value); setCreatorOpen(false); }}>
              <ShieldCheck size={15} />
              <span>{isAdminOpen ? t.backToMarket : t.adminReviewEntry}</span>
            </button>
          ) : null}
          {isAuthenticated ? (
            <>
              <button
                className="creator-button"
                type="button"
                onClick={() => {
                  setCreatorOpen((value) => !value);
                  setAdminOpen(false);
                }}
              >
                {isCreatorOpen ? <Store size={15} /> : <User size={15} />}
                <span>{isCreatorOpen ? t.backToMarket : t.creatorCenter}</span>
              </button>
              <button
                className="publish-button"
                type="button"
                onClick={() => {
                  setCreatorOpen(false);
                  setAdminOpen(false);
                  setPublishOpen(true);
                }}
              >
                <Plus size={15} />
                <span>{t.publish}</span>
              </button>
            </>
          ) : null}
        </div>
      </header>

      {isPublishOpen ? (
        <PublishPage
          t={t}
          locale={locale}
          authSession={authSession}
          availableSkills={publishableSkills}
          onClose={() => setPublishOpen(false)}
          onSubmit={handlePublish}
          isPublishing={isPublishing}
        />
      ) : isAdminOpen ? (
        <AdminCenter
          pendingItems={adminReviewCatalog}
          publishedItems={catalog}
          locale={locale}
          t={t}
          onBack={() => setAdminOpen(false)}
          onPublish={() => { setPublishOpen(true); setAdminOpen(false); }}
          onDetails={openDetails}
          onReview={handleReviewUpdate}
          reviewingKey={reviewingKey}
          onUnpublishLatest={handleUnpublishLatest}
          unpublishingKey={unpublishingKey}
          onLoadAdminReviews={handleLoadAdminReviews}
          isLoadingAdminReviews={isLoadingAdminReviews}
        />
      ) : isCreatorOpen ? (
        <CreatorCenter
          mode="creator"
          items={creatorCatalog}
          favoriteItems={favoriteCatalog}
          authSession={authSession}
          locale={locale}
          t={t}
          onBack={() => setCreatorOpen(false)}
          onPublish={() => { setPublishOpen(true); setCreatorOpen(false); }}
          onDetails={openDetails}
          onReview={null}
          reviewingKey={reviewingKey}
        />
      ) : (
      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-main">
            <section>
              <h3>{t.categoriesTitle}</h3>
              <nav className="category-nav" aria-label={t.categoriesTitle}>
                {sidebarCategoryMeta.map((category) => {
                  const Icon = category.icon;
                  const active = activeCategory === category.id;
                  return (
                    <button key={category.id} className={active ? 'category-button is-active' : 'category-button'} type="button" onClick={() => chooseCategory(category.id)}>
                      <span className="category-label">
                        <Icon className={category.colorClass} size={15} />
                        <span>{category.id === 'all' ? t.all : t.categories[category.id]}</span>
                      </span>
                      <span className="category-count">{categoryCounts[category.id] || 0}</span>
                    </button>
                  );
                })}
              </nav>
            </section>
          </div>
          <p className="sidebar-footer">{t.footer}</p>
        </aside>

        <section className="content-pane">
          <div className="content-header">
            <div className="content-title">
              <h1>{currentCategoryName}</h1>
              <span>{t.count(filtered.length)}</span>
            </div>
            <label className="sort-control">
              <span>{t.sortLabel}</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="popular">{t.sortPopular}</option>
                <option value="latest">{t.sortLatest}</option>
                <option value="rating">{t.sortRating}</option>
              </select>
            </label>
          </div>

          {activeCategory === 'skill' ? (
            <section className="skill-filter-panel" aria-label={t.skillCategoryTitle}>
              <div className="skill-chip-row">
                {skillCategoryFilters.map((category) => (
                  <button
                    key={category}
                    className={activeSkillCategory === category ? 'is-active' : ''}
                    type="button"
                    onClick={() => setActiveSkillCategory(category)}
                  >
                    <span>{t.skillCategories[category]}</span>
                    <small>{skillCounts.categories[category] || 0}</small>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {status === 'loading' ? <StateNotice title={t.loadingTitle} body={t.loadingBody} /> : null}
          {status === 'error' ? <StateNotice tone="error" title={t.loadingErrorTitle} body={`${t.loadingErrorBody} ${error ? `(${error})` : ''}`} /> : null}

          <div className="catalog-scroll">
            {filtered.length ? (
              activeCategory === 'skill' ? (
                <SkillCatalogView
                  items={filtered}
                  activeSkillCategory={activeSkillCategory}
                  isAuthenticated={isAuthenticated}
                  locale={locale}
                  t={t}
                  onDetails={openDetails}
                  onInstall={handleInstall}
                  onDownload={handleDownload}
                  onFavorite={handleFavorite}
                  downloadingKey={downloadingKey}
                  favoritingKey={favoritingKey}
                />
              ) : (
                <div className="catalog-grid">
                  {filtered.map((item) => (
                    <MarketCard
                      key={`${item.type}:${item.id}`}
                      item={item}
                      isAuthenticated={isAuthenticated}
                      locale={locale}
                      t={t}
                      onDetails={() => openDetails(item)}
                      onInstall={() => handleInstall(item)}
                      onDownload={() => handleDownload(item)}
                      onFavorite={() => handleFavorite(item)}
                      isDownloading={downloadingKey === downloadKeyForItem(item)}
                      isFavoriting={favoritingKey === `${item.type}:${item.id}`}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="empty-state">
                <PackageOpen size={34} />
                <strong>{emptyCopy.title}</strong>
                <span>{emptyCopy.body}</span>
              </div>
            )}
          </div>
        </section>
      </div>
      )}

      {selected ? (
        <DetailModal
          item={selected}
          isAuthenticated={isAuthenticated}
          locale={locale}
          t={t}
          videoPlaying={videoPlaying}
          selectedPlatformKey={selectedPlatformKey || preferredPlatformKey(selected)}
          onPlatformChange={setSelectedPlatformKey}
          onToggleVideo={() => setVideoPlaying((value) => !value)}
          onClose={closeDetails}
          onDownload={() => handleDownload(selected, selectedPlatformKey)}
          onInstall={() => handleInstall(selected)}
          onFavorite={() => handleFavorite(selected)}
          isDownloading={downloadingKey === downloadKeyForItem(selected, selectedPlatformKey)}
          isFavoriting={favoritingKey === `${selected.type}:${selected.id}`}
        />
      ) : null}

      {toast ? <Toast toast={toast} /> : null}
    </main>
  );
}

function AdminCenter({
  pendingItems,
  publishedItems,
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
}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [itemQuery, setItemQuery] = useState('');
  const [versionState, setVersionState] = useState({ item: null, status: 'idle', versions: [], error: '' });
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
                    <button className="table-action" type="button" disabled={reviewingKey === `${item.type}:${item.id}`} onClick={() => onReview(item, 'approved')}><CheckCircle2 size={14} /><span>{t.reviewApprove}</span></button>
                    <button className="table-action" type="button" disabled={reviewingKey === `${item.type}:${item.id}`} onClick={() => onReview(item, 'rejected')}><AlertCircle size={14} /><span>{t.reviewReject}</span></button>
                    <button className="table-action" type="button" onClick={() => onDetails(item)}><ArrowRight size={14} /><span>{t.creatorOpenMarket}</span></button>
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
      </div>
      {versionState.item ? <VersionHistoryModal state={versionState} locale={locale} t={t} onClose={() => setVersionState({ item: null, status: 'idle', versions: [], error: '' })} /> : null}
    </section>
  );
}

function ComponentCell({ item, locale }) {
  return <span className="component-cell"><img src={item.icon || item.screenshot} alt="" /><span><strong>{localized(item.name, locale) || item.id}</strong><small>{item.id}</small></span></span>;
}

function CreatorCenter({
  mode = 'creator',
  items,
  favoriteItems = [],
  authSession,
  locale,
  t,
  onBack,
  onPublish,
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
  const totalFavorites = creatorItems.reduce((sum, item) => sum + parseCount(item.favoriteCount), 0);
  const skillPackages = creatorItems.filter(isSkillPackage).length;
  const pendingReviews = creatorItems.filter((item) => item.reviewStatus === 'pending').length;
  const rejectedReviews = creatorItems.filter((item) => item.reviewStatus === 'rejected').length;
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
    { label: t.creatorTotalFavorites, value: formatCount(totalFavorites), icon: Heart },
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
                  <span>{t.favorites}</span>
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
                    <ReviewBadge status={item.reviewStatus} t={t} />
                    {item.reviewStatus === 'rejected' && item.reviewNote ? (
                      <small title={`${t.reviewRejectReason}: ${item.reviewNote}`}>{t.reviewRejectReason}: {item.reviewNote}</small>
                    ) : null}
                  </span>
                  <span>{formatVersionLabel(item.version || item.latestVersion) || '-'}</span>
                  <span>{formatCount(item.downloads)}</span>
                    <span>{formatCount(item.favoriteCount)}</span>
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

function VersionHistoryModal({ state, locale, t, onClose }) {
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

function ReviewBadge({ status, t }) {
  const normalized = normalizeReviewStatusForUI(status);
  const label = normalized === 'approved' ? t.reviewApproved : normalized === 'rejected' ? t.reviewRejected : t.reviewPending;
  return <span className={`review-badge is-${normalized}`}>{label}</span>;
}

function EmptyInline({ title, body }) {
  return (
    <div className="empty-inline">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function SkillCatalogView({ items, activeSkillCategory, isAuthenticated, locale, t, onDetails, onInstall, onDownload, onFavorite, downloadingKey, favoritingKey }) {
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

function MarketCard({ item, isAuthenticated, locale, t, onDetails, onInstall, onDownload, onFavorite, isDownloading, isFavoriting, variant = '' }) {
  const category = categoryMeta.find((entry) => entry.id === item.type);
  const Icon = category?.icon || PackageOpen;
  const platform = preferredPlatformKey(item);
  const canDownload = hasArtifact(item, platform) || isSkillPackage(item);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  const skillLabel = item.type === 'skill' ? skillKindLabel(item.skillKind, t) : '';
  const skillCategory = item.type === 'skill' ? skillCategoryLabel(item.skillCategory, t) : '';
  const cardClassName = ['market-card', variant ? `is-${variant}` : ''].filter(Boolean).join(' ');
  return (
    <article className={cardClassName}>
      <div className="card-body">
        <div className="card-title-row">
          <span className="card-artwork" title={displayType(item.type, t)} aria-label={displayType(item.type, t)}>
            {item.icon ? <img src={item.icon} alt="" /> : <Icon className={category?.colorClass || 'is-muted'} size={18} />}
          </span>
          <h2>
            {localized(item.name, locale)}
          </h2>
          <span className="card-version">{formatVersionLabel(item.version)}</span>
        </div>
        <p>{localized(item.description, locale) || t.noDescription}</p>
        <div className="card-author" title={`${t.author}: ${item.author}`}>
          <User size={13} />
          <span>{item.author}</span>
        </div>
        <div className="tag-row">
          {skillLabel ? <span className={item.skillKind === 'package' ? 'skill-kind-chip package' : 'skill-kind-chip'}>{skillLabel}</span> : null}
          {skillCategory ? <span>{skillCategory}</span> : null}
          {(item.tags || []).slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}
          {platform ? <span className="platform-chip">{platform}</span> : null}
        </div>
        <div className="card-stats">
          <span className="stat-pill" title={t.downloads} aria-label={`${t.downloads}: ${formatCount(item.downloads)}`}>
            <Download size={13} />
            <span>{formatCount(item.downloads)}</span>
          </span>
          {isAuthenticated ? (
            <button
              className={item.favorited ? 'stat-pill stat-button is-active' : 'stat-pill stat-button'}
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
            <span className="stat-pill" title={t.favorites} aria-label={`${t.favorites}: ${formatCount(item.favoriteCount)}`}>
              <Heart size={13} />
              <span>{formatCount(item.favoriteCount)}</span>
            </span>
          )}
        </div>
        {item.skillKind === 'package' && item.includedSkills.length ? (
          <div className="card-included">
            <strong>{t.skillIncluded}</strong>
            {item.includedSkills.slice(0, 4).map((skill) => (
              <span key={skill.id}>{skill.name || skill.id}</span>
            ))}
          </div>
        ) : null}
      </div>
      <footer className={isAuthenticated ? '' : 'is-browse-only'}>
        <button className="link-button" type="button" onClick={onDetails}>
          <span>{t.details}</span>
          <ArrowRight size={13} />
        </button>
        {isAuthenticated ? (
          <button className="primary-action" type="button" disabled={canInstall ? false : !canDownload || isDownloading} onClick={canInstall ? onInstall : onDownload}>
            {canInstall ? <Copy size={13} /> : <Download size={13} />}
            <span>{canInstall ? t.installWithADP : canDownload ? isDownloading ? t.downloading : t.downloadArtifact : t.noArtifact}</span>
          </button>
        ) : null}
      </footer>
    </article>
  );
}

function DetailModal({ item, isAuthenticated, locale, t, videoPlaying, selectedPlatformKey, onPlatformChange, onToggleVideo, onClose, onInstall, onDownload, onFavorite, isDownloading, isFavoriting }) {
  const Icon = categoryMeta.find((category) => category.id === item.type)?.icon || PackageOpen;
  const platformKeys = availablePlatformKeys(item);
  const activePlatformKey = preferredPlatformKey(item, selectedPlatformKey);
  const activePlatform = platformForKey(item, activePlatformKey);
  const deps = platformDependencies(activePlatform, item);
  const commands = commandEntries(activePlatform, t);
  const canDownload = hasArtifact(item, activePlatformKey) || isSkillPackage(item);
  const canInstall = canInstallWithADP(item);
  const favoriteLabel = item.favorited ? t.unfavoriteAction : t.favoriteAction;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-modal" role="dialog" aria-modal="true" aria-label={localized(item.name, locale)} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        <div className="detail-grid">
          <section className="detail-main">
            <div className="media-panel">
              <img src={item.screenshot} alt="" />
            </div>
            {item.hasVideo ? (
              <button className="video-panel" type="button" onClick={onToggleVideo}>
                <img src={item.videoThumb} alt="" />
                {videoPlaying ? <span className="video-running">{t.videoPlaying}</span> : <span className="play-overlay"><Play size={26} fill="currentColor" /></span>}
              </button>
            ) : null}
            <section className="readme-section">
              <h3>{localized(item.readmeTitle, locale) || t.readmeFallback}</h3>
              <p>{localized(item.readme, locale)}</p>
              <ul>
                {(localized(item.features, locale) || []).map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </section>
          </section>

          <section className="detail-side">
            <div className="detail-heading">
              <div className="detail-icon"><Icon size={30} /></div>
              <span>{displayType(item.type, t)}</span>
              <h2>{localized(item.name, locale)}</h2>
              <p>{localized(item.description, locale)}</p>
            </div>

            <div className="meta-grid">
              <div className="meta-row">
                <User size={14} />
                <span>{t.developer}</span>
                <strong>{item.author || 'ZenMind'}</strong>
              </div>
              <div className="meta-row">
                <Calendar size={14} />
                <span>{t.createdAt}</span>
                <strong>{formatDate(item.createdAt || item.publishedAt, locale)}</strong>
              </div>
              <div className="meta-row">
                <HardDrive size={14} />
                <span>{t.size}</span>
                <strong>{formatAssetSizeForPlatform(item, activePlatformKey) || item.size || formatAssetSize(item)}</strong>
              </div>
              <div className="meta-row">
                <Download size={14} />
                <span>{t.downloads}</span>
                <strong>{formatCount(item.downloads)}</strong>
              </div>
              {isAuthenticated ? (
                <button
                  className={item.favorited ? 'meta-row meta-button is-active' : 'meta-row meta-button'}
                  type="button"
                  onClick={onFavorite}
                  disabled={isFavoriting}
                  title={favoriteLabel}
                  aria-label={`${favoriteLabel}: ${formatCount(item.favoriteCount)}`}
                >
                  <Heart size={14} fill={item.favorited ? 'currentColor' : 'none'} />
                  <span>{t.favorites}</span>
                  <strong>{formatCount(item.favoriteCount)}</strong>
                </button>
              ) : (
                <div className="meta-row">
                  <Heart size={14} />
                  <span>{t.favorites}</span>
                  <strong>{formatCount(item.favoriteCount)}</strong>
                </div>
              )}
            </div>

            {item.type === 'skill' ? (
              <section className="side-section">
                <h3>{t.skillCategoryTitle}</h3>
                <div className="skill-facts">
                  <span>{skillKindLabel(item.skillKind, t)}</span>
                  <span>{skillCategoryLabel(item.skillCategory, t)}</span>
                  {item.skillScenario ? <span>{t.skillScenarios[item.skillScenario] || item.skillScenario}</span> : null}
                  {item.skillLevel ? <span>{t.skillLevels[item.skillLevel] || item.skillLevel}</span> : null}
                  {item.skillFeatured ? <span>{t.skillFeatured}</span> : null}
                </div>
                {item.skillKind === 'package' ? (
                  <div className="included-skill-list">
                    <strong>{t.skillIncluded}</strong>
                    {item.includedSkills.length ? item.includedSkills.map((skill) => (
                      <div className="included-skill" key={skill.id}>
                        <span>{skill.name || skill.id}</span>
                        <small>{skill.id}</small>
                      </div>
                    )) : <p className="empty-detail">{t.noDependencies}</p>}
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="side-section">
              <h3>{t.platforms}</h3>
              {platformKeys.length ? (
                <div className="platform-detail">
                  {platformKeys.length > 1 ? (
                    <label className="platform-select">
                      <span>{t.currentPlatform}</span>
                      <select value={activePlatformKey} onChange={(event) => onPlatformChange(event.target.value)}>
                        {platformKeys.map((platform) => <option value={platform} key={platform}>{platform}</option>)}
                      </select>
                    </label>
                  ) : (
                    <div className="platform-single">
                      <Box size={13} />
                      <span>{activePlatformKey}</span>
                    </div>
                  )}
                  <div className="platform-facts">
                    {activePlatform?.os ? <span>{t.os}: {activePlatform.os}</span> : null}
                    {activePlatform?.arch ? <span>{t.arch}: {activePlatform.arch}</span> : null}
                    {activePlatform?.minDesktopVersion ? <span>{t.minDesktopVersion}: {activePlatform.minDesktopVersion}</span> : null}
                    {hasArtifact(item, activePlatformKey) ? <span>{t.assets}: {formatAssetSizeForPlatform(item, activePlatformKey)}</span> : null}
                  </div>
                  {activePlatform?.description ? <p className="platform-copy">{activePlatform.description}</p> : null}
                </div>
              ) : <p className="empty-detail">{t.noPlatformDetails}</p>}
            </section>

            <section className="side-section">
              <h3>{t.dependencies}</h3>
              <div className="dependency-list">
                {deps.length ? deps.map((dep) => {
                  const key = dependencyKey(dep);
                  return (
                    <div className="dep-row" key={`${key}:${dep.name || dep.displayName || dep.kind}`}>
                      <span className={dep.required ? 'dep-dot warn' : 'dep-dot optional'} />
                      <strong>{localized(dep.name || dep.displayName || key, locale)}</strong>
                      <small>{dep.required ? t.depRequired : t.depOptional}</small>
                    </div>
                  );
                }) : <p className="empty-detail">{t.noDependencies}</p>}
              </div>
            </section>

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

            <section className="side-section">
              <h3>{t.assets}</h3>
              <div className="asset-tree">
                {(assetEntries(item) || []).map((asset) => {
                  const isDir = asset.label.includes('/');
                  const AssetIcon = isDir ? Folder : File;
                  return (
                    <div className={asset.platform === activePlatformKey ? 'is-selected' : ''} key={asset.label}>
                      <AssetIcon size={14} />
                      <span>{asset.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {isAuthenticated ? (
              <div className="detail-action">
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
              </div>
            ) : null}
          </section>
        </div>
      </aside>
    </div>
  );
}

function PublishPage({ t, locale, authSession, availableSkills = [], onClose, onSubmit, isPublishing }) {
  const [step, setStep] = useState('type');
  const [type, setType] = useState('agent');
  const [archiveType, setArchiveType] = useState(defaultArchiveTypeFor('agent'));
  const [sandboxKind, setSandboxKind] = useState('environment-template');
  const [websiteKind, setWebsiteKind] = useState('local-app');
  const [skillKind, setSkillKind] = useState('single');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillIDs, setSelectedSkillIDs] = useState([]);

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
      <section className="publish-page" aria-label={t.publishTitle}>
        <div className="publish-page-head">
          <div>
            <h2>{t.publishTitle}</h2>
            <p>{t.publishBody}</p>
          </div>
          <button className="secondary-action" type="button" onClick={onClose} disabled={isPublishing}>
            <ArrowRight size={14} />
            <span>{t.backToMarket}</span>
          </button>
        </div>
        {renderStepIndicator()}
        {step === 'type' ? renderTypePicker() : null}
        {step === 'details' ? (
        <form className="publish-form publish-form-guided" onSubmit={onSubmit} key={`${type}:${skillKind}`}>
          <div className="publish-selected full">
            <button className="secondary-action" type="button" onClick={() => setStep('type')} disabled={isPublishing}>
              <ArrowRight size={14} />
              <span>{t.publishBackToTypes}</span>
            </button>
            <span className="publish-selected-card">
              <SelectedIcon size={18} />
              <strong>{selectedType.label(t)}</strong>
              <small>{t.publishTypeRequirementsMap[selectedType.id]}</small>
            </span>
          </div>
          <input name="type" type="hidden" value={type} />
          <input name="archiveType" type="hidden" value={archiveType} />
          {type === 'skill' ? <input name="skillKind" type="hidden" value={skillKind} /> : null}
          {authSession?.user?.role === 'admin' ? (
            <label className="publish-field-card full">
              <span>{t.reviewSubmitMode}</span>
              <select name="reviewStatus" defaultValue="approved">
                <option value="approved">{t.reviewSubmitApproved}</option>
                <option value="pending">{t.reviewSubmitPending}</option>
              </select>
            </label>
          ) : null}
          <section className="publish-section full">
            <h3>{t.publishBasicInfo}</h3>
            <div className="publish-section-grid">
              <label>
                <span>{t.componentId}</span>
                <input name="id" required placeholder="my-agent" pattern="[a-z0-9._-]+" />
              </label>
              <label>
                <span>{t.name}</span>
                <input name="name" required placeholder="My Agent" />
              </label>
              <label>
                <span>{t.version}</span>
                <input name="version" defaultValue="1.0.0" />
              </label>
              <label>
                <span>{t.image}</span>
                <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
              </label>
              <label className="full">
                <span>{t.description}</span>
                <textarea name="description" rows="4" required />
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
                <select name="skillCategory" defaultValue="other">
                  {skillCategoryFilters.filter((category) => category !== 'all').map((category) => <option value={category} key={category}>{t.skillCategories[category]}</option>)}
                </select>
              </label>
              <label>
                <span>{t.skillScenario}</span>
                <select name="skillScenario" defaultValue="productivity">
                  {skillScenarioOptions.map((scenario) => <option value={scenario} key={scenario}>{t.skillScenarios[scenario]}</option>)}
                </select>
              </label>
              <label>
                <span>{t.skillLevel}</span>
                <select name="skillLevel" defaultValue="beginner">
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
                <input name="skillFeatured" type="checkbox" />
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
              <input name="metadataUrl" type="url" required placeholder="https://example.com/app" />
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
                  <input name="platformKey" defaultValue="universal" placeholder="universal" />
                </label>
                <label>
                  <span>{t.os}</span>
                  <select name="platformOS" defaultValue="">
                    <option value="">auto</option>
                    <option value="darwin">darwin</option>
                    <option value="linux">linux</option>
                    <option value="windows">windows</option>
                    <option value="universal">universal</option>
                  </select>
                </label>
                <label>
                  <span>{t.arch}</span>
                  <select name="platformArch" defaultValue="">
                    <option value="">auto</option>
                    <option value="arm64">arm64</option>
                    <option value="amd64">amd64</option>
                    <option value="arm">arm</option>
                    <option value="386">386</option>
                  </select>
                </label>
                <label>
                  <span>{t.minDesktopVersion}</span>
                  <input name="platformMinDesktopVersion" placeholder="1.2.0" />
                </label>
                <label>
                  <span>{t.tags}</span>
                  <input name="tags" placeholder="AI, Tool" />
                </label>
                <label>
                  <span>{t.author}</span>
                  <input name="author" placeholder="ZenMind" />
                </label>
                <label className="full">
                  <span>{t.platformDescription}</span>
                  <textarea name="platformDescription" rows="3" />
                </label>
                <label className="full">
                  <span>{t.platformMetadata}</span>
                  <textarea name="platformMetadata" rows="4" defaultValue="{}" spellCheck="false" />
                </label>
                <label className="full">
                  <span>{t.platformDependencies}</span>
                  <textarea name="platformDependencies" rows="5" defaultValue="[]" spellCheck="false" />
                </label>
          {type === 'cli-tool' ? (
            <>
              <label className="full">
                <span>{t.installCommand}</span>
                <input name="installCommand" placeholder="brew install zmctl" />
              </label>
              <label className="full">
                <span>{t.uninstallCommand}</span>
                <input name="uninstallCommand" placeholder="brew uninstall zmctl" />
              </label>
              <label className="full">
                <span>{t.detectCommands}</span>
                <textarea name="detectCommands" rows="3" placeholder="zmctl" />
              </label>
              <label className="full">
                <span>{t.versionCommand}</span>
                <input name="versionCommand" placeholder="zmctl --version" />
              </label>
            </>
          ) : null}
                <label className="full">
                  <span>{t.readme}</span>
                  <textarea name="readme" rows="5" />
                </label>
              </div>
            ) : null}
          </section>
          <footer className="modal-actions">
            <button className="secondary-action" type="button" onClick={onClose} disabled={isPublishing}>{t.cancel}</button>
            <button className="primary-action" type="submit" disabled={isPublishing}>
              <Upload size={15} />
              <span>{isPublishing ? t.publishing : t.publishSubmit}</span>
            </button>
          </footer>
        </form>
        ) : null}
      </section>
  );
}

function StateNotice({ title, body, tone = 'neutral' }) {
  const NoticeIcon = tone === 'warning' || tone === 'error' ? AlertCircle : Info;
  return (
    <div className={`state-notice is-${tone}`}>
      <NoticeIcon size={16} />
      <span><strong>{title}</strong>{body}</span>
    </div>
  );
}

function Toast({ toast }) {
  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertOctagon : Info;
  return (
    <div className={`toast is-${toast.tone}`}>
      <Icon size={17} />
      <span>{toast.message}</span>
    </div>
  );
}

function mergeCatalogItem(apiItem) {
  const type = normalizeType(apiItem.type);
  const assetMap = apiItem.assets || {};
  const platformMap = synthesizePlatformMap(apiItem.platforms || {}, assetMap);
  const skill = normalizeSkillProfile(apiItem.skill, type);
  const assets = Object.entries(assetMap).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'} ${formatBytes(asset.sizeBytes)}`);
  const downloadCount = parseCount(apiItem.downloadCount ?? apiItem.metadata?.downloads ?? 0);
  const favoriteCount = parseCount(apiItem.favoriteCount ?? apiItem.metadata?.favorites ?? 0);
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
    favoriteCount,
    favorited: Boolean(apiItem.favorited),
    reviewStatus: normalizeReviewStatusForUI(apiItem.reviewStatus),
    reviewNote: apiItem.reviewNote || '',
    reviewedAt: apiItem.reviewedAt || '',
    reviewedBy: apiItem.reviewedBy || '',
  };
}

function normalizeType(type) {
  if (type === 'webapps' || type === 'webapp' || type === 'website' || type === 'website-apps') return 'website-app';
  if (type === 'agents') return 'agent';
  if (type === 'software' || type === 'softwares' || type === 'software-packages' || type === 'dependency-package' || type === 'dependency-packages') return 'software-package';
  return canonicalTypes.includes(type) ? type : 'skill';
}

function normalizeSkillProfile(skill, type) {
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

function normalizeReviewStatusForUI(status) {
  status = String(status || '').trim().toLowerCase();
  return ['approved', 'rejected', 'pending'].includes(status) ? status : 'approved';
}

function localized(value, locale) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return value[locale] || value['zh-CN'] || value['en-US'] || '';
  return value || '';
}

function resolveMarketBrand(value) {
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

function formatBrandLabel(value) {
  const words = String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 'ZenMind';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function displayType(type, t) {
  return t?.categories?.[type] || (type === 'website-app' ? 'webapps' : type);
}

function skillKindLabel(kind, t) {
  return kind === 'package' ? t.skillPackage : t.skillSingle;
}

function skillCategoryLabel(category, t) {
  return t.skillCategories?.[category] || t.skillCategories?.other || category;
}

function isSkillPackage(item) {
  return item?.type === 'skill' && item?.skillKind === 'package';
}

function canonicalVersion(value) {
  const version = String(value || '').trim();
  if (/^[vV]\d/.test(version)) return version.slice(1);
  return version;
}

function formatVersionLabel(value) {
  const version = canonicalVersion(value);
  return version ? `v${version}` : '';
}

function synthesizePlatformMap(platforms = {}, assets = {}) {
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

function normalizePlatformSpec(platform, spec = {}) {
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

function normalizeDependenciesForUI(dependencies) {
  return (dependencies || []).map((dep) => ({
    ...dep,
    id: dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
    name: dep.displayName || dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
  }));
}

function availablePlatformKeys(item) {
  const keys = item?.platformOptions?.length
    ? item.platformOptions
    : sortPlatformKeys([
      ...Object.keys(item?.platformMap || {}),
      ...Object.keys(item?.assetMap || {}),
    ]);
  return keys;
}

function sortPlatformKeys(keys) {
  return [...new Set(keys.map(sanitizePlatformKey).filter(Boolean))].sort((a, b) => {
    if (a === 'universal') return -1;
    if (b === 'universal') return 1;
    return a.localeCompare(b);
  });
}

function preferredPlatformKey(item, requested = '') {
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

function platformForKey(item, key) {
  const resolvedKey = preferredPlatformKey(item, key);
  return item?.platformMap?.[resolvedKey] || (resolvedKey ? normalizePlatformSpec(resolvedKey, { platform: resolvedKey }) : null);
}

function downloadKeyForItem(item, platformKey = '') {
  if (!item) return '';
  if (item.type === 'skill' && item.skillKind === 'package') return `${item.type}:${item.id}:package`;
  return `${item.type}:${item.id}:${preferredPlatformKey(item, platformKey) || 'any'}`;
}

function platformDependencies(platform, item) {
  if (platform?.dependencies?.length) return platform.dependencies;
  return item?.dependencies || [];
}

function platformFallbackCandidates(platform) {
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

function detectClientPlatform() {
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

function sanitizePlatformKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferOSFromPlatform(platform) {
  const key = sanitizePlatformKey(platform);
  if (key.startsWith('darwin')) return 'darwin';
  if (key.startsWith('linux')) return 'linux';
  if (key.startsWith('windows') || key.startsWith('win32')) return 'windows';
  return key === 'universal' ? 'universal' : '';
}

function inferArchFromPlatform(platform) {
  const parts = sanitizePlatformKey(platform).split('-');
  return parts.find((part) => ['arm64', 'amd64', '386', 'arm'].includes(part)) || '';
}

function marketRoute(type) {
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

function dependencyKey(dep) {
  return dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind || 'unknown';
}

function commandEntries(platform, t) {
  const entries = [];
  if (platform?.install?.command) entries.push({ label: t.installCommand, value: platform.install.command });
  if (platform?.uninstall?.command) entries.push({ label: t.uninstallCommand, value: platform.uninstall.command });
  for (const command of platform?.detect?.commands || []) {
    if (command) entries.push({ label: t.detectCommands, value: command });
  }
  if (platform?.detect?.versionCommand) entries.push({ label: t.versionCommand, value: platform.detect.versionCommand });
  return entries;
}

function assetList(item) {
  if (Array.isArray(item.assets)) return item.assets;
  return Object.entries(item.assets || {}).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'}`);
}

function assetEntries(item) {
  const assets = item.assetMap || item.assets || {};
  if (Array.isArray(assets)) return assets.map((label) => ({ label, platform: label.split('/')[0] }));
  return Object.entries(assets).map(([platform, asset]) => ({
    platform,
    label: `${platform}/${asset.archiveType || 'artifact'} ${formatBytes(asset.sizeBytes)}`,
    asset,
  }));
}

function formatAssetSize(item) {
  const values = Object.values(item.assets || {});
  if (!values.length || !values[0]?.sizeBytes) return 'size unknown';
  return formatBytes(values.reduce((sum, asset) => sum + (asset.sizeBytes || 0), 0));
}

function formatAssetSizeForPlatform(item, platformKey) {
  const asset = getAssetForPlatform(item, platformKey);
  return asset?.sizeBytes ? formatBytes(asset.sizeBytes) : '';
}

function formatBytes(value) {
  if (!value) return 'size unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function parseCount(value) {
  return Number(String(value || '0').replace(/[^0-9]/g, '')) || 0;
}

function parseDownloads(value) {
  return parseCount(value);
}

function formatCount(value) {
  return parseCount(value).toLocaleString();
}

function formatDownloads(value) {
  return formatCount(value);
}

function formatDate(value, locale) {
  const timestamp = dateValue(value);
  if (!timestamp) return locale === 'zh-CN' ? '未知' : 'Unknown';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

function dateValue(value) {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getAssetForPlatform(item, platformKey = '') {
  const assetMap = item?.assetMap || {};
  if (!Object.keys(assetMap).length) return null;
  if (!platformKey) return Object.values(assetMap)[0] || null;
  for (const candidate of platformFallbackCandidates(platformKey)) {
    if (assetMap[candidate]) return assetMap[candidate];
  }
  return null;
}

function hasArtifact(item, platformKey = '') {
  if (platformKey) return Boolean(getAssetForPlatform(item, platformKey));
  return Boolean(Object.keys(item?.assetMap || {}).length || assetList(item).length);
}

function creatorQualityIssues(item, t) {
  const issues = [];
  if (!item?.icon) issues.push(t.creatorQualityImage);
  if (!String(item?.readme || '').trim()) issues.push(t.creatorQualityReadme);
  if (!isSkillPackage(item) && item?.websiteKind !== 'external' && !hasArtifact(item)) issues.push(t.creatorQualityArtifact);
  return issues;
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options });
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function errorMessage(reason) {
  return reason instanceof Error ? reason.message : String(reason || 'unknown error');
}

function triggerBrowserDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function canInstallWithADP(item) {
  return Boolean(item?.adpInstallUrl && (item.type === 'cli-tool' || item.type === 'skill'));
}

function adpInstallCommand(item) {
  if (!canInstallWithADP(item)) return '';
  return `adp install ${absoluteInstallURL(item.adpInstallUrl)}`;
}

function absoluteInstallURL(value) {
  if (!value) return '';
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return String(value);
  }
}

function parseTags(value) {
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function filterPublishSkills(skills, query, locale) {
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

function parseIncludedSkills(value) {
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((entry) => String(entry || '').split(/[\n,]/))
    .map((id, index) => ({ id: id.trim().toLowerCase(), sortOrder: index + 1 }))
    .filter((entry) => entry.id);
}

function parseJSONField(value, fallback, label, expectedType, invalidJSON) {
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

function scriptSpecFromCommand(value) {
  const command = String(value || '').trim();
  return command ? { command } : null;
}

function detectSpecFromForm(form) {
  const commands = String(form.get('detectCommands') || '')
    .split(/\n|,/)
    .map((command) => command.trim())
    .filter(Boolean);
  const versionCommand = String(form.get('versionCommand') || '').trim();
  if (!commands.length && !versionCommand) return null;
  return { commands, versionCommand };
}

function artifactRequiredFor(type, options = {}) {
  type = normalizeType(type);
  if (type === 'cli-tool') return false;
  if (type === 'website-app' && options.websiteKind === 'external') return false;
  if (type === 'skill' && options.skill?.kind === 'package') return false;
  return true;
}

function supportsADPFor(type, options = {}) {
  type = normalizeType(type);
  if (type === 'skill' && options.skill?.kind === 'package') return false;
  return type === 'cli-tool' || type === 'skill';
}

function archiveOptionsFor(type, options = {}) {
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

function defaultArchiveTypeFor(type, options = {}) {
  return archiveOptionsFor(type, options)[0] || 'zip';
}

function svgDataUri(markup) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}
