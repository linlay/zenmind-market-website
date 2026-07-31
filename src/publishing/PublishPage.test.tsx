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
});
