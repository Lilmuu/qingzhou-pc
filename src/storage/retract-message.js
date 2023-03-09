// 撤回消息记录
import App from '@/main'
import { getItem, setItem } from '@/utils/imUtil/storage'

const mutations = {
  // 设置撤回消息记录
  SET_RETRACT_MESSAGE (list) {
    App.$store.commit('Im/Chat/SET_RETRACT_MESSAGE', list)
  }
}

export default {
  get () {
    const retractMessage = getItem('RetractMessage') || {}
    return retractMessage
  },
  set ({ message, userId }) {
    const retractMessage = this.get()
    if (retractMessage[userId]) {
      retractMessage[userId].push(message)
    } else {
      retractMessage[userId] = [message]
    }
    mutations.SET_RETRACT_MESSAGE(retractMessage)
    setItem('RetractMessage', retractMessage)
  },
  setAll (retractMessage) {
    setItem('RetractMessage', retractMessage)
  },
  del (id) {
    const retractMessage = this.get()
    if (retractMessage[id]) {
      delete retractMessage[id]
      mutations.SET_RETRACT_MESSAGE(retractMessage)
      this.setAll(retractMessage)
    }
  }
}
