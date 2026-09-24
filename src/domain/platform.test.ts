import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectClientPlatform, platformKeyFromSelection, preferredPlatformKey } from './platform';

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it('does not guess a CPU architecture when the browser only exposes the OS', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' });
    expect(detectClientPlatform()).toEqual({ os: 'darwin', arch: '', key: 'darwin' });
    expect(preferredPlatformKey({ platformOptions: ['darwin-amd64', 'darwin-arm64'] })).toBe('');
  });

  it('selects the only matching OS artifact when architecture is unavailable', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh)' });
    expect(preferredPlatformKey({ platformOptions: ['darwin-amd64', 'windows-amd64'] })).toBe('darwin-amd64');
  });

  it('honors an explicit platform choice even when automatic detection is ambiguous', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh)' });
    expect(preferredPlatformKey({ platformOptions: ['darwin-amd64', 'darwin-arm64'] }, 'darwin-arm64')).toBe('darwin-arm64');
  });
});
