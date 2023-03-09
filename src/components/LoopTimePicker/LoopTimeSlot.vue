<template>
    <div class="loop_task_container" :class="{'loop_task_container_noIcon': !icon}" style="padding-bottom:1px;">
        <el-form class="loop-form"
          status-icon
          :rules="formRule"
          ref="loginForm"
          size="large"
          :model="timeForm"
          label-position="right"
          >
          <!-- 循环周期 月、周、工作日、每日 -->
          <el-form-item prop="loop">
            <img v-show="icon" class="icon_img" src="@/assets/img/mytodo/new_task/newTask_repeat.png" alt="">
            <div class="form_cont">
              <el-select v-model="timeForm.loop" placeholder="请选择重复频率" style="width: 100%;" @change="changeLoop">
                <el-option :label="item.label"
                  :value="item.value"
                  v-for="(item, index) in loopOptions"
                  :key="'loopOptions' + index">
                </el-option>
              </el-select>
              <!-- 每周 -->
              <div class="loopTimerPickerContainer" v-if="timeForm.loop === 3">
              <div @click="handleSetWeekendsIndex(index)"
                 ref="testweek"
                 class="w-date-item cursor flex-center"
                 :class="weekendsIndex.includes(index) ? 'item-active' : ''"
                 v-for="(item, index) in weekendsDateList"
                 :key="'weekendsDateList' + index">{{ item }}</div>
              </div>

              <!-- 每月 -->
              <div v-if="timeForm.loop === 4">
              <div class="monthPicker">
                <div @click="handleSetMonthIndex(item)"
                  class="month-date-item cursor flex-center"
                  :class="{'no_bag': item == 100}"
                  v-for="(item, index) in monthDateList"
                  :key="'weekendsDateList' + index">
                  <div class="month-date-item-inner flex-center" :class="{ 'item_active': monthIndex.includes(Number(item))}">{{ item == 100 ? '': item }}</div>
                  </div>
                  <div class="month-bottom-date">
                    <div class="month_one_day"><div class="month-b-inner cursor flex-center" @click="handleSetMonthIndex(0)" :class="{'item_active' : monthIndex.includes(0)}">第一个工作日</div></div>
                    <div class="month_all_day"><div class="month-b-inner cursor flex-center" @click="handleSetMonthIndex(32)" :class="{'item_active' : monthIndex.includes(32)}">最后一个工作日</div></div>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 时间选择 -->
          <el-form-item class="date_item" prop="times">
            <img v-show="icon" class="icon_img" src="@/assets/img/mytodo/new_task/newTask_time.png" alt="">
            <div class="form_cont">
              <div>
                <el-time-picker v-model="timeForm.time1"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="请选择时间"
                  :disabled="timePickerDisabled">
                </el-time-picker>
                <img v-if="!isRemind" class="line" src="@/assets/img/mytodo/new_task/line_excessive.png" alt="">
                <el-time-picker v-if="!isRemind" v-model="timeForm.time2"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="请选择时间"
                  :disabled="timePickerDisabled">
                </el-time-picker>
              </div>
              <el-checkbox v-if="showAllDayCheck" v-model="timeForm.allDay"  @change="allDayFun">全天</el-checkbox>
            </div>
          </el-form-item>

          <el-form-item class='end_time' prop="endTime">
            <img v-show="icon" class="icon_img" src="@/assets/img/mytodo/new_task/newTask_endTime.png" alt="">
            <div class="form_cont">
              <div>
                <el-date-picker
                class="deadline"
                v-model="timeForm.endTime"
                type="date"
                format="yyyy-MM-dd"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd"
                placeholder="请选择截止日期"
                :disabled="datePickerDisabled">
              </el-date-picker>
              <div v-if="showForever">
                <el-checkbox v-model="timeForm.forever" @change="foreverFun">永久</el-checkbox>
              </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
        <slot name="buttonBox"></slot>
    </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
const monthDateList = []
for (let i = 1; i <= 31; i++) {
  monthDateList.push(i)
}
monthDateList.unshift(100,100,100,100)
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    isRemind: {
      type: Boolean,
      default: false
    },
    isMultiple: {
      type: Boolean,
      default: true
    },
    timeForm: {
      type: Object,
      default: () => {
        return {
          loop: 3,
          endTime: '',
          allDay: false,
          forever: false,
          time1: '',
          time2: '',
          weekendsIndex: [0],
          monthIndex: [1]
        }
      }
    },
    formRule: {
      type: Object,
      default: () => {
        return {}
      }
    },
    showForever: {
      type: Boolean,
      default: true,
    },
    flag: {
      type: Number,
      default: 0,
    },
    icon:{
      type: Boolean,
      default: true,
    },
    showAllDayCheck:{
      type:Boolean,
      default:true
    }
  },
  data() {
    // 这里存放数据
    return {
        loopOptions: [
            { label: '每1自然日', value: 1 },
            { label: '每1工作日', value: 2 },
            { label: '每1周', value: 3 },
            { label: '每1月', value: 4 },
        ],
        // weekendsIndex: [0],
        weekendsIndex: this.timeForm.weekendsIndex,
        weekendsDateList: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        monthDateList: monthDateList,
        monthIndex: this.timeForm.monthIndex,
        pickerOptions: {
            disabledDate: time => {
                return time.getTime() < new Date().getTime() - 8.64e7 ;
            }
        },
        datePickerDisabled: false,
        timePickerDisabled: false
    };
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {
      timeForm() {
          console.log("数据更改")
        this.timePickerDisabled = this.timeForm.allDay;
        this.datePickerDisabled = this.timeForm.forever;
        this.weekendsIndex = this.timeForm.weekendsIndex;
        this.monthIndex = this.timeForm.monthIndex;
      }
  },
  // 方法集合
  methods: {
      // 周 时间选中
        handleSetWeekendsIndex(index) {
          if(this.weekendsIndex.includes(index)) {
            this.weekendsIndex.splice(this.weekendsIndex.indexOf(index),1);
            this.timeForm.weekendsIndex = this.weekendsIndex
            this.$forceUpdate();
          }else {
            this.weekendsIndex.push(index);
            this.weekendsIndex.sort((a, b) => {return a - b});
            this.timeForm.weekendsIndex = this.weekendsIndex
          }
        },
        handleSetMonthIndex(index) {
          if(index == 100) return
          if(this.monthIndex.includes(index)) {
            this.monthIndex.splice(this.monthIndex.indexOf(index),1);
            this.timeForm.monthIndex = this.monthIndex
            this.$forceUpdate();
          }else {
            this.monthIndex.push(index);
            this.monthIndex.sort((a, b) => {return a - b});
            this.timeForm.monthIndex = this.monthIndex
            this.$forceUpdate();
          }
          console.log('this.monthIndex,',this.monthIndex)
        },
        changeLoop(val) {
            this.timeForm.loop = val;
            this.weekendsIndex = [0] ;
            this.timeForm.weekendsIndex = [0] ;
            this.monthIndex = [1] ;
            this.timeForm.monthIndex = [1] ;
            //this.timeForm.endTime = "" ;
            this.timeForm.allDay = false ;
            this.timeForm.forever = false;
            this.datePickerDisabled = false;
            this.timePickerDisabled = false
        },
        foreverFun(val) {
            if(val) {
                this.timeForm.endTime = "" ;
            }
            this.datePickerDisabled = val
        },
        allDayFun(val) {
          if(val) {
            this.timeForm.time1 = "";
            this.timeForm.time2 = "" ;
          }
          this.timePickerDisabled = val
        },
        dataChange(){
          this.timePickerDisabled = this.timeForm.allDay;
          this.datePickerDisabled = this.timeForm.forever;
        }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.dataChange()
    document.getElementsByClassName('deadline')[0].lastElementChild.children[0].firstElementChild.className += ' el-icon-date';
  },
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {}, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang='scss'>
//@import url(); 引入公共css类
.loop-form{
  input{
    border: 1px solid #DCDFE6 !important;
    background:rgba(0,0,0,0);
  }
  .time_col {
    .el-input__icon {
      display: none;
    }
  }
  .el-input--prefix .el-input__inner {
    padding-left: 10px;
  }
  .deadline {
    .el-input__prefix {
      .el-input__icon {
          display: none;
      }
    }
  }
}
</style>
