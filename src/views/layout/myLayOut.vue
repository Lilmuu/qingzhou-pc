<template>
  <div class="main-view-container">
    <div class="left-container">
      <!-- <AddBtn @click="handleAddTask" /> -->
      <div class="task_title">任务</div>
      <SearchAdd @click="handleAddTask" :activeName="activeName"></SearchAdd>
      <div class="task_leftNav">
        <li 
          @click="activeName = router.path" 
          role="menuitem" 
          tabindex="-1" 
          :class="['el-menu-item el-menu-item-li', activeName === router.path ? 'el-menu-item-li_active menu_item_border_active' : 'menu_item_border' ]" 
          v-for="(router, index) in routerLists" 
          :key="'routerlist' + index"
          style="margin-bottom:2px;">
          <div :class="['flex-center menu-item-row', activeName === router.path ? 'menu-item-active' : '']">
            <img class="menu_icon" :src="activeName === router.path ? router.activeIcon : router.icon" alt="">
            <span class="menu-text">{{ router.title }}</span>
            <span class="unreaderCount" v-if="(router.path === 'myTodo' || router.path === 'takeCare') && unreadCount > 0">{{ unreadCount > 99 ? 99 : unreadCount }}</span>
          </div>
        </li>
      </div>
    </div>
    <div class="right-container">
      <!-- <myTodo ref="myTodo" @changeRoute="changeRoute" v-if="activeName === 'myTodo'"></myTodo>
      <myExec ref="myExec" v-if="activeName === 'myExec'"></myExec>
      <myReport ref="myReport" v-if="activeName === 'myReport'"></myReport>
      <myFollow ref="myFollow" v-if="activeName === 'myFollow'"></myFollow> -->
      <takeCare ref="takeCare" v-if="activeName === 'takeCare'"></takeCare>
      <taskR ref="taskR" v-if="activeName === 'taskR'"></taskR>
      <!-- 目标管理 -->
      <myTarget v-if="activeName === 'myTarget'"></myTarget>
    </div>
    <el-dialog append-to-body
      :visible.sync='addTaskDialog'
      custom-class="task_new_set_up"
      :close-on-click-modal="false" id="addNewTaskNew">
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">新建任务</span>
      </div>
      <!-- 新版添加任务 -->
      <addNewTaskNew  mode="add" @success="successCb" :flag="1" v-if="addTaskDialog"></addNewTaskNew>
    </el-dialog>
  </div>
</template>

<script>
// import myTodo from "@/views/myTodo/index"
// import myReport from "@/views/myReport/index"
// import myFollow from "@/views/myFollow/index"
// import myExec from "@/views/myExec/index"
// import addNewTask from "@/views/myTodo/components/addNewTask"

import myTarget from '@/views/myTarget/index'
import addNewTaskNew from "@/views/myTodo/components/addNewTaskNew"
// 以前的添加任务按钮
// import AddBtn from "@/components/AddBtn"
import SearchAdd from '@/components/Search/index'
// 新的组件
import takeCare from '@/views/takeCare/index'
import taskR from '@/views/taskR/index'
import { mapState } from "vuex"

export default {
  name: "myLayOut",
  components: {
    // myTodo,
    // myReport,
    // myFollow,
    // myExec,
    // addNewTask,
    addNewTaskNew,
    SearchAdd,
    takeCare,
    taskR,
    myTarget
    // AddBtn
  },
  data() {
    return {
      activeName: 'takeCare',
      addTaskDialog: false,
      routerLists: [
        { path:'myTarget', title:'目标管理', icon:require('@/assets/img/mytodo/target.png'), activeIcon: require('@/assets/img/mytodo/target_sel.png')},
        { path:'takeCare', title:'待我处理', icon:require('@/assets/img/mytodo/takeCare.png'), activeIcon: require('@/assets/img/mytodo/takeCare_sel.png')},
        { path:'taskR', title:'任务查询', icon:require('@/assets/img/mytodo/taskR.png'), activeIcon: require('@/assets/img/mytodo/taskR_sel.png')},
        // { path: 'myTodo', title: '待我处理', icon: require('@/assets/img/icon/myTodo.png'), activeIcon: require('@/assets/img/icon/myTodo_active.png') },
        // { path: 'myExec', title: '我执行的', icon: require('@/assets/img/icon/myExec.png'), activeIcon: require('@/assets/img/icon/myExec_active.png') },
        // { path: 'myReport', title: '我发起的', icon: require('@/assets/img/icon/myReport.png'), activeIcon: require('@/assets/img/icon/myReport_active.png') },
        // { path: 'myFollow', title: '我关注的', icon: require('@/assets/img/icon/myFollow.png'), activeIcon: require('@/assets/img/icon/myFollow_active.png') }
      ]
    }
  },
  computed: {
    ...mapState({
      unreadCount: state => state.user.unreadCount
    })
  },
  methods: {
    handleAddTask() {
      this.addTaskDialog = true
    },
    // 添加成功回调
    successCb() {
      const activeName = this.activeName
      this.addTaskDialog = false
      // 添加成功后自动刷新
      if (this.$refs[`${activeName}`]) {
        this.$refs[`${activeName}`].getList()
      }
    },
    // 更改页面
    changeRoute(routerName) {
      this.activeName = routerName
    },
    changeUnreadCount(count) {
      this.unreadCount = count
    }
  }
}
</script>

<style lang="scss" scoped>
.main-view-container {
  display: flex;
  .left-container {
    width: 260px!important;
    background: #FFFFFF;
    height: calc(100vh - 42px);
    padding: 24px 10px 0;
    .task_title{
      color: #0F1633;
      font-size: 20px;
      line-height: 20px;
      margin-bottom: 20px;
      cursor: default;
    }
    .task_leftNav{
      width: 240px;
      color: #1F2329;
      margin-top: 26px;
      font-size: 14px;
      font-family: SourceHanSansCN-Normal;
      ::v-deep .el-menu-item:hover{
        border-radius:6px;
      }
    }
  }

  .right-container {
    width: calc(100vw - 260px - 80px);
    background: #FBFBFC;
  }
  .el-menu-item-li {
    display: flex;
    align-items: center;
    padding-left: 15px;
    color: #222222;
    .menu-text {
      margin-left: 10px;
    }
    .menu-item-active {
      display: flex;
      align-items: center;
    }
    .menu_icon{
      width: 16px;
    }
  }
  .menu_item_border_active{
    border: none;
  }
  .el-menu-item-li_active {
    border-radius: 6px;
    background: #F5F6F7;
    color: #3370FF;
  }
  .el-menu-item:hover{
    background: #F5F6F7;
  }
}
</style>
