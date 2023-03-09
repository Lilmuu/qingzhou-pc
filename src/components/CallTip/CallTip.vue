<template>
  <!-- 语音通话提示小窗口  -->
  <div class="callWindowTip" v-if="showVoiceAsk">
    <div class="callWindowContainer cursor">
      <div class="callRow">
        <!-- <Avatar :username="callData.trigger" style="margin-right: 10px;" /> -->
        <headAvatar 
          style="margin-right: 10px;"
          :size="32" 
          :fontSize='12'
          :avatarUrl="callData.headImage ? callData.headImage: ''" 
          :username="callData.trigger">
        </headAvatar>
        <div class="callInfo">
          <div class="callName">{{ callData.trigger }}</div>
          <div class="callText">邀请你进行语音通话</div>
        </div>
      </div>
      <div class="callActionRow">
        <div class="callAction callAction-off flex-center" @click.stop="handleCallCancel">
          <img src="@/assets/img/im/call_off.png" class="callImg" alt="" />
        </div>
        <div class="callAction callAction-on flex-center" @click="handleCallOn">
          <img src="@/assets/img/im/call_on.png" class="callImg" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar";
import { getItem, setItem } from '@/utils/imUtil/storage'
import { voiceCancel, sendVoiceRecord } from "@/api/im";
import {mapActions, mapState} from "vuex";
import {getBusyUser, transformId} from "../../api/im";

const myRealName = localStorage.getItem('USERNAME')
const USERNAME = `pc-${myRealName}`

export default {
  name: "CallTip",
  data() {
    return {
      showVoiceAsk: false,
      callTimer: null,
      audio: null,
      busyMembers: [],
      callData: {             // 通话信息
        trigger: '',
        triggerId: 0,
        roomName: ''
      },
      connectTimeout: null,   // 1分钟未接听
    }
  },
  components: {
    headAvatar
  },
  computed: {
    getWsMsg() {
      return this.$store.state.socket.socketMsg
    },
    ...mapState({
      RoomInfo: state => state.Im.Room.RoomInfo,
    }),
  },
  methods: {
    ...mapActions({
      GetRoomInfo: 'Im/Room/GetRoomInfo', // [GET] 获取群信息
    }),
    // 显示通话tip
    handleShowCallTip() {

    },
    // 重置
    resetCallData() {
      this.audio.pause()
      clearInterval(this.callTimer)
      this.callTimer = null
      this.showVoiceAsk = false
      this.callData = {
        trigger: '',
        triggerId: 0,
        roomName: '',
        callerType: ''
      }
    },
    // 询问是否接受语音
    async handleVoiceAsk(data) {
      this.callData = {
        trigger: data.trigger,
        triggerId: data.triggerId,
        roomName: data.roomName,
        type: data.type,
        roomId: data.roomId,
        callerType: data.callerType
      }
      await this.$electron.ipcRenderer.send('window-focus')
      // return
      await setTimeout(() => {
        this.showVoiceAsk = true
        this.audio = new Audio()
        this.audio.src = require('@/static/media/av.mp3')
        this.callTimer = setInterval(() => {
          this.audio.play()
        }, 2000)
      }, 500)
      // TODO: 30s未接听
      if(!this.connectTimeout && this.showVoiceAsk) {
        // 30s未接听，挂断
        this.connectTimeout = setTimeout(() => {
          this.handleVoiceConnectTimeout()
          this.audio.pause()
          this.callTimer = null
        }, 30 * 1000)
      }
    },
    // 30s未接听，挂断

    handleVoiceConnectTimeout() {
      this.resetCallData()
    },
    // 语音通话打开
    async handleCallOn() {
      this.audio.pause()
      clearInterval(this.callTimer)
      this.callTimer = null
      console.log(this.callData.roomId)
      if (this.callData.roomId) {
        await this.GetRoomInfo({ roomId: this.callData.roomId })
      }
      let _this = this
      // 同步 once - 检查是否已经存在callwindow了，是否已经在通话中了
      this.$electron.ipcRenderer.send('checkCallRoomExist')
      this.$electron.ipcRenderer.once('checkCallRoomExist-cb', function (event, checkCallRoomExistResult) {
        console.log('checkCallRoomExist-cb', checkCallRoomExistResult)
        if(checkCallRoomExistResult) {
          _this.$message.info('当前正在通话中, 请先挂断后再接听')
          return
        }
        console.log(' _this.callData',  _this.callData)


        // const roomActionData = {
        //   creatType: 'join',
        //   roomId: `callRoom-pc-王宗岳`,
        //   trigger: '王宗岳'
        // }
        // localStorage.setItem('roomActionData', JSON.stringify(roomActionData))
        // const roomActionDataStr = JSON.stringify(roomActionData)
        // _this.$electron.ipcRenderer.send('create-call-window', roomActionDataStr)
        //
        // return;

        const { trigger, triggerId, roomName, type, roomId, callerType } = _this.callData
        if (type === 'room') {
          let ids = []
          console.log(_this.RoomInfo , '_this.RoomInfo - _this.RoomInfo')
          if(_this.RoomInfo.members){
            _this.RoomInfo.members.forEach(item => {
              ids.push(item.userId)
            })
          }
          transformId({ids: ids}).then(res => {
            if (res.data && res.data.code == 0) {
              ids = [...res.data.data]
              // getBusyUser({ids: ids}).then(res => {
              //   if (res.data && res.data.code == 0) {
              //     this.busyMembers = [...res.data.data]
              //   }
              // })
            }
          })
        }
        if (!triggerId) return
        const data = {
          ids: [triggerId],
          roomName,
          callerType,
          type,
        }

        const roomActionData = {
          creatType: 'join',
          roomId: roomName,
          trigger,
          triggerId: [triggerId],
          connectData: data,
          imRoomId: roomId,
          type: type,
          members: _this.RoomInfo.members,
          // busyMembers: this.busyMembers,
        }
        _this.showVoiceAsk = false
        localStorage.setItem('roomActionData', JSON.stringify(roomActionData))
        const roomActionDataStr = JSON.stringify(roomActionData)
        _this.$electron.ipcRenderer.send('create-call-window', roomActionDataStr)
      })
    },
    // 语音通话拒绝
    async handleCallCancel() {
      console.log('callData',this.callData)
      let params = {
        chatType: 'friend',
        senderId:  getItem('MeId') || '',
        receiverId: '',
        voiceTime: '', // 群聊挂断的时间
        myContent: '',
        hisContent: '',
        event: 'cancel', // 接听方挂断-cancel，拨打方挂断-voiceCancel，接听后挂断-voiceStop，群聊结束-voiceEnd
      }
      await transformId({ids: [this.callData.triggerId], type: 1}).then(res=>{
        console.log(res.data, '获取IMID - 获取IMID')
        params.receiverId = res.data.data[0]
      })

      this.audio.pause()
      clearInterval(this.callTimer)
      this.callTimer = null
      const { triggerId, roomName, type } = this.callData
      console.log(this.callData)
      if (!triggerId) return
      const data = {
        ids: [triggerId],
        roomName,
        type: type,
        from: 'pc'
      }
      voiceCancel(data).then(res => {
        if (res.data.code === 200) {
          this.showVoiceAsk = false
          sendVoiceRecord(params)
        }
      })
    },
  },
  watch: {
    getWsMsg: {
      handler(msg) {
        // 只给 mainWindow 窗口触发事件
        console.log('==================================')
        console.log(msg)
        console.log('==================================')
        if (window.processWindowName !== 'mainWindow') return
        // 询问是否接受语音
        if(msg.type === 'voiceAsk') {
          setTimeout(() => {
            this.handleVoiceAsk(msg.data)
          }, 3000)
        }
        // 对方主动挂断
        if(msg.type === 'voiceStop') {
          this.showVoiceAsk = false
          if(this.audio != null){
            this.audio.pause()
            clearInterval(this.callTimer)
          }
          // this.handleCallCancel()
        }
        // 一端已接听
        if(msg.type === 'otherSideAccept') {
          this.showVoiceAsk = false
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>
