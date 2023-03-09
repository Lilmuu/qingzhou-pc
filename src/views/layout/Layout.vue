<!--
 * @Author: your name
 * @Date: 2022-03-17 09:25:48
 * @LastEditTime: 2022-03-17 13:06:06
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\layout\Layout.vue
-->
<template>
  <div class="app-wrapper hideSidebar">
    <sidebar ref="sidebar" class="sidebar-container"></sidebar>
    <div class="main-container">
      <navbar @logout="handleShowLogOutDialog"></navbar>
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  mixins: [ResizeMixin],
  methods: {
    handleShowLogOutDialog() {
      this.$refs.sidebar.handleShowLogOutDialog()
    },
    closeImgFun() {
      this.show = false
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../../styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    background: linear-gradient(180deg, #384970 0%, #333F52 100%);
  }
</style>
