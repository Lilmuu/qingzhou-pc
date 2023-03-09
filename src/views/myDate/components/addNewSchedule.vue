<template>
  <div
    class="scheduleModal"
    v-if="dialogFormVisible"
    :style="{
      top: modalTopNew ? modalTopNew + 'px' : '',
      left: modalLeft ? modalLeft + 'px' : '',
      right: modalRight ? modalRight + 'px' : '',
      bottom: modalBottom ? modalBottom + 'px' : '',
    }"
  >
    <div class="dialog-header-row" style="align-items: center">
      <span class="">新建日程</span>
      <img @click="reset" src="@/assets/img/calendar/close.png" alt="">
    </div>
    <div class="dialogForm">
      <div class="formItem">
        <div class="formLabel">
          <img src="@/assets/img/calendar/icon_tickets1.png" alt="">
        </div>
        <div class="formContent customInput">
          <el-input
            v-model="form.content"
            size="small"
            placeholder="输入日程标题内容"
            maxlength="100"
          ></el-input>
        </div>
      </div>
      <div class="formItem">
        <div class="formLabel">
          <img src="@/assets/img/calendar/icon_time1.png" alt="">
        </div>
        <div class="formContent formContentTwo customInput">
          <div class="dateArea">
            <el-date-picker
              v-model="form.startDate"
              type="date"
              size="small"
              :clearable="false"
              value-format="yyyy-MM-dd"
              :picker-options="dateOptions"
              :style="{ width: setTime ? '100px' : '100%' }"
              @change="startDateChange"
            >
            </el-date-picker>
            <el-time-select
              v-if="setTime"
              v-model="form.startTime"
              :picker-options="{
                start: '00:00',
                step: '00:15',
                end: '23:45',
              }"
              size="small"
              :clearable="false"
              @change="timeChange"
              style="width: 50px;"
            >
              <!-- start: form.startTime, -->
            </el-time-select>
          </div>
          <img class="arrowRight" src="@/assets/img/calendar/arrowRight.png" alt="">
          <div class="dateArea">
            <el-date-picker
              v-model="form.endDate"
              type="date"
              size="small"
              :clearable="false"
              value-format="yyyy-MM-dd"
              :picker-options="dateEndOptions"
              :style="{ width: setTime ? '100px' : '100%' }"
              @change="endDateChange"
            >
            </el-date-picker>
            <el-time-select
              v-if="setTime"
              v-model="form.endTime"
              :picker-options="{
                start: endTimeRule,
                step: '00:15',
                end: '23:45',
              }"
              size="small"
              :clearable="false"
              @change="timeChange"
              style="width: 50px;"
            >
            </el-time-select>
          </div>
        </div>
        <div style="margin-left: 35px;">
          <el-checkbox v-model="setTime">设置时间</el-checkbox>
        </div>
      </div>
      <div class="formItem">
        <div class="formLabel">
          <img src="@/assets/img/calendar/icon_bell1.png" alt="">
        </div>
        <div class="formContent customInput form-content-select">
          <el-date-picker
            v-model="form.remindTime"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            type="datetime"
            default-time="17:00:00"
            size="small"
          >
          </el-date-picker>
          <!-- <el-select 
            size="small" 
            width='210px' 
            multiple 
            v-model="form.informWayVal" 
            placeholder="请选择提醒方式">
            <el-option
              v-for="item in tipsF"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select> -->
          <el-checkbox-group v-model="form.informWayVal">
            <el-checkbox v-for="item in tipsF"
              :key="item.value" 
              :label="item.value">
              {{item.label}}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>
    <div class="modalFooter">
      <el-button class="cancelButton" @click="reset" size="small">取消</el-button>
      <el-button type="primary" @click="handleSubmit" size="small" :loading="disableBtn">创建</el-button>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import * as utils from "@/views/myDate/components/utils";
import { saveTaskRemind } from "@/api/calendar";
export default {
  name: "WorkspaceJsonAddnewschedule",
  props: [
    "scheduleHeihgt",
    "scheduleTop",
    "scheduleWidth",
    "scheduleLeft",
    "time",
    "weekList",
    "dateType",
  ],
  data() {
    return {
      modalTop: null,
      modalLeft: null,
      modalRight: null,
      modalBottom: null,
      dialogFormVisible: false,
      form: {
        content: "",
        remindTime: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        informWayVal: [],  // 应用内通知-1  短信通知-0
      },
      setTime: true,
      remindOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        },
      },
      dateOptions: {
        // disabledDate(time) {
        //     return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        // }
      },
      dateEndOptions: {},
      colIndex: 0,
      moveIndex: 0,
      dateHandle: "",
      startDateMove: false,
      endDateMove: false,
      position: "",
      cellWidth: 0,
      tipsF: [
        { value: 1, label: '应用内通知'}, 
        { value: 0, label: '短信通知'}],
      disableBtn:false
    };
  },
  mounted() {},
  computed: {
    calculateEndTime() {
      return dayjs(
        `${dayjs(new Date()).format("YYYY-MM-DD")} ${this.form.startTime}`
      )
        .add(30, "minute")
        .format("HH:mm");
    },
    modalTopNew() {
      return this.modalTop < 0 ? 155 : this.modalTop;
    },
    endTimeRule() {
      const day_minute_length = dayjs(this.form.endDate).diff(
        dayjs(this.form.startDate),
        "minute"
      );
      if (day_minute_length == 0) {
        let newStartTime = new Date(
          `${this.form.startDate} ${this.form.startTime}`
        ).getTime();
        let newEndTime = dayjs(newStartTime + 1000 * 60 * 30).format("HH:mm");
        return newEndTime;
      } else {
        return "00:00";
      }
    },
  },
  methods: {
    init({ position, colIndex, moveIndex, startTime = "", endTime = "", cellWidth,}) {
      if (colIndex) this.colIndex = colIndex;
      if (moveIndex) this.moveIndex = moveIndex;
      this.position = position;
      if (cellWidth) this.cellWidth = cellWidth;
      this.modalPosition(position);
      if (startTime == "" && endTime == "") {
        this.calculateTime();
      } else {
        this.form.startDate = startTime;
        this.form.endDate = endTime;
        this.form.startTime = "00:00";
        this.form.endTime = "00:30";
        this.setTime = false;
      }
      this.tigTimeFun()
      // if (this.compareTime()) {
      //   this.form.remindTime = new Date(`${dayjs(new Date()).format("YYYY-MM-DD")} :17:00:00`);
      // } else {
      //   this.form.remindTime = new Date(`${dayjs(new Date()).add(1, "day").format("YYYY-MM-DD")} :17:00:00`);
      //   this.remindOptions = {
      //     disabledDate(time) {
      //       return time.getTime() < Date.now();
      //     },
      //   };
      // }
      this.form.informWayVal = []
    },

    compareTime(startTime) {
      // let startTime = `${this.form.startDate} ${this.form.startTime}`
      const [hour, minute, seconds] = dayjs(startTime)
        .format("HH:mm:ss")
        .split(":");
      const fixTime = 17 * (60 * 60 * 1000);
      const nowTime =
        hour * (60 * 60 * 1000) + minute * (60 * 1000) + seconds * 1000;
      return fixTime > nowTime ? true : false;
    },

    tigTimeFun(){
      let startTime = `${this.form.startDate} ${this.form.startTime}`
      if (this.compareTime(startTime)) {
        this.form.remindTime = new Date(`${dayjs(startTime).format("YYYY-MM-DD")} :17:00:00`);
      } else {
        this.form.remindTime = new Date(`${dayjs(startTime).add(1, "day").format("YYYY-MM-DD")} :17:00:00`);
        this.remindOptions = {
          disabledDate(time) {
            return time.getTime() < Date.now();
          },
        };
      }
    },




    modalPosition(position) {
      window.innerWidth - (position.right + 545) > 0
        ? (() => {
            this.modalRight = null;
            this.modalLeft = position.right + 10;
          })()
        : (() => {
            this.modalLeft = null;
            this.modalRight = window.innerWidth - position.left + 10;
            if (position.left < 535) {
              this.modalRight -= 300;
            }
          })();
      window.innerHeight - (370 + position.top) > 0
        ? (() => {
            this.modalBottom = null;
            this.modalTop = position.top;
          })()
        : (() => {
            this.modalTop = null;
            this.modalBottom = window.innerHeight - position.bottom > 0 ? window.innerHeight - position.bottom : 10;
          })();
      this.dialogFormVisible = true;
    },
    calculateTime() {
      this.translateDate();
      this.form.startTime = this.translateTime(this.scheduleTop);
      this.form.endTime = this.translateTime(this.scheduleTop + this.scheduleHeihgt);
    },
    translateTime(time) {
      let hour = 0,
        minute = 0;
      hour =
        Math.floor(time / 60) < 10
          ? `0${Math.floor(time / 60)}`
          : Math.floor(time / 60);
      // if (hour == 24) {
      //   hour = "00";
      //   this.form.endDate = dayjs(
      //     dayjs(this.form.endDate).add(1, "day")
      //   ).format("YYYY-MM-DD");
      // }
      if (time % 60 == 0) {
        return hour == 24 ? `23:59` : `${hour}:00`;
      } else {
        minute = time % 60;
        return `${hour}:${minute}`;
      }
    },
    translateDate() {
      const containerLeft = document.querySelector(".time_task_container").getBoundingClientRect().left + 1;
      const currentDate = utils.getDate(this.time.year,this.time.month,this.time.day);
      const initialDate = dayjs(currentDate).add(this.weekList[0], "day").format("YYYY-MM-DD");
      const ElLeftIndex = Math.ceil((this.position.left - containerLeft) / this.cellWidth);
      const ELRightIndex = Math.floor(this.position.width / this.cellWidth);
      this.dateType == "day" ? (() => {
          this.form.startDate = this.form.endDate = dayjs(new Date()).format("YYYY-MM-DD");
        })()
        : this.dateType == "3day" ? (()=>{
          this.form.startDate = dayjs(currentDate).add(ElLeftIndex, "day").format("YYYY-MM-DD");
          this.form.endDate = dayjs(this.form.startDate).add(ELRightIndex, "day").format("YYYY-MM-DD");
        })()
        :
        (() => { 
            this.form.startDate = dayjs(initialDate).add(ElLeftIndex, "day").format("YYYY-MM-DD");
            this.form.endDate = dayjs(this.form.startDate).add(ELRightIndex, "day").format("YYYY-MM-DD");
          })();
      this.dateHandle = JSON.parse(JSON.stringify(this.form.startDate));
      this.dateEndOptions = {
        disabledDate: (time) => {
          return time.getTime() < Date.parse(this.form.startDate);
        },
      };
    },
    // startTimeChange() {
    //   this.$emit("startTimeChanges", this.form.startTime);
    // },
    // endTimeChange() {
    //   this.$emit("endTimeChanges", this.form.endTime);
    // },
    timeChange(){
      this.$emit("timeChanges", this.form);
      this.tigTimeFun()
    },


    startDateChange(val) {
      const diffDay = (dayjs(val) - dayjs(this.dateHandle)) / (24 * 60 * 60 * 1000);
      this.$emit("startDateChanges", { diffDay, colIndex: this.colIndex });
      this.tigTimeFun()
    },
    endDateChange(val) {
      const diffDay = (dayjs(val) - dayjs(this.dateHandle)) / (24 * 60 * 60 * 1000);
      this.$emit("endDateChanges", { diffDay, colIndex: this.colIndex });
    },
    closeModal() {
      this.dialogFormVisible = false;
    },
    reset() {
      this.dialogFormVisible = false;
      Object.keys(this.form).forEach((item) => {
        this.form[item] = "";
      });
      this.setTime = true;
      this.$emit("closeSchedule");
    },
    handleSubmit() {
      if (this.form.content == "") {
        this.$message.error("日程内容不能为空!");
        return;
      }
      let newForm = JSON.parse(JSON.stringify(this.form));
      if (this.setTime) {
        newForm.startTime = `${dayjs(newForm.startDate).format('YYYY-MM-DD')} ${
          this.setTime ? newForm.startTime : ""
        }`;
        newForm.endTime = `${dayjs(newForm.endDate).format('YYYY-MM-DD')} ${
          this.setTime ? newForm.endTime : ""
        }`;
        // newForm.startTime=`${dayjs(newForm.startTime).format('YYYY-MM-DD HH:mm')}`
        console.log(newForm.startTime,'haksdhnqkwjdwkj')
      } else {
        let startDate = new Date(newForm.startDate).getTime()
        newForm.startTime = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00`;

        // newForm.startTime = `${newForm.startDate} 00:00`;
        let time = new Date(newForm.endDate).getTime()
        // newForm.endTime = `${dayjs(time).format('YYYY-MM-DD')} 00:00`
        newForm.endTime = `${dayjs(time).format('YYYY-MM-DD')} 23:59`;
      }

      let day_minute_length = dayjs(newForm.endTime).diff(dayjs(newForm.startTime),"minute");
      if (day_minute_length <= 0) {
        this.$message.error("结束时间不能小于开始时间!");
        this.$emit("success");
        this.dialogFormVisible = false;
        return;
      }
      this.disableBtn = true
      newForm.remindRules = [
        {
          remindDate:dayjs(this.form.remindTime).format('YYYY-MM-DD'),
          remindTime:dayjs(this.form.remindTime).format('HH:mm')
        }
      ]
      saveTaskRemind(newForm).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("新建个人提醒成功");
          this.form.content = ""
          this.$emit("success");
          this.disableBtn = false
          this.dialogFormVisible = false;
        }
      });
      
    },

  },
};
</script>

<style lang="scss" scoped>
.scheduleModal {
  width: 580px;
  height: 370px;
  position: fixed;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  z-index: 99;
  .modalFooter {
    padding: 0 30px;
    text-align: right;
    ::v-deep .el-button{
      width: 84px;
      height: 32px;
      font-size: 14px;
    }
    .cancelButton:hover{
      background: rgba(222, 224, 227, 0.2);
    }
  }
  .dialog-header-row{
    padding: 0 30px;
    height: 52px;
    color: #1F2329;
    border: none;
    span{
      font-size: 18px;
      font-family: PingFang SC-Medium, PingFang SC;
      color: #333;
      display: flex;
      height: 100%;
      align-items: center;
      // border-top: 4px solid #3471FF;
      font-weight: 500;
    }
    img{
      width: 16px;
      height: 16px;
      margin-left: auto;
      cursor: pointer;
    }
  }
}
.dialogForm {
  height: 276px;
  padding: 24px 30px 0;
  .formItem {
    width: 100%;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    .formLabel {
      margin-right: 24px;
      img{width: 16px;};
    }
    .formContent {
      flex: 1;
      .dateArea {
        width: 45%;
        display: flex;
        justify-content: space-between;
        .el-input--small:nth-of-type(2) {
          width: 30%;
        }
        ::v-deep .el-input__inner {
          padding: 0!important;
        }
      }
      .arrowRight{
        width: 18px;
        height: 7px;
      }
      > span {
        display: flex;
        width: 6%;
        justify-content: center;
        align-items: center;
      }
      ::v-deep .el-input__inner{
        border-radius: 6px;
        color: #37476B;
      }
      ::v-deep .el-checkbox-group{
        display: flex;
        align-items: center;
      }
    }
    .formContentTwo{
      display: flex; 
      justify-content: space-between;
      align-items: center;
      ::v-deep .el-input__inner{
        text-align: center
      }
    }
    .form-content-select{
      display: flex;
      justify-content: space-between;
      ::v-deep .el-date-editor{
        width: 160px;
      }
      ::v-deep .el-input--small .el-icon-circle-close{
        position: relative;
        height: 32px;
        display: flex;
        align-items: center;
        &::before{
          content: '';
          position: absolute;
          right: 2px;
          width: 12px;
          height: 12px;
          background: url('../../../assets/img/calendar/close2.png') no-repeat;
          background-size: 100%;
        }
      }
    }
    &:nth-last-of-type(1) {
      margin-bottom: 0;
    }
  }
  .customInput{
    ::v-deep .el-input--small {
      width: 100%;
      .el-input__prefix {
        display: none;
      }
      .el-input__inner {
        padding: 0 0 0 8px;
        font-size: 14px;
        font-family: PingFang SC-Light, PingFang SC;
      }
    }
  }
}

</style>

<style>
.time-select .el-picker-panel__content{
  max-height: 180px;
}
.time-select-item{
  padding: 8px 0;
  text-align: center;
}
</style>