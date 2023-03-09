// 忘记密码页面的提交数据的调用逻辑
export default async _this => {
  // 获取接口版本
  const params = {
    areaCode: _this.AreaCode,
    telephone: _this.FormData.Telephone
  }
  const apiVersion = await _this.GetSupportSecureChat(params)
  if (apiVersion.resultCode !== 1) {
    _this.$vux.confirm.show({ title: '提示', showConfirmButton: false, content: `${apiVersion.resultMsg}` })
    _this.ImgCodeUrl = `${process.env.VUE_APP_API}/getImgCode?telephone=${_this.AreaCode}${_this.FormData.Telephone}&n=${Math.random()}`
    return false
  }

  let resetPassword
  if (apiVersion.data.isSupportSecureChat === 1) {
    // 新版接口
    const resetPasswordParams = {
      areaCode: _this.AreaCode,
      telephone: _this.FormData.Telephone,
      repassword: _this.FormData.Password,
      randcode: _this.FormData.MobileCode,
      salt: new Date().getTime()
    }
    resetPassword = await _this.PostResetPassword(resetPasswordParams)
  } else {
    // 旧版接口
    const resetPasswordParams = {
      areaCode: _this.AreaCode,
      telephone: _this.FormData.Telephone,
      newPassword: _this.$tools.md5(_this.FormData.Password),
      randcode: _this.FormData.MobileCode
    }
    resetPassword = await _this.PostOldResetPassword(resetPasswordParams)
  }

  if (resetPassword.resultCode !== 1) return false
  return true
}
