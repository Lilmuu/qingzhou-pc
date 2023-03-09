/*
 * @Author: your name
 * @Date: 2021-09-28 11:08:45
 * @LastEditTime: 2022-02-15 15:14:13
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\storage\new-message-number.js
 */
// 新消息数量
import App from '@/main'
import Xmpp from '@/utils/imUtil/xmpp'
import { getItem, setItem } from '@/utils/imUtil/storage'

const actions = {
  // [Set] 设置新消息数量列表
  SetNewMessageNumberList (list) {
    App.$store.dispatch('Im/Information/SetNewMessageNumberList', list)
  },
  // [Set] 设置新消息数量总和
  SetNewMessageNumberSum (num) {
    App.$store.dispatch('Im/Information/SetNewMessageNumberSum', num)
  },
}

export default {
  getList () {
    const newMessageNumberList = getItem('newMessageNumberList') || {}
    return newMessageNumberList
  },
  getSum () {
    const newMessageNumberSum = getItem('newMessageNumberSum') || 0
    return newMessageNumberSum
  },
  // 添加
  add (id) {
    // 新消息总数量
    let newMessageNumberSum = this.getSum() + 1
    actions.SetNewMessageNumberSum(newMessageNumberSum)
    setItem('newMessageNumberSum', newMessageNumberSum)

    // 新消息数量列表
    const newMessageNumberList = this.getList()
    if (JSON.stringify(newMessageNumberList) !== '{}') {
      let isNumber = false // 是否有值，没有则初始化
      for (let key in newMessageNumberList) {
        if (key + '' === id + '') {
          ++newMessageNumberList[key]
          isNumber = true
          break
        }
      }
      if (!isNumber) newMessageNumberList[id] = 1
    } else newMessageNumberList[id] = 1
    actions.SetNewMessageNumberList(newMessageNumberList)
    setItem('newMessageNumberList', newMessageNumberList)
  },
  // 删除id
  deleteId (id) {
    const newMessageNumberList = getItem('newMessageNumberList') || []
    let newMessageNumberSum = getItem('newMessageNumberSum') || 0
    if (newMessageNumberList[id]) {
      // 更改新消息数量总数
      newMessageNumberSum -= newMessageNumberList[id]
      if (newMessageNumberSum < 0) newMessageNumberSum = 0
      actions.SetNewMessageNumberSum(newMessageNumberSum)
      setItem('newMessageNumberSum', newMessageNumberSum)
      // 删除当前当前的新消息数量
      delete newMessageNumberList[id]
      actions.SetNewMessageNumberList(newMessageNumberList)
      setItem('newMessageNumberList', newMessageNumberList)
      // 初始化未读新朋友消息列表ID
      if (id === 'newFriendList') {
        setItem('newFriendMessageList', [])
      }
    }
  }
}
