<template>
    <el-dialog
    title="添加常用"
    :visible.sync="dialogVisible"
    width="520px"
    @close="handleClose"
    >
        <div class="modalContent">
            <el-input
                size="small"
                placeholder="搜索"
                prefix-icon="el-icon-search"
                v-model="searchInput"
                @input="searchChange">
            </el-input>
            <div class="modalItems">
                <template v-if="modalStatus">
                    <div class="bottomTilte" style="margin-top: 20px;">
                        <span v-for="(item,index) in appList" :key="index" :class="{'activeAppName':activeApp == index}" @click="appNameChange(index,'activeApp')">
                            {{item.label}}
                        </span>
                    </div>
                    <div class="mainSearch">
                        <div class="blockitemMain" v-for="(item,index) in modalAreaList" :key="index"  :class="{'buttonHandle':!item.buttonStatus}">
                            <div class="itemLeft">
                                <img :src="item.img" alt="">
                            </div>
                            <div class="itemRight">
                                <span>{{item.appName}}</span>
                                <el-button plain size="small" class="btn" @click="(e)=>addOrDel(e,item)">{{item.buttonStatus ? '移除' : '添加'}}</el-button>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <template v-if="modalArr.length">
                        <div class="blockitem" v-for="(item,index) in modalArr" :key="index" :class="{'buttonHandle':!item.buttonStatus}">
                            <div class="itemLeft">
                                <img :src="item.img" alt="">
                                <span>{{item.appName}}</span>
                            </div>
                            <el-button plain size="small" @click="(e)=>addOrDel(e,item)">{{item.buttonStatus ? '移除' : '添加'}}</el-button>
                        </div>
                    </template>
                    <div class="noData" v-else>
                        <img src="@/assets/img/workSpace/noData.png" alt="">
                        <p>未找到"<span>{{searchInput}}</span>"相关结果</p>
                    </div>
                </template>
            </div>
        </div>
    </el-dialog>
</template>

<script>
import {getAllAppList,selectRecentUsedApp} from '@/api/workSpace'
import {updateMyApp} from '@/api/workSpace'

export default {
    props:{
        appList:{
            type:Array,
            default: () => []
        },
        blockList:{
            type:Array,
            default: () => []
        },
        openModal:{
            type:Boolean,
            default:false
        }
    },
    data() {
        return {
            searchInput:'',
            modalStatus:true,
            modalAreaList:[],
            activeApp:0,
            modalArr:[],
            searchAreaData:[]
        };
    },
    computed: {
        dialogVisible:{
            get(){
                return this.openModal;
            },
            set(newVal){
                return newVal
            }
        },
    },
    mounted(){
        this.getRecentlyData()
        this.getSearchData()
    },
    methods:{
        async getRecentlyData(){
            const { data } = await selectRecentUsedApp()
            this.modalAreaList = this.dealArray(data.data)
        },
        appNameChange(index,val){
            if(val){
                this[val] = index
            }
            if(index == 0){
                this.getRecentlyData()
            }else{
                const params = {
                    appType:index == 1 ? '' : 1
                }
                getAllAppList(params).then(res => {
                    this.modalAreaList = this.dealArray(res.data.data)
                })
            }
        },
        async getSearchData(){
            const { data } = await getAllAppList()
            this.searchAreaData = this.dealArray(data.data)
            if(this.searchInput){
                this.searchChange(this.searchInput)
            }
        },
        dealArray(arr){
            if(arr.length){
                arr.forEach(item => {
                    item.img = require(`@/assets/img/workSpace/workbench_id${item.appId}.png`)
                    item.buttonStatus = false
                    this.blockList.forEach(val => {
                        if(item.appId == val.appId){
                            item.buttonStatus = true
                        }
                    })
                })
                return arr
            }else{
                return arr
            }
        },
        handleClose(){
            this.searchInput = ''
            this.modalStatus = true
            this.$emit('closeModal');
        },
        async addOrDel(e,item){
            let target = e.target
            if(target.nodeName == 'SPAN'){
                target = e.target.parentNode
            }
            target.blur()
            const param = {
                appId:item.appId,
                status:item.buttonStatus ? 0 : 1
            }
            await updateMyApp(param)
            this.$emit('refreshMyApp',this.activeApp);
        },
        searchChange(val){
            if(val){
                this.modalStatus = false
                this.modalArr = []
                this.searchAreaData.map(item => {
                    if(item.appName.includes(val) && val){
                        this.modalArr.push(item)
                    }
                })
            }else{
                this.modalArr = []
                this.modalStatus = true
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.modalContent {
  .mainSearch {
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background-color: #fff;
    }

  }
}
</style>
