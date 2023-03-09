<!--
 * @Author: 罗兴
 * @LastEditors: youshijun 1046422605@qq.com
 * @Date: 2021-08-27 08:59:47
 * @LastEditTime: 2022-05-09 18:14:02
 * @FilePath: \task-pc-ui\src\views\unread\unread.vue
 * @Description: 任务栏未读消息
-->
<template>
  <div class="tasdbarDiv">
    <div class="taskbarHead">
      <span>新消息（{{ unreadListDat.total }}）</span>
    </div>
    <div class="taskbarCont">
      <div v-for="(item, index) in unreadListDat.Arr" :key="index" class="taskbarMsg" @click="test(item)">
        <img v-if="item.userAvatar === 'isRoom'" src="@/assets/img/contact/group_img.png" alt="群聊头像">
        <img v-else-if="item.userAvatar === 'RWZS' || item.taskName" src="@/assets/img/contact/task_assistant.png" alt="任务助手">
        <HeadAvatar 
          v-else
          :size="32" 
          :fontSize='12'
          :avatarUrl="item.userAvatar" 
          :username="item.toNickName"
          >
        </HeadAvatar>
        <div v-if="item.taskName" class="task_item">待处理任务：{{ item.taskName.name }}</div>
        <div class="pop_message" v-else>
          <span class="name" v-if="item.userAvatar === 'isRoom'">{{ item.toNickName }}</span>
          <span class="name" v-else-if="item.userAvatar === 'RWZS'">任务助手</span>
          <span class="name" v-else>{{ getWho(item) }}</span>
          <span class="red_dot">{{ item.newMessageNumber }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import HeadAvatar from "@/components/headAvatar"
  export default {
    components: {HeadAvatar},
    props: {},
    data() {
      return {
        change: false,
        titleImgUrl: require("@/assets/img/task/taskbarTieltImg.png"),
        taskAssistant: require("@/assets/img/contact/task_assistant.png"),
        roomAvatar: require("@/assets/img/contact/group_img.png"),
        unreadListDat: [],
        totalMessage: '99+',
      };
    },
    mounted() {
      // this.$electron.ipcRenderer.on('loadUnread', (event, url) => {
      //   conosle.log(123)
      // })
      window.document.title = "轻舟未读消息列表"
      this.$electron.ipcRenderer.on('getUnreadList',(event, data)=>{
        console.log("-----未读消息-----",data)
        this.unreadListDat = data
      })
    },
    methods: {
      test(item) {
        let fullPath =  window.localStorage.getItem("routerFullPath")
        item['fullPath'] = fullPath
        this.$electron.ipcRenderer.send('test-click-msg',item)
      },
      getWho(user){
        let who = window.localStorage.getItem('SKIM_MeInfo')
        let whoItem = JSON.parse(who)
        return whoItem.data.userId == user.fromUserId ? user.toNickName : user.fromUserName
      }
    },
    watch:{}
  };
</script>
<style lang="scss" scoped>
.tasdbarDiv {
  background: #FFFFFF;
  user-select: none;
  position: absolute;
  height: 100vh;
  z-index: 3000;
  .taskbarHead {
    display: flex;
    align-items: center;
    height: 48px;
    padding-left: 20px;
    font-size: 16px;
    color: #404758;
    font-family: "SourceHanSansCN-Medium";
  }

  .taskbarMsg {
    display: flex;
    align-items: center;
    margin: auto 0;
    padding: 0 10px;
    height: 48px;
    cursor: pointer;
    &:hover {
      background-color: #F5F6F7;
    }
    img {
      width: 32px;
      vertical-align:middle;
    }
    .task_item,.pop_message{
      width: 200px;
      padding-left: 14px;
      font-size: 14px;
      color: #1F2329;
      line-height: 22px;
      font-family: "SourceHanSansCN-Normal";
    }
    .task_item{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .pop_message{
      display: flex;
      align-items: center;
      justify-content: space-between;
      .name{
        font-size: 14px;
        color: #1F2329;
        max-width: 156px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .red_dot{
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: red;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
        color: #FFF;
      }
    }
  }
  .taskbarMsg:hover{
    border-radius: 4px;
    background-color: #F5F6F7;
  }
  .taskbarCont{
    padding: 0 10px;
    max-height: 240px;
    overflow-x: hidden;
    overflow-y: scroll;
    
  }
  // .taskbarCont::-webkit-scrollbar {display:none}
}

// 新加的样式
.tray-tit {
  font-size: 16px;
  color: #404758;
}
</style>
