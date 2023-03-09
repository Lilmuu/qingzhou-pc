import base64 from '@/utils/base64'
import cookie from '@/utils/imUtil/cookieModule'

// import cookie from 'js-cookie' // https://github.com/js-cookie/js-cookie
// import { Base64 } from 'js-base64' // https://github.com/dankogai/js-base64

export default {
  /**
   * 存储
   * @param {string} key 键
   * @param {any} data 存储的数据
   * @param {number} params 参数 expire (Number) => 存储时间(小时) 默认永久存储,  base64 (Boolean) => 是否base64编码 默认false
   */
  set (key, data, params) {
    let duration = 999999 // 默认存储时间（小时）
    if (typeof params === 'object') {
      if (params.expire) { duration = params.expire }
      if (params.base64) { data = base64.encode(JSON.stringify(data)) }
    }
    return cookie.set(key, JSON.stringify({ data }), { expires: duration })
  },

  // 获取 （isDecode 当取的数据是base64 必须传入true才会解码)
  get (key, isDecode = false) {
    const item = JSON.parse(cookie.get(key) || JSON.stringify({}))
    if (item && isDecode) {
      const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
      if (isBase64.test(item.data)) {
        item.data = JSON.parse(base64.decode(item.data))
      }
    }
    return item ? item.data : null
  },

  // 删除
  remove (key) {
    return cookie.remove(key)
  }
}
