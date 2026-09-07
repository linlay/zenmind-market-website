import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  Heart,
  Lightbulb,
  ListChecks,
  MessageSquare,
  PackageOpen,
  Search,
  ShieldCheck,
  Upload,
  User,
} from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { marketBasePath } from '../domain/runtimeBase';

type UserManualPageProps = {
  onClose: () => void;
};

type Callout = {
  number: number;
  label: string;
  x: string;
  y: string;
};

const manualPages = [
  { key: 'start', path: '/guide', number: '首页', label: '第一次使用' },
  { key: 'market', path: '/guide/market', number: '01', label: '市场使用' },
  { key: 'publishing', path: '/guide/publishing', number: '02', label: '组件发布' },
  { key: 'creator', path: '/guide/creator', number: '03', label: '创作者中心' },
  { key: 'review', path: '/guide/review', number: '04', label: '审核与管理' },
  { key: 'faq', path: '/guide/faq', number: '05', label: '常见问题' },
] as const;

const publishPages = [
  { key: 'overview', path: '/guide/publishing', number: '2.0', label: '发布总览' },
  { key: 'general', path: '/guide/publishing/general', number: '2.1', label: '通用发布流程' },
  { key: 'skills', path: '/guide/publishing/skills', number: '2.2', label: '单项技能与技能包' },
  { key: 'components', path: '/guide/publishing/components', number: '2.3', label: '各类组件发布须知' },
  { key: 'settings', path: '/guide/publishing/settings', number: '2.4', label: '平台、制品与权限' },
] as const;

const manualRoutePages = [
  manualPages[0],
  manualPages[1],
  ...publishPages,
  manualPages[3],
  manualPages[4],
  manualPages[5],
] as const;

const skillPageSections = [
  { id: 'manual-skill-fields', number: '01', label: '表单字段' },
  { id: 'manual-skill-file', number: '02', label: 'SKILL.md' },
  { id: 'manual-skill-metadata', number: '03', label: 'metadata' },
  { id: 'manual-skill-upload', number: '04', label: '本地 ZIP' },
  { id: 'manual-skill-repository', number: '05', label: 'GitHub/GitLab 导入' },
  { id: 'manual-skill-advanced', number: '06', label: '高级设置' },
  { id: 'manual-skill-package', number: '07', label: '技能包' },
] as const;

const componentRows = [
  ['单项技能', '可复用的一项工作能力', 'ZIP；根目录或子目录中包含 SKILL.md，且 metadata.version 与表单版本一致', '可从 GitHub / GitLab 导入；可附加 ADP'],
  ['技能包', '把多个已上架单项技能组合成套装', '至少选择 1 个已发布的单项技能', '系统生成组合下载，无需自行上传 ZIP'],
  ['智能体', '智能体定义和运行资源', 'ZIP；包含 agent.yml 或 agent.yaml', '适合完整角色或自动化工作流'],
  ['MCP', '向客户端提供工具和数据服务', '选择网关服务，或填写有效的 HTTP(S) 自定义地址', '下载的是 MCP 配置，不要求上传制品'],
  ['桌面宠物', '桌面宠物形象及动作资源', '资源包内包含 pet.json、pet-idle.png', '图片、配置文件名要准确'],
  ['CLI 工具', '在终端中使用的命令行程序', '制品可选；需要额外依赖时可上传 adp.yaml', '可填写安装、卸载、检测、版本命令'],
  ['网站应用', '本地运行的网站或外部网页入口', 'local-app 需要 webapp.json；external 需要有效 URL', '外部网站不要上传虚构压缩包'],
  ['软件依赖包', 'Python、Node.js 等运行依赖', 'ZIP 或 tar.gz', '应说明系统、架构、版本和安装方式'],
  ['插件（代码已支持）', '扩展宿主应用能力', 'ZIP；包含 manifest.json', '当前新发布入口与市场分类暂时隐藏'],
  ['沙箱（代码已支持）', '环境模板或容器镜像', 'environment.json 或 tar.gz', '当前新发布入口与市场分类暂时隐藏'],
];

function GuideImage({ src, alt, caption, callouts, lightSource = false, portrait = false }: { src: string; alt: string; caption: string; callouts: Callout[]; lightSource?: boolean; portrait?: boolean }) {
  return (
    <figure className={portrait ? 'manual-figure is-portrait' : 'manual-figure'}>
      <div className="manual-image-wrap">
        <img className={lightSource ? 'is-light-converted' : ''} src={`${marketBasePath}/manual/${src}`} alt={alt} loading="lazy" />
        {callouts.map((callout) => (
          <span
            className="manual-image-marker"
            style={{ left: callout.x, top: callout.y }}
            title={`${callout.number}. ${callout.label}`}
            aria-label={`${callout.number}. ${callout.label}`}
            key={callout.number}
          >
            {callout.number}
          </span>
        ))}
      </div>
      <figcaption>{caption}</figcaption>
      <ol className="manual-callout-list">
        {callouts.map((callout) => <li key={callout.number}><b>{callout.number}</b><span>{callout.label}</span></li>)}
      </ol>
    </figure>
  );
}

function StepList({ children }: { children: ReactNode }) {
  return <ol className="manual-steps">{children}</ol>;
}

function Note({ tone = 'tip', children }: { tone?: 'tip' | 'warning'; children: ReactNode }) {
  const Icon = tone === 'warning' ? AlertTriangle : Lightbulb;
  return <aside className={`manual-note is-${tone}`}><Icon size={18} /><div>{children}</div></aside>;
}

export function UserManualPage({ onClose }: UserManualPageProps) {
  const location = useLocation();
  const currentPage = manualPages.find((page) => (
    page.path === location.pathname
    || (page.key === 'publishing' && location.pathname.startsWith('/guide/publishing/'))
  )) || manualPages[0];
  const currentPublishPage = publishPages.find((page) => page.path === location.pathname) || publishPages[0];
  const currentRouteIndex = manualRoutePages.findIndex((page) => page.path === location.pathname);
  const previousPage = manualRoutePages[currentRouteIndex - 1];
  const nextPage = manualRoutePages[currentRouteIndex + 1];

  useEffect(() => {
    if (!location.hash) {
      document.querySelector<HTMLElement>('.manual-scroll')?.scrollTo?.({ top: 0 });
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  return (
    <section className="manual-page" aria-label="功能市场用户操作手册">
      <aside className="manual-toc">
        <div className="manual-toc-title"><BookOpen size={18} /><strong>操作手册</strong></div>
        <nav aria-label="手册目录">
          {manualPages.map((page) => (
            <div className={page.key === 'publishing' ? 'manual-toc-group' : ''} key={page.key}>
              <NavLink end={page.path === '/guide'} to={page.path} className={({ isActive }) => isActive ? 'is-active' : ''}><span>{page.number}</span>{page.label}</NavLink>
              {page.key === 'publishing' && currentPage.key === 'publishing' ? publishPages.map((child) => (
                <NavLink end className={({ isActive }) => isActive ? 'is-child is-active' : 'is-child'} to={child.path} key={child.key}>
                  <span>{child.number}</span>{child.label}
                </NavLink>
              )) : null}
            </div>
          ))}
        </nav>
        <button type="button" onClick={onClose}><ArrowLeft size={15} />返回刚才的页面</button>
      </aside>

      <main className="manual-scroll">
        <article className="manual-article">
          {currentPage.key === 'start' ? (
          <>
          <header className="manual-hero" id="manual-start">
            <div className="manual-eyebrow"><BookOpen size={15} /> 新手友好 · 覆盖全部角色与组件</div>
            <h1>功能市场用户操作手册</h1>
            <p>从“第一次打开页面”到“发布、审核和维护组件”的完整说明。你不需要懂开发，按步骤点击即可；遇到专业词，旁边都有解释。</p>
            <div className="manual-quick-cards">
              <Link to="/guide/market"><Search size={18} /><strong>我想找组件</strong><span>从首页浏览、搜索和筛选开始</span></Link>
              <Link to="/guide/publishing"><Upload size={18} /><strong>我想发布组件</strong><span>先准备材料，再提交两级审核</span></Link>
              <Link to="/guide/review"><ShieldCheck size={18} /><strong>我是审核人员</strong><span>查看检查项并作出审核决定</span></Link>
            </div>
          </header>

          <section className="manual-section">
            <h2>先认识你的权限</h2>
            <p>页面会根据登录状态和角色显示不同按钮。找不到某个入口时，先确认自己是否已经登录、是否具有对应角色。</p>
            <div className="manual-role-grid">
              <article><User size={18} /><h3>游客</h3><p>可搜索、分类浏览、查看详情和评论；不能收藏、评论、下载、发布或审核。</p></article>
              <article><Heart size={18} /><h3>登录用户</h3><p>可收藏、下载、复制一键安装命令、发表/编辑/删除自己的评论。</p></article>
              <article><Upload size={18} /><h3>创作者</h3><p>可发布组件、提交新版本、编辑展示信息、查看数据并管理自己的组件。</p></article>
              <article><ShieldCheck size={18} /><h3>安全审核人</h3><p>只处理安全审核节点，检查制品、依赖、哈希和安装协议。</p></article>
              <article><ListChecks size={18} /><h3>管理员</h3><p>完成业务审核；可下架版本、永久删除组件以及隐藏或恢复评论。</p></article>
            </div>
            <Note><strong>最短使用路径：</strong>左侧选分类 → 顶部搜索 → 点击卡片“详情” → 登录 → 选择平台 → 下载或一键安装。</Note>
          </section>
          </>
          ) : null}

          {currentPage.key === 'market' ? (
          <>
          <section className="manual-section" id="manual-home">
            <div className="manual-section-heading"><span>1.1</span><div><h2>市场首页：搜索、分类与排序</h2><p>首页是发现组件的入口，筛选条件可以叠加使用。</p></div></div>
            <GuideImage
              src="01-home-light.png"
              alt="功能市场首页界面"
              caption="图 1　首页主要操作区。圆点编号对应下方说明。"
              portrait
              callouts={[
                { number: 1, label: '全局搜索：按名称、ID、作者、介绍或标签查找，输入后即时筛选。', x: '50%', y: '7.5%' },
                { number: 2, label: '市场分类：点击后只看该类型；右侧数字是当前可见数量。', x: '25%', y: '22%' },
                { number: 3, label: '排序：可按热门、最新或名称排序；登录后还会显示“仅看我的收藏”。', x: '21%', y: '51%' },
                { number: 4, label: '组件卡片：查看名称、版本、作者、标签和平台，再点击“详情”。', x: '49%', y: '59%' },
                { number: 5, label: '顶部按钮：切换主题、语言和登录状态。登录后还会出现角色入口。', x: '84%', y: '3.5%' },
              ]}
            />
            <StepList>
              <li><strong>选分类。</strong><span>点击左侧“全部功能、技能、智能体、MCP、桌面宠物、CLI 工具、网站应用、软件依赖包”。进入技能后，还能用文档、数据、编程、浏览器、办公、内容、多媒体、搜索、系统、API、自动化等标签继续筛选。</span></li>
              <li><strong>输入关键词。</strong><span>搜索范围包含名称、组件 ID、作者、描述和标签。没有结果时，先清空搜索框，再切回“全部功能”。</span></li>
              <li><strong>选择排序。</strong><span>“热门推荐”优先显示下载量高的组件；“最新发布”按时间；“名称排序”按名称排列。</span></li>
              <li><strong>查看卡片。</strong><span>卡片展示名称、版本、作者、下载/收藏数、技能类型、标签和平台。登录后可直接点击心形收藏。</span></li>
            </StepList>
          </section>

          <section className="manual-section" id="manual-detail">
            <div className="manual-section-heading"><span>1.2</span><div><h2>详情、收藏、评论、下载与一键安装</h2><p>“详情”用于判断组件是否适合你；不要只看名称就直接安装。</p></div></div>
            <div className="manual-detail-grid">
              <article><PackageOpen size={18} /><h3>详情信息</h3><p>查看类型、版本、作者、发布时间、标签、README、核心特性、展示图和演示视频（若作者提供）。</p></article>
              <article><Download size={18} /><h3>平台与制品</h3><p>如果组件支持多个系统/架构，先选择 Windows、macOS 或 Linux 及 arm64/amd64，再核对文件类型与大小。</p></article>
              <article><CheckCircle2 size={18} /><h3>依赖与命令</h3><p>“必需”依赖不满足时可能无法运行；详情页会列出安装、卸载、检测和版本命令（若作者提供）。</p></article>
              <article><MessageSquare size={18} /><h3>评论</h3><p>登录后选择好评或差评，输入 5–1000 字。自己的评论可编辑或删除；游客只能阅读。</p></article>
            </div>
            <StepList>
              <li><strong>打开详情。</strong><span>点击卡片左下角“详情”。组件详情以弹窗显示，点击右上角关闭或弹窗外空白处返回。</span></li>
              <li><strong>确认平台。</strong><span>有平台下拉框时选择你的系统与架构。不了解架构：Apple 芯片 Mac 通常是 darwin-arm64；多数 Windows 电脑是 windows-amd64。</span></li>
              <li><strong>选择动作。</strong><span>显示“下载”时会下载对应平台制品；MCP 下载的是配置文件；技能包下载的是组合包。显示“一键安装”时，按钮会把 <code>adp install ...</code> 命令复制到剪贴板，需要到已安装 ADP 的终端中粘贴执行。</span></li>
              <li><strong>收藏或评论。</strong><span>收藏后可在首页启用“仅看我的收藏”。评论不是星级评分，而是“好评/差评 + 文字”。</span></li>
            </StepList>
            <Note tone="warning"><strong>安全提醒：</strong>运行命令前，先查看依赖、安装命令和制品来源。按钮显示“暂无制品”时，说明作者没有提供可下载文件，不能强行安装。</Note>
          </section>
          </>
          ) : null}

          {currentPage.key === 'publishing' ? (
          <>
          {currentPublishPage.key === 'overview' ? (
          <section className="manual-section manual-publish-chapter" id="manual-publish">
            <div className="manual-section-heading"><span>02</span><div><h2>组件发布</h2><p>本章先讲所有组件共用的发布方法，再逐一说明每一种组件的材料、字段、注意事项和常见错误。“制品”就是实际上传并供用户下载的文件包。</p></div></div>
            <h3 className="manual-subtitle">发布类型总览</h3>
            <div className="manual-table-wrap">
              <table className="manual-table">
                <thead><tr><th>类型</th><th>适合发布什么</th><th>必须/主要准备</th><th>特别说明</th></tr></thead>
                <tbody>{componentRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <Note><strong>为什么看不到插件和沙箱？</strong>代码中保留了完整的数据和发布处理能力，但当前版本把这两类从市场导航和“首次发布”类型选择中隐藏。已有数据仍可能出现在创作者或管理员管理范围内。</Note>
          </section>
          ) : null}

          {currentPublishPage.key === 'general' ? (
          <section className="manual-subsection" id="manual-publish-general">
            <div className="manual-subsection-heading"><span>2.1</span><div><h3>通用发布流程</h3><p>所有新组件都会先提交审核，不会点击后立即公开。</p></div></div>
            <GuideImage
              src="02-publish-types.png"
              alt="发布组件类型选择页面"
              caption="图 2　发布第一步：选择最符合内容的组件类型。"
              lightSource
              callouts={[
                { number: 1, label: '发布步骤：当前是“选择类型”，选中后进入“填写信息”。', x: '14%', y: '19%' },
                { number: 2, label: '单项技能：上传一个技能；卡片下方列出必须材料。', x: '18%', y: '37%' },
                { number: 3, label: '技能包：关联已有技能，不是上传一个普通压缩包。', x: '50%', y: '37%' },
                { number: 4, label: 'MCP：从网关选择，或在下一步切换为自定义地址。', x: '18%', y: '55%' },
                { number: 5, label: '网站应用：下一步选择本地应用或外部链接。', x: '82%', y: '55%' },
              ]}
            />
            <StepList>
              <li><strong>登录并进入。</strong><span>点击顶部“开发者发布”。如果没有该按钮，说明未登录或当前是“仅安全审核”角色。</span></li>
              <li><strong>选择类型。</strong><span>阅读卡片上的“需要准备”，确认自己有对应文件或地址。类型关系到后续校验，不能把 CLI 工具当作技能上传。</span></li>
              <li><strong>填写基础信息。</strong><span>组件 ID 要全市场唯一，建议用小写英文、数字、点、横线或下划线并长期保持不变；名称与描述面向普通用户；版本建议从 1.0.0 开始并遵守“主版本.次版本.修订号”。</span></li>
              <li><strong>上传展示图片。</strong><span>支持 PNG、JPEG、WebP、GIF。图片用于市场详情展示，应清晰、无敏感信息，避免把使用说明全塞在图片里。</span></li>
              <li><strong>填写类型设置和制品。</strong><span>系统会按类型显示不同字段。带红色必填提示的项目必须完成；同一个系统+架构只能添加一次。</span></li>
              <li><strong>设置访问权限。</strong><span>“全员可见”包括未登录游客；“限定人群可见”至少选一个部门或指定用户。</span></li>
              <li><strong>提交审核。</strong><span>看到“已提交审核”只代表进入安全审核队列。安全通过后还要经过管理员审核，全部通过才会上架。</span></li>
            </StepList>
          </section>
          ) : null}

          {currentPublishPage.key === 'skills' ? (
          <section className="manual-subsection" id="manual-publish-skill">
            <div className="manual-subsection-heading"><span>2.2</span><div><h3>单项技能与技能包</h3><p>本页按实际发布表单逐项解释，并重点说明 GitHub/GitLab 导入、SKILL.md 和 metadata 的正确写法。</p></div></div>

            <div className="manual-skill-layout">
            <nav className="manual-section-nav" aria-label="2.2 小节导航">
              <strong>快速定位</strong>
              <div>
                {skillPageSections.map((item, index) => (
                  <Link
                    aria-label={`${item.number} ${item.label}`}
                    className={location.hash === `#${item.id}` || (!location.hash && index === 0) ? 'is-active' : ''}
                    to={`/guide/publishing/skills#${item.id}`}
                    key={item.id}
                  >
                    <span>{item.number}</span>{item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="manual-skill-content">
            <div className="manual-skill-intro">
              <article><b>单项技能</b><span>一个可以独立使用的能力。必须提供含 <code>SKILL.md</code> 的 ZIP，或者从 GitHub / GitLab 导入。</span></article>
              <article><b>技能包</b><span>多个已上架单项技能的组合。不上传 ZIP，只在表单中勾选已有技能。</span></article>
            </div>

            <h4 className="manual-topic-title" id="manual-skill-fields">一、单项技能发布表单：每个字段怎么写</h4>
            <div className="manual-table-wrap">
              <table className="manual-table manual-field-table">
                <thead><tr><th>字段</th><th>是否必填</th><th>怎么写</th><th>示例与注意事项</th></tr></thead>
                <tbody>
                  <tr><td>组件 ID</td><td>必填</td><td>技能的永久唯一标识。只能使用小写英文字母、数字、点、下划线和横线；第一位必须是字母或数字。</td><td><code>excel-report-helper</code>。发布后不要把它当显示名称随意修改；同名 ID 已存在会提交失败。</td></tr>
                  <tr><td>名称</td><td>必填</td><td>写给普通用户看的中文或英文名称，一眼说明能力，不要只写“工具”“测试技能”。</td><td><code>Excel 周报生成助手</code>。市场卡片显示的是这里的名称，不会自动读取 SKILL.md 中的 name。</td></tr>
                  <tr><td>版本</td><td>必填</td><td>推荐使用语义版本 <code>主版本.次版本.修订号</code>。首次通常填 <code>1.0.0</code>；修复问题升修订号，兼容性新增功能升次版本，不兼容变更升主版本。</td><td><code>1.2.3</code>。它必须与 SKILL.md 中的 <code>metadata.version</code> 一致；发布新版本时还必须高于旧版本。</td></tr>
                  <tr><td>展示图片</td><td>选填</td><td>上传 PNG、JPEG、WebP 或 GIF，用于详情展示。图片应清晰、无账号、Token、内网地址等敏感信息。</td><td>建议用能说明技能用途的界面或结果图；不要用图片代替文字说明。</td></tr>
                  <tr><td>描述</td><td>必填</td><td>用 1～3 句话说明“解决什么问题、需要什么输入、会得到什么输出”。</td><td>例如：<code>读取 Excel 销售明细，按地区汇总并生成带图表的周报。</code></td></tr>
                  <tr><td>技能分类</td><td>必填</td><td>选择最接近核心能力的一项：文档处理、数据分析、编程开发、浏览器自动化、办公效率、内容创作、图像多媒体、搜索阅读、系统操作、API 集成、自动化或其他。</td><td>按主要用途选，不要为了增加曝光重复或错选。例如 Excel 汇总通常选“数据分析”或“办公效率”。</td></tr>
                  <tr><td>使用场景</td><td>必填</td><td>从效率、开发者、研究、企业、教育、创作者中选择最主要的使用人群和场景。</td><td>代码检查选“开发者”；论文资料整理选“研究”；企业内部流程选“企业”。</td></tr>
                  <tr><td>难度</td><td>必填</td><td>入门：几乎无需配置；进阶：需要准备文件、参数或少量依赖；高级：需要开发知识、复杂环境或多个系统配合。</td><td>难度描述的是用户的使用门槛，不是作者开发它有多难。</td></tr>
                  <tr><td>官方推荐</td><td>选填</td><td>用于标记推荐内容。只有内容成熟、说明完整、经过充分验证时再勾选，最终仍以审核结果为准。</td><td>普通新技能建议先不勾选。</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="manual-topic-title" id="manual-skill-file">二、SKILL.md 放在哪里、最少要写什么</h4>
            <p className="manual-topic-copy"><code>SKILL.md</code> 是技能包里的入口说明文件。服务器会在 ZIP 的各级目录中查找文件名完全等于 <code>SKILL.md</code> 的文件，所以允许外面有一层技能目录；但大小写必须正确，而且一个单项技能包只应包含一个目标技能。</p>
            <div className="manual-package-tree" aria-label="技能压缩包目录示例">
              <strong>excel-report-helper.zip</strong>
              <span>└── excel-report-helper/</span>
              <span>　　├── <b>SKILL.md</b>　← 必需</span>
              <span>　　├── scripts/　　← 可选，执行脚本</span>
              <span>　　├── references/ ← 可选，参考资料</span>
              <span>　　└── assets/　　 ← 可选，模板或静态资源</span>
            </div>
            <p className="manual-code-label">最小可通过市场版本校验的 SKILL.md：</p>
            <pre className="manual-code-example"><code>{`---
metadata:
  version: "1.0.0"
---

# Excel 周报生成助手

## 用途
读取 Excel 销售明细，汇总数据并生成周报。

## 何时使用
当用户提供 Excel 文件并要求按地区、产品或日期汇总时使用。

## 操作步骤
1. 确认输入文件和统计口径。
2. 检查必需列是否存在。
3. 生成汇总表和图表。
4. 输出结果并说明异常数据。`}</code></pre>
            <Note><strong>关键规则：</strong>文件第一行必须是 <code>---</code>；YAML 区域必须用另一个 <code>---</code>（或 <code>...</code>）结束；<code>metadata</code> 必须是对象，<code>version</code> 必须位于它的下一层。正文写在第二个分隔线之后。</Note>

            <h4 className="manual-topic-title" id="manual-skill-metadata">三、metadata 的数据格式怎么写</h4>
            <p className="manual-topic-copy">这里使用的是 <strong>YAML</strong>，不是 JSON。当前市场提交时真正读取并强制校验的字段只有 <code>metadata.version</code>；其他自定义字段会留在 SKILL.md 文件中，但不会自动变成市场名称、分类、标签或平台设置。</p>
            <div className="manual-component-grid">
              <article className="manual-component-guide">
                <header><span>✓</span><div><h3>推荐写法</h3><p>使用两个空格缩进，版本号加引号。</p></div></header>
                <pre className="manual-code-example is-compact"><code>{`---
name: excel-report-helper
description: 读取销售明细并生成 Excel 周报
metadata:
  version: "1.2.0"
  maintainer: "数据平台组"
  keywords:
    - excel
    - report
  requirements:
    python: ">=3.11"
  experimental: false
---`}</code></pre>
              </article>
              <article className="manual-component-guide">
                <header><span>×</span><div><h3>错误写法</h3><p>以下写法会缺失版本或破坏 YAML 层级。</p></div></header>
                <pre className="manual-code-example is-compact is-error"><code>{`# 错误 1：没有开头的 ---
metadata:
  version: "1.2.0"

# 错误 2：version 没放在 metadata 里面
---
metadata: {}
version: "1.2.0"
---

# 错误 3：使用 Tab 或缩进错位
---
metadata:
version: "1.2.0"
---`}</code></pre>
              </article>
            </div>
            <div className="manual-table-wrap">
              <table className="manual-table compact">
                <thead><tr><th>YAML 数据</th><th>写法</th><th>说明</th></tr></thead>
                <tbody>
                  <tr><td>字符串</td><td><code>version: "1.2.0"</code></td><td>版本号、带冒号或特殊字符的内容建议加引号，避免被 YAML 当成其他类型。</td></tr>
                  <tr><td>布尔值</td><td><code>experimental: false</code></td><td>使用英文 <code>true</code> / <code>false</code>，不要写“是/否”。</td></tr>
                  <tr><td>列表</td><td><code>keywords:</code><br /><code>　- excel</code><br /><code>　- report</code></td><td>每一项前面使用短横线；短横线与内容之间要有空格。</td></tr>
                  <tr><td>嵌套对象</td><td><code>requirements:</code><br /><code>{'  python: ">=3.11"'}</code></td><td>下一层统一缩进两个空格。不要使用 Tab，也不要混用中文冒号。</td></tr>
                </tbody>
              </table>
            </div>
            <Note tone="warning"><strong>不要混淆两种 metadata：</strong>SKILL.md 中的 <code>metadata</code> 是 YAML，目前必须包含 <code>version</code>；发布表单高级选项里的“平台元数据 JSON”必须写成 JSON 对象，例如 <code>{'{"runtime":"python"}'}</code>。两者位置、语法和用途都不同。</Note>

            <h4 className="manual-topic-title" id="manual-skill-upload">四、选择本地 ZIP 时怎么填</h4>
            <StepList>
              <li><strong>选择“上传本地制品包”。</strong><span>单项技能只接受 ZIP 类型制品。压缩前先在本地打开 ZIP，确认能看到目标 SKILL.md，而不是只有另一个压缩包。</span></li>
              <li><strong>选择系统与架构。</strong><span>技能内容与系统无关时选 <code>universal</code>；确实只支持某个平台时，选择 darwin、linux 或 windows，再选择 arm64、amd64、arm 或 386。</span></li>
              <li><strong>上传制品包。</strong><span>每个平台制品都必须选择文件，同一个“系统 + 架构”组合不能重复。多平台文件内容不同，就点击“添加平台制品”逐项上传。</span></li>
              <li><strong>需要额外依赖时上传 ADP。</strong><span>只有需要自动安装额外依赖时才上传最新 ADP 0.1 的 adp.yaml；不需要依赖就留空，不要放一个空模板。</span></li>
            </StepList>

            <h4 className="manual-topic-title" id="manual-skill-repository">五、GitHub/GitLab 导入：每个字段怎么填</h4>
            <div className="manual-table-wrap">
              <table className="manual-table manual-field-table">
                <thead><tr><th>字段</th><th>怎么写</th><th>示例与限制</th></tr></thead>
                <tbody>
                  <tr><td>仓库平台</td><td>仓库在 GitHub 就选 GitHub，在 GitLab 或企业 GitLab 就选 GitLab。</td><td>平台选错会拼出错误的下载地址。</td></tr>
                  <tr><td>仓库地址</td><td>填写 HTTPS 克隆地址，不要放账号密码、查询参数或页面锚点。</td><td><code>https://github.com/acme/excel-skill.git</code>。服务器只允许管理员配置过的仓库域名；HTTP 或 SSH 地址不可用。</td></tr>
                  <tr><td>分支、Tag 或 Commit</td><td>填要导入的准确版本。留空时读取 <code>HEAD</code>；为了结果可重复，正式发布建议填固定 Tag 或 Commit SHA。</td><td><code>main</code>、<code>v1.2.0</code> 或完整 Commit SHA。不要换行，长度不能超过 255 个字符。</td></tr>
                  <tr><td>Skill 所在子目录</td><td>仓库根目录就是技能时留空；技能位于多技能仓库时，填写从仓库根目录到目标技能目录的相对路径。</td><td><code>skills/excel-report-helper</code>。不要以 <code>/</code>、点目录或 <code>../</code> 开头，不要填 SKILL.md 文件名本身。</td></tr>
                  <tr><td>Access Token</td><td>公开仓库通常留空；私有仓库填写能读取该仓库的短期只读 Token。</td><td>Token 只用于本次服务端拉取。不要把 Token 写进 URL、SKILL.md、README、截图或仓库文件。</td></tr>
                </tbody>
              </table>
            </div>
            <Note><strong>GitHub/GitLab 导入范围：</strong>目前只支持“单项技能”。系统会下载所选 Ref 的仓库 ZIP；填写子目录时，只把该目录中的文件整理成技能制品。该目录必须真实存在并包含 SKILL.md。</Note>

            <h4 className="manual-topic-title" id="manual-skill-advanced">六、高级选项、访问权限与提交前检查</h4>
            <div className="manual-table-wrap">
              <table className="manual-table compact">
                <thead><tr><th>字段</th><th>怎么写</th><th>注意事项</th></tr></thead>
                <tbody>
                  <tr><td>最低桌面版本</td><td>填写使用技能所需的最低客户端版本，例如 <code>1.2.0</code>。</td><td>不是技能自身版本；没有最低要求就留空。</td></tr>
                  <tr><td>标签</td><td>用英文逗号分隔关键词，例如 <code>Excel, 周报, 数据分析</code>。</td><td>标签用于搜索，应具体、少而准。</td></tr>
                  <tr><td>作者</td><td>填写个人、团队或组织的公开名称。</td><td>不要填写账号密码、邮箱验证码等隐私信息。</td></tr>
                  <tr><td>平台说明</td><td>说明该平台上的特殊要求，例如“仅支持安装了 Python 3.11 的 Windows 设备”。</td><td>通用技能没有特殊要求可留空。</td></tr>
                  <tr><td>平台元数据 JSON</td><td>必须是 JSON 对象，从 <code>{'{'}</code> 开始、以 <code>{'}'}</code> 结束。</td><td>例如 <code>{'{"runtime":"python","entry":"scripts/run.py"}'}</code>；键和值都用英文双引号。</td></tr>
                  <tr><td>平台依赖 JSON</td><td>必须是 JSON 数组，从 <code>[</code> 开始、以 <code>]</code> 结束。</td><td>不确定格式时保持 <code>[]</code>；错误的对象/数组或中文标点会提交失败。</td></tr>
                  <tr><td>README</td><td>写安装前提、输入输出、示例、限制、失败处理和联系方式。</td><td>市场详情读取的是表单 README，不会自动把 SKILL.md 正文同步到这里。</td></tr>
                  <tr><td>访问权限</td><td>公开给所有人选“全员可见”；内部技能选“限定人群”，并至少选择一个部门或用户。</td><td>限定模式没有选择任何对象时无法提交。</td></tr>
                </tbody>
              </table>
            </div>
            <div className="manual-checklist">
              <h3>单项技能提交前逐项核对</h3>
              {[
                'ZIP 或所选仓库子目录中存在文件名完全正确的 SKILL.md。',
                'SKILL.md 第一行是 ---，YAML 有结束分隔线，metadata.version 已填写。',
                '表单版本与 metadata.version 一致；新版本号高于当前已发布版本。',
                '组件 ID、市场名称、描述、分类、场景和难度填写准确。',
                '平台与实际支持范围一致，所有平台制品均已选择，且没有重复平台组合。',
                'README 足以让第一次接触该技能的用户知道何时使用、需要提供什么以及会得到什么。',
                '仓库 Token 为短期只读权限，且没有出现在 URL、文件、图片或说明文字中。',
              ].map((item) => <p key={item}><CheckCircle2 size={16} />{item}</p>)}
            </div>

            <h4 className="manual-topic-title" id="manual-skill-package">七、技能包怎么发布</h4>
            <article className="manual-component-guide manual-package-guide">
              <header><span>02</span><div><h3>发布技能包</h3><p>技能包是已上架单项技能的组合，不是上传一个普通压缩包。</p></div></header>
              <div className="manual-package-columns">
                <div><h4>必须准备</h4><p>至少 1 个已经发布、当前有权选择的单项技能。没有可选项时，应先发布并审核通过单项技能。</p></div>
                <div><h4>表单怎么填</h4><p>填写 ID、名称、版本和描述，再设置分类、场景、难度；搜索技能名称或 ID 后逐项勾选，并在 README 中说明组合用途和建议使用顺序。</p></div>
                <div><h4>提交前检查</h4><p>确认没有重复技能、每个技能都服务于同一工作目标，并且组合说明能让用户理解先用哪个、后用哪个。</p></div>
                <div><h4>常见错误</h4><p>未选择任何技能；误把任意 ZIP 当技能包；关联尚未上架的技能；描述中没有说明各技能之间的关系。</p></div>
              </div>
            </article>
            <div className="manual-form-map" role="img" aria-label="技能发布表单结构示意图">
              <div className="manual-form-map-head"><span>技能发布表单</span><small>从上到下填写</small></div>
              <div><b>1</b><span><strong>基础信息</strong><small>ID · 名称 · 版本 · 描述 · 展示图片</small></span></div>
              <div><b>2</b><span><strong>类型设置</strong><small>分类 · 场景 · 难度 · 包含技能</small></span></div>
              <div><b>3</b><span><strong>必需材料</strong><small>本地 ZIP 或仓库地址 · 平台 · ADP</small></span></div>
              <div><b>4</b><span><strong>访问权限与高级选项</strong><small>可见范围 · README · 依赖 · 命令</small></span></div>
              <div><b>5</b><span><strong>提交审核</strong><small>安全审核 → 管理员审核 → 上架</small></span></div>
            </div>
            </div>
            </div>
          </section>
          ) : null}

          {currentPublishPage.key === 'components' ? (
          <section className="manual-subsection" id="manual-publish-components">
            <div className="manual-subsection-heading"><span>2.3</span><div><h3>各类组件发布须知</h3><p>每种组件单独列出“材料、字段、检查和错误”，查阅时可直接找到对应类型。</p></div></div>
            <div className="manual-component-stack">
              {[
                ['03', '智能体', '含 agent.yml 或 agent.yaml 的 ZIP。', '说明智能体能完成的任务、需要什么输入、输出什么结果以及不适用范围。', '定义文件能被解析，引用的资源都在包内，版本和展示信息一致。', '只有说明没有运行定义；资源路径写错；把普通脚本当智能体。'],
                ['04', 'MCP', '从网关选择一个服务，或准备有效的 HTTP(S) 自定义服务地址。', '网关模式会带入 endpoint、配置版本和工具；自定义模式可填服务标识与英文逗号分隔的工具名。', '地址可访问；工具列表真实；服务标识适合成为 .mcp.json 的 mcpServers 键名。', '网关模式没有真正选中服务；自定义地址不是 http(s)；工具名使用中文逗号。'],
                ['05', '桌面宠物', '包含 pet.json 和 pet-idle.png 的资源包。', '名称、说明和展示图要准确表现宠物；pet.json 中的资源路径必须与包内文件一致。', '待机图片能正常读取，文件名大小写正确，包内没有无关敏感文件。', '缺少必需图片；配置引用不存在的动作资源；图片与描述不一致。'],
                ['06', 'CLI 工具', '可选 ZIP 制品；需要额外依赖时准备 adp.yaml。', '按平台上传；高级选项可填写安装、卸载、检测和版本命令，检测命令一行一条。', '命令可在目标平台执行；返回值和版本输出正常；卸载不会误删用户数据。', '平台标错；命令只适用于作者电脑；把多个检测命令写在同一行。'],
                ['07', '网站应用', 'local-app 准备含 webapp.json 的制品；external 准备有效外部 URL。', '先选 local-app 或 external。外部网站直接填 URL，不需要为了上传而制作无关压缩包。', '本地入口、端口和资源路径正确；外部地址使用 HTTPS 且对目标用户可访问。', '类型选错；URL 指向登录后无权限的页面；本地包缺少 webapp.json。'],
                ['08', '软件依赖包', 'ZIP 或 tar.gz 依赖包。', '为不同系统和架构分别添加平台制品，并在 README 中说明安装、验证和卸载方法。', '包名、版本、系统、架构全部一致；依赖来源和许可证信息清楚。', '把专用包标成 universal；压缩类型与实际文件不符；缺少安装说明。'],
                ['09', '插件（当前隐藏）', '含 manifest.json 的 ZIP。', '代码保留了插件发布与管理能力，但当前首次发布入口和市场分类不显示。', '如通过已有管理流程维护，仍需核对 manifest、版本、权限和宿主兼容性。', '不要尝试通过选择其他类型绕过当前隐藏限制。'],
                ['10', '沙箱（当前隐藏）', 'environment-template 使用 environment.json；container-image 使用 tar.gz。', '代码保留两种沙箱类型处理，但当前首次发布入口和市场分类不显示。', '如维护已有条目，核对镜像来源、系统架构、运行权限和网络访问。', '不要把容器镜像标为环境模板，也不要通过其他类型绕过限制。'],
              ].map(([number, title, materials, fields, checks, errors]) => (
                <article className="manual-component-guide is-row" key={title}>
                  <header><span>{number}</span><div><h3>发布{title}</h3><p>{materials}</p></div></header>
                  <div><h4>表单与说明</h4><p>{fields}</p></div>
                  <div><h4>提交前检查</h4><p>{checks}</p></div>
                  <div><h4>常见错误</h4><p>{errors}</p></div>
                </article>
              ))}
            </div>
          </section>
          ) : null}

          {currentPublishPage.key === 'settings' ? (
          <section className="manual-subsection" id="manual-publish-settings">
            <div className="manual-subsection-heading"><span>2.4</span><div><h3>平台、制品、ADP、权限与高级选项</h3><p>这些设置决定“谁能看、下载哪个文件、如何安装”。</p></div></div>
            <div className="manual-table-wrap">
              <table className="manual-table compact">
                <thead><tr><th>设置</th><th>怎么填</th><th>常见错误</th></tr></thead>
                <tbody>
                  <tr><td>系统与架构</td><td>通用包选 universal；专用包选 darwin/linux/windows + arm64/amd64/arm/386。</td><td>重复添加相同组合，或把 macOS 包标成 Windows。</td></tr>
                  <tr><td>多平台制品</td><td>点击“添加平台制品”，每个平台独立选择类型并上传文件。</td><td>只上传一个平台，却误标 universal。</td></tr>
                  <tr><td>ADP 协议</td><td>仅当需要额外安装依赖时上传最新 ADP 0.1 的 adp.yaml。</td><td>有 ADP 但无对应制品、hook 与包内容不一致。</td></tr>
                  <tr><td>访问权限</td><td>全员可见；或限定部门并可额外指定用户。搜索用户需至少输入 2 个字符。</td><td>选择“限定”却没有选择任何部门或用户。</td></tr>
                  <tr><td>高级 JSON</td><td>平台元数据必须是对象 <code>{'{...}'}</code>；平台依赖必须是数组 <code>[...]</code>。</td><td>使用中文标点、少逗号、对象和数组写反。</td></tr>
                  <tr><td>最低桌面版本</td><td>填写使用该组件所需的最低客户端版本，例如 1.2.0。</td><td>把组件自身版本填到此处。</td></tr>
                </tbody>
              </table>
            </div>
            <Note tone="warning"><strong>令牌保护：</strong>私有仓库 Token 只用于本次导入，仍应使用只读、短有效期令牌。不要把令牌写进 README、JSON、安装命令或上传包。</Note>
          </section>
          ) : null}
          </>
          ) : null}

          {currentPage.key === 'creator' ? (
          <section className="manual-section" id="manual-creator">
            <div className="manual-section-heading"><span>03</span><div><h2>创作者中心：数据、版本和组件维护</h2><p>顶部“创作者中心”进入；这里只管理当前登录用户有权管理的组件。</p></div></div>
            <div className="manual-dashboard-map" role="img" aria-label="创作者中心页面结构示意图">
              <aside><b>1</b><strong>身份资料</strong><span>账号 · 邮箱 · 角色</span><strong>类型分布</strong><span>查看自己的组件构成</span></aside>
              <main>
                <div className="manual-dashboard-metrics"><span><b>2</b>组件数</span><span>下载量</span><span>详情点击</span><span>收藏 / 评论</span></div>
                <div className="manual-dashboard-panels"><span><b>3</b>最近更新</span><span>发布检查</span><span>下载排行</span><span>收藏排行</span></div>
                <div className="manual-dashboard-table"><strong><b>4</b>我的组件</strong><span>搜索与类型筛选</span><small>版本　发布新版本　编辑附加信息　查看　永久删除</small></div>
              </main>
            </div>
            <ol className="manual-callout-list manual-map-legend">
              <li><b>1</b><span>先确认当前登录身份、角色和组件类型分布。</span></li>
              <li><b>2</b><span>指标卡汇总组件数、下载、详情点击、收藏、评论和审核状态。</span></li>
              <li><b>3</b><span>分析区展示最近更新、质量问题以及下载/收藏排行。</span></li>
              <li><b>4</b><span>“我的组件”提供搜索、筛选和逐项管理操作。</span></li>
            </ol>
            <ul>
              <li><strong>数据看板：</strong>统计组件数、下载、详情点击、收藏、评论、好评率、技能包、待审核和已驳回数量；最近更新、下载排行和收藏排行可点进已上架组件详情。</li>
              <li><strong>版本历史：</strong>点击“版本”查看版本号、发布时间、当前版本和平台制品数量。</li>
              <li><strong>发布新版本：</strong>只在当前组件审核通过后可用；类型和 ID 锁定，新版本必须高于当前版本。审核期间，旧的已上架版本继续可用。</li>
              <li><strong>编辑附加信息：</strong>可直接修改名称、描述、标签、README、附加元数据和开放人群；版本号、制品、平台、依赖与安装协议受保护，修改这些必须发布新版本。</li>
              <li><strong>永久删除：</strong>会清除所有版本、制品、审核、下载、收藏和评论，无法恢复。务必在确认框再次核对组件名称。</li>
            </ul>
            <div className="manual-status-flow" aria-label="发布状态流程">
              <span>提交</span><b>→</b><span>安全待审</span><b>→</b><span>管理员待审</span><b>→</b><span className="is-success">已上架</span>
            </div>
            <p className="manual-small">任一审核节点“驳回”都会停止流程。按审核意见修改后，请使用更高版本重新提交。</p>
          </section>
          ) : null}

          {currentPage.key === 'review' ? (
          <>
          <section className="manual-section" id="manual-security">
            <div className="manual-section-heading"><span>4.1</span><div><h2>安全审核人的操作</h2><p>入口只对安全审核角色显示，并且只展示当前处于安全待审节点的组件。</p></div></div>
            <StepList>
              <li><strong>加载并打开审核详情。</strong><span>确认提交人、提交时间、组件类型，以及首次发布还是版本更新。</span></li>
              <li><strong>检查自动检查与访问范围。</strong><span>先处理失败项和警告项，再确认“全员/限定人群”是否符合组件用途。</span></li>
              <li><strong>检查制品。</strong><span>核对平台、文件名、压缩类型、大小、SHA-256、Integrity；展开文件清单确认必需文件和异常脚本。审核页可下载待审制品做进一步检查。</span></li>
              <li><strong>检查依赖和 ADP。</strong><span>阅读依赖、目标平台、安装/卸载/检测命令和 ADP manifest，重点关注过度权限、陌生来源、网络访问与 hook。</span></li>
              <li><strong>检查差异和市场预览。</strong><span>版本更新要看上一版本与当前版本差异；切到“市场预览”检查用户最终看到的名称、说明、标签、README 和图片。</span></li>
              <li><strong>做决定。</strong><span>通过时意见可选；驳回时必须写清楚具体问题和修改方式。安全通过后自动进入管理员审核。</span></li>
            </StepList>
          </section>

          <section className="manual-section" id="manual-admin">
            <div className="manual-section-heading"><span>4.2</span><div><h2>管理员：审核、下架、删除与评论治理</h2><p>管理员入口包含“待审核发布”“已上架组件”和“评论管理”三部分。</p></div></div>
            <ul>
              <li><strong>业务审核：</strong>点击“加载审核数据”刷新列表，打开“审核详情”，复核自动检查、制品、依赖、版本差异、审核历史与市场预览。首次发布通过后上架；新版本通过后替换当前版本。驳回必须填写原因。</li>
              <li><strong>查找已上架组件：</strong>使用关键词和类型筛选；“版本”查看历史，“查看”打开市场详情。</li>
              <li><strong>下架最新版本：</strong>确认名称和版本后下架。若存在更早的已发布版本，市场自动回退；否则该组件不再公开。</li>
              <li><strong>永久删除：</strong>删除全部关联数据且不可恢复。下架用于暂时停止分发，永久删除只用于确认不再保留的内容。</li>
              <li><strong>评论治理：</strong>可查看评论用户、好评/差评、内容和状态。“隐藏”让违规评论不再公开；“恢复”重新显示，不会修改用户原文。</li>
            </ul>
            <Note tone="warning"><strong>高风险操作：</strong>“下架最新版本”和“永久删除”不是一回事。能通过下架解决时不要删除；执行删除前应完成组织要求的备份与审批。</Note>
          </section>
          </>
          ) : null}

          {currentPage.key === 'faq' ? (
          <section className="manual-section" id="manual-faq">
            <div className="manual-section-heading"><span>05</span><div><h2>常见问题与一分钟自查</h2><p>多数失败都来自权限、必需文件、版本或平台设置。</p></div></div>
            <div className="manual-faq-list">
              <details open><summary>为什么看不到收藏、下载、发布或审核按钮？</summary><p>游客只能浏览。请先登录；发布需要普通登录身份且不能是“仅安全审核”角色；安全审核和管理员审核还需要对应角色。</p></details>
              <details><summary>为什么上传技能后提示版本错误？</summary><p>核对表单版本与 ZIP 中 SKILL.md 的 YAML <code>metadata.version</code>，两者必须完全一致，例如都为 1.2.0。</p></details>
              <details><summary>为什么无法添加平台？</summary><p>同一个系统和架构组合只能出现一次。检查是否已有 windows-amd64、darwin-arm64 等重复项。</p></details>
              <details><summary>为什么限定人群无法提交？</summary><p>至少选择一个部门或指定用户。用户搜索至少输入 2 个字符；目录不可用时重新登录，仍失败则联系管理员。</p></details>
              <details><summary>MCP 为什么无法提交？</summary><p>网关模式必须真正选中一个服务；自定义模式必须填写以 http:// 或 https:// 开头的有效地址。</p></details>
              <details><summary>新版本为什么没有马上出现在市场？</summary><p>新版本必须更高，并依次完成安全审核与管理员审核。审核期间，市场继续显示旧版本，这是正常保护机制。</p></details>
              <details><summary>为什么“编辑附加信息”不能换文件？</summary><p>该入口专门保护已发布制品，只允许改展示信息和访问范围。要换文件、平台、依赖或安装协议，请选择“发布新版本”。</p></details>
            </div>
            <div className="manual-checklist">
              <h3>提交前一分钟检查</h3>
              {[
                '组件 ID、类型、名称、描述准确，版本号符合语义版本并高于旧版本。',
                '制品与系统/架构匹配；必需文件名正确；技能 metadata.version 一致。',
                'README、展示图片、标签、场景足以让第一次看到的人理解用途。',
                '访问范围正确；私有仓库令牌为短期只读且未写入任何内容。',
                '已在预期平台验证依赖、下载包和 ADP/CLI 安装命令。',
              ].map((item) => <p key={item}><CheckCircle2 size={16} />{item}</p>)}
            </div>
          </section>
          ) : null}

          <nav className="manual-page-switcher" aria-label="手册翻页">
            {previousPage ? <Link to={previousPage.path}><ArrowLeft size={15} /><span><small>上一页</small><strong>{previousPage.label}</strong></span></Link> : <span />}
            {nextPage ? <Link className="is-next" to={nextPage.path}><span><small>下一页</small><strong>{nextPage.label}</strong></span><ArrowLeft size={15} /></Link> : <span />}
          </nav>

          <footer className="manual-footer">
            <BookOpen size={17} />
            <span>功能市场用户操作手册 · 按当前前端实现整理</span>
            <button type="button" onClick={onClose}><ArrowLeft size={14} />返回市场</button>
          </footer>
        </article>
      </main>
    </section>
  );
}
