export default async _this => {
  const params = {
    oldPassword: _this.$tools.md5(_this.FormData.OldPassword),
    newPassword: _this.$tools.md5(_this.FormData.newPassword),
    password1: _this.$tools.md5(_this.FormData.confirmPassword)
  }
  const updatePassword = await _this.PostUpdatePassword(params)
  if (updatePassword.resultCode !== 1) return false
  return true
}
