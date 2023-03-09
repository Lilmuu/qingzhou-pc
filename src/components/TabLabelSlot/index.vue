<!--  -->
<template>
  <div class="tabRowSlot">
    <div class="tabLeft">
        <!-- <div v-if="!isIocn" class="bookmark_strip"></div> -->
        <div v-for="(item, index) in option" @click="handleClick(item)" :key="item.name" :class="activeName === item.name && isActiveClass ? 'title tabLeft_select' : 'title'">
            <img v-if="isIocn" class="label-item-icon" :src="activeName === item.name && isActiveClass ? item.activeIcon : item.icon" alt="">
            <span 
              :class="activeName === item.name && isActiveClass ? 'label-item label-active' : 'label-item'"
            >{{ item.label }}</span>
        </div>
    </div>
    <div class="tabRight" @click="handleRight">
        <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props:{
    initActiveName: {
      type: String,
      default: ''
    },
    option: {
      type: Array,
      required: true
    },
    isActiveClass:{
        type: Boolean,
        default: false
    },
    paddingLeft:{
        type:String,
        defatult:'20'
    },
    // 顶部导航图标地址
    headImg:{
      type: String,
      default: ()=>{
        return ''
      }
    },
    isIocn:{
      type: Boolean,
      default: ()=>{
        return true
      }
    }
  },
  data() {
    // 这里存放数据
    return {};
  },
  // 监听属性 类似于data概念
  computed: {
    activeName() {
      return this.initActiveName || this.option[0].name
    },
    headImgVal(){
      if(this.headImg == 'mytodo_target' ){
        return require('@/assets/img/mytodo/target.png')
      }else{
        return ''
      }
      
    }
  },
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    handleRight(){
      this.$emit("right")
      // window.localStorage.removeItem('unreadListVal')
    },
    handleClick(item) {
      this.$emit('tabChange', item)
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
.tabRowSlot {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: flex-end;
  padding-left: 27px;
  justify-content: space-between;
  width: calc(100vw - 260px - 80px);
  background-color: #FFF;
  img{
    width: 16px;
  }
}
.tabLeft{
  display: flex;
  align-items: center;
  height: 42px;
  border-radius: 6px 6px 0 0;
  .title{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 144px;
    line-height: 42px;
    cursor: pointer;
    border-radius: 6px 6px 0 0;
  }
  .tip {
    width: 3px;
    height: 18px;
    background: #3471FF;
  }
  .label-item-icon{
    margin-right: 10px;
  }
  .label-item {
    font-size: 16px;
    // margin: 0 10px;
    color: #0F1633;
  }
  .label-active {
    color: #3370FF;
  }
  .bookmark_strip{
    margin-right: 10px;
    width: 4px;
    height: 14px;
    border-radius: 0 3px 3px 0;
    background-color: #3370FF;
  }
}
.tabLeft_select{
  background-color: #FBFBFC;
}
.tabRight{
    margin-right: 20px;
}

</style>