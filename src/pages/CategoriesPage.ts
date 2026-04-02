/**
 * Categories Page Component
 * Manages category CRUD operations
 */

import type { Category } from '../types';
import { escapeHtml, icons } from '../utils';
import { showConfirm, toast } from '../components';

const PRESET_COLORS = [
  '#667eea', '#4facfe', '#00b4db', '#11998e',
  '#f2994a', '#ee5a6f', '#9c27b0', '#e91e63',
  '#ff5722', '#795548', '#607d8b', '#3f51b5',
];

export class CategoriesPage {
  private container: HTMLElement;
  private categories: Category[] = [];
  private editingId: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    const i18n = window.i18n;

    this.container.innerHTML = `
      <div class="page-header">
        <h2>${icons.tag(28)} ${i18n.t('categories.title')}</h2>
        <p>${i18n.t('categories.subtitle')}</p>
      </div>

      <div class="categories-content">
        <div class="category-form-section">
          <h3 id="categoryFormTitle">${icons.plus(20)} ${i18n.t('categories.addTitle')}</h3>
          <form id="categoryForm" class="category-form">
            <div class="category-form__row">
              <div class="form-group category-form__name">
                <label for="categoryName">${i18n.t('categories.fieldName')} *</label>
                <input
                  type="text"
                  id="categoryName"
                  placeholder="${i18n.t('categories.fieldNamePlaceholder')}"
                  maxlength="50"
                  required
                />
              </div>
              <div class="form-group category-form__color">
                <label>${i18n.t('categories.fieldColor')}</label>
                <div class="color-picker-grid" id="colorPickerGrid">
                  ${PRESET_COLORS.map((c, i) => `
                    <button
                      type="button"
                      class="color-swatch${i === 0 ? ' active' : ''}"
                      data-color="${c}"
                      style="background: ${c}"
                      title="${c}"
                    ></button>
                  `).join('')}
                </div>
                <input type="hidden" id="categoryColor" value="${PRESET_COLORS[0]}" />
              </div>
            </div>
            <div class="category-form__preview">
              <label>${i18n.t('categories.preview')}:</label>
              <span class="category-badge" id="categoryPreview" style="background: ${PRESET_COLORS[0]}">
                ${i18n.t('categories.fieldNamePlaceholder')}
              </span>
            </div>
            <div class="category-form__actions">
              <button type="submit" class="btn-primary" id="categorySubmitBtn">
                ${icons.plus(16)} ${i18n.t('categories.buttonAdd')}
              </button>
              <button type="button" class="btn-secondary" id="categoryCancelBtn" style="display: none;">
                ${icons.close(16)} ${i18n.t('common.cancel')}
              </button>
            </div>
          </form>
        </div>

        <div class="category-list-section">
          <h3>${icons.list(20)} ${i18n.t('categories.listTitle')}</h3>
          <div id="categoriesList" class="categories-list">
            <p class="text-muted">${i18n.t('categories.loading')}</p>
          </div>
        </div>
      </div>
    `;

    await this.loadCategories();
    this.attachFormListeners();
  }

  private async loadCategories(): Promise<void> {
    const listContainer = document.getElementById('categoriesList');
    if (!listContainer) return;
    const i18n = window.i18n;

    try {
      this.categories = await window.api.getCategories();

      if (this.categories.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state empty-state--small">
            <p>${icons.tag(32)}</p>
            <p>${i18n.t('categories.empty')}</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = this.categories.map(cat => `
        <div class="category-item" data-id="${cat.id}">
          <span class="category-badge" style="background: ${escapeHtml(cat.color)}">
            ${escapeHtml(cat.name)}
          </span>
          <div class="category-item__actions">
            <button class="btn-icon btn-edit-cat" data-id="${cat.id}" title="${i18n.t('categories.edit')}">
              ${icons.edit(16)}
            </button>
            <button class="btn-icon btn-delete-cat" data-id="${cat.id}" title="${i18n.t('categories.delete')}">
              ${icons.delete(16)}
            </button>
          </div>
        </div>
      `).join('');

      this.attachListListeners();
    } catch (error) {
      console.error('Error loading categories:', error);
      listContainer.innerHTML = `<p class="text-error">${i18n.t('categories.errorLoading')}</p>`;
    }
  }

  private attachFormListeners(): void {
    const form = document.getElementById('categoryForm') as HTMLFormElement;
    const nameInput = document.getElementById('categoryName') as HTMLInputElement;
    const colorInput = document.getElementById('categoryColor') as HTMLInputElement;
    const colorGrid = document.getElementById('colorPickerGrid');
    const cancelBtn = document.getElementById('categoryCancelBtn');

    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    cancelBtn?.addEventListener('click', () => this.resetForm());

    // Color swatch selection
    colorGrid?.addEventListener('click', (e) => {
      const swatch = (e.target as HTMLElement).closest<HTMLButtonElement>('.color-swatch');
      if (!swatch) return;
      const color = swatch.dataset.color;
      if (!color) return;

      colorGrid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      colorInput.value = color;

      this.updatePreview(nameInput.value, color);
    });

    // Live preview
    nameInput?.addEventListener('input', () => {
      this.updatePreview(nameInput.value, colorInput.value);
    });
  }

  private attachListListeners(): void {
    document.querySelectorAll('.btn-edit-cat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
        if (id) this.startEdit(id);
      });
    });

    document.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
        if (id) await this.handleDelete(id);
      });
    });
  }

  private updatePreview(name: string, color: string): void {
    const preview = document.getElementById('categoryPreview');
    if (!preview) return;
    const i18n = window.i18n;
    preview.textContent = name.trim() || i18n.t('categories.fieldNamePlaceholder');
    preview.style.background = color;
  }

  private startEdit(id: number): void {
    const cat = this.categories.find(c => c.id === id);
    if (!cat) return;
    const i18n = window.i18n;

    this.editingId = id;

    const nameInput = document.getElementById('categoryName') as HTMLInputElement;
    const colorInput = document.getElementById('categoryColor') as HTMLInputElement;
    const formTitle = document.getElementById('categoryFormTitle');
    const submitBtn = document.getElementById('categorySubmitBtn');
    const cancelBtn = document.getElementById('categoryCancelBtn');
    const colorGrid = document.getElementById('colorPickerGrid');

    if (nameInput) nameInput.value = cat.name;
    if (colorInput) colorInput.value = cat.color;
    if (formTitle) formTitle.innerHTML = `${icons.edit(20)} ${i18n.t('categories.editTitle')}`;
    if (submitBtn) submitBtn.innerHTML = `${icons.save(16)} ${i18n.t('categories.buttonUpdate')}`;
    if (cancelBtn) cancelBtn.style.display = '';

    // Select the right color swatch
    colorGrid?.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('active', (s as HTMLElement).dataset.color === cat.color);
    });

    this.updatePreview(cat.name, cat.color);
    nameInput?.focus();
  }

  private resetForm(): void {
    const i18n = window.i18n;
    this.editingId = null;

    const nameInput = document.getElementById('categoryName') as HTMLInputElement;
    const colorInput = document.getElementById('categoryColor') as HTMLInputElement;
    const formTitle = document.getElementById('categoryFormTitle');
    const submitBtn = document.getElementById('categorySubmitBtn');
    const cancelBtn = document.getElementById('categoryCancelBtn');
    const colorGrid = document.getElementById('colorPickerGrid');

    if (nameInput) nameInput.value = '';
    if (colorInput) colorInput.value = PRESET_COLORS[0];
    if (formTitle) formTitle.innerHTML = `${icons.plus(20)} ${i18n.t('categories.addTitle')}`;
    if (submitBtn) submitBtn.innerHTML = `${icons.plus(16)} ${i18n.t('categories.buttonAdd')}`;
    if (cancelBtn) cancelBtn.style.display = 'none';

    // Reset swatch selection
    colorGrid?.querySelectorAll('.color-swatch').forEach((s, i) => {
      s.classList.toggle('active', i === 0);
    });

    this.updatePreview('', PRESET_COLORS[0]);
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const i18n = window.i18n;

    const nameInput = document.getElementById('categoryName') as HTMLInputElement;
    const colorInput = document.getElementById('categoryColor') as HTMLInputElement;

    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
      toast.warning(i18n.t('categories.required'));
      return;
    }

    try {
      if (this.editingId) {
        await window.api.updateCategory({ id: this.editingId, name, color });
        toast.success(i18n.t('categories.updateSuccess'));
      } else {
        await window.api.addCategory({ name, color });
        toast.success(i18n.t('categories.addSuccess'));
      }
      this.resetForm();
      await this.loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      const msg = String(error).includes('UNIQUE')
        ? i18n.t('categories.duplicateError')
        : i18n.t('categories.errorSave');
      toast.error(msg);
    }
  }

  private async handleDelete(id: number): Promise<void> {
    const i18n = window.i18n;
    const confirmed = await showConfirm(
      i18n.t('categories.delete'),
      i18n.t('categories.deleteConfirm'),
      'danger',
    );
    if (!confirmed) return;

    try {
      await window.api.deleteCategory(id);
      toast.success(i18n.t('categories.deleteSuccess'));
      if (this.editingId === id) this.resetForm();
      await this.loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(i18n.t('categories.errorDelete'));
    }
  }
}
