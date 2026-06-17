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
      // bacakomik/latest tidak ada pagination, sembunyikan
      ui.el('home-pages').innerHTML = '';
    } catch (e) {
      ui.error('grid-latest', `Gagal memuat: ${e.message}`);
    }
  },
};

/* ---- LIBRARY / BROWSE ---- */
const browseController = {
  type: '',
  genre: '',
  page: 1,

  async load() {
    router.go('browse');
    this.fetchData();
  },

  setType(type, btnEl) {
    document.querySelectorAll('#type-filter .filter-chip').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    this.type  = type;
    this.genre = '';
    this.page  = 1;
    this.fetchData();
  },

  async fetchData() {
    ui.loading('grid-browse');
    try {
      const data   = await api.getLibrary({ type: this.type, genre: this.genre, page: this.page });
      const comics = api.extractList(data);
      ui.renderGrid('grid-browse', comics);
      // BacaKomik tidak ada totalPages yang reliable, sembunyikan pagination
      ui.el('browse-pages').innerHTML = '';
    } catch (e) {
      ui.error('grid-browse', `Gagal memuat library: ${e.message}`);
    }
  },
};

/* ---- SEARCH ---- */
const searchController = {
  async run(page = 1) {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    router.go('search');
    document.getElementById('search-heading').textContent = `Hasil: "${query}"`;
    ui.loading('grid-search');
    try {
      const data   = await api.search(query, page);
      const comics = api.extractList(data);
      ui.renderGrid('grid-search', comics);
      const total = api.extractTotalPages(data, page);
      ui.renderPagination('search-pages', page, total, p => {
        document.getElementById('search-input').value = query;
        searchController.run(p);
      });
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
      const res = await api.getDetail(slug);

      // Response BacaKomik: { detail: { title, cover, rating, status, type, author, artist,
      //                                  synopsis, genres:[{title,slug}],
      //                                  chapterList:[{title,slug,date}] } }
      const comic = res?.detail ?? res;

      const chaps = comic?.chapterList ?? comic?.chapters ?? [];
      this.chapters = chaps;

      const merged = {
        title:    comic.title    || 'Tanpa Judul',
        image:    comic.cover    || comic.image || '',
        type:     comic.type     || '',
        status:   comic.status   || '',
        author:   comic.author   || '',
        artist:   comic.artist   || '',
        synopsis: comic.synopsis || comic.description || '',
        genres:   comic.genres   ?? [],
        rating:   comic.rating   ?? '',
      };

      ui.el('detail-content').innerHTML = ui.renderDetail(
        merged, chaps, (chapSlug, idx) => readerController.open(chapSlug, idx)
      );
    } catch (e) {
      ui.el('detail-content').innerHTML = `<div class="error-msg">Gagal memuat detail: ${e.message}</div>`;
    }
  },
};

/* ---- READER ---- */
const readerController = {
  currentIndex: 0,
  _navigation: null,

  async open(chapSlug, index) {
    if (!chapSlug) return;
    this.currentIndex = index ?? 0;
    this._navigation  = null;
    router.go('reader');
    ui.el('reader-images').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat chapter...</div>';
    this.updateNav();

    const chap = detailController.chapters[this.currentIndex];
    ui.el('reader-title').textContent = chap?.title || chap?.name || `Chapter ${this.currentIndex + 1}`;

    try {
      const res = await api.getChapter(chapSlug);

      // Response BacaKomik: { title, images:[ urlString, ... ], navigation:{ next, prev } }
      this._navigation = res?.navigation ?? null;
      const images = res?.images ?? res?.pages ?? (Array.isArray(res) ? res : []);
      this.updateNav();
      ui.renderReader('reader-images', images);
    } catch (e) {
      ui.el('reader-images').innerHTML = `<div class="error-msg">Gagal memuat chapter: ${e.message}</div>`;
    }
  },

  navigate(dir) {
    if (this._navigation) {
      const target = dir === -1 ? this._navigation.prev : this._navigation.next;
      if (target) {
        const chapters = detailController.chapters;
        const newIdx   = chapters.findIndex(ch => ch.slug === target);
        window.scrollTo(0, 0);
        this.open(target, newIdx !== -1 ? newIdx : this.currentIndex);
        return;
      }
    }
    // Fallback: chapterList urutan terbaru dulu (index 0 = terbaru)
    // next (lebih baru) = index-1, prev (lebih lama) = index+1
    const newIdx   = dir === 1 ? this.currentIndex - 1 : this.currentIndex + 1;
    const chapters = detailController.chapters;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    window.scrollTo(0, 0);
    this.open(chapters[newIdx].slug, newIdx);
  },

  updateNav() {
    const total = detailController.chapters.length;
    if (this._navigation) {
      ui.el('btn-prev-chap').disabled = !this._navigation.prev;
      ui.el('btn-next-chap').disabled = !this._navigation.next;
    } else {
      ui.el('btn-prev-chap').disabled = this.currentIndex >= total - 1;
      ui.el('btn-next-chap').disabled = this.currentIndex <= 0;
    }
  },

  backToDetail() {
    if (detailController.currentSlug) router.go('detail', false);
    else router.back();
  },
};
