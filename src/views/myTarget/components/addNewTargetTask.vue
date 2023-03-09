<!-- 分解任务 -->
<template>
  <el-form class="addNewForm" :model="formData" ref="ruleForm" label-width="100px">
    <el-row type="flex" style="flex-direction: column">
      <el-col :span="24" v-if="scenePage != 'target'">
        <el-col :span="6">
          <el-select v-model="formData.taskType" placeholder="请选择任务类型">
            <el-option :label="task.label"
                       :value="task.value" v-for="(task, i) in taskType"
                       :key="'taskType' + i"></el-option>
          </el-select>
        </el-col>
        <el-col :span="2" style="height: 40px;"></el-col>
        <el-col :span="16">
          <el-input v-model="formData.name"
                    clearable
                    maxlength="50"
                    show-word-limit
                    placeholder="请输入任务名称"></el-input>
        </el-col>
      </el-col>
      <!-- 新增：目标管理 -- start -->
      <div v-else>
        <el-col :span="24">
          <el-input v-model="formData.circulationTask"
                    clearable
                    type="text"
                    placeholder="增加循环任功能"></el-input>
        </el-col>
        <el-col :span="24" style="margin-top: 20px;">
          <el-input v-model="formData.name"
                    clearable
                    type="text"
                    placeholder="添加任务/项目名称"></el-input>
        </el-col>
      </div>
      <!-- end -->
      <el-col :span="24" style="margin-top: 20px;">
        <el-input v-model="formData.content"
                  type="textarea"
                  :autosize="{ minRows: 5, maxRows: 6}"
                  clearable placeholder="请输入任务内容"></el-input>
      </el-col>
      <el-col :span="24" style="margin-top: 20px;">
        <div class="item_row" @click="handleShowAddDialog('zxr')">
          <i class="add-btn el-icon-circle-plus-outline"></i>
          <el-form-item label="添加执行人" prop="zxr" style="flex: 1">
            <div class="task-people-row ellipsis">
              <span class="task-people-row-item ellipsis">
                  <span v-for="(user, index) in formData.executeList" :key="'executeList' + index" v-if="index <= 5"
                        class="selected-user">{{ user.username }}</span>
              </span>
              <span>共 {{ formData.executeList.length }} 人</span>
            </div>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="24" style="margin-top: 0;">
        <div class="item_row" @click="handleShowAddDialog('gzr')">
          <i class="add-btn el-icon-circle-plus-outline"></i>
          <el-form-item label="添加关注人" prop="gzr" style="flex: 1">
            <!--  <el-input v-model="formData.gzr" clearable></el-input>-->
            <div class="task-people-row ellipsis">
              <span class="task-people-row-item ellipsis">
                <span v-for="(user, index) in formData.attentionList" :key="'attentionList' + index" v-if="index <= 5"
                      class="selected-user">{{ user.username }}</span>
              </span>
              <span>共 {{ formData.attentionList.length }} 人</span>
            </div>
          </el-form-item>
        </div>
      </el-col>
      <!-- 修改：添加目标管理判断条件 -->
      <div v-if="scenePage != 'target'">
        <el-col :span="24" style="margin-top: 20px;">
          <el-radio-group v-model="formData.emergencyLevel" class="flex-space-between">
            <el-radio :label="level.value" v-for="(level,i) in emergencyLevel" :key="'emergencyLevel' + i">
              {{ level.label }}
            </el-radio>
          </el-radio-group>
        </el-col>
        <el-col :span="24" style="margin-top: 20px; display: flex; align-items: center;justify-content: space-between;">
          <el-col :span="10">
            <el-date-picker
              v-model="formData.timeStart"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
              placeholder="任务开始时间"
              style="width: 100%;">
            </el-date-picker>
          </el-col>
          <el-col :span="4" style="text-align: center;"><span>~</span></el-col>
          <el-col :span="10">
            <el-date-picker
              v-model="formData.timeEnd"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
              placeholder="任务结束时间"
              style="width: 100%;">
            </el-date-picker>
          </el-col>
        </el-col>
        <el-col :span="24" style="margin-top: 20px;">
          <UploadFile uploadText='添加附件'
                      :initFileList="formData.accessory"
                      :maxSize="1024*1024*20"
                      @changeUpload='changeUpload'
                      @onRemove="onRemove"
                      errorText='请上传正确的附件'/>
        </el-col>
      </div>
      <!-- 新增：目标管理场景表单控件 -- start -->
      <div v-else>
        <el-row style="margin-top: 20px; display: flex; align-items: center;">
          <el-col :span="16">
            <el-date-picker
              style="width: 98%;"
              size="small"
              v-model="formData.endDate"
              type="date"
              placeholder="设置截止日期">
            </el-date-picker>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formData.setData">设置时间</el-checkbox>
          </el-col>
          <el-col :span="2"></el-col>
          <el-col :span="4" style="text-align: right;">
            <el-button type="text" size="small" @click="conditionStatus = !conditionStatus">
              {{conditionStatus ? '收起更多条件' : '更多条件'}}
              <i :class="conditionStatus ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
            </el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-button type="text" size="small" @click="handleSetUpLoop">建立循环任务</el-button>
          </el-col>
        </el-row>
        <div v-if='conditionStatus'>
          <el-row style="display: flex; align-items: center;">
            <el-col :span="4">
              <el-button size="small">添加优化级</el-button>
            </el-col>
            <el-col :span="4">
              <el-checkbox v-model="formData.noteInform">增加短信通知</el-checkbox>
            </el-col>
          </el-row>
          <el-row style="margin-top: 10px">
            <el-col :span='24'>
              <UploadFile uploadText='添加附件'
                        :initFileList="formData.accessory"
                        :maxSize="1024*1024*20"
                        @changeUpload='changeUpload'
                        @onRemove="onRemove"
                        errorText='请上传正确的附件'/>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- end -->

      <!--   新增   -->
      <el-col :span="24" class="flex-space-between" :style="taskId ? 'margin-top: 30px;' : 'margin-top: 30px;justify-content: center;'" v-if="mode === 'add'">
        <el-button :loading="isBtnLoading" type="primary" @click="handleSubmit('submit')" :style="`padding: 10px 30px;${taskId && (isAdjustTime === 1 ||  isSubTasks === 1) ? 'width: 100%' : ''}`">{{ taskId ? '转派' : '发起任务' }}</el-button>
<!--        <el-button :loading="isBtnLoading" @click="handleExec" v-if="taskId" style="padding: 10px 30px;">执行</el-button>-->
        <!-- 已经调整了就不准继续调整, 或 存在子任务 隐藏 -->
        <el-button :loading="isBtnLoading" @click="handleRange" v-if="taskId && (isAdjustTime !== 1 && isSubTasks !== 1)" style="padding: 10px 30px;">执行</el-button>
      </el-col>
      <!--   编辑   -->
      <el-col :span="24" class="flex-space-around" style="margin-top: 20px;" v-if="mode === 'edit'">
        <el-button :loading="isBtnLoading" type="primary" @click="handleSubmit('edit')">完成编辑并提交</el-button>
      </el-col>
      <!--  添加执行人/添加关注人 dialog    -->
      <el-dialog  append-to-body
        :visible.sync='addDialog'
        :close-on-click-modal="false">
        <div slot="title" class="dialog-header-row">
          <div class="dialog-tip"></div>
          <span class="el-dialog__title">{{ addType === 'zxr' ? '添加执行人' : '添加关注人' }}</span>
        </div>
        <selectPeople v-if="addDialog"
          :addType="addType"
          :executeList="formData.executeList"
          :attentionList="formData.attentionList"
          @selectUserSuccess="selectUserSuccess"
          @selectCancel="selectCancel"></selectPeople>
      </el-dialog>
      <!--  执行dialog    -->
      <el-dialog append-to-body
        width="40%"
        :before-close="handleClearTaskExecTime"
        :visible.sync='execTaskDialog'
        :close-on-click-modal="false">
        <div slot="title" class="dialog-header-row">
          <div class="dialog-tip"></div>
          <span class="el-dialog__title">执行完成时间</span>
        </div>
        <div class="flex-center" style="flex-direction: column">
          <el-date-picker
            v-model="taskExecTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="任务结束时间">
          </el-date-picker>
          <el-button type="primary" @click="handleExecTaskSubmit" style="margin-top: 30px;">提交</el-button>
        </div>
      </el-dialog>
      <!--  执行范围调整dialog    -->
      <el-dialog append-to-body
        width="40%"
        :before-close="handleClearRangeTime"
        :visible.sync='rangeDialog'
        :close-on-click-modal="false">
        <div slot="title" class="dialog-header-row">
          <div class="dialog-tip"></div>
          <span class="el-dialog__title">是否需要调整项目周期</span>
        </div>
        <div style="margin-top: 20px; display: flex; align-items: center;justify-content: space-between;">
          <el-date-picker
            v-model="rangeTimeStart"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="任务开始时间">
          </el-date-picker>
          <span>~</span>
          <el-date-picker
            v-model="rangeTimeEnd"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="任务结束时间">
          </el-date-picker>
        </div>
        <div class="flex-center" style="flex-direction: column">
          <el-button type="primary" @click="handleRangeTaskSubmit" style="margin-top: 30px;">提交</el-button>
        </div>
      </el-dialog>
      <!--  执行成功dialog    -->
      <el-dialog append-to-body
        width="30%"
        :before-close="handleExecTaskSubmitSuccessClose"
        :visible.sync='execTaskSuccessDialog'
        :close-on-click-modal="false">
        <div slot="title" class="dialog-header-row">
          <div class="dialog-tip"></div>
          <span class="el-dialog__title">执行成功</span>
        </div>
        <div class="flex-center" style="flex-direction: column">
          <span>项目周期已调整！</span>
          <el-button type="primary" @click="handleExecTaskSubmitSuccessClose" style="margin-top: 30px;">关闭</el-button>
        </div>
      </el-dialog>
    </el-row>
        <!-- 添加循坏任务 -->
        <el-dialog append-to-body
          width="541px"
          id="addNewTaskNew"
          :before-close="handleLoopTimeSlotVisibleClose"
          :visible.sync='LoopTimeSlotVisible'
          :close-on-click-modal="false"
          :show-close="false">
            <LoopTimeSlot ref="LoopTimeSlot" :timeForm="timeForm" :formRule='formRule'>
            <div slot="buttonBox" style="text-align:right;">
                <el-button style="width:96px;" size="small" @click="handleLoopTimeSlotVisibleClose">取消</el-button>
                <el-button style="width:96px;" size="small" type="primary" @click="timeRuleSubmit">确定</el-button>
            </div>
            </LoopTimeSlot>
        </el-dialog>
  </el-form>
</template>

<script>
import { emergencyLevel, taskType } from "@/const/dicData"
import UploadFile from "@/components/UploadFile/UploadFile"
import selectPeople from "@/views/myTodo/components/selectPeople"
import { addCalendarTask, addOrEditTask, manageTask, updateTaskEndTime } from "@/api/task"
import dayjs from 'dayjs'
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
import { mapActions, mapGetters } from "vuex";
import { sendMessage } from "@/xmpp/send-message";
import LoopTimeSlot from '@/components/LoopTimePicker/LoopTimeSlot'
export default {
  name: "addNewTask",
  props: {
    // 运用场景: target: 目标管理，。。。：其他
    scenePage: {
      type: String,
    },
    // 数据
    data: {
      type: Object
    },
    // 添加任务类型 [0: 普通， 1: 日历]
    addTaskType: {
      type: Number,
      default: 0
    },
    // [add: 新增，edit: 编辑]
    mode: {
      type: String,
      default: 'add'
    },
    taskId: {
      type: Number
    },
    // 工作周期 [start, end]
    rangeTime: {
      type: Array,
      default: () => []
    },
    // 0 未调整时间 1 已存在调整
    isAdjustTime: {
      type: Number,
      default: 0
    },
    // 0 不存在子任务  1 存在只任务
    isSubTasks: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
        LoopTimeSlotVisible: false,         // 新增：循环条件显隐
        conditionStatus: false,             // 新增：更多条件
        timeForm:{                          // 新增：循环表单
            loop: 1,
            endTime: '',
            allDay: false,
            forever: false,
            time1: '',
            time2: '',
        },
        formRule:{
            endTime:[ 
                { required: true, message: '请选择截止时间', trigger: 'change' }
            ],
            times:[
                {
                    required: true, 
                    trigger: 'change',
                    validator: (rule, value, callback) => {
                        console.log(this.timeForm)
                        if (!this.timeForm.addlDay && (!this.timeForm.time1 || !this.timeForm.time2)) {
                            callback(new Error('请选择时间'));
                        } else{
                            callback();
                        }
                    }
                }
            ],
        },
    formData: {
        name: '',
        content: '',
        taskType: 0,
        emergencyLevel: 0,
        // 自动填入 间隔 30 分钟
        timeStart: dayjs().format('YYYY-MM-DD HH:mm'),
        timeEnd: dayjs().add(30, 'minute').format('YYYY-MM-DD HH:mm'),
        executeList: [], // 添加执行人
        attentionList: [], // 添加关注人
        accessory: [],
        isAdjustTime: 0,
        circulationTask: '',      // 新增：循环任务功能
        endDate: '',              // 新增：截止日期
        setData: '',              // 新增：设置时间
        noteInform: '',           // 新增：短信通知
      },
      emergencyLevel: emergencyLevel,
      taskType: taskType,
      dialog: false,
      addDialog: false,
      addType: 'zxr', // [zxr, gzr]
      execTaskDialog: false,
      execTaskSuccessDialog: false,
      taskExecTime: '',
      isBtnLoading: false,
      rangeDialog: false, // 调整范围 dialog
      rangeTimeStart: '',
      rangeTimeEnd: ''
    }
  },
  components: {
    UploadFile,
    selectPeople,
    LoopTimeSlot
  },
  computed: {
    ...mapGetters({
      'IdFriendList': 'Im/Friends/IdFriendList', // 我的好友列表
    })
  },
  mounted() {
    this.initData()
  },
  methods: {
    // 建立循环任务
    handleSetUpLoop() {
        this.LoopTimeSlotVisible = true;
    },

    // 定时任务提交
    timeRuleSubmit(){
       this.$refs.LoopTimeSlot.$refs['loginForm'].validate((valid) => {
          if (valid) {
            alert('submit!');
          }
        });
    },

    // 关闭定时任务弹窗
    handleLoopTimeSlotVisibleClose(){
      this.$refs.LoopTimeSlot.$refs['loginForm'].resetFields();
      this.timeForm = {
        loop: 1,
        endTime: '',
        allDay: false,
        forever: false,
        time1: '',
        time2: '',
      }
      this.LoopTimeSlotVisible = false
    },
      
    ...mapActions({
      GetUserInfo: 'Common/User/GetUserInfo', // [GET] 获取用户信息
      PostAddFriend: 'Im/Friends/PostAddFriend', // [POST] 添加好友
    }),
    // 是否已经是好友关系
    IsFriend(id) {
      if (!id) return false
      // IdFriendList 是个对象，id 为 key
      return this.IdFriendList.hasOwnProperty(id)
    },
    // 初始化数据
    initData() {
      if (this.mode === 'edit') {
        this.formData = {
          ...this.formData,
          ...this.data
        }
      }
      // 日历新增类型，直接添加执行人
      // if (this.addTaskType === 1) {
      //   getUser().then(res => {
      //     if (res.data.code === 200) {
      //       this.formData.executeList.push({
      //         id: res.data.data.userId,
      //         username: res.data.data.username
      //       })
      //     }
      //   })
      // }
    },
    handleSubmit(type) {
      if (this.formData.executeList.length === 0) {
        this.$message.error('请添加执行人')
        return
      }
      if (!this.formData.name) {
        this.$message.error('请输入任务名称')
        return
      }
      if (!this.formData.content) {
        this.$message.error('请输入任务内容')
        return
      }
      if (!this.formData.timeStart || !this.formData.timeEnd) {
        this.$message.error('请输入任务时间')
        return
      }

      if (dayjs(this.formData.timeStart).isAfter(dayjs(this.formData.timeEnd))) {
        this.$message.error('任务时间范围错误')
        return
      }

      const timeStartSS = dayjs(this.formData.timeStart).unix()
      const timeEndSS = dayjs(this.formData.timeEnd).unix()
      // 小于半个小时
      if ((timeEndSS - timeStartSS) < 1800) {
        this.$message.error('任务时长最短为半个小时')
        return
      }
      this.isBtnLoading = true

      const data = {
        ...this.formData,
        type: this.addTaskType,
        accessory: JSON.stringify(this.formData.accessory),
        executeList: JSON.stringify(this.formData.executeList),
        attentionList: JSON.stringify(this.formData.attentionList)
      }
      console.log('data', data)
      const executeList = this.formData.executeList
      const attentionList = this.formData.attentionList

      // im任务发消息
      executeList.forEach(user => {
        this.handleToUserMessage(user, data)
      })

      const requestApi = this.addTaskType === 0 ? addOrEditTask : addCalendarTask
      // 是否有taskId
      if (this.taskId) {
        data.id = this.taskId
      }
      if (type === 'submit') {
        // 判断pid 如果有就是新增 子任务
        data.pid = this.taskId
      } else if (type === 'edit') {
        // 编辑 传 null
        data.pid = null
      }
      requestApi(data).then(res => {
        if (res.data.code === 200) {
          this.$message.success('添加成功')
          this.$emit('success')
        }
      }).finally(() => {
        this.isBtnLoading = false
      })
    },
    // 给某个人发消息 friend
    handleToUserMessage(user, task) {
      // 无法给自己发消息
      if (String(user.id) === String(this.MeId)) {
        // this.$message.info('无法给自己发送消息')
        return
      }
      // 已经是好友了,直接发消息
      if(this.IsFriend(user.id)) {
       this.handleAddTaskMessage(user, task)
        return
      }
      // 非好友要添加好友
      this.GetUserInfo({ userId: user.id }).then(rs => {
        if (rs.resultCode === 1) {
          if (rs.data.settings.allowAtt !== 0) {
            // 允许添加好友
            // 不需要验证,直接添加好友
            this.PostAddFriend({ toUserId: rs.data.userId }).then(rs => {
              if (rs.resultCode === 1) {
                const content = '你们已成为好友'
                const sendParams = {
                  msgType: this.$msgType.PASS,
                  content,
                  toId: user.id,
                  toName: user.username,
                  chatType: this.$chatType.ChatNumber
                }
                const msg = sendMessage(sendParams)
                if (msg) {
                  this.GetUserInfo({ userId: user.id }).then(rs => {
                    if (rs.resultCode === 1) {
                      this.$storage.ousinessPperations.addFriend({ message: msg, friend: rs.data.friends })
                      this.handleAddTaskMessage(user, task)
                      // console.log('添加成功')
                    }
                  })
                }
              }
            })
          } else {
            // 不允许添加好友
            this.$message.info('该用户不允许添加好友')
          }
        }
      })
    },
    // 发送任务消息
    handleAddTaskMessage(user, task) {
      const content = `我给你发起了任务:\n任务名称：${task.name}\n任务内容：${task.content}`
      const sendParams = {
        msgType: this.$msgType.TEXT,
        content,
        toId: user.id,
        toName: user.username,
        chatType: this.$chatType.ChatNumber
      }
      const msg = sendMessage(sendParams)
    },
    handleExec() {
      // 给默认执行时间
      this.taskExecTime = dayjs().format('YYYY-MM-DD HH:mm')
      this.execTaskDialog = true
    },
    handleExecTaskSubmit() {
      if (!this.taskExecTime) {
        this.$message.error('请输入执行时间')
        return
      }
      this.isBtnLoading = true
      const data = {
        taskId: this.taskId,
        manageTime: this.taskExecTime
      }
      manageTask(data).then(res => {
        if (res.data.code === 200) {
          // this.$message.success('执行成功')
          this.execTaskSuccessDialog = true
          // this.handleClearTaskExecTime()
        }
      }).finally(() => {
        this.isBtnLoading = false
      })
    },
    // 执行任务关闭清空
    handleClearTaskExecTime() {
      this.taskExecTime = ''
      this.execTaskDialog = false
    },
    // 范围dialog打开
    handleRange() {
      this.rangeTimeStart = this.rangeTime[0]
      this.rangeTimeEnd = this.rangeTime[1]
      this.rangeDialog = true
    },
    // 时间范围关闭清空
    handleClearRangeTime() {
      this.rangeTimeStart = ''
      this.rangeTimeEnd = ''
      this.rangeDialog = false
    },
    // 调整时间范围
    handleRangeTaskSubmit() {
      if (!this.rangeTimeStart || !this.rangeTimeEnd) {
        this.$message.error('请输入正确的时间范围')
      }
      // 原任务 结束时间
      const timeStartSSInit = dayjs(this.rangeTime[0]).unix()
      const timeEndSSInit = dayjs(this.rangeTime[1]).unix()
      // 调整后的时间
      const timeStartSS = dayjs(this.rangeTimeStart).unix()
      const timeEndSS = dayjs(this.rangeTimeEnd).unix()
      // 小于半个小时
      if ((timeEndSS - timeStartSS) < 1800) {
        this.$message.error('任务时长最短为半个小时')
        return
      }
      if (timeStartSS < timeStartSSInit) {
        this.$message.error('开始时间不能小于发起人创建任务的开始时间')
        return
      }
      // 现任务结束时间 小于 最开始任务的结束时间
      if (timeEndSS > timeEndSSInit) {
        this.$message.error('结束时间不能大于发起人创建任务的截止时间')
        return
      }

      const data = {
        taskId: this.taskId,
        startTime: this.rangeTimeStart,
        endTime: this.rangeTimeEnd
      }
      updateTaskEndTime(data).then(res => {
        if (res.data.code === 200) {
          this.handleClearRangeTime()
          this.execTaskSuccessDialog = true
        }
      })
    },
    handleExecTaskSubmitSuccessClose() {
      this.taskExecTime = ''
      this.execTaskDialog = false
      this.execTaskSuccessDialog = false
      this.$emit('success')
    },
    // 选择人回调
    selectUserSuccess(data) {
      if (data.type === 'zxr') {
        this.formData.executeList = data.lists
      } else if (data.type === 'gzr') {
        this.formData.attentionList = data.lists
      }
      this.addDialog = false
    },
    selectCancel() {
      this.addDialog = false
    },
    // 显示添加dialog
    handleShowAddDialog(type) {
      this.addType = type
      this.addDialog = true
    },
    // 文件上传成功回调
    changeUpload(data) {
      this.formData.accessory.push(data.res)
    },
    // 文件删除回调
    onRemove(file, fileList) {
      // 有 response 的
      let url = file.url
      if (file.response) {
        url = file.response.data.url
      }
      // 过滤 url
      this.formData.accessory = this.formData.accessory.filter(item => item.url !== url)
    },
    // 删除文件
    handleDelFile(index) {
      this.formData.accessory.splice(index, 1)
    },
    // 下载文件
    handleDownloadFile(url) {
      handleTransUrlAndDownLoadFile(url)
    }
  }
}
</script>

<style lang="scss">
.el-radio__inner {
  border-radius: 100%;
  width: 18px;
  height: 18px;
}
.el-radio__input.is-checked+.el-radio__label {
  color: #3471FF;
}
.is-checked {
  .el-radio__inner {
    border: none!important;
    background: url('../../../assets/img/icon/option.png') no-repeat!important;
    background-size: contain!important;
    &::after {
      width: 0;
      height: 0;
    }
  }
}

.addNewForm {
  .item_row {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    margin-top: 10px;
    position: relative;
    &:hover {
      .add-btn, .el-form-item__label {
        color: #3471FF;
      }
    }
    .add-btn {
      position: absolute;
      top: 10px;
      font-size: 20px;
    }
    .el-form-item__label {
      text-align: left;
      width: 120px !important;
      padding-left: 27px;
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
