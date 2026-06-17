/* =============================================
   CONTROLLERS.JS — Feature Controllers
   Each controller owns one feature/view.
   ============================================= */

/* ---- HOME CONTROLLER ---- */
const homeController = {
  async load() {
    router.go('home');
    this.loadLatest();
    this.loadPopular();
  },

  async loadLatest() {
    ui.loading('grid-latest');
    try {
      const data   = await api.getLatest();
      const comics = api.extractList(data).slice(0, 12);
      ui.renderGrid('grid-latest', comics);
    } catch (e) {
      ui.error('grid-latest', `Gagal memuat komik terbaru: ${e.message}`);
    }
  },

  async loadPopular() {
    ui.loading('grid-popular');
    try {
      const data   = await api.getPopular();
      const comics = api.extractList(data).slice(0, 12);
      ui.renderGrid('grid-popular', comics);
    } catch (e) {
      ui.error('grid-popular', `Gagal memuat komik populer: ${e.message}`);
    }
  },
};

/* ---- BROWSE CONTROLLER ---- */
const browseController = {
  type:  '',
  order: 'update',
  page:  1,

  async load() {
    router.go('browse');
    this.fetchData();
  },

  setType(type, btnEl) {
    // Update active chip
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
      const data   = await api.getBrowse({ type: this.type, order: this.order, page: this.page });
      const comics = api.extractList(data);
      ui.renderGrid('grid-browse', comics);

      const totalPages = data?.total_pages || data?.totalPages || 10;
      const page = this.page; // capture for closure
      ui.renderPagination('browse-pages', page, totalPages, (p) => {
        browseController.page = p;
        browseController.fetchData();
      });
    } catch (e) {
      ui.error('grid-browse', `Gagal memuat data: ${e.message}`);
    }
  },
};

/* ---- TRENDING CONTROLLER ---- */
const trendingController = {
  loaded: false,

  async load() {
    router.go('trending');
    if (this.loaded) return; // cache — don't re-fetch if already loaded
    this.fetchData();
  },

  async fetchData() {
    ui.loading('grid-trending');
    try {
      const data   = await api.getTrending();
      const comics = api.extractList(data);
      ui.renderGrid('grid-trending', comics);
      this.loaded = true;
    } catch (e) {
      ui.error('grid-trending', `Gagal memuat trending: ${e.message}`);
    }
  },
};

/* ---- SEARCH CONTROLLER ---- */
const searchController = {
  async run() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    router.go('search');
    document.getElementById('search-heading').textContent = `Hasil: "${query}"`;
    ui.loading('grid-search');

    try {
      const data   = await api.search(query);
      const comics = api.extractList(data);
      ui.renderGrid('grid-search', comics);
    } catch (e) {
      ui.error('grid-search', `Pencarian gagal: ${e.message}`);
    }
  },
};

/* ---- DETAIL CONTROLLER ---- */
const detailController = {
  currentSlug: null,
  chapters:    [],

  async open(slug) {
    if (!slug) return;
    this.currentSlug = slug;
    this.chapters    = [];

    router.go('detail');
    ui.el('detail-content').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat detail...</div>';

    try {
      const data   = await api.getDetail(slug);
      const comic  = data?.data ?? data?.comic ?? data;
      const chaps  = comic.chapters || comic.chapter_list || [];
      this.chapters = chaps;

      ui.el('detail-content').innerHTML = ui.renderDetail(
        comic,
        chaps,
        (chapLink, idx) => readerController.open(chapLink, idx)
      );
    } catch (e) {
      ui.el('detail-content').innerHTML =
        `<div class="error-msg">Gagal memuat detail: ${e.message}</div>`;
    }
  },
};

/* ---- READER CONTROLLER ---- */
const readerController = {
  currentIndex: 0,

  async open(chapLink, index) {
    if (!chapLink) return;
    this.currentIndex = index;

    router.go('reader');
    ui.el('reader-images').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat gambar chapter...</div>';
    this.updateNav();

    const chap = detailController.chapters[index];
    ui.el('reader-title').textContent = chap?.chapter || chap?.name || chap?.title || `Chapter ${index + 1}`;

    try {
      const data   = await api.getChapter(chapLink);
      // Dukung berbagai format response: { images }, { data }, { pages }, atau array langsung
      // Juga cek { navigation } untuk prev/next chapter (seperti di Juju)
      const images = data?.images ?? data?.data ?? data?.pages ?? (Array.isArray(data) ? data : []);
      
      // Simpan navigation data kalau ada (prev/next dari API)
      this._navigation = data?.navigation || null;
      
      ui.renderReader('reader-images', images);
    } catch (e) {
      ui.el('reader-images').innerHTML =
        `<div class="error-msg">Gagal memuat chapter: ${e.message}</div>`;
    }
  },

  /**
   * Navigate to previous (-1) or next (1) chapter
   * Prioritas: gunakan navigation data dari API (seperti Juju), kalau tidak ada pakai index list
   */
  navigate(dir) {
    // Coba pakai navigation dari API response dulu
    if (this._navigation) {
      const targetLink = dir === 1 ? this._navigation.nextChapter : this._navigation.previousChapter;
      if (targetLink) {
        // Cari index di chapter list berdasarkan link
        const chapters = detailController.chapters;
        const newIdx = chapters.findIndex(ch => {
          const link = ch.link || ch.slug || ch.chapter_id || ch.id || '';
          return link === targetLink || link.includes(targetLink) || targetLink.includes(link);
        });
        window.scrollTo(0, 0);
        this.open(targetLink, newIdx !== -1 ? newIdx : this.currentIndex);
        return;
      }
    }

    // Fallback: navigasi berdasarkan index di chapter list
    // Chapter list biasanya newest-first, jadi:
    //   dir=1 (next/selanjutnya) → index-- (chapter lebih lama, nomor lebih kecil di array)
    //   dir=-1 (prev/sebelumnya) → index++ (chapter lebih baru, nomor lebih besar di array)
    const newIdx = this.currentIndex - dir;
    const chapters = detailController.chapters;
    if (newIdx < 0 || newIdx >= chapters.length) return;

    const ch   = chapters[newIdx];
    // Gunakan link terlebih dahulu (seperti Juju), baru fallback ke slug/id
    const link = ch.link || ch.slug || ch.chapter_id || ch.id || '';
    window.scrollTo(0, 0);
    this.open(link, newIdx);
  },

  updateNav() {
    const total = detailController.chapters.length;
    ui.el('btn-prev-chap').disabled = this.currentIndex >= total - 1;
    ui.el('btn-next-chap').disabled = this.currentIndex <= 0;
  },

  backToDetail() {
    if (detailController.currentSlug) {
      router.go('detail', false);
    } else {
      router.back();
    }
  },
};
