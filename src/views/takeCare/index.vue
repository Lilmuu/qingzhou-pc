<!-- 待我处理 -->
<template>
  <!-- <BasicContainer :useBorder="false"> -->
  <div id="takeCareBox">
    <div class="top-label flexd-top-label">
      <TabLabelSlot
        :init-active-name="topTabActiveName"
        :isActiveClass="true"
        :option="topLabelOption"
        @tabChange="handleTopTabChange"
      >
        <template slot="right">
          <div id="highSearch" @click="changeHighSearch">
            <img src="@/assets/img/mytodo/new_task/newTask_reset.png" alt="">
          </div>
        </template>
      </TabLabelSlot>
    </div>
    <div class="takeCareContent">
      <div v-if="highSearchShow" id="HighSeachBox">
        <div class="HighSeachLeft">
          <el-form
            :model="formInline"
            class="demo-form-inline"
            ref="searchForm"
            size="small"
            label-width="90px"
          >
            <el-form-item label="任务/项目名称" prop="content">
              <el-input v-model="formInline.content" placeholder="请输入任务/项目名称"></el-input>
            </el-form-item>
            <el-form-item label="发起人" prop="initiator">
              <el-input v-model="formInline.initiator" placeholder="输入发起人"></el-input>
            </el-form-item>
            <el-form-item label="截止日期" prop="date">
              <el-date-picker
                v-model="formInline.date"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                value-format="yyyy-MM-dd"
                :clearable="false"
                end-placeholder="结束日期"
              >
              </el-date-picker>
              <img class="newTask_date" src="@/assets/img/mytodo/new_task/newTask_date_001.png" alt="">
            </el-form-item>
            <el-form-item label="优先级" prop="emergencyLevel">
              <el-select v-model="formInline.emergencyLevel" placeholder="全部">
                <el-option
                  v-for="item in emergencyLevel"
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
                ></el-option>
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
          </div>

        </div>
      </div>
      <div id="takeCareTable">
        <!-- 置顶 -->
        <div v-if="!fetchLoaded" :class=" highSearchShow ? 'table_content_scroll table_content_scroll_search' : 'table_content_scroll'">
          <div v-for="(item, index) in tableData" :key="index" v-if="item.list.length > 0" class="task_classify">
            <div class="table_item_Title" @click="item.open = !item.open">
              <img src="@/assets/img/icon/tableItemDown.png" :class="item.open ? 'tableItemDownOpen' : 'tableItemDown'"/>
              <span>{{ item.name }}（{{ item.list.length }}项）</span>
            </div>
            <div class="table_item_content" v-if="item.open">
              <div
                v-for="(items, indexs) in item.list"
                :key="item.name + '-' + indexs"
                :class=" getCurrentClass(items) ? 'table_item_contents' : 'table_item_contents table_item_contents_noR'"
                @click="clickItem(items)"
              >
              <taskItemContent :itemData="items" @refreshList='getList' :noRead='getCurrentClass(items)'></taskItemContent>
              </div>
            </div>
          </div>
        </div>
        <Empty v-else :fetchLoaded="fetchLoaded"></Empty>
      </div>
    </div>
    <drawer
      @refrsh="getList"
      ref="drawer"
      @handleTopTabChange="handleDraTopTabChange"
      :topTabActiveName="draTopTabActiveName"
      :topLabelOption="draTopLabelOption"
      @handleDrawerClose="handleDraClose"
    ></drawer>
  </div>

  <!-- </BasicContainer> -->
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import BasicContainer from "@/components/BasicContainer/BasicContainer";
import TabLabelSlot from "@/components/TabLabelSlot/index";
import taskItemContent from "./taskItemContent.vue";

import Empty from "@/components/Empty/index";
import drawer from "@/components/drawerDetail/drawer";
const topLabelOption = [{ label: "待我处理", name: "dwcl",icon:require('@/assets/img/mytodo/takeCare.png'), activeIcon: require('@/assets/img/mytodo/takeCare_sel.png') }];
const draTopLabelOption = [
  { label: "任务详情", name: "rwxq" },
  { label: "任务视图", name: "rwst" },
];
import { myPending, addCanCalTop } from "@/api/taskCare.js";
import urgent from "@/assets/img/task/urgent.png";
import imp from "@/assets/img/task/imp.png";
import { mapGetters } from "vuex";
import { emergencyLevelNew } from "@/const/dicData";
import WEBIM from "@/xmpp/webim-reset";
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {
    TabLabelSlot,
    Empty,
    drawer,
    taskItemContent
  },
  data() {
    // 这里存放数据
    return {
      urgent,
      imp,
      emergencyLevel: emergencyLevelNew,
      topTabActiveName: "dwcl",
      draTopTabActiveName: "rwxq",
      topLabelOption: topLabelOption,
      draTopLabelOption: draTopLabelOption,
      fetchLoaded: false,
      highSearchShow: false,
      formInline: {
        content: "",
        initiator: "",
        date: "",
        emergencyLevel: "",
      },
      tableData: [
        {
          name: "置顶任务",
          open: true,
          isTop: true,
          list: [],
        },
        {
          name: "本周",
          open: true,
          list: [],
        },
        {
          name: "上周",
          open: true,
          list: [],
        },
        {
          name: "两周前",
          open: true,
          list: [],
        },
        {
          name: "上个月",
          open: true,
          list: [],
        },
        {
          name: "更早",
          open: true,
          list: [],
        },
      ],
      orderBy: "",
      orderByDesc: "",
      orderSortType: {
        1: 1,
        2: 1,
        3: 1,
      },
      imgUrl1: require("@/assets/img/icon/sort1.png"),
      imgUrl2: require("@/assets/img/icon/sort1.png"),
      imgUrl3: require("@/assets/img/icon/sort1.png"),
      isClosingDateTop: false,
      isClosingDateBottom: false,
      isInitiatorTop: false,
      isInitiatorBottom: false,
      isTaskNameTop: false,
      isTaskNameBottom: false,
    };
  },
  // 监听属性 类似于data概念
  computed: {
    ...mapGetters(["ratio", "userId"]),
    getWsMsg() {
      return this.$store.state.socket.socketMsg;
    },
  },
  // 监控data中的数据变化
  watch: {
    getWsMsg: {
      handler(msg) {
        if (msg.type === "pushEvent") {
          const count = msg.data;
          if (count > 0) {
            this.getList();
          }
        }
      },
      deep: true,
    },
  },
  // 方法集合
  methods: {
    // 打开详情页
    clickItem(item) {
      this.draTopTabActiveName = "rwxq";
      console.log();
      this.$refs.drawer.init(item);
      // 未读提示重置
      this.getList();
    },
    //   改变数据是否置顶
    changeIsTop(item, type) {
      addCanCalTop({id: item.id,top: type,}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(type ? "置顶成功" : "取消置顶成功");
          this.getList();
        }
      });
    },
    changeSort(val, e) {
      this.$data["imgUrl" + e] = require("@/assets/img/icon/sort.png");
      if (this.orderBy != val) {
        this.orderBy = val;
      }
      if (this.orderSortType[val] == 1) {
        this.orderSortType[val] = 2;
      } else {
        this.orderSortType[val] = 1;
      }
      this.getList();
    },
    //  清空搜索条件
    clearSearch() {
      this.$refs["searchForm"].resetFields();
    },
    handleDraTopTabChange(item) {
      this.draTopTabActiveName = item.name;
    },
    handleDraClose() {
      console.log("关闭任务详情 -- item");
      this.draTopTabActiveName = "rwxq";
    },
    // 顶部tab切换
    handleTopTabChange() {},
    // 显隐高级查询
    changeHighSearch() {
      this.highSearchShow = !this.highSearchShow;
    },
    // 未读加粗
    getCurrentClass(item) {
      // 1-未读  0-已读
      let newArr = item.feedbackList.split(",");
      let isMe = newArr.filter((e) => e === this.userId);
      // 如果是发起者
      if (this.userId == item.initiatorId) {
        return item.initiatorRead == 1 ? false : true;
        // 如果是执行者
      } else if (this.userId == item.userId) {
        return item.executorRead == 1 ? false : true;
        // 如果是关注人 this.userId==item.userId &&
      } else if (isMe) {
        return false;
      } else {
        return true;
      }
    },
    is_me(val) {
      if (val.feedbackList) {
        let newVal = val.feedbackList.indexOf(this.userId);
        return newVal !== -1 ? true : false;
      } else {
        return false;
      }
    },

    getList() {
      let obj = {};
      if (this.formInline.date && this.formInline.date.length == 2) {
        obj.startTime = this.formInline.date[0];
        obj.endTime = this.formInline.date[1];
      }
      const query = {
        userId: this.$store.state.user.userId,
        state: 2,
      };
      let count = 0;
      myPending(
        Object.assign(query, obj, this.formInline, {
          date: null,
          nameSort: this.orderBy,
          typeSort: this.orderSortType[this.orderBy],
        })
      )
        .then((res) => {
          if (res.data.code === 200) {
            // debugger
            // 这里是设置角标和图标动态闪烁的
            const resData = res.data.data;
            const { unreadCount } = resData;
            console.log(" - 提示 001", res);

            let unreadList = [];
            for (let i in res.data.data.taskName) {
              unreadList.push({
                taskName: res.data.data.taskName[i],
                id: 2,
              });
            }
            // window.localStorage.setItem('unreadList',JSON.stringify(unreadList))

            if (unreadCount > 0) {
              this.$store.dispatch("SetUnreadCount", unreadCount);
              this.$store.dispatch("SetUnreadList", unreadList);
              this.$electron.ipcRenderer.send("show-notice");
            } else {
              this.$store.dispatch("SetUnreadCount", 0);
              this.$store.dispatch("SetUnreadList", []);
              this.$electron.ipcRenderer.send("hide-notice");
            }
            this.tableData[0].list = res.data.data.topList;
            this.tableData[1].list = res.data.data.weekList;
            this.tableData[2].list = res.data.data.lastWeekList;
            this.tableData[3].list = res.data.data.twoWeekList;
            this.tableData[4].list = res.data.data.lastMonthList;
            this.tableData[5].list = res.data.data.earlierList;
            for (let key in res.data.data) {
              if (key != "unreadCount") {
                count = count + res.data.data[key].length;
              }
            }
            if (count == 0) {
              this.fetchLoaded = true;
            } else {
              this.fetchLoaded = false;
            }
          }
        })
        .finally(() => {
          if (count == 0) {
            this.fetchLoaded = true;
          } else {
            this.fetchLoaded = false;
          }
        });
    },
    isSortFun(flag, num) {
      if (num == "3") {
        if (flag == "Top") {
          this.orderSortType[num] = 1;
          this.isClosingDateBottom = false;
          this.isClosingDateTop = !this.isClosingDateTop;
        } else {
          this.orderSortType[num] = 2;
          this.isClosingDateTop = false;
          this.isClosingDateBottom = !this.isClosingDateBottom;
        }
      } else if (num == "2") {
        if (flag == "Top") {
          this.orderSortType[num] = 1;
          this.isInitiatorBottom = false;
          this.isInitiatorTop = !this.isInitiatorTop;
        } else {
          this.orderSortType[num] = 2;
          this.isInitiatorTop = false;
          this.isInitiatorBottom = !this.isInitiatorBottom;
        }
      } else {
        if (flag == "Top") {
          this.orderSortType[num] = 1;
          this.isTaskNameBottom = false;
          this.isTaskNameTop = !this.isTaskNameTop;
        } else {
          this.orderSortType[num] = 2;
          this.isTaskNameTop = false;
          this.isTaskNameBottom = !this.isTaskNameBottom;
        }
      }
      if (this.orderBy != num) {
        this.orderBy = num;
      }
      this.getList();
    },
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    // this.$store.dispatch('Common/User/GetServeConfig')
    this.$store.dispatch("WSINIT");
    console.log("测试安装包更新");
    const isConnect = WEBIM.isConnect();
    console.log("isConnect - 001", isConnect);

    if (!isConnect) {
      this.$store.dispatch("InitIMConfig");
    }
    console.log("测试安装包更新");

    this.getList();
    // let unreadListVal = window.localStorage.getItem('unreadListVal',true)
    // if(unreadListVal){
    //   this.clickItem(JSON.parse(unreadListVal))
    // }
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
#takeCareBox {
  .table_content_scroll_search {
    height: calc(100vh - 215px) !important;
  }
  .ratio125 {
    .table_content_scroll_search {
      height: calc(100vh - 262px) !important;
    }
  }
  .flexd-top-label {
    top: 42px !important;
    width: calc(100vw - 260px - 80px);
    .tabRowSlot {
      height: 52px;
      display: flex;
      align-items: flex-end;
      padding-left: 27px;
      justify-content: space-between;
      width: calc(100vw - 260px - 80px);
      background-color: #FFF;
    }
  }
  #highSearch {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 4px;
    margin-bottom: 12px;
    &:hover{
      background: #EDEDEE;
    }
    cursor: pointer;
  }
}
.takeCareContent {
  margin-top: 52px;
  padding: 10px 10px 0 10px;
}
#HighSeachBox {
  display: flex;
  background: #FFF;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 10px;
  .HighSeachLeft {
    width: calc(100% - 86px);
    .demo-form-inline {
      display: flex;
      flex-wrap: wrap;
      margin-top: 10px;
      .el-form-item {
        .el-form-item__content{
          position: relative;
          margin-left: 100px!important;
          .newTask_date{
            position: absolute;
            right: 10px;
            width: 14px;
            margin-top: -8px;
            top: 50%;
          }
        }
        .el-input.el-input--small{
          .el-input__inner{
            width: 280px;
          }
        }
        .el-date-editor.el-input__inner{
          width: 280px;
          padding-right: 30px;
          .el-input__icon {
            display: none;
          }
          .el-range-input{
            width: 48%;
          }
        }
      }
      .el-form-item__label {
        padding: 0px;
      }
    }
  }
  .HighSeachRight {
    padding-top: 9px;
    width: 86px;
    // border-left: 1px solid #DEE0E3;
    .btn_list{
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      width: 80px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid #D0D3D6;
      .line{
        width: 1px;
        height: 14px;
        background-color: #D0D3D6;
      }
      .btn_item{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        cursor: pointer;
        img{
          width: 14px;
        }
        &:hover{
          background-color: #EDEDEE;
        }
      }
      
    }
  }
}
#takeCareTable {
  .takeCareTableTitle {
    display: flex;
    align-items: center;
    padding: 0px 9px;
    font-size: 16px;
    height: 48px;
    background: #eeeeee;
    opacity: 1;
    cursor: pointer;
    .takeName {
      margin-left: 0px !important;
    }
    img {
      width: 14px;
      height: 14px;
    }

    .caret-wrapper {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      height: 34px;
      width: 24px;
      vertical-align: middle;
      cursor: pointer;
      overflow: initial;
      position: relative;

      .el-icon-caret-top {
        position: absolute;
        top: 3px;
        color: #bfbfbf;
      }

      .el-icon-caret-bottom {
        position: absolute;
        top: 10px;
        color: #bfbfbf;
      }
    }
  }
  .table_item_content {
    .table_item_contents_noR {
      font-size: 14px;
    }
    .import-class {
      font-size: 12px;
      padding: 4px;
      border: 1px solid #b4b5b9;
    }
    .table_item_contents {
      position: relative;
      padding: 14px 20px;
      cursor: pointer;
      display: flex;
      font-size: 14px;
      align-items: center;
      border-radius: 6px;
    }
    .table_item_contents:hover {
      background-color: #F5F6F7;
    }
    :last-child .task_item::after{
      position: absolute;
      content: "";
      bottom: 0px;
      display: none;
    }
  }
  .emptyBasicContainer {
    height: calc(100vh - 110px);
  }
}
.table_content_scroll {
  overflow-y: auto;
  overflow-x: auto;
  height: calc(100vh - 120px);
  .task_classify {
    padding: 14px 20px;
    border-radius: 10px;
    background-color: #FFF;
    margin-bottom: 10px;
    .table_item_Title {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      height: 24px;
      color: #1F2329;
      font-family: SourceHanSansCN-Normal;
      span{
        margin-left:10px;
      }
    }
  }
}

.table_title_item {
  color: #333333;
  img {
    cursor: pointer;
  }
  .content_val {
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
.takeName {
  width: 23.96%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  img {
    width: 12px;
    height: 12px;
  }
  img + img {
    margin: 0px 0 0 11px;
  }
}
.takeContent {
  width: 36.44%;
  height: 48px;
  line-height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.takeStartP {
  width: 19.8%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.takeEndD {
  width: 15.64%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.collection {
  display: flex;
  align-items: center;
  justify-content: space-between;
  img {
    cursor: pointer;
    width: 11px;
    height: 11px;
  }
}
.tableItemDown {
  width: 14px;
  height: 8px;
  cursor: pointer;
  transform: rotate(270deg);
}
.tableItemDownOpen {
  cursor: pointer;
  width: 14px;
  height: 8px;
}

.addclass {
  color: #2c2c2c !important;
}

</style>
