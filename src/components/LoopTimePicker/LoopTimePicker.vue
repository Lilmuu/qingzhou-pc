<template>
  <div class="note-container">
    <div>
      <div class="note-date-row">
        <el-date-picker
                v-model="rangeTimeStart"
                disabled
                type="date"
                placeholder="选择日期">
        </el-date-picker>
        <span style="width: 24px;" />
        <el-time-select
                v-model="rangeTimeEnd"
                :picker-options="{
                start: '08:30',
                step: '00:15',
                end: '18:30'
              }"
                placeholder="选择时间">
        </el-time-select>
      </div>
      <DatePicker v-model="rangeTimeStart" />
    </div>
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
  data() {
    return {
      rangeTimeStart: new Date(),
      rangeTimeEnd: dayjs(new Date()).format('HH:mm'),
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.note-container {
  min-height: 340px;
  padding: 10px 5px 10px 5px;
}
.note-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 250px;
  }
}
</style>
