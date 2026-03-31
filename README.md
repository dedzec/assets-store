# 🎯 Assets Store

> **Professional Asset Management System** - A modern desktop application for managing Unity, Unreal Engine, and general web assets with an elegant and intuitive interface.

[![Electron](https://img.shields.io/badge/Electron-39.1.2-47848F?style=flat&logo=electron)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![better--sqlite3](https://img.shields.io/badge/better--sqlite3-12.8-003B57?style=flat&logo=sqlite)](https://github.com/WiseLibs/better-sqlite3)
[![Lucide](https://img.shields.io/badge/Lucide_Icons-SVG-F56565?style=flat)](https://lucide.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=flat&logo=vitest)](https://vitest.dev/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Database Schema](#-database-schema)
- [Architecture](#-architecture)
- [Customization](#-customization)
- [Build & Distribution](#-build--distribution)
- [Development](#-development)
- [License](#-license)

---

## 🌟 Overview

**Assets Store** is a cross-platform desktop application built with Electron that helps developers and content creators organize and manage their digital assets efficiently. Whether you're working with Unity assets, Unreal Engine content, or general web resources, Assets Store provides a centralized, searchable database with a beautiful user interface.

### Key Highlights

- 🎨 **Professional UI** - Clean, modern interface with sidebar navigation
- 🌍 **Multilingual** - Full support for Portuguese (pt-BR) and English (en-US)
- 🎨 **Themeable** - Three beautiful themes (Default/Purple, Light/Blue, Dark/Purple)
- 🔒 **Secure** - Proper IPC communication with contextBridge
- 📦 **Type-Safe** - 100% TypeScript with strict mode
- ⚡ **Fast** - Vite bundler + better-sqlite3 sync API
- 🧪 **Tested** - Vitest unit tests for utilities

---

## 🚀 Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| ✅ **CRUD Operations** | Full Create, Read, Update, Delete operations for assets |
| 🔍 **Real-time Search** | Instantly filter assets by title as you type |
| 🖼️ **Image Preview** | Upload and preview images using secure base64 encoding |
| 🔗 **Clickable URLs** | Unity, Unreal Engine, and general links open in external browser |
| 💾 **Local Storage** | SQLite database stored locally in project directory |
| 📊 **Asset Listing** | Paginated view with asset cards showing all details |
| ✏️ **Easy Editing** | Double-click any asset to edit its details |
| 🗑️ **Safe Deletion** | Confirmation dialog before deleting assets |

### User Experience

| Feature | Description |
|---------|-------------|
| 🎨 **Theme System** | Choose from 3 pre-configured themes |
| 🌐 **i18n Support** | Switch between Portuguese and English seamlessly |
| 📱 **Responsive** | Adapts to different window sizes (min: 800x600) |
| 🎯 **Intuitive Navigation** | Sidebar menu for quick page switching |
| 💡 **Visual Feedback** | Hover effects, active states, and smooth transitions |
| ⚡ **Performance** | Efficient rendering and minimal resource usage |
| 🌟 **Lucide Icons** | Professional SVG icon library instead of emojis |
| 📣 **Toast Notifications** | Non-blocking success/error feedback |
| 💬 **Custom Modals** | Styled confirm/alert dialogs replacing native popups |
| ⏳ **Loading Skeletons** | Animated placeholders during data loading |
| 🎬 **Page Transitions** | Smooth fade-in animations between pages |

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Electron** | 39.1.2 | Cross-platform desktop framework |
| **TypeScript** | 5.9 | Type-safe JavaScript (strict mode) |
| **Vite** | 5.4.21 | Fast bundler and dev server |
| **better-sqlite3** | 12.8 | Synchronous SQLite engine |
| **Lucide** | latest | SVG icon library |
| **Node.js** | Latest LTS | Runtime environment |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Electron Forge** | 7.10.2 | Build and packaging |
| **Vitest** | 4.1 | Unit testing framework |
| **ESLint** | 8.57.1 | Code linting |
| **TypeScript ESLint** | 8.20 | TypeScript linting rules |

### Architecture Pattern

- **Main Process**: Handles system operations, database, IPC
- **Renderer Process**: UI rendering and user interactions
- **Preload Script**: Secure IPC bridge via contextBridge
- **Modular Structure**: Organized into config, core, components, pages, types, utils

---

## 📁 Project Structure

```
AssetsStore/
│
├── 📂 data/                          # Database storage
│   └── database.sqlite               # SQLite database file
│
├── 📂 src/                           # Source code
│   │
│   ├── 📂 config/                    # Configuration files
│   │   ├── app.config.ts             # App settings (window, theme, i18n, upload)
│   │   └── constants.ts              # Global constants (IPC channels, routes, keys)
│   │
│   ├── 📂 core/                      # Core application logic
│   │   ├─ database.ts               # SQLite database module (better-sqlite3)
│   │   ├─ i18n.ts                   # Internationalization manager
│   │   ├─ router.ts                 # Client-side page routing
│   │   ├─ theme.ts                  # Theme management system
│   │   └─ index.ts                  # Core exports
│   │
│   ├─ 📂 components/                # Reusable UI components
│   │   ├─ modal.ts                  # Modal/dialog component
│   │   ├─ toast.ts                  # Toast notification component
│   │   └─ index.ts                  # Component exports
│   │
│   ├── 📂 locales/                   # Translation files
│   │   ├── pt-BR.json                # Portuguese (Brazil) translations
│   │   └── en-US.json                # English (US) translations
│   │
│   ├── 📂 pages/                     # Application pages
│   │   ├── ListPage.ts               # Asset list with search & cards
│   │   ├── FormPage.ts               # Add/Edit asset form
│   │   ├── SettingsPage.ts           # Theme & language settings
│   │   └── index.ts                  # Page exports
│   │
│   ├── 📂 styles/                    # Stylesheets
│   │   └── main.css                  # Main CSS with theme variables
│   │
│   ├── 📂 types/                     # TypeScript definitions
│   │   ├── asset.types.ts            # Asset, AssetInput, AssetUpdate
│   │   ├── api.types.ts              # ElectronAPI interface
│   │   ├── core.types.ts             # Router, I18n, ThemeManager, PageConstructor
│   │   └── index.ts                  # Type exports & global Window interface
│   │
│   ├── 📂 utils/                     # Utility functions
│   │   ├── string.utils.ts           # String manipulation (escape, truncate, etc.)
│   │   ├── date.utils.ts             # Date formatting & relative time
│   │   ├── validation.utils.ts       # Input validation helpers│   │   ├─ icons.ts                  # Lucide icon helpers│   │   └── index.ts                  # Utility exports
│   │
│   ├── main.ts                       # Electron main process (IPC handlers)
│   ├── preload.ts                    # Preload script (contextBridge)
│   ├── renderer.ts                   # Renderer entry point
│   ├── env.d.ts                      # Environment type declarations
│   └── vite-env.d.ts                 # Vite type declarations
│
├── 📂 node_modules/                  # Dependencies
├── 📂 .vite/                         # Vite build output
│
├── 📄 index.html                     # HTML entry point
├── 📄 package.json                   # Dependencies & scripts
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 forge.config.ts                # Electron Forge config
├── 📄 vite.main.config.ts            # Vite config for main process
├── 📄 vite.preload.config.ts         # Vite config for preload
├── 📄 vite.renderer.config.ts        # Vite config for renderer
├── 📄 .eslintrc.json                 # ESLint configuration
├── 📄 .gitignore                     # Git ignore rules
├── 📄 README.md                      # This file
└── 📄 CHANGELOG.md                   # Version history
```

---

## � Installation

### Prerequisites

- **Node.js** (LTS version recommended)
- **npm** or **yarn**

### Steps

1. **Clone or download the repository**

```bash
cd /path/to/AssetsStore
```

2. **Install dependencies**

```bash
npm install
```

3. **Database initialization**

The database will be automatically created in the `data/` directory on first run.

---

## 🏃 Usage

### Development Mode

Start the application in development mode with hot reload:

```bash
npm run start
```

This will:
- Launch the Electron application
- Start Vite dev server on `http://localhost:5173/`
- Enable hot module replacement
- Type `rs` in terminal to restart main process

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start** | `npm run start` | Run in development mode |
| **Package** | `npm run package` | Package app for current platform |
| **Make** | `npm run make` | Create distributable installers |
| **Publish** | `npm run publish` | Publish to distribution channels |
| **Lint** | `npm run lint` | Run ESLint on TypeScript files |
| **Test** | `npm run test` | Run unit tests with Vitest |
| **Test Watch** | `npm run test:watch` | Run tests in watch mode |

---

## ⚙️ Configuration

### Application Settings

Edit `src/config/app.config.ts` to customize:

```typescript
export const APP_CONFIG = {
  // Application Info
  name: 'Assets Store',
  version: '1.0.0',
  
  // Window Settings
  window: {
    width: 1135,      // Default width
    height: 860,      // Default height
    minWidth: 800,    // Minimum width
    minHeight: 600,   // Minimum height
  },
  
  // Database Settings
  database: {
    name: 'database.sqlite',
    directory: 'data',
  },
  
  // Theme Settings
  theme: {
    default: 'default',
    available: ['default', 'light', 'dark'],
    storageKey: 'assetsstore-theme',
  },
  
  // Internationalization
  i18n: {
    defaultLocale: 'pt-BR',
    availableLocales: ['pt-BR', 'en-US'],
    storageKey: 'assetsstore-locale',
  },
  
  // File Upload
  upload: {
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
};
```

### Global Constants

Edit `src/config/constants.ts` for IPC channels, routes, and storage keys:

```typescript
export const IPC_CHANNELS = {
  ASSETS_GET_ALL: 'assets:getAll',
  ASSETS_GET_BY_ID: 'assets:getById',
  ASSETS_CREATE: 'assets:create',
  ASSETS_UPDATE: 'assets:update',
  ASSETS_DELETE: 'assets:delete',
  READ_IMAGE: 'readImage',
  OPEN_EXTERNAL: 'openExternal',
};
```

---

## �️ Database Schema

### Assets Table

```sql
CREATE TABLE assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,              -- Asset title
  image TEXT,                        -- Image path or base64
  unity TEXT,                        -- Unity asset URL
  unreal TEXT,                       -- Unreal Engine asset URL
  link TEXT,                         -- General web link
  createdAt TEXT DEFAULT (datetime('now', 'localtime'))
);
```

### TypeScript Types

```typescript
interface Asset {
  id: number;
  title: string;
  image: string;
  unity: string;
  unreal: string;
  link: string;
  createdAt: string;
}
```

---

## 🏗️ Architecture

### IPC Communication Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Renderer       │         │   Preload        │         │   Main          │
│  Process        │         │   Script         │         │   Process       │
│  (UI/Pages)     │         │  (contextBridge) │         │  (Database/IPC) │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │  window.api.getAssets()    │                            │
        ├───────────────────────────>│                            │
        │                            │  ipcRenderer.invoke()      │
        │                            ├───────────────────────────>│
        │                            │                            │
        │                            │         Query SQLite       │
        │                            │                            │
        │                            │  <────────────────────────┤
        │  <─────────────────────────┤                            │
        │         Return data        │                            │
        │                            │                            │
```

### Module Organization

- **Config**: Centralized settings and constants
- **Core**: Essential services (database, i18n, router, theme)
- **Components**: Reusable UI components (modal, toast)
- **Types**: TypeScript interfaces and type definitions
- **Utils**: Reusable helper functions + Lucide icon wrappers
- **Pages**: UI components for each route
- **Locales**: Translation JSON files
- **Styles**: CSS with theme variables, animations, and component styles

---

## 🎨 Customization

### Adding a New Theme

1. **Edit `src/core/theme.ts`**

```typescript
private themes = {
  'mytheme': {
    '--primary-color': '#FF6B6B',
    '--secondary-color': '#4ECDC4',
    // ... more variables
  }
};
```

2. **Update `src/config/app.config.ts`**

```typescript
theme: {
  available: ['default', 'light', 'dark', 'mytheme'],
}
```

3. **Add UI option in `SettingsPage.ts`**

### Adding a New Language

1. **Create translation file** `src/locales/es-ES.json`

```json
{
  "app": {
    "title": "Tienda de Activos"
  },
  // ... translations
}
```

2. **Update `src/core/i18n.ts`**

```typescript
import esES from '../locales/es-ES.json';

this.translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};
```

3. **Update `src/config/app.config.ts`**

```typescript
i18n: {
  availableLocales: ['pt-BR', 'en-US', 'es-ES'],
}
```

### Adding a New Page

1. **Create page file** `src/pages/MyPage.ts`

```typescript
export class MyPage {
  constructor(private container: HTMLElement) {}
  
  async render(params?: any) {
    this.container.innerHTML = `<h1>My Page</h1>`;
  }
}
```

2. **Register in router** `src/core/router.ts`

```typescript
import { MyPage } from '../pages/MyPage';

this.pages = new Map<string, PageConstructor>([
  // ... existing pages
  ['mypage', MyPage as PageConstructor],
]);
```

3. **Add navigation menu item** in `src/renderer.ts`

---

## 📦 Build & Distribution

### Package for Current Platform

```bash
npm run package
```

Output: `out/AssetsStore-{platform}-{arch}/`

### Create Installers

```bash
npm run make
```

Supported makers (configured in `forge.config.ts`):
- **Windows**: Squirrel (`.exe` installer)
- **macOS**: ZIP (`.app` bundle)
- **Linux**: DEB (`.deb` package) and RPM (`.rpm` package)

Output: `out/make/`

### Distribution Files

| Platform | Output |
|----------|--------|
| Windows | `Assets Store Setup.exe` |
| macOS | `Assets Store.app.zip` |
| Linux (Debian) | `assets-store_1.0.0_amd64.deb` |
| Linux (RedHat) | `assets-store-1.0.0-1.x86_64.rpm` |

---

## 💻 Development

### File Structure Best Practices

- **One responsibility per file**
- **Clear naming conventions**
- **JSDoc comments for documentation**
- **Export from index files for clean imports**

### Code Style

- **TypeScript strict mode**
- **ESLint rules enforced**
- **Consistent formatting**
- **Type safety throughout**

### Adding New Features

1. **Types**: Define in `src/types/`
2. **Logic**: Implement in `src/core/` or `src/utils/`
3. **UI**: Create page in `src/pages/`
4. **IPC**: Add handlers in `src/main.ts` and expose in `src/preload.ts`
5. **Styles**: Add to `src/styles/main.css`

### Testing

The project uses **Vitest** for unit testing. Tests cover utility functions (string, date, validation).

```bash
# Run tests once
npm run test

# Run in watch mode
npm run test:watch
```

Test files are located in the `tests/` directory:
- `string.utils.test.ts` — escapeHtml, truncate, capitalize, toKebabCase
- `date.utils.test.ts` — formatDate with locale support
- `validation.utils.test.ts` — URL validation, empty checks, file extensions, file size

---

## 📝 License

**MIT License**

Copyright (c) 2025 Assets Store

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 👨‍💻 Author

**dedzec**
- Email: dedzec@gmail.com
- GitHub: [@dedzec](https://github.com/dedzec)

---

## 🙏 Acknowledgments

Built with modern web technologies:
- [Electron](https://www.electronjs.org/) - Build cross-platform desktop apps
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Fast, synchronous SQLite3
- [Lucide](https://lucide.dev/) - Beautiful & consistent SVG icons
- [Vitest](https://vitest.dev/) - Blazing fast unit test framework

---

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Guide](https://vitejs.dev/guide/)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Lucide Icons](https://lucide.dev/icons/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Electron Forge Documentation](https://www.electronforge.io/)

---

<div align="center">

**Made with ❤️ and modern web technologies**

⭐ Star this project if you find it useful!

</div>
