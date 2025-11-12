import { contextBridge, ipcRenderer } from 'electron';

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

export const api = {
  getAssets: () => ipcRenderer.invoke('get-assets'),
  addAsset: (asset: { title: string; image: string; unity: string; unreal: string; link: string }) => ipcRenderer.invoke('add-asset', asset),
  updateAsset: (asset: { id: number; title: string; image: string; unity: string; unreal: string; link: string }) => ipcRenderer.invoke('update-asset', asset),
  deleteAsset: (id: number) => ipcRenderer.invoke('delete-asset', id),
  selectFile: () => ipcRenderer.invoke('select-file'),
  closeApp: () => ipcRenderer.invoke('close-app'),
  readImage: (filePath: string) => ipcRenderer.invoke('read-image', filePath),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
};

contextBridge.exposeInMainWorld('api', api);
