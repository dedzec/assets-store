import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './config/constants';
import type { AssetInput, AssetUpdate } from './types/asset.types';
import type { CategoryInput, CategoryUpdate } from './types/category.types';

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

export const api = {
  getAssets: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ASSETS),
  getAssetById: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.GET_ASSET_BY_ID, id),
  addAsset: (asset: AssetInput) => ipcRenderer.invoke(IPC_CHANNELS.ADD_ASSET, asset),
  updateAsset: (asset: AssetUpdate) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_ASSET, asset),
  deleteAsset: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_ASSET, id),
  clearAllAssets: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_ALL_ASSETS),
  selectFile: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_FILE),
  closeApp: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_APP),
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW),
  isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.IS_MAXIMIZED),
  readImage: (imagePath: string) => ipcRenderer.invoke(IPC_CHANNELS.READ_IMAGE, imagePath),
  openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, url),
  importAssets: (assets: AssetInput[]) => ipcRenderer.invoke(IPC_CHANNELS.IMPORT_ASSETS, assets),
  // Categories
  getCategories: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CATEGORIES),
  addCategory: (category: CategoryInput) => ipcRenderer.invoke(IPC_CHANNELS.ADD_CATEGORY, category),
  updateCategory: (category: CategoryUpdate) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CATEGORY, category),
  deleteCategory: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_CATEGORY, id),
  getAssetCategories: (assetId: number) => ipcRenderer.invoke(IPC_CHANNELS.GET_ASSET_CATEGORIES, assetId),
  setAssetCategories: (assetId: number, categoryIds: number[]) => ipcRenderer.invoke(IPC_CHANNELS.SET_ASSET_CATEGORIES, assetId, categoryIds),
};

contextBridge.exposeInMainWorld('api', api);
