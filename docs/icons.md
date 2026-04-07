# Ícone do Aplicativo

## Status atual

> ✅ Todos os ícones estão gerados e prontos em `src/assets/`.
> A geração foi feita com o **Icon Forge** — CLI Python própria localizada em
> `~/Documents/icon-forge/`.

| Plataforma | Formato | Arquivo                | Tamanho                   |
|------------|---------|------------------------|---------------------------|
| Linux      | `.png`  | `src/assets/icon.png`  | 113 KB (1024×1024, RGBA)  |
| Windows    | `.ico`  | `src/assets/icon.ico`  | 33 KB (7 resoluções)      |
| macOS      | `.icns` | `src/assets/icon.icns` | 261 KB (variantes Retina) |

O Electron Forge detecta o arquivo correto automaticamente pelo campo
`icon: 'src/assets/icon'` (sem extensão) em `forge.config.ts`.

---

## Regenerar ícones com Icon Forge

Se o ícone precisar ser atualizado, use o projeto **Icon Forge**:

```bash
cd ~/Documents/icon-forge

# Substitua o PNG mestre na pasta input/
cp novo-icone-1024.png input/icon.png

# Gerar e copiar direto para o projeto
./start.sh --deploy ~/Documents/assets-store
```

### O que o Icon Forge gera

| Saída              | Conteúdo                                           |
|--------------------|----------------------------------------------------|
| `output/png/`      | 9 PNGs: 16, 24, 32, 48, 64, 128, 256, 512, 1024 px |
| `output/icon.ico`  | `.ico` com 7 resoluções (16–256) para Windows      |
| `output/icon.icns` | `.icns` com 7 variantes Retina para macOS          |

Com `--deploy`, copia automaticamente `icon.ico`, `icon.icns` e `icon.png`
para `<projeto>/src/assets/`.

---

## Requisitos do PNG mestre

- Formato: **PNG-32** (RGB + canal Alpha)
- Fundo **transparente**
- Resolução mínima: **1024×1024 px**
- Ferramentas: Figma, Inkscape, Illustrator, Affinity Designer

### Dicas de design
- Mantenha legibilidade no tamanho 16×16 — simplifique se necessário
- No macOS **não** aplique cantos arredondados manualmente — o sistema aplica
  o "superellipse" automaticamente
- No Windows o `.ico` é exibido quadrado
- Gradiente de identidade do app: `#667eea → #764ba2`

---

## Tamanhos embutidos por formato

### `.ico` — Windows (7 resoluções)

| Tamanho | Uso                            |
|---------|--------------------------------|
| 16×16   | Barra de tarefas (miniatura)   |
| 24×24   | Barra de tarefas               |
| 32×32   | Explorer / Atalhos             |
| 48×48   | Explorer (visualização média)  |
| 64×64   | Explorer (visualização grande) |
| 128×128 | Propriedades do arquivo        |
| 256×256 | Explorer moderno / HD          |

### `.icns` — macOS (variantes Retina)

| Tamanho   | Retina de   |
|-----------|-------------|
| 16×16     | —           |
| 32×32     | 16×16 @2x   |
| 64×64     | 32×32 @2x   |
| 128×128   | —           |
| 256×256   | 128×128 @2x |
| 512×512   | 256×256 @2x |
| 1024×1024 | 512×512 @2x |

### `.png` — Linux

Um único arquivo PNG, **1024×1024 px**, fundo transparente.

---

## Configuração no `forge.config.ts`

```typescript
packagerConfig: {
  asar: true,
  name: 'assets-store',
  executableName: 'assets-store',
  icon: 'src/assets/icon', // sem extensão — Forge escolhe .ico / .icns / .png
},
```

---

## Estrutura de arquivos

```
src/
  assets/
    icon.ico    ← Windows  (33 KB, 7 resoluções)
    icon.icns   ← macOS    (261 KB, variantes Retina)
    icon.png    ← Linux    (113 KB, 1024×1024 RGBA)
```

> Os ícones **devem ser commitados** — fazem parte do build de produção
> e não estão no `.gitignore`.
