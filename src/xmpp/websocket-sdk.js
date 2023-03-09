import proto from './proto/proto'
import store from '@/store'
import md5 from 'blueimp-md5'
import { getItem } from '@/utils/imUtil/storage'

var SKIMSDK = {
  cont: 'skimweb_',
  version: 3,
  licMac: 0,
  websocket: null,
  serverUrl: null,
  userIdStr: null,
  token: null,
  logincallBack: null, // 登陆成功的回调
  messageReceiver: null, // 收到消息的回调
  handlerMsgReceipt: null, // 消息回执 处理方法
  handlerLoginConflict: null,
  Connecting: null, // 正在连接回调
  ConnectionSucceeded: null, // 连接成功回调
  Disconnect: null, // 连接成功回调

  /*心跳间隔时间*/
  pingTime: undefined,
  /*最后一次传递消息的时间*/
  lastTransferTime: 0,
  waitSendReceiptIds: '',

  server: '',
  resource: '',
  appKey: '',
  appKey5: '',
  appName: '',
  appName5: '',
  companyName: '',
  companyName5: '',

  initApi(url, userId, resource, token, pingTime, server, appKey, appName, companyName) {
    SKIMSDK.token = token
    SKIMSDK.serverUrl = url
    SKIMSDK.server = server
    SKIMSDK.resource = resource
    SKIMSDK.userIdStr = userId + '/' + resource
    SKIMSDK.pingTime = pingTime
    SKIMSDK.appKey = appKey
    SKIMSDK.appKey5 = md5(appKey)
    SKIMSDK.appName = appName
    SKIMSDK.appName5 = md5(appName)
    SKIMSDK.companyName = companyName
    SKIMSDK.companyName5 = md5(companyName)
    /*SKIMSDK.messageReceiver=messageReceiver;
        SKIMSDK.handlerMsgReceipt=handlerMsgReceipt;
        SKIMSDK.handlerLoginConflict=handlerLoginConflict;*/
  },
  loginIM: function(callback) {
    console.log( '----  navigator.onLine 网络状态 ',navigator.onLine)
    if(!navigator.onLine){
      return
    }
    try {
      if (callback) SKIMSDK.logincallBack = callback
      SKIMSDK.websocket = new WebSocket(SKIMSDK.serverUrl)
      SKIMSDK.websocket.onopen = SKIMSDK.onopen
      SKIMSDK.websocket.onmessage = SKIMSDK.onmessage
      SKIMSDK.websocket.onerror = SKIMSDK.onerror
      SKIMSDK.websocket.onclose = SKIMSDK.onclose
      SKIMSDK.websocket.binaryType = 'arraybuffer'
      SKIMSDK.onConnect()
    } catch (e) {
      console.log(e.message)
    }
  },

  // 连接状态
  onConnect() {
    console.log('========= onConnect-连接状态 ===========',SKIMSDK.websocket, SKIMSDK)
    // xmpp 连接状态
    // CONNECTING(0)：表示正在连接
    // OPEN(1)：表示连接成功，可以通信了
    // CLOSING(2)：表示连接正在关闭
    // CLOSED(3)：表示连接已经关闭，或者打开连接失败
    switch (SKIMSDK.websocket.readyState) {
      case SKIMSDK.websocket.CONNECTING:
        SKIMSDK.Connecting && SKIMSDK.Connecting()
        break
      case SKIMSDK.websocket.OPEN:
        SKIMSDK.ConnectionSucceeded && SKIMSDK.ConnectionSucceeded()
        break
      case SKIMSDK.websocket.CLOSING:
        console.log('CLOSING')
        break
      case SKIMSDK.websocket.CLOSED:
        SKIMSDK.Disconnect && SKIMSDK.Disconnect()
        break
    }
  },
  loginSuccess: function(message) {
    SKIMSDK.logincallBack && SKIMSDK.logincallBack() // 回调
    console.log('======================== IM Socket loginSuccess ========================')
    if (SKIMSDK.userIdStr == message.from) {
      console.log('============ IM Socket pong ============')
      // 版本号判断
      const isVersion = message.version == SKIMSDK.version
      if (!isVersion) {
        SKIMSDK.Disconnect()
        return
      }
      console.log('============ IM Socket 版本号判断 ============')
      clearInterval(SKIMSDK.ping)
      //XmppSdk.ping=null
      SKIMSDK.pingTime = SKIMSDK.pingTime * 1000
      SKIMSDK.licMac = Math.abs(Number(message.mcode) + (getHashCode(SKIMSDK.companyName5) & 0xfffff))

      SKIMSDK.ping = window.setInterval(function() {
        console.log("=============IMsocket心跳包 - pong 30秒=============")
        SKIMSDK.sendPing()
      }, SKIMSDK.pingTime)

    } else {
      /*其他设备登陆*/
    }
  },
  onopen: function(e) {
    console.log('========= onopen ===========', SKIMSDK.websocket)

    SKIMSDK.onConnect()
    SKIMSDK.licMac = 0
    let deviceId = window.localStorage.getItem('DeviceId')
    console.log('========= deviceId ===========', deviceId)
    if (!deviceId) {
      deviceId = SKIMSDK.randomDeviceId()
      window.localStorage.setItem('DeviceId', deviceId)
    }
    var message = SKIMSDK.buildAuthMessage(deviceId)
    var buffer = SKIMSDK.encodeMessage(message, Command.COMMAND_AUTH_REQ)
    // store.dispatch('WSINIT')

    SKIMSDK.sendBytes(buffer)
  },
  /*收到服务器消息*/
  onmessage: async function(e) {
    console.log('收到消息websocket---【步骤001】 e', e)
    var dataArr = new Uint8Array(e.data)
    // var cmd = dataArr[0]
    // if (cmd > 127) { cmd = cmd - 256 }
    // SKIMSDK.lastTransferTime = SKIMSDK.getCurrentSeconds()
    // var bytes = dataArr.subarray(1, dataArr.length)
    // var message = SKIMSDK.decodeMessage(bytes, cmd)
    /*var dataStr=JSON.stringify(message);*/

    await store.dispatch('Im/Friends/GetFriendsList', { type: 'login' })

    var cmd = (dataArr[0] & 0xff) + ((dataArr[1] & 0xff) << 8)
    SKIMSDK.lastTransferTime = SKIMSDK.getCurrentSeconds()
    var bytes = dataArr.subarray(2, dataArr.length)
    var { message, computedCmd } = SKIMSDK.decodeMessage(bytes, cmd)
    console.log('收到消息websocket---【步骤002】 message', message)
    if (message) {
      message = SKIMSDK.convertToClientMsg(message)
      SKIMSDK.handlerMessageBycmd(computedCmd, message)
    }
  },
  disconnect: function(e) {
    clearInterval(SKIMSDK.ping)
    SKIMSDK.websocket.close()
    console.warn("socket 断开连接 - 003")
  },
  isConnect: function() {
    if (!SKIMSDK.websocket) return false
    return 1 == SKIMSDK.websocket.readyState
  },
  sendPing: function() {
    if (!SKIMSDK.isConnect()) return
    /*var currTime=SKIMSDK.getCurrentSeconds();
        if((currTime-SKIMSDK.pingTime)<SKIMSDK.lastTransferTime){
            //最后通讯时间相近 不需要发送心跳包
            //console.log("最后通讯时间相近 不需要发送心跳包");
            return ;
        }*/

    //console.log("发送心跳包");
    var message = SKIMSDK.buildPingMessage()
    var buffer = SKIMSDK.encodeMessage(message, Command.Ping_REQ)
    SKIMSDK.sendBytes(buffer)
  },
  onerror: function(e) {
    // SKIMSDK.ConnectionFailed('连接出错')
    console.log('socket 错误，执行重连')
    SKIMSDK.loginIM()
  },
  onclose: function(e) {
    console.log('onclosed ====> 关闭', e)
    SKIMSDK.onConnect && SKIMSDK.onConnect()
  },
  // 自定义去掉红点消息
  sendReadedToOtherSide: function(jid){
    let newObj = {
      seeMessageUserId: jid,
      seeEquipment: 'app'
    }
    let imId = getItem('MeId')
    let params = {
      type: 10086,
      body: JSON.stringify(newObj),
      toUserId: imId,
    }
    console.log('自定义去掉红点消息 ====> 自定义去掉红点消息')
    // this.ConsoleSystemMessage(params)
    store.dispatch('Im/Chat/ConsoleSystemMessage', params)
  },
  handlerMessageBycmd(cmd, message) {
    console.log('收到消息websocket---【步骤003】 ChatType，SKIMSDK', message, SKIMSDK)
    let content = ''
    /*发送客户端消息回执*/
    if (ChatType.CHAT == message.chatType && 85 < message.type && 94 > message.type) {
      return
    } else if (ChatType.GROUPCHAT == message.chatType && SKIMSDK.userIdStr == message.fromJid) {
      SKIMSDK.handlerMsgReceipt(message.messageId)
    }
    console.log(' handlerMessageBycmd cmd', cmd);
		console.log(' handlerMessageBycmd message', message);

    if( message.from == window.IMRouterParams.jid) { //  正在群里
      SKIMSDK.sendReadedToOtherSide(message.from)
    }

    switch (cmd) {
      case Command.COMMAND_CHAT:
        SKIMSDK.sendReceipt(message.messageId)
        SKIMSDK.messageReceiver(message)
        break
      case Command.SUCCESS:
        SKIMSDK.handlerMsgReceipt(message.messageId)
        break
      case Command.MESSAGE_RECEIPT:
        SKIMSDK.handlerMsgReceipt(message.messageId)
        break
      case Command.PULL_BATCH_GROUP_MESSAGE_RESP:
        SKIMSDK.handlerGroupMessageResult(message)
        break
      case Command.CHAT_OFF_MESSAGE_RESP:
        SKIMSDK.sendReceipt(message.messageId)
        SKIMSDK.messageReceiver(message)
        break
      case Command.PULL_MESSAGE_RECORD_RESP:
        SKIMSDK.handlerHistoryMessageResult(message)
        break
      case Command.COMMAND_AUTH_RESP:
        SKIMSDK.loginSuccess(message)
        break
      case Command.Login_Conflict:
        SKIMSDK.handlerLoginConflict()
        break

      default:
        //默认 其他
        content = ''
        break
    }
  },
  /* handlerMsgReceipt(message){

    },*/

  /*
    发送消息 api
    */
  sendMessage: function(msg, cmd) {
    if (!cmd) cmd = Command.COMMAND_CHAT
    var head = SKIMSDK.buildMessageHead(msg.to, msg.chatType)
    if (msg.messageId) head.messageId = msg.messageId
    msg.messageHead = head
    msg.sendUserAvatar = store.state.user.headAvatar
    //delete msg["to"];
    var buffer = SKIMSDK.encodeMessage(msg, cmd)
    SKIMSDK.sendBytes(buffer)
  },
  sendBytes: function(bytes) {
    if (!SKIMSDK.isConnect()) {
      console.log('断开 ---- 发送失败')
      return
      // sleep && sleep(1000)
    }else {
      // SKIMSDK.websocket.send({data: bytes})
      SKIMSDK.websocket.send(bytes)
    }
  },
  sendReceipt: function(messageId) {
    SKIMSDK.waitSendReceiptIds += messageId + ','
    if (!SKIMSDK.sendReceiptTask) {
      SKIMSDK.sendReceiptTask = window.setInterval(function() {
        if ('' == SKIMSDK.waitSendReceiptIds) return
        var receipt = SKIMSDK.buildReceiptMessage(SKIMSDK.waitSendReceiptIds, 1, SKIMSDK.server)
        var buffer = SKIMSDK.encodeMessage(receipt, Command.MESSAGE_RECEIPT)
        SKIMSDK.sendBytes(buffer)
        SKIMSDK.waitSendReceiptIds = ''
      }, 3000)
    }
  },
  /*转换为 客户端的 消息*/
  convertToClientMsg: function(msg) {
    if(!msg) return {}
    msg = JSON.parse(JSON.stringify(msg))
    var message = msg
    if (msg.messageHead) {
      if (ChatType.GROUPCHAT == msg.messageHead.chatType) {
        message.from = msg.messageHead.to
        message.to = SKIMSDK.userIdStr
        message.fromJid = msg.messageHead.from
      } else {
        message.from = msg.messageHead.from
        message.to = msg.messageHead.to
      }
      message.messageId = msg.messageHead.messageId
      message.chatType = msg.messageHead.chatType
      message.offline = msg.messageHead.offline
      message.timeLen = message.fileTime
      if (message.locationX) {
        message.location_x = message.locationX
        delete message['locationX']
      }
      if (message.locationY) {
        message.location_y = message.locationY
        delete message['locationY']
      }

      delete message['messageHead']
      delete message['fileTime']
    } else {
      message.messageId = msg.messageId
      message.chatType = msg.chatType
    }

    /* var dataStr=JSON.stringify(message);
        console.log("convertToClientMsg end  ===> "+dataStr);*/
    return message
  },
  buildChatMessage: function() {},
  /*创建消息头*/
  buildMessageHead: function(to, chatType) {
    var head = {
      from: SKIMSDK.userIdStr,
      messageId: SKIMSDK.randomUUID(),
      chatType: !chatType ? 0 : chatType,
      to: !to ? '' : to + ''
    }
    return head
  },
  buildAuthMessage: function(deviceId) {
    var head = SKIMSDK.buildMessageHead('server', ChatType.AUTH)
    const secret = md5(SKIMSDK.userIdStr + SKIMSDK.token + SKIMSDK.appKey5 + SKIMSDK.appName5 + SKIMSDK.companyName5)
    var message = {
      messageHead: head,
      token: SKIMSDK.token,
      deviceId: deviceId,
      version: SKIMSDK.version,
      apiKey: SKIMSDK.appKey5,
      appName: SKIMSDK.appName5,
      companyName: SKIMSDK.companyName5,
      secret
    }
    return message
  },
  buildPingMessage: function() {
    var head = SKIMSDK.buildMessageHead('server', ChatType.PING)
    var message = {
      messageHead: head
    }
    return message
  },
  buildReceiptMessage: function(messageId, chatType, to) {
    var head = SKIMSDK.buildMessageHead(to, chatType)
    var message = {
      messageHead: head,
      messageId: messageId,
      status: 2
    }
    return message
  },
  /*加入群组*/
  joinGroupChat(jid, seconds) {
    var head = SKIMSDK.buildMessageHead('server', ChatType.CHAT)
    var message = {
      messageHead: head,
      jid: jid,
      seconds: seconds
    }
    var buffer = SKIMSDK.encodeMessage(message, Command.JOINGROUP_REQ)
    SKIMSDK.sendBytes(buffer)
  },
  exitGroupChat(jid) {
    var head = SKIMSDK.buildMessageHead('server', ChatType.CHAT)
    var message = {
      messageHead: head,
      jid: jid
    }
    var buffer = SKIMSDK.encodeMessage(message, Command.EXITGROUP_REQ)
    SKIMSDK.sendBytes(buffer)
  },
  /*批量请求 群组消息数量*/
  pullBatchGroupMessage: function(jidList) {
    var head = SKIMSDK.buildMessageHead('server', ChatType.CHAT)
    var message = {
      messageHead: head,
      jidList: jidList,
      endTime: SKIMSDK.getCurrentSeconds()
    }
    var buffer = SKIMSDK.encodeMessage(message, Command.PULL_BATCH_GROUP_MESSAGE_REQ)
    SKIMSDK.sendBytes(buffer)
  },
  /*请求漫游聊天记录*/
  pullHistoryMessage: function(chatType, jid, size, startTime, endTime) {
    var head = SKIMSDK.buildMessageHead('server', chatType)
    var message = {
      messageHead: head,
      jid: jid,
      size: size,
      startTime: startTime,
      endTime: endTime
    }
    var buffer = SKIMSDK.encodeMessage(message, Command.PULL_MESSAGE_RECORD_REQ)
    SKIMSDK.sendBytes(buffer)
  },
  /*解码*/
  decodeMessage: function(buffer, cmd, messageType) {
    var message = null, computedCmd = null
    try {
      const key = buffer.length
      if (SKIMSDK.licMac) {
        computedCmd = cmd ^ (key * 3) ^ SKIMSDK.licMac & 0xffff
      } else {
        computedCmd = cmd ^ (key * 3) & 0xffff
      }
      console.log(computedCmd,'computedCmd  -  computedCmd')
      const messageType = SKIMSDK.getProtoMessageType(computedCmd)
      console.log(messageType,'messageType  -- messageType')
      message = messageType.decode(buffer)
    } catch (err) {
      console.log(err,'err --- err')
      // SKIMSDK.ConnectionFailed('连接失败')
    }
    return { message, computedCmd }
  },
  /*编码*/
  encodeMessage: function(jsonMsg, cmd, messageType) {
    if (null == messageType) {
      messageType = SKIMSDK.getProtoMessageType(cmd)
    }
    var errMsg = messageType.verify(jsonMsg)
    if (errMsg) {
      console.log(errMsg)
    }
    var message = messageType.create(jsonMsg)
    var buffer = messageType.encode(message).finish()
    var result = buffer
    if (cmd) {
      const key = buffer.length
      var bytes = new Uint8Array(key + 2)
      buffer.forEach((item, i) => bytes[i + 2] = item)
      if (SKIMSDK.licMac) {
        // 已登录情况
        const computedCmd = cmd ^ key ^ SKIMSDK.licMac & 0xffff
        bytes[0] = computedCmd & 0xff
        bytes[1] = (computedCmd >> 8) & 0xff
      } else {
        // 未登录情况
        const computedCmd = cmd ^ key & 0xffff
        bytes[0] = computedCmd & 0xff
        bytes[1] = (computedCmd >> 8) & 0xff
      }
      result = bytes
    }
    return result
  },
  /*根据 cmd 获取 proto 的编解码 MessageType */
  getProtoMessageType: function(cmd) {
    var messageType = null
    switch (cmd) {
      case Command.COMMAND_CHAT:
        messageType = ProtoMessageType.chatMessage
        break
      case Command.COMMAND_AUTH_REQ:
        messageType = ProtoMessageType.authMessageReq
        break
      case Command.COMMAND_AUTH_RESP:
        messageType = ProtoMessageType.authMessageResp
        break
      case Command.MESSAGE_RECEIPT:
        messageType = ProtoMessageType.messageReceipt
        break
      case Command.PULL_MESSAGE_RECORD_REQ:
        messageType = ProtoMessageType.pullMessageHistoryRecordReq
        break
      case Command.PULL_MESSAGE_RECORD_RESP:
        messageType = ProtoMessageType.pullMessageHistoryRecordResp
        break
      case Command.PULL_BATCH_GROUP_MESSAGE_REQ:
        messageType = ProtoMessageType.pullBatchGroupMessageReq
        break
      case Command.PULL_BATCH_GROUP_MESSAGE_RESP:
        messageType = ProtoMessageType.pullBatchGroupMessageResp
        break
      case Command.CHAT_OFF_MESSAGE_RESP:
        messageType = ProtoMessageType.pullChatOffMessageResp
        break
      case Command.SUCCESS:
        messageType = ProtoMessageType.commonSuccess
        break
      case Command.ERROR:
        messageType = ProtoMessageType.commonError
        break
      case Command.Ping_REQ:
        messageType = ProtoMessageType.pingMessage
        break
      case Command.JOINGROUP_REQ:
        messageType = ProtoMessageType.joinGroupMessage
        break
      case Command.EXITGROUP_REQ:
        messageType = ProtoMessageType.exitGroupMessage
        break
      case Command.GROUP_REQUEST_RESULT:
        messageType = ProtoMessageType.groupMessageResp
        break
      case Command.Login_Conflict:
        messageType = ProtoMessageType.commonError
        break

      default:
        //默认 其他

        break
    }

    return messageType
  },
  getUserIdFromJid: function(jid) {
    jid += ''
    return jid ? jid.split('/')[0] : ''
  },
  getBareJid: function(jid) {
    jid += ''
    return jid ? jid.split('/')[0] : ''
  },
  getResource: function(jid) {
    if (myFn.isNil(jid)) return ''
    jid += ''
    var resource = jid.substr(jid.indexOf('/') + 1, jid.length)
    return resource
  },
  /*是否为群组 Jid*/
  isGroup: function(userId) {
    var reg = /^[0-9]*$/
    if (!reg.test(userId)) return 1
    else return 0
  },
  randomDeviceId: function() {
    return String(SKIMSDK.getCurrentSeconds() + Math.round(Math.random() * 1000))
  },
  randomUUID: function() {
    return SKIMSDK.cont + SKIMSDK.getCurrentSeconds() + Math.round(Math.random() * 1000)
  },
  getCurrentSeconds: function() {
    return Math.round(new Date().getTime())
  }
}

var Command = {
  /*握手请求，含http的websocket握手请求*/
  COMMAND_HANDSHAKE_REQ: 1,
  /*握手响应，含http的websocket握手响应*/
  COMMAND_HANDSHAKE_RESP: 2,
  /*登录消息请求*/
  COMMAND_AUTH_REQ: 5,
  /*登录消息结果*/
  COMMAND_AUTH_RESP: 6,
  /*关闭请求*/
  COMMAND_CLOSE: 7,
  /*聊天请求*/
  COMMAND_CHAT: 10,
  /*消息回执*/
  MESSAGE_RECEIPT: 11,
  /*拉取 聊天历史记录 */
  PULL_MESSAGE_RECORD_REQ: 12,
  /*拉取 聊天历史记录 结果*/
  PULL_MESSAGE_RECORD_RESP: 13,
  /*批量拉取群组消息数量  请求*/
  PULL_BATCH_GROUP_MESSAGE_REQ: 14,
  /*批量拉取群组消息数量  结果*/
  PULL_BATCH_GROUP_MESSAGE_RESP: 15,
  /*单聊离线消息*/ 
  CHAT_OFF_MESSAGE_RESP: 16,
  /*失败错误*/
  ERROR: -1,
  /*登陆 被挤下线*/
  Login_Conflict: -3,
  /*加入群组*/
  JOINGROUP_REQ: 20,
  /*退出群组*/
  EXITGROUP_REQ: 21,
  /*群组请求结果协议*/
  GROUP_REQUEST_RESULT: 22,
  /*心跳消息*/
  Ping_REQ: 99,
  /*成功请求*/
  SUCCESS: 100
}
var ProtoMessageType = {
  messageHead: proto.lookupType('Message.MessageHead'),
  chatMessage: proto.lookupType('Message.ChatMessage'),
  authMessageReq: proto.lookupType('Message.AuthMessage'),
  authMessageResp: proto.lookupType('Message.AuthRespMessageProBuf'),
  messageReceipt: proto.lookupType('Message.MessageReceiptStatusProBuf'),
  joinGroupMessage: proto.lookupType('Message.JoinGroupMessageProBuf'),
  exitGroupMessage: proto.lookupType('Message.ExitGroupMessageProBuf'),
  groupMessageResp: proto.lookupType('Message.GroupMessageRespProBuf'),
  pullMessageHistoryRecordReq: proto.root.lookupType('Message.PullMessageHistoryRecordReqProBuf'),
  pullMessageHistoryRecordResp: proto.lookupType('Message.PullMessageHistoryRecordRespProBuf'),
  pullBatchGroupMessageReq: proto.lookupType('Message.PullBatchGroupMessageReqProBuf'),
  pullBatchGroupMessageResp: proto.lookupType("Message.PullGroupMessageRespProBuf"),
  pullChatOffMessageResp: proto.lookupType('Message.OffChatMessage'),
  pingMessage: proto.lookupType('Message.PingMessageProBuf'),
  commonSuccess: proto.lookupType('Message.CommonSuccessProBuf'),
  commonError: proto.lookupType('Message.CommonErrorProBuf')
}

// java String hashCode 的实现
function getHashCode(strKey) {
  let hash = 0
  if (strKey) {
    for (let i = 0; i < strKey.length; i++) {
      hash = intValue(hash * 31 + strKey.charCodeAt(i))
    }
  }
  return hash
}


// 将js页面的number类型转换为java的int类型
function intValue (num) {
  const MAX_VALUE = 0x7fffffff
  const MIN_VALUE = -0x80000000
  if (num > MAX_VALUE || num < MIN_VALUE) {
    // eslint-disable-next-line no-return-assign
    return num &= 0xFFFFFFFF
  }
  return num
}

var ChatType = {
  UNKNOW: 0,
  /**
   * 单聊
   */
  CHAT: 1,
  /**
   * 群聊
   */
  GROUPCHAT: 2,
  /**
   * 广播
   */
  ALL: 3,

  /*授权*/
  AUTH: 5,

  /**
   *心跳消息
   */
  PING: 9,
  /**
   * 返回结果
   */
  RESULT: 10,
  /**
   * 消息回执
   */
  RECEIPT: 11
}

/*var ClientMessage={
    from:null,
    to:null,
    messageId,
    buildFromNetMsg:function(msg){

    },
}*/


export default SKIMSDK
