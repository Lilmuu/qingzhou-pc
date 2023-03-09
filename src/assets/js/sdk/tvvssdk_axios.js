import axios from 'axios'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.get['Content-Type'] = 'application/json'
axios.defaults.withCredentials = true

const path = '/webrtc'

export default {
  hPost(url, params, callback) {
    axios
      .post(path + url, params)
      .then(response => {
        if (response.data.status === 458 || response.data.status === 459) {
          callback({
            success: false,
            msg: response.data.status
          })
          return false
        }
        callback({
          success: true,
          msg: response.data
        })
      })
      .catch(() => {
        callback({
          success: false,
          msg: '服务器异常'
        })
      })
  },

  formPost(url, params, callback) {
    axios
      .post(path + url, params, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(response => {
        if (response.data.status === 458 || response.data.status === 459) {
          callback({
            success: false,
            msg: response.data.status
          })
          return false
        }
        callback({
          success: true,
          msg: response.data
        })
      })
      .catch(() => {
        callback({
          success: false,
          msg: '服务器异常'
        })
      })
  },

  hGet(url, params, callback) {
    axios
      .get(path + url, params)
      .then(response => {
        if (response.data.status === 458 || response.data.status === 459) {
          callback({
            success: false,
            msg: response.data.status
          })
          return false
        }
        callback({
          success: true,
          msg: response.data
        })
      })
      .catch(() => {
        callback({
          success: false,
          msg: '服务器异常'
        })
      })
  }
}
