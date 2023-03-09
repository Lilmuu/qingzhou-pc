<template>
    <div class="uploadFile upload-container">
        <el-upload
            class="upload-demo"
            :class="typeClass"
            :action='uploadUrl'
            :data='params'
            multiple
            :headers='headers'
            :before-upload='beforUpload'
            :on-success='onSuccess'
            :on-error="onError"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :show-file-list="showFileLists"
            :file-list="fileList"
            :accept="accept">
            <div v-if="!isSlotButton">
              <el-button size="small" v-if="!lineMode">{{uploadText}}</el-button>
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
      default: '.pdf, .ppt, .pptx, .doc, .docx, .doc, .rar, .zip, .jpg, .bmp, .png, .xlsx, .xls, application/pdf'
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
    }
  },
  data() {
    return {
      typeClass:'',
      fileList: [],
      list: [],
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
      return `${config.baseURL}/mgr/task-engine/task/target/import/target`
    }
  },
  methods: {
    // 文件上传之前
    beforUpload(file) {
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
    onSuccess(file) {
        let uploadStatus = file.code === 0 ? 'success' : 'error';
		let tip = file.code === 0 ? '导入目标成功' : file.msg;
        this.$message[uploadStatus](tip);
		if(file.code === 0) {
			this.$emit('successChange')
		}
    //   if (res.code === 200) {
    //     this.$emit('changeUpload', {
    //       res: res.data,
    //       file,
    //       rowIndex: this.rowIndex
    //     })
    //   } else {
    //     this.$message.error(res.msg)
    //   }
    },

    // 文件上传失败
    onError(err) {
      this.$message.error(`上传失败, ${err.message}`)
    },

    // 删除文件
    handleRemove(file) {
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
    }
  }
}
</script>

<style lang="scss">
    //.upload-container {
    //    display: inline-block;
    //    .el-upload-list  {
    //        display: none;
    //    }
    //}
    .el-upload {
      text-align: unset;

    }
 
</style>
