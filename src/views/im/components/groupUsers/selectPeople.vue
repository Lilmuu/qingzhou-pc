<!--选择人-->
<template>
  <div>
    <div class="content">
      <div class="member-content">
        <el-input v-model="queryMember" placeholder="请输入用户名查询" @input="handleChange">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <div class="member-content-scroll">
          <div class="member-content-item" v-for="(item, key) in memberList" :key="key" @click="handleCheck(item)">
            <div style="display: flex;align-items: center;padding: 3px 0;">
              <!-- <Avatar :username="item.name" :size="28" style="font-size: 11px;margin-right: 10px;"></Avatar> -->
              <headAvatar 
                :size="32" 
                :fontSize='12'
                style="font-size: 11px;margin-right: 10px;"
                :avatarUrl="item.headImage ? item.headImage: ''" 
                :username="item.name">
              </headAvatar>
              <span class="im-userName ellipsis" style="max-width: 80px;">{{ item.name }}</span>
            </div>
            <div class="user-active">
              <i class="el-icon-success user-checked" v-if="item.isCheck"></i>
              <i class="el-icon-success user-unchecked" v-else-if="item.disabled"></i>
              <div style="border: #c0c4cc 1px solid; height: 20px; width: 20px; border-radius: 10px;" v-else></div>
            </div>
          </div>
        </div>
      </div>
      <div style="height: 100%; width: 1px; background-color: #DCDCDC;"/>
      <div class="member-selected">
        <div class="is-selected">
          已选择 （{{ selectedMembers.length }}）
        </div>
        <div class="selected-member-cont">
          <div class="selected-member">
            <div class="selected-member-item" v-for="(item, key) in selectedMembers" :key="key">
              <!-- <Avatar :username="item.name" :size="28" style="font-size: 11px;margin-right: 6px;"></Avatar> -->
              <headAvatar 
                :size="32" 
                :fontSize='12'
                style="font-size: 11px;margin-right: 6px;"
                :avatarUrl="item.headImage ? item.headImage: ''" 
                :username="item.name">
              </headAvatar>
              <span class="im-userName ellipsis" style="max-width: 80px;">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-btn">
      <el-button @click="selectCancel" size="small" style="width: 120px;">取消</el-button>
      <el-button type="primary" size="small" @click="handleSubmit" style="width: 120px;">确定</el-button>
    </div>
  </div>
</template>

<script>
import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar";
export default {
  name: "selectPeople",
  components: { headAvatar },
  props: {
    members: {
      type: Array,
    },
    busyMembers: {
      type: Array,
    },
    visible: {
      type: Boolean,
    },
    meId: {
      type: Number,
    }
  },
  data() {
    return {
      selectedMembers: [],
      memberList: [],
      queryMember: ''
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.queryMember = ''
        this.getMembers()
      } else {
        this.selectedMembers = []
        this.memberList = []
      }
    }
  },
  created() {
    this.getMembers()
  },
  methods: {
    // 判断是否忙线
    isBusy(userId) {
      console.log(this.busyMembers)
      const index = this.busyMembers.findIndex(item => {
        return item.imUserId === userId
      })
      return index !== -1
    },
    // 查询输入框 change
    handleChange(e) {
      if (e.length !== 0) {
        let reg = new RegExp(e) //声明正则变量
        const arr = this.memberList.filter(item => reg.test(item.name)) //返回
        this.memberList = [...arr]
      } else {
        this.getMembers()
      }
    },
    // 获取成员列表
    getMembers() {
      const arr = [...this.members]
      this.memberList = arr.map(item => {
        return { name: item.nickname, id: item.userId, isCheck: false, disabled: item.userId === this.meId || this.isBusy(item.userId) }
      })
      const arrTemp = [...this.memberList]
      this.selectedMembers = arrTemp.filter(item => {
        return item.isCheck || item.id === this.meId
      })
      // this.selectedMembers = this.busyMembers.map(item => {
      //   return { name: item.userName }
      // })
      console.log(this.selectedMembers)
      this.$forceUpdate()
    },
    // 关闭成员选择弹窗
    selectCancel() {
      this.$emit('handleCloseMember')
    },
    // 成员选择提交
    handleSubmit() {
      this.$emit('memberSubmit', this.selectedMembers)
    },
    // 选择成员
    handleCheck(obj) {
      if (obj.disabled) {
        if (obj.id !== this.meId) {
          this.$message.warning('该成员正在通话')
        }
        return
      }
      obj.isCheck = !obj.isCheck
      if (obj.isCheck) {
        this.selectedMembers.push(obj)
      }
      if (!obj.isCheck) {
        const index = this.selectedMembers.findIndex(temp => {
          return temp.name === obj.name
        })
        this.selectedMembers.splice(index, 1)
      }
    },
  }
}
</script>

<style lang="scss" scoped>
::v-deep.content{
  height: 400px;
  border-top: 1px solid #DCDCDC;
  border-bottom: 1px solid #DCDCDC;
  display: flex;
  .member-content{
    width: 50%;
    padding: 10px 20px 10px 0;
    .el-input{
      margin-bottom: 10px;
      .el-input__inner{
        background-color: #f5f5f5;
        border-radius: 20px;
      }
    }
    .el-input.is-active .el-input__inner, .el-input__inner:focus{
      border-color: #DCDFE6;
    }
    .member-content-scroll{
      height: 320px;
      overflow-y: auto;
      .member-content-item{
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 6px 0;
        padding-right: 8px;
        .user-active {
          .el-icon-success {
            font-size: 20px;
          }
          .user-checked {
            color: #3471FF;
          }
          .user-unchecked {
            color: #c0c4cc;
          }
        }
      }
    }
  }
  .member-selected{
    width: 50%;
    padding: 10px 0 10px 20px;
    .selected-member-cont{
      height: 328px;
      overflow-y: scroll;
      overflow-x: hidden;
    }
    .selected-member{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      max-height: 310px;
      overflow-y: auto;
      padding-right: 6px;
      .selected-member-item {
        display: flex;
        align-items: center;
        height: 40px;
        //justify-content: center;
        width: 140px;
        padding: 6px 0 6px 8px;
        margin-bottom: 8px;
        background-color: #F5F5F5;
      }
    }
    .is-selected{
      margin-bottom: 20px;
      font-size: 16px;
      height: 40px;
      line-height: 40px;
    }
  }
}
::v-deep.footer-btn{
  margin-top: 20px;
  text-align: right;
}
</style>
