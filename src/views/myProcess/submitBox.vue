<template>
  <div class="submitBoxClass">
    <el-dialog
      :visible.sync="flowChartVisible"
      :show-close="false"
      width="480px"
      :before-close="handleClose"
    >
      <div class="body-center">
        <div class="body-center-top">
          <i class="el-icon-warning"></i
          ><span>您确定{{ tit }}当前申请吗？</span>
        </div>
        <div class="body-center-bottom">点击确定，将{{ tit }}当前申请</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose()">取 消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="handleSubmitLadding"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <successfulTip ref="successfulTip"></successfulTip>
  </div>
</template>

<script>
import successfulTip from "./successfulTip.vue";
import { workbenchUnread } from "@/api/workSpace";
import { meetingTaskdeleteTask, flowableRecordrecallTask } from "./api";
export default {
  name: "submitBox",

  components: { successfulTip },
  data() {
    return {
      flowChartVisible: false,
      tit: "",
      workflowId: "",
      row: {},
      handleSubmitLadding: false,
    };
  },

  mounted() {},

  methods: {
    handleSubmit() {
      this.handleSubmitLadding = true;
      if (this.tit == "删除") {
        meetingTaskdeleteTask({ workflowId: this.workflowId }).then((res) => {
          this.handleClose()
          this.$store.state.workbench.navigationName='flowPath'
          this.$store.state.workbench.requestParameters={}
          this.$router.push({path:'flowPath',})
        });
      } else if (this.tit == "撤回") {
        flowableRecordrecallTask({
          id: this.row.id,
          taskId: this.row.taskId,
          businessId: this.row.businessId,
          type: this.row.type,
        }).then((res) => {
          this.handleClose()
          this.unReadNum();
          this.$store.state.workbench.navigationName='flowPath'
          this.$store.state.workbench.requestParameters={}
          this.$router.push({path:'flowPath',})
        });
      }
    },
    unReadNum() {
      workbenchUnread().then((res) => {
        console.log("hahah", res);
        this.$store.commit("SET_UNREADNUMBER", res.data.data);
      });
    },
    handleUp(row, tit) {
      this.workflowId = row.id;
      this.row = row;
      this.tit = tit;
      this.flowChartVisible = true;
    },
    handleClose(done) {
      this.handleSubmitLadding = false
      this.flowChartVisible = false
      done();
    },
  },
};
</script>

<style lang="scss">
.submitBoxClass {
  .el-dialog__header {
    padding: 0;
    .el-dialog__title {
      font-size: 16px;
    }
  }
  .el-dialog {
    display: flex;
    flex-direction: column;
    margin: 0 !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .el-dialog__body {
      padding-top: 0;
      padding: 0;
      .body-center {
        padding: 32px 0 70px 33px;
        .body-center-top {
          i {
            color: orange;
            font-size: 22px;
          }
          span {
            font-size: 20px;
            display: inline-block;
            margin-left: 17px;
          }
        }
        .body-center-bottom {
          color: #bfbfbf;
          font-size: 16px;
          margin-top: 20px;
          margin-left: 39px;
        }
      }
    }
    .el-dialog__footer {
      padding: 0 20px 20px;
    }
    .el-button {
      padding: 7px 20px;
    }
  }
}
</style>
