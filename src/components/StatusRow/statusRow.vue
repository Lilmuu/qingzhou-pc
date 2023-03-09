<!--state 任务状态-->
<template>
  <div class="flex-center">
    <span style="color: #FF9A10" v-if="state === 0">待接受</span>
    <span style="color: #008CFF" v-if="state === 1">已接受</span>
    <span style="color: #4946FF" v-if="state === 2">执行中</span>
    <span style="color: #4946FF" v-if="state === 3">待验收</span>
    <span style="color: #3AE8A2" v-if="state === 4">已完成</span>
    <span style="color: #00569D" v-if="state === 5">已关闭</span>
  </div>
</template>

<script>
export default {
  name: "statusRow",
  props: {
    state: '',
    required: true
  }
}
</script>

<style scoped>

</style>
