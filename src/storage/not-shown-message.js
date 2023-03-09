// 收到但未显示的消息
import { getItem, setItem } from '@/utils/imUtil/storage'

export default {
  get () {
    const notShownMessage = getItem('NotShownMessage') || {}
    return notShownMessage
  },
  add ({ message, jid }) {
    const notShownMessage = this.get()
    if (notShownMessage[jid]) {
      notShownMessage[jid].push(message)
    } else {
      notShownMessage[jid] = [message]
    }
    setItem('NotShownMessage', notShownMessage)
  },
  setAll (notShownMessage) {
    setItem('NotShownMessage', notShownMessage)
  },
  deleteJid (jid) {
    const notShownMessage = this.get()
    if (notShownMessage[jid]) {
      delete notShownMessage[jid]
      this.setAll(notShownMessage)
    }
  }
}
