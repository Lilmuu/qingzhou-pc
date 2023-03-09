/*
 * @Author: your name
 * @Date: 2022-03-29 15:59:27
 * @LastEditTime: 2022-04-24 14:53:11
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\utils\imUtil\storage.js
 */
import base64 from '@/utils/base64'
const LocalStoragePrefix = 'SKIM_'

/**
 * 存储
 * @param {string} key 键
 * @param {any} data 存储的数据
 * @param {number} expire 存储时间(小时) 默认永久存储
 * @param {boolean} base64 是否base64加密 默认false
 */
export function setItem (key, data, params) {
  let duration = false
  if (typeof params === 'object') {
    if (params.expire) { duration = new Date().getTime() + (params.expire * 60 * 60 * 1000) }
    if (params.base64) { data = base64.encode(JSON.stringify(data)) }
  }
  return window.localStorage.setItem(LocalStoragePrefix + key, JSON.stringify({ data, expire: duration }))
}

// 获取（isDecode 当取的数据是base64 必须传入true才会解码)
export function getItem (key, isDecode = false) {
  const item = JSON.parse(window.localStorage.getItem(LocalStoragePrefix + key) || JSON.stringify({}))
  if (item && isDecode) {
    const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
    if (isBase64.test(item.data)) {
      item.data = JSON.parse(base64.decode(item.data))
    }
  }
  return item ? item.data : null
}

// 移除单个
export function removeItem (key) {
  return window.localStorage.removeItem(LocalStoragePrefix + key)
}

// 清除所有
export function clearAll () {
  return window.localStorage.clear()
}

// 清除所有过期的 (endTime 设置到期的时间 默认使用本地时间)
export function clearExpire (endTime, callback) {
  let currentTime = null

  if (!endTime) {
    currentTime = new Date().getTime()
  } else {
    if (typeof endTime === 'number') {
      currentTime = endTime
    } else if (typeof endTime === 'string') {
      currentTime = new Date(endTime).getTime()
    }
  }
  let isExpire = false
  for (const key in window.localStorage) {
    const re = new RegExp(`^[${LocalStoragePrefix}]`)
    if (re.test(key)) {
      if (JSON.parse(window.localStorage[key]).expire) {
        if (JSON.parse(window.localStorage[key]).expire - currentTime <= 0) {
          window.localStorage.removeItem(key)
          isExpire = true
        }
      }
    }
  }
  if (isExpire && typeof callback === 'function') { callback() }
}

export default { setItem, getItem, removeItem, clearAll, clearExpire }
