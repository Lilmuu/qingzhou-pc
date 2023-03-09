// 已发送的已读消息列表
import { getItem, setItem } from '@/utils/imUtil/storage'

export default {
  set (userId, messageId) {
    const sentReadMessageList = getItem('SentReadMessageList') || {}
    if (sentReadMessageList[userId]) {
      if (sentReadMessageList[userId].indexOf(messageId) === -1) {
        sentReadMessageList[userId].push(messageId)
      } else {
        return true
      }
    } else {
      sentReadMessageList[userId] = [messageId]
    }
    setItem('SentReadMessageList', sentReadMessageList)
    return false
  },
  del (id) {
    if (id) {
      const readMsgList = getItem('SentReadMessageList') || {}
      if (readMsgList[id]) {
        delete readMsgList[id]
        setItem('SentReadMessageList', readMsgList)
      }
    }
  }
}
