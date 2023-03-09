import { authByToken, getUserInfo, login, loginByUsername } from '@/api/login'
import { getUserInfoAvatar } from '@/api/user'
import { clearAll } from '@/utils/auth'
import * as api from '@/api/task.js'
import { encryption } from "@/utils"
import { systemSocket } from "@/api/system"
import { getItem, setItem } from '@/utils/imUtil/storage'
import md5 from 'blueimp-md5'
import { encryptAES } from '@/utils/imUtil/aes'
import { decryptLoginSuccessData } from "@/module/login_reinforce/resource/apiAuthUtils";
import { config } from "@/const/dicData";

const tenantId = config.tenantId

const user = {
  state: {
    token: localStorage.getItem('TOKEN') || '',
    username: localStorage.getItem('USERNAME') || '',
    userId: String(localStorage.getItem('USERID')),
    avatar: localStorage.getItem('AVATAR') || '',
    headAvatar: localStorage.getItem('headAvatar') || '',
    roles: localStorage.getItem('ROLES') || [],
    email: localStorage.getItem('EMAIL') || '',
    phone: localStorage.getItem('PHONE') || '',
    level: Number(localStorage.getItem('LEVEL') || 999),
    popupShow: false,
    popupId: '',
    list: [],
    unreadCount: 0,
    unreadList:[],
  },
  mutations: {
    SET_POPUP_ID: (state, value) => {
      state.popupId = value
    },
    SET_POPUP_SHOW: (state, value) => {
      state.popupShow = value
      if (value) {
        api.taskPerspectiveDetail({
          taskId: state.popupId
          // initiatorId:data.pid,
          // performId:data.userId
        }).then(res => {
          state.list = res.data.data
        })
      }
    },
    SET_TOKEN: (state, token) => {
      localStorage.setItem('TOKEN', token)
      state.token = token
    },
    SET_USERID: (state, userId) => {
      localStorage.setItem('USERID', String(userId))
      state.userId = userId
    },
    SET_USERNAME: (state, userName) => {
      localStorage.setItem('USERNAME', userName)
      state.username = userName
    },
    SET_INITMAIL: (state, email = '') => {
      localStorage.setItem('INITMAIL', email)
      state.email = email
    },
    SET_PHONE: (state, phone = '') => {
      localStorage.setItem('PHONE', phone)
      state.phone = phone
    },
    SET_LEVEL: (state, level) => {
      localStorage.setItem('LEVEL', level)
      state.level = level
    },
    SET_AVATAR: (state, avatar) => {
      localStorage.setItem('AVATAR', avatar)
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      localStorage.setItem('ROLES', roles)
      state.roles = roles
    },
    SET_UNREADCOUNT: (state, count) => {
      state.unreadCount = count
    },
    SET_UNREADLIST: (state, list)=>{
      state.unreadList = list
    },
    SET_HEADAVATAR: (state, url)=>{
      localStorage.setItem('headAvatar', url)
      state.headAvatar = url
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(res => {
          if (res.data.code === 200) {
            // setToken(res.data.data.token)
            commit('SET_TOKEN', res.data.data.token)
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取用户头像
    getUserAvatarFun({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        getUserInfoAvatar(userInfo).then(res => {
          if (res.data.code === 0 && res.data.data) {
            commit('SET_HEADAVATAR', res.data.data.headImage || '')
            resolve(true)
          }else{
            resolve(false)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 根据【账号密码】 登录
    LoginByUsername({ commit, dispatch }, userInfo) {
      const user = encryption({
        data: userInfo,
        key: "ZnJhbWVmcmFtZQ==",
        param: ["password"]
      });
      return new Promise((resolve, reject) => {
        loginByUsername(
          user.username,
          user.password,
        )
          .then(async res => {
            const data = res.data
            commit('SET_TOKEN', data.access_token)
            commit('SET_ROLES', data.roles)
            commit('SET_USERID', data.userDto.id)
            commit('SET_USERNAME', data.userDto.realName || '')
            commit('SET_AVATAR', data.userDto.headImg || '')
            commit('SET_INITMAIL', data.userDto.email || '')
            commit('SET_PHONE', data.userDto.phone || '')
            commit('SET_LEVEL', data.userDto.level || 999)
            await getSysSocketToken()
            await dispatch('getUserAvatarFun', data.dataScope.userId)
            const phone = data.userDto.phone || ''
            commit('SET_PHONE', phone)
            localStorage.setItem('PHONE', phone)
            resolve(data)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    // 扫描登录
    ScanLogin({ commit, dispatch }, scanData) {
      return new Promise((resolve, reject) => {
        authByToken(scanData).then(async res => {
          const data = res.data
          commit('SET_TOKEN', data.access_token)
          commit('SET_ROLES', data.roles)
          commit('SET_USERID', data.userDto.id)
          commit('SET_USERNAME', data.userDto.realName || '')
          commit('SET_AVATAR', data.userDto.headImg || '')
          commit('SET_INITMAIL', data.userDto.email || '')
          commit('SET_LEVEL', data.userDto.level || 999)
          const phone = data.userDto.phone || ''
          commit('SET_PHONE', phone)
          localStorage.setItem('PHONE', phone)
          sessionStorage.setItem('codeLogin', true)
          await getSysSocketToken()
          console.log('----------------', data)
          await dispatch('getUserAvatarFun', data.dataScope.userId)
          resolve(data)
        })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    // IM登录
    async InitIMConfig({ dispatch }) {
      const phone = localStorage.getItem('PHONE')
      console.log('IM登录------IM登录',dispatch)
      return new Promise(async (resolve, reject) => {
        const formData = {
          telephone: `${phone}${tenantId}`,
          password: `123456`,
          // password: `${phone}fix`,
          areaCode: '86',
        }
        // 获取登录code
        const loginCodeParams = {
          areaCode: formData.areaCode,
          account: formData.telephone,
          password: formData.password,
          apiKey: process.env.VUE_APP_API_KEY,
          salt: new Date().getTime()
        }
        const loginCode = await dispatch('Common/User/GetLoginCode', loginCodeParams)
        console.log(loginCode,'loginCode --- loginCode')
        if (loginCode.resultCode !== 1) return false
        // 获取加密私钥
        const privateKeyParams = {
          userId: loginCode.data.userId,
          apiKey: process.env.VUE_APP_API_KEY,
          pwd: formData.password,
          areaCode: formData.areaCode,
          account: formData.telephone,
          salt: new Date().getTime()
        }
        const privateKey = await dispatch('Common/User/GetLoginPrivateKey', privateKeyParams)
        if (privateKey.resultCode !== 1) return false
        // 登录用户
        const userLoginParams = {
          userId: privateKeyParams.userId,
          apiKey: process.env.VUE_APP_API_KEY,
          pwd: formData.password,
          code: loginCode.data.code,
          privateKey: privateKey.data.privateKey,
          salt: new Date().getTime()
        }
        const userLogin = await dispatch('Common/User/Login', userLoginParams)
        if (userLogin.resultCode !== 1) return false
        
        // 解密登录数据
        const decryptLoginParams = [userLogin.data.data, loginCode.data.code, privateKey.data.privateKey, formData.password]

        const decryptLogin = JSON.parse(decryptLoginSuccessData(...decryptLoginParams))
        console.log('解密登录数据 - 获取IM登录信息',decryptLoginParams)
        // 获取解密后的数据
        const newMeId = decryptLogin.userId
        const messageKey = decryptLogin.messageKey
        
        console.log('IM登录后获取的token',decryptLogin)
        const token = decryptLogin.access_token
        localStorage.setItem('im_access_token', token)
        const httpKey = decryptLogin.httpKey

        const MPassword = md5(formData.password)
        const telephone = encryptAES(formData.telephone, MPassword)
        const password = encryptAES(formData.password, MPassword)
        const account = { MPassword, password, telephone }

        // const oldMeId = getItem('MeId') || ''
        // if (newMeId !== oldMeId) {
        //   // 新登陆的账号与本地保存的账号不一致，需要清除本地缓存
        //   localStorage.clear()
        // }

        // [Local存储] 最后一条消息接收时间
        let lastChatReceiveTime = getItem('LastChatReceiveTime')
        if (!lastChatReceiveTime) {
          // 本地没有，则使用离线时间
          lastChatReceiveTime = decryptLogin.login.offlineTime * 1000
          setItem('LastChatReceiveTime', lastChatReceiveTime)
        }

        // [Local存储] 权限信息
        setItem('MeId', newMeId)
        setItem('MessageKey', messageKey)
        setItem('Token', token)
        setItem('HttpKey', httpKey)
        setItem('Account', account, { base64: true })

        await dispatch('Common/User/GetMeInfo')
        await dispatch('Im/Information/GetTigaseDialog', { type: 'login' })
        await dispatch('Im/Friends/GetFriendsList', { type: 'login' })
        await dispatch('Im/Room/GetRoomList', { type: 'login' })
        await dispatch('Im/Information/GetLastChatList', { type: 'login' })
        resolve(true)
        console.log('IM 用户开始登录 - 用户登录成功')
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          const data = res.data.data
          if (data.phone) {
            commit('SET_USERNAME', data.realName || '')
            commit('SET_AVATAR', data.headImg || '')
            resolve(res)
          } else {
            reject(new Error('获取用户信息失败'))
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        clearAll()
        resolve()
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        clearAll()
        resolve()
      })
    },

    // 未读 数量
    SetUnreadCount({ commit }, count) {
      commit('SET_UNREADCOUNT', count)
    },

    // 未读任务信息列表
    SetUnreadList({ commit }, list){
      commit('SET_UNREADLIST', list)
    }
  }
}

// socket token
export const getSysSocketToken = () => {
  return new Promise((resolve, reject) => {
    systemSocket().then(res => {
      if(res.data.code === 200) {
        const token = res.data.data.token
        localStorage.setItem('socketToken', token)
        resolve(true)
      } else {
        reject(false)
      }
    }).catch(e => {
      reject(e)
    })
  })
}

export default user

