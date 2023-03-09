/*
 * @Author: your name
 * @Date: 2021-12-06 15:25:37
 * @LastEditTime: 2022-01-14 09:54:46
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\api\workSpace.js
 */
import request from '@/utils/request'

const base = `/mgr/task-engine`

// 工作台顶部tabs列表页
export function tabsList(data){
    return request({
        url:`${base}/article/api/page`,
        method:'get',
        params:data
    })
}

// 资讯管理前台查询未读消息数量
export function tabsNoticeInfo(data){
    return request({
        url:`${base}/article/api/msg/num`,
        method:'get',
        params:data
    })
}

// 获取详情并标记文章已读
export function detailInfo(data){
    return request({
        url:`${base}/article/api/detail/sign`,
        method:'get',
        params:data
    })
}

// 查看全部应用
export function getAllAppList(data){
    return request({
        url:`${base}/sysUserApp/getAllAppList`,
        method:'get',
        params:data
    })
}

// 查看最近使用的应用
export function selectRecentUsedApp(data){
    return request({
        url:`${base}/sysApp/selectRecentUsedApp`,
        method:'get',
        params:data
    })
}

// 修改自己最近使用应用
export function updateRecentUsedApp(data){
    return request({
        url:`${base}/sysApp/updateRecentUsedApp`,
        method:'post',
        data
    })
}

// 我的应用列表
export function selectMyApp(data){
    return request({
        url:`${base}/sysUserApp/selectMyApp`,
        method:'get',
        params:data
    })
}

// 移除或者新增自己的应用
export function updateMyApp(data){
    return request({
        url:`${base}/sysUserApp/updateMyApp`,
        method:'post',
        data
    })
}

// 发文模糊搜索
export function workbenchSearch(data){
    return request({
        url:`${base}/article/api/search`,
        method:'get',
        params:data
    })
}

// 获取字典项
export function getDict(id){
  return request({
      url:`/mgr/upms/dict/type/${id}`,
      method:'get',
  })
}
// 新建合同提交
export function contractSubmit(data){
  return request({
      url:`${base}/contract/submit/start/node`,
      method:'post',
      data
  })
}

// 驳回 撤回的合同 -提交
export function contractRefuseSub(data){
  return request({
      url:`${base}/contract/submit/refuse`,
      method:'post',
      data
  })
}


// 暂存 合同流程
export function storageContract(data){
  return request({
      url:`${base}/contract/storage`,
      method:'post',
      data
  })
}

// 合同-详情
export function contractDetails(data){
  return request({
      url:`${base}/contract/details`,
      method: 'get',
      params: data,
  })
}

// 合同-驳回
export function contractRefuse(data){
  return request({
      url:`${base}/contract/refuseTask`,
      method:'post',
      data
  })
}

// 合同-同意
export function contractAgree(data){
  return request({
      url:`${base}/contract/singlenode/complete`,
      method:'post',
      data
  })
}

// 合同 - 转发
export function contractForward(data){
  return request({
      url:`${base}/contract/multinode/complete`,
      method: 'post',
      data
  })
}

// 合同 - 判断当前节点是否可以转发给他人
export function checkNodeDelegate(params){
  return request({
      url:`${base}/contract/checkNodeDelegate`,
      method: 'get',
      params: params,
  })
}

// 查看流程图img
export function downLoadFile(busId,type) {
  return request({
    url: base + `/common/down/pdf?busId=${busId}&type=${type}`,
    method: 'post',
    responseType: "blob"
  })
}


// 查看流程图img
export function flowableRecorddownFlowableImg(params) {
  return request({
    url: base + '/flowableRecord/downFlowableImg',
    method: 'get',
    params,
    responseType: "blob"
  })
}
// 查看流程图img没有流程id时
export function flowableRecordselectImg(params) {
    return request({
      url: base + '/flowableRecord/selectImg',
      method: 'get',
      params,
      responseType: "blob"
    })
  }

// 发文 - 新建
export function articleSubmit(data) {
  return request({
    url: base + '/article/addNewArticle',
    method:'post',
    data
  })
}

// 发文 - 暂存之后的发文
export function articleStorageSubmit(data) {
  return request({
    url: base + '/article/submitStorageArticle',
    method:'post',
    data
  })
}

// 发文 - 被驳回提交
export function articleRefuseSubmit(data) {
  return request({
    url: base + '/article/submitRefuseArticleTask',
    method:'post',
    data
  })
}

// 发文 - 暂存
export function storageArticle(data) {
  return request({
    url: base + '/article/temporaryStorageArticle',
    method:'post',
    data
  })
}

// 发文 - 提交暂存发文
export function submitStorageArticle(data) {
  return request({
    url: base + '/article/submitStorageArticle',
    method:'post',
    data
  })
}

// 发文 - 详情
export function articleDetails(id) {
  return request({
    url: base + `/article/selectArticleDetails${ id ? "?articleId="+id : '' }`,
    method: 'get',
  })
}

// 发文 - 同意
export function articleAgree(data) {
  return request({
    url: base + '/article/completeArticleTask',
    method:'post',
    data
  })
}

// 发文 - 不同意
export function articleDisagree(data) {
  return request({
    url: base + '/article/refuseArticleTask',
    method:'post',
    data
  })
}

// 发文 - 转发
export function articleForward(data) {
  return request({
    url: base + '/article/forwardArticle',
    method:'post',
    data
  })
}

// 发文 - 回显信息
export function articleMessage() {
  return request({
    url: base + '/flowableRecord/selectMyInfo',
    method:'get',
  })
}

// 发文 - 编辑排版修改 
export function articleEditArticle(data) {
  return request({
    url: base + '/article/editArticle',
    method:'post',
    data
  })
}


// 议题同意按钮
export const meetingTaskcompleteMeetingTask = data => {
  return request({
    url: base + '/meetingTask/completeMeetingTask',
    method: 'post',
    data
  })
}
// 议题不同意按钮
export const meetingTaskrefuseMeetingTask = data => {
  return request({
    url: base + '/meetingTask/refuseMeetingTask',
    method: 'post',
    data
  })
}
  // 签报同意按钮
export const reportsinglenodecomplete = data => {
  return request({
    url: base + '/report/singlenode/complete',
    method: 'post',
    data
  })
}
// 签报不同意按钮
export const reportrefuse = data => {
  return request({
    url: base + '/report/refuseTask',
    method: 'post',
    data
  })
}
// 签报 - 转发
export function reportmultinodecomplete(data){
  return request({
    url:`${base}/report/multinode/complete`,
    method: 'post',
    data
  })
}


// 未读条数
export function workbenchUnread(data){
  return request({
      url:`${base}/flowableRecord/countUnreadNumber`,
      method: 'post',
      data
  })
}
//
export function workbenchRead(id){
  return request({
      url:`${base}/flowableRecord/updateReadFlag?id=${id}`,
      method: 'get',
  })
}

// 转发
export function flowableRecord(taskId){
  return request({
      url:`${base}/flowableRecord/selectNextNodeInfo?taskId=${taskId}`,
      method: 'post',
  })
}

// 转发会签
export function forwardCounterSign(data){
  return request({
      url:`${base}/common/forwardCounterSign`,
      method: 'post',
      data
  })
}

// 是否是投票
export function countersignVote(data){
  return request({
      url:`${base}/flowableRecord/countersignVote`,
      method: 'post',
      data
  })
}


// 用印-新建
export function printSubmit(data){
  return request({
      url:`${base}/flowablePrint/addNewPrint`,
      method: 'post',
      data
  })
}

// 用印-暂存
export function storagePrint(data){
  return request({
      url:`${base}/flowablePrint/temporaryStoragePrint`,
      method: 'post',
      data
  })
}


// 用印-提交暂存数据
export function submitStoragePrint(data){
  return request({
      url:`${base}/flowablePrint/submitStoragePrint`,
      method: 'post',
      data
  })
}

// 用印-提交被驳回数据
export function submitRefusePrintProcess(data){
  return request({
      url:`${base}/flowablePrint/submitRefusePrintProcess`,
      method: 'post',
      data
  })
}

// 用印-查看详情
export function selectPrintDetails(printId){
  return request({
      url:`${base}/flowablePrint/selectPrintDetails?printId=${printId}`,
      method: 'post',
  })
}

// 用印-同意（完成）
export function completePrintTask(data){
  return request({
      url:`${base}/flowablePrint/completePrintTask`,
      method: 'post',
      data
  })
}

// 用印-驳回
export function refusePrintTask(data){
  return request({
      url:`${base}/flowablePrint/refusePrintTask`,
      method: 'post',
      data
  })
}


// 用印-单人转发
export function forwardPrint(data){
  return request({
      url:`${base}/flowablePrint/forwardPrint`,
      method: 'post',
      data
  })
}





