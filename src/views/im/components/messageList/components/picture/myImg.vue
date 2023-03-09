<!--
 * @Author: your name
 * @Date: 2021-09-28 11:08:46
 * @LastEditTime: 2022-02-17 16:52:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\picture\myImg.vue
-->
<template>
  <el-image class="flex-center"
    fit="contain"
    lazy-load
    :src="src"
    :preview-src-list="[message.content]">
    <!-- allImgUrlList -->
    <!-- [message.content] -->

    <div slot="error" class="image-slot">
      <i class="el-icon-picture-outline imgLoadErrorIcon"></i>
    </div>
  </el-image>
</template>

<script>

export default {
  name: "myImg",
  props: {
    message: {
      type: Object,
      required: true
    },
    src: {
      type: String,
      required: true
    },
    allImgUrlList:{
      type: Array, 
      default: () => {
        return []
      }
    }
  },

}
</script>

<style >
.el-image-viewer__canvas{
  width: calc(100% - 70px);
  margin-left: auto;
}
</style>
