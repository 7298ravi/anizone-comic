/* =============================================
   API.JS — Centralized API Layer
   Base URL: https://www.sankavollerei.web.id
   Source: Komikindo endpoints
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id';

const api = {
  async fetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  extractList(data) {
    return data?.data ?? data?.komik ?? data?.comics ?? data?.results ?? (Array.isArray(data) ? data : []);
  },

  // GET /comic/komikindo/latest/:page
  getLatest(page = 1) {
    return this.fetch(`/comic/komikindo/latest/${page}`);
  },

  // GET /comic/komikindo/library (support filter genre, type, search via query string)
  getLibrary({ genre = '', type = '', search = '', page = 1 } = {}) {
    const params = new URLSearchParams();
    if (genre)  params.set('genre', genre);
    if (type)   params.set('type', type);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', page);
    const qs = params.toString();
    return this.fetch(`/comic/komikindo/library${qs ? '?' + qs : ''}`);
  },

  // GET /comic/komikindo/genres
  getGenres() {
    return this.fetch('/comic/komikindo/genres');
  },

  // GET /comic/komikindo/search/:query/:page
  search(query, page = 1) {
    return this.fetch(`/comic/komikindo/search/${encodeURIComponent(query)}/${page}`);
  },

  // GET /comic/komikindo/detail/:slug
  getDetail(slug) {
    return this.fetch(`/comic/komikindo/detail/${slug}`);
  },

  // GET /comic/komikindo/chapter/:slug
  getChapter(slug) {
    return this.fetch(`/comic/komikindo/chapter/${slug}`);
  },
};
