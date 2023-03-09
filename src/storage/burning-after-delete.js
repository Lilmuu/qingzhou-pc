// 阅后即焚消息操作
import App from '@/main'
import { getItem, setItem } from '@/utils/imUtil/storage'

const mutations = {
  // 设置阅后即焚消息列表
  SET_BURNING_AFTER_DELETE (burningAfterDelete) {
    App.$store.commit('Im/Chat/SET_BURNING_AFTER_DELETE', burningAfterDelete)
  }
}

export default {
  // 获取本地阅后即焚数据
  get () {
    return getItem('BurningAfterDelete') || {}
  },
  // 删除id
  deleteId (id) {
    // 删除本地消息
    const burningAfterDelete = this.get()
    if (burningAfterDelete[id]) {
      delete burningAfterDelete[id]
      mutations.SET_BURNING_AFTER_DELETE(burningAfterDelete)
      setItem('BurningAfterDelete', burningAfterDelete)
    }
  },
  // 设置已读的阅后即焚消息
  setRead (id, messageId, type, params) {
    const burningAfterDelete = this.get()
    if (burningAfterDelete[id]) {
      // 需要做一个循环判断
      const msgList = burningAfterDelete[id].messageList || []
      for (let i = 0; i < msgList.length; i++) {
        if (msgList[i].messageId === messageId) {
          // 根据传入的type，做不同的操作
          if (type === 'del') {
            // 删除操作
            burningAfterDelete[id].messageList.splice(i, 1) // 删除该消息
          } else if (type === 'set') {
            for (const key in params) {
              // 遍历参数添加属性
              burningAfterDelete[id].messageList[i][key] = params[key]
            }
          }

          // 更新数据
          mutations.SET_BURNING_AFTER_DELETE(burningAfterDelete) // 更新vuex数据
          setItem('BurningAfterDelete', burningAfterDelete) // 更新localStorage数据
          break
        }
      }
    }
  }
}
