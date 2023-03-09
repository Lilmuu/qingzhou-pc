<!--任务处理 详情模式-->
<template>
  <div id="MyToDoTask">
    <el-form :model="formData"
             ref="ruleForm"
             disabled
             style="display: flex;flex-direction: column;"
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
            <div>{{ formData[`startTime`] | dayjsFormat}} ~ {{ formData[`endTime`] | dayjsFormat}}</div>
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
      <el-row type="flex" style="margin-top: 20px;">
        <!--反馈列表-->
        <el-col :span="24" class="report-container">
          <div v-for="(item, index) in feedBackQueryInfoList" :key="'feedBackQueryInfoList' + index" class="feed-back-list">
            <div style="display: flex; align-items: center;">
              <div class="face">
                <!-- <Avatar :username="item.username" /> -->
                <headAvatar 
                  :size="32" 
                  :fontSize='12'
                  :avatarUrl="item.headImage ? item.headImage: ''" 
                  :username="item.username">
                </headAvatar>
              </div>
              <div class="report-info">
                <div style="margin-bottom: 7px;display: flex; align-items: center; justify-content: space-between; flex: 1;">
                  <span class="r-name">{{ item.username }}</span><span class="r-time"> {{ item.createTime | dayjsFormat }}</span></div>
              </div>
            </div>
            <div class="r-content">{{ item.content }}</div>
            <div v-if="item.accessory.length > 0" style="margin-top: 5px;">
              <div style="color: #008BFF" v-for="(file, fileIndex) in item.accessory" :key="'accessory'+ fileIndex"
                   class="file-list-item">
                <span @click="handleDownloadFile(file.url)">{{ file.fileName }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { emergencyLevel, myTodoFormOption, taskType } from "@/const/dicData"
import selectPeople from "@/views/myTodo/components/selectPeople"
import { acceptTask, getTaskDetails, manageTask } from "@/api/task"
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
import { queryFendBack } from "@/api/feedback"
import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar"

export default {
  name: "MyToDoTaskDetail",
  props: {
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
    // 是否需要处理任务
    acceptTask: {
      type: Boolean,
      default: false
    }
  },
  components: {
    selectPeople,
    headAvatar
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
        accessory: []
      },
      emergencyLevel: emergencyLevel,
      taskType: taskType,
      dialog: false,
      addType: 'zxr', // [zxr, gzr]
      feedBackQueryInfoList: [],
      feedBackQueryInfo: { // 反馈查询信息
        id: '',
        taskId: '',
        recipientId: 0,
        uniqueLogo: '',
        accessory: [],
        content: '',
        createTime: '',
        feedbackType: null
      }
    }
  },
  mounted() {
    this.initData()
    this.getQueryFendBack()
  },
  computed: {
    // 是否为反馈任务
    isFeedbackTask() {
      return this.feedBackQueryInfo.hasOwnProperty('id')
    }
  },
  methods: {
    // 初始化数据
    initData() {
      const query = {
        taskId: this.taskId
      }
      getTaskDetails(query).then(res => {
        if (res.data.code === 200) {
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
          // if (this.acceptTask) {
          //   this.handleAcceptTask()
          // }
          this.handleAcceptTask()
        }
      })
    },
    // 获取反馈信息
    getQueryFendBack() {
      const query = {
        taskId: this.taskId
      }
      queryFendBack(query).then(res => {
        if (res.data.code === 200) {
          const resData = res.data.data
          if (resData.length) {
            resData.forEach(item => {
              item.accessory = item.accessory ? JSON.parse(item.accessory) : []
            })
            // 列表
            this.feedBackQueryInfoList = resData
            const lastOne = resData[resData.length - 1]
            this.feedBackQueryInfo = {
              ...lastOne
            }
          }
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
    // 下载文件
    handleDownloadFile(url) {
      handleTransUrlAndDownLoadFile(url)
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
