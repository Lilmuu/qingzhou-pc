import App from '@/main'
import CryptoJS from 'crypto-js'
import { getItem } from '@/utils/imUtil/storage'
import { emojis } from '@/assets/js/resource'
import { MessageType } from '@/xmpp/message-type'
import md5 from 'blueimp-md5'

const actions = {
  // [POST] Amr音频格式转为Mp3
  async PostAmrToMp3(message) {
    return App.$store.dispatch('Im/Chat/PostAmrToMp3', message)
  }
}

export default {
  getStrFromBytes() {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8]
    var r = ''
    for (var i = 0; i < arr.length; i++) {
      r += String.fromCharCode(arr[i])
    }
    return r
  },
  // 判断消息是否加密
  isEncrypt(msg) {
    if (!msg || !msg.content) return false
    return !App.$utils.Tools.isNull(msg.isEncrypt) && msg.isEncrypt
  },
  // 获取信息密钥
  getMsgKey(msg) {
    msg.timeSend = parseInt(msg.timeSend)
    if (!msg.messageId && msg.messageHead) {
      msg.messageId = msg.messageHead.messageId
    }
    const key = process.env.VUE_APP_API_KEY + msg.timeSend + msg.messageId
    return md5(key)
  },
  //消息加密
  encryptMessage(msg) {
    const key = this.getMsgKey(msg)
    const content = this.encryptDES(msg.content, key)
    return content
  },
  encryptDES: function(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key)
    var iv = this.getStrFromBytes()
    var encrypted = CryptoJS.TripleDES.encrypt(message, keyHex, {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    var result = encrypted.ciphertext.toString(CryptoJS.enc.Base64)
    return result
  },
  // 消息解密
  decryptMessage(msg) {
    if (this.isEncrypt(msg)) {
      if (msg.encryptType === App.$constant.MESSAGE_ENCRYPT_TYPE._3DES) {
        const key = this.getMsgKey(msg)
        msg.content = this.decryptDES(msg.content, key)
      }
    }
    return msg
  },
  // CryptoJS 加密
  decryptDES(message, key) {
    const iv = this.getStrFromBytes()
    // 把私钥转换成16进制的字符串
    const keyHex = CryptoJS.enc.Utf8.parse(key)
    // 把需要解密的数据从16进制字符串转换成字符byte数组
    const decrypted = CryptoJS.TripleDES.decrypt(
      {
        ciphertext: CryptoJS.enc.Base64.parse(message)
      },
      keyHex,
      {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    // 以utf-8的形式输出解密过后内容
    let utf8
    try {
      utf8 = decrypted.toString(CryptoJS.enc.Utf8)
    } catch (err) {}
    return utf8
  },
  // 格式化文本和emoji表情
  formatTextOfEmoji(message) {
    const msgList = []
    const objList = []
    // 将表情格式话成图片名称
    emojis.forEach(map => {
      for (const face in map) {
        while (map.hasOwnProperty(face) && message.content.indexOf(face) > -1) {
          message.content = message.content.replace(face, '^' + map[face] + '^')
        }
      }
    })
    // 截取文本和emoji成一个数组
    const ary = message.content.split('^')
    const reg = /^e.*g$/
    for (let i = 0; i < ary.length; i++) {
      if (ary[i] !== '') msgList.push(ary[i])
    }
    // 分别进行格式化
    for (let i = 0; i < msgList.length; i++) {
      if (reg.test(msgList[i])) objList.push({ data: msgList[i], type: 'emoji' })
      else objList.push({ data: msgList[i], type: 'txt' })
    }
    message.content = objList
    return message
  },
  // 格式化 聊天列表的聊天信息 如 [图片] [位置]
  formatLastChatMessage(msg) {
    console.log('格式化 聊天列表的聊天信息 如 [图片] [位置]',msg)
    let content = ''
    let cont
    switch (msg.type) {
      case 1:
        content = msg.content
        break
      case 2:
        content = '[图片]'
        break
      case 3:
        content = '[语音]'
        break
      case 4:
        content = '[位置]'
        break
      case 5:
        content = '[动画]'
        break
      case 6:
        content = '[视频]'
        break
      case 8:
        content = '[名片]'
        break
      case 9:
        content = '[文件]'
        break
      case 10:
        content = msg.content[0].data
        break // 控制消息和通知
      case 11:

        try{
          cont = JSON.parse(msg.content)
        }
        catch(e){
          console.log("数据不是JSON格式", msg)
          cont = msg.content
        }

        





        msg['oldContent'] = msg.content
        content = `任务提醒:${cont.title}`
        break // 控制消息和通知
      case 12:
        content = '您有一条新消息待查看'
        break // 控制消息和通知
      case 28:
        content = '[红包]'
        break
      case 83:
        content = '[领取了红包]'
        break
      case 202:
        content = msg.fromUserName + '撤回了一条消息'
        break
      default:
        content = ''
        break // 默认其他
    }
    if (!content) {
      if ((msg.type > 99 && msg.type < 130) || (msg.contentType > 99 && msg.contentType < 130)) {
        // 语音或视频消息
        content = msg.content
      } else if (msg.type === 10002) {
        // 添加好友
        content = msg.content
      } else if (parseInt(msg.type / 100) === 9 || msg.type === 401 || msg.type === 402) {
        // 群消息
        content = '[群消息]'
      }
      else {
        // 不支持的消息type
        content = '[不支持 请在手机端查看]'
      }
    }
    if (msg.isReadDel) {
      content = '[阅后即焚消息]'
    }
    if(msg.type != 11){
      msg.content = content
    }
    return msg
  },
  // 格式化聊天信息
  formatChatMessage(msg) {
    const meId = getItem('MeId') || ''
    msg = JSON.parse(JSON.stringify(msg))
    msg.oldContent = JSON.parse(JSON.stringify(msg.content || ''))
    if (msg.type === MessageType.TEXT) {
      msg = this.formatTextOfEmoji(msg) // 文本
    }
    else if (msg.type === 83) console.log('某个成员领取红包')
    // 某个成员领取红包
    else if (msg.type === 86) console.log('红包退回通知')
    // 红包退回通知
    else if (msg.type === MessageType.REVOKE)
      msg.content =
        parseInt(msg.fromUserId) === meId
          ? '您撤回了一条消息'
          : `${msg.fromUserName} 撤回了一条消息`
    else if (msg.type === MessageType.CHANGE_NICK_NAME) console.log('修改昵称')
    else if (msg.type === MessageType.CHANGE_ROOM_NAME)
      // 修改群名
      msg.content = `${msg.fromUserName} 修改群名为：${msg.content}`
    else if (msg.type === MessageType.DELETE_ROOM) console.log('删除房间')
    else if (msg.type === MessageType.DELETE_MEMBER)
      // 退出群组或被踢出群
      msg.content =
        msg.fromUserId === msg.toUserId
          ? `${msg.toUserName} 退出群组`
          : `${msg.toUserName} 被移除群组`
    else if (msg.type === MessageType.NEW_NOTICE)
      // 发布新公告
      msg.content = `${msg.fromUserName} 发布新公告：${msg.content}`
    else if (msg.type === MessageType.UPDATE_NOTICE)
      msg.content = `${msg.fromUserName} 发布新公告：${msg.content}`
    // 修改新公告
    else if (msg.type === MessageType.GAG)
      // 禁言
      msg.content =
        parseInt(msg.content) === 0
          ? `${msg.fromUserName} 对 ${msg.toUserName} 取消了禁言`
          : `${msg.fromUserName}对${msg.toUserName}设置了禁言`
    else if (msg.type === MessageType.ALL_GAG)
      // 全员禁言
      msg.content =
        parseInt(msg.content) === 0 ? `群主或管理员关闭了全员禁言` : `群主或管理员开启了全员禁言`
    else if (msg.type === MessageType.NEW_MEMBER)
      // 增加群成员
      msg.content =
        msg.fromUserId === msg.toUserId
          ? `${msg.toUserName} 进入聊天群`
          : `${msg.fromUserName} 邀请群成员：${msg.toUserName}`
    else if (msg.type === MessageType.HAVE_READ)
      // 已读
      msg.content === '1'
        ? (msg.content = `${msg.fromUserName} 开启已读`)
        : (msg.content = `${msg.fromUserName} 关闭已读`)
    else if (msg.type === MessageType.UPDATE_FILE)
      // 上传群文件
      msg.content = `${msg.fromUserName} 上传了群文件：${msg.fileName}`
    else if (msg.type === MessageType.UPDATE_ENCRYPT)
      // 更新消息加密设置
      msg.content = `${msg.fromUserName}${parseInt(msg.content) === 0 ? '关闭' : '开启'}群聊加密`
    else if (msg.type === MessageType._925)
      // 群转让
      msg.content = `${msg.fromUserName} 将群转让给了 ${msg.toUserName}`
    else if (
      msg.type !== 2 &&
      msg.type !== 3 &&
      msg.type !== 4 &&
      msg.type !== 5 &&
      msg.type !== 6 &&
      msg.type !== 9 &&
      msg.type !== 8
    ) {
      msg.content = `未处理的消息，type: ${msg.type}`
    }
    return msg
  },
  // 格式化新朋友信息
  formatNewFriendMessage(msg) {
    msg = JSON.parse(JSON.stringify(msg))
    if (msg.type === MessageType.BLACK)
      // 拉黑名单
      msg.direction
        ? (msg.content = `${msg.toNickname}拉黑了我`)
        : (msg.content = `你以拉黑${msg.toNickname}`)
    else if (msg.type === MessageType.REFUSED)
      // 拉黑名单
      msg.direction
        ? (msg.content = `${msg.toNickname}已取消了黑名单`)
        : (msg.content = `${msg.toNickname}取消了黑名单`)
    else if (msg.type === MessageType.PASS)
      // 同意加好友
      msg.direction
        ? (msg.content = `${msg.toNickname}同意添加我为好友`)
        : (msg.content = `我同意添加${msg.toNickname}为好友`)
    else if (msg.type === MessageType.FRIEND)
      // 直接成为好友
      msg.direction
        ? (msg.content = `添加了好友${msg.toNickname}`)
        : (msg.content = `${msg.toNickname}添加我为好友`)
    else if (msg.type === MessageType.DELALL)
      // 删除好友
      msg.direction
        ? (msg.content = `${msg.toNickname}删除了我`)
        : (msg.content = `删除好友${msg.toNickname}`)
    return msg
  },


  // 获取服务器时间（秒）
  getServerTime () {
    const serverTimeDelay = getItem('ServerTimeDelay') || 0
    return Math.round(this.getCurrentTimeSecond() - serverTimeDelay)
  },
  // 获取服务器时间（毫秒）
  getServerTimeSecond () {
    const serverTimeDelay = getItem('ServerTimeDelay') || 0
    return Math.round((this.getCurrentTimeSecond() - serverTimeDelay) / 1000)
  },
  getCurrentTime(){
		return Math.round(new Date().getTime() / 1000);
	},
  // 获取当前时间（毫秒）
  getCurrentTimeSecond () {
    return Math.round(new Date().getTime())
  },
  // 消息ID
  randomUUID (userId) {
    // 消息前缀
    const cont = "skimweb_"
    return cont + userId + this.getCurrentTime() + Math.round(Math.random() * 1000)
  },
}
