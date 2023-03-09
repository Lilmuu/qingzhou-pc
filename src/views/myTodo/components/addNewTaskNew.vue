<template>
  <div>
    <el-form class="addNewForm" id="addNewForm" :model="formData" ref="ruleForm" size="small">
      <!-- 任务名称 -->
      <el-form-item class="add_taskName">
        <div>
          <img class="icon_img" src="@/assets/img/mytodo/new_task/newTask_taskName.png" alt="">
          <el-input v-model="formData.name"
            clearable
            maxlength="50"
            placeholder="输入任务/项目名称"></el-input>
        </div>
        <el-checkbox v-if="isShowTarget && scenePage != 'target'" v-model="formData.checked2" :disabled="pidDisabled">关联到上级任务/目标</el-checkbox>
      </el-form-item>
      <!-- 关联上级任务 -->
      <el-form-item class="superior_task" v-if="formData.checked2"> 
        <img class="icon_img" src="@/assets/img/mytodo/new_task/newTask_search.png" alt="">
        <el-input v-model="formData.queryTaskName"
          style="width:100%;"
          type="text"
          maxlength="50"
          :disabled="pidDisabled"
          @input="queryTaskNameTarget"
          placeholder="搜索上级任务目标"></el-input>
        <el-card class="box-card" v-show="formData.checked2 && isShowTaskNameTarget">
          <TaskTarget :queryString="formData.queryTaskName"
            :isUpdatePage="this.mode === 'edit' ? this.formData.isUpdatePage +'' : ''"
            :taskId="this.mode === 'edit' ? this.data.id : ''"
            :activePlane12="this.isSonTask"
            :clickRowId="liActive"
            @rowClickFunction="clickLi"
          ></TaskTarget>
        </el-card>
      </el-form-item>
      <!-- 任务内容 -->
      <el-form-item class="add_taskCont">
        <img class="icon_img" src="@/assets/img/mytodo/new_task/newTask_taskContent.png" alt="">
        <div class="add_taskCont_right">
          <div class="cont">
            <el-input v-model="formDataContent"
            ref="textarea"
            type="textarea"
            :autosize="{ minRows: 4 }"
            maxlength="3000"
            placeholder="添加任务内容"></el-input>
            <div class="up_file">
              <UploadFileNew uploadText='添加附件'
                ref="addUploadFileNew"
                :isSlotButton='true'
                :initFileList="accessoryList"
                :maxSize="1024*1024*20"
                @changeUpload='changeUpload'
                @onRemove="onRemove"
                :lineMode="false"
                :showFileLists="false"
                errorText='请上传正确的附件'
                >
                  <div slot="uploadButton" class="task_enclosure_cont">
                    <img src="@/assets/img/mytodo/new_task/icon_upload.png" alt="">
                    <span>添加附件</span>
                  </div>
                </UploadFileNew>
            </div>
          </div>
          <div class="file_list">
            <div @click="previewFile(item)" class="file_box_item" v-for="(item,index) in getAllAccessoryList" :key="index">
              <div>
                <fileIcon :fileUrl="item.fileUrl"></fileIcon>
                <span>{{item.fileName}}</span>
              </div>
              <img class="close_btn" src="@/assets/img/close.png" @click.stop="delFiles(item)">
            </div>
          </div>
        </div>
      </el-form-item>
      <!-- 添加执行人 -->
      <el-form-item class="add_execute_box">
        <img class="icon_img" src="@/assets/img/mytodo/new_task/newTask_execute.png" alt="">
        <div class="task-people-btn-box">
          <div class="task-people-box">
            <div class="add_people_execute" @click="handleShowAddDialog('zxr')">添加执行人</div>
            <div class="task-add-people" 
              v-for="(user, index) in formData.executeList" 
              :key="'executeList' + index"
              :class="{'people_many': index > 5}">
              {{ user.username || user.userName }}
              <img src="@/assets/img/close.png" @click.stop="delPeople('zxr',index)">
            </div>
          </div>
        </div>
      </el-form-item>
      <!-- 添加关注人 -->
      <el-form-item class="add_execute_box">
        <img class="icon_img" src="@/assets/img/mytodo/new_task/newTask_collect.png" alt="">
        <div class="task-people-btn-box">
          <div class="task-people-box">
            <div class="add_people_execute" @click="handleShowAddDialog('gzr')">添加关注人</div>
            <div class="task-add-people" 
              v-for="(user, index) in formData.attentionList" 
              :key="'attentionList' + index"
              :class="{'people_many': index > 5}">
              {{ user.username || user.userName }}
              <img src="@/assets/img/close.png" @click.stop="delPeople('gzr',index)">
            </div>
          </div>
        </div>
      </el-form-item>
      <!-- 设置时间 -->
      <el-form-item class="set_date_box">
        <img class="icon_img" src="@/assets/img/mytodo/new_task/newTask_date_002.png" alt="">
        <div class="task-date-box">
          <div :class="{'data_class': !formData.setTime, 'data_time_class': formData.setTime}">
            <div v-if="createLoopTask" class="data_time">
              <div class="date">
                <el-date-picker
                  v-model="formData.timeStart"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  placeholder="设置截止日期"
                  :picker-options="pickerOptions"
                  >
                </el-date-picker>
              </div>
              <div v-if="formData.setTime" class="time">
                <el-time-picker
                  placeholder="设置截止时间"
                  format="HH:mm"
                  v-model="formData.startTime">
                </el-time-picker>
              </div>
            </div>
            <div v-else class="loop_task" @click="LoopTimeSlotVisible = true">{{formData.cycleContent}}</div>
            <div v-if="createLoopTask" class="time_btn">
              <el-checkbox v-model="formData.setTime" >设置时间</el-checkbox>
            </div>
            <div class="task_type" @click="changeCreateLoopTask">
              <img v-show="createLoopTask" src="@/assets/img/mytodo/new_task/newtask_loop.png" alt="">
              <img v-show="!createLoopTask" src="@/assets/img/mytodo/new_task/newtask_single.png" alt="">
              <div>{{ createLoopTask ? '设置为循环任务':'设置为单次任务'}}</div>
            </div>
          </div>
          <div class="icon_up_down" @click="isMore = !isMore">
            <img v-show='!isMore' src="@/assets/img/mytodo/new_task/newTask_down.png" alt="">
            <img v-show='isMore' src="@/assets/img/mytodo/new_task/newTask_up.png" alt="">
          </div>
        </div>
      </el-form-item>
      <!-- 优先级 -->
      <el-form-item class="task_sort" v-if="isMore">
        <img class="icon_img" src="@/assets/img/mytodo/new_task/newTask_emergencyLevel.png" alt="">
        <div class="task_sort_cont">
          <el-select v-model="formData.emergencyLevel" placeholder="请选择" >
            <el-option v-for="item in emergencyLevel" :label="item.label" :value="item.value" :key="item.value"></el-option>
          </el-select>
          <el-checkbox v-model="formData.checked">短信通知</el-checkbox>
        </div>
      </el-form-item>
      <!--  添加执行人/添加关注人 dialog    -->
      <el-dialog  append-to-body
          :visible.sync='addDialog'
          custom-class="select_user_box"
          id="addNewTaskNew"
          :close-on-click-modal="false">
          <div slot="title" class="dialog-header-row">
            <!-- <div class="dialog-tip"></div> -->
            <span class="el-dialog__title">{{ addType === 'zxr' ? '添加执行人' : '添加关注人' }}</span>
          </div>
          <selectPeople v-if="addDialog"
            :addType="addType"
            :executeList="formData.executeList"
            :attentionList="formData.attentionList"
            :userArr="executeList"
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
      <!-- 添加循坏任务 -->
      <el-dialog append-to-body
        width="432px"
        id="add_loop_task"
        :before-close="handleLoopTimeSlotVisibleClose"
        :visible.sync='LoopTimeSlotVisible'
        :close-on-click-modal="false"
        :show-close="false">
        <div slot="title" class="dialog-header-row">
          <div style="position: relative;">
            <span class="el-dialog__title">循环任务</span>
          </div>
          <img @click="handleLoopTimeSlotVisibleClose" src="@/assets/img/close.png" alt="">
        </div>
        <LoopTimeSlot ref="LoopTimeSlot" v-if="LoopTimeSlotVisible" :timeForm="timeForm" :formRule='formRule' :flag='flag'>
          <div slot="buttonBox" style="text-align:right;">
            <el-button style="width:84px;height:32px;" size="small" @click="handleLoopTimeSlotVisibleClose">取消</el-button>
            <el-button style="width:84px;height:32px;" size="small" type="primary" @click="timeRuleSubmit">确定</el-button>
          </div>
        </LoopTimeSlot>
      </el-dialog>
    </el-form>
  
    <el-col :span="24" class="task_btn">
      <el-button v-if="mode === 'add'" :loading="isBtnLoading" type="primary" @click="handleSubmit('submit')" >{{ '发起任务' }}</el-button>
      <el-button v-if="mode === 'edit'" :loading="isBtnLoading" type="primary" @click="handleSubmit('edit')">完成编辑并提交</el-button>
    </el-col>
  </div>
</template>

<script>
import { emergencyLevelNew, taskType } from "@/const/dicData"
import UploadFileNew from "@/components/UploadFile/UploadFileNew"
import selectPeople from "@/views/myTodo/components/selectPeople"
import TaskTarget from "@/views/myTodo/components/TaskTarget"
import { addCalendarTask, addOrEditTask, manageTask, updateTaskEndTime, queryTarget } from "@/api/task"
import dayjs from 'dayjs'
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
import { textareaRange } from "@/utils"
import { mapActions, mapGetters } from "vuex";
import { sendMessage } from "@/xmpp/send-message";
import moreClose from '@/assets/img/task/more_close.png'
import moreOpen from '@/assets/img/task/more_open.png'
import LoopTimeSlot from '@/components/LoopTimePicker/LoopTimeSlot'
import { getIMUserInfo } from "@/api/user";

const monthDateList = []
for (let i = 1; i <= 31; i++) {
  monthDateList.push(i)
}
import { loopOptions,weekendsDateList,timeCheck} from '@/const/dicData'
export default {
  name: "addNewTask",
  props: {
    // 新增： 运用场景: target: 目标管理，。。。：其他
    scenePage: {
      type: String,
    },
    // 新增：目标id
    targetId: {
      default: null
    },
    // 数据
    data: {
      type: Object
    },
    userName: {
      type: String,
      default: 'hh'
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
      type: String,
       default: ""
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
    },
    isShowTarget: {
      type: Boolean,
      default: true
    },
    isSonTaskAdd: {
      type: Boolean,
      default: false
    },
    targetId: {
      type: String,
      default: ""
    },
    // 1、新增任务 2、编辑任务时重选父任务 、 3、建立子任务
    flag: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      monthDateList:monthDateList,
      loopOptions:loopOptions,
      timeCheck:timeCheck,
      weekendsDateList:weekendsDateList,
      moreClose,
      moreOpen,
      // 文件列表
      accessoryList:[],
      // 编辑的文件列表
      bringInAccessoryList:[],
      liActive: "",
      formData: {
        queryTaskName: "",
        name: '',
        content: '',
        taskType: 0,
        emergencyLevel: 0,
        timeStart: dayjs().add(30, 'minute').format('YYYY-MM-DD'),
        // 自动填入 间隔 30 分钟
        startTime: dayjs().add(30, 'minute'),
        setTime:false,
        timeEnd: dayjs().add(30, 'minute').format('YYYY-MM-DD'),
        executeList: [], // 添加执行人
        attentionList: [], // 添加关注人
        accessory: [],
        cycleRule:{},//循坏任务
        // isAdjustTime: 0,
        checked:false,
        checked2:false,
        checked2Disabled:false,
        isCycle:0,
        isSms:0,
        cycleContent:'',
        targetId: "",
        pidNode: "",
        isUpdatePage: 0
      },
      formDataContent: '',
      isMore:false,
      emergencyLevel: emergencyLevelNew,
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
      rangeTimeEnd: '',
      // 是否创建了循坏任务
      createLoopTask:true,
      LoopTimeSlotVisible:false,
      formRule:{
        endTime:[ { required: true,validator: (rule, value, callback) => {
          if (!this.timeForm.forever && !this.timeForm.endTime) {
            callback(new Error('请选择截止时间'));
          } else{
            callback();
          }
        }, trigger: 'change' }],
        times:[ { required: true, validator: (rule, value, callback) => {
          if (!this.timeForm.allDay && (!this.timeForm.time1 || !this.timeForm.time2)) {
            callback(new Error('请选择时间'));
          } else{
            callback();
          }
        }, trigger: 'change' }],
      },
      timeForm:{
        loop: 3, // 重复频率 1-自然日 2-工作日 3-每周 4-每月
        endTime: '', // 循环截止日期
        allDay: true, // 是否全天
        forever: false,
        time1: '',
        time2: '',
        weekendsIndex:[0],
        monthIndex:[]
      },
      // 传递给selectPeople的任务执行人
      executeList: [],
      // 目标下拉框配置
      targetOptions: [],
      // 上级任务下拉框配置
      taskListOptions: [],
      pickerOptions: {
          disabledDate: time => {
              return time.getTime() < new Date().getTime() - 24*60*60*1000;
          }
      },
      // 是否禁用上级任务
      pidDisabled: false,
      // 是否可清空目标
      showTargetIdClearable: true,
      // 是否可清空上级任务
      showPidClearable: true,
      taskTargetFlag: 0,
      isShowTaskNameTarget: false,
      isSonTask: '1'
    }
  },
  components: {
    UploadFileNew,
    selectPeople,
    LoopTimeSlot,
    TaskTarget
  },
  computed: {
    ...mapGetters({
      'IdFriendList': 'Im/Friends/IdFriendList' // 我的好友列表
    }),
    getAllAccessoryList(){
      return [...this.bringInAccessoryList,...this.accessoryList]
    },
    fileTyoe(){
      return (fileName, type)=>{
        let fileType = fileName.substr(fileName.lastIndexOf('.') + 1);
        return fileType == type
      }
    }
  },
  mounted() {

    queryTarget({quarterTarget: "", isUpdatePage: this.mode === 'edit' ? this.formData.isUpdatePage : '', id: this.mode === 'edit' ? this.data.id: ''}).then(res => {
      let year = new Date(res.headers.date).getFullYear()
      this.timeForm.endTime = `${year}-12-31`
      this.targetOptions = [];
      this.taskListOptions = [];
      if(res.data.data.targetList) {
        res.data.data.targetList.forEach(item => {
          let obj = {
            label: item.quarterTarget,
            value: item.id
          }
          this.targetOptions.push(obj)
        })
      }
      if(res.data.data.taskList) {
        res.data.data.taskList.forEach(item => {
          let obj = {
            label: item.name,
            value: item.id,
            content: item.content,
            accessory: item.accessory
          }
          this.taskListOptions.push(obj)
        })
      }
      this.initData();
    })
    

    console.log(this.data, 'data --- data')
    console.log(this.formData, 'formData --- formData')
    // flag
  },
  methods: {
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
      this.taskTargetFlag = 0
      this.pidDisabled = false;
      this.formData.checked2Disabled = false
      if (this.mode === 'edit') {
        this.formData.isUpdatePage = 1
        let arr = JSON.parse(this.data.executeList);
        this.executeList = arr;
        let arr2 = arr.filter(item=>item.username == this.userName)
        this.bringInAccessoryList = JSON.parse(this.data.accessory)


        this.formData = {
          ...this.formData,
          ...this.data,
          executeList: arr2,
          attentionList:JSON.parse(this.data.attentionList),
          setTime:this.data.taskType?true:false,
          startTime:dayjs(this.data.endTime),
          timeStart:dayjs(this.data.endTime).format('YYYY-MM-DD'),
          checked:this.data.isSms?true:false
        }
        this.formData.content = this.formDataContent = this.formData.content?this.formData.content.replace(/<br\/>/g,"\n"):this.formData.content
        console.log('edit - ---- 编辑', this.data)
        this.createLoopTask = this.data.isCycle ? false : true
        if(this.data.isCycle && this.formData.cycleRule){
          this.setCycleRuleVal('taskCycle')
          this.formData.cycleRule = this.formData.taskCycle
          this.formData.cycleRules = this.timeForm
          this.formData.cycleContent = this.changeTags(this.formData.cycleRules)
        }
        if(this.data.taskLevel > 1) {
          this.formData.checked2 = true
        }else {
          if(this.formData.targetId){
            this.formData.checked2 = true
          }else {
            this.formData.checked2 = false
          }
        }
        this.isSonTask = this.data.isSonTask
        if(this.data.isSonTask == '1') {
          this.formData.checked2 = true
          this.pidDisabled = true;
          this.formData.pidNode = this.data.pid
          this.formData.queryTaskName = this.data.ptaskName
          this.liActive = this.data.pid
        }else if(this.data.isSonTask == '2') {
          this.formData.queryTaskName = this.formData.quarterTarget
          this.liActive = this.formData.targetId
        }else if(this.data.isSonTask == '3') {
          this.formData.checked2 = true
          this.formData.pidNode = this.data.pid
          this.formData.queryTaskName = this.data.ptaskName
          this.liActive = this.data.pid
        } else {
          this.formData.queryTaskName = this.data.quarterTarget
        }
      } else if(this.mode === 'add'){
        this.formData.isUpdatePage = 0
        // 如果是新建子任务
        if(this.taskId) {
          // 赋值上级任务
          this.formData.pid = this.taskId
          this.formData.isSonTask = '1';
          this.isSonTask = '1'
          this.liActive = this.taskId
          this.taskListOptions.forEach(item => {
            if(item.value == this.taskId){
              this.formData.name = item.label
              this.formData.queryTaskName = item.label
              this.formData.content = this.formDataContent = item.content?item.content.replace(/<br\/>/g,"\n"):item.content
              this.bringInAccessoryList = JSON.parse(item.accessory)
            }
          })
          console.log('add - ---- 添加', this.data)
          this.createLoopTask = this.data.isCycle ? false : true
          if(this.data.isCycle && this.formData.cycleRule){
            this.setSonCycleRuleVal('taskCycle')
            this.formData.cycleRule = this.data.taskCycle
            this.formData.cycleRules = this.timeForm
            this.formData.cycleContent = this.changeTags(this.formData.cycleRules)
          }
          this.formData.pidNode = this.taskId
          // 如果有目标
          if(this.targetId) {
            // 赋值目标
            this.formData.targetId = this.targetId
            this.liActive = this.targetId
            // 不可清空目标(不回显×)
            this.showTargetIdClearable = false
          }
          // 勾选上级任务/目标复选框
          this.formData.checked2 = true
          this.formData.checked2Disabled = true
          // 禁用上级任务选择框
          this.pidDisabled = true;
        }else {
          this.formData.isSonTask = '0';
          this.isSonTask = '0'
        }
      }
      if (this.isSonTaskAdd) {
        const obj = JSON.parse(JSON.stringify(this.data))
        this.formData.timeStart = obj.endTime
        this.formData.startTime = obj.endTime
        this.formData.emergencyLevel = obj.emergencyLevel
        this.formData.setTime = obj.taskType === 1
      }
    },
    async handleSubmit(type) {
      this.formData.content = this.formDataContent
      let isPid = 0;
      if (this.formData.executeList.length === 0) {
        this.$message.error('请添加执行人')
        return
      }
      if (!this.formData.name) {
        this.$message.error('请输入任务名称')
        return
      }
      if (/^(?!(\s+$))/.test(this.formData.name) == false) {
        this.$message.error('任务名称不能为空白')
        return
      }
      if(this.formData.checked2) {
        if(!this.formData.targetId && !this.formData.pidNode) {
          this.$message.error('请选择上级任务/目标')
          return
        }
        if(this.formData.pidNode) {
          isPid = 1;
        }
      }
      if(this.createLoopTask) {
        if (!this.formData.timeStart) {
          this.$message.error('请选择任务截止日期')
          return
        }
        if(this.formData.setTime) {
          if(!this.formData.startTime) {
            this.$message.error('请选择任务截止时间')
            return
          }
          if((dayjs(this.formData.timeStart).format("YYYY-MM-DD") + ' ' + dayjs(this.formData.startTime).format("HH:mm")) < dayjs(new Date()).add(30, 'minute').format("YYYY-MM-DD HH:mm")) {
            this.$message.error('任务截止时间应该大于当前时间30分钟及以上')
            return
          }
        }
      }
      // 将换行符 换成<br/>标签存入 (保存格式)
      this.formData.content = this.formData.content ? this.formData.content.replace(/\n/g, '<br/>') : this.formData.content
      let tiemEnd = this.formData.timeStart
      if(this.formData.setTime){
        tiemEnd = dayjs(tiemEnd).format("YYYY-MM-DD") + ' ' + dayjs(this.formData.startTime).format("HH:mm")
      } else {
        tiemEnd = dayjs(this.formData.timeStart).format("YYYY-MM-DD")
      }
      const data = {
        ...this.formData,
        type: this.addTaskType,
        accessory: JSON.stringify([...this.bringInAccessoryList,...this.accessoryList]),
        executeList: JSON.stringify(this.formData.executeList),
        attentionList: JSON.stringify(this.formData.attentionList),
        timeEnd:tiemEnd,
        isCycle:this.createLoopTask ? 0 : 1,
        isSms:this.formData.checked?1:0,
        taskType:this.formData.setTime?1:0
      }
      const executeList = this.formData.executeList
      const attentionList = this.formData.attentionList
      delete data.type
      delete data.timeStart
      delete data.setTime
      delete data.startTime
      delete data.cycleRules
      delete data.taskCycle
      delete data.cycleContent
      
      // 新增普通任务 / 日历任务
      const requestApi = this.addTaskType === 0 ? addOrEditTask : addCalendarTask

      // 是否有taskId,如果有就是新增子任务
      if (this.taskId) {
        data.pid = this.taskId
      }

      // 是否创建循环任务
      if(!this.createLoopTask) {
        data.cycleRule.monthDay = data.cycleRule.monthDay?data.cycleRule.monthDay.toString():""
      }
      data.flag = this.flag;
      // 上级任务和目标选择判断
      if(this.formData.checked2) {
        if(!data.targetId) {
          data.targetId = null
        }
        if(!this.formData.pidNode) {
          if(this.mode != "edit") {
            data.pid = null
          }
          data.flag = 1
        }else {
          data.pid = this.formData.pidNode
        }
        if(!data.pid && !data.targetId) {
          this.$message.warning("请选择上级任务或者目标");
          return;
        }
      }else {
        data.targetId = null
        if(this.mode != "edit") {
          data.pid = null
        }
        data.flag = 1;
      }

      // 新增： 如果是目标管理添加目标id
      if(this.scenePage == 'target') {
        data.targetId = this.targetId;
      }
      // 新增：目标管理，关注人和执行人不能有同一人判断
      let repetitionStatus;
      this.formData.executeList.forEach(zItem => {
        this.formData.attentionList.forEach(gItem => {
          if(zItem.id == gItem.id) {
            repetitionStatus = true;
          }
        })
      });
      if(this.scenePage == 'target' && repetitionStatus) {
        this.$message.error('关注人和执行人有相同的人，请重新添加');
        this.isBtnLoading = false
        return false;
      }
      data.isPid = isPid;
      this.isBtnLoading = true
      // im任务发消息
      executeList.forEach(user => {
        this.handleToUserMessage(user, data)
      })
      requestApi(data).then(res => {
        if (res.data.code === 200) {
          if(type === 'edit'){
            this.$message.success('编辑成功')
          }else{
            this.$message.success('添加成功')
          }
          this.$emit('success')
        }
      }).finally(() => {
        this.isBtnLoading = false
      })
    },
    // 给某个人发消息 friend
    async handleToUserMessage(user, task) {
      let _this = this
      // 无法给自己发消息
      if (String(user.id) === String(this.MeId)) {
        return
      }
      let time
      let timeStamp
      // isCycle 1-循环任务 0-单次任务
      if(task.isCycle == 1){
        if(task.cycleRule.isPermanent == 1){
          let year = new Date().getFullYear()
          timeStamp = new Date(`${year}-12-31 23:59`).getTime()
        }else{
          time = `${task.cycleRule.endDate} ${task.cycleRule.endTime ? task.cycleRule.endTime : '23:59'}`
          timeStamp = new Date(time).getTime()
        }
      }else if(task.isCycle == 0){
        if(task.timeEnd.length > 10){
          time = task.timeEnd
        }else{
          time = task.timeEnd + ' 23:59'
        }
        timeStamp = new Date(time).getTime()
      }

      let newContent ={
        content: task.content,
        endTime: timeStamp,
        initiatorId: "258",
        msgType: 11,
        title: task.name,
        type: "NEWTASK",
      }

      return new Promise(function (resolve, reject){
        getIMUserInfo(user.id).then(response => {
          // 通过IM接口
          console.log(response,'response --')
          if (response.data.code === 0) {
            // 已经是好友了,直接发消息
            user.id = response.data.data
            let IMUserInfo = {
              id: user.id,
              jid: user.id,
              type: 'friend',
            }
            // 格式化文本信息
            let sendParams = _this.$utils.Primary.getSendParams(_this, 11, JSON.stringify(newContent), IMUserInfo)
            if(_this.IsFriend(response.data.data)){
              let newMessage = sendMessage(sendParams)
              newMessage.type = 1
              _this.$storage.lastChatList.setLastChat({ message: newMessage, chatType: newMessage.chatType })
              resolve()
              return
            }else{
              // 非好友要添加好友
              _this.PostAddFriend({ toUserId: user.id }).then(res => {
                console.log(res,'res --')
                if (res.resultCode === 1) {
                  const msg = sendMessage(sendParams)
                  if (msg) {
                    _this.GetUserInfo({ userId: user.id }).then(rs => {
                      console.log('jajja - GetUserInfo',rs)
                      if (rs.resultCode === 1) {
                        _this.$storage.ousinessPperations.addFriend({ message: msg, friend: rs.data.friends })
                        resolve()
                      }else{
                        reject('发送任务失败')
                      }
                    })
                  }else{
                    reject('发送任务失败')
                  }
                }else{
                  reject('发送任务失败')
                }
              })
            }
          }else{
            reject('发送任务失败')
          }
        })
        // reject('发送任务失败')
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
    // 删除执行人或者关注人
    delPeople(type,index){
      if (type === 'zxr') {
        this.formData.executeList.splice(index,1)
      } else if (type === 'gzr') {
        this.formData.attentionList.splice(index,1)
      }
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
    // 更改循环任务的显示
    changeCreateLoopTask(){
      // this.createLoopTask = !this.createLoopTask
      console.log('更改循环任务的显示 - ----', this.createLoopTask)
      if(this.createLoopTask){
          this.LoopTimeSlotVisible = true
      }else{
        if(this.$refs.LoopTimeSlot && this.$refs.LoopTimeSlot.$refs['loginForm']){
          this.$refs.LoopTimeSlot.$refs['loginForm'].resetFields();
        }
        this.createLoopTask = true
      }
    },
    // 更改循环任务的值
    changeLoopTaskVal(){
      this.LoopTimeSlotVisible = true
      this.setCycleRuleVal('cycleRule')
    },
    // 设置this.timeForm 循环任务的值
    setCycleRuleVal(valName){
      let monthIndex = 0,weekendsIndex = 0
      if(this.formData[valName].frequency==3){
        monthIndex = this.formData[valName].monthDay.split(",")
        monthIndex = monthIndex.map(Number)
      }
      if(this.formData[valName].frequency==2){
        weekendsIndex = this.formData[valName].monthDay.split(",")
        weekendsIndex = weekendsIndex.map(Number)
      }
      this.timeForm = {
        loop: this.formData[valName].frequency+1,
        endTime:  this.formData[valName].endDate,
        allDay:  this.formData[valName].isAllDay?true:false,
        forever: this.formData[valName].isPermanent?true:false,
        time1:  this.formData[valName].startTime,
        time2:  this.formData[valName].endTime,
        weekendsIndex:weekendsIndex,
        monthIndex:monthIndex
      }
    },
    // 设置子任务this.timeForm 循环任务的值
    setSonCycleRuleVal(valName){
      let monthIndex = 0,weekendsIndex = 0
      if(this.data[valName].frequency==3){
        monthIndex = this.data[valName].monthDay.split(",")
        monthIndex = monthIndex.map(Number)
      }
      if(this.data[valName].frequency==2){
        weekendsIndex = this.data[valName].monthDay.split(",")
        weekendsIndex = weekendsIndex.map(Number)
      }
      this.timeForm = {
        loop: this.data[valName].frequency+1,
        endTime:  this.data[valName].endDate,
        allDay:  this.data[valName].isAllDay?true:false,
        forever: this.data[valName].isPermanent?true:false,
        time1:  this.data[valName].startTime,
        time2:  this.data[valName].endTime,
        weekendsIndex:weekendsIndex,
        monthIndex:monthIndex
      }
    },
    // 关闭定时任务弹窗
    handleLoopTimeSlotVisibleClose(){
      if(this.formData.cycleContent == ''){
        this.timeForm = {
          loop: 3, // 重复频率 1-自然日 2-工作日 3-每周 4-每月
          endTime: '', // 循环截止日期
          allDay: true, // 是否全天
          forever: false,
          time1: '',
          time2: '',
          weekendsIndex: [0],
          monthIndex: []
        }
      }
      
      // this.$refs.LoopTimeSlot.$refs['loginForm'].resetFields();
      this.LoopTimeSlotVisible = false
    },
    // 定时任务提交
    timeRuleSubmit(){
       this.$refs.LoopTimeSlot.$refs['loginForm'].validate((valid) => {
          if (valid) {
            if(this.timeForm.time1 > this.timeForm.time2) {
              this.$message.warning("开始时间不能大于结束时间")
              return;
            }
            // 如果没有选择全天
            if(!this.timeForm.allDay) {
              if(this.timeForm.endTime == dayjs(new Date()).format('YYYY-MM-DD')) {
                if(this.timeForm.time1 < dayjs(new Date()).format('HH:mm')) {
                  this.$message.warning("开始时间不能小于当前日期")
                  return;
                }
              }
              let time2 = dayjs().format('YYYY-MM-DD') + " " + this.timeForm.time2
              let time1 = dayjs().format('YYYY-MM-DD') + " " + this.timeForm.time1
              if(new Date(time2).getTime() - new Date(time1).getTime() < 30*60*1000) {
                this.$message.warning("需要间隔30分钟")
                return;
              }
            }

            if(this.timeForm.loop == 4 ) {
               if(this.timeForm.monthIndex.length == 0) {
                this.$message.warning("请选择每月的天数")
                return;
              }
            }else if(this.timeForm.loop == 3) {
              if(this.timeForm.weekendsIndex.length == 0) {
                this.$message.warning("请选择每周的周期")
                return;
              }
            }
            this.formData.cycleContent = this.changeTags(this.timeForm)
            console.log('1111111- ----222')
            // this.createLoopTask = false;
            this.createLoopTask = false;

            this.formData.timeStart = this.timeForm.endTime
            this.formData.cycleRule = {
              isAllDay:this.timeForm.allDay?1:0,
              isPermanent:this.timeForm.forever?1:0,
              informWay:1,
             // monthDay:(this.timeForm.loop==4)?this.timeForm.monthIndex==0?32:this.timeForm.monthIndex==-1?0:this.timeForm.monthIndex:(this.timeForm.loop==3)?this.timeForm.weekendsIndex:dayjs(this.timeForm.endTime).format('DD'),
              monthDay: this.timeForm.loop == 4 ? this.timeForm.monthIndex.toString(): this.timeForm.loop == 3 ? this.timeForm.weekendsIndex.toString() : "",
              startTime:this.timeForm.time1,
              endTime:this.timeForm.time2,
              frequency:(this.timeForm.loop-1),
              endDate:this.timeForm.endTime
            }
            console.log('this.timeForm', this.timeForm)

            console.log('this.formData', this.formData)
            // this.handleLoopTimeSlotVisibleClose()
            this.LoopTimeSlotVisible = false
          }
        });
    },
    // 根据类型回显提醒内容
    changeTags(val) {
      let newObj = val,isForever = ''
      let timeLabel = ''
      const loopLabel = this.getTimeTypeLabel(this.loopOptions,newObj.loop)

      timeLabel += loopLabel
      if(newObj.loop === 4){
          let str = "" ;
          newObj.monthIndex.forEach(item => {
            if(item == 0) {
              str += "/第一个工作日"
            }else if(item == 32) {
              str += "/最后一个工作日"
            }else {
              str += "/" + item ;
            }
          })
          timeLabel += str;
      }
      if(newObj.loop === 3){
        let str = "" ;
        newObj.weekendsIndex.forEach(item => {
          str += this.weekendsDateList[item] + "-"
        })
        str.slice(0,str.length-1)
        timeLabel += '/'+ str;
      }
      timeLabel += ' '
      if(newObj.allDay){
        timeLabel += '全天'
      }else{
        timeLabel += newObj.time1 + "~" + newObj.time2
      }
      if(newObj.forever){
        isForever = isForever +',永久'
      }else{
        isForever = ","+newObj.endTime +'截止'
      }
      return timeLabel  + isForever
    },
    // 转换内容
    getTimeTypeLabel(list,val,props = {value:'value',label:'label'}){
      let timeLabelStr = ''
      list.forEach(item=>{
        if(item[props.value] === val){
          timeLabelStr = item[props.label]
        }
      })
      return timeLabelStr
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
    // 综合删除文件
    delFiles(item){
      if(item.type){
        this.accessoryList.forEach((items,index)=>{
          if(items==item){
            this.delFile(index)
          }
        })
        let fIndex = -1
        this.bringInAccessoryList.forEach((items,index)=>{
          if(items==item){
            fIndex = index
          }
        })
        if(fIndex>-1){
          this.bringInAccessoryList.splice(fIndex,1)
        }
      }else{
        // let fIndex = -1
        // this.bringInAccessoryList.forEach((items,index)=>{
        //   if(items==item){
        //     fIndex = index
        //   }
        // })
        // if(fIndex>-1){
        //   this.bringInAccessoryList.splice(fIndex,1)
        // }
      }
    },
    //预览文件
    previewFile(item){
      const url = item.fileUrl
      const name = item.name
      const imglist = ['png', 'jpg', 'JPG', 'jpeg', 'bmp', 'gif','docx','doc','pdf','xlsx'];
      if(imglist.find(item => item == name.split('.')[name.split('.').length - 1])) {
        localStorage.setItem('setPreviewUrl',JSON.stringify({url,name}))
        this.$electron.ipcRenderer.send('create-preview-window',{url,name})
      }else {
          this.$message.info("该文件不支持预览")
      }
    },
    // 删除文件
    delFile(index){
      this.accessoryList.splice(index,1)
      this.$refs.addUploadFileNew.delFile(index)
    },
    // 文件上传成功回调
    changeUpload(data) {
      this.accessoryList.push({
        ...data.res,
        type:'up'
      })
    },
    // 文件删除回调
    onRemove(file, fileList) {
      // 有 response 的
      let url = file.url
      if (file.response) {
        url = file.response.data.url
      }
      // 过滤 url
      this.accessoryList = this.accessoryList.filter(item => item.url !== url)
    },
    // 删除文件
    handleDelFile(index) {
      this.formData.accessory.splice(index, 1)
    },
    // 下载文件
    handleDownloadFile(url) {
      handleTransUrlAndDownLoadFile(url)
    },
    queryTaskNameTarget(queryString) {
      if(queryString.length > 0) {
        this.isShowTaskNameTarget = true
      }else {
        this.isShowTaskNameTarget = false
      }
    },
    clickLi({item, type}) {
      if(this.pidDisabled) {
        return
      }
      this.liActive = item.value
      this.formData.queryTaskName = item.label
      this.isShowTaskNameTarget = false
      if(type === 'task') {
        this.formData.targetId = null;
        this.formData.pidNode = item.value;
        this.formData.isSonTask = '3'
        this.isSonTask = '3'
        this.formData.content = this.formDataContent = item.content?item.content.replace(/<br\/>/g,"\n"):item.content
        this.formData.setTime = item.endTime
      }else {
        this.formData.pidNode = null;
        this.formData.targetId = item.value;
        this.formData.isSonTask = '2';
        this.isSonTask = '2'
        this.formData.content = this.formDataContent =''
        this.formData.setTime = item.endTime
      }
    },
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
// #addNewForm{
  // .el-upload-list{
    // padding-right: 110px;
  // }
// }
.addNewForm {
  padding-bottom: 10px;
  border-bottom: 1px solid #F2F2F2;
  .file_box{
    display: flex;
    flex-wrap: wrap;
    .file_box_item{
      cursor: pointer;
      margin-top: 12px;
      margin-bottom: 12px;
      margin-right: 12px;
      padding:0px 11px;
      height: 32px;
      background: #F6F6F6;
      opacity: 1;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      font-size: 13px;
      color: #3471FF;
      img{
        margin-left:16px;
        width: 14px;
        height:14px;
        cursor: pointer;
      }
    }
  }
  
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
  .el-upload{
    width:auto;
  }
  .upload-btn{
    border: 1px solid #DCDFE6;
    opacity: 1;
    border-radius: 25px;
    background: none;
    span{
      color:#868BA1;
    }
  }
  .upload-btn:hover{
    border: 1px solid #DCDFE6 !important;
    span{
      color:#3471FF;
    }
  }

  .queryTaskNameTarget {
    display: flex;
    border: 1px solid #DCDFE6;
    div {
      width: 50%;
     // padding-left: 20px;
      span {
        font-size: 16px;
        color: #222222;
        display: inline-block;
        width: 100%;
        padding: 10px 0 10px 10px;
        border-bottom: 1px solid #DCDFE6;
      }

      ul {
        padding: 0;
        margin: 0;
        list-style: none;
        max-height: 180px;
        overflow-y: auto;
        height: calc(100% - 39px);


        li {
          font-size: 16px;
          padding: 5px 0 5px 10px;
        }

        li:hover{
          background-color: #F4F5F8;;
        }
      }
      ul:first-of-type {
        border-right: 1px solid #DCDFE6;
      }
    }
  }
}
.liActive {
  border: 1px solid #f3ecec;
  color: #3471FF;
  background-color: #F4F5F8;
}

.createLoopTask{
  font-size: 14px;
  color: #3471FF;
  cursor: pointer;
}
.createLoopTaskBox{
  cursor: pointer;
  padding:8px;
  border: 1px solid #DCDFE6;
  opacity: 1;
  border-radius: 3px;
  margin-right:16px;
}
.isMore{
  // position: absolute;
  // bottom: 5px;
  // right: 0px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 14px;
  color: #3471FF;
  cursor: pointer;
  img{
    width:13px;
    height:13px;
  }
}

.task-add-people-btn{
    width: 250px;
    cursor: pointer;
    font-size: 14px;
    color: #222222;
    // margin-bottom:16px;
    line-height: 30px;
    img{
      margin-right:8px;
      width:18px;
      height:18px;
      vertical-align: middle;
    }
  }
  .task-add-people-btn:hover{
    color: #3471FF;
  }
.task-people-sum{
  min-width:110px;
  max-width:110px;
  text-align: right;
  line-height: 30px;
}
.el-message--success{
  top: 50vh!important;
}

</style>
