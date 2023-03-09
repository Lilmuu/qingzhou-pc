import request from '@/utils/request'

const base = `/mgr/task-engine`

// 任务查询页面公共查询接口
export function taskRAll(url,data){
    return request({
        url:`${base}${url}`,
        method:'post',
        data
    })
}