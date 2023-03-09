import request from "@/utils/request"
const base = '/mgr/task-engine'
// const base = ''
//TODO 网关


// 查看任务流转详细
export const flowableRecordgetTaskDetails = params => {
  return request({
    url: base + '/flowableRecord/getTaskDetails',
    method: 'get',
    params
  })
}