<template>
  <el-form class=" hideFormLabel" :model="formData" :rules="rules" ref="ruleForm">
    <el-row type="flex" style="flex-direction: column">
      <el-col :span="24" class="flex-align-center">
        <el-col :span="16">
          <div class="formsClass flex-align-center">
            <img class="formImg" src="@/assets/img/calendar/file1.png" alt="">
            <el-form-item label="" prop="taskTitle">
              <el-input v-model="formData.taskTitle"
                        clearable
                        size="small"
                        :maxlength="50"
                        placeholder="请输入汇报交流名称"></el-input>
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="6" :offset="2" style="display: flex;align-items: center;">
          <el-checkbox v-model="formData.checked">关联到上级任务/目标</el-checkbox>
        </el-col>
      </el-col>
      <el-col :span="24" style="margin-top: 20px;" v-if="formData.checked">
      <div class="formsClass flex-align-center">
        <img class="formImg" src="@/assets/img/calendar/search.png" alt="">
        <el-input v-model="formData.queryTaskName"
          style="width:100%;"
          type="text"
          maxlength="50"
          clearable
          size="small"
          @input="queryTaskNameTarget"
          placeholder="搜索上级任务/目标" />
      </div>
      </el-col>
      <!-- <el-col :span="24" style="margin-top: 20px;" v-show="formData.checked && isShowTaskNameTarget">
        <div class="queryTaskNameTarget">
          <div>
            <span>任务</span>
            <ul v-show="taskListOptions.length > 0 || targetOptions.length > 0">
              <li v-for="item in taskListOptions" :key="item.value" :class="{liActive:item.value == liActive}" @click="clickLi(item,'task')">{{item.label}}</li>
            </ul>
          </div>
          <div>
            <span>目标</span>
            <ul v-show="taskListOptions.length > 0 || targetOptions.length > 0">
              <li v-for="item in targetOptions" :key="item.value" :class="{liActive:item.value == liActive}" @click="clickLi(item,'target')">{{item.label}}</li>
            </ul>
          </div>
        </div>
      </el-col> -->
      <el-card class="box-card" v-show="formData.checked && isShowTaskNameTarget" style="z-index: 1000;position: absolute;top: 110px;width: 100%;">
        <TaskTarget :queryString="formData.queryTaskName"
          :isUpdatePage="''"
          :taskId="''"
          :activePlane12="'1'"
          :clickRowId="liActive"
          @rowClickFunction="clickLi"
        ></TaskTarget>
      </el-card>
      <el-col :span="24" style="margin-top: 20px;">
        <div class="formsClass">
          <img class="formImg" src="@/assets/img/calendar/file2.png" alt="" style="margin-top: 9px;">
          <el-form-item label="" prop="content">
            <el-input v-model="formData.content"
              type="textarea"
              :maxlength="500"
              show-word-limit
              size="small"
              :autosize="{ minRows: 5, maxRows: 6}"
              clearable placeholder="请输入汇报交流内容">
            </el-input>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="24" style="margin-top: 20px; display: flex; align-items: center;justify-content: space-between;">
        <el-col :span="10">
          <div class="formsClass flex-align-center">
            <img class="formImg" src="@/assets/img/calendar/icon_time1.png" alt="">
            <el-form-item label="" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                size="small"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm"
                placeholder="设置汇报开始时间"
                style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="4" style="text-align: center;"><span>~</span></el-col>
        <el-col :span="10">
          <el-form-item label="" prop="endTime">
            <el-date-picker
                    v-model="formData.endTime"
                    type="datetime"
                    size="small"
                    format="yyyy-MM-dd HH:mm"
                    value-format="yyyy-MM-dd HH:mm"
                    placeholder="设置汇报结束时间"
                    style="width: 100%;">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-col>
      <el-col :span="24" style="padding-top: 30px; display: flex; align-items: center; justify-content: flex-end;border-top: 1px solid #F2F2F2;margin-top: 30px;">
        <el-button size="small" type="primary" @click="handleSubmit" :loading="disableBtn">发起汇报交流申请</el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { addOrEditTaskCalendarReport } from "@/api/calendar";
import dayjs from "dayjs";
import { hasBlank, validateHasBlank } from "@/utils/validate";
import { queryTarget } from "@/api/task";
import TaskTarget from "@/views/myTodo/components/TaskTarget"

import E from 'wangeditor'
export default {
  name: "addDateTask",
  components: {
    TaskTarget
  },
  props: {
    // {id: '', realName: ''}
    activeUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editor: {},
      formData: {
        checked: false,
        "content": "",
        "endTime": "",
        "startTime": "",
        "targetId": '',
        "taskId": '',
        "taskTitle": "",
        "userId": 0,
        "userName": ""
      },
      taskListOptions: [],
      targetOptions: [],
      isShowTaskNameTarget: false,
      liActive: '',
      rules: {
        taskTitle: [
          { required: true, message: '请输入汇报交流名称', trigger: 'blur' },
          { validator: validateHasBlank, trigger: "blur" },
        ],
        content: [
          { required: true, message: '请输入汇报交流内容', trigger: 'blur' },
          { validator: validateHasBlank, trigger: "blur" },
        ],
        startTime: [
          { required: true, message: '请设置汇报开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请设置汇报结束时间', trigger: 'change' }
        ],
      },
      disableBtn:false
    }
  },
  mounted() {
    this.querySearch('', true)
    this.queryTask('', true)
  },
  methods: {
    // 目标查询
    querySearch(q, isInit = false) {
      if (!isInit && (!q || hasBlank(q))) {
        this.targetOptions = [];
        return
      }
      queryTarget({quarterTarget: q}).then(res => {
        this.targetOptions = [];
        let lists = []
        res.data.data.targetList.forEach(item => {
          lists.push({
            label: item.quarterTarget,
            value: item.id
          })
        })
        this.targetOptions = lists
      })
    },
    // 上级任务查询
    queryTask(q, isInit = false) {
      if (!isInit && (!q || hasBlank(q))) {
        this.taskListOptions = [];
        return
      }
      queryTarget({quarterTarget: q}).then(res => {
        this.taskListOptions = [];
        let lists = []
        res.data.data.taskList.forEach(item => {
          lists.push({
            label: item.name,
            value: item.id
          })
        })
        this.taskListOptions = lists
      })
    },
    clickLi({item, type}) {
      this.liActive = item.value
      this.formData.queryTaskName = item.label
      this.isShowTaskNameTarget = false
      if (type === 'task') {
        this.formData.targetId = null;
        this.formData.taskId = item.value;
      } else {
        this.formData.taskId = null;
        this.formData.targetId = item.value;
      }
    },
    queryTaskNameTarget(queryString) {
      if(queryString.length > 0) {
        this.isShowTaskNameTarget = true
      }else {
        this.isShowTaskNameTarget = false
      }
      return
      const query = {
        quarterTarget: queryString,
      }
      queryTarget(query).then(res => {
        this.taskListOptions = [];
        this.targetOptions = [];
        if (res.data.data.targetList) {
          res.data.data.targetList.forEach(item => {
            let obj = {
              label: item.quarterTarget,
              value: item.id
            }
            this.targetOptions.push(obj)
          })
        }
        if (res.data.data.taskList) {
          res.data.data.taskList.forEach(item => {
            let obj = {
              label: item.name,
              value: item.id,
              content: item.content
            }
            this.taskListOptions.push(obj)
          })
        }
      })
    },
    handleSubmit() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          const data = this.formData
          //  审核人id
          data.userId = this.activeUser.id
          data.userName = this.activeUser.realName
          // 点了没选的
          if (this.formData.checked && (!this.formData.taskId && !this.formData.targetId)) {
            this.$message.error('请选择支持季度目标或任务名称')
            return;
          }
          // 去掉没选择的
          if(this.formData.checked) {
            if(data.hasOwnProperty('taskId') && !data.taskId) {
              delete data.taskId
            }
            if(data.hasOwnProperty('targetId') && !data.targetId) {
              delete data.targetId
            }
          }
          // 没有关联任务, 去掉关联数据
          if (!this.formData.checked) {
            if (data.hasOwnProperty('targetId')) {
              delete data.targetId
            }
            if (data.hasOwnProperty('taskId')) {
              delete data.taskId
            }
          }

          // 原任务 结束时间
          const currentTimeSSInit = dayjs(Date.now()).unix()
          const timeStartSSInit = dayjs(data.startTime).unix()
          const timeEndSSInit = dayjs(data.endTime).unix()
          if (timeEndSSInit < currentTimeSSInit) {
            this.$message.error('汇报结束时间不能小于当期时间')
            return
          }
          if (timeStartSSInit > timeEndSSInit) {
            this.$message.error('汇报开始时间不能大于汇报结束时间')
            return
          }
          // 小于半个小时
          if ((timeEndSSInit - timeStartSSInit) < 1800) {
            this.$message.error('时长最短为半个小时')
            return
          }
          this.disableBtn = true
          addOrEditTaskCalendarReport(data).then(res => {
            if (res.data.code === 200) {
              this.$message.success('发起汇报成功')
              this.$emit('success')
              this.disableBtn = false
            }
          })
        }
      })
    },
  }
}
</script>

<style lang="scss">
</style>
