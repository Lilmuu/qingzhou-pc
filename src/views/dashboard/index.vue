<!--dashboard 替换-->
<template>
  <myLayOut></myLayOut>
</template>

<script>
import { mapGetters } from 'vuex'
import myLayOut from "@/views/layout/myLayOut"

export default {
  name: 'dashboard',
  components: {
    myLayOut
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
