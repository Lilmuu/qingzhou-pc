<!--
 * @Author: 罗兴
 * @LastEditors: Please set LastEditors
 * @Date: 2021-08-16 11:42:34
 * @LastEditTime: 2022-03-01 15:12:16
 * @FilePath: \task-pc-ui\src\components\Avatar\Avatar.vue
 * @Description: file content
-->
<template>
  <div>
    <el-badge v-if="redHotval > 0" :value="redHotval" :max="99" class="item">
      <div class="avatar-wrapper flex-center" :style="`width: ${size}px;
        height: ${size}px;
        border-radius: ${size}px;
        font-size: ${fontSize}px;
        background: ${background};
        color: ${color};
        border: 2px solid ${color};
        margin: 0 auto;
        `">
        {{ username | formatUserName }}
      </div>
    </el-badge>

    <div v-else class="avatar-wrapper flex-center" :style="`width: ${size}px;
      height: ${size}px;
      border-radius: ${size}px;
      font-size: ${fontSize}px;
      background: ${background};
      color: ${color};
      margin: 0 auto;
      border: 2px solid ${color};
      `">
      {{ username | formatUserName }}
    </div>
  </div>
  
</template>

<script>
export default {
  name: "Avatar",
  props: {
    username: {
      type: String,
      required: true,
      default: ''
    },
    size: {
      type: Number,
      default: 35
    },
    fontSize: {
      type: Number,
      default: 12
    },
    color: {
      type: String,
      default: '#3471FF'
    },
    background: {
      type: String,
      default: 'none'
    },
    redHotval: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.avatar-wrapper {
  cursor: pointer;
  position: relative;
  /* background: rgb(52, 113, 255); */
  background: #EBECEE;
  /* color:#868BA1 !important; */
  width: 50px;
  height: 50px;
  font-size: 24px;
  border-radius: 25px;
  overflow: hidden;
}
</style>
