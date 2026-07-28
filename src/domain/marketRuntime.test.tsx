import { describe, expect, it } from 'vitest';
import { mergeCatalogItem } from './market';

describe('market catalog normalization', () => {
  it('normalizes detail views while loading a catalog item', () => {
    const item = mergeCatalogItem({
      id: 'demo',
      type: 'plugin',
      detailViewCount: '12',
    });

    expect(item.detailViewCount).toBe(12);
  });
});
