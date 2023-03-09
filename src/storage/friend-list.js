/*
 * @Author: your name
 * @Date: 2021-09-28 11:08:45
 * @LastEditTime: 2022-04-19 11:40:20
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\storage\friend-list.js
 */
// 操作localstorage好友列表
import App from '@/main'
import { getItem, setItem } from '@/utils/imUtil/storage'

const mutations = {
  // 设置好友到列表
  SET_FRIEND_LIST (list) {
    App.$store.commit('Im/Friends/SET_FRIEND_LIST', list)
  },
  // 添加好友到列表
  ADD_FRIEND_LIST (friend) {
    // 转成数值类型
    friend.fromUserId = parseInt(friend.fromUserId)
    friend.toUserId = parseInt(friend.toUserId)
    friend.timeSend = parseInt(friend.timeSend)
    friend.to = parseInt(friend.to)
    App.$store.commit('Im/Friends/ADD_FRIEND_LIST', friend)
  },
  // 删除好友
  DEL_FRIEND (friendId) {
    App.$store.commit('Im/Friends/DEL_FRIEND', friendId)
  }
}

export default {
  // 获取好友列表
  get () {
    const friendList = getItem('FriendList') || []
    return friendList
  },

  // 设置好友列表
  set (list) {
    mutations.SET_FRIEND_LIST(list)
    setItem('FriendList', list)
  },

  // 添加好友
  add (friend) {
    // 添加头像
    console.log(friend,'friend-friend')
    friend['avatar'] = '添加头像'
    const firendList = getItem('FriendList') || []

    let isExisted = false // 是否已存在
    for (let i = 0; i < firendList.length; i++) {
      if (firendList[i].toUserId === friend.toUserId) {
        isExisted = true
        break
      }
    }

    if (!isExisted) {
      firendList.push(friend)
      mutations.ADD_FRIEND_LIST(friend)
      setItem('FriendList', firendList)
    }
  },

  // 替换好友对象
  replace (friend) {
    // 添加头像
    const firendList = getItem('FriendList') || []

    for (let i = 0; i < firendList.length; i++) {
      if (firendList[i].toUserId === friend.toUserId) {
        firendList[i] = friend
        break
      }
    }

    mutations.SET_FRIEND_LIST(firendList)
    setItem('FriendList', firendList)
  },

  // 删除好友
  del (userId) {
    const firendList = getItem('FriendList') || []
    let isDel = false // 是否删除成功

    for (let i = 0; i < firendList.length; i++) {
      if (firendList[i].toUserId === userId) {
        firendList.splice(i, 1)
        isDel = true
        break
      }
    }
    if (isDel) {
      mutations.DEL_FRIEND(userId)
      setItem('FriendList', firendList)
    }
  }
}
