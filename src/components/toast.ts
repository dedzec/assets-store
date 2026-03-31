/**
 * Toast Notification Component
 * Non-blocking toast notifications to replace alert() for success/error feedback
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

let container: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (!container || !document.body.contains(container)) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Shows a toast notification.
 */
export function showToast(options: ToastOptions): void {
  const { message, type = 'info', duration = 3500 } = options;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const iconMap: Record<ToastType, string> = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠',
  };

  toast.innerHTML = `
    <span class="toast__icon">${iconMap[type]}</span>
    <span class="toast__message">${message}</span>
    <button class="toast__close">&times;</button>
  `;

  const toastContainer = getContainer();
  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  const dismiss = () => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 350);
  };

  toast.querySelector('.toast__close')?.addEventListener('click', dismiss);

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }
}

/** Shorthand helpers */
export const toast = {
  success: (message: string, duration?: number) => showToast({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration }),
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration }),
  warning: (message: string, duration?: number) => showToast({ message, type: 'warning', duration }),
};
