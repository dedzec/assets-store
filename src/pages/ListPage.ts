/**
 * List Page Component
 * Displays and manages the list of assets with search functionality
 */

import { Asset } from '../types';
import { escapeHtml, truncate, icons } from '../utils';
import { formatDate } from '../utils/date.utils';
import { showConfirm, toast } from '../components';

export class ListPage {
  private container: HTMLElement;
  private allAssets: Asset[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render() {
    const i18n = window.i18n;
    this.container.innerHTML = `
      <div class="page-header">
        <h2>${icons.list(28)} ${i18n.t('list.title')}</h2>
        <p>${i18n.t('list.subtitle')}</p>
      </div>
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">${icons.search(20)}</span>
          <input 
            type="text"
            id="searchInput" 
            placeholder="${i18n.t('list.searchPlaceholder')}" 
            autocomplete="off"
          />
          <button id="clearSearchBtn" class="clear-search-btn" style="display: none;">✕</button>
        </div>
      </div>
      <div id="assetsList" class="assets-grid">
        ${this.renderSkeletons()}
      </div>
    `;

    await this.loadAssets();
    this.attachSearchListeners();
  }

  /** Renders skeleton loading cards */
  private renderSkeletons(count = 3): string {
    return Array.from({ length: count }, () => `
      <div class="skeleton-card">
        <div class="skeleton-pulse skeleton-card__image"></div>
        <div class="skeleton-card__body">
          <div class="skeleton-pulse skeleton-card__title"></div>
          <div class="skeleton-pulse skeleton-card__line"></div>
          <div class="skeleton-pulse skeleton-card__line"></div>
          <div class="skeleton-pulse skeleton-card__line skeleton-card__line--short"></div>
        </div>
        <div class="skeleton-card__footer">
          <div class="skeleton-pulse skeleton-card__btn"></div>
          <div class="skeleton-pulse skeleton-card__btn"></div>
        </div>
      </div>
    `).join('');
  }

  private attachSearchListeners() {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value;
        this.loadAssets(query);
        
        // Show/hide clear button
        if (clearBtn) {
          clearBtn.style.display = query ? 'block' : 'none';
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          clearBtn.style.display = 'none';
          this.loadAssets('');
        }
      });
    }
  }

  private async loadAssets(searchQuery = '') {
    const listContainer = document.getElementById('assetsList');
    if (!listContainer) return;

    try {
      // Load all assets only once
      if (this.allAssets.length === 0) {
        this.allAssets = await window.api.getAssets();
      }

      // Filter assets based on search query
      const filteredAssets = searchQuery 
        ? this.allAssets.filter(asset => 
            asset.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : this.allAssets;
      
      if (filteredAssets.length === 0) {
        const i18n = window.i18n;
        const message = searchQuery 
          ? i18n.t('list.noResults')
          : i18n.t('list.empty');
        const button = searchQuery 
          ? '' 
          : `<button class="btn-primary" onclick="window.router.navigateTo('form')">
              ${icons.plus(18)} ${i18n.t('list.emptyButton')}
            </button>`;
        
        listContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">${searchQuery ? icons.search(64) : icons.inbox(64)}</div>
            <p>${message}</p>
            ${button}
          </div>
        `;
        return;
      }

      // Load images in parallel
      const assetsWithImages = await Promise.all(
        filteredAssets.map(async (asset) => {
          let imageDataUrl = null;
          if (asset.image) {
            try {
              imageDataUrl = await window.api.readImage(asset.image);
            } catch (err) {
              console.error('Error loading image for asset', asset.id, err);
            }
          }
          return { ...asset, imageDataUrl };
        })
      );

      const i18n = window.i18n;
      const locale = i18n.getLocale();
      listContainer.innerHTML = assetsWithImages.map(asset => `
        <div class="asset-card" data-id="${asset.id}">
          ${asset.imageDataUrl ? `
            <div class="asset-image">
              <img src="${asset.imageDataUrl}" alt="${escapeHtml(asset.title)}" />
            </div>
          ` : `
            <div class="asset-image asset-image-placeholder">
              <span>${icons.image(48)}</span>
            </div>
          `}
          <div class="asset-content">
            <h3>${escapeHtml(asset.title)}</h3>
            ${asset.unity ? `<p class="asset-unity">${icons.gamepad(16)} Unity: <a href="#" class="asset-link-btn" data-url="${escapeHtml(asset.unity)}" title="${escapeHtml(asset.unity)}">${truncate(asset.unity, 40)}</a></p>` : ''}
            ${asset.unreal ? `<p class="asset-unreal">${icons.target(16)} Unreal: <a href="#" class="asset-link-btn" data-url="${escapeHtml(asset.unreal)}" title="${escapeHtml(asset.unreal)}">${truncate(asset.unreal, 40)}</a></p>` : ''}
            ${asset.link ? `<p class="asset-link">${icons.link(16)} Link: <a href="#" class="asset-link-btn" data-url="${escapeHtml(asset.link)}" title="${escapeHtml(asset.link)}">${truncate(asset.link, 40)}</a></p>` : ''}
            <small class="asset-date">${i18n.t('list.createdAt')}: ${formatDate(asset.createdAt, locale)}</small>
          </div>
          <div class="asset-actions">
            <button class="btn-edit" data-id="${asset.id}">
              ${icons.edit(16)} ${i18n.t('list.edit')}
            </button>
            <button class="btn-delete" data-id="${asset.id}">
              ${icons.delete(16)} ${i18n.t('list.delete')}
            </button>
          </div>
        </div>
      `).join('');

      this.attachEventListeners();
    } catch (error) {
      console.error('Erro ao carregar assets:', error);
      const i18n = window.i18n;
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icons.alertTriangle(64)}</div>
          <p>${i18n.t('list.errorLoading')}</p>
        </div>
      `;
    }
  }

  private attachEventListeners() {
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const linkButtons = document.querySelectorAll('.asset-link-btn');

    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
          window.router.navigateTo('form', { id });
        }
      });
    });

    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
        await this.deleteAsset(id);
      });
    });

    linkButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = (e.currentTarget as HTMLElement).dataset.url;
        if (url) {
          await window.api.openExternal(url);
        }
      });
    });
  }

  private async deleteAsset(id: number) {
    const i18n = window.i18n;
    const confirmed = await showConfirm(
      i18n.t('list.delete'),
      i18n.t('list.deleteConfirm'),
      'danger',
    );
    if (!confirmed) return;

    try {
      await window.api.deleteAsset(id);
      // Reload all assets from database
      this.allAssets = [];
      await this.loadAssets();
    } catch (error) {
      console.error('Erro ao excluir asset:', error);
      toast.error(i18n.t('list.errorLoading'));
    }
  }
}
