import Ax from '@/utils/imRequest'


export const Actions = {
  // [POST]] 登陆
  async Login (ctx, params) {
    const rs = await Ax.post('/user/login', params)
    return rs
  },
  // [POST] 忘记密码
  async PostResetPassword (ctx, params) {
    const rs = await Ax.post('/user/password/reset', params)
    return rs
  },
  // [POST] 提交注册
  async SubmitRegister (ctx, params) {
    const rs = await Ax.post('/user/register', params)
    return rs
  },
  // [POST] 更改密码
  async PostUpdatePassword (ctx, params) {
    const rs = Ax.post('/user/password/update', params)
    return rs
  }
}

export default { Actions }
