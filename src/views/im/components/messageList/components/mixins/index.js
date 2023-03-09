// 消息模块mixin
import { mapState } from 'vuex'

export default {
  props: {
    // 消息对象
    message: {
      type: Object, default: () => {
        return {}
      }
    }
  },
  computed: {
    ...mapState({
      MeId: state => state.Common.User.MeId // 我的Id
    }),
    // 是否显示左模块
    IsShowLeftModule () {
      return parseInt(this.message.fromUserId) !== this.MeId && this.message.type < 100
    }
  }
}
