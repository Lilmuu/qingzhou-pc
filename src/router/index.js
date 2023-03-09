/**
 * @description     路由，新窗口的路由配置不要使用懒加载模式，不要放在Layout模板中，要单独提出来并配置窗口地址
 * in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
 * see https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 21:53:47
 */

import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

// 防止路由重复报错
const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err);
};
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/

// 不进行路由懒加载
import notFoundPage from '@/views/404'
import offlinePage from '@/views/offline'

export const constantRouterMap = [
  // 登录页面
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  // 会议室
  { path: '/meetingRoom', component: () => import('@/views/meeting/meetingRoom'), hidden: true },
  { path: '/meetingShareShrink', component: () => import('@/views/meeting/meetingShareShrink'), hidden: true },
  // 文件预览窗口
  { path: '/preview', component: () => import('@/views/taskR/preview'), hidden: true },
  // 语音通话
  { path: '/call', component: () => import('@/views/call/call'), hidden: true },
  // 未读列表
  { path:'/unread',component:()=> import('@/views/unread/unread'),hidden:true},

  // { path:'/workbench/topics',name:'topics',component:()=> import('@/views/workbench/topics/topics.vue')},
  { path: '/404', component: notFoundPage, hidden: true },
  { path: '/offline', component: offlinePage, hidden: true },
  {
    path: '/',
    component: Layout,
    redirect: '/message/index',
    name: 'Dashboard',
    breadcrumb: false,
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/im/imLayout.vue'),
    }]
  },
  // 消息 - 屏蔽
  {
    path: '/message',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'message',
        component: () => import('@/views/im/imLayout.vue'),
        meta: { title: '消息', icon: 'message' }
      }
    ]
  },
  // 我的任务
  {
    path: '/my',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'myDate',
        component: () => import('@/views/layout/myLayOut'),
        meta: { title: '任务', icon: 'detail2' }
      },
    ]
  },
  // 日历
  {
    path: '/myDate',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'myDates',
        component: () => import('@/views/myDate/index'),
        meta: { title: '日程', icon: 'calendar2' }
      }
    ]
  },
  // 通讯录 - 屏蔽
  {
    path: '/contact',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'contact',
        component: () => import('@/views/contact/contactLayout.vue'),
        meta: { title: '通讯录', icon: 'contact2' }
      }
    ]
  },
  // 会议 - 屏蔽
  {
    path: '/meeting',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'meeting',
        component: () => import('@/views/meeting/meettingLayout'),
        meta: { title: '会议', icon: 'video3' }
      }
    ]
  },
  // 邮件
  {
    path: '/mail',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'mail',
        component: () => import('@/views/mail/mailLayout'),
        meta: { title: '邮件', icon: 'email2' }
      }
    ]
  },
  // 工作台
  {
    path: '/workbench',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'workbench',
        redirect: '/workbench/workspace',
        component: () => import('@/views/workbench/workbenchLayout'),
        meta: { title: '工作台', icon: 'video3' },
        children: [
          {
            path: 'workspace',
            name: 'workspace',
            component: () => import('@/views/workSpace/index'),
            meta: { title: '工作台', keepAlive: true },
          },
          {
            path: 'dynamic',
            name: 'dynamic',
            component: () => import('@/views/workSpace/dynamic'),
            meta: { title: '公司动态', keepAlive: true },
          },
          {
            path: 'flowPath',
            name: 'flowPath',
            component: () => import('@/views/myProcess/myProcess'),
            meta: { title: '我的流程', keepAlive: false },
          },
          {
            path: 'topics',
            name: 'topics',
            component: () => import('@/views/workbench/topics/topics'),
            meta: { title: '议题', keepAlive: false },
          },
          {
            path: 'sign',
            name: 'sign',
            component: () => import('@/views/workbench/signTheQuote/signTheQuote'),
            meta: { title: '签报', keepAlive: false },
          },
          {
            path: 'useSeal',
            name: 'useSeal',
            component: () => import('@/views/workbench/useSealModel'),
            meta: { title: '用印', keepAlive: false },
          },
          {
            path: 'contract',
            name: 'contract',
            component: () => import('@/views/workbench/contractModel'),
            meta: { title: '合同', keepAlive: false },
          },
          {
            path: 'dispatch',
            name: 'dispatch',
            component: () => import('@/views/workbench/dispatchModel'),
            meta: { title: '发文', keepAlive: false },
          },
          {
            path: 'recordMuery',
            name: 'recordMuery',
            component: () => import('@/views/workbench/recordMuery'),
            meta: { title: '记录查询', keepAlive: false },
          },
        ]
      }
    ]
  },

  // 风控小工具
  // {
  //   path: '/smalltool',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'smalltool',
  //       component: () => import('@/views/zebra/smalltool/layout'),
  //       meta: { title: '风控小工具', icon: 'tool_menu', class: 'tool_menu' }
  //     }
  //   ]
  // },
  { path: '*', redirect: '/404', hidden: true }
]





let router = new Router({
  mode: 'hash',
  base: '/',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

// export default new Router({
//   mode: 'hash',
//   base: '/',
//   scrollBehavior: () => ({ y: 0 }),
//   routes: constantRouterMap
// })

export default router


