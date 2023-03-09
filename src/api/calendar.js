import request from "@/utils/request"

const base = `/mgr/task-engine`

// 根据传上来的内容模糊查询相关数据
export function searchByWord(query) {
  return request({
    url: `${ base }/schedule/searchByWord`,
    method: 'get',
    params: query
  })
}

// 分类筛选日程
export function searchByConditions(data) {
  return request({
    url: `${ base }/schedule/searchByConditions`,
    method: 'post',
    data
  })
}

// 新增或编辑汇报交流
export function addOrEditTaskCalendarReport(data) {
  return request({
    url: `${ base }/taskCalendarReport/addOrEdit`,
    method: 'post',
    data
  })
}

// 获取汇报交流申请列表
export function getReportList(query) {
  return request({
    url: `${ base }/taskCalendarReport/getReportList`,
    method: 'get',
    params: query
  })
}

// 获取汇报交流详情
export function getReportDetail(query) {
  return request({
    url: `${ base }/taskCalendarReport/getReportDetail`,
    method: 'get',
    params: query
  })
}

// 审核汇报交流申请
export function auditReport(data) {
  return request({
    url: `${ base }/taskCalendarReport/auditReport`,
    method: 'post',
    data
  })
}

// 获取最近查看人数据
export function getVisitCache() {
  return request({
    url: `${ base }/schedule/getVisitCache`,
    method: 'get',
  })
}

// 添加 缓存最近查看人数据
export function addVisitCache(data) {
  return request({
    url: `${ base }/schedule/visitCache`,
    method: 'post',
    data
  })
}

// 搜索 任务和季度目标
export function getTaskAndTargetBySearch(query) {
  return request({
    url: `${ base }/schedule/getTaskAndTargetBySearch`,
    method: 'get',
    params: query
  })
}

// 新增个人提醒
export function addTaskRemind(data) {
  return request({
    url: `${ base }/taskRemind/add`,
    method: 'post',
    data
  })
}

// 新增个人提醒
export function saveTaskRemind(data) {
  return request({
    url: `${ base }/taskRemind/save`,
    method: 'post',
    data
  })
}

// 获取个人提醒
export function getRemindInfo(query) {
  return request({
    url: `${ base }/taskRemind/getRemindInfo`,
    method: 'get',
    params: query
  })
}

/**
 * 获取个人提醒 type
 * relationId {String}    外键 根据类型不一样 代表的意义不一样
 * type       {Number}    0代表汇报交流 1代表会议 2代表出差 为空则代表没有关联任何
 * */
export function getRemindInfoByType(query) {
  return request({
    url: `${ base }/taskRemind/remind/info`,
    method: 'get',
    params: query
  })
}

// // 修改个人提醒
// export function updateRemindInfo(data) {
//   return request({
//     url: `${ base }/taskRemind/update`,
//     method: 'post',
//     data
//   })
// }

// 关闭个人提醒
export function closeSchedule(data) {
  return request({
    url: `${ base }/schedule/close/schedule`,
    method: 'post',
    data
  })
}
