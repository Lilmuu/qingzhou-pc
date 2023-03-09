<!-- 普通消息 -->
<template>
  <div :class="isShowLeftModule ? 'left common' : 'common'">
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
      <div class="nickname" v-show="params.type === 'room' && isShowLeftModule">{{message.fromUserName}}</div>
      <!-- 消息气泡 -->
      <div class="bubble">
        <!-- 消息体 -->
        <div class="value message-body" ref="longTouch" selectCype>
          <!-- 消息内容 -->
          <div v-if="equipmentType" >
            <div v-for="(content, index) of message.content" :key="content + index" class="div-display">
              <div v-if="content.type === 'txt'" class="span_color" v-html="content.data"></div>
              <img v-else-if="content.type === 'emoji'" class="emojiImg" :src="`${require('@/assets/images/chat/send-message/emoji/' + content.data)}`" alt="" />
            </div>
          </div>
          <div v-else v-html="webMeaasge(message.oldContent)"></div>
        </div>
        <!-- 单聊是否已读 -->
        <template v-if="params.type === 'friend' && !isShowLeftModule">
          <div class="readTip have-read" v-if="message.isRead">已读</div>
          <div class="readTip unread" v-else>未读</div>
        </template>
      </div>
    </div>

    <!-- 头像 -->
<!--    <div class="avatar">-->
<!--      <my-image-->
<!--          class="img"-->
<!--          fit="cover"-->
<!--          :lazy-load="true"-->
<!--          :round="true"-->
<!--          :src="message.avatar"-->
<!--          :error-icon="$imgUrl.common.defaultFriendAvatar"-->
<!--      />-->
<!--    </div>-->
  </div>
</template>

<script>

import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar"
import { getEmojiName } from "@/assets/js/resource";
import MenuMixin from '../mixins/menu'
import { messageTextParse } from "@/utils";


export default {
  name: 'ordinary',
  mixins: [MenuMixin],
  props: {
    params: {
    },
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
  computed:{
    equipmentType(){
      let from
      if(this.message.messageHead){
        from = this.message.messageHead.from.indexOf('/web')  // 是否为web端
      }else{
        from = this.message.oldContent.indexOf('<p>')
      }
      let isEmoji = this.message.content.findIndex(item =>{
         return item.type == "emoji"
       })
      return from == -1 && isEmoji != -1 ? true : false  
    },
    webMeaasge(){
      return (val)=>{
        let _newVal = val
        // 匹配URL
        const reg_httpLink = /((http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,;@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?)/g 
        if(reg_httpLink.test(_newVal)){
          _newVal = _newVal.replace(reg_httpLink, `<a class='cursor detected-link' href=$1 target='_black'>$1</a>`).replace(/\n/g, "<br />"); 
        }
        if(_newVal.indexOf('app://./') != -1 ){
          let blankStr = _newVal.replace(/app:\/\/.\//gm,'')
          // blankStr = this.messageTextParseEl(blankStr)
          return blankStr
        }
        // 会议视频的链接地址
        if(_newVal.indexOf("sharemeeting.html?roomid=") != -1){
          let startVal = _newVal.indexOf("http")
          let link = _newVal.substring(startVal,_newVal.length)
          let blankStr = _newVal.replace(link,`<span class='link_span'>${link}</span>`)
          return blankStr
        }
        
        return _newVal
      }
    }
  },
  mounted(){
    let _this = this

    // 页面加载完成后，判断是否村遭
    this.$nextTick(()=>{
      let linkSpan = document.getElementsByClassName("link_span")
      if(linkSpan.length>0){
        for(let item =0; item<linkSpan.length; item++){
          linkSpan[item].addEventListener('click', function(){
            let str = linkSpan[item].innerText
            let strArr = str.split('=')
            let roomId = strArr[1] // 拿到房间ID
            _this.$router.push({name:'meeting',params:{roomId}})
          })
        }
      }
    });
  },
  methods: {
    openLink(e) {
      console.log(e)
    },
    getEmojiNameFormat(value) {
      return getEmojiName(value)
    },
    messageTextParseEl(text) {
      return messageTextParse(text.data)
    },
    changeImg(data){
      let blankStr = data.replace(/app:\/\/.\//gm,'')
      return blankStr
    },
  }
}
</script>

<style lang="scss" scoped>
.div-display{
  display: inline-block;
}
</style>
