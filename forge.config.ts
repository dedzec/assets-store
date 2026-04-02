import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'assets-store',
    executableName: 'assets-store',
  },
  rebuildConfig: {
    onlyModules: ['better-sqlite3'],
  },
  makers: [
    new MakerSquirrel({}), // Windows installer
    new MakerZIP({}, ['darwin', 'linux']), // macOS and Linux ZIP
    new MakerDeb({
      options: {
        name: 'assets-store',
        productName: 'Assets Store',
        genericName: 'Asset Manager',
        description: 'A professional asset manager built with Electron, TypeScript and SQLite.',
        version: '1.0.0',
        categories: ['Utility', 'Development'],
        maintainer: 'dedzec <dedzec@gmail.com>',
        homepage: 'https://github.com/dedzec/assets-store',
        section: 'utils',
        priority: 'optional',
      },
    }),
    // NOTE: MakerRpm is not included — electron-installer-redhat generates
    // an incompatible %install spec section on Arch Linux.
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
