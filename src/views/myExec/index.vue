<!--我执行的-->
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
        <div class="cursor task-custom-row">
          <img @click="handleUpdateStress(scope.row.id, 0)" src="@/assets/img/icon/mark_active.png" class="task-mark-icon" alt="" v-if="scope.row.stress === 1">
          <img @click="handleUpdateStress(scope.row.id, 1)" src="@/assets/img/icon/mark.png" class="task-mark-icon" alt="" v-else>
          <i class="el-icon-info warningColor" v-if="scope.row.emergencyLevel === 1"></i>
          <i class="el-icon-info danger" v-if="scope.row.emergencyLevel === 2"></i>
          <span class="task-custom-row-span" @click="handleViewClick(scope.row)">{{scope.row.name}}：{{ scope.row.content }}</span>
        </div>
      </template>
      <template slot="state" slot-scope="scope">
        <statusRow :state="scope.row.state"></statusRow>
      </template>
      <template slot="menu" slot-scope="scope">
        <div class="flex-center">
          <Icon @click="handleRowClick(scope.row)" name="setting" />
          <Icon @click="handleReport(scope.row)" name="report" />
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
        <!--处理任务-->
        <MyToDoTask entry="myTodo" :taskId="rowData.id" v-if="tabActiveName=== 'rwcl'" @close="handleClose" />
        <!--反馈任务-->
        <reportTask entry="myTodo" :taskId="rowData.id" v-if="tabActiveName=== 'fkrw'" @close="handleClose" />
        <!--任务透视图-->
        <MyToDoView v-if="tabActiveName==='rwtst'" :taskId="rowData.id" @close="handleClose" />
      </div>
    </el-drawer>
  </BasicContainer>
</template>

<script>
import BasicContainer from "@/components/BasicContainer/BasicContainer"
import Icon from "@/components/Icon/Icon"
import TabLabel from "@/components/TabLabel/TabLabel"
import DropDown from "@/components/DropDown/DropDown"
import { myExecOption, pageOption, dropDownOption } from "@/const/dicData"
import * as api from "@/api/task"
import MyToDoTask from "@/views/myTodo/components/myToDoTask"
import MyToDoView from "@/views/myTodo/components/myToDoView"
import reportTask from "@/views/myTodo/components/reportTask"
import myToDoTaskDetail from "@/views/myTodo/components/myToDoTaskDetail"
import statusRow from "@/components/StatusRow/statusRow"
import { queryFeedbackIsSuccess } from "@/api/feedback"

const topLabelOption = [
  { label: '正在执行', name: 'zzzx', value: 1 },
  { label: '已执行的', name: 'yzxd', value: 2 }
]

const tabOption = [
  { label: '处理任务', name: 'rwcl' },
  { label: '任务透视图', name: 'rwtst' }
]

export default {
  name: "myExec",
  components: {
    BasicContainer,
    Icon,
    TabLabel,
    DropDown,
    MyToDoTask,
    MyToDoView,
    reportTask,
    myToDoTaskDetail,
    statusRow
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
      topTabActiveName: 'zzzx',
      tabActiveName: 'rwcl',
      state: 1,
      orderByDesc: 'b.update_time desc'
    }
  },
  computed: {
    tableOption() {
      if (this.topTabActiveName === 'yzxd') {
        return { ...myExecOption, menu: false }
      } else {
        return { ...myExecOption, menu: true, column: myExecOption.column.filter(option => option.prop !== 'overTime') }
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
      api.myPerform(query)
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
    // 添加/取消强调 stress:（0 取消 1强调）
    handleUpdateStress(id, stress) {
      const query = {
        id,
        stress
      }
      api.updateStress(query).then(res => {
        if (res.data.code === 200) {
          this.getList()
        }
      })
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
    handleRowClick(row) {
      // 如果反馈问题已关闭 且 当前用户是执行人
      if (row.feedbackType === 2 && row.userId === this.$store.state.user.userId) {
        this.$message.info('你已反馈任务已完成，不可再继续操作')
        return
      }
      this.rowData = row
      this.tabOption = [
        { label: '处理任务', name: 'rwcl' },
        { label: '任务透视图', name: 'rwtst' }
      ]
      this.tabActiveName = 'rwcl'
      this.dialog = true
    },
    handleReport(row) {
      queryFeedbackIsSuccess({ taskId: row.id }).then(res => {
        if (res.data.code === 200) {
          this.rowData = row
          this.tabOption = [
            { label: '反馈任务', name: 'fkrw' },
            { label: '任务透视图', name: 'rwtst' }
          ]
          this.tabActiveName = 'fkrw'
          this.dialog = true
        }
      }).catch(e => {
        console.log(e)
      })
    },
    tabChange(item) {
      this.tabActiveName = item.name
    },
    handleTopTabChange(item) {
      this.topTabActiveName = item.name
      this.state = item.value
      this.page.currentPage = 1
      this.getList()
    },
    handleClose() {
      this.dialog = false
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
