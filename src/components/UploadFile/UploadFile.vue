<template>     
    <div class="uploadFile upload-container" :class="typeClass">
        <el-upload
          ref="upload"
          class="upload-demo"
          :action='uploadUrl'
          :data='params'
          :multiple='multiple'
          :headers='headers'
          :before-upload='beforUpload'
          :on-success='onSuccess'
          :on-error="onError"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :show-file-list="!showFileLists"
          :file-list="fileList"
          :accept="accept">
          <div v-if="!isSlotButton">
            <el-button size="small" type="primary" class="upload-btn flex-center" v-if="!lineMode">
              <i class="add-btn el-icon-circle-plus-outline" style="font-size: 18px;margin-right: 8px;"></i>
              {{uploadText}}</el-button>
            <div v-else>{{uploadText}}</div>
          </div>
          <div v-else>
              <slot name="uploadButton"></slot>
          </div>
        </el-upload>
    </div>
</template>

<script>
import { config } from "@/const/dicData"
import { handleTransUrlAndDownLoadFile } from "@/utils/download"

export default {
  name: 'UploadFile',
  props: {
    // 文件列表
    initFileList: {
      type: Array,
      required: true,
      default: () => []
    },
    // format="rar,zip,doc,docx,pdf,jpg,bmp,png"
    format: {
      type: String,
      default: 'pdf,ppt,pptx,doc,docx,rar,zip,jpg,bmp,png,xlsx,xls'
    },
    uploadText: {
      type: String,
      default: '点击上传'
    },
    errorText: {
      type: String,
      default: '请上传正确的文件'
    },
    showMaxSizeErrorText: {
      type: Boolean,
      default: false
    },
    rowIndex: {
      type: Number,
      default: null
    },
    accept: {
      type: String,
      default: '.pdf, .ppt, .pptx, .doc, .docx, .rar, .zip, .jpg, .bmp, .png, .xlsx, .xls, application/pdf'
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
    // 是否启用插槽自定义上传按钮
    isSlotButton:{
      type:Boolean,
      default:false
    },
    // 是否显示文件列表
    showFileLists:{
      type:Boolean,
      default:false
    },
  },
  data() {
    return {
      typeClass:'',
      fileList: [],
      list: [],
      multiple: false,
      headers: {
        'Authorization': this.$store.getters.token
      },
      params: {
        module: 'templateStore'
      }
    }
  },
  computed: {
    uploadUrl() {
      return `${config.baseURL}/mgr/task-engine/base/fileUpload`
    }
  },
  methods: {
    // 文件上传之前
    beforUpload(file) {
      console.log(file,'文件上传之前 ---- ')
      const format = file.name.split('.')
      const suffix = format[format.length - 1]
      const formatArr = this.format.split(',')
      if (format.length < 2) {
        this.$message.error('您上传文件的格式不正确！')
        return false
      }
      if (this.format !== 'all') {
        if (formatArr.indexOf(suffix) === -1) {
          this.$message.error(this.errorText)
          return false
        }
      }
      if (this.maxSize && file.size > this.maxSize) {
        const size = parseInt(String(this.maxSize / 1024 / 1024))
        if(this.showMaxSizeErrorText) {
          this.$message.error(`上传文件大于${size}Mb，请使用超大附件上传!`)
        } else {
          this.$message.error(`上传文件大于${size}Mb，请重新上传!`)
        }
        return false
      }
    },

    // 文件上传成功
    onSuccess(res, file, fileList) {
      if (res.code === 200) {
        this.$emit('changeUpload', {
          res: res.data,
          file,
          rowIndex: this.rowIndex
        })
          console.log(file.name.split(".")[1],232412354235)
        if(file.name.split(".")[1]=='jpg'){
          this.typeClass='uploadFileJpg'
        }else if(file.name.split(".")[1]=='doc'){
          this.typeClass='uploadFileDoc'
        }else if(file.name.split(".")[1]=='ppt'){
          this.typeClass='uploadFilePpt'
        }else if(file.name.split(".")[1]=='xls'){
          this.typeClass='uploadFileXls'
        }else if(file.name.split(".")[1]=='7z'){
          this.typeClass='uploadFile7z'
        }else if(file.name.split(".")[1]=='exe'){
          this.typeClass='uploadFileExe'
        }else if(file.name.split(".")[1]=='png'){
          this.typeClass='uploadFilePng'
        }else if(file.name.split(".")[1]=='rar'){
          this.typeClass='uploadFileRar'
        }else if(file.name.split(".")[1]=='zip'){
          this.typeClass='uploadFileZip'
        }else if(file.name.split(".")[1]=='pdf'){
          this.typeClass='uploadFilePdf'
        }else{
          this.typeClass='uploadFileElse'
        }
      } else {
        this.$message.error(res.msg)
      }
    },

    // 文件上传失败
    onError(err, file, fileList) {
      this.$message.error(`上传失败, ${err.message}`)
    },

    // 删除文件
    handleRemove(file, fileList) {
      this.$emit('onRemove', file)
    },

    // 查看文件
    handlePreview(file) {
      let url = file.url
      if (file.response) {
        url = file.response.data.url
      }
      handleTransUrlAndDownLoadFile(url)
    }

    // 删除文件确认弹窗
    // beforeRemove(file, fileList) {
    //   return this.$confirm(`确定移除 ${file.name}？`)
    // }
  },
  watch: {
    initFileList: {
      handler(val) {
        if (val.length) {
          val.forEach(file => {
            file.name = file.fileName
          })
          this.fileList = [...val]
        }
      },
      deep: true
    },
  },

}
</script>

<style lang="scss"  >
.uploadFile{
  .el-upload-list__item-name{
    position: relative;
    padding-left: 16px;
    .el-icon-document:before{
      content: '';
      position: absolute;
      left: 0;
      top: 3px;
      bottom: 0;
      width: 16px;
      height: 16px;
      
    }
  }
}
 .uploadFileJpg{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/jpg.png) no-repeat 0px 0px;
    }
  }
}
.uploadFileDoc{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/doc.png) no-repeat 0px 0px;
    }
  }
}
.uploadFilePpt{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/ppt.png) no-repeat 0px 0px;
    }
  }
}
.uploadFileXls{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/xls.png) no-repeat 0px 0px;
    }
  }
}
.uploadFile7z{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/7z.png) no-repeat 0px 0px;
    }
  }
}
.uploadFileExe{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/exe.png) no-repeat 0px 0px;
    }
  }
}
.uploadFilePng{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/png.png) no-repeat 0px 0px;
    }
  }
}
.uploadFileRar{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/rar.png) no-repeat 0px 0px;
    }
  }
}
.uploadFileZip{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/zip.png) no-repeat 0px 0px;
    }
  }
}
.uploadFilePdf{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/pdf.png) no-repeat 0px 0px;
    }
  }
}
.uploadFileElse{
  .el-upload-list__item-name{
    .el-icon-document:before{
      background: url(../../assets/img/mail/else.png) no-repeat 0px 0px;
    }
  }
}

    //.upload-container {
    //    display: inline-block;
    //    .el-upload-list  {
    //        display: none;
    //    }
    //}
    .el-upload {
      text-align: unset;
    }
    .upload-demo{
      display: inline-block;
    }
</style>
