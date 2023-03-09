import App from '@/main'
import store from '@/store'
import SKIMSDK from './websocket-sdk'
import LoginReinforce from '@/module/login_reinforce'
import { receiveMessage, handlerLoginConflict } from './receive-message'
// import { logout } from '@/utils/primary'
import { isNull } from "@/utils/imUtil/tools"
import SendMessage from './send-message'
import { getItem } from '@/utils/imUtil/storage'
import { Message } from 'element-ui'
import LocalStorage from '@/utils/imUtil/storage'
import Constant from '@/assets/js/constant'
const WebIM = {
  cont: 'skimweb_', // 消息ID 前缀
  resource: 'web',
  chat: 'chat', // 单聊标识
  groupChat: 'groupchat', // 群聊标识
  token: null,
  userId: null,
  nickName: '',
  isReadDel: 0,
  userIdStr: null, // 用户 jid 10004541/web
  serverUrl: null, // 服务器连接地址 ws://localhost:5260
  server: null,

  isManual: false,
	isConnections: false,
  // 初始化
  initWebIM () {
    const Token = getItem('Token')
    if (!Token) return
    const meInfo = getItem('MeInfo')
    const meId = getItem('MeId')
    if (!meInfo || !meId) {
			console.warn('用户信息不存在')
			return;
		}

    const pingTime = 30
    this.token = Token
    this.appName = Constant.SYSTEM_NAME
    this.companyName = Constant.COMPANY_NAME
    this.appKey = process.env.VUE_APP_API_KEY
    this.serverUrl = process.env.VUE_APP_XMPP_URL
    this.server = process.env.VUE_APP_XMPP_DOMAIN
    this.userId = meId
    this.nickName = meInfo.nickName
    SKIMSDK.initApi(this.serverUrl, this.userId, this.resource, this.token, pingTime, this.server, this.appKey, this.appName, this.companyName)
    this.userIdStr = SKIMSDK.userIdStr
    SKIMSDK.handlerMsgReceipt = SendMessage.handlerMsgReceipt
    SKIMSDK.messageReceiver = receiveMessage
    SKIMSDK.handlerLoginConflict = handlerLoginConflict
    SKIMSDK.ConnectionFailed = this.ConnectionFailed
    SKIMSDK.Connecting = this.Connecting
    SKIMSDK.ConnectionSucceeded = this.ConnectionSucceeded
    SKIMSDK.Disconnect = this.Disconnect
    SKIMSDK.handlerGroupMessageResult = this.handlerGroupMessageResult
  },
  loginIM (callback) {
    // return new Promise(() => {})
    SKIMSDK.loginIM(() => {
      callback && callback()
    })
  },
  isConnect () {
    return SKIMSDK.isConnect()
  },
  // 发送消息
  sendMessage (message) {
    SKIMSDK.sendMessage(message);
    SendMessage.waitMessageReceipt(message);
  },
  // 断开连接
  disconnect () {
    console.warning('断开连接 --- disconnect',WebIM,this.isConnections)
    WebIM.isManual = true
    SKIMSDK.disconnect()
  },
  // 正在连接
  Connecting () {
    console.log('im-socket - 正在连接')
    // App.$vux.loading.show({ text: '正在连接...' })
  },
  // 连接成功
  ConnectionSucceeded () {
    console.log('im-socket - 连接成功')
    // App.$vux.loading.hide()
    // App.$vux.toast.show({ text: '连接成功', time: 1000 })
  },
  // 连接终止，重新连接
  async Disconnect () {
    console.log('连接终止Disconnect 重新连接',WebIM)
    // 手动退出则不调用
    if (!WebIM.isManual) {
      // 自动重新连接
      if (!this.isConnections) {
        /*
         * IM 自己写的重新连接
        */
        // this.isConnections = true // 节流
        // const account = getItem('Account', true)
        // if (!account) {
        //   WebIM.ConnectionFailed('连接失败，身份不存在')
        //   return
        // }
        // // App.$store.commit('AUTO_LOGIN_RESET_STATUS')
        // LocalStorage.removeItem('Token')
        // LocalStorage.removeItem('im_access_token')
        // console.log('调用user/login/v1 - 登录',account)
        // if (await LoginReinforce.Login(account, 'auto')) {
        //   // await WebIM.initWebIM();
        //   await this.loginIM()
        //   this.isConnections = false
        // }

        /*
         * 重新连接 - 自己修改版
        */
        let isConnect = WebIM.isConnect()
        if (!isConnect) {
          await App.$store.dispatch('InitIMConfig')
        }
        console.log('im-socket -    -开始')
        await App.$store.dispatch('Common/User/GetMeInfo') // /user/get 接口
        await WebIM.initWebIM() // 初始化数据
        // 登录im
        await WebIM.loginIM(async () => {
          // 同步数据
          await App.$store.dispatch('Im/Information/GetTigaseDialog', { type: 'xmpp' })
          await App.$store.dispatch('Im/Friends/GetFriendsList', { type: 'xmpp' })
          await App.$store.dispatch('Im/Room/GetRoomList', { type: 'xmpp' })
          await App.$store.dispatch('Im/Information/GetLastChatList', { type: 'xmpp' })
        })
      }
    // } else {
    //   // WebIM.isManual = !WebIM.isManual
    }
  },
  // 连接失败，重新登陆
  ConnectionFailed (msg) {
    // App.$vux.loading.hide()
    WebIM.isManual = true
    const _this = this
    // Message.error(`${msg}，请重新登录`)
    console.warning('连接失败，重新登陆 --- ConnectionFailed',WebIM,this.isConnections)
    // App.$vux.confirm.show({
    //   title: '提示',
    //   content: `${msg}，请重新登录`,
    //   showCancelButton: false,
    //   dialogTransition: 'vux-fade',
    //   onConfirm () {
    //     logout()
    //     _this.disconnect()
    //   }
    // })
  },
  // 加入群聊
  joinGroupChat (roomJid) {
    SKIMSDK.joinGroupChat(roomJid)
  },
  // 退出群聊
  exitGroupChat (roomJid, meId) {
    SKIMSDK.exitGroupChat(roomJid, meId)
  },
  // 批量拉取群组的离线消息
  pullBatchGroupMessage (groupList) {
    const lastChatTimeSecond = getItem('LastChatReceiveTime') || new Date().getTime() // 最后接收消息的毫秒
    const jidList = []
    for (let i = 0; i < groupList.length; i++) {
      if (isNull(groupList[i])) {
        break
      }
      jidList.push(`${groupList[i].jid},${lastChatTimeSecond}`)
    }
    SKIMSDK.pullBatchGroupMessage(jidList)
  },
  // 批量处理群组的离线消息数量
  handlerGroupMessageResult (result) {
    if (result.messageList) {
      for (let i = 0; i < result.messageList.length; i++) {
        let message = result.messageList[i]
        message = SKIMSDK.convertToClientMsg(message)
        receiveMessage(message)
      }
    }
  }
}

export default WebIM
