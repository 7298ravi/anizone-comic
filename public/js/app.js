/* =============================================
   APP.JS — Entry Point & Bootstrap
   ============================================= */

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== document.getElementById('search-input')) {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
});

// Scroll progress bar
window.addEventListener('scroll', () => {
  if (router.getCurrent() !== 'reader') return;
  const bar = document.getElementById('reader-progress-bar');
  if (!bar) return;
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
});

// Event delegation untuk semua comic card
document.addEventListener('click', (e) => {
  const card = e.target.closest('.comic-card');
  if (card && card.dataset.slug) {
    detailController.open(card.dataset.slug);
  }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ AniZone initialized');
  homeController.load();
});
