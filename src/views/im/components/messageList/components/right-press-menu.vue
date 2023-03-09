<!-- 右键菜单 -->
<template>
  <div class="long-press-menu" v-if="show">
    <div class="long-press-menu-mask" @click="handleHideMenu"></div>
    <div class="long-press-menu-row" :style="menuStyle" v-clickoutside="handleHideMenu">
      <div class="forward" @click="onClickForwardingMessage">
        <img src="@/assets/images/chat/message-list/transmit_no.png" alt="">
        转发
      </div>
      <div class="forward" @click="onClickRecallMessage(message,1)">
        <img src="@/assets/images/chat/message-list/del_no.png" alt="">
        删除
      </div>
      <div class="copy" v-show="IsShowCopyMenu" @click="onClickCopyMessage">
        <img src="@/assets/images/chat/message-list/copy_no.png" alt="">
        复制
      </div>
      <div class="recall" v-show="IsShowRecallMenu && ShowWithdraw" @click="onClickRecallMessage(message,2)">
        <img class="show" src="@/assets/images/chat/message-list/recall_no.png" alt="">
        撤回
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { sendMessage } from '@/xmpp/send-message'
import { convertImgToBase64 } from "@/utils";
import { copyImgFromDataUrl } from "@/utils/pure";

export default {
  model: {
    prop: 'show',
    event: 'change'
  },
  props: {
    show: Boolean,
    menuStyle: {
      type: Object,
      default: () => { return {} }
    },
    message: {
      type: Object,
      default: () => { return {} }
    },
    ShowWithdraw:{
      type:Boolean,
      default: () =>{return true}
    },
    eventContText:{
      type: String,
      default: ()=>{
        return ''
      }
    },
    lastMessage:{
      type: String,
      default: ()=>{
        return ''
      }
    }
  },
  computed: {
    ...mapState({
      MeId: state => state.Common.User.MeId,
      IMRouterParams: state => state.Im.Chat.IMRouterParams
    }),
    // 显示撤回菜单
    IsShowRecallMenu () {
      // 该消息为自己发送，并且改消息不是阅后即焚消息
      return parseInt(this.message.fromUserId) === this.MeId && !this.message.isReadDel
    },
    // 显示复制菜单
    IsShowCopyMenu () {
      /**
       * 该消息类型为
       * 1.普通消息
       * 2.图片 TODO: 复制图片
       * 3.文件
       */
      return this.message.type === 1 || this.message.type === 2
    },
    MessageContent () {
      let str = ''
      for (let i = 0; i < this.message.content.length; i++) {
        if (this.message.type === 1) {
          // 普通消息
          if (this.message.content[i].type === 'emoji') {
            // 表情
            str += '[' + this.message.content[i].data + ']'
          } else if (this.message.content[i].type === 'txt') {
            // 文字
            str += this.message.content[i].data
          }
        }
      }
      return str
    }
  },
  methods: {
    ...mapMutations({
      'SET_RETRACT_MESSAGE': 'Im/Chat/SET_RETRACT_MESSAGE' // [SET] 设置撤回消息
    }),
    ...mapActions({
      'AddMessageList': 'Im/Chat/AddMessageList', // 添加消息
      'PostDeleteMessage': 'Im/Chat/PostDeleteMessage' // [POST] 删除消息
    }),
    // [Click] 隐藏菜单
    handleHideMenu () {
      this.$emit('change', false)
    },
    // [Click] 复制消息
    onClickCopyMessage () {
      const message = this.message
      const _this = this

      console.log(message,'message - 选择的复制文本')
      console.log(this.eventContText,'eventContText - 选择的复制文本')
      if (message.type === 1) {
        this.$copyText(this.eventContText).then(e => {
        // this.$copyText(message.oldContent).then(e => {
          this.handleHideMenu()
        }, e => {
          this.$message.error(`复制失败`)
        })
      } else if (message.type === 2) {
        const url = message.content
        if (!url) {
          this.$message.error('资源链接不存在')
          return
        }
        convertImgToBase64(url, '', function (base64Image) {
          copyImgFromDataUrl(base64Image);
          _this.handleHideMenu()
        });
      }

    },
    // [Click] 撤回消息
    onClickRecallMessage (message, del) {
      console.log('message - message', message)
      const isFriend = this.IMRouterParams.type === 'friend'

      // if(del == 2 && !isFriend){
      //   this.$message.error('群聊消息无法撤回')
      //   this.handleHideMenu()
      //   return
      // }



      const sendParams = {
        msgType: this.$msgType.REVOKE,
        content: message.messageId,
        toId: message.toUserId,
        toName: message.toUserName,
        chatType: isFriend ? this.$chatType.ChatNumber : this.$chatType.GroupChatNumber
      }
      // const msg = sendMessage(sendParams)
      // if (msg) {
        let aig = del==1?'删除':'撤回'
        var message1=`
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">确定要`+aig+`选中的信息吗?</span>
            </div>
          </div>
          `
            this.$msgbox({
          message: message1,
          dangerouslyUseHTMLString: true,
          customClass: 'customMsgBox',
          showCancelButton: true,
          confirmButtonText: '确定',
          confirmButtonClass: 'confirmBtn confirmButton',
          cancelButtonText: '取消',
          cancelButtonClass: 'confirmBtn cancelButton',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              
                
            
        const params = {
          userId: this.MeId,
          delete: del,
          messageId: this.message.messageId,
          type: sendParams.chatType,
          roomJid: this.message.toUserId,
          timeSend: message.timeSend,
        }
        // let _this = this
        this.PostDeleteMessage(params).then(rs => {
          this.handleHideMenu()
          // 撤回消息
          if (rs.resultCode === 1 && del === 2) {
            sendMessage(sendParams)
            message.type = 202
            message.content = '您撤回了一条消息'
            delete message.oldContent
            if (isFriend) {
              // 维护本地最新消息列表
              const chatRoomJid = this.IMRouterParams.jid
              this.$storage.ousinessPperations.retractMessage({ message, userId: chatRoomJid,chatType: sendParams.chatType })
            } else {
              // 群组接口会返回撤回消息，只需要存在messageList即可
              this.AddMessageList(message)
              // 更新最后聊天消息为撤回消息
              this.$storage.lastChatList.setLastChat({ message: message, chatType: sendParams.chatType })
            }
          }else if(rs.resultCode === 1 && del === 1){
              this.$message.success(`删除成功`)
              if(this.lastMessage != ''){
                let web = this.equipmentType(this.lastMessage)
                let msg = JSON.parse(this.lastMessage)
                message.content = web ? msg.oldContent : msg.content
                message.type = msg.type
                this.$storage.lastChatList.setLastChat({ message: message, chatType: sendParams.chatType })
              }
          }
        })
            done()
            } else {
              done()
            }
          }
        })
      // }
    },
    equipmentType(value){
      let fromHead
      let from
      let newArr = Object.keys(value)
      if(newArr.indexOf('messageHead') != -1 ){
        fromHead = value.messageHead.from.indexOf('/web')  // 是否为web端
      }else{
        let val = value.isRoom ? value.fromJid : value.from
        from = val ? val.indexOf('/web') : -1  // 是否为web端
      }
      return (fromHead == -1) || from == -1  ? true : false  
    },

    // [Click] 转发消息
    onClickForwardingMessage () {
      this.handleHideMenu()
      this.$emit('onForwardingMessage', this.message)
      // this.$router.push({ name: 'chat-forward-message', params: { message: message } })
    },
    // 多选
    handleMultipleChoiceMessage() {

    },
  }
}
</script>

<style lang="scss" scoped>
.long-press-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 999;

  .long-press-menu-mask {
    width: 100vh;
    height: 100vh;
  }

  .long-press-menu-row {
    position: fixed;
    box-sizing: border-box;
    z-index: 1;
    box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
    flex-direction: column;
    background: #fff;
    border: 1px solid #DEE0E3;
    box-shadow: 0px 0px 10px rgba(75, 129, 255, 0.1);
    opacity: 1;
    border-radius: 4px;
    > div {
      padding: 5px 8px;
      margin: 10px;
      line-height: 10px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      img{
        width: 14px;
        margin-right: 10px;
      }
      &:active, &:hover {
        background-color: #F5F6F7;
        border-radius: 4px;
      }
    }
    .forward,
    .copy,
    .recall{
      color: #646A73;
    }
  }
}

</style>

