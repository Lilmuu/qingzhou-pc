/**
 * @description     electron 下载事件封装
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:19:13
 */

import { Message } from "element-ui"
const request = require('request')
const fs = require('fs')
import { remote, shell } from 'electron'
import { getFileUrl } from "@/api/task"

const mainWindow = remote.getCurrentWindow()
const { dialog } = remote

// const {ipcMain} = require('electron')
// let savepath =

// 弹窗获取文件夹路径
export const getFolderPath = () => {
  return new Promise((resolve, reject) => {
    dialog
      .showOpenDialog({
        properties: ['openDirectory']
      }, (result) => {
        if (result[0]) {
          resolve(result[0])
        } else {
          reject(result)
        }
      })
  })
}

/**
 * 下载文件
 * @param   file_url    {String} 下载url
 * @param   cb          {Function}回调函数
 * */
export const downloadFile = (file_url, cb) => {
  getFolderPath().then(targetPath => {
    let received_bytes = 0
    let total_bytes = 0

    const req = request({
      method: 'GET', uri: file_url
    })

    const out = fs.createWriteStream(targetPath)
    req.pipe(out)

    req.on('response', function(data) {
      // Change the total bytes value to get progress later.
      total_bytes = parseInt(data.headers['content-length' ])
    })

    req.on('data', function(chunk) {
      // Update the received bytes
      received_bytes += chunk.length

      // 下载回调
      const cbData = {
        type: 'downloading',
        received: received_bytes,
        total: total_bytes
      }
      cb(cbData)
      showProgress(received_bytes, total_bytes)
    })

    // 下载完成回调
    req.on('end', function() {
      const cbData = {
        type: 'success'
      }
      cb(cbData)
      console.log('File successfully downloaded')
    })
  }).catch(err => {
    const data = {
      type: 'error',
      err
    }
    cb(data)
    console.log(err)
  })
}

export const showProgress = (received, total) => {
  const percentage = (received * 100) / total
  console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.")
}

// 转换文件地址并在浏览器中打开下载
export const handleTransUrlAndDownLoadFile = (url) => {
  const query = {
    url
  }
  getFileUrl(query).then(res => {
    if (res.data.code === 200) {
      const url = res.data.data.data
      handleDownLoadFile(url)
    }
  })
}

// 转换文件地址并在浏览器中打开下载
export const handleDownLoadFile = (url) => {
  try {
    mainWindow.webContents.downloadURL(url)
  } catch(e) {

  }

}
