<!-- 目标管理 -->
<template>
  <div class="target-container">
    <TabLabelSlot
      init-active-name="mbgl"
      :option="titleOption"
      :isActiveClass="true"
      :headImg="headImg"
    ></TabLabelSlot>
    <div class="target-main">
      <div class="target-btn">
        <el-button
          class="add_target"
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAddTarget"
          >新增目标</el-button
        >
        <!-- <el-button size="small" @click="handleTargetView">目标视图</el-button>
        <el-button size="small" @click="sequence = !sequence">调整顺序</el-button>
        <el-button size="small" @click="handleDelete">删除</el-button>
        <el-button size="small" @click="handleExportTarget">导出目标</el-button>
        <uploadFIleTarget 
          style="display: inline-block; margin: 0 10px;" 
          uploadText='导入目标'
          accept='.xlsx, .xls'
          :initFileList='[]'
          :showFileLists='false'
          errorText='请上传.xlsx, .xls两种格式的文件'
          format='xlsx,xls'
          @successChange='getListFun'>
        </uploadFIleTarget>
        <el-button size="small" @click="handleImportTask">导入任务</el-button>
        <el-button size="small" @click="handleDownload(0)">目标模板</el-button>
        <el-button size="small" @click="handleDownload(1)">任务模板</el-button> -->
        <div class="operation_menu">
          <span @click="handleTargetView" title="视图">
            <img src="@/assets/img/mytodo/tool_view.png" alt="视图" key=""/>
          </span>
          <div class="interval_line"></div>
          <span @click="sequence = !sequence" title="排序">
            <img src="@/assets/img/mytodo/tool_sort.png" alt="排序" />
          </span>
          <div class="interval_line"></div>
          <span @click="handleDeleteDialog" title="删除">
            <img src="@/assets/img/mytodo/tool_delete.png" alt="删除" />
          </span>
          <div class="interval_line"></div>
          <span @click="handleExportTargetDialog" title="导出目标">
            <img src="@/assets/img/mytodo/tool_export.png" alt="导出" />
          </span>
          <div class="interval_line"></div>
          <!-- <span @click="showSecondMenu = !showSecondMenu" title="导入">
            <img src="@/assets/img/mytodo/tool_import.png" alt="导入" />
          </span> -->
          <el-popover
            placement="bottom"
            width="120"
            popper-class="target_popper"
            trigger="click">
            <div class="target_second_menu">
              <uploadFIleTarget
                :isSlotButton="true"
                accept=".xlsx, .xls"
                :initFileList="[]"
                :showFileLists="false"
                errorText="请上传.xlsx, .xls两种格式的文件"
                format="xlsx,xls"
                @successChange="getListFun"
              >
                <template slot="uploadButton">
                  <div class="menu_item">
                    <img src="@/assets/img/mytodo/tool_import.png" alt="导入目标" />
                    <span>导入目标</span>
                  </div>
                </template>
              </uploadFIleTarget>
              <div @click="handleImportTask" class="menu_item">
                <img src="@/assets/img/mytodo/tool_import.png" alt="导入目标" />
                <span>导入任务</span>
              </div>
            </div>
            <span slot="reference">
                <img src="@/assets/img/mytodo/tool_import.png" alt="导入" />
            </span>
          </el-popover>
          <div class="interval_line"></div>
          <span @click="handleDownload(0)" title="导出模板"
            ><img src="@/assets/img/mytodo/tool_grid.png" alt="模板"
          /></span>
        </div>

        <!-- <div v-show="showSecondMenu" class="target_second_menu">
          <uploadFIleTarget
            :isSlotButton="true"
            accept=".xlsx, .xls"
            :initFileList="[]"
            :showFileLists="false"
            errorText="请上传.xlsx, .xls两种格式的文件"
            format="xlsx,xls"
            @successChange="getListFun"
          >
            <template slot="uploadButton">
              <div class="menu_item">
                <img src="@/assets/img/mytodo/tool_import.png" alt="导入目标" />
                <span>导入目标</span>
              </div>
            </template>
          </uploadFIleTarget>
          <div @click="handleImportTask" class="menu_item">
            <img src="@/assets/img/mytodo/tool_import.png" alt="导入目标" />
            <span>导入任务</span>
          </div>
        </div> -->


        
      </div>
      <el-table border :data="tbody" v-loading="tableLoading" :stripe="false">
        <!-- 多选框 -->
        <el-table-column width="50">
          <template slot-scope="scope">
            <el-checkbox
              v-model="scope.row.checked"
              @change="handleChecked"
            ></el-checkbox>
          </template>
        </el-table-column>
        <template v-for="(item, index) in thead">
          <el-table-column :label="item.label" :key="index">
            <template slot-scope="scope">
              <!-- 操作 -->
              <div v-if="item.prop == 'operation'">
                <div class="row-box" v-for="(cz, czIndex) in scope.row.quarter" :key="czIndex">
                  <el-button type="text" size="small" class="btn_decompose" @click="handleRowClick(item, index, cz, czIndex, scope.row)" >分解任务</el-button>
                </div>
              </div>
              <!-- 其他 -->
              <div v-else>
                <div class="custom-col" v-if="valiDataType(scope.row[item.prop]) != 'object'">
                  <span v-if="item.prop == 'annualTarget'" class="edit-text" @click="handleItemEdit(scope.row)" >{{ scope.row[item.prop] }}</span>
                  <span v-else>{{ scope.row[item.prop] }}</span>
                  <div class="sequence" v-if="index == 1 && sequence">
                    <el-button size="mini" :disabled="scope.$index == 0" class="el-icon-caret-top" @click="handleAdjustTop(scope.row, scope.$index)"></el-button>
                    <el-button size="mini" :disabled="scope.$index + 1 == tbody.length" class="el-icon-caret-bottom" @click="handleAdjustBottom(scope.row, scope.$index)"></el-button>
                  </div>
                </div>
                <div v-else>
                  <div class="row-box" v-for="(jd, jdIndex) in scope.row[item.prop]" :key="jdIndex">
                    <div class="line-overflow-text" v-if="jd.length <= 12">{{ jd }}</div>
                    <el-tooltip class="item" effect="dark" v-else :content="jd + ''" placement="top">
                      <el-button class="overflow-text" type="text" size="small" >{{ jd }}</el-button>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <!-- 弹窗组件 - 目标视图 -->
    <targetView ref="targetForm"></targetView>
    <!-- 导入任务 -->
    <importTarget ref="importForm" />
    <!-- 弹窗组件 - 新增目标 -->
    <addTarget ref="addForm" @cbChange="getListFun"></addTarget>
    <!-- 弹窗组件 - 分解任务 -->
    <el-dialog
      append-to-body
      :visible.sync="taskStatus"
      custom-class="task_new_set_up"
      :close-on-click-modal="false"
    >
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">{{ scenePageTitle }}</span>
      </div>
      <addNewTaskNew
        v-if="taskStatus"
        :scenePage="scenePage"
        mode="add"
        :targetId="targetId"
        @success="successCb">
      </addNewTaskNew>
    </el-dialog>
    
    <!-- 删除提示 -->
    <cencelOrClose ref="cencelOrCloseDel"
      defineName='删除'
      :closeHeader='true'
      btnType='danger'
      @define='handleDeleteClick'
    >
      <p slot="tipsOne">确定删除当前任务目标吗？</p>
      <!-- <p slot="tipsTwo">点击确定操作，将删除当前目标</p> -->
    </cencelOrClose>

    <!-- 导出提示 -->
    <cencelOrClose ref="cencelOrClose"
      defineName='确定'
      :closeHeader='true'
      @define='handleExportTarget'
    >
      <p slot="tipsOne">确定导出当前已选目标吗？</p>
    </cencelOrClose>
  </div>
</template>

<script>
import { handleDownLoadFile } from "@/utils/download";
import uploadFIleTarget from "@/components/UploadFile/uploadFIleTarget";
import {
  getList,
  adjustSotrYear,
  deleteTargetItem,
  targetExport,
  targetViewDownload,
} from "@/api/target";
import TabLabelSlot from "@/components/TabLabelSlot/index";
import targetView from "./components/targetView";
import addTarget from "./components/addTarget";
import addNewTaskNew from "@/views/myTodo/components/addNewTaskNew";
import importTarget from "./components/importTarget";
import cencelOrClose from "@/components/cencelOrClose"
export default {
  name: "taskTarget",
  components: {
    TabLabelSlot,
    targetView,
    addTarget,
    addNewTaskNew,
    importTarget,
    uploadFIleTarget,
    cencelOrClose
  },
  data() {
    return {
      checkStatus: false, // 是否多选
      delStatus: false, // 是否删除
      targetId: undefined, // 目标id
      seletedArr: [], // 已多选数组
      tableLoading: false, // 加载状态
      scenePage: "target", // 新增类型：target - 分解任务；add - 新增目标
      taskStatus: false, // 是否分解任务
      sequence: false, // 是否开始调整顺序
      headImg: "mytodo_target", // 顶部导航图标地址
      titleOption: [
        // 标题配置字典
        {
          label: "目标管理",
          name: "mbgl",
          value: "target",
          icon: require("@/assets/img/mytodo/target.png"),
          activeIcon: require("@/assets/img/mytodo/target_sel.png"),
        },
      ],
      thead: [
        { label: "牵头人", prop: "userName" },
        { label: "年度", prop: "annual" },
        { label: "年度目标", prop: "annualTarget" },
        { label: "工作策略", prop: "annualStrategy" },
        { label: "季度", prop: "quarter" },
        { label: "季度目标", prop: "quarterTarget" },
        { label: "季度策略", prop: "quarterStrategy" },
        { label: "操作", prop: "operation" },
      ],
      tbody: [],
      showSecondMenu: false,
    };
  },
  mounted() {
    this.getListFun();
  },
  computed: {
    scenePageTitle() {
      return this.scenePage == "target"
        ? "新建任务"
        : this.scenePage == "add"
        ? "新增目标"
        : "编辑目标";
    },
  },
  methods: {
    /**
     * 获取数据
     */
    getListFun() {
      this.tableLoading = true;
      getList()
        .then((res) => {
          this.tableLoading = false;
          if (res.data.code == 0) {
            let records = res.data.data || [];
            records.forEach((item) => {
              let getUserName = item.relations.map(
                (userNameItem) => userNameItem.userName
              );
              item.checked = false;
              item.userName = getUserName.join(",");
              item.quarter = item.quarterlyTargets.map(
                (quarterItem) => quarterItem.quarter
              );
              item.quarterTarget = item.quarterlyTargets.map(
                (quarterTargetItem) => quarterTargetItem.quarterTarget
              );
              item.quarterStrategy = item.quarterlyTargets.map(
                (quarterStrategyItem) => quarterStrategyItem.quarterStrategy
              );
            });
            this.tbody = records;
          }
        })
        .catch(() => {
          this.tbody = [];
          this.tableLoading = false;
        });
    },

    /**
     * 模板下载
     * @param {number} type - 下载类型：0 - 任务；1 - 模板
     * @returns {void}
     */
    handleDownload(type) {
      targetViewDownload(type).then((res) => {
        if (res.data.code == 0) {
          handleDownLoadFile(res.data.data);
        }
      });
    },

    /**
     * 调整顺序 - 上
     * row: 行数据
     * index: 行索引
     */
    handleAdjustTop(row, index) {
      let data = [row, this.tbody[index - 1]];
      this.handleAdjustSort(data);
    },
    /**
     * 调整顺序 - 下
     * row: 行数据
     * index: 行索引
     */
    handleAdjustBottom(row, index) {
      let data = [row, this.tbody[index + 1]];
      this.handleAdjustSort(data);
    },

    /**
     * 调整顺序api
     * data: 需要调整的数据
     */
    handleAdjustSort(data) {
      adjustSotrYear(data).then((res) => {
        if (res.data.code == 0) {
          this.$message.success("调整成功");
          this.getListFun();
        }
      });
    },
    // 提示框
    handleDeleteDialog(){
      const list = this.tbody.filter((item) => item.checked);
      if (list.length == 0) {
        this.$message.error("请勾选要删除的目标");
      } else {
        this.$refs.cencelOrCloseDel.exitDialog = true
      }
    },
    /**
     * 确定删除
     */
    handleDeleteClick() {
      let idArr = this.seletedArr.map((item) => item.id);
      deleteTargetItem(idArr).then((res) => {
        if (res.data.code == 0) {
          this.$refs.cencelOrCloseDel.exitDialog = false;
          this.$message.success("删除成功");
          this.getListFun();
          this.initCheckFun();
        }
      });
    },

    /**
     *导出目标
     */
    handleExportTargetDialog(){
      const list = this.tbody.filter((item) => item.checked);
      if(list.length < 1){
        this.$message.error("请勾选要导出的目标");
      }else{
        this.$refs.cencelOrClose.exitDialog = true
      }
      
    },
    handleExportTarget() {
      const list = this.tbody.filter((item) => item.checked);
      const idArr = list.map((item) => item.id);
      targetExport(idArr).then((response) => {
        let blob = new Blob([response.data], {type: "application/vnd.ms-excel"});
        let getFileName
        let getFileNameStr = response.headers["content-disposition"];
        getFileName = getFileNameStr ? getFileNameStr.split("=")[1].split(".")[0] : '目标数据'
        let filename = decodeURIComponent(getFileName) + ".xlsx";
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        window.setTimeout(function () {
          URL.revokeObjectURL(blob);
          document.body.removeChild(link);
        }, 0);
        this.initCheckFun();
      });
      this.$refs.cencelOrClose.exitDialog = false
    },

    // 导入任务
    handleImportTask() {
      if (this.seletedArr.length != 0 && this.seletedArr.length <= 1) {
        this.$refs.importForm.init(this.seletedArr);
      } else {
        this.$message.error("请勾选最多一条需要导入的目标数据");
      }
    },

    /**
     * 初始多选框状态
     */
    initCheckFun() {
      this.tbody.forEach((item) => {
        item.checked = false;
      });
    },

    /**
     * 分解任务成功回调
     */
    successCb() {
      this.scenePage = "";
      this.taskStatus = false;
      this.getListFun();
    },

    /**
     * 行编辑
     * row: 行数据
     */
    handleItemEdit(row) {
      this.$refs.addForm.init(row, "edit");
    },

    /**
     * 验证数据类型
     * e: 传入的数据
     */
    valiDataType(e) {
      return typeof e;
    },

    /**
     * 新增目标
     */
    handleAddTarget() {
      this.$refs.addForm.init({}, "add");
    },

    /**
     * 目标视图
     */
    handleTargetView() {
      this.$refs.targetForm.init();
    },

    /**
     * 分解任务
     * row: 行数据
     * index: 行索引
     */
    handleRowClick(parentRow, parentIndex, childRow, childIndex, row) {
      this.scenePage = "target";
      this.targetId = row.quarterlyTargets[childIndex].id;
      this.taskStatus = true;
    },

    /**
     * 多选
     */
    handleChecked() {
      const list = this.tbody.filter((item) => item.checked);
      this.seletedArr = list;
    },
  },
};
</script>

<style lang='scss'>
.target-container {
  overflow-y: auto;
  background-color: #FBFBFC;
  .delete-dialog {
    .el-dialog {
      top: 50%;
      height: 200px;
      margin-top: -100px !important;
      .del-main {
        display: flex;
        align-items: flex-start;
        .del-img {
          width: 22px;
          height: 22px;
          img {
            max-width: 100%;
            max-height: 100%;
          }
        }
        .del-text {
          margin-left: 17px;
          div:first-child {
            font-size: 20px;
            font-weight: 400;
            color: #000;
            margin-bottom: 21px;
          }
          div:last-child {
            color: #bfbfbf;
            font-size: 14px;
          }
        }
      }
      .del-btn {
        margin-top: 65px;
        text-align: right;
      }
    }
  }
  .target-main {
    margin: 12px 0 0 10px;
    padding: 24px 20px 0;
    background-color: #fff;
    border-radius: 10px;
    .edit-text {
      color: #3370FF;
      cursor: pointer;
    }
    .el-pagination {
      text-align: right;
    }
    .target-btn {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      position: relative;
      .add_target {
        width: 100px !important;
        height: 32px;
        font-size: 14px;
        padding: 8px 0;
      }
      .operation_menu {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 8px;
        width: 227px;
        height: 32px;
        border: 1px solid #d0d3d6;
        border-radius: 4px;
        > div,
        > span {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 26px;
          height: 26px;
          cursor: pointer;
        }
        .interval_line {
          width: 1px;
          height: 14px;
          background-color: #d0d3d6;
        }
        div:hover {
          background-color: #e2e4e5;
          border-radius: 8px;
        }
        img {
          width: 14px;
        }
      }
      .upload-file {
        display: inline-block;
        margin: 0 10px;
      }
    }
    .custom-col {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
    }
    .sequence {
      display: inline-block;
      text-align: center;
      margin-left: 10px;
      .el-button {
        height: 16px;
        display: block;
        margin: 0;
        border: 0;
      }
    }
    .overflow-text {
      color: #606266;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      width: 130px;
    }
    .yearTarget-text {
      color: #606266;
    }
    .el-table {
      .el-button {
        padding: 0;
      }
      .el-table__header-wrapper th {
        text-align: center;
        color: #1f2329;
        background-color: #eeeeee;
        font-size: 14px;
        border-right: 1px solid #e5e6ea;
        font-family: SourceHanSansCN-Normal;
      }
      .el-table__header-wrapper th:last-child {
        border-right: 0;
      }
      .el-table__body-wrapper {
        height: calc(100vh - 220px);
        overflow-y: hidden;
        .el-table__body {
          color: #646a73;
          font-size: 14px;
          border-bottom: 1px solid #ebeef5;
          tr {
            background-color: #fff;
          }
          tr:last-child {
            border-bottom: 0;
          }
          td {
            text-align: center;
            padding: 0;
            border-bottom: 1px solid #ebeef5;
            .cell {
              padding: 0;
              white-space: normal !important;
              word-break: break-all !important;
              .row-box {
                border-bottom: 1px solid #ebeef5;
                height: 48px;
                padding: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                .line-overflow-text {
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                  overflow: hidden;
                }
                .btn_decompose{
                  color:#3370FF;
                }
              }
              .row-box:last-child {
                border-bottom: 0;
              }
            }
          }
        }
      }
      .el-table__body-wrapper:hover {
        overflow-y: auto;
      }
      .el-table__body-wrapper::-webkit-scrollbar-thumb {
        background-color: #DDDDDD;
        border-radius: 8px;
      }
      .el-table__body-wrapper::-webkit-scrollbar-track {
        background-color: #FFFFFF;
      }
    }
  }
}
.target_popper{
  max-width: 120px;
  padding: 12px 10px;
  .target_second_menu {
    .menu_item {
      display: flex;
      // justify-content: center;
      align-items: center;
      height: 24px;
      font-size: 14px;
      cursor: pointer;
      img {
        width: 14px;
        margin-right: 10px;
      }
      &:hover{
        background-color: #f5f6f7;
      }
    }
    .menu_item:nth-child(1) {
      margin-bottom: 5px;
    }
  }
}

</style>