<!--选择成员-->
<template>
  <div class="select-container" id="add-chat-group">
    <div class="select-view select-left">
      <div style="margin: 15px 0;">

        <div class="select-search" style="margin-bottom: 15px;">
          <el-autocomplete
            class="inline-input input-with-select"
            v-model="addVal"
            style="width:100%;"
            :fetch-suggestions="querySearch"
            placeholder="请输入用户名查询"
            :trigger-on-focus="false"
            @select="handleSelectPeople"
          >
            <template slot="prefix">
              <img src="@/assets/img/task/search.png" class="select-people-search">
            </template>
          </el-autocomplete>
        </div>

        <el-scrollbar class="select-left-list mail-select-list-collapse noScroll" style="overflow:hidden;">
          <!-- 一级  -->
          <el-collapse v-model="activeCollapse" accordion>
            <el-collapse-item :name="group.id"
              class="mail-collapse-head1"
              v-for="(group, index) in groups"
              :key="'groups' + index">
              <template slot="title">
                <div class="mail-collapse1 ellipsis">{{ group.name }}</div>
              </template>
              <!-- 公司组 二级 -->
              <el-collapse v-model="childActiveCollapse" accordion v-if="group.type === 'gs'">
                <el-collapse-item :name="children.id"
                  class="mail-collapse-head2"
                  v-for="(children, index) in group.childList"
                  :key="'children' + index">
                  <template slot="title">
                    <div class="mail-collapse2 flex-center">
                      <!-- <span class="tip" style="margin-right: 8px;"></span> -->
                      <img v-show="true" class="open_icon" src="@/assets/img/contact/open_icon.png" alt="">
                      <div class="mail-collapse2-title ellipsis">
                        {{ children.name }}
                      </div>
                    </div>
                  </template>
                  <!-- 成员 -->
                  <!--创建群-->
                  <div class="mail-list-container disable" v-if="addType === 'addGroup'">
                    <div @click="handleChangeUser(user.id, user.realName)"
                          v-for="(user, index) in groupUserLists"
                         :key="'user' + index"
                         :class="{'mail-item':true,'user-disable':user.id === MeId}" style="margin-bottom: 10px;">
                      <div style="display: flex;align-items: center;">
                        <!-- <Avatar :username="user.realName" :size="28" style="font-size: 11px;"></Avatar> -->
                        <headAvatar 
                          :size="32" 
                          :fontSize='12'
                           style="font-size: 11px;"
                          :avatarUrl="user.headImage ? user.headImage: ''" 
                          :username="user.realName">
                        </headAvatar>
                        <span class="im-userName ellipsis" style="max-width: 80px;">{{ user.realName }}</span>
                      </div>
                      <div class="user-active">
                        <i class="el-icon-success user-checked" v-if="isUserSelected(user)"></i>
                        <i class="el-icon-success user-unchecked" v-else></i>
                      </div>
                    </div>
                  </div>
                  <!-- 添加人 -->
                  <div class="mail-list-container" v-if="addType === 'addGroupUsers'">
                    <div @click="!isJoinedUser(user) && handleChangeUser(user.id, user.realName)"
                         v-for="(user, index) in groupUserLists"
                         :key="'user' + index"
                         class="mail-item" style="margin-bottom: 10px;">
                      <div style="display: flex;align-items: center;">
                        <!-- <Avatar :username="user.realName" :size="28" style="font-size: 11px;"></Avatar> -->
                        <headAvatar 
                          :size="32" 
                          :fontSize='12'
                           style="font-size: 11px;"
                          :avatarUrl="user.headImage ? user.headImage: ''" 
                          :username="user.realName">
                        </headAvatar>
                        <span class="im-userName ellipsis" style="max-width: 80px;">{{ user.realName }}</span>
                      </div>
                      <div class="user-active" v-if="!isJoinedUser(user)">
                        <i class="el-icon-success user-checked" v-if="isUserSelected(user)"></i>
                        <i class="el-icon-success user-unchecked" v-else></i>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </div>
    </div>
    <div class="select-view select-right" style="padding-top: 15px;">
      <el-scrollbar class="selected-list-outer noScroll" style="margin-top: 0;overflow: hidden">
        <div class="mail-selected-list" style="flex-direction: row;">
          <div class="selected-item" v-for="(user, index) of userListsSelected" :key="'userListsSelected' + index">
            <div class="selected-inner flex-space-between" @click="handleChangeUser(user.id, user.realName)">
              <div class="avatar" style="display: flex;align-items: center;">
                <!-- <Avatar :username="user.username" :size="28" style="font-size: 11px;"></Avatar> -->
                <headAvatar 
                  :size="32" 
                  :fontSize='12'
                    style="font-size: 11px;"
                  :avatarUrl="user.headImage ? user.headImage: ''" 
                  :username="user.username">
                </headAvatar>
                <span class="ellipsis im-userName" style="max-width: 80px;">{{ user.username }}</span>
              </div>
              <!--  未加入 -->
              <i class="el-icon-circle-close"></i>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <el-input v-model="groupName" placeholder="请输入一个群名称" class="im-group-input" v-if="addType === 'addGroup'">
        <template slot="prepend">群名称</template>
      </el-input>
      <div class="flex-space-between" style="margin-top: 15px;">
        <el-button type="primary" :loading="isBtnLoading" size="small" @click="handleSelect" style="width: 120px;">确认</el-button>
        <el-button @click="selectCancel" size="small" style="width: 120px;">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeptTree, getUserByDeptId } from "@/api/dept"
import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar";
import { addGroupChat } from "@/api/im";
import { hasBlank } from "@/utils/validate";
import { mapActions } from 'vuex'
import { findUser } from "@/api/user"
import {mapState} from "vuex";

export default {
  name: "selectGroupUsers",
  props: {
    selectedList: {
      type: Array,
      default: () => []
    },
    // 添加类型 ['addGroupUsers': 添加成员, 'addGroup': 创建群]
    addType: {
      type: String,
      required: true
    },
    params: {
      type: Object,
      required: true
      /*
      * id: '',
        type: 'friend',   // [room, friend]
        jid: ''           // 群jid / 好友id
      * */
    }
  },
  components: {
    headAvatar
  },
  mounted() {
    this.handleGetDeptTree()
    this.initSerListsSelected()
    if (this.addType === 'addGroupUsers') {
      this.GetRoomNoticesListPage()
    }
  },
  data() {
    return {
      isIndeterminate: true,
      // 所有的
      allUserList: [],
      userSelectedIds: [],
      userListsSelected: [],
      count: 0, // 防止多加
      activeCollapse: '',
      childActiveCollapse: '',
      groupActiveCollapse: '',
      userList: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      groupUserLists: [],
      // 公司的
      groups: [],
      // 群名称
      groupName: '',
      isBtnLoading: false,
      // 当前所有成员
      currentJoined: [],


      addVal: '', // 搜索内容
    }
  },
  computed: {
    ...mapState({
      userId: state => state.user.userId,
      MeId: state => state.Common.User.MeId || 0, // 我的ID
    }),
    selectedUser() {
      return this.allUserList.filter(user => user.checked)
    }
  },
  methods: {
    ...mapActions({
      'GetRoomMemberListByPage': 'Im/Room/GetRoomMemberListByPage', // [GET] 获取群成员列表
      'GetRoomInfo': 'Im/Room/GetRoomInfo', // [GET] 获取群信息
      'PostRoomMemberUpdate': 'Im/Room/PostRoomMemberUpdate', // [POST] 添加群成员
    }),

    // 搜索框搜索
    querySearch(queryString, cb){
      const query = {
        name: this.addVal
      }
      findUser(query).then(res => {
        if (res.data.code === 200) {
          let resData = []
          console.log(res,'res --- res')
          res.data.data.forEach(item => {
            resData.push({
              userId: item.id,
              realName: item.realName,
              checked: false,
              deptId:item.deptId,
              value:item.realName,
              imUserId: item.imUserId
            })
          })
          console.log(this.userListsSelected,'userListsSelected --- userListsSelected')
          cb(resData);
        }
      })
    },
    // 搜索框点击
    handleSelectPeople(item){
      console.log(item,'item  ---item')
      this.handleChangeUser(item.imUserId,item.realName)
      this.addVal = ''
    },

    // 回显选中人
    initSerListsSelected() {
      let userSelectedIds = [...this.selectedList]
      let userListsSelected = []

      getUserByDeptId({ deptId: 0 }).then(res => {
        if (res.data.code === 200) {
          let lists = res.data.data
          userSelectedIds.forEach(id => {
            // 统一 未分组
            userListsSelected.push({ id, username: '' })
          })

          lists.forEach(user => {
            // 用 imUserId
            user.id = user.imUserId || user.id
            user.username = user.realName
            userListsSelected.forEach(suser => {
              suser.username = user.realName
              // 有公司组
              if (suser.id === user.id) {
                suser.username = user.username
              }
            })
          })

          this.userSelectedIds = userSelectedIds
          this.userListsSelected = userListsSelected
        }
      })
    },
    // 获取公司分组
    handleGetDeptTree() {
      const groups = []
      // 公司分组
      getDeptTree().then(res => {
        if (res.data.code === 200) {
          const gsLists = res.data.data
          gsLists.forEach(item => {
            item.type = 'gs'
          })
          groups.push(...gsLists)
          const deptId = res.data.data[0].id
          this.handleGetDeptPage(deptId)
          this.groups = groups
        }
      })
    },
    handleGetDeptPage(deptId) {
      getUserByDeptId({ deptId }).then(res => {
        if (res.data.code === 200) {
          const lists = res.data.data
          lists.forEach(item => {
            item.id = item.imUserId || item.id
            item.username = item.realName
          })
          this.groupUserLists = lists
        }
      })
    },
    // 获取当前所有群成员
    GetRoomNoticesListPage () {
      const params = {
        pageIndex: 0,
        pageSize: 999,
        roomId: this.params.id
      }
      this.GetRoomMemberListByPage(params).then(res => {
        if (res.resultCode === 1) {
          let arr = [...res.data]
          arr.forEach(u => {
            u.id = u.userId
          })
          this.currentJoined = arr
        }
      })
    },
    // 选中
    handleChangeUser(id, username) {
      if(id === this.MeId) return

      if (this.userSelectedIds.includes(id)) {
        const index = this.userSelectedIds.indexOf(id)
        if (index === -1) return
        this.userSelectedIds.splice(index, 1)
        this.userListsSelected = this.userListsSelected.filter(item => item.id !== id)
      } else {
        this.userSelectedIds.push(id)
        this.userListsSelected.push({id, username})
      }
    },
    handleSelect() {
      if(this.addType === 'addGroupUsers' && this.params.type === 'room') {
        // 添加群成员
        this.handleAddGroupUsers()
      } else if(this.addType === 'addGroup') {
        const userSelectedIds = this.userSelectedIds
        const list = []
        userSelectedIds.forEach(id => {
          list.push({ id })
        })
        // 创建群
        if(hasBlank(this.groupName) || !this.groupName) {
          this.$message.info('请输入正确的群名称')
          return
        }
        if(this.groupName.length > 20) {
          this.$message.info('群名称不能超过20个字符')
          return
        }
        const data = {
          chatName: this.groupName,
          list,
          // deptId: ''
        }
        this.isBtnLoading = true
        addGroupChat(data).then(res => {
          if(res.data.code === 200) {
            this.$emit('success')
            this.$message.success('创建成功')
          }
        }).finally(() => {
          this.isBtnLoading = false
        })
      }
    },
    selectCancel() {
      this.$emit('selectCancel')
    },
    isUserSelected(user) {
      return this.userSelectedIds.includes(user.id)
    },
    // 是否已加入
    isJoinedUser(user) {
      console.log(this.currentJoined,user )
      return this.currentJoined.some(u => u.id === user.id)
    },
    // 添加群成员
    handleAddGroupUsers() {
      const selectFriendId = []
      this.userListsSelected.forEach((friend, index) => {
        selectFriendId.push(friend.id)
      })

      // 没有选中则直接跳出
      if (selectFriendId.length === 0) return

      const params = {
        roomId: this.params.id,
        text: JSON.stringify(selectFriendId)
      }
      this.isBtnLoading = true
      this.PostRoomMemberUpdate(params).then(rs => {
        if (rs.resultCode === 1) {
          this.GetRoomInfo({ roomId: this.params.id })
          this.$emit('success')
          this.$message.success('添加成功')
        }
      }).finally(() => {
          this.isBtnLoading = false
        })
    },
  },
  watch: {
    // 公司的
    childActiveCollapse(newval, oldval) {
      if (newval !== oldval) {
        this.handleGetDeptPage(newval)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.mail-selected-list {
  display: flex;
  flex-wrap: wrap;
  height: auto;
  flex-direction: row;
  padding-right: 0;
  .selected-item {
    cursor: pointer;
    font-size: 16px;
    width: calc(50% - 10px);
    padding: 5px 10px;
    background: #F5F5F5;
    margin-top: 10px;
    margin-right: 10px;
  }
  .selected-inner {
    padding: 0;
    background: none;
  }
}
.im-userName {
  margin-left: 12px;
  font-weight: 500;
  color: #222222;
  font-size: 14px;
}
</style>

