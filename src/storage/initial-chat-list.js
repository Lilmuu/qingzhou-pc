// 操作localstorage初始聊天列表列表
import App from '@/main'
import { getItem, setItem } from '@/utils/imUtil/storage'

const mutations = {
  // 设置好友初始聊天列表
  SET_INITIAL_CHAT_LIST (list) {
    App.$store.commit('Im/Chat/SET_INITIAL_CHAT_LIST', list)
  }
}

export default {
  // 获取初始聊天列表
  get (id) {
    const initialChatList = getItem('InitialChatList') || {}
    return id ? initialChatList[id] : initialChatList
  },

  // 设置好友初始聊天列表
  add ({ message, id }) {
    const initialChatList = this.get()
    if (initialChatList[id]) {
      // 已有不添加
      if (initialChatList[id].indexOf(message.messageId) === -1) {
        initialChatList[id].push(message)
      }
    } else {
      initialChatList[id] = [message]
    }
    mutations.SET_INITIAL_CHAT_LIST(initialChatList)
    setItem('InitialChatList', initialChatList)
  },
  del (id) {
    const initialChatList = this.get()
    if (initialChatList[id]) {
      delete initialChatList[id]
      mutations.SET_INITIAL_CHAT_LIST(initialChatList)
      setItem('InitialChatList', initialChatList)
    }
  }
}
