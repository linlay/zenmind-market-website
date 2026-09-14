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
    expect(container.querySelector('[name="connectorTokenKey"]')).toBeRequired();
    expect(container.querySelector('[name="connectorTokenLabel"]')).toBeRequired();

    fireEvent.click(container.querySelector('[name="connectorHasCLI"]'));
    fireEvent.click(container.querySelector('[name="connectorHasSKILL"]'));
    expect(container.querySelector('[name="cliMinVersion"]')).toBeRequired();
    expect(container.querySelector('[name="cliTargetSystem"]')).toHaveValue('darwin');
    expect(container.querySelector('[name="connectorCLIArchive"]')).toHaveAttribute('accept', 'application/zip,.zip');
    expect(container.querySelector('[name="connectorSkill"]')).toBeRequired();
    expect(screen.getByText(/提交时市场会生成标准目录/)).toBeInTheDocument();
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
