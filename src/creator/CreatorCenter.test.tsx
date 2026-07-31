import { describe, expect, it } from 'vitest';
import { hasPublishedRelease, publicationState } from './CreatorCenter';

describe('creator inventory actions', () => {
  it('hides published-data actions for a first release that has not passed review', () => {
    expect(hasPublishedRelease({ reviewStatus: 'pending', published: false })).toBe(false);
    expect(hasPublishedRelease({ reviewStatus: 'rejected', published: false })).toBe(false);
  });

  it('keeps published-data actions while a newer version is under review', () => {
    expect(hasPublishedRelease({
      reviewStatus: 'approved',
      pendingReviewStatus: 'pending',
      published: true,
    })).toBe(true);
  });

  it('does not treat an approved but unpublished release as available in the market', () => {
    const item = { reviewStatus: 'approved', published: false };
    expect(hasPublishedRelease(item)).toBe(false);
    expect(publicationState(item)).toBe('unpublished');
  });

  it('distinguishes releases that have never been published', () => {
    expect(publicationState({ reviewStatus: 'pending', published: false })).toBe('not-published');
    expect(publicationState({ reviewStatus: 'rejected', published: false })).toBe('not-published');
    expect(publicationState({ reviewStatus: 'approved', published: true })).toBe('published');
  });
});
