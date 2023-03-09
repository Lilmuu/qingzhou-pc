// 长按菜单mixin
export default {
  mounted () {
    this.$nextTick(() => {
      // 等待dom渲染完成挂在事件
      if (this.$refs['longTouch']) {
        this.$refs['longTouch'].addEventListener('contextmenu', this.handleContextmenu)
      }
    })
  },
  methods: {
    // 右键点击
    handleContextmenu(e) {
      this.touchX = e.clientX // 按压位置X
      this.touchY = e.clientY // 按压位置Y
      const winW = document.body.clientWidth // 屏幕宽
      const winH = document.body.clientWidth // 屏幕高
      let translateX = this.touchX > winW / 2 ? '-100%' : 0 // X偏移
      let translateY = this.touchY > winH / 2 ? '-100%' : 0 // Y偏移

      // 定位样式
      const style = {
        top: `${this.touchY}px`,
        left: `${this.touchX}px`,
        transform: `translate(${translateX}, ${translateY})`
      }

      // 触发显示菜单事件
      this.$emit('onShowMenu', this.message, style, e)
    }
  }
}
