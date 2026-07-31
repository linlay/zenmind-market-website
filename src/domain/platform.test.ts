import { describe, expect, it } from 'vitest';
import { platformKeyFromSelection } from './platform';

describe('platform selection', () => {
  it.each([
    ['', '', 'universal'],
    ['universal', '', 'universal'],
    ['darwin', 'arm64', 'darwin-arm64'],
    ['darwin', 'amd64', 'darwin-amd64'],
    ['linux', 'amd64', 'linux-amd64'],
    ['windows', '386', 'windows-386'],
  ])('derives %s/%s as %s', (os, arch, expected) => {
    expect(platformKeyFromSelection(os, arch)).toBe(expected);
  });

  it('normalizes platform selections before deriving the key', () => {
    expect(platformKeyFromSelection(' Windows ', 'ARM64')).toBe('windows-arm64');
  });
});
