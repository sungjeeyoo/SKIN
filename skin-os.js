/* ============================================================
   SKIN OS — Shared JS
   skin-os.js · v1.1

   Handles:
   - Day / night mode toggle
   - Theme persistence via localStorage
   - Injects the toggle button into any .topbar-meta or .topbar-actions element
   ============================================================ */

(function () {
  'use strict';

  /* ── Theme persistence ── */
  const STORAGE_KEY = 'skin-os-theme';

  function getSavedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'dark';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove('day', 'dark');
    if (theme === 'day')  root.classList.add('day');
    if (theme === 'dark') root.classList.add('dark');
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const sun  = btn.querySelector('.icon-sun');
      const moon = btn.querySelector('.icon-moon');
      if (sun)  sun.style.display  = theme === 'day' ? 'block' : 'none';
      if (moon) moon.style.display = theme === 'day' ? 'none'  : 'block';
      btn.setAttribute('aria-label', theme === 'day' ? 'Switch to night mode' : 'Switch to day mode');
      btn.title = theme === 'day' ? 'Switch to night mode' : 'Switch to day mode';
    });
  }

  function toggleTheme() {
    const current = getSavedTheme() || getSystemTheme();
    const next = current === 'day' ? 'dark' : 'day';
    saveTheme(next);
    applyTheme(next);
  }

  /* ── Inject toggle button ── */
  function injectToggle() {
    // Don't inject if one already exists
    if (document.querySelector('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'theme-toggle';

    const sun = document.createElement('span');
    sun.className = 'icon-sun';
    sun.textContent = '☀';
    sun.setAttribute('aria-hidden', 'true');

    const moon = document.createElement('span');
    moon.className = 'icon-moon';
    moon.textContent = '☾';
    moon.setAttribute('aria-hidden', 'true');

    btn.appendChild(sun);
    btn.appendChild(moon);

    // Try to inject into topbar-meta, topbar-actions, topbar-right, or topbar itself
    const target =
      document.querySelector('.topbar-meta') ||
      document.querySelector('.topbar-actions') ||
      document.querySelector('.topbar-right') ||
      document.querySelector('.topbar');

    if (target) target.appendChild(btn);
  }

  /* ── Wire click handlers ── */
  function wireToggle() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('.theme-toggle')) toggleTheme();
    });
  }

  /* ── Init ── */
  function init() {
    const saved  = getSavedTheme();
    const system = getSystemTheme();
    const theme  = saved || system;
    applyTheme(theme);
    injectToggle();
    wireToggle();

    // Listen for OS preference changes (if no manual override)
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
      if (!getSavedTheme()) {
        applyTheme(getSystemTheme());
      }
    });
  }

  // Run as early as possible to avoid flash
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
