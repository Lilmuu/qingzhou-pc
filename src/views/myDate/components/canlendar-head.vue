<template>
  <div class="calendar-header clear">
    <div class="calendar-box">
      <div class="calendar-content">
        <div class="calendar_left">
          <div class="today" @click="handleToday">今天</div>
          <div class="switch_btn">
            <div class="btn_pre" @click="handlePrev"><img src="@/assets/icon/icon_arrow_left.png" alt=""></div>
            <div class="vertical_line"></div>
            <div class="btn_next" @click="handleNext"><img src="@/assets/icon/icon_arrow_right.png" alt=""></div>
          </div>
          <span class="calendar-headDate"> {{ dateTitle }} </span>
          <div class="vertical_line_to"></div>
          <div v-if="!!userId && String(activeUser.id) === String(userId)" class="me_schedule" @click="myDateDialog = true">我的日程</div>
          <div v-else class="user_schedule">
            <div @click="myDateDialog = true">{{activeUser.realName}}的日程</div>
            <div class="vertical_line"></div>
            <img @click.stop="changeActiveUser({})" src="@/assets/icon/icon_back.png" alt="">
          </div>
        </div>
        <div class="calendar_right">
          <div v-if="!!userId && String(activeUser.id) === String(userId)" class="add_calendar" @click="createSchedule">创建日程</div>
          <div class="calendar_type">
            <div @click="handleToDate('day')" :class="dateType === 'day' ? 'select_type' : ''">日</div>
            <div @click="handleToDate('3day')" :class="dateType === '3day' ? 'select_type' : ''">三日</div>
            <div @click="handleToDate('week')" :class="dateType === 'week' ? 'select_type' : ''">周</div>
            <div @click="handleToDate('month')" :class="dateType === 'month' ? 'select_type' : ''">月</div>
          </div>
        </div>
        
        <!-- <span class="calendar-headDate"> {{dateTitle}} </span>
        <span class="calendar-prev flex-center" @click="handlePrev" style="margin-right: 15px;">
          <i class="el-icon-arrow-left"></i>
        </span>
        <span class="calendar-next flex-center" @click="handleNext">
          <i class="el-icon-arrow-right"></i>
        </span>
        <span class="myDateTitle cursor" @click="myDateDialog = true">{{ !!userId && String(activeUser.id) === String(userId) ? `我的日程` : `${activeUser.realName}的日程` }}</span>
        <div class="backRow flex-center cursor"
             @click="changeActiveUser({})"
             v-if="!!userId && String(activeUser.id) !== String(userId)">
          <img src="@/assets/img/calendar/back.png" class="backImg" alt="">
          <span class="backText">返回我的日程</span>
        </div> -->
      </div>
      <!-- <div  class="calendar-today">
        <span :class="dateType === 'day' ? 'today-row-item-active' : 'today-row-item'" @click="handleToDate('day')"> 日 </span>
        <span :class="dateType === '3day' ? 'today-row-item-active' : 'today-row-item'" @click="handleToDate('3day')"> 三日 </span>
        <span :class="dateType === 'week' ? 'today-row-item-active' : 'today-row-item'" @click="handleToDate('week')"> 周 </span>
        <span :class="dateType === 'month' ? 'today-row-item-active' : 'today-row-item'" @click="handleToDate('month')"> 月 </span>
      </div> -->
    </div>
    <!-- 我的日程 选择  -->
    <el-dialog append-to-body
      width="520px"
      class="noPaddingDialog"
      :visible.sync='myDateDialog'
      :show-close="false"
      top="0">
      <div slot="title" class="myDateHeader">
        <span>我的日程</span>
        <img @click="myDateDialog = false" src="@/assets/img/calendar/close.png" alt="">
      </div>
      <MyDate :activeUser="activeUser"
              @changeActiveUser="changeActiveUser"
              @close="closeMyDateDialog"
              v-if="myDateDialog" />
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import * as utils from "@/views/myDate/components/utils"
import MyDate from "@/views/myDate/components/myDate";

const myUserData = {
  id: localStorage.getItem('USERID'),
  realName: localStorage.getItem('USERNAME'),
}

export default {
  props: {
    // [day,3day,week,month]
    dateType: {
      type: String,
      default: 'week'
    },
    time: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      myDateDialog: false,
      activeUser: JSON.parse(JSON.stringify(myUserData))    // { id: '', realName: ''} 选中的人, 默认就是自己
    }
  },
  computed: {
    ...mapState({
      userId: state => state.user.userId
    }),
    dateTitle() {
      const currentDate = utils.getDate(this.time.year, this.time.month, this.time.day)
      if (this.dateType === 'month') {
        return dayjs(currentDate).format('YYYY年MM月')
      }
      return dayjs(currentDate).format('YYYY年MM月DD日')
    }
  },
  components: {
    MyDate
  },
  methods: {
    // 上
    handlePrev() {
      this.$emit('handlePrev')
    },
    // 下
    handleNext() {
      this.$emit('handleNext')
    },
    // 回到今天
    handleToday() {
      this.$emit('handleToday')
    },
    // 状态更改
    handleToDate(dateType) {
      this.$emit('changeDateType', dateType)
    },
    changeActiveUser(user) {
      let activeUser = {}
     if(user.id) {
       activeUser = user
     } else {
       // 取消选中，默认就是自己
       activeUser = JSON.parse(JSON.stringify(myUserData))
     }
      this.activeUser = activeUser
      this.$emit('changeActiveUser', activeUser)
    },
    closeMyDateDialog() {
      this.myDateDialog = false
    },
    createSchedule(){
      this.$emit('handleToday')
      this.$store.commit('setSchedule',true)
    }
  }
}
</script>

<style lang="scss">
.calendar-header {
  margin-bottom: 16px;
  width: 100%;
  border-top: 1px solid #DCDCDC;
  border-bottom: 1px solid #DCDCDC;
  .calendar-box {
    padding: 20px;
    line-height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .calendar-content {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      width: 100%;
      .calendar_left{
        display: flex;
        align-items: center;
        .today{
          width: 48px;
          height: 32px;
          text-align: center;
          color: #1F2329;
          margin-right: 10px;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid #D0D3D6;
        }
        .switch_btn{
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 72px;
          height: 32px;
          margin-right: 20px;
          border-radius: 6px;
          border: 1px solid #D0D3D6;
          
          .btn_next, .btn_pre {
            width: 34px;
            height: 30px;
            cursor: pointer;
            text-align: center;
            img{
              width: 12px;
            }
          }
        }
        .vertical_line{
          width: 1px;
          height: 14px;
          background-color: #D0D3D6;
        }
        .calendar-headDate{
          user-select: none;
          color: #1F2329;
          font-size: 20px;
          margin-right: 20px;
          // font-family: SourceHanSansCN-Medium;
        }
        .vertical_line_to{
          width: 1px;
          height: 14px;
          margin-right: 20px;
          background-color: #D0D3D6;
        }
        .me_schedule{
          width: 84px;
          height: 32px;
          color: #3370FF;
          text-align: center;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid #3370FF;
        }
        .me_schedule:hover{
          background: rgba(51, 112, 255, 0.1);
        }
        .user_schedule{
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 160px;
          height: 32px;
          color: #3370FF;
          border-radius: 6px;
          border: 1px solid #3370FF;
          img{
            width: 14px;
            cursor: pointer;
          }
        }
      }
      .calendar_right{
        display: flex;
        .add_calendar{
          width: 112px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          color: #FFF;
          border-radius: 4px;
          margin-right: 10px;
          cursor: pointer;
          background-color: #3370FF;
        }
        .add_calendar:hover{
          background: #5B8CFF;
        }
        .calendar_type{
          display: flex;
          justify-content: space-around;
          width: 225px;
          height: 32px;
          color: #1F2329;
          border-radius: 6px;
          border: 1px solid #D0D3D6;
          div{
            width: 50px;
            text-align: center;
            cursor: pointer;
          }
          .select_type{
            background-color: #EFF4FF;
            border-radius: 4px;
            color: #3370FF;
          }
        }
      }
      







      .calendar-prev,
      .calendar-next {
        vertical-align: middle;
        width: 19px;
        height: 19px;
        //background: url('./img/left.png') no-repeat;
        //background-size: contain;
        cursor: pointer;
        i {
          font-size: 18px;
          color: #DCDFE6;
          &:hover {
            color: #3471FF;
          }
        }
      }
      .calendar-next {
        //background: url('./img/right.png') no-repeat;
        //background-size: contain;
      }
      .myDateTitle {
        font-size: 18px;
        line-height: 20px;
        color: #3471FF;
        margin-left: 45px;
      }
    }
    .backRow {
      .backImg {
        width: 14px;
        margin-left: 16px;
      }
      .backText {
        font-size: 13px;
        margin-left: 10px;
        line-height: 20px;
        color: #6795FF;
      }
    }
    .dispersion{
      width: initial;
      display: inline;
    }
    .calendar-headDate {
      vertical-align: middle;
      margin: 0 12px;
      font-size: 18px;
      color: #424953;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .calendar-today {
      width: 220px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #DCDCDC;
      margin-right: 10px;
      .today-row-item {
        flex: 1;
        color: #000000;
      }
      .today-row-item-active {
        flex: 1;
        background: #008CFF;
        color: #FFFFFF;
      }
    }
    .dispersion-today{
      position: inherit;
    }
    .calendar-center {
      margin: 0 auto;
    }
    .calendar-left {
      float: left;
    }
    .calendar-right {
      float: right;
    }
  }
}
</style>
