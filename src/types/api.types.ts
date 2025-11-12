/**
 * API Types
 * Type definitions for IPC API methods
 */

import { Asset, AssetInput, AssetUpdate } from './asset.types';

export interface ElectronAPI {
  getAssets: () => Promise<Asset[]>;
  addAsset: (asset: AssetInput) => Promise<Asset>;
  updateAsset: (asset: AssetUpdate) => Promise<{ changes: number }>;
  deleteAsset: (id: number) => Promise<{ changes: number }>;
  selectFile: () => Promise<string | null>;
  closeApp: () => Promise<void>;
  readImage: (filePath: string) => Promise<string | null>;
  openExternal: (url: string) => Promise<boolean>;
}
