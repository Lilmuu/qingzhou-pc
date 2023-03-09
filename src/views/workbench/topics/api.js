/*
 * @Author: your name
 * @Date: 2021-12-09 15:02:24
 * @LastEditTime: 2021-12-09 15:47:41
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\workbench\topics\api.js
 */
import request from "@/utils/request"
const base = '/mgr/task-engine'
// const base = ''
//TODO 网关


// 提交新议题
export const meetingTaskaddNewMeeting = data => {
  return request({
    url: base + '/meetingTask/addNewMeeting',
    method: 'post',
    data
  })
}
// 提交暂存的议题
export const meetingTasksubmitStorageMeeting = data => {
    return request({
      url: base + '/meetingTask/submitStorageMeeting',
      method: 'post',
      data
    })
  }
  // 提交被驳回的议题
export const meetingTasksubmitRefuseProcess = data => {
  return request({
    url: base + '/meetingTask/submitRefuseProcess',
    method: 'post',
    data
  })
}
// 暂存议题
export const meetingTasktemporaryStorageMeeting = data => {
    return request({
      url: base + '/meetingTask/temporaryStorageMeeting',
      method: 'post',
      data
    })
  }
// 查看流程图img
export const flowableRecorddownFlowableImg = params => {
    return request({
      url: base + '/flowableRecord/downFlowableImg',
      method: 'get',
      params,
      responseType: "blob"
    })
  }
  // 查看任务流转详细
export const meetingTaskselectMeetingDetails = params => {
    return request({
      url: base + '/meetingTask/selectMeetingDetails',
      method: 'post',
      params
    })
  }
  // 同意按钮
export const meetingTaskcompleteMeetingTask = data => {
  return request({
    url: base + '/meetingTask/completeMeetingTask',
    method: 'post',
    data
  })
}
// 不同意按钮
export const meetingTaskrefuseMeetingTask = data => {
  return request({
    url: base + '/meetingTask/refuseMeetingTask',
    method: 'post',
    data
  })
}
// 新增回显
export const flowableRecordselectMyInfo = params => {
  return request({
    url: base + '/flowableRecord/selectMyInfo',
    method: 'get',
    params
  })
}
  // 判断当前节点是否可以转发给他人
  export const reportcheckNodeDelegate = params => {
    return request({
      url: base + '/report/checkNodeDelegate',
      method: 'get',
      params
    })
  }



// 合同详情
export function contractDetails(data){
  return request({
      url:`${base}/contract/details`,
      method: 'get',
      params: data,
  })
}