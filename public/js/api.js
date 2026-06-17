/* =============================================
   API.JS — Updated for sankavollerei.web.id/comic
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id/comic';

const api = {
  async fetch(path) {
    try {
      const res = await fetch(API_BASE + path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  extractList(data) {
    return data?.data?.comics || 
           data?.data || 
           data?.results || 
           data?.komiklist || 
           (Array.isArray(data) ? data : []);
  },

  extractTotalPages(data) {
    return data?.data?.pagination?.totalPages ||
           data?.pagination?.totalPages ||
           data?.totalPages || 1;
  },

  // Komik Terbaru
  getLatest(page = 1) {
    return this.fetch(`/terbaru?page=${page}`);
  },

  // Library / Pustaka
  getLibrary({ type = '', page = 1 } = {}) {
    const params = new URLSearchParams({ page });
    if (type) params.set('type', type);
    return this.fetch(`/pustaka?${params}`);
  },

  // Search
  search(query, page = 1) {
    if (!query) return Promise.resolve({});
    const params = new URLSearchParams({ q: query, page });
    return this.fetch(`/search?${params}`);
  },

  // Detail
  getDetail(slug) {
    return this.fetch(`/comic/${encodeURIComponent(slug)}`);
  },

  // Chapter
  getChapter(slug) {
    return this.fetch(`/chapter/${encodeURIComponent(slug)}`);
  }
};

console.log('✅ AniZone API loaded successfully');
window.api = api;
