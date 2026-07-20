import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeDetailViewCount,
  openMarketDetails,
  reportDetailView,
  selectDetailOpener,
  summarizeDetailViews,
} from './detailViews.js';

test('selects reporting only for market detail surfaces', () => {
  const calls = [];
  const plainOpener = (item) => calls.push(`plain:${item.id}`);
  const reportingOpener = (item) => calls.push(`reporting:${item.id}`);

  for (const [surface, expected] of [
    ['market', 'reporting'],
    ['creator', 'plain'],
    ['admin', 'plain'],
    ['favorite', 'plain'],
    ['internal', 'plain'],
  ]) {
    const opener = selectDetailOpener(surface, {
      market: reportingOpener,
      plain: plainOpener,
    });
    opener({ id: surface });
    assert.equal(calls.at(-1), `${expected}:${surface}`);
  }
});

test('reports one encoded detail view with POST', async () => {
  const calls = [];
  await reportDetailView({
    apiBase: '/api/v1',
    route: 'software-packages',
    id: 'python runtime',
    requestJSON: async (...args) => calls.push(args),
  });
  assert.deepEqual(calls, [[
    '/api/v1/software-packages/python%20runtime/view',
    { method: 'POST' },
  ]]);
});

test('swallows reporting failures so details remain usable', async () => {
  await assert.doesNotReject(() => reportDetailView({
    apiBase: '/api/v1',
    route: 'skills',
    id: 'demo',
    requestJSON: async () => { throw new Error('offline'); },
  }));
});

test('opens details before asynchronous reporting finishes', async () => {
  const events = [];
  let finishReporting;
  const pendingRequest = new Promise((resolve) => { finishReporting = resolve; });

  const reporting = openMarketDetails({
    item: { id: 'demo' },
    openDetails: () => events.push('opened'),
    apiBase: '/api/v1',
    route: 'skills',
    requestJSON: async () => {
      await pendingRequest;
      events.push('reported');
    },
  });

  assert.deepEqual(events, ['opened']);
  finishReporting();
  await reporting;
  assert.deepEqual(events, ['opened', 'reported']);
});

test('normalizes creator detail view counts', () => {
  assert.equal(normalizeDetailViewCount(12), 12);
  assert.equal(normalizeDetailViewCount('7'), 7);
  assert.equal(normalizeDetailViewCount(0), 0);
  assert.equal(normalizeDetailViewCount(-1), 0);
  assert.equal(normalizeDetailViewCount('invalid'), 0);
});

test('accepts only nonnegative safe whole detail view counts', () => {
  assert.equal(normalizeDetailViewCount('12items'), 0);
  assert.equal(normalizeDetailViewCount('1e2'), 100);
  assert.equal(normalizeDetailViewCount('7.9'), 0);
  assert.equal(normalizeDetailViewCount(), 0);
  assert.equal(normalizeDetailViewCount(null), 0);
  assert.equal(normalizeDetailViewCount(Number.MAX_SAFE_INTEGER + 1), 0);
  assert.equal(normalizeDetailViewCount(String(Number.MAX_SAFE_INTEGER + 1)), 0);
});

test('rejects non-number and non-string detail view count types', () => {
  assert.equal(normalizeDetailViewCount(true), 0);
  assert.equal(normalizeDetailViewCount(false), 0);
  assert.equal(normalizeDetailViewCount([7]), 0);
  assert.equal(normalizeDetailViewCount(['8']), 0);
  assert.equal(normalizeDetailViewCount({ value: 9 }), 0);
  assert.equal(normalizeDetailViewCount(Symbol('10')), 0);
  assert.equal(normalizeDetailViewCount(11n), 0);
});

test('sums normalized creator detail view counts', () => {
  assert.equal(summarizeDetailViews([
    { detailViewCount: 3 },
    { detailViewCount: '1e2' },
    { detailViewCount: '12items' },
    { detailViewCount: '7.9' },
    { detailViewCount: Number.MAX_SAFE_INTEGER + 1 },
  ]), 103);
});
