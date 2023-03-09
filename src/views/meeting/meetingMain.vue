<template>
  <div class="meetingMainView">
    <div class="title">视频会议</div>
    <div class="content">
      <div @click="handleShowMeetingDialog">
        <img src="@/assets/img/meeting/meetingAdd.png" alt="">
        <p>新建会议</p>
      </div>
      <div @click="handleJoinMeeting">
        <img src="@/assets/img/meeting/meetingJoin.png" alt="">
        <p>加入会议</p>
      </div>
    </div>
    <el-dialog append-to-body
      :visible.sync='addMeetingDialog'
      width="506px"
      @close="handleMeetingDialogCancel">
      <div class="modalContent">
        <el-input v-model="form.subject" maxlength="30" placeholder="你的会议主题是？" v-if="creatType === 'create'"/>
        <el-input v-model="form.roomId" maxlength="11" placeholder="请输入11位会议室ID" v-else/>
        <div class="cameraArea">
          <HeadAvatar 
            :size="100" 
             v-if="!form.enableVideo"
            :fontSize='30'
            :avatarUrl="imgUrl" 
            :username="localName">
          </HeadAvatar>
        </div>
        <div class="formAction">
          <div class="formButton" @click="changeEnable('mic')">
            <img src="@/assets/img/meeting/meeting_mic.png" alt="" v-if="form.enableMic">
            <img src="@/assets/img/meeting/meeting_mic_off.png" alt="" v-else>
            <p>麦克风</p>
          </div>
          <div class="formButton" @click="changeEnable('video')">
            <img src="@/assets/img/meeting/meeting_video.png" alt="" v-if="form.enableVideo">
            <img src="@/assets/img/meeting/meeting_video_off.png" alt="" v-else>
            <p>摄像头</p>
          </div>
          <el-button type="primary" @click="handleStartMeeting">{{ creatType === 'create' ? '开始会议' : '加入会议' }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { hasBlank, isOnlyNumber } from "@/utils/validate"
  const tvvsdk_constants = require("@/assets/js/sdk/tvvsdk_constants.js")
  import { addConference, isExistRoom, isMute,joinMeetingRoom } from "@/api/meeting"
  import { mapGetters } from 'vuex'
  import HeadAvatar from "@/components/headAvatar"

  let tvvssdk

  export default {
    name: "meetingMain",
    components:{
      HeadAvatar
    },
    props:{
      paramsRoomId:{
        type: String,
        default: ()=>{
          return ''
        }
      }
    },
    data() {
      return {
        addMeetingDialog: false,
        sender: "",
        userInfo: "",
        realName: "",
        confData: [],
        deviceInfo: [],
        speakerList: [],
        microphoneList: [],
        cameraList: [],
        createConfDialog: false,
        createConfForm: {
          description: "",
          bitrate: 4096000,
          publishers: 9,
          rec_dir: "/home/jack/videos",
          record: true,
          microphone: "0",
          camera: "0",
          speaker: "0",
          crypto: "0",
          size: tvvsdk_constants.resList[0].value,
          maxbr: tvvsdk_constants.brList[3].value,
          fps: tvvsdk_constants.fpsList[1].value,
          confmode: tvvsdk_constants.confModeList[2].value,
          confsize: tvvsdk_constants.resList[0].value,
          confminbr: tvvsdk_constants.brList[0].value,
          confmaxbr: tvvsdk_constants.brList[2].value,
          conffps: tvvsdk_constants.fpsList[1].value
        },
        joinConfDialog: false,
        joinConfForm: {
          desc: "",
          room: null,
          createTime: "",
          promoter: ""
        },
        time1: "",
        cameraDisabled: true,
        constants: tvvsdk_constants,
        form: {
          subject: '',
          // 是否启用麦克风
          enableMic: true,
          // 是否启用摄像头
          enableVideo: true,
          roomId: ''
        },
        defaultCamera: '0',
        // 创建方式 [create 创建, join 加入]
        creatType: 'create',
        btnLoading: false,
        // 是否全局禁音
        isAllMute: false,
        cameraSupport:true,
        audioSupport:true,
        imgUrl:'',
        videoStream:[],
        audioStream:[],
        localName:localStorage.getItem('USERNAME')
      }
    },
    mounted() {
      this.initialize()
      this.initRouterRoom()
      console.log(this.paramsRoomId,'this.paramsRoomId - this.paramsRoomId')
      document.addEventListener('keydown', this.enterHandler, true);
      
      
    },
    destroyed() {
      document.removeEventListener('keydown', this.enterHandler, true);
    },
    computed: {
      // 加入类型禁用 item
      showJoinItem() {
        return this.creatType === 'create'
      },
      ...mapGetters(['username']),
    },
    methods: {
      getUserAvatar(){
        this.imgUrl = this.$store.state.user.headAvatar
      },
      // 通过 protocol 加入房间的，根据路由参数加入
      initRouterRoom() {
        const query = this.$route.query
        if(query.roomId && query.stackKey) {
          // 挂载时检查是否为 加入房间 action
          const roomId = query.roomId || ''
          if (roomId) {
            this.form.roomId = roomId
            this.handleJoinMeeting()
            this.$electron.ipcRenderer.send('window-focus')
          }
        }
      },
      // enter 提交
      enterHandler(e) {
        if(this.addMeetingDialog && e.keyCode === 13) {
          this.handleStartMeeting()
        }
      },
      // 麦克风，摄像头 启用开关
      changeEnable(type) {
        if (type === 'mic') {
          if(this.audioSupport == false){
            return this.$message.warning('请打开麦克风权限！')
          }
          this.form.enableMic = !this.form.enableMic
        } else if (type === 'video') {
          if(this.cameraSupport == false){
            return this.$message.warning('请打开摄像头权限！')
          }
          this.form.enableVideo = !this.form.enableVideo
          if(this.form.enableVideo){
            this.imgUrl = ''
            this.checkCamera()
          }else{
            this.getUserAvatar()
            this.removeVideoEl()
          }
        }
      },
      // 开始会议
      handleStartMeeting() {
        if (this.creatType === 'create' && hasBlank(this.form.subject)) {
          this.$message.info('请输入您的会议主题')
          return
        }
        if (this.creatType === 'join') {
          if(hasBlank(this.form.roomId)) {
            this.$message.info('请输入会议ID')
            return
          }
          if(!isOnlyNumber(this.form.roomId)) {
            this.$message.info('输入ID必须为数字类型')
            return
          }
        }
        console.log(this.createConfForm,'handleStartMeeting')
        const data = {
          subject: this.form.subject,
          room: 'pc-'
        }
        if(this.creatType === 'create') {
          // 创建
          // FIXME:
          addConference(data).then(res => {
            if(res.data.code === 200) {
              const resData = res.data.data
              // const joinData = {
              //   id: 32
              //   subject: "pc001"
              //   userId: 419
              //   userName: "xxx"
              // }
              // 重新赋值到roomId
              const createdRoomData = {
                // id: resData.id,
                id:resData.roomNo,
                userId: resData.userId,
                userName: resData.userName,
                subject: resData.subject,
                adminName: `${resData.room}${resData.userName}`
              }
              this.form.roomId = res.data.data.roomNo
              localStorage.setItem('createdRoomData', JSON.stringify(createdRoomData))
              this.clickJoinConf();
            }
          })
        } else if(this.creatType === 'join') {
          // 加入查询
          const query = {
            id: this.form.roomId
          }
          isExistRoom(query).then(res => {
            if(res.data.code === 200) {
              // const joinData = {
              //   id: 32
              //   subject: "pc001"
              //   userId: 419
              //   userName: "蒋远林"
              // }
              const resData = res.data.data
              const createdRoomData = {
                // id: resData.id,
                id:resData.roomNo,
                userId: resData.userId,
                subject: resData.subject,
                userName: resData.userName,
                adminName: `${resData.room}${resData.userName}`
              }
              // 查询是否禁音
              isMute(query).then(ress => {
                if (ress.data.code === 200) {
                  const isMute = ress.data.data
                  // 如果被禁音了，关闭麦克风后加入
                  if (isMute) {
                    this.form.enableMic = false
                  }
                  this.isAllMute = isMute
                  localStorage.setItem('createdRoomData', JSON.stringify(createdRoomData))
                  joinMeetingRoom(query.id)
                  this.clickJoinConf();
                }
              })
            }else{
              this.$message({message: res.data.msg, type: 'error'})
            }
          })
        }
      },
      // 加入会议dialog
      handleJoinMeeting() {
        this.creatType = 'join'
        this.addMeetingDialog = true
        this.createConfForm.description = ""
        this.initDeviceList()
        this.checkCamera()
        this.checkAudio()
      },
      // 创建会议dialog
      handleShowMeetingDialog() {
        this.creatType = 'create'
        this.addMeetingDialog = true
        this.createConfForm.description = ""
        this.initDeviceList()
        this.checkCamera()
        this.checkAudio()
      },
      checkCamera () {
        const videoParam = { video: true }
        navigator.mediaDevices.getUserMedia(videoParam).then((stream) => {
          console.log(stream)
          this.videoStream.push(stream)
          const el = document.querySelector('.cameraArea')
          if(!this.form.enableVideo) return
          let video = el.querySelector('video') || document.createElement('video')
          video.style.width = '100%'
          video.style.height = '100%'
          video.style.objectFit = 'cover'
          video.srcObject = stream
          el.appendChild(video)
          video.play()
        })
        .catch(err => {
          console.log(err,'errVideo')
          if(err){
            this.cameraSupport = false
            this.form.enableVideo = false
            this.getUserAvatar()
          }
        })
      },
      checkAudio(){
        const audioParam = { audio: true }
        navigator.mediaDevices.getUserMedia(audioParam).then((stream) => {
          console.log(stream,'stream')
          this.audioStream.push(stream)
        })
        .catch(err => {
          console.log(err,'errAudio')
          if(err){
            this.audioSupport = false
            this.form.enableMic = false
          }
        })
      },
      closeStream(){
        this.audioStream.length && this.audioStream.map(item => {
          item.getTracks().map(track => {
            track.stop()
          })
        })
        this.videoStream.length && this.videoStream.map(item => {
          item.getTracks().map(track => {
            track.stop()
          })
        })
        this.removeVideoEl()
        this.videoStream = []
        this.audioStream = []
      },
      removeVideoEl(){
        this.$nextTick(() => {
          const el = document.querySelector('.cameraArea')
          const video = el.querySelectorAll('video')
          Array.from(video).map(item => {
            if(item) el.removeChild(item)
          })
        })
      },
      handleMeetingDialogCancel() {
        this.closeStream()
        // 重置form
        this.form = {
          subject: '',
          // 是否启用麦克风
          enableMic: true,
          // 是否启用摄像头
          enableVideo: true,
          roomId: ''
        }
        this.addMeetingDialog = false
        this.cameraSupport = true
        this.audioSupport = true
      },

      // 初始化
      initialize() {
        tvvssdk = this.$tvvssdk
        // 进出口
        // let options = {
        //   // websocketurl: 'ws://113.207.109.120:40002/websocket', // websocket信令服务URL
        //   // oamurl: 'https://113.207.109.120:40004', // 管理服务URL
        //   // stunurl: 'stun:113.207.109.120:40000' // stun服务器地址
        //   // 新的服务地址
        //   websocketurl:'wss://sphy.cguarantee.cn:40004/websocket',
        //   oamurl: 'https://sphy.cguarantee.cn:40004',
        //   stunurl: 'stun:113.207.109.120:40000'
        // }

        let options = {
          websocketurl: 'wss://meeting.zwan.com.cn:2237/websocket', // ws信令服务URL
          oamurl: 'https://meeting.zwan.com.cn:2237', // 管理服务URL
          stunurl: 'stun:stun.zwan.com.cn:2237' // stun服务器地址
        };
        // 张东环境
        // let options = {
        //   websocketurl: 'wss://meeting.zwan.com.cn:2337/websocket', // ws信令服务URL
        //   oamurl: 'https://meeting.zwan.com.cn:2337', // 管理服务URL
        //   stunurl: 'stun:stun.zwan.com.cn:2331'
        // };

        tvvssdk.init(options, function (res) {
          if (res.success) {
            console.log(res.msg)
          } else {
            alert(res.msg)
          }
        })
      },
      // 初始化设备列表
      initDeviceList() {
        let _this = this
        this.$store.dispatch("DeviceInfo")
        this.deviceInfo = this.$store.state.meeting.deviceInfo
        console.log('initDeviceList', this.deviceInfo)
        tvvssdk.getAllDevices(function (devices) {
          console.log(devices)
          _this.microphoneList.length = 0
          _this.speakerList.length = 0
          _this.cameraList.length = 0
          console.log('devices===>', devices)
          devices.forEach(function (device, index, arr) {
            if (device.kind === "audioinput") {
              _this.microphoneList.push(device)
            } else if (device.kind === "audiooutput") {
              _this.speakerList.push(device)
            } else if (device.kind === "videoinput") {
              _this.defaultCamera = device.deviceId
              _this.cameraList.push(device)
            }
          })
        })
      },
      // 加入房间
      clickJoinConf() {
        localStorage.setItem(`creatType`, this.creatType)
        let setDeviceInfoData = {}
        setDeviceInfoData = {
          microphone: 'default',
          speaker: this.form.enableMic ? 'default' : '0',
          camera: this.form.enableVideo ? this.defaultCamera : '0',
          size: 'lowres-16:9',
          maxbr: 500 * 1024,
          fps: 15,
          confmode: 2,
          confsize: 'lowres-16:9',
          confminbr: 150 * 1024,
          confmaxbr: 500 * 1024,
          conffps: 15,
        }
        // setDeviceInfoData = {
        //   microphone: this.createConfForm.microphone,
        //   speaker: this.createConfForm.speaker,
        //   camera: this.createConfForm.camera,
        //   size: this.createConfForm.size,
        //   maxbr: this.createConfForm.maxbr,
        //   fps: this.createConfForm.fps,
        //   confmode: this.createConfForm.confmode,
        //   confsize: this.createConfForm.confsize,
        //   confminbr: this.createConfForm.confminbr,
        //   confmaxbr: this.createConfForm.confmaxbr,
        //   conffps: this.createConfForm.conffps
        // }


        // setDeviceInfoData = {
        //   microphone: "default",
        //   speaker: "b3bc3d344aa36d6898decc0c55c277cc1894543bb85d0f02b22876a99a74957a",
        //   camera: "32bf66d3d793f90c1e6d0b821f98f2ac9256b0238c581e669b7c186977128b71",
        //   size: "lowres-16:9",
        //   maxbr: 'unlimited',
        //   fps: 20,
        //   confmode: 'sfu-up',
        //   confsize: 'lowres-16:9',
        //   confminbr: 512000,
        //   confmaxbr: 2097152,
        //   conffps: 15
        // }
        console.log('setDeviceInfoData', setDeviceInfoData)

        this.$store.dispatch("SetDeviceInfo", setDeviceInfoData)
        clearInterval(this.time1)

        const data = {
          creatType: this.creatType,
          roomId: this.form.roomId
        }
        const initMeetingEnableConfig = {
          enableMic: this.form.enableMic,
          enableVideo: this.form.enableVideo,
          isAllMute: this.isAllMute
        }
        localStorage.setItem('initMeetingEnableConfig', JSON.stringify(initMeetingEnableConfig))
        const roomActionDataStr = JSON.stringify(data)
        this.$electron.ipcRenderer.send('create-meeting-window', roomActionDataStr)
        this.handleMeetingDialogCancel()
      },
    },
    watch: {
      '$route.query': {
        handler(query) {
          this.initRouterRoom()
        }
      },
      paramsRoomId(oldVal, newVal){
        if(this.paramsRoomId != ''){
          this.handleJoinMeeting()
          this.form.roomId = this.paramsRoomId
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
.meetingMainView{
  padding: 25px 20px;
  .title{
    font-size: 20px;
    margin-bottom: 20px;
  }
  .content{
    display: flex;
    justify-content: space-between;
    >div{
      font-size: 14px;
      color: #0F1633;
      width: 148px;
      height: 114px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      flex-flow: column;
      padding: 18px 16px;
      cursor: pointer;
      img{
        width: 44px;
        height: 44px;
        margin-bottom: 20px;
      }
      p{
        margin: 0;
      }
    }
    >div:nth-of-type(1){
      background: #EBF1FE;
    }
    >div:nth-of-type(2){
      background: #FEEAD2;
    }
  }
}
.modalContent{
  margin-top: 15px;
  display: flex;
  flex-flow: column;
  align-items: center;
  ::v-deep .el-input__inner{
    border-radius: 0;
    border: none;
    border-bottom: 1px solid #3370FF;
    text-align: center;
    font-size: 18px;
  }
  ::v-deep .el-input{
    width: 376px;
  }
  .cameraArea{
    margin: 32px 0 29px 0;
    width: 448px;
    height: 252px;
    background: #F5F8FF;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    img{
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }
  }
  .formAction{
    display: flex;
    justify-content: space-between;
    padding: 0 92px;
    width: 100%;
    align-items:center;
    .formButton{
      text-align: center;
      cursor: pointer;
      user-select: none;
      img{
        width: 22px;
        height: 22px;
      }
      p{
        margin: 0;
        font-size: 10px;
        color: #1F2329;
      }
    }
    .el-button--primary{
      height:36px;
      border-radius: 4px;
      width: 112px;
    }
  }
}
::v-deep .el-dialog{
  border-radius: 6px;
  .el-dialog__header{
    background: #fff;
    height: 40px;
    padding: 10px 20px 0 20px!important;
  }
  .el-dialog__body{
    padding: 0 30px 30px 30px;
  }
}
</style>
