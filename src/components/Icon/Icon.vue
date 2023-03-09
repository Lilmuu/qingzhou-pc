<template>
  <div class="iconImgContainer" @click="handleClick">
    <el-tooltip content="处理任务" placement="top" effect="light">
      <div v-if="name === 'setting'" class="iconImg iconImg_setting"/>
    </el-tooltip>
    <el-tooltip content="反馈任务" placement="top" effect="light">
      <div v-if="name === 'report'" class="iconImg iconImg_report"/>
    </el-tooltip>
    <el-tooltip content="完成任务" placement="top" effect="light">
      <div v-if="name === 'check'" class="iconImg iconImg_check"/>
    </el-tooltip>
    <el-tooltip content="关闭任务" placement="top" effect="light">
      <div v-if="name === 'close'" class="iconImg iconImg_close"/>
    </el-tooltip>
    <el-tooltip content="编辑任务" placement="top" effect="light">
      <div v-if="name === 'edit'" class="iconImg iconImg_edit"/>
    </el-tooltip>
    <el-tooltip content="已知晓" placement="top" effect="light">
      <div v-if="name === 'done'" class="iconImg iconImg_done"/>
    </el-tooltip>
    <!--    <img class="iconImg" :src="iconName" alt="" :style="iconStyle">-->
  </div>
</template>

<script>
// const icons = ['setting', 'report', 'check', 'close', 'edit']

export default {
  name: "Icon",
  props: {
    name: {
      type: String,
      required: true
    },
    iconStyle: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
  // computed: {
  //   iconName() {
  //     const name = this.name
  //     if (!icons.includes(name)) {
  //       console.warn(`${name} 不存在`)
  //     }
  //     return `@/assets/img/icon/${name}.png`
  //   }
  // }
}
</script>

<style lang="scss" scoped>
.iconImgContainer {
  width: 26px;
  height: 26px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  cursor: pointer;
  border: 1px solid #AAAAAA;
  &:hover {
    border: none;
    background: #3471FF;
    .iconImg_setting {
      background: url("../../assets/img/icon/setting_active.png") no-repeat center center;
    }
    .iconImg_report {
      background: url("../../assets/img/icon/report_active.png") no-repeat center center;
    }
    .iconImg_check {
      background: url("../../assets/img/icon/check_active.png") no-repeat center center;
    }
    .iconImg_close {
      background: url("../../assets/img/icon/close_active.png") no-repeat center center;
    }
    .iconImg_edit {
      background: url("../../assets/img/icon/edit_active.png") no-repeat center center;
    }
    .iconImg_done {
      background: url("../../assets/img/icon/done_active.png") no-repeat center center;
    }
  }
}
.iconImg {
  display: block;
  background-size: contain!important;
}
.iconImg_setting {
  width: 15px;
  height: 15px;
  background: url("../../assets/img/icon/setting.png") no-repeat center center;
}
.iconImg_report {
  width: 16px;
  height: 16px;
  background: url("../../assets/img/icon/report.png") no-repeat center center;
}
.iconImg_check {
  width: 15px;
  height: 15px;
  background: url("../../assets/img/icon/check.png") no-repeat center center;
}
.iconImg_close {
  width: 12px;
  height: 12px;
  background: url("../../assets/img/icon/close.png") no-repeat center center;
}
.iconImg_edit {
  width: 15px;
  height: 15px;
  background: url("../../assets/img/icon/edit.png") no-repeat center center;
}
.iconImg_done {
  width: 16px;
  height: 16px;
  background: url("../../assets/img/icon/done.png") no-repeat center center;
}
</style>
