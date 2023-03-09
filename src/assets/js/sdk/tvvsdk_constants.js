// "use strict";

// ######################################################   提示信息 ###############################################
const tipsConstants = {
  CAMERA_RES_ERROR: '分辨率参数错误',
  CONF_RES_ERROR: '会场分辨率参数错误',
  CONF_BR_ERROR: '会场码率参数错误',
  initSuccess: '初始化成功',
  initFailed: '初始化失败',
  notInit: '未初始化',
  pleaseSetOptionsValue: '请设置参数值',
  cancelShareScreen: '用户取消了屏幕共享',
  notSupportWebRtc: '该平台不支持视频流服务',
  pleaseConnectionServer: '请先连接服务后再使用服务',
  bitrateError: '码率数值不能为0',
  platformError: '平台未定义',
  websocketError: '您的浏览器不支持WebSocket api!',
  userNameError: '用户名不能为空',
  recverError: '接收者不能为空',
  recverPlatformError: '接收者平台不能为空',
  roomIdError: '房间号错误',
  userOffline: '对方未在线',
  pleaseLoginFirst: '请您先登录'
}

const constants = {
  cameraResMid: 'stdres-16:9',
  cameraResHigh: 'hdres',
  cameraResFHigh: 'fhdres',
  ptypePblisher: 'publisher',
  ptypeSubscriber: 'subscriber',
  inputVideoKind: 'videoinput',
  inputAudioKind: 'audioinput',
  outputAudioKind: 'audiooutput',
  singleMessage: 'single',
  groupMessage: 'group',
  changeAudio: 'changeAudio',
  changeVideo: 'changeVideo',
  markRectangle: 'Rectangle',
  markArrow: 'Arrow',
  markMessage: 'mark',
  platformWeb: '5'

}

const messageConstants = {
  typeSingle: 'single',
  typeGetOnLineUsers: 'getOnLineUsers',
  typeRoom: 'room',
  operationReturnOnlineUsers: 'returnOnLineUsers',
  operationRepeatLogin: 'repeatLogin',
  operationChat: 'chat',
  operationreturnUserOffline: 'returnUserOffline'
}

const confModeList = [
  {
    label: '单流多分屏统一编码会议(mcu-up)',
    value: 'mcu-up',
    mode: 0
  },
  {
    label: '单流多分屏独立编码会议(mcu-cp)',
    value: 'mcu-cp',
    mode: 1
  },
  {
    label: '单屏统一控制会议(sfu-up)',
    value: 'sfu-up',
    mode: 2
  },
  {
    label: '单屏独立控制会议(sfu-cp)',
    value: 'sfu-cp',
    mode: 3
  }
]

const picModeList = [
  {
    label: '一大多小',
    value: 0
  },
  {
    label: '等大',
    value: 1
  }
]

const resList = [
  {
    label: '360P',
    value: 'lowres-16:9',
    icon: '低',
    width: 640,
    height: 360
  },
  {
    label: '540P',
    value: 'stdres-16:9',
    icon: '标',
    width: 960,
    height: 540
  },
  {
    label: '720P',
    value: 'hdres',
    icon: '高',
    width: 1280,
    height: 720
  },
  {
    label: '1080P',
    value: 'fhdres',
    icon: '超',
    width: 1920,
    height: 1080
  }
]

const brList = [
  {
    label: '500Kbps',
    value: 500 * 1024,
    icon: '低'
  },
  {
    label: '1Mbps',
    value: 1024 * 1024,
    icon: '中'
  },
  {
    label: '2Mbps',
    value: 2 * 1024 * 1024,
    icon: '高'
  },
  {
    label: '不限制',
    value: 'unlimited',
    icon: '不'
  }
]

const fpsList = [
  {
    label: '10fps',
    value: 10,
    icon: '低'
  },
  {
    label: '15fps',
    value: 15,
    icon: '中'
  },
  {
    label: '20fps',
    value: 20,
    icon: '高'
  }
]

const logTag = {
  APP2SDK:'RTC SDK: APP => SDK      ',
  SDK2APP:'RTC SDK: APP <= SDK      ',
  SDK2MS: 'RTC SDK:        SDK => MS',
  MS2SDK: 'RTC SDK:        SDK <= MS',
  SDK2RTC:'RTC SDK:        SDK => RTC',
  RTC2SDK:'RTC SDK:        SDK <= RTC'
}

module.exports = {
  // 必须在这里暴露接口，以便被外界访问，不然就不能访问
  constants,
  tipsConstants,
  messageConstants,
  confModeList,
  picModeList,
  resList,
  brList,
  fpsList,
  logTag
}
