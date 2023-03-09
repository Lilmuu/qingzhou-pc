<!--
 * @Author: your name
 * @Date: 2021-09-28 11:08:46
 * @LastEditTime: 2021-11-24 16:53:09
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\group-control\index.vue
-->
<!-- 群消息 -->
<template>
  <div class="group-control">
    <div class="box force-newline">{{message.content}}</div>
  </div>
</template>

<script>
  export default {
    props: {
      message: {
        type: Object,
        default: () => {
          return {}
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .group-control {
    .box {
      margin: 0 auto;
      padding: 5px 20px;
      width: max-content;
      max-width: 520px;
      // background-color: #ffffffb3;
      border-radius: 6px;
      font-size: 14px;
      color: #8F959E;
    }
  }
</style>
