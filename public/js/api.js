/* =============================================
   API.JS — Centralized API Layer
   Base URL: https://www.sankavollerei.web.id
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id';

const api = {
  async fetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  extractList(data) {
    return data?.data ?? data?.komik ?? data?.comics ?? (Array.isArray(data) ? data : []);
  },

  /**
   * Bersihkan link dari API jadi slug untuk endpoint detail.
   * API mengembalikan link seperti "/manga/judul" atau "/plus/judul" atau "/detail-komik/judul"
   * Endpoint detail butuh: /comic/comic/judul  (tanpa prefix)
   */
  cleanLink(link) {
    if (!link) return '';
    return link
      .replace(/^\/manga\//, '/')
      .replace(/^\/plus\//, '/')
      .replace(/^\/detail-komik\//, '/')
      .replace(/^\//, ''); // hapus leading slash
  },

  getLatest()  { return this.fetch('/comic/terbaru'); },
  getPopular() { return this.fetch('/comic/populer'); },
  getTrending(){ return this.fetch('/comic/trending'); },

  getBrowse({ type = '', order = 'update', page = 1 } = {}) {
    let url = `/comic/browse?page=${page}&order=${order}`;
    if (type) url += `&type=${type}`;
    return this.fetch(url);
  },

  search(query) {
    return this.fetch(`/comic/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Detail komik. Terima slug SUDAH bersih (tanpa prefix /manga/ dsb).
   */
  getDetail(slug) {
    const clean = this.cleanLink(slug);
    return this.fetch(`/comic/comic/${clean}`);
  },

  /**
   * Gambar chapter. chapterLink dari API biasanya sudah berupa path lengkap.
   */
  getChapter(chapterLink) {
    const path = chapterLink.startsWith('/') ? chapterLink : '/' + chapterLink;
    return this.fetch(`/comic/chapter${path}`);
  },

  getGenres()   { return this.fetch('/comic/genres'); },
  getHomepage() { return this.fetch('/comic/homepage'); },
};
