<template>
  <div ref="timePickSlot" class="note-container" :style="{height:heightAutos>0?heightAutos+'px':'auto'}">
    <div>
      <div class="note-date-row customClass">
        <el-date-picker
          v-model="rangeTimeStart"
          class="normal-input"
          type="date"
          size="small"
          placeholder="选择日期">
        </el-date-picker>
        <span style="width: 24px;" />
        <el-time-picker
          v-model="rangeTimeEnd"
          class="normal-input-time"
          format="HH:mm"
          value-format="HH:mm"
          :clearable="false"
          placeholder="选择时间">
        </el-time-picker>
        <div class="modelBox"></div>
      </div>
      <DatePicker v-model="rangeTimeStart" />
    </div>
    <slot name="buttonBox">

    </slot>
  </div>
</template>

<script>
import DatePicker from "@/components/LoopTimePicker/DatePicker";
import dayjs from "dayjs";
export default {
  name: "LoopTImePicker",
  components: {
    DatePicker,
  },
  props:{
    heightAutos:{
      type:String,
      default:'350'
    }
  },
  data() {
    return {
      rangeTimeStart: new Date(),
      rangeTimeEnd: dayjs().add(5, 'minute').format('HH:mm'),
    }
  },
  methods: {
  },
  mounted() {
    this.$refs.timePickSlot.getElementsByClassName('normal-input')[0].lastElementChild.children[0].firstElementChild.className += ' el-icon-date'
    this.$refs.timePickSlot.getElementsByClassName('normal-input-time')[0].lastElementChild.children[0].firstElementChild.className += ' el-icon-time'
  }
}
</script>

<style lang="scss">
// .note-container {
//   height: 350px;
// }
.note-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position:relative;
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 145px;
  }
  .modelBox{
    position:absolute;
    width: 240px;
    left: 0px;
    top: 0px;
    height: 40px;
  }
}
.normal-input{
  .el-input__inner{
    height: 36px;
    border: 1px solid #DEE0E3;
    background:#fff;
    border-radius: 6px;
    font-size: 14px;
    color: #37476B;
  }
}

.customClass{
  .el-input__suffix{
    display: none;
  }
}

.normal-input-time{
  .el-input__inner{
    height: 36px;
    border: 1px solid #DEE0E3;
    background:#fff;
    border-radius: 6px;
    font-size: 14px;
    color: #37476B;
    text-align: center;
  }
}
.tipsBody .el-date-picker__header{
  margin:14px 0 !important;
}

.note-date-row .el-input__prefix {
    .el-input__icon {
        display: none;
    }
}
</style>
