import { Asset } from '../types';

export class FormPage {
  private container: HTMLElement;
  private editingId: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(params?: { id?: string }) {
    if (params?.id) {
      this.editingId = parseInt(params.id);
      await this.loadAssetForEdit(this.editingId);
    } else {
      this.editingId = null;
      this.renderForm();
    }
  }

  private async renderForm(asset?: Asset): Promise<void> {
    const isEdit = !!asset;
    const i18n = window.i18n;
    
    // Load image preview if editing and has image
    let imagePreviewHtml = '';
    if (asset?.image) {
      const base64Image = await window.api.readImage(asset.image);
      if (base64Image) {
        imagePreviewHtml = `
          <div class="image-preview">
            <img src="${base64Image}" alt="Preview" />
          </div>
        `;
      }
    }
    
    this.container.innerHTML = `
      <div class="page-header">
        <h2>${isEdit ? `✏️ ${i18n.t('form.titleEdit')}` : `➕ ${i18n.t('form.titleAdd')}`}</h2>
        <p>${isEdit ? i18n.t('form.subtitleEdit') : i18n.t('form.subtitleAdd')}</p>
      </div>
      
      <form id="assetForm" class="asset-form">
        <input type="hidden" id="assetId" value="${asset?.id || ''}" />
        
        <div class="form-group">
          <label for="assetTitle">${i18n.t('form.fieldTitle')} *</label>
          <input 
            type="text" 
            id="assetTitle" 
            placeholder="${i18n.t('form.fieldTitlePlaceholder')}" 
            value="${this.escapeHtml(asset?.title || '')}"
            maxlength="255"
            required 
          />
        </div>

        <div class="form-group">
          <label for="assetImage">${i18n.t('form.fieldImage')}</label>
          <div class="file-input-wrapper">
            <input 
              type="text" 
              id="assetImage" 
              placeholder="${i18n.t('form.fieldImagePlaceholder')}" 
              value="${this.escapeHtml(asset?.image || '')}"
              readonly
            />
            <button type="button" id="selectImageBtn" class="btn-secondary">
              📁 ${i18n.t('form.selectFile')}
            </button>
          </div>
          <div id="imagePreviewContainer">
            ${imagePreviewHtml}
          </div>
        </div>

        <div class="form-group">
          <label for="assetUnity">Unity</label>
          <textarea 
            id="assetUnity" 
            placeholder="${i18n.t('form.fieldUnityPlaceholder')}"
            rows="3"
          >${this.escapeHtml(asset?.unity || '')}</textarea>
        </div>

        <div class="form-group">
          <label for="assetUnreal">Unreal</label>
          <textarea 
            id="assetUnreal" 
            placeholder="${i18n.t('form.fieldUnrealPlaceholder')}"
            rows="3"
          >${this.escapeHtml(asset?.unreal || '')}</textarea>
        </div>

        <div class="form-group">
          <label for="assetLink">${i18n.t('form.fieldLink')}</label>
          <textarea 
            id="assetLink" 
            placeholder="${i18n.t('form.fieldLinkPlaceholder')}"
            rows="3"
          >${this.escapeHtml(asset?.link || '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            ${isEdit ? `💾 ${i18n.t('form.buttonUpdate')}` : `➕ ${i18n.t('form.buttonAdd')}`}
          </button>
          <button type="button" id="cancelBtn" class="btn-secondary">
            ❌ ${i18n.t('form.buttonCancel')}
          </button>
        </div>
      </form>
    `;

    this.attachEventListeners();
  }

  private async loadAssetForEdit(id: number): Promise<void> {
    try {
      const assets: Asset[] = await window.api.getAssets();
      const asset = assets.find(a => a.id === id);
      
      if (asset) {
        this.renderForm(asset);
      } else {
        alert(window.i18n.t('form.notFound'));
        window.router.navigateTo('list');
      }
    } catch (error) {
      console.error('Erro ao carregar asset:', error);
      alert(window.i18n.t('form.errorLoad'));
      window.router.navigateTo('list');
    }
  }

  private attachEventListeners() {
    const form = document.getElementById('assetForm') as HTMLFormElement;
    const selectImageBtn = document.getElementById('selectImageBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    selectImageBtn?.addEventListener('click', () => this.handleSelectImage());
    cancelBtn?.addEventListener('click', () => window.router.navigateTo('list'));
  }

  private async handleSelectImage(): Promise<void> {
    try {
      const filePath = await window.api.selectFile();
      if (filePath) {
        const imageInput = document.getElementById('assetImage') as HTMLInputElement;
        imageInput.value = filePath;
        
        // Read image and convert to base64 for preview
        const base64Image = await window.api.readImage(filePath);
        
        // Update preview
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer && base64Image) {
          previewContainer.innerHTML = `
            <div class="image-preview">
              <img src="${base64Image}" alt="Preview" />
            </div>
          `;
        } else if (previewContainer) {
          previewContainer.innerHTML = `
            <div class="image-preview">
              <p style="color: var(--text-secondary);">${window.i18n.t('form.errorLoadImage')}</p>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      alert(window.i18n.t('form.errorFile'));
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const titleInput = document.getElementById('assetTitle') as HTMLInputElement;
    const imageInput = document.getElementById('assetImage') as HTMLInputElement;
    const unityInput = document.getElementById('assetUnity') as HTMLTextAreaElement;
    const unrealInput = document.getElementById('assetUnreal') as HTMLTextAreaElement;
    const linkInput = document.getElementById('assetLink') as HTMLTextAreaElement;

    const asset = {
      title: titleInput.value.trim(),
      image: imageInput.value.trim(),
      unity: unityInput.value.trim(),
      unreal: unrealInput.value.trim(),
      link: linkInput.value.trim(),
    };

    if (!asset.title) {
      alert(window.i18n.t('form.required'));
      return;
    }

    try {
      if (this.editingId) {
        await window.api.updateAsset({ id: this.editingId, ...asset });
      } else {
        await window.api.addAsset(asset);
      }
      
      window.router.navigateTo('list');
    } catch (error) {
      console.error('Erro ao salvar asset:', error);
      alert(window.i18n.t('form.errorSave'));
    }
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
