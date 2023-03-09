<template>
  <div class="select-container">
    <div class="select-view select-left" style="padding-right: 0">
      <el-scrollbar class="select-left-list mail-select-list-collapse" style="overflow:hidden;">
        <div v-for="(item, index) in ChatList"
             :key="'ChatList' + item.jid"
             @click="handleSelect(item)"
             class="select-chat-item">
          <div class="select-chat-item-info">
            <div>
              <!-- 群聊 -->
              <template v-if="item.isRoom == 1 && item.isRoom == true">
                <img src="@/assets/img/contact/group_img.png" alt="" class="head_avatar" >
              </template>
              <!-- 任务助手 -->
              <template v-else-if="item.type === 12 || item.toUserName == '任务助手'">
                <img class="head_avatar" src="@/assets/img/contact/task_assistant.png" alt="">
              </template> 
              <!-- 用户 -->
              <headAvatar v-else-if="item.isRoom != 1 && item.isRoom !== true"
                :size="36" 
                :fontSize='12'
                :avatarUrl="userAvatar(item)" 
                :username="item.toNickName || item.toUserName"
                :redHotval='item.newMessageNumber'>
              </headAvatar>
            </div>
            <div class="chat-name ellipsis">{{handleInformationName(item)}}</div>
          </div>
          <div>
            <i :class="['el-icon-success', isSelected(item.jid) ? 'selected-checked-on' : 'selected-checked-off']"></i>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="select-view select-right" style="padding-top: 0;">
      <el-scrollbar class="selected-list-outer noScroll" style="margin-top: 0;overflow: hidden">
        <div v-for="(item, index) in selectedList"
             :key="'selected' + item.jid"
             @click="handleSelect(item)"
             class="select-chat-item">
          <div class="select-chat-item-info">
            <div>
              <!-- 群聊 -->
              <template v-if="item.isRoom == 1 && item.isRoom == true">
                <img src="@/assets/img/contact/group_img.png" alt="" class="head_avatar" >
              </template>
              <!-- 任务助手 -->
              <template v-else-if="item.type === 12 || item.toUserName == '任务助手'">
                <img class="head_avatar" src="@/assets/img/contact/task_assistant.png" alt="">
              </template> 
              <!-- 用户 -->
              <headAvatar v-else-if="item.isRoom != 1 && item.isRoom !== true"
                :size="36" 
                :fontSize='12'
                :avatarUrl="userAvatar(item)" 
                :username="item.toNickName || item.toUserName"
                :redHotval='item.newMessageNumber'>
              </headAvatar>
            </div>
            <div class="chat-name ellipsis">{{handleInformationName(item)}}</div>
          </div>
          <div>
            <i class="el-icon-error cursor"></i>
          </div>
        </div>
      </el-scrollbar>
      <div class="flex-space-between" style="margin-top: 15px;">
        <el-button @click="selectCancel" size="small">取消</el-button>
        <el-button type="primary" :loading="isBtnLoading" size="small" @click="handleSubmit">确认</el-button>
        
      </div>
    </div>
  </div>
</template>

<script>
import { sendMessage } from '@/xmpp/send-message'
import { mapGetters, mapActions, mapState } from 'vuex'
import headAvatar from "@/components/headAvatar"
import { getItem } from '@/utils/imUtil/storage'
// import Avatar from "@/components/Avatar/Avatar";

export default {
  name: "selectChatItem",
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedList: [],
      isBtnLoading: false,
    }
  },
  components: {
    headAvatar
  },
  async mounted () {
    await this.GetLastChatList()
    console.log("ChatList-ChatList",this.ChatList)
  },
  computed: {
    ...mapState({
      'FriendList': state => state.Im.Friends.FriendList,
    }),
    ...mapGetters({
      'ChatList': 'Im/Information/ChatList',
      'IdFriendList': 'Im/Friends/IdFriendList',
      'JidRoomList': 'Im/Room/JidRoomList'
    }),
    userAvatar(){
        return (userInfo)=>{
          let imId = getItem('MeId')
          let fromUser = userInfo.to == imId ? userInfo.jid : userInfo.toUserId
          let user = this.FriendList.find(item=>{
            return item.toUserId == fromUser
          })
          return user.headImg
        }
      },
  },
  methods: {
    ...mapActions({
      'GetLastChatList': 'Im/Information/GetLastChatList' // [GET] 获取聊天列表
    }),
    handleInformationName (people) {
      if (people.isRoom) {
        return people.toNickName
      } else {
        return people.userId === people.toUserId ? people.fromUserName : people.toNickName
      }
    },
    // 选择
    handleSelect(item) {
      if (!item.jid) return

      if (this.isSelected(item.jid)) {
        this.selectedList = this.selectedList.filter(i => i.jid !== item.jid)
      } else {
        this.selectedList.push(item)
      }
    },
    // 是否选中
    isSelected(jid) {
      if (!jid) return false

      const selectedJidArr = this.selectedList.map(i => i.jid)
      return selectedJidArr.includes(jid)
    },
    // 转发消息提交
    handleSubmit() {
      const selectInformation = this.selectedList
      if (selectInformation.length === 0) return

      const message = this.message
      let sum = 0
      this.isBtnLoading = true
      console.log('selectInformation',selectInformation)
      selectInformation.forEach(information => {

        const sendParams = {
          msgType: message.type,
          content: message.oldContent,
          toId: information.jid,
          name: message.fileName,
          size: message.fileSize,
          // chatType: information.chatType
          chatType: information.isRoom == false ? 1 : 2,
          fileName: message.fileName,
          fileSize: message.fileSize,
          fileType: message.fileTime,
          fileTime: message.fileTime
        }

        if (sendParams.chatType === this.$chatType.GroupChatNumber) {
          sendParams.toName = this.JidRoomList[sendParams.toId].name
          sendParams.encryptType = this.JidRoomList[sendParams.toId].encryptType
        } else if (sendParams.chatType === this.$chatType.ChatNumber) {
          sendParams.toName = this.IdFriendList[sendParams.toId].toNickname
          sendParams.encryptType = this.IdFriendList[sendParams.toId].encryptType
        }
        console.log("sendParams - sendParams",sendParams)
        let msg = sendMessage(sendParams)
        console.log("msg - msg",msg)
        msg = this.$utils.Xmpp.decryptMessage(msg)
        if (msg) {
          sum++
          // 维护本地最新消息列表
          this.$storage.lastChatList.setLastChat({ message: msg, chatType: sendParams.chatType })
        }
      })

      if (selectInformation.length === sum) {
        this.$message.success('转发成功')
        this.isBtnLoading = false
        this.selectCancel()
      }
    },
    selectCancel() {
      this.$emit('selectCancel')
    }
  },
}
</script>

<style scoped>

</style>
