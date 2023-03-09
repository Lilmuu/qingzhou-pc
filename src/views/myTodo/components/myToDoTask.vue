<!--任务处理-->
<template>
  <div id="MyToDoTask">
    <el-form :model="formData"
             ref="ruleForm"
             disabled
             label-width="80px">
      <div class="item_row" v-for="(item, index) in formOption.column" :key="item.prop">
        <img :src="item.icon" alt="" class="row_label_icon">
        <el-form-item :label="item.label" :prop="item.prop" style="flex: 1;text-align: right;">

          <el-select v-model="formData[`${item.prop}`]" placeholder="请选择" v-if="item.type === 'select'">
            <el-option
              v-for="op in item.dicData"
              :key="op.value"
              :label="op.label"
              :value="op.value">
            </el-option>
          </el-select>

          <div v-else-if="item.prop === 'attentionList'">
            <el-input :value="formData['attentionList'].map(p => p.username).join(',')" clearable v-if="formData['attentionList'].length"></el-input>
            <span style="font-size: 13px;padding-right: 10px;" v-else>无</span>
          </div>

          <div v-else-if="item.customSlot && item.prop === 'content'" class="custom_el-form-item__content" style="font-size: 13px;padding-right: 10px;">
            <div class="task-content">{{ formData[`content`] }}</div>
          </div>

          <div v-else-if="item.customSlot && item.prop === 'gzzq'" style="font-size: 13px;padding-right: 10px;">
            <div>{{ formData[`startTime`] | dayjsFormat }} ~ {{ formData[`endTime`] | dayjsFormat }}</div>
          </div>

          <div v-else-if="item.customSlot && item.prop === 'createTime'" style="font-size: 13px;padding-right: 10px;">
            <div>{{ formData[`createTime`] | dayjsFormat }}</div>
          </div>

          <el-input v-model="formData[`${item.prop}`]" clearable v-else></el-input>
        </el-form-item>
      </div>
      <el-col :span="24" style="margin-top: 20px;" v-if="formData.accessory.length > 0">
        <div>
          <h3>附件</h3>
          <div style="color: #008BFF" v-for="(file, index) in formData.accessory" :key="'accessory'+ index"
               class="file-list-item">
            <span @click="handleDownloadFile(file.url)">{{ file.fileName }}</span>
          </div>
        </div>
      </el-col>
    </el-form>
    <!--  添加新任务  -->
    <div v-if="showAddNewTask" class="splice_row"></div>
    <addNewTask mode="add"
      :taskId="taskId"
      :rangeTime="[formData[`startTime`], formData[`endTime`]]"
      v-if="showAddNewTask"
      :isAdjustTime="formData.isAdjustTime"
      :isSubTasks="formData.isSubTasks"
      @success="successCb"></addNewTask>
  </div>
</template>

<script>
import { emergencyLevel, myTodoFormOption, taskType } from "@/const/dicData"
import selectPeople from "@/views/myTodo/components/selectPeople"
import { getTaskDetails, manageTask, acceptTask } from "@/api/task"
import addNewTask from "@/views/myTodo/components/addNewTask"
import { handleTransUrlAndDownLoadFile } from "@/utils/download"

export default {
  name: "MyToDoTask",
  props: {
    // 入口 [myTodo: 待我处理，myDate：日历，]
    entry: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    // 添加任务类型 [0: 普通， 1: 日历]
    addTaskType: {
      type: Number,
      default: 0
    },
    taskId: {
      type: Number,
      required: true
    },
    // 显示添加子任务
    showAddNewTask: {
      type: Boolean,
      default: true
    },
    // 是否需要处理任务
    acceptTask: {
      type: Boolean,
      default: false
    }
  },
  components: {
    selectPeople,
    addNewTask
  },
  data() {
    return {
      formOption: myTodoFormOption,
      formData: {
        name: '',
        content: '',
        taskType: 0,
        emergencyLevel: 0,
        timeStart: '',
        timeEnd: '',
        executeList: [], // 添加执行人
        attentionList: [], // 添加关注人
        accessory: [],
        isAdjustTime: 0, // 0 未调整时间 1 已存在调整
        isSubTasks: 0 // 0 不存在子任务  1 存在只任务
      },
      emergencyLevel: emergencyLevel,
      taskType: taskType,
      dialog: false,
      addType: 'zxr' // [zxr, gzr]
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    // 初始化数据
    initData() {
      const query = {
        taskId: this.taskId
      }
      getTaskDetails(query).then(res => {
        if (res.data.code === 200) {
          // 相同的禁用全部
          if (res.data.data.userId === res.data.data.initiatorId) {
            this.$emit('checkShowAll', false)
          } else {
            this.$emit('checkShowAll', true)
          }
          this.formData = {
            ...res.data.data,
            timeStart: res.data.data.startTime,
            timeEnd: res.data.data.endTime,
            attentionList: JSON.parse(res.data.data.attentionList),
            executeList: [{
              id: res.data.data.userId,
              username: res.data.data.userName
            }],
            accessory: JSON.parse(res.data.data.accessory)
          }
          if (this.acceptTask) {
            this.handleAcceptTask()
          }
        }
      })
    },
    // 接受任务
    handleAcceptTask() {
      const data = {
        taskId: this.taskId
      }
      acceptTask(data).then(res => {
        if (res.data.code === 200) {
          //
        }
      })
    },
    // 执行任务
    handleExec() {
      const data = {
        taskId: this.taskId
      }
      manageTask(data).then(res => {
        if (res.data.code === 200) {
          this.$message.success('执行成功')
          this.$emit('close')
          this.$emit('handleClose')
        }
      })
    },
    // 下载文件
    handleDownloadFile(url) {
      handleTransUrlAndDownLoadFile(url)
    },
    successCb() {
      this.$emit('close')
      this.$emit('handleClose')
    }
  }
}
</script>

<style lang="scss">
#MyToDoTask {
  display: flex;
  flex-direction: column;
  .item_row {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    margin-top: 10px;

    .el-form-item__label {
      text-align: left;
    }

    input.el-input__inner {
      border: none;
      text-align: right;
    }
  }

  .el-form-item {
    margin-bottom: 10px;
  }

  .row_label_icon {
    width: 20px;
    height: 20px;
    display: block;
    margin-top: 10px;
    margin-right: 10px;
  }
  .is-disabled {
    .el-input__suffix {
      display: none;
    }
  }
}

</style>
