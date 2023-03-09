<!--设置-->
<template>
  <MainBasicContainer :useBorder="false" class="usePadding"  style="max-width: calc(100vw - 50px);">
    <div class="top-label" style="">
      <div class="mail-header">
        <div class="flex-center">
          <div class="header-title">邮箱设置</div>
        </div>
        <div class="header-close">
          <i class="el-icon-close" @click="headerClose"></i>
        </div>
      </div>
    </div>
    <div class="box-external">
      <!--  常规/账户  -->
      <div class="mail-header-card-row">
        <div class="mail-header-card-row-box">
          <div :class="['header-card-item cursor', activeCard === item.value ? 'header-card-item-active' : '']"
              @click="handleChangeHeadCard(item.value)"
              v-for="(item, index) in headerCardOption"
              :key="'headerCardOption' + index"> <img :src="activeCard == item.value ?item.imgPitch: item.img" alt=""> {{ item.label }}</div>
        </div>
      </div>
      <!-- 常规  -->
      <div class="flex-column sign-form" v-if="activeCard === 'cg'">
        <div class="sign-form-item" style="width: 100%;padding: 30px;">
          <div class="flex-align-center">
            <div class="item-label" style="">在邮件列表中</div>
            <el-select v-model="mailPageSize" placeholder="请选择文件夹邮件数量" @change="handleSave" size="mini">
              <el-option :label="item.title" :value="item.count" v-for="item in folderList" :key="item.count"></el-option>
            </el-select>
          </div>
        </div>
        <div class="sign-form-item" style="width: 100%;padding: 0 30px;">
          <div class="item-label">个性签名</div>
          <div style="display:inline-block">
            <div style="display:inline-block" class="tbd">
              <el-select v-model="signId" @change="handleSelectSign" placeholder="请选择个性签名" size="mini">
                <el-option :label="item.name" :value="item.id" v-for="item in signList" :key="item.id" style=""></el-option>
              </el-select>
              <span class="primary cursor sign-text" @click="handleAddSignDialog('open')">
                <!-- <i class="el-icon-plus"></i> -->
                <img src="@/assets/img/mail/plusSign.png" alt="">
              </span>

            </div>
            <div v-show="signId !== '-1'" class="bottom-box">
              <div class="sign-preview">
                <div v-html="activeSignContent"></div>
              </div>
              <div class="flex-align-center-bottom">
                <div @click="handleEdit" class="mail-btn flex-center mail-btn-primary" style="margin-right: 20px;float:right">编辑</div>
                <div @click="handleDelete" class="mail-btn flex-center mail-btn-disable" style="margin-right: 10px;float:right">删除</div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="flex-center">
          <div @click="handleSave" class="save-btn flex-center cursor">
            <span>保存设置</span>
          </div>
        </div> -->
      </div>
    <!-- 账户 -->
    <SettingAccount v-if="activeCard === 'zh'"></SettingAccount>
    </div>
    <!--添加签名 dialog  -->
    <el-dialog append-to-body
               width="40%"
               :visible.sync='signDialog'
               :modal='false'
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title">新建签名</span>
      </div>
      <SignDialog :actionType="actionType"
                  :rowData="rowData"
                  @handleSignSubmit="handleSignSubmit"
                  @handleSignClose="handleSignClose"
                  v-if="signDialog"></SignDialog>
    </el-dialog>
  </MainBasicContainer>
</template>

<script>
import MainBasicContainer from "@/components/BasicContainer/MainBasicContainer"
import { mailPageOption } from "@/const/dicData"
import MailTopHeader from "@/views/mail/components/MailTopHeader"
import { getSignature, saveSignature, editSignature, delSignature, tagAllRead, setDefault } from "@/api/mail"
import SignDialog from "@/views/mail/signDialog"
import SettingAccount from "@/views/mail/settingAccount"

const topLabelOption = [
  { label: '设置', name: 'sz' }
]

const headerCardOption = [
  {label: '账户管理', value: 'zh', img: require('@/assets/img/mail/user.png'), imgPitch: require('@/assets/img/mail/userPitch.png')},
  {label: '通用设置', value: 'cg', img: require('@/assets/img/mail/set.png'), imgPitch: require('@/assets/img/mail/setPitch.png')},
]

export default {
  name: "setting",
  components: {
    MainBasicContainer,
    MailTopHeader,
    SignDialog,
    SettingAccount
  },
  data() {
    return {
      topLabelOption: topLabelOption,
      topTabActiveName: 'sz',
      page: JSON.parse(JSON.stringify(mailPageOption)),
      mailPageSize: '',
      folderList: [
        { count: '25', title: '每页显示邮件25封' },
        { count: '50', title: '每页显示邮件50封' },
        { count: '100', title: '每页显示邮件100封' }
      ],
      signId: '-1',
      signList: [
        { id: '-1', name: '不使用' }
      ],
      activeCard: 'zh',
      headerCardOption: headerCardOption,
      signDialog: false,
      formData: {
        name: '',
        content: ''
      },
      rowData: {}, // 编辑数据
      actionType: '' // 操作方式 [add, edit, preview]
    }
  },
  mounted() {
    this.handleGetSignature()
    const mailPageSize = localStorage.getItem('mailPageSize') || '25'
    this.mailPageSize = String(mailPageSize)
  },
  computed: {
    // 选中签名内容
    activeSignContent() {
      const signId = this.signId
      let content = ''
      this.signList.forEach(item => {
        if (item.id === signId) {
          content = item.content
        }
      })
      return content
    }
  },
  methods: {
    headerClose(){
      this.$parent.detailMode=true
      this.$parent.isMailLogin=true
      this.$parent.isLoaded=true
      this.$parent.mailboxSettings=true
      
    },
    // head 切换
    handleChangeHeadCard(value) {
      this.activeCard = value
    },
    // 获取个性签名
    handleGetSignature() {
      getSignature().then(res => {
        if (res.data.code === 200) {
          const currentItem = res.data.data.filter(item => item.isDefault === 1)
          // 未设置签名的
          if(!currentItem || currentItem.length === 0) {
            this.signId = '-1'
          } else {
            this.signId = currentItem[0].id
          }
          console.log('currentItem', currentItem)
          this.signList = [{ id: '-1', name: '不使用' }, ...res.data.data]
        }
      })
    },
    handleSelectSign(id) {
      this.signList.forEach(item => {
        if (item.id === id) {
          this.rowData = item
          this.handleSave()
        }
      })
    },
    handleAddSignDialog() {
      this.signDialog = true
      this.actionType = 'add'
    },
    // 签名提交
    handleSignSubmit(data) {
      const requestApi = this.actionType === 'add' ? saveSignature : editSignature
      requestApi(data).then(res => {
        if (res.data.code === 200) {
          this.handleSignClose()
          this.handleGetSignature()
        }
      })
    },
    handleSignClose() {
      this.signDialog = false
      this.handleResetForm()
    },
    // form 清空
    handleResetForm() {
      this.formData = {
        name: '',
        content: ''
      }
    },
    // 保存设置
    handleSave() {
      localStorage.setItem('mailPageSize', String(this.mailPageSize))
      mailPageOption.pageSize = Number(this.mailPageSize)
      // 保存签名
      const query = {
        id: this.signId
      }
      setDefault(query).then(res => {
        if (res.data.code === 200) {
          this.$message.success('保存成功')
        }
      })
    },
    // 编辑
    handleEdit() {
      // this.handleSelectSign(this.signId)
      this.signList.forEach(item => {
        if (item.id === this.signId) {
          this.rowData = item
        }
      })
      this.actionType = 'edit'
      this.signDialog = true
    },
    // 删除签名
    handleDelete() {
      this.$msgbox({
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">您确定要删除该条个性签名？</span>
            </div>
           <div class="innerTip">删除后，将不会在显示该个性签名</div>
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

            const id = this.signId
            delSignature({ id }).then(res => {
              if (res.data.code === 200) {
                this.handleGetSignature()
                // 改为无签名
                this.signId = '-1'
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
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select-dropdown__item{
  margin: 0 10px !important;
  border-radius: 4px;
    ::v-deepspan{
      padding: 0 10px !important;
    }
  }
.el-select-dropdown__item.selected{
  margin: 0 10px !important;
  color: #3370FF;
  background: #F5F6F7;
  border-radius: 4px;
}
.top-label{
  margin-bottom: 0;
}
.main-basic-container{
  padding-right: 0;
  margin-left: 0;
  margin-bottom: 0;
  height: 100vh;
  .mail-header{
    border-top: 0;
    height: 52px;
    padding-left: 10px;
    padding-right: 20px;
    background: #F5F6F7;
    font-size: 20px;
    font-family: SourceHanSansCN-Normal;
    .header-close{
      i{
        cursor: pointer;
      }
    }
  }
}
::v-deep.usePadding .card{
  height: 100%;
  padding: 0;
}
::v-deep.card-no-border{
  height: 100% !important;
}
.box-external{
  display: flex;
  height: calc(100% - 52px);
  .mail-header-card-row{
    width: 260px;
    height: calc(100%);
    background: #F5F6F7;
    margin-top: 0;
    // display: flex;
    // flex-direction: row-reverse;
    // flex-wrap: wrap;
    .mail-header-card-row-box{
      width: 100%;
      padding: 0 10px;
      .header-card-item{
        width: 100%;
        height: 50px;
        display: block;
        font-family: SourceHanSansCN-Normal;
        border-radius: 6px;
        font-weight: normal;
        font-size: 14px;
        text-align: left;
        display: flex;
        align-items: center;
        margin-top: 10px;
        // background: #F5F6F7;
        img{
          margin-right: 10px;
          margin-left: 15px;
        }
      }
    }
  }
  .flex-column{
    flex: 1;
  }
  .flex-align-center-bottom{
    display: inline-block;
    width: 370px;
    padding-top: 9px;
    padding-bottom: 9px;
    border-top: 1px solid #DEE0E3;
  }
  .flex-align-center{
    display: block;
    .item-label{
      margin-bottom: 10px;
    }
  }
  .sign-form{
    .sign-form-item{
      display: inline-block;
      .bottom-box{
        margin-top: 4px;
        border: 1px solid #DEE0E3;
        box-shadow: 0px 0px 8px rgba(22, 73, 191, 0.05);
        border-radius: 6px;
        width: 370px;
        background: white;
      }
      .item-label{
        margin-bottom: 10px;
        text-align: left;
      }
      .sign-text{
        width: 28px;
        height: 28px;
        background: #EFF0F1;
        display: flex;
        align-items: center;
        justify-content: center;
        float: right;
        border-radius: 6px;
        color: #646A73;
        font-size: 14px;
        margin-left: 20px;
        font-weight: bolder;
      }
    }
  }
}
.el-dialog__wrapper{
  opacity: 1;
  border-radius: 10px 0px 0px 0px;
  background: rgba(15, 22, 51, 0.15);
  // left: 80px;
  // top: 30px;
  ::v-deep.el-dialog{
    box-shadow: 0px 0px 8px rgba(31, 35, 38, 0.08);
    border-radius: 10px;
    .el-dialog__header{
      border-radius: 10px;
      background: #FFFFFF;
      font-family: SourceHanSansCN-Normal;
      .dialog-header-row{
        height: 52px;
        .el-dialog__title{
          line-height: 52px;
          // border-top: 4px solid #3370FF;
        }
      }
    }
  }
}
</style>
