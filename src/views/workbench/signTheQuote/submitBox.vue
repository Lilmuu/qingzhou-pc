<template>
    <div class="topics-dialog">
      <!--<div class="submitBoxClass">-->
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
      <successfulTip ref="successfulTip"></successfulTip>
    </div>
</template>

<script>
import successfulTip from "./successfulTip.vue";
import {
  reportsubmitstartnode,
  reportstorage,
  reportsubmitrefuse,
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
      oneClick: true, // 误触
    };
  },

  mounted() {},

  methods: {
    handleSubmit() {
      if(this.oneClick){
        this.oneClick = false
        this.modelForm.reportFile = JSON.stringify(this.fileList);
        if (this.tit == "暂存") {
          if (this.requestParameters.tit != undefined) {
            this.modelForm.meetingId = this.requestParameters.meetingId;
            this.modelForm.id = this.requestParameters.businessId;
          }
          reportstorage(this.modelForm).then((res) => {
            if (res.data.code == 0) {
              this.handleClose()
              this.$store.state.workbench.navigationName='flowPath'
              this.$store.state.workbench.requestParameters={}
              this.$router.push({path:'flowPath',})
            }
          });
        } else {
          if (this.requestParameters.tit == undefined) {
            this.modelForm.status = this.requestParameters.status;
            reportsubmitstartnode(this.modelForm).then((res) => {
              if (res.data.code == 0) {
                this.handleClose()
                this.$store.state.workbench.navigationName='flowPath'
                this.$store.state.workbench.requestParameters={}
                this.$router.push({path:'flowPath',})
              }
            });
          } else {
            this.modelForm.meetingId = this.requestParameters.meetingId;
            this.modelForm.workflowId = this.requestParameters.id;
            this.modelForm.status = this.requestParameters.status;
            this.modelForm.id = this.requestParameters.businessId;
            if (this.requestParameters.withdrawFlag == 1 || this.requestParameters.status == 3) {
              reportsubmitrefuse(this.modelForm).then((res) => {
                if (res.data.code == 0) {
                  this.handleClose()
                  this.$store.state.workbench.navigationName='flowPath'
                  this.$store.state.workbench.requestParameters={}
                  this.$router.push({path:'flowPath',})

                }
              });
            } else {
              reportsubmitstartnode(this.modelForm).then((res) => {
                if (res.data.code == 0) {
                  this.handleClose()
                  this.$store.state.workbench.navigationName='flowPath'
                  this.$store.state.workbench.requestParameters={}
                  this.$router.push({path:'flowPath',})
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
      this.flowChartVisible = false
      // done();
    },
  },
};
</script>

<style lang="scss" scoped>


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
