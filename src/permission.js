/*
 * @Author: your name
 * @Date: 2021-08-31 23:29:10
 * @LastEditTime: 2022-06-22 18:47:18
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: In User Settings Edit
 * @FilePath: \vsCode\task-pc-ui\src\permission.js
 */
/**
 * @description     路由权限控制，检查 用户token、用户信息、im token 连接状态，im连接断开后切换路由可以自动登录
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 21:52:51
 */

import router from './router'
import store from './store'
import WEBIM from '@/xmpp/webim-reset'
// import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { getItem } from '@/utils/imUtil/storage'
import { Message } from 'element-ui'
import pkg from '../package.json'
import dayjs from "dayjs";

const whiteList = ['/login','/unread'] // 不重定向白名单
const imWhiteList = ['/login', '/meetingRoom', '/call','/unread','/meetingShareShrink','/preview'] // 不连接im

const cacheBuildTimeStr = localStorage.getItem('buildTime') || ''
// 转为时间戳
const cacheBuildTime = cacheBuildTimeStr ? dayjs(cacheBuildTimeStr).unix() : 0
const pkgBuildTime = dayjs(pkg.buildTime).unix()

router.beforeEach(async (to, from, next) => {
  if(navigator.onLine){
    window.localStorage.setItem("routerFullPath",to.fullPath)
    store.commit('SET_ROUTERFULLPATH', to.fullPath)
    window.localStorage.setItem("routerFromPath",from.fullPath)
    store.commit('SET_ROUTERFROMPATH', from.fullPath)
    let codeLogin = sessionStorage.getItem('codeLogin')
    // NProgress.start()
    // 每次安装时清除以前的数据，重新登录，检查 pkg buildTime，重新安装程序时对比 build 时间
    if(cacheBuildTime === 0 || cacheBuildTime < pkgBuildTime) {
      // 清除storage，重新登录
      localStorage.clear()
      localStorage.setItem('buildTime', pkg.buildTime)
      location.reload()
      return
    }
    if(to.path === '/message/index' && !codeLogin){
      if(localStorage.getItem('TOKEN') && !sessionStorage.getItem('loginStatus')){
        localStorage.clear()
        localStorage.setItem('buildTime', pkg.buildTime)
        location.reload()
        return
      }
    }
    if (store.getters.token) {
      if (to.path === '/login') {
        next({ path: '/' })
        // NProgress.done()
      } else {
        const isConnect = WEBIM.isConnect()
        // IM sdk
        if ( store.state.Common.User.MeId && !isConnect && imWhiteList.indexOf(to.path) === -1) {
          console.log("初始化IM,getItem('Token')", getItem('Token'))
          await WEBIM.initWebIM() // 初始化数据
          // 登录im
          await WEBIM.loginIM(async () => {
            // 同步数据
            await store.dispatch('InitIMConfig')
            // await store.dispatch('Im/Information/GetTigaseDialog', { type: 'xmpp' })
            await store.dispatch('Common/User/GetTimeDelay')
            await store.dispatch('Im/Friends/GetFriendsList', { type: 'xmpp' })
            await store.dispatch('Im/Room/GetRoomList', { type: 'xmpp' })
            await store.dispatch('Im/Information/GetLastChatList', { type: 'xmpp' })
            next()
          })
        }
        if (store.getters.roles.length === 0) {
          // 路由获取用户信息
          store.dispatch('GetInfo').then(res => { // 拉取用户信息
            next()
          }).catch((err) => {
            store.dispatch('FedLogOut').then(() => {
              Message.error(err || 'Verification failed, please login again')
              next({ path: '/' })
            })
          })
        } else {
          if(to.fullPath == '/404'){
            next('/workbench/index/workspace')
          }else{
            next()
          }
          // '/workbench/index/workspace'
          
        }
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        next('/login')
        // NProgress.done()
      }
    }
  }else{
    Message.error('网络已断开，请稍后再试')
    next(false)
    // NProgress.done()
  }
})

router.afterEach(() => {
  // NProgress.done() // 结束Progress
})
