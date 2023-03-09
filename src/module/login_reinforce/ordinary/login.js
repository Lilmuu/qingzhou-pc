/*
 * @Author: your name
 * @Date: 2021-09-28 11:08:45
 * @LastEditTime: 2021-10-15 14:46:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\module\login_reinforce\ordinary\login.js
 */
// 登录页面的提交数据的调用逻辑
export default async (_this) => {
  let formData = JSON.parse(JSON.stringify(_this.FormData))
  formData.telephone = _this.$tools.md5(formData.telephone)
  formData.password = _this.$tools.md5(formData.password)
  formData.areaCode = '86'

  const userLogin = await _this.Login(formData)
  if (userLogin.resultCode !== 1) {
    _this.$vux.toast.show({ text: `${loginCode.resultMsg}`, type: 'text' })
    return false
  }
  const token = userLogin.data.access_token
  const meId = userLogin.data.userId
  const messageKey = userLogin.data.messageKey
  const account = {
    telephone: formData.telephone,
    password: formData.password
  }

  // [Local存储] 权限信息
  _this.$utils.LocalStorage.setItem('MeId', meId)
  _this.$utils.LocalStorage.setItem('MessageKey', messageKey)
  _this.$utils.LocalStorage.setItem('Token', token)
  _this.$utils.LocalStorage.setItem('Account', account, { base64: true })
  return true
}
