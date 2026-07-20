export function normalizeDetailViewCount(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return 0;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function summarizeDetailViews(items) {
  return items.reduce((sum, item) => sum + normalizeDetailViewCount(item.detailViewCount), 0);
}

export function selectDetailOpener(surface, { market, plain }) {
  return surface === 'market' ? market : plain;
}

export async function reportDetailView({ apiBase, route, id, requestJSON }) {
  try {
    await requestJSON(`${apiBase}/${route}/${encodeURIComponent(id)}/view`, {
      method: 'POST',
    });
  } catch {
    return undefined;
  }
  return undefined;
}

export function openMarketDetails({ item, openDetails, apiBase, route, requestJSON }) {
  openDetails(item);
  return reportDetailView({ apiBase, route, id: item.id, requestJSON });
}
