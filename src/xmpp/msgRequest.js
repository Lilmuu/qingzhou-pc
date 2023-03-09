import WEBIM from "./webim.js"
import apiServer from './apiServer.js'
import apiRequest from './apiRequest.js'
import store from '../store'
export default{
	sendMessage:function(type,fileName,fileSize,objectId,content,toUserId,toUserName){
		console.log(content,"判断表情or")
		// console.log(toUserId,store.state.openUserId,55)
		// 发送或转发消息的时候更新消息列表的最新消息的时间
		let list = store.state.lastChatList
		for(let i = 0; i<list.length; i++){
			if(list[i].jid == toUserId){
				list[i].timeSend = apiServer.getCurrentSeconds()
			}
		}
		store.commit("setLastChatMsg",list)
		var msg=WEBIM.createMessage(type,content,toUserId,toUserName);
		console.log(msg,"判断表情or")

		// content = WEBIM.encryptMessage(content)
		if(!apiServer.isNull(fileName)){
			msg.fileName = fileName;
		}
		if(!apiServer.isNull(fileSize)){
			msg.fileSize = fileSize;
		}
		if(!apiServer.isNull(objectId)){
			msg.objectId = objectId;
		}
		let isR = store.state.readDel
		console.log(isR,7070)
		if(isR[toUserId] == true && msg.type != 8){
			msg.isReadDel=1;
			console.log(msg,8080)
		}
		WEBIM.sendMessage(msg);

		return msg;
	},
	// 发送位置消息
	sendAddress:function(type,objectId,location_x,location_y,content,toUserId,toUserName){
		var msg = WEBIM.createMessage(type,content,toUserId,toUserName);
		if(!apiServer.isNull(objectId)){
			msg.objectId = objectId;
		}
		if(!apiServer.isNull(location_x)){
			msg.location_x = location_x;
		}
		if(!apiServer.isNull(location_y)){
			msg.location_y = location_y;
		}
		WEBIM.sendMessage(msg);
		return msg;
	},
	// 发送语音消息
	sendvoiceMessage:function(url,time,toUserId,toUserName){
		var msg=WEBIM.createVoiceMessage(3,url.url,1,time);
		msg.toUserId = toUserId;
		msg.to = toUserId;
		// msg.toUserName = toUserName;
		WEBIM.sendMessage(msg);
		return msg;
	},
	// 发送已读回执
	sendReadReceipt:function(from,message,isSendMyDevice){
// 		if(!message.isPubsub)
// 			return;

		var msg=WEBIM.sendMessageReadReceipt(from,message.messageId);
		//设置发送消息重发次数
		msg.reSendCount=3;
		console.log("发送已读回执："+msg.messageId+"   类型： ");
	},
	changeText:function(message){
		console.log(message,888)
		var emoji = apiServer.emoji;
		var msgList = [];
		var objList = [];
		for (var face in emoji.map) {
		  if (emoji.map.hasOwnProperty(face)) {
			while (message.content.indexOf(face) > -1) {
			  message.content = message.content.replace(face, "^" + emoji.map[face] + "^");
			}
		  }
		}
		var ary = message.content.split("^");
		var reg = /^e.*g$/;

		for (var i = 0; i < ary.length; i++) {
		  if (ary[i] != "") {
			msgList.push(ary[i]);
		  }
		}
		for (var i = 0; i < msgList.length; i++) {
		  if (reg.test(msgList[i])) {
			var obj = {};
			obj.data = emoji.path+msgList[i];
			obj.type = "emoji";
			objList.push(obj);
		  }
		  else {
			var obj = {};
			obj.data = msgList[i];
			obj.type = "txt";
			objList.push(obj);
		  }

		}
		message.content = objList;
		return message;

	},
	processMsg:function(message){
		if(message.fromUserId == window.sessionStorage.getItem("userId")){
			return;
		}
		console.log("发消息的人id   "+message.fromUserId)
		let list = [];
		console.log(message,11111)
		if(message.isEncrypt==1){
			message.content = WEBIM.decryptMessage(message);
		}
		if(message.type == 5){
			message.content = "static/assets/gif/"+message.content;
		}
		if(message.chatType == "chat"){// 收到单聊消息
			if(store.state.openUserId==message.fromUserId){
				console.log("已经打开了")
				if(message.type==1){
					message=this.changeText(message);
				}
				store.commit("setMsgListOne",message);
				return ;
			}
			if(!apiServer.isNull(window.sessionStorage.getItem("friendsMsgNum"))){
				list = JSON.parse(window.sessionStorage.getItem("friendsMsgNum"));
				if(list.indexOf(message.fromUserId)<0){
					list.push(message.fromUserId);
					window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
				}
			}else{
				list.push(message.fromUserId);
				window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
			}

			let msgNumUserId=0;
			if(apiServer.isNull(window.sessionStorage.getItem("msgNum"+message.fromUserId))){
				console.log("消息为空 "+window.sessionStorage.getItem("msgNum"+message.fromUserId))
			}else{
				msgNumUserId = window.sessionStorage.getItem("msgNum"+message.fromUserId);
			}
			console.log("设置用户对应的消息数量")
			window.sessionStorage.setItem("msgNum"+message.fromUserId,parseInt(msgNumUserId)+1);// 设置用户对应的消息数量
			console.log("设置最新一条消息")
			window.sessionStorage.setItem("newMsgUserId",message.fromUserId);// 设置最新一条消息发送者

			// 保存一个未读消息map  userId:[message]
			let userUnreadList=[];
			let msgMap={};
			if(!apiServer.isNull(window.sessionStorage.getItem("userUnread"))){
				if(!apiServer.isNull(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.fromUserId])){
					console.log("map中有")
					console.log(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.fromUserId]);
					var haveList=JSON.parse(window.sessionStorage.getItem("userUnread"))[message.fromUserId];
					haveList.push(message);
					console.log(haveList);
					msgMap[message.fromUserId]=haveList;
					window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
				}else{
					console.log("map存在 map中没有")
					userUnreadList.push(message);
					msgMap=JSON.parse(window.sessionStorage.getItem("userUnread"));
					msgMap[message.fromUserId]=userUnreadList;
					window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));

				}
			}else{
				// msgMap.push({key:message.fromUserId,value:message});
				// let
				userUnreadList.push(message);
				msgMap[message.fromUserId]=userUnreadList;
				window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
			}
		}else if(message.chatType == "groupchat"){// 收到群组消息
			if(store.state.openUserId==message.toUserId){
				console.log("已经打开了")
				if(message.type==1){
					message=msgRequest.changeText(message);
				}
				store.commit("setMsgListOne",message);
				return ;
			}
			if(!apiServer.isNull(window.sessionStorage.getItem("friendsMsgNum"))){
				list = JSON.parse(window.sessionStorage.getItem("friendsMsgNum"));
				if(list.indexOf(message.toUserId)<0){
					console.log('走if')
					list.push(message.toUserId);
					window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
				}
			}else{
				console.log("走else")
				list.push(message.toUserId);
				window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
			}
			let msgNumUserId=0;
			if(apiServer.isNull(window.sessionStorage.getItem("msgNum"+message.toUserId))){
				console.log("消息为空 "+window.sessionStorage.getItem("msgNum"+message.toUserId))
			}else{
				msgNumUserId = window.sessionStorage.getItem("msgNum"+message.toUserId);
			}
			console.log("设置用户对应的消息数量")
			window.sessionStorage.setItem("msgNum"+message.toUserId,parseInt(msgNumUserId)+1);// 设置用户对应的消息数量
			window.sessionStorage.setItem("newMsgUserId",message.toUserId);// 设置最新一条消息发送者

			// 保存一个未读消息map  userId:[message]
			let userUnreadList=[];
			let msgMap={};
			if(!apiServer.isNull(window.sessionStorage.getItem("userUnread"))){
				if(!apiServer.isNull(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.toUserId])){
					console.log("map中有")
					console.log(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.toUserId]);
					var haveList=JSON.parse(window.sessionStorage.getItem("userUnread"))[message.toUserId];
					haveList.push(message);
					console.log(haveList);
					msgMap[message.toUserId]=haveList;
					window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
				}else{
					console.log("map存在 map中没有")
					userUnreadList.push(message);
					msgMap=JSON.parse(window.sessionStorage.getItem("userUnread"));
					msgMap[message.toUserId]=userUnreadList;
					window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
				}
			}else{
				// msgMap.push({key:message.fromUserId,value:message});
				// let
				userUnreadList.push(message);
				msgMap[message.toUserId]=userUnreadList;
				window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
			}
		}
		// store.commit("setMsgListOne",message);
		store.commit("setNewMsgList",message);
		store.commit("setSysMsgNum",1);
		console.log("设置总的消息数量")
		if(apiServer.isNull(window.sessionStorage.getItem("sysMsgNum"))){
			window.sessionStorage.setItem("sysMsgNum",parseInt(1));// 设置总的消息数量
		}else{
			window.sessionStorage.setItem("sysMsgNum",parseInt(window.sessionStorage.getItem("sysMsgNum"))+1);
		}
		// 保存新消息的Id
		store.commit("setReceiveMsgList",message.messageId);
	},
	/* 处理新朋友消息 */
	handlerNewFriendMessage:function(msg){
		// 维护联系人页面的未读消息总数量
		console.log("处理新朋友消息",1,msg);
		console.log(store.state.openUserId);
		if(msg.type==507){// 拉黑
			// 维护好友列表
			let friends = store.state.friendsMap;
			delete friends[msg.fromUserId];
			store.commit("setfriendsMap",friends);
			// 维护最后一条消息列表
			let news = store.state.lastChatList;
			for(let i=0;i<news.length;i++){
				if(news[i].jid == msg.fromUserId){
					news.splice(i,1)
				}
			}
			store.commit("setLastChatMsg",news);
			// apiServer.setDelMsgNum(that.userId)
		}else if(msg.type == 509){// 取消拉黑
			apiRequest.getMyFriends(function(){
				console.log("重新获取好友列表");
			})
		}else if(msg.type==505){// 彻底删除
			store.commit("setDelMsg",msg)
			// 维护消息列表
			let lastChatList = store.state.lastChatList
			if(lastChatList.length>0){
				lastChatList.forEach(function(item,i){
					if(msg.fromUserId == item.jid){
						lastChatList.splice(i,1)
					}
				})
				store.commit("setLastChatMsg",lastChatList)
			}
			//通讯录
			let map=store.state.friendsMap;
			delete map[msg.fromUserId];
			store.commit('setfriendsMap',map);
			//维护消息列表未读消息总数
			let sysMsgNum = window.sessionStorage.getItem("sysMsgNum")||0
			let msgNum = window.sessionStorage.getItem("msgNum"+msg.fromUserId)||0
			window.sessionStorage.removeItem("msgNum"+msg.fromUserId)
			sysMsgNum -= msgNum
			window.sessionStorage.setItem("sysMsgNum",sysMsgNum)
			// 维护消息列表UI
			// let map2 = store.state.lastChatList;
			// // console.log(map2,5555555555)
			// for(let i = 0;i<map2.length;i++){
			// 	console.log(map2[i].userId,msg.fromUserId)
			// 	if(map2[i].userId == msg.fromUserId){
			// 		map2.splice(i,1)
			// 	}
			// }
			// store.commit("setLastChatMsg",map2)
			// 删除该消息列表中的该消息数据

		}else if(msg.type==508){// 直接加我好友
			let map = store.state.friendsMap;
			apiRequest.getUser(msg.fromUserId,function(result){
				//store更新通讯录
				let fromUserId = msg.fromUserId
				console.log(result)
				result.toNickname = result.nickname
				result.avatar = apiServer.getAvatarUrl(result.userId)
				console.log(result,'直接加好友')
				map[msg.fromUserId] = result;
				console.log(map,111)
				// store.state.friendsMap = Object.assign({},store.state.friendsMap,{fromUserId:result})

				// store.state.friendsMap = map
				store.commit('setfriendsMap',map);

				//存放id到sessionStorage
				let list = [];
				if(!apiServer.isNull(window.sessionStorage.getItem("friendsMsgNum"))){
					list = JSON.parse(window.sessionStorage.getItem("friendsMsgNum"));
					if(list.indexOf(msg.fromUserId)<0){
						list.push(msg.fromUserId);
						window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
					}
				}else{
					console.log("走else")
					list.push(msg.fromUserId);
					window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
				}

				let msgNumUserId=0;
				if(apiServer.isNull(window.sessionStorage.getItem("msgNum"+msg.fromUserId))){
					console.log("消息为空 "+window.sessionStorage.getItem("msgNum"+msg.fromUserId))
				}else{
					msgNumUserId = window.sessionStorage.getItem("msgNum"+msg.fromUserId);
				}
				console.log("设置用户对应的消息数量")
				window.sessionStorage.setItem("msgNum"+msg.fromUserId,parseInt(msgNumUserId)+1);// 设置用户对应的消息数量
				console.log("设置最新一条消息")
				window.sessionStorage.setItem("newMsgUserId",msg.fromUserId);// 设置最新一条消息发送者

				// 保存一个未读消息map  userId:[message]
				let userUnreadList=[];
				let msgMap={};
				if(!apiServer.isNull(window.sessionStorage.getItem("userUnread"))){
					if(!apiServer.isNull(JSON.parse(window.sessionStorage.getItem("userUnread"))[msg.fromUserId])){
						console.log("map中有")
						console.log(JSON.parse(window.sessionStorage.getItem("userUnread"))[msg.fromUserId]);
						var haveList=JSON.parse(window.sessionStorage.getItem("userUnread"))[msg.fromUserId];
						haveList.push(msg);
						console.log(haveList);
						msgMap[msg.fromUserId]=haveList;
						window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
					}else{
						console.log("map存在 map中没有")
						userUnreadList.push(msg);
						msgMap=JSON.parse(window.sessionStorage.getItem("userUnread"));
						msgMap[msg.fromUserId]=userUnreadList;
						window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));

					}
				}else{
					// msgMap.push({key:message.fromUserId,value:message});
					// let
					userUnreadList.push(msg);
					msgMap[msg.fromUserId]=userUnreadList;
					window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
				}

				store.commit("setNewMsgList",msg);
				store.commit("setSysMsgNum",1);
				console.log("设置总的消息数量")
				if(apiServer.isNull(window.sessionStorage.getItem("sysMsgNum"))){
					window.sessionStorage.setItem("sysMsgNum",parseInt(1));// 设置总的消息数量
				}else{
					window.sessionStorage.setItem("sysMsgNum",parseInt(window.sessionStorage.getItem("sysMsgNum"))+1);
				}

				//维护消息列表
				let lastChatList = store.state.lastChatList
				let newFriendMsg = apiServer.getOneMsg(msg.fromUserId,msg.fromUserName,"我们成为好朋友了，快来聊天吧",508,0)
				lastChatList.unshift(newFriendMsg)
				store.commit('setLastChatMsg',lastChatList)
			})


		}else if(msg.type==501){
			apiRequest.getMyFriends(function(){
				console.log(444)
			})
		}


		let list=[];
		if(apiServer.isNull(store.state.newFriendMsgList)){
			list[0]=msg;
			store.commit('setNewFriendMsgList',JSON.stringify(list));
			// window.sessionStorage.setItem("newFriendMsgList",JSON.stringify(list));
		}else{
			list = JSON.parse(store.state.newFriendMsgList);
			for(let i=0;i<list.length;i++){
				if(list[i].fromUserId==msg.fromUserId){
					list[i]=msg
				}else{
					if(i==list.length-1){
						list.push(msg);
					}
				}
			}
			// list.push(msg);
			store.commit('setNewFriendMsgList',JSON.stringify(list));
			// window.sessionStorage.setItem("newFriendMsgList",JSON.stringify(list));
		}
		if(store.state.openUserId=="newfriend"){
			return ;
		}

		if(apiServer.isNull(window.sessionStorage.getItem("peoMsgNum"))){
			window.sessionStorage.setItem("peoMsgNum",parseInt(1));
		}else{

			window.sessionStorage.setItem("peoMsgNum",parseInt(window.sessionStorage.getItem("peoMsgNum"))+1);
		}

		store.commit("setSysMsgNum",1);
		console.log("设置总的消息数量")
		if(apiServer.isNull(window.sessionStorage.getItem("sysMsgNum"))){
			window.sessionStorage.setItem("sysMsgNum",parseInt(1));// 设置总的消息数量
		}else{
			window.sessionStorage.setItem("sysMsgNum",parseInt(window.sessionStorage.getItem("sysMsgNum"))+1);
		}

	},
	// 处理群消息
	handlerGroupGontrolMessage:function (message) {
		console.log("收到群消息", message);
		if(message.type==904){// 被移除群组消息
			console.log(message.toUserId==window.sessionStorage.getItem("userId"));
			if(message.toUserId==window.sessionStorage.getItem("userId")){
				apiRequest.getRoom(message.fileName,function(data){
					WEBIM.exitGroupChat(message.objectId);
					return;
				})


				// 维护最后一条消息列表
				// console.log("维护最后一条消息列表");
				// let news = store.state.lastChatList;
				// for(let i=0;i<news.length;i++){
				// 	if(news[i].jid == message.objectId){
				// 		news.splice(i,1)
				// 	}
				// }
				// store.commit("setLastChatMsg",news);

				// 维护群组列表
				console.log("维护群组列表");
				let roomlist = store.state.myRooms;
				delete roomlist[message.objectId];
				store.commit("setRoomList",roomlist);

				// 维护被移除群组的列表
				if(store.state.removeRoomList.indexOf(message.objectId)==-1){
					store.commit('setRemoveRoomList',message.objectId);
				}

				message.fromUserId = message.objectId;
				// // 维护一下消息角标
				// console.log("维护一下消息角标");
				// apiServer.setDelMsgNum(message.objectId);

			}
		}else if(message.type==903){//
			if(message.fromUserId == window.sessionStorage.getItem("userId")){
				return;
			}
		}else if(message.type==907&&message.toUserId==window.sessionStorage.getItem("userId")){
			message.chatType = "groupchat";
			apiRequest.getRoom(message.fileName,function(data){
				// 保存群组
				console.log("保存群组")
				store.commit('setRoomListByOne',data.data);
				// 加入群聊
				WEBIM.joinGroupChat(message.objectId,window.sessionStorage.getItem("userId"),0);
				// 维护被移除群组列表
				if(store.state.removeRoomList.indexOf(message.objectId)!=-1){
					let removeRoomList = store.state.removeRoomList;
					for(let i=0;i<removeRoomList.length;i++){
						if(removeRoomList[i]==message.objectId){
							removeRoomList.splice(i,1);
						}
					}
					store.commit("setRemoveRoomListAll",removeRoomList);
				}

				console.log("保存完成后打印")
				console.log(store.state.myRooms);
				let list = [];
				if(!apiServer.isNull(window.sessionStorage.getItem("friendsMsgNum"))){
					list = JSON.parse(window.sessionStorage.getItem("friendsMsgNum"));
					console.log(list,2222,message.objectId)
					if(list.indexOf(message.objectId)<0){
						list.push(message.objectId);
						window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
					}
				}else{
					console.log("走else")
					list.push(message.objectId);
					window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
				}

				let msgNumUserId=0;
				if(apiServer.isNull(window.sessionStorage.getItem("msgNum"+message.objectId))){
					console.log("消息为空 "+window.sessionStorage.getItem("msgNum"+message.objectId))
				}else{
					msgNumUserId = window.sessionStorage.getItem("msgNum"+message.objectId);
				}
				console.log("设置用户对应的消息数量")
				window.sessionStorage.setItem("msgNum"+message.objectId,parseInt(msgNumUserId)+1);// 设置用户对应的消息数量
				window.sessionStorage.setItem("newMsgUserId",message.objectId);// 设置最新一条消息发送者

				store.commit("setMsgListOne",message);
				store.commit("setNewMsgList",message);
				store.commit("setSysMsgNum",1);
				console.log("设置总的消息数量")
				if(apiServer.isNull(window.sessionStorage.getItem("sysMsgNum"))){
					window.sessionStorage.setItem("sysMsgNum",parseInt(1));// 设置总的消息数量
				}else{
					window.sessionStorage.setItem("sysMsgNum",parseInt(window.sessionStorage.getItem("sysMsgNum"))+1);
				}

				// 保存一个未读消息map  userId:[message]
				let userUnreadList=[];
				let msgMap={};
				if(!apiServer.isNull(window.sessionStorage.getItem("userUnread"))){
					if(!apiServer.isNull(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.objectId])){
						console.log("map中有")
						console.log(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.objectId]);
						var haveList=JSON.parse(window.sessionStorage.getItem("userUnread"))[message.objectId];
						haveList.push(message);
						console.log(haveList);
						msgMap[message.objectId]=haveList;
						window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
					}else{
						console.log("map存在 map中没有")
						userUnreadList.push(message);
						msgMap=JSON.parse(window.sessionStorage.getItem("userUnread"));
						msgMap[message.objectId]=userUnreadList;
						window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));

					}
				}else{

					// msgMap.push({key:message.fromUserId,value:message});
					// let
					userUnreadList.push(message);
					msgMap[message.objectId]=userUnreadList;
					window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
				}


			})

			return;
		}else if(message.type == 906){
			console.log("收到禁言消息"+message.toUserId);
		}else if(message.type==920){// 全体禁言
			console.log("收到全体禁言消息"+message.toUserId);
		}

		let list = [];
		if(!apiServer.isNull(window.sessionStorage.getItem("friendsMsgNum"))){
			list = JSON.parse(window.sessionStorage.getItem("friendsMsgNum"));
			if(list.indexOf(message.objectId)<0){

				list.push(message.objectId);
				window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
			}
		}else{
			console.log("走else")
			list.push(message.objectId);
			window.sessionStorage.setItem("friendsMsgNum",JSON.stringify(list));
		}

		let msgNumUserId=0;
		if(apiServer.isNull(window.sessionStorage.getItem("msgNum"+message.objectId))){
			console.log("消息为空 "+window.sessionStorage.getItem("msgNum"+message.objectId))
		}else{
			msgNumUserId = window.sessionStorage.getItem("msgNum"+message.objectId);
		}
		console.log("设置用户对应的消息数量")
		window.sessionStorage.setItem("msgNum"+message.objectId,parseInt(msgNumUserId)+1);// 设置用户对应的消息数量
		window.sessionStorage.setItem("newMsgUserId",message.objectId);// 设置最新一条消息发送者

		store.commit("setMsgListOne",message);
		store.commit("setNewMsgList",message);
		store.commit("setSysMsgNum",1);
		console.log("设置总的消息数量")
		if(apiServer.isNull(window.sessionStorage.getItem("sysMsgNum"))){
			window.sessionStorage.setItem("sysMsgNum",parseInt(1));// 设置总的消息数量
		}else{
			window.sessionStorage.setItem("sysMsgNum",parseInt(window.sessionStorage.getItem("sysMsgNum"))+1);
		}

		// 保存一个未读消息map  userId:[message]
		let userUnreadList=[];
		let msgMap={};
		if(!apiServer.isNull(window.sessionStorage.getItem("userUnread"))){
			if(!apiServer.isNull(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.roomJid])){
				console.log("map中有")
				console.log(JSON.parse(window.sessionStorage.getItem("userUnread"))[message.roomJid]);
				var haveList=JSON.parse(window.sessionStorage.getItem("userUnread"))[message.roomJid];
				haveList.push(message);
				console.log(haveList);
				msgMap[message.roomJid]=haveList;
				window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
			}else{
				console.log("map存在 map中没有")
				userUnreadList.push(message);
				msgMap=JSON.parse(window.sessionStorage.getItem("userUnread"));
				msgMap[message.roomJid]=userUnreadList;
				window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
			}
		}else{
			// msgMap.push({key:message.fromUserId,value:message});
			// let
			userUnreadList.push(message);
			msgMap[message.roomJid]=userUnreadList;
			window.sessionStorage.setItem("userUnread",JSON.stringify(msgMap));
		}
		// 保存新消息的Id
		store.commit("setReceiveMsgList",message.messageId);
	},
	// 处理撤回消息
	handlerRevokeMessage:function(message){
		console.log("收到撤回消息")
		console.log(message.content);
		message.content = message.fromUserName+" 撤回了一条消息";
		message = this.changeText(message);
		store.commit("setMsgListOne",message);
		// store.commit("setSysMsgNum",-1);
		// let num = 0
		// if(apiServer.isNull(window.sessionStorage.getItem("sysMsgNum"))){
		// 	window.sessionStorage.setItem("sysMsgNum",1)
		// }else{
		// 	num = window.sessionStorage.setItem("sysMsgNum",parseInt(window.sessionStorage.getItem("sysMsgNum"))+1)
		// }
		// window.sessionStorage.setItem("sysMsgNum",+1);
		console.log("设置最新一条消息")
		// window.sessionStorage.setItem("newMsgUserId",message.fromUserId);// 设置最新一条消息发送者
		// store.commit("setSysMsgNum",store.state.sysMsgNum + 1);
		// let msgNumUserId=0;
		// if(apiServer.isNull(window.sessionStorage.getItem("msgNum"+message.toUserId))){
		// 	console.log("消息为空 "+window.sessionStorage.getItem("msgNum"+message.toUserId))
		// }else{
		// 	msgNumUserId = window.sessionStorage.getItem("msgNum"+message.toUserId);
		// }
		// let userMsgNum = window.sessionStorage.setItem("msgNum"+message.toUserId,parseInt(msgNumUserId)+1);// 设置用户对应的消息数量
		// message.msgNum = userMsgNum;
		// message.isMsgNum = true;

	}
}
