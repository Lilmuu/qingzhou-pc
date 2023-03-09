<template>
  <div id="searchBox">
    <div class="searchBox_left" >
        <!-- @click="open" -->
        <!-- <img src="@/assets/img/icon/search.png" class="search_icon" />
        <span>搜索</span> -->
        <el-input placeholder="搜索" v-model="searchVal" @focus="showSearchBody" class="sssss" :clearable="true">
          <div slot="prefix" class="search_prefix_box">
            <img src="@/assets/icon/icon_leftbar_search.png" class="search_icon" />
          </div>
          <!-- <img slot="suffix"  src="@/assets/icon/icon_leftbar_search.png" class="search_icon" /> -->
          
        </el-input>
        <div id="searchDialogBox" v-if="showSearchBodyVis">
          <div class="searchMask" @click="closeSearch"></div>
          <div class="searchBodys">
<!--            <div class="searchCount">根据任务名称和内容搜索到{{searchTableData.length}}条结果</div>-->
            <div :class="searchData && searchTableData.length==0?'searchBodyC':'searchBodyB'">
              <searchEmpty v-if="searchData && searchTableData.length==0"></searchEmpty>
              <div v-else class="searchBody">
                <div :class="index==searchActive?'searchItem searchItem_active':'searchItem'"
                  v-for="(item,index) in searchTableData"
                  :key="index"
                  @click="changeItemActive(index,item)">
                  <div class="searchItemTitle">
                    <div class="searchItemTitlePoint"></div>
                    <div class="searchItemTitleName">
                      <el-tooltip effect="dark" :content="item.name" placement="top-start">
                        <span>{{item.name}}</span>
                      </el-tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div class="searchBox_right" v-if="activeName!='myTarget'">
      <img src="@/assets/icon/icon_leftbar_plus.png" class="circle-plus"  @click="AddClick" alt="" />
    </div>
    <searchDialog ref="searchDialog"></searchDialog>
    <drawer ref="drawer"
    @handleTopTabChange="handleDraTopTabChange"
    :topTabActiveName="draTopTabActiveName"
    :topLabelOption="draTopLabelOption"
    @handleDrawerClose='handleDraClose'></drawer>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import searchDialog from './searchDialog'
import searchEmpty from './searchEmpty'
import drawer from '@/components/drawerDetail/drawer'
const draTopLabelOption = [
            { label: '任务详情', name: 'rwxq' },
            { label: '任务视图', name: 'rwst' }]
import { taskSearch } from '@/api/taskCare'
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {searchDialog,searchEmpty,drawer},
  props:{
    activeName:{
      type:String,
      default: ()=>{
        return ''
      }
    }
  },
  data() {
    // 这里存放数据
    return {
        searchVal:'',
        searchData:true,
        searchTableData:[],
        showSearchBodyVis:false,
        searchActive:-1,
        draTopLabelOption:draTopLabelOption,
        draTopTabActiveName:'rwxq',
    };
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {
    searchVal(newVal,oldVal){
      if(newVal){
        this.showSearchBodyVis = true
      }else{
        this.showSearchBodyVis = false
      }
      this.searchList()
    }
  },
  // 方法集合
  methods: {
    handleDraTopTabChange(item){
        this.draTopTabActiveName = item.name
    },
    closeSearch(){
      this.showSearchBodyVis = false
    },
    handleDraClose(){
      console.log('关闭任务详情 -- item')
      this.draTopTabActiveName = 'rwxq'
    },
    searchList(){
      if(this.searchVal){
        taskSearch({search:this.searchVal}).then(res=>{
          if (res.data.code === 200) {
            this.searchTableData = res.data.data
            if(this.searchTableData.length){
              this.searchData = true
            }else{
              this.searchData = false
            }
          }
        }).finally(()=>{
          this.searchData = true
        })
      }else{
        this.searchData = true
        this.searchTableData = []
      }
    },
    changeItemActive(index,item){
      this.searchActive = index
      this.$refs.drawer.init(item)
    },
    showSearchBody(){
      this.searchActive = -1
      if(this.searchVal){
        this.showSearchBodyVis = true
        this.searchList()
      }
    },
    open(){
      this.$refs.searchDialog.init()
    },
    AddClick(){
        this.$emit("click")
    }
  },
};
</script>
<style lang='scss'>
//@import url(); 引入公共css类
#searchBox {
  display: flex;
  align-items: center;
  justify-content: center;
  .searchBox_left{
    color: #868BA1;
    // border: 1px solid #BBBFC4;
    cursor: pointer;
    display:flex;
    align-items: center;
    min-width: 198px;
    width: 100%;
    height: 32px !important;
    background-color: #F3F3F3;
    overflow: hidden;
    input.el-input__inner{
      height: 32px !important;
      line-height: 32px !important;
      padding-right: 30px;
      font-size: 12px;
      border-radius: 6px;
    }
    input::-webkit-input-placeholder,
    input::-moz-input-placeholder,
    input::-ms-input-placeholder {
      color: #8F959E;
    }
    .el-icon-search {
      width: 14px;
    }
    span{
      font-size: 13px;
      color: #BFBFBF;
    }
    .search_icon {
      width: 14px;
      height: 14px;
    }
    .el-input__suffix{
      display: flex;
      align-items: center;
    }
  }
  .searchBox_right{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 10px;
    width: 32px;
    height: 32px;
    background-color: #F5F6F7;
    border-radius: 6px;
    .circle-plus {
      width: 16px;
      cursor: pointer;
    }
  }
  .el-input__prefix {
    display: inherit!important;
    z-index: 10;
    top: 9px;
    left: 10px;
  }
  .el-input{
    z-index: 10;
  }
  .el-icon-circle-plus-outline {
    color: #3471FF;
  }
}


#searchDialogBox{
  position: absolute;
  z-index: 20;
  top: 0px;
  left: 0px;
  cursor: auto;
  .searchMask{
    position: absolute;
    width: 100vw;
    height: 100vh;
    z-index: 9;
    top: 0px;
    left: 0px;
  }
  .searchBodys{
    position: fixed;
    left: 90px;
    top: 150px;
    width: 281px;
    min-height: 281px;
    max-height: 400px;
    overflow-y: auto;
    background: #FFFFFF;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
    opacity: 1;
    border-radius: 8px;
    padding:8px 0px;
    z-index: 10;
    .searchBodyC{
      // height: calc(100vh - 30px);
      height: calc(100% - 20px);
      margin-top: 12px;
      position: absolute;
      width: calc(100% - 0px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
    }
    .searchBodyB{
      height: calc(100% - 20px);
      margin-top: 12px;
      position: absolute;
      width: calc(100% - 0px);
      overflow-y: auto;
    }
    .searchItem{
      padding:0px 8px;
      height: 32px;
      display: flex;
      // align-items: center;
      flex-direction: column;
      justify-content: center;
      cursor: pointer;
      .searchItemTitle{
          display: flex;
          align-items: center;
          // justify-content: space-between;
          .searchItemTitlePoint{
              width: 8px;
              height: 8px;
              background: #DEE8FF;
              border-radius: 50%;
              opacity: 1;
          }
          .searchItemTitleName{
              margin-left: 9px;
              font-size: 14px;
              margin-right:12px;
              word-break:keep-all;
              white-space:nowrap;
              overflow:hidden;
              text-overflow:ellipsis;

              span {
                color: #000;
              }
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
    .searchCount{
      background: #ffffff;
      position: fixed;
      font-size: 11px;
      color: #BFBFBF;
      padding:0px 8px;
    }
    .searchEmptyBox{
      padding-bottom: 0px !important;
      margin-top: 22px;
    }
    .tips{
      margin-top: 22px;
      font-size: 11px;
      color: #BFBFBF;
    }
  }
}
</style>

<style>
  .sssss input.el-input__inner:hover {
    color: #404758;
  }
</style>
