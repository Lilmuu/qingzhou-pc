<!-- 时间线显示 -->
<template>
  <div class="system dateLine">
    <div class="box force-newline">{{ Number(message.timeSend) | renderMessageDateLine }}</div>
  </div>
</template>

<script>
  export default {
    props: {
      message: {
        type: Object, default: () => {
          return {}
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .system {
    padding: 20px 0;
    .box {
      margin: 0 auto;
      padding: 5px 20px;
      width: max-content;
      max-width: 520px;
      // background-color: #ffffffb3;
      font-family: SourceHanSansCN-Regular;
      border-radius: 6px;
      font-size: 14px;
      color: #8F959E;
    }
  }
</style>
