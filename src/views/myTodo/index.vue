<!--待我处理-->
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
      @refresh-change='getList'
      :cell-class-name="renderCellClass"
      @sort-change="sortChange"
      :row-class-name="tableRowClassName"
      @on-load='getList'
      v-if="tableData.length && fetchLoaded">
      <template slot="name" slot-scope="scope">
        <div class="cursor" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
          <i class="el-icon-info warningColor" v-if="scope.row.emergencyLevel === 1"></i>
          <i class="el-icon-info danger" v-if="scope.row.emergencyLevel === 2"></i>
          <span :style="'color:#409eff;'" @click="handleViewClick(scope.row)">{{scope.row.name}}：{{ scope.row.content }}</span>
        </div>
      </template>
      <template slot="taskType" slot-scope="scope">
        <div>{{ handleTaskTypeParser(scope.row) }}</div>
      </template>
      <template slot="menu" slot-scope="scope">
        <div class="flex-center">
          <Icon @click="handleRowClick(scope.row)" name="setting" />
          <Icon @click="handleReport(scope.row)" name="report" />
          <Icon @click="handleShowKnowDialog(scope.row)" name="done" v-if="scope.row.taskState === 2 && scope.row.feedbackType !== 2 && scope.row.lastFeedbackUserId !== userId" />
        </div>
      </template>
    </avue-crud>
    <!-- 无数据页 -->
    <div class="emptyBasicContainer" v-else>
      <template v-if="fetchLoaded">
        <img src="@/assets/img/default-ico/d-noTask.png" class="emptyBasicImg" alt="">
    <!--<span class="emptyBasicText">暂无任务信息</span>-->
      </template>
    </div>
    <el-dialog append-to-body
      width="30%"
      class="dialog-message-box"
      :visible.sync='knowDialog'>
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">提示</span>
      </div>
      <div>
        <div class="warning-content">
          <span class="warning-title"><i class="el-icon-info warning-icon"></i>确认已知晓反馈内容？</span>
          <span class="warning-sub">点击确定表示已知晓反馈内容</span>
        </div>
        <div class="warning-footer">
          <el-button @click="knowDialog = false">取消</el-button>
          <el-button type="primary" @click="handleKnow">确定</el-button>
        </div>
      </div>
    </el-dialog>
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
        <myToDoTaskDetail acceptTask :taskId="rowData.id" v-if="tabActiveName=== 'rwxq'"></myToDoTaskDetail>
        <!--处理任务-->
        <MyToDoTask acceptTask :taskId="rowData.id" entry="myTodo" v-if="tabActiveName=== 'rwcl'" @close="handleClose" show-btn />
        <!--反馈任务-->
        <reportTask acceptTask :taskId="rowData.id" entry="myTodo" v-if="tabActiveName=== 'fkrw'" @close="handleClose" />
        <!--任务透视图-->
        <MyToDoView v-if="tabActiveName=== 'rwtst'" :taskId="rowData.id" @close="handleClose" />
      </div>
    </el-drawer>
  </BasicContainer>
</template>

<script>
  import { mapState } from 'vuex'
  import BasicContainer from "@/components/BasicContainer/BasicContainer"
  import Icon from "@/components/Icon/Icon"
  import DropDown from "@/components/DropDown/DropDown"
  import TabLabel from "@/components/TabLabel/TabLabel"
  import MyToDoTask from "@/views/myTodo/components/myToDoTask"
  import MyToDoView from "@/views/myTodo/components/myToDoView"
  import { pageOption, myTodoOption, taskTypeParser, config } from "@/const/dicData"
  import reportTask from "@/views/myTodo/components/reportTask"
  import myToDoTaskDetail from "@/views/myTodo/components/myToDoTaskDetail"
  import * as api from '@/api/task'
  import { queryFeedbackIsSuccess, knowFeedback } from "@/api/feedback"
  import store from "@/store";
  import WEBIM from "@/xmpp/webim-reset";

  const topLabelOption = [
    { label: '处理任务', name: 'rwcl' }
  ]

  const tabOption = [
    { label: '处理任务', name: 'rwcl' },
    { label: '任务透视图', name: 'rwtst' }
  ]

  export default {
    name: "MyTodo",
    components: {
      BasicContainer,
      Icon,
      TabLabel,
      DropDown,
      MyToDoTask,
      MyToDoView,
      reportTask,
      myToDoTaskDetail,
    },
    data() {
      return {
        tableData: [],
        tableOption: myTodoOption,
        fetchLoaded: false,
        tableLoading: true,
        topTabActiveName: 'rwcl',
        topLabelOption: topLabelOption,
        page: JSON.parse(JSON.stringify(pageOption)),
        dialog: false,
        rowData: {}, // 行数据
        tabOption: tabOption,
        tabActiveName: 'rwcl',
        knowTaskId: '', // 处理id
        knowDialog: false,
        orderByDesc: 'b.update_time desc'
      }
    },
    computed: {
      ...mapState({
        userId: state => state.user.userId
      }),
      getWsMsg() {
        return this.$store.state.socket.socketMsg
      }
    },
    mounted() {
      this.$store.dispatch('Common/User/GetServeConfig')
      this.$store.dispatch('WSINIT')
      const isConnect = WEBIM.isConnect()
      if (!isConnect) {
        this.$store.dispatch('InitIMConfig')
      }
      this.getList()
    },
    methods: {
      getList(page) {
        page = page || this.page
        this.tableLoading = true
        const query = {
          userId: this.$store.state.user.userId,
          state: 1,
          page: page.currentPage,
          pageNo: page.currentPage,
          pageSize: page.pageSize,
          orderByDesc: this.orderByDesc
        }
        api.myPending(query)
          .then(res => {
            if (res.data.code === 200) {
              const resData = res.data.data
              this.tableData = resData.list
              this.page.total = resData.count
              const { unreadCount } = resData

              console.log("未读消息 - 提示",res)
              if (unreadCount > 0) {
                this.$store.dispatch('SetUnreadCount', unreadCount)
                this.$electron.ipcRenderer.send('show-notice')
              } else {
                this.$store.dispatch('SetUnreadCount', 0)
                this.$electron.ipcRenderer.send('hide-notice')
              }
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
      // 选中高亮
      tableRowClassName({ row, rowIndex }) {
        const { initiatorId, userId } = row
        const currentUserId = this.$store.state.user.userId
        if ((initiatorId === currentUserId && row.initiatorRead === 1) || (userId === currentUserId && row.executorRead === 1)) {
          return 'task-highLight-row'
        }
        return ''
      },
      renderCellClass({ row, column, rowIndex, columnIndex }) {
        if (column.sortable) {
          return 'sort-able'
        }
        return ''
      },
      handleTaskTypeParser(row) {
        return taskTypeParser(row.taskType, row.taskState)
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
      // 设置任务
      handleRowClick(row) {
        // 是反馈任务 且 当前用户是发起人 直接 跳转到 我发起的
        if (row.taskState === 2 && row.initiatorId === this.$store.state.user.userId) {
          this.$emit('changeRoute', 'myReport')
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
      // 反馈任务
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
        })
      },
      handleShowKnowDialog(row) {
        this.knowTaskId = row.id
        this.knowDialog = true
      },
      handleKnow() {
        knowFeedback({ taskId: this.knowTaskId }).then(res => {
          if (res.data.code === 200) {
            this.knowDialog = false
            this.$message.success(res.data.msg)
            this.getList()
          }
        })
      },
      // 顶部tab切换
      handleTopTabChange(item) {
        this.topTabActiveName = item.name
        this.page.currentPage = 1
        this.getList()
      },
      tabChange(item) {
        this.tabActiveName = item.name
      },
      handleFilterChange(value) {
        console.log(value)
      },
      dropDownSelectChange(item) {
        this.dropDownActive = item.value
        this.page.currentPage = 1
        this.getList()
      },
      handleClose() {
        this.getList()
        this.dialog = false
      },

    },
    watch: {
      getWsMsg: {
        handler(msg) {
          if (msg.type === 'pushEvent') {
            const count = msg.data
            if (count > 0) {
              this.getList()
            }
          }
        },
        deep: true
      }
    }
  }
</script>

<style scoped>

</style>
