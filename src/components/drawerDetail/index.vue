<!--  任务详情 弹窗 -->
<template>
  <div id="taskDetail" v-if="drawer">
    <el-scrollbar class="task-drawer-inner noScroll" v-if="drawer">
      <!-- 父任务 -->
      <div class="parent_task_name" v-if="rowData.ptaskName || rowData.isCycle == 1">
        <img v-if="rowData.ptaskName" src="@/assets/img/mytodo/new_task/newTask_parent_task.png" />
        <div class="parent_cont" :class="[rowData.isCycle == 1 && !rowData.ptaskName ? 'loop_img': '']">
          <el-tooltip v-if="rowData.ptaskName" effect="dark" :content="rowData.ptaskName" placement="top-start" >
            <span @click="openParentTaskDialog(rowData.pid)"> 父级任务：{{rowData.ptaskName}}</span>
          </el-tooltip>
          <img v-if="rowData.isCycle == 1" src="@/assets/img/mytodo/new_task/newtask_loop.png" alt="">
        </div>
      </div>

      <!-- 任务内容 -->
      <div class="task-body" v-if="rowData.name" style="align-items: baseline;">
        <img src="@/assets/img/mytodo/new_task/newTask_taskContent.png" alt="">
        <div class="right_cont">
          <div class="task_info">
            <div class="task-body_title">{{rowData.name}}</div>
            <div class="task-body-content" v-html="rowData.content"></div>
            <!-- 附件 -->
            <div class="task_file_list" v-if="taskFileList.length > 0">
              <div v-for="(item,index) in taskFileList" :key="'file'+index" class="file_item">
                <el-dropdown trigger="click">
                  <div class="title">
                    <fileIcon :fileUrl="item.fileUrl"></fileIcon>
                    <div class="file_name">{{ item.name? item.name : item.fileName }}</div>
                  </div>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item >
                      <div @click="fileHandleCommand('down',item)">下载</div>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <div  @click="fileHandleCommand('viwe',item)">预览</div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </div>
          <!-- 任务详情-信息 -->
          <tags :tagsData="tagsData" @click="changeShowTips"></tags>
          <!-- 添加提示 -->
          <div :class="[noticeContent?'task-tags-tips-text':'task-tags-tips']" ref="taskTagsTips" @click="showTips" v-if="!isOtherTask && isShowTips && userId == rowData.userId && row.state<=2">
            <img src="@/assets/img/showTips001.png" />
            <span v-if="noticeContent">{{ noticeContent }}</span>
            <span v-else>添加提醒</span>
          </div>
        </div>
      </div>

      <!-- 交流沟通 -->
      <div class="task-call-box" :style="`margin-bottom: ${sendBoxHeight};align-items: baseline;`" v-if="callData.length>0">
        <img src="@/assets/img/mytodo/new_task/newTask_leaving_message.png" alt="">
        <div class="right_cont">
          <div class="task-call-title">交流沟通</div>
          <div class="task-call-body">
            <div v-for="(item, index) in callData" :key="index" class="task-call-item" @mouseenter="mouseEnter(item)">
              <headAvatar 
                :size="30" 
                :fontSize='12'
                :avatarUrl="item.headImage ? item.headImage: ''" 
                :username='item.feedbackName'
                margin="0 10px 0 0">
              </headAvatar>
              <div class="call_right_cont">
                <div class="call_user_header">
                  <!-- <div class="user_name">{{ item.contentList }}</div> -->
                  <div class="user_name">{{ item.feedbackName }}</div>
                  <div :class="{'hide_call_item': showRecall(item)}"> 
                    <img @click="recallFeedbackId(item.id,index)" class="task_call_withdraw" src="@/assets/img/icon_withdraw.png" alt="撤回" >
                    <div class="task_call_date">{{ formatTime(item.createTime) }}</div>
                  </div>
                </div>
                <div v-if="item.contentList.length > 1 || item.contentList[0].content != ''">
                  <div class="task-call-item-c" >
                  <template v-for="(items,indexs) in item.contentList">
                    <span v-if="items.type=='text'" :class="{'withdraw':withdrawFun(items.content)}" v-html="items.content" :key="index+''+indexs"></span>
                    <img v-else-if="items.type=='img'" :key="index+''+indexs" :src="`${require('@/assets/images/chat/send-message/emoji/' +items.content)}`" class="emojiImg"  :alt="items.content" />
                  </template>
                </div>
              </div>
              <div class="task-call-item-c file_list_box" 
                :class="{'file_list_nomessage': !(item.contentList.length > 1 || item.contentList[0].content != '')}" 
                v-if="item.feedbackType != 3 && item.accessory.length > 0">
                <div v-for="(fileItem,index) in item.accessory" :key="index" class="file_list_item">
                  <el-dropdown trigger="click" @command="handleCommand">
                    <div class="file_item">
                      <fileIcon :fileUrl="fileItem.fileUrl"></fileIcon>
                      <div class="file_name">{{ fileItem.fileName }}</div>
                    </div>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :command="`down,${JSON.stringify(fileItem)}`">下载</el-dropdown-item>
                      <el-dropdown-item :command="`view,${JSON.stringify(fileItem)}`">预览</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <ParentTaskDialog ref="parentTaskDialog"></ParentTaskDialog>
     
     <!-- v-if="!isOtherTask" -->
    <div class="task-send-button" ref="taskSend" id="taskSend" v-resize="resize">
      <div class="task_send_cont">
        <div id="send">
          <div v-if="userListOff" class="select-user">
             <div
               v-for="(item, key) in userList"
               class="select-item"
               :key="key"
               @click="handleSelectUser(item)"
             >{{ item.username }}</div>
          </div>
          <!-- 反馈交流 - 富文本框 -->
          <el-input
            placeholder="输入沟通内容，按enter发送"
            v-model="sendVal"
            type="textarea"
            ref="focusBox"
            :autosize="{ minRows: 1, maxRows: 3 }"
            maxlength="3000"
            @keypress.native="handlerMultiEnter"
          ></el-input>

          <el-popover width="535"
            class="expression"
            popper-class="expressionPopover"
            placement="top"
            :offset="-165"
            :visible-arrow="false"
            trigger="click">
            <div>
              <Expression @expressionClick="onClickExpressionSelect"></Expression>
            </div>
            <div slot="reference" class="cursor" style="width: 22px;height: 21px;margin-right: 20px;">
              <img src="@/assets/img/emoji.png" title="表情" class="emoji" />
            </div>
          </el-popover>
          <div class="file_test">
              <!--文件上传-->
              <UploadFileNew uploadText='添加附件'
                ref="UploadFileNew"
                :initFileList="accessoryList"
                :maxSize="1024*1024*20"
                @changeUpload='changeUpload'
                @onRemove="onRemove"
                :lineMode="true"
                :isSlotButton="true"
                :showFileLists="true"
                errorText='请上传正确的附件'
              >
                <template slot="uploadButton">
                  <img title="文件" src="@/assets/img/files.png"  />
                </template>
              </UploadFileNew>
          </div>
          <div class="sendMsg_button" @click="sendMsg" :style="{background:(sendVal || accessoryList.length ? '#3471ff' : '')}">发送</div>
        </div>

        <div class="file_list_box" v-if="accessoryList.length > 0">
          <div v-for="(fileItem,index) in accessoryList" :key="index" class="file_list_item">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="file_item">
                <fileIcon :fileUrl="fileItem.fileUrl"></fileIcon>
                <div class="file_name">{{fileItem.fileName}}</div>
                <img class="file_del" src="@/assets/img/task/del.png" @click="delFile(index)">
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="`down,${JSON.stringify(fileItem)}`">下载</el-dropdown-item>
                <el-dropdown-item :command="`view,${JSON.stringify(fileItem)}`">预览</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>


      <!-- userId == initiatorId 执行人
          userId == userId 发起人
          state 0待查看 1已查看 2待验收 3已完成 4已关闭
          feedBack 0默认状态 1反馈消息
      -->
      <div id="button_box" v-if="!isOtherTask && ([0,1,2].includes(rowData.state) || (userId == rowData.initiatorId || userId == rowData.userId))">
        <el-button @click="addCTask" class="button" v-if="userId == rowData.userId && getStateFeed('zxr')">建立子任务</el-button>
        <el-button type="primary" class="button" @click="taskFinish" v-if="userId == rowData.userId && getStateFeed('zxr')">已完成</el-button>
        <el-button class="button" @click="closeTask('close')" v-if="userId == rowData.initiatorId && getStateFeed('fqr')">关闭</el-button>
        <el-button type="primary" class="button" @click="editTask()" v-if="userId == rowData.initiatorId && getStateFeed('fqr')">编辑</el-button>
        <el-button class="button" @click="closeTask('nopass')" v-if="userId == rowData.initiatorId && getStateFeed('ys')">驳回</el-button>
        <el-button type="primary" class="button" @click="closeTask('pass')" v-if="userId == rowData.initiatorId && getStateFeed('ys')">通过</el-button>
        <el-button type="primary" class="button long_name" @click="withDraw" v-if="userId == rowData.userId && getStateFeed('ys')">撤回验收申请</el-button>
      </div>
    </div>
    <!-- <tipDialog ref="tipDialog" @change="changeTags"></tipDialog> -->
    <remind ref="remind" @change="changeValTags" :styles="style" :endTime="endTime" :acrossList="rowData.acrossList" :isDate="isDate" :taskPage="taskPage" v-if="!isOtherTask" />
    <!-- 已完成 -->
    <finishBox ref="finishBox" :taskId="rowData.id"  :rowData="rowData" @refrsh='refrsh'></finishBox>
    <!-- 关闭任务 -->
    <closeTask ref="closeTask" :data="rowData" @refrsh="refrsh"></closeTask>
    <!-- 撤回 -->
    <withDraw ref="withDraw" :data="rowData" @refrsh="refrsh"></withDraw>
    <el-dialog append-to-body
      :visible.sync='editTaskDialog'
      custom-class="task_new_set_up"
      :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">编辑任务</span>
      </div>
      <addNewTaskNew 
        mode="edit" 
        :flag="2" 
        :data="rowData" 
        :userName="row.userName" 
        v-if="editTaskDialog" 
        @success="successCbE"></addNewTaskNew>
    </el-dialog>
    <el-dialog append-to-body
      :visible.sync='addCTaskDialog'
      custom-class="task_new_set_up"
      :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">新建子任务</span>
      </div>
      <addNewTaskNew 
        mode="add" 
        :isSonTaskAdd="true" 
        :flag="3" 
        :taskId="rowData.id" 
        :data="rowData" 
        :targetId="rowData.targetId" 
        v-if="addCTaskDialog"  
        @success="successCb"></addNewTaskNew>
      <!-- :isShowTarget="(rowData.ptaskName || rowData.targetId) ? false : true" -->
    </el-dialog>

    <div class="img-masker" :style="show? 'display:block': ''">
      <div class="img-wrapper">
        <div class="preview-div">
          <img :src="imgUrl">
        </div>
        <div class="close-img">
          <img :src="closeImg" @click="closeImgFun">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import { emergencyLevelNew } from "@/const/dicData"
import tags from "@/components/tags/index";
// import tipDialog from "@/components/drawerDetail/tipDialog";
import remind from '@/components/drawerDetail/remind'
import finishBox from '@/components/drawerDetail/finishBox'
import closeTask from '@/components/drawerDetail/closeTask'
import withDraw from '@/components/drawerDetail/withdraw'
import Expression from '@/views/im/components/expression'
import { emojis } from '@/assets/js/resource'
import { getTaskDetails } from '@/api/task'
import dayjs from "dayjs"
import addNewTaskNew from "@/views/myTodo/components/addNewTaskNew"

const monthDateList = []
for (let i = 1; i <= 31; i++) {
  monthDateList.push(i)
}
import { loopOptions,weekendsDateList,timeCheck} from '@/const/dicData'
import { addFeedback,recallFeedback } from '@/api/feedback'
import { mapGetters } from 'vuex';
import { getEmojiValue } from "@/assets/js/resource";
import UploadFileNew from "@/components/UploadFile/UploadFileNew"
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
import EventBus from '@/eventBus'
// import { getFileUrl } from "@/api/task"
import ParentTaskDialog from '@/components/drawerDetail/ParentTaskDialog'
import {getUserList} from "../../api/task";
import headAvatar from "@/components/headAvatar"
import { dateDiff } from '../../views/myDate/components/utils';

export default {
  // import引入的组件需要注入到对象中才能使用
  props: {
    drawer: {
      type: Boolean,
      default: false,
    },
    isShowTips: {
      type: Boolean,
      default: true,
    },
    row:{
      type:Object,
      default:()=>{
        return {}
      }
    },
    // [日程]是否为他人的任务
    isOtherTask: {
      type: Boolean,
      default: false,
    },
    // 通过日程打开
    isDate: {
      type: Boolean,
      default: false,
    }
  },
  components: { 
    tags,
    remind,
    Expression,
    addNewTaskNew,
    UploadFileNew,
    finishBox,
    closeTask,
    withDraw,
    ParentTaskDialog,
    headAvatar 
  },
  data() {
    // 这里存放数据
    return {
      userList: [],
      userListOff: false,
      editTaskDialog:false,
      monthDateList:monthDateList,
      loopOptions:loopOptions,
      timeCheck:timeCheck,
      weekendsDateList:weekendsDateList,
      sendVal: "",
      callData: [],
      emergencyLevelNew:emergencyLevelNew,
      tagsData:[],
      style:{},
      rowData:{},
      // 反馈附件
      accessoryList:[],
      // 子任务弹窗
      addCTaskDialog:false,
      observer:null,
      styleHeight:'',
      msgBodyHeight: '',
      endTime: "",
      divWidth: 0,
      imgUrl: "",
      show: false,
      closeImg: require("@/assets/img/icon/closeImg.png"),
      taskPage: true,
      taskFileList: [], // 文件列表
      noticeContent: '', // 提醒内容
      sendBoxHeight: 0,
    };
  },
  // 监听属性 类似于data概念
  computed: {
    ...mapGetters(['username','userId']),
    currentThreeTime() {
      return function(val){
        let currentTime = new Date().getTime();
        let oldTime = new Date(val).getTime();
        return currentTime - oldTime < 60 * 3 * 1000;
      }
    },
    justifyContent(){
      return (val)=>{
        if(val.ptaskName == undefined && val.isCycle){
          return 'flex-end'
        }else{
          return 'space-between'
        }
      }
    },
    showRecall() {
      return (val)=>{
        return !this.isOtherTask 
        && this.currentThreeTime(val.createTime) 
        && val.feedbackId == this.userId 
        && val.feedbackType != 3 
        && val.feedbackType != 5 
        && !val.withdraw
      }
      //  && [0,1].includes(this.rowData.state)
    },
    fileNameSuffix(){
      return (val)=>{
        return val.substr(val.lastIndexOf('.') + 1);
      }
    },
    withdrawFun(){
      return (val)=>{
        return val.indexOf('撤回了一条消息') != -1
      }
    }
  },
  // 监控data中的数据变化
  watch: {
    'rowData.state'(newVal,oldVal){
      if(newVal == 4){
         this.styleHeight = window.innerHeight - 90 + 'px'
         this.msgBodyHeight = window.innerHeight - 400 + 'px'
      }
    },
    sendVal(val) {
      if (val.substr(val.length-1,1) === '@') {
        getUserList({taskId: this.row.id}).then(res => {
          if (res.data && res.data.code == 200) {
            this.userList = [...res.data.data]
            this.userListOff = true
          }
        })
      } else {
        this.userListOff = false
      }
    },
    heightR(){
      let documen = document.getElementById('#taskSend')
      return documen
    },
    accessoryList(newVal,oldVal){
      if(newVal.length != oldVal.length){
        this.getInputBoxHeight()
      }
    }
  },
  // 方法集合
  methods: {
    handleSelectUser(obj) {
      this.sendVal += `${obj.username} `
      this.userListOff = false
    },
    // 更新数据
    refrsh(){
      this.init()
      this.$emit("refrsh")
    },
    /**
     *  state 0待查看 1已查看 2待验收 3已完成 4已关闭
     *  feedBack 0默认状态 1反馈消息
     */
    getStateFeed(type){
      if(type=='fqr'){
        return (this.rowData.state <=1 ) && (!this.rowData.feedBack || this.rowData.feedBack==0 || this.rowData.feedBack==1)
      }else if(type=='zxr'){
        return ((this.rowData.state <=1 ) || (this.rowData.state == 2 && this.rowData.feedBack == 0))
      }else if(type=='ys'){
        //  && this.rowData.feedBack == 1
        return ( this.rowData.state == 2 )
      }
    },
    resize(){
      let pyl = 10
      if(this.userId != this.rowData.initiatorId && this.userId != this.rowData.userId){
        pyl = 10
      }
      if(document.getElementById('taskSend')){
        this.styleHeight = window.innerHeight - document.getElementById('taskSend').offsetHeight - 83 - pyl + 'px'
        this.msgBodyHeight = window.innerHeight - document.getElementById('taskSend').offsetHeight - 430 + 'px'
      }
    },
    // 打开撤回弹窗
    withDraw(){
      this.$refs.withDraw.init()
    },
    // 打开关闭任务窗口
    closeTask(type){
      this.$refs.closeTask.init(type)
    },
    // 打开完成任务窗口
    taskFinish(){
      this.$refs.finishBox.init()
    },
    // 打开子任务弹窗
    addCTask(){
      this.addCTaskDialog = true
    },
    // 删除文件
    delFile(index){
      this.accessoryList.splice(index,1)
      this.$refs.UploadFileNew.delFile(index)
    },
    // 文件上传成功回调
    changeUpload(data) {
      this.accessoryList.push(data.res)
      this.$refs.focusBox.focus()
      setInterval( () => {
        this.divWidth = 0
      } ,1500)
      
    },
    // 文件删除回调
    onRemove(file, fileList) {
      // 有 response 的
      let url = file.url
      if (file.response) {
        url = file.response.data.url
      }
      // 过滤 url
      this.accessoryList = this.accessoryList.filter(item => item.url !== url)
    },
    // [Click] 选中表情
    onClickExpressionSelect (emoji) {
      if (emoji === 'del.png') {
        // 删除表情
        const msgLen = this.sendVal.length - 1
        const start = this.sendVal.lastIndexOf('[')
        const end = this.sendVal.lastIndexOf(']')
        if (end !== -1 && end === msgLen) this.sendVal = this.sendVal.slice(0, start)
      } else {
        // 添加表情
        for (let i = 0; i < emojis.length; i++) {
          for (let key in emojis[i]) {
            if (emojis[i][key] === emoji) this.sendVal += key
          }
        }
      }
    },
    formatTime(time) {
       // 如果消息是今年发送的，不显示年份
      if(dayjs(time).format("YYYY") === dayjs().format("YYYY")){
        return dayjs(time).format('MM-DD HH:mm')
      }
      return dayjs(time).format('YYYY-MM-DD HH:mm')
    } ,
    // 转换内容
    getTimeTypeLabel(list,val,props = {value:'value',label:'label'}){
      let timeLabelStr = ''
      list.forEach(item=>{
        if(item[props.value] === val){
          timeLabelStr = item[props.label]
        }
      })
      return timeLabelStr
    },
    changeValTags(val){
      if(this.rowData.acrossList.length>0){
        this.tagsData.splice(this.tagsData.length-1,1)
      }
      console.log(val,'val - changeValTags ')
      this.rowData.acrossList = [...val]
      if(val.length>0){
        this.changeTags(val)
      }else{
        this.noticeContent = ''
      }
      
    },
    // 根据类型回显提醒内容
    changeTags(val) {
      console.log(val,'根据类型回显提醒内容')
      if(val && val.length>=1){
        let newObj = val[0],lengthStr = '',isForever = ''
        if(val.length>1){
          lengthStr = '等'+(val.length)+'个'
        }
        let timeLabel = ''
        /*
         * timeType === 5 单次提醒
         * timeType === 6 循环提醒
         */
        if(newObj.timeType === 5){
          timeLabel = newObj.endDate + ' ' + (newObj.startTime ? newObj.startTime : newObj.endTime)
        }else if(newObj.timeType === 6){
          const loopLabel = this.getTimeTypeLabel(this.loopOptions,(newObj.frequency+1))
          timeLabel += loopLabel
          if((newObj.frequency+1) === 4){
            let monthDayList = newObj.monthDay.split(",")
            monthDayList.sort((a,b) => {return a - b})
            let newData = JSON.parse(JSON.stringify(monthDayList))

            if(newData.includes('0') || newData.includes(0)) {
              timeLabel += '第一个工作日' + "/"
              newData.splice(0,1)
            }
            if(newData.includes('32') || newData.includes(32)) {
              timeLabel += '最后一个工作日' + "/"
              newData.splice(newData.length - 1 ,1)
            }
            if (newData.length != 0) {
              timeLabel += newData.toString() +'日' + "/"
            }
          }
          if((newObj.frequency+1) === 3){
          let monthDayList = newObj.monthDay.split(",")
          monthDayList.forEach((item,index)=>{
              if(index>0){
                timeLabel+='/'
              }
              timeLabel += this.weekendsDateList[item]
            })
          }
          if(newObj.isPermanent){
            isForever = isForever +'/永久有效'
          }else{
            if((newObj.frequency+1) === 4 || (newObj.frequency+1) === 3){
              isForever = isForever +'/'+newObj.endDate+'截止'
            }else{
              timeLabel += newObj.endDate+' '
            }
          }
          timeLabel += newObj.startTime ? newObj.startTime : newObj.endTime
        }else{
          timeLabel = this.getTimeTypeLabel(this.timeCheck,newObj.timeType,{value:'timeType',label:'content'})
        }
        this.noticeContent = timeLabel + isForever + lengthStr + "提醒"
        this.$emit("change",true);
      }else{
        this.$emit("change",true);
      }
    },
    changeShowTips(style,item){

      if(this.isOtherTask) return
      // 判断状态 执行人且状态小于等于2 才能唤起提醒
      if(this.userId == this.rowData.userId && this.row.state<=2){
        this.style = style
        this.$refs.remind.init(this.rowData);
      }
    },
    showTips(e,item) {
      this.touchX = e.clientX // 按压位置X
      this.touchY = e.clientY // 按压位置Y
      const winW = document.body.clientWidth // 屏幕宽
      const winH = document.body.clientWidth // 屏幕高
      let translateX = this.touchX > winW / 2 ? '-100%' : 0 // X偏移
      let translateY = this.touchY > winH / 2 ? '-100%' : 0 // Y偏移

      // 定位样式 441
      const style = {
        // top: `${this.touchY}px`,
        top:'50%',
        right:'60px',
        // left: `${this.touchX}px`,
        // transform: `translate(${translateX}, ${translateY})`
        transform: 'translateY(-50%)'
      }
      this.style = style
      this.$refs.remind.init(this.rowData);
    },
    sendMsg() {
      this.sendVal = this.sendVal.replace(/\n/g, '<br/>')
      const arr = []
      this.userList.forEach(item => {
        if (this.sendVal.indexOf(item.username) !== -1) {
          arr.push(item)
        }
      })
      //if (event.keyCode === 13) {
      //  event.preventDefault();
        if(this.sendVal.length == 0 && this.accessoryList.length == 0) {
          return ;
        }
        if(/^(?!(\s+$))/.test(this.sendVal) == false) {
          this.$message.warning("不能发送空白内容")
          return ;
        }
        let newStr = this.sendVal + '',
        newList = JSON.parse(JSON.stringify(this.accessoryList))
        this.sendVal = "";
        this.accessoryList = []
        this.$refs.UploadFileNew.clearFile()
        if (newStr || newList) {
          addFeedback({
            taskId:this.rowData.id,
            content:newStr,
            accessory:JSON.stringify(newList),
            userList: arr
          }).then(res=>{
            if(res.data.code==200){
              this.callData.push({
                feedbackName: this.username,
                feedbackId:res.data.data[0].feedbackId,
                headImage: this.$store.state.user.headAvatar,
                id:res.data.data[0].id,
                createTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                contentList: this.textAnalys(newStr.replace(/[\r\n]/g,"")),
                accessory:JSON.parse(res.data.data[0].accessory)
              })
              this.sendBoxHeight = '10px'
              this.$message.success('反馈成功')
              this.$nextTick(() => {
                this.handleScrollToBottom()
              })
            }
          })
        }
      //}
    },
    textAnalys(newStr){
      let array = []
      let spliceStr = '',haveLeft = false
      if(newStr){
        for (var i = 0; i <newStr.length; i++) {
          if(newStr[i]=='['){
            if(!haveLeft){
              haveLeft = true
              if(( spliceStr +newStr[i]).indexOf!= 0){
                array.push({
                  type:'text',
                  content:spliceStr
                })
                spliceStr = ''
              }
            }else{
              array.push({
                type:'text',
                content:spliceStr
              })
              spliceStr = ''
              haveLeft = false
            }
          }
          spliceStr += newStr[i]
          if(newStr[i]==']' && haveLeft){
            let emojiName = this.getEmojiNameFormat(spliceStr)
            if(emojiName==spliceStr){
              array.push({
                type:'text',
                content:spliceStr
              })
            }else{
              array.push({
                type:'img',
                content:emojiName
              })
            }
            spliceStr = ''
            haveLeft = false
          }
        }
        if(spliceStr){
          array.push({
            type:'text',
            content:spliceStr
          })
        }
      }else{
        array.push({
          type:'text',
          content:newStr
        })
      }
      return array
    },
    // 新建子任务回调
    successCb() {
      this.addCTaskDialog = false
      this.init()
      this.$emit("refrsh")
    },
    // 编辑任务回调
    successCbE() {
      this.editTaskDialog = false
      // this.init()
      this.$emit("refrsh")
    },
    recallFeedbackId(id,index){
      let _this = this
      recallFeedback({id:id+ ""}).then(res => {
        if(res.data.code==200){
          this.$message.success("撤回反馈成功")
          getTaskDetails({
            taskId: _this.row.id + ""
          }).then( req =>{
            let arr = req.data.data.list.reverse();
            // 解析文本内容和文件列表
            arr.forEach(item=>{
              item.contentList = this.textAnalys(item.content && item.content.replace(/[\r\n]/g,""))
              if(item.accessory){
                item.accessory = JSON.parse(item.accessory)
              }else{
                item.accessory = []
              }
            })
            _this.callData = arr;
          })
        }
      })
      //this.callData.splice(index, 1);
    },
    editTask(){
      this.editTaskDialog = true
    },
    // 解析执行人、关注人
    parseExeAtt(list,iconName,type){
      // 用来解析执行人并遍历出来
        let attentionList = list
        if(attentionList.length>0){
          list['iconName']=iconName
          this.tagsData.push({tagType: iconName, content:list})
        }
    },
    async init() {
      this.tagsData = []
      await getTaskDetails({
        taskId: this.row.id + ""
      }).then(res=>{
        this.rowData = res.data.data
        let endTime = ''
        if(this.rowData.taskType == 0){
          endTime = dayjs(this.rowData.endTime).format('YYYY-MM-DD')
        }else{
          endTime = dayjs(this.rowData.endTime).format('YYYY-MM-DD HH:mm')
        }
        this.endTime = endTime;
        // 状态放在截止时间里面
        this.tagsData.push({ tagType: 'time', content: endTime + " 截止", taskState: this.rowData.state, status: this.rowData.emergencyLevel})
        this.tagsData.push({ tagType:'sender', content: this.rowData.initiator + "发起" })
        // 调用解析方法
        this.parseExeAtt(JSON.parse(this.rowData.executeList),'implement','zxr')
        this.parseExeAtt(JSON.parse(this.rowData.attentionList),'follow','gzr')
        this.tagsData.push({ tagType:'status', content: this.rowData.emergencyLevel })
        // 文件-附件
        if(this.rowData.accessory && JSON.parse(this.rowData.accessory).length>0){
          let accessoryFileList = JSON.parse(this.rowData.accessory)
          accessoryFileList.forEach(item=>{
            let fileType = item.fileName.substr(item.fileName.lastIndexOf('.') + 1);
            item['fileType'] = fileType 
          })
          this.taskFileList = accessoryFileList
        }
        // 转换处理提醒
        if(this.rowData.acrossList && this.rowData.acrossList.length>0){
          this.changeTags(this.rowData.acrossList)
        }
        // 解析文本内容和文件列表
        this.rowData.list.forEach(item=>{
          item.contentList = this.textAnalys(item.content && item.content.replace(/[\r\n]/g,""))
          if(item.accessory){
            item.accessory = JSON.parse(item.accessory)
          }else{
            item.accessory = []
          }
        })
        this.callData = this.rowData.list
      })
       this.callData.reverse();
    },
    getEmojiNameFormat(value) {
      return getEmojiValue(value)
    },
    // 下载文件
    previewFile(item) {
      const url = item.fileUrl
      const name = item.name
      const imglist = ['png', 'jpg', 'JPG', 'jpeg', 'bmp', 'gif','docx','doc','pdf','xlsx'];
      if(imglist.find(item => item == name.split('.')[name.split('.').length - 1])) {
        localStorage.setItem('setPreviewUrl',JSON.stringify({url,name}))
        this.$electron.ipcRenderer.send('create-preview-window',{url,name})
      }else {
          this.$message.info("该文件不支持预览")
      }
    },
    // 下载/预览文件
    handleCommand(command,fileItem){
      let head = command.slice(0,command.indexOf(","))
      let url = JSON.parse(command.slice(command.indexOf(",")+ 1)).url
      let name = JSON.parse(command.slice(command.indexOf(",")+ 1)).fileName
      if(head == "down") {
          handleTransUrlAndDownLoadFile(url)
      }else {
        const fileUrl = JSON.parse(command.slice(command.indexOf(",")+ 1)).fileUrl
        const imglist = ['png', 'jpg', 'JPG', 'jpeg', 'bmp', 'gif','docx','doc','pdf','xlsx'];
        if(imglist.find(item => item == name.split('.')[name.split('.').length - 1])) {
          localStorage.setItem('setPreviewUrl',JSON.stringify({url:fileUrl,name}))
          this.$electron.ipcRenderer.send('create-preview-window',{url:fileUrl,name})
        }else {
            this.$message.info("该文件不支持预览")
        }
      }
    },

    fileHandleCommand(command, fileItem){
      // 下载
      if(command == "down") {
        handleTransUrlAndDownLoadFile(fileItem.url)
      }else {
        //获取后缀
        let result = ''
        const imglist = ['png', 'jpg', 'JPG', 'jpeg', 'bmp', 'gif','docx','doc','pdf','xlsx'];
        if(imglist.find(item => item == fileItem.fileUrl.split('.')[fileItem.fileUrl.split('.').length - 1])) {
          localStorage.setItem('setPreviewUrl',JSON.stringify({url:fileItem.fileUrl, name: fileItem.fileName}))
          this.$electron.ipcRenderer.send('create-preview-window',{url:fileItem.fileUrl, name: fileItem.fileName})
        }else {
          this.$message.info("该文件不支持预览")
        }
      }
    },

    closeImgFun() {
      this.show = false
    },
    openParentTaskDialog(pid) {
      this.$refs.parentTaskDialog.init(pid)
    },
    handlerMultiEnter(e) {
      let code = e.keyCode;
      let ctrl = e.ctrlKey;
      let shift = e.shiftKey;
      let alt = e.altKey;
      // 只按了enter
      if(code == '13' && !ctrl && !shift && !alt) {
        e.preventDefault()
        this.sendMsg()
      }
      this.getInputBoxHeight()
    },
    // 定位到底部
    handleScrollToBottom() {
      const taskDetailBox = document.getElementById('taskDetail').clientHeight
      const callBody = document.querySelectorAll('.el-scrollbar__view')[2]
      if(taskDetailBox >= callBody.clientHeight) return
      callBody.scrollIntoView(false)
    },
    getInputBoxHeight(){
      let taskSendBox = document.querySelector('.task_send_cont')
      this.sendBoxHeight = `${taskSendBox.offsetHeight - 50}px`
    },
    mouseEnter(item){
      let time = new Date(item.createTime).getTime()
      let newTime = new Date().getTime()
      let result = time + 1000*60*2 < newTime
      item['withdraw'] = result
    }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    window.addEventListener('resize',()=>{
      if(this.rowData.state == 4){
         this.styleHeight = window.innerHeight - 90 + 'px'
         this.msgBodyHeight = window.innerHeight - 430 + 'px'
      }else{
        let pyl = 10
        if(this.userId != this.rowData.initiatorId && this.userId != this.rowData.userId){
          pyl = 10
        }
        if(document.getElementById('taskSend')){
          this.styleHeight = window.innerHeight - document.getElementById('taskSend').offsetHeight - 83 - pyl + 'px'
          this.msgBodyHeight = window.innerHeight - document.getElementById('taskSend').offsetHeight - 430 + 'px'
        }
      }
    })
    this.init();
    EventBus.$on("showProgress", item => {
      this.divWidth = item
    })
  },
  // 监听元素变化
  directives: {  // 使用局部注册指令的方式
    resize: { // 指令的名称
      bind(el, binding) { // el为绑定的元素，binding为绑定给指令的对象
        let width = '', height = '';
        function isReize() {
          const style = document.defaultView.getComputedStyle(el);
          if (width !== style.width || height !== style.height) {
            binding.value();  // 关键
          }
          width = style.width;
          height = style.height;
        }
        el.__vueSetInterval__ = setInterval(isReize, 300);
      },
      unbind(el) {
        clearInterval(el.__vueSetInterval__);
      }
    }
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
<style lang="scss" scoped>
  #taskDetail {
    .task-drawer-inner {
      height: calc(100vh - 250px);
      overflow-y: hidden !important;
      .el-scrollbar__wrap {
        overflow-y: hidden !important;
      }
    }
    .el-scrollbar__wrap {
        overflow-y: hidden !important;
      }

    position: relative;
    ::v-deep .el-dialog__wrapper {
      width: 100%;
      position: absolute;
      .el-dialog {
        width: 80% !important;
        display: flex;
        flex-direction: column;
        margin: 0 !important;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        .el-dialog__body{
            flex:1;
            overflow: auto;
        }
      }

    }

  }

    .el-scrollbar__wrap {
      overflow-y: hidden !important;
    }


</style>
<style lang='scss'>
//@import url(); 引入公共css类
#taskDetail {
  font-size: 14px;
  font-family: SourceHanSansCN-Normal;
  .task-drawer-inner {
    margin-top: 10px;
    .parent_task_name,
    .task-body,
    .task-call-box{
      display: flex;
      align-items: center;
      >img{
        margin-right: 24px;
        width: 18px;
      }
      .right_cont{
        width: calc(100% - 40px);
      }
    }
    // 父级
    .parent_task_name{
      font-size: 16px;
      color: #333333;
      margin-bottom: 20px;
      .parent_cont{
        width: calc(100% - 40px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        img {
          width: 16px;
          margin-right: 0;
        }
      }
      .loop_img{
        justify-content: flex-end;
      }
    }
    .task-body {
      .task_info{
        padding: 20px 20px 15px 20px;
        border-radius: 6px;
        background-color: #FBFBFC;
        .task-body_title{
          font-size: 16px;
          line-height: 24px;
          color: #333333;
          margin-bottom: 10px;
        }
        .task-body-content{
          font-size: 14px;
          color: #333333;
          line-height: 26px;
        }
        .task_file_list{
          user-select: none;
          margin-top: 12px;
          padding-top: 5px;
          border-top: 1px dashed #DEE0E3;
          .file_item {
            margin-top: 10px;
            // .el-dropdown{
            //   max-width: 100%;
            // }
            .title{
              display: flex;
              align-items: center;
              color: #37476B;
              font-size: 14px;
              cursor: pointer;
              font-family: 'SourceHanSansCN-Light';
              img{
                width: 16px;
                margin-right: 10px;
              }
            }
          }
        }
      }
      .right_cont{
        padding-bottom: 20px;
      }
    }
    .task-tags-tips {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 35px;
      color: #3370FF;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 12px;
      background-color: #F5F8FF;
      img{
        width: 14px;
        margin-right: 10px;
      }
    }
    .task-tags-tips-text {
      display: inline-block;
      line-height: 35px;
      padding: 0 15px;
      height: 35px;
      color: #3370FF;
      border-radius: 20px;
      cursor: pointer;
      margin-top: 24px;
      background-color: #F5F8FF;
      img{
        width: 14px;
        margin-right: 10px;
        vertical-align: middle;
      }
      span{
        vertical-align: middle;
      }
    }

    .task-call-box {
      .task-call-title {
        font-size: 16px;
        color: #333333;
        padding: 16px 0px 18px;
        border-top: 1px solid #DEE0E3;
      }
      .task-call-body {
        padding: 20px;
        background: #FBFBFC;
        border-radius: 6px;
        overflow-y: auto;
        .task-call-item:hover{
          // background-color: #F5F6F7;
          .hide_call_item{
            .task_call_date {
              display: none!important;
            }
            .task_call_withdraw{
              display: block!important;
            }
          }
        }
        .task-call-item {
          display: flex;
          align-items: flex-start;
          color: #333333;
          font-size: 13px;
          cursor: default;
          padding: 8px 0;
          font-family: 'SourceHanSansCN-Regular';
          >div{
            .user_head_avatar{
              margin-right: 10px!important;
            }
          }
          .call_user_avatar{
            width: 30px;
            margin-right: 13px;
            border-radius: 50%;
          }
          .call_right_cont{
            width: calc(100% - 42px);
            .call_user_header{
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              .user_name{
                font-size: 14px;
                color: #333333;
                font-family: 'SourceHanSansCN-Medium';
              }
              .task_call_date{
                display: block;
                color: #AEAEAE;
              }
              .task_call_withdraw{display: none; cursor: pointer;width: 12px;}
            }
          }
          .task-call-item-t {
            display: flex;
            align-items: center;
            justify-content: space-between;
            div {
              display: flex;
              align-items: center;
              .task-call-i {
                width: 50px;
                height: 24px;
                background: #ffffff;
                // border: 1px solid #bfbfbf;
                // border-radius: 50%;
                font-size: 14px;
                opacity: 1;
                color: #333333;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .task-call-n {
                //margin-left: 10px;
                font-size: 14px;
                font-weight: 400;
                color: #333333;
              }
              
            }
          }
          .task-call-item-c {
            padding-top: 4px;
            max-width: 520px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            span{
              word-break: normal;
              width: auto;
             // display:block;
              white-space: pre-wrap;
              word-wrap : break-word ;
              overflow: hidden ;
            }

            .withdraw{
              color: #AEAEAE;
            }
          }
        }
        .task-call-item + .task-call-item {
          margin-top: 5px;
        }
      }
    }
    .el-scrollbar__wrap{
      width: 100%;
    }
    .el-scrollbar__wrap::-webkit-scrollbar{
      display: none;
    }
  }
  .file_list_box{
    margin-top: 10px;
    padding-top: 10px;
    height: auto!important;
    border-top: 1px dashed #DEE0E3;
    .file_list_item{
      height: auto;
      cursor: pointer;
      padding: 7px 10px;
      border-radius: 6px;
      font-family: 'SourceHanSansCN-Regular';
      .el-dropdown{
        width: 100%;
        .file_item{
          display:flex;
          align-items: center;
          .file_name{
            max-width: 366px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
          img{
            margin-right: 10px;
            width: 18px;
          }
        }
      }
      
      .file_icon{
        width:13px;
        height:13px;
      }
      span{
        margin-left:8px;
        font-size: 13px;
        color: #333333;
      }
      .file_del{
        width: 14px!important;
        height: auto;
        margin-left: 20px;
        margin-right: 0;
      }
    }
  }
  .file_list_nomessage{
    margin-top: 0;
    border-top: none;
  }
  .emojiImg{
    width: 20px;
    /* height: 16px; */
    // cursor: pointer;
  }
}
.task-send-button {
  width: 578px;
  bottom: 0px;
  right: 30px;
  position: fixed;
  background: #ffffff;
  .el-textarea__inner::-webkit-scrollbar {
    display: none;
  }
}
.task_send_cont{
  margin-top: 10px;
  padding: 10px 0;
}
#send {
  display: flex;
  align-items: center;
  position: relative;
  .select-user{
    width: 410px;
    height: 100px;
    padding: 10px 0;
    position: absolute;
    background-color: #FFFFFF;
    top: -86px;
    border: 1px solid #f2f2f2;
    box-shadow: 0px 0px 10px #f6f6f6;
    overflow-y: auto;
    .select-item{
      font-size: 14px;
      padding: 4px 12px;
      cursor: pointer;
      color: #333333;
      transition: 0.3s;
    }:hover{
      background-color: #3471ff;
      color: #FFFFFF;
      transition: 0.3s;
    }
  }
  .fileUploader {
    width: 0;
    height: 0;
    display: none;
  }
  textarea {
    min-height: 36px !important;
    opacity: 1;
    border-radius: 4px;
    resize: none;
    padding-right: 10px;
    border-radius: 6px;
    line-height: 24px;
  }
  img{
    width: 20px;
    height: 20px;
  }
  .file_test {
  margin-left: 20px;
  }
}
.el-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
#button_box {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  // padding: 20px 0px 30px;
  .button{
    cursor:pointer;
    margin: 20px 0 20px 20px;
    &:first-child{
      margin-left: 0;
    }
  }
  .long_name{
    width: 100px!important;
  }
  .finish_button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 32px;
    background: #3471ff;
    opacity: 1;
    border-radius: 4px;
    margin-left: 15px;
    color: #ffffff;
    &:hover{
      background: #5B8CFF;
    }
  }
  .children_button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 32px;
    border: 1px solid #dcdfe6;
    opacity: 1;
    color: #333333;
    border-radius: 4px;
    &:hover{
      background: rgba(222, 224, 227, 0.2);
    }
  }
}

.noScroll ::-webkit-scrollbar {
  width: 2px;
}

.sendMsg_button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 30px;
    color: #FFFFFF;
    background: #d8d8d8;
    opacity: 1;
    border-radius: 4px;
    margin-left: 15px;
    color: #ffffff;
    cursor: pointer;
    &:hover{
      background:#3471ff; 
    }
  }

  .el-scrollbar__thumb {
    display: none;
  }
</style>
