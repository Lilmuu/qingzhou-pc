/**
 * @description     validate 验证器
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:20:03
 */

export function isvalidUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/* 合法uri*/
export function validateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/* 小写字母*/
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母*/
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母*/
export function validatAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

export function isPhone(s) {
  return /^1[345789]\d{9}$/.test(s)
}
// 新密码强度验证
export const validatePwd = (rule, value, callback) => {
  const reg = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{8,16}')
  if (!reg.test(value)) {
    callback(new Error("密码中必须包含字母、数字且长度为8~16个字符"))
  } else {
    callback()
  }
}

// 检验输入字符为空
export const validateHasBlank = (rule, value, callback) => {
  if (hasBlank(value)) {
    callback(new Error("输入字符为空"))
  } else {
    callback()
  }
}

/**
 * 是否为空字符
 * @param value     {string}
 * @return         {Boolean}
 */
export function hasBlank(value) {
  const reg = /^\s*$/
  return reg.test(value)
}

/**
 * 是否为空字符
 * @param str     {string}
 * @return         {Boolean}
 */
export const isEmail = (str) => {
  return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(str)
}

/**
 * 是否只为数字
 * @param str     {string}
 * @return         {Boolean}
 */
export const isOnlyNumber = (str) => {
  return /^[0-9]*$/.test(str)
}

/**
 * 获取邮箱用户名
 * Beats0<beats0@qq.com>   =>  Beats0
 * @param str     {string}
 * @return        {string}
 * */
export const lgMail = (str = '') => {
  const reg = /.*(\<)/g
  const result = str.match(reg)
  if(result) {
    return result[0].replace('<', '')
  }
  return ''
}

/**
 * 获取邮箱地址
 * Beats0<beats0@qq.com>   =>  beats0@qq.com
 * @param str     {string}
 * @return        {string}
 * */
export const getEmailAddress = (str) => {
  const reg = /([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})/
  const result = str.match(reg)
  if(result) {
    return result[0]
  }
  return ''
}

/**
 * 是否为类邮箱格式
 * Beats0<beats0@qq.com>   =>  true
 * @param str     {string}
 * @return        {Boolean}
 * */
export const isLikeEmail = (str = '') => {
  if (!str) return false
  if (isEmail(str)) {
    return true
  }
  const lt1 = str.indexOf('<') !== -1
  const lr1 = str.indexOf('>') !== -1
  if (lt1 && lr1) {
    const email = getEmailAddress(str)
    if (email) return true
  }
  return false
}

/**
 * 获取邮箱用户名，邮箱地址
 * Beats0<beats0@qq.com>   =>  { name: 'Beats0', email: 'beats0@qq.com' }
 * @param str     {string}
 * @return        {Object}
 * */
export const getMailNameValue = (str = '') => {
  let obj = {
    name: '',
    email: ''
  }
  if (isEmail(str)) {
    obj = {
      name: str,
      email: str
    }
    return obj
  }
  if (isLikeEmail(str)) {
    obj = {
      name: lgMail(str),
      email: getEmailAddress(str)
    }
    return obj
  }
  return obj
}

// 邮箱validater验证
export const validateEmail = (rule, value, callback) => {
  if (!isEmail(value)) {
    callback(new Error("请输入正确的邮箱"))
  } else {
    callback()
  }
}
