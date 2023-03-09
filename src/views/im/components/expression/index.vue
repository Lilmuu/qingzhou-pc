<template>
  <div class="espression">
    <!-- emoji表情 -->
    <div class="emoji-box">
      <div class="emoji cursor"
           v-for="(emoji, emojiIndex) in Emojis"
           :key="'emojiIndex' + emojiIndex"
           @click="$emit('expressionClick', emoji.value)">
        <img class="img grid-center" :src="`${require('@/assets/images/chat/send-message/emoji/' + emoji.value)}`" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sendMessage } from '@/xmpp/send-message'
import { getEmojiList } from '@/assets/js/resource'

let emojisList = getEmojiList()

export default {
  data () {
    return {
      Emojis: emojisList,
      Actived: 'ordinary'
    }
  },
  computed: {
    ...mapGetters({
      'IdFriendList': 'Im/Friends/IdFriendList',
      'JidRoomList': 'Im/Room/JidRoomList'
    })
  },
  methods: {
    ...mapActions({
      AddMessageList: 'Im/Chat/AddMessageList' // [Add] 添加消息列表
    }),
    // [Click] 发送gif表情
    onClickSendGifExpression (gif) {
      const sendParams = {
        msgType: this.$msgType.GIF,
        content: gif,
        toId: this.$route.params.jid
      }

      if (this.$route.params.type === 'room') {
        sendParams.chatType = this.$chatType.GroupChatNumber
        sendParams.toName = this.JidRoomList[sendParams.toId].name
        sendParams.encryptType = this.JidRoomList[sendParams.toId].encryptType
      } else if (this.$route.params.type === 'friend') {
        sendParams.chatType = this.$chatType.ChatNumber
        sendParams.toName = this.IdFriendList[sendParams.toId].toNickname
        sendParams.encryptType = this.IdFriendList[sendParams.toId].encryptType
      }

      // 发送消息
      let msg = sendMessage(sendParams)
      msg = this.$utils.Xmpp.decryptMessage(msg)
      // 将该消息添加到消息列表
      this.AddMessageList(msg)
      // 阅后即焚消息不执行
      if (!msg.isReadDel) {
        // 维护本地最新消息列表
        this.$storage.lastChatList.setLastChat({ message: msg, chatType: msg.chatType })
      }
    }
  }
}
</script>
