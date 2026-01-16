const { app, BrowserWindow, Menu,ipcMain } = require('electron')
const ejse = require('ejs-electron');

let notLoggedUser={id:0,name:'Guest',user_group_id:0,infos:{},tasks: {},authToken:''};
let loginPage={'file':'login/index','title':'Login'}
let dashboardPage={'file':'dashboard/index','title':'Dashboard'}
let basic_info={
    basePath:__dirname,
    user:notLoggedUser,
    baseURLApiServer:(app.isPackaged)?'https://analysis.api.malikseedsbd.com/api':'http://localhost/arm_analysis_api/public/api',
    currentMenu:loginPage,
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
    ejse.data('basic_info',basic_info)
    mainWindow.loadFile('index.ejs').then(function (){ });
};
function changeMenu(params){
    console.log(params)
    for(let key in params){
        basic_info[key]=params[key];
    }
    mainWindow.loadFile('index.ejs').then(function (){});
}

ipcMain.on("sendRequestToIpcMain", function(e, responseName,params={}) {
    if(responseName=='basic_info'){
        mainWindow.webContents.send(responseName,basic_info);
    }
    else if(responseName=='setLoginUser'){
        basic_info['user']=params;
        changeMenu({'currentMenu':dashboardPage})
        //changeMenu(params)
    }
    else if(responseName=='changeMenu'){
        changeMenu(params)
    }
})
app.whenReady().then(() => {
    createMainWindow()
})