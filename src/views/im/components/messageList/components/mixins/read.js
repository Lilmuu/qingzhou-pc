// 已读模块mixin
export default {
  methods: {
    // [Click] 跳转查看已读人数列表
    handleGoToReadList () {
      this.$router.push({ name: 'read-number-list', params: { messageId: this.message.messageId } })
    }
  }
}
