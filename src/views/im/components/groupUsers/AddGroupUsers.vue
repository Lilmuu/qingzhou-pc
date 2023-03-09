<template>
  <div class="select-container">
    <div class="select-view select-left">
      <div style="background: #F5F5F5;margin: 15px 0;">
        <el-scrollbar class="select-left-list mail-select-list-collapse noScroll" style="overflow:hidden;">
          <!-- 一级  -->
          <el-collapse v-model="activeCollapse" accordion>
            <el-collapse-item :name="group.id"
              @click.native="changeCollage(group)"
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
                      <span class="tip" style="margin-right: 8px;"></span>
                      <div class="mail-collapse2-title ellipsis">
                        {{ children.name }}
                      </div>
                    </div>
                  </template>
                  <!-- 邮箱 -->
                  <div class="mail-list-container">
                    <div @click="handleChangeUser(mailUser.email, mailUser.username)"
                      v-for="(mailUser, index) in mailUserList"
                      v-show="showEmail(mailUser.email)"
                      :key="'mailUser' + index"
                      class="mail-item">
                      <div class="user-mail ellipsis">{{ mailUser.username || '' }} <{{ mailUser.email }}></div>
                      <div class="user-active">
                        <i class="el-icon-success user-checked" v-if="isUserSelected(mailUser)"></i>
                        <i class="el-icon-success user-unchecked" v-else></i>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
              <!-- 分组的 -->
              <el-collapse v-model="groupActiveCollapse" accordion v-else-if="group.type === 'grouped'">
                <div class="mail-list-container">
                  <div @click="handleChangeUser(mailUser.email, mailUser.username)"
                    v-for="(mailUser, index) in groupList"
                    v-show="showEmail(mailUser.email)"
                    :key="'mailUser' + index"
                    class="mail-item">
                    <div class="user-mail ellipsis">{{ mailUser.email }}</div>
                    <div class="user-active">
                      <i class="el-icon-success user-checked" v-if="isUserSelected(mailUser)"></i>
                      <i class="el-icon-success user-unchecked" v-else></i>
                    </div>
                  </div>
                </div>
              </el-collapse>
              <!-- 未分组的 -->
              <el-collapse v-model="unGroupActiveCollapse" accordion v-else-if="group.type === 'unGrouped'">
                <div class="mail-list-container">
                  <div @click="handleChangeUser(mailUser.email)"
                    v-for="(mailUser, index) in unGroupList"
                    v-show="showEmail(mailUser.email)"
                    :key="'mailUser' + index"
                    class="mail-item">
                    <div class="user-mail ellipsis">{{ mailUser.email }}</div>
                    <div class="user-active">
                      <i class="el-icon-success user-checked" v-if="isUserSelected(mailUser)"></i>
                      <i class="el-icon-success user-unchecked" v-else></i>
                    </div>
                  </div>
                </div>
              </el-collapse>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </div>
    </div>
    <div class="select-view select-right" style="padding-top: 15px;">
      <el-scrollbar class="selected-list-outer noScroll" style="background: #F5F5F5;margin-top: 15px;overflow: hidden">
        <div class="mail-selected-list">
          <div class="selected-item" v-for="(user, index) of userListsSelected" :key="'userListsSelected' + index">
            <div class="selected-inner flex-space-between" @click="handleChangeUser(user.email, user.username)">
              <span class="ellipsis">{{ user.username || user.email }}</span>
              <i class="el-icon-circle-close"></i>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div class="flex-space-between" style="margin-top: 30px;">
        <el-button type="primary" size="small" @click="handleSelect" style="width: 120px;">确认</el-button>
        <el-button @click="selectCancel" size="small" style="width: 120px;">取消</el-button>
      </div>
    </div>
    <!-- 选择分组   -->
    <el-dialog append-to-body
               width="50%"
               :before-close="handleCloseAddGroupDialog"
               class="dialog-message-box"
               :visible.sync='addGroupDialog'
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">选择分组</span>
      </div>
      <addGroup v-if="addGroupDialog" :selectedList="userMailSelected"></addGroup>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "AddGroupUsers",
    data() {
      return {
        q: '',
        isIndeterminate: true,
        // 所有的
        allUserList: [],
        userMailSelected: [],
        userListsSelected: [],
        count: 0, // 防止多加
        activeCollapse: '',
        childActiveCollapse: '',
        groupActiveCollapse: '',
        unGroupActiveCollapse: '',
        userList: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        mailUserList: [],
        // 公司的
        groups: [],
        // 分组的
        groupList: [],
        // 未分组的
        unGroupList: [],
        addGroupDialog: false
      }
    },
    computed: {
      selectedUser() {
        return this.allUserList.filter(user => user.checked)
      },
    },
  }
</script>

<style scoped>

</style>
