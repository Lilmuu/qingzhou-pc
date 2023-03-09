<!--我发起的-->
<template>
  <BasicContainer :useBorder="false">
    <div class="top-label flexd-top-label">
      <TabLabel :init-active-name="topTabActiveName" :option="topLabelOption" @tabChange="handleTopTabChange" />
    </div>
    <avue-crud
      ref="crud"
      class="pager_curd pager_curd_mr"
      :page.sync="page"
      :data="tableData"
      :option="tableOption"
      :table-loading="tableLoading"
      :cell-class-name="renderCellClass"
      @sort-change="sortChange"
      @on-load='getList'
      v-if="tableData.length && fetchLoaded">
      <template slot="name" slot-scope="scope">
        <div class="cursor" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
          <i class="el-icon-info warningColor" v-if="scope.row.emergencyLevel === 1"></i>
          <i class="el-icon-info danger" v-if="scope.row.emergencyLevel === 2"></i>
          <span :style="'color:#409eff;'" @click="handleViewClick(scope.row)">{{scope.row.name}}：{{ scope.row.content }}</span>
        </div>
      </template>
      <template slot="state" slot-scope="scope">
        <statusRow :state="scope.row.state"></statusRow>
      </template>
      <template slot="menu" slot-scope="scope">
        <div class="flex-center">
          <Icon v-if="scope.row.state !== 4" @click="handleEdit(scope.row)" name="edit" />
          <Icon v-if="scope.row.state !== 4" @click="handleEndTask(scope.row)" name="check" />
          <Icon v-if="scope.row.state !== 4" @click="handleShowCloseDialog(scope.row)" name="close" />
        </div>
      </template>
    </avue-crud>
    <!-- 无数据页 -->
    <div class="emptyBasicContainer" v-else>
      <template v-if="fetchLoaded">
        <img src="@/assets/img/default-ico/d-noTask.png" class="emptyBasicImg" alt="">
        <span class="emptyBasicText">暂无任务信息</span>
      </template>
    </div>
    <el-drawer
      ref="drawer"
      :before-close="handleClose"
      :visible.sync="dialog"
      :show-close="false"
      :withHeader="false"
      size="444"
      direction="rtl">
      <div class="drawer-inner" v-if="dialog">
        <TabLabel :init-active-name="tabActiveName" :option="tabOption" @tabChange="tabChange" />
        <!--处理详情 查看模式-->
        <myToDoTaskDetail :taskId="rowData.id" v-if="tabActiveName=== 'rwxq'"></myToDoTaskDetail>
        <!--任务透视图-->
        <MyToDoView :taskId="rowData.id" v-if="tabActiveName=== 'rwtst'" @close="handleClose" />
      </div>
    </el-drawer>
    <!-- 完成任务   -->
    <el-dialog append-to-body
               width="30%"
               :before-close="handleClearTaskEndTime"
               class="dialog-message-box"
               :visible.sync='endTaskDialog'
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">完成任务</span>
      </div>
      <div style="display: flex;flex-direction: column">
        <el-date-picker
          v-model="taskEndTime"
          type="datetime"
          style="width: 100%;"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm"
          placeholder="任务结束时间">
        </el-date-picker>
        <span class="warning-sub2">请填写任务完成时间</span>
        <div class="warning-footer">
          <el-button @click="endTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="handleEndTaskSubmit">确定</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog append-to-body
               :visible.sync='editTaskDialog'
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">编辑任务2121212</span>
      </div>
      <addNewTask mode="edit" :data="editData" v-if="editTaskDialog" @success="successCb"></addNewTask>
    </el-dialog>
    <!--  关闭任务  -->
    <el-dialog append-to-body
               width="30%"
               class="dialog-message-box"
               :visible.sync='closeTaskDialog'>
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">提示</span>
      </div>
      <div>
        <div class="warning-content">
          <span class="warning-title"><i class="el-icon-info warning-icon"></i>您确定要关闭任务吗？</span>
          <span class="warning-sub">点击确定关闭当前任务</span>
        </div>
        <div class="warning-footer">
          <el-button @click="closeTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCloseTask">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </BasicContainer>
</template>

<script>
import BasicContainer from "@/components/BasicContainer/BasicContainer"
import Icon from "@/components/Icon/Icon"
import TabLabel from "@/components/TabLabel/TabLabel"
import DropDown from "@/components/DropDown/DropDown"
import { dropDownOption, myReportOption, pageOption } from "@/const/dicData"
import * as api from "@/api/task"
import addNewTask from "@/views/myTodo/components/addNewTask"
import statusRow from "@/components/StatusRow/statusRow"
import myToDoTaskDetail from "@/views/myTodo/components/myToDoTaskDetail"
import MyToDoView from "@/views/myTodo/components/myToDoView"
import dayjs from "dayjs"

const topLabelOption = [
  { label: '我发起的', name: 'wfqd', value: 1 },
  { label: '已结束的', name: 'yjsd', value: 2 }
]

const tabOption = [
  { label: '处理任务', name: 'rwcl' },
  { label: '任务透视图', name: 'rwtst' }
]

export default {
  name: "myReport",
  components: {
    BasicContainer,
    Icon,
    TabLabel,
    DropDown,
    addNewTask,
    statusRow,
    myToDoTaskDetail,
    MyToDoView
  },
  data() {
    return {
      tableData: [],
      tableLoading: true,
      dropDownOption: dropDownOption,
      dropDownActive: 'update',
      topLabelOption: topLabelOption,
      page: JSON.parse(JSON.stringify(pageOption)),
      dialog: false,
      fetchLoaded: false,
      rowData: {}, // 行数据
      tabOption: tabOption,
      topTabActiveName: 'wfqd',
      endTaskDialog: false, // 结束任务dialog
      taskEndTime: '',
      editTaskDialog: false, // 编辑任务dialog
      editData: {},
      orderBy: 2,
      state: 1,
      tabActiveName: 'rwxq',
      closeTaskDialog: false,
      orderByDesc: 'b.update_time desc'
    }
  },
  computed: {
    tableOption() {
      if (this.topTabActiveName === 'yjsd') {
        return { ...myReportOption, menu: false, column: [...myReportOption.column.filter(item => item.prop !== 'manageTime'), {
          label: '结束时间',
          prop: 'overTime',
          type: 'datetime',
          format: 'YYYY-MM-DD HH:mm'
        }] }
      } else {
        return { ...myReportOption, menu: true }
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList(page) {
      page = page || this.page
      this.tableLoading = true
      const query = {
        userId: this.$store.state.user.userId,
        state: this.state,
        page: page.currentPage,
        pageNo: page.currentPage,
        pageSize: page.pageSize,
        orderByDesc: this.orderByDesc
      }
      api.myInitiate(query)
        .then(res => {
          if (res.data.code === 200) {
            const resData = res.data.data
            this.tableData = resData.list
            this.page.total = resData.count
          }
        }).finally(() => {
          this.tableLoading = false
          this.fetchLoaded = true
        })
    },
    sortChange(val) {
      if (!val || !val.order) {
        this.orderByDesc = 'b.update_time desc'
      } else {
        if (val.prop === 'endTime') {
          this.orderByDesc = val.order === 'descending' ? 'b.update_time desc' : 'b.update_time asc'
        } else if (val.prop === 'emergencyLevel') {
          this.orderByDesc = val.order === 'descending' ? 'b.emergency_level desc' : 'b.emergency_level asc'
        }
      }
      this.getList()
    },
    renderCellClass({ row, column, rowIndex, columnIndex }) {
      if (column.sortable) {
        return 'sort-able'
      }
      return ''
    },
    // 查看任务
    handleViewClick(row) {
      this.rowData = row
      this.tabOption = [
        { label: '任务详情', name: 'rwxq' },
        { label: '任务透视图', name: 'rwtst' }
      ]
      this.tabActiveName = 'rwxq'
      this.dialog = true
    },
    // 编辑任务 - 获取任务信息
    handleEdit(row) {
      // 如果是已完成的，不能再编辑
      if (row.feedbackType === 2) {
        this.$message.info('反馈任务已完成，你不可再继续编辑任务')
        return
      }
      const query = {
        taskId: row.id
      }
      api.getTaskDetails(query).then(res => {
        if (res.data.code === 200) {
          this.editData = {
            ...res.data.data,
            timeStart: res.data.data.startTime,
            timeEnd: res.data.data.endTime,
            attentionList: JSON.parse(res.data.data.attentionList),
            executeList: [{
              id: res.data.data.userId,
              username: res.data.data.userName
            }],
            accessory: JSON.parse(res.data.data.accessory)
          }
          this.editTaskDialog = true
          this.getList()
        }
      })
    },
    // 结束任务
    handleEndTask(row) {
      this.rowData = row
      this.taskEndTime = dayjs().format('YYYY-MM-DD HH:mm')
      this.endTaskDialog = true
    },
    handleShowCloseDialog(row) {
      this.rowData = row
      this.closeTaskDialog = true
    },
    // 关闭任务
    handleCloseTask() {
      const row = this.rowData
      const query = {
        id: row.id,
        uniqueLogo: this.rowData.uniqueLogo
      }
      api.closeState(query).then(res => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.closeTaskDialog = false
          this.getList()
        }
      })
    },
    handleReport(row) {
      this.rowData = row
      this.dialog = true
    },
    // 顶部tab切换
    handleTopTabChange(item) {
      this.topTabActiveName = item.name
      this.state = item.value
      this.page.currentPage = 1
      this.getList()
    },
    tabChange(item) {
      this.tabActiveName = item.name
    },
    dropDownSelectChange(item) {
      this.dropDownActive = item.value
      this.orderBy = item.sort
      this.page.currentPage = 1
      this.getList()
    },
    handleClose() {
      this.getList()
      this.dialog = false
    },
    handleClearTaskEndTime() {
      this.taskEndTime = ''
      this.endTaskDialog = false
    },
    // 结束任务
    handleEndTaskSubmit() {
      if (!this.taskEndTime) {
        this.$message.error('请填写任务结束时间')
        return
      }
      const data = {
        id: this.rowData.id,
        time: this.taskEndTime
      }
      api.endState(data).then(res => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.endTaskDialog = false
          this.getList()
        }
      })
    },
    // 编辑成功后回调
    successCb() {
      this.editTaskDialog = false
      this.getList()
    }
  }
}
</script>

<style scoped>
.emptyBasicContainer {
  height: calc(100vh - 338px);
}
</style>
