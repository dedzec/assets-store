/**
 * API Types
 * Type definitions for IPC API methods
 */

import { Asset, AssetInput, AssetUpdate } from './asset.types';
import { Category, CategoryInput, CategoryUpdate } from './category.types';

export interface ElectronAPI {
  getAssets: () => Promise<Asset[]>;
  getAssetById: (id: number) => Promise<Asset | null>;
  addAsset: (asset: AssetInput) => Promise<Asset>;
  updateAsset: (asset: AssetUpdate) => Promise<{ changes: number }>;
  deleteAsset: (id: number) => Promise<{ changes: number }>;
  clearAllAssets: () => Promise<{ changes: number }>;
  selectFile: () => Promise<string | null>;
  closeApp: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  readImage: (imagePath: string) => Promise<string | null>;
  openExternal: (url: string) => Promise<boolean>;
  importAssets: (assets: AssetInput[]) => Promise<{ imported: number }>;
  // Categories
  getCategories: () => Promise<Category[]>;
  addCategory: (category: CategoryInput) => Promise<Category>;
  updateCategory: (category: CategoryUpdate) => Promise<{ changes: number }>;
  deleteCategory: (id: number) => Promise<{ changes: number }>;
  getAssetCategories: (assetId: number) => Promise<Category[]>;
  setAssetCategories: (assetId: number, categoryIds: number[]) => Promise<void>;
}
