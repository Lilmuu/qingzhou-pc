// 消息加密类型
const MESSAGE_ENCRYPT_TYPE = {
  _3DES: 1 // 消息3DES加密
}

// 消息加密选项
const MESSAGE_ENCRYPT_OPTIONS = [
  { key: 0, value: '消息明文传输' },
  { key: MESSAGE_ENCRYPT_TYPE._3DES, value: '消息3DES加密传输' }
]

const Constant = {
  SYSTEM_ALERT_TITLE_NAME: '即时通讯', // 提示的标题名称（可以理解为程序的名称）
  INFORMATION_LIST_PAGE_SIZE: 20, // 聊天列表页码大小
  FRIEND_LIST_PAGE_SIZE: 20, // 好友列表页码大小
  BLACK_LIST_PAGE_SIZE: 20, // 黑名单列表页码大小
  USER_SRARCH_LIST_PAGE_SIZE: 20, // 用户搜索列表页码大小
  ROOM_LIST_PAGE_SIZE: 20, // 群组列表页码大小
  ROOM_SHARE_FILE_LIST_PAGE_SIZE: 20, // 群共享文件列表页码大小
  ROOM_MEMBER_LIST_PAGE_SIST: 20, // 群成员列表页码大小
  NEW_FRIEND_LIST_PAGE_SIZE: 20, // 新朋友列表页码大小
  LIST_TO_TOP_OFFSET: 100, // 滚动列表显示"回到顶部"按钮的距离（px）
  LIST_NO_MORE_SIZE: 10, // 如果列表已无数据,可设置列表的总数量要大于等于设置的条数才显示"无更多数据"
  SEND_FILE_MAX_SIZE: 100, // 发送文件最大大小（MB）
  MESSAGE_ENCRYPT_TYPE, // 消息加密类型
  MESSAGE_ENCRYPT_OPTIONS // 消息加密选项
}

export default Constant
