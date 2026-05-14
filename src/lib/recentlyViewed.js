const LS_KEY = "@ga-brasil:recently-viewed";
const MAX = 6;

export function addRecentlyViewed(id) {
  try {
    const prev = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentlyViewedIds() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
