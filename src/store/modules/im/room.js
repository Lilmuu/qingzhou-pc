import Ax from '@/utils/imRequest'
import WEBIM from '@/xmpp/webim-reset'
import md5 from 'blueimp-md5'

import groupList from '@/storage/group-list'
import { ousinessPperations } from '@/storage/index'

const initState = {
  RoomList: [], // 群组列表
  RoomInfo: {}, // 群组信息
  RoomShareFilesList: [], // 群共享文件列表
  RoomMembersList: [], // 群成员列表
  RoomNoticesList: [] // 群公告列表
}

function createApiSecret (obj) {
  obj.time = new Date().getTime()
  let key = process.env.VUE_APP_API_KEY + obj.time
  let md5Key = md5(key)
  obj.secret = md5Key
  return obj
}

export default {
  namespaced: true,
  state: {
    initState () { return initState },
    ...initState,
    IMRouterParams: {},
  },
  getters: {
    // 使用Jid存储room
    JidRoomList: state => {
      let jidRoomList = {}
      state.RoomList.forEach(room => { jidRoomList[room.jid] = room })
      return jidRoomList
    },
    // 使用id存储room
    IdRoomList: state => {
      let idRoomList = {}
      state.RoomList.forEach(room => { idRoomList[room.id] = room })
      return idRoomList
    }
  },
  mutations: {
    // 变更路由参数
    ChangeIMRouterParams(state, params) {
      state.IMRouterParams = params
    },
    SET_ROOM_LIST (state, response) { state.RoomList = response },
    ADD_ROOM (state, room) { state.RoomList.push(room) },
    DEL_ROOM (state, roomId) {
      for (let i = 0; i < state.RoomList.length; i++) {
        if (state.RoomList[i].id === roomId) {
          state.RoomList.splice(i, 1)
          break
        }
      }
    },
    // 设置追加群成员列表
    SET_ROOM_MEMBER_LIST (state, response) {
      state.RoomMembersList = state.RoomMembersList.concat(response)
    },
    // 重置群成员列表
    RESET_ROOM_MEMBER_LIST (state, response) {
      state.RoomMembersList = response
    },
    SET_ROOM_INFO (state, response) { state.RoomInfo = response },
    RESET_ROOM_INFO (state) { state.RoomInfo = {} },
    // 设置追加群共享文件列表
    SET_ROOM_SHARE_FILE_LIST (state, response) {
      state.RoomShareFilesList = state.RoomShareFilesList.concat(response)
    },
    // 重置群共享文件列表
    RESET_ROOM_SHARE_FILE_LIST (state, response) {
      state.RoomShareFilesList = response
    },
    // 设置追加群公告列表
    SET_ROOM_NOTICES_LIST (state, response) {
      state.RoomNoticesList = state.RoomNoticesList.concat(response)
    },
    // 重置群公告列表
    RESET_ROOM_NOTICES_LIST (state, response) {
      state.RoomNoticesList = response
    }
  },
  actions: {
    // [GET] 获取群组列表
    async GetRoomList (ctx, params = {}) {
      let roomListStorage = groupList.get()

      // 登陆时或者本地数据为空时需要同步数据，否则只需要返回本地数据即可
      if (params.type === 'login' || roomListStorage.length === 0) {
        // 参数初始化
        if (!params.data) {
          params.data = { pageIndex: 0, pageSize: 50000 }
        }
        let addSecret = createApiSecret(params.data)
        // 接口请求
        const rs = await Ax.post('/room/list/his', addSecret)
        if (rs.resultCode !== 1) return rs
        const roomListResponse = rs.data

        roomListStorage = roomListResponse
        groupList.set(roomListStorage)
      }

      // 由于登陆时，没有登陆xmpp，所以登陆时的请求无法加入xmpp的群组
      if (params.type === 'xmpp') {
        // 加入XMPP的群组
        if (roomListStorage.length !== 0) {
          WEBIM.pullBatchGroupMessage(roomListStorage)
        }
      }

      ctx.commit('SET_ROOM_LIST', roomListStorage)
      return roomListStorage
    },
    // [POST] 创建群组 { roomId: '', name: '', isLook: 1, text: '' }
    async PostCreateRoom (ctx, params) {
      const rs = await Ax.post('/room/add', params)
      return rs
    },
    // 添加消息置顶
    async PostTigaseDialogAdd(ctx, params) {
      const rs = await Ax.post('/tigase/dialog/add', params)
      return rs
    },
    // 删除消息置顶
    async PostTigaseDialogDelete(ctx, params) {
      const rs = await Ax.post('/tigase/dialog/delete', params)
      return rs
    },
    // [GET] 获取群组信息 { roomId: '', type: '' } type获取场景，如果是添加群而获取，则只需要返回，不需要改变vuex
    async GetRoomInfo (ctx, params) {
      console.log('===== 获取群组信息接口 =====  /room/get', params)
      const roomId = params.roomId
      const token = localStorage.getItem('TOKEN')
      const rs = await Ax.post('/room/get', { roomId , token})
      if (rs.resultCode !== 1) return rs
      if (params.type !== 'add') {
        ctx.commit('SET_ROOM_INFO', rs.data)
      }
      return rs
    },
    // [RESET] 重置群组信息
    ResetRoomInfo (ctx) {
      ctx.commit('RESET_ROOM_INFO')
    },
    /**
     * [GET] 获取群成员列表
     * @param {*} roomId 群ID
     * @param {*} pageSize 页码大小
     * @param {*} joinTime 加入群聊时间
     */
    async GetRoomMemberListByPage (ctx, params) {
      const rs = await Ax.post('/room/member/getMemberListByPage', params)
      if (rs.resultCode !== 1) return rs
      const filterData = JSON.parse(JSON.stringify(rs.data))

      if (params.joinTime !== 0) {
        // 过滤相同的数据
        const localData = ctx.state.RoomMembersList
        for (let i = 0; i < localData.length; i++) {
          if (localData[i].createTime === params.joinTime) {
            for (let j = 0; j < filterData.length; j++) {
              if (filterData[j].createTime === localData[i].createTime) {
                filterData.splice(j, 1)
                j--
              }
            }
          }
        }
        ctx.commit('SET_ROOM_MEMBER_LIST', filterData)
      } else {
        ctx.commit('RESET_ROOM_MEMBER_LIST', filterData)
      }

      return rs
    },
    /**
     * [GET] 获取群公告列表
     * @param {*} roomId 群Id
     * @param {*} pageIndex 页码索引
     * @param {*} pageSize 页码大小
     */
    async GetRoomNoticesListByPage (ctx, params) {
      const rs = await Ax.post('/room/noticesPage', params)
      if (rs.resultCode !== 1) return rs
      if (params.pageIndex === 0) {
        ctx.commit('RESET_ROOM_NOTICES_LIST', rs.data.pageData)
      } else {
        ctx.commit('SET_ROOM_NOTICES_LIST', rs.data.pageData)
      }
      return rs
    },
    // [POST] 更新群 { roomId: '', roomName: '' }
    async PostRoomUpdate (ctx, params) {
      const rs = await Ax.post('/room/update', params)
      if (rs.resultCode !== 1) return rs
      return rs
    },

    /**
     * @function PostModifyRoomEncryptType [POST] 修改群组的加密设置
     * @param {string} roomId 要设置的群组ID
     * @param {string} encryptType 加密类型 { 0: 明文传输 1: des加密传输 2: aes加密传输 3: 端到端加密传输 }
     * @return {object}
     */
    async PostModifyRoomEncryptType (ctx, params) {
      const rs = await Ax.post('/room/updateEncryptType', params)
      return rs
    },

    /**
     * [GET] 获取群共享文件列表
     * @param {*} roomId 群Id
     * @param {*} pageIndex 页码索引
     * @param {*} pageSize 页码大小
     */
    async GetRoomShareFileListByPage (ctx, params) {
      const rs = await Ax.post('/room/share/find', params)
      if (rs.resultCode !== 1) return rs
      if (params.pageIndex === 0) {
        ctx.commit('RESET_ROOM_SHARE_FILE_LIST', rs.data)
      } else {
        ctx.commit('SET_ROOM_SHARE_FILE_LIST', rs.data)
      }
      return rs
    },
    // [GET] 获取群文件信息 { roomId: '', cheareId: '' }
    async GetRoomShareFileInfo (ctx, params) {
      const rs = await Ax.post('/room/share/get', params)
      return rs
    },
    // [POST] 将文件添加到共享文件列表 { roomId: '', type: '', url: '', size: '', name: '' }
    async PostAddRoomShareFile (ctx, params) {
      const rs = await Ax.post('/room/add/share', params)
      return rs
    },
    // [POST] 设置群成员的状态 { roomId: '', ... }
    async PostRoomMemberUpdate (ctx, params) {
      const rs = await Ax.post('/room/member/update', params)
      return rs
    },
    // [POST] 删除群成员 { roomId: '', userId: '' }
    async PostRoomMemberDelete (ctx, params) {
      const rs = await Ax.post('room/member/deleteUsers', params)
      if (rs.resultCode === 1) {
        // 自己退群要删除本地的群组列表
        const meId = ctx.rootState.Common.User.MeId
        if (meId === params.userId) {
          ousinessPperations.exitChatGroup({ roomId: params.roomId })
        }
      }
      return rs
    },
    // [POST] 解散聊天群 { roomId: '' }
    async PostRoomDelete (ctx, params) {
      const rs = await Ax.post('/room/delete', params)
      if (rs.resultCode === 1) {
        ousinessPperations.exitChatGroup({ roomId: params.roomId })
      }
      return rs
    }
  }
}
