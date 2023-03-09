<!--
 * @Author: your name
 * @Date: 2021-08-20 14:14:14
 * @LastEditTime: 2022-04-29 10:27:16
 * @LastEditors: Please set LastEditors
 * @Description: 父级任务弹窗
 * @FilePath: \vsCode\task-pc-ui\src\components\drawerDetail\ParentTask.vue
-->
<template>
    <div>
        <el-dialog
            :visible.sync="dialogVisible"
            :modal="false"
            :before-close="handleClose">
            <template slot="title">
                <div class="tip"></div>父级任务
            </template>
            <div class="task-name" v-if="rowData.ptaskName">
                <span>{{rowData.ptaskName}}</span>
            </div>
        
            <div class="task-body">
                <div>{{rowData.name}}：</div>
                <div class="task-body-content" v-html="rowData.content"> <!-- {{rowData.content}} --> </div>
            </div>

            <div class="task-tags-box">
              <tags
                :iconName="item.iconName"
                :iconWidth="item.iconWidth"
                :iconHeight="item.iconHeight"
                :marginRight="item.margin"
                :maxWidth="item.maxWidth"
                :minWidth="item.minWidth"
                :width="item.width"
                :name="item.name"
                v-for="(item, index) in tagsData"
                :key="index"
                :isClick="item.isClick"
                :rowData="item"
                @click="changeShowTips"
                >
              </tags>
            </div>
            <div class="task-call-box">
                <div class="task-call-title" v-if="callData.length>0">交流沟通</div>
                <div class="task-call-body">
                    <div
                        v-for="(item, index) in callData"
                        :key="index"
                        class="task-call-item"
                    >
                        <div class="task-call-item-t">
                            <div>
                                <div class="task-call-i">{{ getIndex(index) }}、</div>
                                <div class="task-call-n">{{ item.feedbackName }}</div>
                            </div>
                            <div>
                                <div class="task-call-t">{{ formatTime(item.createTime) }}</div>
                            </div>
                        </div>
                        <div class="task-call-item-c">
                            <template v-for="(items,indexs) in item.contentList">
                                <span v-if="items.type=='text'"  v-html="items.content" :key="index+''+indexs"></span>
                                <img v-else-if="items.type=='img'" :key="index+''+indexs" :src="`${require('@/assets/images/chat/send-message/emoji/' +items.content)}`" class="emojiImg"  :alt="items.content" />
                            </template>
                        </div>
                        <div class="task-call-item-c file_list_box" v-if="item.feedbackType != 3">
                            <div v-for="(fileItem,index) in item.accessory" :key="index" class="file_list_item">
                                <el-dropdown trigger="click" @command="handleCommand">
                                    <div>
                                        <img src="@/assets/img/task/files.png" class="file_icon">
                                        <span>{{fileItem.fileName}}</span>
                                    </div>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item :command="`down,${JSON.stringify(fileItem)}`">下载</el-dropdown-item>
                                        <el-dropdown-item :command="`view,${ JSON.stringify(fileItem) }`">预览</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template slot="footer" class="dialog-footer">
                <div class="finish_button button" @click="handleClose()">关闭</div>
            </template>
        </el-dialog>

        <div class="img-masker" :style="show? 'display:block': ''">
        <div class="img-wrapper">
            <div class="preview-div">
            <img :src="imgUrl">
            </div>
            <div class="close-img">
            <img :src="closeImg" @click="closeImgFun">
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import tags from "@/components/tags/index";
import dayjs from "dayjs"
import { getTaskDetails } from '@/api/task'
import { emergencyLevelNew } from "@/const/dicData"
import { getFileUrl } from "@/api/task"
import { handleTransUrlAndDownLoadFile } from "@/utils/download"
export default {
    props: {
        pid: {
            type:  String,
            default: ""
        }
    },
    components: { tags },
    data() {
        return {
           dialogVisible: false,
           rowData:{},
           tagsData:[],
           callData: [],
           emergencyLevelNew:emergencyLevelNew,
           imgUrl: "",
           show: false,
            closeImg: require("@/assets/img/icon/closeImg.png")
        }
    },
    methods: {
        async init(pid) {
            this.dialogVisible = true
            this.tagsData = []
            await getTaskDetails({
                taskId: pid
            }).then(res=>{
                console.log(res.data.data)
                this.rowData = res.data.data
                let endTime = ''
                if(this.rowData.taskType == 0){
                    endTime = dayjs(this.rowData.endTime).format('YYYY-MM-DD')
                }else{
                    endTime = dayjs(this.rowData.endTime).format('YYYY-MM-DD HH:mm')
                }
                this.endTime = endTime;
                this.tagsData.push(
                    {
                        iconName:'time',
                        name:endTime + " 截止",
                        // width:'200',
                        iconWidth:16,
                        iconHeight:16,
                        // maxWidth:200,
                        margin:32 
                    }, {
                        iconName:'sender',
                        name:this.rowData.initiator + "发起",
                        // width:'200',
                        // maxWidth:200,
                        iconWidth:16,
                        iconHeight:16,
                        margin:0
                    }
                )
                // 调用解析方法
                this.parseExeAtt(JSON.parse(this.rowData.executeList),'implement','zxr')
                this.parseExeAtt(JSON.parse(this.rowData.attentionList),'follow','gzr')
                let emergencyLevelName = ''
                // 转换优先级
                this.emergencyLevelNew.forEach(item=>{
                    if(item.value == this.rowData.emergencyLevel){
                        emergencyLevelName = item.label
                    }
                })
                this.tagsData.push({
                    iconName:'status',
                    name:emergencyLevelName,
                    // width:'200',
                    // maxWidth:200,
                    iconWidth:16,
                    iconHeight:16,
                    margin:0
                })
                if(this.rowData.accessory && JSON.parse(this.rowData.accessory).length>0){
                    let accessoryFileList = JSON.parse(this.rowData.accessory)
                    let margin = 0
                    if(accessoryFileList.length != 1){
                        margin = 30
                    }
                    accessoryFileList.forEach(item=>{
                        this.tagsData.push({
                            type:'file',
                            iconName:'file',
                            name:item.fileName,
                            // width:'200',
                            iconWidth:16,
                            iconHeight:16,
                            // maxWidth:200,
                            data:item,
                        })
                    })
                }
                // 转换处理提醒
                if(this.rowData.acrossList && this.rowData.acrossList.length>0){
                    this.changeTags(this.rowData.acrossList)
                }
                    // 解析文本内容和文件列表
                this.rowData.list.forEach(item=>{
                    item.contentList = this.textAnalys(item.content && item.content.replace(/[\r\n]/g,""))
                    if(item.accessory){
                        item.accessory = JSON.parse(item.accessory)
                    }else{
                        item.accessory = []
                    }
                })
                this.callData = this.rowData.list
                console.log(this.callData)
            })
        },
        getIndex(val) {
            return this.callData.length - val;
        },
        formatTime(time) {
        // 如果消息是今年发送的，不显示年份
            if(dayjs(time).format("YYYY") === dayjs().format("YYYY")){
                return dayjs(time).format('MM-DD HH:mm')
            }
            return dayjs(time).format('YYYY-MM-DD HH:mm')
        } ,
        handleClose() {
            this.dialogVisible = false
        },
        changeShowTips(style,item){
            // 判断状态 执行人且状态小于等于2 才能唤起提醒
            if(this.userId == this.rowData.userId && this.row.state<=2){
                this.style = style
                this.$refs.remind.init(this.rowData);
            }
        },
        // 解析执行人、关注人
        parseExeAtt(list,iconName,type){
            let attentionList = list
            let attentionStr = '',isFirst = true
            if(attentionList.length>0){
                attentionList.forEach((item,index)=>{
                    if(index>0) attentionStr += '、'
                    attentionStr += item.username
                })
                this.tagsData.push({
                iconName:iconName,
                name:attentionStr+(type=='gzr'?'关注':"执行"),
                // width: '200',
                // maxWidth: 200,
                iconWidth:14,
                iconHeight:16,
                margin:0
                })
            }
        },
        textAnalys(newStr){
            let array = []
            let spliceStr = '',haveLeft = false
            if(newStr){
                for (var i = 0; i <newStr.length; i++) {
                    if(newStr[i]=='['){
                        if(!haveLeft){
                            haveLeft = true
                            if(( spliceStr +newStr[i]).indexOf!= 0){
                                array.push({
                                type:'text',
                                content:spliceStr
                                })
                                spliceStr = ''
                            }
                        }else{
                            array.push({
                                type:'text',
                                content:spliceStr
                            })
                            spliceStr = ''
                            haveLeft = false
                        }
                    }
                    spliceStr += newStr[i]
                    if(newStr[i]==']' && haveLeft){
                        let emojiName = this.getEmojiNameFormat(spliceStr)
                        if(emojiName==spliceStr){
                            array.push({
                                type:'text',
                                content:spliceStr
                            })
                        }else{
                            array.push({
                                type:'img',
                                content:emojiName
                            })
                        }
                        spliceStr = ''
                        haveLeft = false
                    }
                }
                if(spliceStr){
                    array.push({
                        type:'text',
                        content:spliceStr
                    })
                }
            }else{
                array.push({
                    type:'text',
                    content:newStr
                })
            }
            return array
        },
        // 下载/预览文件
        handleCommand(command){
            let head = command.slice(0,command.indexOf(","))
            let url = JSON.parse(command.slice(command.indexOf(",")+ 1)).url
            if(head == "down") {
                handleTransUrlAndDownLoadFile(url)
            }else {
                let result = "";
                let flag = false;
                let index = url.lastIndexOf(".");
                //获取后缀
                let ext = url.substr(index+1);
                const imglist = ['png', 'jpg', 'JPG', 'JPG', 'jpeg', 'bmp', 'gif'];
                result = imglist.find(item => item === ext);
                if (result) {
                    flag = true
                }
                if(flag) {
                    getFileUrl({url: url}).then(res => {
                        this.show = true
                        this.imgUrl = res.data.data.data
                    })
                }else {
                    this.$message.info("该文件不支持预览")
                }
            }
        },
        closeImgFun() {
            this.show = false
        },
    }
}
</script>

<style lang="scss" scoped>
    .tip {
        width: 3px;
        height: 18px;
        background: #3471FF;
        margin-right: 20px;
    }

    .el-dialog__header {
        font-size: 20px;
        font-family: SourceHanSansCN-Regular;
        color: #333333;
    }

    ::v-deep .v-modal {
        position: initial;
    }

    .task-name {
        padding: 14px 0px 18px;
        font-size: 14px;
        color: #868BA1;
    }

    .task-body {
        padding: 10px;
        min-height: 100px;
        background: #f6f6f6;
        font-size: 16px;
        color: #555555;
        .task-body-content {
            line-height: 20px;
            padding-top: 12px;
            font-size: 14px;
        }
    }
    .task-tags-box {
        display: flex;
        flex-wrap: wrap;
        margin-top: 8px;
        // justify-content: space-between;
        
    }
    .task-tags-tips {
        width: 96px;
        height: 32px;
        border: 1px solid #dcdfe6;
        opacity: 1;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-top: 20px;
        img{
            width: 11px;
            height: 13px;
        }
        .task-tags-tips-text {
            margin-left: 11px;
            font-size: 13px;
            color: #868ba1;
        }
    }
    .task-call-box {
        .task-call-title {
            font-size: 14px;
            color: #3471ff;
            padding: 16px 0px 18px;
        }
        .task-call-body {
            .task-call-item {
              >div{
                .user_head_avatar{
                  margin-right: 10px!important;
                }
              }
                .file_list_box{
                    margin-top: 0px;
                }
                .task-call-item-t {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    div {
                        display: flex;
                        align-items: center;
                        .task-call-i {
                            width: 50px;
                            height: 24px;
                            background: #ffffff;
                            // border: 1px solid #bfbfbf;
                            // border-radius: 50%;
                            font-size: 14px;
                            opacity: 1;
                            color: #333333;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .task-call-n {
                            //margin-left: 10px;
                            font-size: 14px;
                            font-weight: 400;
                            color: #333333;
                        }
                        .task-call-t {
                            font-size: 11px;
                            font-weight: 400;
                            color: #999999;
                        }
                        .task-call-d {
                            cursor: pointer;
                            margin-left: 10px;
                            font-size: 11px;
                            font-weight: 400;
                            color: #3471ff;
                            width: 30px;
                        }
                    }
                }
                .task-call-item-c {
                    padding-top: 4px;
                    margin-left: 50px;
                    max-width: 520px;
                    font-size: 14px;
                    font-weight: 400;
                    color: #999999;
                    display: flex;
                    flex-wrap: wrap;
                    opacity: 1;
                    display: flex;
                    flex-wrap: wrap;
                    .file_list_item{
                        cursor: pointer;
                    }
                    span{
                        word-break:normal;
                        width:auto;
                        // display:block;
                        white-space:pre-wrap;
                        word-wrap : break-word ;
                        overflow: hidden ;
                    }
                }
            }
            .task-call-item + .task-call-item {
                margin-top: 20px;
            }
        }
    }

    .el-dialog__footer {
        display: flex;
        justify-content: flex-end;
    }
    .button{
        cursor:pointer;
    }
    .finish_button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 96px;
        height: 32px;
        background: #3471ff;
        opacity: 1;
        border-radius: 4px;
        margin-left: 15px;
        color: #ffffff;
    }
</style>
