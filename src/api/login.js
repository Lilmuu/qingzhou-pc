import request from '@/utils/request'

const scope = "server";
const client_id = "frame";
const client_secret = "frame";

export function login({ phone, password, type }) {
  return request({
    url: `/user/login/${type}`,
    method: 'post',
    data: {
      phone,
      password
    }
  })
}

// 租户
export function getAllTentan() {
  return request({
    url: "/mgr/upms/tenant/list",
    method: "get"
  });
}

// 登录
// export const loginByUsername = (
//   username,
//   password,
//   code,
//   randomStr,
//   userType
// ) => {
//   const grant_type = "password";
//   return request({
//     url: "/auth/oauth/token",
//     headers: {
//       isToken: false,
//       Authorization: "Basic cGlnOnBpZw==",
//       type: userType
//     },
//     method: "post",
//     params: { username, password, randomStr, code, grant_type, scope }
//   });
// };

export const loginByUsername = (username, password) => {
  const grant_type = "password";
  return request({
    url: `/auth/oauth/token`,
    headers: {
      isToken: false,
      ETag: "Basic ZnJhbWU="
    },
    method: "post",
    params: { username, password, grant_type, scope, client_id, client_secret }
  });
};

// 使用key获取用户信息
export function getInfo(token) {
  // return request({
  //   url: '/user/info',
  //   method: 'get',
  //   params: { token }
  // })
  return request({
    url: '/user/getMessage',
    method: 'get',
    params: { key: token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

// 二维码
export function getQRcode(data) {
  // return request({
  //   url: '/mgr/qr/getQRcode',
  //   method: 'post'
  // })
  return request({
    url: "/mgr/upms/app/oauth",
    method: "get",
    headers: {
      isToken: false,
      ETag: "Basic ZnJhbWU="
    },
    params: data
  });
}

// 二维码扫描登录
export function scanLogin(data) {
  // return request({
  //   url: '/mgr/qr/scanLogin',
  //   method: 'get',
  //   params: query
  // })
  return request({
    url: `/mgr/upms/app/check/${data.uuid}`,
    method: "get",
    headers: {
      isToken: false,
      ETag: "Basic ZnJhbWU="
    },
    params: data
  });
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: "/mgr/upms/user/info",
    method: "get"
  });
}

// app授权登录
export function authByToken(data) {
  return request({
    url: "/auth/login/app/token",
    method: "get",
    headers: {
      isToken: false,
      ETag: "Basic ZnJhbWU="
    },
    params: data
  });
}

