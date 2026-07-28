import { describe, expect, it } from 'vitest';
import { hasPublishedRelease } from './CreatorCenter';

describe('creator inventory actions', () => {
  it('hides published-data actions for a first release that has not passed review', () => {
    expect(hasPublishedRelease({ reviewStatus: 'pending' })).toBe(false);
    expect(hasPublishedRelease({ reviewStatus: 'rejected' })).toBe(false);
  });

  it('keeps published-data actions while a newer version is under review', () => {
    expect(hasPublishedRelease({
      reviewStatus: 'approved',
      pendingReviewStatus: 'pending',
    })).toBe(true);
  });
});
