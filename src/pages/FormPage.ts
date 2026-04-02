import { Asset } from '../types';
import { escapeHtml, detectLinkType, icons } from '../utils';
import { showAlert, toast } from '../components';

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
        <h2>${isEdit ? `${icons.edit(28)} ${i18n.t('form.titleEdit')}` : `${icons.plus(28)} ${i18n.t('form.titleAdd')}`}</h2>
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
            value="${escapeHtml(asset?.title || '')}"
            maxlength="255"
            required 
          />
        </div>

        <div class="form-group">
          <label for="assetVersion">${i18n.t('form.fieldVersion')}</label>
          <input 
            type="text" 
            id="assetVersion" 
            placeholder="${i18n.t('form.fieldVersionPlaceholder')}" 
            value="${escapeHtml(asset?.version || '')}"
            maxlength="50"
          />
        </div>

        <div class="form-group">
          <label for="assetImage">${i18n.t('form.fieldImage')}</label>
          <div class="file-input-wrapper">
            <input 
              type="text" 
              id="assetImage" 
              placeholder="${i18n.t('form.fieldImagePlaceholder')}" 
              value="${escapeHtml(asset?.image || '')}"
              readonly
            />
            <button type="button" id="selectImageBtn" class="btn-secondary">
              ${icons.folderOpen(16)} ${i18n.t('form.selectFile')}
            </button>
          </div>
          <div id="dropZone" class="drop-zone">
            <p>${icons.upload(24)}</p>
            <p>${i18n.t('form.dropHint')}</p>
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
          >${escapeHtml(asset?.unity || '')}</textarea>
        </div>

        <div class="form-group">
          <label for="assetUnreal">Unreal</label>
          <textarea 
            id="assetUnreal" 
            placeholder="${i18n.t('form.fieldUnrealPlaceholder')}"
            rows="3"
          >${escapeHtml(asset?.unreal || '')}</textarea>
        </div>

        <div class="form-group">
          <label for="assetLink">
            ${i18n.t('form.fieldLink')}
            <span id="linkTypeBadge" class="link-type-badge ${asset?.linkType ? `link-type-badge--${asset.linkType}` : ''}" style="${asset?.linkType ? '' : 'display:none'}">
              ${asset?.linkType === 'local' ? `${icons.hardDrive(14)} ${i18n.t('form.linkTypeLocal')}` : ''}${asset?.linkType === 'cloud' ? `${icons.globe(14)} ${i18n.t('form.linkTypeCloud')}` : ''}
            </span>
          </label>
          <textarea 
            id="assetLink" 
            placeholder="${i18n.t('form.fieldLinkPlaceholder')}"
            rows="3"
          >${escapeHtml(asset?.link || '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            ${isEdit ? `${icons.save(16)} ${i18n.t('form.buttonUpdate')}` : `${icons.plus(16)} ${i18n.t('form.buttonAdd')}`}
          </button>
          <button type="button" id="cancelBtn" class="btn-secondary">
            ${icons.close(16)} ${i18n.t('form.buttonCancel')}
          </button>
        </div>
      </form>
    `;

    this.attachEventListeners();
  }

  private async loadAssetForEdit(id: number): Promise<void> {
    try {
      const asset: Asset | null = await window.api.getAssetById(id);
      
      if (asset) {
        this.renderForm(asset);
      } else {
        await showAlert(window.i18n.t('common.warning'), window.i18n.t('form.notFound'), 'warning');
        window.router.navigateTo('list');
      }
    } catch (error) {
      console.error('Erro ao carregar asset:', error);
      toast.error(window.i18n.t('form.errorLoad'));
      window.router.navigateTo('list');
    }
  }

  private attachEventListeners() {
    const form = document.getElementById('assetForm') as HTMLFormElement;
    const selectImageBtn = document.getElementById('selectImageBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const dropZone = document.getElementById('dropZone');
    const linkInput = document.getElementById('assetLink') as HTMLTextAreaElement;

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    selectImageBtn?.addEventListener('click', () => this.handleSelectImage());
    cancelBtn?.addEventListener('click', () => window.router.navigateTo('list'));

    // Auto-detect link type as user types
    linkInput?.addEventListener('input', () => this.updateLinkTypeBadge(linkInput.value));

    // Drag & drop zone
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drop-zone--active');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drop-zone--active');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-zone--active');
        const file = e.dataTransfer?.files[0];
        if (file) {
          this.handleDroppedFile(file);
        }
      });
    }
  }

  /** Update the link type badge based on current link value */
  private updateLinkTypeBadge(linkValue: string): void {
    const badge = document.getElementById('linkTypeBadge');
    if (!badge) return;

    const i18n = window.i18n;
    const type = detectLinkType(linkValue);

    if (!type) {
      badge.style.display = 'none';
      badge.className = 'link-type-badge';
      badge.innerHTML = '';
      return;
    }

    badge.style.display = '';
    badge.className = `link-type-badge link-type-badge--${type}`;
    badge.innerHTML = type === 'local'
      ? `${icons.hardDrive(14)} ${i18n.t('form.linkTypeLocal')}`
      : `${icons.globe(14)} ${i18n.t('form.linkTypeCloud')}`;
  }

  private async handleSelectImage(): Promise<void> {
    try {
      const filePath = await window.api.selectFile();
      if (filePath) {
        await this.setImageFromPath(filePath);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      toast.error(window.i18n.t('form.errorFile'));
    }
  }

  /** Handle a file dropped on the drop zone */
  private async handleDroppedFile(file: File): Promise<void> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.warning(window.i18n.t('form.errorUnsupportedType'));
      return;
    }

    // Electron adds a `path` property to File objects from drag-and-drop
    const filePath = (file as File & { path?: string }).path;
    if (filePath) {
      await this.setImageFromPath(filePath);
    }
  }

  /** Set the image input and preview from a file path */
  private async setImageFromPath(filePath: string): Promise<void> {
    try {
      const imageInput = document.getElementById('assetImage') as HTMLInputElement;
      imageInput.value = filePath;

      const base64Image = await window.api.readImage(filePath);

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
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      toast.error(window.i18n.t('form.errorFile'));
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const titleInput = document.getElementById('assetTitle') as HTMLInputElement;
    const versionInput = document.getElementById('assetVersion') as HTMLInputElement;
    const imageInput = document.getElementById('assetImage') as HTMLInputElement;
    const unityInput = document.getElementById('assetUnity') as HTMLTextAreaElement;
    const unrealInput = document.getElementById('assetUnreal') as HTMLTextAreaElement;
    const linkInput = document.getElementById('assetLink') as HTMLTextAreaElement;

    const linkValue = linkInput.value.trim();
    const asset = {
      title: titleInput.value.trim(),
      version: versionInput.value.trim(),
      image: imageInput.value.trim(),
      unity: unityInput.value.trim(),
      unreal: unrealInput.value.trim(),
      link: linkValue,
      linkType: detectLinkType(linkValue),
    };

    if (!asset.title) {
      toast.warning(window.i18n.t('form.required'));
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
      toast.error(window.i18n.t('form.errorSave'));
    }
  }
}
