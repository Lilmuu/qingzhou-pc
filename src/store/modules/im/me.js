import Ax from '@/utils/imRequest'


const initState = {
  BlackList: []
}

export default {
  namespaced: true,
  state: {
    initState () { return initState },
    ...initState,
    IMRouterParams: {},
  },
  mutations: {
    // 变更路由参数
    ChangeIMRouterParams(state, params) {
      state.IMRouterParams = params
    },
    SET_BLACK_List (state, response) { state.LastChatList = response }
  },
  actions: {
    // [GET] 获取黑名单列表
    async GetLastChatList (ctx, params) {
      const rs = await Ax.post('/tigase/getLastChatList', params)
      if (rs.resultCode !== 1) return rs
      ctx.commit('SET_LastChat_List', rs.data)
      return rs
    }
  }
}
