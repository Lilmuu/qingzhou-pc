<!--忘记密码-->
<template>
  <div class="login-weaper animated bounceInDown">
    <div id="forgetPwd">
      <div class="header-row">
        <div style="display: flex;align-items: center;">
          <img class="img" src="@/assets/img/login/logo.png" style="width: 60px;"/>
          <span style="color: #222222; font-size: 18px; margin-left: 10px; margin-right: 5px;">轻舟</span>
          <Tip></Tip>
          <span style="margin-left: 5px; font-size: 14px;">重置密码</span>
        </div>
        <i class="el-icon-close preBtn" @click="handleGoToForgetPwd"></i>
      </div>
      <div style="margin-top: 10px; padding: 30px;">
        <el-steps :active="activeStep">
          <el-step title="手机验证" icon="el-icon-edit">
            <div slot="icon">
              <div class="step-container">
                <img src="@/assets/img/forgetpwd/c_active.png" style="width: 70px;" v-if="activeStep === 0">
                <img src="@/assets/img/forgetpwd/c.png" style="width: 70px;" v-else>
                <img src="@/assets/img/forgetpwd/phone.png" v-if="activeStep === 0" style="width: 16px; position: absolute; left: 28px; top: 23px;">
                <img src="@/assets/img/forgetpwd/phone_fill.png" v-else style="width: 16px; position: absolute; left: 28px; top: 23px;">
                </div>
            </div>
          </el-step>
          <el-step title="设置密码" icon="el-icon-upload">
            <div slot="icon">
              <div class="step-container">
                <img src="@/assets/img/forgetpwd/c_active.png" style="width: 70px;" v-if="activeStep === 1">
                <img src="@/assets/img/forgetpwd/c.png" style="width: 70px;" v-else>
                <img src="@/assets/img/forgetpwd/lock.png" v-if="activeStep === 1" style="width: 26px; position: absolute; left: 23px; top: 20px;">
                <img src="@/assets/img/forgetpwd/lock_fill.png" v-else style="width: 26px; position: absolute; left: 23px; top: 20px;">
              </div>
            </div>
          </el-step>
          <el-step title="重置成功" icon="el-icon-picture">
            <div slot="icon">
              <div class="step-container">
                <img src="@/assets/img/forgetpwd/c_active.png" style="width: 70px;" v-if="activeStep === 2">
                <img src="@/assets/img/forgetpwd/c.png" style="width: 70px;" v-else>
                <img src="@/assets/img/forgetpwd/reset.png" v-if="activeStep === 2" style="width: 26px; position: absolute; left: 23px; top: 21px;">
                <img src="@/assets/img/forgetpwd/reset_fill.png" v-else style="width: 26px; position: absolute; left: 23px; top: 21px;">
              </div>
            </div>
          </el-step>
        </el-steps>
      </div>
      <!--  手机验证 NOTE: 必须使用 v-show, 不然无法进行表单验证   -->
      <el-form v-show="activeStep === 0"
               label-position="right"
               label-width="140px"
               ref="form1"
               style="width: 55%; margin: 0 auto;"
               :model="form1"
               :rules="form1Rules">
        <el-form-item label="手机号：" prop="phone">
          <el-input v-model="form1.phone" placeholder="请输入手机号">
            <img slot="prefix"
                 src="@/assets/img/login/phone.png"
                 style="width: 16px;height: 16px;padding-left: 5px;">
          </el-input>
        </el-form-item>
        <el-form-item class="qrcodeLabel" label="手机验证码：" prop="code">
          <el-input v-model="form1.code" placeholder="请输入手机验证码">
            <img slot="prefix" style="width: 18px; padding-left: 5px;" src="@/assets/img/login/pwd.png">
            <template slot="append">
              <!-- <el-button :disabled="count > 0"  type="primary" @click="handleSendCode" class="qrcodeBtn">{{ count > 0 ? `${count}s` : `获取验证码` }}</el-button> -->
              <el-button :disabled="isVerification"  type="primary" @click="handleSendCode" class="next-btn">{{ count > 0 ? `${count}s` : `获取验证码` }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="imgCode" label="图形验证码：">
          <el-row :span="24">
            <el-col
              :span="16"
              style="padding-right: 20px;"
            >
              <el-input
                size="small"
                :maxlength="4"
                v-model="form1.imgCode"
                auto-complete="off"
                placeholder="请输图形验证码">
                <img slot="prefix" style="width: 18px; padding-left: 5px;" src="@/assets/img/forgetpwd/pwd.png">
              </el-input>
            </el-col>
            <el-col :span="8">
              <div class="login-code">
                <img
                  :src="codeUrl"
                  class="login-code-img"
                  @click="refreshCode"
                />
                <span v-if="ISDEV">{{ codeText }}</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button :disabled="!isPhoneCodePass" type="primary" @click="handleNext(0)" class="next-btn" style="width: 100%;">下一步</el-button>
        </el-form-item>
      </el-form>
      <!--  设置密码    -->
      <el-form v-show="activeStep === 1"
               label-position="right"
               label-width="140px"
               ref="form2"
               style="width: 55%; margin: 0 auto;"
               :model="form2"
               :rules="form2Rules">
        <el-form-item label="请输入新密码：" prop="newPassword">
          <el-input v-model="form2.newPassword" minlength="6" maxlength="18" type="password" placeholder="请输入新密码">
            <img slot="prefix"
                 src="@/assets/img/login/phone.png"
                 style="width: 16px;height: 16px;padding-left: 5px;">
          </el-input>
        </el-form-item>
        <el-form-item label="再次输入新密码：" prop="newPasswordRe">
          <el-input v-model="form2.newPasswordRe" minlength="6" maxlength="18" type="password" placeholder="再次输入新密码">
            <img slot="prefix"
                 src="@/assets/img/login/phone.png"
                 style="width: 16px;height: 16px;padding-left: 5px;">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="f_btn next-btn" type="primary" @click="handleNext(1)" style="width: 100%;">重置</el-button>
        </el-form-item>
      </el-form>
      <!--  重置成功    -->
      <div class="flex-center" style="flex-direction: column;" v-show="activeStep === 2">
        <div class="flex-center">
          <img slot="prefix" style="width: 165px;" src="@/assets/img/forgetpwd/reset_success.png">
        </div>
        <span style="color: #93ABD7; margin-top: 20px;">密码重置成功，请您点击登录</span>
        <el-button class="f_btn next-btn" type="primary" @click="handleGoToForgetLogin" style="margin-top: 40px;">登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Tip from "@/components/Tip/Tip"
import verification from '@/utils/verification-code'
import { isPhone } from "@/utils/validate"
import { getResetPhoneCode, resetPwd } from "@/api/user"
import { encryption, randomLenNum } from "@/utils"
var validatorPhone = function (rule, value, callback) {
      if (value === '') {
        callback(new Error('手机号不能为空'))
      } else if (!/^1\d{10}$/.test(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
export default {
  name: "forgetPwd",
  components: {
    Tip
  },
  watch: {
    "form1.phone"(val) {
      let phoneCodeVerification = /^[1][3,4,5,7,8][0-9]{9}$/;
      if(phoneCodeVerification.test(val)) {
        this.isVerification = false
      }else {
        this.isVerification = true
      }
    }
  },
  data() {
    return {
      // 是否为开发环境
      ISDEV: process.env.NODE_ENV === 'development',
      activeStep: 0,
      form1: {
        phone: '',
        code: '', // 短信验证码
        imgCode: ''
      },
      form2: {
        newPassword: '',
        newPasswordRe: ''
      },
      codeUrl: '',
      codeText: '',
      timer: null,
      isPhoneCodePass: false, // 是否发送短信验证码通过
      isVerification: true,// 是否禁用获取验证码按钮
      count: 0,
      randomStr: '',
      form1Rules: {
        phone: [
          { required: true, validator: validatorPhone, trigger: 'blur' }
        ],
        code: [
          { required: true, message: "请输入短信验证码", trigger: "blur" }
        ],
        imgCode: [
          { required: true, message: "请输入图形验证码", trigger: "blur" }
        ]
      },
      form2Rules: {
        newPassword: [
          { required: true, message: "请输入密码", trigger: "blur" }
        ],
        newPasswordRe: [
          { required: true, message: "请输入确认密码", trigger: "blur" }
        ]
      }
    }
  },
  mounted() {
    this.refreshCode()
  },
  methods: {
    // 切换tab
    handleGoToForgetPwd() {
      this.form1 = {
        phone: '',
        code: '',
        imgCode: ''
      }
      this.form2 = {
        newPassword: '',
        newPasswordRe: ''
      }
      this.isPhoneCodePass = false
      this.activeStep = 0
      this.isPhoneCodePass = false
      this.count = 0
      this.refreshCode()
      this.$emit('changeTab', 'pre')
    },
    // 切换tab
    handleGoToForgetLogin() {
      this.form1 = {
        phone: '',
        code: '',
        imgCode: ''
      }
      this.form2 = {
        newPassword: '',
        newPasswordRe: ''
      }
      this.isPhoneCodePass = false
      this.activeStep = 0
      this.isPhoneCodePass = false
      this.count = 0
      this.refreshCode()
      this.$emit('changeTab', 'prev')
    },
    // 发送验证码
    handleSendCode() {
      if (!isPhone(this.form1.phone)) {
        this.$message.error('请输入正确的手机号')
        return
      }
      const randomStr = randomLenNum(6, true)
      this.randomStr = randomStr
      getResetPhoneCode(this.form1.phone, randomStr).then(res => {
        if (res.data.code === 0) {
          this.isPhoneCodePass = true

          // 倒计时
          const TIME_COUNT = 60
          if (!this.timer) {
            this.count = TIME_COUNT
            this.timer = setInterval(() => {
              if (this.count > 0 && this.count <= TIME_COUNT) {
                this.count--
              } else {
                clearInterval(this.timer)
                this.timer = null
              }
            }, 1000)
          }
        }
      })
    },
    // 下一步
    handleNext(step) {
      // 图形验证码检验
      if (step === 0) {
        this.$refs.form1.validate(valid => {
          if (valid) {
            if (!this.isPhoneCodePass) {
              this.$message.error('请先获取短信验证码')
              return
            }
            if (this.form1.imgCode.toLowerCase() !== this.codeText.toLowerCase()) {
              this.$message.error('图形验证码不正确')
              return
            }
            this.activeStep++
          }
        })
      } else if (step === 1) {
        if(this.form2.newPassword.length < 6 || this.form2.newPassword.length > 18) {
          this.$message.error('请输入长度在6-18位之间的密码')
          return
        }
        this.$refs.form2.validate(valid => {
          if (valid) {
            console.log('form2', this.form2)
            if (this.form2.newPassword !== this.form2.newPasswordRe) {
              this.$message.error('新密码与再次确认新密码不一致')
              return
            }
            let obj = {
              code: this.form1.code,
              phone: this.form1.phone,
              randomCode: this.randomStr,
              password: this.form2.newPassword,
              rePassword: this.form2.newPassword,
            }
            let objStr = JSON.stringify(obj)
            let data = {
              obj: objStr
            }
            // obj = encryption({
            //   data: obj,
            //   key: "ZnJhbWVmcmFtZQ==",
            //   param: ["password"]
            // });
            // obj = encryption({
            //   data: obj,
            //   key: "ZnJhbWVmcmFtZQ==",
            //   param: ["repeatPassword"]
            // });
            // obj = encryption({
            //   data: obj,
            //   key: "ZnJhbWVmcmFtZQ==",
            //   param: ["repeatPassword"]
            // });
            data = encryption({
              data: data,
              key: "ZnJhbWVmcmFtZQ==",
              param: ["obj"]
            });
            const encryedStr = data.obj
            resetPwd(encryedStr).then(res => {
              if (res.data.code === 0) {
                this.activeStep++
              }
            })
          }
        })
      } else {
        if (this.activeStep++ > 2) this.activeStep = 0
      }
    },
    // 刷新验证码
    refreshCode() {
      const result = verification.create()
      this.codeText = result.code// 随机生成的验证码
      this.codeUrl = result.dataURL	// 验证码图片的 base64
    }
  }
}
</script>

<style lang="scss">
#forgetPwd {
  background: #FFFFFF;
  width: 100%;
  height: 500px;
  border-radius: 5px;
  overflow: hidden;
  padding: 15px;
  box-shadow: 0px 3px 10px 0px rgba(2, 55, 137, 0.1);
  .header-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(225, 222, 222, .4);
    padding-bottom: 20px;
    justify-content: space-between;
  }
  .step-container {
    position: relative;
    width: 70px;
    height: 70px;
  }
  .el-step__title {
    margin-left: -10px;
    color: #BFBFBF;
    font-weight: 500;
    font-size: 13px;
    padding-left: 6px;
  }
  .el-step__title.is-process {
    color: #93ABD7;
  }
  .el-step__head.is-finish {
    color: #93ABD7;
    border-color: #93ABD7;
  }
  .el-step__line {
    background-color: #93ABD7;
  }
  .success_container {
    width: 100px;
    height: 100px;
    background: #93ABD7;
    border-radius: 50px;
  }
  .f_btn {
    width: 327px;
  }
  .preBtn {
    font-size: 16px;
    color: #8f8f8f;
    cursor: pointer;
  }
  .next-btn {
    background: #174AA7!important;
    color: #fff;
    &:hover {
      background: #174AA7!important;
      color: #fff;
    }
  }
  .next-btn.is-disabled {
    background-color: #93ABD7!important;
    border-color: #93ABD7!important;
  }
  .qrcodeLabel {
    .el-input-group__append {
      border: none;
    }
  }
  .qrcodeBtn {
    background: #93ABD7;
    color: #fff;
    padding: 13px 20px!important;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
