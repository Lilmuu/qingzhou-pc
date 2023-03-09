<template>
  <div class="myProcess">
    <div class="mask" @click="closePopover" v-if="popoverVisible"></div>
    <!--<div class="header">我的流程</div>-->
    <div
      class="monit-det-body"
      :class="{ no_data: monitTableData.length == 0 }"
    >
      <el-table
        :data="monitTableData"
        :header-cell-style="{ background: '#fff', color: '#1F2329' }"
        empty-text
        :row-class-name="tableRowSetting"
        style="width: 100%"
        :fit="true"
      >
        <el-table-column prop="taskTitle" label="标题"> </el-table-column>
        <el-table-column prop="type" label="工作项" :formatter="formatType"></el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <div v-html="formatTime(scope.row)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="nodeUserName" label="当前节点">
           <template slot-scope="scope">
            <div>{{ scope.row.status == 4 ? '': scope.row.nodeUserName}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" >
            <template slot-scope="scope">
               <div v-html="formatStatus(scope.row)"></div>
            </template>
        </el-table-column>
        <el-table-column label="操作"  width="160">
          <template slot-scope="scope">
            <i class="dot-box" @click="showPopover(scope.row)">
              <img src="@/assets/img/workSpace/flow-dot-actived.png" alt="" v-if="scope.row.popoverVisible">
              <img src="@/assets/img/workSpace/flow-dot.png" alt="" v-else>
            </i>
            <el-popover
              placement="right"
              width="150"
              trigger="manual"
              v-model="scope.row.popoverVisible">
                  <div class="btn-list">
                      <span class="btn" @click="handleClick(scope.row, '查看')">
                        <i class="ico ico1"></i>查看
                      </span>
                      <span class="btn" @click="handleClick(scope.row, '编辑')" v-if="scope.row.editFlag == 1">
                        <i class="ico ico2"></i>编辑
                      </span>
                      <span class="btn" @click="handleClick(scope.row, '审批')" v-if="scope.row.approveFlag == 1">
                        <i class="ico ico3"></i>审批
                      </span>
                      <span class="btn" @click="handleClick(scope.row, '撤回')" v-if="scope.row.retractFlag == 1">
                        <i class="ico ico4"></i>撤回
                      </span>
                      <span class="btn" @click="handleClick(scope.row, '删除')" v-if="scope.row.status == 1">
                        <i class="ico ico5"></i>删除
                      </span>
                  </div>
            </el-popover>
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="empty-box">
            <img
              style="width: 125px"
              src="@/assets/img/workSpace/noData2.png"
              alt=""
            />
            <span :style="[{'color':'#8F959E'}, {'fontSize':'14px'}]">暂无审批流程</span>
          </div>
        </template>
      </el-table>
      <div class="page">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageOption.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageOption.total"
        >
        </el-pagination>
      </div>
    </div>
    <!--<submitBox ref="submitBox"></submitBox>-->

    <!-- 操作提示框 -->
    <cencelOrClose
      ref="tipBox"
      :btnType="btnType"
      :closeHeader = "true"
      @define="handleOk"
      >
        <p slot="tipsOne">{{tipWords}}</p>
    </cencelOrClose>

    <!-- 成功弹窗 -->
    <successfulTip ref="successfulTip" @refresh="getList"></successfulTip>
  </div>
</template>

<script>
import submitBox from "./submitBox.vue";
import cencelOrClose from "@/components/cencelOrClose.vue";
import successfulTip from "./successfulTip.vue";
import { workbenchUnread,workbenchRead } from '@/api/workSpace'
import { flowableRecordpageMyTask, meetingTaskdeleteTask, flowableRecordrecallTask } from "./api";
export default {
  name: "flowPath",

  components: { submitBox, cencelOrClose, successfulTip },
  data() {
    return {
      monitTableData: [],
      tableLoading: false,
      pageOption: {
        currentPage: 1,
        total: 0,
        pageSize: 10,
      },
      popoverVisible: false,
      tipWords: "",
      tit: "",
      rowData: {},
      btnType: "primary",
      switchVal: true,
    };
  },

  mounted() {
    this.getList();
  },
  activated() {
    if (this.$store.state.workbench.routesQuery) {
      this.handleClick(this.$store.state.workbench.routesQuery, "查看");
    }
  },
  deactivated() {
    this.$store.state.workbench.routesQuery = "";
  },
  computed: {},
  methods: {
    formatStatus(row) {
      return row.status == 1
        ? `<span style='color:#FF8800'>草稿</span> `
        : row.status == 2
        ? `<span  style= 'color:#3370FF' >审批中</span>`
        : row.status == 3
        ? `<span style='color:#F54A45'>被驳回</span>`
        : `<span style='color:#34C724'>已完成</span>`;
    },
    formatType(row, column) {
      return row.type == 1
        ? "议题"
        : row.type == 2
        ? "签报"
        : row.type == 3
        ? "用印"
        : row.type == 4
        ? "合同"
        : "发文";
    },
    jumps(row, tit) {
      let jumper;
      jumper =
        row.type == 1
          ? { name: "议题", path: "topics" }
          : row.type == 2
          ? { name: "签报", path: "sign" }
          : row.type == 3
          ? { name: "用印", path: "useSeal" }
          : row.type == 4
          ? { name: "合同", path: "contract" }
          : { name: "发文", path: "dispatch" };
      this.$store.commit(
        "pushTopNav",
        Object.assign({}, { ...jumper, query: "" })
      );
      row["tit"] = tit;
      this.$store.state.workbench.requestParameters = row;
    },

    toWithdraw(row, tit) {
      // this.$refs.submitBox.handleUp(row, tit);
      this.btnType = "danger"
      this.$refs.tipBox.exitDialog = true;
      this.tipWords = `您确定${tit}当前申请吗？`
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pageOption.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.pageOption.currentPage = val;
      this.getList();
    },
    handleClick(row, tit) {
      console.log("当前行信息", row);
      this.closePopover();
      if(row.readFlag == 0 && row.status != 1){
        this.readNum(row.id)
      }
      this.tit = tit;
      tit == "撤回" ? this.toWithdraw(row, tit) : "";
      tit == "删除" ? this.toWithdraw(row, tit) : "";
      tit == "查看" ? this.jumps(row, tit) : "";
      tit == "编辑" ? this.jumps(row, tit) : "";
      tit == "审批" ? this.jumps(row, tit) : "";
    },
    getList() {
      console.log("执行爷爷查询列表方法");
      this.tableLoading = true;
      let { pageSize, currentPage } = this.pageOption;
      flowableRecordpageMyTask({
        size: pageSize,
        current: currentPage,
        ...this.querySearch,
      }).then((res) => {
        this.monitTableData = res.data.data.records;
        this.pageOption.total = res.data.data.total;
        if(this.monitTableData.length) {
          this.monitTableData.forEach(item => {
            this.$set(item, "popoverVisible", false)
          })
        }
        this.tableLoading = false;
        this.unReadNum()
      });
    },

    readNum(id){
      workbenchRead(id).then(res=>{
        if(res.data.code == 0){
          this.unReadNum()
        }
      })
    },

    unReadNum(){
      workbenchUnread().then(res=>{
        console.log('hahah',res)
        this.$store.commit('SET_UNREADNUMBER', res.data.data)
      })
    },
    tableRowSetting(row){
      console.log(row,'row - row')
      if(row.row.readFlag == 0){
        return 'has-color'
      }else{
        return ''
      }
    },
    showPopover(row) {
      console.log(row);
      this.rowData = row;
      this.monitTableData.forEach(item => {
        if(item.id !== row.id) {
          this.$set(item,"popoverVisible", false)
        }
      })
      let showPopver = this.popoverVisible= !row.popoverVisible
      this.$set(row,"popoverVisible", showPopver)
      console.log(this.popoverVisible);
    },
    // 点击空白处 关闭操作弹框
    closePopover() {
      this.popoverVisible = false;
      this.monitTableData.forEach(item => {
        this.$set(item,"popoverVisible", false)
      })
    },
    // 提示框确定
    handleOk() {
      if(!this.switchVal) return
      console.log("确定",this.rowData);
      if (this.tit == "删除") {
        this.switchVal = false
        meetingTaskdeleteTask({ workflowId: this.rowData.id }).then((res) => {
          this.getList()
          this.$refs.tipBox.exitDialog = false
          this.$refs.tipBox.loading = false
        });
        setTimeout(()=>{
          this.switchVal = true
        },2000)
      } else if (this.tit == "撤回") {
        this.switchVal = false
        flowableRecordrecallTask({
          id: this.rowData.id,
          taskId: this.rowData.taskId,
          businessId: this.rowData.businessId,
          type: this.rowData.type,
        }).then((res) => {
          this.unReadNum();
          this.getList()
          this.$refs.tipBox.exitDialog = false;
          this.$refs.tipBox.loading = false
        });
        setTimeout(()=>{
          this.switchVal = true
        },2000)
      }
    },

    formatTime(row) {
      let fTime = `${row.createTime.split(" ")[0]} &nbsp ${row.createTime.split(" ")[1]}`;
      return fTime;
    }

  },
};
</script>

<style lang="scss" scoped>
.myProcess {
  position: relative;
  padding: 20px 24px;
  background-color: #fff;
  border-radius: 10px;
  .mask {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: transparent;
    z-index: 999;
  }
  ::v-deep.el-table__body .el-table__row:nth-child(even) {
    background-color: #fff;
  }
  .header {
    font-size: 16px;
    margin-bottom: 20px;
  }
  .page {
    text-align: right;
  }
}
 .btn-list {
  display: flex;
  flex-direction: column;
  align-self: center;
  justify-content: center;
   .btn {
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 0 6px;
     margin-bottom: 5px;
     font-size: 14px;
     color: #646A73;
     background-color: #fff;
     &:last-child {
       margin-bottom: 0;
     }
     .ico {
       flex-shrink: 0;
       display: inline-block;
       width: 14px;
       height: 14px;
       margin-right: 10px;
       background-size: contain;
       background-repeat: no-repeat;
       background-position: center;
     }
     .ico1 {
       background-image: url("../../assets/img/workSpace/flow-check-gray.png");
     }
     .ico2 {
       background-image: url("../../assets/img/workSpace/flow-edit-gray.png");
     }
     .ico3 {
       background-image: url("../../assets/img/workSpace/flow-sp-gray.png");
     }
     .ico4 {
       background-image: url("../../assets/img/workSpace/flow-return-gray.png");
     }
     .ico5 {
       background-image: url("../../assets/img/workSpace/flow-del-gray.png");
     }
   }
   .btn:hover {
   //  color: #3370FF;

     background-color: #F5F6F7;
   //  .ico1 {
   //    background-image: url("../../assets/img/workSpace/flow-check.png");
   //  }
   //  .ico2 {
   //    background-image: url("../../assets/img/workSpace/flow-edit.png");
   //  }
   //  .ico3 {
   //    background-image: url("../../assets/img/workSpace/flow-sp.png");
   //  }
   //  .ico4 {
   //    background-image: url("../../assets/img/workSpace/flow-return.png");
   //  }
   //  .ico5 {
   //    background-image: url("../../assets/img/workSpace/flow-del.png");
   //  }
   }

}
.monit-det-body ::v-deep.el-popover {
    width: 88px!important;
    min-width: 88px!important;
    background-color: #fff;
    border: 1px solid #DEE0E3;
    box-shadow: 0px 0px 10px rgba(75, 129, 255, 0.1);
    border-radius: 6px;
    left: 50px;
    top: 0;
  padding: 10px;
}
::v-deep.el-table td.el-table__cell i.dot-box{
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
</style>
<style lang="scss" >
.no_data {
  .page {
    display: none;
  }
  .el-table__body-wrapper {
    height: calc(100vh - 210px);
  }
}
.monit-det-body {
  .el-table__body-wrapper {
    height: calc(100vh - 260px);
    overflow-y: auto;
  }
  .el-table::before,
  .el-table__fixed-right::before,
  .el-table__fixed::before {
    height: 0;
  }
  .has-color{
    color: #404758;
    font-weight: 400;
    .el-table__cell:first-child {
      position: relative;
      .cell {
        padding-left: 25px;
      }
      &:before {
        content: "";
        display: inline-block;
        position: absolute;
        left: 10px;
        top: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #3370FF;
        transform: translateY(-50%);
      }
    }

  }
}
  .empty-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &>img {
      margin-top: 20px;
    }
  }
</style>
