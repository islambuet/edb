const { app, BrowserWindow, Menu,ipcMain } = require('electron')
const ejse = require('ejs-electron');

let notLoggedUser={id:0,username:'guest',name:'Guest',user_group_id:0,infos:{},tasks: {}};
let basic_info={
    basePath:__dirname,
    user:notLoggedUser
}

let mainWindow;
function getMenu(){
    let menuItems=[];
    menuItems.push({
        label: 'File',
        submenu:[
            {role:'quit'}
        ]
    })
    menuItems.push({
        label: 'View',
        submenu:[
            {role:'reload'},
            {role:'forceReload'},
        ]
    })
    if((!app.isPackaged) || (basic_info['user']['user_group_id']==1))
    {
        menuItems[1].submenu.push({role:'toggleDevTools'})
    }
    return menuItems;
}
let menu = Menu.buildFromTemplate(getMenu())
Menu.setApplicationMenu(menu)

const createMainWindow = () => {
    //creating new window
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        resizable: !app.isPackaged,
        minimizable:!app.isPackaged,
        movable:!app.isPackaged,
        closable:!app.isPackaged,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        }
    });
    ejse.data('system_base_path',basic_info['basePath'])
    mainWindow.loadFile('index.ejs').then(function (){ });
};
app.whenReady().then(() => {
    createMainWindow()
})