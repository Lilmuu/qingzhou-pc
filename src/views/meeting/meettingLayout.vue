<template>
  <div class="meetingLayout">
    <div class="layoutLeft">
      <MeetingMain ref="meetingMain" :paramsRoomId='paramsRoomId'></MeetingMain>
    </div>
    <div class="layoutRight">
      <div class="title">
        <div class="titleItem flex-center"><img src="@/assets/img/meeting/meetingRecord.png" alt=""></div>
        <div class="titleItem1"></div>
      </div>
      <div class="content">
        <div class="list">
          <template v-if="routerLists.length">
            <div class="listOne" v-for="(router, index) in routerLists" :key="'routerlist' + index">
              <div class="listOneLeft flex-center"><img src="@/assets/img/meeting/meetingRecord_list.png" alt=""></div>
              <div class="listOneRight">
                <p>{{ router.subject }}</p>
                <p>
                  <span><img src="@/assets/img/meeting/meetingRecord_user.png" alt="">{{ router.userName }}</span>
                  <span><img src="@/assets/img/meeting/meetingRecord_time.png" alt=""><span>{{ dayjs(router.createTime).format('YYYY-MM-DD HH:mm') }}</span></span>
                </p>
              </div>
            </div>
          </template>
          <div v-else class="nodata">
            <div>
              <img src="@/assets/img/meeting/nodata.png" alt="" style="width: 120px;">
              <p>暂无会议记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import MeetingMain from "@/views/meeting/meetingMain"
import { getConferenceList } from "@/api/meeting";

const tvvsdk_constants = require("@/assets/js/sdk/tvvsdk_constants.js")
let tvvssdk

export default {
  name: "meetingLayout",
  components: {
    MeetingMain
  },
  data() {
    return {
      dayjs,
      activeId: -1,
      folderDialog: false,
      paramsRoomId: '', // 点击链接跳转过来的 房间ID
      routerLists: [
        // {
        //   createTime: "2021-03-10 09:55:19",
        //   delFlag: "0",
        //   id: 1,
        //   meetingTime: 0,
        //   state: 0,
        //   subject: "111",
        //   tenantId: 1,
        //   updateTime: "2021-03-10 09:55:19",
        //   userId: 11,
        //   userName: "18725948578",
        // },
      ],
      sources: [],
      sender: {},
      userInfo: {},
      realName: {},
      confData: [],
      deviceInfo: [],
      speakerList: [
        // {
        // 	id: "1",
        // 	name: "測試"
        // },
        // {
        // 	id: "2",
        // 	name: "測試2"
        // }
      ],
      microphoneList: [
        // {
        // 	id: "1",
        // 	name: "測試"
        // },
        // {
        // 	id: "2",
        // 	name: "測試2"
        // }
      ],
      cameraList: [
        // {
        // 	id: "1",
        // 	name: "測試"
        // },
        // {
        // 	id: "2",
        // 	name: "測試2"
        // }
      ],
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
        confmode: tvvsdk_constants.confModeList[0].value,
        confsize: tvvsdk_constants.resList[2].value,
        confminbr: 500 * 1024,
        confmaxbr: tvvsdk_constants.brList[2].value,
        conffps: tvvsdk_constants.fpsList[1].value
      }
    }
  },
  mounted() {
    // this.initDeviceList();

    let params = this.$route.params.roomId
    console.log(this.$route,'this.$route-this.$route')
    console.log(params,'params-params')
    this.paramsRoomId = params ? params : ''
    console.log(this.paramsRoomId,'paramsRoomId-paramsRoomId')
    this.handleGetList()
    this.$electron.ipcRenderer.on('meeting-window-close-cb', (event, data) => {
      if(data){
        this.$electron.ipcRenderer.send('meeting-window-shareShrink-close')
      }
      this.handleGetList()
    })
  },
  methods: {
    // initConfig() {
    //   const options = {
    //     types: ['window', 'screen'],
    //     thumbnailSize: { width: 1280, height: 720 }
    //   }
    //  // see https://www.cnblogs.com/chenbeibei520/p/11151750.html
    //  desktopCapturer.getSources(options).then(async sources => {
    //   for (const source of sources) {
    //   this.sources = sources
    //      if (source.name === '轻舟') {
    //       try {
    //         const stream = await navigator.mediaDevices.getUserMedia({
    //           audio: false,
    //           video: {
    //             mandatory: {
    //               chromeMediaSource: 'desktop',
    //               chromeMediaSourceId: source.id,
    //               minWidth: 1280,
    //               maxWidth: 1280,
    //               minHeight: 720,
    //               maxHeight: 720
    //             }
    //           }
    //         })
    //         handleStream(stream)
    //       } catch (e) {
    //         console.error(e)
    //       }
    //       return
    //     }
    //   }
    // })
    //
    //   function handleStream(stream) {
    //     const video = document.querySelector('video')
    //     video.srcObject = stream
    //     video.onloadedmetadata = (e) => video.play()
    //   }
    // },
    // 会议日志
    handleGetList() {
      getConferenceList().then(res => {
        if(res.data.code === 200) {
          this.routerLists = res.data.data
        }
      })
    },
    handleMenuRouterClick(id) {
      this.activeId = id
    },
    // 初始化设备列表
    initDeviceList() {
      const _this = this
      this.$store.dispatch("DeviceInfo")
      this.deviceInfo = this.$store.state.meeting.deviceInfo;
      console.log(this.deviceInfo)
      tvvssdk.getAllDevices(function(devices) {
        console.log(devices)
        _this.microphoneList.length = 0
        _this.speakerList.length = 0
        _this.cameraList.length = 0
        devices.forEach(function(device, index, arr) {
          if (device.kind === "audioinput") {
            _this.microphoneList.push(device)
          } else if (device.kind === "audiooutput") {
            _this.speakerList.push(device)
          } else if (device.kind === "videoinput") {
            _this.cameraList.push(device)
          }
        })
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.meetingLayout{
  width: 100%;
  height: 100%;
  display: flex;
  background: #fff;
  .layoutLeft{
    width: 360px;
    height: 100%;
    user-select: none;
  }
  .layoutRight{
    flex: 1;
    display: flex;
    flex-flow: column;
    .title{
      width: 100%;
      height: 52px;
      display: flex;
      align-items: flex-end;
      .titleItem{
        width: 135px;
        height: 42px;
        background: #F5F6F7;
        border-radius: 6px 6px 0 0;
        margin-left: 17px;
        position: relative;
        img{
          width: 90px;
          height: 16px;
        }
      }
      .titleItem::before{
        content: '';
        position: absolute;
        left: -10px;
        width: 10px;
        top: 0;
        bottom:0;
        background: #F5F6F7;
      }
      .titleItem::after{
        content: '';
        position: absolute;
        left: -10px;
        width: 10px;
        top: 0;
        bottom:0;
        background: #fff;
        border-radius: 0 0 5px 0;
      }
      .titleItem1{
        width:10px;
        height: 42px;
        background: #F5F6F7;
        position: relative;
      }
      .titleItem1::before{
        content: '';
        position: absolute;
        left: 0;
        width: 10px;
        top: 0;
        bottom:0;
        background: #fff;
        border-radius: 0 0 0 5px;
      }
    }
    .content{
      flex: 1;
      width: 100%;
      background: #F5F6F7;
      padding: 10px;
      overflow: hidden;
      .list{
        background: #fff;
        width: 100%;
        height: 100%;
        padding: 10px 10px 10px 20px;
        overflow-y: auto;
        border-radius: 10px;
        .listOne{
          padding: 0 10px;
          display: flex;
          align-items: center;
          .listOneLeft{
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #EFF0F1;
            margin-right: 12px;
            img{
              width: 15.5px;
              height: 15.5px;
            }
          }
          .listOneRight{
            padding: 16px 0 14px 0;
            display: flex;
            flex-flow: column;
            justify-content: space-between;
            border-bottom: 1px solid #F5F6F7;
            flex: 1;
            p{
              margin: 0;
              font-size: 14px;
              color: #1F2329;
            }
            p:nth-of-type(2){
              font-size: 12px;
              color: #8F959E;
              margin-top: 6px;
              display:flex;
              >span{
                margin-right: 20px;
                display: flex;
                align-items: center;
              }
              img{
                width: 12px;
                height: 12px;
                margin-right: 10px;
              }
            }
          }
        }
        .listOne:hover{
          background: #F5F6F7;
          border-radius: 10px;
          .listOneLeft{
            background: #fff;
          }
        }
      }
      .list::-webkit-scrollbar {
        width: 5px;
      }
      .list::-webkit-scrollbar-track {
        background-color: #fff;
        border-radius: 0 10px 10px 0;
      }
      .nodata{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        >div{
          font-size: 14px;
          color: #8F959E;
          text-align: center;
          img{
            width: 120px;
            height: 120px;
          }
          p{
            margin: 20px 0 0 0;
          }
        }
      }
    }
  }
  .flex-center{
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
