<template>
  <div class="monthPickerPanel el-picker-panel__body-wrapper">
    <div class="el-date-picker__header"
         :class="{ 'el-date-picker__header--bordered': currentView === 'year' || currentView === 'month' }"
         v-show="currentView !== 'time'">
      <!-- <button type="button"
              @click="prevYear"
              :aria-label="t(`el.datepicker.prevYear`)"
              class="el-picker-panel__icon-btn el-date-picker__prev-btn el-icon-d-arrow-left">
      </button> -->
      <div>
          <!-- <span @click="showYearPicker" -->
          <span role="button"
                class="el-date-picker__header-label">{{ yearLabel }}</span>
        <!-- <span @click="showMonthPicker" -->
        <span v-show="currentView === 'date'"
              role="button"
              class="el-date-picker__header-label"
              :class="{ active: currentView === 'month' }">{{t(`el.datepicker.month${ month + 1 }`).replace(' ','')}}</span>
      </div>
      <div>
        <button type="button"
                @click="prevMonth"
                v-show="currentView === 'date'"
                :aria-label="t(`el.datepicker.prevMonth`)"
                class="el-picker-panel__icon-btn el-date-picker__prev-btn el-icon-arrow-left">
        </button>
        <button type="button"
          @click="nextMonth"
          v-show="currentView === 'date'"
          :aria-label="t(`el.datepicker.nextMonth`)"
          class="el-picker-panel__icon-btn el-date-picker__next-btn el-icon-arrow-right"
          style="margin-left: 50px;">
        </button>
      </div>
      <!-- <button type="button"
              @click="nextYear"
              :aria-label="t(`el.datepicker.nextYear`)"
              class="el-picker-panel__icon-btn el-date-picker__next-btn el-icon-d-arrow-right">
      </button> -->
    </div>
    <div class="el-picker-panel__content">
      <date-table
              v-show="currentView === 'date'"
              @pick="handleDatePick"
              :selection-mode="selectionMode"
              :first-day-of-week="firstDayOfWeek"
              :value="value"
              :default-value="defaultValue ? new Date(defaultValue) : null"
              :date="date"
              :cell-class-name="cellClassName"
              :disabled-date="disabledDate">
      </date-table>
    </div>
  </div>
</template>

<script>
import Locale from "element-ui/src/mixins/locale";
import Clickoutside from "element-ui/src/utils/clickoutside";
import {
  changeYearMonthAndClampDate,
  clearMilliseconds,
  clearTime,
  extractDateFormat,
  extractTimeFormat,
  formatDate,
  getWeekNumber,
  isDate,
  modifyDate,
  modifyTime,
  modifyWithTimeString,
  nextMonth,
  nextYear,
  parseDate,
  prevMonth,
  prevYear,
  timeWithinRange
} from "element-ui/src/utils/date-util";
import DateTable from "element-ui/packages/date-picker/src/basic/date-table";

import dayjs from "dayjs";

export default {
  name: "MonthPicker",
  mixins: [Locale],
  directives: { Clickoutside },
  model: {
    prop: 'propDate',
    event: 'pick'
  },
  data() {
    return {
      popperClass: '',
      date: new Date(),
      value: '',
      defaultValue: null, // use getDefaultValue() for time computation
      defaultTime: null,
      showTime: false,
      selectionMode: 'day',
      shortcuts: '',
      visible: false,
      currentView: 'date',
      disabledDate: '',
      cellClassName: '',
      selectableRange: [],
      firstDayOfWeek: 7,
      showWeekNumber: false,
      timePickerVisible: false,
      format: '',
      arrowControl: false,
      userInputDate: null,
      userInputTime: null
    }
  },
  components: {
    DateTable
  },
  computed: {
    year() {
      return this.date.getFullYear();
    },

    month() {
      return this.date.getMonth();
    },

    week() {
      return getWeekNumber(this.date);
    },

    monthDate() {
      return this.date.getDate();
    },

    footerVisible() {
      return this.showTime || this.selectionMode === 'dates';
    },

    visibleTime() {
      if (this.userInputTime !== null) {
        return this.userInputTime;
      } else {
        return formatDate(this.value || this.defaultValue, this.timeFormat);
      }
    },

    visibleDate() {
      if (this.userInputDate !== null) {
        return this.userInputDate;
      } else {
        return formatDate(this.value || this.defaultValue, this.dateFormat);
      }
    },

    yearLabel() {
      const yearTranslation = this.t('el.datepicker.year');
      if (this.currentView === 'year') {
        const startYear = Math.floor(this.year / 10) * 10;
        if (yearTranslation) {
          return startYear + ' ' + yearTranslation + ' - ' + (startYear + 9) + ' ' + yearTranslation;
        }
        return startYear + ' - ' + (startYear + 9);
      }
      return this.year + yearTranslation;
    },

    timeFormat() {
      if (this.format) {
        return extractTimeFormat(this.format);
      } else {
        return 'HH:mm:ss';
      }
    },

    dateFormat() {
      if (this.format) {
        return extractDateFormat(this.format);
      } else {
        return 'yyyy-MM-dd';
      }
    }
  },
  methods: {
    proxyTimePickerDataProperties() {
      const format = timeFormat => {this.$refs.timepicker.format = timeFormat;};
      const value = value => {this.$refs.timepicker.value = value;};
      const date = date => {this.$refs.timepicker.date = date;};
      const selectableRange = selectableRange => {this.$refs.timepicker.selectableRange = selectableRange;};

      this.$watch('value', value);
      this.$watch('date', date);
      this.$watch('selectableRange', selectableRange);

      format(this.timeFormat);
      value(this.value);
      date(this.date);
      selectableRange(this.selectableRange);
    },

    handleClear() {
      this.date = this.getDefaultValue();
      this.$emit('pick', null);
    },

    emit(value, ...args) {

     // console.log(value, ...args)
      if (!value) {
        this.$emit('pick1', value, ...args);
      } else if (Array.isArray(value)) {
        const dates = value.map(date => this.showTime ? clearMilliseconds(date) : clearTime(date));
        this.$emit('pick', dates, ...args);
        console.log('pick time2', dates, ...args)
      } else {
       // console.log('pick time3', this.showTime ? clearMilliseconds(value) : clearTime(value), ...args)
        this.$emit('pick', this.showTime ? clearMilliseconds(value) : clearTime(value), ...args);
      }
      this.userInputDate = null;
      this.userInputTime = null;
    },

    // resetDate() {
    //   this.date = new Date(this.date);
    // },

    showMonthPicker() {
      this.currentView = 'month';
    },

    showYearPicker() {
      this.currentView = 'year';
    },

    // XXX: 没用到
    // handleLabelClick() {
    //   if (this.currentView === 'date') {
    //     this.showMonthPicker();
    //   } else if (this.currentView === 'month') {
    //     this.showYearPicker();
    //   }
    // },

    prevMonth() {
      this.date = prevMonth(this.date);
    },

    nextMonth() {
      this.date = nextMonth(this.date);
    },

    prevYear() {
      if (this.currentView === 'year') {
        this.date = prevYear(this.date, 10);
      } else {
        this.date = prevYear(this.date);
      }
    },

    nextYear() {
      if (this.currentView === 'year') {
        this.date = nextYear(this.date, 10);
      } else {
        this.date = nextYear(this.date);
      }
    },

    handleShortcutClick(shortcut) {
      if (shortcut.onClick) {
        shortcut.onClick(this);
      }
    },

    handleTimePick(value, visible, first) {
      if (isDate(value)) {
        const newDate = this.value
          ? modifyTime(this.value, value.getHours(), value.getMinutes(), value.getSeconds())
          : modifyWithTimeString(this.getDefaultValue(), this.defaultTime);
        this.date = newDate;
        this.emit(this.date, true);
      } else {
        this.emit(value, true);
      }
      if (!first) {
        this.timePickerVisible = visible;
      }
    },

    handleTimePickClose() {
      this.timePickerVisible = false;
    },

    handleMonthPick(month) {
      if (this.selectionMode === 'month') {
        this.date = modifyDate(this.date, this.year, month, 1);
        this.emit(this.date);
      } else {
        this.date = changeYearMonthAndClampDate(this.date, this.year, month);
        // TODO: should emit intermediate value ??
        // this.emit(this.date);
        this.currentView = 'date';
      }
    },

    handleDatePick(value) {
      let nowTime = new Date();
      if (dayjs(value).isBefore(dayjs(nowTime), 'second')) {
        this.$message.warning("提醒日期不能小于当前日期");
        return
      }

      if (this.selectionMode === 'day') {
        let newDate = this.value
          ? modifyDate(this.value, value.getFullYear(), value.getMonth(), value.getDate())
          : modifyWithTimeString(value, this.defaultTime);
        // change default time while out of selectableRange
        if (!this.checkDateWithinRange(newDate)) {
          newDate = modifyDate(this.selectableRange[0][0], value.getFullYear(), value.getMonth(), value.getDate());
        }
        this.date = newDate;
        this.value = newDate
        this.emit(this.date, this.showTime);

      } else if (this.selectionMode === 'week') {
        this.emit(value.date);
      } else if (this.selectionMode === 'dates') {
        this.emit(value, true); // set false to keep panel open
      }
    },

    handleYearPick(year) {
      if (this.selectionMode === 'year') {
        this.date = modifyDate(this.date, year, 0, 1);
        this.emit(this.date);
      } else {
        this.date = changeYearMonthAndClampDate(this.date, year, this.month);
        // TODO: should emit intermediate value ??
        // this.emit(this.date, true);
        this.currentView = 'month';
      }
    },

    changeToNow() {
      // NOTE: not a permanent solution
      //       consider disable "now" button in the future
      if ((!this.disabledDate || !this.disabledDate(new Date())) && this.checkDateWithinRange(new Date())) {
        this.date = new Date();
        this.emit(this.date);
      }
    },

    confirm() {
      if (this.selectionMode === 'dates') {
        this.emit(this.value);
      } else {
        // value were emitted in handle{Date,Time}Pick, nothing to update here
        // deal with the scenario where: user opens the picker, then confirm without doing anything
        const value = this.value
          ? this.value
          : modifyWithTimeString(this.getDefaultValue(), this.defaultTime);
        this.date = new Date(value); // refresh date
        this.emit(value);
      }
    },

    resetView() {
      if (this.selectionMode === 'month') {
        this.currentView = 'month';
      } else if (this.selectionMode === 'year') {
        this.currentView = 'year';
      } else {
        this.currentView = 'date';
      }
    },

    handleEnter() {
      document.body.addEventListener('keydown', this.handleKeydown);
    },

    handleLeave() {
      this.$emit('dodestroy');
      document.body.removeEventListener('keydown', this.handleKeydown);
    },

    handleKeydown(event) {
      const keyCode = event.keyCode;
      const list = [38, 40, 37, 39];
      if (this.visible && !this.timePickerVisible) {
        if (list.indexOf(keyCode) !== -1) {
          this.handleKeyControl(keyCode);
          event.stopPropagation();
          event.preventDefault();
        }
        if (keyCode === 13 && this.userInputDate === null && this.userInputTime === null) { // Enter
          this.emit(this.date, false);
        }
      }
    },

    handleKeyControl(keyCode) {
      const mapping = {
        'year': {
          38: -4, 40: 4, 37: -1, 39: 1, offset: (date, step) => date.setFullYear(date.getFullYear() + step)
        },
        'month': {
          38: -4, 40: 4, 37: -1, 39: 1, offset: (date, step) => date.setMonth(date.getMonth() + step)
        },
        'week': {
          38: -1, 40: 1, 37: -1, 39: 1, offset: (date, step) => date.setDate(date.getDate() + step * 7)
        },
        'day': {
          38: -7, 40: 7, 37: -1, 39: 1, offset: (date, step) => date.setDate(date.getDate() + step)
        }
      };
      const mode = this.selectionMode;
      const year = 3.1536e10;
      const now = this.date.getTime();
      const newDate = new Date(this.date.getTime());
      while (Math.abs(now - newDate.getTime()) <= year) {
        const map = mapping[mode];
        map.offset(newDate, map[keyCode]);
        if (typeof this.disabledDate === 'function' && this.disabledDate(newDate)) {
          continue;
        }
        this.date = newDate;
        this.$emit('pick', newDate, true);
        break;
      }
    },

    handleVisibleTimeChange(value) {
      const time = parseDate(value, this.timeFormat);
      if (time && this.checkDateWithinRange(time)) {
        this.date = modifyDate(time, this.year, this.month, this.monthDate);
        this.userInputTime = null;
        this.$refs.timepicker.value = this.date;
        this.timePickerVisible = false;
        this.emit(this.date, true);
      }
    },

    handleVisibleDateChange(value) {
      const date = parseDate(value, this.dateFormat);
      if (date) {
        if (typeof this.disabledDate === 'function' && this.disabledDate(date)) {
          return;
        }
        this.date = modifyTime(date, this.date.getHours(), this.date.getMinutes(), this.date.getSeconds());
        this.userInputDate = null;
        this.resetView();
        this.emit(this.date, true);
      }
    },

    isValidValue(value) {
      return value && !isNaN(value) && (
        typeof this.disabledDate === 'function'
          ? !this.disabledDate(value)
          : true
      ) && this.checkDateWithinRange(value);
    },

    getDefaultValue() {
      // if default-value is set, return it
      // otherwise, return now (the moment this method gets called)
      return this.defaultValue ? new Date(this.defaultValue) : new Date();
    },

    checkDateWithinRange(date) {
      return this.selectableRange.length > 0
        ? timeWithinRange(date, this.selectableRange, this.format || 'HH:mm:ss')
        : true;
    }
  },
  watch: {
    'propDate': function (value) {
      this.date = value
    }
  }
}
</script>

<style lang="scss">
  .monthPickerPanel {
    .el-picker-panel__content {
      margin: 15px -10px;
    }
    .el-date-table {
      width: 100%;
    }
    .el-date-picker__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 18px;
      .el-picker-panel__icon-btn {
        font-size: 16px;
      }
      .el-date-picker__header-label{
        color: #37476B;
        padding: 0;
        cursor: unset;
      }
    }
    // .el-date-table td, .el-date-table td div {
    //   height: 25px;
    // }
    .el-date-table td{
      padding:15px 0 0 0;
    }
    .el-date-table td div{
      padding:0;
      height:32px;
    }
    .el-date-table td span{
      width: 32px;
      height: 32px;
      display:flex;
      justify-content:center;
      align-items:center;
      background:#F3F3F3;
      border-radius:4px;
    }
    .el-date-table td.today span{
      background:#86A5FF;
      color:#fff;
    }
  }
</style>
