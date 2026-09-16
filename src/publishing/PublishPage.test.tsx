import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getMarketCopy } from '../i18n/marketCopy';
import { PublishPage } from './PublishPage';

const initialItem = {
  id: 'demo-skill',
  type: 'skill',
  name: 'Demo Skill',
  version: '1.0.0',
  description: 'Demo description',
  readme: '',
  tags: [],
  metadata: {},
  dependencies: [],
  skillKind: 'single',
  skillCategory: 'coding',
  skillScenario: 'developer',
  skillLevel: 'beginner',
  platformOptions: ['universal'],
  platformMap: {
    universal: {
      platform: 'universal',
      os: 'universal',
      arch: '',
      metadata: {},
      dependencies: [],
    },
  },
  assetMap: {},
};

describe('publish platform selection', () => {
  it('explains the required SKILL.md metadata version contract', () => {
    render(
      <PublishPage
        t={getMarketCopy('zh-CN')}
        locale="zh-CN"
        initialItem={initialItem}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isPublishing={false}
      />,
    );

    expect(screen.getByText('SKILL.md 的 YAML metadata.version 必填，且必须与上方填写的版本一致。')).toBeInTheDocument();
  });

  it('derives the platform from OS and architecture without exposing a platform field', () => {
    const { container } = render(
      <PublishPage
        t={getMarketCopy('zh-CN')}
        locale="zh-CN"
        initialItem={initialItem}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isPublishing={false}
      />,
    );

    expect(container.querySelector('[name="platformKey"]')).not.toBeInTheDocument();

    const os = screen.getByLabelText('系统');
    const arch = screen.getByLabelText('架构');
    expect(os).toHaveValue('universal');
    expect(arch).toBeDisabled();

    fireEvent.change(os, { target: { value: 'darwin' } });
    expect(arch).toBeEnabled();
    expect(arch).toBeRequired();

    fireEvent.change(arch, { target: { value: 'arm64' } });
    expect(arch).toHaveValue('arm64');

    fireEvent.change(os, { target: { value: 'universal' } });
    expect(arch).toBeDisabled();
    expect(arch).toHaveValue('');
  });

	it('allows one release to contain multiple platform artifacts', () => {
	  const { container } = render(
		<PublishPage
		  t={getMarketCopy('zh-CN')}
		  locale="zh-CN"
		  initialItem={initialItem}
		  onClose={vi.fn()}
		  onSubmit={vi.fn()}
		  isPublishing={false}
		/>,
	  );

	  expect(container.querySelectorAll('[name="variantIndex"]')).toHaveLength(1);
	  fireEvent.click(screen.getByText('添加平台制品'));
	  expect(container.querySelectorAll('[name="variantIndex"]')).toHaveLength(2);
	  expect(container.querySelector('[name="variantArtifact.0"]')).toBeRequired();
	  expect(container.querySelector('[name="variantArtifact.1"]')).toBeRequired();
	});

  it('switches a single skill artifact to a private repository source', () => {
    const { container } = render(
      <PublishPage
        t={getMarketCopy('zh-CN')}
        locale="zh-CN"
        initialItem={initialItem}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isPublishing={false}
      />,
    );

    fireEvent.click(screen.getByLabelText('从 GitHub / GitLab 仓库导入'));
    expect(screen.getByLabelText('仓库平台')).toHaveValue('gitlab');
    expect(screen.getByLabelText('仓库地址')).toBeRequired();
    expect(screen.getByLabelText(/^Access Token（私有仓库必填）/)).toHaveAttribute('type', 'password');
    expect(container.querySelector('[name="variantArtifact.0"]')).not.toBeRequired();
    expect(screen.queryByText('添加平台制品')).not.toBeInTheDocument();
  });
});

describe('publish access policy', () => {
  it('keeps existing versions public to signed-out visitors by default', () => {
    render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" initialItem={initialItem} onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    expect(screen.getByLabelText('全员可见')).toBeChecked();
    expect(screen.getByText('所有人均可访问，包括未登录游客。')).toBeInTheDocument();
  });

  it('offers the logged-in users department as a publish target', () => {
    render(
      <PublishPage
        t={getMarketCopy('zh-CN')}
        locale="zh-CN"
        initialItem={{ ...initialItem, accessPolicy: { mode: 'department', departmentIds: ['1001'] } }}
        currentUser={{ organization: { departments: [{ id: '1001', name: '机构金融部', primary: true }] } }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isPublishing={false}
      />,
    );

    expect(screen.getByLabelText('限定人群可见')).toBeChecked();
    expect(screen.getByText('额外指定用户')).toBeInTheDocument();
    expect(screen.getByLabelText(/机构金融部/)).toBeChecked();
  });
});

describe('connector-only publishing', () => {
  it('prefills a new version from the previous connector configuration', () => {
    const connectorConfig = {
      primaryType: 'mcp',
      authMode: 'oauth',
      hasSkill: false,
      oauth: { issuer: 'https://accounts.example.com', resource: 'https://api.example.com', scopes: ['read'] },
      mcp: { serverName: 'search', transport: 'streamableHttp', address: 'https://api.example.com/mcp', timeout: 45000 },
      cli: null,
    };
    const { container } = render(
      <PublishPage
        t={getMarketCopy('zh-CN')}
        locale="zh-CN"
        initialItem={{ ...initialItem, id: 'demo-connector', type: 'connector', metadata: { connectorPublishConfig: JSON.stringify(connectorConfig) } }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isPublishing={false}
      />,
    );

    expect(container.querySelector('[name="connectorAuthMode"]')).toHaveValue('oauth');
    expect(container.querySelector('[name="connectorOAuthIssuer"]')).toHaveValue('https://accounts.example.com');
    expect(container.querySelector('[name="connectorOAuthResource"]')).toHaveValue('https://api.example.com');
    expect(container.querySelector('[name="mcpServerName"]')).toHaveValue('search');
    expect(container.querySelector('[name="mcpAddress"]')).toHaveValue('https://api.example.com/mcp');
    expect(container.querySelector('[name="mcpTimeout"]')).toHaveValue(45000);
  });

  it('collects the fields needed to assemble a complete connector package', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    const publishTypeLabels = Array.from(container.querySelectorAll('.publish-type-card strong')).map((node) => node.textContent);
    expect(publishTypeLabels).toContain('连接器');
    expect(publishTypeLabels).not.toContain('MCP');
    expect(publishTypeLabels).not.toContain('CLI 工具');

    fireEvent.click(screen.getByText('连接器'));
    expect(container.querySelector('[name="type"]')).toHaveValue('connector');
    expect(container.querySelector('[name="connectorHasMCP"]')).toBeChecked();
    expect(container.querySelector('[name="connectorPrimaryType"]')).toHaveValue('mcp');
    expect(container.querySelector('[name="connectorAuthMode"]')).toHaveValue('null');
    expect(container.querySelector('[name="mcpTransport"]')).toHaveValue('streamableHttp');
    expect(container.querySelector('[name="mcpAddress"]')).toBeRequired();
    expect(container.querySelector('[name="variantArtifact.0"]')).not.toBeInTheDocument();

    fireEvent.change(container.querySelector('[name="connectorAuthMode"]'), { target: { value: 'token' } });
    expect(container.querySelector('[name="connectorTokenKey"]')).toHaveAttribute('type', 'hidden');
    expect(container.querySelector('[name="connectorTokenKey"]')).toHaveValue('API_KEY');
    expect(container.querySelector('[name="connectorTokenLabel"]')).toHaveValue('API Key');

    fireEvent.click(container.querySelector('[name="connectorHasCLI"]'));
    fireEvent.click(container.querySelector('[name="connectorHasSKILL"]'));
    expect(container.querySelector('[name="cliMinVersion"]')).toHaveAttribute('type', 'hidden');
    expect(container.querySelector('[name="cliMinVersion"]')).toHaveValue('1.0.0');
    expect(container.querySelector('[name="cliTargetSystem"]')).toHaveValue('darwin');
    expect(container.querySelector('[name="connectorTargetOS.0"]')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('添加随包可执行文件（可选）'));
    expect(container.querySelector('[name="connectorTargetOS.0"]')).toHaveValue('darwin');
    expect(container.querySelector('[name="connectorTargetArch.0"]')).toHaveValue('arm64');
    expect(container.querySelector('[name="connectorCLIArchive.darwin-arm64"]')).toHaveAttribute('accept', 'application/zip,.zip');
    expect(container.querySelector('[name="connectorSkillsArchive"]')).toBeRequired();
    expect(container.querySelector('[name="connectorSkillsArchive"]')).toHaveAttribute('accept', 'application/zip,.zip');
    expect(screen.getByText(/提交时市场会生成标准目录/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('连接器高级配置'));
    expect(container.querySelector('[name="connectorTokenKey"]')).toBeRequired();
    expect(container.querySelector('[name="mcpServerName"]')).toHaveValue('main');
    expect(container.querySelector('[name="mcpTimeout"]')).toHaveValue(30000);
  });

  it('infers the primary type unless both MCP and CLI are enabled', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );
    fireEvent.click(screen.getByText('连接器'));

    expect(container.querySelector('[name="connectorPrimaryType"]')).toHaveAttribute('type', 'hidden');
    expect(container.querySelector('[name="connectorPrimaryType"]')).toHaveValue('mcp');
    fireEvent.click(container.querySelector('[name="connectorHasCLI"]'));
    expect(container.querySelector('[name="connectorPrimaryType"]')).not.toHaveAttribute('type', 'hidden');
  });

  it('edits one CLI operating system at a time and preserves commands while switching', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );
    fireEvent.click(screen.getByText('连接器'));
    fireEvent.click(container.querySelector('[name="connectorHasCLI"]'));

    const system = container.querySelector('[name="cliTargetSystem"]');
    const darwinVersion = container.querySelector('[name="cliVersionDarwin"]');
    fireEvent.change(darwinVersion, { target: { value: 'tool --version' } });
    expect(screen.queryByText('versionCheck · linux')).not.toBeInTheDocument();

    fireEvent.change(system, { target: { value: 'linux' } });
    expect(container.querySelector('[name="cliVersionLinux"]')).toBeVisible();
    fireEvent.change(container.querySelector('[name="cliVersionLinux"]'), { target: { value: 'tool-linux --version' } });

    fireEvent.change(system, { target: { value: 'darwin' } });
    expect(container.querySelector('[name="cliVersionDarwin"]')).toHaveValue('tool --version');
    expect(container.querySelector('[name="cliVersionLinux"]')).toHaveValue('tool-linux --version');
  });

  it('collects separate OS and architecture targets for connector artifacts', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );
    fireEvent.click(screen.getByText('连接器'));
    fireEvent.click(container.querySelector('[name="connectorHasCLI"]'));

    fireEvent.click(screen.getByText('添加随包可执行文件（可选）'));
    expect(container.querySelector('[name="connectorTargetOS.0"]')).toHaveValue('darwin');
    expect(container.querySelector('[name="connectorTargetArch.0"]')).toHaveValue('arm64');
    expect(container.querySelector('[name="connectorCLIArchive.darwin-arm64"]')).toBeInTheDocument();

    fireEvent.change(container.querySelector('[name="cliTargetSystem"]'), { target: { value: 'linux' } });
    fireEvent.click(screen.getByText('添加随包可执行文件（可选）'));
    expect(container.querySelector('[name="connectorTargetOS.1"]')).toHaveValue('linux');
    expect(container.querySelector('[name="connectorTargetArch.1"]')).toHaveValue('amd64');
    expect(container.querySelector('[name="connectorCLIArchive.linux-amd64"]')).toBeInTheDocument();
  });

  it('allows stdio MCP packages to carry a binary and avoids duplicate default targets', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );
    fireEvent.click(screen.getByText('连接器'));
    fireEvent.change(container.querySelector('[name="mcpTransport"]'), { target: { value: 'stdio' } });

    fireEvent.click(screen.getByText('添加随包 stdio 可执行文件（可选）'));
    fireEvent.click(screen.getByText('添加随包 stdio 可执行文件（可选）'));
    expect(container.querySelector('[name="connectorTargetOS.0"]')).toHaveValue('darwin');
    expect(container.querySelector('[name="connectorTargetArch.0"]')).toHaveValue('arm64');
    expect(container.querySelector('[name="connectorTargetOS.1"]')).toHaveValue('darwin');
    expect(container.querySelector('[name="connectorTargetArch.1"]')).toHaveValue('amd64');

    fireEvent.change(container.querySelector('[name="connectorAuthMode"]'), { target: { value: 'token' } });
    fireEvent.click(screen.getByText('连接器高级配置'));
    expect(container.querySelector('[name="connectorTokenEnvName"]')).toBeRequired();
  });

  it('shows authentication-specific fields and locks MCP OAuth to HTTP MCP', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );
    fireEvent.click(screen.getByText('连接器'));

    fireEvent.change(container.querySelector('[name="connectorAuthMode"]'), { target: { value: 'oauth' } });
    expect(container.querySelector('[name="connectorOAuthIssuer"]')).toBeRequired();
    expect(container.querySelector('[name="connectorOAuthResource"]')).toBeRequired();

    fireEvent.change(container.querySelector('[name="connectorAuthMode"]'), { target: { value: 'mcp' } });
    expect(container.querySelector('[name="connectorHasMCP"][type="checkbox"]')).toBeChecked();
    expect(container.querySelector('[name="connectorHasMCP"][type="checkbox"]')).toBeDisabled();
    expect(container.querySelector('[name="mcpTransport"]')).toHaveValue('streamableHttp');
    expect(container.querySelector('[name="mcpTransport"]')).toBeDisabled();
  });
});

describe('guided publish workflow', () => {
  it('requires MCP or CLI before advancing a connector release', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    fireEvent.click(screen.getByText('连接器'));
    fireEvent.click(container.querySelector('[name="connectorHasMCP"]'));
    fireEvent.click(screen.getByText('下一步：填写发布信息'));

    expect(container.querySelector('form')).toHaveClass('is-artifact');
    expect(screen.getByRole('alert')).toHaveTextContent('请至少选择 MCP 或 CLI；Skill 只能作为附加能力。');
  });

  it('does not repeat connector type settings in the market details step', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    fireEvent.click(screen.getByText('连接器'));
    fireEvent.change(container.querySelector('[name="mcpAddress"]'), { target: { value: 'https://example.com/mcp' } });
    fireEvent.click(screen.getByText('下一步：填写发布信息'));

    expect(container.querySelector('form')).toHaveClass('is-details');
    expect(container.querySelector('.publish-section-settings')).toHaveAttribute('hidden');
    expect(container.querySelector('.publish-section-basic')).toBeVisible();
  });

  it('applies first-release and distribution defaults without asking the developer to fill them', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    fireEvent.click(screen.getByText('智能体'));
    expect(container.querySelector('[name="version"]')).toHaveAttribute('type', 'hidden');
    expect(container.querySelector('[name="version"]')).toHaveValue('1.0.0');
    expect(container.querySelector('[name="accessMode"]')).toHaveAttribute('type', 'hidden');
    expect(screen.getByText('调整范围')).toBeInTheDocument();
  });

  it('keeps skill discovery defaults compact until the developer chooses to adjust them', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    fireEvent.click(screen.getByText('单个技能'));
    expect(screen.getByText('已应用推荐分类')).toBeInTheDocument();
    expect(container.querySelector('[name="skillCategory"]')).toHaveAttribute('type', 'hidden');
    fireEvent.click(screen.getByText('调整'));
    expect(screen.getByLabelText('技能分类')).toBeVisible();
  });

  it('requires the artifact step before moving to market details', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    fireEvent.click(screen.getByText('智能体'));
    const form = container.querySelector('form');
    expect(form).toHaveClass('is-artifact');

    const artifact = container.querySelector('[name="variantArtifact.0"]');
    fireEvent.change(artifact, { target: { files: [new File(['demo'], 'agent.zip', { type: 'application/zip' })] } });
    artifact.removeAttribute('required');
    fireEvent.click(screen.getByText('下一步：填写发布信息'));
    expect(form).toHaveClass('is-details');
  });
});
