<!--登录页面-->
<template>
<!--  <div id="login" :class="carouselIndex === 0 ? 'login-container login_bg' : 'login-container forget_pwd_bg'">-->
  <div id="login" class="login-container login_bg">
    <Navbar style="width: 100%; position: absolute; top: 0; left: 0; right: 0;z-index:999999;" :showBg="false" />
    <div class="app-info">
      <img class="img"  src="@/assets/img/login/logo.png"/>
      <p class="tit">轻舟办公，高效协作</p>
      <p class="des">整合即时通讯、音视频会议、 </p>
      <p class="des">邮件、智能日历等功能，打造高效办公方式</p>
    </div>
    <el-carousel ref="carousel"
                 direction="horizontal"
                 :autoplay="false"
                 indicator-position="none"
                 height="620px"
                 arrow="never"
                 style="width: 100%;">
      <!--登录-->
      <el-carousel-item>
        <div class="login-weaper animated bounceInDown">
          <div class="login-border">
            <div @click="handleChangeLogin" class="right-top-icon">
              <div class="qrcode_half1" v-if="activeName === 'user'"></div>
              <div class="qrcode_half2" v-else></div>
            </div>
            <!-- 账号登录-->
            <div class="login-main" v-show="activeName === 'user'">
              <div class="login-tit">欢迎登录轻舟</div>
              <userLogin @changeTab="changeTab"></userLogin>
            </div>
            <!-- 扫描登录-->
            <div class="scan-main" v-show="activeName !== 'user'">
              <div class="scan-words">
                <div class="scan-tit">扫码登录</div>
                <span class="scan-des">请使用轻舟移动端扫描二维码</span>
              </div>
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
      qrcodeImg: '',
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
          // 没有网络 不发起请求
          if(!window.navigator.onLine) return
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
  background: url("../../assets/img/login/bg.png") no-repeat fixed center #fff;
  background-size: cover;
}
.forget_pwd_bg {
  background: url("../../assets/img/login/bg.png") 0 bottom repeat-x #fff;
}
#login {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  height: 100vh;
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
    left: 20px;
    transition: all .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-weaper {
    margin: 0 auto;
    width: 63.3vw;
    //width: 1080px;
    //width: 880px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 50px;
  }

  .login-left {
    position: relative;
    min-height: 350px;
    align-items: center;
    display: flex;
  }
  .login-border {
    position: relative;
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
    width: 460px;
    min-height: 520px;
    padding: 5px;
    background: #fff;
    box-shadow: 0px 0px 12px 1px rgba(31, 35, 38, 0.08);
    border-radius: 8px;
  }

  .login-main {
    margin: 0 auto;
    padding: 0 35px;
    box-sizing: border-box;
    .login-tit {
      margin: 68px 0 50px;
      color: #404758;
      font-size: 36px;
      font-weight: 600;
    }
  }
  .scan-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    .scan-words {
      margin: 77px auto 44px;
      text-align: center;
      .scan-tit {
        color: #404758;
        font-size: 36px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .scan-des {
        color: #8F959E;
        font-size: 14px;
      }
    }

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
      //border: none;
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
    border: 1px solid #EFF0F1;
    background: #EFF0F1;
    font-size: 18px;
    letter-spacing: 2px;
    font-weight: 300;
    color: #646A73;
    cursor: pointer;
    margin-top: 80px;
    font-family: "neo";
    transition: all 0.2s linear;
    margin-bottom: 30px;
    &:hover, 
    &:focus{
      background-color: #EFF0F1!important;
      color: #646A73!important;
      border: 1px solid #EFF0F1!important;
    }
  }
  .btn-blue{
    background-color: #3370FF;
    color: #fff;
    &:hover, 
    &:focus{
      background-color: #3370FF!important;
      color: #fff!important;
      border: 1px solid #3370FF!important;
    }
  }


  .login-form {
    margin: 10px 0;
    .ipt-ico {
      width: 16px;
      height: 16px;
    }
    i {
      color: #333;
    }

    .el-form-item__content {
      width: 100%;
      line-height: 42px;
    }

    .el-form-item {
      margin-bottom: 20px;
    }
    .el-form-item:nth-child(3) {
      margin-bottom: 0;
    }
    .el-input {
      //border: 1px solid #DFDFDF;
      border-radius: 10px;

      input {
        //padding-bottom: 10px;
        padding-left: 45px;
        text-indent: 5px;
        background: transparent;
        //border: none;
        border-radius: 4px;
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
    margin: 0 0 0 20px;
  }

  .login-code-img {
    border-radius: 10px;
    margin-top: 2px;
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

  .qrcode_half1 {
    position: absolute;
    right: 5px;
    top: 5px;
    width: 80px;
    height: 80px;
    background: url("../../assets/img/login/entry1.png") no-repeat center/cover;
    cursor: pointer;
    &:hover {
      background: url("../../assets/img/login/entry1-hover.png") no-repeat center/cover;
    }
  }
  .qrcode_half2 {
    position: absolute;
    right: 5px;
    top: 5px;
    width: 80px;
    height: 80px;
    background: url("../../assets/img/login/entry2.png") no-repeat center/cover;
    cursor: pointer;
    &:hover {
      background: url("../../assets/img/login/entry2-hover.png") no-repeat center/cover;
    }
  }
  .qrcode {
    width: 250px!important;
    height: 250px!important;
    margin-bottom: 30px;
  }

  .forgot-box {
    text-align: right;
  }
  .forget_pwd {
    display: inline-block;
    color: #8F959E;
    font-size: 14px;
    margin-top: 10px;
    cursor: pointer;
  }
  .login__pwd-ico {
    display: inline-block;
    line-height: 49px;
  }
  .el-icon-view:before {
    content: "";
    display: inline-block;
    width: 14px;
    height: 14px;
    background: url("../../assets/img/login/showPwd.png") no-repeat center/cover;
  }
  .show-ico:before {
      background: url("../../assets/img/login/hiddePwd.png") no-repeat center/cover;
  }
}
.app-info {
  position: absolute;
  top: 50%;
  left: 18.3vw;
  transform: translateY(-50%);
  .img {
    width: 158px;
  }
  .tit {
    font-size: 42px;
    color: #404758;
    font-weight: 700;
  }
  .des {
    font-size: 24px;
    color: #8F959E;
  }

}

// 自适应
@media screen and (max-width: 1500px) {
  #login {
    .login-weaper {
      width: 90vw;
    }
    .app-info {
      left: 10vw;
    }
  }
}
</style>

