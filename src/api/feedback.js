import request from '@/utils/request'

const base = `/mgr/task-engine`

// 添加反馈
export function addFeedback(data) {
  return request({
    url: `${base}/feedback/addFeedback`,
    method: 'POST',
    data
  })
}

// 查询反馈信息
export function queryFendBack(query) {
  return request({
    url: `${base}/feedback/queryFendBack`,
    method: 'get',
    params: query
  })
}

// 查询 是否可 反馈
export function queryFeedbackIsSuccess(query) {
  return request({
    url: `${base}/feedback/queryFeedbackIsSuccess`,
    method: 'get',
    params: query
  })
}

// 已知晓
export function knowFeedback(query) {
  return request({
    url: `${base}/feedback/knowFeedback`,
    method: 'get',
    params: query
  })
}

// 撤回反馈消息
export function recallFeedback(query){
  return request({
    url:`${base}/feedback/recallFeedback`,
    method:'get',
    params:query
  })
}
