import App from '@/main'
import WEBIM from '@/xmpp/webim-reset'
import { getItem } from '@/utils/imUtil/storage'

import burningAfterDelete from './burning-after-delete'
import newMessageNumber from './new-message-number'
import sentReadMessageList from './sent-read-message-list'
import groupReadMessageList from './group-read-message-list'
import lastChatList from './last-chat-list'
import friendList from './friend-list'
import groupList from './group-list'
import initialChatList from './initial-chat-list'
import notShownMessage from './not-shown-message'
import retractMessage from './retract-message'

// 通过群id获取群jid
function getJidById (roomId) {
  const groupList = getItem('GroupList') || []
  for (let i = 0; i < groupList.length; i++) {
    if (groupList[i].id === roomId) {
      return groupList[i].jid
    }
  }
}

// 通过群id获取群id
function getIdByJid (roomId) {
  const groupList = getItem('GroupList') || []
  for (let i = 0; i < groupList.length; i++) {
    if (groupList[i].jid === roomId) {
      return groupList[i].id
    }
  }
}

// 因业务操作需要操作本地数据的集合
export const ousinessPperations = {
  // 退出聊天群
  exitChatGroup ({ roomId }) {
    // 通过传入的id获取jid或id
    const jid = getJidById(roomId) || roomId
    const id = getIdByJid(roomId) || roomId
    sentReadMessageList.del(jid) // 删除发送已阅读消息
    groupReadMessageList.del(jid) // 删除群组已读消息
    groupList.del(id) // 删除群组
    lastChatList.del(jid) // 删除最后一条消息
    newMessageNumber.deleteId(jid) // 删除新消息数量
    initialChatList.del(jid) // 删除初始消息聊天列表
    // 退出xmpp群聊
    const meId = App.$store.state.Common.User.MeId
    WEBIM.exitGroupChat(jid, meId)
  },
  // 加入聊天群
  joinChatGroup (room) {
    groupList.add(room) // 添加本地缓存
    lastChatList.setLastChat({ message: room, chatType: 2 }) // 添加最后一条消息
    newMessageNumber.add(room.objectId) // 添加新消息数量

    // 添加初始消息聊天列表
    const message = JSON.parse(JSON.stringify(room))
    if (message.fromUserId === message.toUserId) {
      message.content = `${message.toUserName} 进入聊天群`
    } else {
      message.content = `${message.fromUserName} 邀请群成员：${message.toUserName}`
    }
    initialChatList.add({ message, id: room.objectId })

    // 加入xmpp群聊
    const meId = App.$store.state.Common.User.MeId
    WEBIM.joinGroupChat(room.jid, meId)
  },
  // 添加好友
  addFriend ({ message, friend }) {
    friendList.add(friend) // 添加朋友列表
    
    // newMessageNumber.add(friend.toUserId) // 添加新消息数量
    message.type = 10002
    // message.content = '你们已成为好友'
    initialChatList.add({ message, id: friend.toUserId }) // 添加初始消息聊天列表
    lastChatList.setLastChat({ message, chatType: 1 }) // 设置最后聊天消息列表
  },
  // 删除好友
  delFriend ({ friendId }) {
    retractMessage.del(friendId) // 删除撤回消息记录
    initialChatList.del(friendId) // 删除初始消息聊天列表
    lastChatList.del(friendId) // 删除最后聊天消息列表
    sentReadMessageList.del(friendId) // 删除发送已阅读消息
    burningAfterDelete.deleteId(friendId) // 删除阅后即焚消息列表
    newMessageNumber.deleteId(friendId) // 删除新消息数量
    friendList.del(friendId) // 删除好友列表
  },
  // 撤回消息
  retractMessage ({ message, userId, chatType }) {
    retractMessage.set({ message, userId }) // 设置撤回消息列表
    lastChatList.setLastChat({ message, chatType }) // 设置最后一条消息
  }
}

const value = {
  ousinessPperations,
  burningAfterDelete,
  newMessageNumber,
  sentReadMessageList,
  groupReadMessageList,
  lastChatList,
  friendList,
  groupList,
  initialChatList,
  retractMessage,
  notShownMessage
}

export default {
  install (Vue, Option) {
    Object.defineProperty(Vue.prototype, '$storage', { value })
  }
}
