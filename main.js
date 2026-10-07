'use strict';
const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const RELEASES_URL = 'https://github.com/joshuaaaaa/psani/releases/latest';
const isPortable = !!process.env.PORTABLE_EXECUTABLE_DIR;
let win = null;
let lastStatus = null;

function sendStatus(status) {
  lastStatus = status;
  if (win && !win.isDestroyed()) win.webContents.send('update-status', status);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 1000,
    minHeight: 680,
    title: 'Psaní všemi deseti',
    icon: path.join(__dirname, 'app', 'icon.png'),
    backgroundColor: '#f4f5fa',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false,
    },
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.webContents.on('did-finish-load', () => { if (lastStatus) sendStatus(lastStatus); });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  // F11 = celá obrazovka, Ctrl + / Ctrl - = zvětšení
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.control && (input.key === '+' || input.key === '=')) { win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5); e.preventDefault(); }
    if (input.control && input.key === '-') { win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5); e.preventDefault(); }
    if (input.control && input.key === '0') { win.webContents.setZoomLevel(0); e.preventDefault(); }
  });
}

// ---------- Aktualizace ----------
// Instalovaná verze si novou verzi z GitHub Releases stáhne sama a nainstaluje ji při zavření
// (nebo hned po kliknutí na „Restartovat“). Přenosná verze jen oznámí, že je nová verze ke stažení.
autoUpdater.autoDownload = !isPortable;
autoUpdater.autoInstallOnAppQuit = true;
let manualCheck = false;
autoUpdater.on('checking-for-update', () => sendStatus({ state: 'checking' }));
autoUpdater.on('update-not-available', () => sendStatus({ state: 'none', manual: manualCheck }));
autoUpdater.on('update-available', info => sendStatus({ state: isPortable ? 'available-portable' : 'downloading', version: info.version, percent: 0 }));
autoUpdater.on('download-progress', p => sendStatus({ state: 'downloading', version: lastStatus && lastStatus.version, percent: Math.round(p.percent) }));
autoUpdater.on('update-downloaded', info => sendStatus({ state: 'ready', version: info.version }));
autoUpdater.on('error', err => sendStatus({ state: 'error', manual: manualCheck, message: String(err && err.message || err).split('\n')[0] }));

function checkUpdates(manual) {
  manualCheck = !!manual;
  if (!app.isPackaged) { sendStatus({ state: 'dev', manual }); return; }
  autoUpdater.checkForUpdates().catch(() => { /* chyba přijde v události 'error' */ });
}

ipcMain.on('app-version', e => { e.returnValue = app.getVersion(); });
ipcMain.on('update-check', (e, manual) => checkUpdates(manual));
ipcMain.on('update-install', () => autoUpdater.quitAndInstall());
ipcMain.on('update-open-download', () => shell.openExternal(RELEASES_URL));

Menu.setApplicationMenu(null);
app.whenReady().then(() => {
  createWindow();
  setTimeout(() => checkUpdates(false), 4000);
});
app.on('window-all-closed', () => app.quit());
