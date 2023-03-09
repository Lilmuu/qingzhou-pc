<!--
 * @Author: szj
 * @Date: 2022-03-29 14:55:32
 * @LastEditors: OBKoro1
 * @LastEditTime: 2022-03-31 15:46:39
 * @FilePath: \task-pc-ui\src\components\common\pageHeader.vue
-->
<template>
  <div id="page-header-box">
    <div class="page-header-left">
      {{text}}
      <div class="page-header-left-clos"><i class="el-icon-close" @click="flowChartClick"></i></div>
    </div>
    <div class="page-header-right">
        <slot name="rightBox"></slot>
    </div>
  </div>
</template>

<script>
  export default {
    components: {},
    props: {
        text:{
            type:String,
            default:''
        },
        marginBottom:{
            type:Number,
            default:16
        }
    },
    data() {
      return {
      };
    },
    watch: {},
    created() {},
    mounted() {},
    computed: {},
    methods: {
      flowChartClick(){
        this.$emit("flowChartClick", false)
      }
    }
  };
</script>
<style lang="scss" scoped>
#page-header-box{
    display: flex;
    /*border-bottom: 1px solid #DCDFE6;*/
    height: 36px;
    // align-items: center;
    // justify-content: space-between;
    flex: 1;
    .page-header-left{
        // display: flex;
        // align-items: center;
        flex: 1;
        font-size: 16px;
        color: #222222;
        letter-spacing: 1px;
        padding-left: 10px;
        .page-header-left-clos{
          float: right;
          i{
            color: #BFBFBF;
            font-size: 14px;
            cursor: pointer;
          }
        }
        &::before{
            display: none;
            content: "";
            width: 3px;
            height: 16px;
            background: #3471FF;
            position:absolute;
            left: 20px;
        }
    }
}
</style>
