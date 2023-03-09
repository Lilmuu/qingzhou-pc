<template>
  <div id="body" class="topics-box">
    <div class="body-top">
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
            OAmodel="topics"
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
      <header class="header">行政类议题申报</header>
      <div class="body-form">
        <el-form
          ref="addForm"
          :model="modelForm"
          label-width="245px"
          :rules="rules"
          :disabled="
            requestParameters.tit == '审批' || requestParameters.tit == '查看'
          "
          :class="eFormClass()"
        >
          <el-row>
            <el-col :span="12">
              <div class="body-form-inp">
                <el-form-item label="申报部门" prop="departName">
                  <el-input
                    v-model="modelForm.departName"
                    placeholder=""
                    :readonly="true"
                  ></el-input>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="body-form-inp">
                <el-form-item label="申报时间" prop="declareTimes">
                  <el-input
                    v-model="modelForm.declareTimes"
                    placeholder=""
                    :readonly="true"
                  ></el-input>
                </el-form-item>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <div class="body-form-inp">
                <el-form-item label="会议类型" prop="meetingType" :class="{ 'not-filled-in': notFilledFun('meetingType') }">
                  <el-select
                    :class="[newBuilt ? 'newBuilt' : '']"
                    v-model="modelForm.meetingType"
                    placeholder="请选择会议类型"
                  >
                    <el-option
                      v-for="item in meetType"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                  <!--<i class="el-icon-warning"></i>-->
                  <i class="warning" v-if="newBuilt"></i>
                </el-form-item>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <!-- <div class="body-form-inp">
                <el-form-item label="主题" prop="theme" :class="{ 'not-filled-in': notFilledFun('theme') }">
                  <el-input
                    v-model="modelForm.theme"
                    placeholder="请输入主题内容"
                  ></el-input>
                </el-form-item>
              </div> -->

              <div class="body-form-textarea">
                <div class="body-form-textarea-left"><span>*</span>主题</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="theme" :class="{ 'not-filled-in': notFilledFun('reason') }">
                    <el-input
                      v-model="modelForm.theme"
                      placeholder="请输入主题内容"
                      maxlength="100"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div class="body-form-inp">
                <el-form-item label="密级" prop="secretLevel" :class="{ 'not-filled-in': notFilledFun('secretLevel') }">
                  <el-select
                    v-model="modelForm.secretLevel"
                    placeholder="请选择密级"
                    :class="[newBuilt ? 'newBuilt' : '']"
                  >
                    <el-option
                      v-for="item in secrtLevel"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="body-form-inp">
                <el-form-item label="汇报人" prop="reportName">
                  <el-input
                    v-model="modelForm.reportName"
                    placeholder=""
                    :readonly="true"
                    :maxlength="1000"
                  ></el-input>
                </el-form-item>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left"><span>*</span>原由</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="reason" :class="{ 'not-filled-in': notFilledFun('reason') }">
                    <el-input
                      v-model="modelForm.reason"
                      placeholder="请输入原由"
                      :maxlength="1000"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">
                  <span>*</span>决策事项
                </div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="decisionMatters" :class="{ 'not-filled-in': notFilledFun('decisionMatters') }">
                    <el-input
                      v-model="modelForm.decisionMatters"
                      placeholder="请输入决策事项"
                      :maxlength="1000"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" class="upload-box body-form-textarea">
              <div class="body-form-textarea-left">附件</div>
              <div class="body-form-textarea-right">
                <el-form-item label-width="0" prop="fileList">
                  <div class="upload-file">
                    <div class="file-list">
                      <div
                        class="file-item"
                        v-for="(item, index) in fileList"
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

          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">部门及领导意见</div>
                <div class="body-form-textarea-right dept-leaders">
                  <el-form-item label-width="0" prop="deptOpinio">
                    <approvalResults
                      v-if="modelForm.deptOpinio"
                      :results="modelForm.deptOpinio"
                      :minHeight="50"
                    />
                    <approvalResults
                      v-if="modelForm.leadersChargeId"
                      :results="modelForm.leadersChargeId"
                      :minHeight="50"
                    />
                    <el-input
                      v-if="!modelForm.deptOpinio"
                      v-model="modelForm.deptOpinio"
                      placeholder=""
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                      :readonly="true"
                      :maxlength="1000"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">会议组织部门意见</div>
                <div class="body-form-textarea-right dept-leaders">
                  <el-form-item label-width="0" prop="meetingOpinio">
                    <approvalResults
                      v-if="modelForm.meetingOpinio"
                      :results="modelForm.meetingOpinio"
                      :minHeight="50"
                    />
                    <el-input
                      v-if="!modelForm.meetingOpinio"
                      v-model="modelForm.meetingOpinio"
                      placeholder=""
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                      :readonly="true"
                      :maxlength="1000"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <div class="body-form-textarea">
                <div class="body-form-textarea-left">备注</div>
                <div class="body-form-textarea-right">
                  <el-form-item label-width="0" prop="remark">
                    <el-input
                      :maxlength="1000"
                      v-model="modelForm.remark"
                      placeholder="请输入备注内容"
                      type="textarea"
                      :autosize="{ minRows: 4 }"
                    ></el-input>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <approvalProcess
      v-if="!flowChartBox"
      :requestParameters="requestParameters"
    ></approvalProcess>
    <flowChart ref="flowChart" type="1"></flowChart>
    <submitBox ref="submitBox" :btnType="btnType"></submitBox>
  </div>
</template>

<script>
import flowChart from "@/components/flowChart";
import submitBox from "./submitBox.vue";
import { mapState } from "vuex";
import {
  meetingTaskselectMeetingDetails,
  flowableRecordselectMyInfo,
  reportcheckNodeDelegate,
} from "./api";

import { getDict } from "@/api/workSpace";
import approvalResults from "@/components/approvalResults";
import checkBoxCss from "@/styles/checkBoxCss.scss";
import workbenchUploadFile from "@/components/UploadFile/workbenchUploadFile.vue";
import { handleDownLoadFile } from "@/utils/download";
export default {
  name: "topics",
  components: { flowChart, submitBox, checkBoxCss, workbenchUploadFile, approvalResults },
  data() {
    return {
      unAgreeBtn: false,
      agreeBtn: false,
      isForward: false,
      newKeepalive: false, // 是否点击提交或暂存
      fileList: [],
      notFilled: [],
      endBtn: false,
      voteNode: 1,
      multipartFiles: [],
      id: "",
      taskId: "",
      businessId: "",
      headers: {
        Authorization: this.$store.getters.access_token,
      },
      modelForm: {},
      rules: {
        theme: [{ required: true, trigger: "blur" }],
        secretLevel: [{ required: true }],
        decisionMatters: [{ required: true, message: "决策事项", trigger: "change" }],
        reason: [{ required: true, message: "原由", trigger: "change" }],
        meetingType: [{ required: true, message: "会议类型", trigger: "change" }],
      },
      btnType: ""
    };
  },
  computed: {
    ...mapState({
      requestParameters: (state) => state.workbench.requestParameters,
      secrtLevel: state => state.workbench.secrtLevel,
      meetType: state => state.workbench.meetType,
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
      let tit = this.requestParameters.tit == "审批" ? true : false;
      return tit;
    },
    // 新建 or 审批
    newBuilt() {
      let newAdd = JSON.stringify(this.requestParameters) == "{}"; // 新建
      let tit =
        (this.requestParameters.status == 1 ||
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
    console.log(this.requestParameters.tit,'asdasdfasd=as-adf啊');
    // 获取字典
    if (this.secrtLevel.length == 0) {
      this.getDictCont("SET_SECRET_LEVEL", "secret_level");
    }
    if (this.meetType.length == 0) {
      this.getDictCont("SET_MEET_TYPE", "meet_type");
    }

    if (this.requestParameters.tit != undefined) {
      meetingTaskselectMeetingDetails({
        meetingId: this.requestParameters.businessId,
      }).then((res) => {
        this.modelForm = res.data.data;
        this.fileList = JSON.parse(res.data.data.fileIdlist);
        this.modelForm.declareTimes = res.data.data.declareTime;

        // if (res.data.data.deptOpinio) {
        //   this.modelForm.deptOpinio = this.opinionFun(res.data.data.deptOpinio);
        // }
        // if (this.modelForm.meetingOpinio) {
        //   this.modelForm.meetingOpinio = this.opinionFun(
        //     res.data.data.meetingOpinio
        //   );
        // }
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
              this.unAgreeBtn = res.data.data.unAggereBtn;
              this.endBtn = res.data.data.endBtn;
              this.voteNode = res.data.data.voteNode;
            }
          }
        );
      }
    } else {
      flowableRecordselectMyInfo().then((res) => {
        this.modelForm = res.data.data;
        this.modelForm.departName = res.data.data.deptName;
        this.modelForm.reportName = res.data.data.userName;
        this.modelForm.declareTimes = res.data.timestamp;
        // this.modelForm['secretLevel'] = '0'
        this.$set(this.modelForm,'secretLevel','0')

        this.modelForm.declareTimes = this.modelForm.declareTimes.split(" ")[0];
      });
    }
  },

  methods: {
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
      // let currentFile = this.fileList.find((item) => {
      //   let nameIndex = item.fileName.lastIndexOf(".");
      //   let name = item.fileName.substring(0, nameIndex);
      //   return file.fileName.indexOf(name) != -1;
      // });

      // if (currentFile) {
      //   currentFile.complete = 100;
      //   currentFile['url'] = file.uploadUrl;
      // } else {
      let currentFile = this.fileList.find((item) => {
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
        this.fileList.push(object);
      }
    },
    onError() {
      console.log("失败 - onError");
    },
    delFile(item, index) {
      this.fileList.splice(index, 1);
    },
    // 文件上传 - 分片进度
    onProgress(num, file) {
      console.log(num, file, "分片进度Progress");
      let currentFile = this.fileList.find((item) => item.uid === file.uid);
      if (currentFile != undefined) {
        currentFile.complete = num;
        console.log(this.fileList, "修改成功 - onProgress");
      } else {
        let object = {
          fileName: file.name,
          complete: num,
          uid: file.uid,
          url: file.uploadUrl,
        };
        this.fileList.push(object);
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

    getDictCont(commitType, item) {
      getDict(item).then((res) => {
        this.$store.commit(commitType, res.data.data);
      });
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
          this.modelForm.declareTime = null;
          this.$refs.submitBox.handleUp(
            tit,
            this.modelForm,
            this.requestParameters,
            this.fileList
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
    handleAvatarSuccess(res, file) {
      if (res.code == "0" && res.msg == "success") {
        this.$message.success("导入成功");
        this.modelForm.totalKey = res.data;
      } else if (res.msg == "error") {
        this.$message.error("导入失败");
      }
    },
    opinionFun(obj) {
      let approvalResult = obj.approvalResult == 1 ? "同意" : "驳回";
      let approvalName = obj.approvalName ? obj.approvalName : "";
      let approvalSuggest = obj.approvalSuggest ? obj.approvalSuggest : "";
      let approvalTime = obj.approvalTime ? obj.approvalTime : "";
      return (
        `${approvalResult}` + "\n" + `${approvalName}      ${approvalTime}`
      );
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
      line-height: 60px;
      text-align: center;
      font-size: 18px;
      border: 1px solid #dcdfe6;
      border-bottom: 0;
    }
    .body-form {
      border-left: 1px solid #dcdfe6;
      border-top: 1px solid #dcdfe6;
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
          color: #333333;
          text-align: left;
          background: #FBFBFC;
          padding-left: 26px;
          border-right: 1px solid #dcdfe6;
          font-size: 14px;
          line-height: 50px;
          &:before {
            position: absolute;
            left: 18px;
          }
        }
        ::v-deep.el-input__inner {
          border: 0;
          height: 50px;
          color: #333333;
        }
        ::v-deep.newBuilt  {
          margin-left: 15px;
          margin-right: 15px;
        }
        ::v-deep.el-select .el-input__inner {
          max-width: 200px;
          border: 1px solid #DEE0E3;
          height: 32px;
        }
        ::v-deep  .el-select .is-disabled .el-input__inner {
          border: 0!important;
          margin-left: 0!important;
        }
        ::v-deep .el-form-item__content {
          display: flex;
          align-items: center;
          height: 50px;
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
          width: 245px;
          background: #FBFBFC;
          border: 1px solid #dcdfe6;
          border-left: 0;
          border-top: 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 26px;

          span {
            position: absolute;
            left: 18px;
            padding-right: 4px;
            color: #f56c6c;
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
          height: 50px;
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
    /*div {*/
      /*display: inline-block;*/
      /*width: 120px;*/
      /*height: 40px;*/
      /*font-size: 14px;*/
      /*line-height: 40px;*/
      /*border-radius: 4px;*/
      /*cursor: pointer;*/
    /*}*/
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
}

  /*新版UI 新增的*/
.topics-box {
  background-color: #fff;
  border-radius: 10px;
  .warning {
    display: inline-block;
    width: 13px;
    height: 13px;
    background: url("../../../assets/img/workSpace/warning.png") no-repeat center/cover;
  }
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
