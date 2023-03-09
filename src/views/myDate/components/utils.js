import dayjs from "dayjs";

const englishMonthList = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
]

const CNDateDay = [
  { week: '周日', num: 0 },
  { week: '周一', num: 1 },
  { week: '周二', num: 2 },
  { week: '周三', num: 3 },
  { week: '周四', num: 4 },
  { week: '周五', num: 5 },
  { week: '周六', num: 6 }
]

const CNDateDay2 = [
  { week: '星期日', num: 0 },
  { week: '星期一', num: 1 },
  { week: '星期二', num: 2 },
  { week: '星期三', num: 3 },
  { week: '星期四', num: 4 },
  { week: '星期五', num: 5 },
  { week: '星期六', num: 6 }
]

const formatToCNDateDay = (dateDay) => {
  let str = ''
  CNDateDay.forEach(item => {
    if (item.num === dateDay) {
      str = item.week
    }
  })
  return str
}

/**
 * 0日 1三日 2周 3月
 * @param   {String}  dateType
 * @return  {Number}
 */
const transDateType = (dateType) => {
  let num = 0
  switch (dateType) {
    case 'day':
      num = 0
      break;
    case '3day':
      num = 1
      break;
    case 'week':
      num = 2
      break;
    case 'month':
      num = 3
      break;
  }
  return num
}

const formatToCNDateDay2 = (dateDay) => {
  let str = ''
  CNDateDay2.forEach(item => {
    if (item.num === dateDay) {
      str = item.week
    }
  })
  return str
}

const getNewDate = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  return { year, month, day }
}

const getDate = (year, month, day) => {
  return new Date(year, month, day)
}

const englishMonth = (month) => {
  let engMonth

  englishMonthList.map(() => {
    engMonth = englishMonthList[month]
  })

  return engMonth
}

const formatDate = (date) => {
  date = Number(date)
  return date < 10 ? `0${date}` : date
}

/**
 * 判断是否在 start 和 end 之间，包含相同, 默认精确到 s
 * @param   {dayjs.ConfigType}          t
 * @param   {dayjs.ConfigType}          t_start
 * @param   {dayjs.ConfigType}          t_end
 * @param   {dayjs.OpUnitType | null}   c
 * @return  {boolean}
 * */
const isBetweenOrSame = (t, t_start, t_end, c = 's') => {
  const tFormat = dayjs(t).format('YYYY-MM-DD')
  const tStartFormat = dayjs(t_start).format('YYYY-MM-DD')
  const tEndFormat = dayjs(t_end).format('YYYY-MM-DD')
  return dayjs(t).isBetween(t_start, dayjs(t_end), c) || tFormat === tStartFormat || tFormat === tEndFormat
}

// 一段时间范围内有多少天
// dateDiff('2020-11-25', '2020-12-01') --> 7
const dateDiff = (first, second) => {
  const firstDate = new Date(first)
  const secondDate = new Date(second)
  const diff = Math.abs(firstDate.getTime() - secondDate.getTime())
  const result = parseInt(diff / (1000 * 60 * 60 * 24))
  return result ? result + 1 : 0
}

const taskType = [
  { background: '#F4F8FF', color: '#3370FF', label: '工作任务', value: 'task'},
  { background: '#FFF4F4', color: '#F54A45', label: '会议', value: 'meeting'},
  { background: '#E7F9F9', color: '#37D1D1', label: '出差', value: 'businessTrip'},
  { background: '#FFF7E7', color: '#FF8800', label: '汇报交流', value: 'taskCalendarReport'},
  { background: '#F3FCF2', color: '#41CC33', label: '个人提醒', value: 'taskRemind'}
]

/**
 * 渲染背景色
 * @param   {String}  type
 * @return  {String}
 * */
const renderTaskBackground = (type) => {
  let background = ''
  taskType.forEach(item => {
    if(item.value === type) {
      background = item.background
    }
  })
  return background
}

const renderTaskColor = (type) => {
  let color = ''
  taskType.forEach(item => {
    if(item.value === type) {
      color = item.color
    }
  })
  return color
}

// 关联 为空则代表没有关联任何
const transFormType = (from) => {
  const fromType = [
    { from: '', value: null },
    { from: null, value: null },
    { from: undefined, value: null },
    { from: 'taskCalendarReport', value: 0 },
    { from: 'meeting', value: 1 },
    { from: 'businessTrip', value: 2 },
  ]
  let value = null
  fromType.forEach(item => {
    if (item.from === from) {
      value = item.value
    }
  })
  return value
}

/**
 * 跨天的     MM-DD start(HH:mm) ~ MM-DD endTime(HH:mm)
 * 没跨天的   MM-DD start(HH:mm) ~ endTime(HH:mm)
 * @param   {dayjs.ConfigType}    startTime
 * @param   {dayjs.ConfigType}    endTime
 * @return  {String}
 * */
const formatRangeTime = (startTime, endTime) => {
  if(startTime === endTime) {
    return `${ dayjs(startTime).format('MM月DD日 HH:mm') }`
  }
  if (dayjs(endTime).isAfter(dayjs(startTime).endOf('day'))) {
    return `${ dayjs(startTime).format('MM月DD日 HH:mm') } ~ ${ dayjs(endTime).format('MM月DD日 HH:mm') }`
  } else {
    return `${ dayjs(startTime).format('MM月DD日 HH:mm') } ~ ${ dayjs(endTime).format('HH:mm') }`
  }
}

export {
  getNewDate,
  getDate,
  englishMonth,
  formatDate,
  formatToCNDateDay,
  formatToCNDateDay2,
  dateDiff,
  transDateType,
  renderTaskBackground,
  renderTaskColor,
  isBetweenOrSame,
  transFormType,
  formatRangeTime,
}
