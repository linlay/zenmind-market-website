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

describe('publish mcp source', () => {
  it('switches between gateway and custom MCP sources', () => {
    const { container } = render(
      <PublishPage t={getMarketCopy('zh-CN')} locale="zh-CN" onClose={vi.fn()} onSubmit={vi.fn()} isPublishing={false} />,
    );

    fireEvent.click(screen.getByText('MCP'));
    expect(container.querySelector('[name="mcpSource"]')).toHaveValue('gateway');
    expect(container.querySelector('.mcp-picker')).toBeInTheDocument();
    expect(container.querySelector('[name="mcpEndpointUrl"]')).not.toBeRequired();

    fireEvent.click(screen.getByText('自定义地址'));
    expect(container.querySelector('[name="mcpSource"]')).toHaveValue('custom');
    expect(container.querySelector('.mcp-picker')).not.toBeInTheDocument();
    expect(container.querySelector('[name="mcpEndpointUrl"]')).toBeRequired();
    expect(container.querySelector('[name="mcpCustomServerKey"]')).toBeInTheDocument();
    expect(container.querySelector('[name="mcpCustomTools"]')).toBeInTheDocument();

    fireEvent.click(screen.getByText('从网关选择'));
    expect(container.querySelector('[name="mcpSource"]')).toHaveValue('gateway');
    expect(container.querySelector('.mcp-picker')).toBeInTheDocument();
  });

  it('locks the custom source when publishing a new version', () => {
    const { container } = render(
      <PublishPage
        t={getMarketCopy('zh-CN')}
        locale="zh-CN"
        initialItem={{
          ...initialItem,
          id: 'partner-search-mcp',
          type: 'mcp',
          mcpSource: 'custom',
          mcpServerCode: '',
          mcpEndpointUrl: 'https://mcp.partner.test/search/mcp',
        }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isPublishing={false}
      />,
    );

    expect(container.querySelector('[name="mcpSource"]')).toHaveValue('custom');
    expect(screen.getByText('https://mcp.partner.test/search/mcp')).toBeInTheDocument();
    expect(container.querySelector('.mcp-source-toggle')).not.toBeInTheDocument();
    expect(container.querySelector('[name="mcpEndpointUrl"]')).toHaveValue('https://mcp.partner.test/search/mcp');
  });
});
