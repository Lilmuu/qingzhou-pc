<!--
 * @Author: your name
 * @Date: 2021-09-28 11:08:46
 * @LastEditTime: 2022-02-22 19:07:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\views\im\components\messageList\components\system\index.vue
-->
<!-- 系统消息 -->
<template>
  <div class="system">
    <div class="box force-newline">{{ changeContent(message.content)}}</div>
  </div>
</template>

<script>
  export default {
    props: {
      message: {
        type: Object, default: () => {
          return {}
        }
      }
    },
    mounted(){
      console.log('系统消息  --- 系统消息',this.message)
    },
    computed:{
      changeContent(){
        return (val) => {
          let newVal
          let newTaskId = val.match(/TASK-COSTOM-ID/) ? JSON.parse(val).taskId : ""
          if(newTaskId != ''){
            newVal = ''
          }else{
            newVal = val
          }
          return newVal
        }
      },
    }
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
      color: #999;
    }
  }
</style>
