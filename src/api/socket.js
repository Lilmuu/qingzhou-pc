import { config } from "@/const/dicData"
import {getSysSocketToken} from "@/store/modules/user";

// const wsUrl = 'ws://10.0.0.98:8088/send'
// const wsUrl = 'ws://10.0.0.187:10776/websocket'

const wsUrl = config.socketURL

export default class Socket {
  constructor(token) {
    // 重连锁
    this.lockReconnect = false
    // 重连延迟
    this.reconnectTime = null
    if (this._docker) {
      this._docker.close()
      this._docker = null
    }
    this.token = token
    if(!token) return
    this._docker = new WebSocket(`${wsUrl}?token=${token}&type=1&time=${new Date().getTime()}`)
    this._methods = []
  }

  async init() {
    console.log(`新的socket：正在初始化...`,this._docker)
    this._docker.binaryType = 'arraybuffer'
    this._docker.onopen = event => {
      this._docker.send('ping')
      this._sendBeat()
    }
    this._docker.onmessage = event => {
      this._dockeronMessage(event)
    }
    console.log(this._docker.onerror,'iuqewq')
    this._docker.onerror = event => {
      if(event.target.readyState===3){
        this._docker.close()
        this._docker = null
      
      }
    }
    this._docker.onclose = event => {
      this._call(event)
      this.reconnect()
    }
  }

  async _dockeronMessage(event) {
    this._call(event)
  }

  addMethods(fns) {
    this._methods = fns
  }

  // 重连
  reconnect() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    if(this._docker){
      this._docker.close()
      this._docker = null
    }
    if(this.lockReconnect) {
      return;
    };
    this.lockReconnect = true
    this.reconnectTime && clearTimeout(this.reconnectTime);
    this.reconnectTime = setTimeout( ()=> {
      if(localStorage.getItem('onLine')=='true'){
        const newSocketToken = localStorage.getItem('socketToken')
        this._docker = new WebSocket(`${wsUrl}?token=${newSocketToken}&type=2&time=${new Date().getTime()}`)
        this.init()
        this.lockReconnect = false;
      }
    }, 3000);

    // getSysSocketToken().then(result => {
    //   if(result) {
    //     const newSocketToken = localStorage.getItem('socketToken')
    //     this._docker = new WebSocket(`${wsUrl}?token=${newSocketToken}`)
    //     this.init()
    //   }
    // })
  }

  /**
   * 发送信息
   * @param data    {String}  数据： 结构为 json字符串，"{"type":"xxx","data":"xxx"}"
   */
  send(data) {
    this._docker.send(JSON.stringify(data))
  }

  // 关闭 socket
  close() {
    // 清除定时脚本
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  }


  _call(...args) {
    for (let i = 0, l = this._methods.length; i < l; i++) {
      const fn = this._methods[i]
      if (typeof fn !== 'function') continue
      fn.apply(null, args)
    }
  }

  // 发送心跳包，表明连接激活
  _sendBeat() {
    this._timer = setInterval(() => {
      console.log('心跳机制')
      // this._docker.send('send Beat')
      this._docker.send(`{"id":1,"msg":"send Beat"}`);
      this._docker.send(`ping`)
    }, 10 * 1000)
  }
}
