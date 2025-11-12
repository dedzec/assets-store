export class SettingsPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    const i18n = window.i18n;
    const theme = window.themeManager;
    const currentTheme = theme.getTheme();
    const currentLocale = i18n.getLocale();

    this.container.innerHTML = `
      <div class="page-header">
        <h2>⚙️ ${i18n.t('settings.title')}</h2>
        <p>${i18n.t('settings.subtitle')}</p>
      </div>
      
      <div class="settings-content">
        <div class="settings-section">
          <h3>📊 ${i18n.t('settings.system.title')}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">${i18n.t('settings.system.version')}:</span>
              <span class="info-value">1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">${i18n.t('settings.system.database')}:</span>
              <span class="info-value">${i18n.t('settings.system.databaseValue')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">${i18n.t('settings.system.platform')}:</span>
              <span class="info-value">${navigator.platform}</span>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>🎨 ${i18n.t('settings.appearance.title')}</h3>
          <p class="section-description">${i18n.t('settings.appearance.description')}</p>
          <div class="setting-item">
            <label for="themeSelect">${i18n.t('settings.appearance.theme')}:</label>
            <select id="themeSelect" class="setting-select">
              <option value="default" ${currentTheme === 'default' ? 'selected' : ''}>${i18n.t('settings.appearance.themeDefault')}</option>
              <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>${i18n.t('settings.appearance.themeLight')}</option>
              <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>${i18n.t('settings.appearance.themeDark')}</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>🌐 ${i18n.t('settings.language.title')}</h3>
          <p class="section-description">${i18n.t('settings.language.description')}</p>
          <div class="setting-item">
            <label for="languageSelect">${i18n.t('settings.language.label')}:</label>
            <select id="languageSelect" class="setting-select">
              <option value="pt-BR" ${currentLocale === 'pt-BR' ? 'selected' : ''}>${i18n.t('settings.language.ptBR')}</option>
              <option value="en-US" ${currentLocale === 'en-US' ? 'selected' : ''}>${i18n.t('settings.language.enUS')}</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>💾 ${i18n.t('settings.data.title')}</h3>
          <p class="section-description">${i18n.t('settings.data.description')}</p>
          <button class="btn-secondary" id="exportBtn">
            📤 ${i18n.t('settings.data.export')}
          </button>
          <button class="btn-secondary" id="importBtn" disabled>
            📥 ${i18n.t('settings.data.import')}
          </button>
        </div>

        <div class="settings-section danger-zone">
          <h3>⚠️ ${i18n.t('settings.danger.title')}</h3>
          <p class="section-description">${i18n.t('settings.danger.description')}</p>
          <button class="btn-danger" id="clearDataBtn">
            🗑️ ${i18n.t('settings.danger.clear')}
          </button>
        </div>

        <div class="settings-section">
          <h3>ℹ️ ${i18n.t('settings.about.title')}</h3>
          <p class="about-text">
            <strong>Assets Store</strong> ${i18n.t('settings.about.description')}
          </p>
          <p class="about-text">
            ${i18n.t('settings.about.madeWith')}
          </p>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
    const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
    const exportBtn = document.getElementById('exportBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');

    themeSelect?.addEventListener('change', () => this.handleThemeChange(themeSelect.value as 'default' | 'light' | 'dark'));
    languageSelect?.addEventListener('change', () => this.handleLanguageChange(languageSelect.value as 'pt-BR' | 'en-US'));
    exportBtn?.addEventListener('click', () => this.handleExport());
    clearDataBtn?.addEventListener('click', () => this.handleClearData());
  }

  private handleThemeChange(theme: 'default' | 'light' | 'dark'): void {
    window.themeManager.setTheme(theme);
  }

  private handleLanguageChange(locale: 'pt-BR' | 'en-US'): void {
    window.i18n.setLocale(locale);
    
    // Update all i18n texts
    window.updateI18nTexts();
    
    // Re-render current page
    window.router.navigateTo('settings');
  }

  private async handleExport(): Promise<void> {
    const i18n = window.i18n;
    try {
      const assets = await window.api.getAssets();
      const dataStr = JSON.stringify(assets, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `assets-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert(i18n.t('settings.data.exportSuccess'));
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert(i18n.t('settings.data.exportError'));
    }
  }

  private async handleClearData(): Promise<void> {
    const i18n = window.i18n;
    const confirmed = confirm(i18n.t('settings.danger.clearConfirm'));

    if (!confirmed) return;

    const doubleConfirm = confirm(i18n.t('settings.danger.clearDoubleConfirm'));
    
    if (!doubleConfirm) return;

    try {
      const assets = await window.api.getAssets();
      
      for (const asset of assets) {
        await window.api.deleteAsset(asset.id);
      }
      
      alert(i18n.t('settings.danger.clearSuccess'));
      window.router.navigateTo('list');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      alert(i18n.t('settings.danger.clearError'));
    }
  }
}
