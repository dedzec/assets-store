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

// Close app button
document.getElementById('closeApp')?.addEventListener('click', async () => {
  const confirmed = await showConfirm(
    i18n.t('common.close'),
    i18n.t('common.closeConfirm'),
    'warning',
  );
  if (confirmed) {
    await window.api.closeApp();
  }
});

// Load initial page
router.navigateTo('list');

console.log('Assets Store - Application loaded successfully!');

