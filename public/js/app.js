/* =============================================
   APP.JS — Entry Point & Bootstrap
   ============================================= */

// ---- Keyboard shortcut: "/" focuses search ----
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== document.getElementById('search-input')) {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
});

// ---- Scroll progress bar untuk reader ----
window.addEventListener('scroll', () => {
  if (router.getCurrent() !== 'reader') return;
  const bar = document.getElementById('reader-progress-bar');
  if (!bar) return;
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  homeController.load();
});
