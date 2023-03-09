/**
 * @description     此文件 js 为electron主进程, main.js 工具类, 不准引入、import、 包含任何document，html, element-ui 等文档类型 的js 文件 或组件，否则会造成 进程 main.js 报错
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:02:02
 */

import { shell, nativeImage, clipboard } from "electron"
import fs from 'fs'

// 打开连接
export function openLink(href) {
  shell.openExternal(href, { activate: true })
    .then(result => {
    })
    .catch(e => {
      console.log('shell.openExternal error', e)
    })
}

// 文件是否存在
export function existsSync(path) {
  return fs.existsSync(path)
}

// 打开文件地址
export function showItemInFolder(fullPath) {
  shell.showItemInFolder(fullPath)
}

// 复制本地图片
export function copyImgFromLocal(imgPath) {
  if (existsSync(imgPath)) {
    const image = nativeImage.createFromPath(imgPath)
    clipboard.writeImage(image)
  }
}

// 复制base64图片
export function copyImgFromDataUrl(base64Image) {
  const image = nativeImage.createFromDataURL(base64Image)
  clipboard.writeImage(image)
}
