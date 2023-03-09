<template>
  <!--<div class="submitBoxClass">-->
  <div class="oaMenu-box">
    <div class="oaMenu-submit">
      <el-dialog
        :visible.sync="flowChartVisible"
        :show-close="false"
        width="480px"
        :before-close="handleClose"
      >
        <div class="body-center">
          <div class="body-center-top">
             <span>确定{{ tit }}该申请吗？</span>
          </div>
          <div class="body-center-bottom">
            <el-input
              v-model="modelForm.remark"
              placeholder="请输入备注说明"
              type="textarea"
              :autosize="{ minRows: 4 }"
              maxlength="200"
              resize="none"
            ></el-input>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
        <el-button @click="close" size="small">取 消</el-button>
        <el-button :type="btnType" @click="handleSubmit" size="small">确 定</el-button>
      </span>
      </el-dialog>
    </div>

    <successfulTip ref="successfulTip"></successfulTip>
  </div>
</template>

<script>
import successfulTip from "./successfulTip.vue";
export default {
  name: "submitBox",

  components: { successfulTip },
  props: {
    btnType: {
      type: String,
      default: "primary"
    }
  },
  data() {
    return {
      flowChartVisible: false,
      tit: "",
      modelForm: {
        remark: "",
      },
      requestParameters: {},
    };
  },

  mounted() {},

  methods: {
    handleSubmit() {
      this.$emit("handleSubmit", this.modelForm, this.tit);
      // this.$store.state.workbench.navigationName='flowPath'
      // this.$store.state.workbench.requestParameters={}
      // this.$router.push({path:'flowPath',})
    },
    handleUp(tit, requestParameters) {
      this.tit = tit;
      this.requestParameters = requestParameters;
      this.flowChartVisible = true;
    },
    handleClose(done) {
      done();
      this.close();
    },
    close() {
      this.modelForm.remark = "";
      this.flowChartVisible = false;
    },
    agreeOrDisagree(tit) {
      this.close();
      // this.$refs.successfulTip.handleUp(tit);
      this.$store.state.workbench.navigationName='flowPath'
      this.$store.state.workbench.requestParameters={}
      this.$router.push({path:'flowPath',})
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
          font-size: 16px;
          margin-top: 20px;
          margin-left: 36px;
          margin-right: 36px;
          .el-textarea__inner {
            background: #f6f6f6;
            border: 0;
            resize: none; /* 这个是去掉 textarea 下面拉伸的那个标志，如下图 */
          }
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

/*新UI改版*/
  .oaMenu-submit ::v-deep{
    .el-dialog {
      display: flex;
      flex-direction: column;
      top: 25%;
      width: 420px!important;
      justify-content: space-between;
      border-radius: 10px;
    }
    .el-dialog__body {
      padding: 24px 20px!important;
      font-size: 16px;
    }
    .el-dialog__footer {
      padding: 20px!important;
      border-top: 0;
    }
    .body-center-top {
      margin-bottom: 16px;
      span {
        font-size: 16px;
        color: #404758;
      }
    }
    .el-dialog__header {
      display: none;
    }
    .el-textarea__inner {
      background-color: #FBFBFC;
    }
  }
</style>
