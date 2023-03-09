<!-- 已完成页面 -->
<template>
  <div class="" id="finishBox" v-if="finishVisible">
    <div class="finishMask" @click="handleClose"></div>
    <div class="finishBody">
      <!-- <TabLabelSlot slot="title" paddingLeft="0" :isIocn="false" :init-active-name="topTabActiveName" :option="topLabelOption">
          <template slot="right">
              <img src="@/assets/img/icon/close.png" class="close_icon" @click="handleClose">
          </template>
      </TabLabelSlot> -->
      <div class="box_title">
        <div>
          <span>任务确认</span>
        </div>
        <img src="@/assets/img/icon_close.png" class="close_icon" @click="handleClose">
      </div>

      <el-checkbox v-if="isSowCheckBox" 
        class="checkBox_remarks" 
        v-model="bringInFile" 
        @change="getNoteAndFile">带入子任务的备注及附件</el-checkbox>
      
      <div class="add_taskCont_right">
        <div class="cont">
          <el-input v-model="notes"
          ref="textarea"
          type="textarea"
          :autosize="{ minRows: 3,maxRows: 8 }"
          maxlength="3000"
          placeholder="请输入备注说明"></el-input>
          <div class="up_file">
            <UploadFileNew uploadText='添加附件'
              ref="addUploadFileNew"
              :accept='accept'
              :isSlotButton='true'
              :initFileList="accessoryList"
              :maxSize="1024*1024*20"
              @changeUpload='changeUpload'
              @onRemove="onRemove"
              :lineMode="false"
              :showFileLists="false"
              errorText='请上传正确的附件'
              >
                <div slot="uploadButton" class="task_enclosure_cont">
                  <img src="@/assets/img/mytodo/new_task/icon_upload.png" alt="">
                  <span>添加附件</span>
                </div>
              </UploadFileNew>
          </div>
        </div>
        <div class="file_list" v-if="getAllAccessoryList.length > 0">
          <div @click="previewFile(item)" class="file_box_item" v-for="(item,index) in getAllAccessoryList" :key="index">
            <div>
              <fileIcon :fileUrl="item.fileUrl"></fileIcon>
              <span>{{item.fileName}}</span>
            </div>
            <img class="close_btn" src="@/assets/img/close.png" @click.stop="delFiles(item)">
          </div>
        </div>
      </div>



      <!-- <el-input
          placeholder="请输入备注说明"
          v-model="notes"
          type="textarea"
          maxlength="3000"
          show-word-limit
          :autosize="{ minRows: 3, maxRows: 6 }"
        ></el-input> -->





      <!-- <div class="file_box">
        <div class="file_box_item" v-for="(item,index) in getAllAccessoryList" :key="index">
          <span style="cursor:pointer"  @click="previewFile(item)">{{item.fileName}}</span>
          <img src="@/assets/img/task/del.png" @click="delFiles(item)">
        </div>
      </div> -->
      <!--文件上传-->
      <!-- <UploadFileNew uploadText='添加附件'
        ref="finishUploadFileNew"
        
        :initFileList="accessoryList"
        :maxSize="1024*1024*20"
        @changeUpload='changeUpload'
        @onRemove="onRemove"
        :lineMode="true"
        :isSlotButton="true"
        :showFileLists="true"
        errorText='请上传正确的附件'
      >
        <template slot="uploadButton">
          <div class="addFile">
            <img src="@/assets/img/task/add_cicr.png">
            <span>添加附件</span>
          </div>
        </template>
      </UploadFileNew> -->
      <div class="button_box">
        <el-button type="primary" class="long_name" size="small" @click="finishProject">确认项目已完成</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import TabLabelSlot from '@/components/TabLabelSlot/index'
import UploadFileNew from '@/components/UploadFile/UploadFileNew'
import { getChildTaskDetail,submitTaskOver } from '@/api/task' 
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {TabLabelSlot,UploadFileNew},
  props:{
    taskId:{
      type:String
    },
    rowData:{
      type:Object
    },
    accept: {
      type: String,
      default: '.pdf, .ppt, .pptx, .doc, .docx, .doc, .rar, .zip, .jpg, .bmp, .png, .xlsx, .xls, application/pdf'
    },
  },
  data() {
    // 这里存放数据
    return {
      finishVisible: false,
      topTabActiveName:'ywc',
      topLabelOption:[
            { label: '已完成', name: 'ywc' }],
      bringInFile:false,
      isSowCheckBox: true,
      notes:'',
      bringInNotes:'',
      accessoryList:[],
      bringInAccessoryList:[]
    };
  },
  // 监听属性 类似于data概念
  computed: {
    getAllAccessoryList(){
      console.log([...this.bringInAccessoryList,...this.accessoryList])
      return [...this.bringInAccessoryList,...this.accessoryList]
    }
  },
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    // 完成任务
    finishProject(){
      // if(!this.notes){
      //   this.$message.warning("备注不能为空");
      //   return
      // }
      if(/^(?!(\s+$))/.test(this.notes) == false) {
        this.$message.warning("不能发送空白内容")
        return ;
      }
      let content = this.notes.replace(/\n/g, '<br/>')
      submitTaskOver(Object.assign(this.rowData,{
        remarks: content,
        accessory:JSON.stringify([...this.bringInAccessoryList,...this.accessoryList])
      })).then(res=>{
        if(res.data.code==200){
          this.$message.success('已提交完成申请')
          this.$emit('refrsh')
          this.handleClose()
        }else if(res.data.code==205){
          this.$message.warning(res.data.msg)
           this.$emit('refrsh')
        }
      })
    },
    getNoteAndFile(){
      if(this.bringInFile){
        getChildTaskDetail({taskId:this.taskId}).then(res=>{
          if(res.data.code==200){
            this.bringInAccessoryList = JSON.parse(res.data.data.accessory)
            this.bringInNotes = res.data.data.remarks
            // this.notes = res.data.data.remarks
            let content = res.data.data.remarks
            this.notes = content?content.replace(/<br\/>/g, '\n'):content
          }
        })
      }else{
        this.bringInAccessoryList = []
        this.bringInNotes = ''
        this.notes = ''
      }
    },
    handleClose() {
      this.finishVisible = false;
    },
    init() {
      this.accessoryList = []
      this.finishVisible = true;
      getChildTaskDetail({taskId:this.taskId}).then(res=>{
          if(res.data.code==205){
            this.bringInFile = false;
            this.isSowCheckBox = false
          }else if(res.data.code==200) {
            //this.notes = res.data.data.remarks
            this.isSowCheckBox = true
          }
        })
    },
    previewFile(item){
      const url = item.fileUrl
      const name = item.name
      const imglist = ['png', 'jpg', 'JPG', 'jpeg', 'bmp', 'gif','docx','doc','pdf','xlsx'];
      if(imglist.find(item => item == name.split('.')[name.split('.').length - 1])) {
        localStorage.setItem('setPreviewUrl',JSON.stringify({url,name}))
        this.$electron.ipcRenderer.send('create-preview-window',{url,name})
      }else {
          this.$message.info("该文件不支持预览")
      }
    },
    // 综合删除文件
    delFiles(item){
      if(item.type){
        this.accessoryList.forEach((items,index)=>{
          if(items==item){
            this.delFile(index)
          }
        })
      }else{
        let fIndex = -1
        this.bringInAccessoryList.forEach((items,index)=>{
          if(items==item){
            fIndex = index
          }
        })
        if(fIndex>-1){
          this.bringInAccessoryList.splice(fIndex,1)
        }
      }
    },
    // 删除文件
    delFile(index){
      this.accessoryList.splice(index,1)
      this.$refs.finishUploadFileNew.delFile(index)
    },
    // 文件上传成功回调
    changeUpload(data) {
      this.accessoryList.push({
        ...data.res,
        type:'up'
      })
      console.log(this.accessoryList)
    },
    // 文件删除回调
    onRemove(file, fileList) {
      // 有 response 的
      let url = file.url
      if (file.response) {
        url = file.response.data.url
      }
      // 过滤 url
      this.accessoryList = this.accessoryList.filter(item => item.url !== url)
    },
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {}, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang='scss'>
//@import url(); 引入公共css类
#finishBox {
  .finishMask {
    position: fixed;
    top: 0px;
    left: 0;
    height: 100vh;
    width: 100vw;
  }
  .finishBody {
    position: fixed;
    top: 50%;
    right: 60px;
    transform: translateY(-50%);
    width: 441px;
    background: #ffffff;
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.12);
    opacity: 1;
    user-select: none;
    border-radius: 5px;
    margin-top: 10px;
    padding: 0 16px 30px;
    .box_title{
      display: flex;
      justify-content: space-between;
      align-items: center;
      >div{
        height: 68px;
        color: #333333;
        font-size: 18px;
        font-family: 'SourceHanSansCN-Medium';
        line-height: 68px;
        position: relative;
        // &::before{
        //   content: "";
        //   width: 100%;
        //   height: 4px;
        //   position: absolute;
        //   top: 0;
        //   left: 0;
        //   background-color: #3471FF;
        // }
      }
    }
    .checkBox_remarks{
      margin-bottom: 10px;
      color: #646A73;
    }
    .tabRowSlot{
      width: calc(100vw - 260px - 80px)!important;
    }
    .close_icon{
      width: 14px;
      cursor: pointer;
    } 
    textarea {
      // height: 32px !important;
      min-height: 32px !important;
      opacity: 1;
      border-radius: 4px;
      border: none;
      resize: none;
    }
    .addFile{
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 96px;
      height: 32px;
      border: 1px solid #DCDFE6;
      opacity: 1;
      font-size: 13px;
      color: #868BA1;
      border-radius: 16px;  
    }
    .button_box{
      margin-top: 30px;
      text-align: right;
      .long_name{
        width: 100px;
      }
    }
    .file_box{
      display: flex;
      flex-wrap: wrap;
      .file_box_item{
        margin-top: 12px;
        margin-bottom: 12px;
        margin-right: 12px;
        padding:0px 11px;
        height: 32px;
        background: #F6F6F6;
        opacity: 1;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        font-size: 13px;
        color: #3471FF;
        img{
          margin-left:16px;
          width: 14px;
          height:14px;
          cursor: pointer;
        }
      }
    }

    .add_taskCont_right{
      .cont{
        border: 1px solid #DCDFE6;
        padding: 0 10px;
        border-radius: 6px;
        .el-textarea{
          border-bottom: 1px solid #F2F2F2;
          .el-textarea__inner{
            padding: 0;
            margin: 5px 0;
            border: none!important;
            &::-webkit-scrollbar{
              display: none;
            }
          }
        }
        .up_file{
          height: 40px;
          width: 84px;
          line-height: 40px;
          margin-left: auto;
          img{
            width: 16px;
            margin-right: 10px;
          }
          .task_enclosure_cont{
            display: flex;
            align-items: center;
            justify-content: flex-end;
            color: #409EFF;
            border-color: #409EFF;
          }
        }
      }
      .file_list{
        padding-bottom: 30px;
        border-bottom: 1px solid #F2F2F2;
        .file_box_item{
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #BBBFC4;
          padding: 10px 20px 10px 10px;
          margin-top: 10px;
          cursor: pointer;
          background-color: #FBFBFC;
          border-radius: 6px;
          div{
            display: flex;
            align-items: center;
            img{
              width: 16px;
              margin-right: 10px;
            }
          }
          .close_btn{
            width: 10px;
          }
          .file-ico{
            width: auto;
          }
        }
      }
      .el-upload-list.el-upload-list--text{
        display: none;
      }
    }
  }
}
</style>