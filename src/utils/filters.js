/**
 * @description     vue filters
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:19:05
 */

import Vue from 'vue'
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday';
import isBetween from 'dayjs/plugin/isBetween'
import 'dayjs/locale/zh-cn' // import locale

dayjs.locale('zh-cn') // use locale
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isBetween)
const currentYear = Number(dayjs().format('YYYY'))

// 行时间
const renderCloDateDay = (value) => {
  if(!value) return ''
  const dataYear = Number(dayjs(value).format('YYYY'))
  // 今天 => 时:分
  if (dayjs(value).isToday()) {
    return dayjs(value).format('HH:mm')
  }
  // 昨天 => 昨天
  if (dayjs(value).isYesterday()) {
    return '昨天'
  }
  // 往年数据 年-月-日
  if(dataYear < currentYear) {
    return dayjs(value).format('YYYY-MM-DD')
  }
  // 今年 => 月-日
  return dayjs(value).format('MM-DD')
}

/**
 * 消息时间线
 * @param   value    {Number}    number 13位时间戳
 * @return  {String}
 * */
const renderMessageDateLineDay = (value) => {
  if (!value) return ''
  if (typeof value === "string") {
    console.warn('消息时间线value类型必须为Number')
    return ''
  }
  const dataYear = Number(dayjs(value).format('YYYY'))
  // 今天 => 时:分
  if (dayjs(value).isToday()) {
    return dayjs(value).format('HH:mm')
  }
  // 昨天 => 昨天 时:分
  if (dayjs(value).isYesterday()) {
    return dayjs(value).format('昨天 HH:mm')
  }
  // 往年数据 年-月-日 时:分
  if(dataYear < currentYear) {
    return dayjs(value).format('YYYY年M月DD日 HH:mm')
  }
  // 今年 => 月-日 时:分
  return dayjs(value).format('M月DD日 HH:mm')
}

const Group = {
  // 今天内发布的，显示类似 "3分钟前" 这样的时间语法(fromNow) 否则显示时间格式(MM-DD HH:mm)
  currentRelativeTime (date) {
    if(!date) return ''
    const isToday = !dayjs(new Date()).isAfter(dayjs(date).format('YYYY-MM-DD'), 'day')
    return isToday ? dayjs(date).fromNow() : dayjs(date).format('MM-DD HH:mm')
  },

  // 行时间
  renderCloDate (date) {
    if(!date) return ''
    return renderCloDateDay(date)
  },

  /**
   * 消息时间线
   * @param   date    {Number}    number 13位时间戳
   * @return  {String}
   * */
  renderMessageDateLine(date) {
    if (!date) return ''
    if (typeof date === "string") {
      console.warn('消息时间线date类型必须为Number')
      return ''
    }
    return renderMessageDateLineDay(date)
  },

  // 根据出生日期转年龄
  birthdateToAge (birthday) {
    return parseInt(dayjs(birthday, 'YYYY-MM-DD').fromNow()) + '岁'
  },

  // 根据日期转星期几 (周日, 周一, ...)
  dateToWeekDay (date) {
    return dayjs(date).format('ddd')
  }
}

for (let key in Group) { Vue.filter(key, Group[key]) }
