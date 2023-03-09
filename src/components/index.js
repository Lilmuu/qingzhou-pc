import Vue from 'vue'
import approvalProcess from './approvalProcess/approvalProcess'
import oaMenu from './oaMenu/index'
import fileIcon from "./fileIcon";


// 注册全局容器
Vue.component('approvalProcess', approvalProcess)
Vue.component('oaMenu', oaMenu)
Vue.component('fileIcon', fileIcon)
