<template>
  <div class="callView">
    <CallNavBar :isStart="isStart" :currentTimer="currentTimer" @onClose="handleCallOff"></CallNavBar>
    <div class="callMainView">
      <div v-if="roomType === 'friend'" class="callAvatar flex-center">{{ roomActionData.trigger | formatUserName }}</div>
      <div v-if="roomType === 'friend'" class="callUserName">
        {{ roomActionData.trigger }}
      </div>
      <div v-if="roomType === 'room'" class="roomType" :style="avatarLayout">
        <div class="callAvatarRoom flex-center" v-for="(item, key) in userList" :key="key">{{ item.name | formatUserName }}</div>
      </div>
      <div>
<!--        <audio id="call-audio" :autoplay="false" :src="audio_play"></audio>-->
<!--        <audio controls>-->
<!--          <source :src="audio_play" type="audio/mpeg">-->
<!--        </audio>-->
        <!-- 消息房间，声音流 -->
        <video id="audioPlayer"
               ref="audioPlayer"
               autoplay
               playsinline
               loop
               style="display: none;"></video>
      </div>
      <div class="callActionRow" :style="isStart || roomType === 'room' ? '' : 'justify-content: center;'">
        <div v-if="isStart" class="callActionItem cursor" @click="changeEnable('mic')">
          <div class="callActionBtn callActionBtnNormal flex-center" :class="enableMic ? 'callMic_on' : 'callMic_off'">
            <img :src="enableMic ? mic_img : mic_img_off" class="callActionItemImg" alt="" />
          </div>
          <span class="callActionText">静音</span>
        </div>
        <div class="callActionItem cursor" @click="handleCloseRoom('iHangUp')">
          <div class="callActionBtn callActionBtnOff flex-center">
            <img :src="phone_img" class="callActionItemImg" alt="" />
          </div>
          <span class="callActionText">挂断</span>
        </div>
        <div v-if="roomType === 'room'" class="callActionItem cursor vol_slider_container">
          <div class="callActionBtn callActionBtnNormal flex-center" @click="handleAdd">
            <img :src="add_img" class="callActionItemImg" alt="" />
          </div>
          <span class="callActionText">添加</span>
        </div>
      </div>
    </div>
    <el-dialog
      title="选择成员"
      append-to-body
      width="700px"
      class="member-dialog"
      :before-close="handleCloseMember"
      :visible.sync='memberDialog'
      style="margin-top: calc(50vh - 350px);">
      <selectPeople
        :members="roomActionData.members"
        :meId="Number(roomActionData.meId)"
        :busyMembers="roomActionData.busyMembers"
        :visible="memberDialog"
        @handleCloseMember="handleCloseMember"
        @memberSubmit="memberSubmit"
      ></selectPeople>
    </el-dialog>
  </div>
</template>

<script>
import CallNavBar from "@/views/call/components/callNavBar";
import { voiceConnect, voiceStop, voiceAsk,transformId,sendVoiceRecord } from "@/api/im";
import { throttle } from '@/utils/index'
import { getItem } from '@/utils/imUtil/storage'
// import {transformId} from "../../api/im";
import selectPeople from "../im/components/groupUsers/selectPeople"
import {getBusyUser} from "../../api/im";
import {mapState} from "vuex";

const mic_img = require('@/assets/img/call/mic.png')
const mic_img_off = require('@/assets/img/call/mic_off.png')
const audio_play = require('@/static/media/av.mp3')
const phone_img = require('@/assets/img/call/phone.png')
const vol_img = require('@/assets/img/call/vol.png')
const add_img = require('@/assets/img/call/add.png')

let tvvssdk

const myRealName = localStorage.getItem('USERNAME')
const USERNAME = `pc-` + myRealName

export default {
  name: "calling",
  components: {
    CallNavBar, selectPeople
  },
  data() {
    return {
      myName: '',
      onLine: navigator.onLine,  //  navigator.onLine 获取设备是否可以上网、连接网络
      offLine: false,
      memberDialog: false,
      userList: [], // 消息房间用户列表
      avatarLayout: '', // 用户头像布局
      audio_play: audio_play,
      mic_img: mic_img,
      mic_img_off: mic_img_off,
      phone_img: phone_img,
      vol_img: vol_img,
      add_img: add_img,
      enableMic: true,
      enableVol: true,
      vol_number: 90,
      showVolTip: false,
      timerNum: 0,
      isStart: false,
      timer: null,
      callTimer: null,
      currentTimer: "00:00:00",
      roomActionData: {
        creatType: '',    // [create, join]
        roomId: '',       // callRoom-pc-xxx
        trigger: '',      // xxx
        triggerId: 0,
        connectData: {},   // {ids: [], roomName: 'xxx'}
        members: [],
        meId: '',
        busyMembers: []
      },
      // 声音流
      audioVideo: {
        stream: null,
        sessionid: -1,
      },
      sessionid: '',
      roomId: '',
      throttledSetVolumeFunc: null,
      roomType: '',
      audio: null,
      params: {
        chatType: 'friend',
        senderId: '',
        receiverId: '',
        voiceTime: '', // 群聊挂断的时间
        myContent: '',
        hisContent: '',
        event: 'voiceCancel', // 接听方挂断-cancel，拨打方挂断-voiceCancel，接听后挂断-voiceStop，群聊结束-voiceEnd
      }
    }
  },
  computed: {
    ...mapState({
      userId: state => state.user.userId,
      MeId: state => state.Common.User.MeId || 0, // 我的ID
    }),
  },
  created() {
    this.audio = new Audio()
    this.audio.src = require('@/static/media/av.mp3')
    // 监听网络
    // 网络由异常到正常时触发
    window.addEventListener('online', this.updateOnlineStatus)
    // 网络由正常到异常触发
    window.addEventListener('offline', this.updateOfflineStatus)
  },
  mounted() {
    this.userList = []
    console.log('window url', window.location.href)
    // 已存在窗口的情况下，重载新的url
    this.$electron.ipcRenderer.on('loadNewCallUrl', (event, url) => {
      window.location.href = url
      window.location.reload()
    })
    this.initCallData()
    this.initRoomConfig()
    this.$electron.ipcRenderer.on('ipcMainShareSocketCb', (event, dataStr) => {
      console.log('ipcMainShareSocketCb', dataStr)
      this.ipcMainSocketParser(dataStr)
    })
    this.throttledSetVolumeFunc = throttle(500, this.handleSetVolume);
    console.log(this.userList, '++++++++++++++++++++++', this.roomActionData)


    //
    setTimeout(() => {
      if (this.userList.length > 1) {
        return
      }
      if (this.userList.length < 2 && this.timer === null) {
        // this.handleCallOff()
        this.handleCloseRoom('iHangUp')
      }
    }, 33 * 1000)

  },
  methods: {
    updateOnlineStatus () {
      this.onLine = true
      console.log('网络连接成功')
      if (this.offLine) {
        console.log('网络重连成功')
        // await this.$store.dispatch('WSINIT')
        setTimeout(() => {
          this.initRoomConfig()
        }, 3000)
      }
    },
    updateOfflineStatus () {
      this.onLine = false
      this.offLine = true
      this.audio.pause()
      clearInterval(this.callTimer)
      this.callTimer = null
      console.log('网络断开连接')
      setTimeout(() => {
        if (!this.onLine && this.roomType === 'friend') {
          this.handleCallOff()
        }
      }, 2000)
    },
    async memberSubmit(list) {
      // return
      let ids = []
      list.forEach(item => {
        if (item.id !== this.roomActionData.meId) {
          ids.push(item.id)
        }
      })
      await transformId({ids: ids}).then(res => {
        if (res.data && res.data.code == 0) {
          ids = [...res.data.data]
        }
      })
      const data = {
        ids: [...ids],
        roomName: this.roomActionData.roomId,
        roomId: this.roomActionData.imRoomId,
        type: 'room',
        from: 'pc'
      }
      if (ids.length === 0) {
        this.$message.warning('请邀请语音通话成员!')
        return
      }
      voiceAsk(data).then(res => {
        if (res.data.code === 200) {
          this.$message.success('邀请成功!')
        }
      })
      this.handleCloseMember()
    },
    // 获取用户全名
    getUserName(str) {
      return str.split('-pc-')[1]
    },
    // 添加成员
    async handleAdd() {
      let ids = []
      this.roomActionData.members.forEach(item => {
        if (item.userId !== this.roomActionData.meId) {
          ids.push(item.userId)
        }
      })
      await transformId({ids: ids}).then(res => {
        if (res.data && res.data.code == 0) {
          ids = [...res.data.data]
        }
      })
      await getBusyUser({ids: ids}).then(res => {
        if (res.data && res.data.code == 0) {
          this.roomActionData.busyMembers = [...res.data.data]
        }
      })
      this.memberDialog = true
    },
    handleCloseMember() {
      this.memberDialog = false
    },
    // 初始化房间数据
    initCallData() {
      // console.log(0)
      const roomActionDataStr = localStorage.getItem('roomActionData') || ''
      if (roomActionDataStr) {
        const roomActionData = JSON.parse(roomActionDataStr)
        console.log(roomActionData)
        this.roomActionData = roomActionData
        if(roomActionData.connectData) {
          this.initVoiceConnect(roomActionData.connectData)
        }
        this.roomId = roomActionData.roomId
        this.roomType = roomActionData.type
        if (roomActionData.creatType === 'create') {
          this.callTimer = setInterval(() => {
            // document.getElementById('call-audio').play()
            this.audio.play()
          }, 2000)
        }
      }
    },
    // 加入的，创建窗口后自动接听连接
    initVoiceConnect(connectData) {
      connectData.from = 'pc'
      console.log(connectData)
      voiceConnect(connectData).then(res => {
        if (res.data.code === 200) {
          console.log('加入成功')
          this.initCallTime()
        }
      })
    },
    // 初始化配置信息
    initRoomConfig() {
      const _this = this
      tvvssdk = _this.$tvvssdk

      // 进出口
      // let options = {
      //     // 新的服务地址
      //     websocketurl:'wss://sphy.cguarantee.cn:40004/websocket',
      //     oamurl: 'https://sphy.cguarantee.cn:40004',
      //     stunurl: 'stun:113.207.109.120:40000'
      // }

      // 内网
      // let options = {
      //    websocketurl: 'ws://10.0.0.125:2238/websocket', // websocket信令服务URL
      //    oamurl: 'https://10.0.0.125:2237/oam', // 管理服务URL
      //    stunurl: 'stun:10.0.0.125:2231' // stun服务器地址
      // },

      // 张东环境
      let options = {
        websocketurl: 'wss://meeting.zwan.com.cn:2337/websocket', // ws信令服务URL
        oamurl: 'https://meeting.zwan.com.cn:2337', // 管理服务URL
        stunurl: 'stun:stun.zwan.com.cn:2331'
      };

      // console.log('初始化 tvvssdk.init start', options)
      tvvssdk.init(options, function (res) {
        console.log('初始化 tvvssdk.init callback', res)
        if (res.success) {
          // 初始化成功
        } else {
          this.$message.error('连接服务器失败')
        }
      });
      tvvssdk.createConnection(function (res) {
        console.log('初始化 tvvssdk.createConnection callback', res)
        if (res.success || res.disconnected) {
          if(res.disconnected) {
            console.warn(`initRoomConfig 消息房间 ICE连接失败,正在重新连接: ${_this.roomId} ${res.sessionid}`);
            const sessionid = res.sessionid
            _this.sessionid = sessionid
            tvvssdk.streamStop(res.sessionid)
            _this.audioStreamStart(res.sessionid);
            return
          }
          //服务器连接成功，可以进行加入房间操作，应用层应该保存res.sessionid，后续操作都需要携带sessionid
          const sessionid = res.sessionid
          console.log(sessionid + '=======================')
          _this.sessionid = sessionid
          const str = _this.MeId + '-' + process.env.VUE_APP_TENANT_ID +  '-' + USERNAME
          _this.myName = str
          _this.joinRoom(sessionid, _this.roomId, str);
        } else {
          console.error('初始化 连接失败')
        }
      });
    },// 第一次进入消息房间，加载成员列表并订阅其他人的房间
    initLoadMessageUsersSelfRooms(sessionid, roomid, name) {
      let _this = this
      tvvssdk.queryRoom(sessionid, roomid, {
        success: async function (result) {
          _this.userList = [];
          let userList = []
          if (roomid == result.room) {
            // result.participants.forEach(function (p, index, arr) {
            //     let user = {"userName": p.display, "position": p.position, "id": p.id};
            //     userList.push(user);
            // });
            for (let i = 0; i <result.participants.length; i++) {
              const p = result.participants[i]
              console.log(p, '++++++++++++++++++++++=====================')
              let user = {
                "name": p.display,
                "position": p.position,
                "id": p.id,
              };
              userList.push(user);
            }
            console.log('userList=========>', userList)
            _this.userList = userList
          }
        },
        error: function(msg) {
          console.log("queryConfMemberInfo error:"+msg);
        }
      });
    },
    // 加入消息房间 自己加入会议，接收SDK的回调，只有视频流
    joinRoom(sessionid, roomId, name) {
      let _this = this;
      let callbacks = {
        onjoined: function (name) {
          // 只是一个消息房间只推流声音流
          _this.audioStreamStart(sessionid);
        },
        onleave: function (name, rfindex) {
        },
        // 消息
        ondata: function (sender, platform = '', data) {
          _this.handleParseMessage(sender, platform, data)
        },
        repeatLogin: function (msg) {
          console.warn("repeatLogin 用户重复登录", msg);
        }
      };
      // 第一次进入消息房间，加载成员列表并订阅其他人的房间
      _this.initLoadMessageUsersSelfRooms(sessionid, roomId, name)
      tvvssdk.joinRoom(sessionid, roomId, name, callbacks);
    },
    // 声音流
    audioStreamStart(sessionId) {
      let options = {
        audio: {},
        video: {},
        conf: {}
      };
      //设置音频参数
      options.audio.sendaudio = true   //未选择”禁用麦克风“
      options.audio.recvaudio = true;
      options.audio.publishaudio = true;
      options.audio.subscribeaudio = true;
      options.audio.audioindeviceid = 'default';

      //设置视频参数
      options.video.sendvideo = false;  //未选择”禁用摄像头“
      options.video.recvvideo = true;
      options.video.deviceid = 'default';
      options.video.publishvideo = false;
      options.video.subscribevideo = false;
      options.video.type = "camera";

      //设置会场参数，仅对MCU会议有效
      options.conf.size = 'lowres-16:9';
      options.conf.fps = 15
      options.conf.confsize = 'lowres-16:9';
      options.conf.confminbr = 150 * 1024;
      options.conf.confmaxbr = 500 * 1024;
      options.conf.confinitbr = 500 * 1024;
      options.conf.conffps = 15;
      options.conf.mode = 'sfu-up';
      options.conf.picmode = 0;  //0：一大多小， 1：等大

      console.log('声音流房间 options', options)

      let _this = this;
      let callbacks = {
        onlocalstream: function (sessionId, stream, extra) {
        },
        onremotestream: function (sessionId, stream, extra) {
          console.log('声音流 on-remotestream')
          _this.audioVideo.stream = stream;
          _this.audioVideo.sessionid = sessionId;
          setTimeout(function () {
            _this.loadAudioStream();
          }, 200);
        },
      };
      tvvssdk.streamStart(sessionId, options, this.roomId, callbacks);
      this.streaming = true;
    },
    // 加载声音流
    loadAudioStream() {
      const audioElId = this.$refs['audioPlayer']
      tvvssdk.attachMediaStream(audioElId, this.audioVideo.stream)
    },
    async handleParseMessage(sender, platform, dataStr) {
      try {
        console.log('handleParseMessage', dataStr)
        const data = JSON.parse(dataStr)
        const status = data.status || ''
        // console.log(status + '=======================')
        // console.log(data)
        const index = this.userList.findIndex(item => {
          return item.name === data.name
        })
        switch (status) {
          // 有人退出
          case "hangup":
            // const arr = data.name.split('-')
            this.$message.info(`${ data.name.split('-')[data.name.split('-').length - 1] }退出了语音通话`)
            this.userList.splice(index, 1)
            console.log(this.userList, '==========+++++++++')
            if (this.roomActionData && this.roomActionData.type === 'friend') {
              // 当对方意外退出时，自己也要挂断, 结束通话
              // this.handleCallOff()
              // 停止订阅流，离开订阅房间
              const sessionid = this.sessionid
              try {
                tvvssdk.streamStop(sessionid);
                tvvssdk.leaveRoom(sessionid)
              } catch (e) {
                console.log(e)
              }
              this.$electron.ipcRenderer.send('call-window-close')
            } else {
              if(this.userList.length === 0) {
                // 当所有人都退出, 结束通话
                this.handleCallOff()
              }
            }
            break;
          case "joined":
            console.log(data.name)
            console.log(this.myName)
            if (data.name !== this.myName) {
              this.$message.info(`${ data.name.split('-')[data.name.split('-').length - 1] }加入了语音通话`)
            }
            if (!this.offLine) {
              this.userList.push(data)
            } else {
              const index = this.userList.findIndex(item => {
                return item.name === data.name
              })
              if (index === -1) {
                this.userList.push(data)
              }
            }
            this.$forceUpdate()
            break;
        }
      } catch (e) {
      }
    },
    /**
     * 程序 开关自己麦克风
     * @param   {Boolean} enable  [true, 开启麦克风， false，关闭麦克风]
     * **/
    handleMuteMySelf(enable = false) {
      let _this = this
      tvvssdk.mike(_this.sessionid, enable, function (res) {
        console.log(res)
        console.log(_this.sessionid + '=======================')
        if (!res.success) {
          _this.$message.warning("静音异常");
          _this.enableMic = false
        } else {
          _this.enableMic = enable
        }
      });
    },
    // 开关
    changeEnable(type) {
      // 开关麦克风
      if (type === 'mic') {
        let enableMic = !this.enableMic
        this.handleMuteMySelf(enableMic)
      }
      // 挂断
      else if (type === 'callOff') {
        this.handleCloseRoom()
      }
      // 开关扬声器
      else if (type === 'vol') {
        this.handleShowVolTip()
      }
    },
    // 初始化时间
    initCallTime() {
      this.isStart = true
      this.timerNum = 0;
      this.timer = setInterval(() => {
        this.timerNum++;
        this.currentTimer = this.$secondsFormat(this.timerNum);
      }, 1000);
      // document.getElementById('call-audio').pause()
      this.audio.pause()
      clearInterval(this.callTimer)
      this.callTimer = null
    },
    // 挂断
    handleCallOff() {
      this.handleCloseRoom()
    },

    // 关闭
    /* 形参 stopType
      iHangUp - 我主动挂断
    */

    handleCloseRoom(stopType) {
      clearInterval(this.callTimer)
      clearInterval(this.timer)
      const { triggerId, roomId, creatType, type, imRoomId } = this.roomActionData
      // 自己拨打，对方未接听，自己主动挂断
      console.log(this.roomActionData, 'roomActionData - roomActionData')
      if(creatType === 'create' && this.timerNum === 0) {

        console.log('挂断 - 挂断 测试')
        const otherData = {
          ids: this.roomType === 'friend' ? [...triggerId] : [this.userId],
          roomName: roomId,
          type: type,
          from: 'pc'
        }
        voiceStop(otherData).then(res => {
          if (res.data.code === 200) {
            console.log('对方未接听',otherData)
            if(stopType === 'iHangUp'){
              this.endVoiceRecord(otherData,'voiceCancel')
            }
          }
        })
      } else {
        const data = {
          ids: this.roomType === 'friend' ? [...triggerId] : [this.userId],
          roomName: roomId,
          type: type,
          roomId: imRoomId,
          from: 'pc'
        }
        console.log('通话已结束',data)
        // 在通话中任何一方挂断
        console.log('通话已结束 - 房间剩余人数',this.userList)
        if(this.roomType === 'friend' || (this.roomType !== 'friend' && this.userList.length <= 1)){
          voiceStop(data).then(res => {
            if (res.data.code === 0) {
              console.log('通话已结束')
              this.endVoiceRecord(data, 'voiceStop')
            }
          })
        }
      }
      // 停止订阅流，离开订阅房间
      const sessionid = this.sessionid
      try {
        tvvssdk.streamStop(sessionid);
        tvvssdk.leaveRoom(sessionid)
      } catch (e) {
        console.log('捕捉的异常', e)
      }
      this.$electron.ipcRenderer.send('call-window-close')
    },
    // 语音通话结束回调
    async endVoiceRecord(data,eventType){
      this.params.chatType = this.roomType == 'friend' ? 'friend' : 'room'
      this.params.event = eventType
      this.params.senderId = getItem('MeId') || ''
      this.params.voiceTime = this.currentTimer

      await transformId({ids: [data.ids[0]], type: 1}).then(res=>{
        this.params.receiverId = res.data.data[0]
      })
      await sendVoiceRecord(this.params).then(res=>{
        console.log('通话已结束 - 回调成功', res)
      })
    },

    // 通过socket关闭
    handleCloseRoomBySocket(msg) {
      // 停止订阅流，离开订阅房间
      const sessionid = this.sessionid
      try {
        tvvssdk.streamStop(sessionid);
        tvvssdk.leaveRoom(sessionid)
      } catch (e) {
      }
      this.$electron.ipcRenderer.send('call-window-close')
    },
    // 显示扬声器音量条
    handleShowVolTip() {
      // this.enableVol = !this.enableVol
      this.showVolTip = !this.showVolTip
    },
    // 设置声音大小
    handleSetVolume(v) {
      this.$refs['audioPlayer'].volume = v
      // 重新attach 声音流
      setTimeout(() => {
        this.loadAudioStream()
      }, 200)
    },
    // ipcMain socket 消息解释器
    ipcMainSocketParser(dataStr) {
      const msg = JSON.parse(dataStr)
      // 只给 callWindow 窗口触发事件
      if (window.processWindowName !== 'callWindow') return
      if (msg.data.roomName !== this.roomActionData.roomId) return;
      // 开始正式连接通话
      if(msg.type === 'voiceConnect') {
        if (this.timerNum === 0) {
          this.initCallTime()
        }
      }
      if(msg.type === 'voiceStop' && this.roomType === 'friend') {
        this.handleCloseRoomBySocket(msg)
      }
      if (msg.type === 'voiceStop' && this.roomType === 'room' && this.userList.length === 0) {
        this.handleCloseRoomBySocket(msg)
      }
      if(msg.type === 'voiceCancel' && this.roomType === 'friend') {
        this.$message.info('对方已拒绝')
        setTimeout(() => {
          this.handleCloseRoomBySocket(msg)
        }, 1000)
      }
    }
  },
  watch: {
    // 动态调整扬声器大小
    // TODO: BUG 设置声音大小后无法无法获取音频
    vol_number(val) {
      const v = Number(parseFloat(val / 100.0))
      this.throttledSetVolumeFunc(v)
    },
    userList: {
      handler(newVal, oldVal) {
        const length = newVal.length
        if (length < 2) {
          this.avatarLayout =
            'grid-template-columns: 120px;' +
            'grid-template-rows: 120px;' +
            'margin-top: 90px;'
        }
        if (length < 5 && length > 1) {
          this.avatarLayout =
            'grid-template-columns: 120px 120px;' +
            'grid-template-rows: 120px 120px;' +
            'margin-top: 90px;'
        }
        if (length > 4 && length < 10) {
          this.avatarLayout =
            'grid-template-columns: 80px 80px 80px;' +
            'grid-template-rows: 80px 80px 80px;' +
            'margin-top: 60px;' + 'font-size:26px;'
        }
        if (length > 9 && length < 17) {
          this.avatarLayout =
            'grid-template-columns: 70px 70px 70px 70px;' +
            'grid-template-rows: 70px 70px 70px 70px;' +
            'margin-top: 40px;' + 'font-size: 24px;'
        }
        if (length > 16 && length < 26) {
          this.avatarLayout =
            'grid-template-columns: 60px 60px 60px 60px 60px;' +
            'grid-template-rows: 60px 60px 60px 60px 60px;' +
            'margin-top: 20px;' + 'font-size: 22px;'
        }
        this.$forceUpdate()
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>
