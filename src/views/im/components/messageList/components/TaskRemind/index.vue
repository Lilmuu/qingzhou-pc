<!--
 * @Author: youshijun
 * @Date: 2021-09-24 14:24:04
 * @LastEditTime: 2022-04-25 10:36:28
 * @LastEditors: Please set LastEditors
 * @Description: 任务提醒 聊天内容样式
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\TaskRemind\index.vue
-->
<template>
  <div :class="isShowLeftModule ? 'left common' : 'common'">
    <div class="avatar">
      <headAvatar 
        :size="32" 
        :fontSize='12'
        :avatarUrl="userAvatar" 
        :username="message.fromUserName">
      </headAvatar>
    </div>
    <div class="content">
      <!-- 消息气泡 -->
      <div class="bubble">
        <!-- 消息体 -->
        <div class="value message-body no_message_text" ref="longTouch">
          <div class="notice_title">
            <div>
              <img src="@/assets/images/chat/message-list/notice.png" alt="公告" style="width:16px">
              <span>任务提醒</span>
            </div>
          </div>
          <!-- 消息内容 -->
          <div class="pictore index notice_cont">
            <div>{{ messageCont.title }}</div>
            <span v-show="messageCont.endTime">{{ endTimeFormat(messageCont.endTime) }} 截止</span>
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
import timeFormat from "@/utils/imUtil/time.js";
export default {
  props:{
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
  components:{
    headAvatar
  },
  data(){
    return {

    }
  },
  computed:{
    messageCont(){
      return JSON.parse(this.message.oldContent)
    },
    endTimeFormat(){
      return (time)=>{
        return timeFormat.timestampToFormat(time,'M月DD日  HH：mm')
      }
    },
    // contentFormat(){
    //   return (cont)=>{
    //     let newVal = cont.replace(/<br\/>/,' ')
    //     return 
    //   }
    // }
  },
}
</script>

<style>

</style>