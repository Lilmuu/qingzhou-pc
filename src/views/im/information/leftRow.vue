<template>
  <el-scrollbar style="height: calc(100vh - 104px);">
    <template>
      <template v-for="(item, index) of ShowChatList">
        <item :key="'leftRow' + index"
          :data="item"
          :isActive="chatParams.jid === item.jid"
          :userAvatar='userAvatar(item)'
          @changeChat="changeChat"
          @avatarClick="$emit('avatarClick', item)"
          @click.native.prevent="handleGotoChatClick(item,index)"
          v-if="item.toUserId !== 10000"
        ></item>
      </template>
    </template>
  </el-scrollbar>
</template>

<script>
  import Item from './item'
  import searchList from './searchItem'
  import { mapGetters, mapActions, mapState } from 'vuex'
  import { messageTopSort } from "@/utils";
  import { getUpdateMessage } from "@/api/im";
  import { getItem } from '@/utils/imUtil/storage'

  export default {
    name: "leftRow",
    props: {
      params: {
        type: Object,
        /*
        * id: '',
          type: 'friend',   // [room, friend]
          jid: ''           // 群jid / 好友id
        * */
      },
    },
    data () {
      return {
        ShowChatList: [], // 要渲染的群列表数据
        chatParams: {
          id: '',
          type: 'friend',   // [room, friend]
          jid: ''           // 群jid / 好友id
        },
      }
    },
    components: {
      Item,
      searchList,
      // NewFriend
    },
    computed: {
      ...mapState({
        // TopChatList: state => state.Im.Information.TopChatList,// 置顶消息列表
        'backEndNewMessage': state => state.Im.Information.backEndNewMessage,
        'FriendList': state => state.Im.Friends.FriendList,
        'onlyOnce': state => state.Im.Information.onlyOnce,
        'NewMessageNumberList':  state => state.Im.Information.NewMessageNumberList,
        'CurrentPersonnel': state => state.Im.Information.CurrentPersonnel,
      }),
      ...mapGetters({
        ChatList: 'Im/Information/ChatList', // 聊天列表
        'JidRoomList': 'Im/Room/JidRoomList',
        // SearchList: 'Im/Information/SearchList', // 聊天列表
      }),
      // 搜索人名、群名、和消息记录
      SearchChatList(){
        let searchshat = this.$store.state.Im.Information.SearchChatList
        if(searchshat.nofriend != undefined){
          searchshat['friend'].push(...searchshat.nofriend)
          delete searchshat.nofriend
        }
        let newArrKey = Object.keys(searchshat)
        let newArr = []
        for( let item in newArrKey){
          let e = newArrKey[item]
          let newObj = {}
          if (searchshat[e].length != 0) {
            newObj[e] = searchshat[e]
            if(e === 'group'){
              newArr.splice(1,0,newObj)
            }else{
              newArr.push(newObj)
            }
          }
        }
        return newArr
      },
      // 置顶消息列表
      TopChatList(){
        return this.$store.state.Im.Information.TopChatList
      },
      userAvatar(){
        return (userInfo)=>{
          if(userInfo.isRoom != 1){
            let imId = getItem('MeId')
            let fromUser = userInfo.to == imId ? userInfo.jid : userInfo.toUserId
            let user = this.FriendList.find(item=>{
              return item.toUserId == fromUser
            })
            return user.headImg
          }else{
            return ''
          }
        }
      },
    },
    async mounted() {
      await this.GetLastChatList()
      if(this.params.id) {
        this.chatParams = this.params

      }
      let keysArr = Object.keys(this.CurrentPersonnel)
      if(keysArr.length > 0){
        this.handleGotoChatClick(this.CurrentPersonnel)
      }
    },
    methods: {
      ...mapActions({
        'GetLastChatList': 'Im/Information/GetLastChatList', // [GET] 获取聊天列表
        'ConsoleSystemMessage': 'Im/Chat/ConsoleSystemMessage', // 处理已读消息
      }),
      // 获取列表的key
      handleItemKey (item) {
        let key = item.jid
        if (!key) {
          if (item.isRoom) {
            key = item.jid
          } else {
            if (parseInt(item.toUserId) !== this.MeId) {
              key = item.toUserId
            } else if (parseInt(item.fromUserId) !== this.MeId) {
              key = item.fromUserId
            } else {
              key = item.jid
            }
          }
        }
        return key
      },
      // 更改
      changeChat(params) {
        console.log(params,'hehe - 点击私聊')
        this.chatParams = params
        this.$emit('changeChat', params)
      },
      getSearchItemArr(obj){
        let key = Object.keys(obj)[0]
        return key
      },
      NewMessageSet(list=[],del){
        let obj = {}
        let userId = window.localStorage.getItem('USERID')
        let newMessage = list.filter(e=>{
          return e.newMessageNumber>0 && e.jid != del
        })
        for(let item in newMessage){
          if (newMessage[item].jid) {
            obj[newMessage[item].jid] = newMessage[item].newMessageNumber
          }
        }
        console.log(newMessage,'新消息保存到后端///')
        // if(newMessage.length > 0){
          let newObj = {
            'zebreUserId': userId,
            'newMessageList':JSON.stringify(obj)
          }
          getUpdateMessage(newObj)
        // }
      },
      // 切换聊天列表
      handleGotoChatClick (item, index) {
        console.log(item, index,'切换聊天列表 ----------- 切换聊天列表' )
        // 清除后端存的未读消息数据
        if(this.backEndNewMessage && (this.backEndNewMessage[item.jid] || this.NewMessageNumberList[item.jid])){
          let newBackEnd = JSON.parse(JSON.stringify(this.backEndNewMessage))
          newBackEnd[item.jid] = 0
          this.$store.commit('Im/Information/SET_BACK_END_NEWMESSAGE',newBackEnd)
          this.NewMessageSet(this.ChatList,item.jid)
          let newObj = {
            seeMessageUserId: item.jid,
            seeEquipment: 'app'
          }
          let imId = getItem('MeId')
          let params = {
            type: 10086,
            body: JSON.stringify(newObj),
            toUserId: imId,
          }
          this.ConsoleSystemMessage(params)
        }
        this.$storage.newMessageNumber.deleteId(item.jid) // 清除新消息
        this.$storage.notShownMessage.deleteJid(item.jid) // 删除收到但为显示的消息
        // 跳转群聊天
        if (item.isRoom || item.chatType === 2) {
          const room = this.JidRoomList[item.jid]
          if (!room || !room.id) {
            this.$message.error('消息不存在')
            return
          }
          const params = { 
            id:this.JidRoomList[item.jid].id, 
            type:'room', jid:item.jid, 
            userAvatar:this.userAvatar(item),
            messageType: (item.type == 12 || item.toUserName == '任务助手') ? 12 : ''
          }
          this.changeChat(params)
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
            type:'friend', 
            jid:id, 
            userAvatar:this.userAvatar(item),
            messageType: (item.type == 12 || item.toUserName == '任务助手') ? 12 : ''
          }
          this.changeChat(params)
        }
        let keysArr = Object.keys(this.CurrentPersonnel)
        if(keysArr.length > 0){
          this.$store.commit('Im/Information/SET_CURRENT_PERSONNEL',{})
        }
      },
      // 消息列表
      chatListChange(newValue){
        const TopChatList = this.TopChatList
        // 除去系统管理员
        let newList = newValue.filter(item => item.jid != 1000)
        let ShowChatList = newList.slice(0, newList.length + 1)
        this.ShowChatList = messageTopSort(TopChatList, ShowChatList)
        console.log(this.ShowChatList,TopChatList, ShowChatList,'ShowChatList - 对话列表变更')
      },
    },
    watch: {
      ChatList (newVal, oldVal) {
        this.chatListChange(newVal)
      },
      params(newVal) {
        this.chatParams = newVal
      },
      CurrentPersonnel:{
        handler(newVal, oldVal){
          if(newVal.to){
            this.handleGotoChatClick(newVal)
          }
        },
        deep: true,
      }
    },
    beforeDestroy(){
      this.ShowChatList = []
    }
  }
</script>

<style scoped>
.search_box{
  padding: 12px 10px;
  border: 1px solid #DEE0E3;
  border-radius: 10px;
}
</style>
