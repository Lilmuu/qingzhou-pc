<template>
    <div class="userListDrawer">
      <div class="flex-space-between userHeader">
        <div style="color: #222;">参会人（{{ list.length }}）</div>
        <i class="cursor el-icon-close" @click="handleCloseDrawer"></i>
      </div>
      <div class="userListContainer">
        <div class="userListItem" v-for="(item, index) in listOfUser" :key="'list' + index">
          <div class="userItemRow flex-space-between">
            <div class="userItemInfo">
              <div class="face">
                <HeadAvatar 
                  :size="32" 
                  :fontSize='12'
                  :avatarUrl="item.avatar" 
                  :username="displayUserNameFix(item.userName)"
                  style="margin-right:10px;">
                </HeadAvatar>
              </div>
              <div class="userItemInfoTip">
                <span class="username">{{ displayUserNameFix(item.userName) == myself ? `${displayUserNameFix(item.userName)}（我）` : displayUserNameFix(item.userName) }}</span>
                <span class="userTip" v-if="createdRoomData.adminName === item.userName.split('!!')[0]">主持人</span>
              </div>
            </div>
            <div class="userItemAction flex-center">
              <img :src="isMuteUser(item) === false ? vic_img : vic_off_img"
                   class="cursor"
                   alt=""
                   v-show="isMeetingAdmin && createdRoomData.adminName !== item.userName.split('!!')[0]"
                   @click="handleAction(index, 'mic', isMuteUser(item))">
<!--              <img :src="isVolUser(item) === false ? vol_img : vol_off_img"-->
<!--                   class="meetingRoom-action-img cursor"-->
<!--                   alt=""-->
<!--                   @click="handleAction(index, 'vol', isVolUser(item))"-->
<!--                   style="width: 17px;">-->
            </div>
          </div>
        </div>
      </div>
      <div class="userListActionRow flex-center" v-if="isMeetingAdmin">
        <div class="userListActionBtn flex-center cursor" @click="handleMuteAll" :style="{'background':disableAllMic ? '#3370FF' : '#fff','color':disableAllMic ? '#fff' : '#1F2329','border':disableAllMic ? '' : '1px solid #D0D3D6'}">
          <!-- <img :src="disableAllMic ? vic_off_img : vic_img"
               class="meetingMenu-action-img cursor"
               alt=""
               style="margin: 0;margin-right: 25px;"> -->
          <span>{{ disableAllMic ? '取消全员静音' : '全员静音' }}</span>
        </div>
      </div>
    </div>
</template>

<script>
import Avatar from "@/components/Avatar/Avatar"
import EventBus from "@/eventBus";
import { displayUserName } from "@/utils";
import { getAvatarByImId } from "@/api/user"
import HeadAvatar from "@/components/headAvatar"
const vic_img = require('@/assets/img/meeting/mic_on.png')
const vic_off_img = require('@/assets/img/meeting/mic_off.png')
const vol_img = require('@/assets/img/meeting/vol.png')
const vol_off_img = require('@/assets/img/meeting/vol_off.png')

const myRealName = localStorage.getItem('USERNAME')
const USERNAME = `pc-` + myRealName

export default {
  name: "userListDrawer",
  props: {
    list: {
      type: Array,
      required: true
    },
    muteUserList: {
      type: Array,
      default: () => []
    },
    volUserList: {
      type: Array,
      default: () => []
    },
    // 是否为管理员
    isMeetingAdmin: {
      type: Boolean,
      default: false
    },
    createdRoomData: {
      type: Object,
    }
  },
  components: {
    Avatar,
    HeadAvatar
  },
  data() {
    return {
      disableAllMic: false,
      vic_img: vic_img,
      vic_off_img: vic_off_img,
      vol_img: vol_img,
      vol_off_img: vol_off_img,
      myself:localStorage.getItem('USERNAME'),
      listOfUser:[],
    }
  },
  watch:{
    list:{
      handler(newVal){
        if(newVal && newVal.length){
          this.listOfUser = newVal
          this.listOfUser.forEach(async item => {
            if(item.userName){
               const res = await getAvatarByImId(item.userName.split('!!')[1])
              item.avatar = res.data.data.headImage
              this.$forceUpdate()
            }
          })
        }
      },
      immediate:true
    }
  },
  mounted() {
    EventBus.$on('setMuteAllStatus', disableAllMic => {
      this.disableAllMic = disableAllMic
    })
  },
  methods: {
    // 全员禁音
    handleMuteAll() {
      const disableAllMic = !this.disableAllMic
      this.$emit('handleMuteAll', disableAllMic)
    },
    handleCloseDrawer() {
      this.$emit('close')
    },
    handleAction(index, type, isDisabled) {
      const muteUser = this.list[index].userName
      // 管理员无法对自己禁音
      if(this.isMeetingAdmin && muteUser === USERNAME) {
        this.$message.info(`管理员无法对自己禁音`)
        return
      }
      if (type === 'mic') {
        // 管理员才能看 麦克风
        if(this.isMeetingAdmin) {
          const disabled = !isDisabled
          // 单个禁音
          this.$emit('handleMuteUser', muteUser, disabled)
        }
      } else {
        // 自己 开关麦克风
        const disabled = !isDisabled
        const volUser = this.list[index].userName
        this.$emit('handleVolUser', volUser, disabled)
      }
    },
    // 用户是否被禁音
    isMuteUser({ userName }) {
      return this.muteUserList.includes(userName)
    },
    // 用户扬声器禁音
    isVolUser({ userName }) {
      return this.volUserList.includes(userName)
    },
    // 名称格式化
    displayUserNameFix(userName) {
      return displayUserName(userName).split('!!')[0]
    }
  }
}
</script>

<style scoped>

</style>
