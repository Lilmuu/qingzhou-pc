<!--反馈任务-->
<template>
  <div id="MyToDoTask">
    <myToDoTask :entry="entry" :taskId="taskId" :showAddNewTask="false" @checkShowAll="checkShowAll" ></myToDoTask>
    <el-form :model="feedBackQueryInfo" ref="ruleForm" label-width="100px" v-show="showAll">
<!--      <div style="margin-top: 20px;font-size: 14px;">-->
<!--        <span style="color: #00b5ef;padding: 8px;" v-for="(file, index) in feedBackQueryInfo" :key="'file' + index">{{ file.fileName }}</span>-->
<!--        <span style="color: #00b5ef;padding: 8px;">附件二</span>-->
<!--      </div>-->

      <el-row type="flex" style="margin-top: 20px;">
        <!--反馈列表-->
        <el-col :span="24" class="report-container" v-if="isFeedbackTask">
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
<!--      <el-col :span="24" style="margin-top: 20px;" v-if="feedBackQueryInfo.accessory.length > 0">-->
<!--        <div>-->
<!--          <h3>附件</h3>-->
<!--          <div style="color: #008BFF" v-for="(file, index) in feedBackQueryInfo.accessory" :key="'accessory'+ index"-->
<!--               class="file-list-item">-->
<!--            <span @click="handleDownloadFile(file.url)">{{ file.fileName }}</span>-->
<!--          </div>-->
<!--        </div>-->
<!--      </el-col>-->
      <el-col :span="24" style="margin: 20px 0;display: flex;align-items: center;" v-if="!isMyTask && !showReply">
        <div style="margin-right: 15px;font-size: 14px;">反馈类型</div>
        <el-radio-group v-model="feedbackType" class="flex-space-between">
          <el-radio :label="level.value" v-for="(level,i) in fklxOption" :key="'fklxOption' + i">
            {{ level.label }}
          </el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="24" style="margin: 20px 0;" v-show="(feedbackType === 1 && !isMyTask) || showReply">
        <el-input v-model="content" type="textarea" clearable placeholder="请输入反馈内容"></el-input>
      </el-col>
      <UploadFile uploadText='添加附件'
                  :initFileList="accessory"
                  :maxSize="1024*1024*20"
                  @changeUpload='changeUpload'
                  @onRemove="onRemove"
                  errorText='请上传正确的附件'
                  v-show="feedbackType === 1 && !isMyTask"/>
<!--      <div>-->
<!--        <div style="color: #008BFF" v-for="(file, index) in accessory" :key="'accessory'+ index" class="file-list-item">-->
<!--          <span>{{ file.fileName }}</span>-->
<!--          <span @click="handleDelFile(index)"><i class="el-icon-close del-file-icon"></i></span>-->
<!--        </div>-->
<!--      </div>-->

      <!-- 提交反馈  -->
      <el-col :span="24" style="margin: 20px 0;" v-if="feedbackType === 2 || feedBackQueryInfo.feedbackType !== 2">
        <div class="flex-center">
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </el-col>
      <!-- 确认反馈  -->
      <el-col :span="24" style="margin: 20px 0;" v-if="isFeedbackTask && isMyTask">
        <div style="display: flex; flex-direction: column">
          <div style="font-size: 14px;margin-bottom: 15px;">完成时间</div>
          <el-date-picker
            v-model="taskEndTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="任务结束时间">
          </el-date-picker>
          <div class="flex-space-between">
            <el-button type="primary" @click="handleEndTaskSubmit" style="margin-top: 30px;width: 120px;margin-right: 20px;">确认已完成</el-button>
            <el-button type="primary" @click="showEndInput = !showEndInput" style="margin-top: 30px;width: 120px;">反馈</el-button>
          </div>
          <div v-show="showEndInput">
            <el-col :span="24" style="margin: 20px 0;">
              <el-input v-model="content" type="textarea" clearable placeholder="请输入反馈内容"></el-input>
            </el-col>
            <UploadFile uploadText='添加附件'
                        :initFileList="accessory"
                        :maxSize="1024*1024*20"
                        @changeUpload='changeUpload'
                        @onRemove="onRemove"
                        errorText='请上传正确的附件'/>
            <el-button type="primary" @click="handleEndTaskSubmitByInput" style="margin-top: 30px;width: 100%;">提交</el-button>
          </div>
        </div>
      </el-col>
    </el-form>
    <!--  确认任务已完成  -->
    <el-dialog append-to-body
               :visible.sync='showEndDialog'
               class="dialog-message-box"
               width="30%"
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">提示</span>
      </div>
      <div class="warning-content">
        <span class="warning-title"><i class="el-icon-info warning-icon"></i>确认任务已完成？</span>
        <span class="warning-sub">提交后，将不能继续进行操作</span>
      </div>
      <div class="warning-footer">
        <el-button @click="showEndDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitShowDialog">确定</el-button>
      </div>
    </el-dialog>
    <!--  是否需要调整项目周期  -->
    <el-dialog append-to-body
               :visible.sync='showRangeDialog'
               class="dialog-message-box"
               width="30%"
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">提示</span>
      </div>
      <div class="warning-content">
        <span class="warning-title"><i class="el-icon-info warning-icon"></i>是否需要调整项目周期？</span>
      </div>
      <div class="warning-footer">
        <el-button @click="showRangeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitShowDialog">确定</el-button>
      </div>
    </el-dialog>
    <!--  反馈成功  -->
    <el-dialog append-to-body
               :before-close="feedBackSuccess"
               :visible.sync='dialog'
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">提示</span>
      </div>
      <div class="flex-center" style="flex-direction: column;">
        <img src="@/assets/img/check.png" alt="" style="width: 130px;">
        <span style="margin: 20px">{{ isFeedbackTask && isMyTask ? '任务已处理！' : '任务反馈成功！' }}</span>
        <el-button type="primary" @click="feedBackSuccess">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { myTodoFormOption, fklxOption } from "@/const/dicData"
import UploadFile from "@/components/UploadFile/UploadFile"
import { addFeedback, queryFendBack } from "@/api/feedback"
import myToDoTask from "@/views/myTodo/components/myToDoTask"
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
import { acceptTask } from "@/api/task"
import headAvatar from "@/components/headAvatar"
// import Avatar from "@/components/Avatar/Avatar"
import * as api from "@/api/task"
import { mapGetters } from 'vuex'

export default {
  name: "reportTask",
  props: {
    // 入口 [myTodo: 待我处理，myDate：日历，]
    entry: {
      type: String,
      required: true
    },
    taskId: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    // 是否需要处理任务
    acceptTask: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formOption: myTodoFormOption,
      formData: {
        feedbackType: 1
      },
      dialog: false,
      content: '',
      accessory: [],
      feedBackQueryInfo: { // 反馈查询信息
        id: '',
        taskId: '',
        recipientId: 0,
        uniqueLogo: '',
        accessory: [],
        content: '',
        createTime: '',
        feedbackType: null
      },
      feedBackQueryInfoList: [],
      fklxOption: fklxOption,
      feedbackType: 1,
      taskEndTime: '',
      isMyTask: false, // 是否为自己的任务
      showReply: false, // 展示反馈
      showAll: false, // 展示全部
      showEndDialog: false,
      showRangeDialog: false, // 项目周期dialog
      showEndInput: false // 显示完成输入框
    }
  },
  components: {
    UploadFile,
    myToDoTask,
    headAvatar
  },
  mounted() {
    this.getQueryFendBack()
  },
  computed: {
    ...mapGetters([
      'userId'
    ]),
    // 是否为反馈任务
    isFeedbackTask() {
      return this.feedBackQueryInfo.hasOwnProperty('id')
    }
  },
  methods: {
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
            // 取最后一个
            const lastOne = resData[resData.length - 1]
            const { initiatorId, feedbackType, completeTime = '' } = lastOne
            // 是否为自己的
            this.isMyTask = (initiatorId === this.userId && feedbackType === 2)
            // 发起人 只能 反馈
            this.showReply = (initiatorId === this.userId && resData.length && lastOne.feedbackType !== 2)
            // 结束时间
            this.taskEndTime = completeTime
            this.feedBackQueryInfo = {
              ...lastOne
            }
            if (this.acceptTask) {
              this.handleAcceptTask()
            }
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
    //
    checkShowAll(v) {
      this.showAll = v
    },
    // 提交反馈
    handleSubmit() {
      if (this.feedbackType === 2) {
        this.showEndDialog = true
      } else {
        const data = {
          id: this.feedBackQueryInfo.id,
          taskId: this.taskId,
          recipientId: this.feedBackQueryInfo.recipientId,
          content: this.content,
          accessory: JSON.stringify(this.accessory),
          feedbackType: this.feedbackType
        }
        // 反馈
        if (this.formData.hasOwnProperty('feedbackType')) {
          // 任务问题 输入 反馈内容
          let flag = false
          if (this.feedbackType === 1) {
            if (!this.content) {
              flag = true
            }
          }
          if (flag) {
            this.$message.error('请输入反馈内容')
            return
          }
        }
        addFeedback(data).then(res => {
          if (res.data.code === 200) {
            this.dialog = true
          }
        })
      }
    },
    handleSubmitShowDialog() {
      const data = {
        id: this.feedBackQueryInfo.id,
        taskId: this.taskId,
        recipientId: this.feedBackQueryInfo.recipientId,
        content: this.content,
        accessory: JSON.stringify(this.accessory),
        feedbackType: this.feedbackType
      }
      // 反馈
      if (this.formData.hasOwnProperty('feedbackType')) {
        // 任务问题 输入 反馈内容
        let flag = false
        if (this.feedbackType === 1) {
          if (!this.content) {
            flag = true
          }
        }
        if (flag) {
          this.$message.error('请输入反馈内容')
          return
        }
      }
      addFeedback(data).then(res => {
        this.showEndDialog = false
        if (res.data.code === 200) {
          this.dialog = true
        }
      })
    },
    // 结束任务
    handleEndTaskSubmit() {
      if (!this.taskEndTime) {
        this.$message.error('请填写任务结束时间')
        return
      }
      const data = {
        id: this.feedBackQueryInfo.taskId,
        time: this.taskEndTime
      }
      api.endState(data).then(res => {
        if (res.data.code === 200) {
          this.dialog = true
        }
      })
    },
    // 输入结束任务
    handleEndTaskSubmitByInput() {
      if (!this.content) {
        this.$message.error('请输入反馈内容')
        return
      }
      const data = {
        id: this.feedBackQueryInfo.id,
        taskId: this.taskId,
        recipientId: this.feedBackQueryInfo.recipientId,
        content: this.content,
        accessory: JSON.stringify(this.accessory),
        feedbackType: 1
      }
      addFeedback(data).then(res => {
        if (res.data.code === 200) {
          this.dialog = true
        }
      })
    },
    feedBackSuccess() {
      this.dialog = false
      this.$emit('close')
    },
    // 文件上传成功回调
    changeUpload(data) {
      this.accessory.push(data.res)
    },
    // 文件删除回调
    onRemove(file, fileList) {
      // 有 response 的
      let url = file.url
      if (file.response) {
        url = file.response.data.url
      }
      // 过滤 url
      this.accessory = this.accessory.filter(item => item.url !== url)
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
}

</style>
