#!/bin/bash
#
# install-arch.sh — Build, empacota e instala o Assets Store no Arch Linux
# Uso: ./scripts/install-arch.sh
#

set -e

# makepkg não pode ser executado como root
if [[ "$EUID" -eq 0 ]]; then
  echo "Erro: não execute este script como root (sem sudo)."
  echo "Uso: ./scripts/install-arch.sh"
  exit 1
fi

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

VERSION=$(node -p "require('./package.json').version")
NAME=$(node -p "require('./package.json').name")
PKG="${NAME}-${VERSION}-1-x86_64.pkg.tar.zst"

echo -e "${BOLD}${CYAN}🔨 Assets Store — Build & Install (Arch Linux)${NC}"
echo -e "  Versão: ${YELLOW}${VERSION}${NC}"
echo ""

# 1. Electron package
echo -e "${CYAN}[1/3]${NC} Empacotando com Electron Forge..."
npm run package
echo -e "  ${GREEN}✓${NC} Pacote gerado"
echo ""

# 2. makepkg
echo -e "${CYAN}[2/3]${NC} Gerando .pkg.tar.zst com makepkg..."
makepkg -sf --noconfirm
echo -e "  ${GREEN}✓${NC} ${PKG} criado"
echo ""

# 3. pacman -U
echo -e "${CYAN}[3/3]${NC} Instalando via pacman..."
sudo pacman -U --noconfirm "$PKG"
echo -e "  ${GREEN}✓${NC} Instalado em /opt/${NAME}/"
echo ""

echo -e "${GREEN}${BOLD}✓ Concluído!${NC} Execute: ${YELLOW}assets-store --no-sandbox${NC}"
