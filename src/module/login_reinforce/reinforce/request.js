/*
 * @Author: your name
 * @Date: 2021-12-16 16:16:06
 * @LastEditTime: 2022-02-28 09:42:19
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\module\login_reinforce\reinforce\request.js
 */
import AuthorityUtils from '../resource/apiAuthUtils'
import { getItem } from '@/utils/imUtil/storage'

// 封装请求
export function request (api, params = {}) {
  console.log('request data before ==>', api, params)
  const httpKey = getItem('HttpKey') || ''
  const userId = getItem('MeId') || ''
  const token = getItem('Token') || ''
  const data = AuthorityUtils.apiCreateCommApiSecret(JSON.parse(JSON.stringify(params)), api, userId, token, httpKey)
  return data
}

// 文件请求封装
export function file (api, params = {}) {
  const httpKey = getItem('HttpKey') || ''
  const userId = getItem('userId') || ''
  const token = getItem('Token') || ''
  const data = AuthorityUtils.apiCreateCommApiSecret(JSON.parse(JSON.stringify(params)), api, userId, token, httpKey)
  return data
}

export default { request, file }
