<template>
  <div class="meetingRoorNavBar">
    <div class="left">
      <el-popover placement="bottom"
                  width="360"
                  :offset="100"
                  trigger="click">
        <div class="popoverInfo">
          <div>会议标题：{{ navBarInfo.subject }}</div>
          <div>会议ID：{{ navBarInfo.roomId }}</div>
          <!-- <div class="">会议链接：{{ navBarInfo.shareMeetingLink }}</div> -->
          <div class="">请在轻舟系统会议功能填写以上会议ID加入会议。</div>
          <div class="flex-center cursor copy-btn" @click="handleCopyInfo">复制会议室信息</div>
        </div>
        <div class="navBarTitle cursor" slot="reference">{{navBarInfo.subject}}<i class="arrow-icon el-icon-arrow-down"></i></div>
      </el-popover>
    </div>
    <div class="center"></div>
    <div class="right">
      <img @click="handleShowUser" src="@/assets/img/meeting/meetingRoom_user_active.png" alt="" v-if="showUserListDrawer">
      <img @click="handleShowUser" src="@/assets/img/meeting/meetingRoom_user.png" alt="" v-else>
      <div class="line"></div>
      <img @click="checkMenu(0)" src="@/assets/img/meeting/meetingRoom_menu_active.png" alt="" v-if="videoLayout === 1">
      <img @click="checkMenu(1)" src="@/assets/img/meeting/meetingRoom_menu.png" alt="" v-else>
      <div class="line"></div>
      <span class="flex-center" title="最小化" @click="onMinimize">
          <i class="el-icon-minus menu_top_icon"></i>
      </span>
      <span class="flex-center" :title="max_title" @click="onMaximize">
          <i :class="[max_icon]" ></i>
      </span>
      <span class="flex-center" title="关闭" @click="onClose">
          <i class="el-icon-close menu_top_icon"></i>
      </span>
    </div>
  </div>
</template>

<script>
const myRealName = localStorage.getItem('USERNAME')
export default {
  props: {
    showBg: {
      type: Boolean,
      default: true
    },
    navBarInfo:{
      type:Object,
      default:()=>{}
    },
    showUserListDrawer:{
      type:Boolean,
      default:false
    },
    videoLayout:{
      type:Number,
      default:0
    }
  },
  computed:{
  },
  data() {
    return {
      exitDialog: false,
      editPwdDialog: false,
      isMaxWindow: true,
      max_title: '最大化',
      max_icon: 'el-icon-full-screen menu_top_icon'
    }
  },
  mounted() {
    // 监听窗口变化
    this.$electron.ipcRenderer.on('restoreMaximize-meeting', (event, data) => {
      switch (data) {
        case 'restore':
          this.max_title = "最大化"
          this.max_icon = 'el-icon-full-screen menu_top_icon'
          break
        case 'maximize':
          this.max_title = "向下还原"
          this.max_icon = 'el-icon-copy-document menu_top_icon'
          break
      }
    })
  },
  methods: {
    handleCopyInfo() {
      const shareText = `${myRealName}邀请您加入视频会议\n会议标题：${this.navBarInfo.subject }\n会议ID：${this.navBarInfo.roomId}`
      this.$copyText(shareText).then((e) => {
        this.$message.success('已复制会议信息')
      }, (e) => {
        this.$message.error('复制失败')
        console.log(e)
      })
    },
    handleShowUser() {
      this.$emit('handleShowUser')
    },
    checkMenu(val){
      this.$emit('checkMenu',val)
    },
    // 最小化
    onMinimize() {
      this.$electron.ipcRenderer.send('meeting-window-min')
    },
    // 最大化
    onMaximize() {
      this.$electron.ipcRenderer.send('meeting-window-max')
    },
    // 关闭
    onClose() {
      this.$emit('onClose')
    }
  }
}
</script>

<style lang="scss" scoped>
.meetingRoorNavBar{
  height: 60px;
  display: flex;
  background: #fff;
  padding: 0 20px 0 30px;
  user-select: none;
  .right{
    display: flex;
    align-items: center;
    img{
      width: 14px;
      height: 14px;
      margin-right: 20px;
      cursor: pointer;
    }
    .line{
      width: 1px;
      height: 14px;
      background: #DCDFE6;
      margin-right: 20px;
    }
    >span{
      font-size: 14px;
      color: #6f6f6f;
      margin-right: 20px;
      cursor: pointer;
    }
    >span:nth-of-type(3){
      margin-right: 0;
    }
  }
  .center{
    flex: 1;
    height: 100%;
    -webkit-app-region: drag;
  }
  .flex-center{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .cursor{
    cursor: pointer;
  }
}
.navBarTitle{
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #1F2329;
  height: 60px;
  i{
    margin-left: 10px;
  }
}
.popoverInfo{
  padding: 18px 0;
  background: #fff;
  font-size: 16px;
  color: #1F2329;
  >div{
    padding: 0 18px;
    margin-bottom: 24px;
  }
  >div:nth-of-type(2), >div:nth-of-type(3){
    font-size: 14px;
    color: #646A73;
    >span{
      color: #404758;
    }
  }
  >div:nth-of-type(3){
    margin-bottom: 30px;
    padding-bottom: 30px;
    border-bottom: 1px solid #DEE0E3;
  }
  >div:nth-of-type(4){
    margin: 0 auto;
    width: 180px;
    height: 32px;
    font-size: 14px;
    color: #404758;
    border: 1px solid #D0D3D6;
    border-radius: 6px;
  }
  .copy-btn:hover{
    background: rgba(222, 224, 227, 0.2);
    border: 1px solid rgba(222, 224, 227, 0.7);
  }
  .copy-btn:focus{
    background: rgba(222, 224, 227, 0.2);
    border: 1px solid #DEE0E3;
  }
}
</style>

<style>
  .el-popover{
    left:30px!important;
    top:48px!important;
  }
</style>