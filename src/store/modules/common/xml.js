import X2JS from 'x2js'
const x2js = new X2JS()

const constantsXML = `
<!-- 数据格式化 -->
<Constant version="2019-12-3">
  <!-- 群成员身份呢 -->
  <Item name="RoomMemberRole">
    <Node key="1" value="群主"></Node>
    <Node key="2" value="管理员"></Node>
    <Node key="3" value="普通成员"></Node>
    <Node key="4" value="隐身人"></Node>
    <Node key="5" value="监控人"></Node>
  </Item>
  <!-- 性别 -->
  <Item name="Sex">
    <Node key="0" value="女"></Node>
    <Node key="1" value="男"></Node>
  </Item>
  <!-- 消息传输方式 -->
  <Item name="MessageEncrypt">
    <Node key="0" value="消息明文传输"></Node>
    <Node key="1" value="消息3DES加密传输"></Node>
  </Item>
</Constant>
`

export default {
  namespaced: true,
  state: { XMLConstant: {} },
  mutations: {
    SET_XML_CONSTANT (state, response) {
      response.forEach(item => {
        state.XMLConstant[item._name] = item.Node.map(itemNode => ({ value: itemNode._key, label: itemNode._value }))
      })
    }
  },
  actions: {
    // 获取本地Xml
    async GetXML (ctx, xmlName) {
      let response = this._vm.$utils.LocalStorage.getItem(`XML_${xmlName}`)
      if (!response) {
        response = {
          data: constantsXML
        }
        if (xmlName === 'Constant') {
          response = x2js.xml2js(response.data).Constant.Item
          ctx.commit('SET_XML_CONSTANT', response)
        }
        this._vm.$utils.LocalStorage.setItem(`XML_${xmlName}`)
      } else {
        // 本地有缓存
        if (xmlName === 'Constant') ctx.commit('SET_XML_CONSTANT', response)
      }
      return response
    }
  }
}
