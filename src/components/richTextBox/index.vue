<!--
 * @Author: your name
 * @Date: 2021-12-23 15:51:09
 * @LastEditTime: 2021-12-28 19:05:26
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\richTextBox\index.vue
-->
<template>
  <div class="rich-box">
    <el-dialog
      :visible.sync="richTextBox"
      :show-close="false"
      custom-class="rich-text-box"
      width="1000px"
      :before-close="boxClose"
    >
      <!--  @keypress="handlerMultiEnter" -->
      <div id="toolbar-container"></div>
      <div id="text-container" ref="textTontainer"></div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="richTextBoxClose()">取 消</el-button>
        <el-button type="primary" @click="submit()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import E from 'wangeditor'
export default {
  props:{
    content:{
      type: String,
      default: ()=>{
        return ''
      }
    }
  },
  data(){
    return {
      richTextBox: true,
    }
  },
  mounted(){
    console.log('hahahaha')

    this.$nextTick(() => {
    this.editorInit()
    })
  },
  methods:{
    // 富文本初始化
    async editorInit() {
      this.editor = new E('#toolbar-container','#text-container')
      this.editor.config.height = window.innerHeight - window.innerHeight * 0.76


      // this.editor.config.fontNames = [
      //   // 对象形式 v4.6.16
      //   {name:"黑体",value:"黑体"},
      //   // 字符串形式
      //   '黑体',
      // ]

      this.editor.create()
      this.editor.txt.html(this.content)
    },
    submit(){
      let val = this.editor.txt.html()
      this.richTextBoxClose(val)
      console.log(val,'val --- val')
    },

    richTextBoxClose(value=undefined){
      console.log(value,'value -- value')
      if(value != undefined){
        this.$emit('set-text',value)
      }else{
        this.$emit('close-box',)
      }
    },
    boxClose(){
      this.$emit('close-box')
    }
  }
}
</script>

<style lang='scss'>
  .el-dialog__header {
    background-color: #fff;
  }
.rich-text-box{

  #toolbar-container{
    border: 1px solid #DCDFE6;
    .w-e-toolbar{
      width: 100%;
      height: 35px;

      .w-e-menu{
        width: 35px;
        height: 35px;
      }
    }
  }
  #text-container{
    border: 1px solid #DCDFE6;
    border-top: 0;

    p{
      margin: 0!important;
    }
    .w-e-text{
      max-height: 450px!important;
    }
    .placeholder{
      display: none!important;
    }
  }
}
</style>
