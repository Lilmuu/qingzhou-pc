<!--
 * @Author: your name
 * @Date: 2022-04-06 10:36:38
 * @LastEditTime: 2022-06-15 09:27:36
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\headAvatar\index.vue
-->
<template>
  <div>
    <el-badge v-if="redHotval > 0" :value="redHotval" :max="99" class="item">
      <img  v-if="avatarUrl != ''"  :src="avatarUrl" class="user_head_avatar"  alt="头像"
        :style="`width: ${size}px;
          height: ${size}px;
          border: ${borderWidth}px solid #FFF;
          box-sizing: content-box;
          margin: ${margin};`"
        >
      <div v-else class="user_head_avatar" 
        :style="`width: ${size}px;
          height: ${size}px;
          line-height: ${size-(2*borderWidth)}px;
          font-size: ${fontSize}px;
          background: ${background};
          color: ${color};
          margin: 0 auto;
          border: ${borderWidth}px solid #FFF;
          `">
          {{ userNameTwo }}
      </div>
    </el-badge>
    
    <img v-if="avatarUrl.replace(' ','') && redHotval == 0" 
      :src="avatarUrl" 
      class="user_head_avatar"  
      alt="头像"
      :style="`width: ${size}px;
        height: ${size}px;
        border: ${borderWidth}px solid #FFF;
        box-sizing: content-box;
        margin: ${margin};`"
      >
    <div  v-if="!(avatarUrl.replace(' ','')) && redHotval == 0" 
      class="user_head_avatar" 
      :style="`width: ${size}px;
        height: ${size}px;
        line-height: ${size-(2*borderWidth)}px;
        font-size: ${fontSize}px;
        background: ${background};
        color: ${color};
        margin: 0 auto;
        border: ${borderWidth}px solid #FFF;
        `">
        {{ userNameTwo }}
    </div>
  </div>
</template>

<script>
export default {
  props:{
    avatarUrl:{
      type: String,
      default: ()=>{
        return ''
      }
    },
    username: {
      type: String,
      default: '姓名'
    },
    size: {
      type: Number,
      default: 50
    },
    fontSize: {
      type: Number,
      default: 14
    },
    color: {
      type: String,
      default: '#FFF'
    },
    background: {
      type: String,
      default: '#5C8DFF'
    },
    borderWidth:{
      type: Number,
      default: 0
    },
    redHotval: {
      type: Number,
      default: 0
    },
    margin: {
      type: String,
      default: '0 auto'
    }
  },
  computed:{
    userNameTwo(){

      return this.username.slice(-2)
    }
  },
}
</script>

<style lang="scss" scoped>
.user_head_avatar{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  text-align: center;
}
</style>