/* =============================================
   UI.JS — DOM Helpers & Rendering Functions
   ============================================= */

const ui = {
  el(id) { return document.getElementById(id); },

  loading(containerId) {
    this.el(containerId).innerHTML =
      `<div class="loading"><div class="spinner"></div>Memuat...</div>`;
  },

  error(containerId, msg = 'Gagal memuat data') {
    this.el(containerId).innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
  },

  typeBadge(type = '') {
    if (!type) return '';
    const t = type.toLowerCase();
    const cls = t === 'manga' ? 'badge-manga' : t === 'manhwa' ? 'badge-manhwa' : 'badge-manhua';
    return `<span class="badge ${cls}">${type}</span>`;
  },

  comicCard(comic) {
    const title = comic.title || comic.judul || comic.name || 'Tanpa Judul';
    const thumb = comic.thumbnail || comic.cover || comic.image || '';
    const type  = comic.type || comic.tipe || '';
    const chap  = comic.latest_chapter || comic.chapter || comic.latestChapter || '';
    // Komikindo pakai field 'slug' langsung
    const slug  = comic.slug || comic.komik_id || comic.id || '';

    const safeSlug  = slug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeTitle = title.replace(/"/g, '&quot;');

    return `
      <div class="comic-card" onclick="detailController.open('${safeSlug}')">
        ${thumb
          ? `<img class="comic-thumb" src="${thumb}" alt="${safeTitle}" loading="lazy"
                  onerror="this.outerHTML='<div class=comic-thumb-placeholder>📚</div>'">`
          : `<div class="comic-thumb-placeholder">📚</div>`}
        <div class="comic-info">
          <div class="comic-title">${title}</div>
          <div class="comic-meta">
            ${this.typeBadge(type)}
            ${chap ? `<span>${chap}</span>` : ''}
          </div>
        </div>
      </div>`;
  },

  renderGrid(containerId, comics) {
    const el = this.el(containerId);
    if (!comics || comics.length === 0) {
      el.innerHTML = '<div class="loading" style="color:var(--muted)">Tidak ada data ditemukan.</div>';
      return;
    }
    el.innerHTML = comics.map(c => this.comicCard(c)).join('');
  },

  renderPagination(containerId, current, total, onPage) {
    const el = this.el(containerId);
    const clamped = Math.min(total, 20);
    const start   = Math.max(1, current - 2);
    const end     = Math.min(clamped, current + 2);
    let html = '';
    if (start > 1) {
      html += btn(1, current, onPage);
      if (start > 2) html += '<span style="color:var(--muted);padding:0 0.25rem">…</span>';
    }
    for (let i = start; i <= end; i++) html += btn(i, current, onPage);
    if (end < clamped) {
      if (end < clamped - 1) html += '<span style="color:var(--muted);padding:0 0.25rem">…</span>';
      html += btn(clamped, current, onPage);
    }
    el.innerHTML = html;
    function btn(page, cur, cb) {
      return `<button class="page-btn${page === cur ? ' active' : ''}"
                      onclick="(${cb.toString()})(${page})">${page}</button>`;
    }
  },

  renderDetail(comic, chapters, onChapter) {
    const title    = comic.title || comic.judul || 'Tanpa Judul';
    const thumb    = comic.thumbnail || comic.cover || comic.image || '';
    const type     = comic.type || comic.tipe || '';
    const status   = comic.status || '';
    const synopsis = comic.synopsis || comic.sinopsis || comic.description || '';
    const genres   = Array.isArray(comic.genres || comic.genre)
                     ? (comic.genres || comic.genre) : [];

    const genreHTML = genres
      .map(g => `<span class="badge badge-genre">${typeof g === 'object' ? g.name || g : g}</span>`)
      .join('');

    const chaptersHTML = chapters.length > 0
      ? chapters.map((ch, i) => {
          // Komikindo: chapter punya field 'slug' untuk endpoint chapter
          const cSlug = ch.slug || ch.chapter_id || ch.id || '';
          const name  = ch.title || ch.chapter || ch.name || `Chapter ${i + 1}`;
          const date  = ch.date || ch.released || ch.updated_on || '';
          const safe  = cSlug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          return `
            <div class="chapter-item" onclick="(${onChapter.toString()})('${safe}', ${i})">
              <span class="chapter-name">${name}</span>
              <span class="chapter-date">${date}</span>
            </div>`;
        }).join('')
      : '<div class="empty-chapters">Belum ada chapter tersedia</div>';

    return `
      <div class="detail-header">
        <div class="detail-cover">
          ${thumb
            ? `<img src="${thumb}" alt="${title.replace(/"/g,'&quot;')}" loading="lazy">`
            : `<div class="no-cover">📚</div>`}
        </div>
        <div class="detail-info">
          <div class="detail-title">${title}</div>
          <div class="detail-badges">
            ${this.typeBadge(type)}
            ${status ? `<span class="badge badge-status">${status}</span>` : ''}
          </div>
          ${genreHTML ? `<div class="detail-genres">${genreHTML}</div>` : ''}
          ${synopsis ? `<div class="detail-synopsis">${synopsis}</div>` : ''}
        </div>
      </div>
      <div class="chapter-list-header">📋 ${chapters.length} Chapter</div>
      <div class="chapter-list">${chaptersHTML}</div>
    `;
  },

  renderReader(containerId, images) {
    const el = this.el(containerId);
    if (!images || images.length === 0) {
      el.innerHTML = '<div class="error-msg">Tidak ada gambar untuk chapter ini.</div>';
      return;
    }
    el.innerHTML = images.map((img, idx) => {
      const src = typeof img === 'string' ? img : img.src || img.url || img.image || '';
      if (!src) return '';
      return `<img src="${src}" alt="Halaman ${idx + 1}"
        loading="${idx < 2 ? 'eager' : 'lazy'}"
        onerror="this.style.display='none'">`;
    }).filter(Boolean).join('');
  },
};
