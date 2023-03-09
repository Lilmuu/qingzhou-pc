<!--
 * @Author: your name
 * @Date: 2021-08-31 17:03:22
 * @LastEditTime: 2022-04-27 10:03:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vsCode\task-pc-ui\src\views\myTodo\components\TaskTarget.vue
-->
<template>
  <div style="height: auto;max-height: 240px;overy-y: auto;" class="search_task_parent">
    <el-tabs tab-position="left" style="height: 200px;" v-model="activeName">
      <el-tab-pane name="task">
        <div slot="label" class="search_item">
          <span>任务中包含</span>
          <span class="search_cont">{{ queryString }}</span>
        </div>
        <el-table
          :data="taskListOptions"
          @row-click="clickTableRow1"
          :row-class-name="tableRowClassName"
          :stripe="false"
          :show-header="false"
          style="width: 100%">
          <el-table-column prop="label" label="任务名称"></el-table-column>
          <el-table-column prop="initiator" label="发起人"></el-table-column>
          <el-table-column prop="endTime" label="截止时间"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane name="target">
        <div slot="label" class="search_item">
          <span>目标中包含</span>
          <span class="search_cont">{{ queryString }}</span>
        </div>
        <el-table
          :data="targetOptions"
          @row-click="clickTableRow2"
          :row-class-name="tableRowClassName"
          :stripe="false"
          :show-header="false"
          style="width: 100%">
          <el-table-column prop="userName" label="牵头人"></el-table-column>
          <el-table-column prop="quarter" label="季度"></el-table-column>
          <el-table-column prop="label" label="目标"></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { queryTarget } from "@/api/task"

export default {
    props: {
        queryString: {
            type: String,
            default: ""
        },
        isUpdatePage: {
            type: String,
            default: ""
        },
        taskId: {
            type: String,
            default: ""
        },
        activePlane12: {
            type: String,
            default: "1"
        }
    },
    data() {
        return{
            targetOptions: [],
            taskListOptions:[],
            clickRowId: "",
            activeName: ""
        }
    },
    mounted() {
        this.query();
        if(['1','3'].includes(this.activePlane12)) {
            this.activeName = "task"
        }else if(this.activePlane12 == '2') {
            this.activeName = "target"
        }
    },
    watch: {
        queryString() {
            this.query()
        }
    },
    methods: {
        query() {
            queryTarget({ quarterTarget: this.queryString, isUpdatePage: this.isUpdatePage, id: this.taskId}).then(res => {
                this.taskListOptions = [];
                this.targetOptions = [];
                if(res.data.data.targetList) {
                    res.data.data.targetList.forEach(item => {
                        let obj = {
                            label: item.quarterTarget,
                            value: item.id,
                            quarter: item.quarter,
                            userName: item.userName
                        }
                        this.targetOptions.push(obj)
                    })
                }
                if(res.data.data.taskList) {
                    res.data.data.taskList.forEach(item => {
                        let obj = {
                            label: item.name,
                            value: item.id,
                            initiator: item.initiator,
                            content: item.content,
                            accessory: item.accessory,
                            endTime: item.endTime
                        }
                        this.taskListOptions.push(obj)
                    })
                }
            })
        },
        clickTableRow1(row, column, event) {
            this.clickRowId = row.value
            this.$emit("rowClickFunction", {item: row, type: "task"})
        },
        clickTableRow2(row, column, event) {
            this.clickRowId = row.value
            this.$emit("rowClickFunction", {item: row, type: "traget"})
        },
        tableRowClassName({row}) {
            if (!this.clickRowId) return;
            // 当前选中行id 与 表格的各行比较
            if (this.clickRowId == row.value) {
                return "success-row";
            }
            return "";
        }
    }
}
</script>

<style lang="scss" scoped>
.el-tabs .is-active {
  background-color: #F4F5F8 !important;
  color: #222222 !important;
}

::v-deep.el-table {
  td {
    padding: 5px 0 !important;
  }

  th {
    padding: 5px 0 !important;
  }

  .el-table__body .el-table__row:nth-child(even) {
    background-color: #fff;
  }
}

.el-table::before {
  background-color: #fff;
}

::v-deep.el-tabs {
  .is-active {
    background-color: #F4F5F8 !important;
    color: #222222 !important;
  }
}

.el-tab-pane {
  overflow-y: auto;
  height: 200px;
}

::-webkit-scrollbar {
  width: 3px !important;
}
</style>
