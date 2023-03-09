<!--
 * @Author: your name
 * @Date: 2022-03-22 09:55:08
 * @LastEditTime: 2022-06-16 19:47:15
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\takeCare\taskItemContent.vue
-->
<template>
  <div class="task_item">
    <div :class=" noRead?'item_title' : 'no-read item_title'" >
      <div>
        <el-tooltip popper-class="import-class" content="重要" placement="top" effect="dark" v-if="importantVal">
          <img src="@/assets/img/task/imp.png" />
        </el-tooltip>
        <el-tooltip popper-class="import-class" content="紧急" placement="top" effect="dark" v-if="urgentVal">
          <img src="@/assets/img/task/urgent.png" />
        </el-tooltip>
        <div>{{itemData.name}}</div>
      </div>
      <img v-if="topXinXin(itemData)" src="@/assets/img/task/collection_active.png" @click.stop="changeIsTop(0)"/>
      <img v-else src="@/assets/img/task/collection.png" @click.stop="changeIsTop(1)"/>
    </div>
    <div class="task_content">
      <span v-if="taskType">{{ taskType }}</span>
      <!-- <p v-html="itemData.content"></p> -->
      <p :class="taskType? 'one-cont set-width' : 'one-cont'">{{ formatCont(itemData.content) }}</p>
    </div>
    <div class="task_msg">
      <div>
        <img src="@/assets/img/task/icon_Initiator.png" alt="">
        <span>{{ itemData.initiator }}</span>
      </div>
      <div>
        <img src="@/assets/img/task/icon_end_time.png" alt="">
        <span>{{ itemData.endTime }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { addCanCalTop } from "@/api/taskCare.js";
import { mapGetters } from 'vuex'
export default {
  props:{
    itemData:{
      type: Object,
      default: ()=>{
        return {}
      }
    },
    // 是否已读
    noRead:{
      type: Boolean,
      default: ()=>{
        return true
      }
    },
  },
  data(){
    return {

    }
  },
  computed:{
    ...mapGetters(["userId"]),
    urgentVal(){
      return this.itemData.emergencyLevel == 3 || this.itemData.emergencyLevel == 1
    },
    importantVal(){
      return this.itemData.emergencyLevel == 3 || this.itemData.emergencyLevel == 2
    },
    isMe() {
      if (this.itemData.feedbackList) {
        let newVal = this.itemData.feedbackList.indexOf(this.userId);
        return newVal !== -1 ? true : false;
      } else {
        return false;
      }
    },
    taskType(){
      if(this.isMe){
        return this.itemData.taskFlag ? this.itemData.taskFlag == "2" ? "[任务反馈]" : "" : ""
      }else{
        return this.itemData.taskFlag ? this.itemData.taskFlag === "1" ? "[任务编辑]" : this.itemData.taskFlag === "3" ? "[任务验收]" : "" : ""
      }
    },
    formatCont(){
      return (value)=>{
        let newVal = value.replace(/<br\/?>/g,' ')
        return newVal
      }
    },
    topXinXin(){
      return (itemVal)=>{
        // 自己是不是发起人
        if(itemVal.initiatorId == this.userId){
          return itemVal.initiatorTop
        }else{
          return itemVal.executorTop
        }
      }
    }
  },
  mounted(){
    console.log(this.itemData,'this.itemData')
  },
  methods:{
    changeIsTop(type) {
      addCanCalTop({id: this.itemData.id, top: type}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(type ? "置顶成功" : "取消置顶成功");
          this.$emit('refreshList')
        }
      });
    },
  }
}
</script>

<style lang='scss' scoped>
.task_item{
  width: 100%;
  font-size: 14px;
  .item_title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #1F2329;
    >div{
      display: flex;
      align-items: center;
      img{
        width: 14px;
        margin-right: 10px;
      }
    }
    img{
      width: 14px;
    }
  }
  .no-read::before{
    position: absolute;
    left: 4px;
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #3370FF;
  }
  .task_content{
    display: flex;
    align-items: center;
    color: #646A73;
    margin: 12px 0;
    line-height: 20px;
    .one-cont{
      margin: 0;
      width: 100%;
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .set-width{
      width: calc(100% - 80px);
    }
    span{
      margin-right: 10px;
      display: inline-block;
      width: 70px;
      color: #1F2329;
    }
  }
  .task_msg{
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #8F959E;
    img{
      margin-right: 10px;
      width: 12px;
    }
    >div{
      display: flex;
      align-items: center;
      margin-right: 30px;
    }
  }
}
.task_item::after{
  position: absolute;
  content: "";
  bottom: 0px;
  left:0;
  right:0;
  margin:auto;
  height: 1px;
  width: 97%;
  background-color: #F5F6F7;
}
</style>