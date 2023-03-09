<!--
 * @Author: your name
 * @Date: 2021-09-28 11:08:46
 * @LastEditTime: 2022-04-19 15:41:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\notice\index.vue
-->
<!-- 公告消息 -->
<template>
  <div class="noticeMessageContainer" :class="isShowLeftModule ? 'left common' : 'common'">
    <div class="avatar">
      <!-- <Avatar :username="message.fromUserName"></Avatar> -->
      <headAvatar 
        :size="32" 
        :fontSize='12'
        :avatarUrl="userAvatar" 
        :username="message.fromUserName">
      </headAvatar>
    </div>
    <div class="content">
      <!-- 群昵称 -->
      <div class="nickname" v-if="isShowLeftModule">{{message.fromUserName}}</div>
      <!-- 消息气泡 -->
      <div class="bubble">
        <!-- 已读内容 -->
        <div class="read">
        </div>

        <!-- 消息体 -->
        <div class="value message-body" ref="longTouch" style="padding: 0;">
          <!-- 消息内容 -->
          <div class="notice-header">
            <img src="@/assets/img/im/notice.png" class="notice-icon" alt="">
            <span class="notice-header-text">群公告</span>
          </div>
          <div class="notice-content">
            {{ message.oldContent }}
          </div>
        </div>
        <!-- 单聊是否已读 -->
        <template v-if="params.type === 'friend' && !isShowLeftModule">
          <div class="readTip have-read" v-if="message.isRead">已读</div>
          <div class="readTip unread" v-else>未读</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import headAvatar from "@/components/headAvatar"
export default {
  name: 'notice',
  props: {
    params: {},
    // 消息对象
    message: {
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
  data() {
    return {
    }
  },
  components: {
    headAvatar
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>

</style>
