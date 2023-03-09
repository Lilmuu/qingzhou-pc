/**
 * @description     config配置、字典、常量等，不可被 electron 进程文件引用
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-10 17:16:20
 */

import dayjs from "dayjs";

export const errorCode = {
  '000': '操作太频繁，请勿重复请求',
  '401': '当前操作没有权限',
  '403': '当前操作没有权限',
  '404': '资源不存在',
  '417': '未绑定登录账号，请使用密码登录后绑定',
  '426': '用户名不存在或密码错误',
  '428': '验证码错误,请重新输入',
  '429': '请求过频繁',
  '479': '演示环境，没有权限操作',
  'default': '系统未知错误,请反馈给管理员'
}

// 分页
export const pageOption = {
  total: 0, // 总页数
  currentPage: 1, // 当前页数
  pageSize: 50, // 每页显示多少条
  pageSizes: [50, 100, 150, 200]
}

// 邮箱分页
export const mailPageOption = {
  total: 0, // 总页数
  currentPage: 1, // 当前页数
  pageSize: Number(localStorage.getItem('mailPageSize') || 25), // 每页显示多少条
  pageSizes: [25, 50, 100]
}

export const config = {
  appMode: process.env.VUE_APP_MODE,
  // 接口地址
  baseURL: process.env.VUE_APP_BASE_API,
  // im接口地址
  imBaseURL: process.env.VUE_APP_API,
  socketURL: process.env.VUE_APP_SOCKET_URL,
  showDev: process.env.VUE_APP_SHOW_DEV === 'true',
  tenantId: process.env.VUE_APP_TENANT_ID,
  uploadFileServer: process.env.VUE_APP_UPLOAD_FILE_SERVER,
  mailHelpPage: process.env.VUE_APP_MAIL_HELP_PAGE,
  download_page: process.env.VUE_APP_DOWNLOAD_PAGE_URL,
  sharemeeting_page: process.env.VUE_APP_SHAREMEETING_PAGE,
  publish_url: process.env.VUE_APP_PUBLISH_URL
}
// 任务状态
export const taskState = [
  { label: '待接受', value: 0 },
  { label: '已接受', value: 1 },
  { label: '执行中', value: 2 },
  { label: '待验收', value: 3 },
  { label: '已完成', value: 4 }, // 完成
  { label: '已关闭', value: 5 } // 已取消
]

// 任务类型
export const taskType = [
  { label: '日程任务', value: 0 },
  { label: '行程任务', value: 1 },
  { label: '工作任务', value: 2 },
  { label: '项目任务', value: 3 }
  // { label: '反馈任务', value: 4 }
]

// 紧急程度
export const emergencyLevelDicData = [
  { label: '普通', value: 0 },
  { label: '紧急', value: 1 },
  { label: '非常紧急', value: 2 }
]

// 任务状态解释
export const taskTypeParser = (taskType, taskState) => {
  let str = ''
  if (taskState === 2) {
    str = '反馈任务'
  } else {
    switch (taskType) {
      case 0:
        str = '日程任务'
        break
      case 1:
        str = '行程任务'
        break
      case 2:
        str = '工作任务'
        break
      case 3:
        str = '项目任务'
        break
    }
  }
  return str
}

// 任务状态 背景颜色
export const taskTypeParserBackgroundColor = (taskType, taskState) => {
  let backgroundColor = ''
  if (taskState === 2) {
    backgroundColor = '#005BA6'
  } else {
    switch (taskType) {
      case 0:
        backgroundColor = '#008BFF'
        break
      case 1:
        backgroundColor = '#7573FF'
        break
      case 2:
        backgroundColor = '#43CF96'
        break
      case 3:
        backgroundColor = '#FFAE40'
        break
    }
  }
  return backgroundColor
}

// 状态
export const taskStatus = [
  { label: '发起', value: 0 },
  { label: '执行', value: 1 },
  { label: '关注', value: 2 },
  { label: '处理', value: 3 }
]

// 新状态字典
export const taskStateNew = [
  { label: '待查看', value: 0 },
  { label: '已查看', value: 1 },
  { label: '待验收', value: 2 },
  { label: '已完成', value: 3 }, // 完成
  { label: '已关闭', value: 4 } // 已取消
]

// 新状态字典
export const taskStateNew222 = [
  { label: '待查看', value: 0 },
  { label: '已查看', value: 1 },
  { label: '待验收', value: 2 },
  { label: '已完成', value: 3 }, // 完成
  { label: '已关闭', value: 4 } // 已取消
]

// 紧急程度
export const emergencyLevel = [
  { label: '普通', value: 0 },
  { label: '紧急', value: 1 },
  { label: '非常紧急', value: 2 }
]
// 紧急程度新版
export const emergencyLevelNew = [
  { label: '普通', value: 0 },
  { label: '紧急不重要', value: 1 },
  { label: '重要不紧急', value: 2 },
  { label: '重要且紧急', value: 3 }
]

// 反馈类型
export const fklxOption = [
  { label: '任务问题', value: 1 },
  { label: '任务已完成', value: 2 }
]

// 待我处理 下拉
export const dropDownOption = [
  { label: '最近截止', value: 'time', sort: 0 },
  { label: '最优先级', value: 'dj', sort: 1 },
  { label: '最近更新', value: 'update', sort: 2 }
]

// 待我处理
export const myTodoOption = {
  menu: true,
  align: 'center',
  menuAlign: 'center',
  editBtn: false,
  delBtn: false,
  addBtn: false,
  index: false,
  indexLabel: '序号',
  selection: false,
  reserveSelection: false,
  labelWidth: '120',
  arrow: false,
  searchLabelWidth: 120,
  header: false,
  menuWidth: 126,
  column: [
    {
      label: '任务名称内容',
      prop: 'name',
      slot: true,
      width: 200,
      overHidden: true,
      align: 'left'
    },
    {
      label: '任务类型',
      prop: 'taskType',
      slot: true
      // type: 'select',
      // dicData: taskType
    },
    {
      label: '发起人',
      prop: 'initiator'
    },
    {
      label: '紧急程度',
      prop: 'emergencyLevel',
      sortable: true,
      type: "select",
      align: 'center',
      dicData: emergencyLevelDicData
    },
    {
      label: '截止时间',
      prop: 'endTime',
      type: 'datetime',
      sortable: true,
      format: 'YYYY-MM-DD HH:mm'
    }
  ]
}

// 待我处理form
export const myTodoFormOption = {
  menu: true,
  align: 'left',
  menuAlign: 'left',
  editBtn: false,
  delBtn: false,
  addBtn: false,
  index: false,
  indexLabel: '序号',
  selection: false,
  reserveSelection: false,
  labelWidth: '120',
  arrow: false,
  searchLabelWidth: 120,
  header: false,
  column: [
    {
      label: '任务类型',
      prop: 'taskType',
      type: 'select',
      dicData: taskType,
      slot: true,
      span: 24,
      icon: require('@/assets/img/mytodo/rwlx.png')
    },
    {
      label: '任务标题',
      prop: 'name',
      slot: true,
      span: 24,
      icon: require('@/assets/img/mytodo/rwbt.png')
    },
    {
      label: '发起人',
      prop: 'initiator',
      slot: true,
      span: 24,
      icon: require('@/assets/img/mytodo/fqr.png')
    },
    {
      label: '执行人',
      prop: 'userName',
      slot: true,
      span: 24,
      icon: require('@/assets/img/mytodo/zxr.png')
    },
    {
      label: '关注人',
      prop: 'attentionList',
      slot: true,
      span: 24,
      icon: require('@/assets/img/mytodo/zxr.png')
    },
    {
      label: '任务内容',
      prop: 'content',
      slot: true,
      customSlot: true,
      span: 24,
      icon: require('@/assets/img/mytodo/nrms.png')
    },
    {
      label: '紧急程度',
      prop: 'emergencyLevel',
      slot: true,
      span: 24,
      type: 'select',
      dicData: emergencyLevel,
      icon: require('@/assets/img/mytodo/jjcd.png')
    },
    {
      label: '任务状态',
      prop: 'state',
      slot: true,
      span: 24,
      type: 'select',
      dicData: taskState,
      icon: require('@/assets/img/mytodo/rwzt.png')
    },
    {
      label: '工作周期',
      prop: 'gzzq',
      slot: true,
      customSlot: true,
      span: 24,
      icon: require('@/assets/img/mytodo/gzzq.png')
    },
    {
      label: '发起时间',
      prop: 'createTime',
      slot: true,
      span: 24,
      customSlot: true,
      icon: require('@/assets/img/mytodo/fqsj.png')
    }
  ]
}

// 我发起的
export const myReportOption = {
  menu: true,
  align: 'center',
  menuAlign: 'center',
  editBtn: false,
  delBtn: false,
  addBtn: false,
  index: false,
  indexLabel: '序号',
  selection: false,
  reserveSelection: false,
  labelWidth: '120',
  arrow: false,
  searchLabelWidth: 120,
  header: false,
  menuWidth: 115,
  column: [
    {
      label: '任务名称内容',
      prop: 'name',
      slot: true,
      width: 180,
      overHidden: true,
      align: 'left'
    },
    {
      label: '任务类型',
      prop: 'taskType',
      type: 'select',
      dicData: taskType,
      width: 130,
      overHidden: true
    },
    {
      label: '任务状态',
      prop: 'state',
      slot: true,
      width: 130,
      overHidden: true
    },
    {
      label: '执行人',
      prop: 'userName',
      width: 130,
      overHidden: true
    },
    {
      label: '紧急程度',
      prop: 'emergencyLevel',
      sortable: true,
      type: "select",
      align: 'center',
      dicData: emergencyLevelDicData
    },
    {
      label: '接受时间',
      prop: 'acceptTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    },
    {
      label: '截止时间',
      prop: 'endTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm',
      sortable: true
    },
    {
      label: '处理时间',
      prop: 'manageTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    }
  ]
}

// 我关注的
export const myFollowOption = {
  align: 'center',
  menuAlign: 'center',
  editBtn: false,
  delBtn: false,
  addBtn: false,
  index: false,
  indexLabel: '序号',
  selection: false,
  reserveSelection: false,
  labelWidth: '120',
  arrow: false,
  searchLabelWidth: 120,
  header: false,
  menu: false,
  menuWidth: 115,
  column: [
    {
      label: '任务名称内容',
      prop: 'name',
      slot: true,
      width: 180,
      overHidden: true,
      align: 'left'
    },
    {
      label: '任务类型',
      prop: 'taskType',
      type: 'select',
      dicData: taskType,
      width: 110,
      overHidden: true
    },
    {
      label: '任务状态',
      prop: 'state',
      slot: true,
      width: 110,
      overHidden: true
    },
    {
      label: '发起人',
      prop: 'initiator',
      width: 110,
      overHidden: true
    },
    {
      label: '紧急程度',
      prop: 'emergencyLevel',
      sortable: true,
      type: "select",
      align: 'center',
      dicData: emergencyLevelDicData
    },
    {
      label: '发起时间',
      prop: 'startTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    },
    {
      label: '接受人',
      prop: 'perform'
    },
    {
      label: '接受时间',
      prop: 'acceptTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    },
    {
      label: '截止时间',
      prop: 'endTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm',
      sortable: true
    },
    {
      label: '结束时间',
      prop: 'overTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    }
  ]
}

// 我执行的
export const myExecOption = {
  menu: true,
  align: 'center',
  menuAlign: 'center',
  editBtn: false,
  delBtn: false,
  addBtn: false,
  index: false,
  indexLabel: '序号',
  selection: false,
  reserveSelection: false,
  labelWidth: '120',
  arrow: false,
  searchLabelWidth: 120,
  header: false,
  menuWidth: 115,
  column: [
    {
      label: '任务名称内容',
      prop: 'name',
      slot: true,
      width: 180,
      overHidden: true,
      align: 'left'
    },
    {
      label: '任务类型',
      prop: 'taskType',
      type: 'select',
      dicData: taskType,
      width: 130,
      overHidden: true
    },
    {
      label: '任务状态',
      prop: 'state',
      slot: true,
      width: 130,
      overHidden: true
    },
    {
      label: '发起人',
      prop: 'initiator'
    },
    {
      label: '紧急程度',
      prop: 'emergencyLevel',
      sortable: true,
      type: "select",
      align: 'center',
      dicData: emergencyLevelDicData
    },
    {
      label: '截止时间',
      prop: 'endTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm',
      sortable: true
    },
    {
      label: '接受时间',
      prop: 'acceptTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    },
    {
      label: '结束时间',
      prop: 'overTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    }
  ]
}

// 发送 下拉
export const dropDownSendOption = [
  { label: '不使用', value: 'bsy', sort: 0 },
  { label: '使用', value: 'sy', sort: 1 }
]

// 发送  类型
export const sendCheckBoxOption = [
  { label: '紧急', value: 'jj' },
  { label: '已读回执', value: 'ydhz' },
  { label: '定时发送', value: 'dsfs' }
]

const currentYear = Number(dayjs().format('YYYY'))

// 行时间
const renderCloDate = (value) => {
  const dataYear = Number(dayjs(value).format('YYYY'))
  // 往年数据
  if(dataYear < currentYear) {
    return dayjs(value).format('YYYY-MM-DD')
  }
  // 今年
  return dayjs(value).format('MM-DD')
}

// 收件箱
export const inboxOption = {
  align: 'center',
  menuAlign: 'center',
  editBtn: false,
  delBtn: false,
  addBtn: false,
  index: false,
  reserveSelection: false,
  labelWidth: '120',
  arrow: false,
  searchLabelWidth: 120,
  header: false,
  menu: false,
  menuWidth: 115,
  showHeader: false,
  selection: false,
  indexWidth: 20,
  column: [
    {
      label: '邮箱',
      prop: 'from',
      // width: 180,
      // overHidden: true,
      align: 'left',
      slot: true
    },
    {
      label: '主题',
      prop: 'subject',
      overHidden: true,
      align: 'left'
    },
    {
      label: '时间',
      prop: 'sentDate',
      overHidden: true,
      align: 'right',
      formatter: (row, value, label, column) => {
        if (value) {
          return renderCloDate(value)
        }
        return ""
      }
    },
    {
      label: '红旗',
      prop: 'stress',
      overHidden: true,
      width: 50,
      align: 'right',
      slot: true
    }
  ]
}

// 标记为
export const bj_dropDownOption = [
  { label: '已读', value: 0 },
  { label: '未读', value: 1 },
  { label: '红旗邮件', value: 2 },
  { label: '取消红旗', value: 3 }
]

// 移动到
export const ydd_dropDownOption = [
  // { label: '文件夹', value: 'id' },
  { label: '收件箱', value: 1, divided: true },
  { label: '草稿箱', value: 2 },
  { label: '已发送', value: 3 },
  { label: '已删除', value: 4 },
  { label: '垃圾邮件', value: 5 }
]

// const mailGroupId = {
//   /**
//    * 收件箱
//    */
//   public static final Integer INBOX = 1;
//   /**
//    * 草稿箱
//    */
//   public static final Integer DRAFT_BOX = 2;
//   /**
//    * 已发送
//    */
//   public static final Integer HAS_BEEN_SENT = 3;
//   /**
//    * 已删除
//    */
//   public static final Integer DELETED = 4;
//   /**
//    * 垃圾邮件
//    */
//   public static final Integer SPAM = 5;
// }


// 收件箱
export const settingAccountOption = {
  align: 'center',
  menuAlign: 'center',
  editBtn: false,
  delBtn: false,
  addBtn: false,
  index: false,
  page:false,
  reserveSelection: false,
  labelWidth: '140',
  arrow: false,
  header: false,
  // menu: false,
  menuWidth: 140,
  // showHeader: false,
  selection: false,
  indexWidth: 20,
  column: [
    {
      label: '账户名称',
      prop: 'account',
      // width: 180,
      // overHidden: true,
      align: 'left',
    },
    {
      label: '邮箱地址',
      prop: 'username',
      overHidden: true,
      align: 'center'
    },
    {
      label: '类型',
      prop: 'acceptProtocol',
      overHidden: true,
      align: 'center',
    },
    {
      label: '状态',
      prop: 'useWay',
      overHidden: true,
      align: 'center',
      slot: true
    }
  ]
}

// 全部任务
export const allTask = {
  addBtn:false,
  menu:false,
  refreshBtn:false,
  columnBtn:false,
  slot:true,
  page:true,
  column:[{
    label:'创建日期',
    prop:'createTime',
    // width:"120px",
    formatter: function(row, value, label, column) {
      if (value) {
        return value.substring(0, 10);
      } else {
        return value;
      }
    }
  },{
    label:'任务/项目名称',
    prop:'name',
    // width:"200px",
    overHidden:true
  },{
    label:'任务内容',
    prop:'content'
  },{
    label:'发起人',
    prop:'initiator',
    // width:"90px"
  },{
    label:'执行人',
    prop:'userName',
    // width:"90px"
  },{
    label:'截止时间',
    prop:'endTime',
    formatter: function(row, value, label, column) {
      if(value) {
        if (row.taskType == 0 ) {
          return value.split(" ")[0]
        }else {
          return value
        }
      }else {
        return ""
      }
    }
    // width:"145px"
  },{
    label:'完成时间',
    prop:'completeTime',
    formatter: function(row, value, label, column) {
      if(value){
        return value.substring(0,value.length - 3)
      }else {
        return value
      }
    },
    // width:"145px"
  },{
    label:'优先级',
    prop:'emergencyLevel',
    dicData:emergencyLevelNew,
    // width:"150px"
  },{
    label:'状态',
    prop:'state',
    // width:"80px",
    slot:true
  }]
}

// 循环任务选择项
export const loopOptions = [
  { label: '每个自然日', value: 1 },
  { label: '每个工作日', value: 2 },
  { label: '每个周', value: 3 },
  { label: '每个月', value: 4 },
]
// 周
export const weekendsDateList =  ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// 默认时间提醒选择项
export const timeCheck = [{
  check:false,
  value:15,
  content:'提前15分钟',
  isShow:true,
  type:1,
  timeType:1
},{
  check:false,
  content:'提前30分钟',
  value:30,
  isShow:true,
  type:1,
  timeType:2
},{
  check:false,
  content:'下周一 9:00',
  value:1,
  isShow:false,
  type:0,
  timeType:3
},{
  check:false,
  content:'本周五 17:00',
  value:5,
  isShow:false,
  type:0,
  timeType:4
}]

export const remindModeList = [{
  have: false,
  type: 'one',
  content: '设置单次提醒',
  timeType: 1,
  icon: require('@/assets/img/mytodo/new_task/newtask_single.png')
},{
  have: false,
  content: '设置循环提醒',
  type: 'more',
  timeType: 2,
  icon: require('@/assets/img/mytodo/new_task/newtask_loop.png')
}]