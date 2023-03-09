<template>
  <div class="group-list-container">
    <div class="group-list-row cursor" @click="handleShowAddGroupDialog('add')" v-if="userList">
      <!-- <i class="el-icon-circle-plus-outline add-circle-btn"></i> -->
      <img src="@/assets/img/icon/mail/plusSign.png" alt="">
      <span class="group-list-row-title">添加分组</span>
    </div>
    <div class="group-list-row2 cursor"
         v-for="item in groups"
         :key="item.id">
      <span @click="handleAddToGroup(item)" class="group-list-row-title">{{ item.name }}</span>
      <!-- <i class="el-icon-edit group-action-edit-btn" @click="handleEditGroup(item)"></i>
      <i class="el-icon-delete group-action-btn" @click="handleDelGroup(item)"></i> -->
      <img src="@/assets/img/icon/mail/redact.png" alt="" @click="handleEditGroup(item)" v-if="userList">
      <img src="@/assets/img/icon/mail/delete.png" alt="" @click="handleDelGroup(item)" v-if="userList">
    </div>
    <!-- 添加分组 -->
    <el-dialog append-to-body
               width="30%"
               :before-close="handleCloseAddGroupDialog"
               class="dialog-message-box add-group-dialog"
               :visible.sync='addGroupDialog'
               :close-on-click-modal="false">
               <div slot="title" class="dialog-header-row">
                  <!-- <div class="dialog-tip"></div> -->
                  <span class="el-dialog__title">{{ actionMode === 'add' ? '添加分组' : '编辑分组' }}</span>
                </div>
      <div class="add-group-container">
        <!-- <div class="add-group-title">{{ actionMode === 'add' ? '添加分组' : '编辑分组' }}</div> -->
        <div class="add-group-sub">{{ actionMode === 'add' ? '分组名称' : '编辑分组名称' }}</div>
        <el-input
          placeholder="请输入分组名"
          v-model="form.name"
          clearable>
        </el-input>
      </div>
      <div class="flex-center" style="margin-top: 35px;margin-bottom: 10px;">
        <div class="add-group-footer-btn cursor qx"
             @click="handleCloseAddGroupDialog"
              >取消</div>
        <div class="add-group-footer-btn cursor qd"
             @click="handleAddGroupSubmit"
             >确定</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { queryGroup, saveOrUpdateGroup, delGroupItem, unGroupAdd } from "@/api/mail"
import { hasBlank } from "@/utils/validate"

export default {
  name: "addGroup",
  props: {
    // 要添加列表
    selectedList: {
      type: Array,
      default: () => []
    },
    userListsSelected: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      groups: [
        // {id: '', name: 'xxx'}
      ],
      form: {
        name: ''
      },
      addGroupDialog: false,
      actionMode: '', // ['edit': 编辑, 'add': 添加]
      userList:true
    }
  },
  watch: {
    userList (val) {
　　　 this.userList = val;
　　 },
      groups :{
        deep:true,
        handler(val){
          this.groups = val;
        }
　　 },
  }, 
  mounted() {
    this.userList=this.userListsSelected.length==0?true:false
    this.handleQueryGroup()
    // console.log(this.userListsSelected,'123sadzlcv')
  },
  methods: {
    // 获取邮件分组信息
    handleQueryGroup() {
      queryGroup().then(res => {
        if (res.data.code === 200) {
          this.groups = res.data.data
          this.groups.reverse().reverse()
          this.$forceUpdate()
          // console.log(this.groups,'caonima')
        }
      })
    },
    // 删除分组
    handleDelGroup(group) {
      this.$msgbox({
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">确定删除该分组吗？</span>
            </div>
          </div>
          `,
        dangerouslyUseHTMLString: true,
        customClass: 'customMsgBoxDel',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: 'confirmBtn cancelButtonqd',
        cancelButtonText: '取消',
        cancelButtonClass: 'confirmBtn cancelButtonqx',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            // instance.confirmButtonText = '执行中...'
            
            delGroupItem(group.id).then(res => {
              if (res.data.code === 200) {
                this.$message.success('删除成功')
              instance.confirmButtonLoading = false
              this.handleQueryGroup()
              }else{
                this.$message.error(res.data.msg)
              }
            }).finally(() => {
              done()
              instance.confirmButtonLoading = false
            })
          } else {
            done()
          }
        }
      }).then(action => {
      }).catch(e => {})
      // delGroupItem(group.id).then(res => {
      //   if (res.data.code === 200) {
      //     this.$message.success('添加成功')
      //     this.handleQueryGroup()
      //     this.handleCloseAddGroupDialog()
      //   }else{
      //     this.$message.error(res.data.msg)
      //   }
      // })
    },
    // 编辑组
    handleEditGroup(group) {
      this.form = {
        id: group.id,
        name: group.name
      }
      this.actionMode = 'edit'
      this.addGroupDialog = true
    },
    // 添加到组
    handleAddToGroup(item) {
      if (this.selectedList.length === 0) {
        this.$message.error('请先选择要将分组的邮箱')
        return
      }

      this.$msgbox({
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">确定将邮箱账号移动到“<span style='color:#3370FF'>${item.name}</span>”吗？</span>
            </div>
          </div>
          `,
        dangerouslyUseHTMLString: true,
        customClass: 'customMsgBox',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: 'confirmBtn confirmButton',
        cancelButtonText: '取消',
        cancelButtonClass: 'confirmBtn cancelButton',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            // instance.confirmButtonText = '执行中...'
            const data = {
              id: item.id,
              list: this.selectedList
            }
            unGroupAdd(data).then(res => {
              if (res.data.code === 200) {
                this.$message.success('分组成功')
                this.$nextTick(() => {
                  this.handleQueryGroup()

                });
              instance.confirmButtonLoading = false

              }else{
                this.$message.error(res.data.msg)
              }
            }).finally(() => {
              done()
              instance.confirmButtonLoading = false
            })
          } else {
            done()
          }
        }
      }).then(action => {
      }).catch(e => {})
    },
    handleAddGroupSubmit() {
      const actionMode = this.actionMode
      console.log(this.form)
      if (hasBlank(this.form.name)) {
        this.$message.error('请输入正确的分组名称')
        return
      }
      const data = this.form
      saveOrUpdateGroup(data).then(res => {
        if (res.data.code === 200) {
          this.$message.success(actionMode === 'add' ? '添加成功' : '修改成功')
          this.handleQueryGroup()
          this.handleCloseAddGroupDialog()
        }else{
          this.$message.error(res.data.msg)
        }
      })
    },
    handleShowAddGroupDialog(add) {
      this.addGroupDialog = true
      this.actionMode=add
    },
    handleCloseAddGroupDialog() {
      this.addGroupDialog = false
      this.form = {}
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep.customMsgBox{
  box-shadow: 0px 0px 8px rgba(31, 35, 38, 0.08);
  opacity: 1;
  border-radius: 8px !important;
}
.add-group-dialog{
  ::v-deep.el-dialog{
    background: #FFFFFF;
    box-shadow: 0px 0px 8px rgba(31, 35, 38, 0.08);
    opacity: 1;
    border-radius: 8px;
    .el-dialog__body{
      padding: 24px 30px 20px;
      .flex-center{
        justify-content: flex-end;
        .qx{
          width: 84px;
          height: 32px;
          border: 1px solid #DEE0E3;
          opacity: 1;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          color: #404758;
          margin-right: 10px;
        }
        .qd{
          width: 84px;
          height: 32px;
          background: #3370FF;
          opacity: 1;
          border-radius: 4px;
          font-size: 14px;
        }
      }
      .add-group-container{
        text-align: left;
        .el-input--suffix{
          margin-top: 10px;
          height: 32px;
          .el-input__inner{
            height: 32px;

          }
        }
        .add-group-sub{
          margin-top: 0;
          color: #646A73;
          font-size: 14px;
        }
      }
    }
    .el-dialog__header{
      background: none;
      font-weight: 500;
    }
  }
}
</style>
