// 群消息已读列表
import { getItem, setItem } from '@/utils/imUtil/storage'
import { arrayCheck } from '@/utils/imUtil/tools'

export default {
  get () {
    return getItem('GroupReadMessageList') || {}
  },
  // 设置已读
  setRead (msg) {
    const readMsgList = this.get()
    if (readMsgList[msg.toUserId]) {
      const readMsg = readMsgList[msg.toUserId]
      if (readMsg[msg.content] !== undefined) {
        // 消息查重
        if (!arrayCheck(readMsg[msg.content], msg, 'fromUserId')) {
          readMsg[msg.content].push(msg)
        }
      } else {
        readMsg[msg.content] = [msg]
      }
    } else {
      readMsgList[msg.toUserId] = { [msg.content]: [msg] }
    }
    setItem('GroupReadMessageList', readMsgList)
  },
  del (id) {
    if (id) {
      const readMsgList = this.get()
      if (readMsgList[id]) {
        delete readMsgList[id]
        setItem('GroupReadMessageList', readMsgList)
      }
    }
  }
}
