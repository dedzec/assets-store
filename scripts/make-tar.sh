#!/bin/bash
#
# make-tar.sh — cria um .tar.gz do app para Linux (universal)
# Uso: ./scripts/make-tar.sh
#

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

VERSION=$(node -p "require('./package.json').version")
NAME=$(node -p "require('./package.json').name")
ARCH="x64"
PACKAGE_DIR="out/${NAME}-linux-${ARCH}"
OUT_DIR="out/make/tar/${ARCH}"
OUTPUT="${OUT_DIR}/${NAME}-linux-${ARCH}-${VERSION}.tar.gz"

echo -e "${CYAN}📦 Criando .tar.gz para Linux...${NC}"
echo ""

# Verificar se o app está empacotado
if [ ! -d "$PACKAGE_DIR" ]; then
    echo -e "  Pasta ${PACKAGE_DIR} não encontrada — executando npm run package..."
    npm run package
fi

# Criar pasta de saída
mkdir -p "$OUT_DIR"

# Criar .tar.gz
echo -e "  Comprimindo ${PACKAGE_DIR} → ${OUTPUT}"
tar -czf "$OUTPUT" -C out "${NAME}-linux-${ARCH}"

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo ""
echo -e "  ${GREEN}✓${NC} ${OUTPUT}  (${SIZE})"
echo ""
echo -e "${GREEN}✓ Concluído!${NC}"
