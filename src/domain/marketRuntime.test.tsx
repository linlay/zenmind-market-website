import { describe, expect, it } from 'vitest';
import {
  isMarketTypeVisible,
  marketBrand,
  mergeCatalogItem,
  sidebarCategoryMeta,
} from './market';

describe('market catalog normalization', () => {
  it('normalizes detail views while loading a catalog item', () => {
    const item = mergeCatalogItem({
      id: 'demo',
      type: 'plugin',
      detailViewCount: '12',
    });

    expect(item.detailViewCount).toBe(12);
  });

  it('maps internal review workflow states to the existing UI states', () => {
    expect(mergeCatalogItem({ id: 'security', type: 'skill', reviewStatus: 'security_pending' }).reviewStatus).toBe('pending');
    expect(mergeCatalogItem({ id: 'admin', type: 'skill', pendingReviewStatus: 'admin_pending' }).pendingReviewStatus).toBe('pending');
    expect(mergeCatalogItem({ id: 'rejected', type: 'skill', reviewStatus: 'security_rejected' }).reviewStatus).toBe('rejected');
  });

  it('uses localized capability-market branding without a ZenMind label', () => {
    expect(marketBrand.name['zh-CN']).toBe('功能市场');
    expect(marketBrand.name['en-US']).toBe('Capability Market');
  });

  it('hides disabled market categories while retaining their data-model types', () => {
    const categoryIDs = sidebarCategoryMeta.map((category) => category.id);

    expect(categoryIDs).not.toContain('plugin');
    expect(categoryIDs).not.toContain('sandbox-image');
    expect(categoryIDs).not.toContain('pet');
    expect(categoryIDs).not.toContain('website-app');
    expect(isMarketTypeVisible('agent')).toBe(true);
    expect(isMarketTypeVisible('plugin')).toBe(false);
    expect(isMarketTypeVisible('pet')).toBe(false);
  });
});
