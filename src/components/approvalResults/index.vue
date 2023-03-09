<!--
 * @Author: your name
 * @Date: 2021-12-10 17:44:11
 * @LastEditTime: 2022-06-14 17:24:37
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\approvalResults\index.vue
-->
<template>
  <div class="remark-content" :style="{ 'min-height': height }">
    <div class="block">
      <!--<span class="frist">{{ results.approvalResult == 1 ? '同意' : '驳回' }}</span>-->
      <span class="frist" v-html="formatWords"> </span>
      <!-- <span>{{ results.approvalSuggest }}</span> -->
    </div>
    <div class="block">
      <span v-if="type != 'department'" class="second">{{ results.approvalName }}</span>
      <span v-html="approvalTime"></span>
    </div>
  </div>
</template>

<script>
export default {
  props:{
    results:{
      type: Object,
      default: ()=>{
        return {}
      }
    },
    minHeight:{
      type: Number,
      default: ()=>{
        return 50
      }
    },
    type:{
      type: String,
      default: ()=>{
        return ""
      }
    }
  },
  computed:{
    height(){
      return this.minHeight+'px'
    },
    approvalTime(){
      return `<span style="margin-right:10px">${this.results.approvalTime.split(" ")[0]}</span><span >${this.results.approvalTime.split(" ")[1]}</span>`
    },
    formatWords() {
      if(this.results.approvalResult == 1) {
         return `<span style="color:#34BE3A">同意</span>`
      } else {
        return `<span style="color:#F54A45">驳回</span>`
      }
    }
  },
  mounted(){
    console.log(this.results,'results ----- results')
  }
}
</script>

<style lang="scss" scope>
  .remark-content {
    padding-left: 15px;
    .block {
      display: inline-block;
    }

  }

</style>
