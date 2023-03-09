import Vue from 'vue'
import apiServer from "./apiServer.js"
import msgRequest from './msgRequest.js'
import WEBIM from "./webim-reset.js"
import store from '../store'
import md5 from 'blueimp-md5'

function createApiSecret (obj) {
  obj.time = new Date().getTime()
  let key = process.env.VUE_APP_API_KEY + obj.time
  let md5Key = md5(key)
  obj.secret = md5Key
  return obj
}

export default{
	// 获取好友列表
	getMyFriends:function(callback){
		apiServer.postData({
			url:'/friends/page',
			data:{
				userId:window.sessionStorage.getItem("userId"),
				pageIndex:0,
				status:2,
				pageSize:500
			}
		},function(result){
			if(result.resultCode==1){
        /**
         * 老版 - 返回数据结构{count:2, pageData: [], total: 0}
         * 新版 - 返回数据结构{count:2, data: [], total: 0}
         */
				// if(apiServer.isNull(result)||apiServer.isNull(result.data.pageData)){
        if(apiServer.isNull(result)||apiServer.isNull(result.data.data)){
					callback();
					return;
				}
				let toUserId="";
				var pageData = result.data.data;
				for(var i=0;i<pageData.length;i++){
					toUserId=pageData[i].toUserId;
					pageData[i].avatar=apiServer.sysConfig.avatarBase+(parseInt(toUserId) % 10000) + "/" + toUserId + ".jpg";
				}
				store.commit('setfriendsMap',pageData)
				console.log("好友拉取保存完成")
				callback();
			}
		})
	},
	// 群组列表
	getMyRooms:function(callback){
		let aa = {
			pageIndex:0,
			pageSize:200
		}
		aa = createApiSecret(aa)
		apiServer.postData({
			url:'/room/list/his',
			data: aa
		},function(data){
			if(!apiServer.isNull(data.data)){
				for(let i=0;i<data.data.length;i++){
					// xmpp加入群组
					WEBIM.joinGroupChat(data.data[i].jid,window.sessionStorage.getItem("userId"),0);
				}
				store.commit('setRoomList',data.data);
				console.log("群组拉取保存完成")
			}
			callback();
		})
	},
	// 获取最后一条消息记录
	getLastChatList:function(callback){
		console.log("开始获取最后一条消息记录")
		var obj=JSON.parse(window.sessionStorage.getItem("login"));
		let lock=0;
		console.log(obj)
		var that = this;
		apiServer.postData({
			url:'/tigase/getLastChatList',
			data:{
				startTime:0
			}
		},function(data){
			console.log(99898,data)
			//根据timeSend进行冒泡排序
			for(let i=0;i<data.data.length-1;i++){
				for(let j=0;j<data.data.length-1-i;j++){
					if(data.data[j].timeSend>data.data[j+1].timeSend){
						let obj = data.data[j]
						data.data.splice(j,1)
						data.data.splice(j+1,0,obj)
					}
				}
			}
			if(!apiServer.isNull(data)&&lock ==0&&data.resultCode==1){
				lock = 1;
				console.log("获取最后一条消息成功")
				console.log(store.state.friendsMap)
				let userId="";
				let IndexUserIdlist=[];
				let lastUserList=[];
				for(var i=0;i<data.data.length;i++){
					userId = data.data[i].jid;
					IndexUserIdlist.push(userId);
					var isRoom=data.data[i].isRoom;
					data.data[i].avatar = apiServer.sysConfig.avatarBase+(parseInt(userId) % 10000) + "/" + userId + ".jpg";
					if(data.data[i].toUserId<10020&&data.data[i].toUserId>10001){
						// data.data.splice(i, 1);
						continue;
					}

					if(apiServer.isNull(isRoom)||isRoom==0){
						if(!apiServer.isNull(store.state.friendsMap[userId])){
							data.data[i].toNickName=store.state.friendsMap[userId].toNickname;
						}else{
							continue;
							// data.data.splice(i, 1);
							// console.log("sss");
							// that.getUser(userId,function())
						}

					}else{
						if(!apiServer.isNull(store.state.myRooms[userId])){
							data.data[i].toNickName = store.state.myRooms[userId].name;
						}else{
							continue;
							// data.data.splice(i, 1);
						}
						// data.data[i].avatar = "../assets/groupdefault.png";
					}
// 					if(apiServer.isNull(data.data[i].toNickName)){
// 						data.data.splice(i, 1);
// 					}
	// 				if(!apiServer.isNull(window.sessionStorage.getItem("msgNum"+data.data[i].toUserId))){
	// 					data.data[i].msgNum = Window.sessionStorage.getItem("msgNum"+data.data[i].toUserId)
	// 				}

					lastUserList.push(data.data[i])
				}
				store.commit("setLastChatMsg",lastUserList);
				window.sessionStorage.setItem("IndexUserIdlist",IndexUserIdlist);
				console.log(lastUserList);
				callback(lastUserList);
			}

		})
	},
	// 获取黑名单列表
	getBlackList:function(pageIndex,pageSize,callback){
		if(apiServer.isNull(pageIndex)){
			pageIndex=0;
		}
		if(apiServer.isNull(pageSize)){
			pageSize=10;
		}
		apiServer.postData({
			url:'/friends/blacklist',
			data:{
				pageInde:pageIndex,
				pageSize:pageSize
			}
		},function(result){
			if(result.resultCode==1){
				let userId="";
				for(var i=0;i<result.data.length;i++){
					userId = result.data[i].toUserId;
					result.data[i].avatar = apiServer.sysConfig.avatarBase+(parseInt(userId) % 10000) + "/" + userId + ".jpg";
				}
				callback(result.data);
			}
		})
	},
	// 加入黑名单
	addBlack:function(){

	},
	// 移除黑名单
	removeBlack:function(){

	},
	// 获取新朋友列表
	getNewFriendsList:function(pageIndex,pageSize,callback){
		if(apiServer.isNull(pageIndex)){
			pageIndex=0;
		}
		if(apiServer.isNull(pageSize)){
			pageSize=20;
		}
		apiServer.postData({
			url:'/friends/newFriend/list',
			data:{
				userId:window.sessionStorage.getItem("userId"),
				pageIndex:pageIndex,
				pageSize:pageSize
			}
		},function(result){
			console.log(result);
			if(result.resultCode==1){
				var toUserId = "";
				console.log(result.data)
				for(var i=0;i<result.data.length;i++){
					toUserId=result.data[i].toUserId;
					if(result.data[i].toUserId<100020){
						result.data.splice(i,1);
						i=i-1;
						continue;
					}
					if(result.data[i].userId==window.sessionStorage.getItem("userId")&&result.data[i].userId==toUserId){
						result.data.splice(i,1);
						// i=i-1;
						continue;
					}
					result.data[i].avatar = apiServer.sysConfig.avatarBase+(parseInt(toUserId) % 10000) + "/" + toUserId + ".jpg";

				}

				callback(result.data);
			}

		})
	},
	// 获取历史聊天记录
	getHistory:function(pageIndex,isGroup,endTime,jid,callback){

    console.log('-------------获取历史聊天记录， ',isGroup)
		var url= 1!=isGroup?'/tigase/shiku_msgs':'/tigase/shiku_muc_msgs';
		if(apiServer.isNull(endTime)){
			endTime = 0;
		}
		if(apiServer.isNull(pageIndex)){
			pageIndex = 0;
		}
		var params={
			pageIndex:pageIndex,
			pageSize:20,
			endTime:Number(endTime)*1000,
			maxType:1==isGroup?0:200,
		}
		params[1!=isGroup?"receiver":"roomId"] = jid;
		var lock=0;
		apiServer.postData({
			url:url,
			data:params
		},function(result){
			if(lock==0){
				if(result.resultCode==1){
					lock = 1;
					callback(result.data);
				}
			}
		})
	},
	//用户资料获取
	getUser(userId,callback){
		if(!apiServer.isNull(userId)){
      console.log('2222222222222222 -------- /user/get')
			apiServer.postData({
				url:'/user/get',
				data:{
					userId:userId
				}
			},function(result){
				callback(result.data);
			})
		}
	},
	// 更新个人信息
	updateUser(params,callback){
		if(!apiServer.isNull(params)){
			apiServer.postData({
				url:'/user/update',
				data:params
			},function(result){
				callback(result);
			})
		}
	},
	getRoom:function(roomId,callback){
		if(!apiServer.isNull(roomId)){
			apiServer.postData({
				url:'/room/get',
				data:{
					roomId:roomId
				}
			},function(result){
				callback(result);
			})
		}
	},
	// 获取群文件
	getRoomShareList:function(roomId,callback){
		apiServer.postData({
			url:'/room/share/find',
			data:{
				pageIndex:0,
				pageSize:15,
				roomId:roomId
			}
		},function(result){
			callback(result);
		})
	},
	// 创建房间
	createRoom:function(params,callback){
		apiServer.postData({
			url:'/room/add',
			data:params
		},function(result){
			callback(result);
		})
	},
	// 退出房间
	quitRoom:function(roomId,callback){
		apiServer.postData({
			url:'/room/member/delete',
			data:{
				roomId:roomId,
				userId:window.sessionStorage.getItem("userId")
			}
		},function(result){
			callback(result);
		})
	},
	// 解散群组
	deleteRoom:function(roomId,callback){
		apiServer.postData({
			url:'/room/delete',
			data:{
				roomId:roomId
			}
		},function(result){
			callback(result);
		})
	},
	// 修改密码
	updatePassword:function(obj,callback){
		apiServer.postData({
			url:'/user/password/update',
			data:obj
		},function(result){
			callback(result);
		})
	},
	// 附近的人
	nearByUser:function(keyword,pageIndex,pageSize,callback){
		apiServer.postData({
			url:'/nearby/user',
			data:{
				nickname:keyword,
				pageIndex:pageIndex,
				pageSize:pageSize
			}
		},function(result){
			callback(result);
		})
	},
	// 添加好友
	addFriend:function(toUserId,toUserName,callback){
		if(toUserId==window.sessionStorage.getItem("userId")){
			return 0;
		}
		let that = this;
		apiServer.postData({
			url:'/friends/add',
			data:{
				toUserId:toUserId
			}
		},function(result){
			if(result.resultCode==1){
				// 发送验证通过消息
				let type=501;
				let msg=msgRequest.sendMessage(type,null,null,null,"",toUserId,toUserName);
				let map=store.state.friendsMap;
				map[toUserId] =null;
				that.getUser(toUserId,function(data){
					console.log(data,333333333)
					data.toNickname = data.nickname

					data.avatar = apiServer.getAvatarUrl(data.userId)
				    console.log(1,data)
					map[toUserId]=data;
					store.commit('setfriendsMap',map);
					callback(result);
				});


			}else{
				console.log("加好友失败")
				callback(result);
			}
		})
	},
	// 删除好友
	deleteFriend:function(toUserId,callback){
		apiServer.postData({
			url:'/friends/delete',
			data:{
				toUserId:toUserId
			}
		},function(result){
			callback(result);
		})
	},
	// 新增群共享
	addShared:function(type,url,size,name,roomId,callback){
		apiServer.postData({
			url:'/room/add/share',
			data:{
				name:name,
				roomId:roomId,
				size:size,
				type:type,
				userId:window.sessionStorage.getItem("userId"),
				url:url
			}
		},function(result){

			callback(result);
		})
	},
	// 注册用户
	register:function(telephone,password,nickname,birthday,callback){
		console.log(telephone,password,nickname,birthday)
		apiServer.postData({
			url:'/user/register',
			data:{
				telephone:telephone,
				password:password,
				areaCode:86,
				areaId:0,
				nickname:nickname,
				birthday:birthday,
				userType:1,
				isSmsRegister:0,
				xmppVersion:1
			}
		},function(result){
			callback(result);
		})
	},
	//获取注册配置
	resConfig:function(callback){
		apiServer.postData({
			url:'/config',
			data:{

			}
		},function(result){
			callback(result);
		})
	}
}

