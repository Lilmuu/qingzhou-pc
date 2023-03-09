/**
 * @description     im axios 请求封装
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:19:37
 */

// import axiosBase from 'axios'
// import { Message } from 'element-ui'
// import store from '../store'
// import merge from 'lodash/merge'
// import qs from 'qs'
// import NProgress from "nprogress" // progress bar
// import { config, errorCode } from "@/const/dicData"
// import { getItem } from "@/utils/imUtil/storage";
//
// let axios = axiosBase.create({
//   baseURL: config.imBaseURL,
//   timeout: 60000,
// })
//
// // axios.defaults.baseURL = process.env.BASE_API
// axios.defaults.timeout = 30000
// // 返回其他状态吗
// axios.defaults.validateStatus = status => status >= 200 && status <= 500 // 默认的
// // 跨域请求，允许保存cookie
// axios.defaults.withCredentials = true
//
// NProgress.configure({
//   showSpinner: false
// })
//
// // request拦截器
// axios.interceptors.request.use(config => {
//   config.headers["Content-Type"] = "application/json"
//
//   const im_access_token = getItem('Token')
//   if (config.params) {
//     const newpramas = {}
//     for (const key in config.params) {
//       // 这里不能过滤掉0
//       if (
//         (config.params[key] && config.params[key] !== '') ||
//         config.params[key] === 0
//       ) {
//         newpramas[key] = config.params[key]
//       }
//     }
//     config.params = newpramas
//   }
//
//   if (config.method === 'get') {
//     let oldParams = config.params || {}
//     config.params = {
//       ...oldParams,
//       flag: 'rw',
//       access_token: im_access_token
//     }
//   } else if (config.method === 'post') {
//     // 给 im 接口全部加上 access_token
//     let oldData = config.data || {}
//     config.data = {
//       ...oldData,
//       flag: 'rw',
//       access_token: im_access_token
//     }
//     config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
//   }
//   // 给 im 接口全部加上 token
//   if (store.getters.token) {
//     config.headers["Authorization"] = store.getters.token // token
//     config.headers["access_token"] = im_access_token
//   }
//
//   // config.headers["Content-Type"] = "application/json"
//
//   NProgress.start() // start progress bar
//   const type = config.method
//   const defaults = {}
//   const arrayFormat = config.headers.arrayFormat || 'indices'
//
//   if (
//     type === 'post' &&
//     config.headers['Content-Type'] ===
//     'application/x-www-form-urlencoded'
//   ) {
//     // post请求参数处理
//     config.data = qs.stringify(config.data, {
//       allowDots: true,
//       arrayFormat: arrayFormat
//     })
//   } else if (type === 'get') {
//     // get请求参数处理
//     config.params = qs.stringify(config.params, {
//       allowDots: true,
//       arrayFormat: arrayFormat
//     })
//     config.params = qs.parse(config.params)
//     config.params = merge(defaults, config.params)
//   }
//
//   return config
// }, error => {
//   // Do something with request error
//   console.log(error) // for debug
//   Promise.reject(error)
// })
//
// // respone拦截器
// axios.interceptors.response.use(
//   response => {
//     NProgress.done()
//     if (typeof response.data === 'object' && response.data.resultCode !== 1 && response.data.resultCode !== 1040107) {
//       if (typeof response.data === 'object' && response.data.resultCode === 1030102) {
//         // App.$vux.toast.show({ text: '登陆超时，请重新登陆', type: 'text' })
//         // App.$store.commit('RESET_LOGIN')
//         // store.dispatch('FedLogOut').then(() => {
//         //   location.reload()// 为了重新实例化vue-router对象 避免bug
//         // })
//         // App.$router.replace({ path: '/login' })
//       } else {
//         if (response.config.url.indexOf('UploadVoiceServlet') === -1) {
//           // 过滤文件上传
//           // App.$vux.toast.show({ text: `${response.data.resultMsg}`, type: 'text' })
//         }
//         Message.error(`请求错误：${ response.data.resultCode } ${ response.data.resultMsg }`)
//         // App.$vux.toast.show({ text: '登陆超时，请重新登陆', type: 'text' })
//         // App.$store.commit('RESET_STATES')
//         // App.$router.replace({ path: '/login' })
//       }
//     }
//     return response.data
//     // const res = response.data
//     // const message = res.msg || res.message || formatRes(res)
//     // if (res.resultCode !== 1) {
//     //   Message({
//     //     message,
//     //     type: 'error',
//     //     duration: 5 * 1000
//     //   })
//     // } else {
//     //   return response
//     // }
//   },
//   error => {
//     console.log('err' + error)// for debug
//     NProgress.done()
//     Message({
//       message: formatMsg(error),
//       type: 'error',
//       duration: 5 * 1000
//     })
//     return Promise.reject(error)
//   }
// )
//
//
// function formatMsg(error) {
//   if(!window.navigator.onLine) {
//     return `网络已断开，请检查网络连接后再试`
//   }
//   if (error.request.status === 0) {
//     // return `请求无响应：${error.config.url.replace(config.baseURL, '')}`
//     return `请求无响应`
//   }
//   return error.message || '请求无响应'
// }
//
// export default axios




import App from '@/main'
import axiosBase from 'axios'
// import NProgress from 'nprogress'
import LoginReinforce from '@/module/login_reinforce'
// import { getItem } from '@/utils/imUtil/storage'
import { stringify } from 'qs'
import { Message } from 'element-ui'
import { config, errorCode } from "@/const/dicData"
import store from '../store'


// 响应白名单, 没有返回状态码的不报错
const responseWhiteList = ['/auth/getLoginCode','/authkeys/getLoginPrivateKey']


// api axios
let axios = axiosBase.create({
  baseURL: config.imBaseURL,
  timeout: 60000,
})

// 文件 axios
let axiosFile = axiosBase.create({
  baseURL: process.env.VUE_APP_FILE,
  // 不设置超时
  // timeout: 120000,
})

// axios 请求拦截
axios.interceptors.request.use(config => {
  // IM 加密方法需要调用（老版未调用）
  // config.data = LoginReinforce.Request.request(config.url, config.data)
  // NProgress.start()
  // const im_access_token = getItem('Token')
  const im_access_token = localStorage.getItem('im_access_token')
  // App.$vux.loading.show({ text: '正在加载...' })
  if (config.method.toLocaleUpperCase() === 'GET') {
    config.params = LoginReinforce.Request.request(config.url, config.params)
    let oldParams = config.params || {}
    config.params = {
      ...oldParams,
      access_token: im_access_token
    }
  } else if (config.method.toLocaleUpperCase() === 'POST') {
    config.data = LoginReinforce.Request.request(config.url, config.data)
    // 给 im 接口全部加上 access_token
    let oldData = config.data || {}
    if(!oldData.noAccessToken){
      if(responseWhiteList.indexOf(config.url) != -1){
        config.data = {
          ...oldData,
        }
      }else{
        config.data = {
          ...oldData,
          access_token: im_access_token
        }
      }
      
    }
    // config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  // config.headers["Authorization"] = 'Bearer ' + store.getters.token // token

  config.data = stringify(config.data) // 转为formdata数据格式
  // 给 im 接口全部加上 token
  // if (store.getters.token) {
  //   config.headers["Authorization"] = store.getters.token // token
  //   config.headers["access_token"] = im_access_token
  // }
  return config
})

// axios 响应拦截
axios.interceptors.response.use(response => {
    // NProgress.done()
    // App.$vux.loading.hide()
    if (typeof response.data === 'object' && response.data.resultCode !== 1 && response.data.resultCode !== 1040107) {
      if (typeof response.data === 'object' && response.data.resultCode === 1030102) {
        // App.$vux.toast.show({ text: '登陆超时，请重新登陆', type: 'text' })
        // App.$store.commit('RESET_LOGIN')
        // store.dispatch('FedLogOut').then(() => {
        //   location.reload()// 为了重新实例化vue-router对象 避免bug
        // })
        // App.$router.replace({ path: '/login' })
        // store.dispatch('InitIMConfig')
        console.log('请求报错 - 00000000 - InitIMConfig')
        // Message.error(`正在重连...`)
      } else {
        console.log('响应response',response)
        console.log('response.data',response.data)
        if(response.data.resultCode !== 1030101 ){
          if (response.config.url.indexOf('UploadVoiceServlet') === -1) {
            // 过滤文件上传
            // App.$vux.toast.show({ text: `${response.data.resultMsg}`, type: 'text' })
            Message.error(`${response.data.resultMsg}`)
          }
          Message.error(`${response.data.resultMsg}`)
          // Message.error(`请求错误：${response.data.resultCode} ${response.data.resultMsg}`)
        }else{
          console.error(response,'response')
        }
        // Message.error(`登陆超时，请重新登陆`)
        // App.$vux.toast.show({ text: '登陆超时，请重新登陆', type: 'text' })
        // App.$store.commit('RESET_STATES')
        // App.$router.replace({ path: '/login' })
      }
    }
    return response.data
  }
// , err => {
//   console.log('请求响应错误：', err)
// }
)

// POST 请求封装
// export async function post (api, params = {}) {
//   const data = await LoginReinforce.Request.request(api, params)
//   // data.flag = 'rw'
//   // const token = getItem('Token')
//   // if (token) data.access_token = token
//   // 添加请求标识,服务端需要判断请求来源
//   // const config = { headers: { 'RequestSource': 'h5mobile' } }
//   // const baseURL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API : '/api'

//   console.log(params,'POST 请求封装 -- params')
//   const rs = await axios.post(api, stringify(data))
//   return rs
// }
//
// 文件请求封装
async function file (api, params = {}, type) {
  let config, rs
  if (type === 'mp3') {
    config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded;boundary = ' + new Date().getTime() } }
    rs = await axiosFile.post(api, stringify(params), config)
  } else {
    config = {
      headers: {
        'Content-Type': 'multipart/form-data;boundary = ' + new Date().getTime()
      },
      // 文件上传进度条
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          let percent = (((progressEvent.loaded / progressEvent.total) * 100) | 0);
          // console.log('complete', complete)
          if (percent >= 100) {
            console.log('done')
            percent = 0
          }
          store.dispatch('Common/UpdateFile/onSetUploadPercent', percent)
        }
      },
    }
    rs = await axiosFile.post(api, params, config)
  }
  return rs
}


// 文件请求封装 axios 响应拦截
axiosFile.interceptors.response.use(response => {
    if (typeof response.data === 'object' && response.data.resultCode !== 1 && response.data.resultCode !== 1040107) {
      if (typeof response.data === 'object' && response.data.resultCode === 1030102) {
        // App.$vux.toast.show({ text: '登陆超时，请重新登陆', type: 'text' })
        // App.$store.commit('RESET_LOGIN')
        // store.dispatch('FedLogOut').then(() => {
        //   location.reload()// 为了重新实例化vue-router对象 避免bug
        // })
        // App.$router.replace({ path: '/login' })
        Message.error(`登陆超时，请重新登陆`)
      } else {
        if (response.config.url.indexOf('UploadVoiceServlet') === -1) {
          // 过滤文件上传
          // App.$vux.toast.show({ text: `${response.data.resultMsg}`, type: 'text' })
          Message.error(`${response.data.resultMsg}`)
        }
        Message.error(`${response.data.resultMsg}`)
        // Message.error(`请求错误：${response.data.resultCode} ${response.data.resultMsg}`)


        // Message.error(`登陆超时，请重新登陆`)
        // App.$vux.toast.show({ text: '登陆超时，请重新登陆', type: 'text' })
        // App.$store.commit('RESET_STATES')
        // App.$router.replace({ path: '/login' })
      }
    }
    return response.data
  }
// , err => {
//   console.log('请求响应错误：', err)
// }
)
axios.file = file

// export default { post, file }

export default axios

function cunzai(val){

}
