<!--
 * @Author: your name
 * @Date: 2021-09-22 17:47:20
 * @LastEditTime: 2022-04-28 16:30:45
 * @LastEditors: Please set LastEditors
 * @Description: 通讯录  - 导航栏
 * @FilePath: \task-pc-ui\src\views\contact\contactLayout.vue
-->

<template>
  <div class="main-view-container contact-view">
    <div class="left-container contact_mode">
      <div class="task_title">通讯录</div>
      <el-scrollbar
        class="select-left-list mail-select-list-collapse noScroll"
        style="overflow: hidden; height: calc(100% - 100px)">
        <li @click="setActiveRouter('myGroup', '我的群聊')"
            role="menuitem"
            tabindex="-1"
            :class="['el-menu-item el-menu-item-li', activeName === 'myGroup' ? 'el-menu-item-li_active menu_item_border_active' : 'menu_item_border' ]"
            style="margin-bottom:2px;">
          <div :class="['flex-center', 'menu-item-row', activeName === 'myGroup' ? 'menu-item-active' : '']">
            <span :class="{'menu_item_icon_container flex-center': true, 'menu_item_icon_container_active':activeName === 'myGroup'}">
              <img v-show="activeName === 'myGroup'" src="@/assets/img/contact/message_sel.png">
              <img v-show="activeName !== 'myGroup'" src="@/assets/img/contact/message_no.png">
            </span>
            <span class="menu-text">我的群聊</span>
          </div>
        </li>
        <li @click="setActiveRouter('depGroup', depGroup.name)"
            role="menuitem"
            tabindex="-1"
            :class="['el-menu-item el-menu-item-li', activeName === 'depGroup' ? 'el-menu-item-li_active menu_item_border_active' : 'menu_item_border' ]">
          <div :class="['flex-center', 'menu-item-row', activeName === 'depGroup' ? 'menu-item-active' : '']">
            <span :class="{'menu_item_icon_container flex-center':true, 'menu_item_icon_container_active':activeName === 'depGroup'}">
              <img v-show="activeName === 'depGroup'" src="@/assets/img/contact/grouplogo_sel.png">
              <img v-show="activeName !== 'depGroup'" src="@/assets/img/contact/grouplogo_no.png">
            </span>
            <span class="menu-text">{{ depGroup.name }}</span>
          </div>
        </li>
        <el-collapse-transition>
          <div v-show="activeName === 'depGroup' && showDeepCollapse" style="width: 183px">
            <!-- <menuTree
              ref="menuTree"
              :treeList="depGroup.childList"
              @handleGetDeptPage="handleGetDeptPage"
              @handleConfirmDepDialog="handleConfirmDepDialog"
            ></menuTree> -->
          </div>
        </el-collapse-transition>
      </el-scrollbar>
    </div>
    <div class="right-container">
      <div class="top-label">
        <div class="top_nav">
          <img v-show="activeName == 'myGroup'" src="@/assets/img/contact/message_no.png">
          <img v-show="activeName == 'depGroup'" src="@/assets/img/contact/grouplogo_no.png">
          <span class="label-text">{{ routerTitle }}</span>
        </div>
      </div>
      <!-- 我的群  -->
      <el-scrollbar class="c-userList noScroll">
        <template v-if="RoomList.length && activeName === 'myGroup'">
          <div v-for="(group, index) in RoomList" :key="'group' + index" @click="handleGoToGroup(group)" class="c-userItem cursor">
            <img v-show="activeName == 'myGroup'" src="@/assets/img/contact/group_img.png">
            <div class="c-userName">
              <div>{{ group.name }}</div>
              <div class="group-count">
                <img src="@/assets/img/contact/group_pople.png" alt="">
                <span>{{ group.userSize }}人</span>
              </div>
            </div>
          </div>
        </template>
        <!--  企业/部门  -->
        <template v-else-if="depGroup.childList.length && activeName ==='depGroup'">
          <menuTree
            ref="menuTree"
            :treeList="depGroup.childList"
            :newArr='[]'
            @handleGetDeptPage="handleGetDeptPage"
            @openUserInfoBox="openUserInfoBox"
            @handleConfirmDepDialog="handleConfirmDepDialog"
            ></menuTree>
        </template>
       <div v-else-if="RoomList.length ==0 && activeName ==='myGroup'" class="contactEmptyContainer">
         <img src="@/assets/img/default-ico/d-noContacter.png" class="emptyCImg" alt="">
         <div class="emptyCText">暂无联系人</div>
       </div>
       <!-- <div v-else-if="depGroup.childList.length==0 && activeName ==='depGroup'" class="contactEmptyContainer">
         <img src="@/assets/img/default-ico/d-noContacter.png" class="emptyCImg" alt="">
         <div class="emptyCText">暂无联系人</div>
       </div> -->
      </el-scrollbar>
    </div>

    <el-dialog
      :visible.sync="userInfoBox"
      width="400px"

      custom-class="userCardPopover">
      <!-- :modal='false' -->
      <div class="card-content">
        <div class="card-header">
          <img src="@/assets/img/contact/usercardbg.png" class="card-header-img" alt="">
          <div class="tit">
            <headAvatar
              :size="72"
              :fontSize='20'
              :borderWidth='2'
              :avatarUrl="userInfoData.headImage ? userInfoData.headImage: ''"
              :username='userInfoData.nickName || userInfoData.realName'>
            </headAvatar>
            <div>{{ userInfoData.nickName || userInfoData.realName }}</div>
          </div>
        </div>
        <div class="cot">
          <div class="email cursor" @click="handleGoToWriteMail(userInfoData.email)">邮箱<span>{{ userInfoData.email || '无' }}</span></div>
          <el-button type="primary" class="card-send-message-btn cursor" @click="handleToUserMessage(userInfoData)">发消息</el-button>
          <!-- <el-button class="card-call-phone-btn cursor" @click="handleCall(userInfoData)" >语音通话</el-button> -->
          <!-- disabled -->
        </div>
      </div>
    </el-dialog>

    <cencelOrClose
      ref="deptDialog"
      defineName='确定'
      :closeHeader='true'
      @define='handleDept'
    >
      <p slot="tipsOne"> 确定要发起部门群聊吗？</p>
    </cencelOrClose>

  </div>
</template>

<script>
  import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
  import cencelOrClose from "@/components/cencelOrClose"
  import { sendMessage } from '@/xmpp/send-message'
  import { getDeptTree, getUserByDeptId } from "@/api/dept";
  import headAvatar from "@/components/headAvatar"
  import { addGroupChat, voiceAsk } from "@/api/im";
  import { getIMUserInfo } from "@/api/user";
  import menuTree from './menuTree'
  import {getBusyUser} from "../../api/im";

  const myRealName = localStorage.getItem('USERNAME')
  let USERNAME = ''

  const messageActiveIcon = require('@/assets/img/contact/message_active.png')

  export default {
    name: "contactLayout",
    components: { headAvatar, menuTree, cencelOrClose },
    data() {
      return {
        userInfoBox: false,
        userInfoData:{},
        search: "",
        activeName: "", // [myGroup, 我的群， depGroup, 部门成员列表]
        // 部门列表
        depGroup: {
          childList: []
        },
        users: [],
        // bar 标题
        routerTitle: '',
        showDeepCollapse: false,
        firmDepId: '', // 发起原来部门ID
        contactViewBox: null, // 通讯录窗口
        arr: [{aa:1,bb:2},[{aa:3,bb:4},{aa:5,bb:6}],{aa:7,bb:8}],
        dialogOpenStatus:false
      };
    },
    computed: {
      ...mapState({
        MeId: state => state.Common.User.MeId,
        FriendList: state => state.Im.Friends.FriendList,
        NewFriendList: state => state.Im.Friends.NewFriendList, // 新朋友列表
        RoomList: state => state.Im.Room.RoomList, // 群列表
        XMLConstant: state => state.Common.Xml.XMLConstant,
        userId: state => state.user.userId,
      }),
      ...mapGetters({
        'IdFriendList': 'Im/Friends/IdFriendList', // 我的好友列表
      }),
    },
    async mounted() {
      this.handleGetDeptTree();
      this.setActiveRouter('myGroup', '我的群聊')
      await this.GetRoomList({ type: 'login' })
      this.contactViewBox = document.querySelector('.contact-view')
      this.contactViewBox.addEventListener('click',()=>{
        this.$store.commit('SET_CONTACTSHOWTIP', '')
      })
    },
    methods: {
      ...mapActions({
        GetXML: 'Common/Xml/GetXML', // [GET] 获取XML
        GetRoomList: 'Im/Room/GetRoomList', // [GET] 获取群列表
        GetUserInfo: 'Common/User/GetUserInfo', // [GET] 获取用户信息
        GetBlackList: 'Im/Friends/GetBlackList', // [GET] 获取黑名单列表
        PostAddBlackList: 'Im/Friends/PostAddBlackList', // [POST] 添加黑名单
        PostRemoveBlackList: 'Im/Friends/PostRemoveBlackList', // [POST] 移除黑名单
        PostAddFriend: 'Im/Friends/PostAddFriend', // [POST] 添加好友
        PostDeleteFriend: 'Im/Friends/PostDeleteFriend' // [POST] 删除好友
      }),
      ...mapMutations({
        RESET_NEW_FRIEND_LIST: 'Im/Friends/RESET_NEW_FRIEND_LIST', // [RESET] 重置新朋友列表
        ADD_FRIEND_LIST: 'Im/Friends/ADD_FRIEND_LIST' // [ADD] 添加朋友
      }),
      // 是否已经是好友关系
      IsFriend(id) {
        if (!id) return false
        // IdFriendList 是个对象，id 为 key
        return this.IdFriendList.hasOwnProperty(id)
      },
      closeAll() {
        console.log(this.RoomList)
      },
      // 点击写邮件
      handleGoToWriteMail(email) {
        if (!email) return
        this.$router.push({ path: '/mail/index', query: { initMail: email, action: 'initWriteMail' } })
      },
      // 给某个人发消息 friend
      async handleToUserMessage(user) {
        // 无法给自己发消息
        console.log(user,'<< ---- 发消息的对象')
        if (String(user.id) === String(this.MeId)) {
          this.$message.info('无法给自己发送消息')
          return
        }
        // 获取im id
        const imUser = await getIMUserInfo(user.id)
        console.log('imUser', imUser)
        // id 重新赋值
        user.id = imUser.data.data
        // 已经是好友了,直接发消息
        if(this.IsFriend(user.id)) {
          this.$router.push({
            path: '/message/index',
            query: { type:'friend', id: user.id, jid: user.id, userAvatar: user.headImage}
          })
          return
        }
      },
      beforeCall(user) {
        USERNAME = `pc-` + String(new Date().getTime()) + '-' + myRealName
        getBusyUser({ids: [this.userId]}).then(res => {
          if (res.data && res.data.code == 0) {
            const arr = [...res.data.data]
            if (arr.length > 0) {
              this.$message.warning('您正在通话中，请稍后再试！')
            } else {
              this.handleCall(user)
            }
          }
        })
      },
      // 给某人打电话
      handleCall(user) {
        const preVal = process.env.VUE_APP_IM_CHATROOM
        // return
        const id = Number(user.id)
        // const id = Number(user.imUserId)
        const data = {
          ids: [user.id],
          roomName: `${preVal}callRoom-${ USERNAME }`,
          type: 'friend',
          from: 'pc'
        }
        if (String(this.MeId) === String(user.imUserId)) {
          this.$message.error('无法给自己通话')
          return;
        }
        voiceAsk(data).then(res => {
          if (res.data.code === 200) {
            if (res.data.data.length > 0 && res.data.data[0].type == 1) {
              this.$message.error('对方不在线！')
              return
            }
            if (res.data.data.length > 0 && res.data.data[0].type == 0) {
              this.$message.error('对方正在忙线中，请稍后再拨！')
              return
            }
            const roomActionData = {
              creatType: 'create',
              roomId: `${preVal}callRoom-${ USERNAME }`,
              trigger: user.realName,
              triggerId: [user.id],
              type: 'friend'
            }
            const roomActionDataStr = JSON.stringify(roomActionData)
            localStorage.setItem('roomActionData', roomActionDataStr)
            this.$electron.ipcRenderer.send('create-call-window', roomActionDataStr)
          }
        })
      },
      // 点击群
      handleGoToGroup(group) {
        this.$router.push({
          path: '/message/index',
          query: {
            type: 'room',
            id: group.id,
            jid: group.jid
          }
        })
      },
      // 点击路由
      setActiveRouter(router, title) {
        this.routerTitle = title
        this.activeName = router
        if(router === 'depGroup') {
          this.showDeepCollapse = !this.showDeepCollapse
          this.handleClearTip()
        } else {
          this.showDeepCollapse = false
        }
      },
      // 获取公司分组
      handleGetDeptTree() {
        // 公司分组
        getDeptTree().then((res) => {
          if (res.data.code === 200) {
            let lists = res.data.data[0]
            lists.childList.forEach((item) => {
              item.showTip = false
            });
            this.depGroup = lists
            this.$store.commit('SET_DEPGROUPLIST', lists.childList)
            console.log(this.depGroup,'this.depGroup - this.depGroup')
          }
        });
      },

      handleGetDeptPage(depInfo) {
        console.log(depInfo,'deptId -- deptId')
        this.setHideDeptTip(this.depGroup.childList)
        this.$store.commit('SET_CONTACTSHOWTIP', '')
        let isExist = false
        switch ( depInfo.length ) {
          case 2:
            isExist = this.depGroup.childList[depInfo[1]].childList
            break;
          case 3:
            isExist = this.depGroup.childList[depInfo[1]].childList[depInfo[2]].childList
            break;
          case 4:
            isExist = this.depGroup.childList[depInfo[1]].childList[depInfo[2]].childList[depInfo[3]].childList
            break;
          default:
        }
        if(!isExist){
          getUserByDeptId({ deptId: depInfo[0] }).then((res) => {
            if (res.data.code === 200) {
              const lists = res.data.data;
              lists.forEach((item) => {
                item.username = item.realName;
              });
              this.users = lists;
              switch ( depInfo.length ) {
                case 2:
                  if(!this.depGroup.childList[depInfo[1]].childList){
                    this.$set(this.depGroup.childList[depInfo[1]],['childList'],lists)
                  }
                  break;
                case 3:
                  if(!this.depGroup.childList[depInfo[1]].childList[depInfo[2]].childList){
                    this.$set(this.depGroup.childList[depInfo[1]]['childList'][depInfo[2]],['childList'],lists)
                  }
                  break;
                case 4:
                  if(!this.depGroup.childList[depInfo[1]].childList[depInfo[2]].childList[depInfo[3]].childList){
                    this.$set(this.depGroup.childList[depInfo[1]]['childList'][depInfo[2]]['childList'][depInfo[3]],lists)
                  }
                  break;
                default:
              }
            }
          });
        }
      },
      // 点击折叠
      changeCollage(group) {
        this.routerTitle = group.name
        this.activeName = 'depGroup'
        console.log(group)
      },
      setHideDeptTip(list){
        list.forEach((item,index)=>{
          if(item.childList){
           item.childList =  this.setHideDeptTip(item.childList)
          }
          item.showTip = false
        })
        return list
      },
      setShowDeptTip(list,deepId){
        list.forEach((item,index)=>{
          if(item.childList){
           item.childList =  this.setShowDeptTip(item.childList,deepId)
          }
          if(item.id==deepId){
            item.showTip = true
          }
        })
        return list
      },
      getShowDeptTip(list,deepId){
        let arr = []
        list.forEach((item,index)=>{
          if(item.childList){
           arr.push(...this.getShowDeptTip(item.childList,deepId))
          }
          if(item.id==deepId && item.showTip){
            arr.push(item)
          }
        })
        return arr
      },
      // 清除所有tip
      handleClearTip() {
        this.depGroup.childList.forEach(item => {
          item.showTip = false
        })
      },

      // 发起部门群聊 - 打开提示框
      handleConfirmDepDialog(id) {
        this.firmDepId = id
        this.$refs.deptDialog.exitDialog = true
      },
      // 发起部门群聊 - 弹框确认
      handleDept(){
        if(this.dialogOpenStatus) return
        this.dialogOpenStatus = true
        const data = {
          deptId: this.firmDepId
        }
        addGroupChat(data).then(res => {
          if(res.data.code === 200) {
            const { ChatId, roomId } = res.data.data
            // 存在，直接加入
            if(!res.data.data.is_exist) {
              // 创建成功
              this.$message.success('创建成功')
            }
            const group = {
              id: roomId,
              jid: ChatId
            }
            this.handleGoToGroup(group)
          }
        }).finally(() => {
          this.dialogOpenStatus = false
        })
      },

      openUserInfoBox(userInfo){
        console.log(userInfo,'userInfo ---000--- userInfo')
        this.userInfoBox = true
        this.userInfoData = userInfo
      },
    }
  };
</script>

<style lang="scss" scoped>
.main-view-container {
  display: flex;
  position: relative;
  padding: 0;
  background-color: #FBFBFC;
  .left-container {
    width: 260px;
    height: calc(100vh - 42px);
    padding: 24px 10px;
    overflow: hidden;
    background: #FFFFFF;
    user-select: none;
    .task_title{
      color: #0F1633;
      font-size: 20px;
      line-height: 20px;
      margin-bottom: 20px;
      cursor: default;
    }
    .menu_item_icon_container img{
      width: 16px;
    }
  }

  .right-container {
    width: calc(100vw - 260px - 80px);
    .top-label {
      width: 100%;
      height: 52px;
      padding: 10px 0 0 18px;
      background: #FFF;
      .top_nav{
        display: flex;
        align-items: center;
        height: 42px;
        padding: 0 27px;
        font-size: 16px;
        border-radius: 6px 6px 0 0;
        background-color: #FBFBFC;
        img {
          width: 16px;
          margin-right: 10px
        };
      }




    }
  }
  .el-menu-item-li {
    display: flex;
    align-items: center;
    height: 48px;
    padding-left: 0;
    padding-right: 0;
    font-size: 14px;
    font-weight: 500;
    color: #222222;
    line-height: 20px;
    border-radius: 4px;
    .menu-item-row {
      position: relative;
      margin-left: 16px;
    }
    .menu-text {
      margin-left: 10px;
      width: 95px;
    }
    .el-icon {
      font-size: 18px;
      font-weight: 600;
    }
    .menu-item-active {
      display: flex;
      align-items: center;
    }
  }
  .el-menu-item-li_active {
    background: #F5F6F7;
    color: #3370FF;
  }
}
</style>
