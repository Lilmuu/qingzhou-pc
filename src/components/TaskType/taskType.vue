<template>
  <div>
    <div class="taskItem" style="background: #008BFF" v-if="taskType === 0">日程任务</div>
    <div class="taskItem" style="background: #7573FF" v-if="taskType === 1">行程任务</div>
    <div class="taskItem" style="background: #43CF96" v-if="taskType === 2">工作任务</div>
    <div class="taskItem" style="background: #FFAE40" v-if="taskType === 3">项目任务</div>
    <div class="taskItem" style="background: #005BA6" v-if="taskType === 4">反馈任务</div>
  </div>
</template>

<script>
export default {
  name: "taskType",
  props: {
    taskType: {
      type: Number,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.taskItem {
  padding: 4px;
  color: #fff;
  margin-bottom: 2px;
}
</style>
