<template>
  <div class="mail-login-container flex-center">
    <div class="mail-img">
      <img src="@/assets/img/mail/mail_login.png" alt="" class="full">
    </div>
    <div class="mail-box-shadow">
      <h3 class="mail-header-text">添加账户</h3>
      <div class="loginForm">
        <div class="mail-item flex-center cursor"
             @click="handleSelectItem(item)"
             v-for="(item, index) in mailList"
             :style="mailList.length-1==index?'margin-bottom:0':''"
             :key="'mailList' + index">
          <div class="mailList-item-row">
            <img :src="item.img" :style="`width: ${item.w};height: ${item.h};`" alt="">
            <span class="mail-item-text" v-if="item.text">{{ item.text }}</span>
          </div>
        </div>
      </div>
    </div>
    <el-dialog append-to-body
               width="600px"
               style="margin-left:66vh"
               :visible.sync='mailConfigDialog'
               :before-close="handleMailConfigDialogCancel"
               class="add-mail-dialog"
               :show-close="true"
               :modal="false"
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row" style="position: relative">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title">账户设置</span>
      </div>
      <mailLoginForm :initMailAccountType="mailAccountType"
                     @success="emitSuccess"
                     v-if="mailConfigDialog" />
    </el-dialog>
  </div>
</template>

<script>
import verification from "@/utils/verification-code"
import { saveMailConfig } from "@/api/mail"
import { validateEmail } from "@/utils/validate"
import mailLoginForm from "@/views/mail/mailLoginForm"
import { openLink } from "@/utils/pure";
import { config } from "@/const/dicData";

export default {
  name: "mailLogin",
  components: {
    mailLoginForm
  },
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
        account: '',
        mailType: 'wangYi',
        showPwd: false,
        // 接受协议（POP/IMAP）
        acceptProtocol: 'POP3',
        acceptHost: '',
        acceptHostSSL: false,
        sendHostSSL: false,
        acceptPort: 110,
        // 发送协议（SMTP）
        sendProtocol: 'SMTP',
        sendHost: '',
        sendPort: 25,
      },
      // 选中邮箱类型
      mailAccountType: '',
      mailTypes: [
        { label: '腾讯QQ邮箱', value: 'tengXunQQ' },
        { label: '腾讯企业邮箱', value: 'tengXunQiYe ' },
        { label: '网易163邮箱', value: 'wangYi' }
      ],
      mailConfigTypes: [
        { label: 'POP3', value: 'POP3' },
        { label: 'IMAP', value: 'IMAP' },
      ],
      checked: false,
      codeUrl: '',
      codeText: '',
      loginRules: {
        username: [
          { required: true, message: "请输入邮箱账号", trigger: "blur" },
          { validator: validateEmail, trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入授权码", trigger: "blur" }
        ],
        mailTypes: [
          { required: true, message: "请选择邮箱类型", trigger: "blur" }
        ]
      },
      passwordType: "password",
      mailList: [
        {img: require('@/assets/img/mail/jck.png'),  w: '26px', h: '30px', type: 'jck', text: '进出口邮箱'},
        {img: require('@/assets/img/mail/tx.png'), w: '29px', h: '20px', type: 'tengXunQiYe', text: '腾讯企业邮'},
        {img: require('@/assets/img/mail/qq.png'),  w: '29px', h: '29px', type: 'tengXunQQ', text: 'QQ邮箱'},
        {img: require('@/assets/img/mail/163.png'),  w: '29px', h: '15px', type: 'wangYi', text: '163邮箱'},
        {img: require('@/assets/img/mail/126.png'),  w: '29px', h: '16px', type: '126', text: '126邮箱'},
        // {img: require('@/assets/img/mail/gmail.png'),  w: '29px', h: '22px', type: 'gmail', text: 'Gmail'},
        // {img: require('@/assets/img/mail/outlook.png'),  w: '29px', h: '25px', type: 'outlook', text: 'Outlook'},
        // {img: require('@/assets/img/mail/exchange.png'),  w: '29px', h: '27px', type: 'exchange', text: 'Exchange'},
        {img: require('@/assets/img/mail/mail.png'),  w: '29px', h: '26px', type: 'other', text: '其他邮箱'},
      ],
      mailConfigDialog: false,
      mailConfigForm: {

      }
    }
  },
  mounted() {
    this.refreshCode()
  },
  methods: {
    showPassword() {
      this.passwordType === ''
        ? (this.passwordType = 'password')
        : (this.passwordType = '')
    },
    // 选中item
    handleSelectItem(item) {
      this.mailAccountType = item.type
      this.mailConfigDialog = true
    },
    handleGoToForgetPwd() {
      this.$emit('changeTab', 'next')
    },
    // 转换参数
    formatMailConfig() {
      const mailType = this.loginForm.mailTypes
      let resData = {
        config: {
          "host": "string",
          "port": 0,
          "protocol": "string",
          "useWay": 0
        },
        mailTypes: 'other'
      }
      switch (mailType) {
        // bdczhcdargaceaah
        case "tengXunQQ":
          resData = {
            config: [
              {
                "host": "smtp.qq.com",
                "port": 465,
                "protocol": "smtp",
                "useWay": 1
              },
              {
                "host": "imap.qq.com",
                "port": 993,
                "protocol": "imap",
                "useWay": 1
              }
            ],
            mailTypes: 'tengXunQQ'
          }
          break
        case "tengXunQiYe":
          resData = {
            config: [
              {
                "host": "smtp.exmail.qq.com",
                "port": 465,
                "protocol": "smtp",
                "useWay": 1
              },
              {
                "host": "imap.exmail.qq.com",
                "port": 993,
                "protocol": "imap",
                "useWay": 1
              }
            ],
            mailTypes: 'tengXunQiYe'
          }
          break
        case "wangYi":
          resData = {
            config: [
              {
                "host": "smtp.163.com",
                "port": 465,
                "protocol": "smtp",
                "useWay": 1
              },
              {
                "host": "imap.163.com",
                "port": 993,
                "protocol": "imap",
                "useWay": 1
              }
            ],
            mailTypes: 'wangYi'
          }
          break
        case "126":
          resData = {
            config: [
              {
                "host": "smtp.126.com",
                "port": 465,
                "protocol": "smtp",
                "useWay": 1
              },
              {
                "host": "imap.126.com",
                "port": 993,
                "protocol": "imap",
                "useWay": 1
              }
            ],
            mailTypes: '126'
          }
          break
      }
      return resData
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          const data = {
            ...this.loginForm
          }
          saveMailConfig(data).then(res => {
            if (res.data.code === 200) {
              const configId = res.data.data[0].id
              this.$store.dispatch('SetMailConfigId', configId)
              this.$emit('success')
            }
          })
        }
      })
    },
    // 帮助
    handleGoToHelp() {
      openLink(config.mailHelpPage)
    },
    refreshCode() {
      const result = verification.create()
      this.codeText = result.code// 随机生成的验证码
      this.codeUrl = result.dataURL	// 验证码图片的 base64
    },
    handleMailConfigDialogCancel() {
      this.mailConfigDialog = false
    },
    handleByLogin() {
      this.$router.push('/')
    },
    selectChange(value) {
      if(value === 'POP3') {
        this.loginForm.acceptHostSSL = false
        this.acceptPOP3SSLChange(false)
      } else if(value === 'IMAP') {
        this.loginForm.acceptHostSSL = false
        this.acceptIMAPSSLChange(false)
      }
      this.loginForm.sendHostSSL = false
      this.sendSMTPSSLChange(false)
    },
    // POP3 ssl
    acceptPOP3SSLChange(value) {
      this.loginForm.acceptPort = value ? 995 : 110
    },
    // IMAP ssl
    acceptIMAPSSLChange(value) {
      this.loginForm.acceptPort = value ? 993 : 143
    },
    // SMTP ssl
    sendSMTPSSLChange(value) {
      this.loginForm.sendPort = value ? 465 : 25
    },
    emitSuccess() {
      this.mailConfigDialog = false
      this.$emit('success')
    }
  }
}
</script>

<style lang="scss" scoped>
.add-mail-dialog{

  .el-dialog__wrapper{
    // background: white;
    left: 80px;
    top: 44px;
    border-radius: 0.63rem 0 0 0;
  }
  ::v-deep.el-dialog{
    font-family: SourceHanSansCN-Normal;
    box-shadow: 0px 0px 8px rgba(31, 35, 38, 0.08) !important;
    border-radius: 10px !important;
    .el-dialog__header{
      background: #FFFFFF;
      .el-dialog__title{
        font-size: 16px;
      }
    }
  }
}
.mail-login-container{
  background: #FAFCFD;
}
::v-deep.mail-login-container .loginForm .mail-item .mailList-item-row{
  width: 100%;
  padding-left: 120px;
}

</style>
