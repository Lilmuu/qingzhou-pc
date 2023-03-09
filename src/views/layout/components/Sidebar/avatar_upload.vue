<!--
 * @Author: your name
 * @Date: 2022-04-02 10:18:58
 * @LastEditTime: 2022-04-02 16:52:56
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\layout\components\Sidebar\avatar_upload.vue
-->
<template>
  <div>
    <el-dialog append-to-body
      width="520px"
      :before-close="handleClearForm"
      :visible.sync='avatarUpload'
      custom-class="avatar_upload"
      :close-on-click-modal="false">
        <div slot="title" class="dialog-header-row">
          <div class="dialog-tip"></div>
          <span class="el-dialog__title">修改头像</span>
        </div>
        <div>
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
            @realTime="realTime"
            @imgLoad="imgLoad">
          </vue-cropper>
        </div>
      <div class="flex-center">
        <el-button @click="handleClearForm">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'

export default {
  components: { VueCropper },
  props:{
    imgUrl: {
      type: String,
      default: ()=>{
        return ''
      }
    }
  },
  data(){
    return {
      avatarUpload: false,
      option:{
        img: '',             // 裁剪图片的地址
        outputSize: 1,       // 裁剪生成图片的质量(可选0.1 - 1)
        outputType: 'png',  // 裁剪生成图片的格式（jpeg || png || webp）
        info: true,          // 图片大小信息
        canScale: true,      // 图片是否允许滚轮缩放
        autoCrop: true,      // 是否默认生成截图框
        autoCropWidth: 270,  // 默认生成截图框宽度
        autoCropHeight: 270, // 默认生成截图框高度
        fixed: true,         // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        full: false,         // false按原比例裁切图片，不失真
        fixedBox: true,      // 固定截图框大小，不允许改变
        canMove: false,      // 上传图片是否可以移动
        canMoveBox: true,    // 截图框能否拖动
        original: false,     // 上传图片按照原始比例渲染
        centerBox: false,    // 截图框是否被限制在图片里面
        height: true,        // 是否按照设备的dpr 输出等比例图片
        infoTrue: false,     // true为展示真实输出图片宽高，false展示看到的截图框宽高
        maxImgSize: 3000,    // 限制图片最大宽度和高度
        enlarge: 1,          // 图片根据截图框输出比例倍数
        mode: '230px 150px'  // 图片默认渲染方式
      }
    }
  },
  mounted(){
    console.log(this.option.img,)
    this.option.img = this.imgUrl
  },
  methods:{
    handleClearForm(){
      this.avatarUpload = false
    },
    handleSubmit(){

    },
    //实时预览函数
    realTime (data) {
      this.previews = data
    },
    //初始化函数
    imgLoad (msg) {
      console.log("工具初始化函数====="+msg)
    },
  }
}
</script>

<style>

</style>