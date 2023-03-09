<!--
 * @Author: youshijun
 * @Date: 2021-09-26 14:53:54
 * @LastEditTime: 2022-07-29 16:35:52
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 任务助手-提醒消息 样式
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\task-notice\index.vue
-->

<template>
  <div :class="isShowLeftModule ? 'left common' : 'common'">
    <div class="avatar">
      <img class="img_task_assistant" src="@/assets/img/contact/task_assistant.png" alt="">
    </div>
    <div class="content">
      <!-- 消息气泡 -->
      <div class="bubble">
        <!-- 消息体 -->
        <div class="value message-body no_message_text task_assistant" ref="longTouch">
          <div class="task_notice_title report-tit" v-if="messageCont.type === 'TASK_CALENDAR_REPORT'">
            <img src="@/assets/images/chat/message-list/reportingCommunicate.png" alt="公告" style="width:16px">
            <span>汇报交流</span>
          </div>
          <div class="task_notice_title notice-tit" v-else-if="messageCont.type === 'TASKREMIND'">
            <img src="@/assets/images/chat/message-list/notice.png" alt="提醒" style="width:16px">
            <span>任务提醒</span>
          </div>
          <div class="task_notice_title report-tit" v-else-if="messageCont.type === 'SCHEDULE_REMIND'">
            <img src="@/assets/images/chat/message-list/reportingCommunicate.png" alt="提醒" style="width:16px">
            <span>日程提醒</span>
          </div>
          <!-- 汇报交流 -->
          <template v-if="messageCont.type === 'TASK_CALENDAR_REPORT'">
            <div class="task_notice_cont" >
              <div class="cont_head"> {{ messageCont.title }}{{ messageCont.state == "0"?"-审批未通过":"-审批通过"}}</div>
              <div class="report_cont" v-if="messageCont.content">备注内容：{{ messageCont.content }}</div>
            </div>
          </template>
          <!-- 任务提醒 -->
          <template v-else-if="messageCont.type === 'TASKREMIND'">
            <div class="task_notice_cont" v-show="seeInfor">
              <div class="cont_head">{{ messageCont.title }} </div>
              <div class="end_date">{{ messageCont.endDate }}</div>
              <div class="see_btn" @click="seeInfor = false" v-if="messageCont.content">点击查看</div>
            </div>
            <div class="task_notice_tips" v-show="!seeInfor">
              <div class="open_cont" >任务内容：{{ messageCont.content }}</div>
            </div>
          </template>

          <!-- 日程提醒 -->
          <template v-else-if="messageCont.type === 'SCHEDULE_REMIND'">
            <div class="task_notice_cont" v-show="seeInfor">
              <div class="cont_head">{{ messageCont.title }} </div>
              <div class="end_date">{{ messageCont.endDate }}</div>
              <div class="see_btn" @click="seeInfor = false" v-if="messageCont.content">点击查看</div>
            </div>
            <div class="task_notice_tips" v-show="!seeInfor">
              <div class="open_cont" >任务内容：{{ messageCont.content }}</div>
            </div>
          </template>

          <!-- #F3FCF2 -->
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
      seeInfor: true
    }
  },
  computed:{
    messageCont(){
      return JSON.parse(this.message.oldContent)
    },
  },
}
</script>

<style lang="scss" >
.avatar{
  .img_task_assistant{
    width: 32px;
  }
}

</style>
