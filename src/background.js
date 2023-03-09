/**
 * @description     electron 主进程文件
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 21:49:24
 */

'use strict'
// 这里是用来更新用的一个代码块 MeetingWindow
import { app, BrowserWindow, protocol, Menu, Tray, nativeImage, ipcMain, globalShortcut,screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import pkg from '../package.json'
import { autoUpdater } from 'electron-updater'
const isDevelopment = process.env.NODE_ENV !== 'production'
import path from 'path'
import fs from 'fs'
const log = require('electron-log')
const { execFile } = require('child_process')


log.transports.console.level = false
log.transports.console.level = 'silly'
// 注册协议
const PROTOCOL = pkg.protocol

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, stream: true } },
])

let mainWindow
// icon 放在 外部， 防止变量被垃圾收集
let icoPath = null
let icoPath2x = null
let icoPath3x = null


// 是否可退出
let canQuit = false

async function createWindow() {
  // 应用程序 ico图标
  icoPath = nativeImage.createFromPath(path.join(__static, 'electron-icon/menu_bar.png'))
  icoPath2x = nativeImage.createFromPath(path.join(__static, 'electron-icon/menu_bar@2x.png'))
  icoPath3x = nativeImage.createFromPath(path.join(__static, 'electron-icon/menu_bar@3x.png'))

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    icon: icoPath3x,
    // frame: false,
    // transparent: true,
    useContentSize: true,
    frame: false,
    show: false, // 先隐藏
    webPreferences: {
      webSecurity: false, //允许跨域
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
      // webviewTag: true, // 允许使用webview标签
    }
  })
  mainWindow.maximize()
  mainWindow.show()

  protocalHandler()

  // Menu.setApplicationMenu(null)

  require('./ipcMain')


  // 系统托盘
  // see https://www.cnblogs.com/zjf-1992/p/7534944.html
  const tray = new Tray(icoPath2x)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: function () {
        // 退出重新登陆
        mainWindow.webContents.send('exit-clear')
        // 点击托盘 右键直接退出
        app.exit()
      }
    },
  ])
  // 系统托盘提示语
  tray.setToolTip('轻舟')
  tray.setContextMenu(contextMenu)
  tray.focus(()=>{
    console.log(1)
  })
  // 闪动提醒
  let timer = null
  let count = 0

  // 点击图标实现打开关闭应用
  tray.on('click', () => {
    mainWindow.show()
    clearInterval(timer)
    timer = null
    count = 0
    tray.setImage(icoPath2x)
    mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true)
  })

  let leaveInter,trayBounds,point,isLeave = true,isFirstCreate = false
  // 主进程渲染完成后10毫秒渲染出通知进程，并保持再后台运行 这里可能需要去掉readyToShow和外层延迟执行
  mainWindow.on("ready-to-show",()=>{
    mainWindow.show() // 初始化后再显示
    setTimeout(function(){
      // 获取当前图标的大小方便后续定位
      mainWindow.webContents.send("saveTrayBounds",tray.getBounds())
      mainWindow.webContents.send('createUnread',{})
    },10)
  })

  function checkTrayLeave(){
    clearInterval(leaveInter)
    leaveInter = setInterval(function(){
      trayBounds = tray.getBounds();
      if(mainWindow){
        mainWindow.webContents.send("saveTrayBounds",trayBounds)
      }
      point = screen.getCursorScreenPoint();
      // 判断鼠标是否还在图标内移动
      if(!(trayBounds.x < point.x && trayBounds.y < point.y && point.x < (trayBounds.x + trayBounds.width) && point.y < (trayBounds.y  + trayBounds.height))){
          //触发mouse-leave
          clearInterval(leaveInter);
          isLeave = true;
          isFirstCreate = false
          if(mainWindow){
            mainWindow.webContents.send('closeUnread',{})
          }
      }else{
        if(isFirstCreate){
          isFirstCreate = false
          if(mainWindow){
            // mainWindow.webContents.send('createUnread',{})
            mainWindow.webContents.send('showUnread',{})
          }
        }
      }
    }, 100)
  }

  // isMinimized-是否最小化
  tray.on('mouse-move', () => {
    // 再有消息时才触发此方法

    if (timer && isLeave ) {
      //触发mouse-enter
      isLeave = false;
      isFirstCreate = true
      checkTrayLeave();
    }
  })

  // 隐显 tray
  // mainWindow.on('show', () => {
  //   tray.setHighlightMode('always')
  // })
  // mainWindow.on('hide', () => {
  //   tray.setHighlightMode('never')
  // })


  // 显示提醒
  ipcMain.on('show-notice', () => {
    // 先清空
    clearInterval(timer)
    timer = null
    count = 0
    timer = setInterval(() => {
      count += 1
      if (count % 2 === 0) {
        tray.setImage(icoPath2x)
      } else {
        tray.setImage(nativeImage.createEmpty()) // 创建一个空的nativeImage实例
      }
      // tray.setToolTip('新的任务')
    }, 500)
  })

  // 关闭提醒
  ipcMain.on('hide-notice', () => {
    // 清空
    clearInterval(timer)
    timer = null
    count = 0
    tray.setImage(icoPath2x)
  })

  ipcMain.on('getProcessWindowName', () => {
    mainWindow.webContents.send('getProcessWindowNameCb', 'mainWindow')
  })

  // 清空 ModelId
  ipcMain.on('setAppUserModelId', (data) => {
    app.setAppUserModelId(' ')
  })


  // 截图
  ipcMain.on("screenWindow", () => {
    screenWindow()
  })

  // 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
  function updateHandle() {
    const message = {
      error: '检查更新出错',
      checking: '正在检查更新……',
      updateAva: '检测到新版本，正在下载……',
      updateNotAva: '已是新版本'
    }
    // 默认更新地址
    autoUpdater.setFeedURL(process.env.VUE_APP_PUBLISH_URL)
    autoUpdater.autoDownload = true
    autoUpdater.currentVersion = pkg.version
    autoUpdater.logger = log

    if (process.env.NODE_ENV === 'development') {
      autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
    } else {
      autoUpdater.updateConfigPath = path.join(__dirname, '../app-update.yml')
    }

    // autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')

    let updaterCacheDirName = 'task-manager-updater'
    const updatePendingPath = path.join(autoUpdater.app.baseCachePath, updaterCacheDirName, 'pending')

    // 每次 检查缓存，删除缓存文件
    if (fs.existsSync(updatePendingPath)) {
      try {
        emptyDir(updatePendingPath)
      } catch (e) {
        console.log(e)
      }
    }

    autoUpdater.on('error', function (error) {
      sendUpdateMessage(message.error + String(error))
    })
    autoUpdater.on('checking-for-update', function () {
      sendUpdateMessage(message.checking)
    })
    autoUpdater.on('update-available', function (info) {
      sendUpdateMessage(message.updateAva)
    })
    autoUpdater.on('update-not-available', function (info) {
      sendUpdateMessage(message.updateNotAva)
    })

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
      mainWindow.webContents.send('autoUpdater-downloadProgress', progressObj)
    })

    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      ipcMain.on('isUpdateNow', (e, arg) => {
        // some code here to handle event
        canQuit = true
        autoUpdater.quitAndInstall()
        app.quit()
      })

      mainWindow.webContents.send('isUpdateNow')
    })

    ipcMain.on("checkForUpdate", () => {
      console.log('checkForUpdate')
      // 每次 检查缓存，删除缓存文件
      if (fs.existsSync(updatePendingPath)) {
        try {
          emptyDir(updatePendingPath)
        } catch (e) {
          console.log(e)
        }
      }
      // 执行自动更新检查
      autoUpdater.checkForUpdates()
    })
  }


  updateHandle()

  // 先移除事件，防止注册事件刷新后累加
  mainWindow.webContents.session.removeListener('will-download', downloadHandler)
  mainWindow.webContents.session.addListener('will-download', downloadHandler)

  ipcMain.on("checkForUpdate", () => {
    console.log('checkForUpdate')
    // 执行自动更新检查
    autoUpdater.checkForUpdates()
  })

  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(text) {
    console.log('sendUpdateMessage message', text)
    mainWindow.webContents.send('message', text)
  }

  // 监听关闭
  mainWindow.on('close', (event) => {
    if (!canQuit) {
      mainWindow.hide()
      mainWindow.setSkipTaskbar(true)
      event.preventDefault()
    }
  })
  mainWindow.on('closed', () => {
    // 退出electron的时候一定要删除快捷键
    globalShortcut.unregisterAll()
    mainWindow = null
  })


  // const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9081/index.html` : `app://./index.html`
  const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9081/index.html/#/login` : `app://./index.html#login`
    // login
  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL(winURL)
    mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    mainWindow.loadURL(winURL)
  }
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll()
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0)
    createWindow()
})

// 安装 vue devTool 插件
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', async () => {
//   if (isDevelopment && !process.env.IS_TEST) {
//     // Install Vue Devtools
//     try {
//       await installExtension(VUEJS_DEVTOOLS)
//     } catch (e) {
//       console.error('Vue Devtools failed to install:', e.toString())
//     }
//   }
//   createWindow()
// })

app.on('ready', async () => {
  createWindow()
  /**
   * 截图功能 Ctrl+Alt+A 截图
   * **/
  globalShortcut.register("CommandOrControl+Alt+a", function () {
    screenWindow()
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

/**
 * 协议处理
 */
function protocalHandler() {
  const args = []
  if (!app.isPackaged) {
    // 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
    args.push(path.resolve(process.argv[1]))
  }
  // 加一个 `--` 以确保后面的参数不被 Electron 处理
  args.push('--')
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args)

  // 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
  handleArgv(process.argv)
}

/*
* 禁止打开多个
* 如果已被打开，那么再次点击图标不会再开启另一个程序，只会打开之前的程序
*/  
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

// 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
app.on('second-instance', (event, argv, cwd) => {
  if (mainWindow) {
    // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
    if (process.platform === 'win32') {
      handleArgv(argv)
    }
    // 在最小化 或者关闭状态下
    if (mainWindow.isMinimized() || mainWindow.isClosable()) {
      mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
      // if(mainWindow.isClosable()){
      //   mainWindow.maximize()
      // }
    }
  }
})

// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
// app.on('open-url', (event, urlStr) => {
//   handleUrl(urlStr)
// })


// protocol: 处理参数
function handleArgv(argv) {
  const prefix = `${ PROTOCOL }:`
  // 开发阶段，跳过前两个参数（`electron.exe .`）
  // 打包后，跳过第一个参数（`myapp.exe`）
  const offset = app.isPackaged ? 1 : 2
  const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix))
  if (url) handleUrl(url)
}

// protocol: 解析Url
function handleUrl(urlStr) {
  const urlObj = new URL(urlStr)
  const { searchParams } = urlObj
  const action = searchParams.get('action') || ''
  console.log('handleUrl urlObj action', action)
  switch (action) {
    // 加入会议： qingzhou:?action=joinMeeting&roomId=123456
    case 'joinMeeting':
      mainWindow.webContents.send('joinMeeting', searchParams.get('roomId'))
      break
    default:
      break
  }
}

// 截图方法
const screenWindow = () => {
  let url = path.resolve(__dirname, "../extraResources/PrintScr.exe")
  if (process.env.NODE_ENV === 'development') {
    url = path.join(__dirname, '../qqScreenshot/PrintScr.exe')
  }
  console.log(url,'url - - 截图')
  let screen_window = execFile(url)
  // console.log(screen_window)
  screen_window.on('exit', (code) => {
    // 执行成功返回 1，返回 0 没有截图
    if (code === 1) {
      console.log(code)
      mainWindow.focus()
      mainWindow.webContents.paste()
    }
  })
}

/**
 * Auto Updater
 * 参考
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 * https://gitee.com/hzhh123/electron-demo1
 * https://www.jianshu.com/p/15bde714e198
 */


// 删除文件夹
const emptyDir = function (fileUrl) {
  var files = fs.readdirSync(fileUrl)// 读取该文件夹
  files.forEach(function (file) {
    var stats = fs.statSync(fileUrl + '/' + file)
    if (stats.isDirectory()) {
      emptyDir(fileUrl + '/' + file)
    } else {
      fs.unlinkSync(fileUrl + '/' + file)
      console.log("删除文件" + fileUrl + '/' + file + "成功")
    }
  })
}

// 下载进程事件
// TODO: percent
const downloadHandler = function (event, item, webContents) {
  item.on('updated', (event, state) => {
    const fileObj = {
      state,
      url: item.getURL(),
      totalBytes: item.getTotalBytes(),
      isPaused: item.isPaused(),
      receivedBytes: item.getReceivedBytes(),
      savePath: item.getSavePath(),
      fileName: item.getFilename(),
    }
    if (state === 'interrupted') {
      console.log('Download is interrupted but can be resumed')
    } else if (state === 'progressing') {
      if (item.isPaused()) {
        console.log('Download is paused')
      } else {
        webContents.send('downloadProgress', fileObj)
      }
    }
  })
  item.once('done', (event, state) => {
    const fileObj = {
      state,
      url: item.getURL(),
      totalBytes: item.getTotalBytes(),
      isPaused: item.isPaused(),
      receivedBytes: item.getReceivedBytes(),
      savePath: item.getSavePath(),
      fileName: item.getFilename(),
    }
    if (state === 'completed') {
      mainWindow.webContents.send('downloadCompleted', fileObj)
      console.log('Download successfully')
    } else {
      mainWindow.webContents.send('downloadFiled', fileObj)
      console.log(`Download failed: ${ state }`)
    }
  })
}
