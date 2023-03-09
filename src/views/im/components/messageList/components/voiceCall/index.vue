<!--
 * @Author: your name
 * @Date: 2021-11-29 10:05:35
 * @LastEditTime: 2021-11-29 20:25:54
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\voiceCall\index.vue
--><!-- 时间线显示 -->
<template>
  <div class="system dateLine">
    <div class="box force-newline">{{ formatContent(message) }}</div>
  </div>
</template>

<script>
  export default {
    props: {
      message: {
        type: Object, 
        default: () => {
          return {}
        }
      },
      MeId:{
        type: Number,
        default: ()=>{
          return undefined
        }
      }
    },
    computed:{
      formatContent(){
        return (val) => {
          console.log(this.MeId,'meid - meid')
          let oldContent = JSON.parse(val.oldContent)
          let newCont = ''
          console.log(oldContent,'oldContent - oldContent')
          if(oldContent.chatType == "friend"){
            if(oldContent.event == "cancel"){
              newCont = oldContent.senderId == this.MeId ? "已拒接": "对方已拒接"
            }else if(oldContent.event == "voiceCancel"){
              newCont = oldContent.senderId == this.MeId ? "已取消": "对方已取消"
            }else if(oldContent.event == "voiceStop"){
              newCont = '通话时长 '+ oldContent.voiceTime
            }
          }else if(oldContent.chatType == "room"){
            if(oldContent.event == "voiceEnd")
            newCont = oldContent.event == "voiceEnd" ? "通话已结束" : ""
          }
            
          return newCont
        }
      },
    },
    mounted(){
      console.log('语音通话回显message - message', this.message)
    },
  }
</script>

<style lang="scss" scoped>
  .system {
    padding: 20px 0;
    .box {
      margin: 0 auto;
      padding: 5px 20px;
      width: max-content;
      max-width: 520px;
      background-color: #ffffffb3;
      border-radius: 6px;
      font-size: 14px;
      color: #8F959E;
    }
  }
</style>
