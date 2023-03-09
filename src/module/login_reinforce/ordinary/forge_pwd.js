export default async _this => {
  const resetPasswordParams = {
    version: 1,
    areaCode: _this.AreaCode,
    telephone: _this.FormData.Telephone,
    newPassword: _this.$tools.md5(_this.FormData.Password),
    randcode: _this.FormData.MobileCode
  }
  const resetPassword = await _this.PostResetPassword(resetPasswordParams)
  if (resetPassword.resultCode !== 1) {

    return false
  }
  return true
}
