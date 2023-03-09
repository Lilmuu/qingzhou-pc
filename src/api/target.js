/*
 * @Author: tanhu
 * @Date: 2021-07-01 14:28:41
 * @LastEditors: tanhu
 * @LastEditTime: 2021-08-30 18:04:25
 * @Description: 目标管理api接口
 */
// 目标管理 api
import request from '@/utils/request'
import streamRequest from '@/utils/streamRequest'
const base = `/mgr/task-engine`

// 获取数据
export function getList(data) {
    return request({
        url: `${base}/task/target/page`,
        method: 'get',
        params: data
    })
}

// 新增目标
export function addNewTarget(data) {
    return request({
        url: `${base}/task/target/save`,
        method: 'post',
        data
    })
}

// 年度目标排序
export function adjustSotrYear(data) {
    return request({
        url: `${base}/task/target/sort`,
        method: 'post',
        data
    })
}

// 删除目标
export function deleteTargetItem(data) {
    return request({
        url: `${base}/task/target/del`,
        method: 'delete',
        data
    })
}

// 编辑目标
export function editTargetItem(data) {
    return request({
        url: `${base}/task/target/edit`,
        method: 'put',
        data
    })
}

// 目标视图
export function targetView(data) {
    return request({
        url: `${base}/task/target/target/view`,
        method: 'get',
        params: data
    })
}

// 导出目标
export function targetExport(data) {
    return streamRequest({
        url: `${base}/task/target/export/target`,
        method: 'post',
        data,
        responseType: 'arraybuffer'
    })
}

// 导出目标
export function targetViewDownload(type) {
    return streamRequest({
        url: `${base}/task/target/down/excel/template/${type}`,
        method: 'get',
    })
}