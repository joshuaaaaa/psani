'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// Most mezi oknem aplikace a hlavním procesem (verze a aktualizace).
contextBridge.exposeInMainWorld('appInfo', {
  version: ipcRenderer.sendSync('app-version'),
  checkUpdates: () => ipcRenderer.send('update-check', true),
  installUpdate: () => ipcRenderer.send('update-install'),
  openDownload: () => ipcRenderer.send('update-open-download'),
  onUpdateStatus: cb => ipcRenderer.on('update-status', (e, status) => cb(status)),
});
