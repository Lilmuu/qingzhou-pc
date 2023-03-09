<!--
 * @Author: your name
 * @Date: 2021-12-17 14:30:45
 * @LastEditTime: 2021-12-17 15:00:09
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\workbench\recordMuery.vue
-->
<template>
  <div>
    <!-- 议题 -->
    <topics v-if="seeModel == 'topics'"></topics>
    <!-- 签报 -->
    <signTheQuote v-if="seeModel == 'signTheQuote'"></signTheQuote>
    <!-- 合同 -->
    <contractModel v-if="seeModel == 'contract'"></contractModel>
    <!-- 发文 -->
    <dispatchModel v-if="seeModel == 'dispatch'"></dispatchModel>
  </div>
</template>

<script>
import contractModel from './contractModel'
import dispatchModel from './dispatchModel'
import topics from './topics/topics'
import signTheQuote from './signTheQuote/signTheQuote'
export default {
  components:{
    contractModel,
    dispatchModel,
    topics,
    signTheQuote
  },
  data(){
    return {
      seeModel: 'topics',
    }
  }
}
</script>

<style>

</style>