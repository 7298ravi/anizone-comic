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

  // Ekstrak list komik dari berbagai bentuk response Komikindo
  extractList(data) {
    return data?.komiklist        // /latest, /library
        ?? data?.results          // /search
        ?? data?.data
        ?? data?.komik
        ?? data?.comics
        ?? (Array.isArray(data) ? data : []);
  },

  // Ekstrak total halaman dari pagination object
  extractTotalPages(data) {
    return data?.pagination?.totalPages
        ?? data?.pagination?.total_pages
        ?? data?.total_pages
        ?? data?.totalPages
        ?? 1;
  },

  getLatest(page = 1) {
    return this.fetch(`/comic/komikindo/latest/${page}`);
  },

  getLibrary({ genre = '', type = '', search = '', page = 1 } = {}) {
    const params = new URLSearchParams();
    if (genre)  params.set('genre', genre);
    if (type)   params.set('type', type);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', page);
    const qs = params.toString();
    return this.fetch(`/comic/komikindo/library${qs ? '?' + qs : ''}`);
  },

  getGenres() {
    return this.fetch('/comic/komikindo/genres');
  },

  search(query, page = 1) {
    return this.fetch(`/comic/komikindo/search/${encodeURIComponent(query)}/${page}`);
  },

  getDetail(slug) {
    return this.fetch(`/comic/komikindo/detail/${slug}`);
  },

  getChapter(slug) {
    return this.fetch(`/comic/komikindo/chapter/${slug}`);
  },
};
