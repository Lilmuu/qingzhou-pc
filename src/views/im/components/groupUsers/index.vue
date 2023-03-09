<template>
  <div class="groupUsersContainer">
    <div class="groupUserTitleRow flex-space-between">
      <div class="menu-title custom">群成员（{{RoomInfo.userSize || 0}}）</div>
      <i class="el-icon-close cursor" @click="handleClose" style="font-size: 18px;"></i>
    </div>
    <!-- 群成员   -->
    <!--  RoomInfo.members > 4 显示两栏  -->
    <div :class="['groupUsersList', RoomInfo.members && RoomInfo.members.length > 4 ? 'groupUsersListTwo' : '']"
         v-Clickoutside="closeOut">
      <div class="userItem ellipsis" @click="handleOpenGroupDialog('addGroupUsers')">
        <div class="userItemActionBtn flex-center cursor">
          <img src="@/assets/img/im/groupIconAdd.png" class="userItemActionBtn" alt="">
        </div>
        <span class="userName">添加</span>
      </div>
      <div class="userItem ellipsis" @click="handleShowDelGroupUserMode(true)" v-if="isGroupAdmin">
        <div class="userItemActionBtn flex-center cursor">
          <img src="@/assets/img/im/groupIconDel.png" class="userItemActionBtn" alt="">
        </div>
        <span class="userName">删除</span>
      </div>
      <template v-for="(user, index) of RoomInfo.members">
        <!-- 最多显示8个 -->
        <div class="userItem"
             :key="'user' + user.userId + user.createTime + index"
             :title="user.nickname"
              v-if="index>7&&isGroupAdmin&&hideJudgment?false:index>8&&!isGroupAdmin&&hideJudgment?false:true">
          <!-- <Avatar :username="user.nickname" /> -->
          <headAvatar
          :size="32"
          :fontSize='12'
          :avatarUrl="user.headImg ? user.headImg: ''"
          :username='user.nickname || user.realname'>
        </headAvatar>
          <span class="userName ellipsis">{{ user.nickname }}</span>
        </div>
      </template>
    </div>
    <div class="checkMembers" v-if="RoomInfo.members && RoomInfo.members.length > 8">
      <span @click="checkMembersClick" v-if="hideJudgment">查看更多群成员<i class="el-icon-arrow-down"></i></span>
      <span @click="checkMembersClick" v-if="!hideJudgment">收起<i class="el-icon-arrow-up"></i></span>
    </div>
    <div class="groupUserTitleRow2 flex-column" style="border-top: 1px solid #EFF0F1; padding-top: 15px; padding-bottom: 0;margin-left:30px;margin-right:30px;">
      <div class="menu-title">群名称</div>
      <!--群主-->
      <div v-if="isGroupAdmin&&groupNameJudgment" class="groupNameJudgmentClass"><span @click="groupNameJudgmentClick">{{FormData.RoomName}}</span><img src="@/assets/img/im/groupName.png" alt="" @click="groupNameJudgmentClick"></div>
      <input type="text"
             maxlength="20"
             class="editInputer"
             ref="groupNameJudgmentIput"
             v-model="FormData.RoomName"
             @keyup.enter="onClickSetRoomName"
             @blur="onClickSetRoomName"

             v-if="isGroupAdmin&&!groupNameJudgment" />
      <div class="menu-content" v-if="!isGroupAdmin">{{ RoomInfo.name }}</div>
    </div>
    <div class="groupUserTitleRow2 flex-column">
      <div class="menu-title">群公告</div>
      <!--群主 可编辑公告-->
      <div class="menu-content cursor" @click="handleEditNotice" v-if="isGroupAdmin">
        <span class="noticeText">{{ hasNotice ? RoomInfo.notice.text : '未设置' }}</span>
        <i class="el-icon-arrow-right"></i>
        <!-- <span class="editNoticeText">编辑群公告<i class="el-icon-edit" style="margin-left: 2px;"></i></span> -->
      </div>
      <!--  成员 可查看公告  -->
      <div class="menu-content cursor" v-else>
        <div class="menu-content" @click="handleNoticeDialog">
          <span class="noticeText">{{ hasNotice ? RoomInfo.notice.text : '未设置' }}</span>
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
    <div class="groupUserTitleRow2 flex-column">
      <el-checkbox :value="isTop" @change="handleChangeTop" active-color="#3471FF"><div class="menu-title">消息添加置顶</div></el-checkbox>
      <!-- <el-switch :value="isTop" @change="handleChangeTop" active-color="#3471FF"></el-switch> -->
    </div>
    <div class="flex-center" style="margin-top: 70px;margin-bottom: 120px;">
      <div class="groupBottomActionRow flex-center cursor" @click="handleDelAndExit" v-if="isGroupAdmin">解散群聊</div>
      <div class="groupBottomActionRow flex-center cursor" @click="handleDelAndExit" v-if="!isGroupAdmin">退出群聊</div>
    </div>

    <!-- 添加群成员 -->
    <el-dialog  append-to-body
      :visible.sync='groupUserDialog'
      custom-class="select_user_box"
      id="addNewTaskNew"
      :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">添加群成员</span>
      </div>
      <selectPeople
      v-if="groupUserDialog"
        moduleMode="group"
        addType="groupAddUsers"
        :chatParams='params'
        :executeList="RoomInfo.members"
        @selectUserSuccess="selectSuccess"
        @selectCancel="selectCancel">
      </selectPeople>
    </el-dialog>

    <!-- 删除群成员 -->
    <el-dialog  append-to-body
      :visible.sync='groupUserDialogSel'
      custom-class="select_user_box"
      id="addNewTaskNew"
      :close-on-click-modal="false">
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">删除群成员</span>
      </div>
      <selectPeople
        v-if="groupUserDialogSel"
        :selectUserList="RoomInfo.members"
        moduleMode="group"
        addType="groupSelUsers"
        :executeList="[...RoomInfo.members[0]]"
        :chatParams='params'
        @selectUserSuccess="selectSuccess"
        @selectCancel="selectCancel">
      </selectPeople>
    </el-dialog>

    <!-- 公告dialog -->
    <el-drawer append-to-body
      width="400"
      :modal='false'
      :visible.sync='groupNoticeDialog'
      custom-class="edit_notice"
      class="el-dialog__body_padding0">
      <div slot="title" class="dialog-header-row">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title">群公告</span>
        <span v-if="hasNotice" style="margin-top: 8px;">创建于 {{ noticeTime | dayjsFormat }}</span>
      </div>
      <div class="editNoticeDialogBody">
        <div style="margin-top: 15px;" class="editNoticeDialogBodyDiv">{{ hasNotice ? RoomInfo.notice.text : '未设置' }}</div>
        <div class="bottom_box">
<!--          <span class="cancelBtn cursor" @click="handleClearNotice">取消</span>-->
        </div>
      </div>
    </el-drawer>
    <!-- 编辑公告dialog -->
    <el-drawer append-to-body
      width="400"
      :modal='false'
      class="el-dialog__body_padding0"
      :before-close="handleClearNotice"
      :visible.sync='editNoticeDialog'
      :close-on-click-modal="false"
      custom-class="edit_notice">
      <div slot="title" class="dialog-header-row">
        <!-- <div class="dialog-tip"></div> -->
        <span class="el-dialog__title">编辑群公告</span>
        <span v-if="hasNotice">创建于 {{ noticeTime | dayjsFormat }}</span>
      </div>
      <div class="editNoticeDialogBody">
        <el-input type="textarea"
          style="margin-top: 15px;"
          v-model="FormData.notice"
          v-focus
          maxlength="1000"
          placeholder="请输入群公告">
        </el-input>
        <div class="bottom_box">
          <span class="cancelBtn cursor" @click="handleClearNotice('cancel')">取消</span>
          <span class="submitBtn cursor" @click="onClickSetRoomNotice">确定</span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import headAvatar from "@/components/headAvatar"
import {mapActions, mapGetters, mapState} from 'vuex'
import SelectGroupUsers from "@/views/im/components/groupUsers/selectGroupUsers";
import EventBus from "@/eventBus";
import { groupDelete } from "@/api/im";
import selectPeople from "@/views/myTodo/components/selectPeople";

// 成员角色（role）: 1 => 创建者（群主）、 => 管理员、3 => 普通成员、4 => 隐身人、5 => 监控人

export default {
  name: "groupUsers",
  props: {
    params: {
      type: Object,
      required: true
      /*
      * id: '',
        type: 'friend',   // [room, friend]
        jid: ''           // 群jid / 好友id
      * */
    }
  },
  components: {
    headAvatar,
    selectPeople,
    SelectGroupUsers,
  },
  data() {
    return {
      groupNameJudgment:true,
      hideJudgment:true,
      isTop: false,        // 是否置顶
      groupUserDialog: false,   // 添加群成员
      groupUserDialogSel: false, // 删除群成员
      groupNoticeDialog: false, // 公告dialog
      editNoticeDialog: false,       // 编辑公告dialog
      showDelGroupUserMode: false,  // 显示删除成员模式
      viewType: 'addGroupUsers',  // [addGroupUsers: 添加群成员, delGroupUsers: 删除群成员]
      noticeBtnLoading: false,    // 公告提交加载
      FormData: {
        RoomName: '',
        RoomDesc: '',
        notice: ''
      },
      IsShowuserIndex: 8,
      IsAllBanned: false,
      IsShowRead: false,
      IsShowRoomNameDialog: false,
      IsShowRoomDescDialog: false,
      LRoomInfo: {}, // 群组信息
      EncryptOptions: this.$constant.MESSAGE_ENCRYPT_OPTIONS,
      resetRoomName:false,
      confirmStatus:false
    }
  },
  computed: {
    ...mapState({
      RoomInfo: state => state.Im.Room.RoomInfo,
      RoomNoticesList: state => state.Im.Room.RoomNoticesList,
      XMLConstant: state => state.Common.Xml.XMLConstant, // XML数据格式化
      TopChatList: state => state.Im.Information.TopChatList, // 置顶的消息列表
      'MeId': state => state.Common.User.MeId
    }),
    ...mapGetters({
      'IdRoomList': 'Im/Room/IdRoomList'
    }),
    // 是否为群主
    isGroupAdmin() {
      return this.RoomInfo.member && this.RoomInfo.member.role === 1
    },
    // 是否有群公告
    hasNotice() {
      return this.RoomInfo.notice && !!this.RoomInfo.notice.text
    },
    // 最后公告时间
    noticeTime() {
      return this.RoomInfo.notice ? Number(this.RoomInfo.notice.time) * 1000 : ''
    }
  },
  created () {
    this.GetRoomInfo({ roomId: this.params.id })
    this.LRoomInfo = this.IdRoomList[this.params.id]
    if (this.$utils.Tools.isEmpty(this.LRoomInfo.encryptType)) {
      this.LRoomInfo.encryptType = 0
    }
  },
  async mounted () {
    this.GetXML('Constant')
    await this.GetRoomList()
    const rs = await this.GetRoomInfo({ roomId: this.params.id })
    if (rs.resultCode === 1) {
      const nowTime = new Date().getTime() / 1000
      if (rs.data.talkTime > nowTime) this.IsAllBanned = true // 是否全部禁言
      if (rs.data.showRead === 1) this.IsShowRead = true // 是否开启已读
    }
    console.log("this.RoomInfo",this.RoomInfo)
    console.log('FormData',this.FormData)
  },
  methods: {
    ...mapActions({
      GetRoomInfo: 'Im/Room/GetRoomInfo', // [GET] 获取群信息
      PostRoomUpdate: 'Im/Room/PostRoomUpdate', // [POST] 更新群信息
      GetRoomNoticesListByPage: 'Im/Room/GetRoomNoticesListByPage' // [GET] 获取群公告列表
    }),
    groupNameJudgmentClick(){
      this.groupNameJudgment=!this.groupNameJudgment
      this.$nextTick(()=>{
        this.$refs.groupNameJudgmentIput.focus()
      })

    },
    checkMembersClick(){
      this.hideJudgment=!this.hideJudgment
    },
    // 获取群公告列表页
    GetRoomNoticesListPage (pageIndex, pageSize, callback) {
      const params = {
        pageIndex,
        pageSize,
        roomId: this.params.id
      }
      this.GetRoomNoticesListByPage(params)
        .then(rs => {
          callback(rs.data.pageData.length)
        })
    },
    // [Emit] 上拉加载
    handleInfiniteLoad (page, mescroll) {
      // page.num 默认从1开始，所以需要-1
      const pageIndex = page.num - 1
      // 请求数据
      this.GetRoomNoticesListPage(pageIndex, page.size, (len) => {
        // 数据渲染成功后,隐藏下拉刷新的状态
        this.$nextTick(() => {
          mescroll.endSuccess(len)
        })
      })
    },
    // [Click bus] 显示发布公告弹框
    onClickShowPopup () {
      // 成员角色（role）: 1 => 创建者（群主）、 => 管理员、3 => 普通成员、4 => 隐身人、5 => 监控人
      if (this.RoomInfo.member.role === 1) {
        // 群主身份
        const _this = this
        this.$vux.confirm.show({
          title: '发布公告', showInput: true, placeholder: '请输入公告...', hideOnBlur: true, dialogTransition: 'vux-fade',
          onConfirm (e) {
            // 为空则过滤
            if (!e) return
            _this.PostRoomUpdate({ roomId: _this.params.id, notice: e }).then(rs => {
              _this.GetRoomInfo({ roomId: _this.params.id })
              if (rs.resultCode === 1) this.$message.success(`更新成功`)
            })
          }
        })
      } else {
        this.$message.info(`您不是群主，无法发布公告`)
      }
    },

    ...mapActions({
      GetXML: 'Common/Xml/GetXML', // [GET] 获取XML
      'GetRoomInfo': 'Im/Room/GetRoomInfo', // [GET] 获取群信息
      'PostRoomUpdate': 'Im/Room/PostRoomUpdate', // [POST] 更新群信息
      'GetRoomList': 'Im/Room/GetRoomList', // [GET] 获取群列表
      'PostRoomMemberDelete': 'Im/Room/PostRoomMemberDelete', // [POST] 删除群成员
      'PostRoomDelete': 'Im/Room/PostRoomDelete', // [POST] 解散群组
      'PostModifyRoomEncryptType': 'Im/Room/PostModifyRoomEncryptType', // [POST] 修改群组的加密设置
      'PostTigaseDialogAdd': 'Im/Room/PostTigaseDialogAdd', // [POST] 添加消息置顶
      'PostTigaseDialogDelete': 'Im/Room/PostTigaseDialogDelete', // [POST] 删除消息置顶
      'GetTigaseDialog': 'Im/Information/GetTigaseDialog', // [get] 获取置顶消息列表
    }),
    // [Click] 查看更多群成员
    onClickViewMore () {
      if (this.IsShowuserIndex !== 8) {
        this.IsShowuserIndex = 8
      } else {
        this.IsShowuserIndex = this.RoomInfo.userSize
      }
    },
    // [Click] 设置群名称
    onClickSetRoomName () {
      // 成员角色（role）: 1 => 创建者（群主）、 => 管理员、3 => 普通成员、4 => 隐身人、5 => 监控人
      // 未更改或为空则过滤
      if(this.resetRoomName) return
      this.resetRoomName = true
      this.groupNameJudgment=true
      if (this.FormData.RoomName === this.RoomInfo.name) return
      if(!this.FormData.RoomName) {
        this.FormData.RoomName = '群聊'
      }
      this.PostRoomUpdate({ roomId: this.params.id, roomName: this.FormData.RoomName }).then(rs => {
        if (rs.resultCode === 1) {
          this.GetRoomInfo({ roomId: this.params.id })
          this.$message.success('群名称修改成功')
        }
      }).finally(() => {
        this.resetRoomName = false
      })
    },
    // 更改群公告
    onClickSetRoomNotice() {
      if (this.FormData.notice === this.RoomInfo.notice.text) return
      if (!this.FormData.notice) return;

      if (this.noticeBtnLoading) return;
      this.noticeBtnLoading = true

      this.PostRoomUpdate({ roomId: this.params.id, notice: this.FormData.notice }).then(rs => {
        if (rs.resultCode === 1) {
          this.GetRoomInfo({ roomId: this.params.id })
          this.handleClearNotice()
          this.$message.success('更新群公告成功')
        }
      }).finally(() => {
        this.noticeBtnLoading = false
      })
    },
    // [Click] 更改群说明
    onClickSetRoomDesc () {
      // // 成员角色（role）: 1 => 创建者（群主）、 => 管理员、3 => 普通成员、4 => 隐身人、5 => 监控人
      // 未更改或为空则过滤
      if (!this.FormData.RoomDesc || this.FormData.RoomDesc === this.RoomInfo.desc) return
      this.PostRoomUpdate({ roomId: this.params.id, desc: this.FormData.RoomDesc }).then(rs => {
        if (rs.resultCode === 1) {
          this.GetRoomInfo({ roomId: this.params.id })
          this.$message.success('更新成功')
        }
      })
    },
    // [Click] 设置全体禁言
    onClickSetAllBanned () {
      this.IsAllBanned = !this.IsAllBanned
      const time = 60 * 60 * 24 * 15 // 十五天
      const nowTime = parseInt(new Date().getTime() / 1000) // 当前时间（秒）
      // 十五天 or 不禁言
      const talkTime = this.IsAllBanned ? nowTime + time : 0
      this.PostRoomUpdate({ roomId: this.params.id, talkTime }).then(rs => {
        if (rs.resultCode === 1) {
          this.GetRoomInfo({ roomId: this.params.id })
          this.$message.success('更新成功')
        }
      })
    },
    // [Click] 设置显示已读
    onClickSetShowRead () {
      this.IsShowRead = !this.IsShowRead
      this.PostRoomUpdate({ roomId: this.params.id, showRead: this.IsShowRead ? 1 : 0 }).then(rs => {
        if (rs.resultCode === 1) {
          this.GetRoomInfo({ roomId: this.params.id })
          this.$message.success('更新成功')
        }
      })
    },

    // [Change] 更改消息加密设置
    handleSetMessageEncryptSetting (value) {
      this.PostModifyRoomEncryptType({ roomId: this.params.id, encryptType: value }).then(rs => {
        if (rs.resultCode === 1) {
          this.GetRoomInfo({ roomId: this.params.id }).then(rs => {
            if (rs.resultCode === 1) {
              this.$storage.groupList.replace(rs.data)
            }
          })
        }
      })
    },

    // 增加、删除、消息置顶
    handleChangeTop(isTop) {
      const data = {
        jid: this.params.jid,
        isAdaptive: 1
      }
      console.log(isTop,'2222333')
      const requestApi = isTop ? this.PostTigaseDialogAdd : this.PostTigaseDialogDelete
      requestApi(data).then(rs => {
        if(rs.resultCode === 1) {
          this.isTop = isTop
          this.$emit("sonChangeTop",this.isTop)
          this.GetTigaseDialog()
        }
      })
    },

    // 删除并退出
    handleDelAndExit() {
      const _this = this
      if(this.isGroupAdmin){
        var message=`
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">确定要解散群聊吗?</span>
            </div>
          </div>
          `
      }else{
        var message=`
          <div class="msgBoxInner">
            <div class="innerHeader">
              <span class="innerTitle">确定要退出群聊吗?</span>
            </div>
          </div>
          `
      }
      if(this.RoomInfo.member) {
        this.$msgbox({
          message: message,
          dangerouslyUseHTMLString: true,
          customClass: 'customMsgBox1',
          showCancelButton: true,
          confirmButtonText: '确定',
          confirmButtonClass: 'confirmBtn confirmButton red_del_btn',
          cancelButtonText: '取消',
          cancelButtonClass: 'confirmBtn cancelButton',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              // 解散群组 群主
              if(_this.confirmStatus) return
              _this.confirmStatus = true
              if(_this.RoomInfo.member.role === 1) {
                _this.PostRoomDelete({ roomId: _this.params.id }).then(rs => {
                  if (rs.resultCode === 1) {
                    // 要去清除轻舟的记录
                    groupDelete({ roomId: _this.params.id }).then(res => {
                      if(res.data.code === 200) {
                        _this.$message.success('已退出群聊')
                        EventBus.$emit('resetIMRoute')
                        done()
                      }
                    }).finally(() => {
                      _this.confirmStatus = false
                    })
                  }
                })
              } else if(_this.RoomInfo.member.role !== 1) {
                // 退出群组 成员
                _this.PostRoomMemberDelete({ roomId: _this.params.id, userIds: _this.MeId+"" }).then(rs => {
                  if (rs.resultCode === 1) {
                    _this.$message.success('执行成功')
                    EventBus.$emit('resetIMRoute')
                    done()
                  }
                }).finally(() => {
                  _this.confirmStatus = false
                })
              }
            } else {
              done()
            }
          }
        }).then(action => {}).catch(e => {})
      }
    },

    // 显示编辑公告
    handleNoticeDialog() {
      this.groupNoticeDialog = true
    },
    handleEditNotice() {
      this.FormData.notice = this.RoomInfo.notice ? this.RoomInfo.notice.text : ''
      this.editNoticeDialog = true
    },
    handleClearNotice(data) {
      if(data != "cancel") { // 编辑完公告关闭外层窗口
        this.$parent.showGroupUsers = false
      }
      this.groupNoticeDialog = false
      this.editNoticeDialog = false
      this.FormData.notice = ''
    },

    // 显示成员
    handleOpenGroupDialog(viewType) {
      this.viewType = viewType
      this.groupUserDialog = true
    },
    // 显示删除成员模式
    handleShowDelGroupUserMode() {
      this.groupUserDialogSel = true
    },
    closeOut() {
      this.showDelGroupUserMode = false
    },
    // 删除成员
    // handleDelGroupUser(user) {
    //   if(!this.showDelGroupUserMode) return
    //   // 成员角色（role）: 1 => 创建者（群主）、 => 管理员、3 => 普通成员、4 => 隐身人、5 => 监控人
    //   const my = this.RoomInfo.member
    //   if (my.role === 1 || my.role === 2) {
    //     if (my.userId === user.userId) {
    //       this.$message.error('您无法移除自己')
    //       return
    //     } else if (user.role === 1) {
    //       this.$message.error('无法移除群主')
    //       return
    //     }
    //   } else {
    //     this.$message.error('您没有权限移除群成员')
    //     return
    //   }

    //   let _this = this
    //   this.$msgbox({
    //     title: '提示',
    //     message: `
    //       <div class="msgBoxInner">
    //         <div class="innerHeader">
    //           <i class="innerIcon el-icon-info info-icon"></i>
    //           <span class="innerTitle">确定将${ user.nickname }移除群组?</span>
    //         </div>
    //        <div class="innerTip"></div>
    //       </div>
    //       `,
    //     dangerouslyUseHTMLString: true,
    //     customClass: 'customMsgBox',
    //     showCancelButton: true,
    //     confirmButtonText: '确定',
    //     confirmButtonClass: 'confirmBtn confirmButton',
    //     cancelButtonText: '取消',
    //     cancelButtonClass: 'confirmBtn cancelButton',
    //     beforeClose: (action, instance, done) => {
    //       if (action === 'confirm') {
    //         instance.confirmButtonLoading = true
    //         instance.confirmButtonText = '执行中...'
    //         _this.PostRoomMemberDelete({ roomId: _this.params.id, userId: user.userId })
    //           .then(rs => {
    //             if (rs.resultCode === 1) {
    //               _this.GetRoomInfo({ roomId: _this.params.id })
    //               _this.$message.success('删除成功')
    //               _this.showDelGroupUserMode = true
    //             }
    //           })
    //           .finally(() => {
    //             done()
    //             instance.confirmButtonLoading = false
    //           })
    //       } else {
    //         done()
    //       }
    //     }
    //   }).then(action => {
    //   }).catch(e => {})
    // },
    // 成功 TODO: 刷新
    selectSuccess() {
      this.groupUserDialog = false
    },
    selectCancel() {
      this.groupUserDialog = false
      this.groupUserDialogSel = false
      this.GetRoomInfo({ roomId: this.params.id })
    },
    // 关闭
    handleClose() {
      this.$emit('close')
    },
  },
  watch: {
    'RoomInfo.name'(newVal) {
      if (newVal) {
        this.FormData.RoomName = newVal
      }
    },
    'RoomInfo.notice'(notice) {
      if (notice) {
        this.FormData.notice = notice.text || '未设置'
      }
    },

    'TopChatList': {
      handler(list) {
        if(list.length === 0) {
          this.isTop = false
        } else {
          this.isTop = list.some(item => item.jid === this.params.jid)
        }
      },
      immediate: true,
      deep: true
    },
  }
}
</script>
<style lang="scss" scoped>
.checkMembers{
  display: flex;
  justify-content: center;
  align-items: center;
  color: #8F959E;
  span{
    cursor: pointer;
    i{
      margin-left: 10px;
    }
  }
}
.groupNameJudgmentClass{
  display: inline-block;
  color: #8F959E;
  font-size: 14px;
  height: 26px;
  padding-left: 1px;
  line-height: 24px;
  span{
    cursor: pointer;
    padding-right: 24px;
  }
  img{
    cursor: pointer;
  }
}
::v-deep .edit_notice{
  width: 400px !important;
  margin-top: 42px;
  box-shadow: -2px 0px 10px rgba(75, 129, 255, 0.08);
  font-family: SourceHanSansCN-Normal;
  .el-drawer__body{
    padding: 0 30px;
    .editNoticeDialogBody{
      display: flex;
      flex-direction: column;
      height: 100%;
      .editNoticeDialogBodyDiv{
        width: 100%;
        font-size: 14px;
        word-break: break-all;

      }
      .el-textarea{
        flex: 0.8;
      }
      .bottom_box{
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        height: 32px;
        .cancelBtn{
          width: 112px;
          height: 32px;
          border: 1px solid #DEE0E3;
          opacity: 1;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          margin-right: 10px;
        }
        .submitBtn{
          width: 112px;
          height: 32px;
          font-size: 14px;
          margin: 0;

        }
      }
    }
    .el-textarea__inner{
      height: 100%;
      border: 1px solid #DEE0E3;
      border-radius: 4px;
      resize:none;
    }
  }
  .el-drawer__header{
    padding: 8px 30px !important;
    background: #fff;
    height: 70px;
    margin-bottom: 0;
    .el-drawer__close-btn{
      font-size: 16px;
      padding: 0;
    }
    .dialog-header-row{
      padding-bottom: 0;
      display: inline-block;
      .el-dialog__title{
        font-size: 16px;
        line-height: 16px;
        display: block;
        width: 100%;
        color: #1F2329;
        font-size: 16px;
        margin-top: 0;
      }
      span{
        display: inline-block;
        margin-top: 5px;
        color: #8F959E;
        font-size: 12px;
        line-height: 12px;
      }
    }
  }
}
</style>
