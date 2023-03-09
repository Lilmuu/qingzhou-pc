/*
 * @Author: your name
 * @Date: 2021-12-16 16:16:07
 * @LastEditTime: 2022-02-18 16:12:44
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\utils\imUtil\file.js
 */
export default {
  /**
   * 获取文件大小
   * @param  {Number} fileSize
   * @return {String}
   */
  getFileSize (fileSize) {
    var arrUnit = ["B", "KB", "MB", "GB", "TB", "PB"];
    var powerIndex = Math.log2(fileSize) / 10;
    powerIndex = Math.floor(powerIndex);
    // index should in the unit range!
    var len = arrUnit.length;
    powerIndex = powerIndex < len ? powerIndex : len - 1;
    var sizeFormatted = fileSize / Math.pow(2, powerIndex * 10);
    sizeFormatted = sizeFormatted.toFixed(2);
    return sizeFormatted + " " + arrUnit[powerIndex];
  },

  /**
   * 获取文件后缀名类型
   * @param  {Object} file
   * @return {Number}
   */
  getFileExtType (file) {
    let fileType = 9
    const fileLastName = this.getFilenameExt(file)
    if (fileLastName === 'jpg' ||  fileLastName === 'JPG' ||  fileLastName === 'jpeg' || fileLastName === 'gif' || fileLastName === 'png') fileType = 1
    else if (fileLastName === 'mp3') fileType = 2
    else if (fileLastName === 'mp4' || fileLastName === 'avi') fileType = 3
    else if (fileLastName === 'ppt' || fileLastName === 'pptx') fileType = 4
    else if (fileLastName === 'xls' || fileLastName === 'xlsx') fileType = 5
    else if (fileLastName === 'doc' || fileLastName === 'docx') fileType = 6
    else if (fileLastName === 'rar' || fileLastName === 'zip') fileType = 7
    else if (fileLastName === 'txt') fileType = 8
    else if (fileLastName === 'pdf') fileType = 10
    else if (fileLastName === 'apk') fileType = 11
    else fileType = 9
    return fileType
  },
  /**
   * 文件类型图片Url
   * @param  {Object} file
   * @param  {Object} imgUrl
   * @return {Number}
   */
  FileTypeImageUrl (file, imgUrl) {
    let url = ''
    const type = parseInt(file.fileTime) || parseInt(file.timeLen) || parseInt(file.type) || parseInt(file)
    if (type === 1) url = file.url
    else if (type === 2) url = imgUrl.common.files.mp3
    else if (type === 3) url = imgUrl.common.files.video
    else if (type === 4) url = imgUrl.common.files.ppt
    else if (type === 5) url = imgUrl.common.files.xls
    else if (type === 6) url = imgUrl.common.files.doc
    else if (type === 7) url = imgUrl.common.files.zip
    else if (type === 8) url = imgUrl.common.files.txt
    else if (type === 10) url = imgUrl.common.files.pdf
    else if (type === 11) url = imgUrl.common.files.app
    else url = imgUrl.common.files.what
    return url
  },

  /**
   * 返回文件后缀
   * @param  {Object} file
   * @return {String}
   */
  getFilenameExt (file) {
    const types = file.name.split('.')
    return types[types.length - 1]
  },

  /**
   * 生成文件名
   * @param  {Object} file
   * @return {String}
   */
  randFilename (file) {
    return this.randString(this.rand(10, 100)) + Date.parse(new Date()) + '.' + this.getFilenameExt(file)
  }
}
