/*
 * @Author: your name
 * @Date: 2021-09-28 11:08:45
 * @LastEditTime: 2022-02-28 11:22:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\api\im.js
 */
import request from '@/utils/request'
const base = `/mgr/task-engine`

// 创建部门群聊，添加成员
export function addGroupChat(data) {
  return request({
    prefixes: 'im',
    url: `${base}/im/business/addGroupChat`,
    method: 'post',
    data
  })
}

// 删除群组（管理员）
export function groupDelete(query) {
  return request({
    prefixes: 'im',
    url: `${base}/im/business/delete/group/chat`,
    method: 'get',
    params: query
  })
}

// 询问是否接受语音通话
export function voiceAsk(data) {
  return request({
    url: `${base}/im/business/voiceAsk`,
    method: 'post',
    data
  })
}

// 接受语音通话
export function voiceConnect(data) {
  return request({
    url: `${base}/im/business/voiceConnect`,
    method: 'post',
    data
  })
}

// 挂断语音
export function voiceStop(data) {
  return request({
    url: `${base}/im/business/voiceStop`,
    method: 'post',
    data
  })
}

// 拒绝语音
export function voiceCancel(data) {
  return request({
    url: `${base}/im/business/voiceCancel`,
    method: 'post',
    data
  })
}
// 语音通话介绍提示语
export function sendVoiceRecord(data) {
  return request({
    url: `${base}/im/business/voice/record`,
    method: 'post',
    data
  })
}
// 下载文件时,在message中获取fileName
export function getfilename(query) {
  return request({
    url: `${base}/im/business/getfilename`,
    method: 'get',
    params: query
  })
}
// 转换imId
// type-0: im===>轻舟   
// type-1: 轻舟===>im 
export function transformId(data) {
  return request({
    url: `${base}/system/parse/im/user`,
    method: 'post',
    data
  })
}
// 获取忙线用户
export function getBusyUser(data) {
  return request({
    url: `${base}/system/ask/busy`,
    method: 'post',
    data
  })
}
// 更新多个 参数: {"users":[{"zebreUserId":"","newMessageList":""} ]}
export function getUpdateMessage(data) {
  return request({
    url: `${base}/system/im/update/message`,
    method: 'post',
    data
  })
}

// 获取多个 参数 {"ids":[1,2]}  轻舟的id
export function getMessage(id) {
  return request({
    url: `${base}/system/im/get/message/${id}`,
    method: 'get'
  })
}

// 处理已读消息
export function consoleSystemMessage(type, body, toUserId) {
  return request({
    url: `${base}/console/systemToUser/sendMessage?type=${type}&body=${body}&toUserId=${toUserId}`,
    method: 'get'
  })
}
