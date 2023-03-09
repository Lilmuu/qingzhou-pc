/*
 * @Author: your name
 * @Date: 2021-12-16 16:16:04
 * @LastEditTime: 2022-04-06 14:39:44
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\api\user.js
 */
import request from '@/utils/request'

const baseRoot = `/mgr`
const base = `/mgr/task-engine`

// 获取短信验证码
export function getMessCode(phone) {
  return request({
    url: `${baseRoot}/upms/login/phone/${phone}`,
    method: "get"
  });
}

// 忘记密码 获取短信验证码
export function getResetPhoneCode(phone, randomStr) {
  return request({
    url: `${baseRoot}/upms/reset/code/${phone}/${randomStr}`,
    headers: {
      isToken: false,
      ETag: "Basic ZnJhbWU="
    },
    method: "get"
  });
}

// 忘记密码 密码更新
export function resetPwd(data) {
  return request({
    url: `${baseRoot}/upms/reset/verify/password`,
    headers: {
      isToken: false,
      ETag: "Basic ZnJhbWU=",
      'Content-Type': 'text/plain',
    },
    method: "post",
    data
  });
}

// 模糊查找人
export function findUser(query) {
  return request({
    url: `${base}/system/queryExecutor`,
    method: 'get',
    params: query
  })
}

// 获取版本信息
export function getVersion() {
  return request({
    url: `${base}/user/getVersion?type=1`,
    method: 'get'
  })
}

// 用户等级
export function userBasic(id) {
  return request({
    url: `${ baseRoot }/upms/user/get/basic/${ id }`,
    method: 'get',
  })
}

// 获取im用户信息
export function getIMUserInfo(id) {
  return request({
    url: `${ base }/user/get/imUserId?id=${ id }`,
    method: 'get'
  })
}

// 首次登录
export function PCFirstLogin(imId) {
  return request({
    url: `${ base }/user/pcFirstLogin?imId=${imId}`,
    method: "get",
  });
}
// 重连登录
export function PCCheckIsLogin(imId) {
  return request({
    url: `${ base }/user/pcCheckIsLogin?imId=${imId}`,
    method: "get",
  });
}

// 用户上传头像
export function headImageUpload(data) {
  return request({
    url: `${ base }/base/headImageUpload`,
    method: "post",
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 用户获取头像
export function getUserInfoAvatar(userId) {
  return request({
    url: `${ base }/user/get/userMessage?id=${userId}`,
    method: "get",
  });
}

// 用户获取头像(imId)
export function getAvatarByImId(imId) {
  return request({
    url: `${ base }/user/getUserMessageByImid?imId=${imId}`,
    method: "get",
  });
}
