import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getMarketCopy } from '../i18n/marketCopy';
import { ReviewDetailModal, VersionHistoryModal } from './ManagementViews';

describe('review detail modal', () => {
  it('renders its loading state before review data arrives', () => {
    render(
      <ReviewDetailModal
        state={{
          item: {
            id: 'test-cli',
            type: 'cli-tool',
            name: 'zpr-test-1',
            version: '1.0.0',
          },
          status: 'loading',
          detail: null,
          error: '',
        }}
        locale="zh-CN"
        t={getMarketCopy('zh-CN')}
        reviewingKey=""
        onReview={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: '组件审核' })).toBeInTheDocument();
    expect(screen.getByText('正在加载审核详情...')).toBeInTheDocument();
  });

  it('renders a review response containing nullable catalog fields', () => {
    const detail = {
      item: {
        id: 'test-cli',
        type: 'cli-tool',
        name: 'zpr-test-1',
        version: '1.0.0',
        description: 'test',
        tags: null,
        dependencies: null,
        reviewStatus: 'pending',
        assets: {
          universal: {
            archiveType: 'zip',
            sizeBytes: 3163,
          },
        },
        platforms: {
          universal: {
            platform: 'universal',
            metadata: {},
            dependencies: [],
          },
        },
      },
      creator: {
        id: '129943',
        username: 'zhengpuruo',
        name: '郑普若',
      },
      submittedAt: '2026-07-22T07:42:43.500898095Z',
      isUpdate: false,
      validationChecks: [
        {
          key: 'metadata',
          status: 'passed',
          message: 'Component metadata is valid.',
        },
      ],
      artifacts: [
        {
          platformKey: 'universal',
          fileName: 'developer-workflow-pack-1.0.0.zip',
          archiveType: 'zip',
          assetRole: 'primary',
          url: '/api/v1/admin/reviews/cli-tool/test-cli/artifact/download?platform=universal&version=1.0.0',
          sizeBytes: 3163,
          files: [
            {
              path: 'manifest.json',
              sizeBytes: 960,
            },
          ],
        },
      ],
      changes: [],
      history: [
        {
          id: 24,
          toStatus: 'pending',
          actorId: '129943',
          createdAt: '2026-07-22T07:42:43.500898095Z',
        },
      ],
    };

    render(
      <ReviewDetailModal
        state={{ item: detail.item, status: 'ready', detail, error: '' }}
        locale="zh-CN"
        t={getMarketCopy('zh-CN')}
        reviewingKey=""
        onReview={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: '组件审核' })).toBeInTheDocument();
    expect(screen.getByText('zpr-test-1')).toBeInTheDocument();
    expect(screen.getByText('developer-workflow-pack-1.0.0.zip')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '下载' })).toHaveAttribute(
      'href',
      '/api/v1/admin/reviews/cli-tool/test-cli/artifact/download?platform=universal&version=1.0.0',
    );
  });
});

describe('version history modal', () => {
  it('renders its loading state before versions arrive', () => {
    render(
      <VersionHistoryModal
        state={{
          item: {
            id: 'test-cli',
            type: 'cli-tool',
            name: 'zpr-test-1',
            version: '1.0.0',
          },
          status: 'loading',
          versions: [],
          error: '',
        }}
        locale="zh-CN"
        t={getMarketCopy('zh-CN')}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: '版本历史' })).toBeInTheDocument();
    expect(screen.getByText('正在加载市场')).toBeInTheDocument();
  });
});
