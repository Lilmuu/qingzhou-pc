<template>
  <el-dropdown trigger="click" class="dropdownItem">
    <span class="el-dropdown-link">{{ prefix }}&nbsp;<span v-if="showActiveName">{{ activeName }}</span> <i class="el-icon-arrow-down el-icon--right" style="margin-left: 30px;"></i></span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item @click.native="handleClick(item)" v-for="(item, index) in option" :key="item.value">{{ item.label }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: "DropDown",
  props: {
    initActiveName: {
      type: String | Number,
      default: ''
    },
    // 是否显示 active
    showActiveName: {
      type: Boolean,
      default: true
    },
    option: {
      type: Array,
      required: true
    },
    prefix: {
      type: String,
      default: '按'
    }
  },
  methods: {
    handleClick(item) {
      this.$emit('selectChange', item)
    }
  },
  computed: {
    activeName() {
      const item = this.option.filter(item => item.value === this.initActiveName)
      return item[0] ? item[0].label : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.el-popper{
  margin-bottom: 6px;
  width: 150px;
  margin-right: -10px;
  margin-top: 15px;
  .el-dropdown-menu__item{
    height: 24px;
    line-height: 24px;
    margin: 0 10px;
    border-radius: 4px;
    padding: 0 10px;
    &:hover{
      background: #F5F6F7;
      color: #646A73;
    }
  }
  ::v-deep.popper__arrow{
    visibility: hidden !important;
  }
}
.dropdownItem {
  background: #F4F4F4;
  padding: 4px 20px;
  display: block;
  cursor: pointer;
}
</style>
