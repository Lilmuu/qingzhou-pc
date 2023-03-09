import md5 from 'blueimp-md5'
import { getItem } from '@/utils/imUtil/storage'

function createApiSecret (obj) {
  obj.time = new Date().getTime()
  let key = process.env.VUE_APP_API_KEY + obj.time
  let md5Key = md5(key)
  obj.secret = md5Key
  return obj
}

// 封装请求
export function request (api, params = {}) {
  const token = getItem('Token') || ''
  if (token) params.access_token = token
  const data = createApiSecret(params)
  return data
}

// 文件请求封装
export function file (api, params = {}) {
  const token = getItem('Token') || ''
  if (token) params.access_token = token
  const data = createApiSecret(params)
  return data
}

export default { request, file }
