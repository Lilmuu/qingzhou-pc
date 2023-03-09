import Ax from '@/utils/imRequest'

const DOWNLOADPROGRESSStr = localStorage.getItem('DOWNLOADPROGRESS')
const DOWNLOADPROGRESSData = DOWNLOADPROGRESSStr ? JSON.parse(DOWNLOADPROGRESSStr) : {}

export default {
  namespaced: true,
  // {
  //   fileName: "388ea8f8bf744cf0abcd4dc81f51585c.zip",
  //   isPaused: false,
  //   receivedBytes: 5409329,
  //   savePath: "",
  //   state: "progressing",
  //   totalBytes: 135328445,
  //   percent: 10.2,
  //   url: "http://113.207.109.120:18089/u/0/0/202106/388ea8f8bf744cf0abcd4dc81f51585c.zip"
  // }
  state: {
    count: 1,
    // 下载进度
    downloadProgress: DOWNLOADPROGRESSData,
    // 上传进度
    uploadPercent: 0,
  },
  getters: {
    // 获取用户头像
    GetUserAvatar: state => {
      return process.env.VUE_APP_AVATAR_BASE + (parseInt(state.MeId) % 10000) + '/' + state.MeId + '.jpg'
    },
    downloadProgressItem: state => {
      // 必须要监听count,不然 getters 不更新
      if(state.count) {
        // 。。。
      }
      return (url) => {
        const d = state.downloadProgress[url] || {}
        return d
      }
    },
    showDownloadProgressItem: state => {
      // 必须要监听count,不然 getters 不更新
      if(state.count) {
        // 。。。
      }
      return (url) => {
        const d = state.downloadProgress[url] || {}
        return (d.state === 'progressing' || d.state === 'completed') && d.percent && d.savePath
      }
    },
  },
  mutations: {
    // 上传进度
    SET_UPLOADPERCENT(state, uploadPercent) {
      state.uploadPercent = uploadPercent
    },
    // 设置下载进度
    SET_DOWNLOADPROGRESS(state, item) {
      const url = item.url
      item.percent = Number((item.receivedBytes / item.totalBytes * 100).toFixed(2))
      state.downloadProgress[url] = item
      state.count++
      console.info(item,'item - item')
      console.info(item.percent,'item.percent - item.percent')
      console.info(state.count,'state.count - state.count')
    },
    // 下载成功后，保存进度数据
    SET_DOWNLOADPROGRESS_SUCCESS(state, item) {
      const url = item.url
      item.percent = Number((item.receivedBytes / item.totalBytes * 100).toFixed(2))
      state.downloadProgress[url] = item
      state.count++
      localStorage.setItem('DOWNLOADPROGRESS', JSON.stringify(state.downloadProgress))
    },
  },
  actions: {
    // 设置上传进度
    onSetUploadPercent(ctx, uploadPercent) {
      ctx.commit('SET_UPLOADPERCENT', uploadPercent)
    },
    // 设置下载进度
    onSetDownloadProgress(ctx, item) {
      ctx.commit('SET_DOWNLOADPROGRESS', item)
    },
    // 下载成功，保存进度数据，下次可继续
    onSetDownloadProgressSuccess(ctx, item) {
      ctx.commit('SET_DOWNLOADPROGRESS_SUCCESS', item)
    },
    // 获取下载进度
    // getDownloadProgress: state => {
    //   return (url) => {
    //     console.log('getDownloadProgress', url, state.downloadProgress.get(url))
    //     return state.downloadProgress.get(url)
    //   }
    // },
    // [POST] 上传文件 支持多文件 { Name: '', Value: '' }
    async PostUploadFileMultipart (ctx, params) {
      const rs = await Ax.file('/upload/UploadServlet', params)
      return rs
    },
    // [POST] 上传头像图片 { file: '', userId: '' }
    async PostUploadAvatarImg (ctx, params) {
      const rs = await Ax.file('/upload/UploadifyAvatarServlet', params)
      return rs
    },
    // [POST] 上传语音文件 { file: '', userId: '' }
    async PostUploadVoiceFile (ctx, params) {
      const rs = await Ax.file('/upload/UploadVoiceServlet', params)
      return rs
    }
  }
}
