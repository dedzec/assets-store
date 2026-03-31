/**
 * Modal Component
 * Reusable modal dialog that replaces native alert() and confirm()
 */

export interface ModalOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

/**
 * Shows a modal dialog and returns a promise that resolves to true (confirm) or false (cancel).
 */
export function showModal(options: ModalOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // Remove any existing modal
    const existing = document.getElementById('app-modal-overlay');
    if (existing) existing.remove();

    const {
      title,
      message,
      type = 'info',
      confirmText = 'OK',
      cancelText,
      showCancel = false,
    } = options;

    const overlay = document.createElement('div');
    overlay.id = 'app-modal-overlay';
    overlay.className = 'modal-overlay';

    const cancel = cancelText ?? window.i18n.t('common.cancel') ?? 'Cancel';

    overlay.innerHTML = `
      <div class="modal modal--${type}">
        <div class="modal__header">
          <h3 class="modal__title">${title}</h3>
          <button class="modal__close" aria-label="Close">&times;</button>
        </div>
        <div class="modal__body">
          <p>${message.replace(/\n/g, '<br/>')}</p>
        </div>
        <div class="modal__footer">
          ${showCancel ? `<button class="modal__btn modal__btn--cancel">${cancel}</button>` : ''}
          <button class="modal__btn modal__btn--confirm modal__btn--${type}">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('modal-overlay--visible'));

    const close = (result: boolean) => {
      overlay.classList.remove('modal-overlay--visible');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      // Fallback removal after 300ms
      setTimeout(() => overlay.remove(), 350);
      resolve(result);
    };

    // Event listeners
    overlay.querySelector('.modal__close')?.addEventListener('click', () => close(false));
    overlay.querySelector('.modal__btn--cancel')?.addEventListener('click', () => close(false));
    overlay.querySelector('.modal__btn--confirm')?.addEventListener('click', () => close(true));

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });

    // Close on Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', onKey);
        close(false);
      }
    };
    document.addEventListener('keydown', onKey);
  });
}

/**
 * Shorthand for alert-style modal (no cancel button).
 */
export function showAlert(title: string, message: string, type: ModalOptions['type'] = 'info'): Promise<boolean> {
  return showModal({ title, message, type, showCancel: false });
}

/**
 * Shorthand for confirm-style modal (with cancel button).
 */
export function showConfirm(title: string, message: string, type: ModalOptions['type'] = 'warning'): Promise<boolean> {
  const i18n = window.i18n;
  return showModal({
    title,
    message,
    type,
    showCancel: true,
    confirmText: i18n.t('common.confirm') ?? 'Confirm',
    cancelText: i18n.t('common.cancel') ?? 'Cancel',
  });
}
