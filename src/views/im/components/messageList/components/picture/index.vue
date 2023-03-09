<!--图片消息-->
<template>
  <div :class="isShowLeftModule ? 'left common' : 'common'">
    <div class="avatar">
      <!-- <Avatar :username="message.fromUserName"></Avatar> -->
      <headAvatar 
        :size="32" 
        :fontSize='12'
        :avatarUrl="userAvatar" 
        :username="message.fromUserName">
      </headAvatar>
    </div>
    <div class="content">
      <!-- 群昵称 -->
      <div class="nickname" v-show="params.type === 'room' && isShowLeftModule">{{message.fromUserName}}</div>
      <!-- 消息气泡 -->
      <div class="bubble">
        <!-- 消息体 -->
        <div class="value message-body no_message_text" ref="longTouch">
          <!-- 消息内容 -->
          <div class="pictore index" @click="checkImage(message)">
            <MyImg :src="Abbreviated" :message="message" :allImgUrlList="allImgUrlList" :style="ImgBoxStyle"></MyImg>
          </div>
        </div>
        <!-- 单聊是否已读 -->
        <template v-if="params.type === 'friend' && !isShowLeftModule">
          <div class="readTip have-read" v-if="message.isRead">已读</div>
          <div class="readTip unread" v-else>未读</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import MyImg from "./myImg"
import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar";
import MenuMixin from "@/views/im/components/messageList/components/mixins/menu";
import { handleDownLoadFile } from "@/utils/download";
import { getfilename } from "@/api/im";
import { mapGetters,mapState } from 'vuex'

export default {
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
    messageAll:{
      type: Array, 
      default: () => {
        return []
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
    MyImg,
    headAvatar
  },
  data () {
    return {
      ImgBoxStyle: {}, // 图片容器style样式
      msgList: [],
    }
  },
  created () {
    // 初始化静态数据
    const IMG_MAX_WIDTH = 180 // 图片的最大宽
    const IMG_MAX_HEIGHT = 180 // 图片的最大高

    // 图片宽高
    const imgW = this.message.location_x
    const imgH = this.message.location_y

    // 初始化图片容器大小
    this.ImgBoxStyle = {
      // width: this.handleGetImgBoxWH(imgW, imgH, IMG_MAX_WIDTH, IMG_MAX_HEIGHT),
      width: '120px',
      // height: this.handleGetImgBoxWH(imgH, imgW, IMG_MAX_HEIGHT, IMG_MAX_WIDTH)
    }
  },
  computed: {
    ...mapState({
      unreadList: state => state.user.unreadList,
      'NewMessageNumberList': state => state.Im.Information.NewMessageNumberList
    }),
    ...mapGetters({
      'NewMessageList': 'Im/Information/NewMessageList',
    }),
    // 图片缩略图Url
    Abbreviated () {
      // 将Url中的o替换成t（o => 原图, t => 缩略图）
      return this.message.content.replace('/o/', '/t/')
    },
    allImgUrlList(){
      let arr = this.messageAll.filter(item=>item.type === 2).map(item=>item.content)
      return arr
    }
  },
  methods: {
    /**
     * 处理获取图片容器宽高
     * @param aimsNum 目标值
     * @param aidNum 辅助值
     * @param aimsMax 目标最大值
     * @param aidMax 辅助最大值
     */
    handleGetImgBoxWH (aimsNum, aidNum, aimsMax, aidMax) {
      let result = 0 // 返回值
      if (aimsNum < aimsMax && aidNum < aidMax) {
        // 宽高如果都小于最大值，则直接使用图片宽高
        aimsNum === 0 ? result = aimsMax : result = aimsNum
      } else {
        // 如果图片大于设定最大值，则需要通过图片的宽比计算宽
        if (aimsNum <= aidNum) {
          // 计算高度最大值与图片的高度比
          const scale = aidMax / aidNum // 高度比
          result = Math.round(aimsNum * scale) // 计算宽度
        } else {
          result = aimsMax
        }
      }
      this.$emit('loadSuccess')
      return `${result}px`
    },
    // 下载图片
    checkImage(val){
      console.log('预览图片',val)
      let btnList = document.querySelector('.el-image-viewer__actions__inner')
      console.log(btnList,'btnList-btnList')
      let newPage = document.createElement("i")
      newPage.setAttribute("class",'el-icon-download');
      btnList.appendChild(newPage)
      newPage.addEventListener("click",()=>{
        console.log("下载图片")
        handleDownLoadFile(val.content)
      })
    },
    getUnreadList(){
      this.msgList = [ ...this.NewMessageList, ...this.unreadList ]
    },
  },

  watch:{
    NewMessageList:{
      handler(){
        this.getUnreadList()
        console.log('更新... 单聊',this.msgList)
      }
    },
    unreadList:{
      handler(){
        this.getUnreadList()
        console.log('更新... 任务',this.msgList)
      }
    }
  },
  mounted(){
    console.log('任务... 任务',this.unreadList)
  }
}
</script>

<style lang="scss" scoped>

</style>
