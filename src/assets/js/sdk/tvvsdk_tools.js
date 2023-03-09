const DetectRTC = require('./DetectRTC.js')
const tvvsdk_axios = require('./tvvssdk_axios.js').default

function exeGetDeviceEnvironment(callback) {
  DetectRTC.load(function() {
    const data = {
      osName: DetectRTC.osName,
      osVersion: DetectRTC.osVersion,
      isChrome: DetectRTC.browser.isChrome,
      isFirefox: DetectRTC.browser.isFirefox,
      isSafari: DetectRTC.browser.isSafari,
      isOpera: DetectRTC.browser.isOpera,
      isEdge: DetectRTC.browser.isEdge,
      isIE: DetectRTC.browser.isIE
    }
    callback(data)
  })
}

module.exports = {
  // 必须在这里暴露接口，以便被外界访问，不然就不能访问
  exeQueryRoomList: exeQueryRoomList,
  exeGetDeviceEnvironment: exeGetDeviceEnvironment,
  exeCreateCanvasDesigner: exeCreateCanvasDesigner,
  exeCreateMultiStreamsMixer: exeCreateMultiStreamsMixer,
  exeClearMarks: exeClearMarks
}

function exeQueryRoomList(callback) {
  const url = '/rtc/roomList'
  const params = {}
  tvvsdk_axios.hPost(url, params, response => {
    if (typeof callback === 'function') {
      callback({
        success: response.success,
        msg: response.msg.data
      })
    }
  })
}

function exeClearMarks() {
}

function exeCreateCanvasDesigner() {
  var designer = this

  var tools = {
    Arrow: true,
    Rectangle: true
  }

  var selectedIcon = 'Rectangle'
  function syncData(data) {
    designer.postMessage({
      canvasDesignerSyncData: data
    })
  }

  var syncDataListener = function(data) {}
  var dataURLListener = function(dataURL) {}
  var captureStreamCallback = function() {}

  function onMessage(event) {
    console.log(event)
    // if (!event.data || event.data.uid !== designer.uid) return;

    // if (!event.data || event.data.uid !== designer.uid) return;

    if (event.data.sdp) {
      webrtcHandler.createAnswer(event.data, function(response) {
        if (response.sdp) {
          designer.postMessage(response)
          return
        }

        captureStreamCallback(response.stream)
      })
      return
    }

    if (event.data.canvasDesignerSyncData) {
      console.log('event.data.canvasDesignerSyncData')
      designer.pointsLength = event.data.canvasDesignerSyncData.points.length
      designer.startIndex = event.data.canvasDesignerSyncData.startIndex
      console.log(event.data)
      // let resultData = convertMarkData(event.data.canvasDesignerSyncData);
      console.log(event.data.canvasDesignerSyncData.undo)
      if (!event.data.canvasDesignerSyncData.undo) {
        syncDataListener(event.data.canvasDesignerSyncData)
      }
      return
    }

    if (event.data.dataURL) {
      dataURLListener(event.data.dataURL)
      return
    }
  }

  function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
      var a = window.crypto.getRandomValues(new Uint32Array(3))
      var token = ''
      for (var i = 0, l = a.length; i < l; i++) {
        token += a[i].toString(36)
      }
      return token
    } else {
      return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '')
    }
  }

  designer.uid = getRandomString()
  designer.destroy = function() {
    designer.postMessage({
      markStatus: 'stop'
    })
  }

  designer.addSyncListener = function(callback) {
    syncDataListener = callback
  }

  designer.syncData = syncData

  designer.setTools = function(_tools) {
    tools = _tools
  }

  designer.selectedIcon = function(icon) {
    if (typeof tools[icon] !== 'undefined') {
      selectedIcon = icon
      designer.postMessage({
        selectedIcon: selectedIcon
      })
    } else {
      console.error('designer selectedIcon error')
    }
  }

  designer.toDataURL = function(format, callback) {
    dataURLListener = callback
    designer.postMessage({
      genDataURL: true,
      format: format
    })
  }

  designer.sync = function() {
    designer.postMessage({
      syncPoints: true
    })
  }

  designer.pointsLength = 0
  designer.startIndex = -1
  designer.undo = function(index) {
    // if (typeof index === 'string' && tools.Rectangle) {
    // 	designer.postMessage({
    // 		undo: true,
    // 		tool: index
    // 	});
    // 	return;
    // }

    // console.log("designer.pointsLength - 1="+(designer.pointsLength - 1));
    // if(designer.startIndex!=-1){
    // 	designer.postMessage({
    // 		undo: true,
    // 		index: designer.startIndex
    // 	});
    // }

    designer.postMessage({
      undo: true,
      index: index || designer.pointsLength - 1 || -1
    })
  }

  designer.postMessage = function(message) {
    message.uid = designer.uid
    window.postMessage(message, '*')
  }

  designer.captureStream = function(callback) {
    captureStreamCallback = callback
    designer.postMessage({
      captureStream: true
    })
  }

  designer.clearCanvas = function() {
    designer.postMessage({
      clearCanvas: true
    })
  }

  designer.renderStream = function() {
    designer.postMessage({
      renderStream: true
    })
  }

  designer.init = function() {
    window.removeEventListener('message', onMessage)
    window.addEventListener('message', onMessage, false)
  }

  designer.start = function() {
    designer.postMessage({
      markStatus: 'start'
    })
  }

  designer.setThickness = function(thickness) {
    designer.postMessage({
      setThickness: thickness
    })
  }

  designer.setColor = function(color) {
    designer.postMessage({
      setColor: color
    })
  }

  return designer
}

// #########################################  混流处理 ##########################################
function exeCreateMultiStreamsMixer(arrayOfMediaStreams, elementClass) {
  var browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';

  (function(that) {
    if (typeof RecordRTC !== 'undefined') {
      return
    }

    if (!that) {
      return
    }

    if (typeof window !== 'undefined') {
      return
    }

    if (typeof global === 'undefined') {
      return
    }

    global.navigator = {
      userAgent: browserFakeUserAgent,
      getUserMedia: function() {}
    }

    if (!global.console) {
      global.console = {}
    }

    if (typeof global.console.log === 'undefined' || typeof global.console.error === 'undefined') {
      global.console.error = global.console.log = global.console.log || function() {
        console.log(arguments)
      }
    }

    if (typeof document === 'undefined') {
      that.document = {
        documentElement: {
          appendChild: function() {
            return ''
          }
        }
      }

      document.createElement = document.captureStream = document.mozCaptureStream = function() {
        var obj = {
          getContext: function() {
            return obj
          },
          play: function() {},
          pause: function() {},
          drawImage: function() {},
          toDataURL: function() {
            return ''
          },
          style: {}
        }
        return obj
      }

      that.HTMLVideoElement = function() {}
    }

    if (typeof location === 'undefined') {
      that.location = {
        protocol: 'file:',
        href: '',
        hash: ''
      }
    }

    if (typeof screen === 'undefined') {
      that.screen = {
        width: 0,
        height: 0
      }
    }

    if (typeof URL === 'undefined') {
      that.URL = {
        createObjectURL: function() {
          return ''
        },
        revokeObjectURL: function() {
          return ''
        }
      }
    }

    that.window = global
  })(typeof global !== 'undefined' ? global : null)

  // requires: chrome://flags/#enable-experimental-web-platform-features

  elementClass = elementClass || 'multi-streams-mixer'

  var videos = []
  var isStopDrawingFrames = false

  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  canvas.style.opacity = 0
  canvas.style.position = 'absolute'
  canvas.style.zIndex = -1
  canvas.style.top = '-1000em'
  canvas.style.left = '-1000em'
  canvas.className = elementClass;
  (document.body || document.documentElement).appendChild(canvas)

  this.disableLogs = false
  this.frameInterval = 10

  this.width = 360
  this.height = 240

  // use gain node to prevent echo
  this.useGainNode = true

  var self = this

  // _____________________________
  // Cross-Browser-Declarations.js

  // WebAudio API representer
  var AudioContext = window.AudioContext

  if (typeof AudioContext === 'undefined') {
    if (typeof window.webkitAudioContext !== 'undefined') {
      AudioContext = window.webkitAudioContext
    }

    if (typeof window.mozAudioContext !== 'undefined') {
      AudioContext = window.mozAudioContext
    }
  }

  /* jshint -W079 */
  var URL = window.URL

  if (typeof URL === 'undefined' && typeof window.webkitURL !== 'undefined') {
    URL = window.webkitURL
  }

  if (typeof navigator !== 'undefined' && typeof navigator.getUserMedia === 'undefined') { // maybe window.navigator?
    if (typeof navigator.webkitGetUserMedia !== 'undefined') {
      navigator.getUserMedia = navigator.webkitGetUserMedia
    }

    if (typeof navigator.mozGetUserMedia !== 'undefined') {
      navigator.getUserMedia = navigator.mozGetUserMedia
    }
  }

  var MediaStream = window.MediaStream

  if (typeof MediaStream === 'undefined' && typeof window.webkitMediaStream !== 'undefined') {
    MediaStream = window.webkitMediaStream
  }

  if (typeof MediaStream !== 'undefined') {
    // override "stop" method for all browsers
    if (typeof MediaStream.prototype.stop === 'undefined') {
      MediaStream.prototype.stop = function() {
        this.getTracks().forEach(function(track) {
          track.stop()
        })
      }
    }
  }

  var Storage = {}

  if (typeof AudioContext !== 'undefined') {
    Storage.AudioContext = AudioContext
  } else if (typeof window.webkitAudioContext !== 'undefined') {
    Storage.AudioContext = window.webkitAudioContext
  }

  function setSrcObject(stream, element) {
    if ('srcObject' in element) {
      element.srcObject = stream
    } else if ('mozSrcObject' in element) {
      element.mozSrcObject = stream
    } else {
      element.srcObject = stream
    }
  }

  this.startDrawingFrames = function() {
    drawVideosToCanvas()
  }

  function drawVideosToCanvas() {
    if (isStopDrawingFrames) {
      return
    }

    var videosLength = videos.length

    var fullcanvas = false
    var remaining = []
    videos.forEach(function(video) {
      if (!video.stream) {
        video.stream = {}
      }

      if (video.stream.fullcanvas) {
        fullcanvas = video
      } else {
        // todo: video.stream.active or video.stream.live to fix blank frames issues?
        remaining.push(video)
      }
    })

    if (fullcanvas) {
      canvas.width = fullcanvas.stream.width
      canvas.height = fullcanvas.stream.height
    } else if (remaining.length) {
      canvas.width = videosLength > 1 ? remaining[0].width * 2 : remaining[0].width

      var height = 1
      if (videosLength === 3 || videosLength === 4) {
        height = 2
      }
      if (videosLength === 5 || videosLength === 6) {
        height = 3
      }
      if (videosLength === 7 || videosLength === 8) {
        height = 4
      }
      if (videosLength === 9 || videosLength === 10) {
        height = 5
      }
      canvas.height = remaining[0].height * height
    } else {
      canvas.width = self.width || 360
      canvas.height = self.height || 240
    }

    if (fullcanvas && fullcanvas instanceof HTMLVideoElement) {
      drawImage(fullcanvas)
    }

    remaining.forEach(function(video, idx) {
      drawImage(video, idx)
    })

    setTimeout(drawVideosToCanvas, self.frameInterval)
  }

  function drawImage(video, idx) {
    if (isStopDrawingFrames) {
      return
    }

    var x = 0
    var y = 0
    var width = video.width
    var height = video.height

    if (idx === 1) {
      x = video.width
    }

    if (idx === 2) {
      y = video.height
    }

    if (idx === 3) {
      x = video.width
      y = video.height
    }

    if (idx === 4) {
      y = video.height * 2
    }

    if (idx === 5) {
      x = video.width
      y = video.height * 2
    }

    if (idx === 6) {
      y = video.height * 3
    }

    if (idx === 7) {
      x = video.width
      y = video.height * 3
    }

    if (typeof video.stream.left !== 'undefined') {
      x = video.stream.left
    }

    if (typeof video.stream.top !== 'undefined') {
      y = video.stream.top
    }

    if (typeof video.stream.width !== 'undefined') {
      width = video.stream.width
    }

    if (typeof video.stream.height !== 'undefined') {
      height = video.stream.height
    }

    context.drawImage(video, x, y, width, height)

    if (typeof video.stream.onRender === 'function') {
      video.stream.onRender(context, x, y, width, height, idx)
    }
  }

  function getMixedStream() {
    isStopDrawingFrames = false
    var mixedVideoStream = getMixedVideoStream()

    var mixedAudioStream = getMixedAudioStream()
    if (mixedAudioStream) {
      mixedAudioStream.getTracks().filter(function(t) {
        return t.kind === 'audio'
      }).forEach(function(track) {
        mixedVideoStream.addTrack(track)
      })
    }

    // mixedVideoStream.prototype.appendStreams = appendStreams;
    // mixedVideoStream.prototype.resetVideoStreams = resetVideoStreams;
    // mixedVideoStream.prototype.clearRecordedData = clearRecordedData;

    return mixedVideoStream
  }

  function getMixedVideoStream() {
    resetVideoStreams()

    var capturedStream

    if ('captureStream' in canvas) {
      capturedStream = canvas.captureStream()
    } else if ('mozCaptureStream' in canvas) {
      capturedStream = canvas.mozCaptureStream()
    } else if (!self.disableLogs) {
      console.error(
        'Upgrade to latest Chrome or otherwise enable this flag: chrome://flags/#enable-experimental-web-platform-features'
      )
    }

    var videoStream = new MediaStream()

    capturedStream.getTracks().filter(function(t) {
      return t.kind === 'video'
    }).forEach(function(track) {
      videoStream.addTrack(track)
    })

    canvas.stream = videoStream

    return videoStream
  }

  function getMixedAudioStream() {
    // via: @pehrsons
    if (!Storage.AudioContextConstructor) {
      Storage.AudioContextConstructor = new Storage.AudioContext()
    }

    self.audioContext = Storage.AudioContextConstructor

    self.audioSources = []

    if (self.useGainNode === true) {
      self.gainNode = self.audioContext.createGain()
      self.gainNode.connect(self.audioContext.destination)
      self.gainNode.gain.value = 0 // don't hear self
    }

    arrayOfMediaStreams.forEach(function(stream) {
      if (!stream.getTracks().filter(function(t) {
        return t.kind === 'audio'
      }).length) {
        return
      }

      var audioSource = self.audioContext.createMediaStreamSource(stream)

      if (self.useGainNode === true) {
        audioSource.connect(self.gainNode)
      }

      self.audioSources.push(audioSource)
    })

    self.audioDestination = self.audioContext.createMediaStreamDestination()
    self.audioSources.forEach(function(audioSource) {
      audioSource.connect(self.audioDestination)
    })
    return self.audioDestination.stream
  }

  function getVideo(stream) {
    var video = document.createElement('video')

    setSrcObject(stream, video)

    video.className = elementClass

    video.muted = true
    video.volume = 0

    video.width = stream.width || self.width || 360
    video.height = stream.height || self.height || 240

    video.play()

    return video
  }

  this.appendStreams = function(streams) {
    if (!streams) {
      const newLocal = 'First parameter is required.'
      throw newLocal
    }

    if (!(streams instanceof Array)) {
      streams = [streams]
    }

    streams.forEach(function(stream) {
      arrayOfMediaStreams.push(stream)

      var newStream = new MediaStream()

      if (stream.getTracks().filter(function(t) {
        return t.kind === 'video'
      }).length) {
        var video = getVideo(stream)
        video.stream = stream
        videos.push(video)

        newStream.addTrack(stream.getTracks().filter(function(t) {
          return t.kind === 'video'
        })[0])
      }

      if (stream.getTracks().filter(function(t) {
        return t.kind === 'audio'
      }).length) {
        var audioSource = self.audioContext.createMediaStreamSource(stream)
        // self.audioDestination = self.audioContext.createMediaStreamDestination();
        audioSource.connect(self.audioDestination)

        newStream.addTrack(self.audioDestination.stream.getTracks().filter(function(t) {
          return t.kind === 'audio'
        })[0])
      }
    })
  }

  this.releaseStreams = function() {
    videos = []
    isStopDrawingFrames = true

    if (self.gainNode) {
      self.gainNode.disconnect()
      self.gainNode = null
    }

    if (self.audioSources.length) {
      self.audioSources.forEach(function(source) {
        source.disconnect()
      })
      self.audioSources = []
    }

    if (self.audioDestination) {
      self.audioDestination.disconnect()
      self.audioDestination = null
    }

    if (self.audioContext) {
      self.audioContext.close()
    }

    self.audioContext = null

    context.clearRect(0, 0, canvas.width, canvas.height)

    if (canvas.stream) {
      canvas.stream.stop()
      canvas.stream = null
    }
  }

  this.resetVideoStreams = function(streams) {
    if (streams && !(streams instanceof Array)) {
      streams = [streams]
    }

    resetVideoStreams(streams)
  }

  function resetVideoStreams(streams) {
    videos = []
    streams = streams || arrayOfMediaStreams

    // via: @adrian-ber
    streams.forEach(function(stream) {
      if (!stream.getTracks().filter(function(t) {
        return t.kind === 'video'
      }).length) {
        return
      }

      var video = getVideo(stream)
      video.stream = stream
      videos.push(video)
    })
  }

  // for debugging
  this.name = 'MultiStreamsMixer'
  this.toString = function() {
    return this.name
  }

  this.getMixedStream = getMixedStream

  return this
}

var webrtcHandler = {
  createOffer: function(callback) {
    var captureStream = document.getElementById('main-canvas').captureStream()
    var peer = this.getPeer()

    captureStream.getTracks().forEach(function(track) {
      peer.addTrack(track, captureStream)
    })

    peer.onicecandidate = function(event) {
      if (!event || !!event.candidate) {
        return
      }

      callback({
        sdp: peer.localDescription.sdp,
        type: peer.localDescription.type
      })
    }
    peer.createOffer({
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: false
    }).then(function(sdp) {
      peer.setLocalDescription(sdp)
    })
  },
  setRemoteDescription: function(sdp) {
    this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
    })
  },
  createAnswer: function(sdp, callback) {
    var peer = this.getPeer()
    peer.onicecandidate = function(event) {
      if (!event || !!event.candidate) {
        return
      }

      callback({
        sdp: peer.localDescription.sdp,
        type: peer.localDescription.type
      })
    }
    this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
      peer.createAnswer({
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: true
      }).then(function(sdp) {
        peer.setLocalDescription(sdp)
      })
    })

    peer.ontrack = function(event) {
      callback({
        stream: event.streams[0]
      })
    }
  },
  getPeer: function() {
    var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection
    var peer = new WebRTC_Native_Peer(null)
    this.peer = peer
    return peer
  }
}
