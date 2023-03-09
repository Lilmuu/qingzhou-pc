const tvvsdk_constants = require("./tvvsdk_constants.js");
const tvRtcPlugin = require("./tvrtc.es.js");
const getStats = require('./getStats.js');
const logTag = tvvsdk_constants.logTag
const tvTipsConstants = tvvsdk_constants.tipsConstants;
const tvRTC = tvRtcPlugin.default;
//默认分辨率
let width = 640;
let height = 360;
let confminbr = 300000;
let confmaxbr = 1500000;
let conffps = 15;
let confmode = 0;
let picmode = 0;
//用户自定义的视频选项
let userOptions = {};
let urlOptions;
let TAG = "tvLog core-------";
const opaqueId = "videoroomtest-" + tvRTC.randomString(12);
let myCallbacks = {};
let myLocalStream;
let isShareScreen = false;
let videoSend = true;
let audioSend = true;
let previousResolution;
let pluginName = "zwan.service.videoroom";
let resp = {};
let wsMessageCallback;

function exeInit(options, callback) {
    callback = callback || tvRTCMethod.noop;
    const resp = {
        success: false,
        msg: tvTipsConstants.initFailed
    };
    if (!tvRTC.isWebrtcSupported()) {
        resp.msg = tvTipsConstants.notSupportWebRtc;
        return callback(resp);
    }
    if (!options) {
        resp.msg = tvTipsConstants.pleaseSetOptionsValue;
        return callback(resp);
    }
    urlOptions = options
    //全局赋值
    console.log("urlOptions参数");
    console.log(TAG, urlOptions);

    tvRTC.init({
        debug: true,
        callback: function() {
            resp.success = true;
            resp.msg = tvTipsConstants.initSuccess;
            return callback(resp);
        }
    });
}

function exeJoinRoom(sessionId, roomId, name, callbacks) {
    callbacks.onlocalstream =
        typeof callbacks.onlocalstream == "function" ?
            callbacks.onlocalstream :
            tvRTCMethod.noop;
    callbacks.onremotestream =
        typeof callbacks.onremotestream == "function" ?
            callbacks.onremotestream :
            tvRTCMethod.noop;
    callbacks.onleave =
        typeof callbacks.onleave == "function" ? callbacks.onleave : tvRTCMethod.noop;
    callbacks.onjoined =
        typeof callbacks.onjoined == "function" ? callbacks.onjoined : tvRTCMethod.noop;
    callbacks.repeatLogin =
        typeof callbacks.repeatLogin == "function" ? callbacks.repeatLogin : tvRTCMethod.noop;
    callbacks.ondata =
        typeof callbacks.ondata == "function" ? callbacks.ondata : tvRTCMethod.noop;
    callbacks.onsharescreen =
        typeof callbacks.onsharescreen == "function" ? callbacks.onsharescreen : tvRTCMethod.noop;
    myCallbacks[sessionId] = callbacks;
    let displayName = name;
    const join = {
        request: "join",
        room: roomId,
        authid: displayName,
        display: displayName,
    };

    console.log(logTag.SDK2MS, 'sessionId', sessionId,'type', 'join', 'body', join);
    tvRTC.sessions[sessionId].pluginHandler().send({
        message: join
    });
}

function exeQueryRoom(sessionId, roomId, callback) {
    let callbacks = {
        message: {"request":"query", "room": roomId},
        success: function(result) {
            if(result.type !== "queryresult"){
                if (callback) {
                    console.log(logTag.SDK2APP, 'sessionId', sessionId,'type', 'error', 'body', result.error);
                    callback.error(result.error);
                }
                return;
            }
            result.participants.sort(function (user1, user2) {
                return user1.position - user2.position;
            });

            if (callback) {
                console.log(logTag.SDK2APP, 'sessionId', sessionId,'type', 'success', 'body', result);
                callback.success(result);
            }
        },
        error: function(error) {
            if (callback) {
                console.log(logTag.SDK2APP, 'sessionId', sessionId,'type', 'error', 'body', error);
                if (error.msg){
                    callback.error(error.msg);
                } else {
                    callback.error(error);
                }
            }
        }
    };
    console.log(tvRTC.sessions[sessionId],'tvRTC.sessions[sessionId] - tvRTC.sessions[sessionId]')
    tvRTC.sessions[sessionId].pluginHandler().send(callbacks);
}
function exeCompositeRoom(sessionId, roomId, userList, callback) {
    let participants = [];
    userList.forEach(function (user) {
      console.log(user,'user --- user 会议成员')
        let u = {};
        u.display = user.userName;
        u.id = user.id;
        u.position = user.position;
        participants.push(u);
    });
    let composite = {};
    composite.participants = participants;
    composite.room = roomId;
    composite.request = "composite";

    let callbacks = {
        message: composite,
        success: function(result) {
            if(callback){
                callback.success();
            }
        },
        error: function(error) {
            console.log(error);
            if (callback){
                callback.error(error.msg);
            }
        }
    };
    tvRTC.sessions[sessionId].pluginHandler().send(callbacks);
}
function exeQueryDevice(sessionId, callback) {
    let callbacks = {
        message: {"request": "querydevice"},
        success: function (result) {
            if (result.type !== "querydeviceresult") {
                console.log(TAG, "not expect msg for exeQueryDevice");
                return;
            }

            if (callback) {
                result.success = true;
                callback(result);
            }
        },
        error: function (error) {
            console.log(error);
            if (callback) {
                callback.error(error.msg);
            }
        }
    };
    tvRTC.sessions[sessionId].pluginHandler().send(callbacks);
}
function exeAttachMediaStream(videoObj, stream) {
    tvRTC.attachMediaStream(videoObj, stream);
}


function exeLeaveRoom(sessionId) {
    if (tvRTC.sessions[sessionId].pluginHandler()){
        tvRTC.sessions[sessionId].pluginHandler().hangup(true);
    }
}

function exeShareScreen(sessionId, enable, callback) {
    if (enable) {
        startShareScreen(sessionId, callback)
    } else {
        closeShareScreen(sessionId, callback)
    }
}

function exeMike(sessionId, enable, callback) {
    let media;
    var resp = {};
    if (tvRTC.sessions[sessionId].pluginHandler()) {
        resp.success = true;
        let createOfferCallbacks = {
            success: function(jsep) {
                resp.success = true;
                var publish = {
                    "request": "configure",
                };
                if (enable) {
                    publish.audio = true;
                } else {
                    publish.audio = false;
                }
                audioSend = enable;
                tvRTC.sessions[sessionId].pluginHandler().send({
                    "message": publish,
                    "jsep": jsep
                });
                if (callback)
                    callback(resp);
            },
            error: function(error) {
                resp.success = false;
                resp.msg = error;
                if (callback)
                    return callback(resp);
            }
        };
        if (enable) {
            media = {
                replaceAudio: true,
                audio: userOptions[sessionId].audio,
                video: {type : 'camera'}
            };
        } else {
            media = {
                removeAudio: true,
                audio: userOptions[sessionId].audio,
                video: {type : 'camera'}
            };
        }
        console.log(TAG, media);
        createOfferCallbacks.media = media;
        tvRTC.sessions[sessionId].pluginHandler().createOffer(createOfferCallbacks);

    } else {
        resp.success = false;
        resp.msg = tvTipsConstants.pleaseConnectionServer;
    }
    // 回调了两次,这里注释掉
    // if (callback)
    //     callback(resp);
}

function exePublish(sessionId, enable, callback) {
    cleanUserOption(sessionId);
    let media = userOptions[sessionId];
    let resp = {};
    if (tvRTC.sessions[sessionId].pluginHandler()) {
        resp.success = true;
        let createOfferCallbacks = {
            success: function(jsep) {
                resp.success = true;
                // var publish = {
                // 	"request": "configure",
                // };
                // if (enable) {
                // 	publish.video = true;
                // } else {
                // 	publish.video = false;
                // }
                // sfuPlugin.send({
                // 	"message": publish,
                // 	"jsep": jsep
                // });
                //更新状态
                videoSend = enable;
                //alert(videoSend)
                //更新media状态
                userOptions[sessionId].video.videoSend = videoSend;
                if (callback)
                    callback(resp);
            },
            error: function(error) {
                resp.success = false;
                resp.msg = error;
                if (callback)
                    return callback(resp);
            }
        };
        if (enable) {
            media.video.type = 'camera'
            media.replaceVideo = true
            media.videoSend = true
            media.audioSend = audioSend
        } else {
            media = {
                removeVideo: true,
                videoSend: false
            };
        }
        console.log(TAG, media);
        createOfferCallbacks.media = media;
        tvRTC.sessions[sessionId].pluginHandler().createOffer(createOfferCallbacks);

    } else {
        resp.success = false;
        resp.msg = tvTipsConstants.pleaseConnectionServer;
        if (callback)
            callback(resp);
    }
}

function cleanUserOption(sessionId) {
    if(userOptions[sessionId]){
        delete userOptions[sessionId].update;
        delete userOptions[sessionId].keepAudio;
        delete userOptions[sessionId].keepVideo;
        delete userOptions[sessionId].replaceAudio;
        delete userOptions[sessionId].replaceVideo;
        delete userOptions[sessionId].addAudio;
        delete userOptions[sessionId].removeAudio;
        delete userOptions[sessionId].addVideo;
        delete userOptions[sessionId].removeVideo;
    }
}

function exeSetResolution(sessionId, resolution, callback) {
    cleanUserOption(sessionId);
    previousResolution = resolution;
    let resp = {};
    if (tvRTC.sessions[sessionId].pluginHandler()) {
        userOptions[sessionId].video.size = resolution;
        userOptions[sessionId].replaceVideo = true;
        userOptions[sessionId].replaceAudio = true;

        let callbacks = {
            media: userOptions[sessionId],
            success: function(jsep) {
                if (callback)
                    callback(resp);
            },
            error: function(error) {
                console.log(error);
                resp.success = false;
                resp.msg = error.name;
                if (callback)
                    callback(resp);
            }
        }
        tvRTC.sessions[sessionId].pluginHandler().createOffer(callbacks);
    } else {
        resp.success = false;
        resp.msg = tvTipsConstants.notInit;
    }
    if (callback)
        callback(resp);
}


function exeSetBitrate(sessionId, bitrate, callback) {
    cleanUserOption(sessionId);
    let resp = {};
    if (tvRTC.sessions[sessionId].pluginHandler()) {
        let callbacks = {
            bandwidth: bitrate,
            success: function() {
                resp.success = true;
                if (callback)
                    callback(resp);
            },
            error: function(error) {
                console.log(error);
                resp.success = false;
                resp.msg = error.name;
                if (callback)
                    callback(resp);
            }
        }
        tvRTC.sessions[sessionId].pluginHandler().setBitrate(callbacks);
    } else {
        resp.success = false;
        resp.msg = tvTipsConstants.notInit;
    }
    if (callback)
        callback(resp);
}

function exeReconfigConf(sessionId, roomId, confSize, confBr, confFps, callback) {
    let height = 360, width = 640;
    if (confSize === 'lowres') {
        // Small resolution, 4:3
        height = 240;
        width = 320;
    } else if (confSize === 'hires' || confSize === 'hires-16:9' || confSize === 'hdres') {
        height = 720;
        width = 1280;
    } else if (confSize === 'fhdres') {
        height = 1080;
        width = 1920;
    } else if (confSize === 'lowres-16:9') {
        height = 360;
        width = 640;
    }else if (confSize === 'stdres-16:9') {
        height = 540;
        width = 960;
    } else {
        height = 360;
        width = 640;
    }

    var reconfig = {
        request: "reconfig",
        room: roomId.toString(),
        mcufps: confFps,
        mcuwidth: width,
        mcuheight: height,
        mcuminbr: 300*1024,
        mcuinitbr: confBr,
        mcumaxbr: confBr
    };
    tvRTC.sessions[sessionId].pluginHandler().send({
        message: reconfig
    });
}

function exeGetAllDevices(callback) {
    tvRTC.listDevices(callback);
}

let first_duration = 0;
let last_duration = 0;
let last_send_bytes = 0;
let last_recv_bytes = 0;
let last_send_frame = 0;
let last_recv_frame = 0;

function getQosString(reports) {
    let results = [];
    let duration = 0, sendbr = 0, recvbr = 0, sendfps = 0, recvfps = 0;
    let sendbytes = 0, recvbytes = 0;
    let localframe=0, remoteframe=0;
    if(!reports)
        return;

    reports.forEach(report => {
        if (report.type === 'inbound-rtp') {
            if(report.mediaType === "audio") {
                results.push({"name":"音频接收字节", "value":report.bytesReceived, "index":1});
                results.push({"name":"音频收包数","value":report.packetsReceived, "index":2});
                results.push({"name":"音频丢包数","value":report.packetsLost, "index":3});
            }
            else if(report.mediaType === "video") {
                results.push({"name":"视频接收字节", "value":report.bytesReceived, "index":6});
                results.push({"name":"视频收包数","value":report.packetsReceived, "index":7});
                results.push({"name":"视频丢包数","value":report.packetsLost, "index":8});
                results.push({"name":"接收FIR数","value":report.firCount, "index":11});
                results.push({"name":"接收PLI数","value":report.pliCount, "index":12});
                results.push({"name":"接收NACK数","value":report.nackCount, "index":13});
                recvbytes = report.bytesReceived;
            }
        } else if (report.type === 'outbound-rtp') {
            if(report.mediaType === "audio") {
                results.push({"name":"音频发送字节", "value":report.bytesSent, "index":4});
                results.push({"name":"音频发包数","value":report.packetsSent, "index":5});
            }
            else if(report.mediaType === "video") {
                results.push({"name":"视频发送字节", "value":report.bytesSent, "index":9});
                results.push({"name":"视频发包数","value":report.packetsSent, "index":10});
                results.push({"name":"发送FIR数","value":report.firCount, "index":14});
                results.push({"name":"发送PLI数","value":report.pliCount, "index":15});
                results.push({"name":"发送NACK数","value":report.nackCount, "index":16});
                sendbytes = report.bytesSent;
            }
        } else if (report.type === 'track') {
            if(report.remoteSource === false && report.kind === "video") {
                results.push({"name":"本地视频尺寸", "value":report.frameWidth+'*'+report.frameHeight, "index":17});
                results.push({"name":"本地视频发送帧数","value":report.framesSent, "index":18});
                localframe = report.framesSent;
            }
            else if(report.remoteSource === true && report.kind === "video") {
                results.push({"name":"远端视频尺寸", "value":report.frameWidth+'*'+report.frameHeight, "index":19});
                results.push({"name":"远端视频接收帧数","value":report.framesReceived, "index":20});
                remoteframe = report.framesReceived;
                duration = report.timestamp;
                if(first_duration===0){
                    first_duration = report.timestamp;
                }
            }
        }
    });
    if(last_duration!==0){
        //计算比特率
        let time = (duration - last_duration)/1000;
        if (0 !== time)
        {
            sendbr = 8 * (sendbytes - last_send_bytes) / time / 1024;
            recvbr = 8 * (recvbytes - last_recv_bytes) / time / 1024;
            results.push({name:"视频发送码率","value":sendbr.toFixed(1), "index":21});
            results.push({name:"视频接收码率","value":recvbr.toFixed(1), "index":22});
        }

        //计算帧率
        if (0 !== time)
        {
            sendfps = (localframe - last_send_frame) / time;
            recvfps = (remoteframe - last_recv_frame) / time;
            results.push({name:"视频发送帧率","value":sendfps.toFixed(0), "index":23});
            results.push({name:"视频接收帧率","value":recvfps.toFixed(0), "index":24});
        }
    }else{
        results.push({name:"视频发送码率","value":0.0, "index":21});
        results.push({name:"视频接收码率","value":0.0, "index":22});
        results.push({name:"视频发送帧率","value":0, "index":23});
        results.push({name:"视频接收帧率","value":0, "index":24});
    }
    let t = (duration - first_duration)/1000
    results.push({name:"视频时间","value":t.toFixed(1), "index":25});
    results.sort(function (a, b) {
        return a.index > b.index;
    });
    last_duration = duration;
    last_send_bytes = sendbytes;
    last_recv_bytes = recvbytes;
    last_send_frame = localframe;
    last_recv_frame = remoteframe;
    return results;
}

function exeGetQos(sessionId, callback) {
    if(tvRTC.sessions[sessionId].pluginHandler()) {
        let callbacks = {
            success: function(reports) {
                resp.success = true;
                resp.report = getQosString(reports);
                if (callback)
                    callback(resp);
            },
            error: function(error) {
                console.log(error);
                resp.success = false;
                resp.msg = error.name;
                if (callback)
                    callback(resp);
            }
        };
        tvRTC.sessions[sessionId].pluginHandler().getQos(callbacks);
    }else {
        resp.success = false;
        resp.msg = tvTipsConstants.notInit;
    }
    if (callback)
        callback(resp);

}
function exeGetPeer(sessionId) {
    return tvRTC.sessions[sessionId].pluginHandler().webrtcStuff.pc;
}

function exeStreamStart(sessionId, options, roomId, callbacks) {
    myCallbacks[sessionId].onlocalstream =
        typeof callbacks.onlocalstream == "function" ?
            callbacks.onlocalstream :
            tvRTCMethod.noop;
    myCallbacks[sessionId].onremotestream =
        typeof callbacks.onremotestream == "function" ?
            callbacks.onremotestream :
            tvRTCMethod.noop;
    //获得会场分辨率
    tvvsdk_constants.resList.forEach(function (res, index, arr) {
        if(res.value === options.conf.confsize){
            width = res.width;
            height = res.height;
        }
    });

    //获得会议模式
    tvvsdk_constants.confModeList.forEach(function (m) {
        if(m.value === options.conf.mode){
            confmode = m.mode;
        }
    });

    //校验会场比特率
    confminbr = options.conf.confminbr;
    confmaxbr = options.conf.confmaxbr;
    conffps = options.conf.conffps;
    picmode = options.conf.picmode;
    userOptions[sessionId] = options;

    let streamstart = {
        request: "streamstart",
        mode: confmode,
        mcufps: conffps,
        mcuheight: height,
        mcuwidth: width,
        mcuminbr: confminbr,
        mcuinitbr: confmaxbr,
        mcumaxbr: confmaxbr,
        picmode: picmode,
        picnum: 9,
        sendaudio: options.audio.sendaudio,
        recvaudio: options.audio.recvaudio,
        sendvideo: options.video.sendvideo,
        recvvideo: options.video.recvvideo,
        subscribeaudio: options.audio.subscribeaudio,
        subscribevideo: options.video.subscribevideo,
        publishaudio: options.audio.publishaudio,
        publishvideo: options.video.publishvideo,
        transport: "udp",
        videocodec: "H264",
    };
    tvRTC.sessions[sessionId].setOption(options);
    tvRTC.sessions[sessionId].pluginHandler().send({
        message: streamstart
    });
}

function exeStreamStop(sessionId) {
    if (tvRTC.sessions[sessionId].pluginHandler()){
        tvRTC.sessions[sessionId].pluginHandler().streamstop(true);
    }
}

function exeHangup(sessionId) {
    console.log(TAG,"exeHangup",sessionId);
    if(tvRTC.sessions[sessionId]) {
        tvRTC.sessions[sessionId].destroy();
    }
}

function exeInvite28181(sessionId, deviceId, callback) {

    let invite28181 = {
        request: "invitesip",
        account: deviceId,
        mode: 2,
        mcufps: 15,
        mcuheight: 720,
        mcuwidth: 1280,
        mcuminbr: 300000,
        mcuinitbr: 2000000,
        mcumaxbr: 2000000,
        picmode: 0,
        picnum: 1,
        sendaudio: true,
        recvaudio: true,
        sendvideo: true,
        recvvideo: true,
        subscribeaudio: true,
        subscribevideo: true,
        publishaudio: true,
        publishvideo: true,
        transport: "udp",
        videocodec: "H264",
    };
    tvRTC.sessions[sessionId].pluginHandler().send({
        message: invite28181
    });

    let res = {};
    res.success = true;
    callback(res);
}

function exeBye28181(sessionId, deviceId, callback) {
    let exeBye28181 = {
        request: "bye",
        account: deviceId,
    };
    tvRTC.sessions[sessionId].pluginHandler().send({
        message: exeBye28181
    });
    let res = {};
    res.success = true;
    callback(res);
}

module.exports = {
    //必须在这里暴露接口，以便被外界访问，不然就不能访问
    exeInit: exeInit,
    exeJoinRoom: exeJoinRoom,
    exeQueryRoom: exeQueryRoom,
    exeQueryDevice: exeQueryDevice,
    exeCompositeRoom: exeCompositeRoom,
    exeCreateConnection: exeCreateConnection,
    exeAttachMediaStream: exeAttachMediaStream,
    exeLeaveRoom: exeHangup,
    exeShareScreen: exeShareScreen,
    exePublish: exePublish,
    exeMike: exeMike,
    exeSendData: exeSendData,
    exeSetBitrate: exeSetBitrate,
    exeSetResolution: exeSetResolution,
    exeReconfigConf: exeReconfigConf,
    exeGetAllDevices: exeGetAllDevices,
    exeGetQos: exeGetQos,
    exeGetPeer: exeGetPeer,
    exeAddMessageEventListener: exeAddMessageEventListener,
    exeStreamStart: exeStreamStart,
    exeStreamStop: exeStreamStop,
    exeInvite28181: exeInvite28181,
    exeBye28181: exeBye28181
};


function startShareScreen(sessionId, callback) {
    cleanUserOption(sessionId);
    userOptions[sessionId].video.type = "window";
    userOptions[sessionId].replaceVideo = true;
    userOptions[sessionId].screenshareFrameRate = 8;
    userOptions[sessionId].conf.fps = 8;

    let resp = {};
    let incomingcallResp = {};
    let callbacks = {
        media: userOptions[sessionId],
        success: function(jsep) {
            resp.success = true;
            callback(resp);
            isShareScreen = true;
        },
        error: function(error) {
            console.log(TAG, error);
            if (error.name === 'NotAllowedError') {
                error = tvTipsConstants.cancelShareScreen;
                myCallbacks[sessionId].onsharescreen(false);
            }
            resp.success = false;
            resp.msg = error;
            callback(resp);
            isShareScreen = false;
            //恢复原先的视频状态
            closeShareScreen(sessionId, callback);

        },
        sources: function (sources, sourcesCallback) {
            incomingcallResp.isSources = true;
            incomingcallResp.sources = sources;
            incomingcallResp.sourcesCallback = sourcesCallback;
            console.log("incomingcallResp =======", incomingcallResp)
            callback(incomingcallResp)
        }
    }
    console.log(callbacks.media);
    tvRTC.sessions[sessionId].pluginHandler().createOffer(callbacks);
}
//关闭屏幕共享
function closeShareScreen(sessionId, callback) {
    let media;
    media = {
        removeVideo: true,
        videoSend: false,
        audioSend: audioSend
    };
    let resp = {};
    let callbacks = {
        media: media,
        success: function(jsep) {
            //myCallbacks.onsharescreen(true);
            isShareScreen = false;
            resp.success = true;
            if (callback)
                callback(resp);
        },
        error: function(error) {
            console.log(error);
            isShareScreen = true;
            resp.success = false;
            resp.msg = error;
            if (callback)
                callback(resp);
        }
    }
    console.log(callbacks.media);
    tvRTC.sessions[sessionId].pluginHandler().createOffer(callbacks);
}

tvRTCMethod.noop = function() {};

function tvRTCMethod() {};

//callback为createConnection的回调
function attachLocal(sessionID, callback) {
    let resp = {};
    tvRTC.sessions[sessionID].attach({
        plugin: pluginName,
        opaqueId: opaqueId,
        success: function(handleid) {
            resp.success = true;
            resp.sessionid = sessionID;
            console.log(logTag.SDK2APP, 'type', 'success', 'resp', resp);
            return callback(resp);
        },
        error: function(error) {
            resp.success = false;
            resp.msg = error;
            console.log(logTag.SDK2APP, 'type', 'error', 'resp', resp);
            return callback(resp);
        },
        mediaState: function(medium, on) {
            console.log(
                TAG,
                "RTC " +
                (on ? "started" : "stopped") +
                " receiving our " +
                medium
            );
            //media变更
            mediaStateOperation(sessionID, on, medium);

        },
        webrtcState: function(on) {
            console.log(
                TAG,
                "TVRTC says our WebRTC PeerConnection is " +
                (on ? "up" : "down") +
                " now"
            );
        },
        onmessage: function(sessionId, msg) {
            let event = msg["event"];
            if (event) {
                if (event === "joined") {
                    if (typeof myCallbacks[sessionId].onjoined === "function") {
                        console.log(logTag.SDK2APP, 'type', 'joined', 'resp', msg["username"]);
                        myCallbacks[sessionId].onjoined(msg["username"]);
                    }
                } else if (event === "incomingcall") {
                    let doAudio = true,
                        doVideo = true;
                    let sdp = msg["sdp"];
                    let type = msg["type"];
                    let incomingcallResp = {};
                    let offerJsep = {"sdp": sdp, "type": type};
                    if (sdp !== null && sdp !== undefined) {
                        doAudio = (sdp.indexOf("m=audio ") > -1);
                        doVideo = (sdp.indexOf("m=video ") > -1);
                        console.log(TAG, "Audio " + (doAudio ? "has" : "has NOT") + " been negotiated");
                        console.log(TAG, "Video " + (doVideo ? "has" : "has NOT") + " been negotiated");
                    } else {
                        console.error(TAG, "This call doesn't contain an offer...");
                    }
                    tvRTC.sessions[sessionId].pluginHandler().createAnswer({
                        jsep: offerJsep,
                        success: function(jsep) {
                            if (jsep.type === 'offer'){
                                console.error(TAG, "sdp type error");
                            } else {
                                let body = {
                                    request: "accept",
                                    sdp: jsep.sdp,
                                    type: jsep.type
                                };
                                tvRTC.sessions[sessionId].pluginHandler().send({
                                    "message": body
                                });
                                if (userOptions[sessionId].video.sendvideo){
                                    if (userOptions[sessionId].video.type === 'screen' || userOptions[sessionId].video.type === 'window') {
                                        console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'success', 'resp', 'screen start');
                                        callback("screen start")
                                    }
                                }
                            }
                        },
                        error: function(error) {
                            console.error(TAG, "WebRTC error:", error);
                            if (error === "screen stop") {
                                console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'error', 'resp', 'screen stop');
                                callback("screen stop")
                                // 取消弹窗
                            }else if (error && error.toString().indexOf("Permission denied") != -1) {
                                console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'error', 'resp', 'screen denied');
                                callback("screen denied")
                                // 未获取到视频流
                            }else if (error && error.toString().indexOf("Could not start video source") != -1) {
                                console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'error', 'resp', 'Camera call failed');
                                callback("Camera call failed")
                            } else {
                                console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'error', 'resp', error);
                                callback(error)
                            }
                        },
                        sources: function (sources, sourcesCallback) {
                            incomingcallResp.isSources = true;
                            incomingcallResp.sources = sources;
                            incomingcallResp.sourcesCallback = sourcesCallback;
                            console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'sources', 'resp', incomingcallResp);
                            callback(incomingcallResp)
                        }
                    });
                } else if (event === "candidate") {
                    let webrtcStuff = tvRTC.sessions[sessionId].pluginHandler().webrtcStuff;
                    console.log(TAG,"candidate webrtcStuff",webrtcStuff,sessionId);
                    let candidate = {"candidate": msg["candidate"], "sdpMid": msg["sdpMid"], "sdpMLineIndex": msg["sdpMLineIndex"]}
                    if (webrtcStuff.pc && webrtcStuff.remoteSdp) {
                        // Add candidate right now
                        console.log(logTag.SDK2RTC, 'sessionId', sessionId, 'addIceCandidate', candidate);
                        webrtcStuff.pc.addIceCandidate(candidate);
                    } else {
                        console.log(TAG,"webrtcStuff.pc",webrtcStuff.pc,"webrtcStuff.remoteSdp",webrtcStuff.remoteSdp,sessionId);
                        // We didn't do setRemoteDescription (trickle got here before the offer?)
                        if (!webrtcStuff.candidates)
                            webrtcStuff.candidates = [];
                        webrtcStuff.candidates.push(candidate);
                        console.log(TAG, "candidate", webrtcStuff.candidates);
                    }
                } else if (event === "destroyed") {
                    console.log(TAG, "The room has been destroyed!");
                } else if (event === "event") {
                    // Any new feed to attach to?
                    if (msg["error"] !== undefined && msg["error"] !== null) {
                        if (msg["error_code"] === 426) {
                            //	alert("no such room")
                        } else {
                            alert(msg["error"]);
                        }
                    }
                    console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'event', 'resp', msg);
                    callback(msg)
                } else if(event === "incomingconfsms"){
                    let sender = msg["sender"];
                    let content = msg["content"];
                    console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'incomingconfsms');
                    myCallbacks[sessionId].ondata(sender, "", content);
                }
            }
            else if (msg.code === 458) {
                console.log(TAG, "sessionId conflict repeatLogin");
                myCallbacks[sessionId].repeatLogin(msg)
            }else {
                callback(msg)
            }
        },
        onlocalstream: function(sessionId, stream, data) {
            console.log(TAG, 'onlocalstream:' , sessionId);
            myLocalStream = stream;
            let videoTracks = stream.getVideoTracks();
            let audioTracks = stream.getAudioTracks();
            let videoSend = true;
            if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                videoSend = false;
            }
            let audioSend = true;
            if (audioTracks === null || audioTracks === undefined || audioTracks.length === 0) {
                audioSend = false;
            }
            var extra = {
                audio: audioSend,
                video: videoSend,
            }
            console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'onlocalstream', 'stream', stream);
            myCallbacks[sessionId].onlocalstream(sessionId, stream, extra);
        },
        onremotestream: function(sessionId, stream) {
            console.log(TAG, "onremotestream in attachLocal", sessionId);
            let videoTracks = stream.getVideoTracks();
            let audioTracks = stream.getAudioTracks();
            let videoSend = true;
            if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                videoSend = false;
            }
            let audioSend = true;
            if (audioTracks === null || audioTracks === undefined || audioTracks.length === 0) {
                audioSend = false;
            }
            var extra = {
                audio: audioSend,
                video: videoSend,
            }
            if (audioSend || videoSend) {
                console.log(logTag.SDK2APP, 'sessionId', sessionId, 'type', 'onremotestream', 'stream', stream);
                myCallbacks[sessionId].onremotestream(sessionId, stream, extra);
            }
        },
        oncleanup: function() {
            console.log(TAG, "Oncleanup !");
            myLocalStream = null;
        },
        ondataopen: function(data) {
            console.log(TAG, "The DataChannel is available!");
        },
        iceState: function(data) {
            console.log(logTag.SDK2APP,"ICE state is " , data);
            resp.success = false;
            if (data.iceConnectionState === "disconnected" && data.connectionState === "connecting"){
                resp.disconnected = true;
                resp.sessionid = sessionID;
                resp.msg = "ICE state is " + data;
                callback(resp);
            }else if (data.iceConnectionState === "connected" && data.connectionState === "new"){
                resp.disconnected = true;
                resp.sessionid = sessionID;
                resp.msg = "ICE state is " + data;
                callback(resp);
            }
        },
        ondata: function(data) {
            console.log(TAG, "We got data from the DataChannel! " + data);
            onDataRecv(sessionID, data)
        }
    });
}

function mediaStateOperation(sessionId, on, medium) {
    if (!on && isShareScreen && medium === 'video') {
        exeShareScreen(false, function(res) {
            if (res.success) {
                myCallbacks[sessionId].onsharescreen(false)
            }
        });

    }
}

function exeCreateConnection(mycallback) {
    let connectionCallbacks = {
        server: urlOptions.websocketurl,
        iceServers: [{"urls": urlOptions.stunurl}],
        success: function(sessionID) {
            console.log(TAG, "exeCreateConnection success",sessionID);
            attachLocal(sessionID, mycallback);
        },
        error: function(error) {
            console.log(TAG, "exeCreateConnection error",error);
            resp.success = false;
            resp.msg = error;
            return mycallback(resp);
        },
        destroyed: function() {
            console.log(TAG, "exeCreateConnection destroyed");
            resp.success = false;
            resp.msg = "exeCreateConnection destroyed";
            return mycallback(resp);
        }
    };

    new tvRTC.createConnection(connectionCallbacks);
}


function exeAddMessageEventListener(callback) {
    console.log(TAG, "exeAddMessageEventListener");
    wsMessageCallback = callback;
}

function exeSendData(sessionId, roomId, type, sender, recver, content, callback) {
    console.log(TAG, "exeSendData");
    let resp = {};
    var message = {};
    message.sender = sender;
    message.platform = userOptions[sessionId].platform;
    message.content = content;
    message.type = type;
    message.roomid = roomId;
    if (recver) {
        message.recver = recver;
    }
    console.log(message);
    if (tvRTC.sessions[sessionId].pluginHandler()) {
        let dataCallbacks = {
            success: function() {
                resp.success = true;
                callback(resp);
            },
            error: function(reason) {
                resp.success = false;
                resp.msg = reason;
                callback(resp);
            }
        };

        if(recver === "") {
            let confsms = {
                request: "confsms",
                content: content,
                room: roomId,
                sender: sender,
                receiver: "all"
            };

            tvRTC.sessions[sessionId].pluginHandler().send({
                "message": confsms
            });
        }else {
            let sms = {
                request: "confsms",
                content: content,
                room: roomId,
                sender: sender,
                receiver: recver
            };

            tvRTC.sessions[sessionId].pluginHandler().send({
                "message": sms
            });
        }

        resp.success = true;
        callback(resp)

    } else {
        resp.success = false;
        resp.msg = tvTipsConstants.pleaseConnectionServer;
        callback(resp);
    }
}
