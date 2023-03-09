<!--选择人-->
<template>
  <div id="select-people-dialog">
    <div class="select-container">
      <div class="select_left">
        <div class="select_search" v-if="selectUserList.length == 0">
          <el-autocomplete
            class="input_with_select"
            v-model="searchVal"
            :fetch-suggestions="querySearch"
            placeholder="搜索"
            :trigger-on-focus="false"
            @select="handleSelectPeople"
          >
            <template slot="prefix">
              <img src="@/assets/img/icon_select_user.png" class="select-people-search">
            </template>
          </el-autocomplete>
        </div>
        <div :class="[selectUserList.length == 0 ? 'depet_list_left' : 'depet_list_del']">
          <!-- <div class="compayName">{{compayName}}</div> -->
          <el-scrollbar v-if="selectUserList.length == 0">
            <div v-for="(item,index) in deptList" :key="index" class="depetItems">
              <div class="depeItemName" @click="changeItemOpen(index)">
                <img class="rotate_up_down" :class="{'rotate': item.isOpen }" src="@/assets/img/contact/select_no_icon.png" >
                <img class="depet_img" src="@/assets/img/contact/department_img.png" >
                <span>{{item.name}}</span>
              </div>
              <div v-if="item.isOpen" class="user_list">
                <template v-for="(user,indexs) in item.users">
                  <div @click="handleChangeUser(user, indexs)" class="user_item" :class="{'noselect': disSelect(user)}" :key="user.userId" v-if="user.realName">
                    <div class="user_name">
                      <headAvatar
                        :size="32"
                        :fontSize='12'
                        :avatarUrl="user.headImg ? user.headImg: ''"
                        :username='user.nickName || user.realName'>
                      </headAvatar>
                      <div>{{ user.nickName || user.realName }}</div>
                    </div>
                    <!--  -->
                    <img class="img_select" v-if="disSelect(user)" src="@/assets/img/contact/Icon_checkbox_noselect.png" alt="">
                    <img class="img_select" v-else-if="isUserSelected(user)" src="@/assets/img/contact/Icon_checkbox_select.png" alt="">
                    <img class="img_select" v-else src="@/assets/img/contact/Icon_checkbox_normal.png" alt="">
                  </div>
                </template>
              </div>
            </div>
          </el-scrollbar>
          <el-scrollbar v-else>
            <div v-for="(user,index) in selectUserList"
              @click="handleChangeUser(user, index)"
              class="del_user_item"
              :class="{'noselect': disSelect(user)}"
              :key="user.userId">
              <div class="user_name">
                <headAvatar
                  :size="32"
                  :fontSize='12'
                  :avatarUrl="user.headImg ? user.headImg: ''"
                  :username='user.nickname'
                  :style="user.headImg ? '':'margin-right:10px;'">
                </headAvatar>
                <div>{{ user.nickname || item.realName }}</div>
              </div>
              <img class="img_select" v-if="disSelect(user)" src="@/assets/img/contact/Icon_checkbox_noselect.png" alt="">
              <img class="img_select" v-else-if="isUserSelected(user)" src="@/assets/img/contact/Icon_checkbox_select.png" alt="">
              <img class="img_select" v-else src="@/assets/img/contact/Icon_checkbox_normal.png" alt="">
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="select_right">
        <div class="select_right_cont">
          <div class="selected_total">已选择: {{ selectedUserArr.length }}个联系人</div>
          <el-scrollbar class="selected-list-outer noScroll" :class="{'selected-list_group': addType == 'createGroupChat'}">
            <div class="selected_list">
              <div class="selected_item" v-for="(item, index) in selectedUserArr" :key="'allUserList' + index">
                <div class="user_name">
                  <headAvatar
                    :size="32"
                    :fontSize='12'
                    :avatarUrl="item.headImg ? item.headImg: ''"
                    :username='item.nickName || item.realName || item.nickname'>
                  </headAvatar>
                  <div>{{ item.nickName || item.realName || item.nickname }}</div>
                </div>
                <div class="icon_close" @click="deleteUser(item, index)">
                  <img src="@/assets/img/icon_close.png">
                </div>
              </div>
            </div>
          </el-scrollbar>
          <div v-show="addType == 'createGroupChat'">
            <el-input class="group_name" v-model="groupName" placeholder="请输入群名称"></el-input>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="select-people-footer flex-space-between">
      <div class="tigs">
        <span v-if="addType == 'createGroupChat'">请勾选需要添加群聊的成员</span>
        <span v-else-if="addType == 'groupSelUsers'">请勾选需要删除的成员</span>
        <span v-else>请勾选需要添加的成员</span>

      </div>
      <div class="">
        <el-button @click="selectCancel" size="small">取消</el-button>
        <el-button type="primary" size="small" @click="handleSelect">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { findUser } from "@/api/user"
import { getDeptTreeUsers } from '@/api/dept'
import { mapGetters, mapActions, mapState } from 'vuex'
import headAvatar from "@/components/headAvatar"
import store from "@/store";
import { addGroupChat } from "@/api/im";
import { hasBlank } from "@/utils/validate";

export default {
  name: "selectPeople",
  components:{ headAvatar },
  props: {
    /* 使用模块
    * target：目标管理，
    * task: 任务添加执行人、关注人
    * group: 新建群聊
    */
    moduleMode: {
      type: String,
      default: 'task'
    },
    /*
    * zxr：执行人
    * gzr：关注人
    * groupAddUsers : 添加群成员,
    * createGroupChat: 创建群聊
    * groupSelUsers: 删除群成员
    */
    addType: {
      type: String,
      required: true,
      default: ()=>{
        return 'zxr'
      }
    },
    userArr: {
      type: Array,
      default: ()=>{
        return []
      }
    },
    selectUserList:{
      type: Array,
      default: () => {
        return []
      }
    },
    executeList: {
      type: Array,
      default: ()=>{
        return []
      }
    },
    attentionList: {
      type: Array,
      default: ()=>{
        return []
      }
    },
    // 房间信息
    chatParams:{
      type: Object,
      default: ()=>{
        return {}
      }
    }
  },
  mounted() {
    this.initData();
  },
  data() {
    return {
      searchVal: '',
      // selectUserList:[],
      isIndeterminate: true,
      userList: [],
      allUserList: [],
      userListSelected: [],
      count: 0 ,// 防止多加
      compayName:'',
      deptList:[],
      selectedUserArr: [],
      groupName: '',
      noSelectableList:[],
      handleStatus:false
    }
  },
  computed: {
    ...mapState({
      organPersonnelList: state =>state.app.organPersonnelList, // 邮件内容缓存数据
    }),
    ...mapGetters([
      'userId'
    ]),
    disSelect(){
      return (user)=>{
        let userInfo
        userInfo = this.noSelectableList.filter(item=>{
          let id = user.imUserId ? user.imUserId : user.userId
          return item.userId == id
        })
        return userInfo.length>0 ? true : false
      }
    }
  },
  methods: {
    ...mapActions({
      'GetRoomMemberListByPage': 'Im/Room/GetRoomMemberListByPage', // [GET] 获取群成员列表
      'GetRoomInfo': 'Im/Room/GetRoomInfo', // [GET] 获取群信息
      'PostRoomMemberUpdate': 'Im/Room/PostRoomMemberUpdate', // [POST] 添加群成员
      'PostRoomMemberDelete': 'Im/Room/PostRoomMemberDelete', // [POST] 删除群成员
    }),
    // 重置data里的数据
    clearAllData() {
      console.log("重置data方法");
      Object.assign(this.$data,this.$options.data())
    },
    // 初始化数据
    initData() {
      let initSelectedLists = []
      switch (this.addType) {
        case 'zxr':
          initSelectedLists = this.executeList
          break;
        case 'gzr':
          initSelectedLists = this.attentionList
          break;
        case 'groupSelUsers':
          this.noSelectableList = this.executeList
          console.log(this.noSelectableList,'this.noSelectableList')
          break;
        case 'groupAddUsers':
          this.noSelectableList = this.executeList
          console.log(this.noSelectableList,'this.noSelectableList')
          break;
        default:
          break
      }
      this.userListSelected = initSelectedLists
      if(this.selectUserList.length == 0){
        this.handleSearch()
      }
      this.selectUserList.forEach(item => {
        item.checked = false
      })
      console.log('selectUserList',this.selectUserList,this.chatParams)
    },
    // 搜索框搜索
    querySearch(queryString, cb){
      const query = {
        name: this.searchVal
      }
      findUser(query).then(res => {
        if (res.data.code === 200) {
          let resData = []
          res.data.data.forEach(item => {
            resData.push({
              userId: item.id,
              realName: item.realName,
              checked: false,
              deptId:item.deptId,
              value:item.realName,
              imUserId:item.imUserId
            })
          })
          cb(resData);
        }
      })
    },
    // 搜索框点击
    handleSelectPeople(item){
      let status = true
      this.noSelectableList.map(val => {
        if(val.userId === item.imUserId){
          status = false
        }
      })
      if(status){
        this.handleChangeUser(item,-1)
      }else{
        this.$message.warning('已有该成员')
      }
      this.searchVal = ''
    },
    // 改变部门打开状态
    changeItemOpen(index){
      this.deptList[index].isOpen = !this.deptList[index].isOpen
    },
    // 搜索用户
    handleSearch() {
      if(this.organPersonnelList.length>0){
        this.organPersonnel(this.organPersonnelList)
      }else{
        getDeptTreeUsers().then(res=>{
          console.log(res,'res --- res')
          if(res.data.code === 200){
            store.commit('SET_ORGANPERSONNELLIST', res.data.data)
            this.organPersonnel(res.data.data)
          }
        })
      }

    },
    organPersonnel(userList){
      this.selectedUserArr = [];
      this.compayName = userList[0].name
      userList[0].childList.forEach((item)=>{
        item.isOpen = false
      })
      let list = JSON.parse(JSON.stringify(userList[0].childList))
      list.forEach(item=>{
        item.users.forEach(items=>{
          items.checked = false
        })
      })
      list.forEach(item =>{
        this.userListSelected.forEach(user=>{
          console.log(this.userListSelected, 'this.userListSelected')
            item.users.forEach(items=>{
              console.log(items.imUserId, 'items.imUserId')
              if(items.imUserId == user.imUserId){
                items.checked = true
                this.selectedUserArr.push(items)
              }
            })
        })
      })
      let a = JSON.parse(JSON.stringify(list))
      this.digui(a) ;
      this.deptList = a;
    },
    digui(array) {
      for(let i in array){
        var data=array[i];
        if(data.childList){
          for(let k = 0; k < data.childList.length; k++) {
             for(let item in data.childList[k].users) {
              data.users.push(data.childList[k].users[item])
             }
          }
          this.digui(data.childList) //自己调用自己
        }
      }
    },
    handleChangeUser(user, index) {
      console.log(user,'asdads')
      if(this.disSelect(user)) return
      if(user.userId == this.userId && (this.moduleMode != 'target' || this.addType == 'groupSelUsers')){
        this.$message.warning("无法选择自己")
        return
      }
      let reverseCheck = false
      let zxrFlag = false
      if(this.addType == 'zxr'){
          this.attentionList.forEach(items=>{
            if(items.id == user.userId){
              reverseCheck = true
            }
          })
          this.userArr.forEach(item => {
            if(item.id == user.userId){
              zxrFlag = true
            }
          })
      }else{
          this.executeList.forEach(items=>{
            if(items.id == user.userId){
              reverseCheck = true
            }
          })
      }
      if(zxrFlag) {
          this.$message.warning("此人已为执行人，无法添加执行")
          return
      }
      if(reverseCheck){
          if(this.addType == 'zxr'){
            this.$message.warning("此人已为关注人，无法添加执行")
          }else{
            this.$message.warning("此人已为执行人，无法添加关注")
          }
          return
      }
      // let userList = this.selectUserList.length == this.deptList : this.selectUserList
      if(this.selectUserList.length ==0){
        this.deptList.forEach(item =>{
          item.users.forEach(items =>{
            if(items.userId === user.userId){
              if(!(index == -1 && items.checked)){
                items.checked = items.checked ? !items.checked : true
              }
            }
          })
        })
      }else{
        this.selectUserList.forEach(items =>{
          console.log(items,'items --- items')
          if(items.userId === user.userId){
            if(!(index == -1 && items.checked)){
              items["checked"] = !items.checked
            }
          }
        })
      }

      console.log(this.deptList)
      this.selectedUser()
    },
    // 创建群聊、群聊添加人员
    creatGroupOrAdduser() {
      
      let list = [] // imId 人员数组
      if(this.addType === 'groupAddUsers' && this.chatParams.type === 'room') {
        if(this.handleStatus) return
        this.handleStatus = true
        // 添加群成员
        list = this.selectedUserArr.map(item=>{
          return item.imUserId
        })
        const params = { roomId: this.chatParams.id, text: JSON.stringify(list) }
        this.PostRoomMemberUpdate(params).then(rs => {
          if (rs.resultCode === 1) {
            this.selectCancel()
            this.$message.success('添加成功')
          }
        }).finally(() => {
          this.handleStatus = false
        })
      } else if(this.addType === 'createGroupChat') {
        // 创建群
        if(hasBlank(this.groupName) || !this.groupName) {
          this.$message.info('请输入正确的群名称')
          return
        }
        if(this.groupName.length > 20) {
          this.$message.info('群名称不能超过20个字符')
          return
        }
        if(this.handleStatus) return
        this.handleStatus = true
        list = this.selectedUserArr.map(item=>{
          return {id: item.imUserId}
        })
        const data = { chatName: this.groupName, list }
        addGroupChat(data).then(res => {
          if(res.data.code === 200) {
            this.selectCancel()
            this.$message.success('创建成功')
          }
        }).finally(() => {
          this.handleStatus = false
        })
      }
    },
    // 删除群成员
    delGroupUser(){
      if(this.handleStatus) return
      this.handleStatus = true
      let list
      list = this.selectedUserArr.map(item=>{
        return item.userId
      })
      // [POST] 删除群成员
      this.PostRoomMemberDelete({ roomId: this.chatParams.id, userIds: list.join(',') }) .then(rs => {
        if (rs.resultCode === 1) {
          this.$message.success('删除成功')
          this.selectCancel()
        }
      }).finally(() => {
        this.handleStatus = false
      })
    },
    selectedUser() {
      let allUserList = [];
      if(this.selectUserList.length ==0){
        this.deptList.filter(item=>{
          item.users.forEach(items=>{
            if(items.checked){
              allUserList.push(items)
            }
          })
        })
      }else{
        this.selectUserList.forEach(items=>{
          if(items.checked){
            allUserList.push(items)
          }
        })
      }
      this.selectedUserArr = allUserList
    },
    handleSelect() {
      if(!this.selectedUserArr.length) return
      if(this.addType == 'createGroupChat' || this.addType == 'groupAddUsers'){
        this.creatGroupOrAdduser()
        return
      }
      if(this.addType == 'groupSelUsers'){
        this.delGroupUser()
        return
      }
      let allUserList = []
      this.deptList.filter(item=>{
        item.users.forEach(items=>{
          if(items.checked){
            allUserList.push(items)
          }
        })
      })
      const lists = []
      allUserList.forEach(user => {
        lists.push({
          id: user.userId,
          username: user.realName || user.nickName || user.nickname,
          deptId: user.deptId,
          jobId: user.jobId,
          imUserId: user.imUserId,
          headImg: user.headImg,
        })
      })
      const data = {
        type: this.addType,
        lists
      }
      this.$emit('selectUserSuccess', data)
    },
    selectCancel() {
      this.selectedUserArr = []
      this.groupName = ''
      this.deptId = this.organPersonnelList.length ? this.organPersonnel(this.organPersonnelList) : ''
      this.searchVal = ''
      this.$emit('selectCancel')
    },
    isUserSelected(user) {
      let flag = false
      if(this.selectUserList.length ==0){
        this.deptList.forEach(item=>{
          item.users.forEach((items,index)=>{
            if(items.userId == user.userId && items.checked){
               flag = true
            }
          })
      })
      }else{
        this.selectUserList.forEach((items,index)=>{
          if(items.userId == user.userId && items.checked){
            flag = true
          }
        })
      }
      return flag
    },
    deleteUser(user, index) {
       this.deptList.forEach(item=>{
      //  if(item.id==user.deptId){
          item.users.forEach(items=>{
            if(items.userId === user.userId){
              if(index == -1 && items.checked){
              }else{
                items.checked = !items.checked
              }
            }
          })
     //   }
      })
      this.selectUserList.forEach(item => {
        if(item.userId === user.userId){
          item.checked = false
        }
      })
      this.selectedUser();
    }
  }
}
</script>

<style lang="scss">

</style>
