<!--
 * @Author: your name
 * @Date: 2021-12-17 15:28:29
 * @LastEditTime: 2022-08-15 09:43:21
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\workbench\useSealModel.vue
-->
<template>
  <div class="use-seal-model">
    <div class="use-seal-flow">
      <div class="header-row">
        <div class="flow-img-box" @click="flowChart">
          <i class="flow-ico"></i>
          <span >流程图</span>
        </div>
        <div v-if="newBuilt" class="submit_btn">
          <el-button @click="submit(2)" class="sbtn btn1">暂存</el-button>
          <el-button type="primary" @click="submit(1)" class="sbtn btn2">提交</el-button>
        </div>
        <oaMenu
          v-if="!newBuilt"
          :requestParameters="requestParameters"
          OAmodel="useSeal"
          :isSee="agreeOrDisagree && !isForward"
          :agreeBtn="agreeBtn && agreeOrDisagree"
          :endBtn="endBtn && agreeOrDisagree"
          :voteNode="voteNode"
          :unAgreeBtn="unAgreeBtn && agreeOrDisagree"
          :isForward="isForward && agreeOrDisagree"
        />
      </div>

    </div>
    <div class="use-seal-content-table" ref="box">
      <div class="table-header">
        <p class="header">{{ companyName }}</p>
      </div>
      <div class="table-container">
        <el-form
          ref="useSealForm"
          :model="useSealForm"
          label-width="180px"
          :rules="useSealRules"
        >
          <!-- 申报部门 && 申请人 -->
          <el-row class="item-seal border-bottom">
            <el-col :span="12" class="border-right">
              <el-form-item label="申报部门">
                <el-input v-model="useSealForm.departName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请人">
                <el-input v-model="useSealForm.userName" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 用印时间 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="24"
              :class="{ 'not-filled-in': notFilledFun('printTime') }"
            >
              <el-form-item label="用印时间" prop="printTime">
                <el-date-picker
                  v-model="useSealForm.printTime"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                  placeholder="请输入用印时间"
                  :disabled="!newBuilt"
                >
                </el-date-picker>
                <!--<i class="el-icon-warning" v-if="newBuilt"></i>-->
                <i class="warning" v-if="newBuilt"></i>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 印章名称 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="24"
              :class="{ 'not-filled-in': notFilledFun('sealName') }"
            >
              <el-form-item label="印章名称" prop="sealName">
                <el-select
                  v-model="useSealForm.sealName"
                  placeholder="请选择印章名称"
                  :disabled="!newBuilt"
                  :class="[newBuilt ? 'newBuilt' : '']"
                >
                  <el-option
                    v-for="item in printSealName"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 用印资料明细 item-seal -->
          <el-row class="border-bottom form-table">
            <el-col :span="24">
              <el-form-item label="用印资料明细">
                <div class="form-table-cont">
                  <div class="tips">
                    <p>说明：以表格形式列出用印资料明细，并注明每件份数。</p>
                    <div class="item-btn" v-if="newBuilt">
                      <!-- <i class="el-icon-circle-plus" @click="tableAddRow()"></i>
                      <i class="el-icon-remove" @click="removeTableData()"></i> -->
                        <i class="ico-plus" @click="tableAddRow()"></i>
                        <i class="ico-minus" @click="removeTableData()"></i>
                        <i></i>
                    </div>
                  </div>
                  <div class="table-content">
                    <el-table
                      :data="tableData"
                      border
                      @selection-change="selectionChange"
                      :header-cell-class-name="headerRowStyle"
                    >
                      <el-table-column
                        type="selection"
                        width="55"
                        label="选择"
                      ></el-table-column>
                      <el-table-column
                        type="index"
                        width="50"
                        label="顺序"
                      ></el-table-column>

                      <el-table-column prop="name" label="资料名称">
                        <template slot-scope="scope">
                          <el-input
                            v-model="scope.row.materialName"
                            :disabled="!newBuilt"
                            :class="{
                              'not-filled-in': notWrite(scope.row.materialName),
                            }"
                            placeholder="请输入"
                            maxLength="50"
                          ></el-input>
                        </template>
                      </el-table-column>

                      <el-table-column prop="addr" label="编号">
                        <template slot-scope="scope">
                          <el-input
                            v-model="scope.row.materialNumber"
                            :disabled="!newBuilt"
                            :class="{
                              'not-filled-in': notWrite(
                                scope.row.materialNumber
                              ),
                            }"
                            placeholder="请输入"
                            maxLength="50"
                          ></el-input>
                        </template>
                      </el-table-column>

                      <el-table-column prop="addr" label="份数">
                        <template slot-scope="scope">
                          <el-input
                            v-model="scope.row.materialAmount"
                            :disabled="!newBuilt"
                            :class="{
                              'not-filled-in': notWrite(
                                scope.row.materialAmount
                              ),
                            }"
                            @input="scope.row.materialAmount = inputNumFun(scope.row.materialAmount)"
                            placeholder="请输入"
                            maxLength="8"
                          ></el-input>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 用印资料附件 -->
          <el-row class="file-upload border-bottom">
            <el-col :span="24" class="item-title upload-box">
              <el-form-item label="用印资料附件" class="">
                <div class="upload-file">
                  <div class="file-list">
                    <div
                      class="file-item"
                      v-for="(item, index) in meansFileList"
                      :key="index + item.uid"
                    >
                      <!--<img src="@/assets/img/workSpace/file-ico.png" alt="" />-->
                      <fileIcon :fileUrl="item.fileName"></fileIcon>
                      <span @click="downloadFile(item)">{{
                        item.fileName
                      }}</span>
                      <div v-if="item.complete != 100">
                        {{ item.complete }}%
                      </div>
                      <i
                        v-else-if="newBuilt"
                        class="el-icon-close"
                        @click="delMeansFile(item, index)"
                      ></i>
                    </div>
                  </div>
                  <!-- 上传图片 -->
                  <span class="upload-span" v-if="newBuilt">
                    <workbenchUploadFile
                      uploadText="资料附件"
                      :initFileList="multipartFiles"
                      @progress="onMeansProgress"
                      @success="onMeansSuccess"
                      @error="onError"
                      lineMode
                      errorText="请上传正确的附件"
                    >
                    </workbenchUploadFile>
                  </span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 用印依据 -->
          <el-row class="file-upload border-bottom">
            <el-col :span="24" class="item-title upload-box">
              <el-form-item label="用印依据" class="">
                <div class="upload-file">
                  <div class="file-list">
                    <div
                      class="file-item"
                      v-for="(item, index) in fileList"
                      :key="index + item.uid"
                    >
                      <!--<img src="@/assets/img/workSpace/fileIcon.png" alt="" />-->
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
                  <span class="upload-span" v-if="newBuilt">
                    <workbenchUploadFile
                      uploadText="选择依据"
                      :initFileList="multipartFiles"
                      :isUpload="false"
                      @progress="onProgress"
                      @success="onSuccess"
                      @error="onError"
                      lineMode
                      errorText="请选择正确的依据"
                    >
                    </workbenchUploadFile>
                  </span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 部门意见 -->
          <el-row class="item-seal border-bottom">
            <el-col :span="24">
              <el-form-item label="部门意见">
                <div class="opinion" v-html="departmentFun(useSealForm.deptOpinio)"></div>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 领导意见 -->
          <el-row class="item-seal">
            <el-col :span="24">
              <el-form-item label="领导意见">
                <div class="opinion" v-html="opinionFun(useSealForm.leadersChargeId)"></div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>


    <approvalProcess
      v-if="!flowChartBox"
      :requestParameters="requestParameters"
    ></approvalProcess>
    <flowChart ref="flowChart" type="3" />
    <frameBox
      :tit="titVal"
      :isshowBox="isshowBox"
      :successBox="successBox"
      :oneClick="oneClick"
      @success-done="successDone"
      @close-box-done="closeBoxDone"
      @close-box="pushTNav"
    ></frameBox>
  </div>
</template>

<script>
import {
  printSubmit,
  storagePrint,
  submitStoragePrint,
  submitRefusePrintProcess,
  selectPrintDetails,
  articleMessage,
  getDict,
  checkNodeDelegate,
} from "@/api/workSpace";

import { mapState } from "vuex";
import { handleDownLoadFile } from "@/utils/download";
import oaMenu from "@/components/oaMenu";
import frameBox from "@/components/workbenchModel/frameBox.vue";
import approvalResults from "@/components/approvalResults";
import flowChart from "@/components/flowChart";
import workbenchUploadFile from "@/components/UploadFile/workbenchUploadFile.vue";
export default {
  components: {
    oaMenu,
    flowChart,
    workbenchUploadFile,
    approvalResults,
    frameBox,
  },
  name: "useSeal",
  data() {
    return {
      companyName: "印章使用流程", // 文档名称
      fileList: [], // 用印依据
      meansFileList: [], // 用印资料附件
      multipartFiles: [],
      notFilled: [], // 未填写字段
      isForward: false, // 可否转发
      oneClick: true, // 误触
      agreeBtn: false,
      unAgreeBtn: false,
      voteNode: 1,
      newKeepalive: false, // 是否点击提交或暂存
      titVal: "提交",
      isshowBox: false,
      successBox: false,
      endBtn: false,
      sumbitOpne: false, // 点击提交
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() < new Date().getTime() - 24 * 60 * 60 * 1000;
        },
      },
      useSealForm: {
        printTime: "", // 创建时间
        departName: "", // 部门名字
        userName: "", // 申请人
        sealName: "", // 用印名称
        materialList: [], // 用印资料明细
        materialFile: "", // 用印资料附件
        printBasis: "", // 用印依据附件
        leadersChargeId: "", // 领导意见
        deptOpinio: "", // 部门意见
      },
      tableData: [
        {
          materialName: "", // 资料的名称
          materialNumber: "", // 资料的编号
          materialAmount: "", //资料的份数
          materialKey: "0-1234567890", //
        }
      ],
      useSealRules: {
        printTime: [{ required: true, message: "用印时间", trigger: "change" }],
        sealName: [{ required: true, message: "印章名称", trigger: "change" }],
      },
      selectArr: [], // 已选择的数据项
    };
  },
  computed: {
    ...mapState({
      printSealName: (state) => state.workbench.printSealName,
      requestParameters: (state) => state.workbench.requestParameters,
    }),
    // 新建
    addDispatch() {
      return JSON.stringify(this.requestParameters) == "{}";
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
    notFilledFun() {
      return (val) => {
        let have = this.notFilled.findIndex((e) => {
          return e === val;
        });
        return have == -1 ? false : true;
      };
    },
    notWrite() {
      return (val) => {
        if (this.sumbitOpne) {
          return val == "" ? true : false;
        } else {
          return false;
        }
      };
    },
    departmentFun() {
      return (obj = "") => {
        if (obj == "") {
          return "";
        } else {
          let approvalResult = obj.approvalResult == 1 ?
            `<span style="color:#34BE3A;margin-right:40px">同意</span>`
            :
            `<span style="color:#F54A45;margin-right:40px">驳回</span>`;
          // let approvalName = obj.approvalName ? obj.approvalName : "";
          let approvalTime = obj.approvalTime ? obj.approvalTime : "";
          return `${approvalResult} ${approvalTime} `
        }
      };
    },
    opinionFun() {
      return (obj = "") => {
        if (obj == "") {
          return "";
        } else {
          let approvalResult = obj.approvalResult == 1 ?
            `<span style="color:#34BE3A;margin-right:40px">同意</span>`
            :
            `<span style="color:#F54A45;margin-right:40px">驳回</span>`;
          let approvalName = obj.approvalName ? obj.approvalName : "";
          let approvalTime = obj.approvalTime ? obj.approvalTime : "";
          return `${approvalResult} ${approvalName}&nbsp;&nbsp;&nbsp;${approvalTime}`
        }
      };
    }
  },
  mounted() {
    if (this.printSealName.length == 0) {
      this.getDictCont("SET_PRINT_SEALNAME", "print_sealName");
    }
    if (!this.newBuilt && this.requestParameters.status != 1) {
      this.checkNodeDelegate(this.requestParameters);
    }
    if (JSON.stringify(this.requestParameters) == "{}") {
      this.articleMessage();
    }
    if (!this.addDispatch) {
      this.seeSelectPrintDetails(
        this.requestParameters.businessId
          ? this.requestParameters.businessId
          : ""
      );
    }
  },
  methods: {
    // 添加数据项
    tableAddRow() {
      let time = new Date().getTime();
      let materialKey = `${this.tableData.length}-${time}`;
      this.tableData.push({
        materialName: "",
        materialNumber: "",
        materialAmount: "",
        materialKey,
      });
      this.sumbitOpne = false;
    },
    // 多选
    selectionChange(selection) {
      let newArr = selection.map((item) => {
        return item.materialKey;
      });
      this.selectArr = newArr;
      console.log("selection0", selection, newArr);
    },
    // 删除数据项
    removeTableData() {
      // this.selectArr
      let newArr = this.tableData.filter((e) => {
        return this.selectArr.indexOf(e.materialKey) == -1;
      });
      this.tableData = newArr;
      this.sumbitOpne = false;
      console.log(newArr, "newArr--newArr w");
    },
    // 提交
    submit(value) {
      let incomplete = this.fileList.findIndex((item) => item.complete != 100);
      let incompletemeans = this.meansFileList.findIndex(
        (item) => item.complete != 100
      );
      if (incomplete != -1 || incompletemeans != -1) {
        this.$message({ type: "error", message: "文件未上传成功,请稍后再试" });
        return;
      }

      this.sumbitOpne = true;
      this.$refs["useSealForm"].validate((valid, object) => {
        let notVal = this.tableData.filter((item) => {
          return (
            item.materialName == "" ||
            item.materialNumber == "" ||
            item.materialAmount == ""
          );
        });
        if (!valid || notVal.length > 0) {
          this.notFilled = Object.keys(object);
          this.$message({ type: "error", message: "请填写必填项" });
        } else if (this.tableData.length < 1) {
          this.$message({ type: "error", message: "至少有一项用印资料明细" });
        } else {
          this.titVal = value == 1 ? "提交" : value == 2 ? "暂存" : "";
          this.isshowBox = true;
        }
      });
    },
    // 确认提交/暂存 二次确认按钮
    successDone() {
      this.useSealForm.materialFile = JSON.stringify(this.meansFileList);
      this.useSealForm.printBasis = JSON.stringify(this.fileList);
      this.useSealForm.materialList = this.tableData;
      this.useSealForm["id"] = this.requestParameters.businessId;
      if (this.titVal == "暂存" && this.oneClick) {
        this.oneClick = false;
        storagePrint(this.useSealForm).then((res) => {
          if (res.data.code == 0) {
            // this.successBox = true;
            this.$store.commit("SET_REQUESTPARAMETERS", {});
            this.$store.commit("pushTopNav", { path: "flowPath" });
            this.$router.push({path:'flowPath',})
            this.isshowBox = false;
          }
          this.oneClick = true;
          this.isshowBox = false;
        });
      } else if (this.titVal == "提交" && this.oneClick) {
        this.oneClick = false;
        this.useSealForm["workflowId"] = this.requestParameters.id;
        // 驳回提交
        if (this.requestParameters.status == "3" || this.requestParameters.withdrawFlag == 1) {
          submitRefusePrintProcess(this.useSealForm).then((res) => {
            if (res.data.code == 0) {
              // this.successBox = true;
              this.$store.commit("SET_REQUESTPARAMETERS", {});
              this.$store.commit("pushTopNav", { path: "flowPath" });
              this.$router.push({path:'flowPath',})
            }
            this.oneClick = true;
            this.isshowBox = false;
          });
        }
        // 暂存提交
        else if (this.requestParameters.status == "1") {
          submitStoragePrint(this.useSealForm).then((res) => {
            if (res.data.code == 0) {
              // this.successBox = true;
              this.$store.commit("SET_REQUESTPARAMETERS", {});
              this.$store.commit("pushTopNav", { path: "flowPath" });
              this.$router.push({path:'flowPath',})
            }
            this.oneClick = true;
            this.isshowBox = false;
          });
        }
        // 新建提交
        else {
          printSubmit(this.useSealForm).then((res) => {
            if (res.data.code == 0) {
              // this.successBox = true;
              this.$store.commit("SET_REQUESTPARAMETERS", {});
              this.$store.commit("pushTopNav", { path: "flowPath" });
              this.$router.push({path:'flowPath',})
            }
            this.oneClick = true;
          });
        }
      }
    },
    // 个人&&部门信息
    articleMessage() {
      articleMessage().then((res) => {
        if (res.data.code == 0) {
          this.$set(this.useSealForm, "userName", res.data.data.userName);
          this.$set(this.useSealForm, "departName", res.data.data.deptName);
        }
      });
    },
    // 查看详情
    seeSelectPrintDetails(id) {
      selectPrintDetails(id).then((res) => {
        if (res.data.code == 0) {
          this.useSealForm = res.data.data;
          // this.$set()
          delete this.useSealForm.updateTime;
          delete this.useSealForm.createTime;
          this.meansFileList = res.data.data.materialFile
            ? JSON.parse(res.data.data.materialFile)
            : [];
          this.fileList = res.data.data.printBasis
            ? JSON.parse(res.data.data.printBasis)
            : [];
          this.tableData = res.data.data.materialList;
        }
        console.log(this.useSealForm,'this.useSealForm --- jiwguo')
      });
    },

    // 当前节点是否可以转发
    checkNodeDelegate(task) {
      console.log(task, "task - task");
      checkNodeDelegate({ taskId: task.taskId }).then((res) => {
        if (res.data.code == 0) {
          this.isForward = res.data.data.forwardBtn;
          this.agreeBtn = res.data.data.aggreBtn;
          this.unAgreeBtn = res.data.data.unAggereBtn;
          this.endBtn = res.data.data.endBtn;
          this.voteNode = res.data.data.voteNode;
        }
      });
    },
    // 限制输入数字
    inputNumFun(value){
      return value.replace(/\D/g,'')
    },

    headerRowStyle(obj) {
      let str = "";
      switch (obj.column.label) {
        case "资料名称":
          str = "require-cont";
          break;
        case "编号":
          str = "require-cont";
          break;
        case "份数":
          str = "require-cont";
          break;
        default:
          break;
      }
      return str;
    },

    closeBoxDone() {
      this.isshowBox = false;
      this.oneClick = true
    },
    pushTNav() {
      this.newKeepalive = true;
      this.successBox = false;
      this.$store.commit("pushTopNav", { path: "flowPath" });
      this.$store.commit("SET_REQUESTPARAMETERS", {});
    },
    flowChart() {
      this.$refs.flowChart.flowChartVisible = true;
    },
    getDictCont(commitType, item) {
      getDict(item).then((res) => {
        this.$store.commit(commitType, res.data.data);
      });
    },

    // 文件上传 - 分片进度
    onMeansProgress(num, file) {
      console.log("file文件上传 - 分片进度", file);
      let currentFile = this.meansFileList.find(
        (item) => item.uid === file.uid
      );
      if (currentFile != undefined) {
        currentFile.complete = num;
      } else {
        let object = {
          fileName: file.name,
          complete: num,
          uid: file.uid,
        };
        this.meansFileList.push(object);
      }
    },
    // 文件上传 - 成功
    onMeansSuccess(file) {
      let currentFile = this.meansFileList.find((item) => {
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
        this.meansFileList.push(object);
      }
    },
    onProgress(num, file) {
      console.log("file文件上传 - 分片进度", file);
      let currentFile = this.fileList.find((item) => item.uid === file.uid);
      if (currentFile != undefined) {
        currentFile.complete = num;
      } else {
        let object = {
          fileName: file.name,
          complete: num,
          uid: file.uid,
        };
        this.fileList.push(object);
      }
    },
    // 文件上传 - 成功
    onSuccess(file) {
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
    delMeansFile(item, index) {
      this.meansFileList.splice(index, 1);
    },
    downloadFile(file) {
      let url = file.url;
      if (!url) {
        this.$message.error("资源链接不存在");
        return;
      }
      handleDownLoadFile(url);
    },
  },
};
</script>

<style lang='scss' scoped>
.use-seal-model {
  color: #333333;
  padding: 30px 20px;
  font-size: 14px;
  padding-bottom: 30px;
  background-color: #fff;
  border-radius: 10px;
  p {
    margin: 0;
    padding: 0;
  }
  .use-seal-flow {
    display: flex;
    justify-content: space-between;
    .use-seal-flow-chart {
      color: #3471ff;
      font-size: 16px;
      cursor: pointer;
    }
  }

  .use-seal-content-table {
    margin-top: 20px;
    padding-top: 22px;
    border: 1px solid #EFF0F1;
    .table-header {
      text-align: center;
      line-height: 14px;
      .header {
        font-size: 18px;
        line-height: 18px;
        margin-bottom: 10px;
      }
    }
    .table-container {
      margin-top: 20px;
      border-top: 1px solid #EFF0F1;
      .item-title {
        height: 50px;
        line-height: 50px;
        text-align: center;
        background-color: #FBFBFC;
      }
      .item-seal {
        height: 50px;
      }
      .item-tall {
        height: 122px;
        line-height: 122px;
        text-align: center;
      }
    }
    .icon-required:before {
      content: "*";
      color: #f56c6c;
      margin-right: 4px;
    }
    .border-bottom {
      border-bottom: 1px solid #EFF0F1;
    }
    .border-right {
      border-right: 1px solid #EFF0F1;
    }
  }



   .ico-minus, .ico-plus {
     display: inline-block;
     width: 14px;
     height: 14px;
     background: url("../../assets/img/workbench/choose-ico.png") no-repeat center/cover
   }
   .ico-minus {
     background: url("../../assets/img/workbench/minus-ico.png") no-repeat center/cover
   }


}

 /*新版UI 新增的*/
@import "@/styles/workBenchCommon.scss";
</style>
