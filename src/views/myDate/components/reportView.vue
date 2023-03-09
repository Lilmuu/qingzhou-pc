<template>
  <div style="display: flex;flex-flow: column;flex: 1;">
    <div class="reportView">
      <ParentTaskDialog class="ParentTaskDialogView" ref="parentTaskDialog" />
      <el-scrollbar class="reportViewScrollView default-el-scrollbar">
        <img src="@/assets/img/calendar/file2.png" alt="" style="width: 16px;height: 16px;margin: 21px 24px 0 0;">
        <div style="width: 100%;overflow: hidden;">
          <!-- taskId 关联父级任务 -->
          <template v-if="formData.taskId">
            <div class="parentTitle linkTitle cursor" @click="openParentTaskDialog(taskData.id)">父级任务：{{ taskData.name }}</div>
          </template>
          <!-- targetId 关联季度目标 -->
          <template v-if="formData.targetId">
            <div class="parentTitle linkTitle">季度目标：{{ targetData.targetName }}</div>
          </template>
          <!-- 汇报交流详情  -->
          <div class="reportContent">
            <div class="parentInnerTitle">{{ formData.taskTitle }}</div>
            <div v-html="formData.content"><!-- {{ formData.content }} --></div>
          </div>
          <div class="reportItemRow">
            <!-- 汇报 -->
            <div class="reportItem">
              <img :src="report_t">
              <span :title="timeRangeStr" class="ellipsis">{{ timeRangeStr }}</span>
            </div>
            <div class="reportItem">
              <img :src="report_w">
              <span :title="formData.initiator" class="ellipsis">{{ formData.initiator }}汇报交流</span>
            </div>
          </div>
          <!-- 发起人已关闭  -->
          <div class="reportItemRow"
              style="min-width: 80px; text-align: center; margin-top: 0;"
              v-if="row.close && String(this.userId) === String(this.formData.initiatorId)">
            <div class="note-row">
              <span>已关闭</span>
            </div>
          </div>
          <div class="reportItemRow" v-else>
            <!-- 回显 -->
              <div class="note-row-remind cursor" style="width: 50%;" v-loading="isLoading" @click="handleNoteSettingDialog" v-if="formatTimerStr" >
                <i class="el-icon-message-solid"></i>
                <span class="ellipsis" :title="formatTimerStr">{{ formatTimerStr }}</span>
              </div>
            <div class="note-row-remind flex-center cursor"
                v-loading="isLoading"
                @click="handleNoteSettingDialog"
                style="display: flex;margin-top: 0;"
                v-else-if="!isOtherTask">
              <i class="el-icon-message-solid"></i>
              <span>添加提醒</span>
            </div>
          </div>
        </div>

      </el-scrollbar>
    </div>
    <div class="flex-end-center reportFooter" v-show="showActionBtn">
      <el-button class="el-button--normal-size customBtnClass" @click="handlePass(false)">驳回申请</el-button>
      <el-button type="primary" style="margin-left: 34px;" class="el-button--normal-size" @click="handlePass(true)">通过申请</el-button>
    </div>
    <div class="flex-end-center reportFooter" v-show="showCloseBtn">
      <el-button type="primary" class="el-button--normal-size" @click="handleClose">关闭</el-button>
    </div>

    <!-- 汇报 新建时间提醒 -->
    <remind ref="reportRemind"
            @change="changeValTags"
            :styles="style"
            :endTime="endTime"
            :isDate="isDate"
            isPersonRemind />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { addTaskRemind, auditReport, getRemindInfoByType, getReportDetail, } from "@/api/calendar";
import { getTaskDetails } from "@/api/task";
import remind from "@/components/drawerDetail/remind";
import { loopOptions, timeCheck, weekendsDateList } from "@/const/dicData";
import { formatRangeTime } from "@/views/myDate/components/utils";
import ParentTaskDialog from "@/components/drawerDetail/ParentTaskDialog";

const report_t = require('@/assets/img/calendar/icon_time1.png')
const report_w = require('@/assets/img/calendar/report-w.png')
const report_p = require('@/assets/img/calendar/report-p.png')
const reportNoteTime = require('@/assets/img/calendar/report-noteTime.png')

const monthDateList = []
for (let i = 1; i <= 31; i++) {
  monthDateList.push(i)
}
const queryArr = ['taskCalendarReport','meeting', 'businessTrip']

export default {
  name: "reportView",
  props: {
    // state  审核状态 0 待审批 1 通过 2 驳回
    row: {
      type: Object,
      required: true
    },
    // [日程]是否为他人的任务
    isOtherTask: {
      type: Boolean,
      default: false,
    },
    // [日程]
    isDate: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      report_t: report_t,
      report_w: report_w,
      report_p: report_p,
      reportNoteTime: reportNoteTime,
      personNoteForm: {
        content:'',
        isRemind: 0,
        startTime: '',
        endTime: '',
        remindRules:[
          // {
          //   remindType:0,
          //   frequency:'',
          //   weekDay: '' ,
          //   day: '',
          //   endDate: '2021-17-12',
          //   remindDate: '',
          //   remind_method: '',
          //   remindTime: '23:45',
          //   timeType: 0
          // }
        ]
      },
      formData: {
        // content: "",
        // createTime: "",
        // delFlag: 0,
        // endTime: "",
        // id: 0,
        // initiator: "",
        // initiatorId: 0,
        // startTime: "",
        // state: 0,
        // taskId: 0,
        // taskId 和 targetId只存在一个或者没有
        // targetId: 0
        // taskName: "一个亿的四分之一"
        // taskName: "",
        // taskTitle: "",
        // tenantId: 0,
        // updateTime: "",
        // userId: 0,
        // userName: "",
      },
      // 关联任务信息
      taskData: {
        name: '',
      },
      // 关联季度信息
      targetData: {
        targetName: '',
      },
      // 时间
      formatTimerStr: '',
      style: {},
      startTime: '',
      endTime: '',
      rowData: {
        acrossList: []
      },
      timeCheck: timeCheck,
      loopOptions: loopOptions,
      monthDateList: monthDateList,
      weekendsDateList: weekendsDateList,
      remarks: '',
      isLoading: false,
    }
  },
  components: {
    remind,
    ParentTaskDialog,
  },
  mounted() {
    this.handleGetReportDetail()
  },
  computed: {
    ...mapState({
      userId: state => state.user.userId
    }),
    // 通过操作隐显
    showActionBtn() {
      // 审核人操作
      return !this.isOtherTask && String(this.userId) !== String(this.formData.initiatorId) && this.formData.state === 0
    },
    showCloseBtn () {
      // 为发起人且状态为审核通过
      return !this.isOtherTask && String(this.userId) === String(this.formData.initiatorId) && this.formData.state === 1
    },
    timeRangeStr() {
      return `${formatRangeTime(this.formData.startTime, this.formData.endTime)}`
    }
  },
  methods: {
    // 获取汇报交流详情
    handleGetReportDetail() {
      if (!this.row || !this.row.id) return
      const query = {
        reportId: this.row.id
      }
      getReportDetail(query).then(res => {
        if (res.data.code === 200) {
          // 关联父级任务
          if (res.data.data.taskId) {
            this.handleGetTaskDetail(res.data.data.taskId)
          }
          if (res.data.data.targetId) {
            // 关联季度目标
            this.targetData = {
              targetName: res.data.data.targetName
            }
          }
          this.formData = res.data.data
          // 以截止时间为结束时间
          this.startTime = res.data.data.startTime
          this.endTime = res.data.data.endTime
          this.handleGetNoteTimer()
        }
      })
    },
    handleGetTaskDetail(taskId) {
      getTaskDetails({ taskId }).then(res => {
        if (res.data.code === 200) {
          this.taskData = res.data.data
        }
      })
    },
    handlePass(isPass) {
      if (this.formData.state === 1) {
        this.$message.info('当前状态为已通过，无法再次操作')
        return
      }
      if (this.formData.state === 2) {
        this.$message.info('当前状态为已驳回，无法再次操作')
        return
      }
      const text = isPass ? '通过申请' : '驳回申请'
      let reject = `<textarea class="reject_remarks" name="" id="" cols="30" rows="10" placeholder="请输入备注说明"></textarea>`
      let agree = `<div class="innerTips1"></div>`
      this.$msgbox({
        title: '提示',
        message: `
        <div class="msgBoxInner">
          <div class="innerHeader">
            <span class="innerTitle">您确定${text}吗？</span>
          </div>
          ${isPass ? agree : reject}
        </div>
        `,
        // <input type="text" placeholder="请输入备注说明">
        //  <div class="innerTip">点击确定将${text}，请继续</div>
        dangerouslyUseHTMLString: true,
        customClass: 'customMsgBox hideMsgHeader customMsgBox3',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: `rightTangleBtn confirmButton ${ isPass ? '' : 'red_del_btn'}`,
        cancelButtonText: '取消',
        cancelButtonClass: 'rightTangleBtn cancelButton',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            if(isPass) {
              const data = {
                "id": this.row.id,
                "state": 1,
              }
              auditReport(data)
                .then(res => {
                  if (res.data.code === 200) {
                    this.$message.success('已通过')
                    this.$emit('success')
                    instance.confirmButtonLoading = false
                    done()
                  }
                })
                .finally(() => {
                  instance.confirmButtonLoading = false
                  done()
                })
            } else {
              let remark = document.querySelector(".reject_remarks").value
              const data = {
                "id": this.row.id,
                "state": 2,
                "remarks": remark,
              }
              console.log(data,'data --- data')
              auditReport(data)
                .then(res => {
                  if (res.data.code === 200) {
                    remark = ""
                    this.$message.success('已驳回')
                    this.$emit('success')
                    instance.confirmButtonLoading = false
                    done()
                  }
                })
                .finally(() => {
                  remark = ""
                  instance.confirmButtonLoading = false
                  done()
                })
            }
          } else {
            done()
          }
        }
      }).then(action => {
      }).catch(e => {
      })
    },
    // 获取提醒时间数据
    handleGetNoteTimer() {
      if (!this.row || !this.row.id) return

      this.isLoading = true
      const query = {
        type: 0,
        relationId: this.row.id
      }
      getRemindInfoByType(query).then(res => {
        if (res.data.code === 0) {
          if (!res.data.data) {
            console.log(this.row)
            this.rowData = { ...this.row, ...this.rowData }
            this.personNoteForm = {
              content: this.formData.taskTitle,
              isRemind: 0,
              startTime:  this.formData.startTime,
              endTime: this.formData.endTime,
              remindRules: [],
              acrossList: [],
            }
            console.log('this.rowData', this.rowData)
            return
          }
          this.personNoteForm = res.data.data
          const { remindRules = [] } = res.data.data
          let rules = []
          // 提醒时间回显
          remindRules.forEach(item => {
            /////////////////// task one   ///////////////////
            // {
            //   createTime: "2021-07-13 23:36:05"
            //   cycleType: 1
            //   delFlag: 0
            //   endDate: "2021-07-14"
            //   endTime: "21:31"
            //   frequency: 0
            //   id: 443
            //   isAllDay: 0
            //   isPermanent: 0
            //   monthDay: "14"
            //   startTime: "21:31"
            //   taskId: 1106
            //   tenantId: 39
            //   timeType: 5
            //   updateTime: "2021-07-13 23:36:05"
            // }
            /////////////////// task more ///////////////////
            // let formatData = {
            //   createTime: "2021-07-13 23:36:05"
            //   cycleType: 1
            //   delFlag: 0
            //   endDate: "2021-07-30"
            //   endTime: "23:09"
            //   frequency: 3
            //   id: 444
            //   isAllDay: 0
            //   isPermanent: 1
            //   monthDay: "-1,0,1,10,2,3,31,31,4,5,6,7,8,9"
            //   startTime: "23:09"
            //   taskId: 1106
            //   tenantId: 39
            //   timeType: 6
            //   updateTime: "2021-07-13 23:36:05"
            // }
            ///////////////////  remindRules  //////////////////////
            // {
            //   createTime: "2021-07-14 00:17"
            //   delFlag: "0"
            //   endDate: "2021-07-15"
            //   frequency: 2
            //   id: 106
            //   isUsed: 1
            //   monthDay: "0,1,2,3"
            //   personalReminderId: 79
            //   remindDate: "2021-07-15"
            //   remindTime: "00:17"
            //   remindType: 1
            //   timeType: 0
            //   updateTime: "2021-07-14 00:17"
            //   weekDay: "0,1,2,3"
            // }
            let formatData = {}
            // 循环                             永久循环
            if (item.remindType === 1 || item.remindType === 2) {
              formatData = {
                isPermanent: item.remindType === 2 ? 1 : 0,
                timeType: 6,
                startTime: item.remindTime,
                endTime: item.remindTime,
              }
              // 周
              if (item.frequency === 2) {
                formatData.monthDay = item.weekDay
              } else if (item.frequency === 2) {
                // 月
                formatData.monthDay = item.monthDay
              }
            }
            // 单次
            if (item.remindType === 0 && item.timeType === 0) {
              formatData = {
                timeType: 5,
                startTime: item.remindTime,
                endTime: item.remindTime,
              }
            } else {
              //
            }
            rules.push({
              ...item,
              ...formatData,
            })
          })
          this.rowData = { ...res.data.data, ...this.rowData, acrossList: rules }
          console.log('init this.rowData', this.rowData)
          this.changeTags(rules)
        }
      })
          .finally(() => {
            this.isLoading = false
          })
    },

    // 重新刷新获取
    handleRefreshDetail() {
      Object.assign(this.$data, this.$options.data())
      this.handleGetReportDetail()
    },

    ///////////  提醒模块 start  //////////
    handleNoteSettingDialog(e) {
      if(this.isLoading || !this.endTime || this.isOtherTask) return

      const touchX = e.clientX // 按压位置X
      const touchY = e.clientY // 按压位置Y
      const winW = document.body.clientWidth // 屏幕宽
      const winH = document.body.clientWidth // 屏幕高
      let translateX = touchX > winW / 2 ? '-100%' : 0 // X偏移
      let translateY = touchY > 300 ? '-50%' : '-20%' // Y偏移
      let top = touchY > 300 ? '50%' : `${touchY}px`

      // 定位样式
      const style = {
        top: `${top}`,
        right:'120px',
        transform: `translateY(${translateY})`
      }
      console.log('this.rowData', this.rowData)
      this.style = style
      this.$refs.reportRemind.init(this.rowData)
    },
    changeValTags(val) {
      this.rowData.acrossList = val
      // 直接添加标题
      this.personNoteForm.content = this.formData.taskTitle
      this.personNoteForm.remindRules = val
      this.personNoteForm.isRemind = val.length === 0 ? 0 : 1
      this.changeTags(val)
      this.handleSubmit()
    },
    changeTags(val) {
      console.log('val---', val)
      if(!val || val.length === 0) {
        this.personNoteForm.remindRules = []
        this.formatTimerStr = ''
        return
      }

      let newObj = val[0], lengthStr = '', isForever = ''
      if (val.length > 1) {
        lengthStr = '等' + (val.length) + '个'
      }
      let timeLabel = ''
      if (newObj.timeType === 5) {
        timeLabel = newObj.endDate + ' ' + newObj.startTime
      } else if (newObj.timeType === 6) {
        const loopLabel = this.getTimeTypeLabel(this.loopOptions, (newObj.frequency + 1))
        timeLabel += loopLabel
        if ((newObj.frequency + 1) === 4) {
          let monthDayList = newObj.monthDay.split(",")
          monthDayList.sort((a, b) => {
            return a - b
          })
          let newData = JSON.parse(JSON.stringify(monthDayList))
          if (newData.includes('0') || newData.includes(0)) {
            timeLabel += '第一个工作日' + "/"
            newData.splice(0, 1)
          }
          if (newData.includes('32') || newData.includes(32)) {
            timeLabel += '最后一个工作日' + "/"
            newData.splice(newData.length - 1 ,1)
          }
          if (newData.length !== 0) {
            timeLabel += newData.toString() + '日' + "/"
          }
        }
        if ((newObj.frequency + 1) === 3) {
          let monthDayList = newObj.monthDay.split(",")
          monthDayList.forEach((item, index) => {
            if (index > 0) {
              timeLabel += '/'
            }
            timeLabel += this.weekendsDateList[item]
          })
        }
        if (newObj.isPermanent) {
          isForever = isForever + '/永久有效'
        } else {
          if ((newObj.frequency + 1) === 4 || (newObj.frequency + 1) === 3) {
            isForever = isForever + '/' + newObj.endDate + '截止'
          } else {
            timeLabel += newObj.endDate + ' '
          }
        }
        timeLabel += newObj.startTime
      } else {
        timeLabel = this.getTimeTypeLabel(this.timeCheck, newObj.timeType, { value: 'timeType', label: 'content' })
      }
      this.formatTimerStr = timeLabel + isForever + lengthStr + "提醒"
    },
    openParentTaskDialog(id) {
      this.$refs.parentTaskDialog.init(id)
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
    //////////    提醒模块 end    ////////

    // 个人提醒 添加、修改提交
    handleSubmit() {
      if (!this.personNoteForm.content) {
        this.$message.error('请输入提醒内容')
        return
      }
      // 编辑
      const data = {
        ...this.personNoteForm,
        startTime: this.startTime,
        endTime: this.endTime,
      }
      data.remindRules.forEach(item => {
        // 不是提前的 把 timeType 转为0
        if (item.timeType > 2) {
          item.timeType = 0
          item.remindTime = item.startTime
          item.remindDate = item.endDate
          // 永久循环
          if (item.remindType === 2) {
            // 删除 endDate
            delete item.endDate
          }
        }
        // 选择循环，周，转换字段
        if (item.frequency === 2) {
          item.weekDay = item.monthDay
        }
      })

      /**
       * 关联类型
       * relationId {String}    外键 根据类型不一样 代表的意义不一样
       * type       {Number}    0代表汇报交流
       * */
      data.relationId = this.row.id
      data.type = 0
      console.log('submit data', data, this.personNoteForm.remindRules)

      const action = this.personNoteForm.id ? 'update' : 'add'
      const requestApi = addTaskRemind
      const actionText = action === 'update' ? '修改' : '新建'

      requestApi(data).then(res => {
        if (res.data.code === 200) {
          this.$message.success(`${ actionText }提醒成功`)
          this.handleRefreshDetail()
        }
      })
    },
    // 关闭
    handleClose() {
      this.$emit('closeRemind')
    }
  }
}
</script>

<style lang="scss" scoped>
.reportView {
  margin-top: 10px;
  position: relative;
  flex: 1;
  .ParentTaskDialogView {
    ::v-deep .el-dialog__wrapper {
      width: 100%;
      position: absolute;
      .el-dialog {
        width: 80% !important;
        display: flex;
        flex-direction: column;
        margin: 0 !important;
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%,-50%);
        .el-dialog__body{
          flex:1;
          overflow: auto;
        }
      }
    }
  }

  .reportViewScrollView {
    height: 100%;

    .parentTitle {
      margin-top: 10px;
      font-size: 14px;
      line-height: 28px;
      word-break: break-all;
    }
    .parentInnerTitle {
      font-size: 16px;
      line-height: 28px;
      word-break: break-all;
    }

    .reportContent {
      background: #FBFBFC;
      padding: 13px 20px 15px 20px;
      font-size: 14px;
      line-height: 22px;
      word-break: break-all;
      color: #333;
      border-radius: 6px;
      font-family: PingFang SC-Regular, PingFang SC;
    }
  }

  .reportItemRow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 16px;
    justify-content: space-between;

    .reportItem {
      max-width: calc(50% - 20px);
      height: 32px;
      background: #FBFBFC;
      opacity: 1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      padding-right: 15px;
      font-size: 14px;
      color: #37476B;
      margin-bottom: 10px;
      font-family: PingFang SC-Regular, PingFang SC;

      &:nth-child(2n + 1) {
        margin-right: 30px;
      }

      img {
        width: 14px;
        height: 14px;
        margin-right: 10px;
      }
    }
  }
  ::v-deep .el-scrollbar__view{
    display: flex;
  }
}

.reportFooter {
  padding: 30px 0;
  border-top: 1px solid #DCDFE6;
}

.back-container {
  .back-inner {
    .back-head {
      display: flex;
      align-items: center;

      img {
        width: 18px;
        margin-right: 16px;
      }
    }
  }
}
.linkTitle {
  color: #868BA1;
}
</style>
