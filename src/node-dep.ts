export const fs: typeof import('fs-extra') = window.require('fs-extra');
export const path: typeof import('path') = window.require('path');

export const electron: typeof import('electron') = window.require('electron');
export const { remote, ipcRenderer } = electron;
export const app = remote.app;

export const Store: typeof import('electron-store') = window.require(
    'electron-store',
);

export const md5: typeof import('md5') = window.require('md5');
export const crypto: typeof import('crypto') = window.require('crypto');
