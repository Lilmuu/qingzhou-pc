<!--
 * @Author: your name
 * @Date: 2022-03-22 17:19:57
 * @LastEditTime: 2022-04-27 19:55:37
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\cencelOrClose.vue
-->
<template>
  <el-dialog append-to-body
    width="420px"
    :custom-class="customClass"
    :visible.sync='exitDialog'
    :showClose="false"
    :close-on-click-modal="false">
    <div class="logout_box_content">
      <div>
        <!-- <img src="@/assets/img/icon_logout.png" alt=""> -->
        <slot name="tipsOne"></slot>
      </div>
      <div v-if="openRemarkBox" class="input_textarea">
        <div class="radio" v-if="openRadioBox">
          <el-radio v-model="from.radio" label="1">关闭本次任务</el-radio>
          <el-radio v-model="from.radio" label="2">关闭循环任务</el-radio>
        </div>
        <el-input
          type="textarea"
          v-model="from.remark"
          placeholder="请输入备注说明"
          :autosize="{ minRows: 4 }"></el-input>
      </div>
      <div v-else class="tips_two">
        <slot name="tipsTwo"></slot>
      </div>

      <div class="flex-center">
        <el-button @click="exitDialog = false" >取消</el-button>
        <el-button :type="btnType" @click="handleSubmit" >{{ defineName }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props:{
    defineName:{
      typeof: String,
      default: ()=>{
        return '确定'
      }
    },
    openRemarkBox:{
      typeof: Boolean,
      default: ()=>{
        return false
      }
    },
    openRadioBox:{
      typeof: Boolean,
      default: ()=>{
        return false
      }
    },
    closeHeader:{
      typeof: Boolean,
      default: ()=>{
        return false
      }
    },
    // 按钮类型： danger-红色警告  primary-蓝色
    btnType: {
      typeof: String,
      default: ()=>{
        return 'primary'
      }
    }
  },
  data(){
    return {
      from: {
        radio: "1",
        remark: ''
      },
      loading: false,
      exitDialog: false,
    }
  },
  computed:{
    customClass(){
      return this.closeHeader ? 'cencel_or_close close_header' : 'cencel_or_close'
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('define', this.from)
    }
  }
}
</script>

<style>

</style>
