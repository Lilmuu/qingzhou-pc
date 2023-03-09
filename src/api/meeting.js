/*
 * @Author: youshijun 1046422605@qq.com
 * @Date: 2022-04-20 17:52:02
 * @LastEditors: youshijun 1046422605@qq.com
 * @LastEditTime: 2022-05-30 16:30:09
 * @FilePath: \task-pc-ui\src\api\meeting.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'
let base = '/mgr/task-engine'

// 创建视屏会议
export function addConference(query) {
  return request({
    url: `${base}/video/business/addConference`,
    method: 'get',
    params: query
  })
}

// 关闭视屏会议
export function closeConferenceGET(id) {
  return request({
    url: `${base}/video/business/closeConference?id=${id}`,
    method: 'get'
  })
}

// 会议日志
export function getConferenceList() {
  return request({
    url: `${base}/video/business/getConferenceList`,
    method: 'post'
  })
}

// 判断房间是否存在
export function isExistRoom(query) {
  return request({
    url: `${base}/video/business/isRoom`,
    method: 'get',
    params: query
  })
}

// 判断房间是否全局禁音中
export function isMute(query) {
  return request({
    url: `${ base }/video/business/isMute`,
    method: 'get',
    params: query
  })
}

// 更新房间是否全局禁音中
export function updateByMute(data) {
  return request({
    url: `${ base }/video/business/updateByMute`,
    method: 'post',
    data
  })
}

export function joinMeetingRoom(param){
  return request({
    url:`${ base }/video/business/addMeeting?roomNo=${param}`,
    method:'get',
  })
}