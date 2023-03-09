<template>
    <div style="height: 100%;display: flex;flex-flow: column;">
        <div class="titleShare app_top_bar">
            <div>
                <span class="noDrag" @click="cancelShare">取消共享</span>
            </div>
            <img @click="showMeetingRoom" src="@/assets/img/meeting/fangda.png" alt="" class="noDrag">
        </div>
        <div class="flex-center" style="flex: 1;">
            <HeadAvatar 
                :size="60" 
                :fontSize='18'
                :avatarUrl="imgUrl" 
                :username="username">
            </HeadAvatar>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HeadAvatar from "@/components/headAvatar"

export default {
    name: 'WorkspaceJsonMeetingshareshrink',
    components:{
        HeadAvatar
    },
    data() {
        return {
            imgUrl:localStorage.getItem('headAvatar')
        };
    },
    mounted() {
    },
    computed:{
        ...mapGetters(['username']),
    },
    methods: {
        cancelShare(){
            this.$electron.ipcRenderer.send('meeting-window-shareShrink-close')
            // this.$electron.ipcRenderer.send('meeting-window-show',{showIcon:false})
        },
        showMeetingRoom(){
            this.$electron.ipcRenderer.send('meeting-share-window-hide')
            this.$electron.ipcRenderer.send('meeting-window-show',{showIcon:true})
        }
    },
};
</script>

<style lang="scss" scoped>
.titleShare{
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #F3F3F3;
    >div{
        flex: 1;
        display: flex;
        justify-content: center;
        span{
            margin-left: 30px;
            cursor:pointer;
            color:red;
            font-size:15px;
        }
    }
    img{
        width: 23px;
        height: 23px;
        cursor: pointer;
        margin-right: 10px;
    }
}
.avatar-wrapper {
    width: 60px;
    height: 60px;
    background: #3471FF;
    color: #fff;
    font-size: 18px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid #fff;
}
.noDrag {
  -webkit-app-region: no-drag;
}
</style>