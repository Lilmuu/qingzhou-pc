// 注册页面的提交数据的调用逻辑
export default async _this => {
  const routeParams = _this.$route.params
  routeParams.password = _this.$tools.md5(routeParams.password)

  const params = {
    ..._this.$route.params,
    ..._this.FormData,
    areaId: 0,
    userType: 1,
    isSmsRegister:0,
    xmppVersion: 1
  }
  const rs = await _this.SubmitRegister(params)
  if (rs.resultCode !== 1) {
    if (rs.resultCode === 1040107) {
      // 账号已注册
      _this.$vux.confirm.show({ title: '提示', content: rs.resultMsg, confirmText: '现在去登录', cancelText: '好的', dialogTransition: 'vux-fade', onConfirm () { _this.$router.go(-1) } })
    }
    return false
  }
  return rs
}
