// 位置消息mixin
import { mapState } from 'vuex'
// import CommonMixin from '../mixins/common' // 公共mixin
// import ReadMixin from '../mixins/read' // 已读mixin
// import MenuMixin from '../mixins/menu' // 长按菜单mixin

export default {
  // mixins: [CommonMixin],
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
      RoomInfo: state => state.Im.Room.RoomInfo
    }),
    RouterData () {
      const file = JSON.stringify(this.message)
      return encodeURI(file)
    },
    // 文件类型图片Url
    FileTypeImageUrl () {
      let url = ''
      const type = parseInt(this.message.fileTime) || parseInt(this.message.timeLen)
      if (type === 2) url = this.$imgUrl.common.files.mp3
      else if (type === 3) url = this.$imgUrl.common.files.video
      else if (type === 4) url = this.$imgUrl.common.files.ppt
      else if (type === 5) url = this.$imgUrl.common.files.xls
      else if (type === 6) url = this.$imgUrl.common.files.doc
      else if (type === 7) url = this.$imgUrl.common.files.zip
      else if (type === 8) url = this.$imgUrl.common.files.txt
      else if (type === 10) url = this.$imgUrl.common.files.pdf
      else if (type === 11) url = this.$imgUrl.common.files.app
      else url = this.$imgUrl.common.files.what
      return url
    }
  },
  methods: {
    // [Click] 跳转文件详情页
    handleGoToFilePage  (e) {
      // 若阻止冒泡，则不执行事件代码
      if (this.isStopPropagation) {
        // 重置阻止冒泡变量
        this.isStopPropagation = !this.isStopPropagation
        // 阻止往上冒泡
        e.stopPropagation()
        return
      }
      console.log('this.RouterData', this.RouterData)

      // this.$router.push({ name: 'chat-file-detail', params: { data: this.RouterData, fileType: 'single-chat' } })
    }
  }
}
