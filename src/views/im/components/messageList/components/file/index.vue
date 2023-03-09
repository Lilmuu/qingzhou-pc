<!-- 位置消息-左 -->
<template>
  <div :class="isShowLeftModule ? 'left common' : 'common'">
    <div class="avatar">
      <!-- <Avatar :username="message.fromUserName"></Avatar> -->
      <headAvatar 
        :size="32" 
        :fontSize='12'
        :avatarUrl="userAvatar" 
        :username="message.fromUserName">
      </headAvatar>
    </div>
    <div class="content">
      <!-- 群昵称 -->
      <div class="nickname" v-show="params.type === 'room' && isShowLeftModule">{{message.fromUserName}}</div>
      <!-- 消息气泡 -->
      <div class="bubble">
        <!-- 消息体 -->
        <div class="card message-body file-message-body cursor no_message_text" ref="longTouch" @click="handleDownLoadFile(message)">
          <div class="file-box">
            <div class="file-img">
              <fileIcon :fileUrl="message.content" fileWidth='36px'></fileIcon>
            </div>
            <div class="file_info">
              <div class="file_name">{{message.fileName?message.fileName:message.objectId}}</div>
              <!-- <div>{{ message }}</div> -->
              <div>{{ fileSizeComp(message.fileSize) }}</div>
            </div>
          </div>
          <!-- <el-progress class="file-download-bar"
            :percentage="downloadProgressItem(message.content).percent"
            :show-text="false"
            v-if="showDownloadProgressItem(message.content)"></el-progress>
          <div :class="['file-type', showDownloadProgressItem(message.content) ? '' : 'file-type-topBorder']">文件</div> -->
        </div>
        <!-- 单聊是否已读 -->
        <template v-if="params.type === 'friend' && !isShowLeftModule">
          <div class="readTip have-read" v-if="message.isRead">已读</div>
          <div class="readTip unread" v-else>未读</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import File from './mixin'
  import headAvatar from "@/components/headAvatar"
  import { handleDownLoadFile } from "@/utils/download";
  import { existsSync, showItemInFolder } from "@/utils/pure";
  import MenuMixin from "@/views/im/components/messageList/components/mixins/menu";

  export default {
    mixins: [File, MenuMixin],
    props: {
      params: {
      },
      // 消息对象
      message: {
        type: Object, default: () => {
          return {}
        }
      },
      isShowLeftModule: {
        type: Boolean,
        default: false
      },
      userAvatar:{
        type: String,
        default: ''
      }
    },
    components: {
      headAvatar
    },
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        downloadProgressItem: 'Common/UpdateFile/downloadProgressItem',
        showDownloadProgressItem: 'Common/UpdateFile/showDownloadProgressItem',
      }),
      fileSizeComp(){
        return (size)=>{
          let fileSize
          if(size < 1000){
            return `${size}B`
          }else if( size < 1000 * 1024 ){
            fileSize = (size/1024).toFixed(2)
            return `${fileSize}KB`
          }else if( size < 1000 * 1024 * 1024){
            fileSize = (size/(1024*1024)).toFixed(2)
            return `${fileSize}MB`
          }else if( size < 1000 * 1024 * 1024 *1024){
            fileSize = (size/(1024*1024*1024)).toFixed(2)
            return `${fileSize}GB`
          }else{
            return '0B'
          }
          
        }
      }
    },
    methods: {
      // 下载文件
      handleDownLoadFile(message) {
        let url = message.content
        if (!url) {
          this.$message.error('资源链接不存在')
          return
        }
        // 已下载的，直接打开
        if(this.showDownloadProgressItem(message.content) && this.downloadProgressItem(message.content).percent === 100) {
          const savePath = this.downloadProgressItem(message.content).savePath
          // 文件已经下载了，直接打开
          if(savePath && existsSync(savePath)) {
            showItemInFolder(savePath)
            return;
          }
        }
        handleDownLoadFile(url)
      },
    },
  }
</script>
