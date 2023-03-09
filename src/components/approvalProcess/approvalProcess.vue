<template>
    <div class="approvalProcess">
        <div class="title" v-if="approvalProcessData.length!=0">审批过程</div>
        <div class="bady">
            <div class="cont" v-for="(item,index) in approvalProcessData" :key="index">
                <div class="cont-left">
                    <div class="cont-line" :style="index==0?'background: transparent;':''"></div>
                    <div class="cont-round"><div class="cont-inCircle"></div></div>
                    <div class="cont-line" :style="index==approvalProcessData.length-1?'background: transparent;':''"></div>
                </div>
                <div class="cont-right">
                    <div v-if="selName(item.nodeName)" class="cont-right-left">{{item.assigneeName.substring(item.assigneeName.length-2)}}</div>
                    <div v-else class="cont-right-left">会签</div>

                    <div class="cont-right-right">
                        <div class="cont-right-right-top">
                            <div class="name">
                              {{item.assigneeName}}
                              <span v-show="item.deptName && selName(item.nodeName)"> - {{item.deptName}}</span>
                            </div>
                            <div class="time">{{item.time.split(" ")[0]}} &nbsp {{item.time.split(" ")[1]}}</div>
                        </div>
                      <div class="status-row">
                        <div class="status" :class="stateClass(item,index)">{{index==0?'提交申请':item.resultName}}</div>
                        <span v-if=" index !=0 && item.remark && selName(item.nodeName)">(意见：{{item.remark}})</span>
                      </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { flowableRecordgetTaskDetails } from './api'
export default {
    name: 'approvalProcess',
    components: { flowableRecordgetTaskDetails },
    props:{
        requestParameters:{
            type: Object,
            default: ()=>{
                return {}
            }
        },
    },
    data() {
      return {
        approvalProcessData:[]
      };
    },
    computed:{
      selName(){
        return (val) => {
          let isTrue = val.indexOf('会签')
          return isTrue == -1
        }
      }
    },

    mounted() {
      if(this.requestParameters.status != 1){
        flowableRecordgetTaskDetails({taskId:this.requestParameters.taskId}).then(res => {
            this.approvalProcessData = res.data.data
        })
      }

    },

    methods: {
        stateClass(item,index){
            if(index==0){
                return 'aplly';
            }else if(item.result=='ok'){
                return 'gleenClass';
            }else if(item.result=='fail'||item.result=='rollback'||item.result=='reject'){
                return 'redClass';
            }else if(item.result=='closed'||item.result=='doing'||item.result=='withdraw'){
                return 'grayClass';
            }
        }
    },
};
</script>

<style lang="scss" scoped>
.approvalProcess{
  margin-top: 40px;
  padding: 20px;
  background-color: #FBFBFC;
  border-radius: 10px;
    .title{
        font-size: 16px;
    }
    .bady{
        padding-left: 33px;
        .cont{
            height: 95px;
            // width: 535px;
            display: flex;
            .cont-left{
                width: 15px;
                text-align: center;
                display: inline-block;
                .cont-line{
                    height: 40px;
                    width: 1px;
                    background: #3471FF;
                    margin-left: 7px;
                }
                .cont-round{
                    border-radius: 50%;
                    // padding: 4px;
                    border: 1px solid #3471FF;
                    width: 15px;
                    height: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    .cont-inCircle{
                        display: inline-block;
                        background: #3471FF;
                        border-radius: 50%;
                        width: 7px;
                        height: 7px;
                    }
                }
            }
            .cont-right{
                padding: 30px 50px 30px 20px;
                flex: 1;
                display: flex;
                .cont-right-left{
                    display: inline-block;
                    height: 35px;
                    width: 35px;
                    border-radius: 50%;
                    border: 2px solid #3471FF;
                    text-align: center;
                    line-height: 30px;
                    color: #3471FF;
                    margin-right: 15px;
                }
                .cont-right-right{
                    flex: 1;
                    .cont-right-right-top{
                        /*width: 650px;*/
                        padding-bottom: 4px;
                        .name{
                            font-size: 14px;
                            display: inline-block;
                        }
                        .time{
                            font-size: 14px;
                            color: #8F959E;
                            float: right;
                        }
                    }
                  .status-row {
                    display: flex;
                    align-items: center;
                    span {
                      display: inline-block;
                      font-size: 14px;
                      margin-left: 20px;
                      word-break: break-all;
                    }
                  }
                  .status {
                    display: inline-block;
                    padding: 4px 0;
                    font-size: 14px;
                    /*border-radius: 6px;*/
                  }
                  .aplly {
                    /*background-color: #E7F5FF;*/
                    /*border: 1px solid #0F9EFD;*/
                    color: #0F9EFD;
                    span{
                      color: #0F9EFD;
                      padding-left: 22px;
                    }
                  }
                    .gleenClass{
                      /*background-color: #E3F2E5;*/
                      /*border: 1px solid #34BE3A;*/
                      color: #34BE3A;
                      span{
                            color: #0F9EFD;
                            padding-left: 22px;
                      }
                    }
                    .redClass{
                      /*background-color: #F8E7E8;*/
                      /*border: 1px solid #F54A45;*/
                      color: #F54A45;
                        span{
                            color: #BDC8E1;
                            padding-left: 22px;
                        }
                    }
                    .grayClass{
                      /*background-color: #DAE5FB;*/
                      /*border: 1px solid #3370FF;*/
                      color: #3370FF;
                        span{
                            color: #3370FF;
                            padding-left: 22px;
                        }
                    }
                }
            }
        }
    }
}
</style>
