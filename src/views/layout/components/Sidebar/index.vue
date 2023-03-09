<template>
  <scroll-bar>
    <el-menu class="navbar flex-center" mode="horizontal">
      <el-dropdown class="avatar-container" trigger="click">
        <headAvatar :avatarUrl='user.headAvatar' :username='username'></headAvatar>
        <!-- 头像操作栏 -->
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
          <div class="user_info">
            <div class="header_avatar">
              <!-- <img :src="user.headAvatar" alt=""> -->
              <headAvatar :avatarUrl='user.headAvatar' :username='username'></headAvatar>
              <UploadFileNew uploadText='添加附件'
                ref="finishUploadFileNew"
                accept='.jpg, jpeg, .png'
                :multiple='false'
                :initFileList="avatarImgList"
                :maxSize="1024*1024*20"
                @changeUpload='uploadAvatarSuccess'
                :lineMode="true"
                :isSlotButton="true"
                :showFileLists="true"
                errorText='请上传正确的附件'
              >
                <template slot="uploadButton">
                  <img class="upload_img" src="@/assets/img/avatar_photo.png" alt="">
                </template>
              </UploadFileNew>
            </div>
            <span>{{ username }}</span>
          </div>
          <!-- <el-dropdown-item divided v-if="showDev">
            <div class="dropdown-item-container" @click="handleOpenDevTool" >Dev Tool</div>
          </el-dropdown-item> -->
          <el-dropdown-item divided>
            <div @click="handleOpenLink" class="dropdown-item-container">
              <div class="flex-center">
                <img src="@/assets/img/shouji.png" alt="">
                <span>手机端下载</span>
              </div>
              <!-- <img src="@/assets/img/icon_right.png" alt="右箭头"> -->
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <div @click="editPwdDialog = true" class="dropdown-item-container">
              <div class="flex-center">
                <img src="@/assets/img/lock.png" alt="">
                <span>修改密码</span>
              </div>
              <!-- <img src="@/assets/img/icon_right.png" alt="右箭头"> -->
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided class="quit_login">
            <div @click="handleShowLogOutDialog" class="dropdown-item-container">
              <div class="flex-center">
                <img src="@/assets/img/logout.png" alt="">
                <span>退出登录</span>
              </div>
              <!-- <img src="@/assets/img/icon_right.png" alt="右箭头"> -->
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-menu>
    <!--左边菜单-->
    <el-menu
      mode="vertical"
      :router="true"
      :show-timeout="200"
      :default-active="$route.path.indexOf('/workbench/index') != -1 ? 'workbench' : $route.path"
      :collapse="true"
      text-color="#bfcbd9"
      active-text-color="#ffffff">
      <sidebar-item :routes="routes"></sidebar-item>
    </el-menu>
    <!--  拖动sidebar  -->
    <div class="navbar-left app_top_bar" v-if="!ISDEV"></div>
    <!-- 修改密码  -->

    <el-dialog append-to-body
      width="520px"
      :before-close="handleClearForm"
      :visible.sync='editPwdDialog'
      custom-class="change_password"
      :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">修改密码</span>
      </div>
      <el-form
        class="login-form"
        status-icon
        :rules="loginRules"
        ref="loginForm"
        :model="loginForm">
        <el-form-item prop="oldPassword" label="原密码：">
          <el-input
            @keyup.enter.native="handleSubmit"
            v-model="loginForm.oldPassword"
            auto-complete="off"
            type="password"
            placeholder="请输入原密码">
          </el-input>
        </el-form-item>
        <el-form-item prop="newPassword" label="新密码：">
          <el-input
            @keyup.enter.native="handleSubmit"
            type="password"
            v-model="loginForm.newPassword"
            auto-complete="off"
            placeholder="请输入新密码">
          </el-input>
        </el-form-item>
        <el-form-item prop="newPasswordRe" label="确认密码：">
          <el-input
            @keyup.enter.native="handleSubmit"
            type="password"
            v-model="loginForm.newPasswordRe"
            auto-complete="off"
            placeholder="请再次输入新密码">
          </el-input>
        </el-form-item>
      </el-form>
      <div class="flex-center">
        <el-button @click="handleClearForm">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!-- 退出  -->
    <cencelOrClose ref="cencelOrClose"
      defineName='退出登录'
      btnType='danger'
      :closeHeader='true'
      @define='logout'
    >
      <p slot="tipsOne"> 您确定要退出"{{ username || formatUserName}}"账号吗？</p>
      <!-- <p slot="tipsTwo">退出登录后，你将无法收到该账号的通知</p> -->
    </cencelOrClose>

    <div v-if="avatarUploadBox" class="change_avatar_box" @click.self="avatarUploadBox = false">
      <div class="avatar_box_cont">
        <div class="header">
          <div>修改头像</div>
          <img @click="avatarUploadBox = false" src="@/assets/img/close.png" alt="">
        </div>
        <div class="avatar_cont">
          <vue-cropper
            ref="cropper"
            :img="option.img"
            :outputSize="option.outputSize"
            :outputType="option.outputType"
            :info="option.info"
            :canScale="option.canScale"
            :autoCrop="option.autoCrop"
            :autoCropWidth="option.autoCropWidth"
            :autoCropHeight="option.autoCropHeight"
            :fixed="option.fixed"
            :fixedNumber="option.fixedNumber"
            :full="option.full"
            :fixedBox="option.fixedBox"
            :canMove="option.canMove"
            :canMoveBox="option.canMoveBox"
            :original="option.original"
            :centerBox="option.centerBox"
            :height="option.height"
            :infoTrue="option.infoTrue"
            :maxImgSize="option.maxImgSize"
            :enlarge="option.enlarge"
            :mode="option.mode"
            @imgLoad="imgLoad">
          </vue-cropper>
        </div>
        <div class="avatar_footer">
          <el-button @click="avatarUploadBox = false">取消</el-button>
          <el-button type="primary" @click="confirmChangeAvatar">保存</el-button>
        </div>
      </div>
    </div>

  </scroll-bar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import ScrollBar from '@/components/ScrollBar'
import { remote } from 'electron'
import { checkPassword } from "@/api/system"
import { validatePwd } from "@/utils/validate"
import { openLink } from "@/utils/pure"
import { config } from "@/const/dicData"
import { encryption } from "@/utils"
import cencelOrClose from "@/components/cencelOrClose"
import { mapState } from 'vuex'
import UploadFileNew from '@/components/UploadFile/UploadFileNew'
import { VueCropper } from 'vue-cropper'
import { fileUpload } from '@/api/mail'
import { headImageUpload } from "@/api/user"
import headAvatar from "@/components/headAvatar"


const win = remote.getCurrentWindow()
const loginRules = {
  oldPassword: [
    { required: true, message: "请输入原密码", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { validator: validatePwd, trigger: "blur" }
  ],
  newPasswordRe: [
    { required: true, message: "请输入确认密码", trigger: "blur" },
    { validator: validatePwd, trigger: "blur" }
  ]
}

export default {
  components: { SidebarItem, ScrollBar, cencelOrClose, UploadFileNew, VueCropper, headAvatar },
  data() {
    return {
      // 是否为开发环境
      ISDEV: process.env.NODE_ENV === 'development',
      showDev: config.showDev,
      exitDialog: false,
      editPwdDialog: false,
      loginForm: {
        oldPassword: '',
        newPassword: '',
        newPasswordRe: ''
      },
      loginRules: loginRules,
      avatarImgList: [{
        fileUrl:''
      }],
      avatarUploadBox: false,
      option:{
        img: 'https://minio-test.cguarantee.com/manage/manage/add/2022-04-02/test2_150307.png',             // 裁剪图片的地址
        outputSize: 1,       // 裁剪生成图片的质量(可选0.1 - 1)
        outputType: 'jpeg',  // 裁剪生成图片的格式（jpeg || png || webp）
        info: true,          // 图片大小信息
        canScale: true,      // 图片是否允许滚轮缩放
        autoCrop: true,      // 是否默认生成截图框
        autoCropWidth: 270,  // 默认生成截图框宽度
        autoCropHeight: 270, // 默认生成截图框高度
        fixed: true,         // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        full: false,         // false按原比例裁切图片，不失真
        fixedBox: true,      // 固定截图框大小，不允许改变
        canMove: true,      // 上传图片是否可以移动
        canMoveBox: true,    // 截图框能否拖动
        original: false,     // 上传图片按照原始比例渲染
        centerBox: false,    // 截图框是否被限制在图片里面
        height: true,        // 是否按照设备的dpr 输出等比例图片
        infoTrue: false,     // true为展示真实输出图片宽高，false展示看到的截图框宽高
        maxImgSize: 3000,    // 限制图片最大宽度和高度
        enlarge: 1,          // 图片根据截图框输出比例倍数
        mode: '380px 380px'  // 图片默认渲染方式
      },
    }
  },
  computed: {
    ...mapGetters([ 'sidebar', 'username' ]),
    ...mapState({
      MeId: state => state.Common.User.MeId,
      userId: state => state.user.userId,
      user: state => state.user,
    }),
    routes() {
      return this.$router.options.routes
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    handleOpenDevTool() {
      win.webContents.toggleDevTools()
    },
    handleOpenLink() {
      openLink(config.download_page)
    },
    handleSubmit() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          if (this.loginForm.newPassword !== this.loginForm.newPasswordRe) {
            this.$message.error('新密码和确认密码不一致')
            return
          }
          let obj = {
            oldPassword: this.loginForm.oldPassword,
            rePassword: this.loginForm.newPasswordRe,
            password: this.loginForm.newPassword
          }
          obj = encryption({
            data: obj,
            key: "ZnJhbWVmcmFtZQ==",
            param: ["oldPassword"]
          });
          obj = encryption({
            data: obj,
            key: "ZnJhbWVmcmFtZQ==",
            param: ["password"]
          });
          obj = encryption({
            data: obj,
            key: "ZnJhbWVmcmFtZQ==",
            param: ["rePassword"]
          });
          checkPassword(obj).then(res => {
            if (res.data.code === 0) {
              this.$message.success('修改成功，即将退出')
              // setTimeout(() => {
                this.logout()
              // }, 3000)
            }
          })
          // this.$store.dispatch("LoginByUsername", this.loginForm).then(() => {
          //   this.$store.commit("ADD_TAG", {
          //     label: '首页',
          //     value: '/wel/index',
          //     params: {},
          //     query: {},
          //     group: []
          //   });
          //   this.$router.push({path: this.tagWel.value })
          // }).catch(() => {
          //   this.refreshCode()
          // })
        }
      })
    },
    handleShowLogOutDialog() {
      this.$refs.cencelOrClose.exitDialog = true
    },
    // 清空
    handleClearForm() {
      this.loginForm = {
        oldPassword: '',
        newPassword: '',
        newPasswordRe: ''
      }
      this.editPwdDialog = false
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    },
    //初始化函数
    imgLoad (msg) {
      console.log("工具初始化函数====="+msg)
    },
    uploadAvatarSuccess(data) {
      this.avatarImgList=[{ ...data.res, type: 'up'}]
      this.option.img = data.res.fileUrl // 开发环境加http://
      this.avatarUploadBox = true
    },
    // 确认修改头像
    confirmChangeAvatar(){
      this.$refs.cropper.getCropBlob(async (data) => {
        let formData = new FormData();
        formData.append("file", data );
        formData.append("userId", this.userId );
        headImageUpload(formData).then(res=>{
            this.$store.dispatch('getUserAvatarFun', this.userId)
            this.avatarUploadBox = false
        })
      })
    },
  },
}
</script>


<style lang="scss" scoped>
.navbar {
  height: 50px;
  padding: 24px 0 39px;
  box-sizing: content-box;
  border-radius: 0px !important;
  background: #3B4A6E;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  .avatar-container {
    display: inline-block;
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    user-select: none;
    .avatar-wrapper {
      cursor: pointer;
      position: relative;
      width: 50px;
      height: 50px;
      background: #3471FF;
      color: #fff;
      font-size: 18px;
      border-radius: 25px;
      overflow: hidden;
      border: 1px solid #fff;

      .el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
  .el-input__prefix {
    left: 5px;
    transition: all .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
