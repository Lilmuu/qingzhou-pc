const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  tenantId: state => state.app.tenantId,
  token: state => state.user.token,
  ImMeId: state => state["Common/User/MeId"],
  avatar: state => state.user.avatar,
  username: state => state.user.username,
  userId: state => state.user.userId,
  roles: state => state.user.roles,
  $socket: state => state.socket.$socket,
  isFull: state => state.config.isFull,
  ratio: state => state.config.ratio,
  keepAlivePage: state => {
    const arr = JSON.parse(JSON.stringify(state.workbench.topNavData))
    return arr.map(item => {
      return item['name'] = item.path
    })
  },
}
export default getters
