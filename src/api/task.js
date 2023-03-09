import request from '@/utils/request'

const base = `/mgr/task-engine`

// 我发起的
export function myInitiate(data) {
  return request({
    url: `${base}/task/initiate`,
    method: 'post',
    data
  })
}

// 待我处理
export function myPending(data) {
  return request({
    url: `${base}/task/pending`,
    method: 'post',
    data
  })
}

// 我关注的
export function myAttention(data) {
  return request({
    url: `${base}/task/attention`,
    method: 'post',
    data
  })
}

// 我执行的
export function myPerform(data) {
  return request({
    url: `${base}/task/perform`,
    method: 'post',
    data
  })
}

// 日历
export function myCalendarDay(data) {
  return request({
    url: `${base}/task/taskCalendar`,
    method: 'post',
    data
  })
}

// 日历
export function myCalendar(data) {
  return request({
    url: `${base}/task/calendar`,
    method: 'post',
    data
  })
}

// 新增或编辑任务
export function addOrEditTask(data) {
  return request({
    url: `${base}/task/addOrEdit`,
    method: 'post',
    data
  })
}

// 结束任务
export function endState(data) {
  return request({
    url: `${base}/task/endState`,
    method: 'post',
    data
  })
}

// 关闭任务
export function closeState(query) {
  return request({
    url: `${base}/task/close`,
    method: 'get',
    params: query
  })
}
// 新的关闭任务
export function closeStateNew(query) {
  return request({
    url: `${base}/task/close`,
    method: 'post',
    data: query
  })
}

// 获取任务详情
export function getTaskDetails(query) {
  return request({
    url: `${base}/task/getTaskDetails`,
    method: 'get',
    params: query
  })
}

// 新建日历任务
export function addCalendarTask(data) {
  return request({
    url: `${base}/task/calendarTask`,
    method: 'post',
    data
  })
}

// 执行任务 (通过和驳回)
export function manageTask(data) {
  return request({
    url: `${base}/task/manageTask`,
    method: 'post',
    data
  })
}

// 接受任务
export function acceptTask(data) {
  return request({
    url: `${base}/task/acceptTask`,
    method: 'post',
    data
  })
}

// 接受任务
export function updateTaskEndTime(data) {
  return request({
    url: `${base}/task/updateTaskEndTime`,
    method: 'post',
    data
  })
}

// 转换文件下载地址
export function getFileUrl(query) {
  return request({
    url: `${base}/base/getFileUrl`,
    method: 'get',
    params: query
  })
}

// word转pdf
export function wordConvertPdf(data) {
  return request({
    url: `${base}/base/wordConvertPdf`,
    method: 'post',
    data,
    responseType: 'blob'
  })
}


// 获取透视图
export function getPerspective(data) {
  return request({
    url: `${base}/task/taskPerspective`,
    method: 'get',
    params: data
  })
}

// 获取透视图结点的详情
export function taskPerspectiveDetail(data) {
  return request({
    url: `${base}/taskOperateLog/queryOperateLog`,
    method: 'post',
    data: data
  })
}

// 添加/取消强调
// 参数 id  stress（0 取消 1强调）
export function updateStress(query) {
  return request({
    url: `${base}/task/updateStress`,
    method: 'get',
    params: query
  })
}

// 带入子任务的备注及附件
export function getChildTaskDetail(data){
  return request({
    url:`${base}/task/getChildTaskDetail`,
    method:'get',
    params:data
  })
}

// 完成任务
export function submitTaskOver(data){
  return request({
    url:`${base}/task/submitTaskOver`,
    method:'post',
    data:data
  })
}

// 还原(撤回已完成申请)
export function reduction(data){
  return request({
    url:`${base}/task/reduction`,
    method:'post',
    data:data
  })
}

// 查询关联的上级任务/目标
export function queryTarget(params){
  return request({
    url: `${base}/task/target/targetQuarter`,
    method: 'get',
    params
  })
}

// 反馈交流中,根据任务id选中该任务的发起人 执行人 关注人集合
export function getUserList(params){
  return request({
    url: `${base}/task/getuserlist`,
    method: 'get',
    params
  })
}
