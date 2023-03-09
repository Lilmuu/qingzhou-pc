<!--
 * @Author: your name
 * @Date: 2021-12-20 09:50:30
 * @LastEditTime: 2021-12-20 11:49:26
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\workbenchFrame\frameBox.vue
-->
<template>
  <div class="frameBox">
    <el-dialog
      :visible.sync="isshowBox"
      :show-close="false"
      width="480px"
      :before-close="frameBoxClose"
    >
      <div class="body-center">
        <div class="body-center-top">
          <!--<i class="el-icon-warning"></i>-->
          <span>您确定{{ tit }}当前申请吗？</span>
        </div>
        <!--<div class="body-center-bottom">点击确定，将{{ tit }}当前申请</div>-->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="frameBoxClose" size="mini">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="!oneClick" size="mini">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 成功的弹框 -->
<!--    <el-dialog-->
<!--      :visible.sync="successBox"-->
<!--      class="successfulTipClass"-->
<!--      :show-close="false"-->
<!--      width="480px"-->
<!--      :before-close="flowChartClick"-->
<!--    >-->
<!--      <template slot="title">-->
<!--        <div class="page-header-left-clos">-->
<!--          <i class="el-icon-close" @click="flowChartClick"></i>-->
<!--        </div>-->
<!--      </template>-->
<!--      <div class="body-center">-->
<!--        <i class="el-icon-success"></i>-->
<!--        <div>申请{{ tit }}成功!</div>-->
<!--      </div>-->
<!--    </el-dialog>-->
  </div>
</template>

<script>
export default {
  props: {
    tit: {
      type: String,
      default: () => {
        return "";
      },
    },
    successBox: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    isshowBox: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    oneClick:{
      type: Boolean,
      default: () => {
        return true;
      },
    }
  },
  data() {
    return {
    };
  },
  methods: {
    frameBoxClose() {
      this.$emit('close-box-done', false)
    },
    handleSubmit() {
      this.$emit('success-done')
    },
    flowChartClick(){
      this.$emit('close-box', false)
    },
  },
};
</script>


<style lang="scss" scoped>

.successfulTipClass {
  .el-dialog__header {
    justify-content: space-between;
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
        padding: 33px 184px 57px !important;
        text-align: center;
        i {
          color: #3471ff;
          font-size: 50px;
        }
        div {
          margin-top: 20px;
        }
      }
    }
    .page-header-left-clos {
      height: 34px;
      float: right;
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      i {
        color: #bfbfbf;
        font-size: 14px;
        cursor: pointer;
        margin-right: 10px;
      }
    }
  }
}

/*新UI改版*/
 .frameBox ::v-deep {
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
