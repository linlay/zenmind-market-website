import { describe, expect, it } from 'vitest';
import {
  marketBrand,
  mergeCatalogItem,
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

  it('uses localized capability-market branding without a ZenMind label', () => {
    expect(marketBrand.name['zh-CN']).toBe('功能市场');
    expect(marketBrand.name['en-US']).toBe('Capability Market');
  });
});
