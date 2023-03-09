<!-- 语音消息 -->
<template>
  <div class="recorder index">
    <div :class="isShowLeftModule ? 'left common' : 'common'">
      <!-- 头像 -->
      <div class="avatar">
        <!-- <Avatar :username="message.fromUserName"></Avatar> -->
        <headAvatar 
          :size="32" 
          :fontSize='12'
          :avatarUrl="userAvatar" 
          :username="message.fromUserName">
        </headAvatar>
      </div>
    <!-- 内容 -->
    <div class="content">
      <!-- 群昵称 -->
      <div class="nickname" v-show="params.type === 'room' && isShowLeftModule">{{message.fromUserName}}</div>
      <!-- 消息气泡 -->
      <div class="bubble">
        <!-- 消息体 -->
        <div class="value message-body" ref="longTouch">
          <!-- 消息内容 -->
          <div class="recorder_cont" :style="RecorderStyle" @click="handleVoiceClick($event)">
            <img class="horn" :src="$imgUrl.chat.messageList['v' + ImgIndex]" />
            <span>{{TimeLen}}"</span>
            <audio ref="audio" @ended="handleAudioEnded" :src="Message.content"></audio>
          </div>
        </div>
        <!-- 已读内容 -->
        <div :class="['read', message.isReadDel ? 'read-sum' : '']">
          <!-- 阅后即焚icon -->
          <div class="is-read-del" v-if="message.isReadDel">
            <img class="img" :src="`${$imgUrl.chat.messageList.fire}`" />
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>

import headAvatar from "@/components/headAvatar"
import { mapActions } from 'vuex'
import MenuMixin from "../mixins/burn-after-reading";


export default {
  name: 'Recorder',
  mixins: [MenuMixin],
  props: {
    params: {
    },
    // 消息对象
    message: {
      type: Object, default: () => {
        return {}
      }
    },
    isShowLeftModule: {
      type: Boolean,
      default: false
    },
    userAvatar:{
      type: String,
      default: ''
    }
  },
  components: {
    headAvatar
  },
  data() {
    return {
      ImgIndex: 3, // 当前显示的图片索引
      RecorderStyle: {}, // 消息体样式
      Message: {}, // 格式化后的消息体
      TimeLen: 0 // 语音时长
    }
  },
  created () {
    // 初始化数据
    const maxWidth = 160 // 最大宽度
    const startWidth = 50 // 起始宽度
    this.TimeLen = this.message.timeLen || this.message.fileTime
    const width = startWidth + this.TimeLen / 60 * maxWidth
    this.RecorderStyle = { 'width': width + 'px' }

    // 格式化音频
    this.Message = JSON.parse(JSON.stringify(this.message))
    // return false
    this.PostAmrToMp3(this.Message).then(rs => {
      this.Message.content = rs
    })
  },
  computed: {
  },
  methods: {
    ...mapActions({
      'PostAmrToMp3': 'Im/Chat/PostAmrToMp3' // [POST] 格式化音频
    }),
    // [Click] 处理语音播放或停止
    handleVoiceClick (e) {
      // 若阻止冒泡，则不执行事件代码
      if (this.isStopPropagation) {
        // 重置阻止冒泡变量
        this.isStopPropagation = !this.isStopPropagation
        // 阻止往上冒泡
        e.stopPropagation()
        return
      }

      // 发送已读阅后即焚消息回执
      this.handleSendMessageReceipt()

      const audio = this.$refs.audio
      if (audio.paused) {
        // 当前状态暂停中
        this.ImgIndex = 1
        this.playTime = 0
        this.$emit('audioPlay') // 暂停其他语音播放
        audio.play() // 播放语音
        // 切换图片
        this.timer = setInterval(() => {
          this.ImgIndex === 3 ? this.ImgIndex = 1 : ++this.ImgIndex
        }, 333)
        // 播放计时
        this.playTimer = setInterval(() => {
          if (++this.playTime >= this.TimeLen) {
            // 播放时间到了
            clearInterval(this.timer)
            clearInterval(this.playTimer)
            this.ImgIndex = 3
            this.playTime = 0
            audio.pause() // 暂停
            audio.currentTime = 0// 将进度条归零

            // 删除本地消息
            // 语音阅后即焚需要让音频全部播放完成才会删除
            if (this.message.isReadDel && parseInt(this.message.fromUserId) !== this.MeId) {
              // 不是自己发送的才会删除
              const params = [
                this.params.jid, // jid
                this.message.messageId, // 消息ID
                'del' // 设置类型为：删除
              ]
              this.$storage.burningAfterDelete.setRead(...params)
            }
          }
        }, 1000)
      } else {
        // 当前状态播放中
        clearInterval(this.timer)
        clearInterval(this.playTimer)
        this.ImgIndex = 3
        this.playTime = 0
        audio.pause() // 暂停
        audio.currentTime = 0// 将进度条归零
      }
    },
    // [Ended] 初始化语音
    handleAudioEnded () {
      this.ImgIndex = 3
      clearInterval(this.timer)
    }
  },
}
</script>