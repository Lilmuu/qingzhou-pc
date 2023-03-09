<template>
  <div @click="click" class="add_new_btn flex-center" style="margin-bottom: 10px">
    <img src="@/assets/img/file_add3.png" class="file_add_img" alt="">
    <span>新建</span>
  </div>
</template>

<script>
export default {
  name: "AddBtn2",
  methods: {
    click() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.add_new_btn {
  width: 210px;
  height: 35px;
  margin: 0 auto;
  cursor: pointer;
  margin-top: 10px;
  border: 1px solid #3471FF;
  color: #3471FF;
  border-radius: 25px;
}
</style>
