<template>
  <div class="tabRow">
    <div>
      <span @click="handleClick(item)"
            :class="[ activeName === item.name && useActiveClass ? 'label-item label-active' : 'label-item label']"
            v-for="(item, index) in option"
            :key="index">{{ item.label }}</span>
    </div>
    <img @click="closeCustomDialog" src="@/assets/img/calendar/close.png" alt="">
  </div>
</template>

<script>
export default {
  name: "TabLabel",
  props: {
    initActiveName: {
      type: String,
      default: ''
    },
    useActiveClass:{
      type: Boolean,
      default: true
    },
    option: {
      type: Array,
      required: true
    }
  },
  methods: {
    handleClick(item) {
      this.$emit('tabChange', item)
    },
    closeCustomDialog(){
      this.$emit('closeCustomDialog')
    }
  },
  computed: {
    activeName() {
      return this.initActiveName || this.option[0].name
    }
  }
}
</script>

<style lang="scss" scoped>
.tabRow {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  >div{
    height: 100%;
    display: flex;
    align-items: center;
  }
  img{
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}
.label-item {
  cursor: pointer;
  color: #333333;
  font-family: PingFang SC-Medium, PingFang SC;
  height: 100%;
  display: flex;
  align-items: center;
  border-top: 4px solid #fff;
  font-size: 16px;
  margin-right: 20px;
  font-weight: 500;
}
.label-active {
  font-size: 18px;
  color: #3471FF;
  // border-top: 4px solid #3471FF;
}
</style>
