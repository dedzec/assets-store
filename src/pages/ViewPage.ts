/**
 * View Page Component
 * Displays the full details of a single asset
 */

import { Asset, Category } from '../types';
import { escapeHtml, truncate, icons } from '../utils';
import { formatDate } from '../utils/date.utils';
import { showConfirm, toast } from '../components';

export class ViewPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(params?: { id?: string }) {
    if (!params?.id) {
      window.router.navigateTo('list');
      return;
    }

    const id = parseInt(params.id);
    await this.loadAsset(id);
  }

  private async loadAsset(id: number): Promise<void> {
    const i18n = window.i18n;

    try {
      const asset = await window.api.getAssetById(id);
      if (!asset) {
        toast.warning(i18n.t('form.notFound'));
        window.router.navigateTo('list');
        return;
      }

      // Load image and categories in parallel
      const [imageDataUrl, categories] = await Promise.all([
        asset.image ? window.api.readImage(asset.image).catch(() => null) : Promise.resolve(null),
        window.api.getAssetCategories(asset.id).catch(() => [] as Category[]),
      ]);

      this.renderView(asset, imageDataUrl, categories);
    } catch (error) {
      console.error('Error loading asset:', error);
      toast.error(i18n.t('view.errorLoading'));
      window.router.navigateTo('list');
    }
  }

  private renderView(asset: Asset, imageDataUrl: string | null, categories: Category[]): void {
    const i18n = window.i18n;
    const locale = i18n.getLocale();

    const categoriesHtml = categories.length > 0
      ? `<div class="view-categories">
          ${categories.map(c => `<span class="category-badge" style="--chip-color: ${escapeHtml(c.color)}">${escapeHtml(c.name)}</span>`).join('')}
        </div>`
      : '';

    this.container.innerHTML = `
      <div class="view-page">
        <div class="view-header">
          <button class="btn-back" id="backBtn">
            ${icons.arrowLeft(20)} ${i18n.t('view.back')}
          </button>
          <div class="view-header__actions">
            <button class="btn-primary" id="editBtn">
              ${icons.edit(16)} ${i18n.t('list.edit')}
            </button>
            <button class="btn-danger" id="deleteBtn">
              ${icons.delete(16)} ${i18n.t('list.delete')}
            </button>
          </div>
        </div>

        <div class="view-content">
          ${imageDataUrl ? `
            <div class="view-image">
              <img src="${imageDataUrl}" alt="${escapeHtml(asset.title)}" />
            </div>
          ` : ''}

          <div class="view-details">
            <div class="view-title-row">
              <h1 class="view-title">${escapeHtml(asset.title)}</h1>
              ${asset.version ? `<span class="asset-version asset-version--lg">v${escapeHtml(asset.version)}</span>` : ''}
            </div>

            ${categoriesHtml}

            <div class="view-meta">
              <span class="view-meta__item">
                ${icons.calendar(14)} ${i18n.t('list.createdAt')}: ${formatDate(asset.createdAt, locale)}
              </span>
            </div>

            <div class="view-fields">
              ${asset.unity ? `
                <div class="view-field">
                  <label>${icons.gamepad(16)} Unity</label>
                  <div class="view-field__value">
                    <a href="#" class="view-link" data-url="${escapeHtml(asset.unity)}" title="${escapeHtml(asset.unity)}">
                      ${escapeHtml(asset.unity)}
                    </a>
                  </div>
                </div>
              ` : ''}

              ${asset.unreal ? `
                <div class="view-field">
                  <label>${icons.target(16)} Unreal</label>
                  <div class="view-field__value">
                    <a href="#" class="view-link" data-url="${escapeHtml(asset.unreal)}" title="${escapeHtml(asset.unreal)}">
                      ${escapeHtml(asset.unreal)}
                    </a>
                  </div>
                </div>
              ` : ''}

              ${asset.link ? `
                <div class="view-field">
                  <label>
                    ${icons.link(16)} Link
                    ${asset.linkType ? `<span class="link-type-badge link-type-badge--${asset.linkType}">
                      ${asset.linkType === 'local' ? `${icons.hardDrive(14)} ${i18n.t('form.linkTypeLocal')}` : `${icons.globe(14)} ${i18n.t('form.linkTypeCloud')}`}
                    </span>` : ''}
                  </label>
                  <div class="view-field__value">
                    <a href="#" class="view-link" data-url="${escapeHtml(asset.link)}" title="${escapeHtml(asset.link)}">
                      ${escapeHtml(asset.link)}
                    </a>
                  </div>
                </div>
              ` : ''}

              ${asset.image ? `
                <div class="view-field">
                  <label>${icons.image(16)} ${i18n.t('form.fieldImage')}</label>
                  <div class="view-field__value view-field__value--path">
                    ${truncate(asset.image, 80)}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(asset.id);
  }

  private attachEventListeners(assetId: number): void {
    const backBtn = document.getElementById('backBtn');
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const links = document.querySelectorAll('.view-link');

    backBtn?.addEventListener('click', () => {
      window.router.navigateTo('list');
    });

    editBtn?.addEventListener('click', () => {
      window.router.navigateTo('form', { id: String(assetId) });
    });

    deleteBtn?.addEventListener('click', async () => {
      const i18n = window.i18n;
      const confirmed = await showConfirm(
        i18n.t('list.delete'),
        i18n.t('list.deleteConfirm'),
        'danger',
      );
      if (!confirmed) return;

      try {
        await window.api.deleteAsset(assetId);
        toast.success(i18n.t('view.deleteSuccess'));
        window.router.navigateTo('list');
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error(i18n.t('list.errorLoading'));
      }
    });

    links.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = (e.currentTarget as HTMLElement).dataset.url;
        if (url) {
          await window.api.openExternal(url);
        }
      });
    });
  }
}
