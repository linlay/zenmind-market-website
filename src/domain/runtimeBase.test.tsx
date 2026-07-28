import { describe, expect, it } from 'vitest';
import { normalizeBasePath } from './runtimeBase';

describe('runtime deployment base path', () => {
  it.each([
    [undefined, ''],
    ['', ''],
    ['/', ''],
    ['./', ''],
    ['/market', '/market'],
    ['/market/', '/market'],
    ['market/nested', '/market/nested'],
  ])('normalizes %s to %s', (value, expected) => {
    expect(normalizeBasePath(value)).toBe(expected);
  });
});
