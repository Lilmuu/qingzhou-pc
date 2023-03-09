<!-- 关闭任务 -->
<template>
  <div class="" id="closeTask" v-if="closeVisible">
    <div class="closeMask" @click="handleClose"></div>
    <div class="closeBody">
      <div class="closeTitle">
        <!-- <img src="@/assets/img/task/warning.png" v-if="type == 'close'" />
        <img src="@/assets/img/task/noPass.png" v-if="type == 'nopass'" />
        <img src="@/assets/img/task/pass.png" v-if="type == 'pass'" /> -->
        <span v-if="data.isCycle == 0 && type == 'close'">您确定关闭任务吗？</span>
        <span v-else-if="data.isCycle == 1 && type == 'close'">本任务是循环任务，请选择关闭类型</span>
        <span v-else-if="type == 'pass'">您确定通过任务验收吗？</span>
        <span v-else-if="type == 'nopass'">您确定驳回任务吗？</span>
      </div>
      <div style="margin-top: 14px;" v-if="(data.cycleTaskId || data.isCycle == 1) && type == 'close'">
        <el-radio-group v-model="radio" size="small">
          <el-radio :label="0">关闭本次任务</el-radio>
          <el-radio :label="1">关闭循环任务</el-radio>
        </el-radio-group>
      </div>
      <el-input
        placeholder="请输入备注说明"
        v-model="notes"
        type="textarea"
        maxlength="500"
        :autosize="{ minRows: 3, maxRows: 6 }"
        class="inputText"
      ></el-input>
      <div class="button_box">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="danger" size="small" @click="submit">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import { closeStateNew,manageTask } from '@/api/task'
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    // 这里存放数据
    return {
      closeVisible: false,
      notes: "",
      radio: 0,
      type: "",
    };
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    submit() {
      // if(!this.notes){
      //   this.$message.warning("备注不能为空");
      //   return
      // }
      if(/^(?!(\s+$))/.test(this.notes) == false) {
        this.$message.warning("不能发送空白内容")
        return ;
      }
      if(this.type=='close'){
          closeStateNew({
              taskId:this.data.id,
              remarks:this.notes,
              type:( this.data.cycleTaskId || this.data.isCycle==1)?this.radio:this.data.isCycle,
              cycleTaskId: this.data.cycleTaskId,
          }).then(res=>{
            if(res.data.code==200){
              this.$message.success("关闭任务成功")
              this.handleClose()
              this.$emit("refrsh")
            }
          })
      }else if(this.type=='pass'){
          manageTask({
              taskId:this.data.id,
              content:this.notes,
              state: 3
          }).then(res=>{
              if(res.data.code==200){
                  this.$message.success("任务已通过")
                  this.handleClose()
                  this.$emit("refrsh")
              }
          })
      }else if(this.type=="nopass"){
            manageTask({
              taskId:this.data.id,
              content:this.notes,
              state: 1
            }).then(res=>{
              if(res.data.code==200){
                  this.$message.success("任务已驳回")
                  this.handleClose()
                  this.$emit("refrsh")
              }
          })
        }
    },
    init(type) {
      this.notes = "";
      this.radio = 0;
      this.type = type;
      this.closeVisible = true;
    },
    handleClose() {
      this.closeVisible = false;
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
#closeTask {
  .closeMask {
    position: fixed;
    top: 0px;
    left: 0;
    height: 100vh;
    width: 100vw;
  }
  .closeBody {
    position: fixed;
    width: 420px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-height: 201px;
    background: #ffffff;
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.12);
    opacity: 1;
    border-radius: 8px;
    padding: 24px 20px 20px 20px;
  }
  textarea {
    // height: 32px !important;
    min-height: 32px !important;
    background: #f3f3f3;
    opacity: 1;
    border-radius: 4px;
    border: none;
    resize: none;
    margin-right: 19px;
  }
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
  }
  .button_box {
    text-align: right;
    margin-top: 20px;
    button {
      min-width: 84px;
      border-radius: 4px;
      font-size: 14px;
      padding: 0;
      line-height: 32px;
      color: #404758;
    }
    .el-button--danger{
      color: #FFFFFF;
      background: #F54A45;
    }
  }
  .el-radio__inner {
    width: 14px;
    height: 14px;
  }
  .inputText{
    margin-top: 16px;
    .el-textarea__inner{
      height: 96px!important;
    }
  }
}
</style>