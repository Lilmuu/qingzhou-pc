<!--  -->
<template>
  <div class="task-tags-box">
    <div v-for="(tagItem, index) in tagsData" :key="index">
      <!-- 截止日期 -->
      <div v-if="tagItem.tagType=='time'"  class="time_status" >
        <div class="cont">
          <img :src="time">
          <div class="content"> 
            <div>{{ tagItem.content }}</div>
            <div v-if="tagItem.taskState != undefined" :style="{'background-color': taskStateColor(tagItem.taskState)}" class="task_state">{{ taskStateVal(tagItem.taskState) }}</div>
          </div>
        </div>
        <!-- 任务状态 -->
        <div class="cont">
          <img :src="status">
          <div>{{ emergencyLevel(tagItem.status) }}</div>
        </div>
      </div>
        <!-- 执行人/关注人 -->
        <div v-if="tagItem.tagType=='implement' || tagItem.tagType=='follow'"  class="task-tags" >
          <img :src="tagItem.tagType=='implement'?implement:tagItem.tagType=='follow'?follow:''">
          <div>{{ replaceName(tagItem.content, tagItem.tagType) }}</div>
        </div>
        <!-- 发起人 -->
        <div v-else-if="tagItem.tagType=='sender'"  class="task-tags" >
          <img :src="sender">
          <div>{{ tagItem.content }}</div>
        </div>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import time from '@/assets/img/mytodo/new_task/newTask_time.png'
import status from '@/assets/img/mytodo/new_task/newTask_priority.png' // 0待查看 1已查看 2待验收 3已完成 4已关闭
import sender from '@/assets/img/mytodo/new_task/newTask_collect.png'
import implement from '@/assets/img/mytodo/new_task/newTask_execute.png'
import follow from '@/assets/img/mytodo/me_initiate001.png'
import file from '@/assets/img/mytodo/icon_enclosure001.png'
import showTips from '@/assets/img/showTips001.png'
import { emergencyLevelNew } from "@/const/dicData"
import EventBus from '@/eventBus'
export default {
  props:{
    tagsData:{
      type: Array,
      default: ()=>{
        return []
      }
    }
  },
  data() {
    // 这里存放数据
    return {
      time,
      status,
      sender,
      implement,
      follow,
      file,
      showTips,
      imgUrl: "",
      show: false,
      closeImg: require("@/assets/img/icon/closeImg.png"),
      pdfUrl: '', // 预览PDF文件地址
    };
  },
  // 监听属性 类似于data概念
  computed: {
    taskStateVal(){
      return(state)=>{
        let val = state==0 ? '待查看' : state==1 ? '已查看' : state==2 ? "待验收" : state==3 ? "已完成" : state==4 ? "已关闭" : "" 
        return val
      }
    },
    taskStateColor(){
      // #3370FF-待查看 #34C724-已查看  #FF8800-待验收  #F54A45-已关闭  #FFAA00-已完成
      return(state)=>{
        let val = state==0 ? '#3370FF' : state==1 ? '#34C724' : state==2 ? "#FF8800" : state==3 ? "#FFAA00" : state==4 ? "#F54A45" : "" 
        return val
      }
    },
    // 转换优先级
    emergencyLevel(){
      let emergencyLevelName
      return (val)=>{
        emergencyLevelNew.forEach(item=>{
          if(item.value == val){
            emergencyLevelName = item.label
          }
        })
        return emergencyLevelName
      }
    }
  },
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    replaceName(list,type) {
      let s = type === 'implement'? '执行' :type === 'follow' ?  "关注" : ''
      if(list.length > 1) {
        return `${list[0].username}、${list[1].username}等人${s}`
      }
      return `${list[0].username}${s}`
    }
  },
  beforeDestroy() {
    EventBus.$off('previewPictures')
  }, // 生命周期 - 销毁之前
};
</script>
<style lang='scss' scoped>

.task-tags-box {
  display: flex;
  flex-wrap: wrap;
  margin-top: 24px;
  cursor: default;
}

.task-tags{
  padding: 0 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  height: 32px;
  background: #FBFBFC;
  border-radius: 6px;
  font-size: 14px;
  color: #37476B;
  font-family: "SourceHanSansCN-Regular";
  img{
    width: 14px;
    margin-right: 8px;
  }
  .content{
    display: flex;
    align-items: center;
  }
}
.time_status{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 574px;
  margin-bottom: 10px;
  .cont{
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 10px;
    font-size: 14px;
    color: #37476B;
    background: #FBFBFC;
    border-radius: 6px;
    font-family: "SourceHanSansCN-Regular";
    img{
      width: 14px;
      margin-right: 8px;
    }
    .content{
      display: flex;
      align-items: center;
      .task_state{
        color: #FFFFFF;
        padding: 2px 4px;
        margin-left: 8PX;
        border-radius: 6px;
        font-family: "SourceHanSansCN-Light";
      }
    }
  }
  
}
</style>
