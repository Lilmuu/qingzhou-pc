// 注册页面的提交数据的调用逻辑
import { buildLoginPassword } from '../resource/encryptUtils'
import { decryptRegeditData } from '../resource/apiAuthUtils'
export default async _this => {
  const routeParams = _this.$route.params
  routeParams.repassword = routeParams.password
  routeParams.password = buildLoginPassword(routeParams.password)
  routeParams.isSmsRegister = _this.isOpenSMSCode
  routeParams.salt = new Date().getTime()

  const params = { ...routeParams, ..._this.FormData }
  const rs = await _this.SubmitRegister(params)

  if (rs.resultCode !== 1) {
    if (rs.resultCode === 1040107) {
      // 账号已注册
      _this.$vux.confirm.show({ title: '提示', content: rs.resultMsg, confirmText: '现在去登录', cancelText: '好的', dialogTransition: 'vux-fade', onConfirm () { _this.$router.go(-1) } })
    }
    return false
  }

  return JSON.parse(decryptRegeditData(rs.data.data))
}
