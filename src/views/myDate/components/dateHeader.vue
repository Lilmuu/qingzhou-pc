<template>
  <div :class="['timer-row-item-right date-header', isToday ? 'current-day' : '']">
    <div style="height: 20px;">{{ dateHeader.week }}</div>
    <span>{{ dateHeader.dateNum }}</span>
  </div>
</template>

<script>
import * as utils from "@/views/myDate/components/utils"
import dayjs from "dayjs"
import { formatToCNDateDay } from "@/views/myDate/components/utils"

export default {
  name: "dateHeader",
  props: {
    // 时间
    time: {
      type: Object,
      required: true
    },
    diff: {
      type: Number,
      default: 0
    }
  },
  computed: {
    dateHeader() {
      const currentDate = utils.getDate(this.time.year, this.time.month, this.time.day)
      const afterDate = dayjs(currentDate).add(this.diff, 'day')
      return {
        week: formatToCNDateDay(dayjs(afterDate).day()), dateNum: dayjs(afterDate).date()
      }
    },
    // 是否为今天
    isToday() {
      const currentDate = utils.getDate(this.time.year, this.time.month, this.time.day)
      const afterDate = dayjs(currentDate).add(this.diff, 'day')
      return afterDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    }
  }
}
</script>

<style lang="scss" scoped>
.date-header {
  flex: 1;
  border: none;
  color: #959595;
  flex-direction: column;
  padding: 6px 10px;
  border-right: 1px solid #DCDCDC;
  &:last-child {
    border-right: 0;
  }
  >div{
    font-size: 14px;
    color: #8F959E;
    font-family: Source Han Sans CN;
  }
  >span{
    font-size: 30px;
    font-family: Arial;
    font-weight: 400;
    color: #8F959E;
  }
}
.current-day {
  >span, >div{
    color: #3370FF;
  }
}
</style>
