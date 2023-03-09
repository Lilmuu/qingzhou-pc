/**
 * @description     utils
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:02:52
 */

import App from '@/main'
import { lt } from 'semver'
import md5 from 'js-md5'
import xss from 'xss'
import { openLink } from "@/utils/pure"
import { getCertificate } from "@/api/system"
import * as CryptoJS from "crypto-js";
import axios from "axios"
import { config } from "@/const/dicData"
import dayjs from "dayjs";

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 生成随机len位数字
 */
export const randomLenNum = (len, date) => {
  let random = ""
  random = Math.ceil(Math.random() * 100000000000000)
    .toString()
    .substr(0, len || 4)
  if (date) random = random + Date.now()
  return random
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) { // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

// 获取username 后两位
export function formatUserName(username) {
  if (!username) return ''
  const length = username.length
  return `${username.charAt(length - 2)}${username.charAt(length - 1)}`
}

// String 截取指定长度
export function formatStringWidth(str, start = 0, end = 8) {
  return str.substring(start, end)
}

// 邮箱截取 前缀 xxx@qq.com> => xxx
export function getMailPrefix(str) {
  if (!str) return ''
  const reg = /^(\w)+(\.\w+)*/g
  if (!reg.test(str)) return ''
  return str.match(reg)[0]
}

// 邮箱截取 aaa<bbb@qq.com> => bbb@qq.com
export function getMailStr(str) {
  const reg = /([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})/g
  return str.match(reg) ? (str.match(reg)[0]) : ''
}

/**
 * @param {string} clientVersion 客户端版本
 * @param {string} serverVersion 服务器端版本.
 * @return {boolean} 判断是否能更新
 */
export const hasNewVersion = (clientVersion, serverVersion) => {
  return lt(clientVersion, serverVersion)
}

/**
 * iframe 设置内容
 * */
export const setIframeInnerHtml = (el, htmlStr) => {
  const iframeBody = el.contentWindow.document.body
  iframeBody.innerHTML = htmlStr
}




//换行并重新定位光标位置
export const textareaRange= (el) =>{
  // var el = this.$refs.textarea
  var range = document.createRange();
  //返回用户当前的选区
  var sel =  document.getSelection();
  //获取当前光标位置
  var offset = sel.focusOffset
  //div当前内容
  var content = el.innerHTML
  //添加换行符\n
  el.innerHTML = content.slice(0,offset)+'\n'+content.slice(offset)
  //设置光标为当前位置
  range.setStart(el.childNodes[0], offset+1);
  //使得选区(光标)开始与结束位置重叠
  range.collapse(true);
  //移除现有其他的选区
  sel.removeAllRanges();
  //加入光标的选区
  sel.addRange(range);
}

/**
 * xss 过滤
 * */
export const xssFilter = (htmlStr) => {
  const whiteList = xss.getDefaultWhiteList()
  const myWhiteList = JSON.parse(JSON.stringify(whiteList))
  const keys = Object.keys(myWhiteList)
  keys.forEach(key => {
    myWhiteList[key].push('style')
  })
  const myxss = new xss.FilterXSS({
    whiteList: myWhiteList,
    css: true
  })
  return myxss.process(htmlStr)
}

/**
 * 监听跳转，自动跳转到浏览器中打开
 * @param event     {Event}
 * @param url      {String}
 * */
export const handleRedirect = (event, url) => {
  event.defaultPrevented = true
  event.preventDefault()
  openLink(url)
}

// 换行 '↵' => '\n'
export const transEnterTextBr = (str) => {
  return str.replace(/(\r\n|\n|\r)/gm, "<br />")
}

// 获取文件后缀名 "xxx.png"  => ".png"
export const getFileSuffix = (filename = "") => {
  console.log(filename);
  if(filename) {
    return filename.substring(filename.lastIndexOf("."), filename.length)
  }
  return ""
}

/**
 * 替换所有，不支持正则
 * @param str       {String}    文本
 * @param part      {String}    旧字符字符
 * @param newPart   {String}    新字符
 * @return          {String}
 * */
export const replaceAllByIndexOf = (str, part, newPart) => {
  const arr = []
  const count = str.indexOf(part)
  if (count === -1) return
  for (let i = 0; i <= count; i++) {
    arr.push(i)
  }
  arr.forEach(item => {
    str = str.replace(part, newPart)
  })
  return str
}

/**
 * 转 cid => img src 地址
 * @param     MailExtendList  {Array}   附件列表
 * @param     htmlStr         {String}  html
 * @param     type            {String}  类型
 * @param     shouldTransBr   {Boolean} 是否需要替换 '\n' 为 <br>
 * @param     shouldAddCid    {Boolean}
 * @param     action          {String}
 * @return    {Object}
 * */

export const replaceCIDImg = (MailExtendList,htmlStr,type,shouldTransBr = false,shouldAddCid = false, action) => {
  console.log(MailExtendList,'获取邮件 ---MailExtendList--- 00000 ')
  console.log(htmlStr,'获取邮件 ---htmlStr--- 00000 ')
  console.log(type,'获取邮件 ---type--- 00000 ')
  console.log(shouldTransBr,'获取邮件 ---shouldTransBr--- 00000 ')
  console.log(shouldAddCid,'获取邮件 ---shouldAddCid--- 00000 ')
  console.log(action,'获取邮件 ---action--- 00000 ')
  // MailExtendList: [
  //   {
  //   id: 97,
  //   imgUrl: "http://10.0.0.126:9000/extend/extend/file/2021-01-22/e6dd079f8db3a29894ae80acb8ceb604.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20210122%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20210122T032025Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=417a4f135560106323c090faf5398392fe523f94e9e795c608977e87dbcb42bb",
  //   mailId: 237,
  //   name: "4E55D73F@F6AED746.CB2D0A60.jpg",
  //   tenantId: 1,
  //   type: 0,
  //   updateTime: "2021-01-22T10:16:18",
  //   url: "extend_extend/file/2021-01-22/e6dd079f8db3a29894ae80acb8ceb604.jpg"}
  //  ]
  if(type.toLowerCase().indexOf('text/plain') !== -1) {
    let multipartFiles = []
    let extentStr = ''
    if(shouldAddCid) {
      MailExtendList.forEach(item => {
        // 为内联图片
        if(item.cid) {
          extentStr += `<img src="${item.imgUrl}" /><br />`
        } else {
          // 为附件
          if(action === 'huiFu' || action === 'huiFuQb') {
            multipartFiles = []
          } else if(action === 'zhuanFa' || action === 'reEdit' || action === 'preview') {
            multipartFiles.push(item)
          }
        }
      })
    }
    return {
      content: shouldTransBr ? transEnterTextBr(htmlStr + extentStr) : htmlStr + extentStr,
      multipartFiles
    }
  } else if(type.toLowerCase().indexOf('text/html') !== -1) {
    let multipartFiles = []
    MailExtendList.forEach(item => {
      const fileName = item.fileName || item.name
      item.fileName = fileName
      if(item.cid && htmlStr.indexOf(item.cid) !== -1) {
        if(action === 'huiFu' || action === 'huiFuQb' || action === 'zhuanFa' || action === 'reEdit') {
          //
        } else {
          htmlStr = replaceAllByIndexOf(htmlStr, item.cid, item.imgUrl)
        }
      } else {
        // 为附件
        if(action === 'huiFu' || action === 'huiFuQb') {
          multipartFiles = []
        } else if(action === 'zhuanFa' || action === 'reEdit' || action === 'preview') {
          multipartFiles.push(item)
        }
      }
    })
    return {
      content: htmlStr,
      multipartFiles
    }
  }
}

/**
 * 转 img src => cid 地址
 * @param     cidImgs         {Array}   cidImgs表
 * @param     htmlStr         {String}  html
 * @return    {Object}
 * */
export const replaceImgCID = (cidImgs, htmlStr) => {
  // MailExtendList: [
  //   {
  //   id: 97,
  //   imgUrl: "http://10.0.0.126:9000/extend/extend/file/2021-01-22/e6dd079f8db3a29894ae80acb8ceb604.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20210122%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20210122T032025Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=417a4f135560106323c090faf5398392fe523f94e9e795c608977e87dbcb42bb",
  //   mailId: 237,
  //   name: "4E55D73F@F6AED746.CB2D0A60.jpg",
  //   tenantId: 1,
  //   type: 0,
  //   updateTime: "2021-01-22T10:16:18",
  //   url: "extend_extend/file/2021-01-22/e6dd079f8db3a29894ae80acb8ceb604.jpg"}
  //  ]
  // 上传的附件

  const multipartFiles = []
  cidImgs.forEach(item => {
    // 防止 fileName 为空
    item.fileName = item.fileName || item.name
    const cidSrc = item.cidImg

    // const imgUrl = replaceAllByIndexOf(String(item.imgUrl), '&', '&amp;')
    const imgUrl = String(item.imgUrl)
    htmlStr = replaceAllByIndexOf(htmlStr, '&amp;', '&')

    // 为 cid 附件
    if (htmlStr.indexOf(imgUrl) !== -1) {
      htmlStr = replaceAllByIndexOf(htmlStr, imgUrl, cidSrc)
    } else {
      // 上传的附件
      multipartFiles.push(item)
    }
  })
  return {
    content: htmlStr,
    multipartFiles
  }
}

/**
 * 处理获取图片容器宽高
 * @param aimsNum 目标值
 * @param aidNum 辅助值
 * @param aimsMax 目标最大值
 * @param aidMax 辅助最大值
 * @return  {String}
 */
export const handleGetImgBoxWH = (aimsNum, aidNum, aimsMax, aidMax) => {
  let result = 0 // 返回值
  if (aimsNum < aimsMax && aidNum < aidMax) {
    // 宽高如果都小于最大值，则直接使用图片宽高
    aimsNum === 0 ? result = aimsMax : result = aimsNum
  } else {
    // 如果图片大于设定最大值，则需要通过图片的宽比计算宽
    if (aimsNum <= aidNum) {
      // 计算高度最大值与图片的高度比
      const scale = aidMax / aidNum // 高度比
      result = Math.round(aimsNum * scale) // 计算宽度
    } else {
      result = aimsMax
    }
  }
  return `${result}px`
}


/**
* 分片上传函数 支持多个文件
* @param options
* options.file 表示源文件
* options.pieceSize 表示需要分片的大小 默认是5m
* options.fileUrl 整个文件的上传地址
* progress 进度回调
* success 成功回调
* error 失败回调
*/
export const uploadByPieces = ({files, pieceSize = 5, progress, success, error}) => {
  if (!files || !files.length) return
  // 上传过程中用到的变量
  let fileList = [] // 总文件列表
  let progressNum = 1 // 进度
  let successAllCount = 0 // 上传成功的片数
  // let currentAllChunk = 0 // 当前上传的片数索引
  let AllChunk = 0 // 所有文件的chunk数之和
  let AllFileSize = 0 // 所有文件size


  // 获取md5
  const readFileMD5 = (files) => {
    // 读取每个文件的md5
    files.map((file, index) => {
      let fileRederInstance = new FileReader()
      fileRederInstance.readAsBinaryString(file)
      fileRederInstance.addEventListener('load', e => {
        let fileBolb = e.target.result
        let fileMD5 = md5(fileBolb)
        if (!fileList.some((arr) => arr.md5 === fileMD5)) {
          fileList.push({md5: fileMD5, name: file.name, file})
          AllFileSize = AllFileSize + file.size
        }
        if (index === files.length - 1) readChunkMD5(fileList)
      }, false)
    })
  }
  const getChunkInfo = (file, currentChunk, chunkSize) => {
    let start = currentChunk * chunkSize
    let end = Math.min(file.size, start + chunkSize)
    let chunk = file.slice(start, end)
    return { start, end, chunk }
  }
  // 针对每个文件进行chunk处理
  const readChunkMD5 = (fileList) => {
    fileList.map((currentFile, fileIndex) => {
      const chunkSize = pieceSize * 1024 * 1024 // 5MB一片
      const chunkCount = Math.ceil(currentFile.file.size / chunkSize) // 总片数

      const certificateData = {
        filename: currentFile.name,
        num: chunkCount,
      }

      getCertificate(certificateData).then(async res => {
        if(res.data.code === 200) {
          AllChunk = AllChunk + chunkCount // 计算全局chunk数
          // let fileSize = currentFile.file.size // 文件大小
          // 针对单个文件进行chunk上传
          const resData = res.data.data

          for (let i = 0; i < chunkCount; i++) {
            const { chunk } = getChunkInfo(currentFile.file, i, chunkSize)
            // let chunkFR = new FileReader()
            // chunkFR.readAsBinaryString(chunk)
            // chunkFR.addEventListener('load', e => {
            //   let chunkBolb = e.target.result
            //   let chunkMD5 = md5(chunkBolb)
            //   // this.readingFile = false
            //
            //   // bucketName: "manage"
            //   // createTime: 1614309462937
            //   // fileName: "bigfile/2021-02-26/0f948cdcb4f24db5be41d1833aeb8d9a.zip"
            //   // originFileName: "任务管理系统 - 副本.zip"
            //   // partNumber: 0
            //   // totalPartNumber: 12
            //   // uploadId: "345cc3b7-ee67-463b-b641-e5c3ff2f5e05"
            //
            //   uploadChunk(currentFile, {chunkMD5, chunk, currentChunk: i, chunkCount}, fileIndex, resData)
            // }, false)
            await uploadChunk(currentFile, {chunk, currentChunk: i, chunkCount}, fileIndex, resData)
          }
        }
      }).catch(e => {
        error && error(e)
      })
    })
  }
  // 更新进度
  const progressFun = (currentFile) => {
    progressNum = Math.ceil(successAllCount / AllChunk * 100)
    progress(progressNum, currentFile)
  }
  // 对分片已经处理完毕的文件进行上传
  // const uploadFile = (currentFile) => {
  //   let makeFileForm = new FormData()
  //   makeFileForm.append('file', currentFile.file)
  //
  //   fileUpload(makeFileForm).then(res => {
  //     progressFun()
  //     res.file_name = currentFile.name
  //     success && success(res)
  //     successAllCount++
  //   }).catch(e => {
  //     error && error(e)
  //   })
  // }
  const uploadChunk = (currentFile, chunkInfo, fileIndex, { bucketName, uploadId, partNumber, fileName }) => {
    currentFile.fileName = fileName
    return new Promise((resolve, reject) => {
      let fetchForm = new FormData()
      fetchForm.append('file', chunkInfo.chunk)
      // const chunkUrl = `/uploadPart/{bucketName}/{uploadId}/{partNumber}`
      const chunkUrl = `${config.uploadFileServer}/uploadPart/${bucketName}/${uploadId}/${chunkInfo.currentChunk + 1}`

      axios({
        url:chunkUrl,
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: fetchForm,
      })
        .then(res => {
          resolve(res)
          progressFun(currentFile)
          if (chunkInfo.currentChunk <= chunkInfo.chunkCount - 1) {
            successAllCount++
            if(chunkInfo.currentChunk + 1 === chunkInfo.chunkCount) {
              const successData = {
                bucketName,
                fileName,
                name: currentFile.name,
                size: AllFileSize,
              }
              success && success(successData)
            }
          }
        }).catch((e) => {
        error && error(e)
        reject(e)
      })
    })

  }
  readFileMD5(files) // 开始执行代码
}

/**
 * 文件大小转换
 * @param   fileByte    {Number} 文件byte
 * @return  {String}
 * */
export function getFileSize(fileByte) {
  var fileSizeByte = fileByte;
  var fileSizeMsg = "";
  if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
  else if (fileSizeByte == 1048576) fileSizeMsg = "1MB";
  else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
  else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) fileSizeMsg = "1GB";
  else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  else fileSizeMsg = "文件超过1TB";
  return fileSizeMsg;
}

/**
 *加密处理
 */
export const encryption = params => {
  let { data, type, param, key } = params;
  const result = JSON.parse(JSON.stringify(data));
  if (type === "Base64") {
    param.forEach(ele => {
      result[ele] = btoa(result[ele]);
    });
  } else {
    param.forEach(ele => {
      var data = result[ele];
      key = CryptoJS.enc.Latin1.parse(key);
      var iv = key;
      // 加密
      var encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding
      });
      result[ele] = encrypted.toString();
    });
  }
  return result;
};

// 会议格式化用户名, 将 pc-33 转为 33
export const displayUserName = (userName) => {
  if (!userName) return ''
  if (userName.indexOf('pc-') !== -1 || userName.indexOf('app-') !== -1) {
    userName = userName.split('-')[1]
  }
  return userName
}

// 会议 时间格式化
export const secondsFormat = (times) => {
  let t;
  if (times > -1) {
    let hour = Math.floor(times / 3600);
    let min = Math.floor(times / 60) % 60;
    let sec = times % 60;
    if (hour < 10) {
      t = "0" + hour + ":";
    } else {
      t = hour + ":";
    }

    if (min < 10) {
      t += "0";
    }
    t += min + ":";
    if (sec < 10) {
      t += "0";
    }
    t += sec.toFixed(2);
  }
  t = t.substring(0, t.length - 3);
  return t;
};

/**
 * 消息文字解析器
 * 1. 输入 http、https://example.com 将会自动转为 `<span class='message-link'  href="https://example.com">https://example.com</a>`
 *
 * @param     {String}  text
 * @return    {String}
 * */
export const messageTextParse = (text) => {
  const reg_httpLink = /((http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?)/g
  return text.replace(reg_httpLink, `<span class='cursor detected-link' onclick="openMessageLink(this)" href='$1'>$1</span>`).replace(/\n/g, "<br />");
}

// 消息链接打开
export const openMessageLink = (el) => {
  if (!el) return;
  const link = el.getAttribute('href').toLowerCase()
  if (!link) return;

  // url 白名单， action为对应的处理函数
  const urlWhiteList = [
    { url: '/sharemeeting.html?roomid=', action: 'joinMeetingRoomAction' },
  ]
  // 是否为白名单url
  const isWhiteListUrl = urlWhiteList.some(w => link.indexOf(w.url.toLowerCase()) !== -1)
  // 外部跳转
  if (!isWhiteListUrl) {
    openLink(link)
    return;
  }
  let actionFlag = false
  // 内部router action跳转
  urlWhiteList.forEach(w => {
    // 只执行一次 action
    if (actionFlag) return
    const wUrl = w.url.toLowerCase()
    if (link.indexOf(wUrl) !== -1) {
      actionFlag = true
      switch (w.action) {
        // 会议action
        case "joinMeetingRoomAction":
          joinMeetingRoomAction(link)
          break;
        default:
          break;
      }
    }
  })
}
// 挂载到window上
window.openMessageLink = openMessageLink

// 加入会议action
export const joinMeetingRoomAction = (link) => {
  const roomidReg = /roomid=\d*$/g
  const roomidRegArr = link.match(roomidReg)
  const roomidStr = roomidRegArr && roomidRegArr.length ? roomidRegArr[0] : ''
  const roomid = roomidStr.replace('roomid=', '')
  if (roomid) {
    const randomKey = Math.random()
    App.$router.replace(`/meeting/index?roomId=${ roomid }&stackKey=${ randomKey }`)
  } else {
    this.$message.error('会议ID不存在')
  }
}


/**
 * 消息置顶排序
 * @param   {Array}     topChatList     要置顶的消息
 * @param   {Array}     allChatList     所有消息
 * @return  {Array}                     排序后消息
 */
export const messageTopSort = (topChatList, allChatList) => {
  if (!topChatList || topChatList.length === 0) return allChatList
  // TODO: 先把置顶消息进行时间排序
  topChatList = topChatList.sort((a, b) => Number(a.timeSend || 0) - Number(b.timeSend || 0))

  let _allChatList = []
  // 已置顶的消息
  let topedChatList = []
  // 已置顶的jid
  let topedChatListJids = []
  // 未置顶的消息
  let unTopChatList = []
  // 未置顶的jid
  let unTopChatListJids = []

  let allTopChatListJids = topChatList.map(item => item.jid)

  for (let i = 0; i < topChatList.length; i++) {
    for (let j = 0; j < allChatList.length; j++) {
      const topChatListItem = topChatList[i]
      const lastChatListStorageItem = allChatList[j]
      const jid = lastChatListStorageItem.jid
      // 是置顶消息
      if (topChatListItem.jid === jid && allTopChatListJids.includes(jid)) {
        topedChatListJids.push(jid)
        topedChatList.push({ ...lastChatListStorageItem, isTop: true })
      } else {
        // 不是置顶消息
        if (!unTopChatListJids.includes(jid) && !allTopChatListJids.includes(jid)) {
          unTopChatListJids.push(jid)
          unTopChatList.push({ ...lastChatListStorageItem, isTop: false })
        }
      }
    }
  }
  _allChatList = [...topedChatList, ...unTopChatList]
  return _allChatList
}

/**
 * 是否需要显示message时间间隔
 * @param   {Object}  message       当前消息
 * @param   {Object}  prevMessage   下一个消息
 * @param   {Boolean} isFirst       是否为第一个消息
 * @return  {Boolean}
 * */
export const showMessageDate = (message, prevMessage, isFirst) => {
  if (isFirst) {
    return true;
  }

  const date = new Date(Number(message.timeSend));
  const prevDate = prevMessage ? new Date(Number(prevMessage.timeSend)) : date;

  // 在同一天内，时间间隔超过5分钟的: 显示
  const dateFormatStr = dayjs(date).format('YYYY-MM-DD')
  const prevDateFormatStr = dayjs(prevDate).format('YYYY-MM-DD')
  if (dateFormatStr === prevDateFormatStr) {
    // 5分钟： 60 * 5
    return dayjs(date).unix() - dayjs(prevDate).unix() > 300
  }
  // 不在同一年的、同一个月、同一天内的：显示
  if (
    date.getFullYear() !== prevDate.getFullYear() ||
    date.getMonth() !== prevDate.getMonth() ||
    date.getDate() !== prevDate.getDate()
  ) {
    return true;
  }
  return false;
}

// url图片转化成base64
export const convertImgToBase64 = (url, outputFormat, callback) => {
  let canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image;
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
    canvas = null;
  };
  img.src = url;
}


/* eslint-disable no-undefined,no-param-reassign,no-shadow */

/**
 * Throttle 节流
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  {Boolean}   [noTrailing]   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
 *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
 *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
 *                                    the internal counter is reset)
 * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                    to `callback` when the throttled-function is executed.
 * @param  {Boolean}   [debounceMode] If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
 *                                    schedule `callback` to execute after `delay` ms.
 *
 * @return {Function}  A new, throttled, function.
 */
export function throttle(delay, noTrailing, callback, debounceMode) {
  // After wrapper has stopped being called, this timeout ensures that
  // `callback` is executed at the proper times in `throttle` and `end`
  // debounce modes.
  let timeoutID;

  // Keep track of the last time `callback` was executed.
  let lastExec = 0;

  // `noTrailing` defaults to falsy.
  if (typeof noTrailing !== 'boolean') {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = undefined;
  }

  // The `wrapper` function encapsulates all of the throttling / debouncing
  // functionality and when executed will limit the rate at which `callback`
  // is executed.
  function wrapper() {
    const self = this;
    const elapsed = Number(new Date()) - lastExec;
    const args = arguments;

    // Execute `callback` and update the `lastExec` timestamp.
    function exec() {
      lastExec = Number(new Date());
      callback.apply(self, args);
    }

    // If `debounceMode` is true (at begin) this is used to clear the flag
    // to allow future `callback` executions.
    function clear() {
      timeoutID = undefined;
    }

    if (debounceMode && !timeoutID) {
      // Since `wrapper` is being called for the first time and
      // `debounceMode` is true (at begin), execute `callback`.
      exec();
    }

    // Clear any existing timeout.
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    if (debounceMode === undefined && elapsed > delay) {
      // In throttle mode, if `delay` time has been exceeded, execute
      // `callback`.
      exec();
    } else if (noTrailing !== true) {
      // In trailing throttle mode, since `delay` time has not been
      // exceeded, schedule `callback` to execute `delay` ms after most
      // recent execution.
      //
      // If `debounceMode` is true (at begin), schedule `clear` to execute
      // after `delay` ms.
      //
      // If `debounceMode` is false (at end), schedule `callback` to
      // execute after `delay` ms.
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
    }
  }

  // Return the wrapper function.
  return wrapper;
}
