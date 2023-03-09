<!-- 撤回 -->
<template>
  <div id="withdrawBox" v-if="withDrawVisible">
      <div class="withdrawMask" @click="handleClose"></div>
      <div class="withdrawBody">
        <div class="closeTitle">
            <!-- <img src="@/assets/img/task/warning.png" /> -->
            <span>您确定要撤回已完成申请吗？</span>
        </div>
        <!-- <div style="margin-top: 14px; padding-left: 30px;font-size: 13px;color: #BFBFBF;">
            点击确定，将撤回已完成申请
        </div> -->
        <div class="button_box">
            <el-button size="small" class="customBtnClass" @click="handleClose">取消</el-button>
            <el-button type="primary" size="small" @click="submit">确定</el-button>
        </div>
      </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import { reduction } from '@/api/task'
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props:{
      data:{
          type:Object
      }
  },
  data() {
    // 这里存放数据
    return {
        withDrawVisible:false
    };
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    submit(){
        reduction(this.data).then(res=>{
            if(res.data.code==200){
                this.$message.success("撤回成功")
            }else{
                this.$message.warning('发起人已查看，不能撤回了哟~')
            }
            this.$emit('refrsh')
            this.handleClose()
        })
    },
    init() {
        this.withDrawVisible = true;
    },
    handleClose() {
        this.withDrawVisible = false;
    },
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
#withdrawBox{
    .withdrawMask{
        position: fixed;
        top: 0px;
        left: 0;
        height: 100vh;
        width: 100vw;
    }
    .withdrawBody{
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 385px;
        min-height: 160px;
        background: #ffffff;
        box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.12);
        opacity: 1;
        border-radius: 3px;
        padding: 17px 8px 8px 26px;
        .closeTitle {
            display: flex;
            align-items: center;
            img {
                width: 18px;
                height: 18px;
                margin-right: 13px;
            }
            font-size: 16px;
            color: rgba(0, 0, 0, 0.85);
            font-family: Source Han Sans CN;
        }
        .button_box {
            position: absolute;
            bottom: 10px;
            right: 0px;
            margin-top: 15px;
            padding-right: 17px;
            button {
                min-width: 84px;
                border-radius: 4px;
            }
        }
    }
}
</style>