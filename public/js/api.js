/* =============================================
   API.JS — Centralized API Layer
   Proxy via Vercel rewrites → sankavollerei.web.id
   ============================================= */

// Gunakan path relatif /api/comic/... agar di-proxy oleh Vercel
// sehingga tidak kena CORS block di browser
const API_BASE = '/api/comic';

const api = {
  async fetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // BacaKomik selalu pakai komiklist[]
  extractList(data) {
    return data?.komiklist ?? data?.results ?? data?.data ?? (Array.isArray(data) ? data : []);
  },

  // BacaKomik pakai hasNextPage (boolean), bukan totalPages
  extractTotalPages(data, currentPage = 1) {
    if (data?.totalPages) return data.totalPages;
    if (data?.total_pages) return data.total_pages;
    if (typeof data?.hasNextPage === 'boolean') {
      return data.hasNextPage ? currentPage + 1 : currentPage;
    }
    return 1;
  },

  // GET /comic/bacakomik/latest
  getLatest() {
    return this.fetch('/bacakomik/latest');
  },

  // GET /comic/bacakomik/only/:type  (manga | manhwa | manhua)
  // GET /comic/bacakomik/populer     (semua)
  getLibrary({ type = '', genre = '' } = {}) {
    if (genre) {
      return this.fetch(`/bacakomik/genre/${encodeURIComponent(genre)}`);
    }
    if (type) {
      return this.fetch(`/bacakomik/only/${encodeURIComponent(type)}`);
    }
    return this.fetch('/bacakomik/populer');
  },

  // GET /comic/bacakomik/genres
  getGenres() {
    return this.fetch('/bacakomik/genres');
  },

  // GET /comic/bacakomik/search/:query
  search(query) {
    return this.fetch(`/bacakomik/search/${encodeURIComponent(query)}`);
  },

  // GET /comic/bacakomik/detail/:slug
  getDetail(slug) {
    return this.fetch(`/bacakomik/detail/${slug}`);
  },

  // GET /comic/bacakomik/chapter/:slug
  getChapter(slug) {
    return this.fetch(`/bacakomik/chapter/${slug}`);
  },
};
