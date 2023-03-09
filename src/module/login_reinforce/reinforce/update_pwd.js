export default async _this => {
  const dhPrivateKey = _this.MeInfo.dhMsgPrivateKey
  const rsaPrivateKey = _this.MeInfo.rsaMsgPrivateKey

  let updatePassword
  if (dhPrivateKey && rsaPrivateKey) {
    // 新版接口（新账号）
    const randomStr = await _this.GetRandomStr()
    if (randomStr.resultCode !== 1) return

    const updatePasswordParams = {
      oldPwd: _this.FormData.OldPassword,
      newPwd: _this.FormData.NewPassword,
      userRandomStr: randomStr.data.userRandomStr,
      oldPassword: _this.$tools.md5(_this.FormData.OldPassword),
      newPassword: _this.$tools.md5(_this.FormData.NewPassword)
    }
    try {
      updatePassword = await _this.PostUpdatePassword(updatePasswordParams)
    } catch (err) {
      // 修改密码的原密码错误会导致调用加密库时报错,需要捕获错误进行提示
      updatePassword = { resultCode: 0, resultMsg: '更改错误,请检查密码是否正确' }
    }
  } else {
    // 旧版接口（老帐号）
    const oldUpdatePasswordParams = {
      oldPassword: _this.$tools.md5(_this.FormData.OldPassword),
      newPassword: _this.$tools.md5(_this.FormData.NewPassword),
      password1: _this.$tools.md5(_this.FormData.confirmPassword),
      oldPwd: _this.FormData.confirmPassword
    }
    updatePassword = await _this.PostOldUpdatePassword(oldUpdatePasswordParams)
  }

  if (updatePassword.resultCode !== 1) {
    _this.$vux.toast.show({ text: `${updatePassword.resultMsg}`, type: 'text' })
    return false
  }

  return true
}
