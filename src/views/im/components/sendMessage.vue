<template>
  <!-- 消息输入框 -->
  <pane min-size="20" size="30" class="inputContainer" style="height:auto;min-height:48px">
    <div class="messageInputBox">
      <div id="messageInput" ref="messageInput" @keypress="handlerMultiEnter" @keyup="handlerMultiEnter">
      </div>
    </div>
    <!-- 输入框工具  -->
    <div class="inputToolBarBox">
      <div class="inputToolBar">
        <!-- emoji表情弹窗 -->
        <el-popover width="535" popper-class="expressionPopover" class="operation_btn" placement="top" :offset="100" :visible-arrow="false" trigger="click">
          <div>
            <Expression @expressionClick="onClickExpressionSelect"></Expression>
          </div>
          <div slot="reference" >
            <el-tooltip content="表情" placement="top" effect="dark">
              <img src="@/assets/img/im/tool_bar/emoji.png" class="toolBarIcon"  alt="" style="margin-top:2px">
            </el-tooltip>
          </div>
        </el-popover>

        <!--图片上传-->
        <div class="operation_btn">
          <el-tooltip content="图片" placement="top" effect="dark">
            <img @click="handleAttachInput('img')" src="@/assets/img/im/tool_bar/pic.png" class="toolBarIcon" alt="">
          </el-tooltip>
          <input ref="imgInputRef" type="file" accept="image/png,image/jpeg,image/gif,image/jpg,image/webp" @change="uploadFile($event, 'img')" class="fileUploader">
        </div>

        <!--文件上传-->
        <div class="operation_btn">
          <el-tooltip content="文件" placement="top" effect="dark">
            <img @click="handleAttachInput('file')" src="@/assets/img/im/tool_bar/file.png" class="toolBarIcon" alt="">
          </el-tooltip>
          <input ref="fileInputRef" type="file" accept="file/*" class="fileUploader" @change="uploadFile($event, 'file')">
        </div>

        <!-- 截图 -->
        <div class="operation_btn">
          <el-tooltip content="截图(Ctrl + Alt + A)" placement="top" effect="dark">
            <img @click="handleCutScreen" src="@/assets/img/im/tool_bar/cut.png" class="toolBarIcon"  alt="">
          </el-tooltip>
        </div>

        <!-- 发送 -->
        <div class="operation_btn">
          <el-tooltip content="发送(Enter)" placement="top" effect="dark">
            <img v-if="!sendBtnStatus" src="@/assets/img/im/tool_bar/send1.png" class="toolBarIcon"  alt="" style="cursor: not-allowed;">
            <img v-else @click="onClickSendMessage" src="@/assets/img/im/tool_bar/send2.png" class="toolBarIcon"  alt="">
          </el-tooltip>
        </div>

        <!-- 语音通话 -->
        <!-- <div class="operation_btn">
          <el-tooltip content="语音通话" placement="top" effect="dark">
            <img @click="beforeCall" src="@/assets/img/im/tool_bar/call.png" class="toolBarIcon" alt="">
          </el-tooltip>
        </div> -->
      </div>
    </div>

    <!-- <el-tooltip popper-class="import-class" content="重要" placement="top" effect="dark" v-if="importantVal">
          <img src="@/assets/img/task/imp.png" />
        </el-tooltip> -->

    <el-tooltip
      content="Enter发送 Ctrl+Enter换行"
      placement="top"
      :open-delay='1000'
      effect="light"
      popper-class='send-tooltip'>

    </el-tooltip>

    <!-- 发送图片dialog -->
    <el-dialog append-to-body
      width="400px"
      class="el-dialog__body_padding0"
      :before-close="handleClearPaste"
      :visible.sync='pasteDialog'
      :close-on-click-modal="false">
      <div>
        <div class="pasteFileContainer">
          <img :src="pasteImgSrc" class="pasteImg" alt="">
        </div>
        <div class="paste-send-row flex-center">
          <div class="paste-send-btn cursor" @click="handleSendPasteMessage">
            <span>发送</span>
          </div>
          <div class="paste-send-btn-cancel cursor" @click="handleClearPaste">
            <span>取消</span>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 上传进度dialog  -->
    <el-dialog append-to-body
      width="400px"
      class="el-dialog__body_padding0"
      :before-close="handleClearPaste"
      :visible.sync='uploadDialog'
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      style="margin-top: calc(50vh - 200px);">
      <div class="upload-dialog-container flex-center">
        <el-progress type="circle" :width="100" :percentage="this.uploadPercent"></el-progress>
      </div>
    </el-dialog>
    <!-- 选择语音通话成员dialog  -->
    <el-dialog
      title="选择成员"
      append-to-body
      width="700px"
      class="member-dialog"
      :before-close="handleCloseMember"
      :visible.sync='memberDialog'
      style="margin-top: calc(50vh - 400px);">
      <selectPeople
        :members="RoomInfo.members"
        :meId="Number(MeId)"
        :busyMembers="busyMembers"
        :visible="memberDialog"
        @handleCloseMember="handleCloseMember"
        @memberSubmit="memberSubmit"
      ></selectPeople>
    </el-dialog>
  </pane>
</template>

<script>
  import { Pane } from 'splitpanes'
  import { emojis } from '@/assets/js/resource'
  import { sendMessage } from '@/xmpp/send-message'
  import { mapState, mapGetters, mapActions } from 'vuex'
  import Expression from './expression'
  import { voiceAsk } from "@/api/im";
  import E from 'wangeditor'
  import {getBusyUser, transformId} from "../../../api/im";
  import selectPeople from "./groupUsers/selectPeople"


  const myRealName = localStorage.getItem('USERNAME')
  let USERNAME = ''

  export default {
    name: "sendMessage",
    props: {
      params: {
        type: Object,
        required: true
        /*
        * id: '',
          type: 'friend',   // [room, friend]
          jid: ''           // 群jid / 好友id
        * */
      },
      // 顶部名称
      roomTitle: {
        type: String,
        required: true,
        default: ''
      }
    },
    components: {
      Pane,
      Expression,
      selectPeople,
    },
    data() {
      return {
        Message: '',
        memberDialog: false,
        RecorderToggle: false,
        ExpressionToggle: false,
        MoreToggle: false,
        SendBtnToggle: false,
        pasteDialog: false, // 显示粘贴dialog
        pasteImgSrc: '', // 粘贴图片src
        pasteFile: {},  // 粘贴的文件
        pasteFiles: [], // 粘贴的图片
        editor: {},
        busyMembers: [], // 忙线用户
        imgUrl: '', // 上传图片的url
        imgFileList:{}, // 文件列表
        sendBtnStatus:false
      }
    },
    computed: {
      ...mapState({
        uploadPercent: state => state.Common.UpdateFile.uploadPercent,
        RoomInfo: state => state.Im.Room.RoomInfo,
        MeId: state => state.Common.User.MeId || 0, // 我的ID
        userId: state => state.user.userId,
      }),
      ...mapGetters({
        'IdFriendList': 'Im/Friends/IdFriendList',
        'JidRoomList': 'Im/Room/JidRoomList'
      }),
      uploadDialog: {
        get() {
          return !!this.uploadPercent
        },
        set(value) {
          console.log('value')
        }
      },
      // 同时监听两个变量
      address () {
        const { ExpressionToggle, MoreToggle } = this
        return { ExpressionToggle, MoreToggle }
      },
      // 是否被禁言
      IsBanned () {
        return this.RoomInfo.member && this.RoomInfo.member.talkTime > 0 && this.RoomInfo.member.role !== 1
      },
      // 是否全体被禁言
      IsAllBanned () {
        return this.RoomInfo.talkTime > 0 && this.RoomInfo.member.role !== 1
      },
      IsBannedText () {
        return this.IsAllBanned ? '全员禁言中' : '您已被禁言'
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.editorInit()
      })
      if (this.params.type === 'room') {
        this.GetRoomInfo({ roomId: this.params.id })
      }
      let span = document.createElement('span')
      span.className = 'inputSpan'
      span.style.fontSize = '14px'
      document.querySelector('body').appendChild(span)
    },
    destroyed() {
      this.ResetRoomInfo()
      document.removeEventListener('paste', this.handlePaste)
      const span = document.querySelector('.inputSpan')
      document.querySelector('body').removeChild(span)
    },
    methods: {
      ...mapActions({
        'PostUploadFileMultipart': 'Common/UpdateFile/PostUploadFileMultipart', // 上传文件
        AddMessageList: 'Im/Chat/AddMessageList', // [Add] 添加消息列表
        GetRoomInfo: 'Im/Room/GetRoomInfo', // [GET] 获取群信息
        ResetRoomInfo: 'Im/Room/ResetRoomInfo' // [RESET] 清空群信息
      }),
      // 富文本初始化
      editorInit() {
        this.editor = new E('#messageInput')
        // this.editor.config.height = window.innerHeight - (window.innerHeight -75)-30
        console.log(window.innerHeight,'window.innerHeight')
        this.editor.config.menus = []
        this.editor.config.showFullScreen = false
        this.editor.config.linkCheck = null
        this.editor.txt.eventHooks.enterUpEvents.push(this.enterBtn)
        this.editor.$textElem.attr('contenteditable',false)
        this.editor.create()
        this.$forceUpdate()
        document.addEventListener('paste', this.handlePaste)
        console.log(document.getElementsByClassName('w-e-text-container')[0],'12312312453214124')
        document.getElementsByClassName('w-e-text-container')[0].style=''
        document.getElementsByClassName('w-e-text')[0].spellcheck = false
      },

      /* 发送消息的对象 === 当前聊天的对象
       * 则将消息添加到消息列表
       * 当发送文件是异步处理的时间很长，避免在这个时候切换聊天窗口
       */
      handleSendMessage (type, file, toUserMsg) {
        // 发送消息
        let sendParams = this.$utils.Primary.getSendParams(this, type, file.url, toUserMsg)
        sendParams = Object.assign(sendParams, file)
        let msg = sendMessage(sendParams)
        msg = this.$utils.Xmpp.decryptMessage(msg)
        if(toUserMsg.jid === window.IMRouterParams.jid){
          // 将消息添加到消息列表
          this.AddMessageList(msg)
        }
        // 维护本地最新消息列表
        if (!msg.isReadDel) {
          // 阅后即焚消息不维护
          this.$storage.lastChatList.setLastChat({ message: msg, chatType: msg.chatType })
        }
      },
      /**
       * 监听粘贴事件
       * @param   event   {ClipboardEvent}
       * */
      async handlePaste(event) {
        const that = this
        if (event.clipboardData || event.originalEvent) {
          //某些chrome版本使用的是event.originalEvent
          let clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
          if (clipboardData.items) {
            // for chrome
            let items = clipboardData.items,
              len = items.length,
              blob = null;
            for (let i = 0; i < len; i++) {
              // console.log(items[i]);
              if (items[i].type.indexOf("image") !== -1) {
                //getAsFile() 此方法只是living standard firefox ie11 并不支持
                blob = items[i].getAsFile();
                console.log('blob', blob)
                this.pasteFile = blob
                this.pasteFiles.push(blob)
              }
            }
            if (blob !== null) {
              // BASE64 走IM接口发送
              let blobUrl = URL.createObjectURL(blob);
              //blob对象显示
              // this.pasteDialog = true
              this.pasteImgSrc = blobUrl;
              let reader = new FileReader();
              // 用base64码显示
              let newDate = new Date().getTime()
              let dataId = 'img_'+newDate
              reader.onload = function (event) {
                // event.target.result 即为图片的Base64编码字符串
                let base64_str = event.target.result;
                this.pasteImgSrc = base64_str;
                // 保存文件
                const html = `<img src="${this.pasteImgSrc}" data-id="${dataId}" style="max-width:100%;"/>`
                that.editor.cmd.do('insertHTML', html)
                that.$nextTick(() => {
                  const targetText = document.querySelector('.w-e-text').getBoundingClientRect()
                  if(targetText.height > 50){
                    that.updateMessage()
                  }
                })
              }
              this.imgFileList[dataId] = blob
              reader.readAsDataURL(blob);



              // 用 blob 显示
              // var fd = new FormData(document.forms[0]);
              // fd.append("the_file", blob, 'image.png');
              // //创建XMLHttpRequest对象
              // var xhr = new XMLHttpRequest();
              // xhr.open('POST', '/image');
              // xhr.onload = function () {
              //   if (xhr.readyState === 4) {
              //     if (xhr.status === 200) {
              //       var data = JSON.parse(xhr.responseText);
              //       console.log(data);
              //     } else {
              //       console.log(xhr.statusText);
              //     }
              //   }
              // };
              // xhr.onerror = function (e) {
              //   console.log(xhr.statusText);
              // }
              // xhr.send(fd);
            }
          }
        }
        this.sendBtnStatus = true
      },
      handleClearPaste() {
        this.pasteDialog = false
      },
      handleSendPasteMessage() {
        const file = this.pasteFile
        this.uploadFile(null, null, true, file)
        this.pasteDialog = false
      },
      // [Click] 选中表情
      onClickExpressionSelect (emoji) {
        console.log(emoji,'emojiemoji')
        if (emoji === 'del.png') {
          // 删除表情
          const msgLen = this.Message.length - 1
          const start = this.Message.lastIndexOf('[')
          const end = this.Message.lastIndexOf(']')
          if (end !== -1 && end === msgLen) this.Message = this.Message.slice(0, start)
        } else {
          // 添加表情
          for (let i = 0; i < emojis.length; i++) {
            for (let key in emojis[i]) {
              // console.log(key,emojis[i][key],'emojis[i][key]')
              if (emojis[i][key] === emoji){
                let aa = require('@/assets/images/chat/send-message/emoji/' + emoji)
                // 在光标位置添加内容
                this.editor.cmd.do('insertHTML',`<img src="${aa}" class="emjio_img" style="width:20px;" alt="" emoji=${key} />`)
              }
            }
          }
        }
        this.sendBtnStatus = true
        this.handlerMultiEnter()
      },
      // [Enter] 发送数据
      /**
      * @param  e  {KeyboardEvent}
      * */
      enterBtn(){
        console.log('hahaah')
        // this.editor.txt.clear() // 发送后立即清空
      },
      updateMessage(){
        let toolBar = document.querySelector('.inputToolBarBox')
        let messageEl = document.querySelector('.inputContainer')
        messageEl.style.flexDirection = 'column'
        toolBar.style.width = '100%'
        toolBar.style.height = '40px'
        toolBar.style.justifyContent = 'flex-end'
      },
      clearMessage(){
        let toolBar = document.querySelector('.inputToolBarBox')
        let messageEl = document.querySelector('.inputContainer')
        messageEl.style.flexDirection = 'row'
        toolBar.style.width = '170px'
        toolBar.style.height = '48px'
        toolBar.style.justifyContent = 'center'
      },
      calculateWidth(){
        let inputWidth = 0
        let inputP = document.querySelector('.w-e-text').children[0]
        let span = document.querySelector('.inputSpan')
        span.textContent = this.editor.txt.text()
        Array.from(inputP.children).map(item => {
          if(item.nodeName.toLowerCase() === 'img'){
            inputWidth += item.getBoundingClientRect().width
          }
        })
        inputWidth += span.offsetWidth
        return inputWidth
      },
      // 键盘按键监听事件
      handlerMultiEnter(e) {
        const targetText = document.querySelector('.w-e-text').getBoundingClientRect()
        const messageEl = document.querySelector('.inputContainer')
        const inputWidth = this.calculateWidth()
        if(targetText.height > 50){
          this.updateMessage()
        }else if(inputWidth < messageEl.getBoundingClientRect().width - 195){
          this.clearMessage()
        }
        document.querySelector('.w-e-text').scrollTop = document.querySelector('.w-e-text').scrollHeight
        let code = e?.keyCode;
        let ctrl = e?.ctrlKey;
        let shift = e?.shiftKey;
        let alt = e?.altKey;
        if(code=='13'){
          this.clearMessage()
        }
        // ctrl + enter
        if(code == '10' && ctrl && !shift && !alt) {
          this.editor.txt.append('<p></p>')
        }
        // shift + enter
        if(code == '13' && !ctrl && shift && !alt) {
          console.log('shift - enter')
        }
        // 只按了enter
        if(code == '13' && !ctrl && !shift && !alt) {
          e.preventDefault()
          this.onClickSendMessage()
        }
        this.editor.txt.html() ? this.sendBtnStatus = true : this.sendBtnStatus = false
      },
      // [Click] 发送新消息
      async onClickSendMessage () {
        let sendParams
        if(!window.navigator.onLine){
          this.$message.error('网络已断开，请检查网络连接后再试')
          return
        }
        this.clearMessage()
        document.querySelector('.messageListContainerOuter').scrollTop = document.querySelector('.messageListContainerOuter').scrollHeight

        let editorCont = this.editor.txt.html() // 获取富文本框内容
        let editorText = this.editor.txt.text() // 获取富文本框内容
        let img = editorCont.indexOf('<img')
        // 防止全部为 空格 回车
        let blankStr = editorText.replace(/&nbsp;/gm,'')
        blankStr = blankStr.trim()
        if(img == -1 && blankStr === '') {
          this.editor.txt.clear()
          return;
        }

        // 匹配图片
        const reg_httpLink = /(<img src="data)+(([\w\-\.,;@?^=%&:/~\+#\s"]*[\w\-\@?^=%&/~\+#\s"])?)*(\w\s)*(\/>)/g
        // 发送消息 - 文本&图片

        if(reg_httpLink.test(editorCont)){
          this.matchingScreenshot(editorCont)
          this.finalTotalArr.forEach(e=>{
            if(e.type == "image"){
              this.uploadFile(null, null, true, this.imgFileList[e.content])
            }else if(e.type == "text"){
              sendParams = this.$utils.Primary.getSendParams(this, this.$msgType.TEXT, e.content)
              this.maintainMessageList(sendParams)
            }
          })
          this.editor.txt.clear() // 发送后立即清空
          this.editor.txt.html() ? this.sendBtnStatus = true : this.sendBtnStatus = false
          return
        }else{
          // 发送消息 - 文本
          sendParams = this.$utils.Primary.getSendParams(this, this.$msgType.TEXT, editorCont)
          this.editor.txt.clear() // 发送后立即清空
          this.maintainMessageList(sendParams)
          }
        this.editor.txt.html() ? this.sendBtnStatus = true : this.sendBtnStatus = false
      },
      // 维护本地列表
      maintainMessageList(sendParams){
        let msg = sendMessage(sendParams)
        msg = this.$utils.Xmpp.decryptMessage(msg)
        this.AddMessageList(msg)  // 将该消息添加到消息列表
        // 阅后即焚消息不执行
        if (!msg.isReadDel) {
          // 维护本地最新消息列表
          this.$storage.lastChatList.setLastChat({ message: msg, chatType: sendParams.chatType })
        }
      },

      // 匹配 截图的字符串 - 返回数组对象
      matchingScreenshot(val){
        const reg_httpLink = /(<img src="data)+(([\w\-\.,;@?^=%&:/~\+#\s"]*[\w\-\@?^=%&/~\+#\s"])?)*(\w\s)*(\/>)/g
        // 获取匹配的数组
        let resResult = val.match(reg_httpLink)
        resResult = resResult.map(item=>{
          let regexp = /img_[0-9]{13}/g
          return item.match(regexp)[0]
        })
        // 将匹配的值替换 做切割成数组
        let valReplace = val.replace(reg_httpLink,'*-*')
        let newArr = valReplace.split('*-*')
        let changeArr = newArr.map((item,index)=>{
          if(index == 0){
            return item+'</p>'
          }if(index == newArr.length-1){
            return '<p>' + item
          }else{
            return '<p>' + item + '</p>'
          }
        })

        // 合并每项
        let finalArr = []
        for(let i=0;i<changeArr.length;i++){
          finalArr.push({ type: 'text', content: changeArr[i] })
          if(i < resResult.length){
            finalArr.push({ type: 'image', content: resResult[i] })
          }
        }
        this.finalTotalArr = finalArr.filter(item=>{
          return item.content != '<p></p>' && item.content != '<p><br/></p>'
        })
      },

      // 触发输入框
      handleAttachInput(type) {

        // 要先清空
        if (type === 'img') {
          this.$refs.imgInputRef.value = ''
          this.$refs.imgInputRef.click()
        } else if (type === 'file') {
          this.$refs.fileInputRef.value = ''
          this.$refs.fileInputRef.click()
        }
      },
      /**
       * 上传
       * @param   event         {Event}
       * @param   type          {String} [img, file]
       * @param   isPasteFile   {Boolean}
       * */
      uploadFile(event, type, isPasteFile = false, pasteFile) {
        const _this = this
        let toUserMsg = window.IMRouterParams
        let file = null
        if(isPasteFile) {
          file = pasteFile
        } else {
          file = event.target.files[0]
        }
        // 判断大小
        // const maxSize = this.$constant.SEND_FILE_MAX_SIZE
        const fileSize = file.size / 1024 / 1000
        if (fileSize > 200) {
          _this.$message.error('无法发送超过200MB的文件')
          return
        }
        // 上传文件
        let fileData = new FormData()
        fileData.append('file', file)
        fileData.append('validTime', 0)

        _this.PostUploadFileMultipart(fileData).then(rs => {
          if (rs.resultCode === 1) {
            let type = 9
            let res
            const cFile = {}
            if (rs.data.images && rs.data.images[0]) {
              type = 2
              // 获取图片宽高 由于是异步的，所以调用方法得写在onload里面
              const reader = new FileReader()
              reader.onload = e => {
                const data = e.target.result
                const img = new Image()
                img.onload = () => {
                  cFile.width = img.width
                  cFile.height = img.height
                  cFile.fileName = res.oFileName
                  cFile.url = res.oUrl
                  cFile.fileSize = file.size
                  _this.handleSendMessage(type, cFile, toUserMsg)
                }
                img.src = data
              }
              reader.readAsDataURL(file)
              res = rs.data.images[0]
              return
            } else if (rs.data.audios && rs.data.audios[0]) {
              res = rs.data.audios[0]
            } else if (rs.data.videos && rs.data.videos[0]) {
              // type = 6
              type = 9 // 视频-当成文件传输
              res = rs.data.videos[0]
            } else if (rs.data.others && rs.data.others[0]) {
              res = rs.data.others[0]
            }
            cFile.fileName = res.oFileName
            cFile.url = res.oUrl
            cFile.fileSize = file.size

            // 获取文件后缀类型
            cFile.fileType = _this.$utils.File.getFileExtType(file)
            _this.handleSendMessage(type, cFile, toUserMsg)
          }
        })
        document.querySelector('.messageListContainerOuter').scrollTop = document.querySelector('.messageListContainerOuter').scrollHeight
      },
      // 截图
      handleCutScreen() {
        this.$electron.ipcRenderer.send('screenWindow')
      },
      // 成员选择弹框关闭
      handleCloseMember() {
        this.memberDialog = false
      },
      async memberSubmit(list) {
        const preVal = process.env.VUE_APP_IM_CHATROOM
        // return
        let ids = []
        list.forEach(item => {
          if (item.id !== this.MeId) {
            ids.push(item.id)
          }
        })
        await transformId({ids: ids}).then(res => {
          if (res.data && res.data.code == 0) {
            console.log(res.data.data)
            ids = [...res.data.data]
          }
        })
        const data = {
          ids: [...ids],
          roomName: `callRoom-${ USERNAME }`,
          type: this.params.type,
          roomId: this.params.id,
          from: 'pc'
        }
        if (!this.roomTitle) {
          this.$message.error('通话名称错误')
          return;
        }
        if (ids.length === 0) {
          this.$message.warning('请邀请语音通话成员！')
          return
        }
        voiceAsk(data).then(res => {
          if (res.data.code === 200) {
            const roomActionData = {
              creatType: 'create',
              roomId: `${preVal}callRoom-${ USERNAME }`,
              imRoomId: this.params.id,
              trigger: this.roomTitle,
              triggerId: [...ids],
              type: this.params.type,
              members: this.RoomInfo.members,
              busyMembers: this.busyMembers,
              meId: this.MeId
            }
            const roomActionDataStr = JSON.stringify(roomActionData)
            localStorage.setItem('roomActionData', roomActionDataStr)
            this.$electron.ipcRenderer.send('create-call-window', roomActionDataStr)
          }
        })
        this.handleCloseMember()
      },
      beforeCall() {
        USERNAME = `pc-` + String(new Date().getTime()) + '-' + myRealName
        getBusyUser({ids: [this.userId]}).then(res => {
          if (res.data && res.data.code == 0) {
            const arr = [...res.data.data]
            if (arr.length > 0) {
              this.$message.warning('您正在通话中，请稍后再试！')
            } else {
              this.handleCall()
            }
          }
        })
      },
      // 语音通话
      async handleCall() {
        console.log('process.env.VUE_APP_IM_CHATROOM', process.env.VUE_APP_IM_CHATROOM)
        const preVal = process.env.VUE_APP_IM_CHATROOM
        const id = Number(this.params.id)
        // return
        if (this.params.type !== 'friend') {
          this.memberDialog = true
          let ids = []
          this.RoomInfo.members.forEach(item => {
            if (item.userId !== this.MeId) {
              ids.push(item.userId)
            }
          })
          await transformId({ids: ids}).then(res => {
            if (res.data && res.data.code == 0) {
              ids = [...res.data.data]
            }
          })
          getBusyUser({ids: ids}).then(res => {
            if (res.data && res.data.code == 0) {
              this.busyMembers = [...res.data.data]
            }
          })
        } else {
          let ids = []
          await transformId({ids: [id]}).then(res => {
            if (res.data && res.data.code == 0) {
              console.log(res.data.data)
              ids = [...res.data.data]
            }
          })
          const data = {
            ids: ids,
            roomName: `${preVal}callRoom-${ USERNAME }`,
            type: this.params.type,
            from: 'pc'
          }
          if (String(this.MeId) === String(id)) {
            this.$message.error('无法给自己通话')
            return;
          }
          if (!this.roomTitle) {
            this.$message.error('通话名称错误')
            return;
          }
          voiceAsk(data).then(res => {
            if (res.data.code === 200) {
              console.log(res.data.data,'对方不在线 - 对方不在线')
              if (res.data.data.length > 0 && res.data.data[0].type == 1) {
                this.$message.error('对方不在线！')
                return
              }
              if (res.data.data.length > 0 && res.data.data[0].type == 0) {
                this.$message.error('对方正在忙线中，请稍后再拨！')
                return
              }
              const roomActionData = {
                creatType: 'create',
                roomId: `${preVal}callRoom-${ USERNAME }`,
                trigger: this.roomTitle,
                triggerId: [...ids],
                type: this.params.type
              }
              const roomActionDataStr = JSON.stringify(roomActionData)
              localStorage.setItem('roomActionData', roomActionDataStr)
              this.$electron.ipcRenderer.send('create-call-window', roomActionDataStr)
            }
          })
        }
      },
    },
    watch: {
      address () {
        // DOM渲染之后执行 监听高度
        this.$nextTick(() => { this.$emit('heightChange', this.$refs.box.offsetHeight) })
      },
      // 监听消息内容
      Message (news) {
        // 显示 or 隐藏发送按钮
        if (news !== '') this.SendBtnToggle = true
        else this.SendBtnToggle = false
      },
    }
  }
</script>

<style lang="scss">
.messageInputBox{
  flex: 1;
  line-height: 0;
  ::v-deep .placeholder{
    top: 24px;
  }
  
}
#messageInput{
  width: 100%;
  display: inline-block;
  .w-e-text-container{
    min-height: 0!important;
    border: none!important;
    height: auto ;
     .w-e-text{
      box-sizing: border-box;
      padding: 13px 10px;
      overflow-y: auto;
      min-height: 48px;
      max-height: 416px;
      color: #404758;
      &::-webkit-scrollbar {
        width: 5px;
      }
      &::-webkit-scrollbar-track {
        background-color: #fff;
        border-radius: 0 10px 10px 0;
      }
      >p{
        font-size: 14px !important;
        margin: 0;
        span{
          font-size: 14px !important;
        }
      }
      &>p{
        // display: inline-block;
      }
      img[alt]{
        width: 20px;
        vertical-align: text-bottom;
      }
      a{
        font-size: 14px!important;
      }
    }
  }
}
</style>
