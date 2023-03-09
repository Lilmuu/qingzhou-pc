<!--
 * @Author: your name
 * @Date: 2021-12-07 14:39:41
 * @LastEditTime: 2022-06-15 16:27:46
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\UploadFile\workbenchUploadFile.vue
-->
<!-- 上传组件 支持分片上传-->
<template>
  <div class="uploadFile upload-container">
    <el-upload
      class="upload-block"
      action="'"
      :multiple="false"
      :before-upload="beforeExcelUpload"
      :http-request="handleUploadRequest"
      :show-file-list='false'
      :accept="accept">
        <div class="updata-box">
          <i class="upload-ico" v-if="isUpload"></i>
          <i class="choose-ico" v-else></i>
        <span>{{uploadText}}</span></div>
    </el-upload>
  </div>
</template>

<script>
import {uploadByPieces} from '@/utils'
import { uploadFile } from '@/api/mail'
import { getFileUrlLarger } from "@/api/system"
import { getFileUrl } from "@/api/task"

export default {
  props: {
    // format="rar,zip,doc,docx,pdf,jpg,bmp,png"
    format: {
      type: String,
      default: 'pdf,ppt,pptx,doc,docx,doc,rar,zip,jpg,bmp,png,xlsx,xls'
    },
    uploadText: {
      type: String,
      default: '点击上传'
    },
    errorText: {
      type: String,
      default: '请上传正确的文件'
    },
    accept: {
      type: String,
      default: '.pdf, .ppt, .pptx, .doc, .docx , .doc, .rar, .zip, .jpg, .bmp, .png, .xlsx, .xls, application/pdf'
    },
    // 文件大小限制
    maxSize: {
      type: Number
    },
    // 使用 line 模式
    lineMode: {
      type: Boolean,
      default: false
    },
    isUpload: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      loadingText: '上传进度',
      fileList: [],
      uploadPercent: 0,
      multiple: false,
    }
  },
  computed: {
  },
  watch: {
    fileList (fileList, oldFileList) {
      if(fileList.length) {
        this.$nextTick(() => {
          this.dealUpload()
        })
      }
    }
  },
  methods: {
    // 上传前
    beforeExcelUpload (file) {
      const format = file.name.split('.')
      const suffix = format[format.length - 1]
      const formatArr = this.format.split(',')
      if (format.length < 2) {
        this.$message.error('您上传文件的格式不正确！')
        return false
      }else if (this.format !== 'all') {
        if (formatArr.indexOf(suffix) === -1) {
          this.$message.error(this.errorText)
          return false
        }
      }
    },
    // 上传请求
    handleUploadRequest (back) {
      if(back.file.size <= 20*1024*1024){
        let fetchForm = new FormData()
        fetchForm.append('file', back.file)
        uploadFile(fetchForm).then(res=>{
          let newFile = res.data.data
          if(res.data.code == 200){
            getFileUrl({url:newFile.url}).then(response=>{
              let oldUrl = response.data.data.data
              let urlIndex = oldUrl.indexOf("?")
              let url = urlIndex != -1 ? oldUrl.substring(0 ,urlIndex)  : oldUrl
              newFile['uploadUrl'] = url
              console.log(newFile,'res ----- res---handleUploadRequest')
              this.$emit('success', newFile)
            })
            this.fileList = []
          }else{
            this.$emit('error',res.data)
          }
        })
      }else{
        this.fileList.push(back.file)
      }
    },
    // 处理上传文件
    dealUpload () {
      if(this.fileList[this.fileList.length-1].size < 20*1024*1024){
        this.$message.warning("超大附件仅适用大于20M的文件")
        return
      }
      uploadByPieces({
        files: this.fileList,
        // 5M,单位M
        pieceSize: 5,
        progress: (num, file) => {
          this.uploadPercent = num
          this.$emit('progress', num, file)
        },
        success: this.successDone,
        error: (e) => {
          this.$message.error('文件上传失败')
          this.fileList = []
          this.$emit('error')
        }
      })
    },

    async successDone(data){
      await this.handleGetFileUrlLarger(data)
      this.fileList = []
      // this.$emit('success', data)
    },


    // 获取文件链接
    async handleGetFileUrlLarger(fileData, type) {
      await getFileUrlLarger(fileData.bucketName, fileData.fileName).then(res => {
        console.log(res,'res ----- res---getFileUrlLarger')
        if(res.data.code === 200) {
          let oldUrl = res.data.data.data
          let urlIndex = oldUrl.indexOf("?")
          let url = urlIndex != -1 ? oldUrl.substring(0 ,urlIndex)  : oldUrl
          fileData['uploadUrl'] = url
          this.$emit('success', fileData)
        }
      })
    }
  },
}
</script>
<style lang="scss">
.upload-block {
  .updata-box{
    display: flex;
    align-items: center;
    span {
      color: #3370FF;
      font-size: 14px;
      line-height: 1;
      margin-left: 5px;
    }
  }
  i{
    font-size: 20px;
  }
  .el-upload {
    text-align: unset;
  }
  .upload-ico {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 10px;
    background: url("../../assets/img/workbench/upload.png") no-repeat center/cover;
  }
  .choose-ico {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 10px;
    background: url("../../assets/img/workbench/choose-ico.png") no-repeat center/contain;
  }
}
</style>
