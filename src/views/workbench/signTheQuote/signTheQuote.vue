<template>
  <div id="body" class="signTheQuote-box">

    <div class="body-top" >
      <div class="header-row">
        <div class="flow-img-box" @click="flowChart">
          <i class="flow-ico"></i>
          <span >流程图</span>
        </div>
        <div class="body-bottom">
          <div
            class="temporaryStorage"
            @click="submit('暂存')"
            v-if="submitJudge()"
          >
            暂存
          </div>
          <div class="submit" @click="submit('提交')" v-if="submitJudge()">
            提交
          </div>
        </div>
        <div class="headerButton" v-if="!newBuilt">
          <oaMenu
            ref="oaMenu"
            :requestParameters="requestParameters"
            OAmodel="sign"
            :isSee="agreeOrDisagree && !isForward"
            :agreeBtn="agreeBtn && agreeOrDisagree"
            :endBtn="endBtn && agreeOrDisagree"
            :voteNode="voteNode"
            :unAgreeBtn="unAgreeBtn && agreeOrDisagree"
            :isForward="isForward && agreeOrDisagree"
          ></oaMenu>
        </div>
      </div>
    </div>




    <div class="body-center" id="box">
      <header>
        北京两江科技有限公司签报
        <div>北京两江科技签字【{{ modelForm.reportNumber }}】号</div>
      </header>
      <div class="body-form">
        <el-form
          ref="addForm"
          :model="modelForm"
          label-width="180px"
          :rules="rules"
          :disabled="
            requestParameters.tit == '审批' || requestParameters.tit == '查看'
          "
          :class="eFormClass()"
        >
          <el-row style="border-bottom: 1px solid #dcdfe6">
            <el-col
              :span="12"
              style="text-align: right; line-height: 60px; font-size: 14px"
              v-if="
                requestParameters.tit != '审批' &&
                requestParameters.tit != '查看'
              "
            >
              <span style="padding-right: 4px;color: #f56c6c;">*</span>签报标题：
            </el-col>
            <el-col
              :span="
                requestParameters.tit != '审批' &&
                requestParameters.tit != '查看'
                  ? 12
                  : 24
              "
            >
              <div
                :class="
                  requestParameters.tit != '审批' &&
                  requestParameters.tit != '查看'
                    ? 'body-form-inp-tit'
                    : 'inputClass'
                "
              >
                <el-form-item prop="title" label-width="0" :class="{ 'not-filled-in': notFilledFun('title') }">
                  <el-input
                    v-model="modelForm.title"
                    placeholder="请输入签报标题"
                    :maxlength="80"
                  ></el-input>
                </el-form-item>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">领导签批</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="leaderApproval">
                    <approvalResults
                      v-if="modelForm.leaderApproval.leaderApproval"
                      :results="modelForm.leaderApproval"
                      :minHeight="50"
                    />
                    <el-input
                      v-else
                      v-model="modelForm.leaderApproval.leaderApproval"
                      placeholder=""
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                      :readonly="true"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">分管领导签批</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="chargeLeaderApproval">
                    <approvalResults
                      v-if="modelForm.chargeLeaderApproval.chargeLeaderApproval"
                      :results="modelForm.chargeLeaderApproval"
                      :minHeight="50"
                    />
                    <el-input
                      v-else
                      v-model="modelForm.chargeLeaderApproval.chargeLeaderApproval"
                      placeholder=""
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                      :readonly="true"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">主办部门意见</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="deptComments">
                    <approvalResults
                      v-if="modelForm.deptComments.deptComments"
                      :results="modelForm.deptComments"
                      :minHeight="50"
                    />
                    <el-input
                      v-else
                      v-model="modelForm.deptComments.deptComments"
                      placeholder=""
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                      :readonly="true"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">相关部门意见</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="otherDeptComments">
                    <approvalResults
                      v-if="modelForm.otherDeptComments.otherDeptComments"
                      :results="modelForm.otherDeptComments"
                      type="department"
                      :minHeight="50"
                    />
                    <el-input
                      v-else
                      v-model="modelForm.otherDeptComments.otherDeptComments"
                      placeholder=""
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                      :readonly="true"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <div class="body-form-inp">
                <el-form-item label="主办部门" prop="hostingDepartName">
                  <el-input
                    v-model="modelForm.hostingDepartName"
                    placeholder="请输入主办部门"
                    :readonly="true"
                  ></el-input>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="body-form-inp">
                <el-form-item label="经办人" prop="managerName">
                  <el-input
                    v-model="modelForm.managerName"
                    placeholder="请输入经办人"
                    :readonly="true"
                  ></el-input>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="body-form-inp">
                <el-form-item label="日期" prop="submitTime">
                  <el-input
                    v-model="modelForm.submitTime"
                    placeholder="请输入日期"
                    :readonly="true"
                  ></el-input>
                </el-form-item>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left"><span style="padding-right: 4px;color: #f56c6c;">*</span>说明</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="hostingDepartExplain" :class="{ 'not-filled-in': notFilledFun('hostingDepartExplain') }">
                    <el-input
                      v-model="modelForm.hostingDepartExplain"
                      placeholder="请输入说明内容"
                      :maxlength="1000"
                    ></el-input>
                    <!--<el-input-->
                      <!--v-model="modelForm.hostingDepartExplain"-->
                      <!--placeholder="请输入说明内容"-->
                      <!--type="textarea"-->
                      <!--:autosize="{ minRows: 3 }"-->
                    <!--&gt;</el-input>-->
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" class="upload-box body-form-textarea">
              <div class="body-form-textarea-left">附件</div>
              <div class="body-form-textarea-right">
                <el-form-item label-width="0" prop="reportFile">
                  <div class="upload-file">
                    <div class="file-list">
                      <div
                        class="file-item"
                        v-for="(item, index) in reportFile"
                        :key="index + item.uid"
                      >
                        <!--<img src="@/assets/img/workSpace/file-ico.png" alt="" />-->
                        <fileIcon  :fileUrl="item.fileName"></fileIcon>
                        <span @click="downloadFile(item)">{{
                          item.fileName
                        }}</span>

                        <div v-if="item.complete != 100">
                          {{ item.complete }}%
                        </div>
                        <i
                          v-else-if="newBuilt"
                          class="el-icon-close"
                          @click="delFile(item, index)"
                        ></i>
                      </div>
                    </div>
                    <!-- 上传图片 -->
                    <span class="upload-span" v-if="submitJudge()">
                      <workbenchUploadFile
                        uploadText="上传附件"
                        :initFileList="multipartFiles"
                        @progress="onProgress"
                        @success="onSuccess"
                        @error="onError"
                        lineMode
                        errorText="请上传正确的附件"
                      >
                      </workbenchUploadFile>
                    </span>
                  </div>
                </el-form-item>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <flowChart ref="flowChart" type="2"></flowChart>
    <submitBox ref="submitBox"></submitBox>
    <approvalProcess
      v-if="!flowChartBox"
      :requestParameters="requestParameters"
    ></approvalProcess>
  </div>
</template>

<script>
import flowChart from "@/components/flowChart";
import submitBox from "./submitBox.vue";
import { mapState } from "vuex";
import { reportdetails, reportcheckNodeDelegate } from "./api";
import workbenchUploadFile from "@/components/UploadFile/workbenchUploadFile.vue";
import { handleDownLoadFile } from "@/utils/download";
import approvalResults from "@/components/approvalResults";
export default {
  name: "topics",
  components: { flowChart, submitBox,  workbenchUploadFile, approvalResults },
  data() {
    return {
      unAgreeBtn: false,
      agreeBtn: false,
      newKeepalive: false, // 是否点击提交或暂存
      isForward: false,
      endBtn: false,
      voteNode: 1,
      notFilled: [],
      headers: {
        Authorization: this.$store.getters.access_token,
      },
      modelForm: {
        hostingDepartName: "",
        managerName: "",
        submitTime: "",
        leaderApproval: {
          leaderApproval: "",
        },
        chargeLeaderApproval: {
          chargeLeaderApproval: "",
        },
        deptComments: {
          deptComments: "",
        },
        otherDeptComments: {
          otherDeptComments: "",
        },
      },
      rules: {
        title: [{ required: true, trigger: "blur" }],
        hostingDepartExplain: [{ required: true, trigger: "change" }],
      },
      multipartFiles: [],
      reportFile: [],
      hylx: [
        {
          value: "1",
          label: "支委会",
        },
        {
          value: "2",
          label: "总经理办公会",
        },
      ],
      mj: [
        {
          value: "1",
          label: "公司机密",
        },
        {
          value: "2",
          label: "公司绝密",
        },
      ],
    };
  },
  computed: {
    ...mapState({
      requestParameters: (state) => state.workbench.requestParameters,
    }),
    flowChartBox() {
      let newAdd = JSON.stringify(this.requestParameters) == "{}"; // 新建
      let tit =
        this.requestParameters.status == 1 &&
        (this.requestParameters.tit == "编辑" ||
          this.requestParameters.status == 2 ||
          this.requestParameters.tit == "查看");
      return newAdd || tit;
    },
    // 同意不同意 && 转发
    agreeOrDisagree() {
      let tit = this.requestParameters.tit == "审批";
      return tit;
    },
    // 新建 or 审批
    newBuilt() {
      let newAdd = JSON.stringify(this.requestParameters) == "{}"; // 新建
      let tit =
        (this.requestParameters.status == 1 ||
          this.requestParameters.status == 2 ||
          this.requestParameters.status == 3) &&
        this.requestParameters.tit == "编辑";
      return newAdd || tit;
    },
    // 未填项
    notFilledFun() {
      return (val) => {
        let have = this.notFilled.findIndex((e) => {
          return e === val;
        });
        return have == -1 ? false : true;
      };
    },
  },

  mounted() {
    if (this.requestParameters.tit != undefined) {
      console.log(this.requestParameters.id, 111);
      reportdetails({ id: this.requestParameters.id }).then((res) => {
        this.modelForm = res.data.data;
        this.reportFile = JSON.parse(res.data.data.reportFile);
        console.log(this.modelForm);
        this.leaderApprovalsbcnm("leaderApproval");
        this.leaderApprovalsbcnm("chargeLeaderApproval");
        this.leaderApprovalsbcnm("deptComments");
        this.leaderApprovalsbcnm("otherDeptComments");
      });
      if (
        this.requestParameters.status != 1 &&
        this.requestParameters.tit != "编辑"
      ) {
        reportcheckNodeDelegate({ taskId: this.requestParameters.taskId }).then(
          (res) => {
            if (res.data.code == 0) {
              this.isForward = res.data.data.forwardBtn;
              this.agreeBtn = res.data.data.aggreBtn;
              this.endBtn = res.data.data.endBtn;
              this.unAgreeBtn = res.data.data.unAggereBtn;
              this.voteNode = res.data.data.voteNode
            }
          }
        );
      }
    } else {
      reportdetails().then((res) => {
        console.log(res.data.data, 12312);
        this.modelForm.hostingDepartName = res.data.data.hostingDepartName;
        this.modelForm.managerName = res.data.data.managerName;
        this.modelForm.submitTime = res.data.data.submitTime;
        this.modelForm.leaderOpinionsId = res.data.data.leaderOpinionsId;
        this.modelForm.submitTime = res.data.timestamp;
        this.modelForm.submitTime = this.modelForm.submitTime.split(" ")[0];
      });
    }
  },
  methods: {
    leaderApprovalsbcnm(data) {
      if (this.modelForm[data]) {
        if(data == 'otherDeptComments'){
          this.modelForm[data][data] =
            `${this.modelForm[data].approvalResult == 1 ? '<span style="color:#34BE3A;margin-right:40px">同意</span>' : '<span style="color:#F54A45;margin-right:40px">驳回</span>'}`
            + "&nbsp&nbsp&nbsp" + `${this.modelForm[data].approvalTime}`;
        }else{
          this.modelForm[data][data] =
            `${this.modelForm[data].approvalResult == 1 ?
              '<span style="color:#34BE3A;margin-right:40px">同意</span>' : '<span style="color:#F54A45;margin-right:40px">驳回</span>'}`  +
          "&nbsp&nbsp&nbsp" +
          `${this.modelForm[data].approvalName}       ${this.modelForm[data].approvalTime}`;
        }

      } else {
        this.modelForm[data] = "";
      }
    },
    downloadFile(file) {
      let url = file.url;
      if (!url) {
        this.$message.error("资源链接不存在");
        return;
      }
      handleDownLoadFile(url);
    },
    // 文件上传 - 成功
    onSuccess(file) {
      let currentFile = this.reportFile.find((item) => {
        // 判断是不是分片上传
        if(file.bucketName){
          return file.name===item.fileName
        }else{
          return file.fileName === item.fileName;
        }
      });

      if (currentFile && file.bucketName) {
        currentFile.complete = 100;
        currentFile["url"] = file.uploadUrl;
      } else if(currentFile && !file.bucketName){
        this.$message.error("请勿上传重复文件！");
      }else {
        let object = {
          fileName: file.fileName,
          complete: 100,
          uid: file.uid || 0,
          url: file.uploadUrl,
        };
        this.reportFile.push(object);
      }
    },
    onError() {
      console.log("失败 - onError");
    },
    delFile(item, index) {
      this.reportFile.splice(index, 1);
    },
    // 文件上传 - 分片进度
    onProgress(num, file) {
      console.log(num, file, "分片进度Progress");
      let currentFile = this.reportFile.find((item) => item.uid === file.uid);
      if (currentFile != undefined) {
        currentFile.complete = num;
        console.log(this.reportFile, "修改成功 - onProgress");
      } else {
        let object = {
          fileName: file.name,
          complete: num,
          uid: file.uid,
        };
        this.reportFile.push(object);
      }
    },
    eFormClass() {
      if (
        this.requestParameters.tit == "查看" ||
        this.requestParameters.tit == "审批"
      ) {
        return "readOnlyClass";
      } else {
        return "";
      }
    },
    submitJudge() {
      if (
        this.requestParameters.tit == undefined ||
        this.requestParameters.tit == "编辑"
      ) {
        return true;
      } else {
        return false;
      }
    },
    submit(tit) {
      this.$refs["addForm"].validate((valid, object) => {
        if(!valid){
          this.notFilled = Object.keys(object);
          this.$message({ type: "error", message: "请填写必填项" });
        }else{
          this.$refs.submitBox.handleUp(
            tit,
            this.modelForm,
            this.requestParameters,
            this.reportFile
          );
          this.newKeepalive = true;
        }
      })
    },
    flowChart() {
      this.$refs.flowChart.flowChartVisible = true;
    },
    beforeUpload(file) {
      let name = file.name;
      let typeList = ["xlsx", "xls"];
      let type = name.substring(name.lastIndexOf(".") + 1);
      const isPassType = typeList.includes(type.toLowerCase());
      if (!isPassType) {
        this.$message.error("上传文件的格式只能是 xlsx、xls 格式!");
      }
      return isPassType;
    },
    handleAvatarSuccess(res) {
      if (res.code == "0" && res.msg == "success") {
        this.$message.success("导入成功");
        this.modelForm.totalKey = res.data;
      } else if (res.msg == "error") {
        this.$message.error("导入失败");
      }
    },
  },
  // beforeRouteEnter(to, from, next) {
  //   let addOrEdit = from.matched[0].instances.default.$store.getters.addOrEdit;
  //   if (addOrEdit) {
  //     to.meta.keepAlive = true;
  //   } else {
  //     to.meta.keepAlive = false;
  //   }
  //   next();
  // },
  // beforeRouteLeave(to, from, next) {
  //   if (this.newKeepalive) {
  //     from.meta.keepAlive = false;
  //   }
  //   next();
  // },
};
</script>

<style lang="scss" scoped>
#body {
  padding: 20px 20px;
  height: 100%;
  overflow-y: auto;
  .body-top {
    color: #3471ff;
    margin-bottom: 20px;
    i {
      font-size: 14px;
    }
    span {
      font-size: 16px;
      margin-left: 3px;
      cursor: pointer;
    }
    .headerButton {
      float: right;
    }
  }
  .body-center {
    // border: 1px solid #DCDFE6;
    header {
      height: 60px;
      line-height: 30px;
      text-align: center;
      font-size: 18px;
      border: 1px solid #dcdfe6;
      border-bottom: 0;
      div {
        font-size: 16px;
      }
    }
    .title {
      height: 60px;
      border-bottom: 1px solid #dcdfe6;
      border-right: 1px solid #dcdfe6;
      // text-align: center;
      line-height: 60px;
      div {
        width: 230px;
      }
      // ::v-deep.el-input{
      //     width: 50%;
      //     height: 100%;
      //     .el-input__inner{
      //         border: 0;
      //         width: 50%;
      //         float: right;
      //     }
      // }
    }
    .body-form {
      border-left: 1px solid #dcdfe6;
      border-top: 1px solid #dcdfe6;
      .body-form-inp-tit {
        .el-form-item {
          margin-bottom: 0;
          border: 1px solid #dcdfe6;
          border-left: 0;
          border-bottom: 0;
          border-top: 0;
        }
        ::v-deep.el-form-item__label {
          text-align: left;
          background: #FBFBFC;
          padding-left: 26px;
          border-right: 1px solid #dcdfe6;
          font-size: 14px;
          line-height: 60px;
          color: #333333;
          &:before {
            position: absolute;
            left: 18px;
          }
        }
        ::v-deep.el-input__inner {
          border: 0;
          height: 60px;
          color: #333333;
        }
        ::v-deep.el-textarea__inner {
          border: 0;
          resize: none; /* 这个是去掉 textarea 下面拉伸的那个标志，如下图 */
          color: #333333;
        }
      }
      .inputClass {
        .el-form-item {
          margin-bottom: 0;
          border: 1px solid #dcdfe6;
          border-left: 0;
          border-bottom: 0;
          border-top: 0;
        }
        ::v-deep.el-form-item__label {
          text-align: left;
          background: #FBFBFC;
          padding-left: 26px;
          border-right: 1px solid #dcdfe6;
          font-size: 14px;
          line-height: 60px;
          color: #333333;
        }
        ::v-deep.el-input__inner {
          border: 0;
          height: 60px;
          text-align: center;
          color: #333333;
        }
        ::v-deep.el-textarea__inner {
          border: 0;
          resize: none; /* 这个是去掉 textarea 下面拉伸的那个标志，如下图 */
          color: #333333;
        }
      }
      .body-form-inp {
        .accessoryName {
          float: left;
        }
        .uploadingAccessory {
          float: right;
          height: 60px;
          color: #3471ff;
          display: flex;
          align-items: center;
          margin-right: 20px;
          i {
            color: #3471ff;
            margin-right: 3px;
          }
          div {
            cursor: pointer;
            line-height: 20px;
          }
        }
        i {
          color: orange;
          font-size: 14px;
        }
        .el-form-item {
          margin-bottom: 0;
          border: 1px solid #dcdfe6;
          border-left: 0;
          border-top: 0;
        }
        ::v-deep.el-form-item__label {
          text-align: left;
          background: #FBFBFC;
          padding-left: 26px;
          border-right: 1px solid #dcdfe6;
          font-size: 14px;
          line-height: 60px;
          color: #333333;
        }
        ::v-deep.el-input__inner {
          border: 0;
          height: 60px;
          color: #333333;
        }
        ::v-deep .newBuilt {
          margin-left: 15px;
        }
        ::v-deep.el-select .el-input__inner {
          border: 1px solid #DEE0E3;
          height: 32px;
        }
        ::v-deep  .el-select .is-disabled .el-input__inner {
          border: 0!important;
          margin-left: 0!important;
        }
        ::v-deep.el-textarea__inner {
          border: 0;
          resize: none; /* 这个是去掉 textarea 下面拉伸的那个标志，如下图 */
          color: #333333;
        }
      }
      .body-form-textarea {
        display: flex;
        .body-form-textarea-left {
          color: #333333;
          width: 180px;
          background: #FBFBFC;
          border: 1px solid #dcdfe6;
          border-left: 0;
          border-top: 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 26px;
          &:before {
            position: absolute;
            left: 18px;
          }
        }
        .body-form-textarea-right {
          flex: 1;
        }
        .el-form-item {
          margin-bottom: 0;
          border: 1px solid #dcdfe6;
          border-left: 0;
          border-top: 0;
        }

        ::v-deep.el-input__inner {
          border: 0;
          height: 60px;
          color: #333333;
        }
        ::v-deep.el-textarea__inner {
          border: 0;
          resize: none; /* 这个是去掉 textarea 下面拉伸的那个标志，如下图 */
          color: #333333;
        }
      }
    }
  }
  .body-bottom {
    text-align: center;
    // margin-top: 50px;
    // div {
    //   display: inline-block;
    //   width: 120px;
    //   height: 40px;
    //   font-size: 14px;
    //   line-height: 40px;
    //   border-radius: 4px;
    //   cursor: pointer;
    // }
    .temporaryStorage {
      border: 1px solid #dcdfe6;
    }
    .submit {
      background: #3471ff;
      color: white;
      margin-left: 20px;
    }
  }
  .upload-file {
    padding: 0 15px;
    display: flex;
    min-height: 60px;
    justify-content: space-between;
    .file-list {
      padding: 8px 0;
      width: calc(100% - 100px);
    }
    .upload-span {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #3471ff;
      i {
        color: #3471ff;
        margin-right: 3px;
      }
    }
    .file-item {
      display: inline-flex;
      max-width: 200px;
      align-items: center;
      line-height: 24px;
      padding: 3px 8px;
      margin-right: 10px;
      background-color: #FBFBFC;
      border-radius: 6px;
      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 10px 0 6px;
        color: #3471ff;
        cursor: pointer;
      }
      img {
        width: 14px;
      }
      i {
        cursor: pointer;
      }
    }
  }
  .inputClass {
    text-align: center;
  }
}


 /*新版UI 新增的*/
.signTheQuote-box {
  background-color: #fff;
  border-radius: 10px;
  .flow-img-box {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px;
    padding: 0 10px;
    color: #3370FF;
    border: 1px solid #3370FF;
    font-size: 14px;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    .flow-ico {
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-right: 10px;
      background: url("../../../assets/img/workbench/flow-blue.png") no-repeat center/cover;
    }
  }

  .header {
    background-color: #fff;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .body-bottom {
      display: flex;
      margin: 0;
      .temporaryStorage, .submit {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 84px;
        height: 32px;
        font-size: 14px;
        border: 1px solid #DEE0E3;
        border-radius: 6px;
        cursor: pointer;
      }
    }
  }
}
::v-deep .is-disabled {
  .el-input__suffix-inner {
    display: none;
  }
}
::v-deep .remark-content   .frist{
  margin-right: 40px;
}
::v-deep .remark-content   .second{
  margin-right: 16px;
}
</style>
