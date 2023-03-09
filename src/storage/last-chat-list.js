// 最后一条消息列表
import App from '@/main'
import { getItem, setItem } from '@/utils/imUtil/storage'

const mutations = {
  // 设置最后一条消息列表
  SET_LAST_CHAT_LIST (list) {
    App.$store.commit('Im/Information/SET_LAST_CHAT_LIST', list)
  }
}

const actions = {
  // [Get] 获取群列表
  async GetRoomList () {
    const rs = await App.$store.dispatch('Im/Room/GetRoomList')
    return rs
  },
  // [Get] 获取好友列表
  async GetFriendList () {
    const rs = await App.$store.dispatch('Im/Friends/GetFriendsList')
    return rs
  }
}

export default {
  get () {
    const lastChatList = getItem('LastChatList') || []
    return lastChatList
  },
  set (list) {
    mutations.SET_LAST_CHAT_LIST(list)
    setItem('LastChatList', list)
  },
  del (id) {
    const lastChatList = this.get()
    let isDel = false // 是否删除成功

    for (let i = 0; i < lastChatList.length; i++) {
      if (lastChatList[i].jid + '' === id + '') {
        lastChatList.splice(i, 1)
        isDel = true
      }
    }
    if (isDel) {
      mutations.SET_LAST_CHAT_LIST(lastChatList)
      this.set(lastChatList)
    }
  },
  async setLastChat ({ message, chatType }) {
    // 获取好友列表和群列表
    if (!message) return
    message = JSON.parse(JSON.stringify(message))
    const fiendList = App.$store.state.Im.Friends.FriendList
    const roomList = App.$store.state.Im.Room.RoomList
    if (fiendList.length === 0) await actions.GetRoomList()
    if (roomList.length === 0) await actions.GetFriendList()
    const idFriendList = App.$store.getters['Im/Friends/IdFriendList']
    const jidRoomList = App.$store.getters['Im/Room/JidRoomList']
    message = App.$utils.Xmpp.formatLastChatMessage(message) // 格式化消息内容
    let toId
    if (chatType === 1 && message.type !== 907) {
      const meId = App.$store.state.Common.User.MeId
      if (parseInt(message.fromUserId) === meId) {
        toId = message.toUserId
      } else {
        toId = message.fromUserId
      }
      message.jid = toId
      message.isRoom = false
      message.toNickName = idFriendList[toId] ? idFriendList[toId].toNickname : message.toUserName
    } else {
      toId = message.roomJid || message.jid || message.toUserId
      message.isRoom = true
      message.jid = toId
      if (jidRoomList[toId]) {
        message.toNickName = jidRoomList[toId].name
      }
    }
    // 寻找消息在列表的位置
    const lastChatList = this.get()
    for (let i = 0; i < lastChatList.length; i++) {
      let isTrue = false
      if (lastChatList[i].isRoom) {
        // 群消息
        if (lastChatList[i].jid === toId) isTrue = true
      } else {
        // 个人消息
        const lastChatId = lastChatList[i].roomJid || lastChatList[i].jid
        if (lastChatId === toId) isTrue = true
      }
      if (isTrue) {
        lastChatList.splice(i, 1)
      }
    }
    lastChatList.push(message)
    mutations.SET_LAST_CHAT_LIST(lastChatList)
    this.set(lastChatList)
  }
}
