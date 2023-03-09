<template>
  <div class="meetingRoomContainer">
    <MeetingNavBar
      :navBarInfo="{
        subject: createdRoomData.subject,
        roomId,
        shareMeetingLink,
      }"
      :showUserListDrawer="showUserListDrawer"
      :videoLayout="videoLayout"
      @onClose="handleCallOff"
      v-show="!isFullScreen"
      @handleShowUser="handleShowUserListDrawer"
      @checkMenu="checkMenu"
    ></MeetingNavBar>
    <div class="full-height meetingScreenContainer">
      <!-- 视频 -->
      <div class="meetingScreen" style="position: relative">
        <!--单个 模式-->
        <img
          v-if="showIcon"
          @click="showMeetingShareWindow"
          src="@/assets/img/meeting/suoxiao.png"
          alt=""
          class="buttonShrink"
        />
        <div
          class="meetingScreen"
          :style="{
            height: showActionBar
              ? 'calc(100vh - 167px)'
              : 'calc(100vh - 82px)',
            position: 'relative',
          }"
        >
          <!-- <img src="@/assets/img/meeting/ca.png" class="meetingScreen" alt=""> -->
          <div
            :class="[
              'videoViewContent',
              videoList.length > 9 ? 'videoViewContentMore' : '',
              confMemberNum == 2 ? 'videoFlex' : '',
            ]"
          >
            <!-- 消息房间，声音流 -->
            <video
              id="audioPlayer"
              ref="audioPlayer"
              autoplay
              playsinline
              loop
              style="display: none"
            ></video>
            <div
              v-for="(item, index) in mergeStream"
              :style="index === 0 ? mainVideoStyle : otherVideoStyle"
              class="videoDiv"
              :key="item.video"
              @click="switchVideo(index)"
              @contextmenu.prevent="handleShowDialogTip($event, item)"
              @dblclick="handleSetMainScreen(item.name)"
            >
              <!--              <div class="videoAlt flex-center" v-show="item.extra.video === false">-->
              <!--                <div class="videoAltAvatar flex-center">-->
              <!--                  <div>{{ formatRoomName(item.name) | formatUserName }}</div>-->
              <!--                </div>-->
              <!--              </div>-->
              <div class="videoExtra2" v-if="videoLayout === 1">
                <el-row>
                  <el-col :span="24">
                    <div class="nameDiv">
                      <span>
                        {{ formatRoomName(item.name) }}
                      </span>
                      <span
                        class="compere"
                        v-if="
                          createdRoomData.userName === formatRoomName(item.name)
                        "
                        >主持人</span
                      >
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div
                class="videoOffArea"
                v-if="(item.extra && !item.extra.video) || item.showAvatar"
              >
                <HeadAvatar
                  :size="100"
                  :fontSize="30"
                  :avatarUrl="item.avatar"
                  :username="formatRoomName(item.name)"
                >
                </HeadAvatar>
              </div>
              <!--  给 video 加上唯一标识 item.name，task-pc-33 以此查index -->
              <video
                :id="`video${index}`"
                :ref="`video${index}`"
                :class="[item.name ? 'videoNameItem' : '']"
                :data-name="item.name"
                :data-roomsessionid="item.sessionid"
                :muted="item.video === 'localVideo'"
                autoplay
                playsinline
                loop
                style="
                  background-color: #000000;
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                "
              />
            </div>
            <div
              id="container-vr"
              style="width: 100%; height: 100%"
              v-show="isVrDeveloped"
            ></div>
            <div
              id="container-mark"
              class="container-mark"
              v-show="showMarkDialog"
              align="center"
            ></div>
          </div>
        </div>
      </div>
      <!-- 消息列表 -->
      <div class="meetingMessageContainer" v-if="msgList.length">
        <el-scrollbar ref="msgScroll" class="noScroll meetingMsgList">
          <div
            :class="[
              'meetingMsgItem',
              msg.isShow ? '' : 'msgHide',
              msg.isDisplay ? 'msgDisplay' : '',
            ]"
            :key="'message' + index"
            v-for="(msg, index) in msgList"
          >
            <template v-if="msg.msgType === 'likeMsg'">
              <div class="messageItemLeft">
                <HeadAvatar
                  :size="32"
                  :fontSize="12"
                  :avatarUrl="msg.avatar"
                  :username="formatUsersName(msg.name)"
                  style="margin-right: 10px"
                >
                </HeadAvatar>
              </div>
              <div class="messageItemRightdianzan">
                <p>
                  <span>{{
                    formatUsersName(msg.name) == myself
                      ? `${formatUsersName(msg.name)}（我）`
                      : formatUsersName(msg.name)
                  }}</span>
                  <span
                    class="compere"
                    v-if="
                      createdRoomData.userName === formatUsersName(msg.name)
                    "
                    >主持人</span
                  >
                  <img src="@/assets/img/meeting/upIcon1.png" alt="" />
                </p>
              </div>
            </template>
            <template v-else>
              <HeadAvatar
                :size="32"
                v-if="msg.name.indexOf('!!') !== -1 || msg.avatar"
                :fontSize="12"
                :avatarUrl="msg.avatar"
                :username="formatRoomName(msg.name)"
                style="margin-right: 10px"
              >
              </HeadAvatar>
              <div class="messageItemRight">
                <p>
                  {{
                    formatUsersName(msg.name) == myself
                      ? `${formatUsersName(msg.name)}（我）`
                      : formatUsersName(msg.name)
                  }}<span
                    class="compere"
                    v-if="
                      createdRoomData.userName === formatUsersName(msg.name)
                    "
                    >主持人</span
                  >
                </p>
                <p>{{ msg.content }}</p>
              </div>
            </template>
          </div>
          <!--          <div class="meetingMsgItem">-->
          <!--            <span class="otherMsg">xxx</span>: <span>666</span>-->
          <!--          </div>-->
        </el-scrollbar>
      </div>
      <div class="action-bottom-bar-container">
        <div
          class="action-bottom-bar_icon flex-center cursor"
          @click="handleShowActionBar"
        >
          <div>
            <i
              :class="[
                'bottom-action-bar-arrow',
                showActionBar ? 'el-icon-arrow-down' : 'el-icon-arrow-up',
              ]"
            ></i>
          </div>
        </div>
        <div
          v-loading="btnLoading"
          :class="[
            'action-bottom-bar',
            showActionBar ? 'action-bottom-bar-show' : 'action-bottom-bar-hide',
          ]"
        >
          <!--  说点什么    -->
          <div class="bottom-say-bar">
            <el-input
              placeholder="请输入内容"
              v-model="input"
              @keyup.enter.native="sendMsg"
              :class="
                canSend ? 'input-with-select canSend' : 'input-with-select'
              "
            >
              <!--发送-->
              <!-- <el-button slot="append" icon="el-icon-position" @click="sendMsg"></el-button> -->
              <img
                @click="sendMsg"
                src="@/assets/img/meeting/sendMessage.png"
                alt=""
                slot="append"
                style="width: 14px; height: 14px; cursor: pointer"
              />
            </el-input>
            <!-- 点赞 -->
            <img
              class="cursor msgUpIcon"
              @click="handleAddLike"
              src="@/assets/img/meeting/upIcon.png"
              alt=""
            />
          </div>
          <!--   底部操作栏   -->
          <div class="bottom-action-bar flex-space-between">
            <div
              class="bottom-action-bar-item cursor"
              @click="changeEnable('mic')"
            >
              <div class="meeting-form-action-icon flex-center">
                <img
                  src="@/assets/img/meeting/mic_on.png"
                  alt=""
                  v-if="enableMic"
                />
                <img src="@/assets/img/meeting/mic_off.png" alt="" v-else />
              </div>
              <span>麦克风</span>
            </div>
            <div
              class="bottom-action-bar-item cursor"
              @click="changeEnable('video')"
            >
              <div class="meeting-form-action-icon flex-center">
                <img
                  src="@/assets/img/meeting/video_on.png"
                  alt=""
                  v-if="enableVideo"
                />
                <img src="@/assets/img/meeting/video_off.png" alt="" v-else />
              </div>
              <span>摄像头</span>
            </div>
            <div class="bottom-action-bar-item cursor" @click="handleCallOff">
              <div :class="['meeting-form-action-icon flex-center']">
                <img src="@/assets/img/meeting/call_on.png" />
              </div>
              <span>离开会议</span>
            </div>
            <div
              class="bottom-action-bar-item cursor"
              @click="changeEnable('shareScreen')"
            >
              <div class="meeting-form-action-icon flex-center">
                <img
                  src="@/assets/img/meeting/share_off.png"
                  alt=""
                  v-if="enableShareScreen"
                />
                <img src="@/assets/img/meeting/share.png" alt="" v-else />
              </div>
              <span>{{ enableShareScreen ? "结束共享" : "共享屏幕" }}</span>
            </div>
            <div
              class="bottom-action-bar-item cursor"
              @click="changeEnable('vol')"
            >
              <div class="meeting-form-action-icon flex-center">
                <img
                  src="@/assets/img/meeting/vol.png"
                  alt=""
                  v-if="enableVol"
                />
                <img src="@/assets/img/meeting/vol_off.png" alt="" v-else />
              </div>
              <span>扬声器</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 用户列表   -->
    <transition
      enter-active-class="animate__fadeInRight"
      leave-active-class="animate__fadeOutRight"
    >
      <UserListDrawer
        class="animated"
        :list="userList"
        :createdRoomData="createdRoomData"
        :isMeetingAdmin="isMeetingAdmin"
        :muteUserList="muteUserList"
        :volUserList="volUserList"
        @handleMuteAll="handleMuteAll"
        @handleMuteUser="handleMuteUser"
        @handleVolUser="handleVolUser"
        @close="handleShowUserListDrawer"
        v-show="showUserListDrawer"
      ></UserListDrawer>
    </transition>

    <!-- qos信息   -->
    <div v-show="isShowQosDialog" class="dialog-qos">
      <div>
        <div class="qosItem">
          <div class="qosItemTitle">qos数据</div>
          <button @click="handleCloseQos" class="cursor btn-stopQos">X</button>
        </div>
        <div class="qosItem">
          <div class="qosItemTitle">roomid</div>
          <div>{{ rightMenuItem.name }}</div>
        </div>
        <div class="qosItem">
          <div class="qosItemTitle">sessionid</div>
          <div>{{ rightMenuItem.sessionid }}</div>
        </div>
        <div
          class="qosItem"
          v-for="(qos, index) in qosData"
          :key="'qos' + index"
        >
          <div class="qosItemTitle">{{ qos.name }}</div>
          <div>{{ qos.value }}</div>
        </div>
      </div>
    </div>

    <!-- 右键菜单Tip   -->
    <div
      class="meeting-right-menu-container"
      v-clickoutside="handleHideDialogTip"
    >
      <div class="cursor" @click="handleShowQos">显示qos信息</div>
    </div>
    <!--  选择需要共享的屏幕 dialog    -->
    <el-dialog
      append-to-body
      :visible.sync="selectScreenDialog"
      :before-close="handleSelectScreenDialogCancel"
      class="select-dialog"
      width="1000px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <DialogHeader
        title="共享屏幕"
        slot="title"
        @closeCustomDialog="selectScreenDialog = false"
      ></DialogHeader>
      <div class="sourceListContainer">
        <!-- 这里修改一下，排除轻舟未读消息列表 -->
        <template v-for="(screen, index) in sourceList">
          <div
            class="sourceListItem cursor"
            @click="handleSelectScreen(screen.id)"
            :key="'sourceList' + index"
            v-if="
              screen.name != '轻舟未读消息列表' &&
              screen.name != '轻舟会议' &&
              screen.name.indexOf('Screen') == -1
            "
          >
            <div class="ellipsis">{{ replaceScreenName(screen.name) }}</div>
            <img :src="screen.imgSrc" class="screenImg" alt="" />
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { hasBlank } from "@/utils/validate";
// import * as THREE from "@/assets/js/three.js"
// import {VR} from "@/assets/js/mxreality.js";
import MeetingNavBar from "./components/MeetingNavbar";
import UserListDrawer from "@/views/meeting/components/userListDrawer";
import { config } from "@/const/dicData";
import { closeConferenceGET } from "@/api/meeting";
import EventBus from "@/eventBus";
import { displayUserName } from "@/utils";
import { updateByMute } from "@/api/meeting";
import DialogHeader from "@/components/dialogHeader";
import { getAvatarByImId } from "@/api/user";
import HeadAvatar from "@/components/headAvatar";

const myRealName = `${localStorage.getItem("USERNAME")}!!${
  JSON.parse(localStorage.getItem("SKIM_MeId")).data
}`;
// const myRealName = localStorage.getItem('USERNAME')
const USERNAME = `pc-` + myRealName;

const tvvsdk_constants = require("@/assets/js/sdk/tvvsdk_constants.js");
let vr;
let container;
let renderer;

let tvvssdk;
let time2 = null;
let qosIntervalId = -1;
let joined = [];
let joinedNum = 1;
// 是否已经操作了流
let streamFlag = false;
// 是否全局禁音
let disableAllMic = false;
// 是否已断开网络
let isOffLine = false;
// 推流了几次
let streamingCount = 0;
// 队列
const taskQueue = [];
// sessionid map
const sessionIdMap = new Map();
// 队列消费中
let isWorking = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  name: "meetingMain",
  components: {
    MeetingNavBar,
    UserListDrawer,
    DialogHeader,
    HeadAvatar,
  },
  data() {
    return {
      myself: localStorage.getItem("USERNAME"),
      btnLoading: false,
      shareMeetingLink: "",
      input: "",
      enableMic: false, // 是否启用麦克风
      enableShareScreen: false, // 是否启用分享屏幕
      enableVideo: false, // 是否启用摄像头
      enableCallOn: false, //
      enableVol: true, // 是否启用喇叭
      showUserListDrawer: false,
      roomId: "", // `meetingRoom-${sessionid}`
      creatType: "create",
      // sessionId
      sessionId: "",
      videoCurrentTime: "00:00:00",
      authTime: 0,
      authTimeTimer: "",
      tag: "videostream",
      userList: [],
      confMemberNum: 1,
      deviceInfo: {
        confmode: {},
      },
      videoList: [
        {
          video: "video0",
          stream: null,
          name: "",
          index: "",
          show: false,
          sessionid: -1,
          extra: {},
        },
      ],
      // 声音流
      audioVideo: {
        stream: null,
        sessionid: -1,
      },
      isFullScreen: false,
      HisIsFull: false,
      isSolo: false, // 0 单窗口
      videoLayout: 0, //  [0: 列表模式， 1: 九宫格模式]
      mainVideoStyle: { width: "100%", height: "calc(100% - 2px)" },
      otherVideoStyle: { width: "33.33%", height: "calc(33.33% - 4px)" },
      tabsHeight: "calc(100vh - 101px)", // 初始化的高度和equalLayout对应，equalLayout为true为760.否则为860
      tabsMsgHeight: "calc(100vh - 150px)", // 初始化的高度和equalLayout对应，equalLayout为true为760.否则为860
      isShowQosDialog: false,
      isShowSwitchSize: false,
      isShowSwitchBR: false,
      isShowSwitchConfSize: false,
      isShowSwitchConfBR: false,
      isShowSwitchConfFPS: false,
      qosData: {},
      confSize: "",
      confBr: tvvsdk_constants.brList[3].value,
      confFPS: 10,
      msgList: [],
      // msg当前的下标数组
      msgIndexList: [],
      // 用作开关，上一个隐藏完成后才能进行下一个
      isNextHideMsgList: false,
      isVrDeveloped: false,
      showMarkDialog: false,
      MarkCanvasWidth: 0,
      MarkCanvasHeight: 0,
      MarkCanvasPaddingTop: 0,
      constants: tvvsdk_constants,
      // 选择screen
      selectScreenDialog: false,
      // screen 列表
      sourceList: [
        // {
        //   appIcon: null,
        //   display_id: "2528732444",
        //   id: "screen:0:0",
        //   name: "Entire Screen",
        //   imgSrc: '', base64 缩略图
        //   thumbnail: 缩略图 }
      ],
      sessionid: "",
      mySelfRoomId: "",
      username: USERNAME,
      // 自己房间的session
      mySelfRoomSession: "",
      // 被禁音用户
      muteUserList: [],
      // 单独被打开麦克风的用户
      openMuteUserList: [],
      // 被关闭麦克风的用户
      volUserList: [],
      // 共享回调函数
      sourceCallbackFunc: null,
      // 创建房间者信息
      createdRoomData: {
        id: "",
        userId: "",
        userName: "",
        adminName: "",
        subject: "",
      },
      // 显示操作栏
      showActionBar: true,
      // 右键菜单video item
      rightMenuItem: {
        name: "",
        sessionid: "",
      },
      // 主视图名称
      mainViewName: "",
      // 保存最开始的主视图名称
      oldMainViewName: "",
      // 是否在九宫格进行主视图切换
      isDbClickFlag: false,
      // 自己是否被管理员单独静音了
      isAdminMust: null,
      //显示右上角缩小图标
      showIcon: false,
      initMeetingEnableConfig: {},
    };
  },
  mounted() {
    console.log("window url", window.location.href);
    // 初始化进入房间前开始设置的配置
    const initMeetingEnableConfigStr = localStorage.getItem("initMeetingEnableConfig");
    if (initMeetingEnableConfigStr) {
      this.initMeetingEnableConfig = JSON.parse(initMeetingEnableConfigStr);
      this.enableMic = this.initMeetingEnableConfig.enableMic;
      this.enableVideo = this.initMeetingEnableConfig.enableVideo;
      disableAllMic = this.initMeetingEnableConfig.isAllMute;
    }
    // 初始化 createdRoomData
    const createdRoomDataStr = localStorage.getItem("createdRoomData");
    this.createdRoomData = JSON.parse(createdRoomDataStr);
    this.mySelfRoomId = `roomSelf-${USERNAME}`;
    this.initRoomConfig();

    // 已存在会议窗口的情况下，重载新的url
    this.$electron.ipcRenderer.on("loadNewMeetingUrl", (event, url) => {
      window.location.href = url;
      window.location.reload();
    });

    // 网络断开提示
    window.addEventListener("offline", this.offLineListener);
    //关闭共享窗口
    this.$electron.ipcRenderer.on("meeting-window-shareShrink-close-cb", () => {
      this.$electron.ipcRenderer.send("meeting-window-show", {
        showIcon: false,
      });
      if (!this.enableShareScreen) return;
      this.shareScreen();
    });
    //打开共享屏幕小窗口
    this.$electron.ipcRenderer.on("showNarrowIcon", (e, showIcon) => {
      this.showIcon = showIcon;
    });
  },
  destroyed() {
    window.removeEventListener("offline", this.offLineListener);
  },
  computed: {
    // 是否可发送
    canSend() {
      return !hasBlank(this.input) && this.input.length > 0;
    },
    // 是否为会议创建人
    isMeetingAdmin() {
      return this.createdRoomData.adminName === USERNAME.split("!!")[0];
      // return this.createdRoomData.adminName === USERNAME
    },
    // 合并画面
    mergeStream() {
      // 为九宫格模式下永远找创房间的为主视图 否者其他不变
      const mainViewName = this.mainViewName;
      const mainVideoList = this.videoList.filter( (v) => v.name === (this.videoLayout == 2 ? this.oldMainViewName : mainViewName));
      const otherVideoList = this.videoList.filter( (v) => v.name !== (this.videoLayout == 2 ? this.oldMainViewName : mainViewName) );
      const loadedVideoList = [...mainVideoList, ...otherVideoList];
      console.warn("loadedVideoList", loadedVideoList);
      return loadedVideoList;
    },
  },
  methods: {
    // 对带有screen的屏幕名字进行replace
    replaceScreenName(value) {
      if (value.indexOf("Screen") != -1) {
        if (value == "Entire Screen") {
          return "桌面：全部共享";
        } else {
          return value.replace("Screen", "屏幕");
        }
      } else {
        return value;
      }
    },
    // 初始化配置信息
    initRoomConfig() {
      const _this = this;
      tvvssdk = _this.$tvvssdk;
      _this.creatType = this.$route.query.creatType;
      _this.btnLoading = true;
      // 进出口
      let options = {
        websocketurl: "ws://113.207.109.120:40002/websocket", // websocket信令服务URL
        oamurl: "https://113.207.109.120:40004", // 管理服务URL
        stunurl: "stun:113.207.109.120:40000", // stun服务器地址
        // 新的服务地址
        // websocketurl:'wss://sphy.cguarantee.cn:40004/websocket',
        // oamurl: 'https://sphy.cguarantee.cn:40004',
        // stunurl: 'stun:113.207.109.120:40000'
      };

      // 内网
      // let options = {
      //    websocketurl: 'ws://10.0.0.125:2238/websocket', // websocket信令服务URL
      //    oamurl: 'https://10.0.0.125:2237/oam', // 管理服务URL
      //    stunurl: 'stun:10.0.0.125:2231' // stun服务器地址
      // }

      // let options = {
      //   websocketurl: 'ws://meeting.zwan.com.cn:2238/websocket', // ws信令服务URL
      //   oamurl: 'https://meeting.zwan.com.cn:2237', // 管理服务URL
      //   stunurl: 'stun:stun.zwan.com.cn:2231'
      // };

      // 张东环境
      // let options = {
      //   websocketurl: 'wss://meeting.zwan.com.cn:2237/websocket', // ws信令服务URL
      //   oamurl: 'https://meeting.zwan.com.cn:2237', // 管理服务URL
      //   stunurl: 'stun:stun.zwan.com.cn:2331'
      // };

      console.log("初始化 tvvssdk.init start", options);
      tvvssdk.init(options, function (res) {
        console.log("初始化 tvvssdk.init callback", res);
        if (res.success) {
          // 初始化成功
        } else {
          this.$message.error("连接服务器失败");
        }
      });
      this.$store.dispatch("DeviceInfo");
      this.deviceInfo = this.$store.state.meeting.deviceInfo;

      console.log("初始化 tvvssdk.createConnection start");

      tvvssdk.createConnection(function (res) {
        console.log("初始化 tvvssdk.createConnection callback", res);
        if (res.success || res.disconnected) {
          if (res.disconnected) {
            console.warn(
              `initRoomConfig 消息房间 ICE连接失败,正在重新连接: ${_this.roomId} ${res.sessionid}`
            );
            tvvssdk.streamStop(res.sessionid);
            const sessionid = res.sessionid;
            _this.sessionid = sessionid;
            _this.audioStreamStart(res.sessionid);
            setTimeout(() => {
              if (_this.enableMic === false) {
                _this.handleMuteMySelf(false);
              }
            }, 2000);
            return;
          }

          //服务器连接成功，可以进行加入房间操作，应用层应该保存res.sessionid，后续操作都需要携带sessionid
          const sessionid = res.sessionid;
          _this.sessionid = sessionid;
          _this.roomId = _this.$route.query.roomId;
          _this.shareMeetingLink = `${config.sharemeeting_page}?roomid=${_this.roomId}`;
          _this.joinRoom(sessionid, _this.roomId, _this.username);
        } else {
          console.error("初始化 连接失败");
        }
      });
    },

    // 第一次进入消息房间，加载成员列表并订阅其他人的房间
    initLoadMessageUsersSelfRooms(sessionid, roomid, name) {
      let _this = this;
      tvvssdk.queryRoom(sessionid, roomid, {
        success: async function (result) {
          console.log(result, "======1=====");
          _this.userList = [];
          let userList = [];
          if (roomid == result.room) {
            // result.participants.forEach(function (p, index, arr) {
            //     let user = {"userName": p.display, "position": p.position, "id": p.id};
            //     userList.push(user);
            // });
            for (let i = 0; i < result.participants.length; i++) {
              const p = result.participants[i];
              let user = {
                userName: p.display,
                position: p.position,
                id: p.id,
              };
              userList.push(user);
            }

            console.log("userList=========>", userList);

            for (let i = 0; i < userList.length; i++) {
              const room = userList[i];
              const mySelfRoomId = _this.mySelfRoomId;
              const mySelfRoomUserName = mySelfRoomId.replace("roomSelf-", "");
              if (room.userName !== mySelfRoomUserName) {
                // roomSelf-pc-33
                const otherJoinRoomId = `roomSelf-${room.userName}`;
                if (joined.indexOf(otherJoinRoomId) === -1) {
                  console.log("loop join otherJoinRoomId", otherJoinRoomId);
                  taskQueue.push({
                    userName: room.userName,
                    roomid: otherJoinRoomId,
                    action: "join",
                    joinType: "init",
                  });
                  joined.push(otherJoinRoomId);
                } else {
                }
              }
            }
            if (!isWorking) {
              await _this.handleTaskQueue();
            }
            _this.userList = userList;
          }
        },
        error: function (msg) {
          // console.log("queryConfMemberInfo error:"+msg);
        },
      });
    },
    // 执行队列
    async handleTaskQueue() {
      console.error(taskQueue);
      console.log("current taskQueue", taskQueue);
      isWorking = true;
      const task = taskQueue.shift();
      let isDone = false;
      if (task) {
        // 强制停500ms
        await sleep(500);
        // 强制 5s 后消费
        setTimeout(async () => {
          if (!isDone) {
            isWorking = false;
            console.warn(
              `[task执行失败]: ${JSON.stringify(task)}, 开始强制消费`
            );
            await this.handleTaskQueue();
          }
        }, 5000);
        console.log(
          `time: [${Date.now()}] exec taskQueue task `,
          JSON.parse(JSON.stringify(task))
        );
        if (task.action === "join") {
          await this.handleQueryAndLoadOtherSelfRoom(task);
          // 是全局禁音状态，添加禁音列表
          if (disableAllMic) {
            let muteUserList = this.muteUserList;
            this.muteUserList.push(task.userName);
            muteUserList = [...new Set(muteUserList)];
            this.muteUserList = muteUserList;
            this.handleMuteAll(true, true);
          }
          isDone = true;
          console.log("exec taskQueue task done", task);
          // this.reloadStream()
        } else if (task.action === "streamMessage") {
          // this.StreamStartAuxi(stopOtherSessionid, otherStreamRoomId, otherIndex, true)
          const otherStreamRoomId = task.roomid;
          let otherIndex = null;
          for (let i = 0; i < this.videoList.length; i++) {
            let video = this.videoList[i];
            if (video.name === otherStreamRoomId) {
              otherIndex = i;
            }
          }

          const stopOtherSessionid = sessionIdMap.get(otherStreamRoomId);
          window.sessionIdMap = sessionIdMap;
          if (!stopOtherSessionid) {
            console.warn(
              `${otherStreamRoomId} stopOtherSessionid 不存在`,
              stopOtherSessionid
            );
            isDone = true;
            await this.handleTaskQueue();
            return;
          }
          if (typeof otherIndex !== "number") {
            console.warn(
              `${otherStreamRoomId} otherIndex 不存在`,
              stopOtherSessionid
            );
            isDone = true;
            await this.handleTaskQueue();
            return;
          }

          if (task.isStreaming) {
            tvvssdk.streamStop(stopOtherSessionid);
            this.StreamStartAuxi(
              stopOtherSessionid,
              task.roomid,
              otherIndex,
              true
            );
            await sleep(500);
          } else {
            // username 停止推流， 剔除
            tvvssdk.streamStop(stopOtherSessionid);
            console.log("message stream 离开", otherStreamRoomId);
          }
          // this.reloadStream()
          isDone = true;
          console.log("exec taskQueue task done", task);
        } else if (task.action === "hangup") {
          this.addMsgList(displayUserName(task.name), `退出了会议`);
          const otherJoinRoomId = `roomSelf-${task.name}`;
          // 过滤已加入成员
          joined = joined.filter((i) => i !== otherJoinRoomId);
          // 过滤禁音列表
          this.muteUserList = this.muteUserList.filter((i) => i !== task.name);

          this.leaveVideo(otherJoinRoomId);
          console.log("sessionIdMap 删除", otherJoinRoomId);
          sessionIdMap.delete(otherJoinRoomId);
          window.sessionIdMap = sessionIdMap;
          console.warn("人员离开之前的videoList排序", this.videoList);
          this.videoList = this.videoList.filter(
            (video) =>
              video.name !== otherJoinRoomId && String(video.sessionid) !== "-1"
          );
          console.warn(
            "人员离开之后的videoList排序    ",
            this.videoList,
            "         离开人为:",
            otherJoinRoomId
          );
          // 主画面模式，退出的人是主画面，不是管理员， 重新设置主画面, 为第一个
          if (
            otherJoinRoomId === this.mainViewName &&
            task.name !== this.createdRoomData.adminName
          ) {
            const otherVideoList = this.videoList.filter(
              (v) => v.name !== otherJoinRoomId
            );
            const firstVideo = otherVideoList[0];
            if (firstVideo) {
              this.mainViewName = firstVideo.name;
              setTimeout(this.reloadMergeStream, 200);
            }
          }
          await sleep(500);
          isDone = true;
          console.log("exec taskQueue task done", task);
          if (task.name.split("!!")[0] === this.createdRoomData.adminName) {
            this.showAdminExit();
          }
          this.handleGoToMessageBottom();
        }
        await this.handleTaskQueue();
      } else {
        isWorking = false;
      }
    },
    // 通过className 获取 Index
    getIndexByClassName(name) {
      let index = null;
      let videoArray = document.getElementsByClassName("videoNameItem");
      for (let i = 0; i < videoArray.length; i++) {
        let videoEl = videoArray[i];
        if (videoEl.getAttribute("data-name") === name) {
          index = i;
        }
      }
      return index;
    },
    // 通过videoList 获取Index
    getVidoeListByIndex(name) {
      let index = null;
      for (let i = 0; i < this.videoList.length; i++) {
        let video = this.videoList[i];
        console.error(name, video, "-------------------------------------");
        if (video.name === name) {
          index = i;
        }
      }
      return index;
    },
    // 通过name 获取index
    getIndexByRoomName(name) {
      let index = null;
      if (this.isDbClickFlag) {
        index = this.getIndexByClassName(name);
      } else {
        index = this.getVidoeListByIndex(name);
      }
      return index;
    },
    // 加入消息房间 自己加入会议，接收SDK的回调，只有视频流
    joinRoom(sessionid, roomId, name) {
      let _this = this;
      let callbacks = {
        onjoined: function (name) {
          // 只是一个消息房间只推流声音流
          _this.audioStreamStart(sessionid);

          // 加入消息房间时，检查进入房间前的麦克风配置，如果为false, 就把自己的麦克风关掉
          setTimeout(() => {
            if (_this.enableMic === false) {
              _this.handleMuteMySelf(false);
            }
          }, 2000);
          // 创建自己房间 roomSelf 推流
          _this.createMySelefAuxiConnection();

          // 第一次进入消息房间，加载成员列表并订阅其他人的房间
          _this.initLoadMessageUsersSelfRooms(sessionid, roomId, name);
        },
        onleave: function (name, rfindex) {},
        // 消息
        ondata: function (sender, platform = "", data) {
          console.log("房间消息", sender, data);
          _this.handleParseMessage(sender, platform, data);
        },
        repeatLogin: function (msg) {
          console.warn("repeatLogin 1 用户重复登录", msg);
        },
      };
      tvvssdk.joinRoom(sessionid, roomId, name, callbacks);
    },
    // 自己给自己房间添加视频流
    videoStreamStart(sessionId, roomName) {
      let _this = this;
      if (!this.enableVideo) {
        let index = _this.getIndexByRoomName(roomName) || 0;
        const video = {
          stream: null,
          index,
          name: roomName,
          show: true,
          extra: {},
          sessionid: sessionId,
        };
        _this.handleSetVideoList(index, video);
        _this.getConfMemberNum();
        console.log("自己给自己房间添加视频流 enableVideo", index);
        setTimeout(function () {
          _this.reloadIndexStream(index);
          _this.btnLoading = false;
        }, 200);
        return;
      }
      streamFlag = true;
      let options = {
        audio: {}, // 音频参数
        video: {}, // 视频参数
        conf: {},
      };
      //设置音频参数
      options.audio.sendaudio = false;
      options.audio.recvaudio = true;
      options.audio.publishaudio = false;
      options.audio.subscribeaudio = false;
      options.audio.audioindeviceid = this.deviceInfo.microphone;

      options.video.sendvideo = this.enableVideo; //未选择”禁用摄像头“
      // options.video.recvvideo = false;
      options.video.recvvideo = true;
      options.video.deviceid = this.deviceInfo.camera;
      options.video.publishvideo = this.enableVideo;
      options.video.subscribevideo = false;
      options.video.type = "camera";
      //设置会场参数，仅对MCU会议有效
      options.conf.size = this.deviceInfo.size;
      options.conf.fps = this.deviceInfo.fps;
      options.conf.confsize = this.deviceInfo.confsize;
      options.conf.confminbr = 150 * 1024;
      options.conf.confmaxbr = this.deviceInfo.confmaxbr;
      options.conf.confinitbr = 500 * 1024;
      options.conf.conffps = this.deviceInfo.conffps;
      options.conf.mode = "sfu-up";
      options.conf.picmode = 0; //0：一大多小， 1：等大
      let callbacks = {
        // 自己看自己的本地流
        onlocalstream: async function (sessionId, stream, extra) {
          console.log(
            "自己看自己的本地流 on-localstream",
            sessionId,
            stream,
            extra
          );
          let index = _this.getIndexByRoomName(roomName) || 0;
          // 重置本地videoList对象
          if (_this.isDbClickFlag) {
            _this.videoList.forEach((item, indexs) => {
              if (item.name == roomName) {
                index = indexs;
              }
            });
          }
          const localVideo = {
            stream,
            index: index,
            name: roomName,
            show: true,
            extra,
            sessionid: sessionId,
          };
          console.warn("未被重置之前的videoList", _this.videoList);
          _this.handleSetVideoList(index, localVideo);
          _this.getConfMemberNum();

          const userList = await _this.queryAndSortMySelfUsers(sessionId);
          console.log("userList====>", userList);
          tvvssdk.compositeRoom(sessionId, roomName, userList);

          setTimeout(function () {
            if (
              _this.videoLayout == 1 ||
              (_this.videoLayout == 0 && !_this.isDbClickFlag) ||
              _this.isDbClickFlag
            ) {
              let videoIndex = _this.getIndexByClassName(roomName) || 0;
              _this.reloadIndexStream(videoIndex, index, true);
            }
            if (streamingCount === 0) {
              setTimeout(() => {
                _this.handleSetBitrate("camera");
              }, 3000);
              _this.handleAddStreamMessage("camera", true);
            }
            _this.btnLoading = false;
            streamingCount++;
          }, 200);
        },
        onremotestream: function (sessionId, stream, extra) {},
      };
      tvvssdk.streamStart(sessionId, options, this.mySelfRoomId, callbacks);
      this.streaming = true;
    },
    // 自己房间 查询排序 第一
    queryAndSortMySelfUsers(sessionid) {
      const mySelfRoomName = `roomSelf-${USERNAME}`;
      const mySelfRoomId = this.mySelfRoomId;

      return new Promise((resolve, reject) => {
        tvvssdk.queryRoom(sessionid, mySelfRoomId, {
          success: async function (result) {
            let userList = [];
            let me = [];
            if (mySelfRoomId == result.room) {
              for (let i = 0; i < result.participants.length; i++) {
                const p = result.participants[i];
                if (p.display === mySelfRoomName) {
                  me.push({
                    userName: p.display,
                    id: p.id,
                    position: 1,
                  });
                } else {
                  userList.push({
                    userName: p.display,
                    id: p.id,
                    position: 0,
                  });
                }
              }
              userList = [...me, ...userList];
              resolve(userList);
              console.log("my room userList=========>", userList);
            }
          },
          error: function () {
            resolve([]);
          },
        });
      });
    },
    // 声音流
    audioStreamStart(sessionId) {
      let options = {
        audio: {},
        video: {},
        conf: {},
      };
      //设置音频参数
      options.audio.sendaudio = this.initMeetingEnableConfig.enableMic; //未选择”禁用麦克风“
      options.audio.recvaudio = true;
      options.audio.publishaudio = this.initMeetingEnableConfig.enableMic;
      options.audio.subscribeaudio = this.initMeetingEnableConfig.enableMic;
      options.audio.audioindeviceid = this.deviceInfo.microphone;

      //设置视频参数
      options.video.sendvideo = false; //未选择”禁用摄像头“
      options.video.recvvideo = false;
      options.video.deviceid = this.deviceInfo.camera;
      options.video.publishvideo = false;
      options.video.subscribevideo = false;
      options.video.type = "camera";

      //设置会场参数，仅对MCU会议有效
      options.conf.size = this.deviceInfo.size;
      options.conf.fps = this.deviceInfo.fps;
      options.conf.confsize = this.deviceInfo.confsize;
      options.conf.confminbr = 150 * 1024;
      options.conf.confmaxbr = this.deviceInfo.confmaxbr;
      options.conf.confinitbr = 500 * 1024;
      options.conf.conffps = this.deviceInfo.conffps;
      options.conf.mode = "sfu-up";
      options.conf.picmode = 0; //0：一大多小， 1：等大

      console.log("声音流房间 options", options);

      let _this = this;
      let callbacks = {
        onlocalstream: function (sessionId, stream, extra) {},
        onremotestream: function (sessionId, stream, extra) {
          console.log("声音流 on-remotestream");
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
      const audioElId = this.$refs["audioPlayer"];
      console.log("声音 audioElId", audioElId);
      tvvssdk.attachMediaStream(audioElId, this.audioVideo.stream);
      // const remoteVideo = document.getElementById(audioElId)
      // if (remoteVideo.setSinkId) {
      //   const outputAudioId = this.deviceInfo.speaker
      //   if (outputAudioId !== "0") {
      //     remoteVideo.setSinkId(outputAudioId)
      //     remoteVideo.muted = false
      //   } else {
      //     remoteVideo.muted = true
      //   }
      // }
    },
    // 添加消息列表内容，UI顯示
    async addMsgList(name, content, msgType) {
      let res = null;
      if (name.split("!!").length > 1) {
        res = await getAvatarByImId(name.split("!!")[1]);
      }
      this.msgList.push({
        name: name,
        content: content,
        msgType,
        isShow: true,
        avatar: res ? res.data.data.headImage : "",
      });
      this.msgIndexList.push(this.msgList.length - 1);
      setTimeout(() => {
        const currentIndex = this.msgIndexList.shift();
        this.msgList[currentIndex].isShow = false;
        setTimeout(() => {
          this.msgList[currentIndex].isDisplay = true;
        }, 1000 * 0.3);
      }, 1000 * 2.5);
    },
    hideMsgList(currentIndex) {
      if (this.isNextHideMsgList || this.msgIndexList.length == 0) return;
      this.isNextHideMsgList = true;
    },
    // 轮查房间
    startQueryRoom(sessionid, roomid, name) {
      let _this = this;
      tvvssdk.queryRoom(sessionid, roomid, {
        success: function (result) {
          _this.userList = [];
          let userList = [];
          if (roomid == result.room) {
            for (let i = 0; i < result.participants.length; i++) {
              const p = result.participants[i];
              let user = {
                userName: p.display,
                position: p.position,
                id: p.id,
              };
              userList.push(user);
            }

            console.log("userList=========>", userList);
            _this.userList = userList;
          }
        },
        error: function (msg) {
          // console.log("queryConfMemberInfo error:"+msg);
        },
      });
    },
    /**
     * 查询订阅其他人的房间
     * @param   roomid    {String}
     * @param   action    {String}   [join]
     * @param   joinType  {String}   [init 第一次, joined: 加入的]
     * */
    handleQueryAndLoadOtherSelfRoom({
      roomid,
      action = "",
      joinType = "init",
    }) {
      let _this = this;
      let index = 0;
      if (action === "join") {
        index = _this.getIndexByRoomName(roomid) || _this.videoList.length;
      }
      console.log(" 查询订阅其他人的房间", roomid, index, joinType);
      joinedNum++;
      return new Promise((resolve, reject) => {
        tvvssdk.createConnection(async function (res) {
          console.log("handleQueryAndLoadOtherSelfRoom", res);
          if (res.success || res.disconnected) {
            if (res.disconnected) {
              console.warn(
                `handleQueryAndLoadOtherSelfRoom 其他人的房间 ICE连接失败,正在重新连接: ${roomid} ${res.sessionid}`
              );
              tvvssdk.streamStop(res.sessionid);
              sessionIdMap.set(roomid, res.sessionid);
              window.sessionIdMap = sessionIdMap;
              const loadIndex = _this.getIndexByRoomName(roomid);
              _this.StreamStartAuxi(res.sessionid, roomid, loadIndex, true);
              resolve(true);
              return;
            }
            console.log(
              "handleQuery - AndLoadOtherSelfRoom createConnection",
              roomid,
              index,
              res
            );
            sessionIdMap.set(roomid, res.sessionid);
            window.sessionIdMap = sessionIdMap;
            index = _this.getIndexByRoomName(roomid) || index;
            if (!_this.videoList[index]) {
              const otherVideo = {
                video: `video${joinedNum}`,
                stream: null,
                name: roomid,
                index,
                show: true,
                sessionid: res.sessionid,
                extra: {},
              };
              _this.handleSetVideoList(index, otherVideo);
            } else {
              const otherVideo = _this.videoList[index];
              otherVideo.sessionid = res.sessionid;
              _this.handleSetVideoList(index, otherVideo);
            }
            // _this.videoList[index].sessionid = res.sessionid
            let shouldLoadStream = false;
            const joinResult = await _this.joinAuxiRoom(
              res.sessionid,
              roomid,
              _this.mySelfRoomId,
              index,
              joinType,
              shouldLoadStream
            );
            // 订阅其他房间的时候，别人是房主需要切换主视图，九宫格才能看自己的视图
            if (roomid == "roomSelf-" + _this.createdRoomData.adminName) {
              setTimeout(() => {
                _this.videoLayout = 1;
                _this.handleSetMainScreen(
                  "roomSelf-" + _this.createdRoomData.adminName
                );
              }, 1000);
            }
            resolve(joinResult);
          } else {
            console.log("createAuxiConnection==============", res);
          }
        });
      });
    },
    // 获取人数
    getConfMemberNum() {
      this.startQueryRoom(this.sessionid, this.roomId, this.username);
    },
    // 单击
    switchVideo(index) {
      return;

      time2 && clearTimeout(time2);
      let _this = this;
      time2 = setTimeout(() => {
        if (index !== 0) {
          if (_this.videoList[index].stream !== null) {
            _this.switchData(_this.videoList[0], _this.videoList[index]);
            // console.log(_this.videoList)
            // 先注销重新渲染画面，后续观察
            // setTimeout(this.reloadStream, 200);
            _this.reloadStream();
          }
        }
      }, 300);
    },
    // 双击查看主视图
    handleSetMainScreen(name) {
      if (this.videoLayout === 1) {
        this.mainViewName = name;
        this.switchLayout(0);
        setTimeout((this.isDbClickFlag = true), 10);
        setTimeout(this.reloadMergeStream, 200);
      }
    },
    // TODO: 双击全屏功能
    switchVideoAndFullScreen(index) {
      time2 && clearTimeout(time2);
      let _this = this;
      time2 = setTimeout(() => {
        if (index !== 0) {
          if (_this.videoList[index].stream !== null) {
            _this.switchData(_this.videoList[0], _this.videoList[index]);
            // console.log(_this.videoList)
            // 先注销重新渲染画面，后续观察
            // setTimeout(this.reloadStream, 200);
          }
        }
        setTimeout(() => {
          _this.switchLayout(0);
          _this.reloadStream();
        }, 200);
      }, 300);
      return;

      // 双击全屏功能
      time2 && clearTimeout(time2);
      // console.log("switchVideoAndFullScreen");
      if (!this.isSolo) {
        if (index !== 0) {
          if (this.videoList[index].stream !== null) {
            this.switchData(this.videoList[0], this.videoList[index]);
          }
        }

        this.HisIsFull = this.isFullScreen;
        this.clickSwitchFullScreen(true);
        // this.reloadStream();
        this.isSolo = !this.isSolo;
        this.dynamicLayout();
      } else {
        this.isSolo = !this.isSolo;
        this.dynamicLayout();
        if (!this.HisIsFull) {
          this.clickSwitchFullScreen(false);
        }
      }
    },
    // 切换全屏
    clickSwitchFullScreen(status) {
      if (status) {
        this.isFullScreen = false;
        this.switchFullScreen();
      } else {
        this.isFullScreen = true;
        this.switchFullScreen();
      }
    },
    // 全屏
    switchFullScreen() {
      var element = document.documentElement;
      this.isFullScreen = !this.isFullScreen;
      if (this.isFullScreen) {
        // 判断浏览器设备类型
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          // 兼容火狐
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          // 兼容谷歌
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          // 兼容IE
          element.msRequestFullscreen();
        }
        // setTimeout(this.reloadStream, 50);
      } else {
        // $('body').removeClass('full-screen');
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        // setTimeout(this.reloadStream, 200);
      }
    },
    // 两两更换数据
    switchData(beforeList, afterList) {
      let beforeStream = beforeList.stream;
      let beforeIndex = beforeList.index;
      let beforeName = beforeList.name;
      let beforeVideo = beforeList.video;
      let beforeExtra = beforeList.extra;
      let beforeShow = beforeList.show;
      let beforeSessionid = beforeList.sessionid;

      let afterStream = afterList.stream;
      let afterIndex = afterList.index;
      let afterName = afterList.name;
      let afterVideo = afterList.video;
      let afterExtra = afterList.extra;
      let afterShow = beforeList.show;
      let afterSessionid = beforeList.sessionid;

      beforeList.stream = afterStream;
      beforeList.index = afterIndex;
      beforeList.name = afterName;
      beforeList.video = afterVideo;
      beforeList.extra = afterExtra;
      // beforeList.show = afterShow;
      beforeList.sessionid = afterSessionid;

      afterList.stream = beforeStream;
      afterList.index = beforeIndex;
      afterList.name = beforeName;
      afterList.video = beforeVideo;
      afterList.extra = beforeExtra;
      // afterList.show = beforeShow;
      afterList.sessionid = beforeSessionid;
    },
    // 切換佈局
    switchLayout(videoLayout) {
      if (videoLayout === 0) {
        this.isDbClickFlag = false;
        this.videoLayout = 0;
        this.dynamicLayout();
      } else if (videoLayout === 1) {
        this.videoLayout = 1;
        this.dynamicLayout();
        if (this.isDbClickFlag) {
          setTimeout(this.reloadMergeStream, 200);
        }
      }
    },
    checkMenu(val) {
      this.switchLayout(val);
    },
    // 等大情況下动态调整video大小
    dynamicLayout() {
      this.confMemberNum = this.userList.length || 1;
      console.log(
        "this.confMemberNum",
        this.confMemberNum,
        "videoLayout",
        this.videoLayout
      );
      if (this.isSolo) {
        this.mainVideoStyle = {
          width: "100%",
          height: "calc(100% - 2px)",
        };
        this.otherVideoStyle = {
          width: "1px",
          height: "1px",
        };
      } else {
        if (this.videoLayout === 0) {
          // this.mainVideoStyle = {
          //   width: "100%",
          //   height: "85%"
          //   // height: "100%"
          // }
          // this.otherVideoStyle = {
          //   width: "12.5%",
          //   height: "calc(15% - 8px)"
          // }
          this.mainVideoStyle = {
            width: "100%",
            height: "calc(100% - 2px)",
          };
          this.otherVideoStyle = {
            width: 0,
            height: 0,
            overflow: "hidden",
          };
        } else if (this.videoLayout === 1) {
          // this.mainVideoStyle = {
          //   width: "33.33%",
          //   height: "calc(33.33% - 4px)"
          // }
          // this.otherVideoStyle = {
          //   width: "33.33%",
          //   height: "calc(33.33% - 4px)"
          // }
          if (this.confMemberNum === 1) {
            this.mainVideoStyle = {
              width: "100%",
              height: "calc(100% - 2px)",
            };
            this.otherVideoStyle = {
              width: "100%",
              height: "calc(100% - 2px)",
            };
          } else if (this.confMemberNum === 2) {
            this.mainVideoStyle = {
              width: "50%",
              height: "calc(65% - 2px)",
            };
            this.otherVideoStyle = {
              width: "50%",
              height: "calc(65% - 2px)",
            };
          } else if (this.confMemberNum === 3 || this.confMemberNum === 4) {
            this.mainVideoStyle = {
              width: "50%",
              height: "calc(50% - 4px)",
            };
            this.otherVideoStyle = {
              width: "50%",
              height: "calc(50% - 4px)",
            };
          } else if (this.confMemberNum === 5 || this.confMemberNum === 6) {
            this.mainVideoStyle = {
              width: "33.33%",
              height: "calc(50% - 4px)",
            };
            this.otherVideoStyle = {
              width: "33.33%",
              height: "calc(50% - 4px)",
            };
          } else if (this.confMemberNum === 7 || this.confMemberNum === 8) {
            this.mainVideoStyle = {
              width: "25%",
              height: "calc(50% - 4px)",
            };
            this.otherVideoStyle = {
              width: "25%",
              height: "calc(50% - 4px)",
            };
          } else {
            this.mainVideoStyle = {
              width: "33.33%",
              height: "calc(33.33% - 4px)",
            };
            this.otherVideoStyle = {
              width: "33.33%",
              height: "calc(33.33% - 4px)",
            };
          }
        }
      }
    },
    reloadIndexStream(index, videoIndex, flag) {
      if (!index && typeof index !== "number") return;
      this.$nextTick(() => {
        const refVideoId = `video${index}`;

        if (!this.$refs[refVideoId] || !this.$refs[refVideoId][0]) return;
        const videoEl = this.$refs[refVideoId][0];

        console.log("tvvssdk attachMediaStream 2");
        tvvssdk.attachMediaStream(
          videoEl,
          this.videoList[flag ? videoIndex : index].stream
        );
        if (videoEl.setSinkId) {
          const outputAudioId = this.deviceInfo.speaker;
          if (outputAudioId !== "0") {
            videoEl.setSinkId(outputAudioId);
            videoEl.muted = false;
          } else {
            videoEl.muted = true;
          }
        }
      });
    },
    showMeetingShareWindow() {
      this.$electron.ipcRenderer.send("meeting-share-window-show");
      this.$electron.ipcRenderer.send("meeting-window-hide");
    },
    // 有人离开，重新渲染
    leaveVideo(roomName) {
      let roomsessionid = "";
      roomsessionid = sessionIdMap.get(roomName);
      if (!roomsessionid) {
        console.warn(`sessionIdMap ${roomName} 不存在`, sessionIdMap);
        return;
      }
      console.log("离开videoList", roomName, roomsessionid, this.videoList);
      // 停止订阅流，离开订阅房间
      try {
        tvvssdk.streamStop(roomsessionid);
        tvvssdk.leaveRoom(roomsessionid);
      } catch (e) {}

      // 移除video，重新渲染list
      this.videoList = this.videoList.filter(
        (video) => video.name !== roomName && String(video.sessionid) !== "-1"
      );
      console.log(roomName, "离开，重新渲染list", this.videoList);
      this.getConfMemberNum();
      // 有人离开 且是主视图的时候才渲染
      if (roomName === this.mainViewName && this.isDbClickFlag) {
        setTimeout(this.reloadStream, 200);
      }
    },
    // 重新渲染画面
    reloadStream() {
      setTimeout(() => {
        let i;
        console.warn("重新渲染画面的videoList", this.videoList);
        for (i in this.videoList) {
          const refVideoId = `video${i}`;
          if (!this.$refs[refVideoId] || !this.$refs[refVideoId][0]) {
            console.warn(
              "tvvssdk attachMediaStream 3 refs 不存在",
              this.$refs,
              refVideoId,
              this.$refs[refVideoId]
            );
            return;
          }
          const videoEl = this.$refs[refVideoId][0];
          console.log("tvvssdk attachMediaStream 3", this.$refs, videoEl);
          tvvssdk.attachMediaStream(videoEl, this.videoList[i].stream);
        }
      }, 500);
    },
    // 重新渲染画面 merge
    reloadMergeStream() {
      setTimeout(() => {
        let i;
        console.warn(this.mergeStream, "this.mergeStream");
        for (i in this.mergeStream) {
          const refVideoId = `video${i}`;
          if (!this.$refs[refVideoId] || !this.$refs[refVideoId][0]) {
            console.warn(
              "tvvssdk attachMediaStream mergeStream refs 不存在",
              this.$refs,
              refVideoId,
              this.$refs[refVideoId]
            );
            return;
          }
          const videoEl = this.$refs[refVideoId][0];
          console.warn(
            "tvvssdk attachMediaStream mergeStream",
            this.$refs,
            videoEl
          );
          tvvssdk.attachMediaStream(videoEl, this.mergeStream[i].stream);
        }
      }, 500);
    },
    /***********共享屏幕 start*************/
    // 开关共享屏幕
    shareScreen() {
      let _this = this;
      let enable = !this.enableShareScreen;
      const mySelfRoomSession = _this.mySelfRoomSession;
      this.deviceInfo.camera = "1";
      // 共享屏幕回调处理 ====> createMySelefAuxiConnection
      // tvvssdk.streamStop(mySelfRoomSession)
      if (enable && streamFlag === false) {
        this.screenStreamStart(mySelfRoomSession);
        this.enableVideo = false;
      } else {
        tvvssdk.shareScreen(mySelfRoomSession, enable, function (res) {
          if (res.success === true) {
            _this.enableShareScreen = enable;
            if (enable) {
              _this.enableVideo = false;
              setTimeout(() => {
                _this.handleSetBitrate("screen");
              }, 3000);
            } else {
              _this.showIcon = false;
              _this.$electron.ipcRenderer.send(
                "meeting-window-shareShrink-close"
              );
            }
            _this.handleAddStreamMessage("screen", enable);
          } else if (res === "screen stop") {
            // 用户取消屏幕共享操作
            _this.enableShareScreen = false;
            tvvssdk.streamStop(_this.mySelfRoomId);
          } else if (res === "screen denied") {
            // 用户共享屏幕时取消窗口选择
            tvvssdk.streamStop(_this.mySelfRoomId);
            _this.enableShareScreen = false;
            _this.selectScreenDialog = false;
          } else if (res === "screen start") {
            // 开始屏幕共享
            _this.enableShareScreen = true;
            _this.handleAddStreamMessage("screen", true);
            _this.selectScreenDialog = false;
            _this.enableVideo = false;
            // _this.reloadIndexStream(0)
          } else if (res.isSources) {
            // 返回可选择窗口列表信息
            res.sources.forEach((item) => {
              item.imgSrc = item.thumbnail ? item.thumbnail.toDataURL() : "";
            });
            _this.sourceList = res.sources;
            _this.sourceCallbackFunc = res.sourcesCallback;
            _this.selectScreenDialog = true;
            _this.btnLoading = false;
          } else {
            console.log(
              "给自己的房间推流 createAuxiConnection==============",
              res
            );
          }
        });
      }
      streamFlag = true;
    },

    // 选择屏幕
    handleSelectScreen(sourceId) {
      // this.sourceCallbackFunc && this.sourceCallbackFunc(false, '')
      setTimeout(() => {
        this.sourceCallbackFunc(true, sourceId);
        this.selectScreenDialog = false;
        this.$electron.ipcRenderer.send("create-meetingShareShrink-window", {
          x: window.screen.availWidth - 300,
        });
        this.$electron.ipcRenderer.send("meeting-window-hide");
      }, 500);
    },
    sourceCancel() {
      this.sourecDialogVisible = false;
      this.sourceCallbackFunc(false, "");
    },
    /************共享屏幕 end**************/

    // 检查房间是否存在
    handleCheckQueryRoom(sessionid, roomid) {
      return new Promise((resolve, reject) => {
        tvvssdk.queryRoom(sessionid, roomid, {
          success: function (result) {
            resolve(result);
          },
          error: function (result) {
            // reject(result)
            // 返回false
            resolve(false);
          },
        });
      });
    },
    // 麦克风，摄像头 启用开关
    changeEnable(type) {
      let _this = this;
      const mySelfRoomSession = _this.mySelfRoomSession;

      // 在全员禁音状态，为普通成员
      if (type === "mic" && disableAllMic && !this.isMeetingAdmin) {
        this.$message.info("当前会议全员禁音中");
        return;
      }

      // 防重复点击
      if (this.btnLoading) return;
      this.btnLoading = true;
      setTimeout(() => {
        this.btnLoading = false;
      }, 4000);

      switch (type) {
        // 开关麦克风
        case "mic":
          let enableMic = !_this.enableMic;
          tvvssdk.mike(this.sessionid, enableMic, function (res) {
            if (!res.success) {
              _this.$message.warning("静音异常");
              _this.enableMic = false;
              _this.btnLoading = false;
            } else {
              if (_this.isAdminMust) {
                _this.sendMicChangeState(
                  res.success,
                  _this.enableMic,
                  enableMic
                );
              }
              if (enableMic != _this.enableMic) {
                _this.btnLoading = false;
              }
              _this.enableMic = enableMic;
            }
          });
          break;
        // 开关摄像头
        case "video":
          const videoParam = { video: true };
          navigator.mediaDevices
            .getUserMedia(videoParam)
            .then(() => {
              let enable = !_this.enableVideo;

              if (enable && streamFlag === false) {
                this.publishStart(mySelfRoomSession);
                this.enableVideo = true;
                this.enableShareScreen = false;
                this.handleAddStreamMessage("camera", true);
                // 每次开启摄像头要设置码率
                setTimeout(() => {
                  this.handleSetBitrate("camera");
                }, 3000);
              } else {
                // _this.sessionId  = mySelfRoomSession
                tvvssdk.publish(mySelfRoomSession, enable, function (res) {
                  _this.btnLoading = false;
                  _this.enableVideo = enable;
                  // streamFlag = enable
                  _this.handleAddStreamMessage("camera", enable);
                  if (enable) {
                    _this.enableShareScreen = false;
                    setTimeout(() => {
                      // 每次开启摄像头要设置码率
                      _this.handleSetBitrate("camera");
                    }, 3000);
                  }
                });
              }
              streamFlag = true;
            })
            .catch((err) => {
              this.$message.warning("请打开摄像头权限！");
            });
          break;
        // 开启屏幕共享
        case "shareScreen":
          _this.shareScreen();
          break;
        // 关闭会议
        case "callOn":
          this.enableCallOn = !this.enableCallOn;
          break;
        // 开关扬声器
        case "vol":
          this.enableVol = !this.enableVol;
          const muted = !this.enableVol;
          // 是否禁用扬声器
          this.handleMuteAllElement(muted);
          break;
      }
    },
    // 被主持人单独静音掉的话，重新开启需要发送消息，更新主会议的状态
    sendMicChangeState(state, enableMic, oldEnableMic) {
      if (!state || enableMic != oldEnableMic) {
        return;
      }
      this.isAdminMust = false;
      const sessionid = this.sessionid;
      const username = this.username;
      const roomId = this.roomId;
      const muteMessageData = {
        status: "muteUser",
        userName: username,
        muteUser: username,
        isAddMsgList: true, // 自己开启时不能显示系统消息 默认是没有此参数的
        enableMic: this.enableMic,
        muteUserList: [],
      };
      const muteMessageDataStr = JSON.stringify(muteMessageData);
      if (this.sessionid) {
        tvvssdk.sendGroupData(
          sessionid,
          roomId,
          username,
          "all",
          muteMessageDataStr,
          function (res) {
            if (res.success) {
              //
            }
          }
        );
      }
    },
    // 设置本地码率
    handleSetBitrate(type = "camera") {
      let _this = this;
      // 1200
      const bitrate = type === "camera" ? 800 * 1024 : 1800 * 1024;
      tvvssdk.setBitrate(this.mySelfRoomSession, bitrate, function (res) {
        if (res.success) {
          console.log("setBitrate success", res);
        } else {
          // _this.$message.warning("本地码率设置失败");
        }
      });
    },
    /**
     * 程序 开关自己麦克风
     * @param   {Boolean} enable  [true, 开启麦克风， false，关闭麦克风]
     * **/
    handleMuteMySelf(enable = false) {
      let _this = this;
      tvvssdk.mike(this.sessionid, enable, function (res) {
        if (!res.success) {
          _this.$message.warning("静音异常");
          _this.enableMic = false;
        } else {
          _this.enableMic = enable;
        }
      });
    },
    // 程序 开关声音
    handleMuteAllElement(isMuted) {
      function muteMe(elem) {
        elem.muted = isMuted;
        // elem.pause();
      }
      document.querySelectorAll("video").forEach((video) => muteMe(video));
      document.querySelectorAll("audio").forEach((audio) => muteMe(audio));
      setTimeout(() => {
        this.btnLoading = false;
      }, 200);
    },
    // 程序 开关某个人声音
    handleMuteOneElement(userName, isMuted) {
      const videoNameItemElArr = document.querySelectorAll(".videoNameItem");
      videoNameItemElArr.forEach((videoEl, index) => {
        const dataName = videoEl.getAttribute("data-name");
        if (dataName === `roomSelf-${userName}`) {
          videoEl.muted = isMuted;
        }
      });
    },
    // 摄像头推流
    publishStart(sessionId) {
      let options = {
        audio: {},
        video: {},
        conf: {},
      };
      //设置音频参数
      options.audio.sendaudio = false;
      options.audio.recvaudio = true;
      options.audio.publishaudio = false;
      options.audio.subscribeaudio = false;
      options.audio.audioindeviceid = this.deviceInfo.microphone;
      //设置视频参数
      options.video.sendvideo = true;
      options.video.recvvideo = false;
      options.video.deviceid = this.deviceInfo.camera;
      options.video.publishvideo = true;
      options.video.subscribevideo = false;
      options.video.type = "camera";

      //设置会场参数，仅对MCU会议有效
      options.conf.size = this.deviceInfo.size;
      options.conf.fps = this.deviceInfo.fps;
      options.conf.confsize = this.deviceInfo.confsize;
      options.conf.confminbr = 150 * 1024;
      options.conf.confmaxbr = this.deviceInfo.confmaxbr;
      options.conf.confinitbr = 500 * 1024;
      options.conf.conffps = this.deviceInfo.conffps;
      options.conf.mode = "sfu-up";
      options.conf.picmode = 0; //0：一大多小， 1：等大

      let _this = this;
      let callbacks = {
        onlocalstream: function (sessionId, stream, extra) {
          const mySelfRoomId = _this.mySelfRoomId;
          let index = _this.getIndexByRoomName(mySelfRoomId) || 0;
          console.log("on-onlocalstream", index, mySelfRoomId);
          _this.videoList[index].stream = stream;
          _this.videoList[index].index = index;
          _this.videoList[index].name = mySelfRoomId;
          _this.videoList[index].show = true;
          _this.videoList[index].extra = extra;
          _this.videoList[index].sessionid = sessionId;
          _this.getConfMemberNum();
          setTimeout(function () {
            _this.reloadIndexStream(index);
          }, 200);
        },
        onremotestream: function (sessionId, stream, extra) {},
      };
      tvvssdk.streamStart(sessionId, options, this.mySelfRoomId, callbacks);
      this.streaming = true;
    },
    // 共享屏幕流Start stream, 推自己的房间
    screenStreamStart(sessionId) {
      let options = {
        audio: {},
        video: {},
        conf: {},
      };
      //设置音频参数
      options.audio.sendaudio = false;
      options.audio.recvaudio = true;
      options.audio.publishaudio = false;
      options.audio.subscribeaudio = false;
      options.audio.audioindeviceid = "default";

      //设置视频参数
      options.video.sendvideo = true;
      options.video.recvvideo = false;
      options.video.deviceid = this.deviceInfo.camera;
      options.video.publishvideo = true;
      options.video.subscribevideo = false;
      options.video.type = "screen";

      //设置会场参数，仅对MCU会议有效
      options.conf.size = this.deviceInfo.size;
      options.conf.fps = this.deviceInfo.fps;
      options.conf.confsize = this.deviceInfo.confsize;
      options.conf.confminbr = 150 * 1024;
      options.conf.confmaxbr = this.deviceInfo.confmaxbr;
      options.conf.confinitbr = 500 * 1024;
      options.conf.conffps = this.deviceInfo.conffps;
      options.conf.mode = "sfu-up";
      options.conf.picmode = 0;

      let _this = this;
      let callbacks = {
        onlocalstream: function (sessionId, stream, extra) {
          const mySelfRoomId = _this.mySelfRoomId;
          let index = _this.getIndexByRoomName(mySelfRoomId) || 0;
          const localVideo = {
            stream,
            index,
            name: mySelfRoomId,
            show: true,
            extra,
            sessionid: sessionId,
          };
          _this.handleSetVideoList(index, localVideo);
          _this.getConfMemberNum();
          setTimeout(function () {
            _this.reloadIndexStream(index);
          }, 200);
          setTimeout(() => {
            _this.handleSetBitrate("screen");
          }, 1000);
        },
        onremotestream: function (sessionId, stream, extra) {},
      };
      console.log("自己共享桌面options", options);
      tvvssdk.streamStart(sessionId, options, this.mySelfRoomId, callbacks);
      this.streaming = true;
    },
    // 发送文字消息
    sendMsg() {
      if (!this.canSend) return;

      const content = this.input;
      const sessionid = this.sessionid;
      const username = this.username;
      const roomId = this.roomId;

      const messageData = {
        status: "sendMsg",
        userName: username,
        msgContent: content,
      };
      const _this = this;
      const messageDataStr = JSON.stringify(messageData);

      const reg = /@[a-zA-Z0-9\u4e00-\u9fa5]+/g;
      // 被 @的用户
      let atUserList = content.match(reg);
      // 被@中是否包含自己
      let hasMeFlag = false;
      // 有 @ 的，分别发送
      if (atUserList && atUserList.length !== 0) {
        // 去重
        atUserList = [...new Set(atUserList)];
        if (this.sessionid) {
          atUserList.forEach((msg) => {
            const user_name = msg.replace("@", "");
            if (user_name === myRealName) {
              hasMeFlag = true;
            }
            const user_pc_name = `pc-${user_name}`;
            const user_app_name = `app-${user_name}`;
            // 发 @pc
            tvvssdk.sendGroupData(
              sessionid,
              roomId,
              username,
              user_pc_name,
              messageDataStr,
              function (res) {
                if (res.success) {
                }
              }
            );
            // 发 @app
            tvvssdk.sendGroupData(
              sessionid,
              roomId,
              username,
              user_app_name,
              messageDataStr,
              function (res) {
                if (res.success) {
                }
              }
            );
          });
          if (!hasMeFlag) {
            // 自己给发自己
            tvvssdk.sendGroupData(
              sessionid,
              roomId,
              username,
              USERNAME,
              messageDataStr,
              function (res) {
                if (res.success) {
                }
              }
            );
          }
          _this.input = "";
        }
      } else {
        // 全部发送 all
        if (this.sessionid) {
          tvvssdk.sendGroupData(
            sessionid,
            roomId,
            username,
            "all",
            messageDataStr,
            function (res) {
              if (res.success) {
                _this.input = "";
              }
            }
          );
        }
      }
    },
    // 发送点赞消息
    handleAddLike() {
      const sessionid = this.sessionid;
      const username = this.username;
      const roomId = this.roomId;

      const messageData = {
        status: "likeMsg",
        userName: username,
      };

      const messageDataStr = JSON.stringify(messageData);
      if (this.sessionid) {
        tvvssdk.sendGroupData(
          sessionid,
          roomId,
          username,
          "all",
          messageDataStr,
          function (res) {
            if (res.success) {
            }
          }
        );
      }
    },
    // 解释 全局消息
    async handleParseMessage(sender, platform, dataStr) {
      try {
        console.log("handleParseMessage", dataStr);
        const data = JSON.parse(dataStr);
        const status = data.status || "";
        switch (status) {
          // 发送文本消息
          case "sendMsg":
            this.addMsgList(displayUserName(data.userName), data.msgContent);
            this.handleGoToMessageBottom();
            break;
          // 点赞消息
          case "likeMsg":
            this.addMsgList(
              displayUserName(data.userName),
              data.msgContent,
              "likeMsg"
            );
            this.handleGoToMessageBottom();
            break;
          // 有人加入
          case "joined":
            console.log(data, "有人加入会议");
            this.addMsgList(displayUserName(data.name), `加入了会议`);
            const otherRoom = `roomSelf-${data.name}`;
            // 不拉取自己
            if (otherRoom === this.mySelfRoomId) return;
            // 每次有人加入就去订阅，新增 一个 video
            joinedNum++;
            joined.push(otherRoom);
            this.userList.push({
              userName: data.name,
            });
            // const otherIndex = this.userList.length - 1
            taskQueue.push({
              userName: data.name,
              roomid: otherRoom,
              action: "join",
              joinType: "joined",
            });
            if (!isWorking) {
              await this.handleTaskQueue();
            }
            setTimeout(async () => {
              this.dynamicLayout();
            }, 1000);
            break;
          // 有人退出
          case "hangup":
            taskQueue.push({
              name: data.name,
              action: "hangup",
            });
            if (!isWorking) {
              await this.handleTaskQueue();
            }
            break;
          // 全部禁音
          case "muteAllMessage":
            // 如果被单独放开后，别人加入，自己不会被静音
            if (this.isAdminMust === false && data.isAddMsgList) {
              return;
            }
            let _muteUserList = [];
            // disableAllMic true: 禁言， false 不禁言
            disableAllMic = data.disableAllMic;
            if (data.disableAllMic) {
              // 添加所有人
              console.log("this.userList", this.userList);
              this.userList.forEach((u) => {
                // 不要添加管理员
                if (u.userName === USERNAME) return;
                // 不对单独打开声音的人进行静音
                if (this.openMuteUserList.indexOf(u.userName) == -1) {
                  _muteUserList.push(u.userName);
                }
              });
              // 不要对管理员禁音
              if (this.isMeetingAdmin) {
                // ...
              } else {
                this.handleMuteMySelf(false);
              }
            } else {
              // 清空
              this.muteUserList = [];
              this.openMuteUserList = [];
              // 不要对管理员操作
              if (this.isMeetingAdmin) {
                // ...
              } else {
                this.handleMuteMySelf(true);
              }
            }
            this.muteUserList = _muteUserList;
            EventBus.$emit("setMuteAllStatus", data.disableAllMic);
            if (!data.isAddMsgList) {
              const muteMsg = `${displayUserName(
                data.userName.split("!!")[0]
              )} ${data.disableAllMic ? "开启" : "关闭"}了全员静音`;
              this.$message.info(muteMsg);
              this.addMsgList(`系统消息`, muteMsg);
            }
            this.handleGoToMessageBottom();
            break;
          // 单个禁音，获取禁音列表
          case "muteUser":
            // 某个人打开/关闭麦克风，更新图标状态和列表
            if (data.disabled) {
              this.muteUserList.push(data.muteUser);
              this.muteUserList = [...new Set(this.muteUserList)];
              this.openMuteUserList = this.openMuteUserList.filter((item) => {
                return item != data.muteUser;
              });
            } else {
              this.muteUserList = this.muteUserList.filter((item) => {
                return item != data.muteUser;
              });
              this.openMuteUserList.push(data.muteUser);
              this.openMuteUserList = [...new Set(this.openMuteUserList)];
            }
            // 管理员无法对自己禁音
            if (this.isMeetingAdmin) return;
            if (data.disabled) {
              // 如果是自己，消息弹出提醒
              if (USERNAME === data.muteUser) {
                this.isAdminMust = data.disabled;
                // 关掉自己的麦克风
                this.handleMuteMySelf(false);
                this.$message.info(`您已被管理员禁音`);
              }
            } else {
              this.isAdminMust = data.disabled;
              this.handleMuteMySelf(true);
            }
            if (!data.isAddMsgList) {
              this.addMsgList(
                `系统消息`,
                `${displayUserName(
                  data.userName.split("!!")[0]
                )} 对 ${displayUserName(data.muteUser.split("!!")[0])}  ${
                  data.disabled ? "开启" : "关闭"
                }了静音`
              );
            }
            this.handleGoToMessageBottom();
            break;
          // 推流消息
          case "streamMessage":
            const streamingUserName = data.userName;
            const otherStreamRoomId = `roomSelf-${streamingUserName}`;

            // 不处理自己推流消息
            if (otherStreamRoomId === this.mySelfRoomId) return;

            taskQueue.push({
              roomid: otherStreamRoomId,
              action: "streamMessage",
              isStreaming: data.isStreaming,
            });
            if (!isWorking) {
              this.mergeStream.forEach((item) => {
                if (item.name == otherStreamRoomId) {
                  data.isStreaming
                    ? (item.showAvatar = false)
                    : (item.showAvatar = true);
                  this.$forceUpdate();
                }
              });
              await this.handleTaskQueue();
            }
        }
      } catch (e) {}
    },
    // 消息滚动条滚动到底部
    handleGoToMessageBottom() {
      this.$nextTick(() => {
        const el = this.$refs.msgScroll.wrap;
        this.$refs.msgScroll.wrap.scrollTop = el.scrollHeight;
      });
    },
    // 创建自己的房间并给自己的房间推流
    createMySelefAuxiConnection() {
      const _this = this;
      console.log("创建自己的房间并给自己的房间推流 start");
      // 切换布局
      tvvssdk.createConnection(function (res) {
        console.log("创建自己的房间并给自己的房间推流 createConnection", res);
        if (res.success || res.disconnected) {
          if (res.disconnected) {
            console.warn(
              `createMySelefAuxiConnection 自己的房间 ICE连接失败,正在重新连接: ${_this.mySelfRoomId} ${res.sessionid}`
            );
            tvvssdk.streamStop(res.sessionid);
            sessionIdMap.set(_this.mySelfRoomId, res.sessionid);
            window.sessionIdMap = sessionIdMap;
            _this.videoStreamStart(res.sessionid, _this.mySelfRoomId);
            return;
          }
          _this.mySelfRoomId = `roomSelf-${_this.username}`;
          if (!_this.mainViewName) {
            _this.mainViewName = `roomSelf-${_this.username}`;
            _this.oldMainViewName = `roomSelf-${_this.username}`;
          }
          _this.mySelfRoomSession = res.sessionid;
          sessionIdMap.set(_this.mySelfRoomId, res.sessionid);
          window.sessionIdMap = sessionIdMap;
          // 只推视频流，没有声音流
          console.log(
            `创建自己的房间并给自己的房间推流,roomSelfId: ${_this.mySelfRoomId}`
          );
          _this.joinMyselfAuxiRoom(
            res.sessionid,
            _this.mySelfRoomId,
            _this.mySelfRoomId
          );
        } else if (res === "Camera call failed") {
          _this.shareScreen();
          // tvvssdk.streamStop(_this.mySelfRoomId)
          _this.enableShareScreen = true;
          _this.enableVideo = false;
        } else if (res === "screen stop") {
          // 用户取消屏幕共享操作
          _this.enableShareScreen = false;
          tvvssdk.streamStop(_this.mySelfRoomId);
        } else if (res === "screen denied") {
          // 用户共享屏幕时取消窗口选择
          tvvssdk.streamStop(_this.mySelfRoomId);
          _this.enableShareScreen = false;
          _this.selectScreenDialog = false;
        } else if (res === "screen start") {
          // 开始屏幕共享
          _this.enableShareScreen = true;
          _this.selectScreenDialog = false;
          _this.handleAddStreamMessage("screen", true);
          // _this.reloadIndexStream(0)
        } else if (res.isSources) {
          // 返回可选择窗口列表信息
          res.sources.forEach((item) => {
            item.imgSrc = item.thumbnail ? item.thumbnail.toDataURL() : "";
          });
          _this.sourceList = res.sources;
          _this.sourceCallbackFunc = res.sourcesCallback;
          _this.selectScreenDialog = true;
        } else {
          console.log(
            "创建自己的房间并给自己的房间推流 createAuxiConnection==============",
            res
          );
        }
      });
    },
    // 别人 加入房间
    joinAuxiRoom(
      sessionid,
      roomId,
      name,
      index,
      joinType = "init",
      shouldLoadStream
    ) {
      name += "|" + this.$UUID();
      console.log(
        "加入别人房间",
        sessionid,
        roomId,
        name,
        index,
        (joinType = "init"),
        shouldLoadStream
      );
      return new Promise((resolve, reject) => {
        const _this = this;
        const callbacks = {
          onjoined: async function (name) {
            console.log(
              "joinAuxiRoom 别人 加入房间",
              sessionid,
              roomId,
              index,
              shouldLoadStream
            );

            const queryResult = await _this.handleCheckQueryRoom(
              sessionid,
              roomId
            );
            console.log("queryResult", queryResult);
            // 房间不存在
            if (queryResult === false) {
              resolve(true);
              return;
            }

            if (joinType === "init") {
              const queryResultParticipants = queryResult.participants || [];
              const queryResultAdminArr = queryResultParticipants.filter(
                (u) => u.display === roomId
              );
              if (queryResultAdminArr && queryResultAdminArr.length) {
                const queryResultAdmin = queryResultAdminArr[0];
                shouldLoadStream = queryResultAdmin.publishvideo;
              }
            } else if (joinType === "joined") {
              // 加入的 始终为false，不拉流，通知之后才去拉流
              shouldLoadStream = false;
            }

            console.log(
              "handleQuery - AndLoadOtherSelfRoom exec",
              roomId,
              index,
              sessionid
            );

            _this.StreamStartAuxi(sessionid, roomId, index, shouldLoadStream);
            resolve(true);
          },
          onleave: function (name, rfindex) {},
          ondata: function (sender, platform, data) {},
          repeatLogin: function (msg) {
            console.warn("repeatLogin 2 用户重复登录", msg);
          },
        };
        tvvssdk.joinRoom(sessionid, roomId, name, callbacks);
      });
    },
    // 自己加入自己房间
    joinMyselfAuxiRoom(sessionid, roomId, name) {
      const _this = this;
      const callbacks = {
        onjoined: function (name) {
          _this.videoStreamStart(sessionid, roomId);
        },
        onleave: function (name, rfindex) {
          console.log(name + " has leaved");
        },
        ondata: function (sender, platform, data) {},
        repeatLogin: function (msg) {
          console.warn("repeatLogin 3 用户重复登录", msg);
        },
      };
      tvvssdk.joinRoom(sessionid, roomId, name, callbacks);
    },
    // 加入房间
    addAuxiConnectionByRoomId(roomid, index) {
      // var _this = this
      // return new Promise((resolve, reject) => {
      //   // 切换布局
      //   this.isSolo = false
      //   this.dynamicLayout()
      //
      //   setTimeout(() => {
      //     tvvssdk.createConnection(async function (res) {
      //       if (res.success) {
      //         const joinResult = await _this.joinAuxiRoom(res.sessionid, roomid, _this.mySelfRoomId,index)
      //         resolve(joinResult)
      //       } else {
      //         console.log('createAuxiConnection==============', res.msg)
      //       }
      //     })
      //   }, 2000)
      // })
    },
    /**
     * 订阅其他人的
     * @param   sessionid         {String}
     * @param   roomId            {String}
     * @param   index             {Number}
     * @param   shouldLoadStream  {Boolean}
     * */
    StreamStartAuxi(sessionid, roomId, index, shouldLoadStream) {
      console.log(
        "订阅其他人的 StreamStartAuxi",
        sessionid,
        roomId,
        index,
        shouldLoadStream
      );
      const _this = this;
      index = _this.getIndexByRoomName(roomId) || index;
      if (!shouldLoadStream) {
        const video = {
          stream: null,
          index,
          name: roomId,
          show: true,
          extra: {},
          sessionid: sessionid,
        };
        _this.handleSetVideoList(index, video);
        _this.reloadIndexAuxiStream(index);
        return;
      }

      let options = {
        audio: {},
        video: {},
        conf: {},
      };
      //设置音频参数
      options.audio.sendaudio = false;
      options.audio.recvaudio = true;
      options.audio.publishaudio = false;
      options.audio.subscribeaudio = false;
      options.audio.audioindeviceid = this.deviceInfo.microphone;
      //设置视频参数
      options.video.sendvideo = false;
      options.video.recvvideo = true;
      options.video.deviceid = this.deviceInfo.camera;
      options.video.publishvideo = false;
      options.video.subscribevideo = true;
      options.video.type = "camera";
      //设置会场参数，仅对MCU会议有效
      options.conf.size = this.deviceInfo.size;
      options.conf.fps = this.deviceInfo.fps;
      options.conf.confsize = this.deviceInfo.confsize;
      options.conf.confminbr = 150 * 1024;
      options.conf.confmaxbr = this.deviceInfo.confmaxbr;
      options.conf.confinitbr = 500 * 1024;
      options.conf.conffps = this.deviceInfo.conffps;
      options.conf.mode = "sfu-up";
      options.conf.picmode = 0; //0：一大多小， 1：等大

      console.log(
        "StreamStartAuxi",
        sessionid,
        roomId,
        index,
        shouldLoadStream,
        options
      );
      const callbacks = {
        onlocalstream: function (sessionId, stream, extra) {
          console.log(
            "订阅其他人的 StreamStartAuxi onremotestream",
            sessionId,
            stream,
            extra
          );
        },
        onremotestream: function (sessionId, stream, extra) {
          index = _this.getVidoeListByIndex(roomId) || index;
          if (_this.getVidoeListByIndex(roomId) == 0) {
            index = _this.getVidoeListByIndex(roomId);
          }

          console.log(
            "StreamStartAuxi onremotestream",
            sessionid,
            roomId,
            index,
            shouldLoadStream
          );
          // let roomName = roomId
          // // 把 roomSelf-pc-33 显示为33
          // if(roomId.indexOf('roomSelf-') !== -1) {
          //   roomName = roomId.split('-')[1]
          // }
          console.log(
            "_this.videoList before",
            _this.videoList,
            sessionid,
            roomId,
            index,
            shouldLoadStream,
            sessionIdMap.get(roomId)
          );
          if (!_this.videoList[index]) {
            const video = {
              stream,
              index,
              name: roomId,
              show: true,
              extra,
              sessionid,
            };
            _this.handleSetVideoList(index, video);
          } else {
            const video = {
              stream,
              index,
              name: roomId,
              show: true,
              extra,
              sessionid,
            };
            _this.handleSetVideoList(index, video);
            // _this.videoList[index].stream = stream;
            // _this.videoList[index].index = index;
            // _this.videoList[index].name = roomId;
            // _this.videoList[index].show = true;
            // _this.videoList[index].extra = extra;
            // TODO: ???????????
            // _this.videoList[index].sessionid = sessionId;
          }
          // 这里为九宫格且被切换主视角后需要通过vidolist来重新确定渲染的流对象
          if (
            (_this.videoLayout == 1 && _this.isDbClickFlag) ||
            (_this.videoLayout == 0 && _this.isDbClickFlag)
          ) {
            index = _this.getIndexByRoomName(roomId) || index;
            if (_this.getIndexByRoomName(roomId) == 0) {
              index = _this.getIndexByRoomName(roomId);
            }
          }
          _this.reloadIndexAuxiStream(index);
          console.log(
            "_this.videoList after",
            _this.videoList,
            sessionid,
            roomId,
            index,
            shouldLoadStream,
            sessionIdMap.get(roomId)
          );
        },
        onleave: function (name, rfindex) {},
        ondata: function (sender, platform, data) {},
        onsharescreen: function (status) {},
      };
      tvvssdk.streamStart(sessionid, options, roomId, callbacks);
    },
    // 重新加载流
    reloadIndexAuxiStream(index) {
      setTimeout(() => {
        if (!index && typeof index !== "number") return;
        this.$nextTick(() => {
          this.handleAttachMediaStream(index);
        });
      }, 1000);
    },
    // sdk加载流，递归方式，最大次数5
    handleAttachMediaStream(index, count = 1) {
      const refVideoId = `video${index}`;
      const max_count = 5;
      if (count === max_count) return;
      count++;
      setTimeout(() => {
        if (!this.$refs[refVideoId] || !this.$refs[refVideoId][0]) {
          console.warn(
            `tvvssdk attachMediaStream 4 refs 第${count}次 不存在`,
            index,
            "refVideoId==>",
            refVideoId,
            "this.$refs==>",
            this.$refs,
            "el==>",
            this.$refs[refVideoId]
          );
          this.handleAttachMediaStream(index, count);
        } else {
          const videoEl = this.$refs[refVideoId][0];
          console.log(
            `tvvssdk attachMediaStream 4 重新获取 第${count}次`,
            this.$refs,
            refVideoId,
            videoEl
          );
          console.warn(this.videoList, index, "订阅其他房间重新获取流的时候");
          // 切换过主视图后需要此方式获取
          if (
            (this.videoLayout == 1 && this.isDbClickFlag) ||
            (this.videoLayout == 0 && this.isDbClickFlag)
          ) {
            index =
              this.getVidoeListByIndex(videoEl.getAttribute("data-name")) ||
              index;
            if (
              this.getVidoeListByIndex(videoEl.getAttribute("data-name")) == 0
            ) {
              index = this.getVidoeListByIndex(
                videoEl.getAttribute("data-name")
              );
            }
          }
          tvvssdk.attachMediaStream(videoEl, this.videoList[index].stream);
        }
      }, 1000);
    },
    // 用 $set 方法 去更新 videoList
    handleSetVideoList(index, video) {
      this.$set(this.videoList, index, video);
      console.warn("重置之后的 this.videoList", this.videoList);
    },
    // 显示用户列表
    handleShowUserListDrawer() {
      this.showUserListDrawer = !this.showUserListDrawer;
    },
    // 全部禁音
    handleMuteAll(disableAllMic, isAddMsgList = false) {
      const sessionid = this.sessionid;
      const username = this.username;
      const roomId = this.roomId;

      const muteMessageData = {
        status: "muteAllMessage",
        userName: username,
        disableAllMic,
        isAddMsgList,
      };
      const muteMessageDataStr = JSON.stringify(muteMessageData);

      if (this.sessionid) {
        tvvssdk.sendGroupData(
          sessionid,
          roomId,
          username,
          "all",
          muteMessageDataStr,
          function (res) {
            if (res.success) {
              //
            }
          }
        );
      }
      // 管理员调用接口
      if (this.isMeetingAdmin) {
        this.handleUpdateByMute(disableAllMic);
      }
    },
    /**
     * @param   type          {String}  推流方式，[camera, 摄像头, screen，屏幕共享]
     * @param   isStreaming   {Boolean} 是否在推流
     * */
    // 添加推流消息
    handleAddStreamMessage(type = "camera", isStreaming) {
      const sessionid = this.sessionid;
      const username = this.username;
      const roomId = this.roomId;

      const streamMessageData = {
        status: "streamMessage",
        userName: username,
        type,
        isStreaming,
      };
      const streamMessageDataStr = JSON.stringify(streamMessageData);

      if (this.sessionid) {
        tvvssdk.sendGroupData(
          sessionid,
          roomId,
          username,
          "all",
          streamMessageDataStr,
          function (res) {
            if (res.success) {
              //
            }
          }
        );
      }
    },
    // 单个禁音
    handleMuteUser(muteUser, disabled) {
      const sessionid = this.sessionid;
      const username = this.username;
      const roomId = this.roomId;
      let muteUserList = this.muteUserList;
      // 禁音
      if (disabled) {
        muteUserList.push(muteUser);
      } else {
        // 取消禁音
        if (muteUserList.includes(muteUser)) {
          muteUserList = muteUserList.filter((u) => u !== muteUser);
        }
      }
      // 去重
      muteUserList = [...new Set(muteUserList)];
      this.muteUserList = muteUserList;

      const muteMessageData = {
        status: "muteUser",
        userName: username,
        muteUser,
        disabled,
        muteUserList,
      };
      const muteMessageDataStr = JSON.stringify(muteMessageData);

      if (this.sessionid) {
        tvvssdk.sendGroupData(
          sessionid,
          roomId,
          username,
          "all",
          muteMessageDataStr,
          function (res) {
            if (res.success) {
              //
            }
          }
        );
      }
    },
    // 开关某个人的扬声器
    handleVolUser(volUser, disabled) {
      const _this = this;
      let volUserList = _this.volUserList;
      // 禁音
      if (disabled) {
        volUserList.push(volUser);
      } else {
        // 取消禁音
        if (volUserList.includes(volUser)) {
          const index = volUserList.indexOf(volUser);
          volUserList.splice(index, 1);
        }
      }
      this.handleMuteOneElement(volUser, disabled);
      // 去重
      volUserList = [...new Set(volUserList)];
      _this.volUserList = volUserList;
    },
    // 取消共享dialog
    handleSelectScreenDialogCancel() {
      this.selectScreenDialog = false;
      const _this = this;
      if (_this.enableVideo) {
        const mySelfRoomSession = _this.mySelfRoomSession;
        tvvssdk.publish(mySelfRoomSession, true, function (res) {
          _this.enableVideo = true;
          _this.handleAddStreamMessage("camera", true);
          if (true) {
            _this.enableShareScreen = false;
            // 为开始分享屏幕时，取消共享屏幕 暂时不需要设置码率
            // setTimeout(() => {
            //   // 每次开启摄像头要设置码率
            // _this.handleSetBitrate('camera')
            // }, 3000)
          }
        });
      }
    },
    // 操作栏显示
    handleShowActionBar() {
      this.showActionBar = !this.showActionBar;
    },
    /**
     * 更新禁音数据
     * @param  {Boolean} disableAllMic  [true， 开启禁音，false, 关闭禁音]
     * */
    handleUpdateByMute(disableAllMic) {
      const id = Number(this.roomId);
      // [0 关闭  1开启]
      const isMute = disableAllMic ? 1 : 0;
      const data = {
        id,
        isMute,
      };
      updateByMute(data).then((res) => {
        if (res.data.code === 200) {
        }
      });
    },
    // 挂断 离开会议
    handleCallOff() {
      let innerTitle = ``;
      let innerTip = ``;
      let confirmButtonText = ``;
      // 管理员
      if (this.isMeetingAdmin) {
        innerTitle = `您确定要结束当前会议吗？`;
        innerTip = `当前正在会议中，离开会议也将结束`;
        confirmButtonText = `结束会议`;
      } else {
        innerTitle = `您确定要退出当前会议吗？`;
        innerTip = `当前正在会议中，请确认您将退出会议`;
        confirmButtonText = `退出会议`;
      }
      let _this = this;
      this.$msgbox({
        // title: '提示',
        message: `
        <div class="msgBoxInner">
          <div class="innerHeader">
            <span class="innerTitle">${innerTitle}</span>
          </div>
        </div>
        `,
        //  <div class="innerTip">${innerTip}</div>
        dangerouslyUseHTMLString: true,
        customClass: "customMsgBox customMsgBoxForBtn",
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        confirmButtonClass: "confirmBtn confirmButton red_del_btn",
        cancelButtonText: "取消",
        cancelButtonClass: "confirmBtn cancelButton",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "执行中...";
            try {
              _this.leaveRoom();
            } catch (e) {}
            done();
            instance.confirmButtonLoading = false;
          } else {
            done();
          }
        },
      })
        .then((action) => {
          // this.$message({
          //   type: 'info',
          //   message: 'action: ' + action
          // });
        })
        .catch((e) => {});
    },
    // 管理员退出提示
    showAdminExit() {
      this.$electron.ipcRenderer.send("meeting-window-show", {
        showIcon: false,
      });
      this.$electron.ipcRenderer.send("meeting-window-shareShrink-close");
      let _this = this;

      if (this.streaming) {
        this.stopStream();
      }

      try {
        this.videoList.forEach(function (videoinfo) {
          if (videoinfo.sessionid !== -1) {
            tvvssdk.leaveRoom(videoinfo.sessionid);
            videoinfo.sessionid = -1;
          }
        });
      } catch (e) {}
      try {
        this.leaveMessageRoom();
      } catch (e) {}

      this.$msgbox({
        // title: '提示',
        message: `
        <div class="msgBoxInner">
          <div class="innerHeader">
            <span class="innerTitle">主持人已结束了会议</span>
          </div>
        </div>
        `,
        //  <div class="innerTip">当前正在会议中，请确认您将退出会议</div>
        dangerouslyUseHTMLString: true,
        customClass: "customMsgBox customMsgBoxForBtn",
        showCancelButton: false,
        confirmButtonText: "退出会议",
        confirmButtonClass: "confirmBtn confirmButton red_del_btn",
        cancelButtonClass: "confirmBtn cancelButton",
        beforeClose: (action, instance, done) => {
          if (action) {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "执行中...";
            _this.leaveRoom();
            done();
            instance.confirmButtonLoading = false;
          } else {
            done();
          }
        },
      })
        .then((action) => {})
        .catch((e) => {});
    },
    // 结束流
    stopStream() {
      this.videoList.forEach(function (videoinfo) {
        if (videoinfo.sessionid !== -1) {
          tvvssdk.streamStop(videoinfo.sessionid);
        }
      });
      this.streaming = false;
    },
    //离开消息房间
    leaveMessageRoom() {
      console.log("离开消息房间");
      tvvssdk.streamStop(this.sessionid);
      tvvssdk.leaveRoom(this.sessionid);
    },
    // 离开房间
    leaveRoom() {
      let _this = this;
      if (this.streaming) {
        this.stopStream();
      }

      try {
        this.videoList.forEach(function (videoinfo) {
          if (videoinfo.sessionid !== -1) {
            tvvssdk.leaveRoom(videoinfo.sessionid);
            videoinfo.sessionid = -1;
          }
        });
      } catch (e) {}
      try {
        this.leaveMessageRoom();
      } catch (e) {}

      // 主持人 关闭room
      if (this.isMeetingAdmin && !isOffLine) {
        closeConferenceGET(this.createdRoomData.id).then((res) => {
          if (res.data.code === 200) {
            this.$electron.ipcRenderer.send("meeting-window-close");
          }
        });
      } else {
        this.$electron.ipcRenderer.send("meeting-window-close");
      }
    },
    // 复制会议信息
    handleCopyInfo() {
      const shareText = `${myRealName}邀请您加入视频会议\n会议标题：${this.createdRoomData.subject}\n会议ID：${this.roomId}\n会议链接：${this.shareMeetingLink}`;
      const _this = this;
      this.$copyText(shareText).then(
        function (e) {
          _this.$message.success("已复制会议信息");
        },
        function (e) {
          _this.$message.error("复制失败");
          console.log(e);
        }
      );
    },
    // 显示名称
    formatRoomName(roomId) {
      if (!roomId) return "";
      // // 把 roomSelf-pc-33 显示为33
      if (roomId.indexOf("roomSelf-") !== -1) {
        roomId = roomId.split("-")[2];
      }
      return roomId.split("!!")[0];
    },
    formatUsersName(name) {
      return name.split("!!")[0];
    },
    // 网络断开提示
    offLineListener() {
      isOffLine = true;
      this.$electron.ipcRenderer.send("meeting-window-show", {
        showIcon: false,
      });
      this.$electron.ipcRenderer.send("meeting-window-shareShrink-close");
      let _this = this;
      if (this.streaming) {
        this.stopStream();
      }

      try {
        this.videoList.forEach(function (videoinfo) {
          if (videoinfo.sessionid !== -1) {
            tvvssdk.leaveRoom(videoinfo.sessionid);
            videoinfo.sessionid = -1;
          }
        });
      } catch (e) {}
      try {
        this.leaveMessageRoom();
      } catch (e) {}

      this.$msgbox({
        // title: '提示',
        message: `
        <div class="msgBoxInner">
          <div class="innerHeader">
            <span class="innerTitle">网络连接失败</span>
          </div>
        </div>
        `,
        //  <div class="innerTip">网络连接失败，请确认您将退出会议</div>
        dangerouslyUseHTMLString: true,
        customClass: "customMsgBox customMsgBoxForBtn",
        showCancelButton: false,
        confirmButtonText: "退出会议",
        confirmButtonClass: "confirmBtn confirmButton red_del_btn",
        cancelButtonClass: "confirmBtn cancelButton",
        beforeClose: (action, instance, done) => {
          if (action) {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "执行中...";
            _this.leaveRoom();
            done();
            instance.confirmButtonLoading = false;
          } else {
            done();
          }
        },
      })
        .then((action) => {})
        .catch((e) => {});
    },
    // 右键菜单
    handleShowDialogTip(e, item) {
      this.rightMenuItem = item;
      const oX = e.clientX;
      const oY = e.clientY;
      const menuEl = document.querySelector(".meeting-right-menu-container");
      //菜单出现后的位置
      menuEl.style.display = "flex";
      menuEl.style.left = oX + "px";
      menuEl.style.top = oY + "px";
      return false;
    },
    handleHideDialogTip() {
      const menuEl = document.querySelector(".meeting-right-menu-container");
      //菜单出现后的位置
      menuEl.style.display = "none";
    },
    //***************qos信息 START*********************
    // 显示QOS
    handleShowQos() {
      let _this = this;
      const menuEl = document.querySelector(".meeting-right-menu-container");
      menuEl.style.display = "none";
      this.isShowQosDialog = true;

      const rightMenuItem = this.rightMenuItem;
      const _sessionid = rightMenuItem.sessionid;
      if (!_sessionid) {
        this.$message.error(`${rightMenuItem.name} sessionid不存在`);
      }
      qosIntervalId = window.setInterval(() => {
        tvvssdk.getQos(_sessionid, function (result) {
          if (result.success) {
            _this.qosData = result.report;
          }
        });
      }, 1000);
    },
    // 停止qos信息
    handleCloseQos() {
      this.rightMenuItem = {};
      this.isShowQosDialog = false;
      window.clearInterval(qosIntervalId);
      qosIntervalId = -1;
    },
    //***************qos信息 END*********************
  },
  watch: {
    // 人数动态改变视图
    confMemberNum: function () {
      this.dynamicLayout();
    },
    userList: function () {
      this.dynamicLayout();
    },
    mergeStream: {
      handler(newVal) {
        if (newVal) {
          newVal.forEach(async (item) => {
            if (item.name) {
              const res = await getAvatarByImId(item.name.split("!!")[1]);
              item.avatar = res.data.data.headImage;
              this.$forceUpdate();
            }
          });
        }
      },
    },
  },
};
</script>

<style scoped>
.buttonShrink {
  position: absolute;
  top: 25px;
  right: 30px;
  width: 23px;
  height: 23px;
  z-index: 9;
  cursor: pointer;
}
</style>
