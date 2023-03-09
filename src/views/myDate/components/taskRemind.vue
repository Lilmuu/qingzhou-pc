<!--任务详情 - 个人提醒详情-->
<template>
  <div style="display: flex;flex-flow: column;flex: 1;">
    <div class="reportView">
      <el-scrollbar class="reportViewScrollView default-el-scrollbar">
        <img src="@/assets/img/calendar/file2.png" alt="" style="width: 16px;height: 16px;margin: 21px 24px 0 0;">
        <div style="width: 100%;overflow: hidden;">
          <!-- 会议 -->
          <template v-if="taskType === 'meeting'">
            <div class="reportContent">
              <div class="title">{{ row.title || '无' }}</div>
              <div>{{ row.content || '无' }}</div>
            </div>
            <div class="reportItemRow">
              <div class="reportItem" style="width: auto;">
                <img :src="report_t">
                <span class="ellipsis" :title="timeRangeStr">{{ timeRangeStr }}</span>
              </div>
              <div class="reportItem" style="width: 100%;overflow: hidden;">
                <img :src="report_p">
                <span class="ellipsis" :title="row.addressName">会议地点：{{ row.addressName }}</span>
              </div>
            </div>
          </template>
          <!-- 出差 -->
          <template v-if="taskType === 'businessTrip'">
            <div class="reportContent">
              <div class="title">{{ row.title || '无' }}</div>
              <div>{{ rowData.content }}</div>
            </div>
            <div class="reportItemRow">
              <div class="reportItem" style="width: auto;">
                <img :src="report_t">
                <span class="ellipsis" :title="timeRangeStr">{{ timeRangeStr }}</span>
              </div>
              <div class="reportItem" style="width: 100%;overflow: hidden;">
                <img :src="report_p">
                <span class="ellipsis">出差地点：{{ row.addressName }}</span>
              </div>
            </div>
          </template>
          <!-- 个人提醒详情 -->
          <template v-if="taskType === 'taskRemind'">
            <div class="reportContent">
              <!-- <div class="title">标题</div> -->
              <div>{{ personNoteForm.content }}</div>
            </div>
            <div class="reportItemRow">
              <div class="reportItem" style="width: auto;">
                <img :src="report_t">
                <span class="ellipsis" :title="timeRangeStr">{{ timeRangeStr }}</span>
              </div>
            </div>
          </template>
          <div class="reportItemRow" v-if="!row.close">
            <!-- 回显 -->
            <div class="note-row-remind cursor" v-loading="isLoading" @click="handleNoteSettingDialog" v-if="formatTimerStr">
              <i class="el-icon-message-solid"></i>
              <span class="ellipsis" :title="formatTimerStr">{{ formatTimerStr }}</span>
            </div>
            <!-- 添加提醒 -->
            <div class="note-row-remind flex-center cursor"
                 v-loading="isLoading"
                 @click="handleNoteSettingDialog"
                 style="display: flex;margin-top: 0;"
                 v-else-if="!isOtherTask">
              <i class="el-icon-message-solid"></i>
              <span>添加提醒</span>
            </div>
          </div>
          <!-- <div class="reportItemRow" style="min-width: 80px; text-align: center; margin-top: 0;" v-else>
            <div class="note-row">
              <span>已关闭</span>
            </div>
          </div> -->
        </div>
      </el-scrollbar>
    </div>
    <div class="flex-end-center reportFooter" v-if="!row.close && !isOtherTask">
      <el-button type="primary" class="el-button--normal-size" @click="handleClose">关闭</el-button>
    </div>
    <remind ref="editPersonRemind"
            @change="changeValTags"
            :styles="style"
            :isDate="isDate"
            :endTime="endTime"
            isPersonRemind />
  </div>
</template>

<script>
import { addTaskRemind, getRemindInfo, getRemindInfoByType } from "@/api/calendar";
import remind from "@/components/drawerDetail/remind";
import { loopOptions, timeCheck, weekendsDateList } from "@/const/dicData";
import { formatRangeTime, transFormType } from "@/views/myDate/components/utils";

const report_t = require('@/assets/img/calendar/icon_time1.png')
const report_p = require('@/assets/img/calendar/report-p1.png')
const reportNoteTime = require('@/assets/img/calendar/report-noteTime.png')

const monthDateList = []
for (let i = 1; i <= 31; i++) {
  monthDateList.push(i)
}
const queryArr = ['taskCalendarReport','meeting', 'businessTrip']

export default {
  name: "taskRemind",
  props: {
    row: {
      type: Object,
      required: true
    },
    /**
     * 类型
     * taskRemind       个人提醒详情
     * businessTrip     出差详情
     * meeting          会议详情
     * */
    taskType: {
      type: String,
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
      formatTimerStr: '',
      style: {},
      startTime: '',
      endTime: '',
      rowData: {
        acrossList: []
      },
      cacheData: {},
      timeCheck: [...timeCheck],
      // loopOptions: loopOptions,
      monthDateList: monthDateList,
      weekendsDateList: weekendsDateList,
      isLoading: false,
    }
  },
  components: {
    remind,
  },
  mounted() {
    this.handleGetDetail()
  },
  computed: {
    timeRangeStr() {
      return `${formatRangeTime(this.row.startTime, this.row.endTime)}`
    }
  },
  methods: {
    // 获取个人提醒详情
    handleGetDetail() {
      if (!this.row || !this.row.id) return
      console.log('this.taskType', this.taskType)
      let query = {
        remindId: this.row.id
      }
      // 个人提醒 用 getRemindInfo
      const requestApi = this.taskType === 'taskRemind' ? getRemindInfo : getRemindInfoByType
      if (queryArr.includes(this.taskType)) {
        query = {
          type: transFormType(this.taskType),
          relationId: this.row.id
        }
      }
      this.isLoading = true
      this.endTime = this.row.endTime
      this.startTime = this.row.startTime
      requestApi(query).then(res => {
        if (res.data.code === 0 || res.data.code === 200) {
          this.cacheData = res.data.data
            console.log(this.row,'oijqwoeijq')
          if (!res.data.data) {
            this.rowData = { ...this.row, ...this.rowData }
            this.personNoteForm = {
              content: this.row.title,
              isRemind: 0,
              startTime: this.row.startTime,
              endTime: this.row.endTime,
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
          console.log('init this.rowData',  this.row, res.data.data, this.rowData, rules )
          this.rowData = { ...this.row, ...res.data.data, ...this.rowData, acrossList: rules }
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
      this.handleGetDetail()
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
      this.style = style
      console.log('click this.rowData', this.rowData)
      this.$refs.editPersonRemind.init(this.rowData);
    },
    changeValTags(val){
      this.rowData.acrossList = val
      this.personNoteForm.remindRules = val
      this.personNoteForm.isRemind = val.length === 0 ? 0 : 1
      console.log('2======',this.rowData.acrossList)
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
        console.log(newObj,'sadsdawqeqw')
      if (newObj.timeType === 5) {
        timeLabel = (newObj.endDate?newObj.endDate:newObj.remindDate) + ' ' + (newObj.startTime?newObj.startTime:newObj.remindTime) ? (newObj.endDate?newObj.endDate:newObj.remindDate) + ' ' + (newObj.startTime?newObj.startTime:newObj.remindTime) : newObj.endTime
      console.log(timeLabel ,'sadasqweqwe', isForever ,'sadasqweqwe', lengthStr,'sadasqweqwe')

      } else if (newObj.timeType === 6) {
        const loopLabel = this.getTimeTypeLabel(loopOptions, (newObj.frequency + 1))
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
        timeLabel += newObj.startTime ? newObj.startTime : newObj.endTime
      } else {
        console.log("this.timeCheck",this.timeCheck)
        timeLabel = this.getTimeTypeLabel(this.timeCheck, newObj.timeType, { value: 'timeType', label: 'content' })
      }
      if(timeLabel=='Invalid Date'){
        timeLabel='添加'
      }
      this.formatTimerStr = timeLabel + isForever + lengthStr + "提醒"
    },
    // 转换内容
    getTimeTypeLabel(list,val){
      console.log('list','val',list,val)
      // let timeLabelStr = list.find(item=>item['value'] == val)
      // return timeLabelStr.label

      let timeLabelStr = list.find(item=>{
        if(item['timeType']){
          return item['timeType'] == val
        }else{
          return item['value'] == val
        }
      })
      console.log('timeLabelStr------000000999999',timeLabelStr)
      return timeLabelStr.content || timeLabelStr.label
    },

    //////////    提醒模块 end    ////////
    // 个人提醒 修改提交
    handleSubmit() {
      if (!this.personNoteForm.content) {
        this.$message.error('请输入提醒内容')
        return
      }
      const data = {
        ...this.personNoteForm,
        startTime: this.row.startTime,
        endTime: this.row.endTime,
        type: transFormType(this.taskType),
        remindId: this.row.id,
      }
      if (queryArr.includes(this.taskType)) {
        data.type = transFormType(this.taskType)
        data.relationId = this.row.id
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
       * type       {Number}    0代表汇报交流 1代表会议 2代表出差 为空则代表没有关联任何
       * */
      console.log('data', data, this.personNoteForm.remindRules)

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
    handleClose() {
      this.$emit('closeRemind')
      //  this.$message.success('关闭提醒成功')
    },
  }
}
</script>

<style lang="scss" scoped>
.reportView {
  margin-top: 10px;
  flex: 1;
  .reportViewScrollView {
    height: 100%;

    .parentTitle {
      margin-top: 10px;
      font-size: 14px;
      line-height: 28px;
      word-break: break-all;
    }
    .parentInnerTitle {
      font-size: 14px;
      line-height: 28px;
      word-break: break-all;
    }
    .reportContent {
      word-break: break-all;
      background: #FBFBFC;
      padding: 13px 20px 15px 20px;
      line-height: 22px;
      border-radius: 6px;
      color: #333333;
      font-size: 14px;
      font-family: PingFang SC-Regular, PingFang SC;
      .title{
        font-size: 16px;
        line-height: 28px;
        word-break: break-all;
      }
    }
  }

  .reportItemRow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 16px;

    .reportItem {
      width: calc(50% - 20px);
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

      &:nth-child(2n + 1) {
        margin-right: 30px;
      }

      img {
        width: 14px;
        height: 14px;
        margin-right: 8px;
      }
    }
  }
  ::v-deep .el-scrollbar__view{
    display: flex;
  }
}

.datePickerContainer {
  background: #F6F6F6;
  margin-top: 25px;
  padding-top: 1px;
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
