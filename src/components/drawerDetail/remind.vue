<!--  -->
<template>
  <div id="remind" v-if="remindVisible">
    <div class="modelMask" @click="handleClose"></div>
    <div class="remindBody" :style="styles">
      <div class="remind_title">
        <div>
          <span class="before">{{ topTabActiveName }}</span>
        </div>
        <img @click="handleClose" src="@/assets/img/close.png" class="close_icon" >
      </div>
      <div class="tipsBody" :class="useRangeTime ? 'tipsBodyPadding0' : ''">
        <!-- 时间选择 - 单次 -->
        <div class="tipsTimeCheck">
          <div v-for="(item,index) in timeCheck" :key="index" @click="changeTimeCheck(item)"
            class="tipsTimeCheckItem" v-if="item.isShow">
            <div class="tipsTimeCheckItemCon">{{ item.content }}</div>
            <img v-show="item.check" src="@/assets/img/contact/round_select_checkBox.png" class="select_icon">
            <img v-show="!item.check" src="@/assets/img/contact/round_noSelect_checkBox.png" class="select_icon">
          </div>
        </div>
        <!-- 提醒方式 -->
        <div class="tipsTimeCheck">
          <div @click="seetingChang(remindModeList[0])"
            class="tipsTimeCheckItem">
            <div class="content">
              <img :src="remindModeList[0].icon" class="select_icon">
              <div class="tipsTimeCheckItemCon">{{ remindModeList[0].content }}</div>
            </div>
            <img v-show="!remindModeList[0].have" src="@/assets/v4_icon/icon_add.png" class="icon_add">
            <img v-show="remindModeList[0].have" src="@/assets/v4_icon/icon_close_red.png" class="icon_close_red" @click.stop="changeTimeCheck(remindModeList[0])">
            <!-- <i v-show="remindModeList[0].have" class="el-icon-minus" @click.stop="changeTimeCheck(remindModeList[0])"></i> -->
            <!-- <i v-show="remindModeList[0].have" class="el-icon-minus" @click.stop="changeTimeCheck(remindModeList[0])"></i> -->
          </div>
          <TimePickerSlot ref="TimePickerSlot" 
            v-if="seetingVal=='one' && isShowSeeting('one')" 
            :heightAutos="'-1'" />

          <div @click="seetingChang(remindModeList[1])"
            class="tipsTimeCheckItem">
            <div class="content">
              <img :src="remindModeList[1].icon" class="select_icon">
              <div class="tipsTimeCheckItemCon">{{ remindModeList[1].content }}</div>
            </div>
            <img v-show="!remindModeList[1].have" src="@/assets/v4_icon/icon_add.png" class="icon_add">
            <img v-show="remindModeList[1].have" src="@/assets/v4_icon/icon_close_red.png" class="icon_close_red" @click.stop="changeTimeCheck(remindModeList[1])">
          </div>
          <LoopTimeSlot ref="LoopTimeSlot" 
            v-if="seetingVal=='more' && isShowSeeting('more')" 
            :isRemind="true" 
            :showForever="showForever" 
            :isMultiple="false" 
            :icon='false' 
            :timeForm="timeForm"
            :showAllDayCheck="false" />
        </div>

        <!-- 通知类型 -->
        <div v-if="showTipList && taskPage" class="notice_mode">
          <template v-for="(item,index) in tipsF">
            <div class="tipsTimeCheckItem"
              :key="'tipsTimeCheckItem' + index"
              @click="changeTipsF(item)"
              v-if="item.isShow">
              <div class="tipsTimeCheckItemCon">{{ item.content }}</div>
              <!-- <img :src="item.check?selectActive:select" class="select_icon"> -->
              <img v-show="!item.check" src="@/assets/img/contact/round_noSelect_checkBox.png" class="select_icon">
              <img v-show="item.check" src="@/assets/img/contact/round_select_checkBox.png" class="select_icon">
            </div>
          </template>
        </div>
      </div>
      <div class="buttonBox">
        <el-button type="primary" size="small" style="width:88px" @click="submit()">确定</el-button>
        <!-- <el-button size="small" style="width:88px" @click="handleClose">取消</el-button> -->
      </div>
    </div>
  </div>
</template>

<script>
import select from '@/assets/img/icon/select.png'
import selectActive from '@/assets/img/icon/select_active.png'
import redminActive from '@/assets/img/icon/reminSelect.png'
import TimePickerSlot from "@/components/LoopTimePicker/TimePickerSlot";
import LoopTimeSlot from "@/components/LoopTimePicker/LoopTimeSlot"
import dayjs from 'dayjs'
import { addRemind } from '@/api/taskCare'
import { loopOptions, timeCheck, weekendsDateList, remindModeList } from '@/const/dicData'

const monthDateList = []
for (let i = 1; i <= 31; i++) {
  monthDateList.push(i)
}

export default {
  components: { TimePickerSlot, LoopTimeSlot },
  data() {
    return {
      value1: '',
      select,
      selectActive,
      redminActive,
      remindVisible: false,
      topTabActiveName: '提醒设置',
      rowData: {},
      monthDateList: monthDateList,
      loopOptions: loopOptions,
      weekendsDateList: weekendsDateList,
      timeCheck: [...timeCheck],
      remindModeList: [{ have: false, type: 'one', content: '设置单次提醒', icon: require('@/assets/img/mytodo/new_task/newtask_single.png')},
                       { have: false, type: 'more', content: '设置循环提醒', icon: require('@/assets/img/mytodo/new_task/newtask_loop.png')}],

      showTipList: true,
      tipsF: [{ check: false, content: '应用内通知', isShow: true}, 
              { check: false, content: '短信通知', isShow: true}],

      seetingVal: '', // 单次提醒时间
      // 设置循环提醒 
      timeForm: { loop: 1, endTime: '', allDay: false, forever: false, time1: new Date(), time2: '',},
      tips:{ app:{ check: 0,  content: '11', }, message:{ check: 0, content: '22', }}
    };
  },
  props: {
    styles: {
      type: Object,
      default: () => {
        return {}
      }
    },
    acrossList: {
      type: Array,
      default: () => {
        return []
      }
    },
    // YYYY-MM-DD HH:mm:ss
    endTime: {
      type: String,
      default: ""
    },
    // 是否为日程个人提醒模块的
    isPersonRemind: {
      type: Boolean,
      default: false
    },
    // 是否为日程
    isDate: {
      type: Boolean,
      default: false
    },
    // 只使用循环类型提醒
    useRangeTime: {
      type: Boolean,
      default: false,
    },
    showForever: {
      type: Boolean,
      default: true,
    },
    taskPage:{
      type: Boolean,
      default: false,

    }
  },
  computed: {
    //   处理是否显示按钮
    isShowSeeting() {
      return function (type) {
        let isShow = true
        if(type == 'one' || type=='more'){
          return true
        }
        this.timeCheck.forEach((item, index) => {
          if (item.type == type) {
            isShow = false
          }
        })
        return isShow
      }
    }
  },
  mounted(){
    this.timeCheck = timeCheck.forEach(item => item.check = false)
  },
  methods: {
    submit() {
      let informWayVal = 1   // 应用内通知-0  短信通知-1 应用和短信都通知-2
      // 勾选了几个提醒
      let tickNum = this.timeCheck.filter(e=>{
        return e.check === true
      })
      // 暂时注释掉
      let newInformWay = this.tipsF.filter(e=>e.check === true)
      if(this.taskPage && tickNum.length > 0){
        if(newInformWay.length == 0){
          this.$message.error("请选择通知方式");
          return;
        }else if(newInformWay.length == 2){
          informWayVal = 2
        }else{
          console.log('newInformWay.content',newInformWay)
          informWayVal = newInformWay[0].content === '短信通知' ? 1 : 0
        }
      }
      if (this.seetingVal == 'one') {
        let oneD = this.$refs.TimePickerSlot
        let date = oneD.rangeTimeStart
        let time = oneD.rangeTimeEnd
        if ((parseInt(new Date().getTime() / (60 * 1000)) + 5) > new Date(dayjs(date).format('YYYY-MM-DD') + " " + time).getTime() / (60 * 1000)) {
          // this.$message.warning("不能选择小于距离当前时间30分钟以内")
          this.$message.warning("不能选择小于距离当前时间5分钟以内")
          return
        }
      }
      if (this.isPersonRemind) {
        this.submitPerson()
        return;
      }
      let dataObj = {}
      if (this.seetingVal == 'one') {
        let oneD = this.$refs.TimePickerSlot
        dataObj.type = "one"
        dataObj.data = {
          rangeTimeStart: oneD.rangeTimeStart,
          rangeTimeEnd: oneD.rangeTimeEnd
        }
      } else if (this.seetingVal == 'more') {
        if (!this.timeForm.time1) {
          this.$message.warning("请选择提示时间")
          return
        }
        if (!this.timeForm.forever && !this.timeForm.endTime) {
          if(!this.showForever) {
            this.$message.warning("请选择截止日期")
            return
          }
          this.$message.warning("请选择截止日期或者勾选永久")
          return
        }
        if(!this.timeForm.forever) {
          if(dayjs(this.timeForm.endTime + " " + this.timeForm.time1).format("YYYY-MM-DD HH:mm") < dayjs().format("YYYY-MM-DD HH:mm")){
            this.$message.warning("提醒时间不能小于当前时间")
            return
          }
        }

        let oneD = this.$refs.LoopTimeSlot
        console.log(oneD,'oneD-oneD')
        dataObj.type = "more"
        dataObj.data = {
          loop: oneD.loopOptions.filter((item) => {
            return item.value == this.timeForm.loop
          }),
          week: oneD.weekendsDateList,
          weekIndex: oneD.weekendsIndex,
          month: oneD.monthIndex,
          monthIndex: oneD.monthIndex,
          time: this.timeForm.time1,
          forever: this.timeForm.forever,
          endTime: this.timeForm.endTime
        }
      } else {
        dataObj.type = "default"
        let content = ''
        this.timeCheck.forEach((item, index) => {
          if (item.check) {
            content = item.content
          }
        })
        dataObj.data = {
          content: content
        }
      }
      if (this.seetingVal) {
        this.pushTimeCheck(dataObj)
        this.seetingVal = ''
      } else {
        let endTime = this.rowData.endTime
        let cycList = []
        this.timeCheck.forEach(item => {
          if (item.check && item.type == 1) {
            let reduceTime = item.value * 60 * 1000
            let startTime = dayjs(new Date(new Date(endTime).getTime() - reduceTime)).format('YYYY-MM-DD HH:mm')
            cycList.push({
              //  id: item.id,
              taskId: this.rowData.id,
              frequency: 0,
              cycleType: 1,
              monthDay: dayjs(startTime).format('DD'),
              startTime: dayjs(startTime).format('HH:mm'),
              endTime: dayjs(startTime).format('HH:mm'),
              endDate: dayjs(endTime).format('YYYY-MM-DD'),
              informWay: informWayVal,
              timeType: item.timeType
              // endTime:endTime,
            })
          } else if (item.check && item.type == 0) {
            debugger
            console.log(item,'iiii')
            cycList.push({
              //  id: item.id,
              taskId: this.rowData.id,
              frequency: 2,
              cycleType: 1,
              monthDay: item.value,
              startTime: item.content.substr(4),
              endTime: item.content.substr(4),
              endDate: dayjs(endTime).format('YYYY-MM-DD'),
              informWay: informWayVal,
              timeType: item.timeType
              // endTime:endTime,
            })
          } else if (item.check && item.type == 'one') {
            cycList.push({
              //  id: item.id,
              taskId: this.rowData.id,
              frequency: 0,
              cycleType: 1,
              monthDay: dayjs(item.rangeTimeStart).format('DD'),
              startTime: item.rangeTimeEnd,
              endTime: item.rangeTimeEnd,
              endDate: dayjs(item.rangeTimeStart).format('YYYY-MM-DD'),
              informWay: informWayVal,
              timeType: item.timeType
              // endTime:endTime,
            })
          } else if (item.check && item.type == 'more') {
            cycList.push({
              //  id: item.id,
              taskId: this.rowData.id,
              frequency: item.loop[0].value - 1,
              cycleType: 1,
              monthDay: item.loop[0].value == 4 ? item.monthIndex.toString() : item.loop[0].value == 3 ? item.weekIndex.toString() : dayjs(item.endTime || endTime).format('DD'),
              startTime: item.time,
              endTime: item.time,
              endDate: dayjs(item.endTime || endTime).format('YYYY-MM-DD'),
              informWay: informWayVal,
              isPermanent: item.forever ? 1 : 0,
              timeType: item.timeType
            })
          }
        })
        // if(cycList.length === 0) {
        //   this.$message.warning("请设置提醒项");
        //   return
        // }
        console.log({ taskId: this.rowData.id, list: cycList },'{ taskId: this.rowData.id, list: cycList }')
        addRemind({ taskId: this.rowData.id, list: cycList }).then(res => {
          if (res.data.code == 200) {
            this.$message.success("添加提醒成功")
          }
        })
        this.$emit("change", cycList)
        this.handleClose()
      }
    },
    // 日程个人提醒提交
    submitPerson() {
      let dataObj = {}
      if (this.seetingVal == 'one') {
        let oneD = this.$refs.TimePickerSlot
        dataObj.type = "one"
        dataObj.data = {
          rangeTimeStart: oneD.rangeTimeStart,
          rangeTimeEnd: oneD.rangeTimeEnd
        }
      } else if (this.seetingVal == 'more') {
        if (!this.timeForm.time1) {
          this.$message.warning("请选择提示时间")
          return
        }
        if (!this.timeForm.forever && !this.timeForm.endTime) {
          if(!this.showForever) {
            this.$message.warning("请选择截止日期")
            return
          }
          this.$message.warning("请选择截止日期或者勾选永久")
          return
        }
        if(!this.timeForm.forever) {
          if(dayjs(this.timeForm.endTime + " " + this.timeForm.time1).format("YYYY-MM-DD HH:mm") < dayjs().format("YYYY-MM-DD HH:mm")){
            this.$message.warning("提醒时间不能小于当前时间")
            return
          }
        }
        let oneD = this.$refs.LoopTimeSlot
        dataObj.type = "more"
        dataObj.data = {
          loop: oneD.loopOptions.filter((item) => {
            return item.value == this.timeForm.loop
          }),
          week: oneD.weekendsDateList,
          weekIndex: oneD.weekendsIndex,
          month: oneD.monthIndex,
          monthIndex: oneD.monthIndex,
          time: this.timeForm.time1,
          forever: this.timeForm.forever,
          endTime: this.timeForm.endTime
        }
      } else {
        dataObj.type = "default"
        let content = ''
        this.timeCheck.forEach((item, index) => {
          if (item.check) {
            content = item.content
          }
        })
        dataObj.data = {
          content: content
        }
      }
      if (this.seetingVal) {
        this.pushTimeCheck(dataObj)
        this.seetingVal = ''
      } else {
        // 如果是点击空白新建个人提醒的，用endTime
        let endTime = this.rowData.endTime || this.endTime
        let cycList = []
        console.log(this.timeCheck,'this.timeCheck --- this.timeCheck')
        this.timeCheck.forEach(item => {
          if (item.check && item.type == 1) {
            let reduceTime = item.value * 60 * 1000
            let startTime = dayjs(new Date(new Date(endTime).getTime() - reduceTime)).format('YYYY-MM-DD HH:mm')
            cycList.push({
              // id: item.id,
              frequency: 0,
              remindType: 0,
              remindDate: dayjs(endTime).format('YYYY-MM-DD'),
              remindTime: dayjs(startTime).format('HH:mm'),
              endDate: dayjs(endTime).format('YYYY-MM-DD'),
              timeType: item.timeType,
              endTime:endTime,
            })
          } else if (item.check && item.type == 0) {
            cycList.push({
              // id: item.id,
              frequency: 2,
              cycleType: 1,
              monthDay: item.value,
              startTime: item.content.substr(4),
              endTime: item.content.substr(4),
              endDate: dayjs(endTime).format('YYYY-MM-DD'),
              informWay: 1,
              timeType: item.timeType,
              // endTime:endTime,
            })
          } else if (item.check && item.type == 'one') {
            cycList.push({
              // id: item.id,
              frequency: 0,
              monthDay: dayjs(item.rangeTimeStart).format('DD'),
              remindType: 0,
              startTime: item.rangeTimeEnd,
              endTime: item.rangeTimeEnd,
              endDate: dayjs(item.rangeTimeStart).format('YYYY-MM-DD'),
              timeType: item.timeType,
              // endTime:endTime,
            })
          } else if (item.check && item.type == 'more') {
            const itemData = {
              frequency: item.loop[0].value - 1,
              cycleType: 1,
              monthDay: item.loop[0].value == 4 ? item.monthIndex.toString() : item.loop[0].value == 3 ? item.weekIndex.toString() : dayjs(item.endTime || endTime).format('DD'),
              startTime: item.time,
              endTime: item.time,
              endDate: dayjs(item.endTime || endTime).format('YYYY-MM-DD'),
              isPermanent: item.forever ? 1 : 0,
              remindType: item.forever ? 2 : 1,
              timeType: item.timeType,
            }
            cycList.push(itemData)
          }
        })
        console.log(cycList,'cycList -- cycList')
        this.$emit("change", cycList)
        this.handleClose()
      }
    },
    // 添加提醒回显
    pushTimeCheck(dataObj) {
      console.log(dataObj,'dataObj-333333')
      let newContent
      if (dataObj.type == "one") {
        console.log(dayjs(dataObj.data.rangeTimeStart).format('YYYY-MM-DD') , dataObj.data.rangeTimeEnd,'iuhjqwiehiqw')
        newContent = dayjs(dataObj.data.rangeTimeStart).format('YYYY-MM-DD') + ' ' + dataObj.data.rangeTimeEnd
        this.timeCheck.push({ type: 'one', check: true, content: newContent, isShow: false, timeType: 5, ...dataObj.data})
      } else if (dataObj.type == "more") {
        let content = ''
        if (dataObj.data.loop[0].value == 1) {
          content = dataObj.data.loop[0].label
        } else if (dataObj.data.loop[0].value == 2) {
          content = dataObj.data.loop[0].label
        } else if (dataObj.data.loop[0].value == 3) {
          content = dataObj.data.loop[0].label
          dataObj.data.weekIndex.forEach(item => {
            content += dataObj.data.week[item] + "/"
          })
        } else {
          // 先排序，后面方便删除-1 0的数据
          dataObj.data.month.sort((a, b) => {
            return a - b
          })
          let newData = JSON.parse(JSON.stringify(dataObj.data.month))
          content = dataObj.data.loop[0].label;
          let str = "";
          if (newData.includes(0) || newData.includes('0')) {
            content += '第一个工作日' + "/"
            newData.splice(0, 1)
          }
          if (newData.includes(32) || newData.includes('32')) {
            str = '最后一个工作日' + "/"
            newData.splice(newData.length - 1, 1)
          }
          if (newData.length != 0) {
            content += newData.toString() + '日' + "/" + str;
          }else {
            content += "/" + str;
          }
        }
        newContent = content+' '+(dataObj.data.time!=""?dataObj.data.time+" ":"/")+(dataObj.data.forever?'/永久有效':dataObj.data.endTime?dataObj.data.endTime+'截止':'')
        this.timeCheck.push({ type: 'more', check: true, content: newContent, isShow: false, timeType: 6, ...dataObj.data})
      }
      this.remindModeList.forEach(e => {
        if(e.type == dataObj.type){
          e.content = newContent
          e.have = true
        }
      })
    },
    seetingChang(item) {
      if(this.seetingVal == item.type){
        this.seetingVal = ''
      }else{
        this.seetingVal = item.type
      }
      if (this.seetingVal == 'more') {
        this.timeForm = {
          loop: 1,
          endTime: '',
          allDay: false,
          forever: false,
          time1: '',
          time2: '',
          weekendsIndex: [0],
          monthIndex: [1]
        }
        this.timeForm.forever = false
        this.timeForm.time1 = dayjs(new Date()).format('HH:mm')
        this.timeForm.endTime = ''

        console.log(this.timeForm,'this.timeForm -- this.timeForm')
      }
    },
    changeTipsF(item) {
      item.check = !item.check
    },
    changeTimeCheck(item) {
      console.log(item,'选择的提醒时间')
      if (item.type == 'one' || item.type == "more") {
        let itemIndex = undefined
        this.timeCheck.forEach((items, index) => {
          if (items.type == item.type) {
            itemIndex = index
          }
        })
        if(itemIndex !== undefined){
          this.timeCheck.splice(itemIndex, 1)
          this.remindModeList.forEach(e => {
          if(e.type == item.type){
            e.content = item.type == 'one' ? '设置单次提醒': "设置循环提醒"
            e.have = false
          }
        })
        }
      }
      item.check = !item.check
      this.seetingVal = ''
      if (item.type === 1) {
        if (this.endTime.indexOf(":") > 0) {
          if (item.timeType === 1) {
            if (~~(new Date().getTime() / 60 / 1000) + 15 > new Date(this.endTime).getTime() / 60 / 1000) {
              this.$message.warning("距离任务截止时间已小于15分钟,不能选择此项")
              item.check = false
            }
          } else if (item.timeType === 2) {
            if (~~(new Date().getTime() / 60 / 1000) + 30 > new Date(this.endTime).getTime() / 60 / 1000) {
              this.$message.warning("距离任务截止时间已小于30分钟,不能选择此项")
              item.check = false
            }
          }
        }
      }
    },
    handleClose() {
      this.remindVisible = false
    },
    init(item) {
      if (this.acrossList && this.acrossList.length > 0) {
        switch (this.acrossList[0].informWay) {
          case '0':
            this.tipsF[0].check = true
            break;
          case '1':
            this.tipsF[1].check = true
            break;
          case '2':
            this.tipsF.forEach(item => {
              item.check = true
            })
            break;
          default: break;
        }
      }
      this.timeCheck = [...timeCheck]
      this.seetingVal = ''
      this.remindVisible = true
      this.timeForm.time1 = dayjs(new Date()).format('HH:mm')

      this.rowData = item

      console.log(this.timeCheck,'this.timeCheck -- 001')
      // 日程提醒模块
      if (this.isPersonRemind) {
        this.timeCheck.forEach(item => {
          if (item.type == 1 && !this.useRangeTime) {
            item.isShow = true
          } else {
            item.isShow = false
          }
        })
      } else {
        // 任务提醒模块
        this.timeCheck.forEach(item => {
          if (this.rowData.taskType == item.type) {
            item.isShow = true
          } else {
            item.isShow = false
          }
        })
      }

      console.log(this.timeCheck,'this.timeCheck -- 002')
      // 设置所有的提醒选项
      this.rowData.acrossList.forEach((acrossItme, index) => {
        console.log("acrossItme",acrossItme)
        let dataObj = {}
        if (acrossItme.timeType == 6) {
          dataObj.type = "more"
          dataObj.data = {
            loop: this.loopOptions.filter((item) => {
              return (acrossItme.frequency + 1) == item.value
            }),
            // week:this.weekendsDateList[acrossItme.monthDay],
            week: this.weekendsDateList,
            weekIndex: acrossItme.monthDay.split(","),
            // month:this.monthDateList[acrossItme.monthDay],
            month: acrossItme.monthDay.split(","),
            monthIndex: acrossItme.monthDay.split(","),
            time: acrossItme.startTime ? acrossItme.startTime : acrossItme.endDate,
            forever: acrossItme.isPermanent == 1,
            endTime: acrossItme.endDate ? acrossItme.endDate : acrossItme.remindDate
          }
        } else if (acrossItme.timeType == 5) {
          dataObj.type = "one"
          console.log(acrossItme,'ljiqwejloqwj')
          dataObj.data = {
            rangeTimeEnd: acrossItme.startTime ? acrossItme.startTime : acrossItme.endTime?acrossItme.endTime:acrossItme.remindTime,
            rangeTimeStart: acrossItme.endDate ? acrossItme.endDate : acrossItme.remindDate
          }
        }
        this.pushTimeCheck(dataObj)
      })
      // 选中有的提醒，并设置id
      this.rowData.acrossList.forEach((acrossItme, index) => {
        this.timeCheck.forEach(items => {
          // if(items.type == acrossItme.timeType || items.timeType  == acrossItme.timeType){
          // 默认4个有的需要选中
          if (items.timeType == acrossItme.timeType) {
            items.check = true
            items.id = acrossItme.id
          }
        })
      })
    }
  },
};
</script>
<style lang='scss'>
//@import url(); 引入公共css类
#remind {
  user-select: none;
  .modelMask {
    position: fixed;
    top: 0px;
    left: 0;
    height: 100vh;
    width: 100vw;
  }
  .remindBody {
    position: fixed;
    margin-top: 10px;
    padding-bottom: 30px;
    padding: 0 16px 30px;
    width: 432px;
    background: #FFFFFF;
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.12);
    opacity: 1;
    border-radius: 5px;

    .remind_title{
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 52px;
      div{
        position: relative;
        height: 52px;
        line-height: 52px;
      }
      .close_icon{
        cursor: pointer;
        width: 14px;
      }
      
    }
    .tabRowSlot {
      width: calc(100vw - 260px - 80px) !important;
    }
    .close_icon {
      cursor: pointer;
    }
    .tipsBody {
      padding: 20px 0px 0px 0px;
      max-height: 530px;
      overflow: scroll;
      &::-webkit-scrollbar{
        display: none;
      }
      .tipsTimeCheck {
        margin-bottom: 10px;
        padding: 0 20px;
        background-color: #F8F9FA;
        border-radius: 4px;
        .tipsTimeCheckItem {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          border-top: 1px dashed #DEE0E3;
          &:first-child{
            border-top: none;
          }
          .tipsTimeCheckItemCon {
            font-size: 13px;
            color: #0F1633;
            word-break: keep-all; /* 不换行 */
            white-space: nowrap; /* 不换行 */
            overflow: hidden; /* 内容超出宽度时隐藏超出部分的内容 */
            text-overflow: ellipsis;
          }
          .select_icon {
            width: 14px;
            height: 14px;
          }
          .content{
            display: flex;
            align-items: center;
            img{
              width: 16px;
              margin-right: 7px;
            }
          }
          .icon_add{
            width: 12px;
            height: 12px;
          }
          .icon_close_red{
            width: 10px;
            height: 10px;
          }
        }
        .el-icon-minus {
          color: #9da5b5;
        }
      }
      .notice_mode{
        margin-top: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #F2F2F2;
        .tipsTimeCheckItem{
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          img{
            width: 14px;
          }
        }
      }
      .seetingTips {
        margin-top: 20px;
        div {
          cursor: pointer;
          font-size: 13px;
          font-weight: 400;
          color: #333333;
          img {
            margin-right: 8px;
            width: 10px;
            height: 10px;
          }
        }
        div + div {
          margin-top: 16px;
        }
        .monthPicker>div{
          margin-top: 16px;
        }
        .month-bottom-date div{
          margin: 0;
        }
      }
      .seetingOptionBox {
        margin-top: 20px;
        padding: 17px 10px 20px;
        width: 409px;
        background: #F6F6F6;
      }
    }
    .buttonBox {
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
      margin-top: 30px;
      font-size: 14px;
      .el-button + .el-button {
        margin-right: 24px;
      }
    }
  }
  .note-container{
    // max-height: 350px;
    height: auto;
    min-height: 230px;
    .el-form-item__content .el-col-6{
      margin-top: 0!important;
    }
  }
  .tipsItemActive{
    max-width: 400px;
    line-height: 20px;
  }
}
</style>
