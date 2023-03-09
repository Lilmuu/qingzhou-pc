<!--签名-->
<template>
  <div class="signDialog">
    <el-form class="dialogForm" :model="formData" ref="ruleForm" label-width="">
      <el-row type="flex" style="flex-direction: column">
        <el-col :span="24">
          <el-form-item label="标题">
            <el-input v-model="formData.name"
                      clearable
                      maxlength="50"
                      placeholder="请输入名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="内容">
            <!-- 富文本 -->
            <div id="editor" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="flex-center" style="margin-top: 30px;">
        <div @click="handleSignClose" class="mail-btn flex-center mail-btn-disable" style="margin-right: 30px;">取消</div>
        <div @click="handleSignSubmit" class="mail-btn flex-center mail-btn-primary">确定</div>
      </div>
    </el-form>
  </div>

</template>

<script>
import Editor from 'wangeditor'
import { xssFilter } from "@/utils"
import { hasBlank } from "@/utils/validate"

export default {
  name: "signDialog",
  props: {
    rowData: {
      type: Object,
      default: () => {
      }
    },
    // 操作方式 [add, edit, preview]
    actionType: {
      type: String,
      default: ''
    }
  },
  components: {
  },
  data() {
    return {
      formData: {
        name: '',
        content: ''
      },
      editor: null
    }
  },
  mounted() {
    this.initEditor()
    if (this.actionType === 'edit') {
      this.formData = { ...this.rowData }
      this.editor.txt.html(this.rowData.content)
    } else {
      this.formData = {
        name: '',
        content: ''
      }
    }
  },
  methods: {
    // 初始化富文本
    initEditor() {
      const editor = new Editor(`#editor`)
      // 配置菜单栏，删减菜单，调整顺序
      editor.config.menus = [
        'head',
        'bold',
        'fontSize',
        'fontName',
        'italic',
        'underline',
        'strikeThrough',
        'indent',
        'lineHeight',
        'foreColor',
        'backColor',
        'link',
        'list',
        'justify',
        'quote',
        'code',
        'splitLine',
        'undo',
        'redo',
      ]
      editor.config.pasteIgnoreImg = true
      // 隐藏插入网络图片的功能
      editor.config.showLinkImg = false
      // 配置 onchange 回调函数，将数据同步到 vue 中
      editor.config.onchange = (newHtml) => {
        this.formData.content = newHtml
      }
      editor.config.focus = false
      // 创建编辑器
      editor.create()
      this.editor = editor
    },

    // form 清空
    handleResetForm() {
      this.formData = {
        name: '',
        content: ''
      }
    },
    handleSave() {

    },
    handleSignSubmit() {
      const data = {
        ...this.formData,
        content: xssFilter(this.editor.txt.html())
      }
      if (hasBlank(data.name)) {
        this.$message.error('请输入名称')
        return
      }
      if (hasBlank(data.content)) {
        this.$message.error('请输入内容')
        return
      }
      this.$emit('handleSignSubmit', data)
    },
    handleSignClose() {
      this.$emit('handleSignClose')
    }
  }
}
</script>

<style lang="scss">
.signDialog {
  .mail-btn-primary{
    width: 84px;
    height: 32px;
    font-size: 14px;
    border-radius: 4px;
  }
  .mail-btn-disable{
    width: 84px;
    height: 32px;
    font-size: 14px;
    border-radius: 4px;
    margin-right: 10px !important;
  }
  .w-e-text-container {
    height: 300px!important;
    min-height: 100px !important;
  }
  .flex-center{
    justify-content: flex-end;
    .mail-btn{
      justify-content: center;
    }
  }
    .w-e-text{
      min-height: 100px !important;
      height: 300px !important;
    }
#editor{
  .w-e-toolbar{
    height: 80px;
    border: 1px solid #c9d8db !important;
    border-bottom: 0 !important;
    width: 100%;
  }
}
}
</style>
