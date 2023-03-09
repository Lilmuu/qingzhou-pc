import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, globalShortcut } from 'electron'
import path from 'path'
import fs from 'fs'
import { autoUpdater } from 'electron-updater'
import pkg from '../../package.json'
const { execFile} = require('child_process')



/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}


let mainWindow
const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

// icon 放在 外部， 防止变量被垃圾收集
let icoPath = null
let icoPath2x = null
let icoPath3x = null

// 是否可退出
let canQuit = false

function createWindow() {
  // 应用程序 ico图标
  icoPath = nativeImage.createFromPath(path.join(__static, 'menu_bar.png'))
  icoPath2x = nativeImage.createFromPath(path.join(__static, 'menu_bar@2x.png'))
  icoPath3x = nativeImage.createFromPath(path.join(__static, 'menu_bar@3x.png'))

  // 最大化
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    icon: icoPath3x,
    useContentSize: true,
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
    }
  })
  mainWindow.maximize()
  mainWindow.show()

  protocalHandler()

  Menu.setApplicationMenu(null)

  app.commandLine.appendSwitch('ignore-certificate-errors', 'true')

  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // 允许私有证书
    event.preventDefault()
    callback(true)
  })

  mainWindow.loadURL(winURL)

  // 取消默认菜单
  mainWindow.setMenu(null)
  require('./ipcMain')

  // 监听关闭
  mainWindow.on('close', (event) => {
    if (!canQuit) {
      mainWindow.hide()
      mainWindow.setSkipTaskbar(true)
      event.preventDefault()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 系统托盘
  // see https://www.cnblogs.com/zjf-1992/p/7534944.html
  const tray = new Tray(icoPath2x)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: function() {
        // 点击托盘 右键直接退出
        app.exit()
      }
    }
  ])
  tray.setToolTip('轻舟')
  tray.setContextMenu(contextMenu)

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

    autoUpdater.setFeedURL(pkg.build.publish[0].url)
    autoUpdater.autoDownload = true
    autoUpdater.currentVersion = pkg.version

    if (process.env.NODE_ENV === 'development') {
      autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
    } else {
      autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml')
    }
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

    autoUpdater.on('error', function(error) {
      sendUpdateMessage(message.error)
    })
    autoUpdater.on('checking-for-update', function() {
      sendUpdateMessage(message.checking)
    })
    autoUpdater.on('update-available', function(info) {
      sendUpdateMessage(message.updateAva)
    })
    autoUpdater.on('update-not-available', function(info) {
      sendUpdateMessage(message.updateNotAva)
    })

    // 更新下载进度事件
    autoUpdater.on('download-progress', function(progressObj) {
      console.log('触发下载。。。')
      mainWindow.webContents.send('autoUpdater-downloadProgress', progressObj)
    })
    autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      ipcMain.on('isUpdateNow', (e, arg) => {
        console.log(arguments)
        console.log("开始更新")
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
  mainWindow.webContents.session.removeListener('will-download', downloadHnadler)
  mainWindow.webContents.session.addListener('will-download', downloadHnadler)

  ipcMain.on("checkForUpdate", () => {
    console.log('checkForUpdate')
    // 执行自动更新检查
    autoUpdater.checkForUpdates()
  })

  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(text) {
    console.log('message', text)
    mainWindow.webContents.send('message', text)
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


/**
 * 协议处理
 */
function protocalHandler() {
  console.log('协议处理')
  const args = []
  if (!app.isPackaged) {
    // 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
    args.push(path.resolve(process.argv[1]))
  }
  // 加一个 `--` 以确保后面的参数不被 Electron 处理
  args.push('--')

  // 注册协议
  const PROTOCOL = pkg.protocol
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args)

  // 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
  handleArgv(process.argv)

  // 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
  app.on('second-instance', (event, argv) => {
    // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
    if (process.platform === 'win32') {
      handleArgv(argv)
    }
  })

  // macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
  app.on('open-url', (event, urlStr) => {
    handleUrl(urlStr)
  })

  // ipcMain.on('handleJoinMeeting', () => {
  //   handleUrl(`qingzhou:?action=joinMeeting&roomId=123456`)
  // })

  // 处理参数
  function handleArgv(argv) {
    const prefix = `${PROTOCOL}:`
    // 开发阶段，跳过前两个参数（`electron.exe .`）
    // 打包后，跳过第一个参数（`myapp.exe`）
    const offset = app.isPackaged ? 1 : 2
    const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix))
    if (url) handleUrl(url)
  }

  // 解析Url
  function handleUrl(urlStr) {
    const urlObj = new URL(urlStr)
    const {searchParams} = urlObj
    console.log(urlObj.query)
    const action = searchParams.get('action') || ''
    switch (action) {
      // 加入会议： qingzhou:?action=joinMeeting&roomId=123456
      case 'joinMeeting':
        mainWindow.webContents.send('joinMeeting', searchParams.get('roomId'))
        break
      default:
        break
    }
  }
}

// 禁止打开多个
const gotLock = app.requestSingleInstanceLock()

app.on('second-instance', (event, argv, cwd) => {
  console.log('second-instance')
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  }
})

if (!gotLock) {
  app.quit()
}
/**
 * 截图功能
 * **/
// globalShortcut.register("CommandOrControl+Alt+a", function () {
//   console.log('screenWindow event')
//   screenWindow()
// })
// 截图方法
const screenWindow = () => {
  console.log('__dirname', __dirname)
  let url = path.resolve(__dirname, "../extraResources/PrintScr.exe")
  // if (isDevelopment && !process.env.IS_TEST) {
  if (process.env.NODE_ENV === 'development') {
    // 生产环境
    url = path.join(__dirname, '/qqScreenshot/PrintScr.exe')
  }
  console.log('url', url)

  let screen_window = execFile(url)
  // console.log(screen_window)
  screen_window.on('exit', (code) => {
    console.log('jinlaile')
    mainWindow.restore()
    if (code) {
      console.log(code)
    }
  })
}
// // 添加快捷键
//    globalShortcut.register('CommandOrControl+Alt+L', function () {
//     screenWindow();
// });
// 退出electron的时候一定要删除快捷键
//globalShortcut.unregisterAll()

/**
 * Auto Updater
 * 参考
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 * https://gitee.com/hzhh123/electron-demo1
 * https://www.jianshu.com/p/15bde714e198
 */

// 删除文件夹
const emptyDir = function(fileUrl) {
  var files = fs.readdirSync(fileUrl)// 读取该文件夹
  console.log('files', files)
  files.forEach(function(file) {
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
const downloadHnadler = function(event, item, webContents) {
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
        console.log(`Download failed: ${state}`)
      }
    })
}
