<!--
 * @Author: your name
 * @Date: 2021-12-05 15:22:18
 * @LastEditTime: 2022-06-22 18:52:09
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\workbench\contractModel.vue
-->
<template>
  <div class="contract-model">
    <div class="contract-flow">
      <div class="header-row">
        <div class="flow-img-box" @click="flowChart">
          <i class="flow-ico"></i>
          <span  >流程图</span>
        </div>
      <div v-if="newBuilt" class="submit_btn">
        <el-button @click="temporaryStorage" class="sbtn btn1"
          >暂存</el-button
        >
        <el-button type="primary" @click="submit" class="sbtn btn2"
          >提交</el-button
        >
      </div>
      <oaMenu
        v-if="!newBuilt"
        :requestParameters="requestParameters"
        OAmodel="contract"
        :contractForm="contractForm"
        :isSee="agreeOrDisagree && !isForward"
        :agreeBtn="agreeBtn && agreeOrDisagree"
        :endBtn="endBtn && agreeOrDisagree"
        :voteNode="voteNode"
        :unAgreeBtn="unAgreeBtn && agreeOrDisagree"
        :isForward="isForward && agreeOrDisagree"
      />
      </div>

    </div>
    <div class="contract-content-table" ref="box">
      <div class="table-header">
        <p class="header">{{ companyName }}</p>
        <p>{{ currentDate }}</p>
      </div>
      <div class="table-container">
        <el-form
          ref="contractForm"
          :model="contractForm"
          label-width="180px"
          :rules="contractRules"
        >
          <!-- 印章类型 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="24"
              :class="{ 'not-filled-in': notFilledFun('sealTypeId') }"
            >
              <el-form-item label="印章类型" prop="sealTypeId">
                <el-select
                  v-model="contractForm.sealTypeId"
                  placeholder="请选择印章类型"
                  :disabled="!newBuilt"
                  :class="[newBuilt ? 'newBuilt' : '']"
                >
                  <el-option
                    v-for="item in sealType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 签发 && 领导会签 -->
          <el-row class="item-ountersign border-bottom">
            <el-col :span="12" class="border-right item-tall">
              <el-form-item label="签发">
                <approvalResults
                  :results="contractForm.signIssueComments"
                  v-if="contractForm.signIssueComments"
                  :minHeight="120"
                />
                <el-input
                  v-else
                  v-model="contractForm.signIssueId"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" class="item-tall">
              <el-form-item label="领导会签">
                <approvalResults
                  v-if="contractForm.leadersComments"
                  :results="contractForm.leadersComments"
                  :minHeight="120"
                  type="department"
                />
                <el-input
                  v-else
                  v-model="contractForm.countersignatureLeadersId"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 法律审查、部门意见 -->
          <el-row class="item-ountersign border-bottom">
            <el-col :span="12" class="item-tall border-right">
              <el-form-item label="法律审查">
                <approvalResults
                  v-if="contractForm.legalReviewComments"
                  :results="contractForm.legalReviewComments"
                  :minHeight="120"
                />
                <el-input
                  v-else
                  v-model="contractForm.legalReviewId"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" class="item-tall">
              <el-form-item label="部门意见">
                <approvalResults
                  v-if="contractForm.departComments"
                  :results="contractForm.departComments"
                  :minHeight="120"
                />
                <el-input
                  v-else
                  v-model="contractForm.departmentOpinionId"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 合同约定 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="24"
              :class="{ 'not-filled-in': notFilledFun('partyA') }"
            >
              <el-form-item label="合同甲方" prop="partyA">
                <el-input
                  v-model="contractForm.partyA"
                  maxlength="50"
                  placeholder="请输入甲方名称"
                  :disabled="!newBuilt"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 合同对方 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="24"
              :class="{ 'not-filled-in': notFilledFun('partyB') }"
            >
              <el-form-item label="合同乙方" prop="partyB">
                <el-input
                  v-model="contractForm.partyB"
                  maxlength="50"
                  placeholder="请输入乙方名称"
                  :disabled="!newBuilt"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 合同丙方 -->
          <el-row class="item-seal border-bottom">
            <el-col :span="24" class="item-title">
              <el-form-item label="合同丙方">
                <el-input
                  v-model="contractForm.partyC"
                  maxlength="50"
                  :placeholder="newBuilt ? '请输入丙方名称' : ''"
                  :disabled="!newBuilt"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 附件 -->
          <el-row class="file-upload border-bottom">
            <el-col :span="24" class="item-title upload-box">
              <el-form-item label="附件" class="">
                <div class="upload-file">
                  <div class="file-list">
                    <div
                      class="file-item"
                      v-for="(item, index) in fileList"
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
                        @click="delFile(item, index)"
                      ></i>
                    </div>
                  </div>
                  <!-- 上传图片 -->
                  <span class="upload-span" v-if="newBuilt">
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
            </el-col>
          </el-row>

          <!-- 合同类型 && 合同总金额 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="12"
              class="border-right"
              :class="{'not-filled-in': notFilledFun('contractTypeId')}"
            >
              <el-form-item label=" 合同类型" prop="contractTypeId">
                <el-select
                  v-model="contractForm.contractTypeId"
                  placeholder="请选择合同类型"
                  :disabled="!newBuilt"
                  :class="[newBuilt ? 'newBuilt' : '']"
                >
                  <el-option
                    v-for="item in contracttype"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              :span="12"
              :class="{ 'not-filled-in': notFilledFun('contractAmount') }"
            >
              <el-form-item label="合同总金额（元）" prop="contractAmount">
                <template v-if="newBuilt" >
                  <el-input
                    maxlength="11"
                    v-model="contractForm.contractAmount"
                    :placeholder="placeHolderWords"
                    :disabled="!newBuilt"
                    :class="[isErrorVal ? 'is-error-value':'']"
                    @change="handleChangeAmount"
                    @input="handleIptAmount"
                  ></el-input>
                </template>
                <template v-else>
                  <el-input
                    maxlength="11"
                    v-model="Number(contractForm.contractAmount).toFixed(2)"
                    placeholder="请输入合同总金额"
                    :disabled="true"
                  ></el-input>
                </template>

                <!-- onkeyup="value=value.replace(/[^\d]/g,'')" -->
                <!-- type="number" oninput="if(value.length>11)value=value.slice(0,11)"  -->
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 拟稿单位 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="12"
              class="border-right"
              :class="{ 'not-filled-in': notFilledFun('draftingUnitName') }"
            >
              <el-form-item label="拟稿单位" prop="draftingUnitName">
                <el-input
                  v-model="contractForm.draftingUnitName"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="拟稿人">
                <el-input
                  v-model="contractForm.drafterName"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 标题 -->
          <el-row class="item-seal-textarea">
            <el-col
              :span="24"
              :class="{ 'not-filled-in': notFilledFun('title') }"
            >
              <el-form-item label="标题" prop="title">
<!--                type="textarea"-->
<!--                :autosize="{ minRows: 1 }"-->
                <el-input
                  v-model="contractForm.title"
                  maxlength="500"
                  placeholder="请输入标题内容"
                  :disabled="!newBuilt"
                ></el-input>
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
    <flowChart ref="flowChart" type="4" />
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
  getDict,
  contractSubmit,
  storageContract,
  contractDetails,
  checkNodeDelegate,
  contractRefuse,
  contractRefuseSub,
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
  name: "contract",
  data() {
    return {
      companyName: "北京两江科技有限公司合同会签稿纸", // 公司名称
      fileList: [],
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
      contractForm: {
        contractAmount: undefined, // 合同金额
        title: "", // 合同标题
        contractTypeId: "", // 合同类型ID
        countersignatureLeadersId: "", // 领导会签ID 对应类型 审批意见表ID
        countersignatureNo: "", // 会签号 年份+月份+三位数
        year: "",
        createBy: "", // 创建人姓名
        createId: "", // 创建人ID
        createTime: "", // 创建时间
        departmentOpinionId: "", // 部门意见ID 对应类型 审批意见表ID
        drafterId: "", // 拟稿人ID
        drafterName: "", // 拟稿人姓名
        draftingUnitName: "", // 拟稿单位名称
        enclosure: "", // 附件 json格式
        legalReviewId: "", // 法律审查ID
        partyA: "", // 合同甲方
        partyB: "", // 合同乙方
        partyC: "", // 合同丙方
        sealTypeId: "", // 印章类型
        signIssueId: "", // 签发ID
        signIssueComments: "", // 签发领导-通过的结果
        updateBy: "", // 更新人名称
        updateId: "", // 更新人ID
        updateTime: "", // 更新时间
      },
      contractRules: {
        sealTypeId: [
          { required: true, message: "印章类型", trigger: "change" },
        ],
        partyA: [{ required: true, message: "甲方名称", trigger: "change" }],
        partyB: [{ required: true, message: "乙方名称", trigger: "change" }],
        contractAmount: [
          { required: true, message: "合同总金额", trigger: "change" },
        ],
        contractTypeId: [
          { required: true, message: "合同类型", trigger: "change" },
        ],
        title: [{ required: true, message: "标题", trigger: "change" }],
      },
      isErrorVal: false,
      placeHolderWords: "请输入合同总金额"
    };
  },
  computed: {
    ...mapState({
      sealType: (state) => state.workbench.sealType,
      contracttype: (state) => state.workbench.contracttype,
      requestParameters: (state) => state.workbench.requestParameters,
      depGroupList: (state) => state.app.depGroupList,
      userId: (state) => state.user.userId,
    }),

    currentDate() {
      let year = this.contractForm.year;
      let num;
      if (this.contractForm.countersignatureNo) {
        num = this.contractForm.countersignatureNo.substring(4);
      }
      return `{${year}}年【${num ? num : ""}】号`;
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
  },
  mounted() {
    if (this.sealType.length == 0) {
      this.getDictCont("SET_SEALTYPE", "contract_seal_type");
    }
    if (this.contracttype.length == 0) {
      this.getDictCont("SET_CONTRACT_TYPE", "contract_type");
    }
    if (!this.newBuilt && this.requestParameters.status != 1) {
      this.checkNodeDelegate(this.requestParameters);
    }
    this.seeContractDetails(
      this.requestParameters.id ? this.requestParameters.id : ""
    );
  },

  methods: {
    successDone() {
      if (this.titVal == '暂存' && this.oneClick) {
        this.oneClick = false
        this.contractForm.enclosure = JSON.stringify(this.fileList);
        this.contractForm["id"] = this.requestParameters.businessId;
        storageContract(this.contractForm)
          .then((res) => {
            if (res.data.code == 0) {
              // this.successBox = true;
              this.isshowBox = false;
              this.$store.commit("SET_REQUESTPARAMETERS", {});
              this.$store.commit("pushTopNav", { path: "flowPath" });
              this.$router.push({path:'flowPath',})
            }
            this.oneClick = true
            this.isshowBox = false;
          })
          .catch((err) => {
            this.closeBoxDone()
            console.log(err, "错误");
          });
      } else if(this.titVal == '提交' && this.oneClick) {
        this.oneClick = false
        this.contractForm.enclosure = JSON.stringify(this.fileList);
        this.contractForm["id"] = this.requestParameters.businessId;
        this.contractForm["workflowId"] = this.requestParameters.id;
        if (
          this.requestParameters.status == "3" ||
          this.requestParameters.withdrawFlag === "1"
        ) {
          this.contractForm["workflowId"] = this.requestParameters.id;
          contractRefuseSub(this.contractForm)
            .then((res) => {
              if (res.data.code == 0) {
                // this.successBox = true;
                this.isshowBox = false;
                this.$store.commit("SET_REQUESTPARAMETERS", {});
                this.$store.commit("pushTopNav", { path: "flowPath" });
                this.$router.push({path:'flowPath',})
              }
              this.oneClick = true

            })
            .catch((err) => {
              this.closeBoxDone()
              console.log(err, "错误");
            });
        } else {
          contractSubmit(this.contractForm)
            .then((res) => {
              if (res.data.code == 0) {
                // this.successBox = true;
                this.$store.commit("SET_REQUESTPARAMETERS", {});
                this.$store.commit("pushTopNav", { path: "flowPath" });
                this.$router.push({path:'flowPath',})
              }
              this.oneClick = true;
            })
            .catch((err) => {
              this.oneClick = true;
              console.log(err, "错误");
            });
        }
      }
    },
    // 提交
    submit() {
      let incomplete = this.fileList.findIndex((item) => {
        return item.complete != 100;
      });
      if (incomplete != -1) {
        this.$message({ type: "error", message: "文件未上传成功,请稍后再试" });
      }
      this.$refs["contractForm"].validate((valid, object) => {
        if (!valid) {
          this.notFilled = Object.keys(object);
          this.$message({ type: "error", message: "请填写必填项" });
        } else {
          let val = Number(this.contractForm.contractAmount);

          if (val * 1 > 10000000000) {
            this.$message.error("合同金额最大为100亿");
            return;
          }
          this.titVal = "提交";
          this.isshowBox = true;
        }
      });
    },

    // 暂存
    temporaryStorage() {
      let val = Number(this.contractForm.contractAmount);

      let incomplete = this.fileList.findIndex((item) => {
        return item.complete != 100;
      });
      if (incomplete != -1) {
        this.$message({ type: "error", message: "文件未上传成功,请稍后再试" });
        return
      }
      if (val * 1 > 10000000000) {
        this.$message.error("合同金额最大为100亿");
        return;
      }else{
        this.$refs["contractForm"].validate((valid, object) => {
          if (!valid) {
            this.notFilled = Object.keys(object);
            this.$message({ type: "error", message: "请填写必填项" });
          } else {
            let val = Number(this.contractForm.contractAmount);

            if (val * 1 > 10000000000) {
              this.$message.error("合同金额最大为100亿");
              return;
            }
            this.titVal = "暂存";
            this.isshowBox = true;
          }
        });
      }
      
    },
    // 查看详情
    seeContractDetails(id) {
      contractDetails({ id: id }).then((res) => {
        if (res.data.code == 0) {
          this.contractForm["drafterName"] =
            id == "" ? res.data.data.drafterName : "";
          this.contractForm["draftingUnitName"] =
            id == "" ? res.data.data.draftingUnitName : "";
          this.contractForm.year = id == "" ? res.data.data.year : "";
        }
        this.contractForm = res.data.data;

        this.fileList = res.data.data.enclosure
          ? JSON.parse(res.data.data.enclosure)
          : [];
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
    closeBoxDone() {
      this.isshowBox = false;
      this.oneClick = true
    },

    pushTNav() {
      this.newKeepalive = true;
      this.successBox = false
      this.$store.commit("pushTopNav", { path: "flowPath" });
      this.$store.commit("SET_REQUESTPARAMETERS", {});
    },

    // 驳回合同
    contractRefuse(params) {
      contractRefuse(params).then((res) => {
        console.log(res, "驳回合同");
      });
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
    onProgress(num, file) {
      console.log('file文件上传 - 分片进度',file)
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
    downloadFile(file) {
      let url = file.url;
      if (!url) {
        this.$message.error("资源链接不存在");
        return;
      }
      handleDownLoadFile(url);
    },

    // 判断金额是否输入正确 精确到2个小数点
    handleChangeAmount() {
      let iptValue = this.contractForm.contractAmount
      const machRegExp = new RegExp(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/);
      this.isErrorVal = !machRegExp.test(iptValue)
      console.log(this.isErrorVal);
      if(this.isErrorVal) { // 格式不正确
        iptValue = ""
        this.placeHolderWords = "金额格式不正确 请重新输入"
      } else {
        this.placeHolderWords = "请输入合同总金额";
      }
      this.contractForm.contractAmount = iptValue + ""
    },
    handleIptAmount() {
      console.log(this.contractForm.contractAmount);
      console.log(typeof this.contractForm.contractAmount);
      if(!this.contractForm.contractAmount) {
        this.isErrorVal= false;
        this.placeHolderWords = "请输入合同总金额";
      }
    },
  },
};
</script>

<style lang='scss' scoped>
.contract-model {
  color: #333333;
  padding: 30px 20px;
  font-size: 14px;
  padding-bottom: 30px;
  p {
    margin: 0;
    padding: 0;
  }
  .contract-flow {
    display: flex;
    justify-content: space-between;
    .contract-flow-chart {
      color: #3471ff;
      font-size: 16px;
      cursor: pointer;
    }
  }

  .contract-content-table {
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
    .border-top {
      border-top: 1px solid #EFF0F1;
    }
    .border-bottom {
      border-bottom: 1px solid #EFF0F1;
    }
    .border-right {
      border-right: 1px solid #EFF0F1;
    }
    .border-left {
      border-left: 1px solid #EFF0F1;
    }
  }
}
 /*新版UI 新增的*/
@import "@/styles/workBenchCommon.scss";
</style>
