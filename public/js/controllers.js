/* =============================================
   CONTROLLERS.JS — Feature Controllers
   ============================================= */

/* ---- HOME ---- */
const homeController = {
  async load() {
    router.go('home');
    this.loadLatest(1);
  },

  async loadLatest(page = 1) {
    ui.loading('grid-latest');
    try {
      const data   = await api.getLatest(page);
      const comics = api.extractList(data);
      ui.renderGrid('grid-latest', comics);

      const total = api.extractTotalPages(data);
      ui.renderPagination('home-pages', page, total,
        (p) => homeController.loadLatest(p));
    } catch (e) {
      ui.error('grid-latest', `Gagal memuat komik terbaru: ${e.message}`);
    }
  },
};

/* ---- LIBRARY / BROWSE ---- */
const browseController = {
  genre: '',
  type:  '',
  page:  1,

  async load() {
    router.go('browse');
    this.fetchData();
  },

  setType(type, btnEl) {
    document.querySelectorAll('#type-filter .filter-chip')
      .forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    this.type = type;
    this.page = 1;
    this.fetchData();
  },

  async fetchData() {
    ui.loading('grid-browse');
    try {
      const data   = await api.getLibrary({ genre: this.genre, type: this.type, page: this.page });
      const comics = api.extractList(data);
      ui.renderGrid('grid-browse', comics);

      const total = api.extractTotalPages(data);
      const page  = this.page;
      ui.renderPagination('browse-pages', page, total, (p) => {
        browseController.page = p;
        browseController.fetchData();
      });
    } catch (e) {
      ui.error('grid-browse', `Gagal memuat library: ${e.message}`);
    }
  },
};

/* ---- SEARCH ---- */
const searchController = {
  lastQuery: '',
  page: 1,

  async run(page = 1) {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    this.lastQuery = query;
    this.page = page;

    router.go('search');
    document.getElementById('search-heading').textContent = `Hasil: "${query}"`;
    ui.loading('grid-search');

    try {
      const data   = await api.search(query, page);
      const comics = api.extractList(data);
      ui.renderGrid('grid-search', comics);

      const total = api.extractTotalPages(data);
      ui.renderPagination('search-pages', page, total,
        (p) => searchController.run(p));
    } catch (e) {
      ui.error('grid-search', `Pencarian gagal: ${e.message}`);
    }
  },
};

/* ---- DETAIL ---- */
const detailController = {
  currentSlug: null,
  chapters: [],

  async open(slug) {
    if (!slug) return;
    this.currentSlug = slug;
    this.chapters    = [];

    router.go('detail');
    ui.el('detail-content').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat detail...</div>';

    try {
      const data  = await api.getDetail(slug);
      // Komikindo response: { comic: {..., chapters: [...] } }
      const comic = data?.comic ?? data?.data ?? data;
      const chaps = comic?.chapters || [];
      this.chapters = chaps;

      ui.el('detail-content').innerHTML = ui.renderDetail(
        comic, chaps,
        (chapSlug, idx) => readerController.open(chapSlug, idx)
      );
    } catch (e) {
      ui.el('detail-content').innerHTML =
        `<div class="error-msg">Gagal memuat detail: ${e.message}</div>`;
    }
  },
};

/* ---- READER ---- */
const readerController = {
  currentIndex: 0,

  async open(chapSlug, index) {
    if (!chapSlug) return;
    this.currentIndex = index;

    router.go('reader');
    ui.el('reader-images').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat gambar chapter...</div>';
    this.updateNav();

    const chap = detailController.chapters[index];
    ui.el('reader-title').textContent =
      chap?.title || chap?.chapter || chap?.name || `Chapter ${index + 1}`;

    try {
      const data   = await api.getChapter(chapSlug);
      // Komikindo: { images: [...], navigation: { prev, next } }
      const images = data?.images ?? data?.data ?? data?.pages ?? (Array.isArray(data) ? data : []);
      this._navigation = data?.navigation || null;
      ui.renderReader('reader-images', images);
    } catch (e) {
      ui.el('reader-images').innerHTML =
        `<div class="error-msg">Gagal memuat chapter: ${e.message}</div>`;
    }
  },

  navigate(dir) {
    if (this._navigation) {
      const target = dir === 1 ? this._navigation.next : this._navigation.prev;
      if (target) {
        const chapters = detailController.chapters;
        const newIdx = chapters.findIndex(ch => ch.slug === target);
        window.scrollTo(0, 0);
        this.open(target, newIdx !== -1 ? newIdx : this.currentIndex);
        return;
      }
    }
    // Fallback index-based (list newest-first)
    const newIdx = this.currentIndex - dir;
    const chapters = detailController.chapters;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    const slug = chapters[newIdx]?.slug || '';
    window.scrollTo(0, 0);
    this.open(slug, newIdx);
  },

  updateNav() {
    const total = detailController.chapters.length;
    ui.el('btn-prev-chap').disabled = this.currentIndex >= total - 1;
    ui.el('btn-next-chap').disabled = this.currentIndex <= 0;
  },

  backToDetail() {
    if (detailController.currentSlug) router.go('detail', false);
    else router.back();
  },
};
