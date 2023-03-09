<template>
  <div ref="ccContainer" class="cc-calendar">
    <calendarHeader
      :headOptions="headOptions"
      :dateType="dateType"
      :time="time"
      @changeActiveUser="changeActiveUser"
      @handlePrev="handlePrev"
      @handleNext="handleNext"
      @handleToday="handleToday"
      @changeDateType="handleChangeDateType"
    />
    <!--    <span class="timer-tip" v-if="showTip"></span>-->
    <!--    <div v-if="dateType === 'day'">-->
    <!--      <dateHeader :time="time" :diff="0"></dateHeader>-->
    <!--    </div>-->
    <!-- 任务星期头部   -->
    <div class="flex-space-around dateHeaderRow" v-if="dateType === '3day'">
      <dateHeader :time="time" :diff="0" />
      <dateHeader :time="time" :diff="1" />
      <dateHeader :time="time" :diff="2" />
    </div>
    <div class="flex-space-around dateHeaderRow" v-if="dateType === 'week'">
      <dateHeader
        :time="time"
        :diff="item"
        v-for="(item, index) in weekList"
        :key="index"
      />
    </div>

    <!-- v-if="dateType !== 'month'" -->
    <!-- 任务视图 - 屏蔽月 -->
    <el-scrollbar
      class="task_scroll"
      ref="elScroll"
      v-if="dateType !== 'month'"
    >
      <!-- 全天任务 -->
      <div class="all_day_task" v-if="allDay.length > 0">
        <span class="time_line_tip_all">全天任务</span>
        <div class="all_day_task_item_container">
          <div
            class="all_day_task_item cursor"
            v-for="(task, index) in allDay"
            :key="index"
            :style="{ ...task.style, background: '#F5F6F7' }"
            :class="{'finishedLine':!task.title && task.isFinished, 'finished_line':task.isFinished}"
            @click="handleClickTask(task)"
          >
           <!-- task.renderBackground -->
            <span class="all_day_task_item_note" v-if="!isOtherTask && task.title && task.emergency">
              <img :src="urgent" v-if="task.emergency === 3 || task.emergency === 1" />
              <img :src="imp" v-if="task.emergency === 3 || task.emergency === 2" />
            </span>
            <span v-if="task.title" class="ellipsis">{{ task.title }}</span>
          </div>
        </div>
      </div>
      <!--  任务 day  3day week-->
      <div class="day_task_main_container" style="user-select: none">
        <!--  时间轴  -->
        <div class="time_line_container">
          <div
            v-for="(moment, momentIndex) in timeLine"
            :key="'moment' + momentIndex"
            :id="`time_line_tip_${momentIndex}`"
            class="time_line_tip moment_item"
          >
            {{ moment == 24 ? `23:59` : `${moment}:00` }}
          </div>
        </div>
        <div class="time_task_container">
          <div
            @mousedown="handleShowNoteDialog($event, dayIndex)"
            v-for="(mapList, dayIndex) in Array.from(dailyFormatMap)"
            :key="'dailyFormatMap' + dayIndex"
            class="time_task_lists"
          >
            <div v-for="(taskTime, taskTimeIndex) in handleData(Array.from(mapList[1]))"
              :key="'taskTime' + taskTimeIndex"
              class="item_task"
              :style="{ height: `${getElementHeight(taskTime)}px`,top: `${getTopHeight(taskTime)}px`}"
              @mousedown="handleShowNoteDialog($event, dayIndex)"
              >
                <div
                v-for="(task, taskIndex) in taskTime"
                :key="'dayTask' + taskIndex"
                class="time_task_lists_item"
                :class="task.from === 'taskRemind' ? 'taskRemindItem' : ''"
                :style="`height: ${task.renderHeight}px; margin-top: ${task.renderMarginTop - getTopHeight(taskTime)}px`"
                :title="`${task.title || ''}：${task.content || ''}`"
                @click.stop="handleClickTask(task)"
                @mousedown.stop
              >
                <div class="t_item" :class="dateType === 'week' ? 't_item_week' : ''">
                  <div v-if="task.title" class="t_item_inner" 
                    :class="task.isFinished ? 'finishedLineText' : ''" 
                    :style="`background: ${task.renderBackground};color: ${task.renderBackColor};`">
                    {{ task.title }}
                  </div>
                  <div
                    class="t_item_inner"
                    :class="task.isFinished ? 'finishedLine' : ''"
                    :style="`background: ${task.renderBackground};color: ${task.renderBackColor};`"
                    v-else
                  />
                </div>
              </div>
            </div>

            <!-- <div
                v-for="(task, taskIndex) in mapList[1]"
                :key="'dayTask' + taskIndex"
                class="time_task_lists_item"
                :class="task.from === 'taskRemind' ? 'taskRemindItem' : ''"
                :style="`margin-top: ${task.renderMarginTop}px; height: ${task.renderHeight}px;`"
                :title="`${task.title || ''}：${task.content || ''}`"
                @click.stop="handleClickTask(task)"
                @mousedown.stop
              >
                <div class="t_item" :class="dateType === 'week' ? 't_item_week' : ''">
                  <div v-if="task.title" class="t_item_inner" 
                    :class="task.isFinished ? 'finishedLineText' : ''" 
                    :style="`background: ${task.renderBackground};color: ${task.renderBackColor};`">
                    {{ task.title }}
                  </div>
                  <div
                    class="t_item_inner"
                    :class="task.isFinished ? 'finishedLine' : ''"
                    :style="`background: ${task.renderBackground};color: ${task.renderBackColor};`"
                    v-else
                  />
                </div>
              </div> -->
          </div>


          <!-- 新建日程弹框图 -->
          <div
            @mousedown.stop="scheduleMouseDown"
            @mousemove="changeMouseStyle"
            ref="schedule"
            class="time_task_schedule"
            v-if="showScheduleStatus"
            :style="{
              height: scheduleHeihgt + 'px',
              top: scheduleTop + 'px',
              width: scheduleWidth - 1 + 'px',
              left: scheduleLeft + 'px',
            }"
          >
            <div style="color: #73ae70; padding: 5px 0 0 5px; user-select: none">
              <span style="margin-right: 15px; font-weight: bold">添加日程</span>
              <span >{{ translateTime(scheduleTop) }} - {{ translateTime(scheduleTop + scheduleHeihgt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <!--  日历 month -->
    <div v-if="dateType === 'month'" class="calendar-view-container">
      <div>
        <FullCalendar
          ref="fullCalendar"
          defaultView="dayGridMonth"
          :options="calendarOptions"
          :editable="true"
        ></FullCalendar>
        <!-- :plugins="calendarOptions.plugins" -->
      </div>
    </div>
    <!-- 新建个人提醒 -->
    <addPersonNote ref="addPersonNote" @success="handleRefresh" />
    <!-- <div v-if="showScheduleStatus" class="scheduleMask"></div> -->
    <AddNewSchedule
      ref="addNewSchedule"
      :scheduleHeihgt="scheduleHeihgt"
      :scheduleTop="scheduleTop"
      :scheduleWidth="scheduleWidth"
      :scheduleLeft="scheduleLeft"
      :time="time"
      :dateType='dateType'
      :weekList="weekList"
      @timeChanges="timeChanges"
      @startDateChanges="startDateChanges"
      @endDateChanges="endDateChanges"
      @closeSchedule="closeSchedule"
      @success="handleRefresh"
    />
    <!-- @startTimeChanges="startTimeChange" @endTimeChanges="endTimeChange" -->
    <div v-if="showScheduleStatus" class="modalBg"></div>
  </div>
</template>

<script>
import "./reset.min.css";
import calendarHeader from "./canlendar-head.vue";
import * as utils from "./utils";
import dayjs from "dayjs";
import { range } from "lodash";
import dateHeader from "@/views/myDate/components/dateHeader";
import { dateDiff, isBetweenOrSame, renderTaskBackground,renderTaskColor } from "./utils";
import {
  formatToCNDateDay,
  transDateType,
} from "@/views/myDate/components/utils";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { searchByConditions } from "@/api/calendar";
import addPersonNote from "@/views/myDate/components/addPersonNote";
import urgent from "@/assets/img/task/urgent.png";
import imp from "@/assets/img/task/imp.png";
import { mapState } from "vuex";
import AddNewSchedule from "./addNewSchedule.vue";

const task_danger_icon = require("./img/task-danger.png");
const task_warning_icon = require("./img/task-warning.png");

let monthTaskLists = [];
const myUserData = {
  id: localStorage.getItem("USERID"),
  realName: localStorage.getItem("USERNAME"),
};

export default {
  name: "datePicker",
  componentName: "datePicker",
  props: {
    options: Object,
    propsTime: {
      type: Object,
      required: true,
    },
    // selectListsStr prop 为 String, 默认为 null, 判断null防止重复渲染
    selectListsStr: {
      type: String,
      required: true,
      default: null,
    },
    // [日程]是否为他人的任务
    isOtherTask: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    calendarHeader,
    dateHeader,
    FullCalendar,
    addPersonNote,
    AddNewSchedule,
  },

  data() {
    const { year, month, day } = utils.getNewDate(new Date());
    return {
      /**
       * calendarOptions
       * see:  https://fullcalendar.io/docs/eventDisplay
       * @interface {BASE_OPTION_REFINERS}  calendarOptions   node_modules/@fullcalendar/common/main.d.ts
       * */
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        // locale: 'zh-cn',
        initialView: "dayGridMonth",
        eventClick: this.handleEventClick,
        dateClick: this.handleDateClick,
        headerToolbar: false,
        dayMaxEvents: 3,
        displayEventTime: false,
        eventDisplay: "block",
        selectable: true, // 是否允许用户通过单击和拖拽来突出显示多天或多个时间段
        select: this.handleDateSelect, // 选择后的回调方法
        moreLinkContent:(val) => {
          return `还有${val.num}个任务`
        },
        moreLinkClick:() => {
          if(this.showScheduleStatus) this.closescheduleDialog()
          this.$nextTick(() => {
            this.handleReplacePopoverTilte()
          })
        },
        dayHeaderContent: this.formatWeeks,
        eventDidMount:(event) => {
          // event.el.style.background = 'red'
          console.log(event.el,'11111111111111111111111')
        }
      },
      headOptions: {
        type: this.options.type,
        style: this.options.headStyle,
        date: "",
      },
      allDay: [], // 全天任务
      dailyFormatMap: new Map(), // 单日任务格式化后的数据，key 为 日，value为 []
      timeLine: [], // 时间轴
      calendarTitleArr: [
        "周一",
        "周二",
        "周三",
        "周四",
        "周五 ",
        "周六 ",
        "周日",
      ],
      weekList: [], // 这周的排序
      dateType: "week", // [day,3day,week,month]
      time: { year, month, day },
      startTime: "",
      endTime: "",
      dateState: 0, // [0:当日, 1:三日, 2:本周, 3:本月]
      calendarList: [],
      taskLists: [], // 任务列表
      mouthTaskListsObj: {}, // 月
      mouthLoaded: false,
      isLoading: false,
      task_danger_icon: task_danger_icon,
      task_warning_icon: task_warning_icon,
      activeUser: JSON.parse(JSON.stringify(myUserData)), // 默认用户为自己
      urgent,
      imp,
      showScheduleStatus: false,
      scheduleHeihgt: 0,
      scheduleTop: 0,
      scheduleWidth: 0,
      scheduleLeft: 0,
      fixedTop: 0,
      scheduleDidMove: true,
      moveIndex: 0,
      changeColIndex: 0, // 创建视图每次的开始位置
      WeekStartTime: '', // 本周开始日期
      WeekEndTime: '', // 本周结束日期
      cellWidth: 0,
      startScheduleWidth: 0,
      endScheduleWidth: 0,
      rightMoveWidth: 0,
      leftMoveWidth: 0,
    };
  },
  created() {
    this.calendarList = this.visibleCalendar;
    this.calendarType = this.options.calendarType;
  },
  mounted() {
    this.initTime();
    this.initTimeLine();
    this.getDayCalendar();
    // 点击时去掉日历重复的字
    // document.addEventListener("click", this.handleReplaceMoreText);
    // window.addEventListener("resize", this.handleReplaceMoreText);
    setTimeout(() => {
      let a = Array.from(Array.from(this.dailyFormatMap)[4])[1]
      for(let i in a){
        console.log(a[i], 'dailyFormatMap --- item')
      }
      
    }, 5000);
  },
  destroyed() {
    // document.removeEventListener("click", this.handleReplaceMoreText);
    // window.removeEventListener("resize", this.handleReplaceMoreText);
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
    }),
    dayStyle: function () {
      return {
        textAlign: this.options.viewStyle.day,
      };
    },
    visibleCalendar() {
      const calendatArr = [];
      const { year, month, day } = utils.getNewDate(
        utils.getDate(this.time.year, this.time.month, 1)
      );

      const currentFirstDay = utils.getDate(year, month, 1);

      // 获取当前月第一天星期几
      const weekDay = currentFirstDay.getDay();
      const startTime = weekDay === 0 ? currentFirstDay-(weekDay + 6)*24*60*60*1000 : currentFirstDay-(weekDay - 1)*24*60*60*1000;
      let monthDayNum;
      if (weekDay === 5 || weekDay === 6 || weekDay === 0) {
        monthDayNum = 42;
      } else {
        monthDayNum = 35;
      }
      for (let i = 0; i < monthDayNum; i++) {
        calendatArr.push({
          date: new Date(startTime + i * 24 * 60 * 60 * 1000),
          year: year,
          month: month + 1,
          day: new Date(startTime + i * 24 * 60 * 60 * 1000).getDate(),
          clickDay: false,
        });
      }
      // 初始化 月
      if (this.dateType === "month") {
        this.headOptions.date = `${year}年${month + 1}月${day}日`
      } else {
        // 初始化 其他
        const currentTimer = utils.getNewDate(utils.getDate(this.time.year, this.time.month, this.time.day));
        this.headOptions.date = `${currentTimer.year}年${currentTimer.month + 1}月${currentTimer.day}日`;
      }
      return calendatArr;
    },
    translateTime() {
      return (time) => {
        let hour = 0,
          minute = 0;
        hour =
          Math.floor(time / 60) < 10
            ? `0${Math.floor(time / 60)}`
            : Math.floor(time / 60);
        if (hour == 24) hour = "00";
        if (time % 60 == 0) {
          return `${hour}:00`;
        } else {
          minute = time % 60;
          return `${hour}:${minute}`;
        }
      };
    },
  },
  methods: {
    // 月-拖拽回调函数
    handleDateSelect(selectInfo) {
      // 查看的是别人的任务,打开新建汇报
      if (!!this.userId && String(this.activeUser.id) !== String(this.userId)) {
        this.$emit("handleAddTask");
        return;
      }
      console.log("---------------拖拽选择", selectInfo);
      if (this.$refs.addNewSchedule.dialogFormVisible) {
        this.$refs.addNewSchedule.reset();
        return;
      }
      // 选择的时间多一天 时间戳减去 1000*60*60*24
      let endTime = new Date(selectInfo.endStr).getTime();
      let newEndTime = dayjs(endTime - 86400000).format("YYYY-MM-DD");
      const containerBgHarness = document
        .querySelector(".fc-daygrid-bg-harness")
        .getBoundingClientRect();
      this.showScheduleStatus = !this.showScheduleStatus;
      this.$refs.addNewSchedule.init({
        position: containerBgHarness,
        moveIndex: this.moveIndex,
        startTime: selectInfo.startStr,
        endTime: newEndTime,
      });

      // let title = 'Please enter a new title for your event'
      // let calendarApi = selectInfo.view.calendar
      // const containerBgHarness = document.querySelector('.fc-daygrid-bg-harness').getBoundingClientRect()
      // calendarApi.unselect() // clear date selection
      // if (title) {
      //   calendarApi.addEvent({
      //     id: 10,
      //     title,
      //     end: selectInfo.startStr,
      //     end: selectInfo.endStr,
      //     allDay: selectInfo.allDay
      //   })
      // }
    },
    scheduleMouseDown(e) {
      const startOffsetY = e.offsetY;
      this.showScheduleStatus &&
        (this.$refs.schedule.style.pointerEvents = "none");
      const mousemove = (e) => {
        if (!this.scheduleDidMove) return;
        const containerHeight = document
          .querySelector(".time_task_container")
          .getBoundingClientRect().height;
        const containerTop = document
          .querySelector(".time_task_container")
          .getBoundingClientRect().top;
        const startIndex = Math.floor(this.fixedTop / 15);
        const currentIndex = Math.floor((e.offsetY - startOffsetY) / 15);
        const moveIndex = currentIndex - startIndex;
        if (e.pageY - startOffsetY < containerTop) return;
        if (
          this.fixedTop + moveIndex * 15 >
          containerHeight - this.scheduleHeihgt
        )
          return;
        if (e.clientY > window.innerHeight - 15) return;
        this.scheduleTop = this.fixedTop + moveIndex * 15;
      };

      const mouseup = () => {
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
        this.showScheduleStatus &&
          (this.$refs.schedule.style.pointerEvents = "auto");
        this.fixedTop = this.scheduleTop;
      };
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
    },
    changeMouseStyle(e) {
      const ELwidth = this.$refs.schedule.getBoundingClientRect().width;
      const isBottom = this.scheduleHeihgt - e.offsetY < 10;
      const isRight = ELwidth - e.offsetX < 10;
      const isLeft = e.offsetX < 10;
      if (isBottom && !isRight) {
        this.$refs.schedule.style.cursor = "n-resize";
      } else if (!isBottom && isRight) {
        if (this.dateType !== "day") {
          this.$refs.schedule.style.cursor = "e-resize";
        }
      } else if (!isBottom && isLeft) {
        if (this.dateType !== "day") {
          this.$refs.schedule.style.cursor = "w-resize";
        }
      } else {
        this.$refs.schedule.style.cursor = "unset";
      }

      this.$refs.schedule.onmousedown = (event) => {
        this.$refs.addNewSchedule.closeModal();
        const startPagex = event.pageX;
        this.showScheduleStatus &&
          (this.$refs.schedule.style.pointerEvents = "none");
        const mousemove = (e) => {
          if (isBottom || isRight || isLeft) this.scheduleDidMove = false;
          if (isBottom) {
            this.changeScheduleHeight(e);
          }
          const containerWidth = document
            .querySelector(".time_task_container")
            .getBoundingClientRect().width;
          const containerLeft = document
            .querySelector(".time_task_container")
            .getBoundingClientRect().left;
          const cellWidth =
            containerWidth /
            document.getElementsByClassName("time_task_lists").length;
          const movePageX = e.pageX;
          const startIndex = Math.floor(
            (startPagex - containerLeft) / cellWidth
          );
          const currentIndex =
            Math.floor((movePageX - containerLeft) / cellWidth) - startIndex;
          this.moveIndex = currentIndex;
          if (isRight) {
            if (movePageX < containerWidth + containerLeft) {
              if (movePageX > startPagex) {
                this.scheduleWidth = this.rightMoveWidth + currentIndex * cellWidth;
              } else {
                this.scheduleWidth = (Math.floor((movePageX - containerLeft) / cellWidth) - 1) * cellWidth;
              }
            }
          }
          if (isLeft) {
            if (movePageX > containerLeft && movePageX < startPagex) {
              this.scheduleLeft = cellWidth * Math.floor((movePageX - containerLeft) / cellWidth);
              if (movePageX < startPagex) {
                this.scheduleWidth = this.leftMoveWidth + Math.abs(currentIndex) * cellWidth;
              }
            } else if (movePageX > containerLeft && movePageX > startPagex) {
              if (Math.floor(this.scheduleWidth) > Math.floor(cellWidth)) {
                this.scheduleLeft = cellWidth * Math.floor((movePageX - containerLeft) / cellWidth);
                this.scheduleWidth = this.leftMoveWidth - currentIndex * cellWidth;
              }
            }
          }
        };
        const mouseup = () => {
          document.removeEventListener("mousemove", mousemove);
          document.removeEventListener("mouseup", mouseup);
          this.showScheduleStatus && (this.$refs.schedule.style.pointerEvents = "auto");
          this.scheduleDidMove = true;
          this.$refs.addNewSchedule.init({position: this.$refs.schedule.getBoundingClientRect(),moveIndex: this.moveIndex,});
          this.rightMoveWidth = this.scheduleWidth;
          this.leftMoveWidth = this.scheduleWidth;
        };
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
      };
    },
    handleShowNoteDialog(e, colIndex) {
      // 查看的是别人的任务,打开新建汇报
      if (!!this.userId && String(this.activeUser.id) !== String(this.userId)) {
        this.$emit("handleAddTask");
        return;
      }
      const offsetY = e.offsetY;
      const index = Math.ceil(offsetY / 30);
      const containerWidth = document
        .querySelector(".time_task_container")
        .getBoundingClientRect().width;
      const containerLeft = document
        .querySelector(".time_task_container")
        .getBoundingClientRect().left;
      const ELwidth =
        containerWidth /
        document.getElementsByClassName("time_task_lists").length;
      this.cellWidth = ELwidth;
      this.startScheduleWidth = ELwidth;
      this.endScheduleWidth = ELwidth;
      this.rightMoveWidth = ELwidth;
      this.leftMoveWidth = ELwidth;
      const movePageX = e.pageX;
      const mouseIndex = Math.floor((movePageX - containerLeft) / ELwidth);

      this.scheduleWidth = ELwidth;
      this.scheduleHeihgt = 30;
      this.scheduleTop = 30 * (index - 1);
      this.scheduleLeft = mouseIndex * ELwidth;
      this.showScheduleStatus = !this.showScheduleStatus;
      this.fixedTop = this.scheduleTop;
      this.$nextTick(() => {
        this.showScheduleStatus &&
          (this.$refs.schedule.style.pointerEvents = "none");
      });

      const mousemove = (e) => {
        this.changeScheduleHeight(e);
      };
      const mouseup = () => {
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
        this.showScheduleStatus && (this.$refs.schedule.style.pointerEvents = "auto");
        this.showScheduleStatus
          ? this.$refs.addNewSchedule.init({position: this.$refs.schedule.getBoundingClientRect(),colIndex,cellWidth: this.cellWidth,})
          : this.$refs.addNewSchedule.reset();
      };
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
    },
    changeScheduleHeight(e) {
      const offsetY = e.offsetY;
      const containerHeight = document
        .querySelector(".time_task_container")
        .getBoundingClientRect().height;
      const containerTop = document
        .querySelector(".time_task_container")
        .getBoundingClientRect().top;
      const startIndex = Math.floor(this.fixedTop / 15);
      const currentIndex = Math.floor(offsetY / 15) - startIndex;
      // if(e.clientY > window.innerHeight - 100){
      //   window.scrollTo({
      //     behavior: "smooth",
      //     top: offsetY + 50,
      //   });
      //   console.log(e.clientY)
      // }
      if (offsetY - this.fixedTop >= 30) {
        if ((currentIndex + startIndex) * 15 > containerHeight) return;
        if (e.clientY > window.innerHeight - 15) return;
        this.scheduleTop = this.fixedTop;
        this.scheduleHeihgt = currentIndex * 15;
      } else if (offsetY - this.fixedTop < -15) {
        if (e.pageY < containerTop) return;
        if (e.clientY > window.innerHeight - 40) return;
        this.scheduleHeihgt = Math.abs(currentIndex) * 15;
        this.scheduleTop = this.fixedTop - this.scheduleHeihgt;
      }
    },
    // 初始化查询时间
    initTime() {
      const now = Date.now();
      const startTime = dayjs(now).startOf("day").format("YYYY-MM-DD HH:mm");
      const endTime = dayjs(now).endOf("day").format("YYYY-MM-DD HH:mm");
      this.startTime = startTime;
      this.endTime = endTime;
    },
    // startTimeChange(val) {
    //   const [hour, minute] = val.split(":");
    //   this.scheduleTop = hour * 60 + Number(minute);
    //   this.fixedTop = this.scheduleTop;
    // },
    // endTimeChange(val) {
    //   const [hour, minute] = val.split(":");
    //   this.scheduleHeihgt = hour * 60 + Number(minute) - this.scheduleTop;
    // },
    timeChanges(value){
      const [startHour, startMinute] = value.startTime.split(":");
      this.scheduleTop = startHour * 60 + Number(startMinute);
      this.fixedTop = this.scheduleTop;

      const [endHour, endMinute] = value.endTime.split(":");
      this.scheduleHeihgt = endHour * 60 + Number(endMinute) - this.scheduleTop;

    },
    startDateChanges({ diffDay, colIndex }) {
      if (diffDay + colIndex > -1 && diffDay + colIndex < 7) {
        this.scheduleLeft = (diffDay + colIndex) * this.cellWidth;
        this.scheduleWidth = this.endScheduleWidth;
        colIndex = diffDay + colIndex
        this.$nextTick(() => {
          this.$refs.addNewSchedule.init({
            position: this.$refs.schedule.getBoundingClientRect(),
            colIndex,
            moveIndex: diffDay,
          });
        });
      } else {
        if (diffDay < 0 && this.scheduleLeft>0) {
          this.$refs.addNewSchedule.colIndex = 0
          this.$refs.addNewSchedule.dateHandle = this.WeekStartTime
          this.scheduleLeft = 0;
          this.scheduleWidth = this.startScheduleWidth + colIndex * this.cellWidth;
        }
      }
      this.startScheduleWidth = this.scheduleWidth;
    },
    endDateChanges({ diffDay, colIndex }) {
      if (diffDay + colIndex < 7) {
        if (diffDay <= 0) {
          this.scheduleWidth = this.startScheduleWidth;
        } else {
          this.scheduleWidth = this.cellWidth * diffDay + this.startScheduleWidth;
          this.$nextTick(() => {
            this.$refs.addNewSchedule.init({
              position: this.$refs.schedule.getBoundingClientRect(),
              colIndex,
              moveIndex: diffDay,
            });
          });
        }
      } else {
        this.scheduleWidth = (7 - colIndex) * this.cellWidth;
      }
      this.endScheduleWidth = this.scheduleWidth;
    },
    closeSchedule() {
      if (this.showScheduleStatus) this.showScheduleStatus = false;
    },
    // 初始化时间轴
    initTimeLine() {
      const timeLine = [];
      for (let i = 0; i <= 24; i++) {
        timeLine.push(i);
      }
      this.timeLine = timeLine;
    },
    // 获取day、3day、week 数据
    getDayCalendar() {
      this.showScheduleStatus = false;
      this.$refs.addNewSchedule.reset();
      if (this.dateType === "month") return;
      this.autoScroll(0);
      // 清空缓存数据
      this.allDay = [];
      this.dailyFormatMap = new Map();
      const currentDate = utils.getDate(
        this.time.year,
        this.time.month,
        this.time.day
      );

      let dayStartTime = "";
      let dayEndTime = "";
      // 有哪些天
      let queryDatesArr = [];

      switch (this.dateType) {
        case "day":
          dayStartTime = dayjs(currentDate).startOf("day");
          dayEndTime = dayjs(currentDate).endOf("day");
          queryDatesArr = [dayStartTime.date()];
          break;
        case "3day":
          dayStartTime = dayjs(currentDate).startOf("day");
          dayEndTime = dayjs(currentDate).add(2, "day").endOf("day");
          queryDatesArr = [
            dayStartTime.date(), // 0
            dayjs(currentDate).add(1, "day").endOf("day").date(), // 1
            dayEndTime.date(), // 2
          ];
          break;
        case "week":
          // 修改获取本周的日期 从周日开始
          let dayWeek = new Date(currentDate).getDay();
          dayStartTime = dayjs(currentDate)
            .add(dayWeek * -1, "day")
            .startOf("day");
          dayEndTime = dayjs(currentDate)
            .add(6 - dayWeek, "day")
            .endOf("day");
          queryDatesArr = [];
          queryDatesArr.push(dayStartTime.date());
          for (let i = dayWeek * -1 + 1; i < 6 - dayWeek; i++) {
            queryDatesArr.push(
              dayjs(currentDate).add(i, "day").startOf("day").date()
            );
          }
          queryDatesArr.push(dayEndTime.date());
          break;
      }

      // 防止 selectListsStr 为null 未被初始化
      if (this.selectListsStr === null) return;
      this.WeekEndTime = dayEndTime.format("YYYY-MM-DD")
      let newDayEndTime = new Date(this.WeekEndTime).getTime()
      this.WeekStartTime = dayjs(newDayEndTime - 1000*60*60*24*6).format('YYYY-MM-DD')
      const data = {
        // 周 传 周六的日期
        searchDate:
          this.dateType === "week" ? dayEndTime.format("YYYY-MM-DD") : dayStartTime.format("YYYY-MM-DD"),
        searchDateType: transDateType(this.dateType),
        selections: this.selectListsStr,
        userId: this.activeUser.id,
      };
      // const res = { data: { "code": 200, "msg": "success", "data": { "normal": [ { "id": "202bfb759bc50e85709c87a03c9ab2af", "title": "汇报交流", "content": "喊你回家干饭", "startTime": "2021-07-17 00:00", "endTime": "2021-07-31 00:00", "from": "taskCalendarReport", "state": 2, "startDay": 17, "endDay": 31, "startHour": 0, "endHour": 0, "dateLength": 336, "timeDimensionTask": false }, { "id": "3d6a2e5bb218ab054c773a83075e8b85", "title": "回家干饭： 2021-07-15 21:00", "content": "20:56", "startTime": "2021-07-15 21:20", "endTime": "2021-07-15 21:50", "from": "taskRemind", "startDay": 15, "endDay": 15, "startHour": 21, "endHour": 23, "dateLength": 2, "timeDimensionTask": true }, { "id": "bd0b52ec6ed2f46dc8b90496beee7e69", "title": "0:16", "content": "0:16", "startTime": "2021-07-16 00:00", "endTime": "2021-07-16 01:00", "from": "taskRemind", "startDay": 16, "endDay": 16, "startHour": 0, "endHour": 1, "dateLength": 1, "timeDimensionTask": true }, { "id": "d1298c9e90389b6a5a1b35a315e02cd6", "title": "0:13", "content": "0:13", "startTime": "2021-07-15 09:00", "endTime": "2021-07-15 10:00", "from": "taskRemind", "startDay": 15, "endDay": 15, "startHour": 9, "endHour": 10, "dateLength": 1, "timeDimensionTask": true }], "allDay": [ { "id": "2dbb2c0de4d2ea3543a97d7f09441771", "title": "而发热", "content": "肥肥", "startTime": "2021-07-15 15:40", "endTime": "2021-07-16 00:00", "from": "task", "state": 1, "startDay": 15, "endDay": 16, "startHour": 15, "endHour": 0, "dateLength": 8, "emergency": 0, "timeDimensionTask": false }, { "id": "4d7555a5b01f627af459dcf08e7295f1", "title": "分解一级任务", "content": "测试分解一级任务", "startTime": "2021-07-16 10:57", "endTime": "2021-07-17 12:59", "from": "task", "state": 1, "startDay": 16, "endDay": 17, "startHour": 10, "endHour": 12, "dateLength": 26, "emergency": 0, "timeDimensionTask": false }, { "id": "9bc368d3968fdfb60dccd40c30a239bb", "title": "测试", "content": "测试", "startTime": "2021-07-15 16:36", "endTime": "2021-07-30 00:00", "from": "task", "state": 3, "startDay": 15, "endDay": 30, "startHour": 16, "endHour": 0, "dateLength": 343, "emergency": 0, "timeDimensionTask": false }, { "id": "c31c072ff86972fbdd6fe2b018c2f8fb", "title": "第一轮：测试分解任务", "content": "第一轮：测试分解任务", "startTime": "2021-07-15 18:08", "endTime": "2021-07-15 18:30", "from": "task", "state": 0, "startDay": 15, "endDay": 16, "startHour": 18, "endHour": 18, "dateLength": 1, "emergency": 0, "timeDimensionTask": false }, { "id": "fc90bb16ef9f90d0d6fc3763055f8f9c", "title": "任务1 ", "content": "啊啊啊啊", "startTime": "2021-07-15 17:03", "endTime": "2021-07-31 00:30", "from": "task", "state": 1, "startDay": 15, "endDay": 31, "startHour": 17, "endHour": 0, "dateLength": 366, "emergency": 0, "timeDimensionTask": false } ] }, "timestamp": "2021-07-17 10:16:19 857" } }
      searchByConditions(data).then((res) => {
        console.log("res -- 0", res);
        if (res.data.code === 200) {
          // 为清空状态, 直接清空
          let allDay = [];
          let daily = [];
          if (this.selectListsStr === "") {
            allDay = [];
            daily = [];
          } else {
            allDay = res.data.data.allDay;
            daily = res.data.data.normal;
          }
          const _dailyFormatMap = new Map();
          // 有哪些天
          queryDatesArr.forEach((day) => {
            _dailyFormatMap.set(day, []);
          });
          // 将 70px 分成 60份, 即 1个小时 分成 60份， 1分钟占多少px
          // const itemHeightPx = 70 / 60
          const itemHeightPx = 60 / 60;
          // 填充
          daily.forEach((task) => {
            const { startDay, startTime, endTime } = task;
            // 一天开始时间 00:00:00
            const startDayTime = dayjs(startTime).startOf("day");
            // 一天结束时间 23:59:59
            const endDayTime = dayjs(startTime).endOf("day");
            // 显示的结束时间
            const endDayTimeRange = dayjs(endTime).isBefore(endDayTime) ? dayjs(endTime) : endDayTime;
            // 分钟差，计算到显示的结束时间有多少个分钟
            // dayjs('2021-07-21 15:59:59').diff(dayjs('2021-07-21 23:59:59'),'minute')
            const day_minute_length = dayjs(endDayTimeRange).diff(dayjs(startTime),"minute");
            // const day_minute_length = 60
            const day_start_minute_length = dayjs(startTime).diff( dayjs(startDayTime), "minute");
            task.renderMarginTop = day_start_minute_length * itemHeightPx;
            task.renderHeight = day_minute_length * itemHeightPx;
            task.renderBackground = this.renderTaskBackground(task);
            task.renderBackColor = this.renderTaskColor(task)
            task.renderColor = "#333333";
            task.isFinished = this.renderIsTaskFinished(task);
            if (_dailyFormatMap.has(startDay)) {
              const lists = _dailyFormatMap.get(startDay);
              lists.push(task);
              _dailyFormatMap.set(startDay, lists);
            }
          });
          allDay.forEach((task) => {
            task.style = this.renderAllDayRowStyle(task);
            task.renderBackground = this.renderTaskBackground(task);
            task.renderBackColor = this.renderTaskColor(task)
            task.isFinished = this.renderIsTaskFinished(task);
          });
          allDay = allDay.filter((task) => task.style.width !== "0px");
          this.allDay = allDay;
          this.dailyFormatMap = _dailyFormatMap;
          let dailyData = [];
          _dailyFormatMap.forEach((item) => {
            if (item.length) {
              dailyData.push(...item);
            }
          });
          this.autoScroll(allDay.length, dailyData.length);
        }
      });
    },
    // 获取日历 月 数据
    getMyCalendar() {
      if (this.dateType === "month") {
        if (this.isLoading) return;
        this.isLoading = true;
        this.$nextTick(() => {
          const el = this.$refs.fullCalendar;
          if (!el) return;
          // this.handleReplaceDayText()
          const calendarApi = el.getApi();
          // 清空
          calendarApi.removeAllEvents();
          const currentDate = utils.getDate(
            this.time.year,
            this.time.month,
            this.time.day
          );
          calendarApi.gotoDate(currentDate);
          this.mouthLoaded = false;
          const data = {
            searchDate: dayjs(currentDate).startOf("month").format("YYYY-MM-DD"),
            // searchDate: '2022-02-27',
            searchDateType: transDateType(this.dateType),
            selections: this.selectListsStr,
            userId: this.activeUser.id,
          };
          searchByConditions(data)
            .then((res) => {
              console.log("res -- 1-月", res);
              if (res.data.code === 200) {
                console.log("month data:", res.data);
                let taskLists = [];
                if (this.selectListsStr === "") {
                  taskLists = [];
                } else {
                  taskLists = res.data.data;
                }
                // 格式化
                taskLists.forEach((task) => {
                  const addTask = {
                    id: task.id,
                    title: task.title || "",
                    start: task.startTime,
                    end: task.endTime,
                    form: task.from,
                    textColor: this.renderTaskColor(task),
                    backgroundColor: this.renderTaskBackground(task),
                    renderBackColor: this.renderTaskColor(task),
                    isFinished: this.renderIsTaskFinished(task),
                  };
                  if (addTask.isFinished) {
                    addTask.className = "finishedLine";
                  }
                  calendarApi.addEvent(addTask);
                });
                // this.handleReplaceDayText()
                // this.handleReplaceWeekText();
                monthTaskLists = taskLists;
              }
            })
            .finally(() => {
              this.isLoading = false;
            });
        });
      }
    },
    // 生成 月任务 对象
    genMouthTaskListsObj(taskLists) {
      const currentDate = utils.getDate(
        this.time.year,
        this.time.month,
        this.time.day
      );

      // 生成月 第一天和最后一天
      const mouthStartDay = dayjs(currentDate).startOf("month").date();
      const mouthEndDay = dayjs(currentDate).endOf("month").date();

      const mouthDateRange = range(mouthStartDay, mouthEndDay + 1);
      const mouthTaskListsObj = {};

      // 填充
      mouthDateRange.forEach((day) => {
        mouthTaskListsObj[`${day}`] = [];
      });

      taskLists.forEach((task) => {
        // 每个任务
        const { startTime, endTime } = task;
        // 开始时间 day, 结束时间 day
        const taskStartDay = dayjs(startTime).date();
        const taskEndDay = dayjs(endTime).date();
        // 数组范围 (16, 17) => (16, 18) => [16, 17]
        let dateRange = [];

        let rangeStart = 1;
        let rangEnd = 1;
        // 任务开始时间 在本月1号之前 取 1号
        if (dayjs(startTime).isBefore(dayjs(currentDate).startOf("month"))) {
          rangeStart = 1;
        } else if (
          dayjs(startTime).isBefore(dayjs(currentDate).endOf("month"))
        ) {
          // 在本月月底之前, 今天之前 取任务开始时间的天
          rangeStart = taskStartDay;
        } else {
          rangeStart = 1;
          // 在本月(X), 今天之后, 取任务开始时间的天
          // rangeStart = taskStartDay
        }

        // 任务结束时间 在 本月后 取本月最大天数28， 30， 31
        if (dayjs(endTime).isAfter(dayjs(currentDate).endOf("month"))) {
          rangEnd = mouthEndDay;
        } else if (
          dayjs(endTime).isAfter(dayjs(currentDate).startOf("month")) &&
          dayjs(endTime).isBefore(dayjs(currentDate).endOf("month"))
        ) {
          // 在本月内 取任务 结束时间 天
          rangEnd = taskEndDay;
        } else {
          rangEnd = 2;
        }

        dateRange = range(rangeStart, rangEnd + 1);
        dateRange.forEach((day) => {
          mouthTaskListsObj[`${day}`].push(task);
        });
      });
      this.mouthTaskListsObj = mouthTaskListsObj;
    },
    // 是否是当前月
    isCurrentMonth(date) {
      const { year: currentYear, month: currentMonth } = utils.getNewDate(
        utils.getDate(this.time.year, this.time.month, 1)
      );
      const { year, month } = utils.getNewDate(date);
      return currentYear === year && currentMonth === month;
    },
    // 是否是今天
    isCurrentDay(date) {
      const {
        year: currentYear,
        month: currentMonth,
        day: currentDay,
      } = utils.getNewDate(new Date());
      const { year, month, day } = utils.getNewDate(date);
      return (
        currentYear === year && currentMonth === month && currentDay === day
      );
    },
    // 是否为 本月星期几 渲染头部
    isCurrentMonthDay(title) {
      const current = dayjs();
      if (current.month() !== this.time.month) return false;
      return title === formatToCNDateDay(current.day());
    },
    // 选择人，设置不同 activeUser
    changeActiveUser(activeUser) {
      this.activeUser = activeUser;
      this.$emit("changeActiveUser", activeUser);
    },
    // 上
    handlePrev() {
      const currentDate = utils.getDate(
        this.time.year,
        this.time.month,
        this.time.day
      );
      let afterDate = new Date();
      switch (this.dateType) {
        case "day":
          afterDate = dayjs(currentDate).subtract(1, "day");
          break;
        case "3day":
          afterDate = dayjs(currentDate).subtract(3, "day");
          break;
        case "week":
          afterDate = dayjs(currentDate).subtract(1, "week");
          break;
        case "month":
          afterDate = dayjs(currentDate).subtract(1, "month");
          const calendarApi = this.$refs.fullCalendar.getApi();
          calendarApi.prev();
          break;
      }
      this.time = utils.getNewDate(dayjs(afterDate).toDate());
      const { year, month, day } = this.time;
      this.headOptions.date = `${year}年${month + 1}月${day}日`;
      // 月任务更新
      if (this.dateType === "month") {
        this.getMyCalendar();
      }
    },
    // 下
    handleNext() {
      const nextMonth = utils.getDate(
        this.time.year,
        this.time.month,
        this.time.day
      );
      let afterDate = new Date();
      switch (this.dateType) {
        case "day":
          afterDate = dayjs(nextMonth).add(1, "day");
          break;
        case "3day":
          afterDate = dayjs(nextMonth).add(3, "day");
          break;
        case "week":
          afterDate = dayjs(nextMonth).add(1, "week");
          break;
        case "month":
          afterDate = dayjs(nextMonth).add(1, "month");
          const calendarApi = this.$refs.fullCalendar.getApi();
          calendarApi.next();
          break;
      }

      this.time = utils.getNewDate(dayjs(afterDate).toDate());
      const { year, month, day } = this.time;
      this.headOptions.date = `${year}年${month + 1}月${day}日`;
      // 月任务更新
      console.log(this.$parent,'sdahjoigwejmf')
      console.log(dayjs(nextMonth).startOf("month").format("YYYY/MM/DD"),'asdasdqweqxcz')
      // this.$parent.changeDate(dayjs(nextMonth).startOf("month").format("YYYY/MM/DD"))
      // this.$parent.handleChoseDay(dayjs(nextMonth).startOf("month").format("YYYY/MM/DD"))
      // this.$parent.valueDate=dayjs(nextMonth).startOf("month").format("YYYY/MM/DD")
      
      if (this.dateType === "month") {
        this.getMyCalendar();
      }
    },
    // 点击回到今天
    handleToday() {
      this.time = utils.getNewDate(new Date());
      // this.returnDate()
      this.$emit("handleToday");
    },
    // 更改日期类型
    handleChangeDateType(dateType) {
      this.$refs.addNewSchedule.reset();
      this.dateType = dateType;
      // 月任务更新
      if (dateType === "month") {
        this.getMyCalendar();
      } else if (dateType === "week") {
        // 获取weekList
        this.changeWeekList();
      }
    },
    changeWeekList() {
      //重置并排序
      this.weekList = [];
      let dayWeek = new Date(
        utils.getDate(this.time.year, this.time.month, this.time.day)
      ).getDay();
      for (let i = -1; Math.abs(i) <= dayWeek; i--) {
        this.weekList.push(i);
      }
      this.weekList.push(0);
      for (let i = 1; i < 7 - dayWeek; i++) {
        this.weekList.push(i);
      }
      this.weekList.sort((a, b) => {
        return a - b;
      });
    },
    // 点击某一天
    handleClickDay(item) {
      this.$forceUpdate();
      this.$emit("handleClickDay", item);
      this.calendarList.map((x) => {
        x.clickDay = false;
      });
      this.$set(item, "clickDay", true);
    },
    // 点击任务
    handleClickTask(task) {
      if(this.showScheduleStatus){
        this.closescheduleDialog()
        return
      }
      this.$emit("handleClickTask", task);
    },
    closescheduleDialog(){
        this.$refs.addNewSchedule.reset();
    },
    // 任务背景
    renderTaskBackground(task) {
      return renderTaskBackground(task.from);
    },
    // 文字颜色
    renderTaskColor(task){
      return renderTaskColor(task.from)
    },
    // 任务是否已完成
    renderIsTaskFinished(task) {
      if (task.close) return true;
      if (task.from === "task") {
        return task.state === 3 || task.state === 4;
      } else if (task.from === "taskCalendarReport") {
        return task.state === 2;
      }
      return false;
    },
    // 渲染全天任务样式
    renderAllDayRowStyle(task) {
      const ccContainer = this.$refs.ccContainer;
      let itemStyle = {};
      if (!ccContainer) {
        return itemStyle;
      }
      // 每个项目长度
      let widthPX = 0;
      const dateType = this.dateType;
      const dayCountMapper = [
        { type: "day", count: 1 },
        { type: "3day", count: 3 },
        { type: "week", count: 7 },
      ];
      dayCountMapper.forEach((item) => {
        if (item.type === dateType) {
          // widthPX = (ccContainer.clientWidth - 80) / item.count;
          widthPX = item.count;
        }
      });
      // 每个任务
      const { startTime, endTime } = task;
      const currentDate = utils.getDate(
        this.time.year,
        this.time.month,
        this.time.day
      );
      // day
      if (dateType === "day") {
        const headerStartTime = `${dayjs(currentDate).format("YYYY-MM-DD 00:00:00")}`;
        const headerEndTime = `${dayjs(currentDate).format("YYYY-MM-DD 23:59:59")}`;
        /**
         * 1. 在一天中之间的, 在一天内的 00:00:00 开始之前 ~ 23:59:59 之间
         * 2. 在一天之外的 startTime 或者 endTime 包含headerStartTime 或者 headerEndTime
         * **/
        if (
          isBetweenOrSame(startTime, headerStartTime, headerEndTime) ||
          isBetweenOrSame(endTime, headerStartTime, headerEndTime) ||
          isBetweenOrSame(headerStartTime, startTime, endTime) ||
          isBetweenOrSame(headerEndTime, startTime, endTime)
        ) {
          // itemStyle = { width: `${widthPX - 20}px` };
          itemStyle = { width: `calc(${100/widthPX}% - 10px)` };
          itemStyle.marginLeft='10px'
          return itemStyle;
        } else {
          // 否则不显示
          itemStyle = { width: "0px" };
          return itemStyle;
        }
      }

      // 3day 和 week
      const headerStartTime =
        dateType === "3day" ? dayjs(currentDate) : dayjs(currentDate).add(this.weekList[0], "day");
      const headerEndTime =
        dateType === "3day" ? dayjs(currentDate).add(2, "day") : dayjs(currentDate).add(this.weekList[6], "day");

      // 直接算length
      // startTime、endTime 在headerStartTime之前, 不显示
      if (
        dayjs(startTime).isBefore(headerStartTime) &&
        dayjs(endTime).isBefore(headerStartTime)
      ) {
        itemStyle = {  width: "0px" };
        return itemStyle;
      }
      // startTime、endTim 在headerEndTime之后，不显示
      if (
        dayjs(startTime).isAfter(headerEndTime) &&
        dayjs(endTime).isAfter(headerEndTime)
      ) {
        itemStyle = { width: "0px" };
        return itemStyle;
      }

      const rangStart = dayjs(startTime).isBefore(headerStartTime)
        ? headerStartTime
        : dayjs(startTime);
      const rangeEnd = dayjs(endTime).isBefore(headerEndTime)
        ? dayjs(endTime)
        : headerEndTime;
      const marginLeft = dateDiff(
        rangStart.format("YYYY-MM-DD"),
        headerStartTime.format("YYYY-MM-DD")
      );
      const width = dateDiff( rangStart.format("YYYY-MM-DD"), rangeEnd.format("YYYY-MM-DD")) || 1;

      const marginLeftStr = `${ marginLeft === 0 ? 0 : (marginLeft - 1) * (100/widthPX) }`;
      // itemStyle = { marginLeft: `${this.$pxTurnVw(marginLeftStr*1 + 10) }`, width: `${width * widthPX -20}px`,};
      itemStyle = { 
        marginLeft: `calc(${Math.ceil(marginLeftStr)}% + 10px)`, 
        width: `calc(${width*(100/widthPX)}% - 20px)`,
      };
      return itemStyle;
    },
    // 点击某一天
    handleDateClick(args) {
      console.log("args", args);
    },
    // 点击某一任务
    handleEventClick(args) {
      if(this.showScheduleStatus){
        this.closescheduleDialog()
        return
      }
      console.log("点击事件", args);
      const id = String(args.event.id);
      const task = monthTaskLists.filter((item) => String(item.id) === id);
      if (task.length === 0) return;
      this.$emit("handleClickTask", task[0]);
    },
    // 去掉 日 字
    handleReplaceDayText() {
      setTimeout(() => {
        const els = document.querySelectorAll(".fc-daygrid-day-number");
        els.forEach((el) => {
          if (el.innerText.indexOf("日") !== -1) {
            el.innerText = el.innerText.substring(
              0,
              el.innerText.indexOf("日")
            );
          }
        });
        this.handleReplaceMoreText();
      }, 200);
    },

    // 替换星期
    handleReplaceWeekText() {
      const els = document.querySelectorAll(".fc-col-header-cell-cushion ");
      els.forEach((el) => {
        if (el.innerText == "Sun") {
          el.innerText = "周日";
        } else if (el.innerText == "Mon") {
          el.innerText = "周一";
        } else if (el.innerText == "Tue") {
          el.innerText = "周二";
        } else if (el.innerText == "Wed") {
          el.innerText = "周三";
        } else if (el.innerText == "Thu") {
          el.innerText = "周四";
        } else if (el.innerText == "Fri") {
          el.innerText = "周五";
        } else if (el.innerText == "Sat") {
          el.innerText = "周六";
        }
      });
    },

    // 替换 more 字
    handleReplaceMoreText() {
      setTimeout(() => {
        const els = document.querySelectorAll(".fc-daygrid-more-link");
        els.forEach((el) => {
          // const countArr = el.innerText.match(/\d+/g);
          // if (countArr.length) {
          //   const count = countArr[0];
          //   el.innerText = `还有${count}个任务`;
          // }
        });
      }, 200);
    },
    //替换更多任务弹窗里的标题
    handleReplacePopoverTilte(){
      this.$nextTick(()=>{
        const elTitle = document.querySelector('.fc-popover-title')
        if(elTitle){
          const {$D,$M,$W} = dayjs(elTitle.innerText)
          const M = $M + 1
          switch ($W) {
            case 0:
              elTitle.innerText = `${M}月${$D}日（周日）`
              break;
            case 1:
              elTitle.innerText = `${M}月${$D}日（周一）`
              break;
            case 2:
              elTitle.innerText = `${M}月${$D}日（周二）`
              break;
            case 3:
              elTitle.innerText = `${M}月${$D}日（周三）`
              break;
            case 4:
              elTitle.innerText = `${M}月${$D}日（周四）`
              break;
            case 5:
              elTitle.innerText = `${M}月${$D}日（周五）`
              break;
            case 6:
              elTitle.innerText = `${M}月${$D}日（周六）`
              break;
            default:
              break;
          }
        }
      })
    },
    formatWeeks(val){
      let day = null
      switch (val.text) {
        case 'Sun':
          day = '周日'
          break;
        case 'Mon':
          day = '周一'
          break;
        case 'Tue':
          day = '周二'
          break;
        case 'Wed':
          day = '周三'
          break;
        case 'Thu':
          day = '周四'
          break;
        case 'Fri':
          day = '周五'
          break;
        case 'Sat':
          day = '周六'
          break;
        default:
          break;
      }
      return day
    },
    // 自动滚动到 8:00
    autoScroll(allDayLength = 0, dailyDataLength = 0) {
      this.$nextTick(() => {
        if (!this.$refs.elScroll) return;
        // 先回滚到顶部，再滚动 8 点
        // const el = this.$refs.elScroll.wrap
        // 计算有几条全天任务
        // const scrollTop = 564 + allDayLength * 40 + (dailyDataLength ? -6 : 0);
        const scrollTop = 480 + allDayLength * 40;
        this.$refs.elScroll.wrap.scrollTop = scrollTop;

        // const elScrollClientTop = el.getBoundingClientRect().top
        // const timeTipEl = document.querySelector('#time_line_tip_8')
        // const timeTipElClientTop = timeTipEl.getBoundingClientRect().top
        // const heightDiff = timeTipElClientTop - elScrollClientTop
        // if(heightDiff > 50) {
        //   this.$refs.elScroll.wrap.scrollTop = heightDiff
        // }
      });
    },
    // 刷新
    handleRefresh() {
      if (this.dateType === "month") {
        this.getMyCalendar();
        this.closescheduleDialog()
      } else {
        this.getDayCalendar();
      }
    },

    // 数据显示处理
    handleData(data) {
      let newDataArr = [];
      if (data.length == 1) {
        newDataArr.push(data);
      } else {
        for (let i = 0; i < data.length; i++) {
          if(!data[i]){
            continue
          }
          let newArr = [];
          // 开始时间-时间戳
          let startTimeStamp = new Date(data[i].startTime).getTime();
          // 结束时间-时间戳
          let endTimeStamp = new Date(data[i].endTime).getTime();
          newArr.push(data[i]);
          for (let j = i + 1; j < data.length; j++) {
            if(!data[j]){
              continue
            }
            // 开始时间-时间戳
            let startTimeStampT = new Date(data[j].startTime).getTime();
            // 结束时间-时间戳
            let endTimeStampT = new Date(data[j].endTime).getTime();
            let a = startTimeStamp < startTimeStampT; // i的开始时间小于j的开始时间
            let b = endTimeStamp > startTimeStampT; // i的结束时间大于j的开始时间
            let c = startTimeStamp < endTimeStampT; // i的开始时间小于j的结束时间
            let d = endTimeStamp < endTimeStampT; // i的结束时间小于j的结束时间

            if (a && b && d) {
              endTimeStamp = endTimeStampT;
            } else if (!a && c && !d) {
              startTimeStamp = startTimeStampT;
            } else if (!a && d) {
              endTimeStamp = endTimeStampT;
              startTimeStamp = startTimeStampT;
            }
            if ((a && b && d) || (!a && c && !d) || (a && !d) || (!a && d)) {
              newArr.push(data[j]);
              delete data[j];
            }
          }
          newDataArr.push(newArr);
        }
      }
      return newDataArr;
    },

    // 获取 top 高度
    getTopHeight(arr){
      console.log('获取 top 高度',arr)
      let top = 0
      if(arr.length > 1){
        let newArr= arr.map(item=>item.renderMarginTop)
        top = Math.min(...newArr) // 最小值
      }else if(arr.length != 0){
        top = arr[0].renderMarginTop
      }
      return top
    },
    // 获取 元素 高度
    getElementHeight(arr){
      console.log('获取 元素 高度',arr)
      let height = 0
      if(arr.length > 1){
        let newArr= arr.map(item=>{
          return item.renderMarginTop+item.renderHeight
        })
        height = Math.max(...newArr) - this.getTopHeight(arr) // 最大值
      }else if(arr.length != 0){
        height = arr[0].renderHeight ? arr[0].renderHeight : 0
      }
      return height
    },
  },
  watch: {
    // 更改了查询类型
    selectListsStr: {
      handler(value) {
        // value 为 null时不执行，为 '' 时可以执行
        if (value !== null) {
          // 月日历
          if (this.dateType === "month") {
            this.getMyCalendar();
          } else {
            if (this.dateType === "week") this.changeWeekList();
            this.getDayCalendar();
          }
        }
      },
    },
    // 更改了props时间
    propsTime: {
      handler(time) {
        this.time = {
          year: time.year,
          month: time.month,
          day: time.day,
        };
        this.getMyCalendar();
      },
      deep: true,
    },
    // 更改了时间
    dateType: {
      handler(value) {
        if (value) {
          // 月日历
          if (this.dateType === "month") {
            this.getMyCalendar();
            
          } else {
            if (this.dateType === "week") this.changeWeekList();
            this.getDayCalendar();
          }
        }
      },
      deep: true,
    },
    // 更改了时间
    time: {
      handler(value) {
        if (value) {
          // 月日历
          if (this.dateType === "month") {
            this.getMyCalendar();
          } else {
            if (this.dateType === "week") this.changeWeekList();
            this.getDayCalendar();
          }
        }
      },
      deep: true,
    },
    // 更改了查询用户
    activeUser: {
      handler(value) {
        if (value) {
          // 月日历
          if (this.dateType === "month") {
            this.getMyCalendar();
          } else {
            if (this.dateType === "week") this.changeWeekList();
            this.getDayCalendar();
          }
        }
      },
    },
    '$store.state.setting.scheduleStatus':{
      handler(newVal){
        if(newVal){
          if(this.dateType != 'month'){
            let [date,time] = dayjs(Date.now()).format("DD HH:MM").split(' ')
            let [hour,minutes] = time.split(':')
            minutes < 30 ? minutes = 30 : (() => {
              minutes = 0;
              hour++
            })()
            let dateIndex = 0
            if(this.dateType == 'week'){
              this.weekList.map((item,index) => {
                if(item == 0){
                  dateIndex = index
                }
              })
            }
            const containerWidth = document.querySelector(".time_task_container").getBoundingClientRect().width;
            const ELwidth = containerWidth / document.getElementsByClassName("time_task_lists").length;
            this.scheduleWidth = ELwidth;
            this.scheduleHeihgt = 30;
            this.scheduleTop = hour * 60 + minutes;
            this.scheduleLeft = dateIndex * ELwidth;
            this.showScheduleStatus = !this.showScheduleStatus;
            this.fixedTop = this.scheduleTop;
            this.$nextTick(() => {
              this.$refs.addNewSchedule.init({position: this.$refs.schedule.getBoundingClientRect(),dateIndex,cellWidth: ELwidth,})
            });
          }else{
            this.showScheduleStatus = true;
            const calendarEl = document.querySelector('.fc-day-today').getBoundingClientRect()
            this.$refs.addNewSchedule.init({
              position: calendarEl,
              startTime: new Date(),
              endTime: new Date(),
            });
          }
        }
      }
    },
    showScheduleStatus:{
      handler(newVal){
        if(newVal == false){
          this.$store.commit('setSchedule',false)
        }
      }
    }
  },
};
</script>

<style lang="scss">
@import "~@fullcalendar/common/main.css";
@import "~@fullcalendar/daygrid/main.css";
.modalBg {
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 90;
  pointer-events: none;
}
.cc-calendar {
  width: 100%;
  height: 100%;
  user-select: none;
  box-sizing: border-box;
  .dateHeaderRow {
    border: 1px solid #dcdcdc;
    margin-left: 65px;
    margin-right: 15px;
  }
  .calendar-week {
    width: 100%;
    height: 46px;
    line-height: 46px;
    border-right: none;
    background: #f3f3f3;
    .week-item {
      float: left;
      width: 14.285%;
      text-align: center;
      font-size: 14px;
      color: #959595;
      border-right: 1px solid #e4e7ea;
      font-weight: 600;
    }
    .week-item-active {
      color: #3471ff;
    }
  }
  .calendar-view {
    width: 100%;
    border-left: 1px solid #e4e7ea;
    .date-view {
      float: left;
      width: 14.285%;
      height: 105px;
      overflow: hidden;
      border-right: 1px solid #e4e7ea;
      border-bottom: 1px solid #e4e7ea;
      cursor: pointer;
      &:hover {
        overflow: auto;
      }
      .date-day {
        padding: 8px 8px 0;
        display: block;
        width: 100%;
        font-size: 14px;
        color: #7f8794;
      }
      .calendar-num {
        margin-top: 6px;
        display: block;
        width: 100%;
        text-align: center;
        font-size: 30px;
        color: #424953;
      }
    }
    .opacity-class {
      opacity: 0.5;
    }
    .month-class {
      background-image: linear-gradient(
        45deg,
        rgba(000, 000, 000, 0.03) 25%,
        transparent 25%,
        transparent 50%,
        rgba(000, 000, 000, 0.03) 50%,
        rgba(000, 000, 000, 0.03) 75%,
        transparent 75%,
        transparent
      );
      background-size: 20px 20px;
    }
    .todayBg {
      .date-day {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #3370FF;
        color: #fff !important;
        width: 26px !important;
        height: 26px !important;
        border-radius: 50% !important;
        padding: 0 !important;
        margin: 10px;
      }
    }
    .handleDay {
      background: #2061ff !important;
      .date-day {
        color: #bccfff !important;
      }
      .calendar-num {
        color: #fff !important;
      }
    }
  }
  .fc .fc-highlight {
    background: #f3fcf2;
  }
  .fc .fc-day-other .fc-daygrid-day-top {
    opacity: 1;
    color: #999;
  }
  // .fc-daygrid-event.fc-event-end {
  //   background-color: #f3fcf2 !important;
  //   .fc-event-title {
  //     color: #49a240 !important;
  //   }
  // }
  .fc .fc-daygrid-more-link{
    text-align: left;
    padding-left: 10px;
    color: #8F959E;
  }
  .fc-theme-standard .fc-popover{
    border-radius: 4px;
    padding: 0 15px;
  }
  .fc-popover-header{
    border-bottom: 0;
    padding: 20px 0 5px 0!important;
  }
  .fc .fc-more-popover .fc-popover-body{
    padding: 10px 0;
    max-height: 226px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background-color: #fff;
      border-radius: 0 10px 10px 0;
    }
  }
  .fc .fc-daygrid-day-number{
    font-size: 18px;
    color: #0f1633;
    padding: 0;
    margin: 10px;
  }
  .fc-theme-standard td, .fc-theme-standard th{
    border-left: none;
    border-right: none;
  }
  .fc .fc-scrollgrid-liquid{
    border-top: none;
    border-left: none;
  }
  .fc .fc-day-other .fc-daygrid-day-top{
    >a{
      color: #8F959E;
    }
  }
  .fc-scrollgrid-sync-inner{
    text-align: left;
    .fc-col-header-cell-cushion{
      margin-left: 5px;
    }
  }
  .fc .fc-popover{
    z-index: 1999;
  }
  .fc-daygrid-block-event .fc-event-time, .fc-daygrid-block-event .fc-event-title{
    font-size: 12px;
    font-family: Source Han Sans CN;
  }
}
</style>
