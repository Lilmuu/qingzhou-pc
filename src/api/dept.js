import request from "@/utils/request"

const base = `/mgr/task-engine`

// 查询部门树形菜单
export function getDeptTree() {
  return request({
    url: `${base}/dept/tree`,
    method: 'get'
  })
}
// 查询部门树形菜单
export function getDeptTreeUsers() {
  return request({
    url: `${base}/dept/tree/includeUsers`,
    method: 'get'
  })
}

// 查询部门树形用户
export function getDeptUserTree(deptId) {
  return request({
    url: `${base}/dept/user-tree?deptId=${deptId}`,
    method: 'get'
  })
}

// 查询用户树形
export function getUserByDeptId(data) {
  return request({
    url: `${base}/dept/getUserByDeptId`,
    method: 'post',
    data
  })
}
