<template>
  <div id="taskViewDetail">
    <ParentTaskDialog ref="parentTaskDialog"></ParentTaskDialog>
    <div id="taskViewContainer" style="height: calc(100vh - 85px);"></div>
    <!-- 点击节点显示详情 -->
    <div id="taskViewDrawerDetail" v-show="detailShow">
      <div class="taskViewDrawerDetailMask" @click="closeDetailShow"></div>
      <div class="taskViewDrawer_cont">
        <div class="task-drawer-inner scrollbar_style">
          <div class="close_btn">
            <div class="title">任务视图</div>
            <img src="@/assets/img/icon_close.png" alt="关闭"  @click="closeDetailShow">
          </div>
          <div class="parent_task_name" v-if="rowData.ptaskName || rowData.isCycle == 1">
            <div class="parent_cont" :class="[rowData.isCycle == 1 && !rowData.ptaskName ? 'loop_img': '']">
              <el-tooltip v-if="rowData.ptaskName" effect="dark" :content="rowData.ptaskName" placement="top-start" >
                <span @click="openParentTaskDialog(rowData.pid)"> 父级任务：{{rowData.ptaskName}}</span>
              </el-tooltip>
              <img v-if="rowData.isCycle == 1" src="@/assets/img/mytodo/new_task/newtask_loop.png" alt="">
            </div>
          </div>

          <div class="task-body" style="align-items: baseline;">
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
                        <div class="file_name">{{item.fileName}}</div>
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
              <tags :tagsData="tagsData"></tags>
            </div>
          </div>
          <div class="task-call-box" style="align-items: baseline;" v-if="callData.length>0">
            <div class="right_cont">
              <div class="task-call-title">交流沟通</div>
              <div class="task-call-body">
                <div v-for="(item, index) in callData" :key="index" class="task-call-item">
                  <headAvatar 
                    :size="30" 
                    :fontSize='14'
                    :avatarUrl="item.headImage ? item.headImage: ''" 
                    :username='item.feedbackName'
                    margin="0 10px 0 0">
                  </headAvatar>

                  <div class="call_right_cont">
                    <div class="call_user_header">
                      <div class="user_name">{{ item.feedbackName }}</div>
                      <div>
                        <div class="task_call_date">{{ formatTime(item.createTime) }}</div>
                      </div>
                    </div>
                    <div class="task-call-item-c">
                    <template v-for="(items,indexs) in item.contentList">
                      <span v-if="items.type=='text'" :class="{'withdraw':withdrawFun(items.content)}" v-html="items.content" :key="index+''+indexs"></span>
                      <img v-else-if="items.type=='img'" :key="index+''+indexs" :src="`${require('@/assets/images/chat/send-message/emoji/' +items.content)}`" class="emojiImg"  :alt="items.content" />
                    </template>
                  </div>
                  <div class="task-call-item-c file_list_box" v-if="item.feedbackType != 3 && item.accessory.length>0">
                    <div v-for="(fileItem,index) in item.accessory" :key="index" class="file_list_item">
                      <el-dropdown trigger="click" @command="handleCommand">
                        <div class="file_item">
                          <fileIcon :fileUrl="fileItem.fileUrl"></fileIcon>
                          <div class="file_name">{{fileItem.fileName}}</div>
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
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import G6 from '@antv/g6'
import * as api from "@/api/task"
import tags from "@/components/tags/index";
import dayjs from 'dayjs'
import { getEmojiValue } from "@/assets/js/resource";
import { emergencyLevelNew } from "@/const/dicData"
import headAvatar from "@/components/headAvatar"
import { loopOptions,weekendsDateList,timeCheck} from '@/const/dicData'
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
import ParentTaskDialog from '@/components/drawerDetail/ParentTaskDialog'


export default {
  name: "taskView",
  components:{
    tags,
    headAvatar,
    ParentTaskDialog
  },
  props: {
    taskId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      listData: {},
      listDetailData: [],
      tagsData:[],
      callData:[],
      rowData:{},
      detailShow:false,
      loopOptions:loopOptions,
      timeCheck:timeCheck,
      weekendsDateList:weekendsDateList,
      emergencyLevelNew:emergencyLevelNew,
      imgUrl: "",
      show: false,
      taskFileList: [],
      closeImg: require("@/assets/img/icon/closeImg.png"),
    }
  },
  mounted() {
    this.getData()
  },
  computed:{
    withdrawFun(){
      return (val)=>{
        return val.indexOf('撤回了一条消息') != -1
      }
    },
    fileNameSuffix(){
      return (val)=>{
        return val.substr(val.lastIndexOf('.') + 1);
      }
    },
  },
  methods: {
    getData() {
      api.getPerspective({ taskId: this.taskId }).then(res => {
        if (res.data.code === 200) {
          console.log(res.data.data)
          if(res.data.data && res.data.data[0].quarterTarget) {
            let obj1 = {
              initiator: res.data.data[0].quarterTarget,
              initiatorId: res.data.data[0].initiatorId,
              pid: "-1",
              quarterTarget: "",
              state: res.data.data[0].state,
              taskId: res.data.data[0].taskId,
              children:[...res.data.data]
            }
            this.listData = obj1
          }else {
            this.listData = res.data.data[0]
          }
          this.initView()
        }
      })
    },
    // 关闭详情页
    closeDetailShow(){
      this.detailShow = false
    },
    // 沟通排序
    getIndex(val) {
      return this.callData.length - val;
    },
    formatTime(time) {
      // 如果消息是今年发送的，不显示年份
      if(dayjs(time).format("YYYY") === dayjs().format("YYYY")){
        return dayjs(time).format('MM-DD HH:mm')
      }
      return dayjs(time).format('YYYY-MM-DD HH:mm')
    } ,
    getDataById({taskId, pid,userId }) {
      // 结点点击
      this.detailShow = true
      this.tagsData = []
      this.callData = []
      api.getTaskDetails({
        taskId:taskId
      }).then(res=>{
        
        if(res.data.code==200){
          this.rowData = res.data.data
          let endTime = ''
          if(this.rowData.taskType == 0){
            endTime = dayjs(this.rowData.endTime).format('YYYY-MM-DD')
          }else{
            endTime = dayjs(this.rowData.endTime).format('YYYY-MM-DD HH:mm')
          }
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

          // if(this.rowData.accessory && JSON.parse(this.rowData.accessory).length>0){
          //   let accessoryFileList = JSON.parse(this.rowData.accessory)
          //   accessoryFileList.forEach(item=>{
          //     this.tagsData.push({
          //       type:'file',
          //       iconName:'file',
          //       name:item.fileName,
          //       width:'253',
          //       iconWidth:16,
          //       iconHeight:16,
          //       maxWidth:545,
          //       data:item,
          //       // margin:margin
          //     })
          //   })
          // }
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
          this.callData.reverse();
        }
      })
    },
    // 解析执行人、关注人
    parseExeAtt(list,iconName,type){
      let attentionList = list
      if(attentionList.length>0){
        list['iconName']=iconName
        this.tagsData.push({tagType: iconName, content:list})
      }
    },
    // 根据类型回显提醒内容
    changeTags(val) {
      let newObj = val[0],lengthStr = '',isForever = ''
      if(val.length>1){
        lengthStr = '等'+(val.length)+'个'
      }
      let timeLabel = ''
      if(newObj.timeType === 5){
        timeLabel = newObj.endDate + ' ' + newObj.startTime
      }else if(newObj.timeType === 6){
        const loopLabel = this.getTimeTypeLabel(this.loopOptions,(newObj.frequency+1))
        timeLabel += loopLabel
        if((newObj.frequency+1) === 4){
          let monthDayList = newObj.monthDay.split(",")
          monthDayList.sort((a,b) => {return a - b})
          let newData = JSON.parse(JSON.stringify(monthDayList))
          if(newData.includes('-1') || newData.includes(-1)) {
            timeLabel += '第一个工作日' + "/"
            newData.splice(0,1)
          }
          if(newData.includes('0') || newData.includes(0)) {
            timeLabel += '最后一个工作日' + "/"
            newData.splice(0,1)
          }
          timeLabel += newData.toString() +'日' + "/"
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
        timeLabel += newObj.startTime
      }else{
        timeLabel = this.getTimeTypeLabel(this.timeCheck,newObj.timeType,{value:'timeType',label:'content'})
      }
      this.tagsData.push({
        isClick:true,
        iconName:'showTips',
        name:timeLabel + isForever + lengthStr + "提醒",
        minWidth:253,
        width:'',
        iconWidth:16,
        iconHeight:16,
        maxWidth:538
      })
      this.$emit("change");
    },
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
    // 表情转换
    getEmojiNameFormat(value) {
      return getEmojiValue(value)
    },
    // 下载/预览文件
    handleCommand(command){
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

    showRecall() {
      return (val)=>{
        return this.currentThreeTime(val.createTime) 
        && val.feedbackId == this.userId 
        && val.feedbackType != 3 
        && val.feedbackType != 5 
        && [0,1].includes(this.rowData.state)
      }
    },

    changeShowTips(style,item){

      if(this.isOtherTask) return
      // 判断状态 执行人且状态小于等于2 才能唤起提醒
      if(this.userId == this.rowData.userId && this.row.state<=2){
        this.style = style
        console.log('3======',this.rowData.acrossList)
        this.$refs.remind.init(this.rowData);
      }
    },
    closeImgFun() {
      this.show = false
    },
    openParentTaskDialog(pid) {
        this.$refs.parentTaskDialog.init(pid)
    },
    initView() {
      const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
        return [
          ['M', x - r, y - r],
          ['a', r, r, 0, 1, 0, r * 2, 0],
          ['a', r, r, 0, 1, 0, -r * 2, 0]
        ]
      }

      const data = JSON.parse(JSON.stringify(this.listData))

      G6.registerNode(
        'icon-node',
        {
          options: {
            size: [60, 20],
            stroke: '#3471FF',
            fill: '#3471FF'
          },
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg)
            const { labelCfg = {}} = cfg

            const w = styles.width
            const h = styles.height
            let keyStyle = styles
            if(cfg.pid === 0) {
              keyStyle = {...keyStyle,  radius: 20 }
            }

            /**
             * 查找父节点
             * */
            function getParentId(list, taskId) {
              for (let i in list) {
                if (list[i].taskId === taskId ) {
                  return [list[i]]
                }
                if (list[i].children) {
                  let node = getParentId(list[i].children, taskId)
                  if (node !== undefined) {
                    return node.concat(list[i])
                  }
                }
              }
            }

            // 除开root节点，所有分支最后一个节点，检查其所有父节点已完成 // cfg.pid != -1 && cfg.pid != 0 &&
            if ( cfg.children.length === 0) {
              // 节点完成了的变成椭圆
               const arr = getParentId(data.children, cfg.taskId)
              if (!arr) return
              let newArr = arr.filter(item => item.pid != '0' && item.pid != '-1') ;
              console.log(newArr)
              // 之前教taskState ,&& item.pid != 0  && item.pid != -1
              if (newArr.every(item => item.state >= 3 )) {
                keyStyle = { ...keyStyle,fill:'#C8D1E6',stroke:'#C8D1E6',hover: {
                            stroke:'#C8D1E6',
                            lineWidth: 2
                          }, radius: 20 }
              }
            }
            const attrs = {
              ...keyStyle,
              x: -w / 2,
              y: -h / 2,
            }
            const keyShape = group.addShape('rect', {attrs})

            /**
             * 文本超出省略
             * @param {string} str The origin string
             * @param {number} maxWidth max width
             * @param {number} fontSize font size
             * @return {string} the processed result
             */
            const fittingString = (node, maxWidth, fontSize) => {
              let str ;
              if(node.pid !== '-1') {
                str = node.username || node.initiator;
                maxWidth = 120;
              }else {
                str = node.initiator;
                maxWidth = 145;
              }

              const ellipsis = '...';
              const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
              let currentWidth = 0;
              let res = str;
              const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
              str.split('').forEach((letter, i) => {
                if (currentWidth > maxWidth - ellipsisLength) return;
                if (pattern.test(letter)) {
                  currentWidth += fontSize;
                } else {
                  currentWidth += G6.Util.getLetterWidth(letter, fontSize);
                }
                if (currentWidth > maxWidth - ellipsisLength) {
                  res = `${str.substr(0, i)}${ellipsis}`;
                }
              });
              return res;
            };

            // 文字
            group.addShape('text', {
              attrs: {
                ...labelCfg.style,
                text: fittingString(cfg , 120, 12),
                textAlign: cfg.pid !== '-1' ? 'center' : 'center',
                x: cfg.pid !== '-1' ? (50 - w / 2 +10) :   (50 - w / 2 + 22),
                y: 25 - h / 2,
              }
            })
            return keyShape
          },
          update: undefined
        },
        'rect',
      )

      // 线
      G6.registerEdge('flow-line', {
        draw(cfg, group) {
          const startPoint = cfg.startPoint
          const endPoint = cfg.endPoint

          const { style } = cfg
          const shape = group.addShape('path', {
            attrs: {
              stroke: style.stroke,
              endArrow: style.endArrow,
              path: [
                ['M', startPoint.x, startPoint.y],
                ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
                ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
                ['L', endPoint.x, endPoint.y]
              ]
            }
          })

          return shape
        }
      })

      const defaultStateStyles = {
        hover: {
          // stroke: '#3471FF',
          stroke:'#5E8DFF',
          lineWidth: 2
        }
      }

      const defaultNodeStyle = {
        // fill: '#3471FF',
        // stroke: '#3471FF',
        fill:'#5E8DFF',
        stroke:'#5E8DFF',
        radius: 5
      }

      // 画圆形
      function ellipse2path(cx, cy, rx, ry) {
        if (isNaN(cx - cy + rx - ry)) return; var path = 'M' + (cx-rx) + ' ' + cy + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2*rx + ' 0' + 'a' + rx + ' ' + ry + ' 0 1 0 ' + (-2*rx) + ' 0' + 'z'; return path; }

      const defaultEdgeStyle = {
        // stroke: '#3471FF',
        stroke: '#5E8DFF',
        // 隐藏掉圆点
        // endArrow: {
        //   path: ellipse2path(12,0,4,4),
        //   fill: '#3471FF',
        //   d: -13,
        // }
      }

      const defaultLayout = {
        type: 'compactBox',
        direction: 'TB',
        getId: function getId(d) {
          return d.taskId
        },
        getHeight: function getHeight() {
          return 100;
        },
        getWidth: function getWidth() {
          return 16
        },
        getVGap: function getVGap() {
          return 40
        },
        getHGap: function getHGap() {
          return 70
        }
      }

      const defaultLabelCfg = {
        style: {
          fill: '#FFFFFF',
          fontSize: 12
        }
      }

      const container = document.getElementById('taskViewContainer')
      const width = container.scrollWidth
      const height = container.scrollHeight || 500

      const minimap = new G6.Minimap({
        size: [150, 100]
      })

      const tooltip = new G6.Tooltip({
      offsetX: 10,
      offsetY: 10,
      // the types of items that allow the tooltip show up
      // 允许出现 tooltip 的 item 类型
      itemTypes: ['node'],
      // custom the tooltip's content
      // 自定义 tooltip 内容
      getContent: (e) => {
        const outDiv = document.createElement('div');
        outDiv.style.width = 'fit-content';
        outDiv.style.color = 'black';
        outDiv.innerHTML = `<h4>${e.item.getModel().username ? e.item.getModel().username : e.item.getModel().initiator}</h4>`;
        return outDiv;
      },
    });

      const graph = new G6.TreeGraph({
        container: 'taskViewContainer',
        width,
        height,
        linkCenter: true,
        // plugins: [minimap],
        modes: {
          default: ['drag-canvas', 'zoom-canvas']
        },
        defaultNode: {
          type: 'icon-node',
          size: [120, 40],
          style: defaultNodeStyle,
          labelCfg: defaultLabelCfg
        },
        defaultEdge: {
          type: 'flow-line',
          style: defaultEdgeStyle
        },
        nodeStateStyles: defaultStateStyles,
        edgeStateStyles: defaultStateStyles,
        layout: defaultLayout,

        // 节点去掉鼠标悬浮展示
        // plugins: [tooltip],
      })


      graph.data(data)
      graph.node(node => {
        if (node.pid == '-1') {
          console.log(node)
          return {
            style:{
              fill: '#C8D1E6',
              stroke: '#C8D1E6',
              width: 145
            }
          }
        }
        return {
          style: {
            fill: '#5E8DFF',
            stroke: '#5E8DFF'
          }
        }
      })

      graph.render()
      graph.fitView()
      graph.translate(0, -100);
      graph.zoom(1)

      graph.on('node:mouseenter', (evt) => {
        const { item } = evt
        // 完成了的不展示边框
        if(evt.target.attrs.stroke=='#C8D1E6'){
          graph.setItemState(item, 'hover', false)
        }else{
          graph.setItemState(item, 'hover', true)
        }
      })
      graph.on('node:mouseleave', (evt) => {
        const { item } = evt
        graph.setItemState(item, 'hover', false)
      })
      graph.on('node:click', (evt) => {
        const { item, target } = evt
        if(item._cfg.model.pid == "-1" || item._cfg.model.pid == "0") {
          return ;
        }
        const targetType = target.get('type')
        const name = target.get('name')

        // label
        if(targetType === 'rect' || 'text') {
          const model = item.getModel()
          this.getDataById(model)
        }
      })

      // 只有一个节点缩放
      if(data.children.length === 0 || data.children.length === 1) {
        graph.zoom(0.3, {
          x: container.scrollWidth / 2,
          y: container.scrollHeight / 2
        });
      }
      // 两个节点的进行缩放
      if (data.children.length === 2 && data.children[0].children.length === 0) {
        graph.zoom(0.5, {
          x: container.scrollWidth / 2,
          y: container.scrollHeight / 2
        });
      }
      if (typeof window !== 'undefined') {
        window.onresize = () => {
          if (!graph || graph.get('destroyed')) return
          if (!container || !container.scrollWidth || !container.scrollHeight) return
          // 修改画布大小
          graph.changeSize(container.scrollWidth, container.scrollHeight)
          // 将图移动到画布中心
          graph.fitCenter()
        }
      }
    }
  }
}

</script>

<style lang="scss" scoped>
.el-dialog__footer {
        display: flex;
        justify-content: flex-end;
    }
  #taskViewDetail {
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

</style>

<style scoped lang="scss">
.popup_content {
  min-height: 250px;
  padding: 10px 5px;
  background: #eeeeee;
  border-radius: 4px;

  .text {
    padding: 5px 0px;
    font-size: 16px;
    font-weight: 400;
    color: #222222;
    .texts {
      font-size: 16px;
      color: #008cff;
    }
  }
}
#taskViewDrawerDetail{
  .emojiImg{
    width: 20px;
  }
  .taskViewDrawerDetailMask{
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0px;
    top: 0px;
    z-index: 9;
    background: rgba(0,0,0,0.5);
  }
  .taskViewDrawer_cont{
      position: fixed;
      bottom: 0px;
      right: 0;
      width: 680px!important;
      padding: 20px 10px;
      background: #FFF;
      z-index: 10;
      border-radius: 10px 10px 0 0;
    }

  .task-drawer-inner {
    height: calc(100vh - 260px);
    margin-top: 10px;
    padding: 0 20px;
    overflow-y: scroll;

    .parent_task_name,
    .task-body,
    .task-call-box{
      display: flex;
      align-items: center;
      >img{
        margin-right: 24px;
        width: 18px;
      }
    }
    // 父级
    .parent_task_name{
      font-size: 16px;
      color: #333333;
      margin-bottom: 20px;
      width: 100%;
      .parent_cont{
        width: 100%;
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
            .title{
              display: flex;
              align-items: center;
              color: #37476B;
              font-size: 14px;
              cursor: pointer;
              font-family: 'SourceHanSansCN-Light';
              img, .file-ico{
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
      .right_cont{
        width: 100%;
      }
    }
    .close_btn{
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      .title{
        font-size: 18px;
        color: #3471FF;
      }
      img{
        cursor: pointer;
        width: 16px;
      }
    }
    // &::-webkit-scrollbar{
    //   display: none;
    // }
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
        .file_item{
          display:flex;
          align-items: center;
          .file_name{
            max-width: 366px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
          .file-ico{
            margin-right: 10px;
            img{
              width: 18px;
            }
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
        margin-left:12px;
        width: 11px;
        height: 11px;
        cursor: pointer;
      }
    }
  }
}

#taskViewContainer {
  position: relative;

  canvas {
    position: absolute !important;
    top: -50px !important;
  }
}

</style>
