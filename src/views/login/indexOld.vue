<!--登录页面-->
<template>
<!--  <div id="login" :class="carouselIndex === 0 ? 'login-container login_bg' : 'login-container forget_pwd_bg'">-->
  <div id="login" class="login-container login_bg">
    <Navbar style="width: 100%; position: absolute; top: 0; left: 0; right: 0;z-index:999999;" :showBg="false" />
    <div class="app-info">
      <img class="img" style="width: 300px;" src="@/assets/img/login/logo.png"/>
<!--      <p class="title">{{ title }}</p>-->
<!--      <p class="version">{{ version }}</p>-->
    </div>
    <el-carousel ref="carousel"
                 direction="horizontal"
                 :autoplay="false"
                 indicator-position="none"
                 height="540px"
                 arrow="never"
                 style="width: 100%;">
      <!--登录-->
      <el-carousel-item>
        <div class="login-weaper animated bounceInDown">
          <div class="login-border">
<!--            <img @click="handleChangeLogin" class="qrcode_half" src="@/assets/img/login/qrcode_half.png"-->
<!--                 v-if="activeName === 'user'"/>-->
            <div @click="handleChangeLogin">
              <img src="@/assets/img/login/entry.png" class="qrcode_half" alt="">
              <img src="@/assets/img/login/qrcode2.png" class="qrcode_half"
                   style="width: 20px; right: 7px; top: 9px;" alt=""
                   v-if="activeName === 'user'">
              <img src="@/assets/img/login/phone_entry.png"
                   class="qrcode_half"
                   style="width: 16px;right: 9px;top: 6px;" alt=""
                   v-else>
            </div>
            <!-- 账号登录-->
            <div class="login-main" v-show="activeName === 'user'">
              <h3 style="color: #174AA7; text-align: center;margin-top: 40px; letter-spacing: 3px; margin-bottom: 35px; font-size: 18px;">手机登录</h3>
              <userLogin @changeTab="changeTab"></userLogin>
            </div>
            <!-- 扫描登录-->
            <div class="scan-main" v-show="activeName !== 'user'">
              <h3 style="color: #174AA7; text-align: center; letter-spacing: 3px; margin-top: 40px; font-size: 18px;">扫码登录</h3>
              <span style="color: #174AA7;">请使用轻舟移动端扫描二维码</span>
<!--              <canvas id="qrcodeCanvas" class="qrcode"></canvas>-->
               <img class="qrcode" :src="qrcodeImg"/>
            </div>
          </div>
        </div>
      </el-carousel-item>
      <!-- 忘记密码 -->
      <el-carousel-item>
        <forgetPwd style="margin-top: 30px;" @changeTab="changeTab"></forgetPwd>
      </el-carousel-item>
    </el-carousel>
    <img src="@/assets/img/login/login_bottom.png" class="login_bottom" alt="">
    <p class="app-version">{{ `©${year} V${version}` }}</p>
  </div>
</template>
<script>

import userLogin from "@/views/login/userlogin"
import forgetPwd from "@/views/login/forgetPwd"
import { getQRcode, scanLogin } from "@/api/login"
import Navbar from "@/views/layout/components/Navbar"
import pkg from '../../../package.json'

const year = (new Date()).getFullYear()

export default {
  name: "login",
  components: {
    userLogin,
    forgetPwd,
    Navbar
  },
  data() {
    return {
      activeName: "qrcode", // 登录方式 [user: '账号登录， qrcode： 二维码登录]
      imgSrc: "../../assets/img/login/logo.png",
      title: "轻舟",
      year: year,
      version: pkg.version,
      carouselIndex: 0,
      timer: null,
      qrcodeImg: ''
    }
  },
  mounted() {
    // 清空右下任务闪烁
    this.$electron.ipcRenderer.send("hide-notice")
    this.initQrcode()
  },
  methods: {
    // 初始化二维码
    initQrcode() {
      const _this = this
      getQRcode().then(res => {
        if (res.data.code === 0) {
          const qrcodeUid = res.data.data.appUUID
          _this.qrcodeUid = qrcodeUid
          this.qrcodeImg = res.data.data.imgData
          _this.loopQuery()

        }
      })
    },
    // 扫描轮查
    loopQuery() {
      const _this = this
      if (!this.timer) {
        this.timer = setInterval(() => {
          const data = {
            uuid: this.qrcodeUid
          }
          scanLogin(data).then(res => {
            if(res.data.code !== 0) {
              _this.$message.error('二维码已失效, 请重新刷新')
              _this.clearTimer()
              return
            }
            if (res.data.code === 0) {
              if(res.data.data.code === 0) {
                if(res.data.data.isLogin) {
                  _this.clearTimer()
                  const scanData = {
                    scanType: res.data.data.scanType,
                    userId: res.data.data.userId,
                    uuid: this.qrcodeUid
                  }
                  _this.$store.dispatch('ScanLogin', scanData)
                    .then(() => {
                      this.$message.success('登录成功')
                      _this.$router.push({ path: '/' })
                    })
                    .catch(e => {
                      _this.$message.error('登录失败')
                    })
                }
              } else {
                _this.clearTimer()
                _this.initQrcode()
              }
            }
          })
        }, 3000)
      }
    },
    // 登录切换方式
    handleChangeLogin() {
      this.activeName = this.activeName === 'user' ? 'qrcode' : 'user'
      this.$nextTick(() => {
        // 释放计时器
        this.clearTimer()
        if (this.activeName === 'qrcode') {
          this.initQrcode()
        }
      })
    },
    // 清空计时器
    clearTimer() {
      clearInterval(this.timer)
      this.timer = null
    },
    //
    changeTab(type) {
      if (type === 'next') {
        this.$refs.carousel.next()
        this.carouselIndex = 1
      } else {
        this.carouselIndex = 0
        this.$refs.carousel.prev()
      }
    }
  }
}
</script>

<style lang="scss">
.login_bg {
  background: url("../../assets/img/login/bg.png") no-repeat fixed top #fff;
  background-size: 100vw calc(100vh - 60px);
}
.forget_pwd_bg {
  background: url("../../assets/img/login/bg.png") 0 bottom repeat-x #fff;
}
#login {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  margin: 0 auto;
  // background: #f8f8f9;
  animation: animate-cloud 20s linear infinite;
  .login_bottom {
    width: 100%;
    height: 60px;
    position: absolute;
    bottom: -60px;
  }
  .el-input__prefix {
    left: 5px;
    transition: all .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-weaper {
    margin: 0 auto;
    // width: 1000px;
    width: 880px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 50px;
  }

  .login-left,
  .login-border {
    position: relative;
    min-height: 350px;
    align-items: center;
    display: flex;
  }

  .login-time {
    position: absolute;
    left: 25px;
    top: 25px;
    width: 100%;
    color: #fff;
    font-weight: 200;
    opacity: 0.9;
    font-size: 18px;
    overflow: hidden;
  }

  .login-border {
    background-color: #fff;
    width: 400px;
    box-sizing: border-box;
    border: 1px solid #174AA7;
    border-radius: 14px;
  }

  .login-main {
    margin: 0 auto;
    width: 75%;
    box-sizing: border-box;
  }
  .scan-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .login-main>h3 {
    margin-bottom: 20px;
  }

  .login-main>p {
    color: #76838f;
  }

  .login-title {
    color: #333;
    margin-bottom: 40px;
    font-weight: 500;
    font-size: 22px;
    text-align: center;
    letter-spacing: 4px;
  }

  .login-select {
    input {
      color: #333;
      font-size: 18px;
      font-weight: 400;
      border: none;
      text-align: center;
    }
  }

  .login-menu {
    margin-top: 40px;
    width: 100%;
    text-align: center;

    a {
      color: #999;
      font-size: 12px;
      margin: 0px 8px;
    }
  }

  .login-submit {
    width: 100%;
    height: 45px;
    border: 1px solid #174AA7;
    background: #174AA7;
    font-size: 18px;
    letter-spacing: 2px;
    font-weight: 300;
    // color: #409eff;
    color: #FFFFFF;
    cursor: pointer;
    margin-top: 30px;
    font-family: "neo";
    transition: 0.25s;
    margin-bottom: 30px;
  }

  .login-submit:hover {
    width: 100%;
    height: 45px;
    border: 1px solid #174AA7;
    background: #174AA7;
    font-size: 18px;
    letter-spacing: 2px;
    font-weight: 300;
    // color: #409eff;
    color: #FFFFFF;
    cursor: pointer;
    margin-top: 30px;
    font-family: "neo";
    transition: 0.25s;
  }

  .login-form {
    margin: 10px 0;

    i {
      color: #333;
    }

    .el-form-item__content {
      width: 100%;
    }

    .el-form-item {
      margin-bottom: 17px;
    }

    .el-input {
      border: 1px solid #DFDFDF;
      border-radius: 10px;

      input {
        padding-bottom: 10px;
        text-indent: 5px;
        background: transparent;
        border: none;
        border-radius: 0;
        color: #333;
      }

      .el-input__prefix {
        i {
          padding: 0 5px;
          font-size: 16px !important;
        }
      }
    }
    .tenant-select {
      .el-input input {
        padding-bottom: 0!important;
      }
    }
  }

  .login-code {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0 0 0 10px;
  }

  .login-code-img {
    border-radius: 10px;
    margin-top: 2px;
    width: 100px;
    height: 38px;
    background-color: #fdfdfd;
    border: 1px solid #f0f0f0;
    color: #333;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 5px;
    line-height: 38px;
    text-indent: 5px;
    text-align: center;
  }
  .qrcode_half {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 60px;
    cursor: pointer;
  }
  .qrcode {
    width: 250px!important;
    height: 250px!important;
    margin-bottom: 30px;
  }
  .forget_pwd {
    color: #999999;
    text-align: right;
    font-size: 12px;
    margin-top: 15px;
    cursor: pointer;
  }
}
</style>

