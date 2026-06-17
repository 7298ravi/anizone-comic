/* =============================================
   ROUTER.JS — View Management & Navigation
   ============================================= */

const router = (() => {
  const VIEWS = ['home', 'browse', 'search', 'detail', 'reader'];
  const history = [];
  let current = null;

  function go(viewName, pushHistory = true) {
    if (!VIEWS.includes(viewName)) return;
    VIEWS.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.style.display = 'none';
    });
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.style.display = 'block';
    if (pushHistory && current && current !== viewName) history.push(current);
    current = viewName;
    updateNavActive(viewName);
    window.scrollTo(0, 0);
  }

  function back() {
    const prev = history.pop();
    if (prev) go(prev, false);
    else go('home', false);
  }

  function getCurrent() { return current; }

  function updateNavActive(viewName) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (viewName === 'home')   document.getElementById('nav-home')?.classList.add('active');
    if (viewName === 'browse') document.getElementById('nav-browse')?.classList.add('active');
  }

  return { go, back, getCurrent };
})();
