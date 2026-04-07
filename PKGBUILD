# Maintainer: dedzec <dedzec@gmail.com>
pkgname=assets-store
pkgver=1.0.0
pkgrel=1
pkgdesc="A professional asset manager built with Electron, TypeScript and SQLite."
arch=('x86_64')
url="https://github.com/dedzec/assets-store"
license=('MIT')
depends=(
    'gtk3'
    'libnotify'
    'nss'
    'libxss'
    'libxtst'
    'xdg-utils'
    'at-spi2-core'
    'util-linux-libs'
)
options=('!strip')

# Não há sources externos — usa o binário já empacotado em out/
source=()
sha256sums=()

package() {
    local _src="$startdir/out/${pkgname}-linux-x64"

    if [ ! -d "$_src" ]; then
        echo ""
        echo "  ERRO: $_src não encontrado."
        echo "  Execute primeiro: npm run package"
        echo ""
        return 1
    fi

    # Instalar binário em /opt/assets-store/
    install -dm755 "$pkgdir/opt/$pkgname"
    cp -r "$_src/." "$pkgdir/opt/$pkgname/"

    # Permissões corretas no executável principal
    chmod 755 "$pkgdir/opt/$pkgname/$pkgname"

    # chrome-sandbox precisa de setuid para sandbox ativado
    # (alternativa: usar --no-sandbox no .desktop)
    # chmod 4755 "$pkgdir/opt/$pkgname/chrome-sandbox"

    # Symlink em /usr/bin
    install -dm755 "$pkgdir/usr/bin"
    ln -s "/opt/$pkgname/$pkgname" "$pkgdir/usr/bin/$pkgname"

    # Ícone
    install -dm755 "$pkgdir/usr/share/pixmaps"
    if [ -f "$startdir/src/assets/icon.png" ]; then
        install -Dm644 "$startdir/src/assets/icon.png" \
            "$pkgdir/usr/share/pixmaps/$pkgname.png"
    fi

    # Entrada .desktop
    install -dm755 "$pkgdir/usr/share/applications"
    cat > "$pkgdir/usr/share/applications/$pkgname.desktop" << EOF
[Desktop Entry]
Name=Assets Store
GenericName=Asset Manager
Comment=A professional asset manager built with Electron, TypeScript and SQLite.
Exec=/opt/${pkgname}/${pkgname} --no-sandbox %U
Icon=${pkgname}
Terminal=false
Type=Application
Categories=Utility;Development;
StartupWMClass=assets-store
EOF

    # Licença
    install -dm755 "$pkgdir/usr/share/licenses/$pkgname"
    if [ -f "$startdir/LICENSE" ]; then
        install -Dm644 "$startdir/LICENSE" \
            "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
    fi
}
