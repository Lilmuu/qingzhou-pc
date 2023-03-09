import Tools from './tools'
import LocalStorage from './storage'
import Cookie from './cookie'
import Primary from './primary'
import Xmpp from './xmpp'
import File from './file'
import Xml from './xml'
import Aes from './aes'
import Time from './time'

const value = {
  Tools,
  LocalStorage,
  Cookie,
  Primary,
  Xmpp,
  File,
  Xml,
  Aes,
  Time
}

export default {
  install (Vue, Option) {
    Object.defineProperty(Vue.prototype, '$utils', { value })
  }
}
