<template>
  <div class="drawerBox">
      <el-drawer
        :visible.sync="drawer"
        :destroy-on-close="true"
        :wrapperClosable="true"
        custom-class="taskDrawer"
        :before-close="closeDrawer"
        direction="rtl"
        @close="handleDraClose"
        :show-close="false">
        <template slot="title" class="dialog-header-row">
          <TabLabelSlot paddingLeft="0" :isIocn="false"
          :init-active-name="topTabActiveName" 
          :option="topLabelOption" @tabChange="handleTopTabChange" :isActiveClass="true">
            <template slot="right">
              <img src="@/assets/img/icon_close.png" class="close_icon" @click="closeDrawer">
            </template>
          </TabLabelSlot>
        </template>
        <drawerDetail :row="rowData" ref="drawerDetail" :drawer="drawer" :isShowTips="isShowTips" v-if="topTabActiveName=='rwxq' && drawer" @change="changeTags" @refrsh="refrsh"></drawerDetail>
        <MyToDoView v-if="topTabActiveName=== 'rwst' && drawer" :taskId="rowData.id" @close="closeDrawer" />
    </el-drawer>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import TabLabelSlot from '@/components/TabLabelSlot/index'
import drawerDetail from '@/components/drawerDetail/index'
import MyToDoView from "@/views/myTodo/components/myToDoView"

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {TabLabelSlot,drawerDetail,MyToDoView},
  props:{
      topTabActiveName:{
        type:String,
        default:''
      },
      topLabelOption:{
        type:Array,
        default:()=>{
            return []
        }
      }
  },
  data() {
    // 这里存放数据
    return {
        drawer:false,
        isShowTips:true,
        rowData:{}
    };
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    // 更新列表
      refrsh(){
        this.$emit('refrsh')
        this.drawer = false
      },
      handleTopTabChange(item){
        this.$emit("handleTopTabChange",item)
      },
      changeTags(val){
        // this.closeDrawer()
        this.isShowTips = val ? true : false
      },
      closeDrawer(){
        this.refrsh()
        this.drawer = false
        // window.localStorage.removeItem('unreadListVal')
      },
      handleDraClose(){
        this.$emit('handleDrawerClose')
      },
      init(row){
        this.rowData = row
        this.isShowTips = true
        this.drawer = true
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
    margin-top: 10px;
}

</style>
