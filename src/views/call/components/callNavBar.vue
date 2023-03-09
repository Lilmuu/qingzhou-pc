<template>
  <el-menu :class="['navbar', showBg ? 'navbar-bg' : 'navbar-bg-none']"
           mode="horizontal"
           style="border: none">
    <div ref="app_top_bar" class="top_menu_action_bar_common app_top_bar" style="text-align: center;">
      <span v-if="isStart" class="callTimer"> {{ currentTimer }}</span>
    </div>
    <div class="menu_top_action_container">
<!--        <span :class="['menu_top_icon_container', isTop ? 'menu_top_icon_container_active' : '']" :title="top_title" @click="onTopping" style="color: #fff;">-->
<!--          <svg-icon icon-class="ding" style="width: 1.6em; height: 1.6em; margin-top: 5px;"></svg-icon>-->
<!--          &lt;!&ndash; <i class="el-icon-minus menu_top_icon"></i>&ndash;&gt;-->
<!--       </span>-->
      <span class="menu_top_icon_container" title="最小化" @click="onMinimize">
          <i class="el-icon-minus menu_top_icon"></i>
       </span>
      <span class="menu_top_icon_container window-close" title="关闭" @click="beforeOnClose">
          <i class="el-icon-close menu_top_icon"></i>
       </span>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      class="close-window"
      width="480px"
      top="30vh"
      :show-close="false"
      :before-close="handleClose">
      <div class="content-box">
        <div class="content-title">
          <img src="@/assets/img/call/warning.png" alt="" />
          <span>确定要关闭当前通话窗口吗？</span>
        </div>
        <div class="content-text">关闭窗口，将终止通话，是否关闭？</div>
        <div class="footer">
          <el-button size="small" style="margin-right: 10px" @click="handleClose">取 消</el-button>
          <el-button size="small" type="primary" @click="onClose">确 定</el-button>
        </div>
      </div>
    </el-dialog>
  </el-menu>
</template>

<script>
  export default {
    props: {
      showBg: {
        type: Boolean,
        default: true
      },
      isStart: {
        type: Boolean,
        default: true
      },
      currentTimer: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        dialogVisible: false,
        exitDialog: false,
        editPwdDialog: false,
        isMaxWindow: true,
        max_title: '最大化',
        top_title: '置顶',
        isTop: false,
        max_icon: 'el-icon-full-screen menu_top_icon'
      }
    },
    components: {
      // Breadcrumb,
      // Hamburger
    },
    mounted() {
      // 监听窗口变化
      this.$electron.ipcRenderer.on('restoreMaximize-call', (event, data) => {
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

      this.$electron.ipcRenderer.on('call-alwaysOnTop', (event, data) => {
        switch (data) {
          case 'yes':
            this.top_title = "取消置顶";
            this.isTop = true
            break;
          case 'no':
            this.top_title = "置顶";
            this.isTop = false
            break;
        }
      })
    },
    methods: {
      // 置顶功能
      onTopping() {
        this.$electron.ipcRenderer.send('call-window-top')
      },
      // 最小化
      onMinimize() {
        this.$electron.ipcRenderer.send('call-window-min')
      },
      // 最大化
      onMaximize() {
        this.$electron.ipcRenderer.send('call-window-max')
      },
      beforeOnClose() {
        this.dialogVisible = true
      },
      // 关闭
      onClose() {
        this.$emit('onClose')
      },
      handleClose() {
        this.dialogVisible = false
      },
    }
  }
</script>

<style lang="scss" scoped>
  ::v-deep.close-window{
    .el-dialog__header{
      padding: 10px;
    }
    .content-box{
      position: relative;
      height: 140px;
      .content-title{
        display: flex;
        align-items: center;
        font-size: 20px;
        img {
          width: 23px;
          height: 23px;
          margin-right: 17px;
        }
      }
      .content-text{
        margin-top: 20px;
        font-size: 16px;
        color: #BFBFBF;
        margin-left: 40px;
      }
      .footer{
        position: absolute;
        bottom: 0;
        right: 10px;
      }
    }
  }
  .navbar {
    height: 30px;
    border-radius: 0px !important;
    .hamburger-container {
      line-height: 58px;
      height: 50px;
      float: left;
      padding: 0 10px;
    }
    .screenfull {
      position: absolute;
      right: 90px;
      top: 16px;
      color: red;
    }
    .menu_top_action_container {
      position: absolute;
      right: 0;
      top: 0;
      color: #fff;
      display: flex;
      align-items: center;
      .menu_top_icon_container {
        line-height: 30px;
        height: 100%;
        width: 40px;
        display: block;
        text-align: center;
        &:hover {
          background-color: rgba(74, 74, 74, 0.1);
        }
        .menu_top_icon {
          color: #fff;
          font-size: 16px;
        }
      }
      .menu_top_icon_container_active {
        background-color: rgba(74, 74, 74, 0.1);
      }
    }
    .window-close {
      &:hover {
        background-color: rgba(232,17,35,.9) !important;
        .menu_top_icon {
          color: #ffffff!important;
        }
      }
    }
    .el-input__prefix {
      left: 5px;
      transition: all .3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .navbar-bg {
    background: linear-gradient(180deg, #384970 0%, #333F52 100%);
  }
  .navbar-bg-none {
    background: none!important;
  }
</style>

