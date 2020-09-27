const { app, BrowserWindow, Menu, MenuItem } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
require('./pica-sender');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        // autoHideMenuBar: true,
        width: 960,
        height: 720,
        backgroundColor: '#201f1e',
        darkTheme: true,
        title: 'Book Defender',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    });

    const menu = Menu.getApplicationMenu();
    menu.append(
        new MenuItem({
            label: '重启',
            click() {
                app.relaunch();
                app.exit(0);
            },
        }),
    );
    Menu.setApplicationMenu(menu);

    global.sharedObject = {
        rootDir: path.resolve(__dirname, '../'),
        argv: JSON.stringify(process.argv),
        isDev,
    };

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`,
    );
    mainWindow.maximize();
    mainWindow.on('closed', () => (mainWindow = null));
    mainWindow.show();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
