/**
 * @description     api axios 封装
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:20:51
 */

import axiosBase from "axios"
import $message from "@/components/Message/Message";
import store from '../store'
import merge from 'lodash/merge'
import qs from 'qs'
// import NProgress from "nprogress" // progress bar
import { config, errorCode } from "@/const/dicData"

let axios = axiosBase.create({
  baseURL: config.baseURL,
  timeout: 60000,
})

// 返回其他状态吗
axios.defaults.validateStatus = status => status >= 200 && status <= 500 // 默认的
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true

// NProgress.configure({
//   showSpinner: false
// })

const mailApiKey = '/mail/'
const mailApiAll = 'updateMailStatus'

// 响应白名单, 没有返回状态码的不报错
const responseWhiteList = [
  '/auth/oauth/',
  '/auth/login/'
]

// request拦截器
axios.interceptors.request.use(config => {
  if(config.headers['Content-Type']) {
    config.headers["Content-Type"] = config.headers["Content-Type"]
  } else {
    config.headers["Content-Type"] = "application/json"
  }
  if (config.params && !(config.params.wordKey || config.params.wordKey=='')) {
    const newpramas = {}
    for (const key in config.params) {
      // 这里不能过滤掉0
      if ((config.params[key] && config.params[key] !== '') || config.params[key] === 0) {
        newpramas[key] = config.params[key]
      }
    }
    config.params = newpramas
  }

  if (config.method === 'get') {
    // 给 mail 接口全部加上 configId
    if (config.url.indexOf(mailApiKey) !== -1 && config.url.indexOf(mailApiAll) === -1 ) {
      let oldParams = config.params || {}
      config.params = {
        ...oldParams,
        // configId: oldParams.mailConfigId || Number(localStorage.getItem('mailConfigId')),
        // 新的所有id为string类型
        configId: oldParams.mailConfigId || localStorage.getItem('mailConfigId'),
      }
    }
    if (config.prefixes === 'im') {
      let oldParams = config.params || {}
      config.params = {
        ...oldParams,
        // flag: 'rw',
        access_token: localStorage.getItem('im_access_token'),
      }
    }
  } else if (config.method === 'post') {
    // 给 mail 接口全部加上 configId
    if (config.url.indexOf(mailApiKey) !== -1) {
      let oldData = config.data || {}
      config.data = {
        ...oldData,
        // configId: oldData.mailConfigId || Number(localStorage.getItem('mailConfigId')),
        // 新的所有id为string类型
        configId: oldData.mailConfigId || localStorage.getItem('mailConfigId'),
      }
    }
    // 给 im 接口全部加上 access_token
    if (config.prefixes === 'im') {
      let oldData = config.data || {}
      config.data = {
        ...oldData,
        // flag: 'rw',
        access_token: localStorage.getItem('im_access_token'),
      }
    }
  }

  if (store.getters.token) {
    config.headers["Authorization"] = store.getters.token // token
  }
  let tenantId = store.getters.tenantId
  if (tenantId) {
    config.headers["tenantId"] = tenantId;
  }
  // config.headers["Content-Type"] = "application/json"

  // NProgress.start() // start progress bar
  const type = config.method
  const defaults = {}
  const arrayFormat = config.headers.arrayFormat || 'indices'

  if (
    type === 'post' &&
    config.headers['Content-Type'] ===
    'application/x-www-form-urlencoded'
  ) {
    // post请求参数处理
    config.data = qs.stringify(config.data, {
      allowDots: true,
      arrayFormat: arrayFormat
    })
  } else if (type === 'get') {
    // get请求参数处理
    config.params = qs.stringify(config.params, {
      allowDots: true,
      arrayFormat: arrayFormat
    })
    config.params = qs.parse(config.params)
    config.params = merge(defaults, config.params)
  }

  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
axios.interceptors.response.use(
  response => {
    // NProgress.done()
    const res = response.data
    const message = res.msg || res.message || formatRes(res)
    // 白名单返回
    if (isWhiteList(response.config.url)) {
      if(response.status === 200) {
        if(response.config.url.indexOf('/auth/login/') !== -1 && response.data) {
          return response
        } else if(response.config.url.indexOf('/auth/oauth/') !== -1 && response.data.code !== 1) {
          return response
        } else {
        $message({
            message,
            type: 'error',
            duration: 5 * 1000
          })
          return Promise.reject('error')
        }
      } else {
        $message({
          message,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      }
    } else {
      //res.code!=undefined防止文件流报错
        if (response.status !== 200 || (res.code !== 200 && res.code !== 0 && res.code !== 205&&res.code!=undefined)) {
        $message({
          message,
          type: 'error',
          duration: 5 * 1000
        })
        // 401 Token 过期;
        if (res.code === 401) {
          setTimeout(() => {
            store.dispatch('FedLogOut').then(() => {
              location.reload()// 为了重新实例化vue-router对象 避免bug
            })
          }, 2000)
        }
        return Promise.reject(response)
      } else {
        // console.log(response,333333333333)
        return response
      }
    }
  },
  error => {
    console.log('err' + error)// for debug
    // NProgress.done()
    $message({
      message: formatMsg(error),
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

function formatMsg(error) {
  if(!window.navigator.onLine) {
    return `网络已断开，请检查网络连接后再试`
  }
  if (error.request.status === 0) {
    // return `请求无响应：${error.config.url.replace(config.baseURL, '')}`
    return `请求无响应`
  }
  return error.message || '请求无响应'
}

function formatRes(res) {
  const status = Number(res.status)
  return errorCode[status] || errorCode["default"]
}

// 是否在白名单中
function isWhiteList(url) {
  let flag = false
  responseWhiteList.forEach(item => {
    if(url.indexOf(item) !== -1) {
      flag = true
    }
  })
  return flag
}

export default axios
