import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './config/constants';
import type { AssetInput, AssetUpdate } from './types/asset.types';

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
  readImage: (imagePath: string) => ipcRenderer.invoke(IPC_CHANNELS.READ_IMAGE, imagePath),
  openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, url),
};

contextBridge.exposeInMainWorld('api', api);
