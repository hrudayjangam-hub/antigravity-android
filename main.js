const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, 'public/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true
    });

    // Start the Express server
    serverProcess = fork(path.join(__dirname, 'server.js'));

    // Wait for server to start before loading
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
    }, 2000);

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (serverProcess) serverProcess.kill();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        if (serverProcess) serverProcess.kill();
    }
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
