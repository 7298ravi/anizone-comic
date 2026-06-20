/* =============================================
   STORAGE.JS — Reading History & Preferences
   Persisted via localStorage
   ============================================= */

const storage = (() => {
  const HISTORY_KEY = 'anizone_history';
  const THEME_KEY   = 'anizone_theme';
  const READ_KEY    = 'anizone_read_chapters';

  /* ---- HISTORY ---- */

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
  }

  function saveHistory(arr) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch {}
  }

  // Simpan/update entri history saat buka chapter
  function addHistory({ slug, title, cover, type, chapSlug, chapName }) {
    let list = getHistory();
    // Hapus entri lama kalau sudah ada slug yang sama
    list = list.filter(h => h.slug !== slug);
    // Tambah di depan (terbaru)
    list.unshift({
      slug,
      title,
      cover: cover || '',
      type:  type  || '',
      chapSlug,
      chapName,
      timestamp: Date.now(),
    });
    // Max 50 entries
    if (list.length > 50) list = list.slice(0, 50);
    saveHistory(list);
  }

  function removeHistory(slug) {
    const list = getHistory().filter(h => h.slug !== slug);
    saveHistory(list);
  }

  function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  }

  /* ---- READ CHAPTERS ---- */

  function getReadChapters(slug) {
    try {
      const all = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
      return all[slug] || [];
    } catch { return []; }
  }

  function markChapterRead(slug, chapSlug) {
    try {
      const all = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
      if (!all[slug]) all[slug] = [];
      if (!all[slug].includes(chapSlug)) all[slug].push(chapSlug);
      localStorage.setItem(READ_KEY, JSON.stringify(all));
    } catch {}
  }

  /* ---- THEME ---- */

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function setTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }

  return { getHistory, addHistory, removeHistory, clearHistory, getReadChapters, markChapterRead, getTheme, setTheme };
})();
