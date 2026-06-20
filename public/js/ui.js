/* =============================================
   UI.JS — DOM Helpers & Rendering Functions
   Enhanced: skeleton, toast, synopsis toggle,
   chapter search filter, read markers
   ============================================= */

const ui = {
  el(id) { return document.getElementById(id); },

  /* ---- LOADING / ERROR ---- */

  loading(containerId) {
    this.el(containerId).innerHTML =
      `<div class="loading"><div class="spinner"></div>Memuat...</div>`;
  },

  // Skeleton card grid (lebih smooth dari spinner biasa)
  skeleton(containerId, count = 12) {
    const items = Array.from({ length: count }, () => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-thumb"></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line short"></div>
        </div>
      </div>`).join('');
    this.el(containerId).innerHTML = items;
  },

  error(containerId, msg = 'Gagal memuat data') {
    this.el(containerId).innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
  },

  /* ---- TOAST ---- */

  _toastTimer: null,
  toast(msg, type = 'info') {
    const el = this.el('toast');
    if (!el) return;
    const colors = { info: '', success: 'color:var(--success)', error: 'color:var(--danger)' };
    el.innerHTML = `<span style="${colors[type] || ''}">${msg}</span>`;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  },

  /* ---- BADGES ---- */

  typeBadge(type = '') {
    if (!type) return '';
    const t   = type.toLowerCase();
    const cls = t === 'manga' ? 'badge-manga' : t === 'manhwa' ? 'badge-manhwa' : 'badge-manhua';
    return `<span class="badge ${cls}">${type}</span>`;
  },

  /* ---- COMIC CARD ---- */

  comicCard(comic, opts = {}) {
    const title = comic.title || 'Tanpa Judul';
    const thumb = comic.cover || comic.image || comic.thumbnail || '';
    const type  = comic.type  || '';
    const chap  = comic.chapter || comic.latest_chapter || comic.chapters?.[0]?.title || '';
    const slug  = comic.slug  || comic.id || '';
    const isNew = opts.isNew || false;

    const safeSlug  = slug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeTitle = title.replace(/"/g, '&quot;');

    return `
      <div class="comic-card" onclick="detailController.open('${safeSlug}')" title="${safeTitle}">
        ${isNew ? '<span class="card-new-badge">New</span>' : ''}
        ${thumb
          ? `<img class="comic-thumb" src="${thumb}" alt="${safeTitle}" loading="lazy"
               onerror="this.outerHTML='<div class=comic-thumb-placeholder>📚</div>'">`
          : `<div class="comic-thumb-placeholder">📚</div>`}
        <div class="comic-info">
          <div class="comic-title">${title}</div>
          <div class="comic-meta">
            ${this.typeBadge(type)}
            ${chap ? `<span class="chapter-badge">${chap}</span>` : ''}
          </div>
        </div>
      </div>`;
  },

  /* ---- RENDER GRID ---- */

  renderGrid(containerId, comics, opts = {}) {
    const el = this.el(containerId);
    if (!comics || comics.length === 0) {
      el.innerHTML = '<div class="loading" style="color:var(--muted)">Tidak ada data ditemukan.</div>';
      return;
    }
    el.innerHTML = comics.map((c, i) => this.comicCard(c, { isNew: opts.markNew && i < 3 })).join('');
  },

  /* ---- PAGINATION ---- */

  renderPagination(containerId, current, total, onPage) {
    const el = this.el(containerId);
    if (total <= 1) { el.innerHTML = ''; return; }
    const clamped = Math.min(total, 50);
    const start   = Math.max(1, current - 2);
    const end     = Math.min(clamped, current + 2);
    let html = '';
    if (start > 1) {
      html += btn(1);
      if (start > 2) html += '<span style="color:var(--muted);padding:0 .25rem">…</span>';
    }
    for (let i = start; i <= end; i++) html += btn(i);
    if (end < clamped) {
      if (end < clamped - 1) html += '<span style="color:var(--muted);padding:0 .25rem">…</span>';
      html += btn(clamped);
    }
    el.innerHTML = html;
    function btn(page) {
      return `<button class="page-btn${page === current ? ' active' : ''}"
        onclick="(${onPage.toString()})(${page})">${page}</button>`;
    }
  },

  /* ---- DETAIL ---- */

  renderDetail(comic, chapters, onChapter) {
    const title   = comic.title    || 'Tanpa Judul';
    const thumb   = comic.image    || comic.cover || '';
    const type    = comic.type     || '';
    const status  = comic.status   || '';
    const author  = comic.author   || '';
    const artist  = comic.artist   || '';
    const synopsis = comic.synopsis || '';
    const genres  = Array.isArray(comic.genres) ? comic.genres : [];
    const slug    = comic.slug || detailController.currentSlug || '';

    const readChapters = storage.getReadChapters(slug);
    const lastRead = readChapters[readChapters.length - 1] || null;

    const genreHTML = genres
      .map(g => {
        const name = typeof g === 'object' ? (g.title || g.name || '') : g;
        const gslug = typeof g === 'object' ? (g.slug || '') : '';
        return name
          ? `<span class="badge badge-genre" style="cursor:pointer"
               onclick="browseController.filterGenre('${gslug}','${name}')">${name}</span>`
          : '';
      })
      .filter(Boolean).join('');

    const metaRows = [
      author ? `<div class="detail-meta-row"><span>Author</span><span>${author}</span></div>` : '',
      artist && artist !== author
        ? `<div class="detail-meta-row"><span>Artist</span><span>${artist}</span></div>` : '',
      status ? `<div class="detail-meta-row"><span>Status</span><span>${status}</span></div>` : '',
      comic.rating ? `<div class="detail-meta-row"><span>Rating</span><span>⭐ ${comic.rating}</span></div>` : '',
    ].join('');

    // First & last chapter for quick-start buttons
    const firstChap = chapters[chapters.length - 1]; // oldest
    const lastChap  = chapters[0];                   // newest

    const readIdx = lastRead ? chapters.findIndex(ch => ch.slug === lastRead) : -1;
    const continueChap = readIdx !== -1 ? chapters[readIdx] : null;

    const chaptersHTML = chapters.length > 0
      ? chapters.map((ch, i) => {
          const cSlug  = ch.slug  || '';
          const name   = ch.title || ch.name || `Chapter ${i + 1}`;
          const date   = ch.date  || ch.released || '';
          const isRead = readChapters.includes(cSlug);
          const safe   = cSlug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          return `
            <div class="chapter-item${isRead ? ' read' : ''}" id="chap-${safe}"
                 onclick="(${onChapter.toString()})('${safe}', ${i})">
              <span class="chapter-name">${name}</span>
              <span class="chapter-date">${date}</span>
            </div>`;
        }).join('')
      : '<div class="empty-chapters">Belum ada chapter tersedia</div>';

    return `
      <div class="detail-header">
        <div class="detail-cover">
          ${thumb
            ? `<img src="${thumb}" alt="${title.replace(/"/g,'&quot;')}" loading="lazy"
                 onerror="this.outerHTML='<div class=no-cover>📚</div>'">`
            : '<div class="no-cover">📚</div>'}
        </div>
        <div class="detail-info">
          <div class="detail-title">${title}</div>
          <div class="detail-badges">
            ${this.typeBadge(type)}
            ${status ? `<span class="badge badge-status">${status}</span>` : ''}
          </div>
          ${metaRows}
          ${genreHTML ? `<div class="detail-genres">${genreHTML}</div>` : ''}
          ${synopsis ? `
            <div class="detail-synopsis clamped" id="detail-synopsis-text">${synopsis}</div>
            <button class="synopsis-toggle" onclick="ui.toggleSynopsis()">Baca Selengkapnya ▼</button>
          ` : ''}
          <div class="detail-actions">
            ${firstChap ? `
              <button class="btn-primary" onclick="(${onChapter.toString()})('${(firstChap.slug||'').replace(/'/g,"\\'")}', ${chapters.length - 1})">
                📖 Mulai Baca
              </button>` : ''}
            ${continueChap ? `
              <button class="btn-secondary" onclick="(${onChapter.toString()})('${(continueChap.slug||'').replace(/'/g,"\\'")}', ${readIdx})">
                ↩️ Lanjut Baca
              </button>` : ''}
          </div>
        </div>
      </div>

      <div class="chapter-list-header">
        <span>📋 ${chapters.length} Chapter</span>
        ${chapters.length > 8 ? `
          <input class="chapter-search-input" type="text" placeholder="Cari chapter..."
                 oninput="ui.filterChapters(this.value)">
        ` : ''}
      </div>
      <div class="chapter-list" id="chapter-list-container">${chaptersHTML}</div>
    `;
  },

  // Toggle synopsis clamp
  toggleSynopsis() {
    const el = this.el('detail-synopsis-text');
    const btn = document.querySelector('.synopsis-toggle');
    if (!el || !btn) return;
    if (el.classList.contains('clamped')) {
      el.classList.remove('clamped');
      btn.textContent = 'Sembunyikan ▲';
    } else {
      el.classList.add('clamped');
      btn.textContent = 'Baca Selengkapnya ▼';
    }
  },

  // Filter chapter list by keyword
  filterChapters(query) {
    const items = document.querySelectorAll('#chapter-list-container .chapter-item');
    const q = query.toLowerCase();
    items.forEach(item => {
      const name = item.querySelector('.chapter-name')?.textContent.toLowerCase() || '';
      item.style.display = name.includes(q) ? '' : 'none';
    });
  },

  /* ---- READER ---- */

  renderReader(containerId, images) {
    const el = this.el(containerId);
    if (!images || images.length === 0) {
      el.innerHTML = '<div class="error-msg">Tidak ada gambar untuk chapter ini.</div>';
      return;
    }
    el.innerHTML = images.map((img, idx) => {
      const src = typeof img === 'string' ? img : img.url || img.src || img.image || '';
      if (!src) return '';
      return `<img src="${src}" alt="Halaman ${idx + 1}"
        loading="${idx < 3 ? 'eager' : 'lazy'}"
        onerror="this.style.display='none'">`;
    }).filter(Boolean).join('');
  },

  /* ---- HISTORY CARDS ---- */

  renderHistory(containerId, list) {
    const el = this.el(containerId);
    if (!list || list.length === 0) {
      el.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">📭</div>
          <h3>Belum ada riwayat</h3>
          <p>Chapter yang kamu baca akan muncul di sini.</p>
        </div>`;
      return;
    }
    const cardsHTML = list.map(h => {
      const safeSlug = (h.slug || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const timeAgo  = this._timeAgo(h.timestamp);
      return `
        <div class="history-card" onclick="detailController.open('${safeSlug}')">
          ${h.cover
            ? `<img class="history-cover" src="${h.cover}" alt="${(h.title||'').replace(/"/g,'&quot;')}" loading="lazy"
                 onerror="this.outerHTML='<div class=history-cover-placeholder>📚</div>'">`
            : `<div class="history-cover-placeholder">📚</div>`}
          <div class="history-info">
            <div>
              <div class="history-title">${h.title || 'Tanpa Judul'}</div>
              ${this.typeBadge(h.type)}
            </div>
            <div>
              <div class="history-last">↩ ${h.chapName || 'Chapter terakhir'}</div>
              <div class="history-date">🕐 ${timeAgo}</div>
              <button class="history-continue" onclick="event.stopPropagation();readerController.open('${safeSlug}','${(h.chapSlug||'').replace(/'/g,"\\'")}')">
                Lanjut Baca →
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
    el.innerHTML = `<div class="history-grid">${cardsHTML}</div>`;
  },

  _timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Baru saja';
    if (m < 60) return `${m} menit lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    const d = Math.floor(h / 24);
    if (d < 7)  return `${d} hari lalu`;
    return new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
  },

  /* ---- LIVE SEARCH DROPDOWN ---- */

  renderDropdown(containerId, comics, onSelect) {
    const el = this.el(containerId);
    if (!el) return;
    if (!comics || comics.length === 0) {
      el.innerHTML = '<div class="dropdown-empty">Tidak ditemukan</div>';
      return;
    }
    el.innerHTML = comics.slice(0, 7).map(c => {
      const title = c.title || 'Tanpa Judul';
      const thumb = c.cover || c.image || c.thumbnail || '';
      const chap  = c.chapter || c.latest_chapter || '';
      const type  = c.type  || '';
      const slug  = c.slug  || c.id || '';
      const safeSlug = slug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `
        <div class="dropdown-item" onclick="(${onSelect.toString()})('${safeSlug}')">
          ${thumb
            ? `<img class="dropdown-thumb" src="${thumb}" loading="lazy"
                 onerror="this.outerHTML='<div class=dropdown-thumb style=background:var(--surface3);border-radius:4px>📚</div>'">`
            : `<div class="dropdown-thumb" style="background:var(--surface3);border-radius:4px;display:flex;align-items:center;justify-content:center">📚</div>`}
          <div class="dropdown-info">
            <div class="dropdown-title">${title}</div>
            <div class="dropdown-meta">${[type, chap].filter(Boolean).join(' • ')}</div>
          </div>
        </div>`;
    }).join('');
  },
};
