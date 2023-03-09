<template>
  <el-form class="login-form login-form-small"
           status-icon
           :rules="loginRules"
           ref="loginForm"
           style="padding: 0 30px;"
           size="mini"
           :model="loginForm"
           label-position="right"
           >
    <el-form-item label="邮箱地址" prop="username">
      <el-input size="small"
                @keyup.enter.native="handleLogin"
                v-model="loginForm.username"
                auto-complete="off"
                placeholder="请输入邮箱地址">
      </el-input>
    </el-form-item>
    <el-form-item :label="initMailAccountType === 'tengXunQiYe' ? '密码' : '授权码'" prop="password">
      <el-input size="small"
                @keyup.enter.native="handleLogin"
                :type="passwordType"
                v-model="loginForm.password"
                auto-complete="off"
                :placeholder="initMailAccountType === 'tengXunQiYe' ? '请输入密码' : '请输入授权码'">
      </el-input>
    </el-form-item>
    <el-form-item label="账户名称" prop="account">
      <el-input size="small"
                @keyup.enter.native="handleLogin"
                v-model="loginForm.account"
                auto-complete="off"
                maxlength="20"
                show-word-limit
                placeholder="请输入账户名称">
      </el-input>
    </el-form-item>
    <el-form-item label="账号状态" prop="account" v-if="showUseWay">
      <el-select v-model="loginForm.useWay" placeholder="请选择账号状态" style="width: 100%;">
        <el-option :label="item.label"
                   :value="item.value"
                   v-for="(item, index) in useWayOptions"
                   :key="'useWayOptions' + index"></el-option>
      </el-select>
    </el-form-item>
    <!-- <div class="form-line"></div> -->
    <el-form-item label="协议类型">
      <el-select v-model="loginForm.acceptProtocol" @change="selectChange" placeholder="请选择协议类型" style="width: 100%;">
        <el-option :label="item.label"
                   :value="item.value"
                   v-for="(item, index) in mailConfigTypes"
                   :key="'mailTypes' + index"></el-option>
      </el-select>
    </el-form-item>
    <el-row>
      <el-form-item label="POP服务器" v-if="loginForm.acceptProtocol === 'pop3'">
        <el-col :span="12">
          <el-input size="small"
          @keyup.enter.native="handleLogin"
          v-model="loginForm.acceptHost"
          auto-complete="off"
          style="width: 248px; margin-right: 10px;"
          placeholder="请输入服务器地址"></el-input>
        </el-col>
        <el-col :span="12">
          <el-checkbox v-model="loginForm.acceptSsl"
          :true-label="1"
          :false-label="0"
          style="margin-right: 16px;"
          @change="acceptPOP3SSLChange"
          :disabled="mailAccountType === 'jck'">ssl
          </el-checkbox>
          <!-- <span style="margin-right: 5px;">端口</span> -->
          <el-input size="small"
          style="width: 207px;"
          @keyup.enter.native="handleLogin"
          v-model="loginForm.acceptPort"
          auto-complete="off"
          placeholder="端口"></el-input>
        </el-col>
      </el-form-item>
    </el-row>
    <el-row>
      <el-form-item label="IMAP服务器" v-if="loginForm.acceptProtocol === 'imap'">
        <el-col :span="12">
          <el-input size="small"
          @keyup.enter.native="handleLogin"
          v-model="loginForm.acceptHost"
          auto-complete="off"
          style="width: 248px; margin-right: 10px;"
          placeholder="请输入服务器地址"></el-input>
        </el-col>
        <el-col :span="12">
          <el-checkbox v-model="loginForm.acceptSsl"
          :true-label="1"
          :false-label="0"
          @change="acceptIMAPSSLChange"
          style="margin-right: 16px;"
          :disabled="mailAccountType === 'jck'">ssl
          </el-checkbox>
          <!-- <span style="margin-right: 5px;">端口</span> -->
          <el-input size="small"
          @keyup.enter.native="handleLogin"
          v-model="loginForm.acceptPort"
          style="width: 207px;"
          auto-complete="off"
          placeholder="端口"></el-input>
        </el-col>
      </el-form-item>
    </el-row>
    <el-row>
      <el-form-item label="SMTP服务器">
        <el-col :span="12">
          <el-input size="small"
            @keyup.enter.native="handleLogin"
            v-model="loginForm.sendHost"
            style="width: 248px; margin-right: 10px;"
            auto-complete="off"
            placeholder="请输入服务器地址"></el-input>
        </el-col>
        <el-col :span="12">
          <el-checkbox v-model="loginForm.sendSsl"
            :true-label="1"
            :false-label="0"
            @change="sendSMTPSSLChange"
            style="margin-right: 16px;"
            :disabled="mailAccountType === 'jck'">ssl
          </el-checkbox>
          <!-- <span style="margin-right: 5px;">端口</span> -->
          <el-input size="small"
          @keyup.enter.native="handleLogin"
          v-model="loginForm.sendPort"
          auto-complete="off"
          style="width: 207px;"
          placeholder="端口"></el-input>
        </el-col>
      </el-form-item>
    </el-row>
    <div class="mail-login-form-footer flex-center box-bottom">
      <span class="dialog-header-right-text cursor" @click="handleGoToHelp"><img src="@/assets/img/mail/question.png" alt="">配置引导说明</span>
      <div class="mail-login-form-btnCancel cursor" @click="cancel" style="width:84px;height:32px;border: 1px solid #BBBFC4;background:white;">取消</div>
      <div class="mail-login-form-btn cursor" :loading="loading" @click="handleLogin" style="width:84px;height:32px;">确定</div>
    </div>
  </el-form>
</template>

<script>
import { saveMailConfig, updateConfig } from "@/api/mail"
import { validateEmail } from "@/utils/validate"
import { openLink } from "@/utils/pure";
import { config } from "@/const/dicData";

const initMail = localStorage.getItem('INITMAIL') || ''

const useWayOptions = [
  { label: '启用', value: 1 },
  { label: '关闭', value: 0 },
]

export default {
  name: "mailLogin",
  props: {
    // [add, edit]
    actionMode: {
      type: String,
      default: 'add'
    },
    initData: {
      type: Object,
      default: () => {}
    },
    // 账户类型
    initMailAccountType: {
      type: String,
      default: 'other'
    },
    // 是否显示状态
    showUseWay: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: "",
        account: '',
        mailType: '',
        useWay: 1,
        showPwd: false,
        // 接受协议（pop3/imap）
        acceptProtocol: 'imap',
        acceptHost: '',
        acceptSsl: 1,
        sendSsl: 1,
        acceptPort: 993,
        // 发送协议（SMTP）
        sendProtocol: 'smtp',
        sendHost: '',
        sendPort: 465,
      },
      useWayOptions: useWayOptions,
      mailConfigTypes: [
        { label: 'POP3', value: 'pop3' },
        { label: 'IMAP', value: 'imap' },
      ],
      checked: false,
      codeUrl: '',
      codeText: '',
      passwordType: "password",
      loading: false,
      mailList: [
        { img: require('@/assets/img/mail/jck.png'), w: '26px', h: '30px', type: 'jck', text: '进出口邮箱' },
        { img: require('@/assets/img/mail/qq.png'), w: '29px', h: '29px', type: 'qq', text: 'QQ邮箱' },
        { img: require('@/assets/img/mail/tx.png'), w: '29px', h: '20px', type: 'tx', text: '腾讯企业邮' },
        { img: require('@/assets/img/mail/163.png'), w: '29px', h: '15px', type: '163', text: '163邮箱' },
        { img: require('@/assets/img/mail/126.png'), w: '29px', h: '16px', type: '126', text: '126邮箱' },
        // { img: require('@/assets/img/mail/gmail.png'), w: '29px', h: '22px', type: 'gmail', text: 'Gmail' },
        // { img: require('@/assets/img/mail/outlook.png'), w: '29px', h: '25px', type: 'outlook', text: 'Outlook' },
        // { img: require('@/assets/img/mail/exchange.png'), w: '29px', h: '27px', type: 'exchange', text: 'Exchange' },
        { img: require('@/assets/img/mail/mail.png'), w: '29px', h: '26px', type: 'mail', text: '其他邮箱' },
      ],
      mailConfigDialog: false,
      mailConfigForm: {},
      mailAccountType: ''
    }
  },
  computed: {
    loginRules() {
      return {
        username: [
          { required: true, message: "请输入邮箱账号", trigger: "blur" },
          { validator: validateEmail, trigger: "blur" }
        ],
        password: [
          { required: true, message: this.initMailAccountType === 'tengXunQiYe' ? '请输入密码' : '请输入授权码', trigger: "blur" }
        ],
        mailTypes: [
          { required: true, message: "请选择邮箱类型", trigger: "blur" }
        ]
      }
    },
  },
  mounted() {
    // 初始化数据
    if(this.actionMode === 'edit') {
      this.loginForm = {...this.loginForm, ...this.initData}
      this.mailAccountType = this.loginForm.mailType
    } else {
      this.mailAccountType = this.initMailAccountType
      this.loginForm.mailType = this.initMailAccountType
      // tengXunQiYe 显示默认后台的值
      this.loginForm.username = this.initMailAccountType === 'tengXunQiYe' ? initMail : ''
      this.initHostConfig()

      // 新增, jck不显示ssl
      if(this.mailAccountType === 'jck') {
        this.loginForm.acceptSsl = 0
        this.acceptPOP3SSLChange(false)
        this.acceptIMAPSSLChange(false)
        this.loginForm.sendSsl = 0
        this.sendSMTPSSLChange(false)
      }
    }
  },
  methods: {
    // 帮助
    handleGoToHelp() {
      openLink(config.mailHelpPage)
    },
    cancel(){
      this.$emit('success')
    },
    // 初始化host
    initHostConfig() {
      const mailAccountType = this.mailAccountType
      const {acceptProtocol, sendProtocol} = this.loginForm
      this.loginForm.acceptHost = this.getFormatMailConfig(mailAccountType, acceptProtocol).host
      this.loginForm.sendHost = this.getFormatMailConfig(mailAccountType, sendProtocol).host
    },
    showPassword() {
      this.passwordType === ''
          ? (this.passwordType = 'password')
          : (this.passwordType = '')
    },
    // 选中item
    handleSelectItem(item) {
      this.mailConfigDialog = true
    },
    // 获取转换参数
    getFormatMailConfig(mailType, protocol) {
      protocol = protocol.toLowerCase()
      console.log('mailType', mailType)
      let resData = {
        config: [
          {
            "host": "",
            "port": 465,
            "protocol": "pop3",
            "useWay": 1
          },
          {
            "host": "",
            "port": 465,
            "protocol": "smtp",
            "useWay": 1
          },
          {
            "host": "",
            "port": 993,
            "protocol": "imap",
            "useWay": 1
          }
        ],
        mailTypes: 'other'
      }
      switch (mailType) {
        case "jck":
          resData = {
            config: [
              {
                "host": "mail.cguarantee.com",
                "port": 465,
                "protocol": "pop3",
                "useWay": 1
              },
              {
                "host": "mail.cguarantee.com",
                "port": 465,
                "protocol": "smtp",
                "useWay": 1
              },
              {
                "host": "mail.cguarantee.com",
                "port": 993,
                "protocol": "imap",
                "useWay": 1
              }
            ],
            mailTypes: 'jck'
          }
          break
        case "tengXunQQ":
          resData = {
            config: [
              {
                "host": "pop.qq.com",
                "port": 465,
                "protocol": "pop3",
                "useWay": 1
              },
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
                "host": "pop.exmail.qq.com",
                "port": 465,
                "protocol": "pop3",
                "useWay": 1
              },
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
                "host": "pop.163.com",
                "port": 465,
                "protocol": "pop3",
                "useWay": 1
              },
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
                "host": "pop.126.com",
                "port": 465,
                "protocol": "pop3",
                "useWay": 1
              },
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
      const config = resData.config.filter(item => item.protocol === protocol)
      if(config.length) {
        return config[0]
      }
      return resData
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const mailType = this.loginForm.mailTypes
          const mailAccountType = this.mailAccountType
          const {acceptProtocol, sendProtocol} = this.loginForm

          const data = {
            ...this.loginForm,
            mailTypes: mailType,
            // config: [
            //   this.getFormatMailConfig(mailAccountType, acceptProtocol),
            //   this.getFormatMailConfig(mailAccountType, sendProtocol),
            // ],
            username: this.loginForm.username,
            password: this.loginForm.password
          }
          const requestApi = this.actionMode === 'add' ? saveMailConfig : updateConfig
          const successText = this.actionMode === 'add' ? '添加成功' : '修改成功'
          requestApi(data).then(res => {
            if (res.data.code === 200) {
              this.$message.success(successText)
              this.$emit('success')
            }else{
              this.$message.warning(res.data.msg)
            }
          }).finally(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    handleMailConfigDialogCancel() {
      this.mailConfigDialog = false
    },
    selectChange(value) {
      if (value === 'pop3') {
        this.loginForm.acceptSsl = 0
        this.acceptPOP3SSLChange(false)
      } else if (value === 'imap') {
        this.loginForm.acceptSsl = 0
        this.acceptIMAPSSLChange(false)
      }
      this.loginForm.sendSsl = 0
      this.sendSMTPSSLChange(false)
      this.initHostConfig()
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
    }
  }
}
</script>

<style lang="scss" scoped>
.box-bottom{
  justify-content: flex-end;
  position: relative;
}
</style>
