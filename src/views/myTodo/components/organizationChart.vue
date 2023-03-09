<!--  -->
<template>
  <div
    class="OrganizationChart"
    ref="OrganizationChart"
  >
    <!--   :style="{'maxHeight':maxHeight+'px'}" -->
    <!-- <el-scrollbar> -->
    <div
      class="OrganizationChartBody"
      id="OrganizationChartBody"
    >
      <!--     :style="{'maxHeight':maxHeight+'px','minHeight':maxHeight+'px'}" -->
      <div
        class="OrganizationChartContent"
        ref="OrganizationChartContent"
        id="OrganizationChartContent"
        v-drag
        draggable="false"
      >
        <!-- :style="{'maxHeight':maxHeight+'px','minHeight':maxHeight+'px','minWidth':'1000px','top':'50px'}" -->
        <TreeChart
          ref="treeData"
          :json="treeData1"
          :oldTreeData="treeData1"
          :treeData1="treeData1"
          :types="types"
          :isFirstPoint="isFirstPoint"
          @changecontent="changeContent"
        ></TreeChart>
      </div>
    </div>
    <div
      class="popup_box"
      v-if="popupShow"
      @click="popupClose"
    >
      <div class="popup_content">
        <template v-for="(item,index) in getIdList">
          <div
            :key="index"
            class="text"
          >
            {{index+1}}、{{item.updateTime}}，{{item.content?item.content.split('|')[0]:''}}
            <a class="texts">{{item.content?item.content.split('|')[1]:''}}</a>{{item.content?item.content.split('|')[2]:''}}
            <!-- <div> {{index+1}}、{{item.updateTime}}，</div>
           <div>{{item.content?item.content.split('|')[0]:''}}</div>
            <div class="texts">{{item.content?item.content.split('|')[1]:''}}</div>
            <div>{{item.content?item.content.split('|')[2]:''}}</div> -->
          </div>
        </template>
      </div>
    </div>
    <!-- <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="30%"
        append-to-body
        :before-close="handleClose">
        <span>这是一段信息</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog> -->
    <!-- </el-scrollbar> -->
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
// import TreeChart from "vue-tree-chart";
// import vueScroll from 'vuescroll'
import * as api from '@/api/task.js'
import TreeChart from '@/components/TreeChart/tree'
export default {
  name: 'organizationChart',
  // import引入的组件需要注入到对象中才能使用
  components: { TreeChart },
  props: {
    taskId: {
      type: Number,
      default: null
    }
  },
  data() {
    // 这里存放数据
    return {
      dialogVisible: true,
      maxHeight: 0,
      treeData1: {},
      ops: {
        vuescroll: {},
        scrollPanel: {},
        rail: {
          keepShow: true
        },
        bar: {
          hoverStyle: true,
          onlyShowBarOnScroll: false, // 是否只有滚动的时候才显示滚动条
          background: "gray"
        }
      },
      loading: false,
      horizontal: false,
      collapsable: true,
      expandAll: false,
      labelClassName: "bg-white",
      backShow: false,
      types: '0',
      list: [],
      isFirstPoint: true,
      contentList: []
      // popupShow: false
    }
  },
  directives: {
    drag(el) {
      const oDiv = el // 当前元素
      let oDivWidth, treechartWidth, tableHeight, oDivHeight
      setTimeout(() => {
        // 这里是防止把div拖不见
        try {
          treechartWidth = document.getElementById("treechart").offsetWidth
          oDivWidth = document.getElementById("OrganizationChartBody").clientWidth
          oDivHeight = document.getElementById("OrganizationChartBody").offsetHeight
          tableHeight = document.getElementById("tablebody").offsetHeight
        } catch (error) {
          console.log(error)
        }
      }, 100)
      //   禁止选择网页上的文字
      document.onselectstart = function(e) {
        const isStop = sessionStorage.getItem('startStopMove')
        if (isStop === 'start') {
          return false
        } else {
          return e
        }
      }
      oDiv.onmousedown = function(e) {
        const isStop = sessionStorage.getItem('startStopMove')
        if (isStop === 'start') {
          document.onselectstart = function(ev) {
            return ev
          }
        }
        if (isStop === 'stop') {
          document.onselectstart = function(ev) {
            return false
          }
          return
        }
        // 鼠标按下，计算当前元素距离可视区的距离
        const disX = e.clientX - oDiv.offsetLeft
        const disY = e.clientY - oDiv.offsetTop
        document.onmousemove = function(e) {
          // 通过事件委托，计算移动的距离
          const l = e.clientX - disX
          const t = e.clientY - disY
          console.log(t)
          // 移动当前元素
          if (l < 50 && Math.abs(l) < (treechartWidth - oDivWidth + 50)) {
            oDiv.style.left = l + "px"
          }
          if (t < 30 && Math.abs(t) < (tableHeight - oDivHeight) / 2.5) {
            oDiv.style.top = t + "px"
          } else if (Math.abs(t) < (tableHeight - oDivHeight) / 2.5) {
            oDiv.style.top = t + "px"
          }
        }
        document.onmouseup = function(e) {
          document.onmousemove = null
          document.onmouseup = null
        }
        return false // 不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
      }
    }
  },
  // 监听属性 类似于data概念
  computed: {
    popupShow: {
      get() {
        return this.$store.state.user.popupShow
      },
      set() {

      }
    },
    getIdList: {
      get() {
        return this.$store.state.user.list
      },
      set() {

      }
    }
  },
  created() {
    sessionStorage.removeItem("oldTreeData")
    sessionStorage.setItem("startStopMove", "start")

    this.refreshList()
  },
  mounted() {
    this.$store.commit('SET_POPUP_SHOW', false)
    // this.refreshList()
    setTimeout(() => {
      this.maxHeight = this.$refs.OrganizationChart.parentElement.style.minHeight
      this.maxHeight = parseInt(this.maxHeight.replace("px", "")) - 40
    }, 1)
    // document.getElementById("OrganizationChartBody").style.left="-50%"
  },
  // activated() {
  //   this.refreshList()
  // },
  // 方法集合
  methods: {
    popupClose() {
      this.$store.commit('SET_POPUP_SHOW', false)
    },
    // 结点点击
    changeContent(data) {
      api.taskPerspectiveDetail({
        taskId: data.taskId,
        initiatorId: data.pid,
        performId: data.userId
      }).then(res => {
        this.contentList = res.data.data
        this.popupShow = true
      })
    },
    refreshList() {
      this.loading = true
      api.getPerspective({ taskId: this.taskId }).then(res => {
        this.list = res.data.data
        this.list[0].username = this.list[0].initiator
        if (this.list[0].children.length == 0) {
          this.isFirstPoint = false
        } else {
          this.isFirstPoint = true
        }
        // 测试
        // let newLists = this.list[0]
        // newLists.children.push(...this.list[0].children, ...this.list[0].children)
        // let newList = Object.assign({}, newLists)
        // this.treeData1 = newList
        this.list[0].enlarge = true
        this.treeData1 = this.list[0]
        let treechartWidth, oDivWidth
        setTimeout(() => {
          // 这里是防止把div拖不见
          try {
            treechartWidth = document.getElementById("treechart").offsetWidth
            oDivWidth = document.getElementById("OrganizationChartBody").clientWidth
            if (treechartWidth < oDivWidth) {

            } else {
              document.getElementById('OrganizationChartContent').style.left = treechartWidth / 2 * -1 + 200 + 'px'
              document.getElementById('OrganizationChartContent').style.top = '0px'
            }
          } catch (error) {
            console.log(error)
          }
        }, 100)
      })
      // // 这里是请求接口的
      // this.list = this.mergeList([{
      //   username: '小王',
      //   taskId: '1',
      //   list: [{
      //     username: '张三'
      //   }, {
      //     username: '李四'
      //   }],
      //   children: []
      // }])
      // this.treeData1 = this.list[0]
    },
    // 递归遍历合并执行人和子任务
    mergeList(data) {
      const item = data
      console.log(item)
      for (var i = 0; i < item.length; i++) {
        if (item[i].children.length > 0) {
          item[i].children = this.mergeList(item[i].children)
        } else {
          for (var j = 0; j < item[i].list.length; j++) {
            item[i].list[j].taskId = item[i].taskId
            item[i].list[j].pId = item[i].userId
          }
          item[i].children.push(...item[i].list)
        }
      }
      return item
    },
    clickNode(item) {
      console.log(item)
    },
    renderContent(h, data) {
      return data.label
    },
    onExpand(data) {
      if ("expand" in data) {
        data.expand = !data.expand
        if (!data.expand && data.children) {
          this.collapse(data.children)
        }
      } else {
        this.$set(data, "expand", true)
      }
    },
    onNodeClick(e, data) {
      alert(data.label)
    },
    collapse(list) {
      var _this = this
      list.forEach(function(child) {
        if (child.expand) {
          child.expand = false
        }
        child.children && _this.collapse(child.children)
      })
    },
    expandChange() {
      this.toggleExpand(this.data, this.expandAll)
    },
    toggleExpand(data, val) {
      var _this = this
      if (Array.isArray(data)) {
        data.forEach(function(item) {
          _this.$set(item, "expand", val)
          if (item.children) {
            _this.toggleExpand(item.children, val)
          }
        })
      } else {
        this.$set(data, "expand", val)
        if (data.children) {
          _this.toggleExpand(data.children, val)
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
// @import url(); 引入公共css类
.OrganizationChart {
  position: absolute;
  width: 100%;
  height: 100%;
  .OrganizationChartBody {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    left: -15px;
    // text-align: center;
    // justify-content: center;
    .OrganizationChartContent {
      position: absolute;
      // width: 100%;
      width: auto;
      display: flex;
      // align-items: center;
      justify-content: center;
      // text-align: center;
    }
  }
  .popup_box {
    width: 100%;
    height: 100%;
    position: absolute;
    left: -15px;
    background: rgba(0, 0, 0, 0.1);
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    .popup_content {
      width: 484px;
      min-height: 250px;
      padding: 10px 5px;
      background: rgba(223, 241, 255, 0.9);
      box-shadow: 0px 4px 22px 0rpx rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      .text {
        padding: 5px 0px;
        font-size: 16px;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: #222222;
        display: -webkit-inline-box;
        .texts {
          font-size: 16px;
          color: #008cff;
        }
      }
    }
  }
}
</style>
