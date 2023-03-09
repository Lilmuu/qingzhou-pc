<!--
 * @Author: your name
 * @Date: 2021-12-09 18:20:00
 * @LastEditTime: 2021-12-29 15:48:02
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\oaMenu\forward.vue
-->
<template>
  <div class="forward-window">
    <el-dialog
      title='流程转发'
      :visible.sync="forwardVisible"
      :show-close="true"
      custom-class="forward-dialog"
      width="750px"
      :before-close="handleClose">
      <div class="forward-content">
        <el-form :model="forwardFrom">
            <el-form-item class="position-row">
              <div class="frist-select">
                <span class="ico user-ico"></span>
                <el-select   v-model="forwardFrom.nodeId" placeholder="请选择转发方式" @change='positionChange'>
                  <el-option
                    v-for="userItem in positionList"
                    :key="userItem.nodeId"
                    :label="userItem.nodeName"
                    :value="userItem.nodeId">
                  </el-option>
                </el-select>
              </div>
              <el-select v-cloak v-if="isMultify"  class="last-select" v-model="statePopList"  :multiple='forwardFrom.flag == 2' placeholder="请选择接收人" @change='popChange'>
                <el-option
                  v-for="userItem in positionPopList"
                  :key="userItem.uid"
                  :label="userItem.uName"
                  :value="userItem.uid">
                </el-option>
              </el-select>

            </el-form-item>


          <el-form-item>
            <div class="row-item">
              <span class="ico cont-ico"></span>
              <el-input v-model="forwardFrom.remark" type="textarea" :autosize="{ minRows: 6 }" maxlength="500" placeholder="请输入备注内容" ></el-input>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button @click="forwardVisible = false" size="mini">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" size="mini">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title='选择接收人'
      :visible.sync="selectForwardUser"
      :show-close="false"
      width="60%"
      :before-close="handleClose">
      <selectPeople
        addType=''
        moduleMode='workbenchForward'
        @workbenchForward='selectUserSuccess'
        @selectCancel='selectCancel'
      ></selectPeople>
    </el-dialog>

  </div>
</template>

<script>

  import selectPeople from "@/views/myTodo/components/selectPeople"
  import { flowableRecord } from "@/api/workSpace";
  import { mapState } from "vuex";

  export default {
    name: 'forwardBox',
    components:{selectPeople},
    // props:{
    //   //
    //   requestParameters:{
    //     type: Object,
    //     default: ()=>{
    //       return {}
    //     }
    //   },
    // },
    computed:{
      ...mapState({
        requestParameters: (state) => state.workbench.requestParameters,
  }),
  },
  data(){
    return {
      forwardVisible: false, //
      selectForwardUser: false,
      oneClick: true,
      positionList: [], // 可选择职位列表
      positionPopList: [], // 职位对应人员列表
      statePopList: '', //

      forwardFrom: {
        user: '',
        userList: [],
        remark: '',
        type: '',
        flag: 1, // 是否可以多选
        nodeId: '', // 转发人节点ID
        nodeName: '', // 转发人
      },
      isMultify: true
    }
  },
  methods:{
    handleSubmit(){
      console.log('this.forwardFrom -this.forwardFrom---',this.forwardFrom)
      this.$emit('forward-select', this.forwardFrom)
      this.forwardVisible = false
      this.selectForwardUser = false
    },

    // 选择的当前对象
    positionChange(value){
      console.log(value)
      this.positionPopList = []
      this.forwardFrom.flag = undefined
      let selectObj = this.positionList.find(e=>{
        return  e.nodeId === value
      })
      this.statePopList = selectObj.flag == 2 ? [] : ''
      this.forwardFrom.nodeName = selectObj.nodeName
      this.forwardFrom.flag = selectObj.flag
      this.positionPopList = selectObj.userList

      this.isMultify = false;
      this.$nextTick(()=>{
        this.isMultify = true;
      })

      console.log(value,'value')
    },
    popChange(value){
      let type = typeof(value)
      if(type == 'string'){
        this.forwardFrom.user = value
        this.forwardFrom.type = 'string'
      }else if(type == 'object'){
        this.forwardFrom.userList = value
        this.forwardFrom.type = 'object'
      }
    },
    selectUser(){
      this.forwardVisible = false
      this.selectForwardUser = true
    },
    selectUserSuccess(item){
      console.log(item,' item - 选择接收人')
      this.forwardFrom.user = item
      this.selectCancel()
    },
    selectCancel(){
      this.forwardVisible = true
      this.selectForwardUser = false
    },
    handleClose(){
      this.forwardVisible = false,
        this.selectForwardUser = false,
        this.forwardFrom.user = ''
      this.forwardFrom.remark = ''
    },
    async showForwoardList(){
      flowableRecord(this.requestParameters.taskId).then(res=>{
        if(res.data.code == 0){
        this.positionList = res.data.data
        this.forwardVisible = true
      }
      console.log(res, '转发节点 0001')
    })
    }
  }

  }
</script>

<style lang='scss' scoped>
  .forward-content{
    /*::v-deep .el-textarea,::v-deep .el-textarea__inner {*/
      /*resize: vertical;*/
    /*}*/
    ::v-deep .el-input__inner {
      margin-left: 0!important;
      width: 100%!important;
    }
    .row-item {
      display: flex;
    }
    .select-user{
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #DCDFE6;
      padding: 0 15px;
      border-radius: 4px;
      img{
        width: 13px;
      }
    }
    .ico {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 24px;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
    .user-ico {
      background-image: url("../../assets/img/workSpace/forward-user.png");
    }
    .cont-ico {
      background-image: url("../../assets/img/workSpace/transimit.png");
    }
  }

  .no-select-user{
    color: #BFBFBF;
    font-size: 12px;
  }
</style>

<style lang='scss'>
  .forward-dialog{
    margin-top: 18vh;
    .el-dialog__body{
      padding: 10px 30px 0;
    }
  }
  .position-row{
    .el-form-item__content{
      display: flex;
      justify-content: space-between;

      .frist-select{
        display: flex;
        align-items: center;
        width: 35%;
      }
      .last-select{
        width: 62%;
      }
    }
    .el-form-item__content::after, .el-form-item__content::before{
      display: none;
    }
  }
  .forward-window {
    .forward-dialog {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      /*min-height: 424px;*/
      border-radius: 10px;
    }
    .el-dialog .el-dialog__header {
      background: #fff;
      border-radius: 10px;
      height: auto!important;
      .el-dialog__headerbtn {
        width: 24px;
        height: 24px;
        .el-dialog__close {
          //width: 20px;
          //height: 20px;
          //background: url("../../assets/img/workbench/disagree.png") no-repeat center/cover;
          //&:before {
          //  display: none;
          //}
        }
      }
      .el-dialog__title {
        position: relative;
        padding: 22px 0;
        /*height: 52px;*/
        /*line-height: 52px;*/
        &:before {
          content: '';
          display: none;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 4px;
          background-color: #3370FF;

        }

      }



    }
  }
  [v-cloack]{
    display: none;
  }
</style>
