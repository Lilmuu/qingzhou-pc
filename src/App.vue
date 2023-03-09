<template>
  <div id="app">
    <router-view></router-view>
    <!-- 语音通话提示小窗口  -->
    <CallTip v-if="processWindowName === 'mainWindow'" />
    <!--  版本更新、下载进度条  -->
    <el-dialog append-to-body
      width="30%"
      class="dialog-message-box noHeaderDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync='versionDialog'>
      <div>
        <div class="warning-content" style="padding: 0;">
          <img src="@/assets/img/login/uploadDialog.png" class="updateImg" alt="">
          <div class="updateContainer flex-column">
            <span class="update-title">版本更新</span>
            <div class="flex-column">
              <span class="update-sub" v-for="(item, index) in updateList" :key="'updateList' + index">{{ item }}</span>
            </div>
          </div>
        </div>
        <div class="flex-column updateBtnOuter">
          <div style="padding: 0 20px 0 50px; background: #fff; height: 50px;" v-if="downloadPercent > 0">
            <el-progress :percentage="downloadPercent"></el-progress>
          </div>
          <div class="updateBtn cursor" @click="handleSendCheckEvent" v-else>立即更新</div>
        </div>
      </div>
    </el-dialog>
    <el-dialog append-to-body
      custom-class="out_login"
      :visible.sync='showLogOutBox'
      :showClose="false"
      :close-on-click-modal="false">
      <div class="logout_box_content">
        <div class="content">您的账号在其他地方登录，您被迫退出，如果不是您本人的操作，请注意账号安全！</div>
        <div class="footer">
          <el-button type="danger" @click="loginOut" >退出登录</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import CallTip from "@/components/CallTip/CallTip";
import { getVersion } from "@/api/user"
import { hasNewVersion } from "@/utils"
import pkg from '../package.json'
import { config } from "@/const/dicData";
import SKIMSDK from '@/xmpp/websocket-sdk'
import { getUpdateMessage } from "@/api/im";
import WEBIM from '@/xmpp/webim-reset'
import store from "@/store";

import { getMessage } from "@/api/im";
import { PCCheckIsLogin } from '@/api/user'
import { getItem } from '@/utils/imUtil/storage'

export default {
  name: 'App',
  data() {
    return {
      onLine: navigator.onLine,  //  navigator.onLine 获取设备是否可以上网、连接网络
      offLine: false,
      versionDialog: false,
      updateList: [],
      pkg: pkg,
      downloadPercent: 0,
      uploadDisableBtn: false,
      processWindowName: '', // 窗体名称
      showVoiceAsk: false,
      callData: {             // 通话信息
        trigger: '',
        triggerId: 0,
      },
      screenWidth: document.body.clientWidth,
      unreadListArr:[],
      noNetWork: true,
      messageMsg: null, // 消息对象实例
      showLogOutBox: false,
    }
  },
  components: { CallTip },
  computed: {
    ...mapState({
      unreadList: state => state.user.unreadList,
      CurrentPersonnel:state => state.Im.Information.CurrentPersonnel,
      jumpUrl:state => state.Im.Information.jumpUrl,
      routerFullPath: state => state.app.routerFullPath
    }),
    ...mapGetters({
      "ChatList": 'Im/Information/ChatList',
      'IdFriendList': 'Im/Friends/IdFriendList', // 我的好友列表
    }),
    getWsMsg() {
      return this.$store.state.socket.socketMsg
    },
    userAvatar(){
      return (imId)=>{
        return this.IdFriendList[imId].headImg ? this.IdFriendList[imId].headImg: ''
      }
    },
  },
  created() {
    // 监听网络
    localStorage.setItem('onLine',true)
    // 网络由异常到正常时触发
    window.addEventListener('online', this.updateOnlineStatus)
    // 网络由正常到异常触发
    window.addEventListener('offline', this.updateOfflineStatus)
  },
  mounted() {
    window.onresize = () => {
      this.detectZoom()
    }
    this.detectZoom()
    // this.initEventListener()
    this.handleGetVersion()
    this.downloadUpdate()
    this.checkOtherWindow()
    this.getProcessWindowName()
    this.setProcessWindowName()
    // 全局文件下载事件监听
    this.$electron.ipcRenderer.on('downloadProgress', (event, fileObj) => {
      console.log(fileObj,'fileObj - fileObj 文件更新下载信息')
      this.onSetDownloadProgress(fileObj)
    })
    this.$electron.ipcRenderer.on('downloadCompleted', (event, fileObj) => {
      console.log('downloadCompleted', fileObj)
      this.onSetDownloadProgressSuccess(fileObj)
    })
    this.$electron.ipcRenderer.on('downloadFiled', (event, fileObj) => {
      console.warn('downloadFiled', fileObj)
    })
    // 邮件通知点击回调
    // this.$electron.ipcRenderer.on('mailNotificationClick', (event, id) => {
    //   console.log('mailNotificationClick id', id)
    // })
    // 加入会议
    this.$electron.ipcRenderer.on('joinMeeting', (event, roomId) => {
      console.log('joinMeeting', event, roomId)
      const token = localStorage.getItem('TOKEN')
      // 登录后才能加入会议
      if(token) {
        const randomKey = Math.random()
        this.$router.replace(`/meeting/index?roomId=${roomId}&stackKey=${randomKey}`)
      }
    })
    // 创建未读消息
    this.$electron.ipcRenderer.on('createUnread',(event,data)=>{
      data = JSON.parse(window.localStorage.getItem('trayBound') || {})
      data.availHeight = window.screen.availHeight
      data.availWidth = window.screen.availWidth
      data.bodyHeight = 300
      this.$electron.ipcRenderer.send('create-unread-list',data)
    })
    // 隐藏未读消息
    this.$electron.ipcRenderer.on('closeUnread',(event,data)=>{
      const token = localStorage.getItem('TOKEN')
      if(token) {
        let length = this.unreadListArr.length
        data['heightLength']= Math.floor(28+36+length*30)
        this.$electron.ipcRenderer.send('unread-list-close',data)
      }
    })

    this.$electron.ipcRenderer.on('current-personnel',(event,data)=>{
      this.$store.commit('Im/Information/SET_CURRENT_PERSONNEL',data)
      this.$router.push(data.url)
    })
    // 图标开始闪烁
    this.$electron.ipcRenderer.on('startNotice',(event,data)=>{
      const token = localStorage.getItem('TOKEN')
      if(token) {
        this.$electron.ipcRenderer.send('show-notice')
      }
    })
    // 显示未读消息
    this.$electron.ipcRenderer.on('showUnread',(event,data)=>{
      data = JSON.parse(window.localStorage.getItem('trayBound') || {})
      data.availHeight = window.screen.availHeight
      data.availWidth = window.screen.availWidth
      data.bodyHeight = 100
      const token = localStorage.getItem('TOKEN')
      if(token) {
        let length = this.unreadListArr.length
        data['heightLength']= Math.floor( 28 + 48 + length * 48)
        console.log("显示未读消息 - 显示未读消息",data)
        if(length != 0){
          this.$electron.ipcRenderer.send('hide-notice')
          this.$electron.ipcRenderer.send('unread-list-show',data)
        }else{
          this.$electron.ipcRenderer.send('unread-list-close',data)
        }
      }
    })
    // 保存图标位置
    this.$electron.ipcRenderer.on('saveTrayBounds',(event,data)=>{
      window.localStorage.setItem('trayBound',JSON.stringify(data))
    })
    // 视频会议创建
    this.$electron.ipcRenderer.on('meeting-window-create-action-cb', (event, message) => {
      console.log('meeting-window-create-action-cb', message)
    })
    // 会议创建失败
    this.$electron.ipcRenderer.on('meeting-window-create-error-cb', (event, errorMessage) => {
      console.log('meeting-window-create-error-cb', errorMessage)
      this.$message.error(errorMessage)
    })
    // 
    this.$electron.ipcRenderer.on('program-exception', (event, details) => {
      console.log('meeting-window-create-error-cb', details)
      this.$confirm('应用程序加载异常，是否重新加载？', 'Error', {
          distinguishCancelAndClose: true,
          confirmButtonText: '重启',
          cancelButtonText: '退出'
        }).then(() => {
            this.$electron.ipcRenderer.send('app-reload-windows')
          })
          .catch(action => {
            this.$electron.ipcRenderer.send('app-exit-close')
          });
    })
    this.$electron.ipcRenderer.on('message', (event, fileObj) => {
      console.log('message==>', event, fileObj)
    })

    this.$electron.ipcRenderer.on('exit-clear', (event) => {
      // 清除缓存
      localStorage.clear()
    })
  },
  destroyed() {
    // this.destroyEventListener()
  },

  methods: {
    ...mapActions({
      onSetDownloadProgress: 'Common/UpdateFile/onSetDownloadProgress', // 设置文件下载进度
      onSetDownloadProgressSuccess: 'Common/UpdateFile/onSetDownloadProgressSuccess', // 设置下载成功数据
      'GetMeInfo': 'Common/User/GetMeInfo',
      'GetTigaseDialog': 'Im/Information/GetTigaseDialog', // [get] 获取置顶消息列表
      'GetFriendsList': 'Im/Friends/GetFriendsList',
      'GetRoomList': 'Im/Room/GetRoomList',
      'GetLastChatList': 'Im/Information/GetLastChatList',
      'SearchChatList': 'Im/Information/SearchChatList', // [get] 搜索人名、群名、和消息记录
    }),
    // 异常到正常
    async updateOnlineStatus () {
      this.onLine = true
      console.log('网络连接成功-开始连接服务')
      // if (this.offLine) {
      try{
        this.noNetWork = false
        this.$message.closeAll()
        this.messageMsg = this.$message({
          message: '正在重新连接...',
          duration: 0,
          type: 'error',
        })
        localStorage.setItem('onLine','true')
        let imId = getItem('MeId')
        let resData = await PCCheckIsLogin(imId)
        if(resData.data.data){
          await this.againLogin()
        }else{
          SKIMSDK.websocket.close()
          this.showLogOutBox = true
        }
        this.$message.closeAll()
      }catch(err){
        console.log(err,'联网后初始化失败')
        this.$message.closeAll()
      }
    },
    updateOfflineStatus () {
      this.onLine = false
      this.offLine = true
      localStorage.setItem('onLine','false')
      this.$message.closeAll()
      this.messageMsg = this.$message({
        message: '网络已断开，请检查网络设置...',
        duration: 0,
        type: 'error',
      })
      console.log( this.messageMsg,'this.messageMsg - 网络断开连接')
    },

    // 断网重新登录
    async againLogin(){
      let isConnect
      await this.$store.dispatch('Common/User/GetServeConfig')
      await this.$store.dispatch('WSINIT')
      isConnect = WEBIM.isConnect()
      if (!isConnect) {
        await this.$store.dispatch('InitIMConfig')
      }
      console.log('断网重连登录-初始化-开始')
      await this.GetMeInfo() // /user/get 接口
      await WEBIM.initWebIM() // 初始化数据
      // 登录im
      await WEBIM.loginIM(async () => {
        // 同步数据
        await store.dispatch('Im/Information/GetTigaseDialog', { type: 'xmpp' })
        await store.dispatch('Im/Friends/GetFriendsList', { type: 'xmpp' })
        await store.dispatch('Im/Room/GetRoomList', { type: 'xmpp' })
        await store.dispatch('Im/Information/GetLastChatList', { type: 'xmpp' })
      })
      let userId = window.localStorage.getItem('USERID')
      getMessage(userId)
      this.$message.closeAll()
      isConnect = WEBIM.isConnect()
      console.log('登录代码执行完成 - isConnect 是否成功登录', isConnect)
    },


    // 获取窗口名称
    getProcessWindowName() {
      this.$electron.ipcRenderer.send('getProcessWindowName')
    },
    // 设置窗口
    setProcessWindowName() {
      this.$electron.ipcRenderer.on('getProcessWindowNameCb', (event, processWindowName) => {
        console.log('processWindowName', processWindowName)
        /**
         * processWindowName
         * mainWindow       主窗口
         * meetingWindow    视频会议窗口
         * */
        if(processWindowName) {
          this.processWindowName = processWindowName
          window.processWindowName = processWindowName
          this.setWindowDocumentTitle(processWindowName)
        }
      })
    },
    // 设置窗口标题
    setWindowDocumentTitle(processWindowName) {
      let title = ''
      switch (processWindowName) {
        // 主窗口
        case 'mainWindow':
          title = '轻舟'
          break
        // 视频会议窗口
        case 'meetingWindow':
          title = '轻舟会议'
          break
        // 语音通话窗口
        case 'callWindow':
          title = '语音通话'
          break
      }
      if(title) {
        window.document.title = title
      }
    },
    // 检查其他窗口
    checkOtherWindow() {
      // 如果没有token，要关闭除主进程窗口的其他窗口
      if(!this.$store.getters.token) {
        this.$electron.ipcRenderer.send('closeOtherWindow')
      }
    },
    // 初始化全局监听事件
    initEventListener() {
      window.addEventListener('online', this.onlineEventListener)
      window.addEventListener('offline', this.offlineEventListener)
    },
    // 销毁全局监听事件
    destroyEventListener() {
      window.removeEventListener('online', this.onlineEventListener)
      window.removeEventListener('offline', this.offlineEventListener)
    },
    onlineEventListener() {
      // let option = {
      //   title: "轻舟",
      //   body: "网络已连接"
      // };
      // // 通知
      // new window.Notification(option.title, option);
      // window.location.reload()
    },
    offlineEventListener() {
      // let option = {
      //   title: "轻舟",
      //   body: "网络已断开",
      // };
      // // 通知
      // new window.Notification(option.title, option);
      this.$router.push('/offline')
    },
    // 版本信息
    handleGetVersion() {
      getVersion().then(res => {
        if (res.data.code === 200) {
          const { version, remarks } = Object.assign({version:null,remarks:null},res.data.data)
          if (version && remarks && hasNewVersion(pkg.version, version)) {
            this.downloadUrl = res.data.data.url
            this.updateList = remarks.split('#')
            this.versionDialog = true
          }
        }
      })
    },
    handleSendCheckEvent() {
      // 防止重复点击
      if(this.uploadDisableBtn) return
      this.uploadDisableBtn = true
      setTimeout(() => {
        localStorage.clear()
      }, 5000)
      this.$electron.ipcRenderer.send('checkForUpdate', '')
    },
    // autoUpdater下载更新事件监听
    downloadUpdate() {
      const _this = this
    // autoUpdater下载更新事件监听
      _this.$electron.ipcRenderer.on('autoUpdater-downloadProgress', (event, progressObj) => {
        console.log('autoUpdater-downloadProgress', progressObj)
        this.downloadPercent = Math.trunc(progressObj.percent) || 0
        console.log(Math.trunc(this.downloadPercent))
        if (Math.trunc(this.downloadPercent) === 100) {
          console.log('开始更新...')
          _this.$electron.ipcRenderer.on('isUpdateNow', function() {
            _this.$electron.ipcRenderer.send('isUpdateNow')
          })
        }
      })
    },
    // 邮件消息通知推送
    // TODO: 以进程方式通知
    createMailNotification(id, subject) {
      this.$electron.ipcRenderer.send('setAppUserModelId')
      let _this = this
      let option = {
        title: "轻舟",
        body: subject,
        // 图标直接用的热更新地址下的icon
        icon: `${config.publish_url}/win-unpacked/resources/app/electron-icon/icon.ico`,
        href: id
      };

      // 创建通知并保存
      let mailNotification = new window.Notification(option.title, option);

      // 当通知被点击时, 用默认浏览器打开链接
      mailNotification.onclick= function(){
        const initId = option.href
        _this.$electron.ipcRenderer.send('window-focus')
        _this.$router.push(`/mail/index?initId=${initId}`)
      }
    },
    // ipcMain socket共享, 但不共享给 main 窗口
    ipcMainShareSocket(msg) {
      msg = JSON.stringify(msg)
      this.$electron.ipcRenderer.send('ipcMainShareSocket', msg)
    },
    loginOut(){
      this.$store.dispatch('FedLogOut').then(() => {
        location.reload()
        this.showLogOutBox = false
      })
    },
    // 计算当前电脑的缩放比例
    detectZoom (){
      var ratio = 0,
        screen = window.screen,
        ua = navigator.userAgent.toLowerCase();

      if (window.devicePixelRatio !== undefined) {
          ratio = window.devicePixelRatio;
      }else if (~ua.indexOf('msie')) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
          ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
      }else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
        ratio = window.outerWidth / window.innerWidth;
      }
      if (ratio){
        ratio = Math.round(ratio * 100);
      }
      this.$store.commit("SET_WINCLIENTWIDTH",document.body.clientWidth)
      this.$store.commit("SET_RATIO",ratio)
    },
    unReadmessage(){
      let _this = this
      let total = 0
      let messageUnRead
      let unRead = this.ChatList.filter(item => {
        return item.newMessageNumber > 0
      })
      if(unRead.length>0){
        let imId = getItem('MeId')
        // 添加头像
        messageUnRead = unRead.map(item=>{
          // 群聊
          if(item.isRoom == 1 && item.isRoom == true){
            item['userAvatar'] = 'isRoom'
          }
          // 任务助手
          else if(item.type === 12 || item.toUserName == '任务助手'){
            item['userAvatar'] = 'RWZS'
          }
          // 单聊人员
          else{
            let userId = item.toUserId == imId ? item.fromUserId : item.toUserId
            item['userAvatar'] = _this.userAvatar(userId)
          }
          return item
        })
        // 聊天消息数量
        messageUnRead.forEach(element => {
          total += element.newMessageNumber
        })
      }
      // 加任务
      total += this.unreadList.length
      
      this.unreadListArr = [...messageUnRead||[], ...this.unreadList||[]]
      if(this.unreadListArr.length > 0){
        this.$electron.ipcRenderer.send('show-notice')
      }else{
        this.$electron.ipcRenderer.send('hide-notice')
      }
      this.$electron.ipcRenderer.send('get-unread-list',{Arr: this.unreadListArr,total})
    },
    // 新消息保存到后端
    NewMessageSet(list=[]){
      let obj = {}
      let userId = window.localStorage.getItem('USERID')
      let newMessage = list.filter(e=>e.newMessageNumber>0)
      for(let item in newMessage){
        if (newMessage[item].jid) {
          obj[newMessage[item].jid] = newMessage[item].newMessageNumber
        } else if (newMessage[item].fromUserId && !newMessage[item].isRoom) {
          obj[newMessage[item].jid] = newMessage[item].newMessageNumber
        } else if (newMessage[item].toUserId && !newMessage[item].isRoom) {
          obj[newMessage[item].jid] = newMessage[item].newMessageNumber
        } else if (newMessage[item].roomJid && !newMessage[item].isRoom) {
          obj[newMessage[item].jid] = newMessage[item].newMessageNumber
        }
      }
      console.log(newMessage,'新消息保存到后端///')
      if(newMessage.length > 0){
        let newObj = {
          'zebreUserId': userId,
          'newMessageList':JSON.stringify(obj)
        }
        getUpdateMessage(newObj)
      }
    },
    // 计算未读数量
    totalNumFun(arr){
      let total = 0
      let newArr = []
      if(arr.length > 0){
        newArr = arr.map(e=>{
          return e.newMessageNumber
        })
      }
      if(newArr.length > 0){
        for(let i in newArr){
          total += newArr[i]
        }
      }
      return total
    },
  },
  watch: {
    getWsMsg: {
      handler(msg) {
        this.ipcMainShareSocket(msg)
        // 只给 mainWindow 窗口触发事件
        if(window.processWindowName !== 'mainWindow') return
        // 任务提示
        if (msg.type === 'pushEvent') {
          const count = msg.data
          console.log("未读消息 - 提示003",msg)
          if (count > 0) {
            this.$store.dispatch('SetUnreadCount', count)
            this.$electron.ipcRenderer.send('show-notice')
          } else {
            this.$store.dispatch('SetUnreadCount', 0)
            this.$electron.ipcRenderer.send('hide-notice')
          }
        }
        // 退出提醒
        if (msg.type === 'pushLogin') {
          // 断开IMSocket链接
          WEBIM.isManual = true
          SKIMSDK.websocket.close()
          localStorage.removeItem('im_access_token')
          this.showLogOutBox = true
        }
        // 邮件推送
        if (msg.type === 'pushEmail') {
          this.createMailNotification(msg.data.id, msg.data.subject)
        }
      },
      deep: true
    },
    '$store.state.socket.socketMsg':function(){
      console.log(this.$store.state.socket.socketMsg)
    },
    ChatList:{
      handler(newVal, oldVal){
        this.unReadmessage()
        let newValNumber = this.totalNumFun(newVal)
        let oldValNumber = this.totalNumFun(oldVal)
        if(newValNumber != oldValNumber){
          this.NewMessageSet(newVal)
        }
      },
      deep:true,
    },
    unreadList:{
      handler(newVal, oldVal){
        console.log(newVal,oldVal,'任务未读消息 - 变化')
        this.unReadmessage()
      },
      deep:true,
    },

    routerFullPath(){
      let isConnect = WEBIM.isConnect()
      // 网络正常 && im正常连接 
      console.log(this.onLine ,'hhhh', isConnect)
      if(this.onLine && isConnect ){
        this.$message.closeAll()
      }
    }
  }
}
</script>
