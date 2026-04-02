/**
 * List Page Component
 * Displays and manages the list of assets with search functionality
 */

import { Asset, Category } from '../types';
import { escapeHtml, truncate, icons } from '../utils';
import { formatDate } from '../utils/date.utils';
import { showConfirm, toast } from '../components';

export class ListPage {
  private container: HTMLElement;
  private allAssets: Asset[] = [];
  private allCategories: Category[] = [];
  private selectedCategoryId: number | null = null;
  private currentPage = 1;
  private readonly pageSize = 12;
  /** Cache of categories per asset id */
  private categoryCache: Map<number, Category[]> = new Map();
  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render() {
    const i18n = window.i18n;

    // Load categories for the filter bar
    try {
      this.allCategories = await window.api.getCategories();
    } catch {
      this.allCategories = [];
    }

    const categoryFilterHtml = this.allCategories.length > 0
      ? `<div class="category-filter" id="categoryFilter">
          <span class="category-filter__label">${icons.filter(14)} ${i18n.t('list.filterByCategory')}:</span>
          <button class="category-filter__chip active" data-id="all">${i18n.t('list.filterAll')}</button>
          ${this.allCategories.map(c => `
            <button class="category-filter__chip" data-id="${c.id}" style="--chip-color: ${escapeHtml(c.color)}">${escapeHtml(c.name)}</button>
          `).join('')}
        </div>`
      : '';

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
        ${categoryFilterHtml}
      </div>
      <div id="assetsList" class="assets-grid">
        ${this.renderSkeletons()}
      </div>
    `;

    await this.loadAssets();
    this.attachSearchListeners();
    this.attachFilterListeners();
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

  private attachFilterListeners() {
    const filterContainer = document.getElementById('categoryFilter');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
      const chip = (e.target as HTMLElement).closest('.category-filter__chip') as HTMLElement | null;
      if (!chip) return;

      // Update active state
      filterContainer.querySelectorAll('.category-filter__chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const idStr = chip.dataset.id;
      this.selectedCategoryId = idStr === 'all' ? null : Number(idStr);
      this.currentPage = 1;

      const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
      this.loadAssets(searchInput?.value || '');
    });
  }

  private async loadAssets(searchQuery = '') {
    const listContainer = document.getElementById('assetsList');
    if (!listContainer) return;

    try {
      // Load all assets only once
      if (this.allAssets.length === 0) {
        this.allAssets = await window.api.getAssets();

        // Pre-load categories for all assets if filtering is enabled
        if (this.allCategories.length > 0) {
          await Promise.all(
            this.allAssets.map(async (asset) => {
              if (!this.categoryCache.has(asset.id)) {
                try {
                  const cats = await window.api.getAssetCategories(asset.id);
                  this.categoryCache.set(asset.id, cats);
                } catch { /* ignore */ }
              }
            })
          );
        }
      }

      // Filter assets based on search query
      let filteredAssets = searchQuery 
        ? this.allAssets.filter(asset => 
            asset.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [...this.allAssets];

      // Filter by selected category
      if (this.selectedCategoryId !== null) {
        const catId = this.selectedCategoryId;
        filteredAssets = filteredAssets.filter(asset => {
          const cats = this.categoryCache.get(asset.id) ?? [];
          return cats.some(c => c.id === catId);
        });
      }

      // Reset to page 1 on search
      if (searchQuery) {
        this.currentPage = 1;
      }

      const totalItems = filteredAssets.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
      // Clamp current page
      if (this.currentPage > totalPages) this.currentPage = totalPages;

      const startIdx = (this.currentPage - 1) * this.pageSize;
      const pageAssets = filteredAssets.slice(startIdx, startIdx + this.pageSize);
      
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
        this.removePagination();
        return;
      }

      // Load images in parallel
      const assetsWithImages = await Promise.all(
        pageAssets.map(async (asset) => {
          let imageDataUrl = null;
          if (asset.image) {
            try {
              imageDataUrl = await window.api.readImage(asset.image);
            } catch (err) {
              console.error('Error loading image for asset', asset.id, err);
            }
          }

          // Load categories (use cache if available)
          let categories: Category[] = [];
          if (this.categoryCache.has(asset.id)) {
            categories = this.categoryCache.get(asset.id) ?? [];
          } else {
            try {
              categories = await window.api.getAssetCategories(asset.id);
              this.categoryCache.set(asset.id, categories);
            } catch { /* ignore */ }
          }

          return { ...asset, imageDataUrl, categories };
        })
      );

      const i18n = window.i18n;
      const locale = i18n.getLocale();
      listContainer.innerHTML = assetsWithImages.map(asset => `
        <div class="asset-card" data-id="${asset.id}">
          <div class="asset-card__clickable" data-id="${asset.id}">
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
              <h3>${escapeHtml(asset.title)}${asset.version ? `<span class="asset-version">v${escapeHtml(asset.version)}</span>` : ''}</h3>
              ${asset.unity ? `<p class="asset-unity">${icons.gamepad(16)} Unity: <span title="${escapeHtml(asset.unity)}">${truncate(asset.unity, 40)}</span></p>` : ''}
              ${asset.unreal ? `<p class="asset-unreal">${icons.target(16)} Unreal: <span title="${escapeHtml(asset.unreal)}">${truncate(asset.unreal, 40)}</span></p>` : ''}
              ${asset.link ? `<p class="asset-link">${icons.link(16)} Link: <span title="${escapeHtml(asset.link)}">${truncate(asset.link, 40)}</span>${asset.linkType ? `<span class="link-type-badge link-type-badge--${asset.linkType} link-type-badge--sm">${asset.linkType === 'local' ? icons.hardDrive(12) : icons.globe(12)}</span>` : ''}</p>` : ''}
              <small class="asset-date">${i18n.t('list.createdAt')}: ${formatDate(asset.createdAt, locale)}</small>
              ${asset.categories.length > 0 ? `
                <div class="asset-categories">
                  ${asset.categories.map(c => `<span class="category-badge" style="--chip-color: ${escapeHtml(c.color)}">${escapeHtml(c.name)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="asset-actions">
            <button class="btn-view" data-id="${asset.id}">
              ${icons.eye(16)} ${i18n.t('list.view')}
            </button>
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
      this.renderPagination(totalPages, totalItems, searchQuery);
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

  /** Render pagination controls below the grid */
  private renderPagination(totalPages: number, totalItems: number, searchQuery: string): void {
    // Remove existing pagination
    this.removePagination();

    if (totalPages <= 1) return;

    const i18n = window.i18n;
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.id = 'pagination';

    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, totalItems);

    pagination.innerHTML = `
      <span class="pagination__info">${startItem}–${endItem} ${i18n.t('list.paginationOf')} ${totalItems}</span>
      <div class="pagination__controls">
        <button class="pagination__btn" id="paginationPrev" ${this.currentPage <= 1 ? 'disabled' : ''}>
          ‹ ${i18n.t('list.paginationPrev')}
        </button>
        <span class="pagination__page">${this.currentPage} / ${totalPages}</span>
        <button class="pagination__btn" id="paginationNext" ${this.currentPage >= totalPages ? 'disabled' : ''}>
          ${i18n.t('list.paginationNext')} ›
        </button>
      </div>
    `;

    // Insert after assets grid
    const grid = document.getElementById('assetsList');
    grid?.parentElement?.insertBefore(pagination, grid.nextSibling);

    // Attach pagination listeners
    document.getElementById('paginationPrev')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadAssets(searchQuery);
      }
    });
    document.getElementById('paginationNext')?.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.loadAssets(searchQuery);
      }
    });
  }

  private removePagination(): void {
    document.getElementById('pagination')?.remove();
  }

  private attachEventListeners() {
    const viewButtons = document.querySelectorAll('.btn-view');
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const clickableAreas = document.querySelectorAll('.asset-card__clickable');

    clickableAreas.forEach(area => {
      area.addEventListener('click', (e) => {
        // Don't navigate if user clicked a link or button inside
        if ((e.target as HTMLElement).closest('a, button')) return;
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
          window.router.navigateTo('view', { id });
        }
      });
    });

    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
          window.router.navigateTo('view', { id });
        }
      });
    });

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
      this.categoryCache.clear();
      this.currentPage = 1;
      await this.loadAssets();
    } catch (error) {
      console.error('Erro ao excluir asset:', error);
      toast.error(i18n.t('list.errorLoading'));
    }
  }
}
