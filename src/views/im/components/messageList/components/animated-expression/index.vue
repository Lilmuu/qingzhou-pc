<!--
 * @Author: your name
 * @Date: 2022-04-19 09:46:26
 * @LastEditTime: 2022-04-19 15:39:47
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\animated-expression\index.vue
-->
<!--动画表情消息-->
<template>
  <div class="animated-expression index">
    <div :class="isShowLeftModule ? 'left common' : 'common'">
      <!-- 头像 -->
      <div class="avatar">
        <headAvatar 
          :size="32" 
          :fontSize='12'
          :avatarUrl="userAvatar" 
          :username="message.fromUserName">
        </headAvatar>
      </div>

      <!-- 内容 -->
      <div class="content">
        <!-- 群聊消息昵称 -->
        <div class="nickname" v-if="isShowLeftModule">{{message.fromUserName}}</div>
        <!-- 消息气泡 -->
        <div class="bubble no-background">
          <!-- 消息体（动画表情） -->
          <div class="img-box" ref="longTouch" :style="ImgBoxStyle">
            <el-image fit="contain"
              lazy-load
              :src="`${require('@/assets/images/chat/send-message/gif/' + this.message.content)}`">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {handleGetImgBoxWH} from "@/utils"
// import Avatar from "@/components/Avatar/Avatar"
import headAvatar from "@/components/headAvatar"

export default {
  name: 'AnimatedExpression',
  props: {
    // 消息对象
    message: {
      type: Object, default: () => {
        return {}
      }
    },
    params: {
      type: Object, default: () => {
        return {}
      }
    },
    isShowLeftModule: {
      type: Boolean,
      default: false
    },
    userAvatar:{
      type: String,
      default: ''
    }
  },
  created () {
    // 初始化静态数据
    const IMG_MAX_WIDTH = 150 // 图片的最大宽
    const IMG_MAX_HEIGHT = 150 // 图片的最大高

    // 加载图片
    const img = new Image()
    img.src = require('@/assets/images/chat/send-message/gif/' + this.message.content)
    img.onload = () => {
      // 初始化图片容器大小
      this.ImgBoxStyle = {
        width: handleGetImgBoxWH(img.width, img.height, IMG_MAX_WIDTH, IMG_MAX_HEIGHT),
        height: handleGetImgBoxWH(img.height, img.width, IMG_MAX_HEIGHT, IMG_MAX_WIDTH)
      }
      this.$emit('loadSuccess')
    }
  },
  components: {
    headAvatar
  },
  data() {
    return {
      ImgBoxStyle: {}
    }
  },
}
</script>

<style lang="scss" scoped>
</style>
