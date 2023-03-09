// 处理接受消息信息
import App from '@/main'
import Xmpp from '@/utils/imUtil/xmpp'
import Tools from '@/utils/imUtil/tools'
import WEBIM from '@/xmpp/webim-reset'
import burningAfterDelete from '@/storage/burning-after-delete'
import lastChatList from '@/storage/last-chat-list'
import groupList from '@/storage/group-list'
import notShownMessage from '@/storage/not-shown-message'
import newMessageNumber from '@/storage//new-message-number'

import { ousinessPperations } from '@/storage/index'
// import { logout } from '@/utils/primary'
import { getItem, setItem } from '@/utils/imUtil/storage'
import { MessageType, MessageObject } from './message-type'
import EventBus from "@/eventBus";


// 防止未被创建
window.IMRouterParams = window.IMRouterParams || {}

// 当前是否在im页面中
const isIMPage = () => {
  return App.$route.path === '/message/index'
}
const imId = getItem('MeId')

// 重置 im 消息的路由地址
const resetIMRouter = () => {
  if (isIMPage()) {
    EventBus.$emit('resetIMRoute')
  }
}

const mutations = {
  RESET_NEW_FRIEND_LIST(newFriendList) {
    App.$store.commit('Im/Friends/RESET_NEW_FRIEND_LIST', newFriendList)
  },
  // 设置阅后即焚消息列表
  SET_BURNING_AFTER_DELETE(burningAfterDelete) {
    App.$store.commit('Im/Chat/SET_BURNING_AFTER_DELETE', burningAfterDelete)
  },
  // 添加朋友列表
  ADD_FRIEND_LIST(friend) {
    App.$store.commit('Im/Friends/ADD_FRIEND_LIST', friend)
  },
  // 删除朋友列表
  DEL_FRIEND_LIST(index) {
    App.$store.commit('Im/Friends/DEL_FRIEND_LIST', index)
  },
  // 设置撤回消息
  SET_RETRACT_MESSAGE(retractMessage) {
    App.$store.commit('Im/Chat/SET_RETRACT_MESSAGE', retractMessage)
  },
  // 删除一条列表消息
  DELETE_MESSAGE_LIST(mssageId) {
    App.$store.commit('Im/Chat/DELETE_MESSAGE_LIST', mssageId)
  },
  // 删除最后一条消息列表的消息
  DEL_LAST_CHAT(message) {
    App.$store.commit('Im/Information/DEL_LAST_CHAT', message)
  }
}

const actions = {
  // [GET] 获取用户信息
  async GetUserInfo(params) {
    const rs = await App.$store.dispatch('Common/User/GetUserInfo', params)
    return rs
  },
  // [Add] 添加消息
  AddMessageList(message) {
    App.$store.dispatch('Im/Chat/AddMessageList', message)
  },
  // [GET] 获取最后消息列表
  GetLastChatList() {
    App.$store.dispatch('Im/Information/GetLastChatList')
  },
  // [Set] 设置新消息数量列表
  SetNewMessageNumberList(list) {
    App.$store.dispatch('Im/Information/SetNewMessageNumberList', list)
  },
  // [Set] 设置新消息数量总和
  SetNewMessageNumberSum(num) {
    App.$store.dispatch('Im/Information/SetNewMessageNumberSum', num)
  },
  SetNewMailMessage(num) {
    App.$store.dispatch('Im/Information/SetNewMailMessage', num)
  },
  // [Set] 设置已读消息
  SetReadMessage(readId) {
    App.$store.dispatch('Im/Chat/SetReadMessage', readId)
  },
  // [GET] 获取群聊信息
  async GetRoomInfo(params) {
    const rs = await App.$store.dispatch('Im/Room/GetRoomInfo', params)
    return rs
  },
  // [GET] 获取新朋友最后一条消息
  GetNewFriendLast(params) {
    App.$store.dispatch('Im/Friends/GetNewFriendLast', params)
  }
}

// 退群列表
const removeRoomList = []

// 接收消息，并处理消息分发
export const receiveMessage = message => {
  console.log('###################### 收到消息， 处理消息分发 ##################', message)
  // 存储最后一条收到消息的时间
  // 由于会存在后发的消息先发到我这的问题，所以要保证，本地的存储的时间是最大的
  const lastChatReceiveTime = getItem('LastChatReceiveTime') || 0
  if (lastChatReceiveTime < message.timeSend) {
    setItem('LastChatReceiveTime', message.timeSend)
  }

  console.log('im消息 消息类型：', message.type, message.chatType, message)
  const meId = App.$store.state.Common.User.MeId + ''

  let id
  if (message.chatType === 1) {
    id = message.fromUserId
  } else if (message.chatType === 2) {
    id = message.toUserId
  }

  // 消息去重
  const chatRoom = App.$store.state.Im.Chat.ChatRoomInfo[id] || {} // 聊天室信息
  const ordinaryList = chatRoom.messageList || [] // 普通消息列表（接口消息列表）

  const retractMessageList = App.$store.state.Im.Chat.RetractMessage[id] || [] // 撤回消息列表

  const burningAfterDelete = App.$store.state.Im.Chat.BurningAfterDelete[id] || {} // 阅后即焚消息
  const burningAfterDeleteList = burningAfterDelete.messageList || [] // 阅后即焚消息列表

  if (
    Tools.arrayCheck(ordinaryList, message, 'messageId') ||
    Tools.arrayCheck(retractMessageList, message, 'messageId', 'content') ||
    Tools.arrayCheck(burningAfterDeleteList.messageList, message, 'messageId')
  ) {
    return
  }

  // 存储阅后即焚消息
  if (message.isReadDel && parseInt(message.fromUserId) !== meId) {
    let burningAfterDeleteMsg = JSON.parse(JSON.stringify(message))
    const burningAfterDelete = getItem('BurningAfterDelete') || {}
    burningAfterDeleteMsg = Xmpp.decryptMessage(burningAfterDeleteMsg)
    burningAfterDeleteMsg = Xmpp.formatChatMessage(burningAfterDeleteMsg)
    if (burningAfterDelete[message.fromUserId]) {
      if (burningAfterDelete[message.fromUserId].messageList) {
        burningAfterDelete[message.fromUserId].messageList.push(burningAfterDeleteMsg)
      } else {
        burningAfterDelete[message.fromUserId].messageList = [burningAfterDeleteMsg]
      }
    } else {
      burningAfterDelete[message.fromUserId] = {
        isOpen: false,
        messageList: [burningAfterDeleteMsg]
      }
    }
    mutations.SET_BURNING_AFTER_DELETE(burningAfterDelete)
    setItem('BurningAfterDelete', burningAfterDelete)
  }

  // 不处理退群消息
  if (
    removeRoomList.indexOf(message.objectId || message.roomJid || message.toUserId) !== -1 &&
    message.type !== MessageType.NEW_MEMBER &&
    message.toUserId !== meId
  ){
    return
  }

  // 移交群主
  if(message.type === 925 && message.chatType === 1){
    return
  }
  // app端登录的账号-读取消息
  console.log(message,'app端登录的账号-读取消息')
  actions.SetNewMailMessage(message)

  if(message.type == 10086 && message.toUserId == imId){
    console.log(message,'app端登录的账号-读取消息 - 进入')
    let content = JSON.parse(message.content)
    if(content.seeEquipment == 'pc'){
      newMessageNumber.deleteId(content.seeMessageUserId) // 清除新消息
      notShownMessage.deleteJid(content.seeMessageUserId) // 删除收到但为显示的消息
    }else{
      return
    }
  }
  
  // 消息分发
  if (parseInt(message.type / 100) === 9 || message.type === 401 || message.type === 402) {
    // 群消息
    console.log('------------- 消息分发')
    handleGroupControlMessage(message)
  } else if (message.type > 99 && message.type < 130) {
    // 语音或视频消息
    console.log('------------- 语音或视频消息')
  } else if (parseInt(message.type / 100) === 5) {
    // 新朋友消息
    console.log('------------- 新朋友消息')
    handleNewFriendsMessage(message)
  } else if (message.type === MessageType.READ) {
    console.log('------------- 已读回执 handleNewFriendsMessage', message)
    // 已读回执
    handleReadMessage(message)
  } else if (message.type === MessageType.INPUT) {
    // 正在输入
    console.log('------------- 正在输入')
    console.log('正在输入')
  } else if (message.type === MessageType.REVOKE) {
    // 撤销消息
    console.log('------------- 撤销消息')
    handleRetractMessage(message)
  } else if (
    message.type === 1 ||
    message.type === 2 ||
    message.type === 3 ||
    message.type === 4 ||
    message.type === 5 ||
    message.type === 6 ||
    message.type === 8 ||
    message.type === 9 ||
    message.type === 11 ||
    message.type === 12
  ) {
    // 普通消息（type: 1 -> 普通消息， 2 -> 图片消息，3 -> 语音消息，4 -> 位置消息，6 -> 视频消息，9 -> 文件消息，8 -> 名片消息）
    console.log('------------- 普通消息（type')
    handleOrdinaryMessage(message)
  } else if (message.type === MessageType._800) {
    // 其他端更改密码(需重新登录来同步密码)
    console.log('------------- 其他端更改密码')
    handleSyncLoginPassword(message)
  } else if(message.type === 802){
    console.log('------------- 置顶||取消置顶消息')
    // App.$store.dispatch('Im/Information/GetTigaseDialog', { type: 'xmpp',userId: imId})
  } else {
    console.log('------------- 未分发的消息')
    console.log('未分发的消息:', message.type)
  }
}

// 登录冲突
export const handlerLoginConflict = () => {
  // App.$vux.toast.show({ text: '你的账户在其他地方登录，被挤下线！', type: 'text' })
  console.log('你的账户在其他地方登录，被挤下线！')
  App.$message.error('你的账户在其他地方登录，被挤下线！')
  WEBIM.disconnect()
  // logout()
}

export default { receiveMessage, handlerLoginConflict }

// 处理普通消息
function handleOrdinaryMessage(message) {
  console.log('处理普通消息-------------------', message)
  message = Xmpp.decryptMessage(message)
  const meId = getItem('MeId')
  console.log('处理普通消息 - Xmpp.decryptMessage', message,window.IMRouterParams)
  // 保存收到但未显示的消息 
  if (message.fromUserId !== window.IMRouterParams.jid) {
    // 当前消息不是当前聊天室的消息
    notShownMessage.add({ message, jid: message.fromUserId })
  }

  // 群聊或者单聊ID
  let id = ''
  if (message.chatType === 1) {
    id = message.fromUserId
    message.isRoom = 0
  } else if (message.chatType === 2) {
    id = message.toUserId
    message.isRoom = 1
    message.jid = id
  }

  // 格式化聊天列表的最后一条消息内容
  const lastMessage = Xmpp.formatLastChatMessage(JSON.parse(JSON.stringify(message)))
  lastMessage.jid = id
  // 设置最后一条消息
  if (!(message.isReadDel && parseInt(message.fromUserId) !== meId)) {
    // 阅后即焚消息不设置
    lastChatList.setLastChat({ message: lastMessage, chatType: message.chatType })
  }

  // 是否是当前聊天室信息
  let isWindow = false
  let routerFullPath = window.localStorage.getItem('routerFullPath')
  if (window.IMRouterParams.type === 'room') {
    isWindow = window.IMRouterParams.jid === id && routerFullPath == '/message/index'
  } else if (window.IMRouterParams.type === 'friend') {
    isWindow = window.IMRouterParams.id && id && parseInt(window.IMRouterParams.id) === parseInt(id) && routerFullPath == '/message/index'
  }

  if (isWindow) {
    // 该消息为当前聊天窗口消息
    actions.AddMessageList(message)
    return
  }

  if (parseInt(message.fromUserId) === meId) {
    // 自己发的消息设置未读数量
    return
  }

  // 新消息总数量
  let newMessageNumberSum = getItem('newMessageNumberSum')
  newMessageNumberSum ? newMessageNumberSum++ : (newMessageNumberSum = 1)
  actions.SetNewMessageNumberSum(newMessageNumberSum)
  setItem('newMessageNumberSum', newMessageNumberSum)


  // 新消息数量列表
  const newMessageNumberList = getItem('newMessageNumberList') || {}
  if (JSON.stringify(newMessageNumberList) !== '{}') {
    let isNumber = false // 是否有值，没有则初始化
    for (let key in newMessageNumberList) {
      if (key === id) {
        ++newMessageNumberList[key]
        isNumber = true
        break
      }
    }
    if (!isNumber) newMessageNumberList[id] = 1
  } else newMessageNumberList[id] = 1
  actions.SetNewMessageNumberList(newMessageNumberList)
  setItem('newMessageNumberList', newMessageNumberList)
}

// 处理新朋友消息
async function handleNewFriendsMessage(message) {
  message = Xmpp.decryptMessage(message)
  const meId = getItem('MeId')
  let id
  if (parseInt(message.fromUserId) === meId) {
    id = message.toUserId
  } else {
    id = message.fromUserId
  }
  if (message.type === MessageType.BLACK) {
    // 拉黑消息
    // 维护好友列表
    ousinessPperations.delFriend({ friendId: parseInt(message.fromUserId) })
    // 是否是当前聊天室信息
    let isWindow = false
    if (window.IMRouterParams.type === 'friend') {
      isWindow = window.IMRouterParams.id && id && parseInt(window.IMRouterParams.id) === parseInt(id)
    }
    if (isWindow && isIMPage()) {
      // await App.$router.replace(messageRouterName)
      resetIMRouter()
      App.$message.info('您以被对方拉黑')
    }
  } else if (message.type === MessageType.REFUSED) {
    const friend = JSON.parse(JSON.stringify(message))
    if (friend.toUserId === meId + '') {
      // 置换
      const { toUserId, toUserName } = friend
      friend.toUserId = friend.fromUserId
      friend.toUserName = friend.fromUserName
      friend.toNickname = friend.fromUserName
      friend.fromUserId = toUserId
      friend.fromUserName = toUserName
    }
    ousinessPperations.addFriend({ message, friend }) // 新增好友
  } else if (message.type === MessageType.DELALL) {
    // 被删除好友
    ousinessPperations.delFriend({ friendId: parseInt(message.fromUserId) })
    // 是否是当前聊天室信息
    let isWindow = false
    if (window.IMRouterParams.type === 'friend') {
      isWindow = window.IMRouterParams.id && id && parseInt(window.IMRouterParams.id) === parseInt(id)
    }
    if (isWindow && isIMPage()) {
      // await App.$router.replace(messageRouterName)
      resetIMRouter()
      App.$message.info('您以被对方删除')
    }
  } else if (message.type === MessageType.FRIEND || message.type === MessageType.PASS) {
    // 添加好友消息，要手动添加好友到firends
    const friend = JSON.parse(JSON.stringify(message))
    if (friend.toUserId === meId + '') {
      // 置换
      const { toUserId, toUserName } = friend
      friend.toUserId = friend.fromUserId
      friend.toUserName = friend.fromUserName
      friend.toNickname = friend.fromUserName
      friend.fromUserId = toUserId
      friend.fromUserName = toUserName
    }
    ousinessPperations.addFriend({ message, friend }) // 新增好友
  } else if (message.type === MessageType.FEEDBACK) {
    // 回复消息
    if (App.$route.name === 'new-friend') {
      actions.GetNewFriendLast({ toUserId: message.fromUserId })
      return
    }
  }

  // 维护新朋友消息列表
  let newFriendList = JSON.parse(JSON.stringify(App.$store.state.Im.Friends.NewFriendList)) || []
  let isValuable = false
  for (let i = 0; i < newFriendList.length; i++) {
    if (newFriendList[i].toUserId === parseInt(id)) {
      newFriendList[i].content = message.content
      newFriendList[i].from = parseInt(message.fromUserId)
      newFriendList[i].type = message.type
      isValuable = true
    }
  }

  if (App.$route.name === 'user-info') {
    //当前窗口在用户信息，则重新获取数据
    await actions.GetUserInfo({ userId: window.IMRouterParams.id })
  }

  if (!isValuable) {
    // 列表本来没有的新消息需要手动添加
    const newMsg = {
      content: message.content,
      from: parseInt(message.fromUserId),
      toNickname: message.fromUserName,
      toUserId: parseInt(message.fromUserId),
      type: message.type,
      userId: parseInt(message.toUserId),
      createTime: message.timeSend,
      direction: 1
    }
    newFriendList = [newMsg].concat(newFriendList)
  }

  // 有变化则更改
  if (!Tools.isObjectValueEqual(App.$store.state.Im.Friends.NewFriendList, newFriendList)) {
    mutations.RESET_NEW_FRIEND_LIST(newFriendList)
  }
  // 在当前窗口则不添加未读消息
  if (App.$route.name === 'new-friend') return
  // 自己发送的消息不处理
  if (parseInt(message.fromUserId) === meId) return

  // 设置消息数量
  id = message.toUserId
  // 新朋友消息数量列表
  let existed = false
  let newFriendMessageNumberList = getItem('newFriendMessageList') || []
  if (JSON.stringify(newFriendMessageNumberList) !== '[]') {
    for (let i = 0; i < newFriendMessageNumberList.length; i++) {
      if (newFriendMessageNumberList[i] === id) {
        // 列表已存在不添加
        existed = true
        break
      }
    }
  }
  // 不存在则添加
  if (!existed) {
    newFriendMessageNumberList.push(id)
    setItem('newFriendMessageList', newFriendMessageNumberList)
  }

  // // 新消息总数量
  let newMessageNumberSum = getItem('newMessageNumberSum')
  newMessageNumberSum ? newMessageNumberSum++ : (newMessageNumberSum = 1)
  actions.SetNewMessageNumberSum(newMessageNumberSum)
  setItem('newMessageNumberSum', newMessageNumberSum)

  id = 'newFriendList'

  // 新消息数量列表
  const newMessageNumberList = getItem('newMessageNumberList') || {}
  if (JSON.stringify(newMessageNumberList) !== '{}') {
    let isNumber = false // 是否有值，没有则初始化
    for (let key in newMessageNumberList) {
      if (key === id) {
        ++newMessageNumberList[key]
        isNumber = true
        break
      }
    }
    if (!isNumber) newMessageNumberList[id] = 1
  } else newMessageNumberList[id] = 1
  actions.SetNewMessageNumberList(newMessageNumberList)
  setItem('newMessageNumberList', newMessageNumberList)
}

// 处理群消息
async function handleGroupControlMessage(message) {
  console.log('处理群消息 ---------- ', message)
  message = Xmpp.decryptMessage(message)
  // 是否是当前聊天室信息
  let isWindow, id
  const meId = App.$store.state.Common.User.MeId + ''
  // 特殊信息处理
  console.log('MessageType ---------- ', MessageType)
  if (message.type === MessageType.DELETE_MEMBER) {
    /*
    * 用户不在线的时候，别人拉群，然后把你删除，会导致报错
    * message.chatType  1-单聊 2-群聊
    */
    // if (message.toUserId + '' === meId + '' && message.chatType === 2) {
    //   // 自己退群在type为chat时处理，群发所有成员的消息不处理
    //   return
    // }

    // 退群消息处理
    if (message.toUserId === meId) {
      // 被踢出群
      if (message.fromUserId !== meId) {
        console.log('window.IMRouterParams.jid ---------- ', window.IMRouterParams.jid)
        isWindow = window.IMRouterParams.jid === message.objectId
        if (isWindow && isIMPage()) {
          // TODO:
          // 当前聊天室的消息
          // await App.$router.replace(messageRouterName)
          resetIMRouter()
        } else {
          // 不是当前聊天室的消息
          actions.GetLastChatList()
        }
        if(isIMPage()) {
          App.$message.info('您已被移出聊天群')
        }
      }

      // 添加到退出群组列表
      if (removeRoomList.indexOf(message.objectId) === -1) {
        removeRoomList.push(message.objectId)
      }

      // 删除本地数据
      ousinessPperations.exitChatGroup({ roomId: message.objectId })
      return
    }
  } else if (message.type === MessageType.NEW_MEMBER) {
    console.log(907)
    // 自己被邀请进群
    if (message.toUserId + '' === meId + '' && message.chatType === 2) {
      // 自己加群在type为chat时处理，群发所有成员的消息不处理
      return
    }

    // 格式化数据
    message.chatType = 'groupchat'
    message.name = message.content
    message.roomJid = message.objectId
    message.jid = message.objectId
    message.id = message.fileName

    // 维护退出群组列表
    if (removeRoomList.indexOf(message.objectId) !== -1) {
      for (let i = 0; i < removeRoomList.length; i++) {
        if (removeRoomList[i] === message.objectId) {
          removeRoomList.splice(i, 1)
        }
      }
    }

    ousinessPperations.joinChatGroup(message) // 添加本地存储
    return
  } else if (message.type === MessageType.DELETE_ROOM) {
    // 处理删除聊天群消息
    handleDeleteRoomMessage(message)
    return
  } else if (message.type === MessageType.CHANGE_ROOM_NAME) {
    // 更改群名字消息
    // 同步本地的群名字
    let roomList = groupList.get()
    for (let i = 0; i < roomList.length; i++) {
      if (roomList[i].jid === message.objectId) {
        roomList[i].name = message.content
      }
    }
    groupList.set(roomList)
  } else if (message.type === MessageType.GAG) {
    // 禁言单个人
    // 禁言单人，被禁言的那个人会收到两条消息（chatType属性一个是1，一个是2），未被禁言的会收到chatType为2的消息
    // 所以被禁言的人需要过滤chatType为1的消息，不然会显示收到两条消息
    if (message.chatType === 1) {
      return
    }
  }

  // 设置最后一条消息
  let copyMsg = JSON.parse(JSON.stringify(message))
  // 格式化聊天列表的消息内容
  copyMsg.jid = copyMsg.objectId
  copyMsg.isRoom = copyMsg.chatType === 2
  copyMsg.toNickName = copyMsg.name
  copyMsg = Xmpp.formatLastChatMessage(copyMsg)
  lastChatList.setLastChat({ message: copyMsg, chatType: copyMsg.chatType })

  // 通用信息处理
  id = message.roomJid || message.objectId || message.from
  isWindow = window.IMRouterParams.jid === id
  // [在IM路由页面]
  let routerFullPath = window.localStorage.getItem('routerFullPath')
  if (isWindow && routerFullPath=='/message/index') {
    // 该消息为当前聊天窗口消息
    actions.AddMessageList(message)
    // 重新获取群信息
    actions.GetRoomInfo({ roomId: window.IMRouterParams.id })
    return
  }

  if (parseInt(message.fromUserId) === meId) {
    // 自己发的消息设置未读数量
    return
  }

  // 新消息总数量
  let newMessageNumberSum = getItem('newMessageNumberSum')
  newMessageNumberSum ? newMessageNumberSum++ : (newMessageNumberSum = 1)
  actions.SetNewMessageNumberSum(newMessageNumberSum)
  setItem('newMessageNumberSum', newMessageNumberSum)

  // 新消息数量列表
  const newMessageNumberList = getItem('newMessageNumberList') || {}
  if (JSON.stringify(newMessageNumberList) !== '{}') {
    let isNumber = false // 是否有值，没有则初始化
    for (let key in newMessageNumberList) {
      if (key === id) {
        ++newMessageNumberList[key]
        isNumber = true
        break
      }
    }
    if (!isNumber) newMessageNumberList[id] = 1
  } else newMessageNumberList[id] = 1
  actions.SetNewMessageNumberList(newMessageNumberList)
  setItem('newMessageNumberList', newMessageNumberList)
}

// 处理已读
function handleReadMessage(message) {
  console.log('处理已读', message)
  // 设置已读的阅后即焚消息
  const params = [
    message.fromUserId, // id
    message.content, // 消息ID
    'set', // 设置类型为：设置
    {
      // 参数
      type: 10001, // 将消息更新为系统消息
      content: '对方查看了您的阅后即焚消息' // 更改消息体内容
    }
  ]
  burningAfterDelete.setRead(...params)

  message = Xmpp.decryptMessage(message)
  actions.SetReadMessage(message)
}

// 多点登录修改自己相关设置处理
function handleSyncLoginPassword(message) {
  if (message.objectId === MessageObject.SYNC_LOGIN_PASSWORD && !message.delay === 'offline') {
    // 其他端修改密码
    // App.$vux.confirm.show({
    //   title: '提示',
    //   content: '你的账号在其他端更改密码,请重新登录',
    //   showCancelButton: false,
    //   dialogTransition: 'vux-fade',
    //   confirmText: '好的',
    //   onConfirm() {
    //     logout()
    //   }
    // })
    // TODO:
    App.$message.error(`你的账号在其他端更改密码,请重新登录`)
  }
}

// 处理撤销消息 202
function handleRetractMessage(message) {
  console.log('formatLastChatMessage8-------------------', message)
  message = Xmpp.decryptMessage(message)

  // 群聊或者单聊ID
  let id = ''
  if (message.chatType === 1) {
    id = message.fromUserId
    message.isRoom = 0
  } else if (message.chatType === 2) {
    id = message.toUserId
    message.isRoom = 1
    message.jid = id
  }

  // 设置最后一条消息
  let copyMsg = JSON.parse(JSON.stringify(message))
  copyMsg.jid = copyMsg.toUserId
  copyMsg.isRoom = copyMsg.chatType === 2
  copyMsg = Xmpp.formatLastChatMessage(copyMsg)
  lastChatList.setLastChat({ message: copyMsg, chatType: copyMsg.chatType })
  // 设置聊天消息列表
  let msg

  // 从消息列表获取要撤回的消息
  const chatRoom = App.$store.state.Im.Chat.ChatRoomInfo[id] || {} // 聊天室信息
  const messageList = chatRoom.messageList || [] // 消息列表（接口消息列表）

  for (let i = 0; i < messageList.length; i++) {
    if (messageList[i].messageId === message.content) {
      msg = JSON.parse(JSON.stringify(messageList[i]))
      break
    }
  }

  // 消息列表没有撤回的源消息，则从收到但为显示的消息中获取
  if (!msg) {
    const messageList = notShownMessage.get()[message.fromUserId] || []
    for (let i = 0; i < messageList.length; i++) {
      if (messageList[i].messageId === message.content) {
        msg = JSON.parse(JSON.stringify(messageList[i]))
        break
      }
    }
  }

  // 如果两个消息列表都没有撤回源消息，则跳出
  if (!msg) return

  msg.type = 202
  msg.content = `${message.fromUserName} 撤回了一条消息`
  delete msg.oldContent
  // 单聊需要存储本地
  if (message.chatType === 1) {
    // 保存本地撤回消息
    ousinessPperations.retractMessage({ message: msg, userId: id, chatType: message.chatType })
  } else {
    // 群聊则不需要存本地，因为群聊接口有撤回数据
    // 如果当前窗口为chat（聊天室），则需要手动更新，将撤回消息添加到vuex中的messageList即可
    if (window.IMRouterParams ) {
      const roomJid = window.IMRouterParams.jid
      const isCurRoom = roomJid === msg.jid || roomJid === msg.toUserId
      if (roomJid && isCurRoom)
        actions.AddMessageList(msg)
    }
  }
  // 设置vuex撤回消息列表
  mutations.DELETE_MESSAGE_LIST(msg.messageId)
}

// 删除聊天群 903
function handleDeleteRoomMessage(message) {
  const meId = App.$store.state.Common.User.MeId + ''
  if (message.fromUserId !== meId && isIMPage()) {
    // TODO:
    console.log('解散了聊天群===>', message)
    App.$message.info(`${message.fromUserName}解散了群${message.content}`)
  }
  // 添加到退出群组列表
  if (removeRoomList.indexOf(message.objectId) === -1) {
    removeRoomList.push(message.objectId)
  }

  // 删除本地数据
  ousinessPperations.exitChatGroup({ roomId: message.objectId })

  // 当前在聊天室，收到该消息则需要跳到首页
  if (message.objectId === window.IMRouterParams.jid && parseInt(message.fromUserId) !== meId) {
    // 当前聊天室的消息
    // App.$router.replace(messageRouterName)
    resetIMRouter()
  }
}
