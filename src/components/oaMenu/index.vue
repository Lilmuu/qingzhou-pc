<!--
 * @Author: your name
 * @Date: 2021-12-06 17:23:54
 * @LastEditTime: 2022-06-23 14:38:34
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\oaMenu\index.vue
-->
<template>
  <div class="oa-menu">
    <div v-if="agreeBtn" class="pointer agree hear-btn" @click="agree('同意')">
      <span class="agree-ico"></span>
      <span>同意</span>
    </div>
    <div v-if="unAgreeBtn" class="pointer disagree hear-btn" @click="agree('不同意')">
      <span class="disagree-ico"></span>
      <span >不同意</span>
    </div>
    <div v-if="endBtn" class="pointer disagree hear-btn" @click="agree('结束')">
      <span>结束</span>
    </div>
    <div class="icon-list">
      <!--转发-->
      <div v-if="isForward" @click="forward()" class="hear-btn gray-bg">
        <span class="ico ico-transmit pointer"></span>
        <span>转发</span>
      </div>
      <!--打印-->
      <div @click="print" class="hear-btn gray-bg">
        <span class="ico ico-pdf pointer"></span>
        <span>打印</span>
      </div>
      <!--下载-->
      <div @click="download" class="hear-btn gray-bg">
        <span class="ico ico-downLoad pointer"></span>
        <span>下载</span>
      </div>
    </div>
    <submitBox ref="submitBox" @handleSubmit='handleSubmit' :btnType="btnType"></submitBox>
    <forward ref="forwardBox" @forward-select='forwardSelBtn'></forward>
  </div>
</template>

<script>
import submitBox from './submitBox.vue'
import forward from './forward.vue'
// import html2canvas from 'html2canvas'
// import printJS from 'print-js'
import { handleDownLoadFile } from "@/utils/download";
import {
  contractForward,
  contractAgree,
  contractRefuse,
  articleAgree,
  articleDisagree,
  articleForward,
  meetingTaskcompleteMeetingTask,
  meetingTaskrefuseMeetingTask,
  reportsinglenodecomplete,
  reportrefuse,
  reportmultinodecomplete,
  downLoadFile,
  forwardCounterSign,
  countersignVote,
  articleEditArticle,
  completePrintTask,
  refusePrintTask,
  forwardPrint,

  } from '@/api/workSpace'
import { mapState } from 'vuex';
export default {
  components: {submitBox,forward},
  props:{
    //
    requestParameters:{
      type: Object,
      default: ()=>{
        return {}
      }
    },
    OAmodel:{
      type: String,
      default: ()=>{
        return ''
      }
    },
    isForward:{
      type: Boolean,
      default: ()=>{
        return false
      }
    },
    isSee:{
      type: Boolean,
      default: ()=>{
        return false
      }
    },
    endBtn:{
      type: Boolean,
      default: ()=>{
        return false
      }
    },
    agreeBtn:{
      type: Boolean,
      default: ()=>{
        return false
      }
    },
    unAgreeBtn:{
      type: Boolean,
      default: ()=>{
        return false
      }
    },
    voteNode:{
      type: Number,
      default: ()=>{
        return 1
      }
    },
    // 发文 - 内容
    paramsVal:{
      type: Object,
      default: ()=>{
        return {}
      }
    },
    // 是否为文书节点
    wenShuFlag:{
      type: Number,
      default: ()=>{
        return 2
      }
    },
  },
  computed:{
    ...mapState({
      userId: state => state.user.userId,
    }),
    formatType() {
      let num = undefined
      switch (this.OAmodel) {
        case 'topics':
          num = 1
          break;
        case 'sign':
          num = 2
          break;
        case 'useSeal':
          num = 3
          break;
        case 'contract':
          num = 4
          break;
        case 'dispatch':
          num = 5
          break;
        default:
          break
      }
      return num
    }
  },
  mounted(){
    console.log(this.MeId,'this.MeId --- this.MeId')

    // if(this.isForward){
    //   console.log(this.MeId,'this.MeId --- this.MeId')
    //   this.$refs.forwardBox.forwoardList(this.requestParameters.taskId)
    // }

  },
  data(){
    return {
      showForward: false,
      oneClick: true,
      btnType: "",
      fdTimer: true,
    }
  },
  methods:{
    handleSubmit(modelForm,tit){
      console.log(this.OAmodel,'OAmodel - OAmodel')
      if(this.voteNode == 2){
        let params ={
          remark: modelForm.remark,
          taskId: this.requestParameters.taskId,
          approval: 1,
        }
        params.approval = tit=='同意'||tit=='结束' ? 1 : 0
        countersignVote(params).then(res=>{
          if(res.data.code == 0){
            this.oneClick = true
            this.$store.commit('pushTopNav',{path:'flowPath'})
          }
        })
        return
      }
      console.log("nodeName - nodeName  等于1", modelForm)
      // 合同部分
      if(this.OAmodel === 'contract'){
        this.contractAgreeOrdisagree(modelForm,tit)
      }
      // 发文
      else if(this.OAmodel === 'dispatch'){
        this.dispatchAgreeOrdisagree(modelForm,tit)
      }
      //议题
      else if(this.OAmodel === 'topics'){
        this.issueAgreeOrdisagree(modelForm,tit)
      }
      //签报
      else if(this.OAmodel === 'sign'){
        this.signTheQuoteAgreeOrdisagree(modelForm,tit)
      }
      // 用印
      else if(this.OAmodel === 'useSeal'){
        this.useSealAgreeOrdisagree(modelForm,tit)
      }
    },
    // 同意||不同意
    agree(tit){
      tit == "同意" ? this.btnType = "primary" : this.btnType = "danger"
      this.$refs.submitBox.handleUp(tit, this.requestParameters)
    },
    // 转发
    forward(){
      console.log('this.reqaerga爱国守法格式uestParameters', this.requestParameters)
      this.$refs.forwardBox.showForwoardList()
      // this.$refs.forwardBox.forwoardList(this.requestParameters.taskId)
    },
    // 确认转发
    forwardSelBtn(item){
      console.log(item,'item --- item')

      if(this.oneClick){
        this.oneClick = false
        let params = {
          businessId: this.requestParameters.businessId,
          remark: item.remark,
          nodeName: item.nodeName,
          taskId: this.requestParameters.taskId,
        }
        console.log('1212 - 12')
        if(item.type == 'object' || this.OAmodel == 'topics'){
          if(this.OAmodel == 'topics'){
            params['userList'] = []
            params['userList'].push(item.user)
          }else{
            params['userList'] = item.userList
          }
          params['nodeId'] = item.nodeId
          params['type'] = this.formatType
          forwardCounterSign(params).then(res=>{
            if(res.data.code==0){
              this.oneClick = true
              this.$store.commit('pushTopNav',{path:'flowPath'})
            }
          }).catch(err =>{
            this.oneClick = true
          })
        }else if(item.type == 'string' && this.OAmodel != 'topics'){
          params['userId'] = item.user
          console.log(params,'params --- params')
          console.log('1212 -- 000 - his.OAmodel',this.OAmodel)
          if(this.OAmodel === 'contract'){
            contractForward(params).then(res=>{
              if(res.data.code==0){
                this.oneClick = true
                this.$store.commit('pushTopNav',{path:'flowPath'})
              }
            }).catch(err =>{
              this.oneClick = true
            })
          }else if(this.OAmodel === 'dispatch'){
            articleForward(params).then(res=>{
              if(res.data.code==0){
                this.oneClick = true
                this.$store.commit('pushTopNav',{path:'flowPath'})
              }
            }).catch(err =>{
              this.oneClick = true
            })
          }else if(this.OAmodel === 'sign'){
            reportmultinodecomplete(params).then(res=>{
              if(res.data.code==0){
                this.oneClick = true
                this.$store.commit('pushTopNav',{path:'flowPath'})
              }
            }).catch(err =>{
              this.oneClick = true
            })
          }else if(this.OAmodel === 'useSeal'){
            console.log('1212 -- 000')
            forwardPrint(params).then(res=>{
              if(res.data.code==0){
                this.oneClick = true
                this.$store.commit('pushTopNav',{path:'flowPath'})
              }
            }).catch(err =>{
              this.oneClick = true
            })
          }
        }
      }
    },
    
    // 打印
    print(){
      downLoadFile(this.requestParameters.businessId, this.formatType).then(res=>{
        console.log(res,'res - res')

        const content = res.data
        console.log(content)
        // 转换必须要加上{ type: 'application/pdf' },不然无法进行打印
        const blob = new Blob([content], { type: 'application/pdf' })
        let date = (new Date()).getTime()
        let ifr = document.createElement('iframe')
        ifr.style.frameborder = 'no'
        ifr.style.display = 'none'
        ifr.style.pageBreakBefore = 'always'
        ifr.setAttribute('id', 'printPdf' + date)
        ifr.setAttribute('name', 'printPdf' + date)
        ifr.src = window.URL.createObjectURL(blob)
        document.body.appendChild(ifr)
        setTimeout(() => {
          this.doPrint('printPdf' + date)
          window.URL.revokeObjectURL(ifr.src) // 释放URL 对象
        }, 1000);
      })
    },

    // 打印
    doPrint(val) {
      let ordonnance = document.getElementById(val).contentWindow
      setTimeout(() => {
        ordonnance.print()
      }, 100)
    },

    // 下载PDF
    download(){
      downLoadFile(this.requestParameters.businessId, this.formatType).then(res=>{
        console.log(res,'res - res')
        let url = URL.createObjectURL(res.data)
        console.log(url,'url - 下载pdf')
        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()+1
        let day = date.getDate()
        let hours = date.getHours() + 1
        let minutes = date.getMinutes() + 1
        let seconds = date.getSeconds()
        let fileName = `${year}${month}${day}${hours}${minutes}${seconds}.pdf`

        let down = document.createElement('a');
        down.href = url;
        down.download = fileName;// 默认为文件的名字
        document.body.appendChild(down);
        down.click();
        down.remove();
      })
    },
    // 签报【同意  && 驳回 】
    signTheQuoteAgreeOrdisagree(modelForm,tit){
      if(this.oneClick){
        this.oneClick = false
        let params = {
          remark: modelForm.remark,
          nodeName: modelForm.nodeName,
          taskId:this.requestParameters.taskId,
          businessId: this.requestParameters.businessId
        }
        // if(tit == '结束'){
        //   params['userId'] = this.userId
        //   reportmultinodecomplete(params).then(res=>{
        //     if(res.data.code==0){
        //       this.oneClick = true
        //       this.$store.commit('pushTopNav',{path:'flowPath'})
        //     }
        //   }).catch(err =>{
        //     this.oneClick = true
        //   })
        // }
        if(tit == '同意' || tit == '结束'){
          // 同意
          reportsinglenodecomplete(params).then(res=>{
            if(res.data.code == 0){
              this.oneClick = true
              this.$refs.submitBox.agreeOrDisagree(tit)
            }
          }).catch(err=>{
            this.oneClick = true
          })
        }else{
          // 驳回
          reportrefuse(params).then(res=>{
            if(res.data.code == 0){
              this.oneClick = true
              this.$refs.submitBox.agreeOrDisagree(tit)
            }
          }).catch(err=>{
            this.oneClick = true
          })
        }
      }
    },
    // 议题【同意  && 驳回 】
    issueAgreeOrdisagree(modelForm,tit){
      if(this.oneClick){
        this.oneClick = false
        let params = {
        remark:modelForm.remark,
        nodeName: modelForm.nodeName,
        taskId:this.requestParameters.taskId,
        busId:this.requestParameters.businessId
      }
      if(tit == '同意' || tit == '结束'){
        // 同意
        meetingTaskcompleteMeetingTask(params).then(res=>{
          if(res.data.code == 0){
            this.oneClick = true
            this.$refs.submitBox.agreeOrDisagree(tit)
          }
        }).catch(err=>{
            this.oneClick = true
          })
      }else{
        // 驳回
        meetingTaskrefuseMeetingTask(params).then(res=>{
          if(res.data.code == 0){
            this.oneClick = true
            this.$refs.submitBox.agreeOrDisagree(tit)
          }
        }).catch(err=>{
            this.oneClick = true
          })
      }
      }

    },

    // 合同【同意  && 驳回 】
    contractAgreeOrdisagree(modelForm,tit){
      if(this.oneClick){
        this.oneClick = false
        let params = {
          nodeName: modelForm.nodeName,
        businessId: this.requestParameters.businessId,
        remark: '',
        taskId: this.requestParameters.taskId,
      }
      params.remark = modelForm.remark
      if(tit == '同意' || tit == '结束'){
        // 同意
        contractAgree(params).then(res=>{
          if(res.data.code == 0){
            this.oneClick = true
            this.$refs.submitBox.agreeOrDisagree(tit)
          }
        }).catch(err=>{
            this.oneClick = true
          })
      }else{
        // 驳回
        contractRefuse(params).then(res=>{
          if(res.data.code == 0){
            this.oneClick = true
            this.$refs.submitBox.agreeOrDisagree(tit)
          }
        }).catch(err=>{
            this.oneClick = true
          })
      }
      }
    },

    // 发文 - 同意&&驳回
    dispatchAgreeOrdisagree(modelForm,tit){
      if(this.oneClick){
        this.oneClick = false
        let params = {
          nodeName: modelForm.nodeName,
          busId: this.requestParameters.businessId,
          remark: '',
          taskId: this.requestParameters.taskId,
          workflowId: this.requestParameters.id
        }
        params.remark = modelForm.remark
        if(tit == '同意' || tit == '结束'){
          // 提交修改的正文
          if(this.wenShuFlag == 1){
            articleEditArticle({articleId: this.requestParameters.businessId, articleText: this.paramsVal.articleText})
          }
          // 同意
          articleAgree(params).then(res=>{
            if(res.data.code == 0){
              this.oneClick = true
              this.$refs.submitBox.agreeOrDisagree(tit)
            }
          }).catch(err=>{
            this.oneClick = true
          })
        }else{
          // 驳回
          articleDisagree(params).then(res=>{
            if(res.data.code == 0){
              this.oneClick = true
              this.$refs.submitBox.agreeOrDisagree(tit)
            }
          }).catch(err=>{
            this.oneClick = true
          })
        }
      }
    },

    // 用印 - 同意&&驳回
    useSealAgreeOrdisagree(modelForm,tit){
      if(this.oneClick){
        this.oneClick = false
        let params = {
          nodeName: modelForm.nodeName,
          busId: this.requestParameters.businessId,
          remark: '',
          taskId: this.requestParameters.taskId,
          workflowId: this.requestParameters.id
        }
        params.remark = modelForm.remark
        if(tit == '同意' || tit == '结束'){
          // 同意
          completePrintTask(params).then(res=>{
            if(res.data.code == 0){
              this.oneClick = true
              this.$refs.submitBox.agreeOrDisagree(tit)
            }
          }).catch(err=>{
            this.oneClick = true
          })
        }else{
          // 驳回
          refusePrintTask(params).then(res=>{
            if(res.data.code == 0){
              this.oneClick = true
              this.$refs.submitBox.agreeOrDisagree(tit)
            }
          }).catch(err=>{
            this.oneClick = true
          })
        }
      }
    },

    antiShake() {
				if(this.fdTimer){
					this.fdTimer = false
					this.handleSubmit();
					// this.timed = 
					setTimeout(()=>{
						this.fdTimer = true
					}, 3000);
				}
			},
  }
}
</script>

<style lang='scss' scoped>
  .oa-menu  {
    .agree-ico, .disagree-ico {
      width: 14px;
      height: 14px;
      margin-right: 10px;
    }
    .agree-ico {
      background: url("../../assets/img/workbench/agree.png") no-repeat center/cover;
    }
    .disagree-ico {
      background: url("../../assets/img/workbench/disagree.png") no-repeat center/cover;
    }
  }
.oa-menu>div{


  span{
  display: inline-block;
  /*margin: 6px 0;*/
  /*width: 95px;*/
  text-align: center;
  /*border-left: 2px solid #3471FF;*/
  img{
    vertical-align: text-bottom;
    margin-right: 4px;
  }
}
}
.oa-menu{
  font-size: 14px;
  color: #333333;
  display: flex;
  align-items: center;
  background: #fff;
  .pointer {
    cursor: pointer;
  }
  .ico {
    width: 14px;
    height: 14px;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  /*border: 1px solid #DCDFE6;*/
  .hear-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 83px;
    height: 31px;
    border-radius: 6px;

  }
  .gray-bg {
    width: 72px;
    margin-left: 10px;
    color:#646A73;
    font-size: 14px;
    background-color: #fff;
    cursor: pointer;
    transition: backgroundColor .3s linear;
    &:hover {
      background-color: #EDEDEE;

    }
  }
  .agree{
    --hover-color: #EAF9E8;
    color: #34BE3A;
    background-color: #fff;
    border: 1px solid #34BE3A;
    margin-right: 10px;
    transition: background-color .3s linear;
    .ico {
      background: url("../../assets/img/workbench/topics-agree.png");
    }
    &:hover {
      background-color: var(--hover-color);
    }
  }
  .disagree{
    --hover-color: #FEECEC;
    color: #F12424;
    border: 1px solid #F12424;
    transition: background-color .3s linear;
    .ico {
      background: url("../../assets/img/workbench/topics-disagree.png");
    }

    &:hover {
      background-color: var(--hover-color);
    }
  }
  .no-border-left{
    border-left: none;
  }

  .icon-list {
    display: flex;
    align-items: center;
    .ico {
      margin-right: 10px;
    }
    .ico-transmit {
      background: url("../../assets/img/workbench/topics-transmit.png");
    }
    .ico-pdf {
      background: url("../../assets/img/workbench/topics-pdf.png");
    }
    .ico-downLoad {
      background: url("../../assets/img/workbench/topics-download.png");
    }
  }

}

</style>
