<!--忘记密码-->
<template>
  <div class="login-weaper animated bounceInDown">
    <div id="forgetPwd">
      <div class="header-row">
         <span class="header-tit">重置密码</span>
          <div class="header-step">
              <i class="step-ico" :class="stepList[activeStep].value"></i>
              <div class="step-tit">{{stepList[activeStep].label}}</div>
          </div>
      </div>

      <!--  手机验证 NOTE: 必须使用 v-show, 不然无法进行表单验证   -->
      <div class="form-container" v-show="activeStep === 0">
        <el-form
                 label-position="right"
                 ref="form1"
                 :model="form1"
                 :rules="form1Rules">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form1.phone" placeholder="请输入手机号"> </el-input>
          </el-form-item>
          <el-form-item class="qrcodeLabel" label="手机验证码" prop="code">
            <el-input v-model="form1.code" placeholder="请输入手机验证码">
              <div slot="suffix">
                <div class="get-code-btn" @click="handleSendCode">{{ count > 0 ? `${count}s` : `获取验证码` }}</div>
<!--                <el-button :disabled="isVerification"  type="primary" @click="handleSendCode" class="next-btn">{{ count > 0 ? `${count}s` : `获取验证码` }}</el-button>-->
              </div>
<!--              <template slot="append">-->

<!--                <el-button :disabled="isVerification"  type="primary" @click="handleSendCode" class="next-btn">{{ count > 0 ? `${count}s` : `获取验证码` }}</el-button>-->
<!--              </template>-->
            </el-input>
          </el-form-item>
          <el-form-item prop="imgCode" label="图形验证码">
            <el-row :span="24">
              <el-col :span="17">
                <el-input
                  :maxlength="4"
                  v-model="form1.imgCode"
                  placeholder="请输图形验证码">
                </el-input>
              </el-col>
              <el-col :span="7">
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
        </el-form>
        <div class="form-btn">
          <el-button :disabled="!isPhoneCodePass" type="primary" @click="handleNext(0)" class="next-btn" style="width: 100%;">下一步</el-button>
          <div class="forget__back-btn"  @click="handleGoToForgetLogin">返回登录</div>
        </div>
      </div>


      <!--  设置密码    -->
      <div class="form-container" v-show="activeStep === 1">
        <el-form
                 label-position="right"
                 ref="form2"
                 :model="form2"
                 :rules="form2Rules">
          <el-form-item label="请输入新密码：" prop="newPassword">
            <el-input v-model="form2.newPassword" minlength="6" maxlength="18" type="password" placeholder="请输入新密码">

            </el-input>
          </el-form-item>
          <el-form-item label="再次输入新密码：" prop="newPasswordRe">
            <el-input v-model="form2.newPasswordRe" minlength="6" maxlength="18" type="password" placeholder="再次输入新密码">

            </el-input>
          </el-form-item>
        </el-form>
        <div class="form-btn">
          <el-button class="f_btn next-btn" type="primary" @click="handleNext(1)" style="width: 100%;">重置</el-button>
          <div class="forget__back-btn" @click="handleGoToForgetLogin">返回登录</div>
        </div>
      </div>

      <!--  重置成功    -->
      <div class="form-container" v-show="activeStep === 2">
        <div class="flex-center success-box" style="flex-direction: column;" >
          <div class="flex-center">
            <img slot="prefix" style="width: 120px;" src="@/assets/img/login/success-bg.png">
          </div>
          <span class="success-words" >密码重置成功，请您点击登录</span>
        </div>
        <el-button class="next-btn" type="primary" @click="handleGoToForgetLogin" style="margin-top: 40px;">立即登录</el-button>
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
  computed: {

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
      },
      stepList: [
        {
          label: "手机验证",
          value: 'ico0'
        },
        {
          label: "设置密码",
          value: 'ico1'
        },
        {
          label: "重置成功",
          value: 'ico2'
        },
      ]
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 460px;
  min-height: 520px;
  padding: 25px 30px;
  background: #fff;
  box-shadow: 0px 0px 12px 1px rgba(31, 35, 38, 0.08);
  border-radius: 8px;
  .header-row {
     .header-tit {
       display: block;
       font-size: 16px;
       color: #404758;
       margin-bottom: 25px;
     }
      .header-step {
        display: flex;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #EFF0F1;
        .step-tit {
          margin-left: 10px;
          font-size: 14px;
          color: #3370FF;
        }
        .step-ico {
          width: 14px;
          height: 14px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
        }
        .ico0 {
          background-image: url("../../assets/img/login/phoneyz.png");
        }
        .ico1 {
          background-image: url("../../assets/img/login/mima.png");
        }
        .ico2 {
          background-image: url("../../assets/img/login/success.png");
        }
      }
  }

  // 修改密码  form表单的样式
  .form-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .form-btn {
      .forget__back-btn {
        margin-top: 15px;
        color: #646A73;
        font-size: 16px;
        text-align: center;
        cursor: pointer;
      }
    }
    .el-button--primary {
      border: 0
    }
    .el-form-item {
      display: flex;
      flex-direction: column;
      margin-top: 24px;
      margin-bottom: 0;
      .el-form-item__label {
        float: left;
        text-align: left;
        line-height: 30px;
      }
      .el-form-item__content {
        margin-left: 0!important;
      }
      .get-code-btn {
        display: inline-block;
        padding: 0 10px;
        line-height: 14px;
        border-left: 1px solid #DEE0E3;
        font-size: 14px;
        color:#8F959E;
        cursor: pointer;
      }
    }
    .success-box {
      flex: 1;
      .success-words {
        margin-top: 20px;
        font-size: 14px;
        color: #8F959E;
      }
    }
  }


  .preBtn {
    font-size: 16px;
    color: #8f8f8f;
    cursor: pointer;
  }
  .next-btn {
    width: 100%;
    height: 46px;
    background: #EFF0F1!important;
    color: #646A73;
    font-size: 16px;
    transition: all .2s linear;
    &:hover {
      color: #fff;
      background: #5B8CFF!important;
    }
    &:active {
      color: #fff;
      background: #3370FF!important;
    }
  }
  .next-btn.is-disabled {
    color: #fff;
    background-color: #93ABD7!important;
    border-color: #93ABD7!important;
  }
  .qrcodeLabel {
    .el-input-group__append {
      border: none;
    }
    .el-input--suffix .el-input__inner {
      padding-right: 100px;
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
