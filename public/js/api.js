/* =============================================
   API.JS — Centralized API Layer
   Base URL: https://www.sankavollerei.web.id
   Source: bacakomik endpoints
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id';

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
  // Pagination manual: kalau ada hasNextPage, anggap ada halaman berikutnya
  extractTotalPages(data, currentPage = 1) {
    if (data?.totalPages) return data.totalPages;
    if (data?.total_pages) return data.total_pages;
    if (typeof data?.hasNextPage === 'boolean') {
      return data.hasNextPage ? currentPage + 1 : currentPage;
    }
    return 1;
  },

  // GET /comic/bacakomik/latest
  getLatest(page = 1) {
    // latest tidak pakai page param berdasarkan endpoint docs
    return this.fetch(`/comic/bacakomik/latest`);
  },

  // GET /comic/bacakomik/only/:type  (manga | manhwa | manhua)
  // GET /comic/bacakomik/list        (semua)
  getLibrary({ type = '', genre = '', page = 1 } = {}) {
    if (genre) {
      return this.fetch(`/comic/bacakomik/genre/${encodeURIComponent(genre)}`);
    }
    if (type) {
      return this.fetch(`/comic/bacakomik/only/${encodeURIComponent(type)}`);
    }
    return this.fetch(`/comic/bacakomik/populer`);
  },

  // GET /comic/bacakomik/genres
  getGenres() {
    return this.fetch('/comic/bacakomik/genres');
  },

  // GET /comic/bacakomik/search/:query
  search(query, page = 1) {
    return this.fetch(`/comic/bacakomik/search/${encodeURIComponent(query)}`);
  },

  // GET /comic/bacakomik/detail/:slug
  // Response: { detail: { title, cover, rating, otherTitle, status, type, author, artist,
  //                        release, series, reader, synopsis, genres:[{title,slug}],
  //                        chapterList:[{title,slug,date}] } }
  getDetail(slug) {
    return this.fetch(`/comic/bacakomik/detail/${slug}`);
  },

  // GET /comic/bacakomik/chapter/:slug
  // Response: { title, images:[ urlString, ... ], navigation:{ next, prev } }
  getChapter(slug) {
    return this.fetch(`/comic/bacakomik/chapter/${slug}`);
  },
};
