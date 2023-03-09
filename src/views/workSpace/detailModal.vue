<!--
 * @Author: your name
 * @Date: 2021-12-16 16:16:07
 * @LastEditTime: 2022-02-18 16:10:26
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\views\workSpace\detailModal.vue
-->
<template>
  <div id="detailModal-box">
    <el-drawer
      title=""
      :visible.sync="drawer"
      direction="rtl"
      style="padding-top: 30px;"
    >
      <div class="myDetailModal">
        <div class="DetailModalTitle">{{drawerInfo.title}}</div>
        <div class="textContent" v-html="drawerInfo.content"></div>
        <div class="fileList">
          <div v-for="(item,index) in drawerInfo.fileUrls" :key="index">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="file-item">
                <div class="file-name">
                  <!--<img src="@/assets/img/workSpace/file-ico.png" alt="">-->
                  <fileIcon  :fileUrl="item.fileName"></fileIcon>
                  <span>{{item.fileName}}</span>
                </div>
                <!--<div class="download-ico"></div>-->
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="`down,${JSON.stringify(item)}`">下载</el-dropdown-item>
                <el-dropdown-item :command="`view,${JSON.stringify(item)}`">预览</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import { handleDownLoadFile } from "@/utils/download"
export default {
    props:{
        drawerInfo:{
            type:Object,
            default:{}
        }
    },
    data() {
        return {
            drawer: false,
        };
    },
    methods:{
        handleCommand(command){
            let head = command.slice(0,command.indexOf(","))
            let url = JSON.parse(command.slice(command.indexOf(",")+ 1)).url
            let name = JSON.parse(command.slice(command.indexOf(",")+ 1)).fileName
            if(head == "down") {
                handleDownLoadFile(url)
            }else {
                const imglist = ['png', 'jpg', 'JPG', 'jpeg', 'bmp', 'gif','docx','doc','pdf','xlsx'];
                if(imglist.find(item => item == name.split('.')[name.split('.').length - 1])) {
                  localStorage.setItem('setPreviewUrl',JSON.stringify({url,name}))
                  this.$electron.ipcRenderer.send('create-preview-window',{url,name})
                }else {
                    this.$message.info("该文件不支持预览")
                }
            }
        },
    }
}
</script>
<style lang="scss" scoped>
  .myDetailModal {
    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 32px;
      margin-bottom: 10px;
      margin-right: 10px;
      padding: 7px 10px;
      background-color: #FBFBFC;
      border-radius: 6px;
      overflow: hidden;
      transition: all .3s linear;
      &:hover {
        background-color: #EAF0FF;
      }
      .file-name {
        width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .download-ico {
        width: 14px;
        height: 14px;
        background: url("../../assets/img/workbench/download.png") no-repeat center/cover;
      }
    }
  }
  ::v-deep .el-dropdown-menu__item:focus, ::v-deep  .el-dropdown-menu__item:not(.is-disabled):hover {
    color: #646A73;
    background-color: #F5F6F7;
  }
  #detailModal-box ::v-deep {
    .el-drawer__header > :first-child {
      border-bottom: 0;
      &:before {
        display: none;
      }
    }
    .el-drawer__close-btn {
      border-bottom: 0;
    }
    .el-drawer__wrapper {
      padding-top: 42px!important;
    }
  }
</style>
