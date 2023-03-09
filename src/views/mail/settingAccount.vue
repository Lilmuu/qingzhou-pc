<template>
  <div class="crudBox">
    <div class="newlyIncreased" @click="handleAdd">
      <i class="el-icon-plus"></i>
        点击添加其他账户
    </div>
    <div class="cardBox" v-for="(item,index) in tableData" :key="index">
      <div class="cardBoxHeader">
        账户名称：{{item.account}}
      </div>
      <div class="cardBoxBoddy">
        <div class="cardBoxBoddy-div"><span>邮箱地址</span>{{item.username}}</div>
        <div class="cardBoxBoddy-div"><span>协议类型</span>{{item.acceptProtocol}}</div>
        <div class="cardBoxBoddy-div">
          <span>账户状态</span>
          <el-switch v-model="item.useWay"
            @change="handleChange($event, item)"
            :inactive-value="0"
            :active-value="1">
          </el-switch>
        </div>
      </div>
      <div class="cardBoxFooter">
        <div class="footbox">
          <div class="del" @click="handleDel(item)">
            删除
          </div>
          <div class="amend" @click="handleEdit(item)">
            修改配置
          </div>
        </div>
      </div>
    </div>
    <!-- <avue-crud
        ref="crud"
        class="pager_curd"
        :data="tableData"
        :option="tableOption"
        @refresh-change='getList'
        @on-load='getList'
        style="margin-top:30px;"
    >
      <template slot="useWay" slot-scope="scope">
        <el-switch v-model="scope.row.useWay"
                   @change="handleChange($event, scope.row)"
                   :inactive-value="0"
                   :active-value="1">
        </el-switch>
      </template>
      <template slot="menu" slot-scope="scope">
        <span class="cursor" @click="handleDel(scope.row)" style="margin-right: 15px;color: #3471FF;font-size: 12px;">删除</span>
        <span class="cursor" @click="handleEdit(scope.row)" style="color: #3471FF;font-size: 12px;">修改配置</span>
      </template>
    </avue-crud> -->
    <!-- <div>
      <div class="settingAccountAddBtn cursor" @click="handleAdd">添加其他账户</div>
    </div> -->
    <!-- 选择类型  -->
    <el-dialog append-to-body
               width="520px"
               :show-close="false"
               title="添加账户"
               class="dia-mial"
               :visible.sync='selectTypeDialog'>
      <div class="mail-create-container flex-center">
        <!-- <h3 class="mail-header-text">添加账户</h3> -->
        <div class="createForm">
          <div class="mail-item flex-center cursor"
               @click="handleSelectItem(item)"
               v-for="(item, index) in mailList"
               :style="mailList.length-1==index?'margin-bottom:0':''"
               :key="'mailList' + index">
            <div class="mailList-item-row">
              <img :src="item.img" :style="`width: ${item.w};height: ${item.h};`" alt="">
              <span class="mail-item-text" v-if="item.text">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <!--  配置  -->
    <el-dialog append-to-body
               width="630px"
               :visible.sync='mailConfigDialog'
               :before-close="handleMailConfigDialogCancel"
               :show-close="true"
               class="main-configuration"
               :close-on-click-modal="true">
      <div slot="title" class="dialog-header-row" style="position: relative">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title">账户设置</span>
        <!-- <span class="dialog-header-right-text cursor" @click="handleGoToHelp">配置引导说明</span> -->
      </div>
      <mailLoginForm :actionMode="actionMode"
                     :initData="rowData"
                     showUseWay
                     :initMailAccountType="mailAccountType"
                     @success="successCb"
                     v-if="mailConfigDialog" />
    </el-dialog>
  </div>
</template>

<script>
import { config, settingAccountOption } from "@/const/dicData"
import { getMailConfigList, delConfigById, updateConfigState } from "@/api/mail"
import mailLoginForm from "@/views/mail/mailLoginForm"
import EventBus from '@/eventBus'
import { openLink } from "@/utils/pure"

export default {
  name: "settingAccount",
  components: {
    mailLoginForm
  },
  data() {
    return {
      tableData: [],
      tableOption: settingAccountOption,
      tableLoading: true,
      dialog: false,
      rowData: {}, // 行数据
      knowTaskId: '', // 处理id
      mailConfigDialog: false,
      selectTypeDialog: false,
      actionMode: 'add',  // [add, edit]
      mailAccountType: 'other',
      mailList: [
        {img: require('@/assets/img/mail/jck.png'),  w: '26px', h: '30px', type: 'jck', text: '进出口邮箱'},
        {img: require('@/assets/img/mail/tx.png'), w: '29px', h: '20px', type: 'tengXunQiYe', text: '腾讯企业邮'},
        {img: require('@/assets/img/mail/qq.png'),  w: '29px', h: '29px', type: 'tengXunQQ', text: 'QQ邮箱'},
        {img: require('@/assets/img/mail/163.png'),  w: '29px', h: '15px', type: 'wangYi', text: '163邮箱'},
        {img: require('@/assets/img/mail/126.png'),  w: '29px', h: '16px', type: '126', text: '126邮箱'},
        // {img: require('@/assets/img/mail/gmail.png'),  w: '29px', h: '22px', type: 'gmail', text: 'Gmail'},
        // {img: require('@/assets/img/mail/outlook.png'),  w: '29px', h: '25px', type: 'outlook', text: 'Outlook'},
        // {img: require('@/assets/img/mail/exchange.png'),  w: '29px', h: '27px', type: 'exchange', text: 'Exchange'},
        {img: require('@/assets/img/mail/mail.png'),  w: '29px', h: '26px', type: 'other', text: '其他邮箱'},
      ],
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    // 用户列表
    getList() {
      this.tableLoading = true
      getMailConfigList().then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data
          console.log(this.tableData)
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    successCb() {
      this.mailConfigDialog = false
      this.getList()
      // EventBus.$emit('handleCheckIsFirstLogin')
    },
    // 选中item
    handleSelectItem(item) {
      this.mailAccountType = item.type
      this.actionMode = 'add'
      this.rowData = {}
      this.selectTypeDialog = false
      this.mailConfigDialog = true
    },
    // 帮助
    handleGoToHelp() {
      openLink(config.mailHelpPage)
    },
    handleMailConfigDialogCancel() {
      this.mailConfigDialog = false
    },
    // 开启、关闭
    handleChange(status, row) {
      const query = {
        id: row.id,
        useWay: row.useWay
      }
      updateConfigState(query).then(res => {
        if (res.data.code === 200) {
          this.getList()
        }
      })
    },
    // 删除
    handleDel({id}) {
      this.$msgbox({
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">确定将邮箱账号删除吗？</span>
            </div>
          </div>
          `,
        dangerouslyUseHTMLString: true,
        customClass: 'customMsgBox',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: 'confirmBtn cancelButtonqd',
        cancelButtonText: '取消',
        cancelButtonClass: 'confirmBtn cancelButtonqx',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            delConfigById(id).then(res => {
              if (res.data.code === 200) {
                this.$message.success('删除成功')
                EventBus.$emit('handleCheckIsFirstLogin')
                this.getList()
              }
            }).finally(() => {
              done()
              instance.confirmButtonLoading = false
            })
          } else {
            done()
          }
        }
      }).then(action => {
      }).catch(e => {})
    },
    // 编辑
    handleEdit(row) {
      this.actionMode = 'edit'
      this.rowData = row
      this.mailConfigDialog = true
    },
    // 新增
    handleAdd() {
      this.selectTypeDialog = true
    }
  }
}
</script>

<style lang='scss' scoped>
::v-deep.el-switch.is-checked .el-switch__core{
  background-color: #3370FF;
}
.crudBox{
  width: 100%;
  height: 100%;
  padding: 0 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  grid-column-gap: 40px;
  .newlyIncreased{
    width: 480px;
    height: 224px;
    background: #FFFFFF;
    border: 1px solid #DEE0E3;
    opacity: 1;
    border-radius: 8px;
    margin-top: 30px;
    font-size: 14px;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    text-align: center;
    padding-top: 70px;
    color: #646A73;
    cursor: pointer;
    i{
      font-size: 32px;
      color: #646A73;
      display: block;
      margin-bottom: 30px;
    }
  }
  .cardBox{
    width: 480px;
    height: 224px;
    border: 1px solid #DEE0E3;
    box-shadow: 0px 2px 8px rgba(15, 22, 51, 0.08);
    opacity: 1;
    border-radius: 8px;
    font-family: SourceHanSansCN-Normal;
    display: flex;
    flex-flow: column;
    margin-top: 30px;
    // margin-left: 40px;
    .cardBoxHeader{
      height: 42px;
      background: #F5F6F7;
      font-size: 16px;
      padding-left: 20px;
      display: flex;
      align-items: center;
    }
    .cardBoxBoddy{
      flex: 1;
      padding-left: 21px;
      .cardBoxBoddy-div{
        margin-top: 20px;
        font-size: 14px;
        span{
          color: #646A73;
          margin-right: 24px;
        }
      }
    }
    .cardBoxFooter{
      height: 52px;
      border-top: 1px solid #DEE0E3;
      .footbox{
        // float: right;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .del{
          width: 88px;
          height: 32px;
          border: 1px solid #D0D3D6;
          opacity: 1;
          border-radius: 6px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          cursor: pointer;
        }
        .amend{
          width: 88px;
          height: 32px;
          background: #3370FF;
          opacity: 1;
          border-radius: 6px;
          font-size: 14px;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 22px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
