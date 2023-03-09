<!--
 * @Author: your name
 * @Date: 2021-10-18 17:47:06
 * @LastEditTime: 2022-06-02 18:59:40
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 消息 - 导航栏
 * @FilePath: \task-pc-ui\src\views\im\imLayout.vue
-->
<template>
  <div id="im-view" class="main-view-container">
    <div class="left-container">
      <div class="im-left-row flex-center ">
        <el-input placeholder="搜索"
          prefix-icon="el-icon-search"
          @input="searchList"
          v-model="search"
          clearable>
            <img slot="prefix" src="@/assets/icon/icon_leftbar_search.png" class="search_icon" />
        </el-input>
        <div class="circle-plus" @click="handleAddGroup">
          <img src="@/assets/icon/icon_leftbar_plus.png"  alt="" />
        </div>

        <div v-if="SearchData != ''" class="search_box">
          <div class="content" v-if="SearchList.length !== 0">
            <template v-for="(searchItem, searchIndex) of SearchList">
              <search-list
                :key="'searchItem'+searchIndex"
                :searchItem='searchItem'
                :searchKey='getSearchItemArr(searchItem)'
                @changeChat="changeChat"/>
            </template>
          </div>
          <div v-else class="searchEmptyBox">
              <img src="@/assets/img/default-ico/d-noSearch.png" alt="">
              <div class="tips">未搜索到相关消息，请重新输入</div>
          </div>
        </div>

      </div>
      <div class="menu-outer">
        <LeftRow @changeChat="changeChat" :params="chatParams"></LeftRow>
      </div>
    </div>
    <div class="right-container flex-center flex-column" v-if="chatParams.jid === ''">
       <img src="@/assets/img/im/img_no_message.png" class="noMessageIcon" alt="">
        <p class="empy-words">暂无消息</p>
    </div>
    <!-- 路由  -->
    <div class="right-container" v-else>
      <ImRoom :params="chatParams" :key="chatParams.jid"></ImRoom>
    </div>
    <!-- 创建部门群 -->
    <el-dialog  append-to-body
      :visible.sync='groupDialog'
      custom-class="select_user_box"
      id="addNewTaskNew"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
      >
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">新建群聊</span>
      </div>
      <selectPeople
        ref="eDialog"
        moduleMode="group"
        addType="createGroupChat"
        :chatParams='chatParams'
        @selectUserSuccess="selectSuccess"
        @selectCancel="selectCancel">
      </selectPeople>
    </el-dialog>
  </div>
</template>

<script>
import ImRoom from "@/views/im/imRoom"
import LeftRow from "@/views/im/information/leftRow";
import Avatar from "@/components/Avatar/Avatar"
import { mapState, mapActions, mapGetters } from "vuex";
import { setWindowIMRouterParams } from "@/utils/imUtil/primary";
import SelectGroupUsers from "@/views/im/components/groupUsers/selectGroupUsers";
import EventBus from "@/eventBus";
import WEBIM from "@/xmpp/webim-reset";
import { pageOption } from "@/const/dicData";
import * as api from '@/api/task'
import { getMessage } from "@/api/im";

import { PCFirstLogin } from '@/api/user'
import { getItem } from '@/utils/imUtil/storage'
import selectPeople from "@/views/myTodo/components/selectPeople";
import searchList from '@/views/im/information/searchItem'
import store from "@/store";

export default {
  name: "imLayout",
  components: {
    ImRoom,
    selectPeople,
    LeftRow,
    searchList
  },
  data() {
    return {
      search: '',
      groupDialog: false,
      chatParams: {
        id: '',           // roomId
        type: 'friend',   // [room, friend]
        jid: '',           // 群jid / 好友id
        headImage:'',
        fromUserName: '', // 消息对象名字
      }
    }
  },
  async mounted() {
    await this.$store.dispatch('Common/User/GetServeConfig')
    await this.$store.dispatch('WSINIT')
    const isConnect = WEBIM.isConnect()
    console.log(isConnect,'socket是否断开')
    if (!isConnect) {
      await this.$store.dispatch('InitIMConfig')
    }
    let routerFromPath =  window.localStorage.getItem("routerFromPath")
    if(routerFromPath === '/login'){
      console.log('首次登录-初始化-开始 [imLayout.vue]')
      sessionStorage.setItem('codeLogin', false)
      await this.initIM()
      await WEBIM.initWebIM() // 初始化数据
        // 登录im
      await WEBIM.loginIM(async () => {
        // 同步数据
        await store.dispatch('Im/Information/GetTigaseDialog', { type: 'xmpp' })
        await store.dispatch('Im/Friends/GetFriendsList', { type: 'xmpp' })
        await store.dispatch('Im/Room/GetRoomList', { type: 'xmpp' })
        await store.dispatch('Im/Information/GetLastChatList', { type: 'xmpp' })
      })
      console.log('首次登录 - 初始化IM - 完成')
      let userId = window.localStorage.getItem('USERID')

      getMessage(userId)

      // 首次登录
      let imId = getItem('MeId')
      PCFirstLogin(imId)
    }
    this.searchList()
    // 处理跳转过来的参数
    const initRouterQuery = this.$route.query
    console.log(this.$route,'this.$route')
    console.log(this.$route.query,'this.$route.query')
    if(initRouterQuery.id && initRouterQuery.jid) {
      this.changeChat(initRouterQuery)
    }
    // 处理重置路由，删除某个消息等操作
    EventBus.$on('resetIMRoute', () => {
      const nullChatParams = {
        id: '',
        type: 'friend',
        jid: '',
        headImage:''
      }
      this.changeChat(nullChatParams)
      // this.initIM()
    })

    this.getList()
    console.log(this.chatParams)
  },
  computed: {
    ...mapState({
      im: state => state.im,
      FriendList: state => state.friends.FriendList,
      LastChatList: state => state.Im.Information.LastChatList,
      TopChatList: state => state.Im.Information.TopChatList,
    }),
    ...mapGetters({
      IdFriendList: 'Im/Friends/IdFriendList', // id做为key的群组列表
      JidRoomList: 'Im/Room/JidRoomList' // jid做为key的群组列表
    }),
    SearchData(){
      return this.$store.state.Im.Information.SearchData
    },
    SearchList(){
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
  },
  watch:{
    SearchData(val){
      if(val === "" ){
        this.search = ""
      }
    },
    // search(){
    //   this.searchList()
    // }
  },
  methods: {
    ...mapActions({
      'GetMeInfo': 'Common/User/GetMeInfo',
      'GetTigaseDialog': 'Im/Information/GetTigaseDialog', // [get] 获取置顶消息列表
      'GetFriendsList': 'Im/Friends/GetFriendsList',
      'GetRoomList': 'Im/Room/GetRoomList',
      'GetLastChatList': 'Im/Information/GetLastChatList',
      'SearchChatList': 'Im/Information/SearchChatList', // [get] 搜索人名、群名、和消息记录
    }),
    async initIM() {
      console.log("login --- GetLastChatList")
      // 获取我的信息
      await this.GetMeInfo() // /user/get 接口
      // 同步数据
      await this.GetTigaseDialog({ type: 'login' })
      await this.GetFriendsList({ type: 'login' })
      await this.GetRoomList({ type: 'login' })
      await this.GetLastChatList({ type: 'login' })
    },
    changeChat(params) {
      setWindowIMRouterParams(params)
      this.chatParams = params
      this.getUserName()
    },
    getSearchItemArr(obj){
      let key = Object.keys(obj)[0]
      return key
    },
    handleAdd() {
      // 重置router
      EventBus.$emit('resetIMRoute')
    },
    handleAddGroup() {
      this.groupDialog = true;
      this.$nextTick(()=>{
        this.$refs.eDialog.initData();
      })
    },
    getUserName(){
      if (this.chatParams.type === 'friend' && JSON.stringify(this.IdFriendList) !== '{}') {
        this.chatParams.fromUserName = this.IdFriendList[this.chatParams.id].toNickname
      }
    },
    // 成功 TODO: 刷新
    selectSuccess() {
      this.groupDialog = false
    },
    selectCancel() {
      this.groupDialog = false
    },
    searchList(){
      this.SearchChatList({content:this.search})
    },
    getList(page) {
      page = page || JSON.parse(JSON.stringify(pageOption))
      const query = {
        userId: this.$store.state.user.userId,
        state: 1,
        page: page.currentPage,
        pageNo: page.currentPage,
        pageSize: page.pageSize,
        orderByDesc: 'b.update_time desc'
      }
      api.myPending(query)
        .then(res => {
          if (res.data.code === 200) {
            let unreadList = []
            const { unreadCount } = res.data.data
            if (unreadCount > 0) {
              for(let i in res.data.data.taskName){
                unreadList.push({
                  taskName: res.data.data.taskName[i],
                  id: 2,
                })
              }
              this.$store.dispatch('SetUnreadCount', unreadCount)
              this.$electron.ipcRenderer.send('show-notice')
            } else {
              this.$store.dispatch('SetUnreadCount', 0)
              this.$electron.ipcRenderer.send('hide-notice')
            }
            this.$store.dispatch('SetUnreadList', unreadList)
          }
        }).finally(() => {
        this.fetchLoaded = true
      })
    },

    //  关闭新建弹窗
    handleCloseDialog() {
      this.$refs.eDialog.clearAllData();
    },
  }
}
</script>

<style lang="scss" scoped>
::v-deep #im-view .im-left-row .el-input__inner{
  &:hover{
    border: 1px solid #84A8FE;
  }
}
.menu-outer {
  padding-bottom: 20px;
}
.main-view-container {
  display: flex;
  .left-container {
    width: 360px;
    position: relative;
    background: #FFFFFF;
    height: calc(100vh - 42px);
    padding-top: 15px;

  }

  .right-container {
    width: calc(100% - 360px);
    background: #FBFBFC;
  }
  .el-menu-item-li {
    display: flex;
    align-items: center;
    padding-left: 15px;
    color: #222222;
    .menu-text {
      margin-left: 20px;
      margin-right: 20px;
    }
    .menu-item-active {
      display: flex;
      align-items: center;
    }
  }
  .el-menu-item-li_active {
    background: #EEEEEE;
    color: #3471FF;
  }
}

.search_box{
  position: absolute;
  top: 50px;
  left: 10px;
  z-index: 99;
  padding: 10px 2px 4px 10px;;
  border-radius: 10px;
  background-color: #FFFFFF;
  border: 1px solid #DEE0E3;
  box-sizing: border-box;
  width: 350px;
  min-height: 280px;
  .content{
    padding-right: 4px;
    height: calc(100vh - 200px);
    overflow: scroll;
    &::-webkit-scrollbar{
      width: 3px;
    }
  }
  .searchEmptyBox{
    img{
      margin: 60px auto 0;
      width: 120px;
      display: block;
    }
    .tips{
      margin-top: 20px;
      font-size: 14px;
      color: #8F959E;
      text-align: center;
    }
  }
}
</style>
