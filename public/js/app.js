/* =============================================
   APP.JS — Entry Point & Bootstrap
   ============================================= */

// ---- Keyboard shortcuts ----
document.addEventListener('keydown', (e) => {
  // "/" focuses navbar search
  if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    document.getElementById('search-input')?.focus();
  }
  // Escape closes dropdowns / fullscreen
  if (e.key === 'Escape') {
    searchController.closeDropdown();
    const hd = document.getElementById('hero-dropdown');
    if (hd) hd.style.display = 'none';
    if (document.fullscreenElement) document.exitFullscreen?.();
  }
  // Left/Right arrows for reader navigation
  if (router.getCurrent() === 'reader') {
    if (e.key === 'ArrowLeft')  readerController.navigate(-1);
    if (e.key === 'ArrowRight') readerController.navigate(1);
  }
});

// ---- Scroll progress bar (reader only) ----
window.addEventListener('scroll', () => {
  if (router.getCurrent() !== 'reader') return;
  const bar    = document.getElementById('reader-progress-bar');
  if (!bar) return;
  const scrolled = window.scrollY;
  const total    = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
}, { passive: true });

// ---- Fullscreen change: update icon ----
document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('btn-fullscreen');
  if (!btn) return;
  if (document.fullscreenElement) {
    btn.title = 'Keluar Fullscreen';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
    </svg>`;
  } else {
    btn.title = 'Fullscreen';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
    </svg>`;
  }
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  themeManager.init();
  homeController.load();
});
