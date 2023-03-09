<template>
  <div class="im-scroll-wrapper messageListContainerOuter" ref="scrollWrapper">
    <!-- 滚动列表 -->
    <div class="im-scroll-content" ref="scrollContent">
      <!-- 上拉加载 -->
      <!-- <div class="pulldown-wrapper" v-if="allLoaded">
        <span>已全部加载完毕</span>
      </div> -->
      <div class="pulldown-wrapper" v-if="!allLoaded && isFetching">
        <span>正在加载...</span>
      </div>
      <!-- 右键菜单 -->
      <RightPressMenu ref="long_press_menu"
        :menuStyle="MenusStyle"
        :message="MenuMessage"
        :lastMessage="lastMessage"
        :eventContText='eventContText'
        :ShowWithdraw="isShowWithdraw"
        @onForwardingMessage="onForwardingMessage"
        v-model="IsShowLongPressMenu"/>
      <!-- 消息实体 -->
      <div :id="'message-item' + message.messageId"
        class="message-item"
        ref="message_list"
        v-for="(message, index) of AfterProcessMessageList"
        :key="message.messageId">
        <!-- 消息时间间隔 -->
        <DateLine :message="message" v-if="shouldRenderMessageDate(index, AfterProcessMessageList)" />
        <!-- 1.普通聊天消息 -->
        <Ordinary v-if="message.type === 1"
          :message="message"
          :userAvatar='userAvatar(message)'
          :params="params"
          :isShowLeftModule="isShowLeftModule(message)"
          @onShowMenu="handleShowMenu"
        />
        <!-- 2.图片 -->
        <Picture v-else-if="message.type === 2"
          :message="message"
          :params="params"
          :userAvatar='userAvatar(message)'
          :messageAll='AfterProcessMessageList'
          :isShowLeftModule="isShowLeftModule(message)"
          @loadSuccess="handleImgLoad()"
          @onClickLookImg="onClickLookImg(index)"
          @onShowMenu="handleShowMenu"
        />
        <!-- 3.语音 -->
        <Recorder ref="recorder"
          v-else-if="message.type === 3"
          :message="message"
          :userAvatar='userAvatar(message)'
          :params="params"
          :isShowLeftModule="isShowLeftModule(message)"
          @audioPlay="handleAudioPlay()"
          @onShowMenu="handleShowMenu"
        />
        <!-- 5.动画表情 -->
        <AnimatedExpression v-else-if="message.type === 5"
          :message="message"
          :params="params"
          :userAvatar='userAvatar(message)'
          :isShowLeftModule="isShowLeftModule(message)"
          @loadSuccess="handleImgLoad()"
          @onClickLookImg="onClickLookImg(index)"
          @onShowMenu="handleShowMenu"
        />

        <!-- 10. type === 10 -->
        <!-- <div v-else-if="message.type === 10"> type为10：{{ message }}</div> -->


        <!-- 11.新建任务 -->
        <TaskRemind v-else-if="message.type === 11"
          :message="message"
          :params="params"
          :userAvatar='userAvatar(message)'
          :isShowLeftModule="isShowLeftModule(message)"
        />

        <!-- 12. 任务助手 [任务提醒、汇报交流] -->
        <taskNotice v-else-if="message.type === 12"
          :message="message"
          :params="params"
          :userAvatar='userAvatar(message)'
          :isShowLeftModule="isShowLeftModule(message)"
        />
        <!-- 13. 语音通话-回显 -->
        <voiceCall v-else-if="message.type === 13" :message="message" :MeId="MeId"/>
        <!-- 9.文件聊天消息 -->
        <File v-else-if="message.type === 9"
          :params="params"
          :message="message"
          :userAvatar='userAvatar(message)'
          :isShowLeftModule="isShowLeftModule(message)"
          @onShowMenu="handleShowMenu" />

        <!-- 1000*、202、系统消息 -->
        <System v-else-if="parseInt(message.type / 10000) === 1 || parseInt(message.type) === 202"
          :params="params"
          :message="message" />

        <!-- 900*， 401， 402 群消息 -->
        <GroupControl v-else-if="(parseInt(message.type / 100) === 9 || message.type === 401 || message.type === 402) && message.type !== 905"
          :params="params"
          :message="message" />

        <!-- 905、公告信息 -->
        <Notice v-else-if="message.type == 905"
          :isShowLeftModule="isShowLeftModule(message)"
          :params="params"
          :userAvatar='userAvatar(message)'
          :message="message" />
      </div>
    </div>
    <!-- 选择转发聊天dialog  -->
    <el-dialog append-to-body
      class="forward-box"
      :before-close="handleClearForwardingMessage"
      :visible.sync='forwardingMessageDialog'>
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">消息转发</span>
      </div>
      <SelectChatItem :message="forwardingMessage"
        @selectCancel="handleClearForwardingMessage"
        v-if="forwardingMessageDialog" />
    </el-dialog>
  </div>
</template>

<script>
import DateLine from './components/dateLine/index.vue'
import Ordinary from './components/ordinary/index.vue'
import Picture from './components/picture/index.vue'
import AnimatedExpression from './components/animated-expression/index.vue'
import Recorder from './components/recorder/index.vue'
import System from './components/system/index.vue'
import TaskRemind from './components/TaskRemind/index.vue'
import taskNotice from './components/task-notice/index.vue'
import File from './components/file/index.vue'
import GroupControl from './components/group-control/index.vue'
import RightPressMenu from './components/right-press-menu'
import SelectChatItem from "@/views/im/components/messageList/components/selectChatItem";
import Notice from './components/notice/index.vue'
import voiceCall from './components/voiceCall/index.vue'

import { mapState, mapGetters, mapActions } from 'vuex'
import { sendReadMessageReceipt } from '@/xmpp/send-message'
import { showMessageDate } from "@/utils";


export default {
  props: {
    params: {
      type: Object,
      required: true
      /*
      * id: '',
        type: 'friend',   // [room, friend]
        jid: ''           // 群jid / 好友id
      * */
    },
  },
  data() {
    return {
      isFetching: false,
      allLoaded: false, // 是否已经全部加载完毕
      BScroll: null, // 滚动列表插件实例对象
      beforePullDown: true, // 显示 "下拉菜单"
      isPullingDown: false, // 显示 "正在加载"
      IsShowLongPressMenu: false, // 是否显示长按菜单
      MenuMessage: {}, // 长按菜单的消息对象
      MenusStyle: {}, // 长按菜单的样式
      forwardingMessage: {}, // 要转发的消息
      forwardingMessageDialog: false,
      isShowWithdraw: true,
      eventContText: '',
      timed: null,
      lastMessage: '', // 管理最后一条消息被删除
    }
  },
  components: {
    DateLine,
    Ordinary,
    Picture,
    AnimatedExpression,
    Recorder,
    System,
    GroupControl,
    File,
    Notice,
    TaskRemind,
    taskNotice,
    RightPressMenu,
    SelectChatItem,
    voiceCall,
  },
  computed: {
    ...mapState({
      HeaderHeight: state => state.HeaderHeight, // 头部高度
      MeId: state => state.Common.User.MeId || 0, // 我的ID
      MeInfo: state => state.Common.User.MeInfo // 我是信息
    }),
    ...mapGetters({
      ChatRoomInfo: 'Im/Chat/ChatRoomInfo', // 聊天室信息
      'IdFriendList': 'Im/Friends/IdFriendList', // 我的好友列表
      AfterProcessMessageList: 'Im/Chat/AfterProcessMessageList' // 处理后需要渲染到页面的消息列表数据
    }),
    userAvatar(){
      return (message)=>{
        return this.IdFriendList[message.fromUserId].headImg ? this.IdFriendList[message.fromUserId].headImg: ''
      }
    },
  },
  mounted () {
    this.imgSum = 0 // 一次性加载图片的数量（所有加载完成才会更新页面）
    this.pageIndex = 0 // 页码
    this.pageSize = 20 // 每页消息数量
    this.initChatMessage()
    const scrollEl = document.querySelector('.im-scroll-wrapper')

    if(scrollEl) {
      scrollEl.addEventListener('scroll', this.handleScroll, true)
    }
    console.log('AfterProcessMessageList - 聊天列表',this.params)
    this.timed = setTimeout(()=>{
      this.handleScrollToBottom()
    },10)
  },
  destroyed() {
    const scrollEl = document.querySelector('.im-scroll-wrapper')
    if(scrollEl) {
      scrollEl.removeEventListener('scroll', this.handleScroll, true)
    }
  },
  methods: {
    ...mapActions({
      'GetMessageList': 'Im/Chat/GetMessageList' // [GET] 获取消息列表
    }),

    // 监听滚动
    handleScroll(e) {
      if (this.isFetching) return
      const el = e.target
      if (el.scrollHeight - el.clientHeight - el.scrollTop > 50) {
        // clearUnread();
      }

      if (el.scrollTop === 0 && el.scrollHeight > el.clientHeight) {
        this.isFetching = true;
        this.handleMessageRefresh()
      }
    },
    // 定位到底部
    handleScrollToBottom() {
      const len = this.AfterProcessMessageList.length
      if(len === 0) return
      let messageId = this.AfterProcessMessageList[len - 1].messageId || ''
      if(messageId) {
        const messageEl = document.querySelector(`#message-item${messageId}`)
        if(messageEl) {
          messageEl.scrollIntoView(false)
        }
      }
    },
    // [init] 初始化聊天消息
    initChatMessage () {
      this.data = {
        pageIndex: this.pageIndex++,
        pageSize: this.pageSize,
        receiver: this.params.id,
        roomId: this.params.jid,
        type: this.params.type,
        endTime: 0
      }
      this.GetMessageList(this.data).then(rs => {
        this.$nextTick(() => {
          this.handleScrollToBottom()
        })
      })
    },
    // [Refresh] 加载消息列表
    handleMessageRefresh () {
      // 记录上次的id，用于跳转到指定位置
      if(this.allLoaded) return
      let messageId = this.AfterProcessMessageList[0] ? this.AfterProcessMessageList[0].messageId : ''
      this.beforePullDown = false
      this.isFetching = true
      this.isPullingDown = true
      this.data.pageIndex = this.pageIndex++
      this.GetMessageList(this.data)
        .then(rs => {
        // 消息数量小于请求的数量则没有数据了，需要关闭下拉加载
        if (rs.length < this.pageSize) {
          this.allLoaded = true
        }
        this.isRefreshData = true
        this.isPullingDown = false
      })
      .finally(() => {
        this.isFetching = false
        this.$nextTick(() => {
          if(messageId) {
            const messageEl = document.querySelector(`#message-item${messageId}`)
            if(messageEl) {
              messageEl.scrollIntoView(false)
            }
          }
        })
      })
    },
    // [Load] 图片异步加载完成
    handleImgLoad () {
      this.$nextTick(() => {
        // if (this.BScroll) {
        //   this.BScroll.refresh()
        //   if (this.ChatRoomInfo.isAddMessage || --this.imgSum === 0) {
        //     this.imgSum = 0
        //     // 滚动到底部
        //     this.handleScrollToBottom()
        //   }
        // }
      })
    },
    // [Click] 点击列表区域
    onClickMessageListClick () {
      this.IsShowLongPressMenus = []
      this.$emit('messageListClick')
    },
    // [Emit] 显示菜单 
    handleShowMenu (message, style, e) {
      console.log("AfterProcessMessageList - 右键当前消息", )
      this.MenuMessage = message
      this.MenusStyle = style
      this.IsShowLongPressMenu = true
      if(message.type === 1){
        this.getMsgText(e.target)
      }
      // 消息发送两分钟之后不展示撤回按钮
      let sendTime = Math.floor(message.timeSend/1000)
      let newTime = Math.floor(new Date().getTime()/1000)
      let intervalTime = newTime - sendTime
      this.isShowWithdraw = intervalTime > 120 ? false : true


      // 如果是最后一条消息【被删除：展示倒数第二条】
      let position = this.AfterProcessMessageList.findIndex((item)=>{
        return item.messageId == message.messageId
      })
      let totalNum = this.AfterProcessMessageList.length
      // 更换消息会话栏最后一条消息
      if(position == totalNum - 1 && position == 0){
        let newObj={}
        newObj['oldContent'] = ''
        newObj['content'] = ''
        this.lastMessage =  JSON.stringify(newObj)
        return
      }
      let lastTwoMessage = this.AfterProcessMessageList[position-1]
      this.lastMessage = position == totalNum - 1 ? JSON.stringify(lastTwoMessage) : ''
      console.log('this.lastMessage = this.lastMessage',this.lastMessage)
      
    },
    // 显示转发消息菜单
    onForwardingMessage(message) {
      console.log(message,'接收到的参数')
      this.forwardingMessage = message
      this.forwardingMessageDialog = true
    },
    handleClearForwardingMessage() {
      this.forwardingMessage = {}
      this.forwardingMessageDialog = false
    },
    // [Click] 点击查看图片消息的阅后即焚
    onClickLookImg (index) {
      // 刷新高度列表
      this.BScroll.refresh()
      if (this.AfterProcesssMessageList.length - 1 === index) {
        // 点击最后(最底下)一张图片,需要定位到底部
        this.handleScrollToBottom()
      }
    },
    // [emit] 暂停其他语音的播放
    handleAudioPlay () {
      let audioIndex = 0
      const messageList = this.ChatRoomInfo.messageList
      for (let i = 0; i < messageList.length; i++) {
        if (messageList[i].type === 3) {
          // 如果有播放则停止播放
          if (!this.$refs.recorder[audioIndex].$refs.audio.paused) {
            clearInterval(this.$refs.recorder[audioIndex].timer) // 停止更换图片
            clearInterval(this.$refs.recorder[audioIndex].playTimer) // 停止记录播放时间
            this.$refs.recorder[audioIndex].$refs.audio.pause() // 停止播放
            this.$refs.recorder[audioIndex].$refs.audio.currentTime = 0 // 将进度条归零
            this.$refs.recorder[audioIndex].playTime = 0 // 初始化播放时间
            this.$refs.recorder[audioIndex].ImgIndex = 3 // 初始化图片
          }
          audioIndex++
        }
      }
    },
    // 是否显示左模块
    isShowLeftModule (message) {
      return parseInt(message.fromUserId) !== this.MeId && (message.type < 100 || message.type == 905)
    },
    // 是否需要显示时间间隔
    shouldRenderMessageDate(i, allMessage) {
      const message = allMessage[i]
      const prevMessage = i > 0 ? allMessage[i - 1] : null;
      const nextMessage = i < allMessage.length - 1 ? allMessage[i + 1] : null;
      return showMessageDate(message, prevMessage, i === 0)
    },

    // 获取点击对象的纯文本消息
    getMsgText(eTarget){
      eTarget.setAttribute('id','copy_obj')
      let copyObjCont = document.getElementById('copy_obj')
      let eventClass = copyObjCont.hasAttribute('selectcype')
      if(eventClass){
        this.eventContText = copyObjCont.innerText
        copyObjCont.removeAttribute('id')
      }else{
        copyObjCont.removeAttribute('id')
        this.getMsgText(copyObjCont['parentNode'])
      }
    },
  },
  watch: {
    // 监听消息列表
    'AfterProcessMessageList' (newVal) {
      console.log('AfterProcessMessageList===>', newVal)
      // 发送已读消息回执
      newVal.forEach(message => {
        if (parseInt(message.fromUserId) !== this.MeId && !message.isRead && !message.isReadDel) {
          sendReadMessageReceipt(message.jid || message.fromUserId, message, this.params.type === 'friend' ? 1 : 2)
        }
      })

      // 更新列表视图
      // 设置延时等待列表渲染完成在刷新列表
      this.$nextTick(() => {
        setTimeout(() => {
          // 添加单条消息
          if (this.ChatRoomInfo.isAddMessage) {
            const scrollWrapperHeight = this.$refs['scrollWrapper'].offsetHeight
            const scrollHeight = this.$refs['scrollWrapper'].scrollHeight
            const scrollTop = this.$refs['scrollWrapper'].scrollTop
            // 翻看记录大于500px 则不滚动到底部
            if(scrollHeight - scrollTop - scrollWrapperHeight <= 500) {
              this.handleScrollToBottom()
            }
          }
        }, 10)
      })
    }
  },
}
</script>
