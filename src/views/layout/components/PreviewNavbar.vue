<template>
  <el-menu :class="['navbar', showBg ? 'navbar-bg' : 'navbar-bg-none']"
           mode="horizontal"
           style="border: none">
    <div ref="app_top_bar" class="top_menu_action_bar_common app_top_bar previewNavBarTitle">
      <span style="margin-left: 30px;">{{previewTitle}}</span>
    </div>
    <div class="menu_top_action_container" style="height:40px">
       <span class="menu_top_icon_container previewNavIcon" title="最小化" @click="onMinimize">
          <i class="el-icon-minus menu_top_icon"></i>
       </span>
      <span class="menu_top_icon_container previewNavIcon" :title="max_title" @click="onMaximize">
          <i :class="[max_icon]" style="font-size: 14px;"></i>
       </span>
      <span class="menu_top_icon_container window-close previewNavIcon" title="关闭" @click="onClose">
          <i class="el-icon-close menu_top_icon"></i>
       </span>
    </div>
  </el-menu>
</template>

<script>

export default {
  props: {
    showBg: {
      type: Boolean,
      default: true
    },
    navBarTitle:{
      type: String,
      default:''
    }
  },
  computed:{
    previewTitle(){
      let title = this.navBarTitle
      if(title.indexOf('docx') == -1){
        return title
      }else{
        return title.replace('docx','word')
      }
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
  mounted() {
    // 监听窗口变化
    this.$electron.ipcRenderer.on('restoreMaximize-preview', (event, data) => {
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
    // 最小化
    onMinimize() {
      this.$electron.ipcRenderer.send('preview-window-min')
    },
    // 最大化
    onMaximize() {
      this.$electron.ipcRenderer.send('preview-window-max')
    },
    // 关闭
    onClose() {
      this.$electron.ipcRenderer.send('preview-window-close')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 40px;
  border-radius: 0px !important;
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
}
.navbar-bg {
  background: #F3F3F3;
}
.navbar-bg-none {
  background: none!important;
}
.previewNavBarTitle{
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.previewNavIcon{
    display: flex!important;
    align-items: center!important;
    justify-content: center!important;
}
</style>

