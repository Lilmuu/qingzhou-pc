import request from "@/utils/request"
const base = '/mgr/task-engine'
// const base = ''
//TODO 网关


// 提交新议题
export const flowableRecordpageMyTask = params => {
  return request({
    url: base + '/flowableRecord/pageMyTask',
    method: 'get',
    params
  })
}
// 删除按钮
export const meetingTaskdeleteTask = params => {
  return request({
    url: base + '/meetingTask/deleteTask',
    method: 'get',
    params
  })
}
// 撤回按钮
export const flowableRecordrecallTask = data => {
  return request({
    url: base + '/flowableRecord/recallTask',
    method: 'post',
    data
  })
}