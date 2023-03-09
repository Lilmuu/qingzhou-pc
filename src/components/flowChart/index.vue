<!--
 * @Author: your name
 * @Date: 2021-12-10 11:47:54
 * @LastEditTime: 2022-03-31 16:02:18
 * @LastEditors: OBKoro1
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\flowChart\index.vue
-->
<template>
    <div class="flowChartClass">
        <el-dialog
          title="流程图"
          width="80%"
          :visible.sync="flowChartVisible"
          :show-close="false"
          :before-close="handleClose">
          <template slot="title">
              <pageHeader text="流程图" @flowChartClick='flowChartClick'></pageHeader>
          </template>
          <img :src="img" alt="">
        </el-dialog>
    </div>
</template>

<script>
import pageHeader from '@/components/common/pageHeader'
import { flowableRecorddownFlowableImg,flowableRecordselectImg } from '@/api/workSpace'
import { mapState } from 'vuex'

export default {
    props:{
      oaMenu:{
        type: String,
        default: ()=>{
          return ''
        }
      },
      // type 1议题 2签报 3用印 4合同 5发文
      type:{
        type: String,
        default: ()=>{
          return ''
        }
      },
    },
    components: {pageHeader},
    name: 'flowChart',
    data() {
      return {
        flowChartVisible: false,
        img:''
      };
    },
    computed:{
      ...mapState({
        requestParameters: state => state.workbench.requestParameters,
      }),
    },
     mounted() {
       if(this.requestParameters.taskId){
         flowableRecorddownFlowableImg({taskId:this.requestParameters.taskId}).then(res => {
           let blob = window.URL.createObjectURL(res.data)
           console.log(blob)
           this.img=blob
         }).catch(err=>{
           console.log(err,123123)
         })
       }else{
         flowableRecordselectImg({type:this.type}).then(res => {
           let blob = window.URL.createObjectURL(res.data)
           console.log(blob)
           this.img=blob
         }).catch(err=>{
           console.log(err,123123)
         })
       }
    },
    methods: {
      flowChartClick(params){
        this.flowChartVisible=params
      },
      handleClose(done) {
        done();
      }
    },
};
</script>

<style lang="scss" >
.flowChartClass{
  .el-dialog {
    border-radius: 10px;
  }
  .el-dialog__body {
    border-radius: 10px;
  }
  .el-dialog__header{
    padding: 20px 20px 0 20px;
    background-color: #fff;
    .el-dialog__title{
      font-size: 16px;
    }
  }
  .el-dialog{
    display: flex;
    flex-direction: column;
    margin:0 !important;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    img{
      width: 100%;
    }
  }
}
</style>
