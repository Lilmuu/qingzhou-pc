import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import socket from './modules/socket'
import setting from './modules/setting'
import meeting from './modules/meeting'
import workbench from './modules/workbench'
import Im from './modules/im/index'
import Common from './modules/common'
import friends from './modules/im/friends'
import getters from './getters'
import config from './modules/config'

Vue.use(Vuex)

const store = new Vuex.Store({
  namespaced: true,
  modules: {
    app,
    user,
    Im,
    Common,
    friends,
    socket,
    setting,
    meeting,
    config,
    workbench
  },
  getters
})

export default store
