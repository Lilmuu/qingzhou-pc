<!--我关注的-->
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
  </BasicContainer>
</template>

<script>
import BasicContainer from "@/components/BasicContainer/BasicContainer"
import Icon from "@/components/Icon/Icon"
import TabLabel from "@/components/TabLabel/TabLabel"
import DropDown from "@/components/DropDown/DropDown"
import { dropDownOption, myFollowOption, pageOption } from "@/const/dicData"
import * as api from "@/api/task"
import statusRow from "@/components/StatusRow/statusRow"
import myToDoTaskDetail from "@/views/myTodo/components/myToDoTaskDetail"
import MyToDoView from "@/views/myTodo/components/myToDoView"

const topLabelOption = [
  { label: '正在执行', name: 'zzzx', value: 1 },
  { label: '已结束的', name: 'yjsd', value: 2 }
]

const tabOption = [
  { label: '处理任务', name: 'rwcl' },
  { label: '任务透视图', name: 'rwtst' }
]

export default {
  name: "myFollow",
  components: {
    BasicContainer,
    Icon,
    TabLabel,
    DropDown,
    statusRow,
    myToDoTaskDetail,
    MyToDoView
  },
  data() {
    return {
      tableData: [],
      // tableOption: myFollowOption,
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
      // orderBy: 2,
      state: 1,
      tabActiveName: 'rwxq',
      // orderByDesc: 'b.end_time desc asc',
      orderByDesc: 'b.update_time desc'
    }
  },
  computed: {
    tableOption() {
      if (this.topTabActiveName === 'zzzx') {
        return { ...myFollowOption, column: myFollowOption.column.filter(item => item.prop !== 'overTime') }
      }
      return myFollowOption
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
        orderBy: this.orderBy,
        state: this.state,
        page: page.currentPage,
        pageNo: page.currentPage,
        pageSize: page.pageSize,
        orderByDesc: this.orderByDesc
      }
      api.myAttention(query)
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
    handleRowClick(row) {
      this.rowData = row
      this.dialog = true
    },
    handleReport(row) {
      this.rowData = row
      this.dialog = true
    },
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
      this.dialog = false
    }
  }
}
</script>

<style scoped>
.emptyBasicContainer {
  height: calc(100vh - 338px);
}
</style>
