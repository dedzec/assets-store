import { icons } from '../utils';
import { showConfirm, toast } from '../components';
import { THEME_PALETTES, PALETTE_COLORS, type ThemePalette, type ThemeMode } from '../core/theme';

export class SettingsPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    const i18n = window.i18n;
    const theme = window.themeManager;
    const currentLocale = i18n.getLocale();

    this.container.innerHTML = `
      <div class="page-header">
        <h2>${icons.settings(28)} ${i18n.t('settings.title')}</h2>
        <p>${i18n.t('settings.subtitle')}</p>
      </div>
      
      <div class="settings-content">
        <div class="settings-section">
          <h3>${icons.barChart(24)} ${i18n.t('settings.system.title')}</h3>
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
          <h3>${icons.palette(24)} ${i18n.t('settings.appearance.title')}</h3>
          <p class="section-description">${i18n.t('settings.appearance.description')}</p>

          <div class="setting-item">
            <label>${i18n.t('settings.appearance.palette')}:</label>
            <div class="theme-palette-grid" id="paletteGrid">
              ${THEME_PALETTES.map(p => {
                const [start, end] = PALETTE_COLORS[p];
                const active = theme.getPalette() === p ? ' active' : '';
                const label = i18n.t(`settings.appearance.palette${p.charAt(0).toUpperCase() + p.slice(1)}`);
                return `
                  <button
                    class="theme-palette-btn${active}"
                    data-palette="${p}"
                    title="${label}"
                    style="background: linear-gradient(135deg, ${start} 0%, ${end} 100%)"
                  >
                    ${active ? `<span class="palette-check">${icons.check(16)}</span>` : ''}
                  </button>`;
              }).join('')}
            </div>
          </div>

          <div class="setting-item">
            <label>${i18n.t('settings.appearance.mode')}:</label>
            <div class="theme-mode-toggle" id="modeToggle">
              <button class="mode-btn${theme.getMode() === 'light' ? ' active' : ''}" data-mode="light">
                ${icons.sun(18)} ${i18n.t('settings.appearance.modeLight')}
              </button>
              <button class="mode-btn${theme.getMode() === 'dark' ? ' active' : ''}" data-mode="dark">
                ${icons.moon(18)} ${i18n.t('settings.appearance.modeDark')}
              </button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>${icons.globe(24)} ${i18n.t('settings.language.title')}</h3>
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
          <h3>${icons.hardDrive(24)} ${i18n.t('settings.data.title')}</h3>
          <p class="section-description">${i18n.t('settings.data.description')}</p>
          <button class="btn-secondary" id="exportBtn">
            ${icons.download(16)} ${i18n.t('settings.data.export')}
          </button>
          <button class="btn-secondary" id="importBtn">
            ${icons.upload(16)} ${i18n.t('settings.data.import')}
          </button>
        </div>

        <div class="settings-section danger-zone">
          <h3>${icons.alertTriangle(24)} ${i18n.t('settings.danger.title')}</h3>
          <p class="section-description">${i18n.t('settings.danger.description')}</p>
          <button class="btn-danger" id="clearDataBtn">
            ${icons.delete(16)} ${i18n.t('settings.danger.clear')}
          </button>
        </div>

        <div class="settings-section">
          <h3>${icons.info(24)} ${i18n.t('settings.about.title')}</h3>
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
    const paletteGrid = document.getElementById('paletteGrid');
    const modeToggle = document.getElementById('modeToggle');
    const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');

    paletteGrid?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.theme-palette-btn');
      if (!btn) return;
      const palette = btn.dataset.palette as ThemePalette;
      if (palette) this.handlePaletteChange(palette);
    });

    modeToggle?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.mode-btn');
      if (!btn) return;
      const mode = btn.dataset.mode as ThemeMode;
      if (mode) this.handleModeChange(mode);
    });

    languageSelect?.addEventListener('change', () => this.handleLanguageChange(languageSelect.value as 'pt-BR' | 'en-US'));
    exportBtn?.addEventListener('click', () => this.handleExport());
    importBtn?.addEventListener('click', () => this.handleImport());
    clearDataBtn?.addEventListener('click', () => this.handleClearData());
  }

  private handlePaletteChange(palette: ThemePalette): void {
    window.themeManager.setPalette(palette);
    // Re-render to update active state
    this.render();
  }

  private handleModeChange(mode: ThemeMode): void {
    window.themeManager.setMode(mode);
    // Re-render to update active state
    this.render();
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
      const data = await window.api.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `assets-store-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success(
        i18n.t('settings.data.exportSuccess')
          .replace('{assets}', String(data.assets.length))
          .replace('{categories}', String(data.categories.length)),
      );
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error(i18n.t('settings.data.exportError'));
    }
  }

  private async handleImport(): Promise<void> {
    const i18n = window.i18n;

    // Create a hidden file input to pick JSON
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data: unknown = JSON.parse(text);

        // New format: object with assets + categories + assetCategories
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const d = data as Record<string, unknown>;
          const assets = Array.isArray(d.assets) ? d.assets : [];
          const categories = Array.isArray(d.categories) ? d.categories : [];

          if (assets.length === 0 && categories.length === 0) {
            toast.warning(i18n.t('settings.data.importNoValid'));
            return;
          }

          const confirmed = await showConfirm(
            i18n.t('settings.data.import'),
            i18n.t('settings.data.importConfirm')
              .replace('{assets}', String(assets.length))
              .replace('{categories}', String(categories.length)),
            'info',
          );
          if (!confirmed) return;

          const result = await window.api.importData(data as Parameters<typeof window.api.importData>[0]);
          toast.success(
            i18n.t('settings.data.importSuccess')
              .replace('{assets}', String(result.assets))
              .replace('{categories}', String(result.categories)),
          );
        }
        // Legacy format: plain array of assets
        else if (Array.isArray(data)) {
          const validItems = data.filter(
            (item: unknown) =>
              item && typeof item === 'object' &&
              'title' in (item as Record<string, unknown>) &&
              typeof (item as Record<string, string>).title === 'string' &&
              (item as Record<string, string>).title.trim().length > 0,
          );

          if (validItems.length === 0) {
            toast.warning(i18n.t('settings.data.importNoValid'));
            return;
          }

          const confirmed = await showConfirm(
            i18n.t('settings.data.import'),
            i18n.t('settings.data.importLegacyConfirm').replace('{count}', String(validItems.length)),
            'info',
          );
          if (!confirmed) return;

          const result = await window.api.importData({ assets: validItems, categories: [], assetCategories: [] });
          toast.success(
            i18n.t('settings.data.importSuccess')
              .replace('{assets}', String(result.assets))
              .replace('{categories}', '0'),
          );
        } else {
          toast.error(i18n.t('settings.data.importInvalidFormat'));
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        if (error instanceof SyntaxError) {
          toast.error(i18n.t('settings.data.importInvalidJson'));
        } else {
          toast.error(i18n.t('settings.data.importError'));
        }
      }
    });

    fileInput.click();
  }

  private async handleClearData(): Promise<void> {
    const i18n = window.i18n;
    const confirmed = await showConfirm(
      i18n.t('settings.danger.title'),
      i18n.t('settings.danger.clearConfirm'),
      'danger',
    );
    if (!confirmed) return;

    const doubleConfirm = await showConfirm(
      i18n.t('settings.danger.title'),
      i18n.t('settings.danger.clearDoubleConfirm'),
      'danger',
    );
    if (!doubleConfirm) return;

    try {
      await window.api.clearAllAssets();
      
      toast.success(i18n.t('settings.danger.clearSuccess'));
      window.router.navigateTo('list');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast.error(i18n.t('settings.danger.clearError'));
    }
  }
}
