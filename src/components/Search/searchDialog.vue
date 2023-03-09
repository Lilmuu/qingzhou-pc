<!--  -->
<template>
  <div class="searchDialogBox">
    <el-dialog append-to-body width="550px" :close-on-click-modal="false" :visible.sync='searchDialog' custom-class="searchDialog" :show-close="false">
        <div slot="title" class="searchDialogTitle">
            <el-input
                type="input"
                placeholder="任务标题"
                @keyup.native.enter="searchList"
                v-model="searchVal">
                <div slot="prefix" class="prefix">
                    <img src="@/assets/img/search/search.png">
                </div>
            </el-input>
            <img class="dialogClose" src="@/assets/img/search/search_close.png" @click="searchDialogClose">
        </div>
        <div>
            <searchEmpty v-if="searchData && searchTableData.length==0"></searchEmpty>
            <div v-else class="searchBody">
                <div :class="index==searchActive?'searchItem searchItem_active':'searchItem'" v-for="(item,index) in searchTableData" :key="index" @click="changeItemActive(index)">
                    <div class="searchItemTitle">
                        <div class="searchItemTitlePoint"></div>
                        <div class="searchItemTitleName">任务标题</div>
                        <div class="searchItemTime">2020-12-09</div>
                    </div>
                    <div class="searchItemBody">日程任务详细内容情况请仔细阅读内容情况请仔细阅读请仔细阅读...</div>
                </div>
            </div>
        </div>
    </el-dialog>
    <el-drawer
        :visible.sync="drawer"
        :destroy-on-close="true"
        :wrapperClosable="false"
        custom-class="taskDrawer"
        direction="rtl"
        :show-close="false">
        <template slot="title">
            <TabLabelSlot paddingLeft="0"  :init-active-name="topTabActiveName" :option="topLabelOption" @tabChange="handleTopTabChange" :isActiveClass="true">
                <template slot="right">
                    <img src="@/assets/img/icon/close.png" class="close_icon" @click="closeDrawer">
                </template>
            </TabLabelSlot>
        </template>
        <drawerDetail ref="drawerDetail" :drawer="drawer" :isShowTips="isShowTips" :tagsData="tagsData" v-if="topTabActiveName=='rwxq'" @change="changeTags"></drawerDetail>
    </el-drawer>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import searchEmpty from './searchEmpty'
import TabLabelSlot from '@/components/TabLabelSlot/index'
import drawerDetail from '@/components/drawerDetail/index'
import dayjs from 'dayjs'

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {searchEmpty,TabLabelSlot,drawerDetail},
  data() {
    // 这里存放数据
    return {
        searchDialog:false,
        searchVal:'',
        searchData:true,
        searchTableData:[],
        searchActive:-1,
        drawer:false,
        topTabActiveName:'rwxq',
        topLabelOption:[
            { label: '任务详情', name: 'rwxq' },
            { label: '任务视图', name: 'rwst' }],
        tagsData:[{
            iconName:'time',
            name:"05月22日 18:00截止",
            width:253,
            iconWidth:16,
            iconHeight:16,
            maxWidth:257,
            margin:32
        },{
            iconName:'sender',
            name:"彭涛发起",
            width:253,
            maxWidth:320,
            iconWidth:16,
            iconHeight:16,
            margin:0
        },{
            iconName:'implement',
            name:"郑志勇、龙俊彦、李巍执行",
            width:545,
            maxWidth:545,
            iconWidth:14,
            iconHeight:16,
            margin:0
        },{
            iconName:'follow',
            name:"郑志勇、龙俊彦、李巍、郑志勇、龙俊彦、李巍等关注",
            width:545,
            maxWidth:545,
            iconWidth:14,
            iconHeight:16,
            margin:0
        },{
            iconName:'status',
            name:"重要且紧急",
            width:176,
            maxWidth:176,
            iconWidth:16,
            iconHeight:16,
            margin:32
        },{
            iconName:'file',
            name:"某某某文档.word 某某某文档.pdf",
            width:322,
            iconWidth:16,
            iconHeight:16,
            maxWidth:545
        }],
        isShowTips:true
    };
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
      changeTags(val){
          console.log(val)
        this.isShowTips = false
          if(val.type=="one"){
            this.tagsData.push({
                iconName:'showTips',
                name:val.data.rangeTimeStart +' '+ val.data.rangeTimeEnd + "提醒",
                width:320,
                iconWidth:16,
                iconHeight:16,
                maxWidth:320
            })
          }else if(val.type=="more"){
              let content = ''
              if(val.data.loop[0].value == 1){
                content = val.data.loop[0].label
              }else if(val.data.loop[0].value == 2){
                content = val.data.loop[0].label
              }else if(val.data.loop[0].value == 3){
                content = val.data.loop[0].label + val.data.week
              }else{
                if(val.data.monthIndex == 0){
                    content = val.data.loop[0].label  + '最后一个工作日'
                }else if(val.data.monthIndex == -1){
                    content = val.data.loop[0].label  + '第一个工作日'
                }else{
                    content = val.data.loop[0].label  + val.data.month
                }
              }
            this.tagsData.push({
                iconName:'showTips',
                name:content +' ' + dayjs(val.data.time).format('HH:mm') + " 提醒 " + (val.data.endTime?val.data.endTime +'截止':''),
                width:320,
                iconWidth:16,
                iconHeight:16,
                maxWidth:320
            })
          }else{
            this.tagsData.push({
                iconName:'showTips',
                name:val.data.content,
                width:320,
                iconWidth:16,
                iconHeight:16,
                maxWidth:320
            })
          }

      },
      closeDrawer(){
          this.drawer = false
      },
      handleTopTabChange(item){
          this.topTabActiveName = item.name
      },
      searchList(){
        if(this.searchVal){
            this.searchData = false
            this.searchTableData = [{},{},{},{},{}]
        }else{
            this.searchData = true
            this.searchTableData = []
        }
      },
      changeItemActive(index){
          this.searchActive = index
          this.drawer = true
      },
      searchDialogClose(){
        this.searchActive = -1
        this.searchDialog = false
      },
      init(){
        this.searchData = true
        this.drawer = false
        this.searchTableData = []
        this.searchActive = -1
        this.searchDialog = true
      }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
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
.searchDialog{
    box-shadow: 0px 2px 25px rgba(0, 0, 0, 0.1);
    opacity: 1;
    border-radius: 6px;
    .searchDialogTitle{
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom:1px solid #DCDFE6;
        padding-bottom: 20px;
    }
    input{
        border:none;
        width: 300px;
        background: #F5F5F5;
        opacity: 1;
        border-radius: 25px;
        padding-left: 47px !important;
    }
    .el-input--prefix{
        display: flex;
        align-items: center;
        .el-input__prefix{
            margin-left: 15px;
            display: flex;
            align-items: center;
        }
    }
    .searchBody{
        margin-top: 10px;
        .searchItem{
            height: 80px;
            display: flex;
            padding:0px 20px;
            // align-items: center;
            flex-direction: column;
            justify-content: center;
            cursor: pointer;
            .searchItemTitle{
                display: flex;
                align-items: center;
                // justify-content: space-between;
                .searchItemTitlePoint{
                    width: 10px;
                    height: 10px;
                    background: #DCE7FE;
                    border-radius: 50%;
                    opacity: 1;
                }
                .searchItemTitleName{
                    margin-left: 9px;
                    font-size: 18px;
                    width: 397px;
                    margin-right:12px;
                }
                .searchItemTime{
                    font-size: 14px;
                }
            }
            .searchItemBody{
                margin-top: 10px;
                margin-left: 19px;
                width: 397px;
                margin-right:12px;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
        }
        .searchItem:hover{
            background: #F6F6F6;
            .searchItemTitlePoint{
                background: #3471FF;
            }
        }
        .searchItem_active{
            background: #F6F6F6;
            .searchItemTitlePoint{
                background: #3471FF !important;
            }
        }
    }
}
.dialogClose{
    cursor: pointer;
}
.el-dialog {
    max-height: 96%;
  }

  .el-dialog__header {
    // border-bottom: 1px solid #e8e8e8;
    border-radius: 4px 4px 0 0;
    padding:20px 20px 0px 20px !important;
  }

  .el-dialog {
    transform: none;
    left: 0;
    position: relative;
    margin: 0 auto;
  }
.searchDialog{
    .el-dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 0 !important;
        transform: translate(-50%, -50%);
        max-height: calc(100% - 30px);
        max-width: calc(100% - 30px);
        display: flex;
        flex-direction: column;

        >.el-dialog__body {
        overflow: auto;
        color: #666666;
        padding:0px 0px 30px 0px;
        }
    }
}
  .el-dialog__footer {
    border-top: 1px solid #e8e8e8;
    border-radius: 0 0 4px 4px;
  }
.task-tags-line{
    margin-top:30px;
    width: 545px;
    height: 1px;
    background: #DCDFE6;
    opacity: 1;
}
.emoji{
    cursor: pointer;
    margin-left: 26px;
    width: 22px;
    height: 22px;
}
.files{
    cursor: pointer;
    width: 22px;
    height: 22px;
    margin-left: 10px;
}
.marginTop62{
    margin-top: 32px;
}
</style>
