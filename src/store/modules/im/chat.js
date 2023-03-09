/*
 * @Author: your name
 * @Date: 2022-03-29 15:59:26
 * @LastEditTime: 2022-04-24 15:16:39
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\store\modules\im\chat.js
 */
/*
 * @Author: your name
 * @Date: 2021-12-16 16:16:07
 * @LastEditTime: 2022-04-19 11:37:38
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\store\modules\im\chat.js
 */
import Ax from '@/utils/imRequest'

import App from '@/main'
import { getItem, setItem } from '@/utils/imUtil/storage'

// eslint-disable-next-line no-extend-native
String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, 'gm'), s2)
}

const initState = {
  IMRouterParams: {},
  MessageList: [],
  ChatRoomInfo: {}, // 聊天室信息
  BurningAfterDelete: getItem('BurningAfterDelete') || {}, // 阅后即焚消息记录
  RetractMessage: getItem('RetractMessage') || {}, // 撤回消息记录
  InitialChatList: getItem('InitialChatList') || {}, // 初始消息记录
  IsAddMessage: false, // 是否添加一条数据
  IsHaveMessage: false // 是否已请求到消息列表
}

export default {
  namespaced: true,
  state: {
    initState () {
      return initState
    },
    ...initState
  },
  mutations: {
    // 变更路由参数
    ChangeIMRouterParams(state, params) {
      state.IMRouterParams = params
    },
    SET_CHAT_ROOM_INFO (state, params) {
      // 获取当前聊天室的信息
      const chatRoomJid = window.IMRouterParams.jid
      const chatRoom = state.ChatRoomInfo[chatRoomJid]

      for (let key in params) {
        chatRoom[key] = params[key]
      }
    },
    // 设置消息列表
    SET_MESSAGE_LIST (state, response) {
      console.log('state.ChatRoomInfo 重复消息不添加',state.ChatRoomInfo)
      // 获取当前聊天室的信息
      const chatRoomJid = window.IMRouterParams.jid
      const chatRoom = state.ChatRoomInfo[chatRoomJid]
      // 为了性能的原因不适用unshift
      const messageList = JSON.parse(JSON.stringify(chatRoom.messageList))
      messageList.reverse() // 将数组的元素颠倒排序
      response.forEach(message => {
        // 重复消息不添加
        let isRepeat = false
        for (let i = 0; i < messageList.length; i++) {
          if (messageList[i].messageId === message.messageId) {
            isRepeat = true
            break
          }
        }
        if (!isRepeat) {
          messageList.push(message)
        }
      })
      // 处理完成后的列表
      const completeMessageList = messageList.reverse()
      // 将数组的元素再次颠倒排序
      state.ChatRoomInfo[chatRoomJid].messageList = completeMessageList
      state.ChatRoomInfo[chatRoomJid].isAddMessage = false // 此次为添加多条数据
      state.ChatRoomInfo[chatRoomJid].isHaveMessage = true // 已请求到消息列表
      state.IMRouterParams = window.IMRouterParams
    },
    // 设置消息的已读
    SET_READ_MESSAGE (state, resource) {
      console.log('SET_READ_MESSAGE', state, resource)
      // 获取当前聊天室的信息
      const chatRoom = state.ChatRoomInfo[resource.jid]
      const msg = chatRoom.messageList[resource.i]

      if (window.IMRouterParams.type === 'friend') {
        if (resource.type === 'isReadDel') {
          App.$set(
            state.BurningAfterDelete[resource.jid].messageList[resource.i],
            'isRead',
            1
          )
        } else if (resource.type === 'msg') {
          App.$set(msg, 'isRead', 1)
        }
      } else if (window.IMRouterParams.type === 'room') {
        if (msg.readNumber) {
          // 数组查重，已有消息过滤，没有添加
          if (!App.$utils.Tools.arrayCheck(msg.readNumber, resource.read, 'fromUserId')) {
            msg.readNumber.push(resource.read)
          }
        } else {
          App.$set(msg, 'readNumber', [resource.read])
        }
      }
    },
    // 添加一条列表消息
    ADD_MESSAGE_LIST (state, resource) {
      const chatRoomJid = window.IMRouterParams.jid
      const chatRoom = state.ChatRoomInfo[chatRoomJid] || {}
      const messageList = chatRoom.messageList || []
      // 若该消息为阅后即焚消息，则不添加到消息列表
      if (!resource.isReadDel) {
        messageList.push(resource)
      }
      chatRoom.isAddMessage = true
    },
    // 删除一条列表消息
    DELETE_MESSAGE_LIST (state, messageId) {
      const chatRoomJid = window.IMRouterParams.jid
      const messageList = state.ChatRoomInfo[chatRoomJid].messageList
      for (let i = 0; i < messageList.length; i++) {
        if (messageList[i].messageId === messageId) {
          messageList.splice(i, 1)
        }
      }
    },
    // 设置撤回消息
    SET_RETRACT_MESSAGE (state, resource) {
      state.RetractMessage = resource
    },
    // 设置好友初始聊天列表
    SET_INITIAL_CHAT_LIST (state, resource) {
      state.InitialChatList = resource
    },
    // 设置阅后即焚列表
    SET_BURNING_AFTER_DELETE (state, resource) {
      state.BurningAfterDelete = resource
    },
    // 初始化聊天室
    INIT_CHAT_ROOM (state) {
      const chatRoomJid = window.IMRouterParams.jid

      const data = {
        messageList: [], // 请求到的消息列表
        isAddMessage: false, // 是否只添加一条数据，否则添加多条数据
        isHaveMessage: false, // 是否已请求到消息列表
        scrollPosition: 0 // 滚动的位置
      }

      // 新增的属性需要使用$set进行赋值，不然getters无法监听ChatRoomInfo的变化
      App.$set(state.ChatRoomInfo, chatRoomJid, data)
    }
  },
  /**
   * 非常重要
   * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   *
   * getters 里面要用 state.IMRouterParams，是 Observer，不然无法触发更新
   *
   * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   * */
  getters: {
    // 聊天室信息对应的是否只添加一条数据，否则为添加多条数据
    IsAddMessage (state) {
      const chatRoomJid = state.IMRouterParams.jid
      const chatRoom = state.ChatRoomInfo[chatRoomJid] || {}
      return chatRoom.isAddMessage
    },
    // 聊天室信息对应的接口消息
    MessageList (state) {
      const chatRoomJid = state.IMRouterParams.jid
      const chatRoom = state.ChatRoomInfo[chatRoomJid] || {}
      return chatRoom.messageList
    },
    // 聊天室信息
    ChatRoomInfo (state) {
      const chatRoomJid = state.IMRouterParams.jid
      const chatRoom = state.ChatRoomInfo[chatRoomJid] || {}
      return chatRoom
    },
    // 聊天室信息对应的阅后即焚消息
    BurningAfterDelete (state) {
      const chatRoomJid = state.IMRouterParams.jid
      return state.BurningAfterDelete[chatRoomJid]
    },
    // 阅后即焚，撤回，已读，初始化，接口等消息列表合并
    // 处理后要渲染到页面的消息列表数据
    AfterProcessMessageList (state) {
      // console.log('state.IMRouterParams', state.IMRouterParams)
      const chatRoomJid = state.IMRouterParams.jid
      console.log(state.ChatRoomInfo,'state.ChatRoomInfo - state.ChatRoomInfo')
      const chatRoom = state.ChatRoomInfo[chatRoomJid]
      if (!chatRoom || !chatRoom.isHaveMessage) {
        // 未请求到接口没数据时，不处理数据，直接返回空数组
        return []
      }
      const { messageList } = JSON.parse(JSON.stringify(chatRoom))

      // 单聊需要做消息拼接
      if (state.IMRouterParams.type === 'friend') {
        // 设置阅后即焚
        const chatRoomJid = state.IMRouterParams.jid
        const currentBurningAfterDelete = state.BurningAfterDelete[chatRoomJid]
        if (currentBurningAfterDelete) {
          const delMessageList = currentBurningAfterDelete.messageList || []
          delMessageList.forEach(msg => {
            if (!msg.avatar) {
              let avatarId = msg.chatType === 2 ? msg.jid : msg.fromUserId
            }
            if (messageList.length === 0) {
              messageList.push(msg)
            } else {
              for (let i = 0; i < messageList.length; i++) {
                // 当前项的消息发布时间小于要插入的消息发布时间
                if (messageList[i].timeSend < msg.timeSend) {
                  if (i === messageList.length - 1) {
                    // 最后消息列表的最后一个
                    messageList.splice(i + 1, 0, msg)
                    break
                  } else if (messageList[i + 1].timeSend > msg.timeSend) {
                    // 不是消息列表最后一个则需要判断前项的下一项的发布时间要大约插入的消息发布时间
                    messageList.splice(i + 1, 0, msg)
                    break
                  }
                } else {
                  messageList.splice(i, 0, msg)
                  break
                }
              }
            }
          })
        }
      }

      // 设置撤回消息
      const retractMessage = state.RetractMessage[chatRoomJid] || []
      retractMessage.forEach(msg => {
        if (messageList.length === 0) {
          messageList.push(msg)
        } else {
          for (let i = 0; i < messageList.length; i++) {
            // 当前项的消息发布时间小于要插入的消息发布时间
            if (messageList[i].timeSend < msg.timeSend) {
              if (i === messageList.length - 1) {
                // 最后消息列表的最后一个
                messageList.splice(i + 1, 0, msg)
                break
              } else if (messageList[i + 1].timeSend > msg.timeSend) {
                // 不是消息列表最后一个则需要判断前项的下一项的发布时间要大约插入的消息发布时间
                messageList.splice(i + 1, 0, msg)
                break
              }
            } else {
              messageList.splice(i, 0, msg)
              break
            }
          }
        }
      })

      // 设置初始化聊天消息
      const id = state.IMRouterParams.jid
      const initialChatList = state.InitialChatList[id] || []
      initialChatList.forEach(msg => {
        if (messageList.length === 0) {
          messageList.push(msg)
        } else {
          let isRepeat = false // 是否重复
          for (let i = 0; i < messageList.length; i++) {
            // 判断消息是否重复
            if (messageList[i].messageId === msg.messageId) {
              isRepeat = true
              break
            }
          }

          // 过滤重复消息
          if (!isRepeat) {
            for (let i = 0; i < messageList.length; i++) {
              // 当前项的消息发布时间小于要插入的消息发布时间
              if (messageList[i].timeSend < msg.timeSend) {
                if (i === messageList.length - 1) {
                  // 最后消息列表的最后一个
                  messageList.splice(i + 1, 0, msg)
                  break
                } else if (messageList[i + 1].timeSend > msg.timeSend) {
                  // 不是消息列表最后一个则需要判断前项的下一项的发布时间要大约插入的消息发布时间
                  messageList.splice(i + 1, 0, msg)
                  break
                }
              } else {
                messageList.splice(i, 0, msg)
                break
              }
            }
          }
        }
      })
      // 用于查看重复消息的测试代码
      // messageList.forEach(msg => {
      //   if (msg.messageId === 'skimweb_100023821586572763722663') {
      //     console.log(msg)
      //   }
      // })
      console.log('设置初始化聊天消息 messageList===>', messageList)
      return messageList
    },
    // 图片消息url列表
    ImageMessageUrlList (state, getters) {
      const imgUrlList = []
      getters.AfterProcessMessageList.forEach(msg => {
        if (msg.type === 2 && msg.content) {
          // 添加图片并且有连接
          const message = {
            src: msg.content,
            messageId: msg.messageId
          }
          if (msg.isReadDel) {
            // 添加阅后即焚的图片消息
            const meId = getItem('MeId') || 0
            if (msg.meIsRead || parseInt(msg.fromUserId) === meId) {
              // 如果这条消息是我发送出去的，可以直接添加反之
              // 反之如果这条消息是对方发送的
              // 则需要我点击“查看阅后即焚消息”之后才能添加
              imgUrlList.push(message)
            } else {
              //
            }
          } else {
            // 添加不为阅后即焚的图片消息
            imgUrlList.push(message)
          }
        }
      })
      return imgUrlList
    }
  },
  actions: {
    // [GET] 获取消息列表
    async GetMessageList (ctx, params) {
      if(!params.receiver){
        return
      }
      // const apiUrl = params.type === 'friend' ? '/tigase/shiku_msgs' : '/tigase/shiku_muc_msgs'
      const apiUrl = params.type === 'friend' ? '/tigase/chat_msgs' : '/tigase/chat_muc_msgs'
      if (!params) {
        params = { userId: ctx.rootState.Common.User.MeId, pageIndex: 0, status: 2, pageSize: 500 }
      }
      params.receiver = params.receiver ? params.receiver : '122'
      const rs = await Ax.post(apiUrl, params)
      if (rs.resultCode !== 1) return rs

      // 当前请求的页数为1页，则先初始化聊天室信息
      if (params.pageIndex === 0) {
        // 初始化聊天室信息
        ctx.commit('INIT_CHAT_ROOM')
      }

      const messageList = []
      const data = rs.data
      console.log('初始化聊天室信息', data)

      for (let i = 0; i < data.length; i++) {
        let s = JSON.parse(data[i].message.replaceAll('&quot;', '"'))
        s = App.$utils.Xmpp.decryptMessage(s)
        s.messageId = s.messageHead.messageId
        s.chatType = s.messageHead.chatType
        s.offline = s.messageHead.offline
        s.jid = data[i].room_jid

        // 设置已读
        if (window.IMRouterParams.type === 'friend') {
          s.isRead = !!data[i].isRead
        } else if (window.IMRouterParams.type === 'room') {
          const readMsgList = getItem('GroupReadMessageList') || {}
          if (readMsgList[s.jid]) {
            const readMsg = readMsgList[s.jid]
            if (readMsg[s.messageId]) {
              s.readNumber = readMsg[s.messageId]
            } else {
              readMsg[s.messageId] = []
              s.readNumber = []
            }
          } else {
            readMsgList[s.jid] = { [s.messageId]: [] }
            s.readNumber = []
          }
          setItem('GroupReadMessageList', readMsgList)
        }

        const message = await App.$utils.Xmpp.formatChatMessage(s)
        messageList.push(message)
      }
      ctx.commit('SET_MESSAGE_LIST', messageList)
      return messageList
    },
    // [POST] Amr音频格式转为Mp3
    async PostAmrToMp3 (ctx, message) {
      let url = message.content
      const type = url.substr(url.lastIndexOf('.') + 1, url.length)
      if (type === 'amr') {
        const rs = await Ax.file('/upload/amrToMp3', { paths: url }, 'mp3')
        url = rs.data[0].oUrl
      }
      return url
    },
    // [Reset] 清空消息列表
    ResetMessageList (ctx) {
      ctx.commit('RESET_MESSAGE_LIST')
    },
    // 设置已读信息
    SetReadMessage (ctx, read) {
      console.log('设置已读信息', ctx, read)
      // 存储本地
      if (read.chatType === 2) {
        // 群消息需要设置到本地
        App.$storage.groupReadMessageList.setRead(read)
      }

      let jid = ''
      if (read.chatType === 1) {
        // 单聊
        jid = read.fromUserId
      } else if (read.chatType === 2) {
        // 群聊
        jid = read.from || read.toUserId
      }
      // 设置普通消息已读
      const chatRoom = ctx.state.ChatRoomInfo[jid] || {}
      const msgList = chatRoom.messageList || []
      for (let i = 0; i < msgList.length; i++) {
        if (msgList[i].messageId === read.content) {
          if (!msgList[i].isRead) ctx.commit('SET_READ_MESSAGE', { i, type: 'msg', jid, read })
          return
        }
      }

      // 设置阅后即焚已读
      // 需要判断单聊已读消息才执行
      if (ctx.state.BurningAfterDelete[read.fromUserId]) {
        const burningAfterDelete = ctx.state.BurningAfterDelete[read.fromUserId].messageList || []
        for (let i = 0; i < burningAfterDelete.length; i++) {
          if (burningAfterDelete[i].messageId === read.content) {
            if (!burningAfterDelete[i].isRead) {
              ctx.commit('SET_READ_MESSAGE', { i, type: 'isReadDel', jid })
            }
            return
          }
        }
      }
    },
    // [Add] 添加消息
    async AddMessageList (ctx, message) {
      let msg = JSON.parse(JSON.stringify(message))
      msg = await App.$utils.Xmpp.formatChatMessage(msg)
      ctx.commit('ADD_MESSAGE_LIST', msg)
    },
    // [POST] 删除消息
    async PostDeleteMessage (ctx, params) {
      const rs = await Ax.post('/tigase/deleteMsg', params)
      if (rs.resultCode !== 1) return rs
      ctx.commit('DELETE_MESSAGE_LIST', params.messageId)
      return rs
    },

    // [get] 处理已读消息
    async ConsoleSystemMessage (ctx, params) {
      const rs = await Ax.post(`/tigase/systemToUser/sendMessage`,params)
      if (rs.resultCode !== 1) return rs
      // ctx.commit('DELETE_MESSAGE_LIST', params.messageId)
      return rs
    },
  }
}
