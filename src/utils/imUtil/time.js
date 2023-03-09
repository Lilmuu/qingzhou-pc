import dayjs from "dayjs";

// 时间戳转日期 { time -> 时间戳, format -> 日期格式 }
export const timestampToFormat = (time, format) => {
  return dayjs(time).format(format)
}

// 当前日期 { format -> 日期格式 }
export const nowdataToFormat = (format) => {
  return dayjs().format(format)
}

// 当前日期 { years -> 年, format -> 日期格式 }
export const yearsAgeToFormat = (years, format) => {
  return dayjs().subtract(years, 'year').format(format)
}

export default  { timestampToFormat, nowdataToFormat, yearsAgeToFormat }
