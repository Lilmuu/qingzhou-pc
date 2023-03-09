<template>
    <div class="myWorkSpace">
        <div class="spaceTop">
            <img src="@/assets/img/workSpace/workHome.png" alt="">
            <div class="spaceTop_right">
                <div class="rightTabs">
                    <div class="tabs">
                        <div v-for="(item,index) in tabsInfo" :key="index" ref="myTabs" @click="tabsChange(index)" :class="{'showBadge':!item.value}">
                            <el-badge :value="item.value" class="item">
                                <p :class="{'activeItem':activeTabs == (index+1)}">{{item.label}}</p>
                            </el-badge>
                        </div>
                        <p class="activeBar" :style="`transform:translateX(${transX}px)`"></p>
                    </div>
                    <span @click="showMore" class="more"></span>
                </div>
                <div class="rightContent cursor">
                    <div v-for="(item,index) in newsList" :key="index" @click="openDynamic(item.id)" class="right-item">
                        <span class="rightContent-tit"><span  :class="{'activeNews':!item.readFlag}"></span>{{item.title}}</span>
                        <span >{{item.createTime ? item.createTime.split(' ')[0] : ''}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="spaceCenter">
            <div class="centerTitle badge-cont">
                <span>经常使用</span>

<!--                <el-badge v-if="unReadNumber > 0" :value="unReadNumber" :max="99" class="item">-->
<!--                  <span @click="goProcess" style="cursor:pointer;margin-right:18px;">我的流程</span>-->
<!--                </el-badge>-->
                <!--<span v-else @click="goProcess" style="cursor:pointer">我的流程</span>-->
            </div>
            <div class="centerMain">
                <div class="frequently" v-for="(item,index) in blockList" :key="index" @click="goOtherPage(item)">
                    <img :src="item.img" alt="">
                    <span>{{item.appName}}</span>
                </div>
                <div class="frequently" @click="handleAdd">
                    <img src="@/assets/img/workSpace/add.png" alt="">
                    <span style="color:#1F2329">添加常用</span>
                </div>
            </div>
        </div>
        <div class="spaceBottom" >
            <div class="bottomTilte">
                <span v-for="(item,index) in appList" :key="index" :class="{'activeAppName':activeApp == index}" @click="appNameChange(index,'activeApp')">
                    {{item.label}}
                </span>
            </div>
            <div class="centerMain">
                <div class="frequently" v-for="(item,index) in areaList" :key="index" @click="goOtherPage(item)">
                    <img :src="item.img" alt="">
                    <span>{{item.appName}}</span>
                </div>
            </div>
        </div>

        <div class="img-masker" :style="showImg? 'display:block': ''">
            <div class="img-wrapper">
                <div class="preview-div">
                    <img :src="imgUrl">
                </div>
                <div class="close-img">
                    <img :src="closeImg" @click="closeImgFun">
                </div>
            </div>
        </div>

        <AddAppModal v-if="openModal" ref="addAppModal" :openModal="openModal" :blockList="blockList" :appList="appList" @refreshMyApp="refreshMyApp" @closeModal="closeModal"/>
        <DetailModal ref="detailModal" :drawerInfo="drawerInfo" @openImg="openImg"/>
    </div>
</template>

<script>
import AddAppModal from './addAppModal.vue'
import DetailModal from './detailModal.vue'
import {tabsList,tabsNoticeInfo,detailInfo,getAllAppList,selectRecentUsedApp,updateRecentUsedApp,selectMyApp} from '@/api/workSpace'
import { otherApp } from "./goApplication"
import { mapState } from 'vuex'
export default {
    components:{
        AddAppModal,
        DetailModal
    },
    name:'workspace',
    data() {
        return {
            openModal:false,
            current:1,
            pageSize:5,
            total:0,
            activeTabs:1,
            activeApp:0,
            activeModalApp:0,
            transX:26,
            showImg:false,
            imgUrl:'',
            closeImg: require("@/assets/img/icon/closeImg.png"),
            newsList:[],
            tabsInfo:[
                {
                    label:'公司制度',
                    value:0
                },
                {
                    label:'其他',
                    value:0
                },
            ],
            blockList:[],
            appList:[
                {
                    label:'最近使用'
                },
                {
                    label:'全部应用'
                },
                {
                    label:'综合OA'
                },
            ],
            areaList:[],
            drawerInfo:{},
            timer:null
        };
    },
    computed:{
      ...mapState({
        unReadNumber: state => state.workbench.unReadNumber,
      })
    },
    mounted() {
        this.getTabsData()
        this.getNoticeInfo()
        this.getMyAppData()
        this.getRecentlyData()
    },
    activated(){
        this.getTabsData()
        this.getNoticeInfo()
    },
    methods: {
        longPolling(){
            clearTimeout(this.timer)
            this.timer = null
            this.timer = setTimeout(() => {
                this.getTabsData()
                this.getNoticeInfo()
                this.longPolling()
            }, 4000);
        },
        async getTabsData(){
            const params = {
                type:this.activeTabs,
                size:this.pageSize,
                current:this.current
            }
            const { data } = await tabsList(params)
            this.newsList = data.data?.records?.length > 5 ? data.data.records.slice(0,5) : data.data.records
        },
        async getNoticeInfo(){
            const { data } = await tabsNoticeInfo()
            this.tabsInfo[0].value = data.data.num1 ? data.data.num1 : ''
            this.tabsInfo[1].value = data.data.num2
        },
        async getRecentlyData(){
            const { data } = await selectRecentUsedApp()
            this.areaList = data.data
            this.areaList.forEach(item => {
                item.img = require(`@/assets/img/workSpace/workbench_id${item.appId}.png`)
            })
        },
        async getMyAppData(){
            const { data } = await selectMyApp()
            this.blockList = data.data
            this.blockList.forEach(item => {
                item.img = require(`@/assets/img/workSpace/workbench_id${item.appId}.png`)
            })
        },
        tabsChange(index) {
            this.activeTabs = index+1
            const absoluteLocations = this.$refs.myTabs.map(item => item.getBoundingClientRect())
            this.transX = index == 0 ? 26  :  absoluteLocations[1].x - absoluteLocations[0].x + 10
            this.getTabsData()
            this.getNoticeInfo()
        },
        appNameChange(index,val){
            this[val] = index
            if(index == 0){
                this.getRecentlyData()
            }else{
                const params = {
                    appType:index == 1 ? '' : 1
                }
                getAllAppList(params).then(res => {
                    this.areaList = res.data.data
                    this.areaList.forEach(item => {
                        item.img = require(`@/assets/img/workSpace/workbench_id${item.appId}.png`)
                    })
                })
            }
        },
        handleAdd(){
            this.openModal = true
        },
        openDynamic(id){
            detailInfo({bizArticleId:id}).then(res => {
                this.drawerInfo = res.data.data
                this.$refs.detailModal.drawer = true
                this.getNoticeInfo()
                this.getTabsData()
            })
        },
        showMore(){
            this.$store.commit('pushTopNav',{name: '公司动态', path: 'dynamic',query:''})
        },
        closeImgFun(){
            this.showImg = false
        },
        openImg(url){
            this.showImg = true
            this.imgUrl = url
        },
        goOtherPage(item){
            updateRecentUsedApp({appId:item.appId}).then(() => {
                otherApp(item)
            })
        },
        async refreshMyApp(index){
            await this.getMyAppData()
            await this.$refs.addAppModal.appNameChange(index)
            await this.$refs.addAppModal.getSearchData()
        },
        goProcess(){
          // this.$emit('changeContBox', {name: '我的流程', path: 'flowPath'});
          this.$store.commit("pushTopNav", { path: "flowPath", name: '我的流程' });
          this.$store.commit("SET_REQUESTPARAMETERS", {});
        },
        tableRowClassName({row, rowIndex}) {
            if (!row.readFlag) {
                return 'unread';
            }
            return '';
        },
        formatDate(row, column, cellValue, index){
            if(cellValue){
                let val = `${cellValue.split(':')[0]}: ${cellValue.split(':')[1]}`
                return val
            }else{
                return ''
            }
        },
        closeModal(){
            this.openModal = false
        }
    }
}
</script>

<style lang="scss" scoped>
@import './spaceStyle.scss';
</style>
