<template>
    <div class="myWorkSpace">
        <div class="tabs" style="margin:15px 0 20px 0;">
            <div v-for="(item,index) in tabsInfo" :key="index" ref="myTabs" @click="tabsChange(index)"  :class="{'showBadge':!item.value}">
                <el-badge :value="item.value" class="item">
                    <p :class="{'activeItem':activeTabs == (index+1)}">{{item.label}}</p>
                </el-badge>
            </div>
            <p class="activeBar" :style="`transform:translateX(${transX}px)`"></p>
        </div>
        <el-table
        :data="tableData"
        @row-click="openDynamic"
        :row-class-name="tableRowClassName"
        style="width: 100%;overflow:auto">
            <template slot="empty">
                <div style="width:100%;height:70vh" class="flex-center">
                    <img style="width:250px;height:250px" src="@/assets/img/workSpace/emptyData.png" alt="">
                </div>
            </template>
            <el-table-column
                prop="createTime"
                label="创建11时间"
                show-overflow-tooltip
                :formatter="formatDate">
            </el-table-column>
            <el-table-column
                prop="title"
                label="标题"
                show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                prop="createBy"
                label="发布人"
                show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                prop="updateTime"
                label="修改时间"
                :formatter="formatDate">
            </el-table-column>
            <el-table-column
                label="状态"
                width="100">
                <template slot-scope="">
                    <span>正常</span>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            v-if="tableData.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            style="text-align:right;height:70px">
        </el-pagination>

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

        <DetailModal ref="detailModal" :drawerInfo="drawerInfo" @openImg="openImg"/>
    </div>
</template>

<script>
import DetailModal from './detailModal.vue'
import {tabsList,tabsNoticeInfo,detailInfo} from '@/api/workSpace'
export default {
    components:{
        DetailModal
    },
    name:'dynamic',
    data() {
        return {
            current:1,
            pageSize:10,
            total:0,
            activeTabs:1,
            transX:26,
            showImg:false,
            imgUrl:'',
            closeImg: require("@/assets/img/icon/closeImg.png"),
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
            tableData: [],
            drawerInfo:{},
            timer:null
        };
    },
    mounted() {
      this.getTableData()
      this.getNoticeInfo()
    },
    // activated(){
    //     this.getTableData()
    //     this.getNoticeInfo()
    // },
    methods: {
        longPolling(){
            clearTimeout(this.timer)
            this.timer = null
            this.timer = setTimeout(() => {
                this.getTableData()
                this.getNoticeInfo()
                this.longPolling()
            }, 4000);
        },
        async getTableData(){
            const params = {
                type:this.activeTabs,
                size:this.pageSize,
                current:this.current
            }
            const { data } = await tabsList(params)
            this.tableData = data.data.records
            this.total = data.data.total
        },
        async getNoticeInfo(){
            const { data } = await tabsNoticeInfo()
            this.tabsInfo[0].value = data.data.num1 ? data.data.num1 : ''
            this.tabsInfo[1].value = data.data.num2
        },
        tabsChange(index) {
            this.activeTabs = index+1
            const absoluteLocations = this.$refs.myTabs.map(item => item.getBoundingClientRect())
            this.transX = index == 0 ? 26  :  absoluteLocations[1].x - absoluteLocations[0].x + 10
            this.getTableData()
            this.getNoticeInfo()
        },
        openDynamic({id},val){
            detailInfo({bizArticleId:id}).then(res => {
                this.drawerInfo = res.data.data
                this.$refs.detailModal.drawer = true
                this.getNoticeInfo()
                console.log(val);
                if(val){
                    this.getTableData()
                }
            })
        },
        handleSizeChange(val) {
            this.pageSize = val
            this.getTableData()
        },
        handleCurrentChange(val) {
            this.current = val
            this.getTableData()
        },
        closeImgFun(){
            this.showImg = false
        },
        openImg(url){
            this.showImg = true
            this.imgUrl = url
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
    }
}
</script>

<style lang="scss" scoped>
@import './spaceStyle.scss';
</style>
