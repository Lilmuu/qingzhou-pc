<template>
  <div class="company-dynamic">
    <div class="myWorkSpace myWorkSpace2">
      <div>
        <div class="tabs">
          <div v-for="(item,index) in tabsInfo" :key="index" ref="myTabs" @click="tabsChange(index)"
               :class="{'showBadge':!item.value}">
            <el-badge :value="item.value" class="item">
              <p :class="{'activeItem':activeTabs == (index+1)}">{{ item.label }}</p>
            </el-badge>
          </div>
          <p class="activeBar" :style="`transform:translateX(${transX}px)`"></p>
        </div>
        <div class="content-box">
          <div class="table-data" v-if="tableData.length">
            <div class="data-list">
              <div class="data-item" v-for="(item,index) in tableData" :key="item.id"
                   @click="openDynamic(item.id,item)">
                <div class="item-tit">
                  <span class="dot" v-show="item.readFlag == 0"></span>
                  <span class="tit">{{ item.title }}</span>
                  <span class="status">正常</span>
                </div>
                <div class="cont" v-html="item.content"></div>
                <div class="item-info">
                  <div class="info person">
                    <div class="ico"></div>
                    <div class="word">发起人:{{ item.createBy }}</div>
                  </div>
                  <div class="info create-time">
                    <div class="ico"></div>
                    <div class="word">创建时间: {{ formatDate(item.createTime) }}</div>
                  </div>
                  <div class="info edit-time">
                    <div class="ico"></div>
                    <div class="word">修改时间: {{ formatDate(item.updateTime) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="no-data" v-else>
            <div style="width:100%;height:70vh" class="flex-center">
              <img style="width:122px;height:120px" src="@/assets/img/workSpace/emptyData.png" alt="">
              <span>暂无动态</span>
            </div>
          </div>
        </div>
      </div>
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

    <DetailModal ref="detailModal" :drawerInfo="drawerInfo" @openImg="openImg"/>
  </div>
</template>

<script>
import DetailModal from './detailModal.vue'
import {tabsList, tabsNoticeInfo, detailInfo} from '@/api/workSpace'

export default {
  components: {
    DetailModal
  },
  name: 'dynamic',
  data() {
    return {
      current: 1,
      pageSize: 10,
      total: 0,
      activeTabs: 1,
      transX: 26,
      showImg: false,
      imgUrl: '',
      closeImg: require("@/assets/img/icon/closeImg.png"),
      tabsInfo: [
        {
          label: '公司制度',
          value: 0
        },
        {
          label: '其他',
          value: 0
        },
      ],
      tableData: [],
      drawerInfo: {},
      timer: null
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
    longPolling() {
      clearTimeout(this.timer)
      this.timer = null
      this.timer = setTimeout(() => {
        this.getTableData()
        this.getNoticeInfo()
        this.longPolling()
      }, 4000);
    },
    async getTableData() {
      const params = {
        type: this.activeTabs,
        size: this.pageSize,
        current: this.current
      }
      const {data} = await tabsList(params)
      this.tableData = data.data.records
      this.total = data.data.total
    },
    async getNoticeInfo() {
      const {data} = await tabsNoticeInfo()
      this.tabsInfo[0].value = data.data.num1 ? data.data.num1 : ''
      this.tabsInfo[1].value = data.data.num2
    },
    tabsChange(index) {
      this.activeTabs = index + 1
      const absoluteLocations = this.$refs.myTabs.map(item => item.getBoundingClientRect())
      this.transX = index == 0 ? 26 : absoluteLocations[1].x - absoluteLocations[0].x + 10
      this.getTableData()
      this.getNoticeInfo()
    },
    openDynamic(id, rowData) {
      detailInfo({bizArticleId: id}).then(res => {
        this.drawerInfo = res.data.data
        this.$refs.detailModal.drawer = true
        this.getNoticeInfo()
        if (rowData) {
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
    closeImgFun() {
      this.showImg = false
    },
    openImg(url) {
      this.showImg = true
      this.imgUrl = url
    },
    tableRowClassName({row, rowIndex}) {
      if (!row.readFlag) {
        return 'unread';
      }
      return '';
    },
    formatDate(cellValue) {
      if (cellValue) {
        let val = `${cellValue.split(':')[0]}: ${cellValue.split(':')[1]}`
        return val
      } else {
        return ''
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@import './spaceStyle.scss';

</style>
