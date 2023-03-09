/**
 * @description     electron ipc 进程事件统一处理
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 21:50:58
 */

import { openLink } from "./utils/pure"
import { app,nativeImage, ipcMain, BrowserWindow,screen  } from "electron"
import path from "path"

// const electron = require('electron')
var mainWindow = BrowserWindow.getFocusedWindow()


// 监听窗口变化
mainWindow.on('resize', () => {
  mainWindow.webContents.send('resize', mainWindow.isMaximized())
})

// 置顶
ipcMain.on('window-top', () => {
  if (mainWindow.isAlwaysOnTop()) {
    mainWindow.setAlwaysOnTop(false)
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'no')
  } else {
    mainWindow.setAlwaysOnTop(true)
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'yes')
  }
})
// 最小化
ipcMain.on('window-min', () => {
  console.log('window-min')
  mainWindow.minimize()
})
// 最大化
ipcMain.on('window-max', () => {
  mainWindow.focus()
  if (mainWindow.isMaximized()) {
    mainWindow.restore()
    // 主进程 个渲染进程 发送数据
    BrowserWindow.getFocusedWindow().webContents.send('restoreMaximize', 'restore')
  } else {
    mainWindow.maximize()
    // 主进程 个渲染进程 发送数据
    BrowserWindow.getFocusedWindow().webContents.send('restoreMaximize', 'maximize')
  }
})
// 关闭
ipcMain.on('window-close', () => {
  mainWindow.close()
})
// 退出
ipcMain.on('app-exit-close', () => {
  app.exit()
})
// 程序加载
ipcMain.on('app-reload-windows', () => {
  mainWindow.reload()
})
// 重新聚焦
ipcMain.on('window-focus', () => {
  console.log('window-focus')
  mainWindow.show()
  // mainWindow.moveTop()
  // mainWindow.focus()
})

// 加入会议
ipcMain.on('joinMeeting', () => {
  console.log('ipcmain screenWindowAA')
})


// 监听- 应用程序是否崩溃
mainWindow.webContents.on('render-process-gone',(event, details)=>{
  mainWindow.webContents.send('program-exception',details)
  // dialog.showMessageBox(options, (index) => {
  //   if (index === 0) mainWindow.reload()
  //   else mainWindow.close()
  // })

  // mainWindow.reload()
  // mainWindow.close()
})




// 新窗口打开链接 监听
mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
  // event.preventDefault()
  // openLink(url)
  // console.log('url==>', url)
  // if (frameName === 'modal') {
  //   // open window as modal
  //   event.preventDefault()
  //   Object.assign({}, {
  //     modal: true,
  //     parent: mainWindow,
  //     width: 100,
  //     height: 100
  //   })
  //   event.newGuest = new BrowserWindow(options)
  // } else {
  //   event.preventDefault()
  //   openLink(url)
  // }
  event.preventDefault()
  openLink(url)
})

// 会议窗口
let MeetingWindow = null
// 语音通话窗口
let CallWindow = null
// 共享屏幕缩小窗口
let ShareShrinkWindow = null
// 预览窗口
let PreviewWindow = null
const icoPath3x = nativeImage.createFromPath(path.join(__static, 'electron-icon/menu_bar@3x.png'))
// 右下角提示窗口
let rightBottomWindow = null
let rightBottomScreen = {}
let rightBottomInterval = null
/*** region 视频会议窗口 ***/
// 创建会议
ipcMain.on('create-meeting-window', (e, data) => {
  // NOTE: 限制窗口模式，只有一个
  // 如果有子窗口，销毁重载
  if (MeetingWindow) {
    let meetingUrl = parseMeetingUrl(data)
    if(!meetingUrl) return

    // 已存在的情况下，重载新的url
    MeetingWindow.webContents.send('loadNewMeetingUrl', meetingUrl)
    console.log('loadNewMeetingUrl', meetingUrl)
    setTimeout(() => {
      MeetingWindow.show()
      if(ShareShrinkWindow) {
        ShareShrinkWindow.hide()
        ShareShrinkWindow.close()
        ShareShrinkWindow.destroy()
        ShareShrinkWindow = null
      }
      if(mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('meeting-window-close-cb', '')
      }
    }, 500)
  } else {
    // 创建
    createNewMeetingWindow(data)
  }
  // NOTE: 不限制窗口模式，可以有多个
  // createNewMeetingWindow(data)
})

/**
 * 会议创建参数解析
 * @param   roomActionDataStr {String}
 * @return  {String}
 * */
function parseMeetingUrl(roomActionDataStr) {
  let meetingUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9081/#/meetingRoom'
    : `app://./index.html#meetingRoom`

  mainWindow.webContents.send('meeting-window-create-action-cb', roomActionDataStr)

  if(roomActionDataStr) {
    const roomActionData = JSON.parse(roomActionDataStr)
    const {creatType, roomId = ''} = roomActionData

    if (!roomId) {
      console.log('创建失败，会议室ID为空')
      mainWindow.webContents.send('meeting-window-create-error-cb', '会议室ID为空')
      return ''
    }

    if(creatType === 'create') {
      meetingUrl += `?creatType=create&roomId=${ roomId }`
    } else if (creatType === 'join') {
      meetingUrl += `?creatType=join&roomId=${ roomId }`
    }
  }
  return meetingUrl
}
/**
 * @param roomActionDataStr {String}
 *
 * roomActionData  {
 *   creatType: '',  [create 创建, join 加入]
 *   roomId: '',
 * }
 * */
function createNewMeetingWindow(roomActionDataStr) {
  // 否则创建子窗口
  let meetingUrl = parseMeetingUrl(roomActionDataStr)
  if(!meetingUrl) return

  MeetingWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    // parent: mainWindow,
    title: '轻舟会议',
    icon: icoPath3x,
    useContentSize: true,
    frame: false,
    // parent:mainWindow,
    // model:true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  })

  if (process.env.NODE_ENV === 'development') {
    MeetingWindow.webContents.openDevTools()
  }
  MeetingWindow.loadURL(meetingUrl)
  console.log("测试页面111111")
  MeetingWindow.on('restore',function(event){
    console.log("会议页面显示")
  })
  MeetingWindow.on('minimize',function(event){
    console.log("会议页面隐藏")
  })
  MeetingWindow.on('hide',function(event){
    console.log("会议页面隐藏111")
  })
  MeetingWindow.on("always-on-top-changed",function(event){
    console.log("会议页面层级改变")
  })
  // MeetingWindow.once('ready-to-show',()=>{
  //   MeetingWindow.show()
  // })
  // 监听 关闭，销毁
  MeetingWindow.on('close', function(event) {
    event.preventDefault()
    setTimeout(() => {
      if(MeetingWindow) {
        MeetingWindow.hide()
        MeetingWindow.close()
        MeetingWindow.destroy()
        MeetingWindow = null
      }
      if(mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('meeting-window-close-cb', ShareShrinkWindow ? true : '')
      }
    }, 500)
  })
}
// 会议 关闭
ipcMain.on('meeting-window-close', () => {
  setTimeout(() => {
    if(MeetingWindow) {
      MeetingWindow.hide()
      MeetingWindow.close()
      MeetingWindow.destroy()
      MeetingWindow = null
    }
    if(mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('meeting-window-close-cb', ShareShrinkWindow ? true : '')
    }
  }, 500)
  // console.log('inner window-close-meeting')
  // try {
  //   if(MeetingWindow && MeetingWindow.close) {
  //     MeetingWindow.close()
  //   }
  //   MeetingWindow.close()
  //   MeetingWindow = null
  // } catch (e) {
  //   console.log(e)
  // }
})

// 会议 最小化
ipcMain.on('meeting-window-min', () => {
  MeetingWindow.minimize()
})

// 会议 最大化
ipcMain.on('meeting-window-max', () => {
  if (MeetingWindow.isMaximized()) {
    MeetingWindow.restore()
    // 主进程 个渲染进程 发送数据
    BrowserWindow.getFocusedWindow().webContents.send('restoreMaximize-meeting', 'restore')
  } else {
    MeetingWindow.maximize()
    // 主进程 个渲染进程 发送数据
    BrowserWindow.getFocusedWindow().webContents.send('restoreMaximize-meeting', 'maximize')
  }
})
// 会议隐藏
ipcMain.on('meeting-window-hide', (event) => {
  MeetingWindow.hide()
})
// 会议显示
ipcMain.on('meeting-window-show', (e,data) => {
  MeetingWindow.show()
  MeetingWindow.webContents.send('showNarrowIcon',data.showIcon)
})
/*** endregion 视频会议窗口 ***/


/*** region 语音通话窗口 ***/
// 检查是否存在callRoom, 正在语音通话中
ipcMain.on('checkCallRoomExist', () => {
  const result = !!CallWindow
  mainWindow.webContents.send('checkCallRoomExist-cb', result)
})

// 创建语音通话
ipcMain.on('create-call-window', (e, data) => {
  // NOTE: 限制窗口模式，只有一个
  // 如果有子窗口，销毁重载
  if (CallWindow) {
    let callUrl = parseCallUrl(data)
    if(!callUrl) return

    // 已存在的情况下，重载新的url
    CallWindow.webContents.send('loadNewCallUrl', callUrl)
    console.log('loadNewCallUrl', callUrl)
    setTimeout(() => {
      CallWindow.show()
      if(mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('call-window-close-cb', '')
      }
    }, 500)
  } else {
    // 创建
    createNewCallWindow(data)
  }
})

/**
 * 语音创建参数解析
 * @param   {String}      roomActionDataStr
 * @return  {String}      http://localhost:9081/#/call?creatType=create&roomId=callRoom-pc-xxx
 * */
function parseCallUrl(roomActionDataStr) {
  let callUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9081/#/call'
    : `app://./index.html#call`

  if(roomActionDataStr) {
    const roomActionData = JSON.parse(roomActionDataStr)
    const {creatType, roomId = ''} = roomActionData

    if (!roomId) {
      console.log('创建失败，语音通话ID为空')
      mainWindow.webContents.send('call-window-create-error-cb', '语音通话ID为空')
      return ''
    }

    if(creatType === 'create') {
      callUrl += `?creatType=create&roomId=${ roomId }`
    } else if (creatType === 'join') {
      callUrl += `?creatType=join&roomId=${ roomId }`
    }
  }
  return callUrl
}
/**
 * @param roomActionDataStr {String}
 *
 * roomActionData  {
 *   creatType: '',  [create 创建, join 加入]
 *   roomId: '',
 * }
 * */
function createNewCallWindow(roomActionDataStr) {
  // 否则创建子窗口
  let callUrl = parseCallUrl(roomActionDataStr)
  if(!callUrl) return

  CallWindow = new BrowserWindow({
    // width: 400,
    // height: 700,
    // minWidth: 400,
    // minHeight: 700,
    // maxWidth: 400,
    // maxHeight: 700,
    // resizable: false,
    // parent: mainWindow,
    title: '语音通话',
    icon: icoPath3x,
    useContentSize: true,
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  })

  CallWindow.loadURL(callUrl)
  // 监听 关闭，销毁
  CallWindow.on('close', function(event) {
    event.preventDefault()
    setTimeout(() => {
      if(CallWindow) {
        CallWindow.hide()
        CallWindow.close()
        CallWindow.destroy()
        CallWindow = null
      }
      if(mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('call-window-close-cb', '')
      }
    }, 500)
  })
}
// 语音通话 关闭
ipcMain.on('call-window-close', () => {
  // setTimeout(() => {
  //   if(CallWindow) {
  //     CallWindow.hide()
  //     CallWindow.close()
  //     CallWindow.destroy()
  //     CallWindow = null
  //   }
  //   if(mainWindow && mainWindow.webContents) {
  //     mainWindow.webContents.send('call-window-close-cb', '')
  //   }
  // }, 500)
})

// 语音通话 最小化
ipcMain.on('call-window-min', () => {
  CallWindow.minimize()
})

// 语音通话 置顶
ipcMain.on('call-window-top', () => {
  if (CallWindow.isAlwaysOnTop()) {
    CallWindow.setAlwaysOnTop(false)
    CallWindow.webContents.send('call-alwaysOnTop', 'no')
  } else {
    CallWindow.setAlwaysOnTop(true)
    CallWindow.webContents.send('call-alwaysOnTop', 'yes')
  }
})

// 语音通话 重新聚焦
ipcMain.on('call-window-focus', () => {
  CallWindow.moveTop()
  CallWindow.focus()
})

// 语音通话 socket 共享  data String
ipcMain.on('ipcMainShareSocket', (e, dataStr) => {
  if(CallWindow) {
    CallWindow.webContents.send('ipcMainShareSocketCb', dataStr)
  }
})
/*** endregion 语音通话窗口 ***/


// 获取窗口标识
ipcMain.on('getProcessWindowName', () => {
  if(MeetingWindow) {
    MeetingWindow.webContents.send('getProcessWindowNameCb', 'meetingWindow')
  }
  if(CallWindow) {
    CallWindow.webContents.send('getProcessWindowNameCb', 'callWindow')
  }
})

// 关闭其他窗口
ipcMain.on('closeOtherWindow', () => {
  if (MeetingWindow) {
    setTimeout(() => {
      if (MeetingWindow) {
        MeetingWindow.hide()
        MeetingWindow.close()
        MeetingWindow.destroy()
        MeetingWindow = null
      }
    }, 500)
  }
  if (CallWindow) {
    setTimeout(() => {
      if (CallWindow) {
        CallWindow.hide()
        CallWindow.close()
        CallWindow.destroy()
        CallWindow = null
      }
    }, 500)
  }
})
let unreadData = null
// 消息列表
ipcMain.on('create-unread-list', (e, data) => {
  unreadData = data
  // NOTE: 限制窗口模式，只有一个
  // 如果有子窗口，销毁重载
  if (rightBottomWindow) {
    rightBottomWindow.show()
  } else {
    // 创建
    createNewUnreadListWindow(data)
  }
})

ipcMain.on('delete-unread-list', (e) => {
  rightBottomWindow = null
})
// 消息列表 关闭、隐藏
ipcMain.on('unread-list-close', (window,val) => {
  if(rightBottomWindow){
    // 初始化的时候渲染进程，没有空白时间
    clearInterval(rightBottomInterval)
    rightBottomInterval = setInterval(function(){
      let point = screen.getCursorScreenPoint()
      // 判断是否再
      if(!(point.x>rightBottomScreen.startX && point.x<rightBottomScreen.endX && point.y>rightBottomScreen.startY && point.y<rightBottomScreen.endY)){
        clearInterval(rightBottomInterval)
        mainWindow.webContents.send('startNotice', '')
        // unreadData.bodyHeight= unreadData.bodyHeight >= 180 ? 180 : unreadData.bodyHeight
        unreadData.bodyHeight= val.heightLength<180?(val.heightLength>100?val.heightLength:100):180
        rightBottomWindow.setAlwaysOnTop(false)
        rightBottomWindow.setSize(280,unreadData.bodyHeight)
        rightBottomWindow.setContentSize(280,unreadData.bodyHeight)
        rightBottomWindow.setPosition(unreadData.x-280/2,unreadData.availHeight+300)
        // rightBottomWindow.setPosition(unreadData.x-280/2,unreadData.availHeight+unreadData.height)
      }

    }, 50)

    // 用于动态渲染进程
    // setTimeout(() => {
    //   clearInterval(rightBottomInterval)
    //   rightBottomInterval = setInterval(function(){
    //     let point = screen.getCursorScreenPoint()
    //     if(!(point.x>rightBottomScreen.startX && point.x<rightBottomScreen.endX && point.y>rightBottomScreen.startY && point.y<rightBottomScreen.endY)){
    //       clearInterval(rightBottomInterval)
    //       if(rightBottomWindow) {
    //         rightBottomWindow.hide()
    //         rightBottomWindow.close()
    //         rightBottomWindow.destroy()
    //         rightBottomWindow = null
    //       }
    //       if(mainWindow && mainWindow.webContents) {
    //         mainWindow.webContents.send('unread-window-close-cb', '')
    //       }
    //     }
    //   },50)
    // }, 100)
  }
})
// 未读消息不同进程通讯
ipcMain.on("get-unread-list",(e, data)=>{
  rightBottomWindow.webContents.send('getUnreadList',data)
})
// 点击未读消息 -
ipcMain.on('test-click-msg',(data,type)=>{
  mainWindow.show()
  type['url'] = type.taskName == undefined ? '/message/index' : '/my/index'
  mainWindow.webContents.send('unread-list-close', type)
  mainWindow.webContents.send('current-personnel',type)
})


/*******
 * @description:  消息列表显示
 * @param {JSON Object} data 包含列表的长度和条数内容等,最总根据需求来实现
 * @return {*}
 */

ipcMain.on('unread-list-show',(Window,val)=>{
  if(rightBottomWindow){
    rightBottomWindow.setAlwaysOnTop(true,'pop-up-menu')
    // if(rightBottomWindow){
    // 这里需要动态设置列表高度和定位
    unreadData.bodyHeight= val.heightLength < 300 ? (val.heightLength > 100 ? val.heightLength : 100) : 300
    rightBottomScreen.startY = unreadData.availHeight-unreadData.bodyHeight
    rightBottomWindow.setSize(280,unreadData.bodyHeight)
    rightBottomWindow.setContentSize(280,unreadData.bodyHeight)
    rightBottomWindow.setPosition(unreadData.x-280/2,unreadData.availHeight-unreadData.bodyHeight)
    // rightBottomWindow.setPosition(unreadData.x-280/2,unreadData.availHeight-unreadData.bodyHeight)
  }
})
/**
 * 未读创建参数解析
 * @param   {String}      data
 * @return  {String}      http://localhost:9081/#/call?creatType=create&roomId=callRoom-pc-xxx
 * */
function parseUnreadUrl(data) {
  let callUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9081/#/unread'
    : `app://./index.html#unread`
  return callUrl
}
function createNewUnreadListWindow(data) {
  // 否则创建子窗口
  let callUrl = parseUnreadUrl(data)
  if(!callUrl) return
  rightBottomScreen = {
    startX:data.x-280/2,
    endX:data.x+280/2,
    startY:data.availHeight-data.bodyHeight,
    endY:data.availHeight
  }
  rightBottomWindow = new BrowserWindow({
    width: 800,
    maxWidth: 280,
    maxHeight: 300,
    height:data.bodyHeight,
    title: '新消息',
    icon: icoPath3x,
    useContentSize: true,
    frame: false,
    x:data.x-280/2,
    // y:data.availHeight-data.bodyHeight,
    y:data.availHeight+data.bodyHeight,
    resizable:false,
    alwaysOnTop:true,
    skipTaskbar:true,
    hasShadow:false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  })
  rightBottomWindow.loadURL(callUrl)
  // if (process.env.NODE_ENV === 'development') {
  //   rightBottomWindow.webContents.openDevTools()
  // }
  // 监听 关闭，销毁
  rightBottomWindow.on('close', function(event) {
    event.preventDefault()
    setTimeout(() => {
      clearInterval(rightBottomInterval)
      if(rightBottomWindow) {
        rightBottomWindow.hide()
        rightBottomWindow.close()
        rightBottomWindow.destroy()
        rightBottomWindow = null
      }
      if(mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('unread-window-close-cb', '')
      }
    }, 100)
  })
}



// 创建窗口
ipcMain.on('create-meetingShareShrink-window', (e,position) => {
  // NOTE: 限制窗口模式，只有一个
  // 如果有子窗口，销毁重载
  if (ShareShrinkWindow) {
    let meetingUrl = parseShareShrinkUrl()
    if(!meetingUrl) return

    // 已存在的情况下，重载新的url
    ShareShrinkWindow.webContents.send('loadNewShareShrinkUrl', meetingUrl)
    console.log('loadNewShareShrinkUrl', meetingUrl)
    setTimeout(() => {
      ShareShrinkWindow.show()
      // if(mainWindow && mainWindow.webContents) {
      //   mainWindow.webContents.send('meeting-window-shareShrink-close-cb', '')
      // }
    }, 500)
  } else {
    // 创建
    createNewShareShrinkWindow(position)
  }
  // NOTE: 不限制窗口模式，可以有多个
  // createNewMeetingWindow(data)
})

function parseShareShrinkUrl() {
  let meetingUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9081/#/meetingShareShrink'
    : `app://./index.html#meetingShareShrink`
  return meetingUrl
}

function createNewShareShrinkWindow(position) {
  // 否则创建子窗口
  let meetingUrl = parseShareShrinkUrl()
  if(!meetingUrl) return

  ShareShrinkWindow = new BrowserWindow({
    width: 220,
    height: 150,
    minWidth:200,
    minHeight:130,
    x:position.x,
    y:100,
    // resizable:false,
    minimizable:false,
    maximizable:false,
    alwaysOnTop:true,
    useContentSize: true,
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  })

  // if (process.env.NODE_ENV === 'development') {
  //   ShareShrinkWindow.webContents.openDevTools()
  // }
  ShareShrinkWindow.loadURL(meetingUrl)
  ShareShrinkWindow.setAlwaysOnTop(true)
  // 监听 关闭，销毁
  ShareShrinkWindow.on('close', function(event) {
    event.preventDefault()
    setTimeout(() => {
      if(ShareShrinkWindow) {
        ShareShrinkWindow.hide()
        ShareShrinkWindow.close()
        ShareShrinkWindow.destroy()
        ShareShrinkWindow = null
      }
      if(MeetingWindow) {
        MeetingWindow.webContents.send('meeting-window-shareShrink-close-cb')
      }
    }, 500)
  })
}
// 窗口关闭
ipcMain.on('meeting-window-shareShrink-close', () => {
  setTimeout(() => {
    if(ShareShrinkWindow) {
      ShareShrinkWindow.hide()
      ShareShrinkWindow.close()
      ShareShrinkWindow.destroy()
      ShareShrinkWindow = null
    }
    // if(MeetingWindow && MeetingWindow.webContents) {
    //   MeetingWindow.webContents.send('meeting-window-shareShrink-close-cb')
    // }
  }, 500)
})

// 窗口显示
ipcMain.on('meeting-share-window-show', () => {
  ShareShrinkWindow.show()
})

// 窗口隐藏
ipcMain.on('meeting-share-window-hide', () => {
  ShareShrinkWindow.hide()
})


/*** region 预览窗口 ***/
// 创建预览窗口
ipcMain.on('create-preview-window', (e, data) => {
  // NOTE: 限制窗口模式，只有一个
  // 如果有子窗口，销毁重载
  if (PreviewWindow) {
    let meetingUrl = parsePreviewUrl()
    if(!meetingUrl) return
    // 已存在的情况下，重载新的url
    PreviewWindow.webContents.send('loadNewPreviewUrl', {meetingUrl,info:data})
    console.log('loadNewPreviewUrl', meetingUrl)
    setTimeout(() => {
      PreviewWindow.show()
      // if(mainWindow && mainWindow.webContents) {
      //   mainWindow.webContents.send('meeting-window-close-cb', '')
      // }
    }, 500)
  } else {
    // 创建
    createNewPreviewWindow(data)
  }
  // NOTE: 不限制窗口模式，可以有多个
  // createNewMeetingWindow(data)
})

/**
 * 参数解析
 * @return  {String}
 * */
function parsePreviewUrl() {
  let meetingUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9081/#/preview'
    : `app://./index.html#preview`

  return meetingUrl
}

function createNewPreviewWindow(url) {
  // 否则创建子窗口
  let meetingUrl = parsePreviewUrl()
  if(!meetingUrl) return

  PreviewWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    minWidth: 1000,
    minHeight: 650,
    title: '预览',
    icon: icoPath3x,
    useContentSize: true,
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  })
  
  if (process.env.NODE_ENV === 'development') {
    PreviewWindow.webContents.openDevTools()
  }
  PreviewWindow.loadURL(meetingUrl)
  // PreviewWindow.on('ready-to-show',  function() {
  //   PreviewWindow.show()
  //   PreviewWindow.webContents.send('previewWindowCreateCb', url)
  // })

  PreviewWindow.on('close', function(event) {
    event.preventDefault()
    setTimeout(() => {
      if(PreviewWindow) {
        PreviewWindow.hide()
        PreviewWindow.close()
        PreviewWindow.destroy()
        PreviewWindow = null
      }
    }, 500)
  })
}
// 预览 关闭
ipcMain.on('preview-window-close', () => {
  setTimeout(() => {
    if(PreviewWindow) {
      PreviewWindow.hide()
      PreviewWindow.close()
      PreviewWindow.destroy()
      PreviewWindow = null
    }
  }, 500)
})

// 预览 最小化
ipcMain.on('preview-window-min', () => {
  PreviewWindow.minimize()
})

// 预览 最大化
ipcMain.on('preview-window-max', () => {
  if (PreviewWindow.isMaximized()) {
    PreviewWindow.restore()
    // 主进程 个渲染进程 发送数据
    BrowserWindow.getFocusedWindow().webContents.send('restoreMaximize-preview', 'restore')
  } else {
    PreviewWindow.maximize()
    // 主进程 个渲染进程 发送数据
    BrowserWindow.getFocusedWindow().webContents.send('restoreMaximize-preview', 'maximize')
  }
})
/*** endregion 预览窗口 ***/