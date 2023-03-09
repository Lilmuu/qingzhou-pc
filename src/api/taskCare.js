import request from '@/utils/request'

const base = `/mgr/task-engine`

// 待我处理
export function myPending(data) {
    return request({
        url: `${base}/task/pending`,
        method: 'post',
        data
    })
}

// 添加-取消置顶任务
export function addCanCalTop(data){
    return request({
        url:`${base}/task/taskTop`,
        method:'get',
        params:data
    })
}

// 搜索任务
export function taskSearch(data){
    return request({
        url:`${base}/task/taskSearch`,
        method:'get',
        params:data
    })
}

// 添加任务提醒
export function addRemind(data){
    return request({
        url:`${base}/task/addRemind`,
        method:'post',
        data:data
    })
}