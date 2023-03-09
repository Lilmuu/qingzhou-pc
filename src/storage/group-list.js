/*
 * @Author: your name
 * @Date: 2022-03-29 15:59:26
 * @LastEditTime: 2022-04-19 11:40:22
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\storage\group-list.js
 */
// 群组列表
import App from '@/main'
import { getItem, setItem } from '@/utils/imUtil/storage'

const mutations = {
  // 设置群列表
  SET_ROOM_LIST (list) {
    App.$store.commit('Im/Room/SET_ROOM_LIST', list)
  },
  // 添加群到列表
  ADD_ROOM (room) {
    App.$store.commit('Im/Room/ADD_ROOM', room)
  },
  // 删除群
  DEL_ROOM (roomId) {
    App.$store.commit('Im/Room/DEL_ROOM', roomId)
  }
}

export default {
  get () {
    const groupList = getItem('GroupList') || []
    return groupList
  },
  set (list) {
    mutations.SET_ROOM_LIST(list)
    setItem('GroupList', list)
  },
  add (group) {
    const groupList = this.get()
    let isExisted = false // 是否已经存在
    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].id === group.id) {
        isExisted = true
        break
      }
    }

    if (!isExisted) {
      groupList.push(group)
      mutations.ADD_ROOM(group)
      setItem('GroupList', groupList)
    }
  },

  replace (group) {
    // 添加头像
    group.avatar = '添加头像'
    const groupList = this.get()

    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].id === group.id) {
        groupList[i] = group
        break
      }
    }

    mutations.SET_ROOM_LIST(groupList)
    setItem('GroupList', groupList)
  },

  del (roomId) {
    const groupList = this.get()
    let isDel = false // 是否删除成功
    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].id === roomId) {
        groupList.splice(i, 1)
        isDel = true
        break
      }
    }
    if (isDel) {
      mutations.DEL_ROOM(roomId)
      setItem('GroupList', groupList)
    }
  }
}
