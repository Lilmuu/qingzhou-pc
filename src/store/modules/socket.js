/***
 * @Author: 罗兴
 * @LastEditors: 罗兴
 * @Date: 2021-11-02 10:26:33
 * @LastEditTime: 2021-11-11 09:58:27
 * @FilePath: \task-pc-ui\src\store\modules\socket.js
 * @Description: file content
 */
/*
 * @Author: your name
 * @Date: 2021-09-28 11:08:45
 * @LastEditTime: 2022-03-01 14:30:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\store\modules\socket.js
 */
import Socket from "@/api/socket"
import App from '@/main'

const socket = {
  state: {
    $socket: null,
    socketMsg: {
      // 唯一时间戳
      timeStamp: 0,
      type: '',
      data: {}
    }
  },
  mutations: {
    INIT: (state) => {
      // 已经有连接了，就不用再次创建
      console.log(state,'socket - 创建链接')
      if(state.$socket) {
        // 已关闭状态，销毁，然后重新创建
        if(!state.$socket._docker || state.$socket._docker.readyState === 3) {
          state.$socket = null
        }
      }
      if (state.$socket !== null) return
      // 创建
      const token = localStorage.getItem('socketToken')
      if(!token) return
      state.$socket = new Socket(token)
      state.$socket.init()
      state.$socket.addMethods([(e) => {

        if (e.data === 'pong') return
        if (e.type === 'close') {
          state.socketMsg = {
            timeStamp: e.timeStamp,
            type: e.type,
            data: 'socket已断开连接'
          }
          // state.$socket = null
          state.$socket.init()

        }
        try {
          console.log(e,'uqhwoijewoiq')
          if('data' in e){
            const parseData = JSON.parse(e.data)
            state.socketMsg = {
              timeStamp: e.timeStamp,
              type: parseData.type || e.type,
              data: parseData.data
            }
          }

        } catch (error) {
          console.error(error)
        }


      }])
    }
  },
  actions: {
    // 初始化
    WSINIT({ commit }) {
      commit('INIT')
    },
    // 断开
    DISCONNECT({ commit }) {
      console.warn("socket 断开连接 - 001")
    },
    /**
     * 发送
     * @param data    {Object}  数据： 结构为{"type":"xxx","data":"xxx"}
     * */
    handleSend({ commit, state }, data) {
      if(!state.$socket) {
        commit('INIT')
      }
      if (state.$socket) {
        App.$store.dispatch('Im/Information/readyState', state.$socket._docker.readyState)
        if(state.$socket._docker.readyState ==1){
          if(!state.$socket._docker || state.$socket._docker.readyState === 3 ||state.$socket._docker.readyState === 0||state.$socket._docker.readyState === 2) {
            // state.$socket = null
            commit('INIT')
          }else{
            state.$socket.send(data)
          }
        }
      }
    }
  }
}

export default socket
