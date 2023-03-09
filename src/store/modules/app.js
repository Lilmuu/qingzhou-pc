/*
 * @Author: your name
 * @Date: 2021-09-28 11:08:45
 * @LastEditTime: 2022-04-27 10:17:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\store\modules\app.js
 */
import Cookies from 'js-cookie'
import { config } from "@/const/dicData"

const tenantId = config.tenantId

const app = {
  state: {
    sidebar: {
      // opened: !+Cookies.get('sidebarStatus'),
      opened: false,
      withoutAnimation: false,
    },
    device: 'desktop',
    // mailConfigId: Number(localStorage.getItem('mailConfigId') || 0),
    mailConfigId:localStorage.getItem('mailConfigId') || '0',
    // tenantId: Number(localStorage.getItem('tenantId') || 0),
    tenantId: tenantId,
    mailContInfo:{}, // 邮件内容缓存数据
    depGroupList: [], // 部门列表
    contactShowTip: '', // 通讯录发起群聊按钮显示/隐藏
    messageMsg: null, // 消息对象实例
    routerFullPath: '', // to 路由
    routerFromPath: '', // from 路由
    organPersonnelList: [], // 组织架构成员
    winClientWidth: 800, // 浏览器宽度
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_MAILCONFIGID: (state, mailConfigId) => {
      state.mailConfigId = mailConfigId
    },
    SET_TENANTId: (state, dataTenantId) => {
      state.tenantId = tenantId;
      localStorage.setItem('tenantId', tenantId)
    },
    SET_MAILCONTINFO: (state,mailinfo)=>{
      let key = `${mailinfo.configId}-${mailinfo.groupId}`
      state.mailContInfo[key] = state.mailContInfo[key] || {}
      for(let i in mailinfo.list){
        const objKey = mailinfo.list[i].mailBody.id
        state.mailContInfo[key][objKey] = mailinfo.list[i]
      }
      console.log(state.mailContInfo,'state.mailContInfo - 邮件详情')
    },
    SET_DEPGROUPLIST(state, list){
      state.depGroupList = list
    },
    SET_CONTACTSHOWTIP (state, value){
      state.contactShowTip = value
    },
    SET_MESSAGEMES(state, message){
      state.messageMsg = message
    },
    SET_ROUTERFULLPATH(state, router){
      state.routerFullPath = router
    },
    SET_ROUTERFROMPATH(state, router){
      state.routerFromPath = router
    },
    SET_ORGANPERSONNELLIST(state, list){
      state.organPersonnelList = list
    },
    SET_WINCLIENTWIDTH (state, value){
      state.winClientWidth = value
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    SetMailConfigId({commit}, mailConfigId) {
      commit('SET_MAILCONFIGID', mailConfigId)
    }
  }
}

export default app
