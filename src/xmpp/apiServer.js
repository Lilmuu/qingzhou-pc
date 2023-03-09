/* eslint-disable import/first */
import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
import md5 from 'blueimp-md5'
// 系统配置
export const sysConfig={
	// apiUrl:"https://im.shikutech.com:8443",
	// uploadFileUrl:"https://file.shikutech.com:8443/",
	// apiKey:"5e29f483c48848",
	// avatarBase:"https://file.shikutech.com:8090/avatar/o/",
	// xmppDomain:"im.shiku.co",
	// xmppHost:"120.79.25.45",
	// xmppUrl:"https://im.shikutech.com:5281",
	// xmppUrl:"http://im.shiku.co:5280",//https不包含http

	apiUrl:"http://test.shiku.co:8092",
	uploadFileUrl:"http://test.shiku.co:8088/",
	apiKey:"5e29f483c48848",
	avatarBase:"http://test.shiku.co:8089/avatar/o/",
	xmppDomain:"im.shiku.co",
	xmppHost:"120.79.25.45",
	xmppUrl:"http://test.shiku.co:5280"
}
// 系统变量
let myData={
	userId:null,
	access_token:null,
	charArray : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
}
let emoji={
	path: "./static/assets/emoji/",
	map: {
    "[smile]": "e-01.png",
    "[joy]": "e-02.png",
    "[heart-eyes]": "e-03.png",
    "[sweat_smile]": "e-04.png",
    "[laughing]": "e-05.png",
    "[wink]": "e-06.png",
    "[yum]": "e-07.png",
    "[relieved]": "e-08.png",
    "[fearful]": "e-09.png",
    "[ohYeah]": "e-10.png",
    "[cold-sweat]": "e-11.png",
    "[scream]": "e-12.png",
    "[kissing_heart]": "e-13.png",
    "[smirk]": "e-14.png",
    "[angry]": "e-15.png",
    "[sweat]": "e-16.png",
    "[stuck]": "e-17.png",
    "[rage]": "e-18.png",
    "[etriumph]": "e-19.png",
    "[mask]": "e-20.png",
    "[confounded]": "e-21.png",
    "[sunglasses]": "e-22.png",
    "[sob]": "e-23.png",
    "[blush]": "e-24.png",
    "[doubt]": "e-26.png",
    "[flushed]": "e-27.png",
    "[sleepy]": "e-28.png",
    "[sleeping]": "e-29.png",
    "[disappointed_relieved]": "e-30.png",
    "[tire]": "e-31.png",
    "[astonished]": "e-32.png",
    "[buttonNose]": "e-33.png",
    "[frowning]": "e-34.png",
    "[shutUp]": "e-35.png",
    "[expressionless]": "e-36.png",
    "[confused]": "e-37.png",
    "[tired_face]": "e-38.png",
    "[grin]": "e-39.png",
    "[unamused]": "e-40.png",
    "[persevere]": "e-41.png",
    "[relaxed]": "e-42.png",
    "[pensive]": "e-43.png",
    "[no_mouth]": "e-44.png",
    "[worried]": "e-45.png",
    "[cry]": "e-46.png",
    "[pill]": "e-47.png",
    "[celebrate]": "e-48.png",
    "[gift]": "e-49.png",
    "[birthday]": "e-50.png",
    "[paray]": "e-51.png",
    "[ok_hand]": "e-52.png",
    "[first]": "e-53.png",
    "[v]": "e-54.png",
    "[punch]": "e-55.png",
    "[thumbsup]": "e-56.png",
    "[thumbsdown]": "e-57.png",
    "[muscle]": "e-58.png",
    "[maleficeent]": "e-59.png",
    "[broken_heart]": "e-60.png",
    "[heart]": "e-61.png",
    "[taxi]": "e-62.png",
    "[eyes]": "e-63.png",
    "[rose]": "e-64.png",
    "[ghost]": "e-65.png",
    "[lip]": "e-66.png",
    "[fireworks]": "e-67.png",
    "[balloon]": "e-68.png",
    "[clasphands]": "e-69.png",
    "[bye]": "e-70.png"
	}
}

let emojiObj={
	path: "./static/assets/emoji/",
	map1:{
		"[smile]": "e-01.png",
		"[joy]": "e-02.png",
		"[heart-eyes]": "e-03.png",
		"[sweat_smile]": "e-04.png",
		"[laughing]": "e-05.png",
		"[wink]": "e-06.png",
		"[yum]": "e-07.png",
		"[relieved]": "e-08.png",
		"[fearful]": "e-09.png",
		"[ohYeah]": "e-10.png",
		"[cold-sweat]": "e-11.png",
		"[scream]": "e-12.png",
		"[kissing_heart]": "e-13.png",
		"[smirk]": "e-14.png",
		"[angry]": "e-15.png",
		"[sweat]": "e-16.png",
		"[stuck]": "e-17.png",
		"[rage]": "e-18.png",
		"[etriumph]": "e-19.png",
		"[mask]": "e-20.png",
		"[confounded]": "e-21.png",
		"[sunglasses]": "e-22.png",
		"[sob]": "e-23.png",
		"[del]": "del.png"
	},
	map2:{
		"[blush]": "e-24.png",
		"[doubt]": "e-26.png",
		"[flushed]": "e-27.png",
		"[sleepy]": "e-28.png",
		"[sleeping]": "e-29.png",
		"[disappointed_relieved]": "e-30.png",
		"[tire]": "e-31.png",
		"[astonished]": "e-32.png",
		"[buttonNose]": "e-33.png",
		"[frowning]": "e-34.png",
		"[shutUp]": "e-35.png",
		"[expressionless]": "e-36.png",
		"[confused]": "e-37.png",
		"[tired_face]": "e-38.png",
		"[grin]": "e-39.png",
		"[unamused]": "e-40.png",
		"[persevere]": "e-41.png",
		"[relaxed]": "e-42.png",
		"[pensive]": "e-43.png",
		"[no_mouth]": "e-44.png",
		"[worried]": "e-45.png",
		"[cry]": "e-46.png",
		"[pill]": "e-47.png",
		"[del]": "del.png"
	},
	map3:{
		"[celebrate]": "e-48.png",
		"[gift]": "e-49.png",
		"[birthday]": "e-50.png",
		"[paray]": "e-51.png",
		"[ok_hand]": "e-52.png",
		"[first]": "e-53.png",
		"[v]": "e-54.png",
		"[punch]": "e-55.png",
		"[thumbsup]": "e-56.png",
		"[thumbsdown]": "e-57.png",
		"[muscle]": "e-58.png",
		"[maleficeent]": "e-59.png",
		"[broken_heart]": "e-60.png",
		"[heart]": "e-61.png",
		"[taxi]": "e-62.png",
		"[eyes]": "e-63.png",
		"[rose]": "e-64.png",
		"[ghost]": "e-65.png",
		"[lip]": "e-66.png",
		"[fireworks]": "e-67.png",
		"[balloon]": "e-68.png",
		"[clasphands]": "e-69.png",
		"[bye]": "e-70.png",
		"[del]": "del.png"
	}
}

export default{
	sysConfig,
	emoji,
	emojiObj,
	/* post请求 */
	postData:function(obj,callback){
		console.log("开始请求数据")
		let url=sysConfig.apiUrl+obj.url;
		if(!obj.data.secret){
			obj.data=this.createApiSecret(obj.data);
		}
		axios.responseType='json';
    obj.data.access_token=window.sessionStorage.getItem('access_token');
    console.log(obj)
		axios.post(url,qs.stringify(obj.data)).then(function(response){
			callback(response.data);
		}).catch(function (error){
			console.log(error);
			callback(error);

		})
	},
	/* get请求 */
	getData:function(obj,callback){
		let url=sysConfig.apiUrl+obj.url;
		axios.get(url).then(function (response){
			callback(response.data);
		}).catch(function(error){
			callback(null,"请求报错");
			console.log(error);
		})
	},
	/* 头像上传 */
	postAvatarFile:function(obj,callback){
		let config = {
			headers: {'Content-Type': 'multipart/form-data;boundary = ' + new Date().getTime()}
		  }
		  axios.post(sysConfig.uploadFileUrl+"/upload/UploadifyAvatarServlet",obj.data,config).then(function (result){
		  	callback(result);
		  }).catch(function (error){
		  	callback(error);
		  	console.log(error);
		  })
	},
	/* 文件上传 */
	postFile:function(obj,callback){
		let config = {
			headers: {'Content-Type': 'multipart/form-data;boundary = ' + new Date().getTime()}
		  }
		// axios.responseType='json';
		axios.post(sysConfig.uploadFileUrl+"upload/UploadServlet",obj.data,config).then(function (result){
			callback(result);
		}).catch(function (error){
			callback(error);
			console.log(error);
		})
	},
	postVoiceFile:function(obj,callback){
		let config = {
			headers: {'Content-Type': 'multipart/form-data;boundary = ' + new Date().getTime()}
		}
		axios.post(sysConfig.uploadFileUrl+"upload/UploadVoiceServlet",obj.data,config).then(function (result){
			callback(result);
		}).catch(function (error){
			callback(error);
			console.log(error);
		})
	},
	/*转换MP3*/
	postToMp3:function(obj,callback){
		let config = {
			headers: {'Content-Type': 'application/x-www-form-urlencoded;boundary = ' + new Date().getTime()}
		  }
		axios.post(obj.url,qs.stringify(obj.data),config).then(function (result){
			callback(result);
		}).catch(function (error){
			callback(null,"请求上传报错");
			console.log(error);
		})
	},
	// 普通接口加密
	createApiSecret:function(obj){
		// secret= md5(apikey+time+userid+token)
		obj.time = this.getCurrentSeconds();
		let key = sysConfig.apiKey+obj.time;
		console.log("还没拼接id和token")
		if(!this.isNull(window.sessionStorage.getItem("userId"))&&!this.isNull(window.sessionStorage.getItem("access_token"))){
			console.log("拼接了id和token")
			key += window.sessionStorage.getItem("userId")+window.sessionStorage.getItem("access_token");
		}
		let md5Key = md5(key);
		obj.secret = md5Key;
		return obj;
	},
	// 发送红包加密
	sendRedSecret:function(obj){
		// secret=md5(md5(apikey+time+money)+userid+token+md5(payPassword))
		obj.time = getCurrentSeconds();
		let api_time = sysConfig.apiKey+obj.time;
		let userId_token = myData.userId+myData.access_token;
		let md5ApiTime = md5(api_time);
		let md5Password = md5(obj.password);
		let key = md5ApiTime+userId_token+md5Password;
		let md5Key = md5(key);
		obj.secret = md5Key;
		return obj;
	},
	// 接受红包加密
	receiveRedSecret:function(obj){
		obj.time = getCurrentSeconds();
		let api_time = sysConfig.apiKey+obj.time;
		let userId_token = myData.userId+myData.access_token;
		let md5ApiTime = md5(api_time);
		let key = md5ApiTime+userId_token;
		let md5Key = md5(key);
		obj.secret = md5Key;
		return obj;
	},
	// 获取当前时间
	getCurrentSeconds:function(){
		return Math.round(new Date().getTime()/1000);
	},
	// 时间戳转换时间
	toDate:function(timestamp){
		return new Date(parseInt(timestamp) * 1000).format("yyyy-MM-dd");
	},
	// 时间转换时间戳
	toTimestamp:function(time){
		return Date.parse(time)/1000;
	},
	// 判空
	isNull:function(obj){
		if(obj==""||obj==null||obj==undefined){
			return true;
		}else{
			return false;
		}
	},
	//获取头像地址
	getAvatarUrl:function(userId){
		if(isNaN(userId))
			userId=window.sessionStorage.getItem("userId");
		if(10000==userId)
			return "img/im_10000.png";
		let imgUrl = sysConfig.avatarBase+(parseInt(userId) % 10000) + "/" + userId + ".jpg";
		return imgUrl;
	},
	getUserIdFromJid:function(jid){
		if(this.isNull(jid))
			return "";
		var userId = jid.substr(0, jid.indexOf("@"));
		return userId;
	},
	randomUUID : function() {
		var chars = myData.charArray, uuid = new Array(36), rnd = 0, r;
		for (var i = 0; i < 36; i++) {
			if (i == 8 || i == 13 || i == 18 || i == 23) {
				uuid[i] = '-';
			} else if (i == 14) {
				uuid[i] = '4';
			} else {
				if (rnd <= 0x02)
					rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
		return uuid.join('').replace(/-/gm, '').toLowerCase();
	},
	urlEncode:function(str){
		var ret="";
		var strSpecial="!\"#$%&'()*+,/:;<=>?[]^`{|}~%";
		var tt= "";

		for(var i=0;i<str.length;i++){
			var chr = str.charAt(i);
			var c=str2asc(chr);
			tt += chr+":"+c+"n";
			if(parseInt("0x"+c) > 0x7f){
			ret+="%"+c.slice(0,2)+"%"+c.slice(-2);
			}else{
				if(chr==" ")
				ret+="+";
				else if(strSpecial.indexOf(chr)!=-1)
				ret+="%"+c.toString(16);
				else
				ret+=chr;
			}
	  }
		return ret;
	},
	urldecode:function (str){
		var ret="";
		for(var i=0;i<str.length;i++){
		 var chr = str.charAt(i);
			if(chr == "+"){
				ret+=" ";
			}else if(chr=="%"){
			 var asc = str.substring(i+1,i+3);
			 if(parseInt("0x"+asc)>0x7f){
				ret+=this.asc2str(parseInt("0x"+asc+str.substring(i+4,i+6)));
				i+=5;
			 }else{
				ret+=this.asc2str(parseInt("0x"+asc));
				i+=2;
			 }
			}else{
				ret+= chr;
			}
		}
		return ret;
	},
	asc2str:function(str){
		return String.fromCharCode(str);
	} ,
	GetRequest:function() {
		// alert(window.location.search)
		var url = window.location.search||window.location.hash//获取url中"?"符后的字串
		// console.log(url,66666)
		// alert(url)
		if(url){
			if (url.indexOf("=") != -1) {
				// console.log(url,6666555)
				// alert("判断到有参数")
					 //判断是否有参数
				//  var str = url.substr(1); //从第一个字符开始 因为第0个是?号 获取所有除问号的所有符串
				 let strs = url.split("=");
				//  console.log(strs[1],555)
				//  alert("返回值"+strs[1],6565)
				 //用等号进行分隔 （因为知道只有一个参数 所以直接用等号进分隔 如果有多个参数 要用&号分隔 再用等号进行分隔）
				 return strs[1]        //直接弹出第一个参数 （如果有多个参数 还要进行循环的）
			}
		}
 },

 setCookie:function (c_name,value,expiredays){
	var exdate=new Date()
	exdate.setDate(exdate.getDate()+expiredays)
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
 },

 getCookie:function(c_name)
 {
 if (document.cookie.length>0)
   {
   let c_start=document.cookie.indexOf(c_name + "=")
   if (c_start!=-1)
	 {
	  c_start=c_start + c_name.length+1
		let c_end=document.cookie.indexOf(";",c_start)
	 if (c_end==-1) c_end=document.cookie.length
	 return unescape(document.cookie.substring(c_start,c_end))
	 }
   }
 return ""
 },

	//拼接一条单聊的空消息，用于消息列表
	getOneMsg:function (userId,nickname,content="",type=1,isRoom=0,){
		let oneMsg = {"type":type,"content":content,"isEncrypt":0,"isRoom":isRoom,"jid":userId,"timeSend":this.getCurrentSeconds() };
		oneMsg.avatar=this.getAvatarUrl(userId);
		oneMsg.toNickName = nickname;
		return oneMsg
	},

	//删除消息列表一条消息后维护sessionStorage的消息角标
	setDelMsgNum:function(userId){
		let sysMsgNum = window.sessionStorage.getItem("sysMsgNum")||0
		let msgNum = window.sessionStorage.getItem("msgNum"+userId)||0
		window.sessionStorage.removeItem("msgNum"+userId)
		let last = Number(sysMsgNum)-Number(msgNum);
		window.sessionStorage.setItem("sysMsgNum",last);
		console.log("真是的无语   "+window.sessionStorage.getItem("sysMsgNum"));
	}

}
//时间转换
Date.prototype.format = function(fmt) {
     var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt;
}



