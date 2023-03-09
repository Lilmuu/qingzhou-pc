<!--
 * @Author: your name
 * @Date: 2021-12-06 18:57:34
 * @LastEditTime: 2022-06-22 18:49:00
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\workbench\dispatchModel.vue
-->
<template>
  <div class="dispath-model">
    <div class="dispath-flow">
      <!-- <div class="dispath-flow-chart">
        <i class="el-icon-caret-right"></i>
        <span @click="flowChart" oaMenu="dispatch">流程图</span>
      </div> -->
      <div class="header-row">
        <div class="flow-img-box" @click="flowChart">
          <i class="flow-ico"></i>
          <span  >流程图</span>
        </div>
      <div class="submit_btn" v-if="newBuilt">
        <el-button @click="temporaryStorage" class="sbtn btn1">暂存</el-button>
        <el-button type="primary" @click="submit()" class="sbtn btn2">提交</el-button>
      </div>
      <oaMenu
        v-if="!newBuilt"
        :requestParameters="requestParameters"
        OAmodel="dispatch"
        :isSee="agreeOrDisagree && !isForward"
        :endBtn="endBtn && agreeOrDisagree"
        :voteNode="voteNode"
        :agreeBtn="agreeBtn && agreeOrDisagree"
        :unAgreeBtn="unAgreeBtn && agreeOrDisagree"
        :isForward="isForward && agreeOrDisagree"
        :paramsVal='dispathForm'
        :wenShuFlag="wenShuFlag"
      />
      </div>

    </div>
    <div class="dispath-content-table" id="box">
      <div class="table-header">
        <p class="header">{{ companyName }}</p>
        <p>{{ currentDate }}</p>
      </div>
      <div class="table-container">
        <el-form
          ref="dispathForm"
          :model="dispathForm"
          label-width="180px"
          :rules="dispathRules"
        >
          <!-- 是否为制度发文 && 密级 -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="12"
              class="border-right"
              :class="{ 'not-filled-in': notFilledFun('systemArticle') }"
            >
              <el-form-item label="是否为制度发文" prop="systemArticle">
                <el-select
                  v-model="dispathForm.systemArticle"
                  placeholder="请选择是否为制度发文"
                  :disabled="!newBuilt"
                  :class="[newBuilt ? 'newBuilt' : '']"
                >
                  <el-option
                    v-for="(item, index) in systemArticleOptions"
                    :key="index + item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              :span="12"
              :class="{ 'not-filled-in': notFilledFun('secretLevel') }"
            >
              <el-form-item label="密级" prop="secretLevel">
                <el-select
                  v-model="dispathForm.secretLevel"
                  placeholder="请选择密级"
                  :disabled="!newBuilt"
                  :class="[newBuilt ? 'newBuilt' : '']"
                >
                  <el-option
                    v-for="(item, index) in secretLevel"
                    :key="index + item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 发文类型 && 缓急 item-ountersign  -->
          <el-row class="item-seal border-bottom">
            <el-col
              :span="12"
              class="border-right"
              :class="{ 'not-filled-in': notFilledFun('articleType') }"
            >
              <el-form-item label="发文类型" prop="articleType">
                <el-select
                  v-model="dispathForm.articleType"
                  placeholder="请选择发文类型"
                  :disabled="!newBuilt"
                  :class="[newBuilt ? 'newBuilt' : '']"
                >
                  <el-option
                    v-for="(item, index) in articleType"
                    :key="index + item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              :span="12"
              :class="{ 'not-filled-in': notFilledFun('urgent') }"
            >
              <el-form-item label="缓急" prop="urgent">
                <el-select
                  v-model="dispathForm.urgent"
                  placeholder="请选择缓急状态"
                  :disabled="!newBuilt"
                  :class="[newBuilt ? 'newBuilt' : '']"
                >
                  <el-option
                    v-for="(item, index) in articleUrgent"
                    :key="index + item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 领导意见 -->
          <el-row class="item-seal border-bottom">
            <el-col :span="24">
              <el-form-item label="领导意见">
                <approvalResults
                  :results="dispathForm.leaderOpinions"
                  v-if="dispathForm.leaderOpinions"
                  :minHeight="50"
                />
                <el-input
                  v-else
                  v-model="dispathForm.leaderOpinions"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 综合部负责人审批 && 综合部核稿 -->
          <el-row class="item-seal border-bottom">
            <el-col :span="12" class="border-right">
              <el-form-item label="综合部负责人审批">
                <approvalResults
                  v-if="dispathForm.complexDepartOpinions"
                  :results="dispathForm.complexDepartOpinions"
                  :minHeight="50"
                />
                <el-input
                  v-else
                  v-model="dispathForm.complexDepartOpinions"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="综合部核稿">
                <approvalResults
                  v-if="dispathForm.complexDepartCheckDraft"
                  :results="dispathForm.complexDepartCheckDraft"
                  :minHeight="50"
                />
                <el-input
                  v-else
                  v-model="dispathForm.complexDepartCheckDraft"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 部门会签 && 主办单位负责人审核 -->
          <el-row class="item-seal border-bottom">
            <el-col :span="12" class="border-right">
              <el-form-item label="部门会签">
                <approvalResults
                  v-if="dispathForm.departOpinions"
                  :results="dispathForm.departOpinions"
                  :minHeight="50"
                  type="department"
                />
                <el-input
                  v-else
                  v-model="dispathForm.departOpinions"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="主办单位负责人审核">
                <approvalResults
                  v-if="dispathForm.hostingDepartOpinions"
                  :results="dispathForm.hostingDepartOpinions"
                  :minHeight="50"
                />
                <el-input
                  v-else
                  v-model="dispathForm.hostingDepartOpinions"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 主办部门 && 拟稿人 -->
          <el-row class="item-seal border-bottom">
            <el-col :span="12" class="border-right">
              <el-form-item label="主办部门">
                <el-input
                  v-model="dispathForm.hostingDepartName"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="拟稿人">
                <el-input
                  v-model="dispathForm.draftManName"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 标题 -->
          <el-row class="border-bottom">
            <el-col
              :span="24"
              class="item-cont-textarea"
              :class="{ 'not-filled-in': notFilledFun('title') }"
            >
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="dispathForm.title"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  maxlength="100"
                  placeholder="请输入标题"
                  :disabled="!newBuilt"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 正文 -->
          <el-row class="item-seal-textarea border-bottom">
            <el-col
              :span="24"
              class="item-title item-seal-textarea"
              :class="{ 'not-filled-in': notFilledFun('articleText') }"
            >
              <el-form-item label="正文" prop="articleText">
                <div
                  v-html="dispathForm.articleText"
                  @click="opneRichTextBox()"
                  class="rich-text"
                ></div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 主送单位 -->
          <el-row class="border-bottom">
            <el-col
              :span="24"
              class="item-cont-textarea"
              :class="{ 'not-filled-in': notFilledFun('mainDeliveryUnit') }"
            >
              <el-form-item label="主送单位" prop="mainDeliveryUnit">
                <el-input
                  v-model="dispathForm.mainDeliveryUnit"
                  type="textarea"
                  :autosize="{ minRows: 1 }"
                  maxlength="100"
                  placeholder="请输入主送单位"
                  :disabled="!newBuilt"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 抄送单位 -->
          <el-row class="border-bottom">
            <el-col
              :span="24"
              class="item-cont-textarea"
              :class="{ 'not-filled-in': notFilledFun('copyUnit') }"
            >
              <el-form-item label="抄送单位" prop="copyUnit">
                <el-input
                  v-model="dispathForm.copyUnit"
                  maxlength="100"
                  type="textarea"
                  :autosize="{ minRows: 1 }"
                  placeholder="请输入抄送单位"
                  :disabled="!newBuilt"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 内部发送 -->
          <el-row class="border-bottom">
            <el-col
              :span="24"
              class="item-cont-textarea"
              :class="{ 'not-filled-in': notFilledFun('internallySent') }"
            >
              <el-form-item label="内部发送" prop="internallySent">
                <el-input
                  v-model="dispathForm.internallySent"
                  maxlength="100"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  placeholder="请输入内部发送人"
                  :disabled="!newBuilt"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 附件 -->
          <el-row class="border-bottom file-upload">
            <el-col :span="24" class="item-title upload-box">
              <el-form-item label="附件">
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

          <!-- 打印份数 && 核对 && 校核 -->
          <el-row class="item-seal">
            <el-col :span="8" class="item-title border-right fenshu">
              <el-form-item label="打印份数">
                <el-input
                  v-model.number="dispathForm.printNumber"
                  onkeyup="value=value.replace(/[^\d]/g,'')"
                  placeholder="请输入打印份数"
                  :disabled="!newBuilt"
                ></el-input>
                <span style="color:#404758">份</span>
              </el-form-item>
            </el-col>
            <el-col :span="8" class="item-title border-right">
              <el-form-item label="核对">
                <el-input
                  v-model="dispathForm.verifierName"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8" class="item-title">
              <el-form-item label="校核">
                <el-input
                  v-model="dispathForm.proofreaderName"
                  disabled
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
    <flowChart ref="flowChart" type="5" />

    <frameBox
      :tit="titVal"
      :isshowBox="isshowBox"
      :successBox="successBox"
      :oneClick="oneClick"
      @success-done="successDone"
      @close-box-done="closeBoxDone"
      @close-box="pushTNav"
    ></frameBox>

    <richTextBox
      v-if="showRichText"
      :content="dispathForm.articleText"
      @close-box="richTextBoxClose"
      @set-text="setTextValue"
    ></richTextBox>
  </div>
</template>

<script>
import oaMenu from "@/components/oaMenu";
import flowChart from "@/components/flowChart";
import approvalResults from "@/components/approvalResults";
import frameBox from "@/components/workbenchModel/frameBox.vue";
import richTextBox from "@/components/richTextBox";
import {
  getDict,
  articleSubmit,
  storageArticle,
  articleDetails,
  checkNodeDelegate,
  articleMessage,
  articleStorageSubmit,
  articleRefuseSubmit,
} from "@/api/workSpace";

import { handleDownLoadFile } from "@/utils/download";

import { mapState, mapGetters } from "vuex";
import workbenchUploadFile from "@/components/UploadFile/workbenchUploadFile.vue";
import { getFileSuffix } from "@/utils/index";

export default {
  components: {
    oaMenu,
    flowChart,
    workbenchUploadFile,
    approvalResults,
    frameBox,
    richTextBox,
  },
  name: "dispatch",
  data() {
    return {
      companyName: "北京两江科技有限公司发文稿纸", // 公司名称
      fileList: [],
      oneClick: true, // 误触
      storageClick: true, // 暂存误触
      isForward: false, // 可否转发
      agreeBtn: false,
      endBtn: false,
      unAgreeBtn: false,
      wenShuFlag: 2, //是否为文书节点 1是 2不是
      voteNode: 1,
      notFilled: [], // 未填写字段
      titVal: "提交",
      isshowBox: false,
      successBox: false,
      newKeepalive: false, // 是否点击提交或暂存
      showRichText: false, // 富文本框-弹框
      dispathForm: {
        systemArticle: "", // 是否为制度发文 1 是 0 否
        articleType: "", // 发文类别 低代码 配置类型
        secretLevel: "", // 密级 (1评件、2机密、3秘密)
        urgent: "",
        year: "",
        title: "",
        articleText: "",
        mainDeliveryUnit: "",
        copyUnit: "",
        internallySent: "",
        articleFile: "",
        printNumber: undefined,
        verifierId: "",
        verifierName: "",
        proofreaderId: "",
        proofreaderName: "",
      },

      dispathRules: {
        systemArticle: [
          { required: true, message: "是否为制度发文", trigger: "change" },
        ],
        secretLevel: [{ required: true, message: "密级", trigger: "change" }],
        articleType: [
          { required: true, message: "发文类型", trigger: "change" },
        ],
        urgent: [{ required: true, message: "缓急", trigger: "change" }],
        title: [{ required: true, message: "标题", trigger: "change" }],
        articleText: [{ required: true, message: "正文", trigger: "change" }],
        mainDeliveryUnit: [
          { required: true, message: "主送单位", trigger: "change" },
        ],
        copyUnit: [{ required: true, message: "抄送单位", trigger: "change" }],
        internallySent: [
          { required: true, message: "内部发送", trigger: "change" },
        ],
      },
      // 密级
      secretLevelOptions: [
        { value: "1", label: "平件" },
        { value: "2", label: "机密" },
        { value: "3", label: "秘密" },
      ],
      // 缓急
      urgentOptions: [
        { value: "1", label: "普通" },
        { value: "2", label: "急件" },
        { value: "3", label: "特急" },
      ],
      systemArticleOptions: [
        { value: "1", label: "是" },
        { value: "0", label: "否" },
      ],
      multipartFiles: [],
    };
  },
  computed: {
    ...mapState({
      articleType: (state) => state.workbench.articleType,
      secretLevel: (state) => state.workbench.secretLevel,
      articleUrgent: (state) => state.workbench.articleUrgent,

      requestParameters: (state) => state.workbench.requestParameters,
      userId: (state) => state.user.userId,
    }),
    // ...mapGetters(['addOrEdit']),

    currentDate() {
      let year = this.dispathForm.articleNumber
        ? this.dispathForm.articleNumber.substring(0, 4)
        : this.dispathForm.year;
      let num = this.dispathForm.articleNumber
        ? this.dispathForm.articleNumber.substring(4)
        : "";
      return `{${year}}年【${num ? num : " "}】号`;
    },
    // 新建
    addDispatch() {
      return JSON.stringify(this.requestParameters) == "{}";
    },
    // 新建 or 审批
    newBuilt() {
      let tit = this.requestParameters.tit == "编辑";
      return this.addDispatch || tit;
    },
    flowChartBox() {
      let tit =
        this.requestParameters.status == 1 &&
        (this.requestParameters.tit == "编辑" ||
          this.requestParameters.status == 2 ||
          this.requestParameters.tit == "查看");
      return this.addDispatch || tit;
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
    if (this.articleType.length == 0) {
      this.getDictCont("SET_ARTICLETYPE", "article_type");
    }

    // 发文缓急
    if (this.articleUrgent.length == 0) {
      this.getDictCont("SET_FILOWABLE_ARTICLE_URGENT", "flowable_article_urgent");
    }
    // 发文密级
    if (this.secretLevel.length == 0) {
      this.getDictCont("SET_FILOWABLE_ARTICLE_SECRET_LEVEL", "flowable_article_secret_level");
    }



    if (!this.newBuilt && this.requestParameters.status != 1) {
      this.checkNodeDelegate(this.requestParameters);
    }
    if (!this.addDispatch) {
      this.seeArticleDetails(
        this.requestParameters.businessId
          ? this.requestParameters.businessId
          : ""
      );
    }

    if (JSON.stringify(this.requestParameters) == "{}") {
      this.articleMessage();
    }
  },
  methods: {
    successDone() {
      debugger
      if (this.titVal == "暂存" && this.oneClick) {
        this.oneClick = false;
        this.dispathForm.articleFile = JSON.stringify(this.fileList);
        storageArticle(this.dispathForm)
          .then((res) => {
            if (res.data.code == 0) {
              this.pushTNav();
            }
            this.oneClick = true;
          })
          .catch((err) => {
            this.oneClick = true;
            console.log(err, "错误");
          });
      } else if (this.titVal == "提交" && this.oneClick) {
        this.oneClick = false;
        this.dispathForm.articleFile = JSON.stringify(this.fileList);
        if (
          this.requestParameters.status == "3" ||
          this.requestParameters.withdrawFlag === "1"
        ) {
          this.articleRefuseSub();
        } else if (this.requestParameters.status == "1") {
          this.articleStorageSub();
        } else {
          this.articleSub();
        }
      }
    },
    submit() {
      let incomplete = this.fileList.findIndex((item) => {
        return item.complete != 100;
      });
      if (incomplete != -1) {
        this.$message({ type: "error", message: "文件未上传成功,请稍后再试" });
        return
      }
      this.$refs["dispathForm"].validate((valid, object) => {
        console.log("是否校验成功", valid);
        console.log("失败的字段", object);
        if (!valid) {
          this.notFilled = Object.keys(object);
          this.$message({ type: "error", message: "请填写必填项" });
        } else {
          this.titVal = "提交";
          this.isshowBox = true;
        }
      });
    },
    flowChart() {
      this.$refs.flowChart.flowChartVisible = true;
    },

    // 新建提交
    articleSub() {
      articleSubmit(this.dispathForm)
        .then((res) => {
          if (res.data.code == 0) {
            this.pushTNav();
          }
          this.oneClick = true;
          this.isshowBox = false;
        })
        .catch((err) => {
          this.oneClick = true;
          this.isshowBox = false;
          console.log(err, "错误");
        });
    },

    // 暂存之后提交发文
    articleStorageSub() {
      this.dispathForm.workflowId = this.requestParameters.id;
      articleStorageSubmit(this.dispathForm)
        .then((res) => {
          console.log("res - res", res);
          if (res.data.code == 0) {
            this.pushTNav();
          }
          this.oneClick = true;
          this.isshowBox = false;
        })
        .catch((err) => {
          this.oneClick = true;
          this.isshowBox = false;
          console.log(err, "错误");
        });
    },

    // 被驳回提交
    articleRefuseSub() {
      this.dispathForm.workflowId = this.requestParameters.id;
      articleRefuseSubmit(this.dispathForm)
        .then((res) => {
          console.log("res - res", res);
          if (res.data.code == 0) {
            this.pushTNav();
          }
          this.oneClick = true;
          this.isshowBox = false;
        })
        .catch((err) => {
          this.oneClick = true;
          this.isshowBox = false;
          console.log(err, "错误");
        });
    },
    // 暂存
    temporaryStorage() {

      let incomplete = this.fileList.findIndex((item) => {
        return item.complete != 100;
      });
      if (incomplete != -1) {
        this.$message({ type: "error", message: "文件未上传成功,请稍后再试" });
        return
      }
      this.$refs["dispathForm"].validate((valid, object) => {
        console.log("是否校验成功", valid);
        console.log("失败的字段", object);
        if (!valid) {
          this.notFilled = Object.keys(object);
          this.$message({ type: "error", message: "请填写必填项" });
        } else {
          this.titVal = "暂存";
          this.isshowBox = true;
        }
      });


      
    },

    // 查看详情
    seeArticleDetails(id) {
      console.log(id, "id - id");
      articleDetails(id).then((res) => {
        if (res.data.code == 0) {
          this.dispathForm = res.data.data;
          console.log(
            this.dispathForm.articleFile,
            "this.dispathForm.articleFile"
          );
          this.fileList = JSON.parse(res.data.data.articleFile);
          console.log(this.fileList, "查看详情 this.fileList");
        }
        console.log(res, "查看详情");
      });
    },

    // 跳转我的流程
    pushTNav() {
      this.newKeepalive = true;
      this.$store.commit("pushTopNav", { path: "flowPath" });
      this.$store.commit("SET_REQUESTPARAMETERS", {});
    },

    //
    articleMessage() {
      articleMessage().then((res) => {
        if (res.data.code == 0) {
          let year = res.data.timestamp.substring(0, 4);
          this.$set(
            this.dispathForm,
            "hostingDepartName",
            res.data.data.deptName
          );
          this.$set(this.dispathForm, "draftManName", res.data.data.userName);
          this.$set(this.dispathForm, "year", year);
        }
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
          this.wenShuFlag = res.data.data.wenShuFlag
        }
      });
    },

    closeBoxDone() {
      this.isshowBox = false;
      this.oneClick = true
    },
    opneRichTextBox() {
      if(this.newBuilt || this.wenShuFlag == 1){
        this.showRichText = true;
      }

      // setTimeout(() => {
      //   this.editorInit()
      // }, 1000);
    },
    setTextValue(val){
      console.log("发文 - 正文内容", val);
      this.dispathForm.articleText = val;
      this.richTextBoxClose()
    },
    richTextBoxClose() {
      this.showRichText = false;
    },
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
    onSuccess(file) {
      console.log(file,'filev--- filev')
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
      console.log(this.fileList,'this.fileList - this.fileList')
    },
    onError() {
      console.log("失败 - onError");
    },
    delFile(item, index) {
      this.fileList.splice(index, 1);
    },
    downloadFile(file) {
      console.log(file, "file- 下载的");
      let url = file.url;
      if (!url) {
        this.$message.error("资源链接不存在");
        return;
      }

      handleDownLoadFile(url);
    },
    getDictCont(commitType, item) {
      getDict(item).then((res) => {
        console.log("获取字典项", res);
        this.$store.commit(commitType, res.data.data);
      });
    },
  },

  // beforeRouteEnter(to, from, next) {
  //   let addOrEdit = from.matched[0].instances.default.$store.getters.addOrEdit;
  //   console.log(addOrEdit, "addOrEdit - addOrEdit");
  //   console.log(to, "to - to");
  //   console.log(from, "from - from");
  //   if (addOrEdit) {
  //     to.meta.keepAlive = true;
  //   } else {
  //     to.meta.keepAlive = false;
  //   }
  //   next();
  // },

  // beforeRouteLeave(to, from, next) {
  //   console.log(to, "to - to");
  //   console.log(from, "from - from");
  //   console.log(this.$router, "$router - $router");
  //   if (this.newKeepalive) {
  //     from.meta.keepAlive = false;
  //     this.$destroy();
  //   }
  //   next();
  // },
};
</script>

<style lang='scss' scoped>
.dispath-model {
  color: #333333;
  padding: 30px 20px;
  font-size: 14px;
  padding-bottom: 30px;
  p {
    margin: 0;
    padding: 0;
  }
  .dispath-flow {
    display: flex;
    justify-content: space-between;
    .dispath-flow-chart {
      color: #3471ff;
      font-size: 16px;
      cursor: pointer;
    }
  }

  .dispath-content-table {
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
      .item-seal-textarea {
        min-height: 120px;
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
