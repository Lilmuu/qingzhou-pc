const tvvsdk_constants = require("./tvvsdk_constants.js");
const tvConstants = tvvsdk_constants.constants;
const tvlogTag = tvvsdk_constants.logTag;
const tvvssdk_core = require("./tvvssdk_core.js");
const tvvssdk_tools = require("./tvvsdk_tools.js");

/**
 * 初始化视频流参数配置
 * @param {Object} options 参数配置
 * @param {Object} callback 回调
 */
function init(options, callback) {
	console.log(tvlogTag.APP2SDK, 'exeInit', 'options', options)
	tvvssdk_core.exeInit(options, callback);
}

function queryRoomList(callback) {
	tvvssdk_tools.exeQueryRoomList(callback);
}

function createConnection(callback) {
	console.log(tvlogTag.APP2SDK, 'exeCreateConnection')
	tvvssdk_core.exeCreateConnection(callback);
}

/**
 * 加入房间
 * @param {Object} roomId 房间号
 * @param {Object} name 用户名
 * @param {Object} callbacks 回调
 */
function joinRoom(sessionId, roomId, name, callback) {
	console.log(tvlogTag.APP2SDK, 'exeJoinRoom', 'sessionId', sessionId, 'roomId', roomId, 'name', name)
	tvvssdk_core.exeJoinRoom(sessionId, roomId, name, callback);
}


function queryRoom(sessionId, roomId, callback) {
	console.log(tvlogTag.APP2SDK, 'exeQueryRoom', 'sessionId', sessionId, 'roomId', roomId)
	tvvssdk_core.exeQueryRoom(sessionId, roomId, callback);
}

function queryDevice(sessionId, callback) {
	console.log(tvlogTag.APP2SDK, 'exeQueryDevice', 'sessionId', sessionId)
	tvvssdk_core.exeQueryDevice(sessionId, callback);
}

function compositeRoom(sessionId, roomId, userList) {
	console.log(tvlogTag.APP2SDK, 'exeCompositeRoom', 'sessionId', sessionId, 'roomId', roomId, 'userList', userList)
	tvvssdk_core.exeCompositeRoom(sessionId, roomId, userList);
}


/**
 * 显示视频流
 * @param {Object} videoObj
 * @param {Object} stream
 */
function attachMediaStream(videoObj, stream) {
	console.log(tvlogTag.APP2SDK, 'exeAttachMediaStream', 'videoObj', videoObj, 'stream', stream)
	tvvssdk_core.exeAttachMediaStream(videoObj, stream);
}


/**
 * 退出房间
 */
function leaveRoom(sessionId) {
	console.log(tvlogTag.APP2SDK, 'exeLeaveRoom', 'sessionId', sessionId)
	tvvssdk_core.exeLeaveRoom(sessionId);
}

/**
 * 屏幕共享
 * @param {Object} share 开启 | 关闭
 * @param {Object} callback 回调
 */
function shareScreen(sessionId, enable, callback) {
	console.log(tvlogTag.APP2SDK, 'exeShareScreen', 'sessionId', sessionId, 'enable', enable)
	tvvssdk_core.exeShareScreen(sessionId, enable, callback);
}

function mike(sessionId, enable, callback) {
	console.log(tvlogTag.APP2SDK, 'exeMike', 'sessionId', sessionId, 'enable', enable)
	tvvssdk_core.exeMike(sessionId, enable, callback);
}


/**
 * 开启或关闭视频流
 * @param {Object} enable true|false
 * @param {Object} callback 回调
 */
function publish(sessionId, enable, callback) {
	console.log(tvlogTag.APP2SDK, 'exePublish', 'sessionId', sessionId, 'enable', enable)
	tvvssdk_core.exePublish(sessionId, enable, callback);
}

/**
 * 单发消息
 * @param {Object} sender 发送者
 * @param {Object} recver 接收者
 * @param {Object} content 内容
 * @param {Object} callback 回调
 */
function sendSingleData(sessionId, roomId, sender, recver, content, callback) {
	console.log(tvlogTag.APP2SDK, 'exeSendData', 'sessionId', sessionId, 'roomId', roomId, 'sender', sender, 'recver', recver, 'content', content)
	tvvssdk_core.exeSendData(sessionId, roomId, tvConstants.singleMessage, sender, recver, content, callback);
}


/**
 * 单发消息(带接收者对方平台信息)
 * @param {Object} sender 发送者
 * @param {Object} recver 接收者
 * @param {Object} platform 接收者平台
 * @param {Object} content 内容
 * @param {Object} callback 回调
 */
function sendSingleData2(sessionId, roomId, sender, recver, platform, content, callback) {
	tvvssdk_core.exeSendData(sessionId, roomId, tvConstants.singleMessage, sender, recver, content, callback);
}


/**
 * 群发消息
 * @param {Object} sender 发送者
 * @param {Object} content 内容
 * @param {Object} callback 回调
 */
function sendGroupData(sessionId, roomId, sender, receiver, content, callback) {
	console.log(tvlogTag.APP2SDK, 'exeSendData', 'sessionId', sessionId, 'roomId', roomId, 'sender', sender, 'recver', receiver, 'content', content)
	tvvssdk_core.exeSendData(sessionId, roomId, tvConstants.groupMessage, sender, receiver, content, callback);
}

/**
 * 设置码率
 * @param {Object} bitrate 码率值  1024=1kb/s  1mbps = 1024x1024
 * @param {Object} callback
 */
function setBitrate(sessionId, bitrate, callback) {
	console.log(tvlogTag.APP2SDK, 'exeSetBitrate', 'sessionId', sessionId, 'bitrate', bitrate)
	tvvssdk_core.exeSetBitrate(sessionId, bitrate, callback);
}

/**
 * 重设置会场分辨率和码率
 * @param confSize
 * @param confBr
 */
function reconfigConf(sessionId, roomId, confSize, confBr, confFps, callback) {
	console.log(tvlogTag.APP2SDK, 'exeReconfigConf', 'sessionId', sessionId, 'roomId', roomId, 'confSize', confSize, 'confBr', confBr, 'confFps', confFps)
	tvvssdk_core.exeReconfigConf(sessionId, roomId, confSize, confBr, confFps, callback);
}
/**
 * 获取所有设备列表
 * @param callback
 */
function getAllDevices(callback) {


	tvvssdk_core.exeGetAllDevices(callback);
}
/**
 * 设置分辨率
 * @param {Object} resolution 分辨率,只支持360P,720P,1080P
 * @param {Object} callback
 */
function setResolution(sessionId, resolution, callback) {
	console.log(tvlogTag.APP2SDK, 'exeSetResolution', 'sessionId', sessionId, 'resolution', resolution)
	tvvssdk_core.exeSetResolution(sessionId, resolution, callback);
}

function getQos(sessionId, callback) {
	tvvssdk_core.exeGetQos(sessionId, callback);
}

//获取PeerConnection对象
function getPeer(sessionId) {
	return tvvssdk_core.exeGetPeer(sessionId);
}

// 开始推流
function streamStart(sessionId, options, roomId, callbacks) {
	console.log(tvlogTag.APP2SDK, 'exeStreamStart', 'sessionId', sessionId, 'roomId', roomId, 'options', options)
	return tvvssdk_core.exeStreamStart(sessionId, options, roomId, callbacks);
}

// 关闭推流
function streamStop(sessionId) {
	console.log(tvlogTag.APP2SDK, 'exeStreamStop', 'sessionId', sessionId)
	return tvvssdk_core.exeStreamStop(sessionId);
}

function invite28181(sessionId, deviceId, callback) {
	console.log(tvlogTag.APP2SDK, 'exeInvite28181', 'sessionId', sessionId, 'deviceId', deviceId)
	return tvvssdk_core.exeInvite28181(sessionId, deviceId, callback);

}

function bye28181(sessionId, deviceId, callback) {
	console.log(tvlogTag.APP2SDK, 'exeBye28181', 'sessionId', sessionId, 'deviceId', deviceId)
	return tvvssdk_core.exeBye28181(sessionId, deviceId, callback);
}


module.exports = {
	//初始化参数,检查环境是否支持webrtc,设置服务器参数
	init: init,
	//查询房间列表
	queryRoomList: queryRoomList,
	//创建连接
	createConnection: createConnection,
	//加入房间
	joinRoom: joinRoom,
	//查询房间
	queryRoom: queryRoom,
	//查询28181摄像头
	queryDevice: queryDevice,
	//编排房间显示顺序
	compositeRoom: compositeRoom,
	//添加媒体流
	attachMediaStream: attachMediaStream,
	//离开房间
	leaveRoom: leaveRoom,
	//屏幕共享
	shareScreen: shareScreen,
	//开关麦克风
	mike: mike,
	//开关摄像头
	publish: publish,
	//单发消息
	sendSingleData: sendSingleData,
	sendSingleData2: sendSingleData2,
	//群发消息
	sendGroupData: sendGroupData,
	//获取多媒体设备
	getAllDevices: getAllDevices,
	//设置本地摄像头分辨率
	setResolution: setResolution,
	//设置本地码率
	setBitrate: setBitrate,
	//重配置会场参数
	reconfigConf: reconfigConf,
	//获取QOS信息
	getQos: getQos,
	getPeer: getPeer,
	// 开始推流
	streamStart: streamStart,
	// 关闭推流
	streamStop: streamStop,
	// 28181摄像头开始推流
	invite28181: invite28181,
	// 28181摄像头停止推流
	bye28181: bye28181,
};
