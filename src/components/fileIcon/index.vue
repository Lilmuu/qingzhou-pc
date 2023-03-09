<!--
 * @Author: your name
 * @Date: 2022-04-15 14:16:42
 * @LastEditTime: 2022-04-25 18:01:10
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\components\fileIcon\index.vue
-->
<template>
    <div class="file-ico">
      <img :src="filePath" alt=""  :style="{width: fileWidth}"/>
    </div>
</template>

<script>
  import { getFileSuffix } from "@/utils/index";
  export default {
      props: {
        fileUrl: {
          type: String,
          default: "defalut"
        },
        fileWidth:{
          type: String,
          default: ()=>{
            return '18px'
          }
        }
      },
      computed: {
        filePath() {
          let fileType =  getFileSuffix(this.fileUrl).substring(1)
          let path = ""
          switch (fileType) {
            case "jpg":
              path = "jpg"
              break;
            case "jpeg":
              path = "jpg"
              break;
            case "png":
              path = "png"
              break;
            case "doc":
              path = "doc"
              break;
            case "docx":
              path = "doc"
              break;
            case "xls":
              path = "xls"
              break;
            case "xlsx":
              path = "xls"
              break;
            case "7z":
              path = "7z"
              break;
            case "rar":
              path = "rar"
              break;
            case "zip":
              path = "zip"
              break;
            case "exe":
              path = "exe"
              break;
            case "pdf":
              path = "pdf"
              break;
            default:
              path = "default"
              break;
          }
          let imgPath = require(`@/assets/img/workSpace/icon_file_${path}.png`)
          return imgPath
        }
      },
      data() {
        return {
          icoPath: this.filePath,
        }
      },
    }
</script>

<style scoped>
.file-ico {
  display: inline-flex;
  align-items: center;
}
</style>
