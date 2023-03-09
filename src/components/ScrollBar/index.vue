<!--
 * @Author: your name
 * @Date: 2022-03-17 09:25:48
 * @LastEditTime: 2022-03-17 11:48:57
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\ScrollBar\index.vue
-->
<template>
  <div class="scroll-container" ref="scrollContainer" @wheel.prevent="handleScroll" >
<!--    <div class="scroll-wrapper" ref="scrollWrapper" :style="{top: top + 'px'}">-->
      <div class="scroll-wrapper" ref="scrollWrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
const delta = 15

export default {
  name: 'scrollBar',
  data() {
    return {
      top: 0
    }
  },
  methods: {
    handleScroll(e) {
      const eventDelta = e.wheelDelta || -e.deltaY * 3
      const $container = this.$refs.scrollContainer
      const $containerHeight = $container.offsetHeight
      const $wrapper = this.$refs.scrollWrapper
      const $wrapperHeight = $wrapper.offsetHeight
      if (eventDelta > 0) {
        this.top = Math.min(0, this.top + eventDelta)
      } else {
        if ($containerHeight - delta < $wrapperHeight) {
          if (this.top < -($wrapperHeight - $containerHeight + delta)) {
            this.top = this.top
          } else {
            this.top = Math.max(this.top + eventDelta, $containerHeight - $wrapperHeight - delta)
          }
        } else {
          this.top = 0
        }
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../../styles/variables.scss';

.scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  // background-color: $menuBg;
  background-color: linear-gradient(180deg, #384970 0%, #333F52 100%);
  .scroll-wrapper {
    position: absolute;
    width: 100%!important;
  }
}
</style>
