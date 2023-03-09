/**
 * @description     main.js 把 electron ipcRenderer 挂到 vue $electron ipcRenderer 上，然后用 this.$electron.ipcRenderer 处理 ipc 事件
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:36:32
 */

import 'babel-polyfill'
import Vue from 'vue'
import { ipcRenderer,BrowserWindow } from 'electron'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import 'animate.css/animate.css'
import ElementUI from 'element-ui'
import VueClipboard from 'vue-clipboard2'

// 打包后 element-ui 字体缺失，转到 src/index.ejs 中添加cdn
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN'
// 重写 element ui message
import $message from "@/components/Message/Message";
import App from './App'
import router from './router'
import store from './store'
import Avue from "@smallwei/avue"

import "@smallwei/avue/lib/index.css"
import "@/assets/css/default.css"
import 'splitpanes/dist/splitpanes.css'
import '@/styles/index.scss'
import '@/icons'// svg icon
import '@/permission'
import '@/utils/flexible'
import Utils from './utils/imUtil'
import Storage from './storage'
import { formatStringWidth, formatUserName, getMailPrefix, secondsFormat } from "@/utils"
import dayjs from "dayjs"
import Clickoutside from 'element-ui/src/utils/clickoutside'
import tvvssdk from "@/assets/js/sdk/tvvssdk.js"
import './components/index'

import Print from 'vue-print-nb'
Vue.use(Print);
Vue.use(ElementUI, { locale })
Vue.use(VueClipboard)
Vue.prototype.$message = $message
Vue.prototype.$msg = $message

// 挂载 electron ipcRenderer
const $electron = {
  ipcRenderer,
  BrowserWindow
}

Vue.prototype.$electron = $electron

Vue.use(Avue, {
  size: "medium",
  menuType: "text"
})
// 工具
Vue.use(Utils)
Vue.use(Storage)

Vue.directive('Clickoutside', Clickoutside)

Vue.config.productionTip = false

// 过滤
import '@/utils/filters'
Vue.filter('formatUserName', function(username) {
  return formatUserName(username)
})
Vue.filter('dayjsFormat', function(date, template = 'YYYY-MM-DD HH:mm') {
  return dayjs(date).format(template)
})
Vue.filter('formatStringWidth', function(str, start = 0, end = 8) {
  return formatStringWidth(str, start, end)
})
Vue.filter('getMailPrefix', function(str) {
  return getMailPrefix(str)
})
// 聚焦元素
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

// px转成vw方法 
Vue.prototype.$pxTurnVw = (px)=>{
  return `${(px / 1920)*100 }vw`
}

// IM静态常量
import Constant from '@/const/constant'
Vue.prototype.$constant = Constant
// IM聊天类型
import { ChatType, MessageType } from '@/xmpp/message-type'
Vue.prototype.$chatType = ChatType
Vue.prototype.$msgType = MessageType
// 静态图片路径
import ImagesUrl from '@/assets/js/images-url'
Vue.prototype.$imgUrl = ImagesUrl

// 视频会议SDK
Vue.prototype.$tvvssdk = tvvssdk
Vue.prototype.$secondsFormat = secondsFormat
import { getUUID } from '@/utils/uuid'
// 挂载UUID的生成方法
Vue.prototype.$UUID = getUUID
// Strophe.js是为XMPP写的一个js类库。因为http协议本身不能实现持久连接，所以strophe利用BOSH模拟实现持久连接
import { Strophe } from 'strophe.js'

// const app = new Vue({
//   components: { App },
//   Strophe,
//   router,
//   store,
//   template: '<App/>'
// }).$mount('#app')

const app = new Vue({ router, store, Strophe, render: h => h(App) }).$mount('#app')

export default app
