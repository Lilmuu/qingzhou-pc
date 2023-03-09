<template>
    <div class="uploadFile upload-container">
        <el-upload
            class="upload-demo"
            ref="uploadFile"
            :action='uploadUrl'
            :data='params'
            multiple
            :headers='headers'
            :before-upload='beforUpload'
            :on-success='onSuccess'
            :on-progress='calculationProgress'
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
import { uploadFile } from '@/api/system';
import EventBus from '@/eventBus'

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
      default: 'pdf,ppt,pptx,doc,docx,rar,zip,jpg,JPG,bmp,png,xlsx,xls,jpeg'
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
      default: '.pdf, .ppt, .pptx, .doc, .docx, .rar, .zip, .jpg, .JPG, .bmp, .png, .xlsx, .xls, application/pdf, jpeg'
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
      return `${config.baseURL}/mgr/task-engine/base/fileUpload`
    }
  },
  methods: {
    // 文件上传之前
    beforUpload(file) {
      const format = file.name.split('.')
      const suffix = format[format.length - 1]
      console.log(this.format,'this.format -- this.format')
      const formatArr = this.format.split(',')
      this.$emit('beforeUpload')
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
    // 清空文件上传
    clearFile(){
      this.$refs.uploadFile.clearFiles()
    },
    // 文件上传成功
    onSuccess(res, file, fileList) {
      if (res.code === 200) {
        this.$refs.uploadFile.abort(file) // upload: el-upload的ref值；file:File类型，file文件本身
        fileList.splice(fileList.indexOf(file), 1) // fileList: 文件列表，钩子函数中的fileList
        this.handleRemove(file, fileList)
        this.$emit('changeUpload', {
          res: res.data,
          file,
          rowIndex: this.rowIndex
        })
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
    // 文件删除
    delFile(index){
      this.fileList.splice(index,1)
    },
    // 查看文件
    handlePreview(file) {
      let url = file.url
      if (file.response) {
        url = file.response.data.url
      }
      handleTransUrlAndDownLoadFile(url)
    },
    // 计算进度条
    calculationProgress(event, file, fileList) {
      let val = (event.loaded / event.total * 100).toFixed(0);
      let progress = parseInt(val) ;
      EventBus.$emit("showProgress",progress)
    }
  },
  watch: {
    initFileList: {
      handler(val) {
        console.log(this.fileList)
        if (val.length) {
          val.forEach(file => {
            file.name = file.fileName
          })
          // 这里并不需要回显，用的自定义方式回显
          // if(!this.showFileLists){
          //   this.fileList = [...val] 
          // }
        }
      },
      deep: true
    }
  },
  destroyed() {
    EventBus.$off()
  }
}
</script>

<style lang="scss" scoped>
    //.upload-container {
    //    display: inline-block;
    //    .el-upload-list  {
    //        display: none;
    //    }
    //}
    // .el-upload {
    //   text-align: unset;
    // }
</style>
