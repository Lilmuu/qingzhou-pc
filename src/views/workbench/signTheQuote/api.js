import request from "@/utils/request"
const base = '/mgr/task-engine'
// const base = ''
//TODO 网关


// 提交
export const reportsubmitstartnode = data => {
  return request({
    url: base + '/report/submit/start/node',
    method: 'post',
    data
  })
}
// 撤回提交
export const reportsubmitrefuse = data => {
  return request({
    url: base + '/report/submit/refuse',
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
// 暂存
export const reportstorage = data => {
    return request({
      url: base + '/report/storage',
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
export const reportdetails = params => {
    return request({
      url: base + '/report/details',
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