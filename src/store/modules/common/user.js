import Ax from '@/utils/imRequest'
import Xmpp from '@/utils/imUtil/xmpp'
import { getItem, setItem } from '@/utils/imUtil/storage'
import LoginReinforce from '@/module/login_reinforce'

const initState = {
  MeId: getItem('MeId') || '',
  MeInfo: getItem('MeInfo') || {},
  UserInfo: {},
  ServerConfig: {},
  UserSearchList: [] // 用户搜索列表
}

export default {
  namespaced: true,
  state: {
    initState () { return initState },
    ...initState
  },
  getters: {
    // 获取用户头像
    GetUserAvatar: state => {
      return process.env.VUE_APP_AVATAR_BASE + (parseInt(state.MeId) % 10000) + '/' + state.MeId + '.jpg'
    }
  },
  mutations: {
    SET_USER_ID (state, response) { state.MeId = response },
    SET_Me_INFO (state, response) { state.MeInfo = response },
    SET_USER_INFO (state, response) { state.UserInfo = response },
    SET_SERVER_CONFIG (state, response) { state.ServerConfig = response },
    // 设置追加用户搜索列表
    SET_USER_SEARCH_LIST (state, response) {
      state.UserSearchList = state.UserSearchList.concat(response)
    },
    // 重置用户搜索列表
    RESET_USER_SEARCH_LIST (state, response) {
      state.UserSearchList = response
    }
  },
  actions: {
    ...LoginReinforce.Store.Actions,

    // [POST] 获取我的信息
    async GetMeInfo (ctx, params = {}) {
      const rs = await Ax.post('/user/get', params)
      if (rs.resultCode === 1) {
        ctx.commit('SET_Me_INFO', rs.data)
        ctx.commit('SET_USER_ID', rs.data.userId)
        setItem('MeInfo', rs.data)
        setItem('MeId', rs.data.userId)
      }
      return rs
    },
    /**
     * [GET] 获取用户搜索列表
     * @param {*} nickname 搜索的内容
     * @param {*} pageIndex 页码索引
     * @param {*} pageSize 页码大小
     */
    async GetUserSearchListByPage (ctx, params) {
      const rs = await Ax.post('/nearby/user', params)
      if (rs.resultCode !== 1) return rs
      if (params.pageIndex === 0) {
        // 重置列表
        ctx.commit('RESET_USER_SEARCH_LIST', rs.data)
      } else {
        // 追加列表
        ctx.commit('SET_USER_SEARCH_LIST', rs.data)
      }
      return rs
    },
    // [POST] 更新我的信息
    async PostUpdateMeInfo (ctx, params) {
      const rs = await Ax.post('/user/update', params)
      return rs
    },
    // [POST] 更新我的设置信息
    async PostUpdateMeSettingsInfo (ctx, params) {
      const rs = await Ax.post('/user/settings/update', params)
      return rs
    },
    // [GET] 获取用户信息
    async GetUserInfo (ctx, params) {
      const rs = await Ax.post('/user/get', params)
      if (rs.resultCode === 1) {
        ctx.commit('SET_USER_INFO', rs.data)
        return rs
      }
    },
    // [POST] 校验手机号
    async PostVerifyTelephone (ctx, params) {
      const rs = Ax.post('/verify/telephone', params)
      return rs
    },
    // [POST] 发送短信验证码
    async SendSMSCode (ctx, params) {
      const rs = await Ax.post('/basic/randcode/sendSms', params)
      return rs
    },
    // [GET] 获取服务端设置
    async GetServeConfig (ctx) {
      const rs = await Ax.post('/config')
      ctx.commit('SET_SERVER_CONFIG', rs.Data)
      return rs
    },
    // [GET] 获取与服务器的事件延迟
    async GetTimeDelay (ctx) {
      const rs = await Ax.post('/getCurrentTime')
      const timeDelay = Xmpp.getCurrentTimeSecond() - rs.data
      setItem('ServerTimeDelay', timeDelay)
      return rs
    }
  }
}
