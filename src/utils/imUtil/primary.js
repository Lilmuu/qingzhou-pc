import App from '@/main'
import friendList from '@/storage/friend-list'

const mutations = {
  RESET_LOGIN () {
    App.$store.commit('RESET_LOGIN')
  },
  // 设置阅后即焚消息列表
  SET_BURNING_AFTER_DELETE (burningAfterDelete) {
    App.$store.commit('Im/Chat/SET_BURNING_AFTER_DELETE', burningAfterDelete)
  }
}

const actions = {
  // [Set] 设置新消息数量列表
  SetNewMessageNumberList (list) {
    App.$store.dispatch('Im/Information/SetNewMessageNumberList', list)
  },
  // [Set] 设置新消息数量总和
  SetNewMessageNumberSum (num) {
    App.$store.dispatch('Im/Information/SetNewMessageNumberSum', num)
  }
}

// 退出登录
export const logout = () => {
  mutations.RESET_LOGIN()
  App.$router.push('/login')
}
// IM路由params set
export const setWindowIMRouterParams = (params) => {
  window.IMRouterParams = params
  App.$store.commit('Im/Chat/ChangeIMRouterParams', params)
  App.$store.commit('Im/Friends/ChangeIMRouterParams', params)
  App.$store.commit('Im/Information/ChangeIMRouterParams', params)
  App.$store.commit('Im/Me/ChangeIMRouterParams', params)
  App.$store.commit('Im/Room/ChangeIMRouterParams', params)
}

// 删除新消息数量
export const deleteNewMessageNumber = (data) => {
  let key = data.jid
  // if (data.isRoom) {
  //   key = data.jid
  // } else {
  //   const meId = App.$utils.LocalStorage.getItem('MeId')
  //   if (parseInt(data.fromUserId) === meId) {
  //     key = data.toUserId
  //   } else {
  //     key = data.fromUserId
  //   }
  // }
  const newMessageNumberList = JSON.parse(JSON.stringify(App.$store.state.Im.Information.NewMessageNumberList))
  let newMessageNumberSum = App.$store.state.Im.Information.NewMessageNumberSum
  if (newMessageNumberList[key]) {
    // 更改新消息数量总数
    newMessageNumberSum -= newMessageNumberList[key]
    if (newMessageNumberSum < 0) newMessageNumberSum = 0
    actions.SetNewMessageNumberSum(newMessageNumberSum)
    App.$utils.LocalStorage.setItem('newMessageNumberSum', newMessageNumberSum)
    // 删除当前当前的新消息数量
    delete newMessageNumberList[key]
    actions.SetNewMessageNumberList(newMessageNumberList)
    App.$utils.LocalStorage.setItem('newMessageNumberList', newMessageNumberList)
    // 初始化未读新朋友消息列表ID
    if (key === 'newFriendList')
    App.$utils.LocalStorage.setItem('newFriendMessageList', [])
  }
}

export const randomUUID = () => {
  const charArray = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  var chars = charArray, uuid = new Array(36), rnd = 0, r;
  for (var i = 0; i < 36; i++) {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      uuid[i] = '-';
    } else if (i == 14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02)
        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
      r = rnd & 0xf;
      rnd = rnd >> 4;
      uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('').replace(/-/gm, '').toLowerCase();
}

/**
 * @function getSendParams 获取发送消息的参数
 * @param {object} _this 上下文环境
 * @param {number} msgType 消息类型
 * @param {string} content 消息体
 * @return {object}
 */
export const getSendParams = (_this, msgType, content, toUserMsg = null) => {
  let toUserObject = toUserMsg != null ? toUserMsg : window.IMRouterParams
  const params = {
    msgType: msgType,
    content: content,
    toId: toUserObject.jid
  }

  if (toUserObject.type === 'room') {
    params.chatType = _this.$chatType.GroupChatNumber
    params.toName = _this.JidRoomList[params.toId].name
    params.encryptType = _this.JidRoomList[params.toId].encryptType
  } else if (toUserObject.type === 'friend') {
    params.chatType = _this.$chatType.ChatNumber
    params.toName = _this.IdFriendList[params.toId].toNickname
    params.encryptType = _this.IdFriendList[params.toId].encryptType
  }

  return params
}

export default { logout, deleteNewMessageNumber, randomUUID, getSendParams }
