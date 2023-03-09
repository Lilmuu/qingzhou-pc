<template>
  <div class="list-item" v-route-to="'/information/new-friend'" @click="$utils.Primary.deleteNewMessageNumber({ jid: 'newFriendList' })">
    <div class="avatar"><img :src="$imgUrl.information.newFriendAvatar" alt=""></div>
    <div class="box vux-1px-b">
      <div class="top">
        <div class="nickname">新的朋友</div>
        <!-- <div class="time">昨天 16：41</div> -->
      </div>
      <div class="content">
        <div class="text">好友验证消息</div>
        <div class="icon" v-if="NewMessageNumberList['newFriendList']"><badge class="badge" :text="FormatMessageNumber"></badge></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      'NewMessageNumberList': state => state.Im.Information.NewMessageNumberList
    }),
    // 格式化消息数量
    FormatMessageNumber () {
      return this.NewMessageNumberList['newFriendList'] > 99 ? '···' : this.NewMessageNumberList['newFriendList']
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
