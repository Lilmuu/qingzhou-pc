<!-- 任务查询 -->
<template>
  <div id="taskR">
    <div class="top-label flexd-top-label">
      <TabLabelSlot :init-active-name="topTabActiveName" :isActiveClass="true" :option="topLabelOption" @tabChange="handleTopTabChange">
        <template slot="right">
          <div id="highSearch" @click="changeHighSearch">
            <img src="@/assets/img/mytodo/new_task/newTask_reset.png" alt="">
          </div>
        </template>
      </TabLabelSlot>
    </div>
    <div class="takeRContent">
      <div id="HighSeachBox" v-show="highSearchShow">
        <div class="HighSeachLeft" >
          <el-form :model="formInline" class="demo-form-inline" ref="searchForm" size="small" label-width="90px">
            <el-form-item label="截止日期" prop="date" class="creat_time">
              <el-date-picker
              v-model="formInline.date"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              :clearable="false"
              value-format="yyyy-MM-dd"
              end-placeholder="结束日期">
              </el-date-picker>
              <img class="newTask_date" src="@/assets/img/mytodo/new_task/newTask_date_001.png" alt="">
              <div class="tiemItem" @click="changeTime('week')">本周</div>
              <div class="tiemItem" @click="changeTime('month')">本月</div>
            </el-form-item>
            <el-form-item label="任务/项目名称" prop="content">
              <el-input v-model="formInline.content" placeholder="请输入任务/项目名称"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="state">
              <el-select v-model="formInline.state" placeholder="全部">
                <el-option v-for="item in taskStateNew" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="发起人" prop="initiator" >
              <el-input v-model="formInline.initiator" placeholder="输入发起人"></el-input>
            </el-form-item>
            <el-form-item label="执行人" prop="executor">
              <el-input v-model="formInline.executor" placeholder="输入执行人"></el-input>
            </el-form-item>
            <el-form-item label="优先级" prop="emergencyLevel">
              <el-select v-model="formInline.emergencyLevel" placeholder="全部">
                <el-option v-for="item in emergencyLevel" :label="item.label" :value="item.value" :key="item.value"></el-option>
                </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="HighSeachRight">
          <div class="btn_list">
            <el-tooltip class="item" effect="dark" content="搜索" placement="top">
              <div class="btn_item" @click="getList">
                <img src="@/assets/img/mytodo/new_task/nawTask_search002.png" alt="">
              </div>
            </el-tooltip>
            <div class="line"></div>
            <el-tooltip class="item" effect="dark" content="清空" placement="top">
              <div class="btn_item" @click="clearSearch">
                <img src="@/assets/img/mytodo/new_task/newTask_clearSearch.png" alt="">
              </div>
            </el-tooltip>
            <!-- <div class="line"></div>
            <el-tooltip class="item" effect="dark" content="更多" placement="top">
              <div class="btn_item" @click="changeHighSearch">
                <img src="@/assets/img/mytodo/new_task/newTask_reset.png" alt="">
              </div>
            </el-tooltip> -->
          </div>
        </div>
      </div>

      <div class="taskRBody">
        <div class="takeCareTableTitle">
          <div class="table_title_item createTime">创建日期</div>
          <div class="table_title_item takeName">任务/项目名称</div>
          <div class="table_title_item content">任务内容</div>
          <div class="table_title_item initiator">发起人</div>
          <div class="table_title_item userName">执行人</div>
          <div class="table_title_item endTime">截止时间</div>
          <div class="table_title_item completeTime">完成时间</div>
          <div class="table_title_item emergencyLevel">优先级</div>
          <div class="table_title_item state">状态</div>
        </div>
        <div :style="{maxHeight:`${tableHeight}px`,overflow: 'auto'}" class="takeCareTableMain">
          <div v-if="fetchLoaded">
            <div v-for="(item,index) in taskTableOption" :key="index">
              <div  v-if="item.list.length>0">
                <div class="table_item_Title" @click="item.open = !item.open">
                  <img :class="item.open?'tableItemDownOpen':'tableItemDown'" src="@/assets/img/icon/tableItemDown.png">
                  <span>{{item.name}} ({{item.list.length}}项)</span>
                </div>
                <div class="table_item_content" v-if="item.open">
                  <div v-for="(items,indexs) in item.list" :key="item.name+'-'+indexs" class="takeCareTableTitle takeCareTableContent" @click="handleRowClick(items)">
                    <div class="table_title_item createTime"> {{ items.createTime ? items.createTime.substring(0, 10) : items.createTime }} </div>
                    <div class="table_title_item takeName">{{ items.name }}</div>
                    <div class="table_title_item content"><div class="content_val" v-html="items.content"></div></div>
                    <div class="table_title_item initiator">{{ items.initiator }}</div>
                    <div class="table_title_item userName">{{ items.userName }}</div>
                    <div class="table_title_item endTime">{{ items.endTime ? items.taskType == 0 ? items.endTime.split(" ")[0] : items.endTime : "" }}</div>
                    <div class="table_title_item completeTime">{{items.completeTime ? items.completeTime.substring(0,items.completeTime.length - 3) : items.completeTime}}</div>
                    <div class="table_title_item emergencyLevel">{{ getEmergencyLevel(items.emergencyLevel) }}</div>
                    <div class="table_title_item state" :style="{ color: getStateColor(items.state) }">{{ getSate(items.state) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Empty v-else :fetchLoaded="!fetchLoaded"></Empty>
        </div>
      </div>
    </div>
     <drawer @refrsh="getList" ref="drawerDetail" 
     @handleTopTabChange="handleDraTopTabChange" 
     :topTabActiveName="draTopTabActiveName" 
     :topLabelOption="draTopLabelOption" @handleDrawerClose='handleDraClose'></drawer>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import TabLabelSlot from '@/components/TabLabelSlot/index'
import Empty from '@/components/Empty/index'
import { mapGetters, mapState } from 'vuex'
import { pageOption,allTask,taskStateNew } from "@/const/dicData"
import drawer from '@/components/drawerDetail/drawer'
const topLabelOption = [
  { label: '全部任务', name: 'qbrw' , path:'/task/getAllTask', icon:require('@/assets/img/mytodo/all_task.png'), activeIcon: require('@/assets/img/mytodo/all_task_select.png') },
  { label: '我发起的', name: 'wfqd' , path:'/task/initiate', icon:require('@/assets/img/mytodo/me_initiate.png'), activeIcon: require('@/assets/img/mytodo/me_initiate_select.png') },
  { label: '我执行的', name: 'wzxd' , path:'/task/perform', icon:require('@/assets/img/mytodo/me_execute.png'), activeIcon: require('@/assets/img/mytodo/me_execute_select.png') },
  { label: '我关注的', name: 'wgzd' , path:'/task/attention', icon:require('@/assets/img/mytodo/me_collect.png'), activeIcon: require('@/assets/img/mytodo/me_collect_select.png') }
]
const draTopLabelOption = [
  { label: '任务详情', name: 'rwxq' },
  { label: '任务视图', name: 'rwst' }]
import dayjs from 'dayjs'
import { taskRAll } from '@/api/taskR'
import { emergencyLevelNew,taskStatus} from '@/const/dicData'
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {TabLabelSlot,Empty,drawer},
  data() {
    // 这里存放数据
    return {
      emergencyLevel:emergencyLevelNew,
      tableHeight: 0,
      taskStatus:taskStatus,
      tableLoading: true,
      topTabActiveName: 'qbrw',
      draTopTabActiveName:'rwxq',
      topLabelOption: topLabelOption,
      draTopLabelOption:draTopLabelOption,
      highSearchShow:false,
      formInline:{
        emergencyLevel:"",
        content:'',
        date:'',
        initiator:'',
        state:'',
        executor:''
      },
      fetchLoaded:true,
      page:{
        page: JSON.parse(JSON.stringify(pageOption)),
      },
      tableData:[],
      // tableOption: JSON.parse(JSON.stringify(allTask)),
      tableOption: allTask,
      reqUrl:'/task/getAllTask',
      taskStateNew:taskStateNew,
      // #3370FF-待查看 #14C0FF-已查看  #FF8800-待验收  #F54A45-已关闭  #3BC92C-已完成
      colorList:['#3370FF','#14C0FF','#FF8800','#F54A45','#3BC92C'],
      startPlaceholder: "" ,
      endPlaceholder: "",
      taskTableOption:[{
            name:'置顶任务',
            open:true,
            isTop:true,
            list:[]
        },{
            name:'本周',
            open:true,
            list:[]
        },{
            name:'上周',
            open:true,
            list:[]
        },{
            name:'两周前',
            open:true,
            list:[]
        },{
            name:'上个月',
            open:true,
            list:[]
        },{
            name:'更早',
            open:true,
            list:[]
        }]

    };
  },
  // 监听属性 类似于data概念
  computed: {
    ...mapGetters([
      'isFull','ratio'
    ]),
    ...mapState({
      'winClientWidth': state => state.app.winClientWidth
    }),
    getWsMsg() {
      return this.$store.state.socket.socketMsg
    }
  },
  // 监控data中的数据变化
  watch: {
    getWsMsg: {
      handler(msg) {
        if (msg.type === 'pushEvent') {
          const count = msg.data
          if (count > 0) {
            this.getList()
          }
        }
      },
      deep: true
    },
    winClientWidth(newVal, oldVal){
      console.log('-----------------22222222---------------')
      this.computedFun()
    }
  },
  // 方法集合
  methods: {
    // 获取对应的颜色
    getStateColor(state){
      return this.colorList[state]
    },
    getEmergencyLevel(val) {
      let str = val;
      this.emergencyLevel.forEach(item => {
        if(val==item.value){
          str = item.label
        }
      })
      return str
    },
    getSate(val){
      let str = val
      this.taskStateNew.forEach(item=>{
        if(val==item.value){
          str = item.label
        }
      })
      return str
    },
    handleDraTopTabChange(item){
        this.draTopTabActiveName = item.name
    },
    handleDraClose(){
      console.log('关闭任务详情 -- item')
      this.draTopTabActiveName = 'rwxq'
    },
    handleRowClick(row){
      this.$refs.drawerDetail.init(row)
    },
    changeTime(val){
      this.formInline.date = []
      if(val=='week'){
        // 获取本周周一至本周周日的日期
        this.formInline.date.push(this.getMonday("s",0));
        this.formInline.date.push(this.getMonday("e",0));
        //this.formInline.date.push(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'))
        //this.formInline.date.push(dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD'))
      }else{
        this.formInline.date.push(dayjs().startOf('month').format('YYYY-MM-DD'))
        this.formInline.date.push( dayjs().endOf('month').format('YYYY-MM-DD'))
      }
    },
    //  清空搜索条件
    clearSearch(){
        this.$refs['searchForm'].resetFields()
    },
    // 顶部tab切换
    handleTopTabChange(val) {
      this.topTabActiveName = val.name
      this.reqUrl = val.path
      this.getList()
    },
    // 显隐高级查询
    changeHighSearch(){
      console.log('-----------------333333333---------------',this.winClientWidth)
      this.highSearchShow = !this.highSearchShow
      this.computedFun()
    },
    computedFun(){
      let windowHeight = window.innerHeight
      if(this.highSearchShow){
        // 展开 
        const highSeachBoxWidth = this.winClientWidth - 360
        if(highSeachBoxWidth < 1066){
          this.tableHeight = windowHeight - 302 - 248
        }else if(highSeachBoxWidth < 1536){
          this.tableHeight = windowHeight - 142 - 248
        }else{
          this.tableHeight = windowHeight - 102 - 248
        }
      }else{
        // 收起
        this.tableHeight = windowHeight - 200
      }
    },
    getList(){
      let obj = {}
      if(this.formInline.date && this.formInline.date.length==2){
          obj.startTime = this.formInline.date[0]
          obj.endTime = this.formInline.date[1]
      }
      this.tableLoading = true
      taskRAll(this.reqUrl,Object.assign(obj,this.formInline,{date:''})).then(res=>{
        this.tableLoading = false
        let count = 0
          if(res.data.data) {
            this.taskTableOption[0].list = res.data.data.topList
            this.taskTableOption[1].list = res.data.data.weekList
            this.taskTableOption[2].list = res.data.data.lastWeekList
            this.taskTableOption[3].list = res.data.data.twoWeekList
            this.taskTableOption[4].list = res.data.data.lastMonthList
            this.taskTableOption[5].list = res.data.data.earlierList
          }else {
            this.taskTableOption[0].list = []
            this.taskTableOption[1].list = []
            this.taskTableOption[2].list = []
            this.taskTableOption[3].list = []
            this.taskTableOption[4].list = []
            this.taskTableOption[5].list = []
          }
        for(let key in res.data.data){
            if(key!='unreadCount'){
                count = count + res.data.data[key].length
            }
        }
        if(count==0){
            this.fetchLoaded = false
        }else{
            this.fetchLoaded = true
        }
      }).finally(()=>{
        this.tableLoading = false
      })
    },
    /**
     *  获取上周/本周/下周的方法
     *  @param type: s：周一 ， e：周日
     *  @param dates 0：本周，-1：上周，1：下周
     *  @author 张浩
     */
    getMonday(type, dates) {
      let now = new Date();
      let nowTime = now.getTime();
      let day = now.getDay();
      let longTime = 24 * 60 * 60 * 1000;
      let n = longTime * 7 * (dates || 0);
       let dd = "";
      if (type == "s") {
          dd = nowTime - (day - 1) * longTime + n;
      };
      if (type == "e") {
          dd = nowTime + (7 - day) * longTime + n;
      };
      dd = new Date(dd);
      let y = dd.getFullYear();
      let m = dd.getMonth() + 1;
      let d = dd.getDate();
      m = m < 10 ? "0" + m: m;
      d = d < 10 ? "0" + d: d;
      let day2 = y + "-" + m + "-" + d;
      return day2;
  }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.getList()
    this.tableHeight = window.innerHeight - document.getElementById("HighSeachBox").offsetHeight - document.getElementsByClassName("table_item_content").length * 40 - 200;
    this.startPlaceholder = this.getMonday("s",0) ;
    this.endPlaceholder = this.getMonday("e",0);
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
#taskR{
  .emptyBasicContainer {
    height: calc(100vh - 338px);
  }
  .flexd-top-label{
    top:42px !important;
    width: calc(100vw - 260px - 80px);
    .tabRowSlot{
      height: 52px;
      display: flex;
      align-items: flex-end;
      padding-left: 27px;
      justify-content: space-between;
      width: calc(100vw - 260px - 80px);
      background-color: #FFF;
    }
  }
  #highSearch{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 4px;
    margin-bottom: 12px;
    cursor: pointer;
    &:hover{
      background: #EDEDEE;
    }
  }
  .takeRContent{
    margin-top: 55px;
    padding: 10px 10px 0 10px;
    #HighSeachBox{
      display: flex;
      .HighSeachLeft{
        width: calc(100% - 86px);
        .demo-form-inline {
          display: flex;
          flex-wrap: wrap;
          margin-top: 10px;
          .el-form-item {
            .el-form-item__label{
              color: #0F1633;
            }
            .el-form-item__content{
              position: relative;
              width: 370px;
              margin-left: 100px!important;
              .newTask_date{
                position: absolute;
                right: 140px;
                width: 14px;
                margin-top: -8px;
                top: 50%;
              }
            }
            .el-input.el-input--small{
              .el-input__inner{
                width: 240px;
              }
            }
            .el-date-editor.el-input__inner{
              width: 240px;
              .el-input__icon {
                display: none;
              }
              .el-range-input{
                width: 48%;
              }
            }
          }
          .creat_time{
            .el-form-item__content{
              display: flex;
              align-items: center;
              padding-right: 50px;
              .tiemItem{
                cursor: pointer;
                color: #3370FF;
                margin-left: 10px;
              }
            }
          }
          .el-form-item__label {
            padding: 0px;
          }
          
        }
      }
    }
    .taskRBody{
      padding: 14px 20px;
      background: #FFF;
      border-radius: 10px;
      .table_item_Title{
        display: flex;
        align-items: center;
        height: 40px;
        // margin-top: 8px;
        padding: 0px 9px;
        font-size: 16px;
        color: #1F2329;
        cursor: pointer;
        background: #F6F6F6;
        border-bottom: 1px solid #ececec;
        span{
          margin-left:10px;
        }
      }
      .table_item_content{
        .takeCareTableTitle.takeCareTableContent:last-child{
          border-bottom: none;
        }
      }
      .takeCareTableContent{
        font-size: 14px!important;
      }
      .takeCareTableTitle{
        display: flex;
        align-items: center;
        padding: 0px 9px;
        font-size: 16px;
        height: 48px;
        border-bottom: 1px solid #EEEEEE;
        opacity: 1;
        cursor: pointer;
        .table_title_item{
          color: #1F2329;
          padding-right: 5px;
          img{
            cursor: pointer;
          }
          .content_val{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: 48px;
            line-height: 48px;
            p {
              height: 48px;
              line-height: 48px;
              margin: 0;
            }
          }
        }
        .createTime{
          width:10%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .takeName{
          width:14%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .content{
          width:20%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .initiator{
          width:10%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .userName{
          width:10%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .endTime{
          width:10%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .completeTime {
          width:10%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .emergencyLevel{
          width:10%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .state {
          width: 6%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }

      }
    }
  }
}
.el-range__icon {
  display: none;
}
.formItem {
  width: 395px;
  height: 40px;
  display: flex;
  margin-bottom: 10px;
  .tiemItem{
    cursor: pointer;
    width: 32px;
    margin-left: 10px;
    font-size: 13px;
    color: #3471FF;
    margin-bottom: 10px;
    line-height: 32px;
  }
}
.takeCareTableMain::-webkit-scrollbar {
  width: 5px;
}
.takeCareTableMain::-webkit-scrollbar-track {
  background-color: #fff;
  border-radius: 0 10px 10px 0;
}
</style>

