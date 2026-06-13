import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  ArrowRight,
  Bot,
  Box,
  Brain,
  Cat,
  CheckCircle2,
  Download,
  File,
  Folder,
  Globe,
  Info,
  Languages,
  LayoutGrid,
  Moon,
  PackageOpen,
  Play,
  Plus,
  Puzzle,
  Search,
  Shapes,
  ShieldAlert,
  SlidersHorizontal,
  Sun,
  Terminal,
  Upload,
  X,
} from 'lucide-react';

const apiBase = import.meta.env.VITE_MARKET_API_BASE || '/api/v1';
const brandId = import.meta.env.VITE_MARKET_BRAND || 'zenmind';
const locales = ['zh-CN', 'en-US'];
const canonicalTypes = ['skill', 'plugin', 'agent', 'sandbox-image', 'pet', 'cli-tool', 'website-app'];

const brandNames = {
  zenmind: { 'zh-CN': 'ZenMind 市场', 'en-US': 'ZenMind Market' },
  cutej: { 'zh-CN': '小君 AI 市场', 'en-US': 'CuteJ Market' },
};

const marketBrand = resolveMarketBrand(brandId);

const translations = {
  'zh-CN': {
    searchPlaceholder: '搜索扩展、插件、沙箱、工具...',
    publish: '开发者发布',
    categoriesTitle: '市场分类',
    envTitle: '本地环境模拟',
    envBadge: '配置',
    envDescription: '开启或关闭本地环境，测试依赖阻断与自愈流。',
    footer: '© 2026 ZenMind Technologies.\n标准扩展协议 v1.0',
    sortLabel: '排序:',
    sortPopular: '热门推荐',
    sortLatest: '最新发布',
    sortRating: '评分最高',
    count: (value) => `(${value})`,
    all: '全部组件',
    ready: '就绪',
    missingDeps: '缺少依赖',
    installDeps: '安装依赖',
    install: '安装',
    uninstall: '卸载',
    details: '详情与演示',
    emptyTitle: '未找到相关组件',
    emptyBody: '请尝试其他搜索词或分类',
    loadingTitle: '正在加载市场',
    loadingBody: '正在获取官方目录。',
    fallbackTitle: '已使用内置演示目录',
    fallbackBody: '远端目录暂不可用，页面仍可完整演示安装与依赖流程。',
    dependencyTitle: '依赖自愈管理',
    dependencyBody: '安装此组件前，可在这里检查必需与可选本地依赖状态。',
    oneClickInstall: '一键安装',
    proceedInstall: '继续安装组件',
    cancel: '取消',
    close: '关闭',
    wait: '请稍候...',
    returnDeps: '返回依赖管理',
    complete: '完成',
    themeToggle: '切换主题',
    languageToggle: '切换语言',
    terminalShell: 'bash',
    installSuccess: (name) => `[${name}] 安装成功`,
    uninstallSuccess: (name) => `[${name}] 已成功卸载`,
    envToggled: (key) => `本地环境 [${key}] 状态已切换`,
    depSuccess: (name) => `依赖 [${name}] 安装成功！`,
    initInstall: '正在初始化安装环境...',
    initDependency: (name) => `正在初始化依赖 [${name}] 安装环境...`,
    downloadAssets: '正在下载组件制品包...',
    verifyAssets: '正在解压并校验 SHA256 完整性...',
    registerAssets: '正在注册组件并执行安全沙箱校验...',
    finalInstall: '安装完成，正在进行最后配置...',
    downloadDependency: (size) => `正在下载依赖包 (${size})...`,
    unpackDependency: '正在解压并配置环境变量...',
    verifyDependency: '正在执行本地系统兼容性校验...',
    refreshDependency: '依赖安装完成，正在刷新环境...',
    installDone: '安装成功！',
    depReady: '已就绪',
    depMissing: '未安装',
    depOptionalMissing: '可选未安装',
    depRequired: '必需',
    depOptional: '可选',
    developer: '开发者',
    size: '大小',
    downloads: '下载',
    features: '核心特性',
    dependencies: '依赖图谱',
    assets: '制品内容',
    readmeFallback: '组件核心特性',
    noDescription: '暂无描述。',
    noDependencies: '暂无依赖。',
    installRequiredDeps: (value) => `安装所需依赖 (${value})`,
    oneClickComponent: '一键安装',
    uninstallComponent: '卸载组件',
    videoPlaying: '演示运行中',
    publishTitle: '发布到市场',
    publishBody: '填写组件元数据后，立即加入当前市场视图。',
    type: '类型',
    componentId: '组件 ID',
    name: '名称',
    version: '版本',
    description: '描述',
    publishSubmit: '发布并上架',
    duplicate: (id) => `发布失败：组件 ID [${id}] 已存在于市场中。`,
    publishSuccess: (name) => `组件 [${name}] 发布成功并上架！`,
    categories: {
      all: '全部组件',
      skill: '技能',
      plugin: '插件',
      agent: '智能体',
      'sandbox-image': '沙箱',
      pet: '桌面宠物',
      'cli-tool': 'CLI 工具',
      'website-app': '网站应用',
    },
  },
  'en-US': {
    searchPlaceholder: 'Search extensions, plugins, sandboxes, tools...',
    publish: 'Developer publish',
    categoriesTitle: 'Market Categories',
    envTitle: 'Local Environment',
    envBadge: 'Config',
    envDescription: 'Toggle local dependencies to test blocking and self-healing flows.',
    footer: '© 2026 ZenMind Technologies.\nStandard Extension Protocol v1.0',
    sortLabel: 'Sort:',
    sortPopular: 'Popular',
    sortLatest: 'Latest',
    sortRating: 'Highest rated',
    count: (value) => `(${value})`,
    all: 'All Components',
    ready: 'Ready',
    missingDeps: 'Missing deps',
    installDeps: 'Install deps',
    install: 'Install',
    uninstall: 'Uninstall',
    details: 'Details & demo',
    emptyTitle: 'No matching components',
    emptyBody: 'Try another search term or category.',
    loadingTitle: 'Loading market',
    loadingBody: 'Fetching the official catalog.',
    fallbackTitle: 'Using built-in demo catalog',
    fallbackBody: 'The remote catalog is unavailable, but install and dependency flows are fully available.',
    dependencyTitle: 'Dependency self-healing',
    dependencyBody: 'Review required and optional local dependency status before installing this component.',
    oneClickInstall: 'Install',
    proceedInstall: 'Continue install',
    cancel: 'Cancel',
    close: 'Close',
    wait: 'Please wait...',
    returnDeps: 'Back to dependencies',
    complete: 'Done',
    themeToggle: 'Theme',
    languageToggle: 'Language',
    terminalShell: 'bash',
    installSuccess: (name) => `[${name}] installed`,
    uninstallSuccess: (name) => `[${name}] uninstalled`,
    envToggled: (key) => `Local dependency [${key}] toggled`,
    depSuccess: (name) => `Dependency [${name}] installed!`,
    initInstall: 'Initializing install environment...',
    initDependency: (name) => `Initializing dependency [${name}] install environment...`,
    downloadAssets: 'Downloading component artifact...',
    verifyAssets: 'Extracting and verifying SHA256...',
    registerAssets: 'Registering component and checking sandbox policy...',
    finalInstall: 'Finalizing installation...',
    downloadDependency: (size) => `Downloading dependency package (${size})...`,
    unpackDependency: 'Extracting and configuring environment variables...',
    verifyDependency: 'Running local compatibility checks...',
    refreshDependency: 'Dependency installed, refreshing environment...',
    installDone: 'Install succeeded!',
    depReady: 'Ready',
    depMissing: 'Not installed',
    depOptionalMissing: 'Optional not installed',
    depRequired: 'Required',
    depOptional: 'Optional',
    developer: 'Developer',
    size: 'Size',
    downloads: 'Downloads',
    features: 'Core features',
    dependencies: 'Dependency graph',
    assets: 'Artifacts',
    readmeFallback: 'Component highlights',
    noDescription: 'No description provided.',
    noDependencies: 'No dependencies.',
    installRequiredDeps: (value) => `Install required deps (${value})`,
    oneClickComponent: 'Install now',
    uninstallComponent: 'Uninstall component',
    videoPlaying: 'Demo running',
    publishTitle: 'Publish to local market',
    publishBody: 'Add component metadata and publish it into the current market view.',
    type: 'Type',
    componentId: 'Component ID',
    name: 'Name',
    version: 'Version',
    description: 'Description',
    publishSubmit: 'Publish',
    duplicate: (id) => `Publish failed: component ID [${id}] already exists.`,
    publishSuccess: (name) => `Component [${name}] published!`,
    categories: {
      all: 'All Components',
      skill: 'Skills',
      plugin: 'Plugins',
      agent: 'Agents',
      'sandbox-image': 'Sandboxes',
      pet: 'Desktop Pets',
      'cli-tool': 'CLI Tools',
      'website-app': 'WebApps',
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
];

const dependencyMeta = {
  'agent-platform': {
    name: { 'zh-CN': 'ZenMind 智能体底座', 'en-US': 'ZenMind Agent Platform' },
    type: 'core-platform',
    version: 'v2.1.0',
    size: '45.2 MB',
    assets: ['bin/zm-agent', 'config/default.yaml'],
  },
  git: {
    name: { 'zh-CN': 'Git 命令行工具', 'en-US': 'Git CLI' },
    type: 'system-cli',
    version: 'v2.42.0',
    size: '32.1 MB',
    assets: ['bin/git', 'etc/gitconfig'],
  },
  node: {
    name: { 'zh-CN': 'Node.js 运行时', 'en-US': 'Node.js Runtime' },
    type: 'runtime',
    version: 'v18.16.0',
    size: '28.4 MB',
    assets: ['bin/node', 'bin/npm'],
  },
  docker: {
    name: { 'zh-CN': 'Docker 引擎', 'en-US': 'Docker Engine' },
    type: 'system-service',
    version: 'v24.0.7',
    size: '185.0 MB',
    assets: ['bin/dockerd', 'bin/docker'],
  },
  python: {
    name: { 'zh-CN': 'Python 3.10+ 环境', 'en-US': 'Python 3.10+ Runtime' },
    type: 'runtime',
    version: 'v3.10.11',
    size: '52.3 MB',
    assets: ['bin/python', 'bin/pip'],
  },
  'model-runtime': {
    name: { 'zh-CN': '本地模型运行时', 'en-US': 'Local Model Runtime' },
    type: 'runtime',
    version: 'v1.4.0',
    size: '96.0 MB',
    assets: ['bin/zm-model', 'models/default.json'],
  },
};

const initialEnv = {
  'agent-platform': true,
  git: true,
  node: true,
  docker: false,
  python: false,
  'model-runtime': false,
};

const sampleItems = [
  {
    id: 'translator-agent',
    type: 'skill',
    name: { 'zh-CN': 'AI 智能多语言翻译 Agent', 'en-US': 'AI Multilingual Translator Agent' },
    version: '1.2.0',
    description: {
      'zh-CN': '基于大模型的上下文感知翻译 Skill，支持 40+ 种语言流式输出与专业术语对齐。',
      'en-US': 'A context-aware translation skill with streaming output for 40+ languages and glossary alignment.',
    },
    readmeTitle: { 'zh-CN': '下一代多语言上下文感知翻译引擎', 'en-US': 'Next-generation context-aware translation engine' },
    readme: {
      'zh-CN': '本组件为 ZenMind 提供系统级翻译赋能。支持自动语种识别、专业术语库接入、零配置即开即用。内置安全沙箱隔离，保障翻译数据不外泄。完美契合企业级本地化部署和日常翻译辅助场景。',
      'en-US': 'This component adds system-level translation to ZenMind with language detection, glossary integration, zero setup, and sandbox isolation for private localization workflows.',
    },
    features: {
      'zh-CN': ['支持 40+ 种语言双向实时流式翻译', '内置专业术语库对齐算法，翻译准确率提升 45%', '零配置，一键接入 ZenMind 智能体总线', '支持离线缓存，常用词汇无需重复请求'],
      'en-US': ['Real-time streaming translation across 40+ languages', 'Glossary alignment improves terminology accuracy', 'One-click connection to the ZenMind agent bus', 'Offline cache for repeated vocabulary'],
    },
    screenshot: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    videoThumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    size: '18.4 MB',
    downloads: '24,810',
    tags: ['AI', 'Translation', 'Agent'],
    assets: ['SKILL.md', 'skill.json', 'model-config.bin', 'locales/zh.json', 'locales/en.json'],
    dependencies: [
      { id: 'agent-platform', name: { 'zh-CN': 'ZenMind 智能体底座', 'en-US': 'ZenMind Agent Platform' }, required: true },
      { id: 'python', name: { 'zh-CN': 'Python 3.10+ 环境', 'en-US': 'Python 3.10+ Runtime' }, required: false },
    ],
    author: 'ZenMind Core Team',
  },
  {
    id: 'git-copilot',
    type: 'plugin',
    name: { 'zh-CN': 'Git 仓库托管增强插件', 'en-US': 'Git Repository Copilot Plugin' },
    version: '2.0.1',
    description: {
      'zh-CN': '接入 Service Manager，提供自动化部署与本地仓库生命周期管理。',
      'en-US': 'Connects to Service Manager for automated deploys and local repository lifecycle management.',
    },
    readmeTitle: { 'zh-CN': '一站式 Git 仓库自动化与状态监控', 'en-US': 'One-stop Git automation and repository health monitoring' },
    readme: {
      'zh-CN': '集成于 Service Manager，支持在 Desktop 侧边栏直接管理 Git 状态。本插件包含 deploy, start, stop 脚本，由 Desktop 安全沙箱托管执行。通过可视化的图形界面，让您告别繁琐的命令行操作，轻松掌控代码生命周期。',
      'en-US': 'Integrated with Service Manager, this plugin manages Git status from the Desktop sidebar. Deploy, start, and stop scripts run inside the Desktop sandbox.',
    },
    features: {
      'zh-CN': ['可视化 Git 分支合并与冲突预警', '深度集成 Service Manager 自动化部署脚本', '本地仓库健康度与大文件检测', '支持多账号 SSH 密钥无缝切换'],
      'en-US': ['Visual branch merge and conflict warnings', 'Service Manager deployment hooks', 'Repository health and large-file checks', 'Multi-account SSH key switching'],
    },
    screenshot: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80',
    videoThumb: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    size: '8.2 MB',
    downloads: '12,402',
    tags: ['Git', 'Developer', 'Workflow'],
    assets: ['manifest.json', 'index.js', 'lifecycle-hook.sh', 'icons/git.svg'],
    dependencies: [
      { id: 'git', name: { 'zh-CN': 'Git 命令行工具', 'en-US': 'Git CLI' }, required: true },
      { id: 'node', name: { 'zh-CN': 'Node.js 运行时', 'en-US': 'Node.js Runtime' }, required: true },
    ],
    author: 'DevOps Community',
  },
  {
    id: 'workflow-planner',
    type: 'agent',
    name: { 'zh-CN': '任务编排 Planner Agent', 'en-US': 'Workflow Planner Agent' },
    version: '1.0.0',
    description: {
      'zh-CN': '面向研发团队的任务拆解与多智能体调度 Agent，支持计划、执行、复盘闭环。',
      'en-US': 'A planning and orchestration agent for engineering teams, with plan, execute, and review loops.',
    },
    readmeTitle: { 'zh-CN': '让复杂任务自动拆解并交给正确智能体', 'en-US': 'Split complex work and route it to the right agents' },
    readme: {
      'zh-CN': 'Planner Agent 读取项目上下文、当前目标与依赖约束，自动生成任务计划并调度 Codex、浏览器、文档等能力。适合需求拆解、研发排期、自动复盘和团队协作场景。',
      'en-US': 'Planner Agent reads project context, goals, and constraints, then creates task plans and routes work to Codex, browser, document, and automation capabilities.',
    },
    features: {
      'zh-CN': ['自动拆解目标、风险和验收标准', '支持多智能体任务派发与状态回收', '内置项目记忆和复盘摘要', '可与桌面任务板和日程系统联动'],
      'en-US': ['Breaks goals into tasks, risks, and acceptance criteria', 'Dispatches work across multiple agents', 'Project memory and review summaries', 'Integrates with task boards and schedules'],
    },
    screenshot: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
    videoThumb: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80',
    size: '22.8 MB',
    downloads: '9,840',
    tags: ['Agent', 'Planner', 'Automation'],
    assets: ['agent.yml', 'prompts/planner.md', 'tools/router.json', 'memory/schema.json'],
    dependencies: [
      { id: 'agent-platform', name: { 'zh-CN': 'ZenMind 智能体底座', 'en-US': 'ZenMind Agent Platform' }, required: true },
      { id: 'model-runtime', name: { 'zh-CN': '本地模型运行时', 'en-US': 'Local Model Runtime' }, required: true },
    ],
    author: 'ZenMind Agent Lab',
  },
  {
    id: 'python-data-science',
    type: 'sandbox-image',
    name: { 'zh-CN': 'Python 数据科学沙箱镜像', 'en-US': 'Python Data Science Sandbox Image' },
    version: '3.10-v1',
    description: {
      'zh-CN': '预装 NumPy, Pandas, Matplotlib 的轻量级容器化执行环境。',
      'en-US': 'A lightweight containerized execution environment with NumPy, Pandas, and Matplotlib.',
    },
    readmeTitle: { 'zh-CN': '开箱即用的容器化数据科学实验室', 'en-US': 'Ready-to-use containerized data science lab' },
    readme: {
      'zh-CN': '开箱即用的数据科学沙箱模板，支持直接在沙箱内安全运行 Python 脚本并渲染图表。基于 Docker 容器隔离，保证宿主机绝对安全。内置常用科学计算库，免去复杂的本地环境配置烦恼。',
      'en-US': 'A ready-made data science sandbox for safely running Python scripts and rendering charts inside a Docker-isolated environment.',
    },
    features: {
      'zh-CN': ['预装 Python 3.10, NumPy, Pandas, Matplotlib, SciPy', '沙箱容器级硬隔离，保障宿主机文件系统绝对安全', '支持一键导出渲染图表至本地剪贴板', '秒级冷启动速度，极速响应数据分析需求'],
      'en-US': ['Python 3.10, NumPy, Pandas, Matplotlib, and SciPy included', 'Container-level isolation protects the host file system', 'One-click chart export', 'Fast cold starts for data analysis'],
    },
    screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    videoThumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    size: '342.1 MB',
    downloads: '8,950',
    tags: ['Python', 'Sandbox', 'Data'],
    assets: ['image.tar.gz', 'config.json', 'scripts/init.py'],
    dependencies: [{ id: 'docker', name: { 'zh-CN': 'Docker 引擎', 'en-US': 'Docker Engine' }, required: true }],
    author: 'Sandbox Lab',
  },
  {
    id: 'cyber-neko',
    type: 'pet',
    name: { 'zh-CN': '赛博电子猫 Cyber Neko', 'en-US': 'Cyber Neko Desktop Pet' },
    version: '1.0.5',
    description: {
      'zh-CN': '常驻桌面右下角的交互式电子宠物，能根据系统 CPU 负载展示不同状态。',
      'en-US': 'An interactive desktop pet that changes state based on system CPU load.',
    },
    readmeTitle: { 'zh-CN': '会呼吸、会感知系统状态的赛博桌面萌宠', 'en-US': 'A responsive desktop companion that reacts to system state' },
    readme: {
      'zh-CN': '陪伴型桌面宠物，支持多种交互动作与状态感知。通过读取系统负载，展示睡觉、奔跑、打盹等多种萌态，为编码生活增添趣味。支持自定义皮肤和音效，是极客桌面的完美伴侣。',
      'en-US': 'A lightweight desktop companion with multiple interactions and system-aware states, custom skins, and sound effects.',
    },
    features: {
      'zh-CN': ['根据系统 CPU/内存负载实时切换动画状态', '支持鼠标拖拽、点击抚摸等多种趣味交互', '超轻量级渲染，内存占用低于 15MB', '支持创意工坊，海量皮肤一键替换'],
      'en-US': ['Switches animation state from CPU and memory load', 'Drag and click interactions', 'Under 15MB memory usage', 'Workshop skins and sound packs'],
    },
    screenshot: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    videoThumb: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    size: '4.5 MB',
    downloads: '42,100',
    tags: ['Desktop', 'Pet', 'Widget'],
    assets: ['pet.json', 'pet-idle.png', 'pet-run.gif', 'sounds/meow.mp3'],
    dependencies: [{ id: 'agent-platform', name: { 'zh-CN': 'ZenMind 智能体底座', 'en-US': 'ZenMind Agent Platform' }, required: true }],
    author: 'PixelArt Studio',
  },
  {
    id: 'rust-ripgrep',
    type: 'cli-tool',
    name: { 'zh-CN': 'ripgrep 高性能文本检索工具', 'en-US': 'ripgrep High-performance Text Search' },
    version: '13.0.0',
    description: {
      'zh-CN': '全球最快的文本搜索 CLI 工具，Desktop 深度集成其检索能力。',
      'en-US': 'A fast text-search CLI tool deeply integrated with Desktop search.',
    },
    readmeTitle: { 'zh-CN': '地表最快的文本检索利器 - ripgrep', 'en-US': 'A very fast text search engine for local code' },
    readme: {
      'zh-CN': '高性能文本搜索工具。本组件不进行自动静默安装，而是提供标准 CLI 托管安装计划、SHA256 校验以及本机环境检测。深度适配 ZenMind 搜索内核，搜索百万行代码仅需毫秒级。',
      'en-US': 'A high-performance text search tool with managed install plans, SHA256 verification, and local environment detection.',
    },
    features: {
      'zh-CN': ['基于 Rust 编写，多线程并发检索，速度超越 grep/ack', '自动尊重 .gitignore 规则，智能过滤非代码文件', '完美支持 Unicode 编码与多种正则表达式语法', '深度适配 ZenMind 全局搜索框，提供底层检索驱动'],
      'en-US': ['Rust-based multithreaded search', 'Respects .gitignore automatically', 'Unicode and regex support', 'Powers ZenMind global search'],
    },
    screenshot: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80',
    videoThumb: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80',
    size: '3.1 MB',
    downloads: '56,210',
    tags: ['CLI', 'Search', 'Rust'],
    assets: ['install.sh', 'rg.exe', 'rg.1', 'complete/rg.bash'],
    dependencies: [{ id: 'git', name: { 'zh-CN': 'Git 命令行工具', 'en-US': 'Git CLI' }, required: false }],
    author: 'BurntSushi',
  },
  {
    id: 'excalidraw-local',
    type: 'website-app',
    name: { 'zh-CN': 'Excalidraw 离线手绘板', 'en-US': 'Excalidraw Offline Whiteboard' },
    version: '1.8.0',
    description: {
      'zh-CN': '本地运行的极简手绘板应用，由 Desktop Websites Runtime 托管启动。',
      'en-US': 'A local-first sketch whiteboard hosted by Desktop Websites Runtime.',
    },
    readmeTitle: { 'zh-CN': '100% 本地运行的手绘风格白板', 'en-US': 'A 100% local sketch-style whiteboard' },
    readme: {
      'zh-CN': '完全本地沙箱运行的 Excalidraw，数据 100% 留存在本地。解压至 websites root 并由内置 Web 服务器启动，支持离线导出与云端加密同步。手绘风格，让您的架构图和原型设计更具艺术感。',
      'en-US': 'A fully local Excalidraw app that keeps data on device, runs from the websites root, and supports offline export.',
    },
    features: {
      'zh-CN': ['完全本地离线运行，数据绝不上云，保障隐私安全', '经典手绘风、像素风、极简线框图多种风格随心切换', '支持一键导出为 PNG, SVG 以及专属的 .excalidraw 格式', '内置高并发本地协作服务器，局域网内秒级联机协作'],
      'en-US': ['Runs fully offline with local data', 'Sketch, pixel, and wireframe styles', 'Exports PNG, SVG, and .excalidraw', 'Local collaboration server for LAN sessions'],
    },
    screenshot: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    videoThumb: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
    size: '12.4 MB',
    downloads: '15,300',
    tags: ['Draw', 'Local-First', 'Web'],
    assets: ['website.json', 'dist.zip', 'assets/logo.png'],
    dependencies: [{ id: 'node', name: { 'zh-CN': 'Node.js 运行时', 'en-US': 'Node.js Runtime' }, required: true }],
    author: 'Excalidraw Org',
  },
];

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
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('popular');
  const [theme, setTheme] = useState(initialTheme);
  const [locale, setLocale] = useState(initialLocale);
  const [localEnv, setLocalEnv] = useState(initialEnv);
  const [installedItems, setInstalledItems] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [dependencyItemId, setDependencyItemId] = useState('');
  const [terminalState, setTerminalState] = useState(null);
  const [toast, setToast] = useState(null);
  const [isPublishOpen, setPublishOpen] = useState(false);
  const [isEnvSettingsOpen, setEnvSettingsOpen] = useState(false);
  const [publishedItems, setPublishedItems] = useState([]);

  const t = translations[locale];

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
    let cancelled = false;
    setStatus('loading');
    fetch(`${apiBase}/catalog`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setApiItems(Array.isArray(data.items) ? data.items : []);
          setStatus('ready');
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setApiItems([]);
          setError(reason instanceof Error ? reason.message : String(reason));
          setStatus('fallback');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = useMemo(() => {
    const sampleByKey = new Map(sampleItems.map((item) => [`${item.type}:${item.id}`, item]));
    const normalizedApi = apiItems.map((item) => mergeCatalogItem(item, sampleByKey.get(`${normalizeType(item.type)}:${item.id}`)));
    const seen = new Set(normalizedApi.map((item) => `${item.type}:${item.id}`));
    const missingSamples = sampleItems.filter((item) => !seen.has(`${item.type}:${item.id}`));
    return [...publishedItems, ...normalizedApi, ...missingSamples];
  }, [apiItems, publishedItems]);

  const categoryCounts = useMemo(() => {
    const counts = { all: catalog.length };
    for (const type of canonicalTypes) counts[type] = catalog.filter((item) => item.type === type).length;
    return counts;
  }, [catalog]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = catalog.filter((item) => {
      if (activeCategory !== 'all' && item.type !== activeCategory) return false;
      if (!needle) return true;
      return [
        item.id,
        localized(item.name, locale),
        localized(item.description, locale),
        item.author,
        ...(item.tags || []),
      ].join(' ').toLowerCase().includes(needle);
    });
    return [...result].sort((a, b) => {
      if (sortMode === 'latest') return String(b.version).localeCompare(String(a.version));
      if (sortMode === 'rating') return localized(a.name, locale).localeCompare(localized(b.name, locale));
      return parseDownloads(b.downloads) - parseDownloads(a.downloads);
    });
  }, [activeCategory, catalog, locale, query, sortMode]);

  const currentCategoryName = activeCategory === 'all' ? t.all : t.categories[activeCategory];
  const dependencyItem = catalog.find((item) => item.id === dependencyItemId);
  const brandTitle = localized(marketBrand.name, locale);

  function notify(message, tone = 'info') {
    const id = window.setTimeout(() => setToast(null), 3000);
    setToast({ message, tone, id });
  }

  function toggleEnv(key) {
    setLocalEnv((current) => ({ ...current, [key]: !current[key] }));
    notify(t.envToggled(key));
  }

  function openDetails(item) {
    setSelected(item);
    setVideoPlaying(false);
  }

  function closeDetails() {
    setSelected(null);
    setVideoPlaying(false);
  }

  function openDependencyFlow(itemId) {
    setDependencyItemId(itemId);
  }

  function closeDependencyFlow() {
    setDependencyItemId('');
  }

  function triggerDependencyInstall(depId) {
    const dep = dependencyMeta[depId] || {
      name: depId,
      type: 'dependency',
      version: 'latest',
      size: '12.0 MB',
      assets: [`bin/${depId}`],
    };
    closeDependencyFlow();
    const depName = localized(dep.name, locale);
    streamTerminal({
      title: `zenmind-installer --install-dependency ${depId} --verbose`,
      initialStatus: t.initDependency(depName),
      lines: generateDependencyLogs(depId, dep, locale),
      statusForProgress: (pct) => {
        if (pct < 30) return t.downloadDependency(dep.size);
        if (pct < 60) return t.unpackDependency;
        if (pct < 90) return t.verifyDependency;
        return t.refreshDependency;
      },
      speed: 92,
      closeLabel: t.returnDeps,
      onComplete: () => {
        setLocalEnv((current) => ({ ...current, [depId]: true }));
        notify(t.depSuccess(depName), 'success');
      },
      onClose: () => {
        setTerminalState(null);
        if (dependencyItemId) openDependencyFlow(dependencyItemId);
      },
    });
  }

  function triggerInstall(itemId) {
    const item = catalog.find((entry) => entry.id === itemId);
    if (!item) return;
    const missing = getMissingDependencies(item, localEnv);
    if (missing.length) {
      openDependencyFlow(item.id);
      return;
    }
    const itemName = localized(item.name, locale);
    closeDetails();
    closeDependencyFlow();
    streamTerminal({
      title: `zenmind-installer --install ${item.id} --verbose`,
      initialStatus: t.initInstall,
      lines: generateInstallLogs(item, locale),
      statusForProgress: (pct) => {
        if (pct < 30) return t.downloadAssets;
        if (pct < 60) return t.verifyAssets;
        if (pct < 90) return t.registerAssets;
        return t.finalInstall;
      },
      speed: 105,
      closeLabel: t.complete,
      onComplete: () => {
        setInstalledItems((current) => new Set([...current, item.id]));
        notify(t.installSuccess(itemName), 'success');
      },
      onClose: () => setTerminalState(null),
    });
  }

  function streamTerminal({ title, initialStatus, lines, statusForProgress, speed, closeLabel, onComplete, onClose }) {
    setTerminalState({
      title,
      logs: [],
      progress: 0,
      status: initialStatus,
      canClose: false,
      closeLabel: t.wait,
      onClose: () => setTerminalState(null),
    });
    let index = 0;
    const interval = window.setInterval(() => {
      if (index < lines.length) {
        const pct = Math.floor(((index + 1) / lines.length) * 100);
        const line = lines[index];
        setTerminalState((current) => current ? {
          ...current,
          logs: [...current.logs, line],
          progress: pct,
          status: statusForProgress(pct),
        } : current);
        index += 1;
        return;
      }
      window.clearInterval(interval);
      onComplete?.();
      setTerminalState((current) => current ? {
        ...current,
        progress: 100,
        status: t.installDone,
        canClose: true,
        closeLabel,
        onClose,
      } : current);
    }, speed);
  }

  function closeTerminal() {
    if (!terminalState?.canClose) return;
    terminalState.onClose?.();
  }

  function uninstallItem(itemId) {
    const item = catalog.find((entry) => entry.id === itemId);
    setInstalledItems((current) => {
      const next = new Set(current);
      next.delete(itemId);
      return next;
    });
    if (item) notify(t.uninstallSuccess(localized(item.name, locale)));
  }

  function handlePublish(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = normalizeType(form.get('type'));
    const id = String(form.get('id') || '').trim().toLowerCase();
    const name = String(form.get('name') || '').trim();
    const version = String(form.get('version') || '').trim() || '1.0.0';
    const description = String(form.get('description') || '').trim();
    if (!id || catalog.some((item) => item.id === id)) {
      notify(t.duplicate(id || 'unknown'), 'error');
      return;
    }
    const dependencies = [{ id: 'agent-platform', name: dependencyMeta['agent-platform'].name, required: true }];
    if (type === 'sandbox-image') dependencies.push({ id: 'docker', name: dependencyMeta.docker.name, required: true });
    if (type === 'plugin' || type === 'website-app') dependencies.push({ id: 'node', name: dependencyMeta.node.name, required: true });
    if (type === 'agent') dependencies.push({ id: 'model-runtime', name: dependencyMeta['model-runtime'].name, required: true });
    const newItem = {
      id,
      type,
      name: { 'zh-CN': name || id, 'en-US': name || id },
      version,
      description: { 'zh-CN': description, 'en-US': description },
      readmeTitle: { 'zh-CN': `自定义发布组件: ${name || id}`, 'en-US': `Custom published component: ${name || id}` },
      readme: {
        'zh-CN': `这是由本地开发者成功发布至 ${t.categories[type]} 的自定义组件。支持完整的安全沙箱隔离与依赖自愈流程。`,
        'en-US': `This custom component was published locally to ${translations['en-US'].categories[type]}. It supports sandbox checks and dependency self-healing.`,
      },
      features: {
        'zh-CN': ['开发者自定义发布制品', '自动关联系统级依赖项', '支持完整的控制台日志安装模拟'],
        'en-US': ['Developer-published artifact', 'Automatically links system dependencies', 'Terminal-style install simulation'],
      },
      screenshot: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80',
      videoThumb: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80',
      size: '14.2 MB',
      downloads: '1',
      tags: ['Custom', type.toUpperCase()],
      assets: type === 'agent' ? ['agent.yml', 'prompts/system.md', 'tools.json'] : ['manifest.json', 'index.js', 'README.md'],
      dependencies,
      author: 'Local Developer',
    };
    setPublishedItems((current) => [newItem, ...current]);
    setActiveCategory(type);
    setPublishOpen(false);
    event.currentTarget.reset();
    notify(t.publishSuccess(name || id), 'success');
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
          <button className="publish-button" type="button" onClick={() => setPublishOpen(true)}>
            <Plus size={15} />
            <span>{t.publish}</span>
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-main">
            <section>
              <h3>{t.categoriesTitle}</h3>
              <nav className="category-nav" aria-label={t.categoriesTitle}>
                {categoryMeta.map((category) => {
                  const Icon = category.icon;
                  const active = activeCategory === category.id;
                  return (
                    <button key={category.id} className={active ? 'category-button is-active' : 'category-button'} type="button" onClick={() => setActiveCategory(category.id)}>
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

          {status === 'loading' ? <StateNotice title={t.loadingTitle} body={t.loadingBody} /> : null}
          {status === 'fallback' ? <StateNotice tone="warning" title={t.fallbackTitle} body={`${t.fallbackBody} ${error ? `(${error})` : ''}`} /> : null}

          <div className="catalog-scroll">
            {filtered.length ? (
              <div className="catalog-grid">
                {filtered.map((item) => (
                  <MarketCard
                    key={`${item.type}:${item.id}`}
                    item={item}
                    locale={locale}
                    t={t}
                    installed={installedItems.has(item.id)}
                    missingDependencies={getMissingDependencies(item, localEnv)}
                    onDetails={() => openDetails(item)}
                    onInstall={() => triggerInstall(item.id)}
                    onInstallDeps={() => openDependencyFlow(item.id)}
                    onUninstall={() => uninstallItem(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <PackageOpen size={34} />
                <strong>{t.emptyTitle}</strong>
                <span>{t.emptyBody}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {selected ? (
        <DetailModal
          item={selected}
          locale={locale}
          t={t}
          localEnv={localEnv}
          installed={installedItems.has(selected.id)}
          videoPlaying={videoPlaying}
          onToggleVideo={() => setVideoPlaying((value) => !value)}
          onClose={closeDetails}
          onInstall={() => triggerInstall(selected.id)}
          onInstallDeps={() => {
            closeDetails();
            openDependencyFlow(selected.id);
          }}
          onUninstall={() => uninstallItem(selected.id)}
        />
      ) : null}

      {dependencyItem ? (
        <DependencyModal
          item={dependencyItem}
          locale={locale}
          t={t}
          localEnv={localEnv}
          onClose={closeDependencyFlow}
          onInstallDependency={triggerDependencyInstall}
          onProceed={() => triggerInstall(dependencyItem.id)}
        />
      ) : null}

      <button className="env-floating-button" type="button" onClick={() => setEnvSettingsOpen(true)} title={t.envTitle} aria-label={t.envTitle}>
        <SlidersHorizontal size={17} />
      </button>
      {isEnvSettingsOpen ? (
        <EnvSettingsDialog
          t={t}
          localEnv={localEnv}
          onClose={() => setEnvSettingsOpen(false)}
          onToggleEnv={toggleEnv}
        />
      ) : null}
      {terminalState ? <TerminalModal state={terminalState} t={t} onClose={closeTerminal} /> : null}
      {isPublishOpen ? <PublishModal t={t} onClose={() => setPublishOpen(false)} onSubmit={handlePublish} /> : null}
      {toast ? <Toast toast={toast} /> : null}
    </main>
  );
}

function MarketCard({ item, locale, t, installed, missingDependencies, onDetails, onInstall, onInstallDeps, onUninstall }) {
  const hasMissingDeps = missingDependencies.length > 0;
  return (
    <article className="market-card">
      <div className="card-body">
        <div className="card-kicker">
          <span>{displayType(item.type, t)}</span>
          <small className={hasMissingDeps ? 'status-warning' : 'status-ready'}>
            <span />
            {hasMissingDeps ? t.missingDeps : t.ready}
          </small>
        </div>
        <div>
          <h2>
            {localized(item.name, locale)}
            <span>v{item.version}</span>
          </h2>
          <p>{localized(item.description, locale) || t.noDescription}</p>
        </div>
        <div className="tag-row">
          {(item.tags || []).slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      </div>
      <footer>
        <button className="link-button" type="button" onClick={onDetails}>
          <span>{t.details}</span>
          <ArrowRight size={13} />
        </button>
        {installed ? (
          <button className="secondary-action" type="button" onClick={onUninstall}>{t.uninstall}</button>
        ) : hasMissingDeps ? (
          <button className="dependency-action" type="button" onClick={onInstallDeps}>
            <ShieldAlert size={14} />
            <span>{t.installDeps}</span>
          </button>
        ) : (
          <button className="primary-action" type="button" onClick={onInstall}>{t.install}</button>
        )}
      </footer>
    </article>
  );
}

function DetailModal({ item, locale, t, localEnv, installed, videoPlaying, onToggleVideo, onClose, onInstall, onInstallDeps, onUninstall }) {
  const Icon = categoryMeta.find((category) => category.id === item.type)?.icon || PackageOpen;
  const missing = getMissingDependencies(item, localEnv);
  const deps = item.dependencies || [];
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-modal" role="dialog" aria-modal="true" aria-label={localized(item.name, locale)} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        <div className="detail-grid">
          <section className="detail-main">
            <div className="media-panel">
              <img src={item.screenshot} alt="" />
            </div>
            <button className="video-panel" type="button" onClick={onToggleVideo}>
              <img src={item.videoThumb} alt="" />
              {videoPlaying ? <span className="video-running">{t.videoPlaying}</span> : <span className="play-overlay"><Play size={26} fill="currentColor" /></span>}
            </button>
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
              <span>{t.developer}: {item.author || 'ZenMind'}</span>
              <span>{t.size}: {item.size || formatAssetSize(item)}</span>
              <span>{t.downloads}: {item.downloads || '1,200'}</span>
            </div>

            <section className="side-section">
              <h3>{t.dependencies}</h3>
              <div className="dependency-list">
                {deps.length ? deps.map((dep) => {
                  const key = dependencyKey(dep);
                  const ready = localEnv[key] === true;
                  return (
                    <div className="dep-row" key={`${key}:${dep.name || dep.displayName || dep.kind}`}>
                      <span className={ready ? 'dep-dot ready' : dep.required ? 'dep-dot warn' : 'dep-dot optional'} />
                      <strong>{localized(dep.name || dep.displayName || key, locale)}</strong>
                      <small>{ready ? t.depReady : dep.required ? t.depRequired : t.depOptional}</small>
                    </div>
                  );
                }) : <p className="empty-detail">{t.noDependencies}</p>}
              </div>
            </section>

            <section className="side-section">
              <h3>{t.assets}</h3>
              <div className="asset-tree">
                {(assetList(item) || []).map((asset) => {
                  const isDir = asset.includes('/');
                  const AssetIcon = isDir ? Folder : File;
                  return (
                    <div key={asset}>
                      <AssetIcon size={14} />
                      <span>{asset}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="detail-action">
              {installed ? (
                <button className="secondary-action wide" type="button" onClick={onUninstall}>{t.uninstallComponent}</button>
              ) : missing.length ? (
                <button className="dependency-action wide" type="button" onClick={onInstallDeps}>
                  <ShieldAlert size={16} />
                  <span>{t.installRequiredDeps(missing.length)}</span>
                </button>
              ) : (
                <button className="primary-action wide" type="button" onClick={onInstall}>
                  <Download size={16} />
                  <span>{t.oneClickComponent}</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function DependencyModal({ item, locale, t, localEnv, onClose, onInstallDependency, onProceed }) {
  const dependencies = item.dependencies || [];
  const missingRequired = getMissingDependencies(item, localEnv);
  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={onClose}>
      <section className="dependency-modal" role="dialog" aria-modal="true" aria-label={t.dependencyTitle} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{t.dependencyTitle}</h2>
            <p>{localized(item.name, locale)} · {t.dependencyBody}</p>
          </div>
          <button className="modal-close inline" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        </div>
        <div className="dependency-install-list">
          {dependencies.length ? dependencies.map((dep) => {
            const key = dependencyKey(dep);
            const ready = localEnv[key] === true;
            const required = dep.required === true;
            const StatusIcon = ready ? CheckCircle2 : AlertCircle;
            const statusText = ready ? t.depReady : required ? t.depMissing : t.depOptionalMissing;
            return (
              <div className={`dependency-install-row ${ready ? 'is-ready' : required ? 'is-missing' : 'is-optional-missing'}`} key={key}>
                <div>
                  <StatusIcon size={17} />
                  <span>
                    <strong>{localized(dep.name || dependencyMeta[key]?.name || key, locale)}</strong>
                    <small>ID: {key} · {required ? t.depRequired : t.depOptional}</small>
                  </span>
                </div>
                {ready || !required ? (
                  <span className="dependency-status">{statusText}</span>
                ) : (
                  <button type="button" onClick={() => onInstallDependency(key)}>{t.oneClickInstall}</button>
                )}
              </div>
            );
          }) : <p className="empty-detail">{t.noDependencies}</p>}
        </div>
        <footer className="modal-actions">
          <button className="secondary-action" type="button" onClick={onClose}>{t.cancel}</button>
          <button className="primary-action" type="button" disabled={missingRequired.length > 0} onClick={onProceed}>{t.proceedInstall}</button>
        </footer>
      </section>
    </div>
  );
}

function EnvSettingsDialog({ t, localEnv, onClose, onToggleEnv }) {
  return (
    <div className="env-dialog-layer" role="presentation" onMouseDown={onClose}>
      <section className="env-dialog" role="dialog" aria-modal="true" aria-label={t.envTitle} onMouseDown={(event) => event.stopPropagation()}>
        <div className="env-heading">
          <h3>{t.envTitle}</h3>
          <span>{t.envBadge}</span>
        </div>
        <p>{t.envDescription}</p>
        <div className="env-list">
          {Object.entries(localEnv).map(([key, value]) => (
            <div className="env-row" key={key}>
              <span>{key}</span>
              <button className={value ? 'switch is-on' : 'switch'} type="button" onClick={() => onToggleEnv(key)} aria-pressed={value}>
                <span />
              </button>
            </div>
          ))}
        </div>
        <button className="modal-close inline env-dialog-close" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
      </section>
    </div>
  );
}

function TerminalModal({ state, t, onClose }) {
  return (
    <div className="terminal-backdrop">
      <section className="terminal-modal" role="dialog" aria-modal="true" aria-label={state.title}>
        <header>
          <div className="traffic-lights"><span /><span /><span /></div>
          <strong>{state.title}</strong>
          <small>{t.terminalShell}</small>
        </header>
        <div className="terminal-log">
          {state.logs.map((line, index) => <p className={logClass(line)} key={`${line}:${index}`}>{line}</p>)}
          {!state.canClose ? <p className="cursor-line"> </p> : null}
        </div>
        <footer>
          <div className="progress-wrap">
            <div className="progress-meta">
              <span>{state.status}</span>
              <span>{state.progress}%</span>
            </div>
            <div className="progress-track"><span style={{ width: `${state.progress}%` }} /></div>
          </div>
          <button type="button" disabled={!state.canClose} onClick={onClose}>{state.closeLabel}</button>
        </footer>
      </section>
    </div>
  );
}

function PublishModal({ t, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal" role="dialog" aria-modal="true" aria-label={t.publishTitle} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{t.publishTitle}</h2>
            <p>{t.publishBody}</p>
          </div>
          <button className="modal-close inline" type="button" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        </div>
        <form className="publish-form" onSubmit={onSubmit}>
          <label>
            <span>{t.type}</span>
            <select name="type" defaultValue="agent">
              {canonicalTypes.map((type) => <option value={type} key={type}>{t.categories[type]}</option>)}
            </select>
          </label>
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
          <label className="full">
            <span>{t.description}</span>
            <textarea name="description" rows="4" required />
          </label>
          <footer className="modal-actions">
            <button className="secondary-action" type="button" onClick={onClose}>{t.cancel}</button>
            <button className="primary-action" type="submit">
              <Upload size={15} />
              <span>{t.publishSubmit}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function StateNotice({ title, body, tone = 'neutral' }) {
  return (
    <div className={`state-notice is-${tone}`}>
      {tone === 'warning' ? <AlertCircle size={16} /> : <Info size={16} />}
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

function mergeCatalogItem(apiItem, sample) {
  const type = normalizeType(apiItem.type);
  const assets = apiItem.assets && Object.keys(apiItem.assets).length
    ? Object.entries(apiItem.assets).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'} ${formatBytes(asset.sizeBytes)}`)
    : sample?.assets;
  const dependencies = apiItem.dependencies?.length ? apiItem.dependencies.map((dep) => ({
    ...dep,
    id: dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
    name: dep.displayName || dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind,
  })) : sample?.dependencies;
  return {
    ...(sample || {}),
    ...apiItem,
    type,
    name: apiItem.name || sample?.name,
    description: apiItem.description || sample?.description,
    readme: apiItem.readme || sample?.readme,
    tags: apiItem.tags?.length ? apiItem.tags : sample?.tags || [],
    assets: assets || [],
    dependencies: dependencies || [],
    screenshot: apiItem.metadata?.screenshot || sample?.screenshot || sampleItems[0].screenshot,
    videoThumb: apiItem.metadata?.videoThumb || sample?.videoThumb || sampleItems[0].videoThumb,
    author: apiItem.metadata?.author || sample?.author || 'ZenMind',
    size: sample?.size || formatAssetSize(apiItem),
    downloads: sample?.downloads || '1,200',
  };
}

function normalizeType(type) {
  if (type === 'webapps' || type === 'webapp' || type === 'website' || type === 'website-apps') return 'website-app';
  if (type === 'agents') return 'agent';
  return canonicalTypes.includes(type) ? type : 'skill';
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

function dependencyKey(dep) {
  return dep.id || dep.serviceId || dep.command || dep.runtime || dep.capability || dep.kind || 'unknown';
}

function getMissingDependencies(item, localEnv) {
  return (item.dependencies || []).filter((dep) => dep.required && localEnv[dependencyKey(dep)] !== true);
}

function assetList(item) {
  if (Array.isArray(item.assets)) return item.assets;
  return Object.entries(item.assets || {}).map(([platform, asset]) => `${platform}/${asset.archiveType || 'artifact'}`);
}

function formatAssetSize(item) {
  const values = Object.values(item.assets || {});
  if (!values.length || !values[0]?.sizeBytes) return '12.4 MB';
  return formatBytes(values.reduce((sum, asset) => sum + (asset.sizeBytes || 0), 0));
}

function formatBytes(value) {
  if (!value) return 'size unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function parseDownloads(value) {
  return Number(String(value || '0').replace(/[^0-9]/g, '')) || 0;
}

function logClass(line) {
  if (line.startsWith('[ERROR]')) return 'is-error';
  if (line.startsWith('[SUCCESS]') || line.includes('successfully')) return 'is-success';
  if (line.startsWith('[WARN]')) return 'is-warning';
  if (line.startsWith('$')) return 'is-command';
  return '';
}

function generateDependencyLogs(depId, dep, locale) {
  const name = localized(dep.name, locale);
  return [
    `$ zenmind-installer dependency install ${depId}@${dep.version}`,
    `[INFO] Target dependency: ${name}`,
    `[INFO] Package size: ${dep.size}`,
    `[INFO] Fetching from official mirrors...`,
    `$ curl -L https://mirrors.zenmind.io/deps/${depId}-${dep.version}.tar.gz -o /tmp/${depId}.tar.gz`,
    `[INFO] Download progress: 10% .. 45% .. 80% .. 100%`,
    `[SUCCESS] Download completed. MD5 checksum verified.`,
    `[INFO] Extracting payload to system directory...`,
    `$ tar -C /usr/local/zenmind/deps/ -zxvf /tmp/${depId}.tar.gz`,
    ...dep.assets.map((asset) => `  > Extracting: ${asset}`),
    `[INFO] Linking binaries to system environment PATH...`,
    `$ ln -sf /usr/local/zenmind/deps/${depId}/${dep.assets[0]} /usr/local/bin/${depId}`,
    `[INFO] Verifying installation via CLI execution...`,
    `$ ${depId} --version`,
    `  >> ${name} version ${dep.version} (stable)`,
    `[SUCCESS] Environment variables updated. Path linked successfully.`,
    `[INFO] Cleaning up installer cache...`,
    `$ rm -f /tmp/${depId}.tar.gz`,
    `[SUCCESS] Dependency [${name}] is now fully operational.`,
  ];
}

function generateInstallLogs(item, locale) {
  const assets = assetList(item);
  const commonStart = [
    `$ zenmind-installer install ${item.id}@${item.version}`,
    `[INFO] Resolving package manifest from remote registry...`,
    `[INFO] Found package: ${item.id} (${item.version})`,
    `[INFO] Archive type: ${item.type === 'skill' ? 'skill' : item.type === 'plugin' ? 'zip' : item.type === 'agent' ? 'agent' : 'tar.gz'}`,
    `[INFO] Downloading assets: [${assets.join(', ')}]`,
    `$ curl -s https://registry.zenmind.io/v1/download/${item.id}-${item.version}.pkg -o /tmp/${item.id}.pkg`,
    `[INFO] Download completed. Size: ${item.size || '12.4 MB'}. Speed: 4.5 MB/s`,
    `[INFO] Verifying package integrity...`,
    `[SUCCESS] SHA256 Checksum matched: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
  ];
  const byType = {
    skill: [
      `[INFO] Extracting Skill manifest...`,
      `$ tar -zxvf /tmp/${item.id}.pkg -C /home/zenmind/skills/`,
      `  > SKILL.md`,
      `  > skill.json`,
      `[WARN] Security policy: This component has NO execution script permissions.`,
      `[INFO] Registering Skill with ZenMind Agent Platform...`,
      `[SUCCESS] Skill registered successfully under namespace: user.skills.${item.id}`,
    ],
    plugin: [
      `[INFO] Extracting Plugin package...`,
      `$ unzip /tmp/${item.id}.pkg -d /home/zenmind/plugins/${item.id}`,
      `  > manifest.json`,
      `  > index.js`,
      `  > lifecycle-hook.sh`,
      `[INFO] Executing package lifecycle script: deploy...`,
      `$ bash /home/zenmind/plugins/${item.id}/lifecycle-hook.sh --deploy`,
      `[SUCCESS] Plugin connected to Service Manager successfully.`,
    ],
    agent: [
      `[INFO] Extracting Agent definition...`,
      `$ tar -zxvf /tmp/${item.id}.pkg -C /home/zenmind/agents/${item.id}`,
      `  > agent.yml`,
      `  > prompts/system.md`,
      `[INFO] Validating agent routing and model runtime requirements...`,
      `[INFO] Registering Agent with ZenMind Agent Platform...`,
      `[SUCCESS] Agent registered successfully under namespace: user.agents.${item.id}`,
    ],
    'sandbox-image': [
      `[INFO] Loading container image archive...`,
      `$ docker load -i /tmp/${item.id}.pkg`,
      `  >> Loaded image: zenmind/sandbox-${item.id}:${item.version}`,
      `[INFO] Creating container sandbox environment...`,
      `$ docker run --d --name zm-sandbox-${item.id} zenmind/sandbox-${item.id}:${item.version}`,
      `[SUCCESS] Sandbox container created and verified.`,
    ],
    pet: [
      `[INFO] Extracting Pet assets...`,
      `$ unzip /tmp/${item.id}.pkg -d /home/zenmind/pets/${item.id}`,
      `  > pet.json`,
      `  > pet-idle.png`,
      `[INFO] Initializing Pet overlay renderer...`,
      `[SUCCESS] Pet successfully loaded into desktop overlay layer.`,
    ],
    'cli-tool': [
      `[INFO] Extracting binary executable...`,
      `$ tar -zxvf /tmp/${item.id}.pkg -C /usr/local/bin/`,
      `  > ${item.id}`,
      `$ chmod +x /usr/local/bin/${item.id}`,
      `$ ${item.id} --version`,
      `  >> ${item.id} version ${item.version}`,
      `[SUCCESS] CLI tool successfully linked to system PATH.`,
    ],
    'website-app': [
      `[INFO] Extracting web assets...`,
      `$ unzip /tmp/${item.id}.pkg -d /home/zenmind/websites/${item.id}`,
      `  > website.json`,
      `  > index.html`,
      `[INFO] Registering local route with Websites Runtime...`,
      `[SUCCESS] WebApp registered. Local URL: http://localhost:8080/apps/${item.id}`,
    ],
  };
  return [
    ...commonStart,
    ...(byType[item.type] || byType.skill),
    `[INFO] Cleaning up temporary installation files...`,
    `$ rm -rf /tmp/${item.id}.pkg`,
    `[SUCCESS] Installation of ${item.id} finished successfully.`,
    `[INFO] ${localized(item.name, locale)} is ready.`,
  ];
}
