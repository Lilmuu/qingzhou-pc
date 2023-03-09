<template>
<div>
  <div class="select-container">
    <div class="select-view select-left">
      <div class="select-search" style="margin-top: 15px;">
        <div class="select-title">所有联系人</div>
      </div>
      <!-- background: #F5F5F5; -->
      <div style="margin: 15px 0;">
        <el-scrollbar class="select-left-list mail-select-list-collapse noScroll" style="overflow:hidden;">
          <!-- 一级  -->
          <el-collapse v-model="activeCollapse" accordion>
            <el-collapse-item :name="group.id"
              @click.native="changeCollage(group)"
              class="mail-collapse-head1"
              v-for="(group, index) in groups"
              :key="'groups' + index">
              <template slot="title">
                <img src="@/assets/img/mail/icon-caret.png" class="iconCaretImg" :class="isCollapseActive(group.id,'activeCollapse') ? 'activeIconCaretImg' : ''" />
                <div class="mail-collapse1 ellipsis collapse-title">{{ group.name }}</div>
              </template>
              <!-- 公司组 二级 -->
              <el-collapse v-model="childActiveCollapse" accordion v-if="group.type === 'gs'">
                <el-collapse-item :name="children.id"
                  class="mail-collapse-head2"
                  v-for="(children, index) in group.childList"
                  :key="'children' + index">
                  <template slot="title">
                    <img src="@/assets/img/mail/icon-caret.png" class="iconCaretImg" :class="isCollapseActive(children.id,'childActiveCollapse') ? 'activeIconCaretImg' : ''" />
                    <div class="mail-collapse2 flex-center collapse-title">
                      <!-- <span class="tip" style="margin-right: 8px;"></span> -->
                      <div class="mail-collapse2-title ellipsis">
                        {{ children.name }}
                      </div>
                    </div>
                  </template>
                  <!-- 邮箱 -->
                  <div class="mail-list-container">
                    <div @click="handleChangeUser(mailUser.email, mailUser.username,mailUser.headImage)"
                          v-for="(mailUser, index) in mailUserList"
                          v-show="showEmail(mailUser.email)"
                         :key="'mailUser' + index"
                         class="mail-item">
                      <div class="user-mail ellipsis">
                        <div class="imgName" v-if="!mailUser.headImage">{{mailUser.username&&mailUser.username.substring(mailUser.username.length-2,mailUser.username.length)}}</div>
                        <img :src="mailUser.headImage" alt="" v-if="mailUser.headImage">
                        <div>
                          <div>
                          {{ mailUser.username || '' }} 
                          </div>
                          <div>
                          {{ mailUser.email }}
                          </div>
                        </div>
                        
                        </div>
                      <div class="user-active">
                        <i class="el-icon-check user-checked" v-if="isUserSelected(mailUser)"></i>
                        <i class="el-icon-check user-unchecked" v-else></i>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
              <!-- 分组的 -->
              <el-collapse v-model="groupActiveCollapse" accordion v-else-if="group.type === 'grouped'">
                <div class="mail-list-container">
                  <div @click="handleChangeUser(mailUser.email, mailUser.username,mailUser.headImage)"
                       v-for="(mailUser, index) in groupList"
                       v-show="showEmail(mailUser.email)"
                       :key="'mailUser' + index"
                       class="mail-item">
                    <div class="user-mail ellipsis">{{ mailUser.email }}</div>
                    <div class="user-active">
                      <i class="el-icon-check user-checked" v-if="isUserSelected(mailUser)"></i>
                      <i class="el-icon-check user-unchecked" v-else></i>
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
                      <i class="el-icon-check user-checked" v-if="isUserSelected(mailUser)"></i>
                      <i class="el-icon-check user-unchecked" v-else></i>
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
      <div class="select-title">已选：{{ userListsSelected.length }}个联系人</div>
      <el-scrollbar class="selected-list-outer noScroll" style="margin-top: 15px;overflow: hidden">
        <div class="mail-selected-list">
          <div class="selected-item" v-for="(user, index) of userListsSelected" :key="'userListsSelected' + index">
            <div class="selected-inner flex-space-between">
              <span class="ellipsis">
                <div v-if="user.username&&user.username!=user.email">
                  <img :src="user.headImage" alt="" v-if="user.headImage">
                  <div class="imgName" v-if="!user.headImage">{{user.username&&user.username.substring(user.username.length-2,user.username.length)}}</div>
                </div>
                <div>
                  <div v-if="user.username!=user.email">
                  {{ user.username || '' }}
                  </div>
                  <div>
                  {{ user.email }}
                  </div>
                </div>
                </span>
              <i class="el-icon-close" @click="handleChangeDel(user.email, user.username,user.headImage)"></i>
            </div>
          </div>
        </div>
      </el-scrollbar>
      
    </div>
    <!-- 选择分组   -->
    <el-dialog append-to-body
      width="50%"
      :before-close="handleCloseAddGroupDialog"
      class="dialog-message-box"
      :visible.sync='addGroupDialog'
      :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title">选择分组</span>
      </div>
      <addGroup v-if="addGroupDialog" :selectedList="userMailSelected" :userListsSelected="userListsSelected"></addGroup>
    </el-dialog>
  </div>
  <div class="bottom-style" style="margin-top:29px">
    <div @click="handleShowAddGroupDialog"
          class="flex-space-between cursor"
          style="justify-content: flex-start;">
      <img src="@/assets/img/icon/mail/addGroup.png" class="addGroup-btn" alt="">
      <span class="addGroup-text">分组管理</span>
    </div>
  </div>
  <div class="bottom-style" style="float:right">
    <div class="flex-space-between" style="">
      <el-button @click="selectCancel" size="small" style="width: 84px;height:32px;">取消</el-button>
      <el-button type="primary" size="small" @click="handleSelect" style="width: 84px;height:32px;">确认</el-button>
    </div>
  </div>
  </div>
</template>

<script>
import { getDeptTree, getUserByDeptId } from "@/api/dept"
import { queryEmail } from "@/api/system";
import { isEmail } from "@/utils/validate"
import addGroup from "@/views/mail/components/addGroup"
import { getEmailByGroupId, queryGroup, getEmailByUnGroup } from "@/api/mail"

export default {
  name: "selectSender",
  props: {
    selectedList: {
      type: Array
    },
    // 选择人类型 ['to': 收件人, 'ccList': 抄送, 'bccList': 密送]
    addType: {
      type: String,
      required: true
    },
    userListsSelectedFlag: {
      type: Array
    },
    outerData: {
      type: Array
    },
    userListsSelectedOld:{
      type: Array
    },
    formAddition:{
      type: Array
    },
  },
  components: {
    addGroup
  },
  mounted() {
    console.log(this.userListsSelectedFlag,this.groups,1234566431)
    this.handleGetDeptTree()
    this.initSerListsSelected()
  },
  data() {
    return {
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
    }
  },
  methods: {
    handleChangeDel(email){
      for(let i=0;i<this.userListsSelected.length;i++){
        if(email==this.userListsSelected[i].email){
          this.userListsSelected.splice(i,1)
          this.userMailSelected.splice(i,1)
        }
      }
    },
    // 回显选中人
    initSerListsSelected(mailUserList) {
      console.log(this.userListsSelected,this.userListsSelectedFlag,'213332231')
      let arr=[]
      for(let i=0;i<this.userListsSelectedFlag.length;i++){
        arr.push(this.userListsSelectedFlag[i].email)
      }
      console.log(this.outerData,arr,this.userListsSelectedOld,this.addType,this.formAddition,'adlqwkjhrlz')
      if(this.outerData.join(",")==arr.join(",")){
        
        if(this.userListsSelectedFlag){
          this.userListsSelected=this.userListsSelectedFlag
        }
      }else{
        if(this.formAddition.length>0){
          for(let i=0;i<this.formAddition.length;i++){

            this.userListsSelected.push({ email:this.formAddition[i].mail, username: this.formAddition[i].name, headImage:this.formAddition[i].image })
          }
        }else{
          console.log('ioajdosmaod')
          for(let i=0;i<this.userListsSelectedOld.length;i++){
            if(this.userListsSelectedOld[i].name==this.addType){
              this.userListsSelected=this.userListsSelectedOld[i].data
            }
          }
        }
      }
      
        let userMailSelected = [...this.userListsSelected]
        let userListsSelected = []
  
        // getUserByDeptId({ deptId: 0 }).then(res => {
        //   if (res.data.code === 200) {
        //     let lists = res.data.data
        //       console.log(userMailSelected,'214412',this.userListsSelected,'lists')
        //       // for(let i=0;i<userMailSelected.length;i++){
        //       //   for(let j=0;j<mailUserList.length;j++){
        //       //     for(let k=0;k<mailUserList[j].childList.length;k++){
        //       //       if(userMailSelected[i]==mailUserList[j].childList[k].){
    
        //       //       }
  
        //       //     }
        //       //   }
        //       // }
        //       }
        // })
            userMailSelected.forEach(item => {
              // console.log(res,'userMailSelected')
  
              // 统一 未分组
              userListsSelected.push({ email:item.email, username: item.username, headImage:item.headImage })
            })
            // lists.forEach(user => {
            //   user.username = user.realName
            //   userListsSelected.forEach(suser => {
            //     suser.username = user.realName
            //     // 有公司组
            //     if (suser.email === user.email) {
            //       suser.username = user.username
            //     }
            //   })
            // })
            console.log(userMailSelected,'2131242135')
            this.userMailSelected = userMailSelected
            this.userListsSelected = userListsSelected
            
            console.log(this.userListsSelected)

        
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
          // 获取已经分组的
          queryGroup().then(gres => {
            if (gres.data.code === 200) {
              const addedList = gres.data.data
              // 分组标识
              addedList.forEach(item => {
                item.type = 'grouped'
              })
              groups.push(...addedList)
              console.log(groups)
              // 获取未分组的
              getEmailByUnGroup().then(unres => {
                if (unres.data.code === 200) {
                  const unAddedList = [{ name: '未分组', id: '-1', type: 'unGrouped' }]
                  this.unGroupList = unres.data.data
                  groups.push(...unAddedList)
                  this.groups = groups
                }
              })
            }
          })
        }
      })
    },
    handleGetDeptPage(deptId) {
      getUserByDeptId({ deptId }).then(res => {
        if (res.data.code === 200) {
          const lists = res.data.data
          lists.forEach(item => {
            item.username = item.realName
          })
          this.mailUserList = lists
          console.log(this.mailUserList,'this.mailUserList')
          this.$forceUpdate()
          // this.initSerListsSelected(this.mailUserList)
        }
      })
    },
    //  分组 查邮箱列表
    handleGetEmailByGroupId(groupId) {
      getEmailByGroupId(groupId).then(res => {
        if (res.data.code === 200) {
          this.groupList = res.data.data
        }
      })
    },
    isCollapseActive(id,activeId) {
      return id == this[activeId]
    },
    // 邮箱选中
    handleChangeUser(email, username,headImage) {
      console.log(email, username,headImage,this.userMailSelected,'sadfsdf')
      if (!isEmail(email)) {
        this.$message.info('邮箱格式错误')
        return
      }
      // for(let i=0;i<this.userMailSelected.length;i++){
      //   this.userMailSelected[i].email
      // }
      if (this.userMailSelected.includes(email)) {
        const index = this.userMailSelected.indexOf(email)
        if (index === -1) return
        this.userMailSelected.splice(index, 1)
        this.userListsSelected = this.userListsSelected.filter(item => item.email !== email)
        console.log(this.userListsSelected.filter(item => item.email !== email),'4sd')
      } else {
        this.userMailSelected.push(email)
        this.userListsSelected.push({email, username,headImage})
      }
      console.log()
    },
    // 是否为email
    showEmail(email) {
      return isEmail(email)
    },
    handleSelect() {
      // const allUserList = this.allUserList.filter(item => item.checked)
      // const lists = []
      // allUserList.forEach(user => {
      //   lists.push({
      //     id: user.userId,
      //     username: user.username
      //   })
      // })
      // const data = {
      //   lists
      // }
      let flag=[]
      this.userMailSelected.forEach(item =>{
        typeof item=='object'?flag.push(item.email):flag.push(item)
      })
      const list = flag
      console.log(list, this.addType,this.userListsSelected,1231241243213)
      
      this.$emit('selectUserSuccess', list, this.addType,this.userListsSelected)
    },
    selectCancel() {
      this.$emit('selectCancel')
    },
    isUserSelected(mailUser) {
      return this.userMailSelected.includes(mailUser.email)
    },
    changeCollage(group) {
      // 分组的
      if (group.type === 'grouped') {
        this.handleGetEmailByGroupId(group.id)
      } else if (group.type === 'unGrouped') {
        // 获取未分组的
        getEmailByUnGroup().then(unres => {
          if (unres.data.code === 200) {
            this.unGroupList = unres.data.data
          }
        })
      }
    },
    // 添加分组 dialog
    handleShowAddGroupDialog() {
      this.addGroupDialog = true
      // console.log(this.userListsSelected,'123124')
      
      // if(this.userListsSelected.length==0){
      //   this.$refs.addGroup.userList=true
      // }else{
      //   this.$refs.addGroup.userList=false
      // }
    },
    handleCloseAddGroupDialog() {
      this.handleGetDeptTree()
      this.addGroupDialog = false
    }
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

<style lang="scss" scoped>
.imgName{
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1E6FFF;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-size: 12px;
}
.dialog-message-box{
  ::v-deep.el-dialog{
    box-shadow: 0px 0px 8px rgba(31, 35, 38, 0.08);
    opacity: 1;
    border-radius: 8px;
    .el-dialog__header{
      background: none;
      font-size: 18px;
      font-weight: 500;
    }
    .el-dialog__body{
      padding: 24px 30px 30px;
      .group-list-container{
        margin-top: 0;
        .group-list-row2{
          border-bottom: 0;
          height: 40px;
          opacity: 1;
          border-radius: 4px;
          font-size: 14px;
          padding: 0 10px;
          img{
            width: 14px;
            margin-left: 10px;
          }
          &:hover{
            background: #F5F6F7;
          }
        }
        .group-list-row{
          width: 112px;
          height: 32px;
          border: 1px solid #3370FF;
          opacity: 1;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          img{
            width: 14px;
            margin-right: 10px;
          }
          .group-list-row-title{
            font-size: 14px;
            color: #3370FF;
            
          }
        }
      }
    }
  }
}
.bottom-style{
  display: inline-block;
  margin-top: 20px;
  height: 32px;
.flex-space-between{
  display: flex;
  justify-content: center;
  align-items: center;
  .el-button{
    font-size: 14px;
    border-radius: 6px;
  }
  .addGroup-text{
    font-size: 14px;
    font-family: SourceHanSansCN-Normal;
    color: #3370FF;
  }
  }
}
.mail-selected-list{
  padding-right: 0;
  .selected-inner{
    padding-left: 10px;
    padding-right: 3px;
  }
}
.mail-selected-list .selected-item .selected-inner{
  background: transparent;
}
.selected-list-outer{
  margin-right:15px
}
.mail-collapse2{
  justify-content:left;
}
.user-active{
  border: 1px solid #D0D3D6;
  width: 14px;
  height: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
    font-size: 6px;
  .user-unchecked{
    display: none;
  }
  .user-checked{
    color: white !important;
    background: #3370FF;
    width: 100%;
    height: 100%;
    display: flex;
  justify-content: center;
  align-items: center;
  }
}
.ellipsis{
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 8px 0;
  flex: 1;
  img{
    width: 32px;
    height: 32px;
    border-radius: 22px;
    margin-right: 10px;
  }
}
.user-mail{
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 8px 0;
  width: auto;
  flex: 1;
  img{
    width: 32px;
    height: 32px;
    border-radius: 22px;
    margin-right: 10px;
  }
}
.collapse-title {
    flex: 1 0 90%;
    order: 1;
  
}

.el-collapse-item__header {
    flex: 1 0 auto;
    order: -1;
}
::v-deep .el-icon-arrow-right{
  color: #8F959E !important;
}
::v-deep .el-icon-arrow-right:before {
        content: '' !important;
    }
</style>
