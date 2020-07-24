"use strict";
const electron = require('electron');
const config = require('config');
const elc_app = electron.app;
const elc_BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
let inputWindow;
let loginWindow;
let isLoginWindow = false;


// ログイン要求時に発火するイベント

elc_app.on("login", (event, webContents, request, authInfo, callback)=>{

    // プロキシサーバーからの要求だったら続行
    if(authInfo.isProxy){

        // 重複発火対策
        if(!isLoginWindow){
            isLoginWindow = true;
        }
        else{
            return;
        }

        // 認証情報が送信されるまで待機
        event.preventDefault();
        loginWindow = new electron.BrowserWindow({
            width: 300,
            height: 180,
            resizable: false,
            webPreferences: {
              nodeIntegration: true
            }
        });
        loginWindow.setAlwaysOnTop(true);
        // 入力ウィンドウをロード
        loginWindow.setMenu(null);
        loginWindow.loadURL('file://' + __dirname + '/login.html');

        // IPCチャネル"proxy-auth"で受信待機
        ipcMain.on("proxy-auth", (event, username, password)=>{

            // 受信した認証情報をプロキシサーバーへ転送
            callback(username, password);
            isLoginWindow = false;
        });
    }
});
elc_app.on('ready', function (event) {
  console.log(config);
  var conf = "?";
  for (var i = 0;i<Object.keys(config).length;i++){
    conf += Object.keys(config)[i] + "=" + Object.values(config)[i] + "&"
  }
  inputWindow = new electron.BrowserWindow({
      width: 300,
      height: 180,
      webPreferences: {
        nodeIntegration: true
      }
  });
  inputWindow.setAlwaysOnTop(true);
//  inputWindow.setMenu(null);
//  inputWindow.openDevTools();
  if(config.testmode == 1){
    inputWindow.loadURL('http://localhost:2525/start'+conf);  
  }else{
    inputWindow.loadURL('https://niconico-reaction.herokuapp.com/start'+conf);
  }
});
