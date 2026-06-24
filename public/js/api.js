/* =============================================
   ANIME API.JS — AniPub Anime API Layer
   ============================================= */

const API_BASE = 'https://www.anipub.xyz';

const api = {
  async fetch(path, options = {}) {
    const res = await fetch(API_BASE + path, options);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
  },

  /* =========================
     Helpers
  ========================= */

  fixImage(url) {
    if (!url) return '';
    return url.startsWith('https://')
      ? url
      : `${API_BASE}/${url}`;
  },

  extractList(data) {
    return (
      data?.wholePage ||
      data?.AniData ||
      data?.results ||
      data?.data ||
      (Array.isArray(data) ? data : [])
    );
  },

  /* =========================
     Home / Latest
  ========================= */

  async getTopRated(page = 1) {
    return this.fetch(`/api/findbyrating?page=${page}`);
  },

  async getGenre(genre, page = 1) {
    return this.fetch(
      `/api/findbyGenre/${encodeURIComponent(genre)}?Page=${page}`
    );
  },

  /* =========================
     Search
  ========================= */

  async search(query) {
    return this.fetch(
      `/api/search/${encodeURIComponent(query)}`
    );
  },

  async searchAll(query, page = 1) {
    return this.fetch(
      `/api/searchall/${encodeURIComponent(query)}?page=${page}`
    );
  },

  /* =========================
     Anime Info
  ========================= */

  async getInfo(idOrSlug) {
    const data = await this.fetch(
      `/api/info/${idOrSlug}`
    );

    if (data.ImagePath) {
      data.ImagePath = this.fixImage(data.ImagePath);
    }

    if (data.Cover) {
      data.Cover = this.fixImage(data.Cover);
    }

    return data;
  },

  /* =========================
     Full Details + Characters
  ========================= */

  async getFullDetails(id) {
    const data = await this.fetch(
      `/anime/api/details/${id}`
    );

    if (data?.local?.ImagePath) {
      data.local.ImagePath = this.fixImage(
        data.local.ImagePath
      );
    }

    if (data?.local?.Cover) {
      data.local.Cover = this.fixImage(
        data.local.Cover
      );
    }

    return data;
  },

  /* =========================
     Episodes / Streaming
  ========================= */

  async getEpisodes(id) {
    const data = await this.fetch(
      `/v1/api/details/${id}`
    );

    const src = (link) =>
      link?.replace('src=', '');

    const episodes = [];

    // Episode 1
    if (data?.local?.link) {
      episodes.push({
        episode: 1,
        link: src(data.local.link),
      });
    }

    // Episode 2+
    if (Array.isArray(data?.local?.ep)) {
      data.local.ep.forEach((ep, index) => {
        episodes.push({
          episode: index + 2,
          link: src(ep.link),
        });
      });
    }

    return episodes;
  },

  /* =========================
     Find Anime
  ========================= */

  async findAnime(name) {
    return this.fetch(
      `/api/find/${encodeURIComponent(name)}`
    );
  },

  /* =========================
     Check Anime
  ========================= */

  async checkAnime(name, genre) {
    return this.fetch('/api/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: name,
        Genre: genre,
      }),
    });
  },
};

export default api;
