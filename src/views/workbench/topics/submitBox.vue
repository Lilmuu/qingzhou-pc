<template>
  <!--<div class="submitBoxClass">-->
  <div class="main-box">
    <div class="topics-dialog">
      <el-dialog
        :visible.sync="flowChartVisible"
        :show-close="false"
        width="480px"
        :before-close="handleClose"
      >
        <div class="body-center">
          <div class="body-center-top">
            <span>您确定{{ tit }}当前申请吗？</span>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose()" size="small">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading='!oneClick' size="small">确 定</el-button>
      </span>
      </el-dialog>
    </div>

    <successfulTip ref="successfulTip"></successfulTip>
  </div>
</template>

<script>
import successfulTip from "./successfulTip.vue";
import {
  meetingTaskaddNewMeeting,
  meetingTasksubmitStorageMeeting,
  meetingTasktemporaryStorageMeeting,
  meetingTasksubmitRefuseProcess,
} from "./api";
export default {
  name: "submitBox",

  components: { successfulTip },
  data() {
    return {
      flowChartVisible: false,
      tit: "",
      modelForm: [],
      requestParameters: {},
      fileList: [],
      oneClick: true,
    };
  },

  mounted() {},

  methods: {
    // 跳转到我的流程列表页面
    goToFlowPath() {
        this.$store.state.workbench.navigationName='flowPath'
        this.$store.state.workbench.requestParameters={}
        this.$router.push({path:'flowPath',})
        console.log("执行爷爷查询列表方法");
    },
    handleSubmit() {
      if(this.oneClick){
        this.oneClick = false
        delete this.modelForm.leadersChargeId
        this.modelForm.fileIdlist = JSON.stringify(this.fileList);
        if (this.tit == "暂存") {
          if (this.requestParameters.tit != undefined) {
            this.modelForm.meetingId = this.requestParameters.businessId;
          }
          meetingTasktemporaryStorageMeeting(this.modelForm).then((res) => {
            if (res.data.code == 0) {
              this.handleClose()
              this.goToFlowPath()
            }
          });
        } else {
          if (this.requestParameters.tit == undefined) {

            meetingTaskaddNewMeeting(this.modelForm).then((res) => {
              if (res.data.code == 0) {
                this.handleClose()
                this.goToFlowPath()
              }
            });
          } else {
            if (
              this.requestParameters.status == 3 ||
              this.requestParameters.withdrawFlag == 1
            ) {
              this.modelForm.meetingId = this.requestParameters.businessId;
              this.modelForm.workflowId = this.requestParameters.id;
              meetingTasksubmitRefuseProcess(this.modelForm).then((res) => {
                if (res.data.code == 0) {
                  this.handleClose()
                  this.goToFlowPath()
                }
              });
            } else {
              this.modelForm.meetingId = this.requestParameters.businessId;
              this.modelForm.workflowId = this.requestParameters.id;
              meetingTasksubmitStorageMeeting(this.modelForm).then((res) => {
                if (res.data.code == 0) {
                  this.handleClose()
                  this.goToFlowPath()
                }
              });
            }
          }
        }
      }
    },
    handleUp(tit, modelForm, requestParameters, fileList) {
      this.tit = tit;
      this.modelForm = modelForm;
      this.fileList = fileList;
      this.requestParameters = requestParameters;
      this.flowChartVisible = true;
    },
    handleClose(done) {
      this.oneClick = true
      this.flowChartVisible = false;
      // done();
    },
  },
};
</script>

<style lang="scss" scoped>
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
      border-top: none!important;
    }
    .el-button {
      padding: 7px 20px;
    }
  }
}

  /*新UI改版*/
  .topics-dialog ::v-deep {
      .el-button {
        width: 84px;
      }
      .el-dialog {
        display: flex;
        flex-direction: column;
        top: 25%;
        width: 420px!important;
        /*height: 158px;*/
        justify-content: space-between;
        border-radius: 10px;
      }
    .el-dialog__body {
      padding: 24px 20px!important;
    }
    .el-dialog__footer {
      padding: 20px!important;
      border-top: 0;
    }
      .body-center-top {
        span {
          font-size: 16px;
          color: #404758;
        }
      }
    .el-dialog__header {
      display: none;
    }
  }
</style>
