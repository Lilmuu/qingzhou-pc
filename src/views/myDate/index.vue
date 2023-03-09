<!--日历-->
<template>
  <div id="myDate">
    <div class="left-container">
      <!-- 搜索 -->
      <div class="date-search-row ">
        <div class="task_title">日程</div>
        <!-- <SearchAdd activeName="myTarget"></SearchAdd> -->
      </div>
      <!-- 小日历  -->
      <Calendar :sundayStart='true'
        :textTop="['日','一','二','三','四','五','六']"
        @choseDay="handleChoseDay"
        @changeMonth="changeDate"></Calendar>
      <div class="line"></div>
      <div class="task_select">
        <div class="see">查看任务</div>
        <div v-for="(item, index) in selectLists" :key="item.value" class="column-el-checkbox-group normal-el-checkbox">
          <el-checkbox class="item_checkbox" @change="handleChecked(index)" :checked="item.checked">{{ item.label }}</el-checkbox>
        </div>
      </div>
      <div class="line"></div>
      <div class="r-container">
        <div class="r-title">汇报申请：</div>
        <template v-if="reportList.length === 0">
          <span>暂无数据</span>
        </template>
        <template v-else>
          <div class="r-item ellipsis hoverItem"
            v-for="(item, index) in reportList"
            @click="handleShowReport(item)"
            :key="'reportList' + index">{{ index + 1 }}、{{ item.initiator }} 申请汇报
          </div>
        </template>
      </div>
    </div>
    <div class="right-container">
      <DatePicker
        ref="datePicker"
        :propsTime="time"
        :options="calendarArr"
        :selectListsStr="selectListsStr"
        class="calendar"
        @changeActiveUser="changeActiveUser"
        @changeDateType="changeDateType"
        @handleClickDay="handleClickDay"
        @handleClickTask="handleClickTask"
        @handleAddTask="handleAddTask"
        @handlePrevMonth="handlePrevMonth"
        @handleNextMonth="handleNextMonth"/>
    </div>
    <!--  申请添加浮动按钮  -->
    <div class="fixed-add-icon flex-center cursor"
      @click="handleAddTask"
      v-if="!!userId && String(activeUser.id) !== String(userId)">
      <i class="el-icon-plus"></i>
    </div>
    <el-drawer
      ref="drawer"
      :before-close="handleClose"
      :visible.sync="dialog"
      :show-close="false"
      :withHeader="false"
      custom-class="normal-drawer"
      direction="rtl"
      >
      <div class="drawer-inner-custom" :class="topTabActiveName === 'rwxq' && drawer ? 'paddingRight0' : ''" v-if="dialog" style="position: relative;">
        <TabLabel :init-active-name="topTabActiveName" :option="tabOption" @tabChange="tabChange" :useActiveClass="useActiveClass" @closeCustomDialog="dialog = false"/>
        <DrawerDetail :row="rowData"
          ref="drawerDetail"
          class="dateDrawerDetail"
          :drawer="drawer"
          :isOtherTask="isOtherTask"
          :isShowTips="isShowTips"
          :isDate="isDate"
          v-if="topTabActiveName === 'rwxq' && drawer"
          @change="changeTags"
          @refrsh="handleRefresh" />
        <MyToDoView class="dateTodoView" v-if="topTabActiveName=== 'rwst' && drawer" :taskId="rowData.id" @close="closeDrawer" />
        <!-- 任务详情 - 汇报申请详情 -->
        <ReportView v-if="topTabActiveName === 'hbsqxq'"
          :row="rowData"
          :isDate="isDate"
          :isOtherTask="isOtherTask"
          @closeRemind="closeRemind"
          @success="handleSuccessCb"
          @close="closeDrawer" />
        <!-- 任务详情通用
         * taskRemind       个人提醒详情
         * businessTrip     出差详情
         * meeting          会议详情
         -->
        <TaskRemind :taskType="topTabActiveName"
          :row="rowData"
          :isDate="isDate"
          :isOtherTask="isOtherTask"
          @closeRemind="closeRemind"
          @success="handleSuccessCb"
          @close="closeDrawer"
          v-if="topTabActiveName === 'taskRemind' || 
              topTabActiveName === 'businessTrip' || 
              topTabActiveName === 'meeting'"/>
      </div>
    </el-drawer>
    <!-- 新建任务 汇报交流申请  -->
    <el-dialog 
      width="680px"
      :visible.sync='addTaskDialog'
      :close-on-click-modal="false"
      :show-close="false"
      top="0"
      class="select-dialog">
      <DialogHeader title="汇报交流" slot="title" @closeCustomDialog="addTaskDialog = false"></DialogHeader>
      <AddDateTask v-if="addTaskDialog"
        :activeUser="activeUser"
        @success="addTaskDialog = false"
        @close="addTaskDialog = false" />
    </el-dialog>
  </div>
</template>

<script>
import Calendar from 'vue-calendar-component'
import DatePicker from './components/date-picker'
import MyToDoView from "@/views/myTodo/components/myToDoView"
import TabLabel from "@/components/TabLabel/TabLabel"
import dayjs from 'dayjs'
import * as utils from "@/views/myDate/components/utils"
import ReportView from "@/views/myDate/components/reportView";
import AddDateTask from "@/views/myDate/components/addDateTask";
import searchEmpty from "@/components/Search/searchEmpty";
import { closeSchedule, getReportList, searchByWord } from "@/api/calendar";
import DrawerDetail from "@/components/drawerDetail";
import TaskRemind from "@/views/myDate/components/taskRemind";
import { mapState } from "vuex";
import { userBasic } from "@/api/user";
import DialogHeader from '@/components/dialogHeader'

import SearchAdd from '@/components/Search/index'

const tabOption = [
  { label: '任务详情', name: 'rwxq' },
  { label: '任务视图', name: 'rwst' },
]

const taskType = [
  { background: '#3370FF', label: '工作任务', value: 'task', checked: true },
  { background: '#F54A45', label: '会议', value: 'meeting', checked: false }, // 
  { background: '#47D4D5', label: '出差', value: 'businessTrip', checked: false }, // 
  { background: '#FE8D0C', label: '汇报交流', value: 'taskCalendarReport', checked: true },
  { background: '#41CC33', label: '个人提醒', value: 'taskRemind', checked: true }
]

const myUserData = {
  id: localStorage.getItem('USERID'),
  realName: localStorage.getItem('USERNAME'),
}

export default {
  name: 'myDates',
  data() {
    const { year, month, day } = utils.getNewDate(new Date())
    return {
      selectLists: [],
      time: { year, month, day },
      dateType: 'week',
      searchVal: '',
      calendarArr: {
        type: 'combination',
        headStyle: {
          todayBtn: 'right',
          combination: 'left',
          checkBtn: 'right'
        },
        viewStyle: {
          day: 'left'
        },
        calendarData: []
      },
      dialog: false,
      showSearchTip: false,
      searchData: true,
      searchTableData: [],
      searchActive: -1,
      rowData: {}, // 行数据
      topTabActiveName: 'rwxq',
      tabOption: JSON.parse(JSON.stringify(tabOption)),
      addTaskDialog: false,
      showAddNewTask: false, // 是否显示添加任务底部
      reportList: [],
      activeUser: JSON.parse(JSON.stringify(myUserData)),     // 默认用户为自己
      drawer: false,
      isShowTips: true,
      isDate: true,
      useActiveClass: true,
    }
  },
  components: {
    Calendar,
    DatePicker,
    TabLabel,
    ReportView,
    AddDateTask,
    searchEmpty,
    DrawerDetail,
    MyToDoView,
    TaskRemind,
    SearchAdd,
    DialogHeader
  },
  computed: {
    ...mapState({
      userId: state => state.user.userId,
      level: state => state.user.level,
    }),
    // 选中转字符串
    selectListsStr() {
      const selected = this.selectLists.filter(item => item.checked)
      const lists = selected.map(item => item.value)
      return lists.join(';')
    },
    // 否为他人
    isOtherTask() {
      return !!this.userId && String(this.activeUser.id) !== String(this.userId)
    }
  },
  mounted() {
    this.selectLists = taskType
    this.handleGetReportList()
    // 每次进入更新 user level
    this.getUserBaseInfo()
  },
  methods: {
    handleAddTask() {
      this.addTaskDialog = true
    },
    handleChecked(index) {
      this.selectLists[index].checked = !this.selectLists[index].checked
    },
    // 左边日历选中某一天
    handleChoseDay(date) {
      console.log(this.dateType)
      if (this.dateType === 'month') {
        this.handleClearDayStyle()
        return
      }
      this.time = {
        year: dayjs(date).year(),
        month: dayjs(date).month(),
        day: dayjs(date).date()
      }
    },
    // 左右点击切换月份
    changeDate(date) {
      this.time = {
        year: dayjs(date).year(),
        month: dayjs(date).month(),
        day: dayjs(date).date()
      }
      this.handleClearDayStyle()
    },
    changeDateType(dateType) {
      this.dateType = dateType
      this.handleClearDayStyle()
    },
    handleClickDay() {

    },
    handlePrevMonth() {

    },
    handleNextMonth() {
    },
    handleShowSearchTip() {
      this.searchActive = -1
      if (this.searchVal) {
        this.showSearchTip = true
        this.searchList()
      }
    },
    handleCloseSearchTip() {
      this.showSearchTip = false
    },
    changeItemActive(index, item){
      this.searchActive = index
      this.handleClickTask(item, false)
    },
    changeActiveUser(activeUser) {
      this.activeUser = activeUser
    },
    // 获取汇报交流申请列表
    handleGetReportList() {
      getReportList().then(res => {
        if(res.data.code === 200) {
          this.reportList = res.data.data
        }
      })
    },
    // 搜索
    searchList(){
      if (this.searchVal) {
        searchByWord({ searchWord: this.searchVal }).then(res => {
          if (res.data.code === 200) {
            this.searchTableData = res.data.data
            if (this.searchTableData.length) {
              this.searchData = true
            } else {
              this.searchData = false
            }
          }
        }).finally(() => {
          this.searchData = true
        })
      } else {
        this.searchData = true
        this.searchTableData = []
      }
    },
    // 去掉今日样式
    handleClearDayStyle() {
      if (this.dateType === 'month') {
        setTimeout(() => {
          const el = document.querySelector('.wh_chose_day')
          if (el) {
            el.classList.remove('wh_chose_day')
          }
        }, 10)
      }
    },
    tabChange(item) {
      this.topTabActiveName = item.name
    },
    handleClose() {
      this.dialog = false
    },
    handleSuccessCb() {
      this.handleGetReportList()
      this.successCb()
      this.dialog = false
    },
    /**
     * 点击任务查看详情
     * @param   {Object}    task        任务数据
     * @param   {Boolean}   checkLevel  是否需要进行权限验证
     * */
    async handleClickTask(task, checkLevel = true) {
      console.log('handleClickTask', task)
      if(!this.userId) return
      //  查看的是别人的任务, 判断用户等级, 打开新建汇报
      const userBasicInfo = await userBasic(this.activeUser.id)
      const userLevel = userBasicInfo.data.data.level || 999
      if (checkLevel && !!this.userId && String(this.activeUser.id) !== String(this.userId)) {
        // 等级比自己高，无法查看， 打开新建汇报
        if (userLevel < this.level) {
          this.handleAddTask()
          return
        }
      }
      this.rowData = task
      this.dialog = true
      this.isDate = true
      this.drawer = true
      this.extraData = {}
      // 任务详情 - 汇报申请详情
      if (task.from === "taskCalendarReport") {
        this.topTabActiveName = 'hbsqxq'
        this.tabOption = [{ label: '汇报详情', name: 'rwxq' }]
        this.useActiveClass = false
      } else if (task.from === "taskRemind" || task.from === "businessTrip" || task.from === "meeting") {
        // 个人提醒详情、出差详情、会议详情 通用
        this.topTabActiveName = task.from
        this.tabOption = [{ label:this.topTabActiveName === 'taskRemind' ? '日程详情' : this.topTabActiveName === 'businessTrip' ? '出差详情' : '会议详情', name: task.from }]
        this.useActiveClass = false
      } else {
        // 任务详情
        this.topTabActiveName = 'rwxq'
        this.isShowTips = true
        this.tabOption = JSON.parse(JSON.stringify(tabOption))
        this.useActiveClass = true
      }
    },
    changeTags(val) {
      this.isShowTips = val ? true : false
    },
    closeDrawer() {
      this.dialog = false
    },
    handleRefresh() {
      console.log('handleRefresh')
    },
    successCb() {
      this.addTaskDialog = false
      // 重新获取数据
      this.$refs.datePicker.getMyCalendar()
      this.$refs.datePicker.getDayCalendar()
    },
    // 显示 汇报申请详情 drawer
    handleShowReport(item) {
      if(this.$refs.datePicker && this.$refs.datePicker.showScheduleStatus){
        this.$refs.datePicker.closescheduleDialog()
        return
      }
      this.tabOption = [
        { label: '汇报申请', name: 'hbsqxq' }
      ]
      this.rowData = item
      this.topTabActiveName = 'hbsqxq'
      this.dialog = true
    },
    closeRemind() {
      const data = this.rowData
      closeSchedule(data).then(res => {
        if (res.data.code === 0) {
          this.rowData.close = true
          this.$message.success('关闭提醒成功')
          this.handleSuccessCb()
        }
      })
    },
    // 更新 level
    async getUserBaseInfo() {
      if (!this.userId) return
      const userBasicInfo = await userBasic(this.userId)
      const userLevel = userBasicInfo.data.data.level || 999
      this.$store.commit('SET_LEVEL', userLevel)
    }
  },
  watch: {
    'searchVal'(newVal, oldVal) {
      if (newVal) {
        this.showSearchTip = true
      } else {
        this.showSearchTip = false
      }
      this.searchList()
    }
  },
}
</script>

<style lang="scss">
#myDate {
  display: flex;
  cursor: default;
  .task_title{
    color: #0F1633;
    font-size: 20px;
    line-height: 20px;
    margin-bottom: 5px;
    cursor: default;
  }
  .left-container {
    padding: 24px 10px;
    width: 260px;
    overflow: hidden;
    background: #F5F6F7;
    user-select: none;
    height: calc(100vh - 42px);
    .searchBox_left{
      border: none;
    }
    input.el-input__inner{
      height: 30px !important;
      line-height: 30px !important;
      border: 1px solid #BBBFC4;
      border-radius: 6px!important;
      background-color: #FFFFFF;
      padding-right: 15px;
      font-size: 12px;
    }
    input::-webkit-input-placeholder {
      color: #8F959E;
    }
    .el-icon-search {
      width: 14px;
    }
    span{
      font-size: 13px;
      color: #BFBFBF;
    }
    .search_icon {
      width: 14px;
      height: 14px;
    } 
    .date-search-row {
      font-size: 19px;
      font-weight: 500;
      color: #222222;
      line-height: 20px;
      .el-input{
        z-index: 10;
      }
      .el-input__inner {
        border-radius: 25px;
      }
    }
  }
  .right-container {
    width: calc(100% - 220px);
    background: #fff;
  }
  .fixed-add-icon {
    position: absolute;
    right: 20px;
    bottom: 50px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    box-shadow: 0 2px 4px 0 rgb(84 86 94 / 50%);
    background: #3471FF;
    z-index: 2;
    .el-icon-plus {
      font-size: 30px;
      color: #fff;
    }
  }
  .wh_container {
    width: 100%;
    margin: 0;
  }
  .line {
    border-bottom: 1px solid #DCDCDC;
    margin: 0;
  }
  .wh_content_li{
    justify-content: flex-start;
    color: #1F2329;
    font-size: 14px;
    width: calc(100% - 36px);
  }
  .wh_jiantou1 {
    width: 10px;
    height: 10px;
    margin-left: 2px;
    margin-right: 12px;
  }
  .wh_jiantou2 {
    width: 10px;
    height: 10px;
    margin-right: 2px
  }

  .task_select{
    margin: 23px 0 20px 0;
    .see{
      margin-bottom: 10px;
      font-size: 14px;
      color: #1F2329;
    }
    .item_checkbox .el-checkbox__inner{
      box-sizing: content-box;
      border-radius: 50%;
    }
    .el-checkbox__inner::after{
      top: 2px;
      left: 5px;
    }
    .column-el-checkbox-group {
      display: flex;
      flex-direction: column;
      
      font-size: 14px;
      .el-checkbox__label{
        font-size: 14px;
        color: #1F2329;
      }
    }
    .column-el-checkbox-group:hover{
      border-radius: 6px;
      background-color: #E4E6E7;
    }
    .column-el-checkbox-group .el-checkbox {
      padding: 5px;
    }
    .column-el-checkbox-group:nth-child(2){
      .el-checkbox__inner{border: 1px solid #3370ff;}
      .el-checkbox__input.is-checked .el-checkbox__inner{
        background-color: #3370ff!important;
      }
    }
    .column-el-checkbox-group:nth-child(3){
      .el-checkbox__inner{border: 1px solid #f54a45;}
      .el-checkbox__input.is-checked .el-checkbox__inner{
        background-color: #f54a45!important;
      }
    }
    .column-el-checkbox-group:nth-child(4){
      .el-checkbox__inner{ border: 1px solid #47d4d5;}
      .el-checkbox__input.is-checked .el-checkbox__inner{
        background-color: #47d4d5!important;
      }
    }
    .column-el-checkbox-group:nth-child(5){
      .el-checkbox__inner{ border: 1px solid #fe8d0c;}
      .el-checkbox__input.is-checked .el-checkbox__inner{
        background-color: #fe8d0c!important;
      }
    }
    .column-el-checkbox-group:nth-child(6){
      .el-checkbox__inner{ border: 1px solid #41cc33;}
      .el-checkbox__input.is-checked .el-checkbox__inner{
        background-color: #41cc33!important;
      }
    }
  }

  .r-container {
    padding: 10px 16px;
    .r-title {
      color: #1F2329;
      line-height: 14px;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .r-item {
      color: #646A73;
      width: 150px;
      line-height: 28px;
      font-size: 14px;
    }
  }

  .task-drawer-inner {
    // padding: 0!important;
  }
 
  .el-drawer__body{
    padding: 0 30px 30px 30px;
  }
}

.note-container {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.closeDrawerIcon {
  position: absolute;
  right: 20px;
  top: 15px;
  .el-icon-close {
    font-size: 20px;
    color: #333;
  }
}

.dateDrawerDetail {

}

#myDate{
  .el-dialog__body{
    padding: 10px 30px 30px 30px;
  }
}
</style>

