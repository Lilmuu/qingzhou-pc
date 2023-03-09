import Ax from '@/utils/imRequest'
import App from '@/main'
import store from '@/store'
import lastChatList from '@/storage/last-chat-list'
import { getItem } from '@/utils/imUtil/storage'
import { messageTopSort } from "@/utils";
import { getMessage } from "@/api/im";


let initState = {
  LastChatList: [], // 最后一条消息列表
  TopChatList: [],  // 置顶消息列表
  SearchChatList: {}, // 搜索人名、群名、和消息记录
  SearchData: '', // 搜索内容
  CurrentPersonnel: {},
  jumpUrl:'',
  onlyOnce: true,
  backEndNewMessage: {},
  NewMessageNumberList: getItem('newMessageNumberList') || {}, // 新消息数量列表
  NewMessageNumberSum: getItem('newMessageNumberSum') || 0, // 新消息数量总和
  SetNewMailMessage: '',
  readyState:''
}

export default {
  namespaced: true,
  state: {
    initState () { return initState },
    ...initState,
    IMRouterParams: {},
  },
  getters: {
    // 聊天列表
    ChatList: (state) => {
      console.log(state.IMRouterParams,'IMRouterParams --- IMRouterParams')
      console.log(state.LastChatList,'LastChatList --- LastChatList')
      if(state.IMRouterParams) {
      //  ...
      }
      if (state.LastChatList.length === 0) return []
      let lastChatList = JSON.parse(JSON.stringify(state.LastChatList)).reverse()
      let newLastChatList = []
      const burningAfterDelete = getItem('BurningAfterDelete') || {}
      for (let i = 0; i < lastChatList.length; i++) {
        let lastChat = lastChatList[i]
        // 对比阅后即焚消息的时间
        if (!lastChat.isRoom) {
          // 获取最新的阅后即焚消息
          let lastDelMessage = {} // 最新的阅后即焚消息对象
          let lastDelMessageTime = 0 // 最新的阅后即焚消息发送时间

          if (burningAfterDelete[lastChat.jid]) {
            const delMessageList = burningAfterDelete[lastChat.jid].messageList || []
            delMessageList.forEach((msg, index) => {
              if (msg.timeSend > lastDelMessageTime) {
                lastDelMessageTime = msg.timeSend
                lastDelMessage = msg
              }
            })
          }

          // 一样的消息不做处理
          if (lastDelMessage.messageId === lastChat.messageId) {
            delete burningAfterDelete[lastChat.jid]
            continue
          }

          // 有最新阅后即焚消息处理
          if (JSON.stringify(lastDelMessage) !== '{}') {
            // 最新阅后即焚消息比接口的最后一条消息时间要大，则替换
            if (lastDelMessage.timeSend > lastChat.timeSend) {
              lastChat.isReadDel = lastDelMessage.isReadDel
              lastChat.timeSend = lastDelMessage.timeSend
              lastChat = App.$utils.Xmpp.formatLastChatMessage(lastChat)
            }
            delete burningAfterDelete[lastChat.jid] // 删除已读取的阅后即焚消息
          }
        }
        // 添加元素到新数组
        newLastChatList.push(lastChat)
      }
      // 添加剩下的最新阅后即焚消息
      for (let key in burningAfterDelete) {
        const delMessageList = burningAfterDelete[key].messageList || []
        // 没有阅后即焚消息跳出
        if (delMessageList.length === 0) {
          continue
        }
        let lastDelMessage = {} // 最新的阅后即焚消息对象
        let lastDelMessageTime = 0 // 最新的阅后即焚消息发送时间
        delMessageList.forEach((msg, index) => {
          if (msg.timeSend > lastDelMessageTime) {
            lastDelMessageTime = msg.timeSend
            lastDelMessage = msg
          }
        })
        // 格式化最新阅后即焚消息属性
        const meId = getItem('MeId')
        if (parseInt(lastDelMessage.fromUserId) !== meId) {
          // 这条阅后即焚消息是聊天对方发送的
          lastDelMessage.jid = lastDelMessage.fromUserId
          lastDelMessage.isRoom = 0
        }
        lastDelMessage = App.$utils.Xmpp.formatLastChatMessage(lastDelMessage)
        // 添加元素到新数组
        newLastChatList.push(lastDelMessage)
      }
      // 根据发送时间排序 降序
      newLastChatList.sort((a, b) => { return b.timeSend - a.timeSend })
      let message = state.NewMessageNumberList
      let backData = state.backEndNewMessage
      // 设置消息数量
      newLastChatList.forEach(e => {
        if (message[e.jid] || backData[e.jid]) {
          let aa = 0
          let num = e.newMessageNumber ? e.newMessageNumber : 0
          let messageNum = message[e.jid] ? message[e.jid] : 0
          let backDataNum = backData[e.jid] ? backData[e.jid] : 0
          
          if(e['newMessageNumber']){
            aa = num + messageNum
          }else if(message[e.jid] && backData[e.jid]){
            aa = messageNum + backDataNum
          }else if(backData[e.jid]){
            aa = backDataNum
          }else if(message[e.jid]){
            aa = messageNum
          }
          App.$set(e, 'newMessageNumber', aa)
        } 
        else {
          App.$set(e, 'newMessageNumber', 0)
        }
      })
      return newLastChatList
    },
    NewMessageList(state){
      let newArr = []
      let newMessageList =  state.NewMessageNumberList
      let newKey = Object.keys(newMessageList)
      for(let i=0; i<newKey.length; i++){
        newArr.push({
          taskName: {
            name:newKey[i]
          },
          num: newMessageList[newKey[i]],
          id: 1,
        })
      }
      return newArr
      // return newMessageList
    },
  },
  mutations: {
    // 变更路由参数
    ChangeIMRouterParams(state, params) {
      state.IMRouterParams = params
    },
    SET_LAST_CHAT_LIST (state, response) { 
      state.LastChatList = response
    },
    SET_TOP_CHAT_LIST(state, list) {
      state.TopChatList = list
    },
    SEARCH_CHAT_LIST(state, searchList){
      state.SearchChatList = searchList
      // window.localStorage.setItem('changeList',JSON.stringify(searchList))
    },
    SEARCH_CHAT_DATA(state, data){
      state.SearchData = data
    },

    SET_LAST_CHAT (state, resource) {
      if (resource.index !== undefined) {
        state.LastChatList.splice(resource.index, 1)
      }
      state.LastChatList.push(resource.message)
    },
    DEL_LAST_CHAT (state, id) {
      for (let i = 0; i < state.LastChatList.length; i++) {
        if (state.LastChatList[i].jid === id) {
          state.LastChatList.splice(i, 1)
        }
      }
    },
    SET_CURRENT_PERSONNEL(state, user){
      state.CurrentPersonnel = user
      state.jumpUrl = user.url
    },
    SET_NEW_MESSAGE_NUMBER_SUM (state, resource) { state.NewMessageNumberSum = resource },
    SET_NEW_MESSAGE_NUMBER_LIST (state, resource) { state.NewMessageNumberList = resource },
    SET_ONLYONCE(state, bool){state.onlyOnce = bool},
    SET_BACK_END_NEWMESSAGE(state,newMeaasge){state.backEndNewMessage = newMeaasge},
    SET_NEW_MAIL_MESSAGE (state, resource) { state.SetNewMailMessage = resource },
    READY_STATE (state, resource) { state.readyState = resource },
  },
  actions: {
    // [GET] 获取聊天列表
    async GetLastChatList (ctx, params = {}) {
      await ctx.dispatch('getlastChatList') // 获取后端 - 离线消息数据
      let lastChatListStorage = lastChatList.get()
      if (ctx.state.TopChatList.length === 0) await ctx.dispatch('Im/Information/GetTigaseDialog', {}, { root: true })
      if (ctx.rootState.Im.Friends.FriendList.length === 0) await ctx.dispatch('Im/Friends/GetFriendsList', {}, { root: true })
      if (ctx.rootState.Im.Room.RoomList.length === 0) await ctx.dispatch('Im/Room/GetRoomList', {}, { root: true })
      const idFriendList = ctx.rootGetters['Im/Friends/IdFriendList']
      const jidRoomList = ctx.rootGetters['Im/Room/JidRoomList']
      const topChatList = ctx.state.TopChatList

      // 登陆时或者本地数据为空时需要同步数据，否则只需要返回本地数据即可
      if (params.type === 'login' || lastChatListStorage.length === 0) {
      const token = localStorage.getItem('TOKEN')
      // 参数初始化
        if (!params.data) {
          params.data = { startTime: 0, endTime: 0, pageSize: 50000,token:token }
        }
        console.log(params.data,'lastChatListStorage--')
        // 接口请求
        const rs = await Ax.post('/tigase/getLastChatList', params.data)
        if (rs.resultCode !== 1) return rs
        rs.data.reverse() // 数据倒叙，让时间距离现在越近的消息排在前面
        const lastChatListResponse = []
        // 编辑接口返回的数据
        console.log(rs,"2ssss")
        for (let i = 0; i < rs.data.length; i++) {
          let item = rs.data[i]
          // 屏蔽陌生人的信息（暂时不做陌生人消息功能）
          if ((item.isRoom && !jidRoomList[item.jid]) || (!item.isRoom && !idFriendList[item.jid])) {
            continue
          }
          item = this._vm.$utils.Xmpp.decryptMessage(item) // 解密
          item = this._vm.$utils.Xmpp.formatLastChatMessage(item) // 格式化消息内容
          const chatType = item.chatType || item.isRoom ? 2 : 1 // 聊天类型

          // 获取昵称
          if (item.isRoom === 0) {
            item.toNickName = idFriendList[item.jid].toNickname
          }
          else item.toNickName = jidRoomList[item.jid].name
          // 统一Id格式（接口返回的最新消息列表是to（接收者ID）和from（发送者ID），新的单条消息则是toUserId（接收者ID）和fromUserId（发送者ID））
          item.toUserId = item.to
          item.fromUserId = item.from
          // 去掉客服公众号
          if(item.toUserId === 10000) return
          lastChatListResponse.push(item)
        }
        // TODO: 显示所有的人，群
        let lastChatListResponseJidsArr = lastChatListResponse.map(item => item.jid)
        // 添加人
        for (let key in idFriendList) {
          const item = idFriendList[key]
          if (item.jid && !lastChatListResponseJidsArr.includes(item.jid) && item.toUserId !== 10000) {
            let timeSendLen = String(item.createTime).length
            let timeSend = 0
            // 时间戳
            if (timeSendLen === 13) {
              timeSend = Number(item.createTime)
            } else if (timeSendLen === 10) {
              timeSend = Number(item.createTime) * 1000
            }
            const itemData = {
              chatType: 1,
              avatar: item.avatar,
              content: "",
              encryptType: 0,
              from: `${ item.toUserId }/web`,
              fromUserId: `${ item.toUserId }/web`,
              fromUserName: item.toNickname,
              isEncrypt: false,
              isRoom: 0,
              jid: item.jid,
              messageId: "",
              timeSend: item.createTime,
              to: item.userId,
              toNickName: item.toNickname,
              toUserId: item.toUserId,
              toUserName: '',
              type: 1,
              userId: item.userId,
              _id: "",
              headImg:item.headImg
            }
            lastChatListResponse.push(itemData)
          }
        }
        // 添加群
        for (let key in jidRoomList) {
          const item = jidRoomList[key]
          if (item.jid && !lastChatListResponseJidsArr.includes(item.jid) && item.toUserId !== 10000) {
            let timeSendLen = String(item.createTime).length
            let timeSend = 0
            // 时间戳
            if (timeSendLen === 13) {
              timeSend = Number(item.createTime)
            } else if (timeSendLen === 10) {
              timeSend = Number(item.createTime) * 1000
            }
            const itemData = {
              chatType: 2,
              avatar: item.avatar,
              content: "",
              encryptType: 0,
              from: "",
              fromUserId: "",
              fromUserName: "",
              isEncrypt: false,
              isRoom: 1,
              jid: item.jid,
              messageId: "",
              timeSend,
              to: "",
              toNickName: item.name,
              toUserId: "",
              toUserName: item.name,
              type: 1,
              userId: "",
              _id: "",
              headImg:item.headImg
            }
            lastChatListResponse.push(itemData)
          }
        }

        if (lastChatListResponse.length !== 0) {
          const difference = this._vm.$utils.Tools.objectDifference(lastChatListResponse, lastChatListStorage, 'messageId')
          difference.forEach(message => {
            // 删除已有的就数据
            for (let i = 0; i < lastChatListStorage.length; i++) {
              if (message.jid === lastChatListStorage[i].jid) {
                lastChatListStorage.splice(i, 1)
                break
              }
            }
            lastChatListStorage.push(message)
          })
        }
        lastChatList.set(lastChatListStorage)
      }
      const _lastChatListStorage = messageTopSort(topChatList, lastChatListStorage)
      ctx.commit('SET_LAST_CHAT_LIST', _lastChatListStorage)
      return _lastChatListStorage
    },
    getlastChatList(ctx){
      let routerFromPath =  window.localStorage.getItem("routerFromPath")
      let firstPath  =  window.localStorage.getItem("firstFromPath")
      console.log(firstPath,'firstPath - firstPath')
      if(routerFromPath === '/login' && firstPath === null){
        // 设置消息数量
        let userId = window.localStorage.getItem('USERID')
        getMessage(userId).then(res=>{
          let resData = res.data.data.newMessageList ? JSON.parse(res.data.data.newMessageList) : 0
          console.log('343434343',resData)
          ctx.commit('SET_BACK_END_NEWMESSAGE', resData)
          window.localStorage.setItem("firstFromPath",true)
        })
      }
    },
    // 获取置顶消息列表
    async GetTigaseDialog(ctx, params={}) {
      console.log('GetTigaseDialog- 获取置顶消息列表', params)
      params['userId'] = getItem('MeId') || ''
      
      const rs = await Ax.post('/tigase/dialog/get', params)
      if(rs.resultCode === 1) {
        let topList = rs.data
        ctx.commit('SET_TOP_CHAT_LIST', topList)
      }
    },
    // 搜索人名、群名、和消息记录
    async SearchChatList(ctx, params) {
      ctx.commit('SEARCH_CHAT_DATA', params.content)
      
      params['token'] = store.getters.token
      const rs = await Ax.post('/tigase/search', params)
      if(rs.resultCode === 1) {
        let topList = rs.data
        ctx.commit('SEARCH_CHAT_LIST', topList)
      }
      console.log("获取到的人名、群名、和消息记录", rs.data)
    },
    // [Set] 设置最后一条消息
    async SetLastChat (ctx, { message, id }) {
      // 获取昵称
      if (ctx.rootState.Im.Friends.FriendList.length === 0) await ctx.dispatch('Im/Friends/GetFriendsList', {}, { root: true })
      if (ctx.rootState.Im.Room.RoomList.length === 0) await ctx.dispatch('Im/Room/GetRoomList', {}, { root: true })
      const idFriendList = ctx.rootGetters['Im/Friends/IdFriendList']
      const jidRoomList = ctx.rootGetters['Im/Room/JidRoomList']

      message = this._vm.$utils.Xmpp.formatLastChatMessage(message) // 格式化消息内容
      if (message.chatType === 1 && message.type !== 907) {
        message.toNickName = idFriendList[message.fromUserId].toNickname
      } else {
        if (!jidRoomList[message.roomJid || message.jid || message.toUserId]) {
          await ctx.dispatch('Im/Room/GetRoomList', {}, { root: true })
        }
        if (jidRoomList[message.roomJid || message.jid || message.toUserId]) message.toNickName = jidRoomList[message.roomJid || message.jid || message.toUserId].name
      }

      // 寻找消息在列表的位置
      const lastChatList = ctx.state.LastChatList

      for (let i = 0; i < lastChatList.length; i++) {
        let isTrue = false
        if (lastChatList[i].isRoom) {
          // 群消息
          if (lastChatList[i].jid === id) isTrue = true
        } else {
          // 个人消息
          const lastId = lastChatList[i].roomJid || lastChatList[i].jid || lastChatList[i].fromUserId || lastChatList[i].toUserId
          if (lastId === id) isTrue = true
        }
        if (isTrue) {
          ctx.commit('SET_LAST_CHAT', { index: i, message })
          return
        }
      }
      ctx.commit('SET_LAST_CHAT', { message })
    },
    // [Set] 设置新消息数量总和
    SetNewMessageNumberSum (ctx, sum) {
      ctx.commit('SET_NEW_MESSAGE_NUMBER_SUM', sum)
    },
    // [Set] 设置新消息数量列表
    SetNewMessageNumberList (ctx, list) {
      ctx.commit('SET_NEW_MESSAGE_NUMBER_LIST', list)
    },
    SetNewMailMessage (ctx, sum) {
      ctx.commit('SET_NEW_MAIL_MESSAGE', sum)
    },
    readyState(ctx, sum){
      ctx.commit('READY_STATE', sum)
    }
  }
}
