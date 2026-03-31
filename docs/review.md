# Revisão Completa — Assets Store

---

## 1. O QUE ESTÁ BOM

### Organização de pastas
A estrutura `src/config`, `src/core`, `src/types`, `src/utils`, `src/pages`, `src/locales`, `src/styles` é limpa e segue um padrão modular coerente.

### Segurança Electron (Fuses)
O uso de `FusesPlugin` em `forge.config.ts` com `RunAsNode: false`, `EnableCookieEncryption: true`, `OnlyLoadAppFromAsar: true` é excelente — segue as melhores práticas de segurança do Electron.

### Preload tipado com `contextBridge`
O `src/preload.ts` usa `contextBridge.exposeInMainWorld` corretamente, evitando expor o `ipcRenderer` diretamente — prática de segurança essencial.

### Separação de constantes
O `src/config/constants.ts` com `IPC_CHANNELS`, `ROUTES`, `STORAGE_KEYS` usando `as const` é boa prática para evitar magic strings.

### i18n funcional
Sistema de internacionalização `src/core/i18n.ts` com auto-detecção de idioma do navegador e 2 locales.

### Temas dinâmicos via CSS variables
O `src/core/theme.ts` altera CSS custom properties em tempo real, permitindo temas sem reload.

### Tipagem de API IPC
A interface `ElectronAPI` em `src/types/api.types.ts` e a declaração global de `Window` em `src/types/index.ts` garantem type-safety nas chamadas IPC.

---

## 2. PROBLEMAS CRÍTICOS

### 2.1 TypeScript extremamente desatualizado

```json
"typescript": "~4.5.4"  // Lançado em Dez 2021!
```

Estão na versão **4.5** — a atual é **5.7+**. Perde-se acesso a inference melhorada, `satisfies`, `const` type parameters, decorators nativos, etc. **ESLint também está defasado** (`^5.62.0` / `^8.57.1`) — deveria ser `typescript-eslint` v8+ com flat config.

### 2.2 `strict: false` no `tsconfig.json`

Isso desabilita `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, etc. O projeto perde toda a vantagem do TypeScript para prevenir bugs. **Deveria ser `strict: true`**.

### 2.3 Constantes definidas mas NÃO utilizadas

O arquivo `src/config/constants.ts` define `IPC_CHANNELS`, `ROUTES`, `STORAGE_KEYS`, mas **nenhum deles é usado em nenhum lugar do código**. As strings IPC estão hardcoded em `src/main.ts`, `src/preload.ts`, e as storage keys estão hardcoded na i18n (`'app-locale'`) e no theme (`'app-theme'`) — que aliás **são diferentes** das definidas nas constantes (`'assetsstore-locale'`, `'assetsstore-theme'`). Bug silencioso potencial se alguém tentar usar as constantes.

### 2.4 IPC handlers dentro de `createWindow()`

Em `src/main.ts`, todos os `ipcMain.handle()` estão **dentro** da função `createWindow`. Se `createWindow` for chamada novamente (ex: no `app.on('activate')` do macOS), os handlers serão registrados **duplicadamente**, causando crash:

```
Error: Attempted to register a second handler for 'get-assets'
```

### 2.5 Banco de dados com callbacks (não Promises)

O `src/core/database.ts` usa `sqlite3` com API callback. No `src/main.ts`, todo handler IPC envolve manualmente `new Promise((resolve, reject) => { ... })`. Isso é verbose e propenso a erros.

### 2.6 Sem validação de dados no main process

O handler `add-asset` e `update-asset` em `src/main.ts` não validam os dados recebidos do renderer. Qualquer dado pode ser injetado via IPC — incluindo SQL injection se os parâmetros não fossem prepared statements (que são, mas o princípio de defesa em profundidade exige validação).

### 2.7 Imagens armazenadas como paths absolutos

O campo `image` salva o caminho absoluto do sistema de arquivos. Se o usuário mover a pasta ou exportar o banco, **todas as imagens quebram**. Deveria copiar a imagem para um diretório de dados da app e salvar um caminho relativo.

### 2.8 `loadAssetForEdit` carrega TODOS os assets

Em `src/pages/FormPage.ts`, para editar 1 asset, o código faz:

```ts
const assets: Asset[] = await window.api.getAssets(); // busca TODOS
const asset = assets.find(a => a.id === id); // filtra no client
```

Deveria ter um handler `get-asset-by-id` no main process.

### 2.9 `clearData` deleta assets um por um

Em `src/pages/SettingsPage.ts`:

```ts
for (const asset of assets) {
  await window.api.deleteAsset(asset.id); // N chamadas IPC
}
```

Deveria ser um `DELETE FROM assets` no main process.

---

## 3. PROBLEMAS DE ARQUITETURA

### 3.1 Vanilla TS com manipulação DOM manual

O projeto inteiro renderiza UI via template strings com `innerHTML`. Exemplo em `src/pages/ListPage.ts`:

```ts
listContainer.innerHTML = assetsWithImages.map(asset => `<div class="asset-card">...`).join('');
```

**Problemas:**
- Sem reatividade — qualquer mudança requer re-render completo
- Event listeners precisam ser re-atachados a cada render
- Código HTML misturado com lógica
- Sem virtual DOM = performance ruim com muitos items
- Sem component lifecycle management

**Recomendação:** Para um app Electron desktop moderno, usar **React, Vue, Svelte ou Lit** no renderer. Se quiser manter vanilla, pelo menos usar **Web Components** ou **Lit** (leve e nativo).

### 3.2 Globals no `window`

O `src/renderer.ts` atribui `router`, `i18n`, `themeManager` ao `window`. Isso é anti-pattern — cria acoplamento global e dificulta testes.

### 3.3 Métodos utilitários duplicados

`escapeHtml` e `truncate` existem em `src/utils/string.utils.ts` **e também** como métodos privados em `ListPage` e `FormPage`. O import no ListPage importa `escapeHtml` e `truncate` de utils mas define métodos internos idênticos.

### 3.4 `getRelativeTime` hardcoded em português

Em `src/utils/date.utils.ts`, os textos "dia", "hora", "minuto", "agora mesmo" são hardcoded em português, ignorando o sistema i18n.

### 3.5 `formatDate` hardcoded em `ListPage`

O `ListPage` tem seu próprio `formatDate` privado que sempre usa `'pt-BR'` como locale, ignorando o locale atual do i18n. O `formatDate` de utils é importado mas **não usado**.

### 3.6 Sem tratamento de erros estruturado

Erros são tratados com `console.error` + `alert()`. Deveria ter um sistema de notificações/toast centralizado.

### 3.7 Sem testes

Zero configuração de testes (nenhum test framework no `package.json`). Para um app desktop, testes são cruciais.

---

## 4. ANÁLISE UI/UX

### 4.1 Positivo

- Layout com sidebar é padrão e intuitivo para desktop
- Cards com imagem são visualmente agradáveis
- Busca com ícone e botão de limpar é boa UX
- Temas e i18n demonstram preocupação com acessibilidade
- Danger zone vermelha nas configurações é padrão UX reconhecível
- Responsive com media query (embora menos relevante para Electron)

### 4.2 Problemas

- **Emojis como ícones** (📦, 📋, ➕, ⚙️, 🚪, ✏️, 🗑️) — inconsistente entre plataformas, pouco profissional. Deveria usar uma icon library como **Lucide**, **Phosphor Icons** ou **Material Icons**.
- **`alert()` e `confirm()` nativos** — UI/UX ruim para app desktop. Deveria usar modais/dialogs custom estilizados.
- **Sem animações de transição entre páginas** — o conteúdo simplesmente muda via `innerHTML`, sem fade/slide.
- **Sem feedback de loading** — ao carregar imagens (que são lidas do disco e convertidas para base64), não há skeleton, spinner ou indicador.
- **Sem drag-and-drop** para imagens — esperado em apps desktop modernos.
- **Sem atalhos de teclado** — apps desktop devem ter shortcuts (Ctrl+N para novo, Ctrl+F para buscar, etc).
- **Title bar nativa** — apps Electron modernos usam custom titlebar (frameless window) com botões estilizados.
- **Sem paginação/virtualização** — se houver 1000+ assets, todos serão renderizados de uma vez. Deveria ter paginação ou virtual scrolling.
- **Botão "Fechar" na sidebar** — incomum e potencialmente perigoso. A window close button da OS é suficiente.

---

## 5. DEPENDÊNCIAS E BIBLIOTECAS

### 5.1 Problemas atuais

| Dependência | Problema |
|---|---|
| `sqlite3` | Binding nativo pesado, difícil de compilar cross-platform. **Substituir por `better-sqlite3`** (síncrono, mais rápido, API moderna) ou `sql.js` (WASM, zero native deps) |
| `typescript ~4.5.4` | 4 anos desatualizado |
| `eslint ^8` + `@typescript-eslint ^5` | Deveria usar ESLint 9+ flat config + typescript-eslint v8 |
| `electron 39.1.2` | OK (recente), mas verificar se há security patches |

### 5.2 Bibliotecas recomendadas para adicionar

| Necessidade | Biblioteca |
|---|---|
| ORM/Query builder | `drizzle-orm` ou `better-sqlite3` direto |
| Ícones | `lucide` (SVG, tree-shakeable) |
| Component library | `lit` (se quiser vanilla) ou framework (React/Vue/Svelte) |
| Testes | `vitest` + `@testing-library` + `playwright` (E2E) |
| Logging | `electron-log` (persiste logs no disco) |
| Auto-update | `electron-updater` (se distribuído fora de lojas) |
| Build | Considere migrar de **Electron Forge** para **electron-builder** se precisar de targets mais flexíveis (AppImage, Flatpak, Snap, NSIS, DMG) |
| State management | `zustand` ou `jotai` (se migrar para React) |
| CSS | `tailwindcss` ou pelo menos usar CSS Modules/SCSS |

---

## 6. NOTA GERAL: 6/10

O projeto tem uma base funcional sólida com boas práticas de segurança Electron. A organização é decente. Os principais problemas são: toolchain desatualizado, ausência de framework UI levando a código imperativo frágil, código morto (constantes não usadas), e pequenos bugs potenciais (IPC handlers duplicados, storage keys inconsistentes). Com as correções P0 e P1, sobe facilmente para 8/10.

---

## 7. AVALIAÇÃO — electron-updater (Auto-Update)

### Recomendação
**Não implementar neste momento.** O `electron-updater` é mais adequado quando:
- O app é distribuído fora de lojas (ex: via GitHub Releases, S3, etc.)
- Há um servidor de updates configurado (Hazel, Nuts, etc.)
- O app já tem uma base de usuários que precisa receber patches frequentes

### Motivos para adiar
1. **Complexidade de infra**: Requer code signing (macOS/Windows) e um backend de release
2. **Electron Forge**: O ecossistema de auto-update do Forge usa `@electron-forge/publisher-*` que se integra com GitHub/S3, mas exige configuração de CI/CD
3. **Estágio do projeto**: O app ainda está em fase de desenvolvimento ativo — auto-update é mais valioso em produção estável

### Quando implementar
Quando o app for distribuído para usuários finais, adicionar:
```bash
npm install electron-updater
```
E configurar no main process:
```ts
import { autoUpdater } from 'electron-updater';
autoUpdater.checkForUpdatesAndNotify();
```
Combinado com GitHub Releases + `@electron-forge/publisher-github`.
