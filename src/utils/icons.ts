/**
 * Icon Utilities
 * Centralizes Lucide icon creation for the application
 */

import {
  Package,
  List,
  Plus,
  Settings,
  DoorOpen,
  Search,
  X,
  Pencil,
  Trash2,
  Save,
  FolderOpen,
  Image,
  Gamepad2,
  Target,
  Link,
  BarChart3,
  Palette,
  Globe,
  HardDrive,
  Info,
  AlertTriangle,
  Upload,
  Download,
  ExternalLink,
  Inbox,
  Heart,
  Sun,
  Moon,
  Check,
  type IconNode,
  createElement,
} from 'lucide';

// Helper to create an SVG element from a Lucide icon definition
function createIcon(iconNode: IconNode, size = 20, strokeWidth = 2): SVGElement {
  const svg = createElement(iconNode) as unknown as SVGElement;
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('stroke-width', String(strokeWidth));
  return svg;
}

// Helper to get icon as HTML string
function iconHtml(iconNode: IconNode, size = 20, strokeWidth = 2): string {
  const svg = createIcon(iconNode, size, strokeWidth);
  const temp = document.createElement('div');
  temp.appendChild(svg);
  return temp.innerHTML;
}

/** App icons used throughout the UI */
export const icons = {
  // Sidebar / Navigation
  package: (size?: number) => iconHtml(Package, size),
  list: (size?: number) => iconHtml(List, size),
  plus: (size?: number) => iconHtml(Plus, size),
  settings: (size?: number) => iconHtml(Settings, size),
  doorOpen: (size?: number) => iconHtml(DoorOpen, size),

  // Actions
  search: (size?: number) => iconHtml(Search, size),
  close: (size?: number) => iconHtml(X, size),
  edit: (size?: number) => iconHtml(Pencil, size),
  delete: (size?: number) => iconHtml(Trash2, size),
  save: (size?: number) => iconHtml(Save, size),
  folderOpen: (size?: number) => iconHtml(FolderOpen, size),
  externalLink: (size?: number) => iconHtml(ExternalLink, size),

  // Asset fields
  image: (size?: number) => iconHtml(Image, size),
  gamepad: (size?: number) => iconHtml(Gamepad2, size),
  target: (size?: number) => iconHtml(Target, size),
  link: (size?: number) => iconHtml(Link, size),

  // Settings sections
  barChart: (size?: number) => iconHtml(BarChart3, size),
  palette: (size?: number) => iconHtml(Palette, size),
  globe: (size?: number) => iconHtml(Globe, size),
  hardDrive: (size?: number) => iconHtml(HardDrive, size),
  info: (size?: number) => iconHtml(Info, size),
  alertTriangle: (size?: number) => iconHtml(AlertTriangle, size),

  // Data operations
  upload: (size?: number) => iconHtml(Upload, size),
  download: (size?: number) => iconHtml(Download, size),

  // Empty states
  inbox: (size?: number) => iconHtml(Inbox, size, 1.5),

  // Misc
  heart: (size?: number) => iconHtml(Heart, size),

  // Theme
  sun: (size?: number) => iconHtml(Sun, size),
  moon: (size?: number) => iconHtml(Moon, size),
  check: (size?: number) => iconHtml(Check, size),
} as const;
