
const KEY = "recently_viewed_products";
const MAX_ITEMS = 100; 
export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error("getRecentlyViewed error", e);
    return [];
  }
}

export function addRecentlyViewed(item) {
  try {
    const id = typeof item === "string" ? item : item?._id;
    if (!id) return;

    const current = getRecentlyViewed();
    const filtered = current.filter((x) => x !== id);
    filtered.unshift(id); 
    const trimmed = filtered.slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("addRecentlyViewed error", e);
  }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(KEY);
}
