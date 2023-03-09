<template>
  <div class="preview">
    <PreviewNavBar :navBarTitle="navBarTitle" />
    <div class="previewMain">
      <div
        class="previewContent"
        :style="{ background: showImg ? '' : '#f3f3f3' }"
      >
        <div
          :style="{
            width: previewStatus !== 'xlsx' ? pdfWidth + 'px' : '100%',
            'font-size': previewStatus == 'docx' ? wordFontSize + 'px' : '',
            height:
              previewStatus == 'xlsx' || previewStatus == 'docx' ? '100%' : '',
          }"
          ref="pdfWrapper"
        >
          <template v-if="previewStatus == 'pdf'">
            <pdf
              :src="src"
              v-for="item in numPages"
              :key="item"
              :page="item"
              class="pdfwrap"
            >
            </pdf>
          </template>
          <div v-if="previewStatus == 'docx'" class="wordWrap">
            <iframe
              id="iFrame"
              ref="iframs"
              :src="wordHtml"
              frameborder="0"
              width="100%"
              style="margin-top: -80px; height: calc(100vh - 10px)"
            ></iframe>
          </div>
          <div v-if="previewStatus == 'xlsx'" class="excelWrap">
            <div
              id="luckysheet"
              style="
                margin: 0px;
                padding: 0px;
                position: absolute;
                left: 0px;
                width: 100%;
                height: calc(100vh - 90px);
              "
            ></div>
          </div>
          <img
            :src="imgUrl"
            v-if="showImg"
            ref="rotateEl"
            alt=""
            style="width: 100%; height: 100%; margin-top: 10px"
          />
        </div>
      </div>
      <div class="actionBar" style="">
        <img
          @click="zoomIn"
          :class="{ zoomGray: zoomInGray }"
          src="@/assets/img/preview/icon_jia.png"
          alt=""
        />
        <img
          @click="zoomOut"
          :class="{ zoomGray: zoomOutGray }"
          src="@/assets/img/preview/icon_jian.png"
          alt=""
        />
        <img
          @click="downLoad"
          src="@/assets/img/preview/icon_download.png"
          alt=""
        />
        <img
          @click="rotateImg"
          src="@/assets/img/preview/icon_rotate.png"
          alt=""
          v-if="showImg"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PreviewNavBar from "@/views/layout/components/PreviewNavbar";
import pdf from "vue-pdf";
import { handleTransUrlAndDownLoadFile } from "@/utils/download";
import { wordConvertPdf } from "@/api/task";
import LuckyExcel from "luckyexcel";

export default {
  name: "WorkspaceJsonPreview",
  components: { PreviewNavBar, pdf },
  data() {
    return {
      numPages: null,
      src: "",
      zoomInGray: false,
      zoomOutGray: false,
      pdfWidth: 600,
      downLoadUrl: "",
      wordHtml: "",
      wordFontSize: 12,
      previewStatus: "",
      excelHtml: "",
      excelFontSize: 14,
      imgUrl: "",
      rotate: 0,
      sheetObj: {},
      navBarTitle: "",
    };
  },
  computed: {
    showImg() {
      const imglist = ["png", "jpg", "JPG", "jpeg", "bmp", "gif"];
      const result = imglist.find((item) => item === this.previewStatus);
      if (result) return true;
      else return false;
    },
  },
  mounted() {
    this.catchUrl();
    this.$electron.ipcRenderer.on("loadNewPreviewUrl", (event, data) => {
      window.location.href = data.meetingUrl;
      window.location.reload();
      this.previewStatus =
        data.info.url.split(".")[data.info.url.split(".") - 1];
      this.navBarTitle = data.info.name;
      this.getFilesInfo(data.info.url);
    });
    setTimeout(() => {
      const ElMenu = document.querySelector('#luckysheet-sheets-m')
      if(ElMenu){
        ElMenu.addEventListener('click',this.replaceCheckIcon)
      }
    },2000)
  },
  methods: {
    replaceCheckIcon(){
      this.$nextTick(() => {
        const ElCheck = document.querySelector('.fa-check')
        ElCheck.className = 'el-icon-check'
      })
    },
    catchUrl() {
      let urlInfo = JSON.parse(localStorage.getItem("setPreviewUrl"));
      this.previewStatus =
        urlInfo.url.split(".")[urlInfo.url.split(".").length - 1];
      this.navBarTitle = urlInfo.name;
      this.getFilesInfo(urlInfo.url);
    },
    getFilesInfo(url) {
      this.downLoadUrl = url;
      if (this.previewStatus == "pdf") {
        this.src = pdf.createLoadingTask(url);
        this.src.promise.then((pdf) => {
          this.numPages = pdf.numPages;
        });
      } else if (this.previewStatus == "docx") {
        this.fetchWord(url);
      } else if (this.previewStatus == "xlsx") {
        this.fetchExcel(url);
      } else if (this.showImg) {
        this.imgUrl = url;
      }
    },
    fetchWord(url) {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          let msgForm = new FormData();
          msgForm.append("file", blob);
          wordConvertPdf(msgForm).then((result) => {
            this.previewStatus = "pdf";
            const url = window.URL.createObjectURL(
              new Blob([result.data], { type: "application/pdf" })
            );
            this.src = pdf.createLoadingTask(url);
            this.src.promise.then((pdf) => {
              this.numPages = pdf.numPages;
            });
          });
        });
    },
    fetchExcel(url) {
      LuckyExcel.transformExcelToLuckyByUrl(
        url,
        "test",
        (exportJson, luckysheetfile) => {
          if (exportJson.sheets == null || exportJson.sheets.length == 0) {
            alert(
              "Failed to read the content of the excel file, currently does not support xls files!"
            );
            return;
          }

          window.luckysheet.destroy();

          window.luckysheet.create({
            container: "luckysheet",
            showinfobar: false,
            showtoolbar: false,
            allowEdit: false,
            showsheetbarConfig: {
              add: false,
            },
            showstatisticBar: false,
            showstatisticBarConfig: {
              count: false,
              view: false,
              zoom: false,
            },
            enableAddRow: false,
            enableAddBackTop: false,
            data: exportJson.sheets,
            title: exportJson.info.name,
            userInfo: false,
            cellRightClickConfig: {
              copy: false, // 复制
              copyAs: false, // 复制为
              paste: false, // 粘贴
              insertRow: false, // 插入行
              insertColumn: false, // 插入列
              deleteRow: false, // 删除选中行
              deleteColumn: false, // 删除选中列
              deleteCell: false, // 删除单元格
              hideRow: false, // 隐藏选中行和显示选中行
              hideColumn: false, // 隐藏选中列和显示选中列
              rowHeight: false, // 行高
              columnWidth: false, // 列宽
              clear: false, // 清除内容
              matrix: false, // 矩阵操作选区
              sort: false, // 排序选区
              filter: false, // 筛选选区
              chart: false, // 图表生成
              image: false, // 插入图片
              link: false, // 插入链接
              data: false, // 数据验证
              cellFormat: false, // 设置单元格格式
            },
            sheetRightClickConfig: {
              delete: false, // 删除
              copy: false, // 复制
              rename: false, //重命名
              color: false, //更改颜色
              hide: false, //隐藏，取消隐藏
              move: false, //向左移，向右移
            },
            sheetFormulaBar: false,
            hook: {
              cellUpdateBefore: () => {
                return false;
              },
              sheetActivate: (i) => {
                this.zoomStatus(i - 1);
              },
            },
          });
          window.luckysheet.setSheetActive(0);
          window.luckysheet.getAllSheets().map((item, index) => {
            if (item) {
              this.sheetObj["sheetIndex" + index] = 1;
            }
          });
        }
      );
    },
    zoomIn() {
      if (this.previewStatus == "xlsx") {
        const order = window.luckysheet.getSheet().order;
        if (this.sheetObj["sheetIndex" + order] == 3) return;
        this.sheetObj["sheetIndex" + order] += 0.25;
        window.luckysheet.setSheetZoom(this.sheetObj["sheetIndex" + order]);
        this.zoomStatus(order);
      } else {
        if (this.pdfWidth < 2100) {
          this.pdfWidth += 150;
          this.wordFontSize += 2;
          this.excelFontSize += 2;
          this.scaleEl();
        }
      }
    },
    zoomOut() {
      if (this.previewStatus == "xlsx") {
        const order = window.luckysheet.getSheet().order;
        if (this.sheetObj["sheetIndex" + order] == 0.25) return;
        this.sheetObj["sheetIndex" + order] -= 0.25;
        window.luckysheet.setSheetZoom(this.sheetObj["sheetIndex" + order]);
        this.zoomStatus(order);
      } else {
        if (this.pdfWidth > 300) {
          this.pdfWidth -= 150;
          this.wordFontSize -= 2;
          this.excelFontSize -= 2;
          this.scaleEl();
        }
      }
    },
    scaleEl() {
      this.pdfWidth == 2100
        ? (this.zoomInGray = true)
        : (this.zoomInGray = false);
      this.pdfWidth == 300
        ? (this.zoomOutGray = true)
        : (this.zoomOutGray = false);
      this.$refs.pdfWrapper.style.width = this.pdfWidth;
    },
    zoomStatus(order) {
      this.sheetObj["sheetIndex" + order] == 3
        ? (this.zoomInGray = true)
        : (this.zoomInGray = false);
      this.sheetObj["sheetIndex" + order] == 0.25
        ? (this.zoomOutGray = true)
        : (this.zoomOutGray = false);
    },
    downLoad() {
      handleTransUrlAndDownLoadFile(this.downLoadUrl);
    },
    rotateImg() {
      if (this.rotate == 360) {
        this.rotate = 0;
      }
      this.rotate += 90;
      this.$refs.rotateEl.style.transform = `rotate(${this.rotate}deg)`;
    },
  },
};
</script>

<style lang="scss" scoped>
.preview {
  height: 100%;
  display: flex;
  flex-flow: column;
  .previewMain {
    height: 100%;
    flex: 1;
    .previewContent {
      height: calc(100vh - 90px);
      width: 100%;
      overflow: auto;
      > div {
        margin: 0 auto;
      }
      .pdfwrap {
        width: 100%;
        padding-bottom: 30px;
      }
      ::v-deep .wordWrap {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      ::v-deep .excelWrap {
        width: 100%;
        height: 100%;
      }
    }
    .actionBar {
      width: 100%;
      height: 50px;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        cursor: pointer;
        margin-right: 30px;
        width: 24px;
        height: 24px;
      }
      img:nth-last-of-type(1) {
        margin-right: 0;
      }
    }
  }
  .zoomGray {
    opacity: 0.4;
  }
}
::v-deep #luckysheet-sheets-leftscroll, ::v-deep #luckysheet-sheets-rightscroll{
  display:none!important;
}
</style>