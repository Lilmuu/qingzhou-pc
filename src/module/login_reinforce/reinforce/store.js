/*
 * @Author: your name
 * @Date: 2021-09-28 11:08:45
 * @LastEditTime: 2021-11-29 21:17:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\module\login_reinforce\reinforce\store.js
 */
// vuex 调用逻辑
import Ax from '@/utils/imRequest'
import AuthorityUtils from '../resource/apiAuthUtils'

let getLoginPrivateKeyIndex = 0

export const Actions = {
  // [POST]] 登陆
  async Login (ctx, params) {
    console.log('/user/login/v1【Login】 - 参数', params)
    params = AuthorityUtils.getUserLoginV1Param_Forge(params)
    console.log('/user/login/v1 【最终】 - 参数', params)

    params.noAccessToken = 'user/login/v1'

    const rs = await Ax.post('/user/login/v1', params)
    return rs
  },
  // [GET] 获取登录code
  async GetLoginCode (ctx, params) {
    const loginCodeParams = AuthorityUtils.getLoginCodeParam(JSON.parse(JSON.stringify(params)))
    let rs = await Ax.post('/auth/getLoginCode', loginCodeParams)
    if (rs.resultCode === 1) {
      // 如果没有登录code
      if (this._vm.$utils.Tools.isEmpty(rs.data.code)) {
        // 上传公钥
        params.userId = rs.data.userId
        const loginKey = await ctx.dispatch('Common/User/UploadLoginKey', params, { root: true })
        if (loginKey.resultCode !== 1) {
          rs.resultCode = 0
          return rs
        }
        // 递归一百次如果还是失败则不递归
        if (getLoginPrivateKeyIndex++ < 100) rs = await ctx.dispatch('Common/User/GetLoginCode', params, { root: true })
        else getLoginPrivateKeyIndex = 0
      }
    }
    return rs
  },
  // [GET] 获取加密私钥
  async GetLoginPrivateKey (ctx, params) {
    params = AuthorityUtils.getLoginPrivateKeyParam(params)
    const rs = await Ax.post('/authkeys/getLoginPrivateKey', params)
    return rs
  },
  // [POST] 上传RSA公私钥
  async UploadLoginKey (ctx, params) {
    const loginKeyParams = AuthorityUtils.uploadLoginKeyParam(params)
    const rs = await Ax.post('/authkeys/uploadLoginKey', loginKeyParams)
    return rs
  },
  // [POST] 提交注册
  async SubmitRegister (ctx, params) {
    params = AuthorityUtils.userRegeditParam(params)
    delete params.secretData
    const rs = await Ax.post('/user/register/v1', params)
    return rs
  },
  // [GET] 获取服务端设置
  async GetServeConfig (ctx) {
    const rs = await Ax.post('/config')
    ctx.commit('SET_SERVER_CONFIG', rs.Data)
    return rs
  },
  // [GET] 获取忘记密码的接口版本
  async GetSupportSecureChat (ctx, params) {
    const rs = await Ax.post('/authkeys/isSupportSecureChat', params)
    return rs
  },
  // [POST] 忘记密码
  async PostResetPassword (ctx, params) {
    params = AuthorityUtils.resetPasswordV1Param(params)
    const rs = await Ax.post('/user/password/reset/v1', params)
    return rs
  },
  // [POST] 旧版忘记密码
  async PostOldResetPassword (ctx, params) {
    const rs = await Ax.post('/user/password/reset', params)
    return rs
  },
  // [GET] 获取用户的随机码，用于修改密码验签
  async GetRandomStr (ctx) {
    const rs = await Ax.post('/user/getRandomStr')
    return rs
  },
  // [POST] 新账号修改密码提交接口
  async PostUpdatePassword (ctx, params) {
    params = AuthorityUtils.updatePasswordV1Param(params)
    delete params.secretData
    const rs = Ax.post('/user/password/update/v1', params)
    return rs
  },
  // [POST] 旧账号更改密码提交接口
  async PostOldUpdatePassword (ctx, params) {
    const rs = Ax.post('/user/password/update', params)
    return rs
  }
}

export default { Actions }
