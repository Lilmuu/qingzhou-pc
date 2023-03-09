<template>
  <div class="main-view-container" v-if="isMailLogin && isLoaded">
    <div class="left-container noScroll" v-if="mailboxSettings">
      <div class="setting-btn-container flex-center">
        <div class="setting-btn">
          邮箱
          <div class="setting_icon">
            <img src="@/assets/img/icon/mail/setMail.png" alt="" class=" cursor" @click="handleMenuRouterClick(mailConfigId, 'setting')">
          </div>
        </div>
      </div>
      <div class="mailSearchInput__out">
          <div class="mailSearchInput__prepend flex-center"><i class="el-icon-search"></i></div>
          <input class="mailSearchInput"
                 :class="mailSearchInputClass"
                 @input="handleSearch"
                 v-model="searchSubject" type="text" placeholder="搜索" @focus='handleSearchFocus' @blur="handleSearchBlur">
        </div>
      <el-scrollbar class="noScroll" style="height: calc(100vh - 155px);">
        <div v-for="(item, index) in userMailList" :key="'userMailList' + index" class="user-mail-Collapse">
          <div @click="handleChangeMail(item.id)" class="user-mail-Collapse-head cursor">
            <img src="@/assets/img/mail/icon-caret.png" class="iconCaretImg" :class="isCollapseActive(item.id) ? 'activeIconCaretImg' : ''" />
            <span class="user-mail-text ellipsis">{{ item.username }}</span>
            <img @click.stop="handleSyncMail(item.id, item.username,'shoudong')" src="@/assets/img/mail/refresh.png" style="height:14px;width:14px;"/>
          </div>
          <el-collapse-transition>
            <div v-show="isCollapseActive(item.id, item.username)">
              <div class="header-action flex-space-around cursor">
                <div class="header-action-b">
                  <div @click="handleToWriteMail(item.id)" class="header-action-item2 cursor flex-center">
                    <!-- <img src="@/assets/img/icon/mail/writeMail.png" class="mail-header-action-icon" alt="" style="width: 14px;"> -->
                    <img src="@/assets/img/mail/edit-outline.png"/>
                    <span>写邮件</span>
                  </div>
                  <!-- <div @click="handleSyncMail(item.id, item.username)" class="header-action-item1 cursor flex-center">
                    <img src="@/assets/img/icon/mail/getmail.png" class="mail-header-action-icon" alt="" style="width: 16px;">
                    <span>收取</span>
                  </div> -->
                </div>
              </div>
              <div :class="index === userMailList.length - 1 ? 'menu-outer user-mail-Collapse-last' : 'menu-outer'">
                <!-- 邮箱项目 -->
                <li @click="handleMenuRouterClick(item.id, router.path, router.groupId)"
                    role="menuitem"
                    tabindex="-1"
                    :class="['el-menu-item el-menu-item-li', isCurrentRoute(activeName, router, activeId, item) ? 'el-menu-item-li_active menu_item_border_active' : 'menu_item_border' ]"
                    v-for="(router, index) in routerLists"
                    :key="'routerlist' + index"
                    style="margin-bottom:2px;">
                  <div :class="['flex-center', isCurrentRoute(activeName, router, activeId, item) ? 'menu-item-active' : '']">
                  <span :class="['menu_item_icon_container flex-center', isCurrentRoute(activeName, router, activeId, item) ? 'menu_item_icon_container_active' : '']">
                    <img :style="{width: `${isCurrentRoute(activeName, router, activeId, item) ? 14 : 15}px`}" :src="isCurrentRoute(activeName, router, activeId, item) ? router.activeIcon : router.icon" alt="">
                  </span>
                    <span class="menu-text">{{ router.title }}<span :class="router.show && item.unreadCount > 0 ?'mane-text-right':''"><span>{{ router.show && item.unreadCount > 0 ? `${item.unreadCount}` : `` }}</span></span></span>
                  </div>
                </li>
                
                <!-- 新建文件夹 -->
                <li role="menuitem"
                    tabindex="-1"
                    :class="['el-menu-item el-menu-item-li', 'menu_item_border','fileFolder' ]"
                    :key="'routerlistnew'"
                    style="padding-right: 8px;padding-left: 0px;margin-top:20px"
                    >
                    <div @click="handleChangeMail(item.directoryList)" class="user-mail-Collapse-head cursor" style="margin-left:0;margin-top:0;width:100%;">
                      <img src="@/assets/img/mail/icon-caret.png" class="iconCaretImg" :class="isCollapseActive(item.directoryList) ? 'activeIconCaretImg' : ''" />
                      <span class="user-mail-text ellipsis" style="width:100%">
                        <div :class="['flex-center']">
                          <span class="menu-text mail-menu-text ellipsis" style="margin-left:0">文件夹</span>
                          <i class="el-icon-plus" @click.stop="handleOpenDialog(item.id,'新建')" style="font-weight: bold;"></i>
                        </div>
                      </span>
                    </div>
                </li>
                <!-- 文件夹列表  -->
                <li role="menuitem"
                    tabindex="-1"
                    v-show="isCollapseActive(item.directoryList, item.username)"
                    :class="['el-menu-item el-menu-item-li', directoryActiveId === router.id ? 'el-menu-item-li_active menu_item_border_active' : 'menu_item_border' ]"
                    v-for="(router, index) in item.directoryList"
                    :key="'routerlist' + item.id + router.id"
                    style="margin-bottom:2px;">
                  <div :class="['flex-center', directoryActiveId === router.id ? 'menu-item-active' : '']">
                  <span @click="handleDirRouterClick(item.id, router)"
                        :class="['menu_item_icon_container flex-center', directoryActiveId === router.id ? 'menu_item_icon_container_active' : '']">
                    <img :style="{width: `${directoryActiveId === router.id ? 14 : 15}px`}"
                         :src="directoryActiveId === router.id ? dirIcon.activeIcon : dirIcon.icon" alt="">
                  </span>
                    <span @click="handleDirRouterClick(item.id, router)"  class="menu-text mail-menu-text ellipsis">{{ router.title }}</span>
                    <!-- <span class="menu-del-action" @click="handleOpenDialog(item.id, '编辑',router.id, router.title)">
                      <img :style="{width: `${directoryActiveId === router.id ? 14 : 15}px`}"
                         :src="directoryActiveId === router.id ? dirIcon.compileActiveIcon : dirIcon.compileIcon" alt="">
                    </span>
                    <span class="menu-del-action" @click="handleDelFolder(item.id, router.id, router.title)">
                      <img :style="{width: `${directoryActiveId === router.id ? 14 : 15}px`}"
                         :src="directoryActiveId === router.id ? dirIcon.delActiveIcon : dirIcon.delIcon" alt="">
                    </span> -->
                    <el-popover
                      placement="bottom-start"
                      width="112"
                      trigger="hover"
                      popper-class="customPopover">
                      <P class="popoverItems" @click="handleOpenDialog(item.id, '编辑',router.id, router.title)">
                        <img src="@/assets/img/mail/editFile.png" />
                        <span>编辑文件夹</span>
                      </P>
                      <P  class="popoverItems" @click="handleDelFolder(item.id, router.id, router.title)">
                        <img src="@/assets/img/mail/deleteFile.png" />
                        <span>删除文件夹</span>
                      </P>
                      <img slot="reference" class="menu-del-action" src="@/assets/img/mail/moreIcon.png"  style="width:14px;height:14px;"/>
                    </el-popover>
                  </div>
                </li>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </el-scrollbar>
    </div>
    <!-- 时间列表   -->
    <div class="mailTimeListContainer" v-if="activeName !== 'setting'&&activeName !== 'writeMail'">
      <div class="mailListRow">
        <div class="emptyTimeMail timeMailScroll flex-center" v-if="mailList.length === 0">
          <span class="emptyTimeMailText">无内容</span>
        </div>
        <el-scrollbar class="noScroll timeMailScroll" v-else>
          <div class="mailListRowItem" v-for="(row, index) in mailList" :key="'row' + index">
            <!-- 时间段 -->
            <div @click="handleChangeMail(row.title)" class="user-mail-Collapse-head cursor">
              <div class="mailRowTitle">
                <div class="mailRowSubjectText ellipsis">
                  <span style="flex:1">{{ row.title }}（{{row.list.length>99?'99+':row.list.length}}）</span>
                  <i :class="isCollapseActive(row.title) ? 'user-mail-Collapse-icon el-icon-arrow-up' : 'user-mail-Collapse-icon el-icon-arrow-down'" style="float:right;height:100%"></i>
                </div>
              </div>
            </div>
            <!-- 列表 -->
            <div v-for="(item, index2) in row.list"
                 @click="changeRoute({routerName: 'mailDetail', id: item.id})"
                 class="mailRowInner cursor"
                  v-show="isCollapseActive(row.title, item.username)"
                 :key="'list' + item + index2">
                 <div class="mailRowInner_xian">
                  <div class="mailRowInner_wai" :class="['mailRowInner cursor',activeMailDetailId === item.id ? 'active' : '']">
                    <div class="mailRowInnerOne">
                      <div class="unreadFlag" v-if="(item.rend!=1&&item.groupId==1)||(item.rend!=1&&item.groupId==5)"></div>
                      <div :class="['mailRowInnerTitle ellipsis', item.rend === 1 && showUnReadHightLight ? 'hasRead-mail-highLight-row' : '']">
                        <span v-if="item.groupId==2" class="spanGroupId">[草稿]</span>
                        <span :class="['ellipsis', item.rend === 0 && showHightLight ? 'unRead-mail-highLight-row' : '']" style="color:black">{{ item.from || '未填写' }}</span>
                      </div>
                      <div class="mainRowDate">{{ item.sentDate | renderCloDate }}</div>
                    </div>
                    <div class="mailRowSubject ellipsis">
                      <span class="mailRowSubjectText ellipsis"><i class="el-icon-info warningColor" style="margin-right: 5px;font-size: 14px;" v-show="showWarningIcon && item.urgent === 1"></i>{{ item.subject }}</span>
                      <div class="cursor icon-mail-flag"
                            style=""
                            @click.stop="handleFlag(item.id, item.stress === 0 ? 2 : 3)">
                          <div :class="item.stress === 1 ? 'm-header-flag-icon-active' : 'm-header-flag-icon'">
                            <svg-icon :icon-class="item.stress === 1 ? 'mail_flag_fill' : 'mail_flag'"></svg-icon>
                          </div>
                        </div>
                    </div>
                    
                  </div>
                 </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <!-- 路由  -->
    <div class="right-container mail-container">
      <!--邮件详情-->
      <MailDetail v-if="detailMode && activeMailDetailId && routeParams.id"
        :detailEntry="detailEntry"
        :Xquery="Xquery"
        :allMailId="allMailId"
        @changeMailTotal="changeMailTotal"
        @refresh="refreshCb"
        @cacheFun='cacheFun'
        :key="detailEntry + activeMailDetailId"
        :params="routeParams"
        @changeRoute="changeRoute"></MailDetail>
      <MailEmpty v-else-if="detailMode && activeMailDetailId === ''"></MailEmpty>
      <div v-else>
        <!--设置-->
        <Setting @changeRoute="changeRoute" v-if="activeName === 'setting'"></Setting>
      </div>
      <WriteMail ref="writeMail" @changeRoute="changeRoute" :params="routeParams" v-if="showWriteMail" :key="'writeMail' + activeId" :showWriteMail="showWriteMail" @closeMailModal="closeMailModal"></WriteMail>
    </div>
    <!-- 新建文件夹  -->
    <el-dialog append-to-body
               :visible.sync='folderDialog'
               :before-close="handleFolderDialogCancel"
               width="520px"
               :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title">{{title}}文件夹</span>
      </div>
      <div class="flex-column-center">
        <!-- <img src="@/assets/img/mail/folder.png" class="drafts-img" alt=""> -->
        <div class="flex-align-center" style="margin-top: 34px;">
          <div class="item-label" style="width: 100%;">文件名称</div>
          <el-input v-model="folderName"
                    maxlength="10"
                    clearable
                    size="mini"
                    placeholder="请输入文件夹名称"></el-input>
        </div>
      </div>
      <div class=" right" style="margin-top: 70px;height:32px">
        <div class="flex-center" style="float:right">
          <div class="mail-btn flex-center cancel"@click="cancelClick">取消</div>
          <div @click="handleFolderSubmit" class="mail-btn flex-center mail-btn-primary">{{title=='编辑'?'立即更改':'立即创建'}}</div>
        </div>
      </div>
    </el-dialog>
    <!-- 拉取邮件进度dialog  -->
    <el-dialog append-to-body
               class="syncDialog"
               width="400px"
               :visible.sync='syncDialog'>
      <div slot="title" class="dialog-header-row">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title ellipsis">{{syncMailName}}</span>
      </div>
      <div class="syncContainer">
        <div class="syncIconOuter flex-center">
          <img src="@/assets/img/mail/syncicon.png" class="syncIcon" alt="">
        </div>
        <div style="padding: 0 15px;width: 100%;">
          <div style="margin-bottom: 10px;">正在拉取邮件({{ syncCurrent }}/{{ syncTotal }})</div>
          <el-progress :percentage="syncPercent" v-if="syncPercent > 0"></el-progress>
        </div>
      </div>
    </el-dialog>
  </div>
  <!-- 登录邮箱 -->
  <MailLogin @success="handleCheckIsFirstLogin" v-else-if="userMailList.length === 0 && isUserMailListLoaded"></MailLogin>
  <div v-else></div>
</template>

<script>
import WriteMail from "@/views/mail/writeMail"
import MailDetail from "@/views/mail/mailDetail"
import Setting from "@/views/mail/setting"
import MailLogin from "@/views/mail/mailLogin"
import MailEmpty from "@/views/mail/mailEmpty"
import {
  getQueryGroup,
  addGroup,
  businessUpdateGroupName,
  delGroup,
  getMailDetails,
  isFirstLogin,
  getMailConfigList,
  queryUnreadCount, 
  getMailList, 
  postTagMail,
  mailUnreadCount,
  businessCheckMailConfig
} from "@/api/mail"

import { hasBlank } from "@/utils/validate"
import { mapState } from "vuex"
import EventBus from '@/eventBus'

export default {
  name: "mailLayout",
  components: {
    WriteMail,
    MailDetail,
    Setting,
    MailLogin,
    MailEmpty,
  },
  data() {
    return {
      // 是否登录邮箱
      isMailLogin: false,
      isUserMailListLoaded: false,
      isLoaded: false,
      activeName: 'inbox',
      folderDialog: false,
      routerLists: [
        { path: 'inbox', groupId: '1', title: '收件箱', show: true, icon: require('@/assets/img/icon/mail/inbox.png'), activeIcon: require('@/assets/img/icon/mail/inbox_active.png') },
        { path: 'flag', groupId: '100', title: '旗标邮件', show: false, icon: require('@/assets/img/icon/mail/flag.png'), activeIcon: require('@/assets/img/icon/mail/flag_active.png') },
        { path: 'drafts', groupId: '2', title: '草稿箱', show: false, icon: require('@/assets/img/icon/mail/drafts.png'), activeIcon: require('@/assets/img/icon/mail/drafts_active.png') },
        { path: 'sentMail', groupId: '3', title: '已发送', show: false, icon: require('@/assets/img/icon/mail/sentMail.png'), activeIcon: require('@/assets/img/icon/mail/sentMail_active.png') },
        { path: 'deletedMail', groupId: '4', title: '已删除', show: false, icon: require('@/assets/img/icon/mail/deletedMail.png'), activeIcon: require('@/assets/img/icon/mail/deletedMail_active.png') },
        { path: 'spamMail', groupId: '5', title: '垃圾邮件', show: false, icon: require('@/assets/img/icon/mail/spamMail.png'), activeIcon: require('@/assets/img/icon/mail/spamMail_active.png') }
        // { path: 'mailDetail', title: '邮件详情', count: 0, show: false, icon: require('@/assets/img/icon/myFollow.png'), activeIcon: require('@/assets/img/icon/myFollow_active.png') }
      ],
      directoryActiveId: '',
      directoryList: new Map(),
      activeId: '', // 活动id，一点击就直接赋值
      selectId: '',
      detailMode: true,
      detailEntry: '',
      folderName: '',
      routeParams: {}, // 路由参数
      directoryRouterParams: {}, // 文件夹路由参数
      userMailList: [],
      userMailListDropDownList: [],
      activeUserMail: '',
      collapseActive: [], // 活动collapse
      dirIcon: {
        icon: require('@/assets/img/icon/mail/dir.png'),
        activeIcon: require('@/assets/img/icon/mail/dir_active.png'),
        delIcon: require('@/assets/img/icon/mail/del.png'),
        delActiveIcon: require('@/assets/img/icon/mail/del_active.png'),
        compileIcon: require('@/assets/img/icon/mail/compile.png'),
        compileActiveIcon: require('@/assets/img/icon/mail/compile_active.png'),
      },
      stress: 0,
      searchSubject: '',
      mailList: [],
      activeMailDetailId: '', // 详情activeId
      showWriteMail: false,
      groupId: '',  // 分组id
      syncDialog: false,
      syncMailName: '',
      syncPercent: 0,
      syncTotal: 0,
      syncCurrent: 0,
      allMailId:[],
      mailInfoquery:{},
      Xquery:{},
      newFolder:[],
      title:'',
      ids:'',
      itit:'',
      indexNewFolder:0,
      mailboxSettings:true,
      omitPopout:false,
      mailSearchInputClass:'',
      searchSubjectOld:'',
      timer:null, //定时器名称
      waydata:'',
      Newtitle:'',
      setreadyState:''
    }
  },
  mounted() {
    console.log(this.SetNewMailMessage,'joiqwjeoqwjeoi')
    this.$store.dispatch('WSINIT')
    this.handleCheckIsFirstLogin()
    EventBus.$on('handleCheckIsFirstLogin', target => {
      this.handleReset()
    });
    EventBus.$on('refresh', target => {
      this.refreshCb()
    })
    EventBus.$on('moveMailRefresh', target => {
      this.showWriteMail = false
      this.detailMode = true
      this.activeMailDetailId = ''
      this.routeParams = {}
    })
    this.handleSyncMail()
    // this.timer = setInterval(() => {
    //   // for(let i=0;i<this.userMailList.length;i++){
    //   //   this.handleSyncMail(this.userMailList[i].id,this.userMailList[i].username,'zidong')
    //   //   this.waydata='zidong'
    //   // }
    //   //   console.log('uiashdiad')
    //   //   this.handleCheckIsFirstLogin()
    //   if(window.localStorage.getItem('message')=='1'){

    //     this.Newtitle=window.localStorage.getItem('message')
    //   }
    //   console.log(this.Newtitle,'ashohqowe')
    // }, 1000*5)
    //  let data = {
    //       type: 'syncEmail',
    //       data: {
    //         event: 'handleSyncMail'
    //       }
    //     }
    //   this.$store.dispatch('handleSend', data)
    this.handleGetUserMailList()
      getMailConfigList().then(res => {
        this.userMailList=res.data.data
        for(let i=0;i<this.userMailList.length;i++){
          this.handleQueryUnreadCount(this.userMailList[i].id)
        }
      })
    //  this.changeMailTotal()
  },
  computed: {
    ...mapState({
      mailConfigId: state => state.app.mailConfigId,
      mailContInfo: state =>state.app.mailContInfo, // 邮件内容缓存数据
      SetNewMailMessage: state =>state.Im.Information.SetNewMailMessage,
      readyState: state =>state.Im.Information.readyState,
    }),
    getWsMsg() {
      return this.$store.state.socket.socketMsg
    },
    // 判断是否显示紧急图标
    showWarningIcon() {
      return this.activeName !== 'drafts'
    },
    // 判断是否显示紧急图标
    showHightLight() {
      return ['inbox', 'directory'].includes(this.activeName)
    },
    // 显示未读
    showUnReadHightLight() {
      return ['inbox', 'directory'].includes(this.activeName)
    }
  },
  beforeRouteLeave(to, from, next) {
    next()
    if(this.timer){
      clearInterval(this.timer)
      this.timer=null
      console.log(this.timer,'sadoijaoidas')
    }
  },
  methods: {
    handleSearchFocus(){
      this.mailSearchInputClass='mailSearchInputClassdian'
    },
    handleSearchBlur(){
      this.mailSearchInputClass=''
    },
    omitClick(){
      this.omitPopout=true
    },
    handleChangenewFolder(index){
      this.newFolder[index]=!this.newFolder[index]
      this.indexNewFolder=index
      console.log(this.newFolder)
    },
    // 重置
    handleReset() {
      Object.assign(this.$data, this.$options.data())
      this.handleCheckIsFirstLogin()
    },
    // 用户列表
    handleGetUserMailList() {
      this.userMailListDropDownList = []
      this.isUserMailListLoaded = false
      getMailConfigList().then(res => {
        if (res.data.code === 200) {
          const configId = res.data.data[0].id
          localStorage.setItem('mailConfigId', configId)
          this.$store.dispatch('SetMailConfigId', configId)
          this.userMailListDropDownList.push({ label: '全部账号', value: -1 })
          res.data.data.forEach(item => {
            item.unreadCount = 0
            item.directoryList = []
            this.userMailListDropDownList.push({ label: item.username, value: item.id })
          })
          this.userMailList = res.data.data
          console.log(this.userMailList,3333333333)
            for(let i=0;i<this.userMailList.length;i++){
              this.newFolder.push(false)
              this.$forceUpdate()
            }
          // 展开第一个
          this.collapseActive = [configId]
          // 获取第一个未读
          this.handleQueryUnreadCount(configId)
          this.activeId = configId
          this.isMailLogin = true
          this.groupId = '1'
          this.getList('1', configId)
          this.getDetailById()
          this.initWriteMail()
          this.setDirectoryListById()
        }
      }).finally(() => {
        this.isUserMailListLoaded = true
      })
    },
    // 通过router显示邮件详情的
    getDetailById() {
      // 初始化
      const initId = this.$route.query.initId || ''
      if(initId) {
        const initRouter = {
          id: initId,
          routerName: 'mailDetail'
        }
        setTimeout(() => {
          this.changeRoute(initRouter)
        }, 1000)
      }
    },
    // 初始化从外部点击进来写邮件的 ?initMail=xxx&action=initWriteMail
    initWriteMail() {
      const routerQuery = this.$route.query
      if (routerQuery.initMail && routerQuery.action === 'initWriteMail') {
        const id = this.userMailList[0].id
        localStorage.setItem('mailConfigId', id)
        this.$store.dispatch('SetMailConfigId', id)
        this.routeParams = {
          initMail: routerQuery.initMail,
          action: 'initWriteMail'
        }
        this.detailMode = false
        this.showWriteMail = true
        this.refreshCb()
      }
    },
    // 同步
    handleSyncMail(configId, mailName,way) {
      let data = {}
      // 全部
      if(configId === -1) {
        data = {
          type: 'syncEmail',
          data: {
            event: 'handleSyncMail'
          }
        }
      } else {
        // 单个
        data = {
          type: 'syncEmail',
          data: {
            configId,
          }
        }
      }
      this.syncMailName = mailName
      this.$store.dispatch('handleSend', data)
      // console.log(this.setreadyState,'ihuasdhiqw')
      if(this.readyState==1){
        if(way=='shoudong'){
          businessCheckMailConfig().then(res => {
            if(res.data.code==0){
              this.syncDialog = true
              this.waydata='shoudong'
              this.$message.success(res.data.data)
  
            }
          })
        }
      }else{
        this.$store.dispatch('handleSend', data)
      }
    },
    isCollapseActive(id) {
      // console.log(id)
      return this.collapseActive.includes(id)
    },
    // list
    getList(groupId = '1', mailConfigId) {
      this.tableLoading = true
      let list = []
      const query = {
        subject: this.searchSubject,
        configId: mailConfigId,
        groupId,
      }
      // 是否强调
      if (this.stress === 1) {
        query.stress = 1
      }
      // console.log(this.mailContInfo,'邮件内容缓存数据 --------')
      // console.log(query,'获取所有邮件列表 - 参数 -------- query')
      this.Xquery = query
      getMailList(query)
        .then(res => {
          if (res.data.code === 200) {
            this.mailInfoquery = query
            const {thisMonth = [], LastMonth = [], earlier = []} = res.data.data
            list.push({title: '本月', list: thisMonth})
            list.push({title: '上月', list: LastMonth})
            list.push({title: '更早', list: earlier})
            this.mailList = list
            
            this.allMailId = this.getMailIdAll(list)
            // this.$store.commit('SET_MAILCONTINFO', mailInfoquery)
            // console.log(this.mailList,'获取所有邮件列表 -------- this.mailList')
          }
        }).finally(() => {
        this.tableLoading = false
        this.isLoaded = true
      })
    },
    // 查询某个邮箱未读
    handleQueryUnreadCount(id) {
      const query = {
        groupId: '1',
        mailConfigId: id
      }
      queryUnreadCount(query).then(res => {
        if(res.data.code === 200) {
          const unreadCount = res.data.data
          this.userMailList.forEach(item => {
            if(item.id === id) {
              item.unreadCount = unreadCount
            }
          console.log(item.unreadCount,'hwdjkqwijek')
          })
        }
      })
    },
    // 查看邮箱后-获取未读消息
    seeMailUnreadCount(id,menu) {
      console.log(menu,'asdweqwedsacasd')
      if(this.routeParams.id){
        if(menu==undefined|| menu.action!='bjw'){
          mailUnreadCount(this.routeParams.id).then(res => {
            if(res.data.code === 0) {
              this.handleQueryUnreadCount(id)
            }
          })
        }
      }
    },
    // 判断是否为第一次登录
    handleCheckIsFirstLogin() {
      isFirstLogin().then(res => {
        if (res.data.code === 200) {
          this.isLoaded = true
          // 是否已近绑定邮箱
          if (res.data.data === true) {
            this.handleGetUserMailList()
            
          } else {
            this.isUserMailListLoaded = true
          }
        }
      })
    },
    // 新建文件夹
    handleOpenDialog(id,tit,ids,itit) {
      console.log(id,tit,ids,itit)
      this.selectId = id
      this.title=tit
      this.ids=ids
      this.itit=itit
      this.folderName=itit
      this.folderDialog = true
    },
    // 设置dir, 获取文件夹列表
    setDirectoryListById(id) {
      id = id || this.activeId
      const dirArr = []
      const query = {
        mailConfigId: id
      }
      getQueryGroup(query).then(res => {
        if (res.data.code === 200) {
          res.data.data.forEach(item => {
            dirArr.push({
              id: item.id,
              path: `inbox${item.id}`,
              title: item.groupName,
            })
          })
          this.userMailList.forEach(item => {
            if(item.id === id) {
              item.directoryList = dirArr
            }
          })
        }
      })
    },
    changeMailTotal(menu) {
      console.log(this.activeId,'iowqjeoqjio')
      this.seeMailUnreadCount(this.activeId,menu)
    },
    refreshCb() {
      const groupId = this.groupId
      const id = this.activeId
      if (groupId && id) {
        this.getList(groupId, id)
      }
    },
    // 点击展开，更换邮箱
    handleChangeMail(id) {
      console.log(id,'点击展开，更换邮箱')
      if(this.collapseActive.includes(id)) {
        this.collapseActive = this.collapseActive.filter(item => item !== id)
      } else {
        // this.handleQueryUnreadCount(id)
        this.collapseActive.push(id)
      }
      // 添加
      if(!this.directoryList[id]) {
        this.setDirectoryListById(id)
      }
    },
    handleMenuRouterClick(id, path, groupId) {
      console.log(id, path, groupId)
      this.activeId = id
      localStorage.setItem('mailConfigId', id)
      this.$store.dispatch('SetMailConfigId', id)
      this.searchSubject = ''
      groupId==100?this.stress=1:this.stress = 0
      groupId==100?groupId=1:''
      // console.log(groupId,this.stress)
      
      if (groupId) {
        this.groupId = groupId
      }
      // 相同路由 不切换
      // if (this.showWriteMail && path === 'writeMail') return
      // 当前为路由为writeMail 且 还没有保存的情况下进行提示
        // console.log(this.mailboxSettings,12312312312344)
      if (path === 'setting') {
        this.mailboxSettings=false
        
      }
      if (this.showWriteMail && this.$refs.writeMail.isSaved === false) {
        this.handleShowSaveMsgBox((result) => {
          if (result === 'success' || result === 'cancel') {
            this.activeName = path
            // if(this.showWriteMail) {
            //
            // } else {
            //   this.directoryActiveId = ''
            // }
            this.activeMailDetailId = ''
            if (path === 'setting') {
              this.detailMode = false
            } else {
              this.detailMode = true
            }
            this.showWriteMail = false
            this.directoryActiveId = ''
            this.routeParams = {}
            this.refreshCb()
          }
        })
        return
      }
      if (path === 'setting') {
        this.detailMode = false
      } else {
        this.detailMode = true
      }
      this.activeName = path
      this.showWriteMail = false
      this.directoryActiveId = ''
      this.activeMailDetailId = ''
      this.getList(groupId, id)
      this.routeParams = {}
    },
    // 写邮件
    handleToWriteMail(id) {
      // this.activeName='writeMail'
      // console.log(this.activeName)
      // 跳转提醒
      if (this.showWriteMail && this.$refs.writeMail.isSaved === false) {
        this.handleShowSaveMsgBox((result) => {
          if (result === 'success' || result === 'cancel') {
            this.showWriteMail = false
            this.directoryActiveId = ''
            this.routeParams = {}
            setTimeout(() => {
              localStorage.setItem('mailConfigId', id)
              this.$store.dispatch('SetMailConfigId', id)
              this.showWriteMail = true
            }, 1000)
            this.refreshCb()
          }
        })
        return
      }
      localStorage.setItem('mailConfigId', id)
      this.$store.dispatch('SetMailConfigId', id)
      this.routeParams = {}
      // this.detailMode = false
      this.showWriteMail = true
      this.refreshCb()
    },
    handleDirRouterClick(configId, router) {
      this.activeId = configId
      this.groupId = router.id
      localStorage.setItem('mailConfigId', configId)
      this.$store.dispatch('SetMailConfigId', configId)
      this.searchSubject = ''
      this.stress = 0
      // 跳转提醒
      if (this.showWriteMail && this.$refs.writeMail.isSaved === false) {
        this.handleShowSaveMsgBox((result) => {
          if (result === 'success' || result === 'cancel') {
            this.directoryActiveId = router.id
            this.activeName = 'directory'
            this.detailMode = true
            this.showWriteMail = false
            this.activeMailDetailId = ''
            this.directoryRouterParams = {
              id: router.id,
              title: router.title
            }
            this.refreshCb()
          }
        })
        return
      }
      this.directoryActiveId = router.id
      this.activeMailDetailId = ''
      this.activeName = 'directory'
      this.showWriteMail = false
      this.detailMode = true
      this.directoryRouterParams = {
        id: router.id,
        title: router.title
      }
      this.getList(router.id, configId)
    },
    // 添加成功回调
    successCb() {
      const activeName = this.activeName
      this.folderDialog = false
      // 添加成功后自动刷新
      if (this.$refs[`${activeName}`]) {
        this.$refs[`${activeName}`].getList()
      }
    },

    // 活动router
    isCurrentRoute(activeName, router, activeId, item) {
      // console.log(activeName, router, activeId, item,123)
      return activeName === router.path && activeId === item.id
    },

    // 保存草稿提醒
    handleShowSaveMsgBox(cb) {
      this.$msgbox({
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">是否要将此邮件存为草稿？</span>
            </div>
           <div class="innerTip"></div>
          </div>
          `,
        dangerouslyUseHTMLString: true,
        customClass: 'customMsgBox',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: 'confirmBtn ',
        cancelButtonText: '取消',
        showClose	:false,
        cancelButtonClass: 'confirmBtn cancelButton',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'

            this.$refs.writeMail.handleSendMail('save', (result) => {
              if (result === 'success') {
                done()
                instance.confirmButtonLoading = false
                cb('success')
              } else if (result === 'failed') {
                done()
                instance.confirmButtonLoading = false
                instance.confirmButtonText = '确定'
              }
            })
          } else if(action === 'cancel') {
            cb('cancel')
            done()
          }
        }
      }).then(action => {
      }).catch(e => {})
    },
    closeMailModal(data){
      if(data == 'send'){
        this.showWriteMail = false
        return
      }
      if (this.showWriteMail && (this.$refs.writeMail.isSaved === false || this.$refs.writeMail.form.toArr.length || this.$refs.writeMail.form.ccListArr.length || this.$refs.writeMail.form.bccListArr.length || this.$refs.writeMail.form.toFbfsArr.length || this.$refs.writeMail.form.subject || this.$refs.writeMail.form.multipartFiles.length)) {
        this.handleShowSaveMsgBox((result) => {
          if (result === 'success' || result === 'cancel') {
            this.showWriteMail = false
            this.refreshCb()
          }
        })
      }else{
        this.showWriteMail = false
      }
    },
    // 更改页面
    async changeRoute(router) {
      console.log('跳转的router 信息 --------- router',router)
      console.log('所有邮件信息 --------- this.allMailId',this.allMailId)
      const groupId = this.groupId
      const configId = this.mailConfigId
      // 如果 routerName为空，默认传当前选中的菜单
      router.routerName = router.routerName || this.activeName
      if (router.routerName === 'mailDetail') {
        // 跳转提醒
        console.log('this.showWriteMail',this.showWriteMail)
        console.log('this.$refs.writeMail',this.$refs.writeMail)
        if (this.showWriteMail && this.$refs.writeMail.isSaved === false) {
          await this.handleShowSaveMsgBox((result) => {
            if (result === 'success' || result === 'cancel') {
              this.directoryActiveId = router.id
              // this.activeName = 'directory'
              this.detailMode = true
              this.showWriteMail = false
              this.activeMailDetailId = router.id
              this.directoryRouterParams = {
                id: router.id,
                title: router.title
              }
              this.refreshCb()
            }
          })
          return
        }
        this.detailMode = true
        this.detailEntry = this.activeName
        this.activeMailDetailId = router.id
        this.showWriteMail = false
      } else {
        if (router.routerName === 'writeMail') {
          this.detailMode = true
          this.showWriteMail = true
        } else {
          this.activeName = router.routerName
          this.activeMailDetailId = ''
        }
      }
      this.routeParams = router
      await this.getList(groupId, configId)
      // await this.handleQueryUnreadCount(router.id)

      // 获取当前邮件位置
      // let currentMailId = this.allMailId.indexOf(router.id)
      // let newArr = 
    },
    cancelClick(){
      this.folderDialog = false
      this.folderName = ''
    },
    // 创建 文件夹
    handleFolderSubmit() {
      // console.log(this.userMailList[0].directoryList)
      if (hasBlank(this.folderName)) {
        this.$message.error('请输入文件夹名称')
        return
      }
      
      if(this.title=='编辑'){
        if(this.userMailList[0].directoryList.length>0){
          
          for(var i=0;i<this.userMailList[0].directoryList.length;i++){
            if(this.folderName==this.userMailList[0].directoryList[i].title){
              this.$message({
                message: '名字相同了哦！',
                type: 'warning'
              });
            }else{
              
              let query = {
              name: this.folderName,
              id: this.ids
            }
            businessUpdateGroupName(query).then(res => {
              if (res.data.code === 200) {
                this.$message.success('修改成功')
                this.folderDialog = false
                this.folderName = ''
                this.setDirectoryListById(this.selectId)
              }
            })
            }
          }
          }else{

            let query = {
              name: this.folderName,
              id: this.ids
            }
            businessUpdateGroupName(query).then(res => {
              if (res.data.code === 200) {
                this.$message.success('修改成功')
                this.folderDialog = false
                this.folderName = ''
                this.setDirectoryListById(this.selectId)
              }
            })
          }
      }else{
        if(this.userMailList[0].directoryList.length>0){
          
          for(var i=0;i<this.userMailList[0].directoryList.length;i++){
            if(this.folderName==this.userMailList[0].directoryList[i].title){
              this.$message({
                message: '名字相同了哦！',
                type: 'warning'
              });
            }else{
              
              let query = {
                name: this.folderName,
                mailConfigId: this.selectId
              }
              addGroup(query).then(res => {
                if (res.data.code === 200) {
                  this.$message.success('创建成功')
                  this.folderDialog = false
                  this.folderName = ''
                  this.setDirectoryListById(this.selectId)
                }
              })
            }
          }
          }else{
            let query = {
                name: this.folderName,
                mailConfigId: this.selectId
              }
              addGroup(query).then(res => {
                if (res.data.code === 200) {
                  this.$message.success('创建成功')
                  this.folderDialog = false
                  this.folderName = ''
                  this.setDirectoryListById(this.selectId)
                }
              })
          }

      }
    },
    handleFolderDialogCancel() {
      this.folderDialog = false
    },
    // 删除文件夹
    handleDelFolder(configId, id, name) {
      this.$msgbox({
        message: `
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">确定删除该文件夹吗？</span>
            </div>
           <div class="innerTip"></div>
          </div>
          `,
        dangerouslyUseHTMLString: true,
        customClass: 'customMsgBoxDel',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: 'confirmBtn cancelButtonqd',
        cancelButtonText: '取消',
        showClose	:false,
        cancelButtonClass: 'confirmBtn cancelButtonqx',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            const query = {
              mailConfigId: configId,
              id
            }
            delGroup(query).then(res => {
              if (res.data.code === 200) {
                this.$message.success('删除成功')
                // 如果是删除当前选中的，直接跳转到收件箱
                if (id === this.directoryActiveId) {
                  this.handleMenuRouterClick(this.mailConfigId, 'inbox')
                }
                this.setDirectoryListById(configId)
              }else{
                this.$message.error(res.data.msg);
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
        // this.$message({
        //   type: 'info',
        //   message: 'action: ' + action
        // });
      }).catch(e => {})
    },
    // 是否强调
    handleFilterStress() {
      this.stress = this.stress === 1 ? 0 : 1
      const groupId = this.groupId
      const mailConfigId = this.mailConfigId
      this.getList(groupId, mailConfigId)
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
          const groupId = this.groupId
          const mailConfigId = this.mailConfigId
          this.getList(groupId, mailConfigId)
        }
      })
    },
    handleSearch() {
      console.log(this.searchSubject.length,'askhijweirhewrh')
      if(this.searchSubjectOld.length!=this.searchSubject.length){
        this.searchSubjectOld=this.searchSubject
        const groupId = this.groupId
        const mailConfigId = this.mailConfigId
        this.getList(groupId, mailConfigId)
      }
    },

    // 缓存-邮件
    cacheFun(val){
      let index = this.allMailId.indexOf(val)
      let minIndex = index-10 > 0 ? index-10 : 0
      let copyAllMailId = JSON.parse(JSON.stringify(this.allMailId))
      let query = copyAllMailId.splice(minIndex, 20)
      let dangqian = query.indexOf(val)
      query.splice(dangqian, 1)

      // 获取【已缓存邮件】  所有的id - 去重
      let keyVal = `${this.Xquery.configId}-${this.Xquery.groupId}`
      this.mailContInfo[keyVal] = this.mailContInfo[keyVal] || {}
      let keysArr = Object.keys(this.mailContInfo[keyVal] )
      let queryNew = query.filter(e=>{
        return keysArr.indexOf(e) === -1
      })
      if(queryNew.length < 3){
        return
      }
      let newStr = queryNew.join()
      getMailDetails({id:newStr}).then(res => {
        if(res.data.code === 200){
          this.Xquery.list = res.data.data
          console.log(this.Xquery,'this.Xquery --- this.Xquery')
          this.$store.commit('SET_MAILCONTINFO', this.Xquery)
        }
      })
    },
    getMailIdAll(list){
      let newArr=[]
      for(let i in list){
        newArr.push(...list[i].list)
      }
      newArr = newArr.map(e=>{
        return e.id
      })
      return newArr
    },
    // 去重 - 已经缓存的不再去保存
  },
  watch: {
    getWsMsg: {
      handler(msg) {
        console.log(msg,'sahdiuwqnkje')
        // 拉取成功
        if (msg.type === 'syncSuccess' && msg.data) {
          console.log(this.waydata,'asdqweqeweqweq')
          if(this.waydata=='shoudong'){
            this.$message.success('收取邮件成功')
          }
          // this.handleCheckIsFirstLogin()
          for(let i=0;i<this.userMailList.length;i++){
            this.handleQueryUnreadCount(this.userMailList[i].id)
          }
              this.refreshCb()

          this.syncDialog = false
          this.syncCurrent = 0
          this.syncTotal = 0
          this.syncPercent = 0
        }
        if(msg.type === 'sySuccess') {
          const { count, total } = msg.data
          this.syncCurrent = count
          this.syncTotal = total
          const progressNum = Math.ceil(count / total * 100)
          this.syncPercent = progressNum
          if (count === total) {
            this.syncDialog = false
            this.syncCurrent = 0
            this.syncTotal = 0
            this.syncPercent = 0
          }
        }
      },
      deep: true
    },
    // 防止点击多个通知时详情数据不刷新
    '$route': {
      handler(router) {
        // 通过路由进入查看详情 ?initId=123
        if (router.query.initId) {
          this.getDetailById()
        }
        // 通过点击邮箱账号进入写邮件 ?initMail=xxx@qq.com&action=initWriteMail
        if(router.query.action === 'initWriteMail') {
          this.initWriteMail()
        }
      }
    },

    SetNewMailMessage(newVal, oldVal) {
      if (newVal) {
        console.log(newVal,'saidowqhioed')
        this.refreshCb()
        for(let i=0;i<this.userMailList.length;i++){
          this.handleQueryUnreadCount(this.userMailList[i].id)
        }
        // this.handleCheckIsFirstLogin()
      }
    },
    // readyState(newVal, oldVal) {
    //   if (newVal) {
    //     console.log(newVal,'eiojhfhihiqw')
    //     this.setreadyState=newVal
    //   }
    // },
  }
}
</script>

<style lang="scss" scoped>
.mailSearchInputClassdian{
  border: 1px solid #3370FF !important;
}
.el-dialog__wrapper{
background: rgba(15, 22, 51, 0.15);
}
.el-dialog__wrapper{
  ::v-deep.el-dialog{
    margin-top: 35vh;
  }
  ::v-deep.el-dialog__body{
    padding: 10px 30px 30px 30px;
  }
  ::v-deep.el-dialog__header{
    border-top-left-radius: 8px !important;
    border-top-right-radius: 8px !important;
    background: #FFFFFF !important;
    .dialog-header-row{
      // border-top: 4px solid #3370FF;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
  ::v-deep.el-input--mini .el-input__inner{
    height: 32px !important;
    line-height: 32px !important;
  }
  .mail-btn-primary{
    width: 84px;
    height: 32px;
    background: #3370FF;
    opacity: 1;
    border-radius: 4px;
    font-size: 14px;
  }
  .right{
    text-align: right;
  }
  .cancel{
    width: 84px;
    height: 32px;
    border: 1px solid #DEE0E3;
    opacity: 1;
    border-radius: 4px;
    font-size: 14px;
    margin-right: 10px;
  }
}

.omitPopout{
  width: 132px;
  height: 76px;
  background: #FFFFFF;
  border: 1px solid #DEE0E3;
  box-shadow: 0px 0px 10px rgba(75, 129, 255, 0.1);
  opacity: 1;
  border-radius: 4px;
  position: absolute;
  right: -100px;
  top: 40px;
  z-index: 9999 !important;
}
.mailRowInnerOne{
  padding: 0 10px 5px 28px !important;
  position: relative;
  .unreadFlag{
    position: absolute;
    top: 6px;
    left: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3370FF;
  }
}
.mailRowSubject{
  padding: 0 10px 0px 28px !important;
}
.spanGroupId{
  color: #F54A45;
  font-size: 14px;
  margin-right: 5px;
}
.menu_item_border{
  .flex-center{
    width: 100%;
  }
}
.add_new_btn {
  width: 120px;
  height: 30px;
  margin: 0 auto;
  cursor: pointer;
  margin-top: 10px;
  margin-left: 12px;
  border: 1px solid #BFBFBF;
  color: #222222;
  border-radius: 25px;
}
.menu-outer {
  margin-top: 16px;
  padding-bottom: 20px;
}
.main-view-container {
  display: flex;
  .left-container {
    min-width: 250px;
    position: relative;
    background: #FBFBFC;
    height: calc(100vh - 42px);
    // overflow: hidden;
    // overflow-y: scroll;
    border-right: 1px solid #DCDCDC;
  }

  .right-container {
    flex: 1;
    // background: #fff;
  background: #FBFBFC;
    /*max-width: calc(100vw - 276px);*/
    /*max-width: calc(100% - 535px);*/
  }
  .el-menu-item-li {
    display: flex;
    align-items: center;
    height: 46px!important;
    line-height: 46px!important;
    color: #222222;
    // margin-right: 8px;
    padding-left: 20px;
    padding-right: 10px;
    margin-left: 11px;
    margin-right: 9px;
    //&:hover {
    //  background: #EEEEEE;
    //}
    .menu-text {
      margin-left: 10px;
      // margin-right: 20px;
      width: 100%;
      .mane-text-right{
        float: right;
        span{
          border-radius: 12px;
          background: #F54A45;
          color: white;
          padding: 3px 5px;
          font-family: SourceHanSansCN-Regular;
          font-size: 10px;
        }
      }
    }
    .menu-item-active {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }
  .el-menu-item-li_active {
    background: #DEE0E3;
    color: #3370FF;
    border-radius: 6px;
    margin-left: 11px;
    margin-right: 9px;
  }
  .menu_item_icon_container {
    width: 28px;
    height: 28px;
  }
  .directory-menu-outer {
    height: 325px;
    overflow: hidden;
    overflow-y: scroll;
  }
}
.customMsgBoxDel{
  .confirmBtn{
    &:hover{
      background: none;
    }
  }
}
::v-deep .el-menu-item:focus, ::v-deep .el-menu-item:hover{
  background-color:#EFF0F1;
}
.fileFolder:hover, .fileFolder:focus{
  background:none;
}
.popoverItems{
  width:112px;
  height:24px;
  display:flex;
  align-items:center;
  font-size: 14px;
  font-family: SourceHanSansCN-Regular;
  margin:0;
  border-radius:4px;
  cursor:pointer;
  img{
    width:11.2px;
    height:11.2px;
    margin:0 10px;
  }
  &:hover{
    background:#F5F6F7;
  }
}
</style>
<style>
.customPopover{
  padding:11px 10px;
  min-width:unset!important;
  box-sizing: content-box;
}
</style>
