// 处理发送消息信息
import App from '@/main'
import Xmpp from '@/utils/imUtil/xmpp'
import WEBIM from './webim-reset'
import sentReadMessageList from '@/storage/sent-read-message-list'
import lastChatList from '@/storage/last-chat-list'
import { getItem, setItem } from '@/utils/imUtil/storage'
import { MessageType } from './message-type'
import { messageCheckingParam } from '@/module/login_reinforce/resource/apiAuthUtils'
import { Type } from '@/module'

const state = {
  // 消息前缀
  sendTimeOut: 15, // 消息超时 时间 默认 15 秒
  waitReceiptMessageIds: {} // 等待消息回执的 消息Id 数组
}

const mutations = {
  // 设置阅后即焚消息列表
  SET_BURNING_AFTER_DELETE (burningAfterDelete) {
    App.$store.commit('Im/Chat/SET_BURNING_AFTER_DELETE', burningAfterDelete)
  }
}

export const sendMessage = (params) => {
  const msg = createMessage(params)
  console.log('createMessage -- params', params, msg)
  // 特殊消息额外要带的属性
  if (msg.type === App.$msgType.FILE || msg.type === App.$msgType.IMAGE) {
    // 文件消息或图片消息
    msg.fileName = params.fileName
    msg.fileSize = params.fileSize
    msg.fileTime = params.fileType

    // 图片添加宽高
    if (msg.type === App.$msgType.IMAGE) {
      msg.location_x = params.width
      msg.location_y = params.height
      msg.locationX = params.width
      msg.locationY = params.height
    }
  } else if (msg.type === App.$msgType.VOICE) {
    // 语音消息
    msg.fileTime = params.timeLen
  } else if (msg.type === App.$msgType.LOCATION) {
    // 地址消息
    msg.objectId = params.address
    msg.location_x = params.lat
    msg.location_y = params.lng
    msg.locationX = params.lat
    msg.locationY = params.lng
  } else if (msg.type === App.$msgType.CARD) {
    // 名片消息
    msg.objectId = params.id.toString()
  }

  if (msg.type === App.$msgType.TEXT || msg.type ===  App.$msgType.IMAGE || msg.type === App.$msgType.VOICE || msg.type === App.$msgType.VIDEO) {
    let rsMsg = JSON.parse(JSON.stringify(msg))
    // 判断是否是阅后即焚消息
    const burningAfterDelete = getItem('BurningAfterDelete') || {}
    if (burningAfterDelete[msg.toUserId] && burningAfterDelete[msg.toUserId]['isOpen']) {
      msg.isReadDel = true
      rsMsg.isReadDel = true
      rsMsg = App.$utils.Xmpp.decryptMessage(rsMsg)
      rsMsg = App.$utils.Xmpp.formatChatMessage(rsMsg)
      if (burningAfterDelete[msg.toUserId].messageList) {
        burningAfterDelete[msg.toUserId].messageList.push(rsMsg)
      } else {
        burningAfterDelete[msg.toUserId].messageList = [rsMsg]
      }
      mutations.SET_BURNING_AFTER_DELETE(burningAfterDelete)
      setItem('BurningAfterDelete', burningAfterDelete)
    }
  }
  console.log("即将发送的消息 ---------------------- sendMessage", msg)

  WEBIM.sendMessage(msg)
  return msg
}

// 发送已读消息回执
export const sendReadMessageReceipt = (to, message, chatType) => {
  // 过滤已发送已读消息
  if (sentReadMessageList.set(to, message.messageId)) return
  const createParams = {
    msgType: App.$msgType.READ,
    content: message.messageId,
    toId: to,
    toName: message.fromUserName,
    chatType: chatType
  }
  const msg = createMessage(createParams)
  msg.reSendCount = 3 // 重发次数
  // 创建发送已读消息
  WEBIM.sendMessage(msg)
  return msg
}

// 等待服务器消息回执
export const waitMessageReceipt = (message) => {
  state.waitReceiptMessageIds[message.messageId] = 1
  setTimeout(() => {
    // 消息发送失败， 没有收到回执
    if (state.waitReceiptMessageIds[message.messageId] && message.reSendCount > 0) {
      message.reSendCount--
      console.log('消息发送失败， 没有收到回执',message);
      sendMessageTimeOut(message)
    }
  }, state.sendTimeOut * 1000)
}

// 收到消息回执
export const handlerMsgReceipt = (messageId) => {
  delete state.waitReceiptMessageIds[messageId]
}

export default { sendMessage, waitMessageReceipt, handlerMsgReceipt }

// 构建一条消息
function createMessage(params) {
  const meInfo = getItem('MeInfo')
  const msg = {
    messageId: Xmpp.randomUUID(meInfo.userId),
    fromUserId: meInfo.userId.toString(),
    fromUserName: meInfo.nickname,
    to: params.toId.toString(),
    chatType: params.chatType,
    toUserId: params.toId.toString(),
    toNickName: params.toName,
    toUserName: params.toName,
    content: params.content,
    timeSend: Xmpp.getServerTime(),
    type: params.msgType,
    userAvatar: App.$store.state.user.headAvatar,
  }

  /**
    需要序列号 1-9、26、28、29、40、41、80、81、82、84、85、87
  **/
  if(9>=msg.type || msg.type == 26 || msg.type == 28 || msg.type == 29 ||
    msg.type == 40 || msg.type == 41 || msg.type == 80 || msg.type == 81 ||
    msg.type == 82 || msg.type == 84 || msg.type == 85 || msg.type == 87  ){
      msg.seqNo = -1;
    }

  // 消息验参（登陆加固模块才会执行）
  if (Type.login === 'Reinforce') {
    const messageKey = getItem('MessageKey')
    msg.mac = messageCheckingParam(msg, messageKey)
  }

  // 是否加密消息（根据用户设置来定）
  if (params.encryptType) {
    // 某些消息不需要加密
    if (msg.type !== 915 && parseInt(msg.type / 100) !== 5) {
      msg.isEncrypt = true
      msg.encryptType = params.encryptType // 添加消息加密标识
      if (params.encryptType === App.$constant.MESSAGE_ENCRYPT_TYPE._3DES) {
        // 消息3DES加密
        msg.content = Xmpp.encryptMessage(msg)
      }
    }
  }
  return msg
}

function sendMessageTimeOut (message) {
  console.log(`发送失败id: `, message)

  // WEBIM.sendMessage(message)
}
