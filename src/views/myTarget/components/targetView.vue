<!-- 目标视图 -->
<template>
  <div class="target-view-container">
    <el-dialog
      class="target-view-dialog"
      :visible.sync="viewStataus"
      fullscreen
      width="100%"
      :before-close="handleViewClose"
    >
      <div class="target-view-main">
        <div class="target-view-check">
          <el-checkbox-group v-model="selectedArr" @change="handleChange">
            <el-checkbox
              v-for="(item, index) in thead"
              :key="index"
              :label="item.label"
              :value="item.value"
            >
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="target-view-table">
          <el-table
            border
            ref="table"
            :data="tbody"
            :stripe="false"
            v-loading="loading"
            show-overflow-tooltip
            :cell-class-name="tableRowClassName"
            :span-method="arraySpanMethod"
          >
            <el-table-column
              v-for="(item, index) in headerList"
              :key="index"
              :label="item.label"
              :prop="item.prop"
            >
              <template slot-scope="scope">
                <span :class="[emergencyLevelType(scope.row[item.prop], item.prop)]">{{ getPropValue(scope.row[item.prop], item.prop) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { targetView } from "@/api/target";
import { emergencyLevelNew } from "@/const/dicData";
export default {
  name: "targetView",
  data() {
    return {
      loading: false,
      testList: [],
      headerList: [],
      viewStataus: false,
      thead: [], // 数据表头
      tbody: [], // 数据表主体
      selectedArr: [],
      rowColList: {},
    };
  },
  computed:{
    emergencyLevelType(){
      return (level, prop)=>{
        let result = prop.indexOf('emergencyLevel') == 0 ? true : false
        if(result){
          return level == 0 ? 'ordinary' : 'important'
        }
        return ''
      }
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      this.testList = [];
      this.headerList = [];
      this.viewStataus = true;
      this.getList();
    },

    /**
     * 添加表格列自定义属性
     */
    tableRowClassName({ column }) {
      if (
        column.property.includes("taskTime") ||
        column.property.includes("emergencyLevel") ||
        column.property.includes("content") ||
        column.property.includes("userName") ||
        column.property.includes("taskNode")
      ) {
        if (column.property.includes("taskTime")) {
          return "taskTime-col";
        }
        return "child-col";
      }
    },

    /**
     * 检测是否包含指定属性
     * row: 对象
     * keyStr: 属性
     */
    hasTimeFun(row, keyStr) {
      let keyList = [],
        hasStatus;
      for (let i in row) {
        keyList.push(i);
      }
      keyList.forEach((item) => {
        hasStatus = item.includes(keyStr);
      });
      return hasStatus;
    },
    /**
     * 进行字典值转换
     */
    getPropValue(val, props) {
      if (props.indexOf("emergencyLevel") != -1) {
        let str = val;
        emergencyLevelNew.forEach((item) => {
          if (item.value == val) {
            str = item.label;
          }
        });
        return str;
      } else {
        return val;
      }
    },
    /**
     * 获取数据
     */
    getList() {
      this.rowColList = {};
      this.loading = true;
      targetView()
        .then((res) => {
          this.loading = false;
          if (res.data.code == 0) {
            let list = [],
              newSelList = [],
              newHeadList = [];
            this.thead = res.data.data.fields || [];
            let data = res.data.data.list || [];
            // let data = [res.data.data.list[1]] || [];
            // nextIndex 下一个目标开始下标，当前目标总长度
            let nextIndex = 0,
              countLen = 0;
            data.forEach((item, index) => {
              let userNameList = item.relations.map((rel) => rel.userName);
              nextIndex = nextIndex + countLen;
              // 每次开始目标长度清零
              countLen = 0;
              item.quarterlyTargets.forEach((tarItem, tarIndex) => {
                // 当前目标下面是否有多级任务,用于计算每一个季度的合并行
                if (tarItem.childList.length) {
                  let itemObj = this.recursion(tarItem);
                  let rowAndCol = {},
                    defaultRC = {};
                  countLen += itemObj.length;
                  // 因为没有唯一值,所以根据季度来定义合并行列
                  rowAndCol[tarItem.quarter + "Row"] = itemObj.length;
                  rowAndCol[tarItem.quarter + "Col"] = 1;
                  defaultRC[tarItem.quarter + "Row"] = 0;
                  defaultRC[tarItem.quarter + "Col"] = 0;
                  itemObj.forEach((newItem, newIndex) => {
                    list.push(
                      Object.assign(
                        {
                          ...item,
                          ...newItem,
                          relations: userNameList.toString(),
                          rowSpan: 0,
                          colSpan: 0,
                        },
                        newIndex == 0 ? rowAndCol : defaultRC
                      )
                    );
                  });
                } else {
                  countLen += 1;
                  let defaultRC = {};
                  defaultRC[tarItem.quarter + "Row"] = 1;
                  defaultRC[tarItem.quarter + "Col"] = 1;
                  list.push(
                    Object.assign(
                      {
                        ...item,
                        ...tarItem,
                        relations: userNameList.toString(),
                        rowSpan: 0,
                        colSpan: 0,
                      },
                      defaultRC
                    )
                  );
                }
                // 计算一个目标的合并行
                list[nextIndex].rowSpan = countLen;
                list[nextIndex].colSpan = 1;
              });
            });
            this.tbody = list;
            console.log(list);
            this.thead.forEach((item) => {
              newSelList.push(item.label);
              newHeadList.push({
                label: item.label,
                prop: item.prop,
              });
            });
            this.selectedArr = newSelList; // 默认全选
            this.headerList = newHeadList; // 默认全选
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    /**
     * 递归取值
     */
    recursion(item) {
      let itemList = [],
        itemLength = "",
        list = [];
      item.childList.forEach((items, index) => {
        let defaultRC = {};
        defaultRC["taskRow" + items.taskLevel] = 0;
        defaultRC["taskCol" + items.taskLevel] = 0;
        if (items.childList.length) {
          // 找下一级任务并平铺出来
          let obj = this.recursion(items);
          //    objRc 代表实际合并行 ,defaultRC 代表默认合并行
          let objRc = {};
          objRc["taskRow" + items.taskLevel] = obj.length;
          objRc["taskCol" + items.taskLevel] = 1;

          obj.forEach((objItem, objIndex) => {
            list.push(
              Object.assign(
                {
                  ...item,
                  ...objItem,
                },
                objIndex == 0 ? objRc : defaultRC
              )
            );
          });
        } else {
          list.push(
            Object.assign({
              ...item,
              ...items,
            })
          );
        }
      });
      return list;
    },
    /**
     * 表格跨行处理
     * row: 行数据
     */
    arraySpanMethod({ row, column, rowIndex }) {
      if (
        column.label === "牵头人" ||
        column.label === "年份" ||
        column.label === "年度目标" ||
        column.label === "工作策略(年度)"
      ) {
        return {
          rowspan: row.rowSpan || 0,
          colspan: row.colSpan || 0,
        };
      } else if (
        column.label === "季度" ||
        column.label === "工作策略（季度）" ||
        column.label === "季度目标"
      ) {
        // console.log(row)
        return {
          rowspan: row[row.quarter + "Row"],
          colspan: row[row.quarter + "Col"],
        };
      } else if (
        column.property.indexOf("taskNode") != -1 ||
        column.property.indexOf("taskTime") != -1 ||
        column.property.indexOf("userName") != -1 ||
        column.property.indexOf("emergencyLevel") != -1 ||
        column.property.indexOf("content") != -1
      ) {
        // 获取任务的等级值
        let level = column.property.replace(/[^0-9]/gi, "");
        // 判断是否该取值
        if (row["taskRow" + level] || row["taskRow" + level] == 0) {
          return {
            rowspan: row["taskRow" + level],
            colspan: row["taskCol" + level],
          };
        }
      }
    },

    /**
     * 多选监听动态渲染
     * e: 返回值
     */
    handleChange(list) {
      this.loading = true;
      let columnList = [],
        finalList = [];
      this.testList = list;
      // 循环过滤数组中每一个元素是否和初始数组中每一项是否相匹配，如果匹配的话则添加到新的数组中
      list.forEach((parentItem) => {
        this.thead.filter((childItem) => {
          if (childItem.label == parentItem) {
            columnList.push({
              label: childItem.label,
              prop: childItem.prop,
            });
          }
        });
      });
      // 新数组的位置排序参照初始数组的位置顺序
      this.thead.forEach((aItem) => {
        columnList.forEach((bItem) => {
          if (aItem.prop === bItem.prop) {
            finalList.push({
              label: aItem.label,
              prop: aItem.prop,
            });
          }
        });
      });
      this.headerList = finalList;
      this.$nextTick(() => {
        this.rowColList = {};
        this.$refs.table.doLayout();
      });
      this.loading = false;
    },

    /**
     * 验证数据类型
     * e: 传入的数据
     */
    valiDataType(e) {
      return typeof e;
    },

    /**
     * 关闭
     */
    handleViewClose() {
      this.selectedArr = [];
      this.viewStataus = false;
    },
  },
};
</script>

<style lang='scss' >
.target-view-container {
  .target-view-dialog {
    width: 100%;
    left: 0;
    top: 0;
    .el-dialog {
      max-height: 100%;
      .el-dialog__header{
        background: #38486F;
      }
      .el-dialog__body {
        padding: 0 20px;
      }
    }
  }
  .target-view-check {
    .el-checkbox-group {
      min-height: 70px;
      line-height: 70px;
      .el-checkbox {
        margin-bottom: 5px;
        .el-checkbox__label {
          color: #626468;
        }
      }
    }
  }
  ul {
    margin: 0;
    padding: 0;
    li {
      height: 48px;
      list-style: none;
      border-bottom: 1px solid #ebeef5;
      padding: 0 5px;
      div {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    li:last-child {
      border-bottom: 0;
      // margin-bottom: 0;
      // padding-bottom: 0;
    }
  }
  .target-view-table {
    .el-table {
      th.gutter {
        display: table-cell !important;
      }
      .row-box {
        ul li .overflow-text {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }
      .el-table__header,
      .el-table__body {
        width: 100%!important;
      }
      .el-table__body-wrapper {
        height: calc(100vh - 200px);
        overflow: hidden;
      }
      .el-table__body-wrapper:hover {
        overflow: auto;
      }
      .el-table__body-wrapper td:last-child {
        padding-right: 1px;
      }
      .el-table__body-wrapper:hover {
        margin-left: -1px;
      }
      .el-table__body-wrapper:hover table {
        margin-left: 1px;
      }
      .el-table__body-wrapper::-webkit-scrollbar {
        width: 4px;
      }
      .el-table__body-wrapper::-webkit-scrollbar-thumb {
        background-color: #DDDDDD;
        border-radius: 8px;
      }
      .el-table__body-wrapper::-webkit-scrollbar-track {
        background-color: #FFFFFF;
      }
      .el-button {
        padding: 0;
      }
      .el-table__header-wrapper {
        th {
          text-align: center;
          color: #333333;
          background-color: #eeeeee;
          border-right: 1px solid #e5e6ea;
        }
        th.thead-col {
          width: 130px !important;
        }
      }
      .el-table__header-wrapper th:last-child {
        border-right: 0;
      }
      .el-table__body {
        tbody {
          .el-table__row {
            td {
              border-bottom: 1px solid #ebeef5;
              text-align: center;
              .cell {
                padding: 0;
                white-space: normal !important;
              }
            }
            td.child-col {
              // vertical-align: top;
              // padding: 0;
            }
            td.taskTime-col {
              // vertical-align: top;
              // padding: 0;
              .row-box {
                li {
                  display: flex;
                  justify-content: center;
                  .jd-item {
                    width: 105px;
                  }
                  .overflow-text {
                    width: 105px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .ordinary{
    color: #3471FF;
  }
  .important{
    color: #F54A45;
  }
}
</style>
