<!--
 * @Author: your name
 * @Date: 2021-09-23 18:49:58
 * @LastEditTime: 2022-06-22 11:42:15
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\views\im\information\searchItem.vue
-->
<template>
  <div class="search-list">
    <div class="head-title">{{ groupingType(searchItem) }}</div>
    <template v-for="(item, Index) in searchItem[searchKey]">
      <div class="search-item" @click="jumpRecord(item, searchKey)" :key="'secd' + Index">
        <!-- 群聊 -->
        <template v-if="searchKey === 'group' || searchKey === 'mucmsgs'">
          <img class="img_task_group" src="@/assets/img/contact/group_img.png" alt="" >
        </template>
        <!-- 任务助手 -->
        <template v-else-if="item.toFirstBig === 'RWZS' || item.toNickname == '任务助手' || item.seqNo === 12">
          <img class="img_task_assistant" src="@/assets/img/contact/task_assistant.png" alt="">
        </template> 

        <!-- 用户 -->
        <headAvatar v-else
          :size="36" 
          :fontSize='12'
          :avatarUrl="searchKey === 'friend' ? item.headImg : transformAvatar(item.message)"
          :username="searchKey === 'friend' ? (item.toNickname || item.realName) : transformUserName(item.message)">
        </headAvatar>
        <!-- 联系人 -->
        <div v-if="searchKey === 'friend'" class="item-cont item-cont-font" v-html="matching(item.toNickname || item.realName, item)"></div>
        <!-- 群聊 -->
        <div v-if="searchKey === 'group'" class="item-cont item-cont-font" v-html="matching(item.name, item)"></div>

        <div v-if="searchKey === 'mucmsgs'" class="item-cont">
          <div class="item-cont-font" >{{ transform(item.message) }}</div>
          <div class="item-cont-samll" v-html="matching(item.content, item)"></div>
        </div>

        <!-- 私聊记录 -->
        <div v-if="searchKey === 'shikuMsgs'" class="item-cont">
          <div class="item-cont-font">{{ transform(item.message) }}</div>
          <div class="item-cont-samll" v-html="matching(item.content, item)"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import headAvatar from "@/components/headAvatar"
import { mapGetters, mapActions } from 'vuex'
import { sendMessage } from '@/xmpp/send-message'
import { getItem } from '@/utils/imUtil/storage'


export default {
  props:{
    searchItem:Object,
    searchKey:String
  },
  components:{headAvatar},
  data() {
    return{
      typeChat: 'friend', // 当前类型
    }
  },
  computed:{
    ...mapGetters({
        'JidRoomList': 'Im/Room/JidRoomList',
        'IdFriendList': 'Im/Friends/IdFriendList', // 我的好友列表
      }),
    userAvatar(){
      return (message)=>{
        return this.IdFriendList[message.fromUserId].headImg ? this.IdFriendList[message.fromUserId].headImg: ''
      }
    },
    searchList(){
      let data = window.localStorage.getItem("changeList")
      data = JSON.parse(data)
      return data
    },
    SearchData(){
      return this.$store.state.Im.Information.SearchData
    },
    shikuMsgs(){
      return (val)=>{
        return JSON.parse(val.message).toUserName
      }
    }
  },
  methods:{
    ...mapActions({
        GetUserInfo: 'Common/User/GetUserInfo', // [GET] 获取用户信息
        PostAddFriend: 'Im/Friends/PostAddFriend', // [POST] 添加好友
      }),
    groupingType(val){
      let key = Object.keys(val)[0]
      let type
      switch (key) {
        // 加入会议： qingzhou:?action=joinMeeting&roomId=123456
        case 'friend':
          type =  "联系人"
          break
        case 'group':
          type = "群聊"
          break
        case 'mucmsgs':
          type = "群聊记录"
          break
        case 'shikuMsgs':
          type = "单聊记录"
          break
        case 'nofriend':
          type = "不是朋友"
          break
        default:
          break
      }
      return type
    },
    transform(item){
      let infor = JSON.parse(item)
      return infor.toUserName
    },
    transformAvatar(item){
      let infor = JSON.parse(item).toUserId
      return this.IdFriendList[infor].headImg ? this.IdFriendList[infor].headImg: ''
    },
    transformUserName(item){
      let imId = getItem('MeId')
      let infor = JSON.parse(item)
      if(infor.toUserId == imId){
        return infor.fromUserName
      }else{
        return infor.toUserName
      }
      // return this.IdFriendList[infor].headImg ? this.IdFriendList[infor].headImg: ''
    },
    matching(val, item){
      let returnVal=''
      let searchLength = this.SearchData.length
      let searchDataUpper = this.SearchData.toUpperCase()
      // 首字母模糊搜索
      let friendEnglishName = this.searchKey === 'friend' && (item.englishName || item.toFirstBig) // 朋友私聊 && 未添加好友的名字
      let groupFirstBig = this.searchKey === 'group' && item.toFirstBig // 群聊
      if(friendEnglishName || groupFirstBig){
        let processCont = friendEnglishName ? (item.englishName || item.toFirstBig) : groupFirstBig ? item.toFirstBig : ""

        let nameIndex = processCont.indexOf(searchDataUpper)
        let searchContFront = val.substring(0, nameIndex)
        let searchCont = val.substring(nameIndex, nameIndex+searchLength)
        let searchContAfter = val.substring(nameIndex+searchLength, val.length)
        returnVal = `${searchContFront}<span style="color: #3370FF;">${searchCont}</span>${searchContAfter}`
        return returnVal
      }
      let newIndex = val.indexOf(this.SearchData)
      let matchFirst
      let matchVal = val.substring(newIndex,newIndex+this.SearchData.length)
      let matchValLast = val.substring(newIndex+this.SearchData.length,val.length)

      if(newIndex != 0 ){
        matchFirst = val.substring(0,newIndex)
        returnVal = `${matchFirst}<span style="color: #3370FF;">${matchVal}</span>${matchValLast}`
      }else{
        returnVal = `<span style="color: #3370FF;">${matchVal}</span>${matchValLast}`
      }
      if(this.searchKey === 'mucmsgs' || this.searchKey === 'shikuMsgs'){
        let str = returnVal.indexOf('<img src="data:')
          if(str == -1){
            returnVal = returnVal.replace(/<p><br\/><\/p>/mg,'')
            returnVal = returnVal.replace(/app:\/\/.\//mg,'/')
            returnVal = returnVal.replace(/<br(\/)?>/mg,'')
            return returnVal
          }else{
            return '[图片]'
          }
      }else{
        return returnVal
      }
    },
    jumpRecord(record,typeChat){
      if(record.adminFlag || record.adminFlag == false){
        this.addFriend(record)
        return
      }
      let params = {}
      let headImg = ''
      let messageType = ''
      this.$store.state.Im.Information.SearchData = ""
      this.$store.state.Im.Information.SearchChatList = {}
      console.log(record,'jumpRecord - 个人信息')
      // 跳转群聊天 - 群聊记录
      if (typeChat === "mucmsgs" || typeChat === "group") {
        let roomIdent = typeChat === "mucmsgs" ? record.room_jid : record.jid
        const room = this.JidRoomList[roomIdent]
        if (!room || !room.id) {
          this.$message.error('消息不存在')
          return
        }
        params = { id: this.JidRoomList[roomIdent].id, type: 'room', jid: roomIdent,}
      }
      // 跳转单人聊天室
      else if(typeChat === "friend" || typeChat === "shikuMsgs") {
        let id = typeChat === "friend" ? record.toUserId : record.receiver_jid
        // 判断最后一条消息是谁发送的（如果是自己则去对方ID）
        if (!id) return;

        if(this.searchKey === 'friend'){
          headImg = record.headImg
          messageType = record.toNickname === "任务助手" ? 12 : ''
        }else{
          headImg = this.transformAvatar(record.message)
          messageType = JSON.parse(record.message).toUserName === "任务助手" ? 12 : ''
        }

        params = { id, type: 'friend', jid: id, messageType, userAvatar: headImg }
      }
      this.$emit('changeChat', params)
    },
    addFriend(user){
      console.log('测试', user)

      this.GetUserInfo({ userId: user.imUserId }).then(rs => {
        console.log(rs,'this.GetUserInfo - this.GetUserInfo 001 ')
          if (rs.resultCode === 1) {
            if (rs.data.settings.allowAtt !== 0) {
              // 允许添加好友
                // 不需要验证,直接添加好友
                this.PostAddFriend({ toUserId: rs.data.userId }).then(res => {
                  console.log(res,'this.PostAddFriend - this.PostAddFriend ')
                  if (res.resultCode === 1) {
                    // const content = '你们已成为好友'
                    const content = ''
                    const sendParams = {
                      msgType: this.$msgType.PASS,
                      content,
                      toId: user.imUserId,
                      toName: user.realName,
                      chatType: this.$chatType.ChatNumber
                    }
                    const msg = sendMessage(sendParams)
                    if (msg) {
                      this.GetUserInfo({ userId: user.imUserId }).then( response => {
                        console.log(response,'this.GetUserInfo - this.GetUserInfo ')
                        if (response.resultCode === 1) {
                          this.$storage.ousinessPperations.addFriend({ message: msg, friend: response.data.friends })
                          console.log('添加成功')
                          //  /chat/:type/:id/:jid
                          // this.$router.push({
                          //   path: '/message/index',
                          //   query: {
                          //     type: 'friend',
                          //     id: user.imUserId,
                          //     jid: user.imUserId
                          //   }
                          // })
                          this.$store.state.Im.Information.SearchData = ""
                          this.$store.state.Im.Information.SearchChatList = {}
                          let params = {
                              id: user.imUserId,
                              type: 'friend',
                              jid: user.imUserId
                            }
                          this.$emit('changeChat', params)
                        }
                      })
                    }else{
                      console.error("消息未发送成功，添加失败")
                    }
                  }
                })
            } else {
              // 不允许添加好友
              this.$message.info('该用户不允许添加好友')
            }
          }
        })
    }
  },
  mounted(){
    console.log(this.searchItem,'searchItem - searchItem')
    console.log(this.searchKey,'searchKey - searchKey')
  }
}
</script>


<style lang="scss" scoped>
.img_task_group,
.img_task_assistant{
  width: 36px;
}
.head-title{
  margin-top: 12px;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 16px;
  color: #404758;
}
.search-list{
  padding-bottom: 15px;
  border-bottom: 1px solid #DCDFE6;
  &:last-child{
    padding-bottom: 0px;
    border-bottom: none;
  }
}
.search-item{
  display: flex;
  align-items: center;
  height: 52px;
  border-radius: 8px;
  padding: 0 10px;
  cursor: pointer;
}
.search-item:hover{
  
  background-color: #E9F0FF;
}
.item-cont{
  margin-left: 15px;
  color: #999;
}
.item-cont-font,
.item-cont-samll{
  width: 246px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-cont-font{
  color: #1F2329;
  font-size: 14px;
  line-height: 14px;
}
.item-cont-samll{
  margin-top: 6px;
  line-height: 14px;
  font-size: 14px;
  height: 14px;
}
</style>

