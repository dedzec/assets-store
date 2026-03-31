# Checklist de Melhorias — Assets Store

Checklist organizada por prioridade das melhorias a serem implementadas.

---

## P0 — Crítico (Bugs e riscos reais)

- [x] **Mover IPC handlers para fora de `createWindow()`**
  - Registrar `ipcMain.handle()` no top-level de `main.ts` para evitar duplicação no macOS (`app.on('activate')`)

- [x] **Ativar `strict: true` no `tsconfig.json`**
  - Corrigir todos os erros de tipo resultantes

- [x] **Atualizar TypeScript para 5.x**
  - Atualizar `typescript`, `@typescript-eslint/*` e `eslint` para versões atuais

---

## P1 — Alto (Qualidade e manutenibilidade)

- [x] **Substituir `sqlite3` por `better-sqlite3`**
  - API síncrona, mais rápida, melhor compatibilidade cross-platform
  - Refatorar `database.ts` e todos os handlers IPC

- [x] **Usar as constantes de `constants.ts` em todo o projeto**
  - Ou remover o arquivo se não for usá-lo
  - Corrigir inconsistência de storage keys (`'app-locale'` vs `'assetsstore-locale'`)

- [x] **Adicionar handler `get-asset-by-id` no main process**
  - Evitar carregar todos os assets para editar um único

- [x] **Adicionar handler `clear-all-assets` no main process**
  - Substituir loop de deletes individuais por `DELETE FROM assets`

- [x] **Remover métodos duplicados das pages**
  - `escapeHtml`, `truncate` e `formatDate` devem ser usados de `src/utils/`
  - `formatDate` no ListPage deve respeitar o locale atual do i18n

- [x] **Copiar imagens para diretório da app**
  - Ao selecionar imagem, copiar para `data/images/`
  - Salvar caminho relativo no banco ao invés de absoluto

- [x] **Adicionar validação de dados no main process**
  - Validar campos obrigatórios e tipos nos handlers IPC de `add-asset` e `update-asset`

---

## P2 — Médio (UI/UX e DX)

- [x] **Substituir emojis por icon library (Lucide)**
  - Instalar `lucide` e substituir todos os emojis por ícones SVG consistentes

- [x] **Substituir `alert()`/`confirm()` por modais custom**
  - Criar componente de modal/dialog reutilizável com estilos do app

- [x] **Adicionar sistema de toast/notificações**
  - Substituir `alert()` de sucesso/erro por toasts não-bloqueantes

- [x] **Adicionar loading states**
  - Skeleton loaders ou spinners durante carregamento de assets e imagens

- [x] **Adicionar transições entre páginas**
  - Fade ou slide ao navegar entre list/form/settings

- [x] **Configurar Vitest para testes unitários**
  - Instalar `vitest` e criar testes para utils, database e handlers IPC

- [x] **Considerar framework de UI**
  - Avaliado: manter vanilla TS por ora — app é pequeno e auto-contido; migração para Lit/Svelte é recomendada se a complexidade crescer

---

## P3 — Baixo (Nice-to-have)

- [x] **Atalhos de teclado**
  - `Ctrl+N` → novo asset, `Ctrl+F` → buscar, `Escape` → cancelar

- [x] **Custom titlebar (frameless window)**
  - Remover barra de título nativa e adicionar titlebar estilizada com botões min/max/close

- [x] **Implementar import de dados**
  - Funcionalidade de importar JSON (botão existe mas está `disabled`)

- [x] **Adicionar `electron-log`**
  - Logging persistente em disco para debugging em produção

- [x] **Paginação ou virtual scrolling**
  - Para performance com centenas/milhares de assets

- [x] **Drag-and-drop para imagens**
  - Permitir arrastar imagens para o formulário de cadastro

- [x] **Remover botão "Fechar" da sidebar**
  - Usar apenas o botão nativo da janela (ou do custom titlebar)

- [x] **Considerar `electron-updater` para auto-update**
  - Se o app for distribuído fora de lojas de apps

---

## Progresso

| Prioridade | Total | Concluído | % |
|---|---|---|---|
| P0 — Crítico | 3 | 3 | 100% |
| P1 — Alto | 7 | 7 | 100% |
| P2 — Médio | 7 | 7 | 100% |
| P3 — Baixo | 8 | 8 | 100% |
| **Total** | **25** | **25** | **100%** |
