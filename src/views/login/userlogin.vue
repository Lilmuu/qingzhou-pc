<template>
  <el-form class="login-form"
      :rules="loginRules"
      ref="loginForm"
      :model="loginForm"
      label-width="240">
    <el-form-item prop="username">
      <el-input
        @keyup.enter.native="handleLogin"
        v-model="loginForm.username"
        placeholder="请输入手机号">
        <img slot="prefix" src="@/assets/img/login/phone.png" class="ipt-ico">
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        @keyup.enter.native="handleLogin"
        :type="passwordType"
        :clearable="true"
        v-model="loginForm.password"
        placeholder="请输入密码">
        <img slot="prefix" class="ipt-ico" src="@/assets/img/login/pwd.png">
          <i  slot="suffix" class="login__pwd-ico el-icon-view el-input__icon" :class="[ showPwd ? 'show-ico': '' ]"  @click="showPassword"></i>
      </el-input>
    </el-form-item>
    <!--  登录失败3次提醒  -->
    <el-form-item v-show="loginErrorCount >= 3">
      <el-row :span="24">
        <el-col :span="16"
                style="padding-right: 20px;">
          <el-input
            :maxlength="4"
            @keyup.enter.native="handleLogin"
            v-model="loginForm.imgCode"
            placeholder="请输图形验证码">
            <img slot="prefix" style="width: 18px; padding-left: 5px;" src="@/assets/img/forgetpwd/pwd.png">
          </el-input>
        </el-col>
        <el-col :span="8">
          <div class="login-code">
            <img :src="codeUrl" class="login-code-img" @click="refreshCode "/>
          </div>
        </el-col>
      </el-row>
    </el-form-item>
    <div class="forgot-box">
      <div @click="handleGoToForgetPwd" class="forget_pwd">忘记密码</div>
    </div>
    <el-form-item>
      <el-button type="primary"
        size="small"
        id="loginButton"
        :loading="loading"
        @click.native.prevent="handleLogin"
        @keyup.tab.native="()=>{return false}"
        :class="{'btn-blue': btnBlue}"
        class="login-submit">{{ loading ? '登录中' : '立即登录' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import verification from "@/utils/verification-code"
import {config} from "@/const/dicData"

export default {
  name: "userlogin",
  data() {
    return {
      loginForm: {
        randomStr: '',
        username: "",
        password: "",
        type: 1,
        showPwd: false,
        code: "",
        redomStr: "",
        userType: 1,
        imgCode: '',
        company: config.tenantId
      },
      checked: false,
      codeUrl: '',
      // 登录错误次数，超过3次后开启图像验证
      loginErrorCount: 0,
      codeText: '',
      loginRules: {
        username: [
          {required: true, message: "请输入用户名", trigger: "blur"}
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {min: 6, message: "密码长度最少为6位", trigger: "blur"}
        ]
      },
      codeImgSrc: '',
      passwordType: "password",
      loading: false,
      companyOptions: [],
      showPwd: false
    }
  },
  computed: {
    btnBlue() {
      return this.loginForm.username != "" && this.loginForm.password != ""
    }
  },
  mounted() {
    this.getTenantList()
    this.refreshCode()
    // 阻止tab事件，防止tab切换到忘记密码页面
    let dom = document.getElementById("loginButton");
    dom.addEventListener("keydown", (event) => {
      if (event.keyCode === 9) {
        event.preventDefault();
      }
    });
  },
  methods: {
    showPassword() {
      this.showPwd = !this.showPwd;
      console.log(this.showPwd);
      this.passwordType === ''
        ? (this.passwordType = 'password')
        : (this.passwordType = '')
    },
    handleGoToForgetPwd() {
      this.$emit('changeTab', 'next')
    },
    // 获取所有租户
    getTenantList() {
      this.$store.commit("SET_TENANTId", config.tenantId);
    },
    handleLogin() {
      // 登录错误次数，超过3次后开启图像验证
      if (this.loginErrorCount >= 3) {
        if (this.loginForm.imgCode.length !== 4) {
          this.$message.error('请输入正确的验证码')
          return
        }
        if (this.loginForm.imgCode.toLowerCase() !== this.codeText.toLowerCase()) {
          this.$message.error('图形验证码不正确')
          return
        }
      }
      this.$refs.loginForm.validate(valid => {
        if (valid && !this.loading) {
          this.loading = true
          const form = {
            code: this.loginForm.code,
            company: config.tenantId,
            loginType: "namepass",
            namecode: this.loginForm.code,
            password: this.loginForm.password,
            randomStr: '',
            username: this.loginForm.username,
          }
          this.$store.dispatch('LoginByUsername', form)
            .then(() => {
              this.loginErrorCount = 0
              sessionStorage.setItem('loginStatus', true)
              this.$router.push({path: '/'})
            }).catch(() => {
              this.loginErrorCount++
              this.loading = false
            })
            .finally(() => {
              setTimeout(()=>{
                this.loading = false
              }, 2000);
            })
            
        } else {
          return false
        }
      })
    },
    refreshCode() {
      const result = verification.create()
      this.codeText = result.code// 随机生成的验证码
      this.codeUrl = result.dataURL	// 验证码图片的 base64
    },
    handleByLogin() {
      this.$router.push('/')
    }
  }
}
</script>

<style>
</style>
