<template>
  <div>
<!--    <organizationChart :taskId="taskId"></organizationChart>-->
    <taskView :taskId="taskId" />
  </div>
</template>

<script>
import organizationChart from './organizationChart'
import taskView from "@/views/myTodo/components/taskView";

export default {
  name: "MyToDoView",
  props: {
    taskId: {
      type: String,
      default: '',
      required: true
    }
  },
  components: {
    organizationChart,
    taskView
  }
}
</script>

<style scoped>

</style>
