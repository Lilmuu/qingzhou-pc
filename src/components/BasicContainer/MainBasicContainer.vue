<template>
  <div class="main-basic-container">
    <Card :useBorder="useBorder">
      <slot></slot>
    </Card>
  </div>
</template>

<script>
import Card from "@/components/Card/Card"
export default {
  name: "BasicContainer",
  props: {
    block: {
      type: Boolean,
      default: false
    },
    useBorder: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Card
  },
  data() {
    return {
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    }
  }
}
</script>

<style lang="scss">
.main-basic-container {
  margin-bottom: 8px;
  // margin-left: 10px;
  // padding-right: 10px;
  box-sizing: border-box;
  height: calc(100vh - 50px);
  width: 100%;
  overflow-y: scroll;
  margin-top: 0;
  background: #FBFBFC;
  .el-card {
    width: 100%;
  }
  &:first-child {
    padding-top: 0;
  }
  &--block {
    height: 100%;
    .el-card {
      height: 100%;
    }
  }
}
.hideSideBar-container {
  width: calc(100vw - 260px)!important;
}
</style>
