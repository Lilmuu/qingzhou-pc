<template>
  <li :class="['itemBox cursor',
   isActive ? 'itemBoxActive' : '',
   data.isTop ? 'itemBoxTop': ''
   ]" :title="ChatAvatar">
    <div class="face">
      <!-- 群聊 -->
      <template v-if="data.isRoom == 1 && data.isRoom == true">
        <el-badge v-if="data.newMessageNumber > 0" :value="data.newMessageNumber" :max="99" class="item">
          <img src="@/assets/img/contact/group_img.png" alt="" class="head_avatar" >
        </el-badge>
        <img v-else src="@/assets/img/contact/group_img.png" alt="" class="head_avatar" >
      </template>

      <!-- 任务助手 -->
      <template v-else-if="data.type === 12 || data.toUserName == '任务助手'">
        <el-badge v-if="data.newMessageNumber > 0" :value="data.newMessageNumber" :max="99" class="item">
          <img class="img_task_assistant" src="@/assets/img/contact/task_assistant.png" alt="">
        </el-badge>
        <img v-else class="img_task_assistant" src="@/assets/img/contact/task_assistant.png" alt="">
      </template> 
      
      <!-- 用户 -->
      <headAvatar v-else-if="data.isRoom != 1 && data.isRoom !== true"
        :size="36" 
        :fontSize='12'
        :avatarUrl="userAvatar" 
        :username="data.toNickName"
        :redHotval='data.newMessageNumber'>
      </headAvatar>
    </div>
    <div class="box" >
      <!-- @click="handleGotoChatClick()" -->
      <div class="top">
        <div class="nickname ellipsis">{{data.toNickName || data.fromUserName}}</div>
        <div class="time">{{ parseInt(data.timeSend) | renderCloDate }}</div>
      </div>
      <div class="content">
        <template v-if="equipmentType" >
          <span class="no_web" v-for="(item, index) of textAnalys(data.content)" :key="item + index">
            <span v-if="item.type === 'text'" class="span_color" v-html="FormatText(item)"></span>
            <img v-else-if="item.type === 'img'" class="emojiImg" :src="`${require('@/assets/images/chat/send-message/emoji/' + item.content)}`" alt="" />
          </span>
        </template>
        <div v-else class="text ellipsis marg_zreo" v-html="changeContent(data.content)"></div>
      </div>
    </div>
  </li>
</template>

<script>
import headAvatar from "@/components/headAvatar"
  import { mapState, mapGetters } from 'vuex'
  // import Avatar from "@/components/Avatar/Avatar";
  import Badge from "@/components/Badge/Badge";
  import { getEmojiValue } from "@/assets/js/resource";

  export default {
    props: {
      isActive: {
        type: Boolean,
        default: false
      },
      data: { 
        type: Object, 
        required: true 
      },
      userAvatar: {
        type: String,
        default: ''
      },
    },
    components: {
      headAvatar,
      Badge
    },
    computed: {
      ...mapState({
        'MeId': state => state.Common.User.MeId,
      }),
      ...mapGetters({
        'JidRoomList': 'Im/Room/JidRoomList',
        IdFriendList: 'Im/Friends/IdFriendList'
      }),
      // 格式化消息数量
      FormatMessageNumber () {
        return this.data.newMessageNumber > 99 ? '···' : this.data.newMessageNumber
      },
      FormatText(){
        return (val)=>{
          let value 
          if( this.data.type == 11 && val.content.match(/NEWTASK/)){
            value = JSON.parse(val.content)
            value = `任务提醒：${value.title}`
          }else if(this.data.type == 12){
            value = `${this.data.content}`
          }else{
            value = val.content
          }
          return value
        }
      },
      // 聊天头像
      ChatAvatar () {
        const username = this.data.toNickName || this.data.fromUserName
        return username
      },
      changeContent(){
        return (val) => {
          let newVal
          let str = val.indexOf('<img src="data:')
          let newTaskId = val.match(/NEWTASK/) ? JSON.parse(val).taskId : ""
          if(newTaskId != ''){
            newVal = `任务提醒：${JSON.parse(val).title}`
          }else if(str == -1){
            newVal = val
            newVal = newVal.replace(/<p><br\/><\/p>/mg,'')
            newVal = newVal.replace(/app:\/\/.\//mg,'/')
            newVal = newVal.replace(/<br(\/)?>/mg,'')
            let style = /background-color/
            if(style.test(newVal)){
              newVal = newVal.replace(style, '');
            }
            return newVal
          }else{
            newVal = '[图片]'
          }
          return newVal
        }
      },
      equipmentType(){
        let fromHead
        let from
        let newArr = Object.keys(this.data)
        if(newArr.indexOf('messageHead') != -1 ){
          fromHead = this.data.messageHead.from.indexOf('/web')  // 是否为web端
        }else{
          let val = this.data.isRoom && this.data.fromJid ? this.data.fromJid : this.data.from
          from = val ? val.indexOf('/web') : -1  // 是否为web端
        }
        return (fromHead == -1) || from == -1  ? true : false  
      }
    },
    methods: {
      // [Click] 跳转聊天室
      handleGotoChatClick (item = this.data) {
        console.log(this.data,'this.data')
        console.log(item,'item')
        this.$storage.newMessageNumber.deleteId(item.jid) // 清除新消息
        this.$storage.notShownMessage.deleteJid(item.jid) // 删除收到但为显示的消息

        // 跳转群聊天
        if (item.isRoom || item.chatType === 2) {
          // this.$router.push({ name: 'chat', params: { id: this.JidRoomList[this.data.jid].id, type: 'room', jid: this.data.jid } })
          console.log(this.JidRoomList,'this.JidRoomList')
          const room = this.JidRoomList[item.jid]
          if (!room || !room.id) {
            this.$message.error('消息不存在')
            return
          }

          const params = {
            id: this.JidRoomList[item.jid].id,
            type: 'room',
            jid: item.jid,
            messageType: (item.type == 12 || item.toUserName == '任务助手') ? 12 : ''
          }
          this.$emit('changeChat', params)
        } else {
          // 跳转单人聊天室
          let id = item.jid
          // 判断最后一条消息是谁发送的（如果是自己则去对方ID）
          if (!id) {
            if (parseInt(item.fromUserId) === this.MeId) id = item.toUserId
            else id = item.fromUserId
          }
          const params = {
            id,
            type: 'friend',
            jid: id,
            messageType: (item.type == 12 || item.toUserName == '任务助手') ? 12 : ''
          }
          this.$emit('changeChat', params)
        }
      },
      getEmojiNameFormat(value) {
        return getEmojiValue(value)
      },
      textAnalys(newStr){
        // console.log(newStr,'newStr --- newStr')
        // debugger
        let array = []
        let spliceStr = '',haveLeft = false
        if(newStr){
          for (var i = 0; i <newStr.length; i++) {
            if(newStr[i]=='['){
              if(!haveLeft){
                haveLeft = true
                if(( spliceStr +newStr[i]).indexOf!= 0){
                  array.push({
                    type:'text',
                    content:spliceStr
                  })
                  spliceStr = ''
                }
              }else{
                array.push({
                  type:'text',
                  content:spliceStr
                })
                spliceStr = ''
                haveLeft = false
              }
            }
            spliceStr += newStr[i]
            if(newStr[i]==']' && haveLeft){
              let emojiName = this.getEmojiNameFormat(spliceStr)
              if(emojiName==spliceStr){
                array.push({
                  type:'text',
                  content:spliceStr
                })
              }else{
                array.push({
                  type:'img',
                  content:emojiName
                })
              }
              spliceStr = ''
              haveLeft = false
            }
          }
          if(spliceStr){
            array.push({
              type:'text',
              content:spliceStr
            })
          }
        }else{
          array.push({
            type:'text',
            content:newStr
          })
        }
        return array
      },

    },
    mounted(){
      console.log(this.data,'data --- data')
    }
  }
</script>

<style lang="scss" scoped>
.img_task_assistant{
  width: 36px;
}
</style>
