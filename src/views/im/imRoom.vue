<template>
  <div class="imViewContainer">
    <!-- 消息头部 -->
    <div class="imHeader flex-space-between">
      <div class="face">
        <img v-if="params.messageType === 12" class="img_task_assistant" src="@/assets/img/contact/task_assistant.png" alt="">
        <img v-else-if="params.type === 'room'" src="@/assets/img/task/groupChat.png" alt="" >
        <headAvatar v-else-if="params.type !== 'room'"
          :size="36" 
          :fontSize='12'
          :avatarUrl="params.userAvatar ? params.userAvatar: ''" 
          :username="params.type === 'room' ? '群聊' : Title">
        </headAvatar>
        
        <span class="userName" v-if="params.type != 'room'">{{ Title }}</span>
        <div class="roomUserName" v-if="params.type === 'room'">
          <div>{{ Title }}</div>
          <img src="@/assets/img/task/numberPeople.png" alt=""><span>{{RoomInfo.userSize || 0}}人</span>
        </div>
      </div>
      <div class="actionBtn" v-if="params.type === 'room'">
        <div class="cursor" @click="handleChangeTop" style="margin-right:10px">
          <img src="@/assets/img/task/topChat.png" alt="" v-if="!topChatIf">
          <img src="@/assets/img/task/topChatSelected.png" alt="" v-if="topChatIf">
        </div>
        <div class="cursor" @click="handleShowGroupUsers">
          <img src="@/assets/img/task/setGroup.png" alt="">
        </div>
      </div>
    </div>
    <!-- 消息列表 -->
    <splitpanes horizontal style="">
      <pane min-size="20" size="70" class="messageListMain" :class="{'messageListMain_task': params.messageType === 12}">
        <div id="main" class="messageListContainer">
          <messageList ref="messageList" :params="params" :key="'messageList' + params.jid"></messageList>
        </div>
      </pane>
      <!-- 消息输入框 -->
      <SendMessage :params="params" :roomTitle="Title" v-if="params.messageType != 12"></SendMessage>
    </splitpanes>
    <!-- 群成员  -->
    <transition enter-active-class="animate__fadeInRight"
      leave-active-class="animate__fadeOutRight"
      v-if="params.type === 'room'">
      <groupUsers class="animated"
        ref="groupUsers"
        :params="params"
        v-show="showGroupUsers"
        v-clickoutside="handleClickOutGroupUsers"
        @close="showGroupUsers = false"
        @sonChangeTop="sonChangeTop">
      </groupUsers>
    </transition>
  </div>
</template>

<script>
import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar"
import messageList from './components/messageList/index.vue'
import groupUsers from './components/groupUsers/index.vue'
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import { Splitpanes, Pane } from 'splitpanes'
import SendMessage from "@/views/im/components/sendMessage";
import { setWindowIMRouterParams } from "@/utils/imUtil/primary";

export default {
  name: "imRoom",
  props: {
    params: {
      type: Object,
      required: true
      /*
      * id: '',
        type: 'friend',   // [room, friend]
        jid: ''           // 群jid / 好友id
      * */
    }
  },
  data() {
    return {
      showGroupUsers: false,
      isHandler: true,
      MessageBoxHeight: 0,
      Title: '聊天', // 标题文本
      topChatIf:true
    }
  },
  components: {
    headAvatar,
    messageList,
    groupUsers,
    Splitpanes,
    Pane,
    SendMessage
  },
  computed: {
    ...mapState({
      'HeaderHeight': state => state.HeaderHeight,
      'RoomInfo': state => state.Im.Room.RoomInfo
    }),
    ...mapGetters({
      ChatRoomInfo: 'Im/Chat/ChatRoomInfo', // 聊天室信息
      IdFriendList: 'Im/Friends/IdFriendList', // id做为key的群组列表
      JidRoomList: 'Im/Room/JidRoomList' // jid做为key的群组列表
    })
  },
  async mounted () {
    console.log(this.params,'23213ddd')
    // 获取聊天室标题
    setWindowIMRouterParams(this.params)
    await this.GetLastChatList()
    if (this.params.type === 'friend' && JSON.stringify(this.IdFriendList) !== '{}') {
      this.Title = this.IdFriendList[this.params.id].toNickname
    } else if (this.params.type === 'room' && JSON.stringify(this.JidRoomList) !== '{}') {
      this.GetRoomInfo({ roomId: this.params.id })
      this.Title = this.JidRoomList[this.params.jid].name
      this.topChatIf=this.$refs.groupUsers.isTop
    }
    console.log(this.params,'params -- params')
  },
  methods: {
    ...mapMutations({
      SET_CHAT_ROOM_INFO: 'Im/Chat/SET_CHAT_ROOM_INFO' // [SET] 修改聊天室信息
    }),
    ...mapActions({
      'GetRoomInfo': 'Im/Room/GetRoomInfo', // [GET] 获取群信息
      'GetLastChatList': 'Im/Information/GetLastChatList' // [GET] 获取聊天列表
    }),
    handleChangeTop(params){
      console.log(params);
      this.topChatIf=!this.topChatIf
        this.$refs.groupUsers.handleChangeTop(this.topChatIf)
    },
    sonChangeTop(topChatIf) {
      this.topChatIf= topChatIf
    },
    handleShowGroupUsers() {
      if(this.params.type === 'room') {
        this.showGroupUsers = true
      }
    },
    handleClickOutGroupUsers() {
      if(this.showGroupUsers) {
        // this.showGroupUsers = false
      }
    },
  },
  watch: {
    // 监听群组的人数，用于设置header
    // 'RoomInfo.userSize' (news) {
    //   if (news) {
    //     this.Title = `${this.JidRoomList[this.$route.params.jid].name}(${news}人)`
    //   }
    // }
    'RoomInfo.name' (name) {
      this.Title = name
    }
  },
}
</script>

<style lang="scss" scoped>
.room_chat{
  width: 4px;
  height: 18px;
  background-color: #3471FF;
}
.roomUserName{
  // display: flex;
  // justify-content: center;
  // align-items: center;
  margin-left: 10px;
  div{
    font-size: 16px;
  }
  img{
    width: 12px;
    margin-top: 6px;
    margin-right: 10px;
  }
  span{
    color: #8F959E;
    font-size: 12px;
  }
}
.img_task_assistant{
  width: 36px;
}
</style>
