<!--收件箱-->
<template>
  <BasicContainer :useBorder="false">
    <div class="top-label">
      <MailTopHeader headerTitle="收件箱" @refresh="getList" @search="handleSearch"></MailTopHeader>
    </div>
    <MailTopAction :propIsCheckedAll="isCheckedAll"
                   :config="headerConfig"
                   entry="inbox"
                   :mailIds="mailIds"
                   :stress="stress"
                   @refresh="getList"
                   @changeStress="changeStress"
                   @actionCallBack="actionCallBack"
                   @selectAll="selectAll"></MailTopAction>
    <div class="send-sub-header" v-show="unreadNum > 0">
      <div class="count-btn">有 {{ unreadNum }} 封未读</div>
      <div class="mark-btn" @click="handleTagAllRead">全部标记为已读</div>
    </div>
    <avue-crud
      ref="crud"
      class="pager_curd mail_pager_curd"
      :page.sync="page"
      :data="tableData"
      :option="tableOption"
      :table-loading="tableLoading"
      :row-class-name="tableRowClassName"
      @refresh-change='getList'
      @cell-click="cellClick"
      @on-load='getList'
      v-if="tableData.length > 0">
      <template slot="from" slot-scope="scope">
        <div class="flex-align-center">
          <el-checkbox v-model="tableData[scope.row.$index].checked"
                       @change="handleCheckItem(scope.row.$index, $event)"
                       style="margin-right: 15px;"></el-checkbox>
<!--          <img src="@/assets/img/icon/mail.png" class="mail-type-icon" alt="" v-show="scope.row.receipt === 1">-->
          <i class="el-icon-info warningColor" style="margin-right: 5px;" v-show="scope.row.urgent === 1"></i>
          <span class="cursor ellipsis" @click="changeRoute(scope.row)">{{ scope.row.from || '未填写' }}</span>
        </div>
      </template>
      <template slot="stress" slot-scope="scope">
        <span class="mail-flag cursor" @click="handleFlag(scope.row.id, scope.row.stress === 0 ? 2 : 3)">
          <!-- 未标记 -->
          <span class="mail-flag-icon" v-if="scope.row.stress === 0"> <svg-icon :icon-class="'flag'"></svg-icon></span>
          <!-- 已标记 -->
          <span class="mail-flag-icon-active" v-else> <svg-icon :icon-class="'flag_fill'"></svg-icon></span>
        </span>
      </template>
    </avue-crud>
    <div class="flex-center nodataImgContainer" v-loading="tableLoading" v-else-if="tableData.length === 0 && isLoaded">
      <img src="@/assets/img/mail/nodata.png" class="nodataImg"  alt="">
    </div>
    <div class="flex-center nodataImgContainer" v-loading="tableLoading" v-else></div>
  </BasicContainer>
</template>

<script>
import BasicContainer from "@/components/BasicContainer/BasicContainer"
import { mailPageOption, inboxOption, config } from "@/const/dicData"
import MailTopHeader from "@/views/mail/components/MailTopHeader"
import MailTopAction from "@/views/mail/components/MailTopAction"
import { acceptMail, getMailList, postTagMail, tagAllRead } from "@/api/mail"
import { mapState } from "vuex"

export default {
  name: "inbox",
  components: {
    BasicContainer,
    MailTopAction,
    MailTopHeader
  },
  data() {
    return {
      showDev: config.showDev,
      headerConfig: {
        qx: true,
        sc: true,
        cdsc: true,
        zf: true,
        bjw: true,
        ydd: true,
        flag: true
      },
      page: JSON.parse(JSON.stringify(mailPageOption)),
      tableData: [],
      tableOption: inboxOption,
      tableLoading: true,
      isCheckedAll: false,
      subject: '', // 搜索
      stress: 0, // 是否强调 [0, 不强调， 1： 强调]
      unreadNum: 0,
      isLoaded: false,
    }
  },
  computed: {
    ...mapState({
      mailConfigId: state => state.app.mailConfigId
    }),
    getWsMsg() {
      return this.$store.state.socket.socketMsg
    },
    // 选中id
    mailIds() {
      const arr = []
      this.tableData.forEach(item => {
        if (item.checked) {
          arr.push(item.id)
        }
      })
      return arr
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList(page) {
      page = page || this.page
      this.tableLoading = true
      const query = {
        subject: this.subject,
        configId: this.mailConfigId,
        groupId: '1',
        current: page.currentPage,
        size: page.pageSize
      }
      // 是否强调
      if (this.stress === 1) {
        query.stress = 1
      }
      getMailList(query)
        .then(res => {
          if (res.data.code === 200) {
            const { page, unreadNum } = res.data.data
            const { records, pages, size, total } = page
            records.forEach(item => {
              item.checked = false
            })
            this.tableData = records
            this.page.total = total
            this.isCheckedAll = false
            this.unreadNum = unreadNum
            this.$emit('changeMailTotal')
          }
        }).finally(() => {
          this.tableLoading = false
          this.isLoaded = true
      })
    },
    changeStress() {
      this.stress = this.stress === 0 ? 1 : 0
      this.getList()
    },
    handleAcceptMail() {
      acceptMail().then(res => {
        if (res.data.code === 200) {

        }
      })
    },
    // 搜索
    handleSearch(k) {
      this.subject = k
      this.page.currentPage = 1
      this.getList()
    },
    // 单元格点击
    cellClick(row, column, cell, event) {
      if (column.property === 'subject') {
        this.changeRoute(row)
      }
    },
    // 全选
    selectAll(isAll) {
      this.isCheckedAll = isAll
      this.tableData.forEach(item => {
        item.checked = isAll
      })
    },
    /**
     * 标记单个
     * @param tag {Number} 2 红旗邮件, 3 取消红旗
     * */
    handleFlag(mailId, tag) {
      const data = {
        mailIds: String(mailId),
        tag
      }
      postTagMail(data).then(res => {
        if (res.data.code === 200) {
          this.getList()
        }
      })
    },
    // 单选
    handleCheckItem(index, checked) {
      // 点box的 change
      if (typeof checked === 'boolean') {
        this.tableData[index].checked = checked
      } else {
        this.tableData[index].checked = !this.tableData[index].checked
      }
      this.isCheckedAll = this.tableData.every(item => item.checked)
    },
    // 路由切换
    changeRoute({ id = '' }) {
      this.$emit('changeRoute', { routerName: 'mailDetail', id })
    },
    // 选中高亮
    tableRowClassName({ row, rowIndex }) {
      let classStr = ''
      if (row.checked) {
        classStr += ' highLight-row'
      }
      if (row.rend === 0) {
        classStr += ' unRead-highLight-row'
      }
      return classStr
    },
    // action回调
    actionCallBack(args) {
      this.$emit('changeRoute', args)
    },
    // 全部标记已读
    handleTagAllRead() {
      this.$msgbox({
        title: '提示',
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <i class="innerIcon el-icon-info info-icon"></i>
              <span class="innerTitle">确认全部标记为已读？</span>
            </div>
           <div class="innerTip"></div>
          </div>
          `,
        dangerouslyUseHTMLString: true,
        customClass: 'customMsgBox',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: 'confirmBtn confirmButton',
        cancelButtonText: '取消',
        cancelButtonClass: 'confirmBtn cancelButton',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'

            tagAllRead().then(res => {
              if (res.data.code === 200) {
                this.$message.success('全部标记为已读成功')
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
    }
  },
  watch: {
    getWsMsg: {
      handler(msg) {
        // 拉取成功
        if (msg.type === 'syncSuccess' && msg.data) {
          this.getList()
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>
