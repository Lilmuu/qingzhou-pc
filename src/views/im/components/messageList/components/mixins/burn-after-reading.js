// 阅后即焚模块mixin
import { mapState, mapMutations } from 'vuex'
import { sendReadMessageReceipt } from '@/xmpp/send-message'

export default {
  data () {
    return {
      IsReadDel: false, // 该消息是否为阅后即焚消息并未查看
      IsDelCountdown: false, // 是否正在查看阅后即焚消息
      DelCountdownTime: 10, // 阅后即焚倒计时
      IsSendReceipt: false // 是否已发送回执
    }
  },
  computed: {
    ...mapState({
      MeId: state => state.Common.User.MeId // 我的Id
    })
  },
  created () {
    // 由于在destroyed钩子无法访问$toure对象，需要在初始化时拷贝一份
    this.route = this.$route

    // 判断该阅后即焚消息是否已查看，如果已查看则直接显示倒计时
    if (this.message.delCountdownTime > 0 && this.message.meIsRead) {
      console.log('created burn-after-reading')
      // 赋值消息的查看倒计时
      this.DelCountdownTime = this.message.delCountdownTime
      // 开启阅读倒计时
      this.handleCountdownDelMessage(this.message)
    } else {
      // 该阅后即焚消息没有被查看
      this.IsReadDel = this.message.isReadDel
    }
  },
  destroyed () {
    // 如果倒计时没有结束，则需要保存倒计时的时间以便下次继续阅读
    if (this.DelCountdownTime > 0 && (this.meIsRead || this.message.meIsRead)) {
      console.log('destroyed burn-after-reading')
      // 存储倒计时
      const params = [
        this.route.params.jid, // jid
        this.message.messageId, // 消息ID
        'set', // 设置类型为：设置
        { delCountdownTime: this.DelCountdownTime } // 参数
      ]
      this.$storage.burningAfterDelete.setRead(...params)
      // 清除定时器
      clearInterval(this.timer)
    }
  },
  methods: {
    ...mapMutations({
      SET_BURNING_AFTER_DELETE: 'Im/Chat/SET_BURNING_AFTER_DELETE' // 设置阅后即焚
    }),
    // 倒计时删除消息
    handleCountdownDelMessage () {
      console.log('destroyed burn-after-reading')
      this.IsDelCountdown = true // 该阅后即焚消息已被查看
      // 倒计时
      this.timer = setInterval(() => {
        if (--this.DelCountdownTime <= 0) {
          // 删除本地消息
          const params = [
            this.route.params.jid, // jid
            this.message.messageId, // 消息ID
            'del' // 设置类型为：删除
          ]
          this.$storage.burningAfterDelete.setRead(...params)
          // 清除定时器
          clearInterval(this.timer)
        }
      }, 1000)
    },
    // 发送阅后即焚消息回执
    handleSendMessageReceipt () {
      console.log('destroyed burn-after-reading')
      if (!this.IsSendReceipt) {
        this.IsSendReceipt = !this.IsSendReceipt
        if (parseInt(this.message.fromUserId) !== this.MeId && !this.message.isRead) {
          sendReadMessageReceipt(this.message.fromUserId, this.message, this.route.params.type === 'friend' ? 1 : 2)
        }
      }
    },
    // [Click] 查看信息阅后即焚消息
    handleLookMessage () {
      console.log('destroyed burn-after-reading')

      this.IsReadDel = false // 消息已被查看
      this.meIsRead = true // 我已经读了

      // 更新数据
      const params = [
        this.route.params.jid, // jid
        this.message.messageId, // 消息ID
        'set', // 设置类型为：设置
        { meIsRead: true } // 参数
      ]
      this.$storage.burningAfterDelete.setRead(...params)

      // 发送已读回执
      this.handleSendMessageReceipt()

      // 开启阅读倒计时
      this.handleCountdownDelMessage(this.message)
    }
  }
}
