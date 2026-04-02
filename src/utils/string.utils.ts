/**
 * String Utilities
 * Helper functions for string manipulation
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a string to kebab-case
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Detects whether a link points to a local file or a cloud/online resource.
 * Returns 'local' for file-system paths, 'cloud' for URLs, or '' if empty.
 */
export function detectLinkType(link: string): 'local' | 'cloud' | '' {
  const trimmed = link.trim();
  if (!trimmed) return '';

  // Cloud patterns — URLs and protocol-based links
  if (/^https?:\/\//i.test(trimmed)) return 'cloud';
  if (/^ftp:\/\//i.test(trimmed)) return 'cloud';
  if (/^s3:\/\//i.test(trimmed)) return 'cloud';

  // Local patterns — absolute / relative file paths
  if (trimmed.startsWith('/')) return 'local';
  if (/^[A-Za-z]:[/\\]/.test(trimmed)) return 'local';
  if (trimmed.startsWith('~')) return 'local';
  if (trimmed.startsWith('\\\\')) return 'local';
  if (/^file:\/\//i.test(trimmed)) return 'local';
  if (trimmed.startsWith('./') || trimmed.startsWith('../')) return 'local';

  // Domain-like pattern (e.g. drive.google.com/...) → cloud
  if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(trimmed)) return 'cloud';

  // Default: treat as local path
  return 'local';
}
