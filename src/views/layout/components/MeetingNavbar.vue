<template>
  <el-menu :class="['navbar', showBg ? 'navbar-bg' : 'navbar-bg-none']" mode="horizontal" style="border: none">
    <div ref="app_top_bar" class="top_menu_action_bar_common app_top_bar"></div>
    <div class="menu_top_action_container">
       <span class="menu_top_icon_container" title="最小化" @click="onMinimize">
          <i class="el-icon-minus menu_top_icon"></i>
       </span>
      <span class="menu_top_icon_container" :title="max_title" @click="onMaximize">
          <i :class="[max_icon]" style="font-size: 14px;"></i>
       </span>
      <span class="menu_top_icon_container window-close" title="关闭" @click="onClose">
          <i class="el-icon-close menu_top_icon"></i>
       </span>
    </div>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    showBg: {
      type: Boolean,
      default: true
    }
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
  components: {
    // Breadcrumb,
    // Hamburger
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
    this.$electron.ipcRenderer.on('alwaysOnTop', (event, data) => {})
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$emit('logout')
    },
    // 置顶功能
    onTopping() {
      this.$electron.ipcRenderer.send('meeting-window-top')
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
        color: #6f6f6f;
        font-size: 16px;
      }
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

