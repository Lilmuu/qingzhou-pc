<!--
 * @Author: your name
 * @Date: 2021-12-01 09:22:34
 * @LastEditTime: 2022-07-18 15:17:21
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\workbench\workbenchLayout.vue
-->
<template>
  <div class="main-view-container workbench-container">
    <div class="left-container">
      <p class="workBenchTitle">工作台</p>
      <div class="searchArea" v-clickoutside="searchClose">
        <el-input
          class="workbench_search"
          placeholder="搜索"
          prefix-icon="el-icon-search"
          @input="searchList"
          v-model="search"
          >
        </el-input>
        <div v-if="showSearch" class="showSearchList">
          <div v-if="searchInfo.appList && searchInfo.appList.length" class="searchInfo">
            <div class="title">
              应用
            </div>
            <div class="content app-content" v-for="(item,index) in searchInfo.appList" :key="index+item.appName" >
                <img class="img" :src="require(`@/assets/img/workSpace/workbench_id${item.appId}.png`)" alt="">
                <div v-html="changeColor(item.appName,search)" @click="handleConvert(item,'appList')" class="app-words"></div>
            </div>
          </div>
          <div v-if="searchInfo.bizArticleList && searchInfo.bizArticleList.length" class="searchInfo">
            <div class="title">发文</div>
            <div class="contentBizArticleList"  v-for="(item,index) in searchInfo.bizArticleList" :key="index"  @click="handleConvert(item,'bizArticleList')">
              <span v-html="changeColor(item.title,search)"></span>:
              <span v-html="changetextColor(item.content,search)"></span>
            </div>
          </div>
          <div v-if="searchInfo.taskList && searchInfo.taskList.length" class="searchInfo">
            <div class="title">流程</div>
            <div class="content"  v-for="(item,index) in searchInfo.taskList" :key="index+item.taskTitle">
              <p style="margin:0 0 12px 0;color:#333333;font-size:14px">
                {{item.type == 1 ? '议题' : item.type == 2 ? '签报' : item.type == 3 ? '用印' : item.type == 4 ? '合同' : '发文'}}
              </p>
              <div v-html="changeColor(item.taskTitle,search)" @click="handleConvert(item,'taskList')"></div>
            </div>
          </div>
          <div v-if="!Object.values(searchInfo).some(item => item.length)" class="noData">
            <img src="@/assets/img/default-ico/d-noSearch.png" alt="">
            <p>未找到"<span>{{search}}</span>"相关结果</p>
          </div>
        </div>
      </div>

      <div class="workbench_nav">
      </div>
      <el-scrollbar
        class="select-left-list mail-select-list-collapse noScroll"
        style="overflow: hidden; height: calc(100% - 100px)">

<!--        <li role="menuitem" tabindex="-1"-->
<!--            v-for="(item, index) in navList"-->
<!--            :key = item+index-->
<!--            :class="['el-menu-item', dealActiveNav(navigationName,item.path) ? 'select_nav menu_item_border_active' : 'menu_item_border' ]"-->
<!--            @click="selectNav(item)"-->
<!--        >-->

<!--          <div class="flex_start">-->
<!--            <span :class="['menu_item_icon_span', 'flex-center',dealActiveNav(navigationName,item.path) ? 'menu_item_icon_active': '']">-->
<!--              <img v-if="item.path == 'workspace' && navigationName == 'dynamic'" src="@/assets/img/workbench/icon_workspace_dynamic_sel.png" alt="">-->
<!--              <img v-else style="width: 16px;" :src="imgUrl(item.path)">-->
<!--            </span>-->
<!--            <el-badge v-if="item.path === 'flowPath' && unReadNumber > 0" :value="unReadNumber" :max="99" class="item">-->
<!--              <span>{{ item.name}}</span>-->
<!--            </el-badge>-->
<!--            <span v-else>{{ item.name}}</span>-->
<!--          </div>-->
<!--        </li>-->



        <el-menu
          :default-active="navList[0].path"
          @select="changeActive"
          :default-openeds="openMenu"
          text-color="#222"
          active-text-color="#3471ff"
          >
          <el-menu-item :index="navItem.path" v-for="navItem in navList" @click="selectNav(navItem)" :key="navItem.path">
            <img style="width: 16px;margin-right: 9px;" :src="imgUrl(navItem.path)">
            <span slot="title" :class="[dealActiveNav(navigationName,navItem.path) ? 'activeWords' : 'no-active']">
              <el-badge v-if="navItem.path === 'flowPath' && unReadNumber > 0" :value="unReadNumber" :max="99" class="item">
                <span>{{ navItem.name}}</span>
              </el-badge>
              <span v-else>{{ navItem.name}}</span>
            </span>

          </el-menu-item>
          <el-submenu index="1">
            <template slot="title">
              <span class="menu_item_icon_span flex-center">
                <img style="width: 16px;" src="@/assets/img/workbench/icon_OA.png">
              </span>
              <p>综合OA</p>
            </template>
            <el-menu-item-group>
              <el-menu-item
                v-for="(item,index) in menuItem"
                :key="index+item.path"
                :index="item.path"
                :class="navigationName === item.path?'el-menu-vertical-demo': ''"
                @click="selectNav(item)">
                  <img style="width: 16px;margin-right: 9px!important;" :src="imgUrl(item.path)">
                  <span slot="title"  :class="[dealActiveNav(navigationName,item.path) ? 'activeWords' : 'no-active']">{{ item.name }}</span>
                </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="right-container">
      <!-- 顶部导航标签 -->
      <div class="top_nav_label">
          <div v-for="(item,index) in topNavData" :key="index+item.name" class="top-nav" :class="{'activeNav':navigationName == item.path}">
            <div @click="selectNav(item)">
              <img :src="imgNavUrl(item.path)">
              <span>{{ item.name}}</span>
            </div>
            <img @click.stop="delNav(item,index)" v-if="index != 0" src="@/assets/img/workbench/closeNav.png" alt="" class="ico-close">
          </div>
      </div>

      <div class="right-cont-box">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </div>

    <div class="img-masker" :style="showImg? 'display:block': ''">
        <div class="img-wrapper">
            <div class="preview-div">
                <img :src="previewImgUrl">
            </div>
            <div class="close-img">
                <img :src="closeImg" @click="closeImgFun">
            </div>
        </div>
    </div>

    <DetailModal ref="detailModal" :drawerInfo="drawerInfo" @openImg="openImg"/>
  </div>
</template>

<script>
import { getDeptTree } from "@/api/dept";  // 获取部门列表
import { workbenchSearch,detailInfo,workbenchUnread,workbenchRead } from '@/api/workSpace'
import { mapState,mapGetters } from "vuex"
import { otherApp } from "@/views/workSpace/goApplication"
import DetailModal from '@/views/workSpace/detailModal.vue'
import { clickoutside } from './clickOutside'
export default {
  components:{
    DetailModal
  },
  directives:{clickoutside},
  data(){
    return {
      search: '',
      navList:[
        {name: '工作台', path: 'workspace'},
        {name: '我的流程', path: 'flowPath'},
        // {name: '综合OA', path: 'OA', children: [
        //     {name:'议题', path:'topics'},
        //     {name:'签报', path:'sign'},
        //     {name:'用印', path:'useSeal'},
        //     {name:'合同', path:'contract'},
        //     {name:'发文', path:'dispatch'},
        // ]},
      ],
      menuItem:[
        {name:'议题', path:'topics'},
        {name:'签报', path:'sign'},
        {name:'用印', path:'useSeal'},
        {name:'合同', path:'contract'},
        {name:'发文', path:'dispatch'},
      ],
      searchInfo:'',
      showSearch:false,
      previewImgUrl:'',
      showImg:false,
      closeImg: require("@/assets/img/icon/closeImg.png"),
      drawerInfo:{},
      openMenu:[],
    }
  },
  computed:{
    ...mapGetters(['keepAlivePage']),
    ...mapState({
        navigationName: state => state.workbench.navigationName,
        topNavData: state => state.workbench.topNavData,
        requestParameters: state => state.workbench.requestParameters,
        depGroupList: state => state.app.depGroupList,
        unReadNumber: state => state.workbench.unReadNumber,
    }),

    imgUrl(){
      return (path)=>{
        let urlName = path === this.navigationName ? path+'_sel' : path
        return require(`@/assets/img/workbench/icon_${urlName}.png`)
      }
    },
    imgNavUrl(){
      return (path)=>{
        let urlName
        if(path === this.navigationName){
          urlName = path == 'workspace' || path == 'flowPath' ? path+'_nav' : path+'_sel'
        }else{
          urlName = path
        }
        return require(`@/assets/img/workbench/icon_${urlName}.png`)
      }
    },
    changeColor(){
      return (content,val)=>{
        const html = `<span style="color:#3471FF">${val}</span>`
        return content.replace(val,html)
      }
    },
    changetextColor(){
      return (content,val)=>{
        const exp = /<.+?>/g
        let text = content
        text = text.replace(exp,'').replace(/&nbsp;/g, '')
        const html = `<span style="color:#3471FF">${val}</span>`
        return text.replace(val,html)
      }
    },
    dealActiveNav(){
      return (name,path)=>{
        if((name == 'workspace' || name == 'dynamic') && (path == 'workspace' || path == 'dynamic')){
          return true
        }else{
          return name == path
        }
      }
    }
  },
  mounted(){
    if(this.depGroupList.length == 0){
      this.getDepGroup()
    }
    this.unReadNum()
  },
  methods:{
    getDepGroup(){
      getDeptTree().then(res=>{
        this.$store.commit('SET_DEPGROUPLIST', res.data.data[0].childList)
      })
    },
    selectNav(item){
      this.$store.state.workbench.requestParameters = {}
      this.$store.commit('pushTopNav',Object.assign({},{...item,query:''}))
    },
    searchList(val){
      if(val.trimStart()){
        this.showSearch = true
        workbenchSearch({wordKey:val}).then(res => {
          this.searchInfo = res.data.data
        })
      }else{
        this.showSearch = false
        this.searchInfo = ''
      }
    },
    changeActive(val){
      console.log('OA',val,'hh')
    },
    delNav(item,index){
      this.$store.state.workbench.requestParameters = {}
      this.$store.commit('delTopNav',{item,index})
    },
    searchClose(){
      this.showSearch = false
      this.searchInfo = ''
      this.search = ''
    },
    handleConvert(item,type){
      if(type == 'appList'){
        otherApp(item)
      }
      if(type == 'bizArticleList'){
        detailInfo({bizArticleId:item.id}).then(res => {
          this.drawerInfo = res.data.data
          this.$refs.detailModal.drawer = true
        })
      }
      if(type == 'taskList'){
        this.$store.commit('pushTopNav',{name: '我的流程', path: 'flowPath',query:item})
      }
      this.searchClose()
    },
    closeImgFun(){
      this.showImg = false
    },
    openImg(url){
      this.showImg = true
      this.imgUrl = url
    },

    unReadNum(){
      workbenchUnread().then(res=>{
        console.log('hahah',res)
        this.$store.commit('SET_UNREADNUMBER', res.data.data)
      })
    },
  },

}
</script>

<style lang="scss" scoped>
  ::v-deep .select-left-list .el-menu-item-group__title {
    display: none;
  }
  ::v-deep .select-left-list {
    .el-submenu {
      background-color: #fff;
    }
  }
  .main-view-container {
    display: flex;
    position: relative;
    padding: 0;

    .left-container {
      width: 260px;
      // background: #FBFBFC;
      background: #fff;
      height: 100vh;
      padding:0 10px;
      .workBenchTitle{
        font-size: 20px;
        font-family: Source Han Sans CN-Normal;
        margin:24px 0;
      }
      .workbench_search{
        margin-top: 20px;
         ::v-deep .el-input__inner{
          border-radius: 6px!important;
        }
      }
      .menu_item_icon_span{
        /*width: 28px;*/
        /*height: 28px;*/
        margin-right: 10px;
        border-radius: 50%;
      }
      .menu_item_icon_active{
        /*background: #3471FF;*/
      }
      .flex_start{
        display: flex;
        color: #222222;
        align-items: center;
        justify-content: flex-start;
      }
      .el-menu-vertical-demo{
        //border-left: 3px solid #409EFF;
      }
    }

    .right-container {
      width: 100%;
      background: #fff;
      .top-label {
        position: absolute;
        z-index: 5;
        background: #fff;
        width: 100%;
        height: 46px;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        border-top: 1px solid #e2e2e2;
        border-bottom: 1px solid #e2e2e2;
        padding: 15px;
        .label-text {
          font-size: 17px;
          margin-left: 15px;
        }
      }
    }

    .top-nav{
      display: flex;
      font-size: 14px;
      justify-content: space-evenly;
      align-items: center;
      div{
        display: flex;
        width: 90px;
        text-align: center;
      }
      .ico-close {
        width: 8px!important;
        height: 8px!important;
      }
    }
  }
  .activeWords {
    color: #3370FF;
  }
  .no-active {
    color: #404758!important;
  }
</style>
