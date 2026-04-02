/**
 * Renderer Process Entry Point
 * Initializes the application UI, routing, theming, and internationalization
 */

import './styles/main.css';
import { Router } from './core/router';
import { i18n } from './core/i18n';
import { themeManager } from './core/theme';
import { showConfirm } from './components';
import { icons } from './utils';
import './types';

// Initialize theme and i18n
themeManager.getTheme(); // Apply saved theme
i18n.getLocale(); // Load saved locale

// Inject sidebar Lucide icons
function injectSidebarIcons(): void {
  document.querySelectorAll<HTMLElement>('.menu-icon[data-icon]').forEach(el => {
    const key = el.dataset.icon as keyof typeof icons;
    if (icons[key]) {
      el.innerHTML = icons[key](22);
    }
  });
}

// Function to update all i18n texts
function updateI18nTexts(): void {
  // Update sidebar
  const appTitle = document.getElementById('app-title');
  const appSubtitle = document.getElementById('app-subtitle');
  if (appTitle) appTitle.innerHTML = `${icons.package(24)} ${i18n.t('app.title')}`;
  if (appSubtitle) appSubtitle.textContent = i18n.t('app.subtitle');

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = i18n.t(key);
    }
  });
}

// Initialize router
const router = new Router('mainContent');

// Make router, i18n, and theme available globally
window.router = router;
window.i18n = i18n;
window.themeManager = themeManager;
window.updateI18nTexts = updateI18nTexts;

// Inject icons and update texts
injectSidebarIcons();
updateI18nTexts();

// Setup navigation event listeners
document.querySelectorAll('.sidebar-menu-item[data-page]').forEach(item => {
  item.addEventListener('click', (e) => {
    const page = (e.currentTarget as HTMLElement).dataset.page;
    if (page) {
      router.navigateTo(page);
    }
  });
});

// ─── Titlebar controls ───────────────────────────────────────────────

document.getElementById('titlebarMin')?.addEventListener('click', () => {
  window.api.minimizeWindow();
});

document.getElementById('titlebarMax')?.addEventListener('click', () => {
  window.api.maximizeWindow();
});

document.getElementById('titlebarClose')?.addEventListener('click', async () => {
  const confirmed = await showConfirm(
    i18n.t('common.close'),
    i18n.t('common.closeConfirm'),
    'warning',
  );
  if (confirmed) {
    await window.api.closeApp();
  }
});

// ─── Keyboard shortcuts ──────────────────────────────────────────────

document.addEventListener('keydown', (e: KeyboardEvent) => {
  const ctrlOrMeta = e.ctrlKey || e.metaKey;

  // Ctrl+N → navigate to add new asset
  if (ctrlOrMeta && e.key === 'n') {
    e.preventDefault();
    router.navigateTo('form');
    return;
  }

  // Ctrl+F → focus search input (only on list page)
  if (ctrlOrMeta && e.key === 'f') {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
    if (searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    return;
  }

  // Escape → cancel form / close search / go back to list
  if (e.key === 'Escape') {
    // If a modal is open, let the modal handle it
    if (document.querySelector('.modal-overlay')) return;

    const currentPage = router.getCurrentPage();
    if (currentPage === 'form' || currentPage === 'view' || currentPage === 'settings' || currentPage === 'categories') {
      e.preventDefault();
      router.navigateTo('list');
    } else {
      // On list page, clear search if active
      const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
      if (searchInput && searchInput.value) {
        e.preventDefault();
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
      }
    }
    return;
  }
});

// Load initial page
router.navigateTo('list');

console.log('Assets Store - Application loaded successfully!');

