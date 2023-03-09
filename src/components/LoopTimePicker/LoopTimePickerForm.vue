<template>
  <el-form class="timer-form"
    status-icon
    :rules="formRule"
    ref="loginForm"
    size="mini"
    :model="timeForm"
    label-position="right"
    label-width="85px">
    <el-form-item label="重复频率：" prop="loop">
      <el-col :span="24">
        <el-col :span="18">
          <el-select v-model="timeForm.loop" placeholder="请选择重复频率" style="width: 100%;">
            <el-option :label="item.label"
             :value="item.value"
             v-for="(item, index) in loopOptions"
             :key="'loopOptions' + index"></el-option>
          </el-select>
        </el-col>
      </el-col>
      <el-col :span="24">
        <!-- 每周 -->
        <div class="loopTimerPickerContainer" v-if="timeForm.loop === 3">
          <div @click="handleSetWeekendsIndex(index)"
            class="w-date-item cursor flex-center"
            :class="weekendsIndex === index ? 'item-active' : ''"
            v-for="(item, index) in weekendsDateList"
            :key="'weekendsDateList' + index">{{ item }}</div>
        </div>
        <!-- 每月 -->
        <div style="background: #F3F3F3;margin-right: 45px;" v-if="timeForm.loop === 4">
          <div class="monthPicker">
            <div @click="handleSetMonthIndex(item)"
              class="month-date-item cursor flex-center"
              v-for="(item, index) in monthDateList"
              :key="'weekendsDateList' + index">
              <div class="month-date-item-inner flex-center" :class="monthIndex === Number(item) ? 'item-active' : ''">{{ item }}</div>
            </div>
            <div class="month-bottom-date">
              <div class="month-b-i"><div class="month-b-inner cursor flex-center" @click="handleSetMonthIndex(-1)" :class="monthIndex === -1 ? 'item-active' : ''">第一个工作日</div></div>
              <div class="month-b-i"><div class="month-b-inner cursor flex-center" @click="handleSetMonthIndex(0)" :class="monthIndex === 0 ? 'item-active' : ''">最后一个工作日</div></div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" style="margin-top: 18px;">
        <el-col :span="8">
          <el-time-picker v-model="timeForm.time1"
                          format="HH:mm"
                          value-format="HH:mm"
                          placeholder="请选择时间"
                          style="width: 100%;"></el-time-picker>
        </el-col>
      </el-col>
    </el-form-item>
    <el-form-item label="截止日期：" prop="endTime">
      <el-col :span="24">
        <el-col :span="18">
          <el-date-picker v-model="timeForm.endTime"
                          type="date"
                          format="yyyy-MM-dd"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择截止日期"
                          style="width: 100%;">
          </el-date-picker>
        </el-col>
        <el-col :span="6">
          <el-checkbox v-model="timeForm.forever" style="margin-left: 10px;">永久</el-checkbox>
        </el-col>
      </el-col>
    </el-form-item>
  </el-form>
</template>

<script>
const monthDateList = []
for (let i = 1; i <= 31; i++) {
  monthDateList.push(i)
}

export default {
  name: "LoopTImePickerForm",
  data() {
    return {
      loopDialog: false,
      timeForm: {
        loop: 1,
        endTime: '',
        forever: false,
        time1: '',
      },
      formRule: {

      },
      loopOptions: [
        { label: '每个自然日', value: 1 },
        { label: '每个工作日', value: 2 },
        { label: '每个周', value: 3 },
        { label: '每个月', value: 4 },
      ],
      weekendsIndex: 0,
      weekendsDateList: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      monthDateList: monthDateList,
      monthIndex: 0,
    }
  },
  methods: {
    handleLoopDialogDialog() {
      this.loopDialog = true
    },
    handleSubmit() {
      this.resetForm()
    },
    resetForm() {
      this.loopDialog = false
    },
    // 周 时间选中
    handleSetWeekendsIndex(index) {
      this.weekendsIndex = index
    },
    handleSetMonthIndex(index) {
      this.monthIndex = index
    },
    handleCloseLoopDialog() {
      this.loopDialog = false
    }
  },
}
</script>

<style lang="scss" scoped>
.timer-form {
  padding: 15px 5px 10px 5px;
  min-height: 300px;
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
