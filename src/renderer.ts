/**
 * Renderer Process Entry Point
 * Initializes the application UI, routing, theming, and internationalization
 */

import './styles/main.css';
import { Router } from './core/router';
import { i18n } from './core/i18n';
import { themeManager } from './core/theme';
import './types';

// Initialize theme and i18n
themeManager.getTheme(); // Apply saved theme
i18n.getLocale(); // Load saved locale

// Function to update all i18n texts
function updateI18nTexts(): void {
  // Update sidebar
  const appTitle = document.getElementById('app-title');
  const appSubtitle = document.getElementById('app-subtitle');
  if (appTitle) appTitle.textContent = `📦 ${i18n.t('app.title')}`;
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

// Update initial texts
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
  const confirmed = confirm(i18n.t('common.closeConfirm'));
  if (confirmed) {
    await window.api.closeApp();
  }
});

// Load initial page
router.navigateTo('list');

console.log('✅ Assets Store - Application loaded successfully!');

