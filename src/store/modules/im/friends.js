import Ax from '@/utils/imRequest'
import friendList from '@/storage/friend-list'

const initState = {
  FriendList: [],
  FriendRelationship: {},
  NewFriendList: [],
  BlackList: []
}

 const friends = {
  namespaced: true,
  state: {
    initState () { return initState },
    ...initState,
    IMRouterParams: {},
  },
  getters: {
    // 使用id存储friend
    IdFriendList: state => {
      const idFriendList = {}
      state.FriendList.forEach(friend => { idFriendList[friend.toUserId] = friend })
      return idFriendList
    },
  },
  mutations: {
    // 变更路由参数
    ChangeIMRouterParams(state, params) {
      state.IMRouterParams = params
    },
    SET_FRIEND_LIST (state, response) {
      state.FriendList = response
    },
    ADD_FRIEND_LIST (state, response) { state.FriendList.push(response) },
    DEL_FRIEND (state, friendId) {
      for (let i = 0; i < state.FriendList.length; i++) {
        if (state.FriendList[i].toUserId === friendId) {
          state.FriendList.splice(i, 1)
          break
        }
      }
    },
    SET_FRIEND_RELATIONSHIP (state, response) {
      state.FriendRelationship = response
    },
    // 设置新朋友列表
    SET_NEW_FRIEND_LIST (state, response) {
      state.NewFriendList = state.NewFriendList.concat(response)
    },
    // 重置新朋友列表
    RESET_NEW_FRIEND_LIST (state, response) {
      state.NewFriendList = response
    },
    SET_NEW_FRIEND_LAST (state, response) {
      for (let i = 0; i < state.NewFriendList.length; i++) {
        if (state.NewFriendList[i].toUserId === response.toUserId) {
          state.NewFriendList.splice(i, 1)
          break
        }
      }
      // 数组头部添加元素，由于性能原因，避免使用unshift()方法
      state.NewFriendList = [response].concat(state.NewFriendList)
    },
    // 设置黑名单列表
    SET_BLACK_LIST (state, response) {
      state.BlackList = state.BlackList.concat(response)
    },
    // 重置黑名单列表
    RESET_BLACK_LIST (state, response) {
      state.BlackList = response
    }
  },
  actions: {
    // [GET] 获取好友列表
    async GetFriendsList (ctx, params = {}) {
      let friendListStorage = friendList.get()
      // 登陆时或者本地数据为空时需要同步数据，否则只需要返回本地数据即可
      if (params.type === 'login' || friendListStorage.length === 0) {
        // 参数初始化
        if (!params.data) {
          const token = localStorage.getItem('TOKEN')

          params.data = {
            userId: ctx.rootState.Common.User.MeId,
            pageIndex: 0, status: 2, pageSize: 50000,token:token
          }
        }
        // 接口请求
        const rs = await Ax.post('/friends/page', params.data)
        console.log(rs,' friends/page  -- 接口')
        if (rs.resultCode !== 1) return rs
        /**
         * 老版 - 返回数据结构{count:2, pageData: [], total: 0}
         * 新版 - 返回数据结构{count:2, data: [], total: 0}
         */
        // const friendListResponse = rs.data.pageData
        const friendListResponse = rs.data.data

        // 过滤被拉黑的好友
        friendListResponse.forEach((item, index) => {
          if (item.isBeenBlack) {
            friendListResponse.splice(index, 1)
          } else {
            item.avatar = '拉黑头像'
          }
        })
        console.log(friendListStorage,'friendListStorage - 过滤后的好友列表')
        friendListStorage = friendListResponse
        friendList.set(friendListStorage)
      }
      ctx.commit('SET_FRIEND_LIST', friendListStorage)
      return friendListStorage
    },

    // 添加非好友列表
    AddNotFriendsList (ctx, friendData) {
      let friendListStorage = friendList.get()
      friendListStorage.push(friendData)
      friendList.set(friendListStorage)
      ctx.commit('SET_FRIEND_LIST', friendListStorage)
    },

    // [GET] 获取自己与好友的关系 { userId: '', toUserId: '' }
    async GetFriendRelationship (ctx, params) {
      const rs = await Ax.post('/friends/get', params)
      if (rs.resultCode !== 1) return rs
      ctx.commit('SET_FRIEND_RELATIONSHIP', rs.data)
      return rs
    },

    /**
     * @function PostModifyFriendEncryptType [POST] 修改好友的加密设置
     * @param {string} toUserId 要设置的好友ID
     * @param {string} encryptType 加密设置 { 1: AES加密 }
     * @return {object}
     */
    async PostModifyFriendEncryptType (ctx, params) {
      const rs = await Ax.post('/friends/modify/encryptType', params)
      return rs
    },

    // [POST] 添加好友 { toUserId: '' }
    async PostAddFriend (ctx, params) {
      if (params.toUserId === ctx.rootState.Common.User.MeId) {
        // this.$message({type:'error',message:'无法添加自己为好友'})
        console.log('无法添加自己为好友',params.toUserId, ctx.rootState.Common.User.MeId)
        return
      }
      const rs = await Ax.post('/friends/add', params)
      return rs
    },
    // [POST] 删除好友 { toUserId: '' }
    async PostDeleteFriend (ctx, params) {
      const rs = await Ax.post('/friends/delete', params)
      return rs
    },
    // [GET] 获取新朋友列表 { userId: '', pageIndex: 0, pageSize: 500 }
    async GetNewFriendList (ctx, params) {
      const rs = await Ax.post('/friends/newFriend/list', params)
      if (rs.resultCode !== 1) return rs

      if (params.pageIndex === 0) {
        // 重置列表
        ctx.commit('RESET_NEW_FRIEND_LIST', rs.data)
      } else {
        // 追加列表
        ctx.commit('SET_NEW_FRIEND_LIST', rs.data)
      }
      return rs
    },
    // [GET] 获取新朋友消息的最新项 { toUserId: '' }
    async GetNewFriendLast (ctx, params) {
      const rs = await Ax.post('/friends/newFriend/last', params)
      if (rs.resultCode !== 1) return rs
      ctx.commit('SET_NEW_FRIEND_LAST', rs.data)
      return rs
    },
    // [GET] 获取黑名单列表 { pageIndex: 0, pageSize: 500 }
    async GetBlackList (ctx, params) {
      const rs = await Ax.post('/friends/blacklist', params)
      if (rs.resultCode !== 1) return rs
      if (params.pageIndex === 0) {
        // 重置列表
        ctx.commit('RESET_BLACK_LIST', rs.data)
      } else {
        // 设置列表
        ctx.commit('SET_BLACK_LIST', rs.data)
      }
      return rs
    },
    // [POST] 添加黑名单 { toUserId: '' }
    async PostAddBlackList (ctx, params) {
      const rs = await Ax.post('/friends/blacklist/add', params)
      if (rs.resultCode !== 1) return rs
      return rs
    },
    // [POST] 移除黑名单 { toUserId: '' }
    async PostRemoveBlackList (ctx, params) {
      const rs = await Ax.post('/friends/blacklist/delete', params)
      if (rs.resultCode !== 1) return rs
      return rs
    }
  }
}

export default friends
