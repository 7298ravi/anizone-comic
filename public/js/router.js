/* =============================================
   ROUTER.JS — View Management & Navigation
   ============================================= */

const router = (() => {
  const VIEWS = ['home', 'browse', 'search', 'detail', 'reader', 'history'];
  const _history = [];
  let current = null;

  function go(viewName, pushHistory = true) {
    if (!VIEWS.includes(viewName)) return;

    // Hide all views
    VIEWS.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.style.display = 'none';
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) target.style.display = 'block';

    if (pushHistory && current && current !== viewName) _history.push(current);
    current = viewName;

    updateNavActive(viewName);

    // Hide footer inside reader for cleaner UX
    const footer = document.getElementById('main-footer');
    if (footer) footer.style.display = viewName === 'reader' ? 'none' : '';

    // Reset progress bar when leaving reader
    if (viewName !== 'reader') {
      const bar = document.getElementById('reader-progress-bar');
      if (bar) bar.style.width = '0%';
    }

    window.scrollTo(0, 0);
  }

  function back() {
    const prev = _history.pop();
    if (prev) go(prev, false);
    else go('home', false);
  }

  function getCurrent() { return current; }

  function updateNavActive(viewName) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (viewName === 'home')    document.getElementById('nav-home')?.classList.add('active');
    if (viewName === 'browse')  document.getElementById('nav-browse')?.classList.add('active');
    if (viewName === 'history') document.getElementById('nav-history')?.classList.add('active');
  }

  return { go, back, getCurrent };
})();
