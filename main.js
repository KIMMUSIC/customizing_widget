const { app, BrowserWindow } = require('electron');
const path = require('path');
const {ipcMain} = require('electron');


 
const createWindow = () => {
    const win = new BrowserWindow({
        fullscreen: false,
        autoHideMenuBar: true,
        width: 1080, height:700, frame:false, transparent: true,useContentSize:true,
        webPreferences: { 
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js') }
    });
 
    win.loadFile('index.html');
};
 
app.whenReady().then(() => {
    createWindow();
 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

ipcMain.on('editmode',(event)=>{
    console.log("editmode");
    event.reply('editmodeon')
})
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});