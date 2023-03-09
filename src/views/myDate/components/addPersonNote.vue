<!--新建个人提醒-->
<template>
  <el-dialog append-to-body
             :before-close="handleCloseDialog"
             width="550px"
             :close-on-click-modal="false"
             :visible.sync='addPersonNoteDialog'>
    <div slot="title" class="dialog-header-row">
      <div class="dialog-tip"></div>
      <span class="el-dialog__title">新建个人提醒</span>
    </div>
    <div class="note-container">
      <div>
        <el-input v-model="personNoteForm.content"
                  maxlength="50"
                  show-word-limit
                  placeholder="添加提醒内容"
                  class="normal-input"
                  clearable />
<!--        <el-col :span="24" style="margin-top: 20px; display: flex; align-items: center;justify-content: space-between;">-->
<!--          <el-col :span="10">-->
<!--            <el-date-picker-->
<!--              v-model="startTime"-->
<!--              type="datetime"-->
<!--              format="yyyy-MM-dd HH:mm"-->
<!--              value-format="yyyy-MM-dd HH:mm"-->
<!--              placeholder="请设置开始时间"-->
<!--              style="width: 100%;">-->
<!--            </el-date-picker>-->
<!--          </el-col>-->
<!--          <el-col :span="4" style="text-align: center;"><span>~</span></el-col>-->
<!--          <el-col :span="10">-->
<!--            <el-date-picker-->
<!--              v-model="endTime"-->
<!--              type="datetime"-->
<!--              format="yyyy-MM-dd HH:mm"-->
<!--              value-format="yyyy-MM-dd HH:mm"-->
<!--              placeholder="请设置结束时间"-->
<!--              style="width: 100%;">-->
<!--            </el-date-picker>-->
<!--          </el-col>-->
<!--        </el-col>-->
        <div class="note-row flex-center cursor" @click="handleNoteSettingDialog">
          <i class="el-icon-bell"></i>
          <span>{{ formatTimerStr || '添加提醒' }}</span>
        </div>
      </div>
      <div class="flex-center">
        <el-button type="primary" class="el-button--normal-size" @click="handleSubmit">创建</el-button>
      </div>
    </div>
    <remind ref="personRemind"
            @change="changeValTags"
            :styles="style"
            :useRangeTime="true"
            :showForever="false"
            :endTime="endTime"
            isPersonRemind />
  </el-dialog>
</template>

<script>
import { saveTaskRemind } from "@/api/calendar";
import remind from "@/components/drawerDetail/remind";
import { loopOptions, timeCheck, weekendsDateList } from "@/const/dicData";
import { hasBlank } from "@/utils/validate";

const defaultPersonNoteForm = {
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
}

export default {
  name: "addPersonNote",
  data() {
    return {
      addPersonNoteDialog: false,
      personNoteForm: JSON.parse(JSON.stringify(defaultPersonNoteForm)),
      formatTimerStr: '',
      style: {},
      startTime: '',
      endTime: '',
      rowData: {
        acrossList: []
      },
      weekendsDateList: weekendsDateList,
      loopOptions: loopOptions,
      timeCheck: timeCheck,
    }
  },
  components: {
    remind,
  },
  methods: {
    /**
     * 手动显示
     * @param  {string}   startTime   2021-07-09 09:36:34
     * @param  {string}   endTime     2021-07-09 09:36:34
     * */
    handleInit(startTime, endTime) {
      console.log(this.$refs.personRemind)
      if (this.$refs.personRemind) {
        this.$refs.personRemind.handleClose();
      }
      if (!startTime) {
        this.$message.error('请选择开始时间')
        return
      }
      if (!endTime) {
        this.$message.error('请选择结束时间')
        return
      }
      Object.assign(this.$data, this.$options.data())
      this.startTime = startTime
      this.endTime = endTime
      this.addPersonNoteDialog = true
    },
    handleClose() {
      this.$refs.personRemind.handleClose();
    },

    ///////////  提醒模块 start  //////////
    handleNoteSettingDialog(e) {
      console.log(e)
      this.touchX = e.clientX // 按压位置X
      this.touchY = e.clientY // 按压位置Y
      const winW = document.body.clientWidth // 屏幕宽
      const winH = document.body.clientWidth // 屏幕高
      let translateX = this.touchX > winW / 2 ? '-100%' : 0 // X偏移
      let translateY = this.touchY > winH / 2 ? '-100%' : 0 // Y偏移

      // 定位样式 441
      const style = {
        top: `50%`,
        left: `${this.touchX - 65}px`,
        transform: `translate(${translateX}, -50%)`,
        marginTop: '-50px'
      }
      this.style = style
      this.$refs.personRemind.init(this.rowData);
    },
    changeValTags(val) {
      this.rowData.acrossList = val
      this.personNoteForm.remindRules = val
      this.personNoteForm.isRemind = val.length === 0 ? 0 : 1
      console.log('this.personNoteForm.remindRules', JSON.parse(JSON.stringify(val)))
      this.changeTags(val)
    },
    changeTags(val) {
      if(!val || val.length === 0) {
        this.clearRemind()
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
          timeLabel += newData.toString() + '日' + "/"
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
      this.$emit("change");
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
    // 重置提醒规则
    clearRemind() {
      this.rowData = { acrossList: [] }
      this.formatTimerStr = ''
      const { content } = this.personNoteForm
      this.personNoteForm = { ...JSON.parse(JSON.stringify(defaultPersonNoteForm)), content }
    },
    //////////    提醒模块 end    ////////

    // 个人提醒 提交
    handleSubmit() {
      if (!this.personNoteForm.content || hasBlank(this.personNoteForm.content)) {
        this.$message.error('请输入提醒内容')
        return
      }

      // 没有提醒的
      this.personNoteForm.isRemind = this.personNoteForm.remindRules.length === 0 ? 0 : 1
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
      // 更改
      console.log('data', data, this.personNoteForm.remindRules)
      // 新增
      saveTaskRemind(data).then(res => {
        if (res.data.code === 0) {
          this.$message.success('新建个人提醒成功')
          this.$emit('success')
          this.handleCloseDialog()
        }
      })
    },
    handleCloseDialog() {
      this.addPersonNoteDialog = false
      // 关闭时清空数据
      Object.assign(this.$data, this.$options.data())
    }
  },
  watch: {
    // 更改了时间需要清空提醒规则，重新选择
    'startTime': function (newVal, oldVal) {
      if (newVal !== oldVal && oldVal) {
        this.clearRemind()
      }
    },
    'endTime': function (newVal, oldVal) {
      if (newVal !== oldVal && oldVal) {
        this.clearRemind()
      }
    },
  }
}
</script>

<style scoped>

</style>
