// 登录页面的提交数据的调用逻辑
import App from '@/main'
import md5 from 'blueimp-md5'
import { getItem, setItem } from '@/utils/imUtil/storage'
import { decryptLoginSuccessData} from '../resource/apiAuthUtils'
import { encryptAES, decryptAES } from '@/utils/imUtil/aes'

const mutations = {
  RESET_STATES () {
    App.$store.commit('RESET_STATES')
  }
}

const actions = {
  // 获取登陆code
  async GetLoginCode (params) {
    const rs = await App.$store.dispatch('Common/User/GetLoginCode', params)
    return rs
  },
  // 获取加密私钥
  async GetLoginPrivateKey (params) {
    const rs = await App.$store.dispatch('Common/User/GetLoginPrivateKey', params)
    return rs
  },
  // 登录
  async Login (params) {
    console.log('socket断开后登录 - IM登录 - 参数', params)
    const rs = await App.$store.dispatch('Common/User/Login', params)
    console.log('socket断开后登录 - IM登录 - 结果', rs)
    return rs
  },
  // 获取我的信息
  async GetMeInfo (params) {
    const rs = await App.$store.dispatch('Common/User/GetMeInfo', params)
    return rs
  },
  // 获取好友列表
  async GetFriendsList (params) {
    const rs = await App.$store.dispatch('Im/Friends/GetFriendsList', params)
    return rs
  },
  // 获取群列表
  async GetRoomList (params) {
    const rs = await App.$store.dispatch('Im/Room/GetRoomList', params)
    return rs
  },
  // 获取最后一条消息列表
  async GetLastChatList (params) {
    const rs = await App.$store.dispatch('Im/Information/GetLastChatList', params)
    return rs
  },
}

export default async (data, type) => {
  
  const formData = JSON.parse(JSON.stringify(data))
  formData.areaCode = '86'

  if (type === 'auto') {
    // 自动登录需要解密账号密码
    formData.telephone = decryptAES(formData.telephone, formData.MPassword)
    formData.password = decryptAES(formData.password, formData.MPassword)
  }

  // 获取登录code
  const loginCodeParams = {
    areaCode: formData.areaCode,
    account: formData.telephone,
    password: formData.password,
    apiKey: process.env.VUE_APP_API_KEY,
    salt: new Date().getTime()
  }
  const loginCode = await actions.GetLoginCode(loginCodeParams)
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
  const privateKey = await actions.GetLoginPrivateKey(privateKeyParams)
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
  // 走 user/login/v1 获取秘钥
  console.log('走 user/login/v1 获取秘钥')
  const userLogin = await actions.Login(userLoginParams)
  if (userLogin.resultCode !== 1) return false

  // 解密登录数据
  const decryptLoginParams = [userLogin.data.data, loginCode.data.code, privateKey.data.privateKey, formData.password]
  const decryptLogin = JSON.parse(decryptLoginSuccessData(...decryptLoginParams))

  // 获取解密后的数据
  const newMeId = decryptLogin.userId
  const messageKey = decryptLogin.messageKey
  const token = decryptLogin.access_token
  localStorage.setItem('im_access_token', token)
  const httpKey = decryptLogin.httpKey

  const MPassword = md5(formData.password)
  const telephone = encryptAES(formData.telephone, MPassword)
  const password = encryptAES(formData.password, MPassword)
  const account = { MPassword, password, telephone }

  const oldMeId = getItem('MeId') || ''
  if (newMeId !== oldMeId) {
    // 新登陆的账号与本地保存的账号不一致，需要清除本地缓存
    mutations.RESET_STATES()
  }

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
  console.log("用户个人信息设置完成 001")
  // 获取我的信息
  await actions.GetMeInfo()

  // 同步数据
  await actions.GetFriendsList({ type: 'login' })
  await actions.GetRoomList({ type: 'login' })
  await actions.GetLastChatList({ type: 'login' })

  return true
}
