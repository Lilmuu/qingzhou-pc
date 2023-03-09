<!--邮件详情-->
<template>
  <MainBasicContainer :useBorder="false"
    v-loading="loading">
    <div class="box_header">
      <div class="box_header_top">
        <img :src="boxHeader.img" alt="">
        {{boxHeader.name}}
      </div>
    </div>
    <MailTopHeader :headerTitle="form.mailBody.subject"
      :propIsCheckedAll="false"
      :config="headerConfig"
      :mailIds="[params.id]"
      :entry="detailEntry"
      @handleGoBack="handleGoBack"
      @actionCallBack="actionCallBack"
      @refresh="handleGetListCb"
      @selectAll="() => {}"
      v-if="!loading"></MailTopHeader>
    <!-- <MailTopAction :propIsCheckedAll="false"
     :config="headerConfig"
     :mailIds="[params.id]"
     :entry="detailEntry"
     @handleGoBack="handleGoBack"
     @actionCallBack="actionCallBack"
     @refresh="handleGetListCb"
     @selectAll="() => {}"></MailTopAction> -->
    <div class="mail-header-container">
      <div class="mail-info">
        <div class="mail-info-row" style="display:flex">
          <div style="flex:5">
            <div class="mail-info-label">发件人：</div>
            <!--          <div class="mail-info-detail">{{ form.mailBody.from | getMailPrefix }}<{{ form.mailBody.from }}>;</div>-->
            <div class="mail-info-detail" style="display:inline-block;">{{ form.mailBody.from }}</div>
          </div>
          <div style="flex:2;">
            <div v-if="form.mailBody.sentDate">
            <!-- <div class="mail-info-label" style="color:#8F959E;">时间：</div> -->
            <div class="mail-info-detail" style="color:#8F959E;text-align: right;">{{ timerFormat(form.mailBody.sentDate) }}</div>
          </div>
        </div>
        </div>
        <div class="mail-info-row" v-show="formatedRecipientList.to.length > 0" style="display:flex;">
          <div class="mail-info-label">收件人：</div>
          <div class="mail-info-detail" style="flex:1">
            <span v-for="(item, index) in formatedRecipientList.to"
                  :key="'MailRecipientList' + index"
                  v-show="item.mailType.value === 'to'"
                  style="display: inline-block;">{{ item.name }}<{{ item.mail }}>{{ formatedRecipientList.to.length === 1 || index === formatedRecipientList.to.length - 1? '' : ';' }}</span>
          </div>
        </div>
        <div class="mail-info-row" v-show="formatedRecipientList.cc.length > 0">
          <div class="mail-info-label">抄送：</div>
          <div class="mail-info-detail">
            <span v-for="(item, index) in formatedRecipientList.cc"
                  :key="'MailRecipientList' + index"
                  v-show="item.mailType.value === 'cc'"
                  style="display: inline-block;">{{ item.name }}<{{ item.mail }}>{{ formatedRecipientList.cc.length === 1 || index === formatedRecipientList.cc.length - 1 ? '' : ';' }}</span>
          </div>
        </div>
<!--<div class="mail-info-row" v-show="formatedRecipientList.bcc.length > 0">-->
<!--  <div class="mail-info-label">密送：</div>-->
<!--  <div class="mail-info-detail">-->
<!--    <span v-for="(item, index) in formatedRecipientList.bcc"-->
<!--     :key="'MailRecipientList' + index"-->
<!--     v-show="item.mailType.value === 'bcc'"-->
<!--     style="display: inline-block;">{{ item.name }}<{{ item.mail }}>;</span>-->
<!--  </div>-->
<!--</div>-->
        
        <div class="mail-info-row" v-if="form.MailExtendList.length">
          <div class="mail-info-label">附件：</div>
<!--          <div class="mail-info-detail">{{ form.MailExtendList.length }}个（<span class="fj-tag"-->
<!--            @click="handleDownload(item)"-->
<!--            v-for="(item, index) in form.MailExtendList"-->
<!--            :key="'MailExtendList' + index">{{ item.name }}{{ index >= 0 && index !== form.MailExtendList.length -1 ? '、' : '' }}</span>）</div>-->
          <div class="mail-info-detail">
            <div class="accessoriesDownBox" @click="accessoriesDownBoxClick">
              <img src="@/assets/img/mail/flag.png" alt="" class="accessoriesDownBoxFlag">
              {{form.MailExtendList.length}}
              <img src="@/assets/img/mail/xiajiao.png" alt="" class="accessoriesDownBoxXajiao">
            </div>
          </div>
          <div class="fjTagBox" v-show="accessoriesDownBoxBlur">
            <div class="fj-tag"
              @click="handleDownload(item)"
              v-for="(item, index) in form.MailExtendList"
              :key="'MailExtendList' + index"><img :src="itemFalsg(item.name)" alt="">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="mail-content-container">
      <!--      <p class="mail-title">Hi，郑志勇，</p>-->
      <!--      <p class="mail-content" v-html="xssFilter(form.MailContent.text)">-->
      <!-- 邮箱内容 -->
      <iframe id="mailContent" scrolling="no" :height="iframeHeight" frameborder="0"></iframe>
      <div>
      </div>
    </div>
    <div class="zhezhao" v-show="accessoriesDownBoxBlur" @click="accessoriesDownBoxClick"></div>
    <!-- <div class="send-footer" style="justify-content: flex-end;">
      <div :class="['send-btn prev-mail-btn flex-center', nowIndex()-1>=0 ? '':'disabled-btn']" @click="handleGotoNext('prod')">上一封</div>
      <div :class="['send-btn next-mail-btn flex-center', nowIndex()-1<allMailId.length ? '':'disabled-btn']" @click="handleGotoNext('next')">下一封</div>
    </div> -->
    <!--撤回dialog  -->
    <el-dialog append-to-body
               width="40%"
               :visible.sync='backDialog'
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <div class="dialog-tip"></div>
        <span class="el-dialog__title">撤回确认</span>
      </div>
      <div class="flex-column-center">
        <img src="@/assets/img/mail/drafts.png" class="drafts-img" alt="">
        <span class="drafts-info" :style="`color: ${canChehui ? '#222222' : '#FF770F'}`">{{ canChehui ? '请您确认邮箱是否撤回？' : '此邮件不支持撤回，请返回！' }}</span>
      </div>
      <div class="flex-center" style="margin-top: 70px;" v-if="canChehui">
        <div @click="handleBackSubmit" class="mail-btn flex-center mail-btn-primary" style="margin-right: 30px;">确定撤回</div>
        <div @click="backDialog = false" class="mail-btn flex-center mail-btn-disable">取消</div>
      </div>
      <div class="flex-center" style="margin-top: 70px;" v-else>
        <div @click="backDialog = false" class="mail-btn flex-center mail-btn-primary" style="margin-right: 30px;">关闭</div>
      </div>
    </el-dialog>
  </MainBasicContainer>
</template>

<script>
import MailTopHeader from "@/views/mail/components/MailTopHeader"
import { config } from "@/const/dicData"
import { getMailDetails, getSenderMail, sendMail, updateIsReceipt, getMailAccessory } from "@/api/mail"
import dayjs from 'dayjs'
import { formatToCNDateDay2 } from "@/views/myDate/components/utils"
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
import { openLink } from "@/utils/pure"
import MailTopAction from "@/views/mail/components/MailTopAction"
import xss from 'xss'
import { getMailStr, replaceCIDImg, setIframeInnerHtml, transEnterTextBr } from "@/utils"
import { mapState } from "vuex"
import MainBasicContainer from "@/components/BasicContainer/MainBasicContainer"

export default {
  name: "mailDetail",
  props: {
    detailEntry: {
      type: String
    },
    params: {
      type: Object,
      default: () => {}
    },
    Xquery: {
      type: Object,
      default: () => {}
    },
    allMailId: {
      type: Array,
      default: () => []
    }
  },
  components: {
    MainBasicContainer,
    MailTopHeader,
    MailTopAction
  },
  data() {
    return {
      accessoriesDownBoxBlur:false,
      loading: false,
      headerConfig: {
        back: true,
        fh: true,
        sc: true,
        cdsc: true,
        zf: true,
        qbhf: true,
        zcbj: true,
        ch: true,
        bjw: true,
        ydd: true
      },
      showDev: config.showDev,
      canChehui: false,
      backDialog: false,
      form: {
        "mailBody": {
          "id": 0,
          "groupId": 0,
          "userId": 0,
          "from": "",
          "replyTo": "",
          "sentDate": "",
          "subject": "",
          "isSend": 0,
          "urgent": 0,
          "receipt": 0,
          "isTiming": 0,
          "rend": 0,
          "answered": 0,
          "stress": 0,
          "delFlag": "0",
          "createTime": "",
          "updateTime": "",
          "tenantId": 0
        },
        "MailExtendList": [
        //   {
        //   "id": 0,
        //   "mailId": 0,
        //   "name": "xxx.pdf",
        //   "url": "",
        //   "createTime": "",
        //   "updateTime": "",
        //   "delFlag": "0",
        //   "tenantId": 0
        // }
        ],
        "MailRecipientList": [
        //   {
        //   "id": 0,
        //   "mailId": 0,
        //   "mail": "",
        //   "name": "",
        //   "mailType": { "value": "to" },
        //   "createTime": "",
        //   "updateTime": "",
        //   "delFlag": "0",
        //   "tenantId": 0
        // }
        ],
        "MailContent": {
          "id": 0,
          "mailId": 0,
          "text": "",
          "textType": "TEXT/HTML; charset=utf-8",
          "createTime": "",
          "updateTime": "",
          "delFlag": "0",
          "tenantId": 0
        },
        upId: '',
        downId: ''
      },
      senderInfo: {
        account: '',
        username: ''
      },
      iframeHeight: 500, // iframe 高度
      timerd:null,
      boxHeader:{name:'',img:''}
    }
  },
  mounted() {
    console.log('this.detailEntry', this.detailEntry)
    switch (this.detailEntry) {
      // 收件箱 或 文件夹
      case 'inbox':
      case 'directory':
        this.headerConfig = {
          back: true,
          sc: true,
          cdsc: true,
          zf: true,
          hf: true,
          qbhf: true,
          bjw: true,
          ydd: true
        }
        break
      // 垃圾箱
      case 'spamMail':
        this.headerConfig = {
          back: true,
          cdsc: true,
          xr: true,
          zf: true,
          bjw: true,
          ydd: true
        }
        break
      // 草稿箱
      case 'drafts':
        this.headerConfig = {
          back: true,
          zcbj: true,
          sc: true,
          cdsc: true
        }
        break
      // 已发送
      case 'sentMail':
        this.headerConfig = {
          back: true,
          sc: true,
          cdsc: true,
          zf: true,
          qbhf: true,
          zcbj: true,
          ch: true,
          bjw: true,
          ydd: true
        }
        break
      // 已删除
      case 'deletedMail':
        this.headerConfig = {
          back: true,
          cdsc: true,
          bjw: true,
          ydd: true
        }
        break
    }

    this.init()
    this.boxHeaderr()
  },
  computed: {
    ...mapState({
      mailConfigId: state => state.app.mailConfigId,
      mailContInfo: state =>state.app.mailContInfo, // 邮件内容缓存数据
    }),
    // 格式化 接收人
    formatedRecipientList() {
      const { MailRecipientList } = this.form
      const to = MailRecipientList.filter(item => item.mailType.value === 'to')
      const cc = MailRecipientList.filter(item => item.mailType.value === 'cc')
      const bcc = MailRecipientList.filter(item => item.mailType.value === 'bcc')

      const toArr = to.map(item => item.mail)
      const ccListArr = cc.map(item => item.mail)
      const bccListArr = bcc.map(item => item.mail)

      const formated = {
        to,
        toArr,
        cc,
        ccListArr,
        bcc,
        bccListArr
      }
      return formated
    }
  },
  methods: {
    itemFalsg(item){
      if(item.split(".")[1]=='jpg'){
        return require('@/assets/img/mail/jpg.png')
      }else if(item.split(".")[1]=='doc'){
        return require('@/assets/img/mail/doc.png')
      }else if(item.split(".")[1]=='ppt'){
        return require('@/assets/img/mail/ppt.png')
      }else if(item.split(".")[1]=='xls'){
        return require('@/assets/img/mail/xls.png')
      }else if(item.split(".")[1]=='7z'){
        return require('@/assets/img/mail/7z.png')
      }else if(item.split(".")[1]=='exe'){
        return require('@/assets/img/mail/exe.png')
      }else if(item.split(".")[1]=='png'){
        return require('@/assets/img/mail/png.png')
      }else if(item.split(".")[1]=='rar'){
        return require('@/assets/img/mail/rar.png')
      }else if(item.split(".")[1]=='zip'){
        return require('@/assets/img/mail/zip.png')
      }else if(item.split(".")[1]=='pdf'){
        return require('@/assets/img/mail/pdf.png')
      }else{
        return require('@/assets/img/mail/else.png')
      }
    },
    accessoriesDownBoxClick(){
      this.accessoriesDownBoxBlur=!this.accessoriesDownBoxBlur
    },
    boxHeaderr(){
      if(this.detailEntry=='inbox'){
        this.boxHeader={name:'收件箱',img:require('@/assets/img/icon/mail/inbox.png')}
      }else if(this.detailEntry=='flag'){
        this.boxHeader={name:'旗标邮件',img:require('@/assets/img/icon/mail/flag.png')}
      }else if(this.detailEntry=='drafts'){
        this.boxHeader={name:'草稿箱',img:require('@/assets/img/icon/mail/drafts.png')}
      }else if(this.detailEntry=='sentMail'){
        this.boxHeader={name:'已发送',img:require('@/assets/img/icon/mail/sentMail.png')}
      }else if(this.detailEntry=='deletedMail'){
        this.boxHeader={name:'已删除',img:require('@/assets/img/icon/mail/deletedMail.png')}
      }else if(this.detailEntry=='spamMail'){
        this.boxHeader={name:'垃圾邮件',img:require('@/assets/img/icon/mail/spamMail.png')}
      }
    },
    init() {
      this.handleGetUserMail()
    },
    handleGetListCb(menu) {
      this.$emit('changeMailTotal',menu)
      this.$emit('refresh')
    },
    // 获取邮件详情
    async handleGetMailDetails() {
      let resData
      // 清空
      this.iframeHeight = 0
      const el = document.querySelector('#mailContent')
      setIframeInnerHtml(el, '')

      this.loading = true
      const query = {
        id: this.params.id
      }
      console.log(this.mailContInfo, 'mailContInfo - mailContInfo')
      let keyVal = `${this.Xquery.configId}-${this.Xquery.groupId}`
      this.mailContInfo[keyVal] = this.mailContInfo[keyVal] || {}
      const xVal= this.mailContInfo[keyVal][query.id]
      console.log(xVal,'xVal - 是否存在该条数据')
      if(xVal){
        resData = xVal
      }else{
        await getMailDetails(query).then(async res => {
          console.log('res - res', res)
          if (res.data.code === 200) {
            resData = res.data.data[0]
            console.log('resData - resData', resData)
            // const htmlStr = transEnterTextBr(MailContent.text)
            // 已读回执
          console.log(resData.mailBody.isReceipt,resData,'adasvcxgfsef')
        if (resData.mailBody.receipt === 1 && resData.mailBody.isReceipt === 0  && resData.mailBody.isSend === 1 && resData.mailBody.groupId == '1') {
          // if(this.mailBody.groupId == 1 && this.mailBody.receipt == 1 && this.mailBody.rend == 0 && this.mailBody.isReceipt == 0 && this.mailBody.isSend == 1) { 
        // if (mailBody.isReceipt === 0&&mailBody.receipt === 1) {
          const from = getMailStr(resData.mailBody.from)
          const myEmail = getMailStr(this.senderInfo.username)
          const subject = resData.mailBody.subject
          this.handleShowYdhzMsgbox(from, myEmail, subject)
        }
          }
        }).finally(() => {
          this.loading = false
        })
      }
      resData.MailExtendList = await this.handleGetMailFile(query)
      console.log(resData,'sadasqweqweqwe')
        this.loading = false
        const { mailBody, MailExtendList, MailRecipientList, MailContent } = resData

        const replacedData = replaceCIDImg(MailExtendList, MailContent.text, MailContent.textType, true, true, 'preview')
        console.log("替换的附件 replacedData",replacedData)
        console.log("获取邮件详情 resData",resData)
        this.form = {
          ...resData,
          // 替换附件
          MailExtendList: replacedData.multipartFiles
        }
        // 更新未读数量
        this.$emit('changeMailTotal')
        // 设置 iframe 内容
        setIframeInnerHtml(el, replacedData.content)
        this.timerd = setTimeout(() => {
          this.changeFrameHeight()
        }, 100)
        
        this.$emit("cacheFun", query.id)
    },
    // 拉取附件
    handleGetMailFile(query) {
      return new Promise((resolve, reject) => {
        getMailAccessory(query).then(res => {
          console.log('拉取的附件---- 接口 getMailAccessory ')
          if (res.data.code === 200) {
            resolve(res.data.data)
          }
        }).catch(e => {
          reject(e)
        })
      })
    },

    // 获取用户邮箱
    handleGetUserMail() {
      let query = {
        mailConfigId: this.mailConfigId
      }
      getSenderMail(query).then(res => {
        if (res.data.code === 200) {
          const { username, account } = res.data.data
          this.senderInfo = {
            account,
            username
          }
          this.handleGetMailDetails()
        }
      })
    },
    /**
     * 显示已读回执Msgbox
     * @param   to      {String}  接受人地址
     * @param   from    {String}  发送人地址(自己)
     * @param   subject {String}  主题
     * */
    handleShowYdhzMsgbox(to,from, subject) {

      let _this = this
      this.$msgbox({
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">发件人希望得到您的回执，是否发送？</span>
            </div>
           <div class="innerTip"></div>
          </div>
          `,
        dangerouslyUseHTMLString: true,
        // closeOnClickModal: false,
        customClass: 'customMsgBox',
        showCancelButton: true,
        confirmButtonText: '发送',
        confirmButtonClass: 'confirmBtn confirmButton',
        cancelButtonText: '不发送',
        cancelButtonClass: 'confirmBtn cancelButton',
        beforeClose: async (action, instance, done) => {
          console.log(action,'asdaweasc')
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            // instance.confirmButtonText = '执行中...'
            _this.handleSendYdhzMail(to,from, subject).then(result => {
              if(result) {
                done()
                instance.confirmButtonLoading = false
              }
            })
          } else {
            done()
          }

          // 确认 已读回执 状态
          const query = {
            id: this.params.id
          }
          updateIsReceipt(query).then(res => {
            //
          })
        }
      }).then(action => {
        // this.$message({
        //   type: 'info',
        //   message: 'action: ' + action
        // });
      }).catch(e => {
      })
    },
    // 发送已读回执mail
    handleSendYdhzMail(toStr, from, subject) {
      return new Promise((resolve, reject) => {
        const time = dayjs().format('YYYY-MM-DD HH:mm')
        const text = `<p>这是邮件收条, ${time} 发给 ${toStr}<${toStr}>,  主题为 ${subject} 的信件已被接收</p>
                      <br>
                      <br>
                      <p>此收条只表明收件人的计算机上曾显示过此邮件</p>`
        const to = [{ name: toStr, mail: toStr }]

        const mailData = {
          bcc: [],
          cc: [],
          configId: 4,
          from,
          isRespectively: 0,
          isTiming: 0,
          multipartFiles: [],
          receipt: 0,
          replyTo: "",
          sentDate: "",
          subject,
          text,
          textType: "TEXT/HTML; charset=utf-8",
          timing: "",
          to,
          toFbfsArr: [],
          urgent: 0,
          userId: 0
        }

        sendMail(mailData).then(res => {
          if (res.data.code === 200) {
            this.$message.success('已发送已读回执')
            resolve('success')
          } else {
            reject('error')
          }
        }).catch(e => {
          reject(e)
        })
      })
    },
    // 设置 iframe 高度
    changeFrameHeight() {
      this.$nextTick(() => {
        const ele = document.querySelector('#mailContent')
        const iframeBody = ele.contentWindow.document.body
        console.log(iframeBody.scrollHeight)

        // 监听点击链接 打开 操作
        const links = iframeBody.querySelectorAll('a')
        links.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault()
            openLink(link.href)
          })
        })
        this.iframeHeight = iframeBody.scrollHeight + 100
      })
    },
    // 返回
    handleGoBack() {
      this.$emit('changeRoute', { routerName: this.detailEntry })
    },
    // action回调
    actionCallBack(args) {
      this.$emit('changeRoute', args)
    },
    /**
     * @param id   {String} 上一封 upId， 下 一封 downId
     * */
    handleGotoNext(val) {
      // 获取当前邮件位置 -确定上一封/下一封
      let nowIdIndex = this.nowIndex()
      let valId = val === "next" ? nowIdIndex + 1 : nowIdIndex - 1
      if(valId >= 0 || valId < this.allMailId.length){
        this.$emit('changeRoute', { routerName: 'mailDetail', action: 'next', id:this.allMailId[valId] })
      }
    },
    // 回复
    handleFeedBack() {
      this.$emit('changeRoute', { routerName: 'writeMail', action: 'feedBack', id: '' })
    },
    // 撤回 dialog 隐现
    handleBackDialog(type) {
      console.log('type', type)
      if (type === 'open') {
        this.backDialog = true
      } else {
        this.backDialog = false
      }
    },
    // 当前位置
    nowIndex(){
      let nowIdIndex = this.allMailId.indexOf(this.params.id)
      return nowIdIndex
    },
    // 撤回 提交
    handleBackSubmit() {
      this.backDialog = false
    },
    // 时间转换
    timerFormat(dateStr) {
      let str = dayjs(dateStr).format('YYYY年MM月DD日 HH:mm')
      // str += ` （${formatToCNDateDay2(dayjs(dateStr).day())}）`
      return str
    },
    // 文件下载
    handleDownload(file) {
      handleTransUrlAndDownLoadFile(file.url)
    },
    // xss 过滤
    xssFilter(str) {
      return xss(str)
    }
  },
  watch: {
    'params': {
      handler(value) {
        this.handleGetMailDetails()
      }
    }
  },
  beforeDestroy(){
    clearTimeout(this.timerd)
    this.timerd = null
  }
}
</script>

<style lang="scss" scoped>
::v-deep.v-modal{
  width: 1000px !important;
}
.zhezhao{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  
}
.mail-info-row{
  position: relative;
  
    .fjTagBox{
      position: absolute;
      top: 24px;
      left: 60px;
      border: 1px solid #DEE0E3;
      box-shadow: 0px 0px 10px rgba(75, 129, 255, 0.1);
      opacity: 1;
      border-radius: 4px;
      z-index: 9999;
      background: white;
      padding: 10px;
      .fj-tag{
        display: flex;
        align-items: center;
        color: #646A73;
        font-size: 14px;
        padding: 6px 10px;
        border-radius: 6px;
        img{
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }
        &:hover{
          background: #F5F6F7;
        }
      }
    }
  .mail-info-detail{
    cursor: pointer;
    .accessoriesDownBox{
      height: 20px;
      border-radius: 20px;
      background: #F5F6F7;
      display: flex;
      align-items: center;
      .accessoriesDownBoxFlag{
        width: 12px;
        margin-left: 10px;
        margin-right: 8px;
      }
      .accessoriesDownBoxXajiao{
        margin-right: 10px;
        margin-left: 14px;
      }
    }
  }
}
.mail-content-container{
  background: white;
  margin-left: 10px;
  margin-right: 10px;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
}
.mail-header-container .mail-info .mail-info-row .mail-info-detail {
  color: #8F959E;
}
.mail-header-container{
  background: white;
  margin-left: 10px;
  margin-right: 10px;
  border-bottom: 1px solid #DEE0E3;
}
.mail-info-detail{
  color: #1F2329;
  display: inline-block;
}
.box_header{
  height: 52px;
  background: #FFFFFF;
  .box_header_top{
    background: #FBFBFC;
    width: 144px;
    height: 42px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    margin-top: 10px;
    margin-left: 18px;
    display: inline-block;
    // padding: 13px 0px 13px 0px;
    font-family: SourceHanSansCN-Normal;
    font-size: 16px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    float: left;
    img{
      width: 16px;
      height: 16px;
      margin-right: 10px;
    }
  }
}
</style>
