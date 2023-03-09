/*
 * @Author: your name
 * @Date: 2021-12-16 21:25:31
 * @LastEditTime: 2021-12-16 21:26:39
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\utils\print.js
 */
export default {
  install(Vue, options) {
    Vue.prototype.$Printer = {
      webview: null,         //webview的dom对象
      bindIpcMessage:function(){
        Vue.nextTick(() => {
          //界面渲染完成后获取dom对象，并绑定ipc-message监听事件
          this.webview = document.querySelector("webview")
          this.webview.addEventListener("ipc-message",async event => {
            if (event.channel == "pong") {
              //调用静默打印
              await this.webview.print({
                //是否是静默打印,true为静默打印，false会弹出打印设置框
                silent: true,
                printBackground: true,
                deviceName: require('electron').ipcRenderer.sendSync('getPrinterDefaultName')
              });
            }
          });
        });
      },
      printPage(printHtml){
        //发起打印api,printHtml为打印的dom
        this.webview.send("ping", printHtml)
      }
    }
  }
}
