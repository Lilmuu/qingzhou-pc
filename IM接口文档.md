---
typora-root-url: ./
---

```js
fetch('http://113.207.109.120:8094/config')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
  });
```


```js
fetch("http://113.207.109.120:8094/config", {
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN"
  },
  "referrer": "http://localhost:/index.html",
  "referrerPolicy": "no-referrer-when-downgrade",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
}).then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(myJson);
    });
```
  

> IM接口文档



[TOC]


## 0. 用户表信息

| 集合名            | 含义             | 结构说明                                                     |
| ----------------- | ---------------- | ------------------------------------------------------------ |
| shiku_lastChat    | 最后一条聊天记录 | -- lastChats_muc  群聊天最后一条记录<br/>-- -- jid 群的id<br/>-- 10 个人聊天最后一条记录 |
| imRoo             | 群信息           | -- shiku_room  存储群信息<br/>-- -- jid 群的id<br/>-- mucmsg_6c1536dbf97540d1b906d76f4272a90d 群聊天信息<br/>-- -- message 群信息 |
| shiku_room_member | 群成员集合       | -- 896 可以根据userId 查询roomID                             |
| shiku_msgs        | 聊天记录表       | --  一次聊天会生成两条记录，聊天记录的发送者id是双方各自的id |

注：通过imRoo 的 id关联 shiku_room_member 的roomId

​		通过imRoo 的 jid 关联 shiku_lastChat 的 jid



## 1. 信息列表

- 响应参数  resultCode （int） :

  | 值      | 含义               |
  | ------- | ------------------ |
  | 1       | 接口响应成功       |
  | 1030102 | 访问令牌过期或无效 |
  | 1030101 | 缺少访问令牌       |

​		

### 1.1.用户资料获取

- 接口路径:    /user/get

- 请求方式:  GET 

- 请求: 

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  
- 响应:

```json
{
    "currentTime": 1612839425242,
    "data": {
        "account": "100164373329",
        "active": 0,
        "areaCode": "86",
        "areaId": 0,
        "attCount": 0,
        "birthday": 0,
        "cityId": 0,
        "countryId": 0,
        "createTime": 1612772503,
        "description": "",
        "encryAccount": "ccaa643b00b40998dfb81f34ed8fdc78",
        "fansCount": 0,
        "friendsCount": 0,
        "idcard": "",
        "idcardUrl": "",
        "isAuth": 0,
        "isOpenResetPwd": 0,
        "isPasuse": 0,
        "level": 0,
        "loc": {
            "lat": 0.0,
            "lng": 0.0
        },
        "modifyTime": 1612772503,
        "msgNum": 0,
        "myInviteCode": "",
        "name": "",
        "nickname": "张益达",
        "notLetSeeHim": false,
        "notSeeHim": false,
        "num": 0,
        "offlineNoPushMsg": 0,
        "onlinestate": 0,
        "password": "1a850742f81ddc04da6f7648a4af0e47",
        "payPassword": "0",
        "phone": "18094152050",
        "provinceId": 0,
        "realNameCertified": 0,
        "role": [
            2
        ],
        "setAccountCount": 0,
        "settings": {
            "allowAtt": 1,
            "allowGreet": 1,
            "authSwitch": 0,
            "beInvitedJoinRoom": 0,
            "chatRecordTimeOut": "-1.0",
            "chatSyncTimeLen": 30.0,
            "closeTelephoneFind": 1,
            "friendFromList": "1,2,3,4,5",
            "friendsVerify": 1,
            "hiding": -1,
            "isKeepalive": 1,
            "isOpenPrivacyPosition": 1,
            "isShowMsgState": 1,
            "isSkidRemoveHistoryMsg": 1,
            "isTyping": 0,
            "isUseGoogleMap": 0,
            "isVibration": 0,
            "multipleDevices": 1,
            "nameSearch": 1,
            "openService": 0,
            "phoneSearch": 1,
            "showLastLoginTime": -1,
            "showTelephone": -1
        },
        "sex": 1,
        "showLastLoginTime": 1612835799,
        "status": 1,
        "telephone": "8618094152050",
        "totalConsume": 0.0,
        "totalRecharge": 0.0,
        "userId": 100164,
        "userKey": "aee198505eda1e401e36f36e2c0f4ab5",
        "userType": 2,
        "vip": 0,
        "walletUserNo": 0,
        "withdrawBurnReadTime": 0
    },
    "resultCode": 1
}
```



### 1.2. 查找好友 

- 接口路径:   /friends/page

- 请求方式: GET

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注  |
  | ------------ | ------------ | -------- | ----- |
  | pageIndex    | 当前页数     | 是       | 0     |
  | pageSize     | 每页数量     | 是       | 50000 |
  | access_token | token 令牌   | 是       |       |
  | flag         | 任务管理标识 | 是       | rw    |
  | userId       | 用户id       | 是       |       |

- 响应: 


```json
{
    "currentTime": 1612840957911,
    "data": {
        "pageCount": 1,
        "pageData": [
            {
                "account": "10000451059",
                "blacklist": 0,
                "chatRecordTimeOut": -1.0,
                "createTime": 1612772503,
                "encryptType": 0,
                "fromAddType": 4,
                "hideChatSwitch": 0,
                "hiding": -1,
                "isBeenBlack": 0,
                "isOpenSnapchat": 0,
                "lastTalkTime": 0,
                "modifyTime": 0,
                "msgNum": 0,
                "offlineNoPushMsg": 0,
                "openTopChatTime": 0,
                "orderKey": "K",
                "status": 2,
                "toFriendsRole": [
                    2
                ],
                "toNickname": "客服公众号",
                "toUserId": 10000,
                "toUserType": 2,
                "userId": 100164
            },
            {
                "account": "100158644641",
                "blacklist": 0,
                "chatRecordTimeOut": -1.0,
                "createTime": 1612776011,
                "encryptType": 0,
                "fromAddType": 4,
                "hideChatSwitch": 0,
                "hiding": -1,
                "isBeenBlack": 0,
                "isOpenSnapchat": 0,
                "lastTalkTime": 0,
                "modifyTime": 0,
                "msgNum": 0,
                "offlineNoPushMsg": 0,
                "openTopChatTime": 0,
                "orderKey": "C",
                "status": 2,
                "toFriendsRole": [
                    2
                ],
                "toNickname": "测试001",
                "toUserId": 100158,
                "toUserType": 2,
                "userId": 100164
            },
            {
                "account": "100159916320",
                "blacklist": 0,
                "chatRecordTimeOut": -1.0,
                "createTime": 1612776025,
                "encryptType": 0,
                "fromAddType": 4,
                "hideChatSwitch": 0,
                "hiding": -1,
                "isBeenBlack": 0,
                "isOpenSnapchat": 0,
                "lastTalkTime": 0,
                "modifyTime": 0,
                "msgNum": 0,
                "offlineNoPushMsg": 0,
                "openTopChatTime": 0,
                "orderKey": "P",
                "status": 2,
                "toFriendsRole": [
                    2
                ],
                "toNickname": "朋友001",
                "toUserId": 100159,
                "toUserType": 2,
                "userId": 100164
            }
        ],
        "pageIndex": 0,
        "pageSize": 15,
        "start": 0,
        "total": 3
    },
    "resultCode": 1
}
```





### 1.3. 用户历史房间列表

- 接口路径:   /room/list/his 

- 请求方式: GET

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注  |
  | ------------ | ------------ | -------- | ----- |
  | pageIndex    | 当前页数     | 是       | 0     |
  | pageSize     | 每页数量     | 是       | 50000 |
  | access_token | token 令牌   | 是       |       |
  | flag         | 任务管理标识 | 是       | rw    |

- 响应: 

```json
{
    "currentTime": 1612851893932,
    "data": [
        {
            "adminMaxNumber": 50,
            "allowConference": 1,
            "allowHostUpdate": 1,
            "allowInviteFriend": 1,
            "allowOpenLive": 1,
            "allowSendCard": 1,
            "allowSpeakCourse": 1,
            "allowUploadFile": 1,
            "chatRecordTimeOut": -1.0,
            "createTime": 1612776056,
            "desc": "测试",
            "encryptType": 0,
            "id": "60210278cb36d459fe88c196",
            "inGroup": false,
            "isAttritionNotice": 1,
            "isLook": 1,
            "isNeedVerify": 0,
            "isSecretGroup": 0,
            "jid": "6c1536dbf97540d1b906d76f4272a90d",
            "liveStatus": 0,
            "loc": {
                "lat": 0.0,
                "lng": 0.0
            },
            "maxUserSize": 1000,
            "meetingStatus": 0,
            "member": {
                "active": 1612776056,
                "beginMsgTime": 0,
                "clearMaxSeqNo": 0,
                "createTime": 1612776056,
                "hideChatSwitch": 0,
                "hiding": 0,
                "inviteUserId": 0,
                "isBlack": 0,
                "isOpenTopChat": 0,
                "joinSeqNo": 0,
                "loginTime": 0,
                "modifyTime": 0,
                "nickname": "张益达",
                "offlineNoPushMsg": 0,
                "onlinestate": 0,
                "openTopChatTime": 0,
                "operationType": 0,
                "role": 1,
                "sub": 1,
                "talkTime": 0,
                "userId": 100164
            },
            "modifyTime": 1612776056,
            "name": "测试群",
            "nickname": "张益达",
            "notice": {
                "modifyTime": 0,
                "time": 0
            },
            "notices": [],
            "s": 1,
            "showMember": 1,
            "showRead": 0,
            "subject": "",
            "tags": [],
            "talkTime": 0,
            "userId": 100164,
            "userSize": 3,
            "withdrawTime": 0
        }
    ],
    "resultCode": 1
}
```





### 1.4. 获取首页的最近一条的聊天记录列表  

- 接口路径:  /tigase/getLastChatList  

- 请求方式: GET

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注  |
  | ------------ | ------------ | -------- | ----- |
  | pageIndex    | 当前页数     | 是       | 0     |
  | pageSize     | 每页数量     | 是       | 50000 |
  | access_token | token 令牌   | 是       |       |
  | flag         | 任务管理标识 | 是       | rw    |

- 响应: 

- contentType ==1 : 表示文字

- contentType == 2 ： 表示图片

```json
{
    "currentTime": 1612852375737,
    "data": [
        {
            "_id": "6021027b1bb77153b4e8bb61",
            "type": 907,
            "messageId": "1c39ca8f048547a2bff4f4a3f136d809",
            "timeSend": 1612776057333,
            "content": "测试群",
            "userId": "100164",
            "jid": "6c1536dbf97540d1b906d76f4272a90d", // 单聊为目标id，群聊为房间jid
            "isRoom": 1,  // 是群聊为1 单聊为 0
            "isEncrypt": false,
            "encryptType": 0,
            "from": "10005/Server",
            "to": "6c1536dbf97540d1b906d76f4272a90d",
            "fromUserName": "张益达",
            "toUserName": "朋友001"
        }
    ],
    "resultCode": 1
}
```



### 1.5. 添加好友（可以考虑不用添加好友，直接聊天 前端尝试）

- 接口路径:   /friends/add

- 请求方式: GET

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | toUserId     | 目标用户Id   | 是       |      |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |

- 响应: 

```json
{
    "currentTime": 1612924404770,
    "resultCode": 1
}
```



### 1.6. 群聊聊天记录

- 接口路径:   /tigase/shiku_muc_msgs

- 请求方式: GET

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注               |
  | ------------ | ------------ | -------- | ------------------ |
  | roomId       | 房间 jid     | 是       | shiku_room 中的jid |
  | access_token | token 令牌   | 是       |                    |
  | flag         | 任务管理标识 | 是       | rw                 |
  | pageIndex    | 当前页数     | 是       | 0     |
  | pageSize     | 每页数量     | 是       | 50000 |



- 响应: 
- 查询的聊天记录是  mucmsg_roomId 中的记录数据
- contentType = 1 表示聊天内容， 其他 contenType 的枚举值 见于 MessageType 接口中
- 

```json
{
    "currentTime": 1613807752659,
    "data": [
        {
            "_id": "60307a5a1bb77153b4e8bbff",
            "message": "{\"content\":\"不好\",\"deleteTime\":0,\"encryptType\":0,\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":2,\"from\":\"100164/web\",\"messageId\":\"skimweb_1001641613789795464562\",\"offline\":false,\"to\":\"6c1536dbf97540d1b906d76f4272a90d\"},\"timeSend\":1613789795464,\"toUserId\":\"6c1536dbf97540d1b906d76f4272a90d\",\"toUserName\":\"测试群\",\"type\":1}",
            "room_jid": "6c1536dbf97540d1b906d76f4272a90d",
            "sender_jid": "100164/web",
            "sender": "100164",
            "ts": 1613789786560,
            "contentType": 1,
            "messageId": "skimweb_1001641613789795464562",
            "timeSend": 1613789795464,
            "deleteTime": 0,
            "content": "不好",
            "readCount": 0
        },
        {
            "_id": "60307a421bb77153b4e8bbfe",
            "message": "{\"content\":\"你好\",\"deleteTime\":0,\"encryptType\":0,\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":2,\"from\":\"100164/web\",\"messageId\":\"skimweb_1001641613789771972876\",\"offline\":false,\"to\":\"6c1536dbf97540d1b906d76f4272a90d\"},\"timeSend\":1613789771972,\"toUserId\":\"6c1536dbf97540d1b906d76f4272a90d\",\"toUserName\":\"测试群\",\"type\":1}",
            "room_jid": "6c1536dbf97540d1b906d76f4272a90d",
            "sender_jid": "100164/web",
            "sender": "100164",
            "ts": 1613789762558,
            "contentType": 1,
            "messageId": "skimweb_1001641613789771972876",
            "timeSend": 1613789771972,
            "deleteTime": 0,
            "content": "你好",
            "readCount": 0
        },
        {
            "_id": "60234acd1bb77153b4e8bb87",
            "message": "{\"content\":\"0\",\"deleteTime\":0,\"encryptType\":0,\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":2,\"from\":\"10005/Server\",\"messageId\":\"459c1c834e5747eb94bfa76d65ddf481\",\"offline\":false,\"to\":\"6c1536dbf97540d1b906d76f4272a90d\"},\"objectId\":\"6c1536dbf97540d1b906d76f4272a90d\",\"timeSend\":1612925644963,\"type\":915}",
            "room_jid": "6c1536dbf97540d1b906d76f4272a90d",
            "sender_jid": "10005/Server",
            "sender": "100164",
            "ts": 1612925645916,
            "contentType": 915,
            "messageId": "459c1c834e5747eb94bfa76d65ddf481",
            "timeSend": 1612925644963,
            "deleteTime": 0,
            "content": "0",
            "readCount": 0
        },
        {
            "_id": "60234acb1bb77153b4e8bb86",
            "message": "{\"content\":\"1\",\"deleteTime\":0,\"encryptType\":0,\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":2,\"from\":\"10005/Server\",\"messageId\":\"1f5bfe4e5c9e410884f65514217110a6\",\"offline\":false,\"to\":\"6c1536dbf97540d1b906d76f4272a90d\"},\"objectId\":\"6c1536dbf97540d1b906d76f4272a90d\",\"timeSend\":1612925642804,\"type\":915}",
            "room_jid": "6c1536dbf97540d1b906d76f4272a90d",
            "sender_jid": "10005/Server",
            "sender": "100164",
            "ts": 1612925643916,
            "contentType": 915,
            "messageId": "1f5bfe4e5c9e410884f65514217110a6",
            "timeSend": 1612925642804,
            "deleteTime": 0,
            "content": "1",
            "readCount": 0
        },
        {
            "_id": "6021027b1bb77153b4e8bb60",
            "message": "{\"content\":\"测试群\",\"deleteTime\":0,\"encryptType\":0,\"fileName\":\"60210278cb36d459fe88c196\",\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":2,\"from\":\"10005/Server\",\"messageId\":\"1c39ca8f048547a2bff4f4a3f136d809\",\"offline\":false,\"to\":\"6c1536dbf97540d1b906d76f4272a90d\"},\"objectId\":\"6c1536dbf97540d1b906d76f4272a90d\",\"other\":\"{\\\"lsLook\\\":1,\\\"allowSendCard\\\":1,\\\"isSecretGroup\\\":0,\\\"joinSeqNo\\\":0,\\\"isNeedVerify\\\":0,\\\"showMember\\\":1,\\\"showRead\\\":0,\\\"maxUserSize\\\":1000}\",\"timeSend\":1612776057333,\"toUserId\":\"100159\",\"toUserName\":\"朋友001\",\"type\":907}",
            "room_jid": "6c1536dbf97540d1b906d76f4272a90d",
            "sender_jid": "10005/Server",
            "sender": "100164",
            "ts": 1612776059065,
            "contentType": 907,
            "messageId": "1c39ca8f048547a2bff4f4a3f136d809",
            "timeSend": 1612776057333,
            "deleteTime": 0,
            "content": "测试群",
            "readCount": 0
        },
        {
            "_id": "6021027b1bb77153b4e8bb5f",
            "message": "{\"content\":\"测试群\",\"deleteTime\":0,\"encryptType\":0,\"fileName\":\"60210278cb36d459fe88c196\",\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":2,\"from\":\"10005/Server\",\"messageId\":\"2a96a96a381b4e7691314e4ff9c55c22\",\"offline\":false,\"to\":\"6c1536dbf97540d1b906d76f4272a90d\"},\"objectId\":\"6c1536dbf97540d1b906d76f4272a90d\",\"other\":\"{\\\"lsLook\\\":1,\\\"allowSendCard\\\":1,\\\"isSecretGroup\\\":0,\\\"joinSeqNo\\\":0,\\\"isNeedVerify\\\":0,\\\"showMember\\\":1,\\\"showRead\\\":0,\\\"maxUserSize\\\":1000}\",\"timeSend\":1612776057321,\"toUserId\":\"100158\",\"toUserName\":\"测试001\",\"type\":907}",
            "room_jid": "6c1536dbf97540d1b906d76f4272a90d",
            "sender_jid": "10005/Server",
            "sender": "100164",
            "ts": 1612776059064,
            "contentType": 907,
            "messageId": "2a96a96a381b4e7691314e4ff9c55c22",
            "timeSend": 1612776057321,
            "deleteTime": 0,
            "content": "测试群",
            "readCount": 0
        }
    ],
    "resultCode": 1,
    "resultMsg": ""
}
```



### 1.7. 创建群组

- 接口路径:    /room/add

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义                               | 是否必须 | 备注                                           |
  | ------------ | ---------------------------------- | -------- | ---------------------------------------------- |
  | jid          | 群的id                             | 是       | 随机生成的字符串，不能重复（生成规则可查看h5） |
  | access_token | token 令牌                         | 是       |                                                |
  | flag         | 任务管理标识                       | 是       | rw                                             |
  | name         | 群组名称                           | 是       |                                                |
  | desc         | 群组说明                           | 否       |                                                |
  | phones       | 成员电话集合（数组json格式字符串） | 否       | 例： phones ： [100102,15730107952]            |

- 响应: 

  返回群组实体 Room

```json
{
    "currentTime": 1613965938767,
    "data": {
        "adminMaxNumber": 50,
        "allowConference": 1,
        "allowHostUpdate": 1,
        "allowInviteFriend": 1,
        "allowOpenLive": 1,
        "allowSendCard": 1,
        "allowSpeakCourse": 1,
        "allowUploadFile": 1,
        "chatRecordTimeOut": -1.0,
        "createTime": 1613965938,
        "desc": "005",
        "encryptType": 0,
        "id": "60332a72d656fd634b20f20a",
        "inGroup": false,
        "isAttritionNotice": 1,
        "isLook": 1,
        "isNeedVerify": 0,
        "isSecretGroup": 0,
        "jid": "f6c9eb95fc1048b7bba4b3c7e9249de1",
        "liveStatus": 0,
        "loc": {
            "lat": 0.0,
            "lng": 0.0
        },
        "maxUserSize": 1000,
        "meetingStatus": 0,
        "members": [],
        "modifyTime": 1613965938,
        "name": "005",
        "nickname": "张益达",
        "notice": {
            "modifyTime": 0,
            "time": 0
        },
        "notices": [],
        "s": 1,
        "showMember": 1,
        "showRead": 0,
        "subject": "",
        "tags": [],
        "talkTime": 0,
        "userId": 100164,
        "userSize": 0,
        "withdrawTime": 0
    },
    "resultCode": 1
}
```



### 1.8. 根据群id获取群组详情

- 接口路径:    /room/get

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  | roomId       | 群组 id      | 是       |      |
  
  
  
- 响应: 

  返回群组实体 Room

```json
{
    "currentTime": 1613975304060,
    "data": {
        "adminMaxNumber": 50,
        "allowConference": 1,
        "allowHostUpdate": 1,
        "allowInviteFriend": 1,
        "allowOpenLive": 1,
        "allowSendCard": 1,
        "allowSpeakCourse": 1,
        "allowUploadFile": 1,
        "chatRecordTimeOut": -1.0,
        "createTime": 1613965938,
        "desc": "005",
        "encryptType": 0,
        "id": "60332a72d656fd634b20f20a",
        "inGroup": false,
        "isAttritionNotice": 1,
        "isLook": 1,
        "isNeedVerify": 0,
        "isSecretGroup": 0,
        "jid": "f6c9eb95fc1048b7bba4b3c7e9249de1",
        "liveStatus": 0,
        "loc": {
            "lat": 0.0,
            "lng": 0.0
        },
        "maxUserSize": 1000,
        "meetingStatus": 0,
        // 自己
        "member": {
            "active": 1613965938,
            "addRoomDetails": "create_room_member",
            "beginMsgTime": 0,
            "clearMaxSeqNo": 0,
            "createTime": 1613965938,
            "hideChatSwitch": 0,
            "hiding": -1,
            "inviteUserId": 0,
            "isBlack": 0,
            "isOpenTopChat": 0,
            "joinSeqNo": 0,
            "loginTime": 0,
            "modifyTime": 0,
            "nickname": "张益达",
            "offlineNoPushMsg": 0,
            "onlinestate": 0,
            "openTopChatTime": 0,
            "operationType": 0,
            "role": 1,
            "sub": 1,
            "talkTime": 0,
            "userId": 100164
        },
        // 群成员  排名第一的是群主 
        "members": [
            {
                "active": 1613965938,
                "beginMsgTime": 0,
                "clearMaxSeqNo": 0,
                "createTime": 1613965938,
                "hideChatSwitch": 0,
                "hiding": -1,
                "inviteUserId": 0,
                "isBlack": 0,
                "isOpenTopChat": 0,
                "joinSeqNo": 0,
                "loginTime": 0,
                "modifyTime": 0,
                "nickname": "张益达",
                "offlineNoPushMsg": 0,
                "onlinestate": 0,
                "openTopChatTime": 0,
                "operationType": 0,
                "role": 1, // 1 群主；  3=普通成员
                "sub": 1,
                "talkTime": 0,
                "userId": 100164
            },
            {
                "active": 1613965938,
                "beginMsgTime": 0,
                "clearMaxSeqNo": 0,
                "createTime": 1613965938,
                "hideChatSwitch": 0,
                "hiding": -1,
                "inviteUserId": 0,
                "isBlack": 0,
                "isOpenTopChat": 0,
                "joinSeqNo": 0,
                "loginTime": 0,
                "modifyTime": 0,
                "nickname": "A9gz0",
                "offlineNoPushMsg": 0,
                "onlinestate": 0,
                "openTopChatTime": 0,
                "operationType": 0,
                "role": 3,
                "sub": 1,
                "talkTime": 0,
                "userId": 100102
            },
            {
                "active": 1613965938,
                "beginMsgTime": 0,
                "clearMaxSeqNo": 0,
                "createTime": 1613965938,
                "hideChatSwitch": 0,
                "hiding": -1,
                "inviteUserId": 0,
                "isBlack": 0,
                "isOpenTopChat": 0,
                "joinSeqNo": 0,
                "loginTime": 0,
                "modifyTime": 0,
                "nickname": "周仕彦",
                "offlineNoPushMsg": 0,
                "onlinestate": 0,
                "openTopChatTime": 0,
                "operationType": 0,
                "role": 3,
                "sub": 1,
                "talkTime": 0,
                "userId": 100174
            }
        ],
        "modifyTime": 1613965938,
        "name": "006",
        "nickname": "张益达",
        // 最新房间公告
        "notice": {
            "modifyTime": 0,
            "time": 0
        },
        // 公告列表
        "notices": [],
        "s": 1,
        "showMember": 1,
        "showRead": 0,
        "subject": "",
        "tags": [],
        "talkTime": 0,
        "userId": 100164,
        "userSize": 3,
        "withdrawTime": 0
    },
    "resultCode": 1
}
```



### 1.9. 更新群组

- 接口路径:    /room/update

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  | roomId       | 群组 id      | 是       |      |
  | roomName     | 群名称       | 否       |      |
  | notice       | 群公告       | 否       |      |
  
- 响应: 


```json
{
    "currentTime": 1613976478379,
    "data": {
        "noticeId": "6033539ed656fd634b20f263"
    },
    "resultCode": 1
}
```





### 2.0. 公告列表

- 接口路径:    /room/noticesPage 

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  | roomId       | 群组 id      | 是       |      |
  | pageIndex    | 当前页数     | 是       | 0     |
  | pageSize     | 每页数量     | 是       | 500 |
  
- 响应: 


```json
{
    "currentTime": 1613977250414,
    "data": {
        "pageCount": 1,
        "pageData": [
            {
                "id": "6033539ed656fd634b20f263",
                "modifyTime": 0,
                "nickname": "张益达",
                "roomId": "60332a72d656fd634b20f20a",
                "text": "修改公告",
                "time": 1613976478,
                "userId": 100164
            },
            {
                "id": "60335317d656fd634b20f254",
                "modifyTime": 0,
                "nickname": "张益达",
                "roomId": "60332a72d656fd634b20f20a",
                "text": "测试2",
                "time": 1613976343,
                "userId": 100164
            },
            {
                "id": "603352c2d656fd634b20f241",
                "modifyTime": 0,
                "nickname": "张益达",
                "roomId": "60332a72d656fd634b20f20a",
                "text": "测试",
                "time": 1613976258,
                "userId": 100164
            }
        ],
        "pageIndex": 0,
        "pageSize": 500,
        "start": 0,
        "total": 3
    },
    "resultCode": 1
}
```



### 2.1. 获取群成员

- 接口路径:     /room/member/list 

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  | roomId       | 群组 id      | 是       |      |
  
  

- 可以根据 member 中的 role =1 为群主 ，群主才能显示转让群主的功能
- 点击 群主转让，排除掉 role =1 的群主 ，显示群成员列表



- 响应: 


```json
{
    "currentTime": 1613977250414,
    "data": {
        "pageCount": 1,
        "pageData": [
            {
                "id": "6033539ed656fd634b20f263",
                "modifyTime": 0,
                "nickname": "张益达",
                "roomId": "60332a72d656fd634b20f20a",
                "text": "修改公告",
                "time": 1613976478,
                "userId": 100164
            },
            {
                "id": "60335317d656fd634b20f254",
                "modifyTime": 0,
                "nickname": "张益达",
                "roomId": "60332a72d656fd634b20f20a",
                "text": "测试2",
                "time": 1613976343,
                "userId": 100164
            },
            {
                "id": "603352c2d656fd634b20f241",
                "modifyTime": 0,
                "nickname": "张益达",
                "roomId": "60332a72d656fd634b20f20a",
                "text": "测试",
                "time": 1613976258,
                "userId": 100164
            }
        ],
        "pageIndex": 0,
        "pageSize": 500,
        "start": 0,
        "total": 3
    },
    "resultCode": 1
}
```





### 2.1. 转让群主

- 接口路径:      /room/transfer 

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  | roomId       | 群组 id      | 是       |      |
  | toUserId     | 目标用户 id  |          |      |



- 注意: 转让群主后重新调用 /room/get 从新获取房间信息 

  


- 响应: 


```json
{
    "currentTime": 1613979612249,
    "resultCode": 1
}
```



### 2.2. 群消息置顶（弃用）

- 接口路径:      /room/member/setOfflineNoPushMsg 

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数             | 含义                            | 是否必须 | 备注 |
  | ---------------- | ------------------------------- | -------- | ---- |
  | access_token     | token 令牌                      | 是       |      |
  | flag             | 任务管理标识                    | 是       | rw   |
  | roomId           | 群组 id                         | 是       |      |
  | offlineNoPushMsg | 是否开启聊天置顶0:关闭，1：开启 | 是       | 1    |
  | type             | 0 :消息免打扰 , 1: 聊天置顶     | 是       | 1    |
  | userId           | 用户id                          | 是       | 0    |



- 注意:  群消息置顶是把 Room.Member 中的 openTopChatTime（开启置顶聊天时间）赋值，关闭则是置顶为0. 

- 消息列表首页，根据 /room/list/his 接口中的 返回值 （Room.Member 中的 openTopChatTime）判断，当值不为0的时候，固定到顶部；如果有多个群组置顶，则比较openTopChatTime的大小，大的在前面，小的在后面进行固定；

  


- 响应: 


```json
{
    "currentTime": 1613982358320,
    "resultCode": 1
}
```





## 不同角色退出群调用接口相同
### 1.群主退出群，是解散群组 ；
### 1.普通成员退出群，是退出群聊；


### 2.3. 解散群组/退出群聊

- 接口路径:      /room/member/delete

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义           | 是否必须 | 备注 |
  | ------------ | -------------- | -------- | ---- |
  | access_token | token 令牌     | 是       |      |
  | flag         | 任务管理标识   | 是       | rw   |
  | roomId       | 群组 id        | 是       |      |
  | userId       | 要删除的成员Id | 是       |      |








- 响应: 
- 返回结果说明：当删除群成功后，会踢出当前用户登录，需要调用登录接口，记录 token
- 解决方案： 删除成功后，重新登录，回到消息列表


```json
{
    "currentTime": 1613986441541,
    "resultCode": 1
}
```



### 2.4. 添加群成员

- 接口路径:      /room/member/update

- 请求方式: GET

- 参数格式 ：Form Data

- 请求:   

  | 参数         | 含义                                       | 是否必须 | 备注                           |
  | ------------ | ------------------------------------------ | -------- | ------------------------------ |
  | access_token | token 令牌                                 | 是       |                                |
  | flag         | 任务管理标识                               | 是       | rw                             |
  | roomId       | 群组 id                                    | 是       |                                |
  | phones       | 删除成员电话号码集合（数组类型json字符串） | 是       | 例： [13112345611,15825511111] |




- 响应: 


```json
{
    "currentTime": 1613986441541,
    "resultCode": 1
}
```



### 2.5. 单聊聊天记录

- 接口路径:       /tigase/shiku_msgs

- 请求方式: GET

- 参数格式 ：Form Data

- 聊天记录存在于   shiku_msgs 库中

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  | receiver     | 接收者userId | 是       |      |
  | pageIndex    | 当前页数     | 是       | 0     |
  | pageSize     | 每页数量     | 是       | 20  （下拉就是增加每页数量） |
  | startTime | 开始时间 | 否 |      |
  | endTime | 结束时间 | 否 |      |




- 响应: 

- ​     响应聊天记录根据 timeSend 倒序排序

- ​     每次聊天会生成两条聊天记录，一条的发送者是 100164 ，一条的发送者是 100102，聊天内容是一致的

- ​     content(聊天内容)     message(具体消息信息)      message.fromUserId (消息发送者id)

  


```json
{
    "currentTime": 1614049928461,
    "data": [
        {
            "_id": "60346c7b1bb77153b4e8bc67",
            "message": "{\"content\":\"123\",\"deleteTime\":0,\"encryptType\":0,\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":1,\"from\":\"100164/web\",\"messageId\":\"skimweb_100164161404837631184\",\"offline\":false,\"to\":\"100102\"},\"timeSend\":1614048376311,\"toUserId\":\"100102\",\"toUserName\":\"A9gz0\",\"type\":1}",
            "direction": 0,
            "sender": "100164",
            "receiver": "100102",
            "sender_jid": "100164/web",
            "receiver_jid": "100102",
            "ts": 1614048379623,
            "contentType": 1,
            "messageId": "skimweb_100164161404837631184",
            "timeSend": 1614048376311,
            "deleteTime": 0,
            "isRead": 1,
            "isEncrypt": false,
            "content": "123"
        },
        {
            "_id": "60336a491bb77153b4e8bc55",
            "message": "{\"content\":\"11\",\"deleteTime\":0,\"encryptType\":0,\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100102\",\"fromUserName\":\"A9gz0\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":1,\"from\":\"100102/web\",\"messageId\":\"skimweb_1001021613982280589440\",\"offline\":false,\"to\":\"100164\"},\"timeSend\":1613982280589,\"toUserId\":\"100164\",\"toUserName\":\"张益达\",\"type\":1}",
            "direction": 1,
            "sender": "100164",
            "receiver": "100102",
            "sender_jid": "100102/web",
            "receiver_jid": "100164",
            "ts": 1613982281792,
            "contentType": 1,
            "messageId": "skimweb_1001021613982280589440",
            "timeSend": 1613982280589,
            "deleteTime": 0,
            "isRead": 0,
            "isEncrypt": false,
            "content": "11"
        },
        {
            "_id": "602347651bb77153b4e8bb82",
            "message": "{\"content\":\"你好\",\"deleteTime\":0,\"encryptType\":0,\"fileSize\":0,\"fileTime\":0,\"fromUserId\":\"100164\",\"fromUserName\":\"张益达\",\"isEncrypt\":false,\"isReadDel\":false,\"location_x\":0.0,\"location_y\":0.0,\"messageHead\":{\"chatType\":1,\"from\":\"100164/web\",\"messageId\":\"skimweb_1001641612924771586612\",\"offline\":false,\"to\":\"100102\"},\"timeSend\":1612924771586,\"toUserId\":\"100102\",\"toUserName\":\"A9gz0\",\"type\":1}",
            "direction": 0,
            "sender": "100164",
            "receiver": "100102",
            "sender_jid": "100164/web",
            "receiver_jid": "100102",
            "ts": 1612924773865,
            "contentType": 1,
            "messageId": "skimweb_1001641612924771586612",
            "timeSend": 1612924771586,
            "deleteTime": 0,
            "isRead": 1,
            "isEncrypt": false,
            "content": "你好"
        }
    ],
    "resultCode": 1
}
```





### 2.5. 删除聊天记录

- 接口路径:        /tigase/deleteMsg

- 请求方式: GET

- 参数格式 ：Form Data

- 查询不到最后一条聊天记录，不在信息列表进行展示

- 个人聊天记录存在于   shiku_msgs 库中  最新一条聊天记录存在于 shiku_lastChats  10 中

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是       | rw   |
  | type | 聊天类型 1 单聊  2 群聊 | 是       |      |
  | delete | 1： 删除属于自己的消息记录 2：撤回 删除整条消息记录 | 是       |      |
  | messageId | 要删除的消息Id | 是       | 例如：skimweb_100164161404837631184，skimweb_100164161404837631186   多个id 中间使用 逗号隔开  ，调用接口的时候需要先获取删除聊天的所有 messageId |
  | roomJid | 群组Jid | 否 |      |
  | companyMpId | 发送者id | 否 | 可以不传递 |


- 单聊删除流程 :  把  shiku_msgs  10 的  delayedTime，deleteTime 置上值  ，然后查询最近的一条记录 更新到 shiku_lastChats 10 中
- 当 type==1 && delete ==2 删除双方的聊天记录



- 响应: 
- 删除成功后需要重新刷新信息列表页获取数据，聊天记录不存在的直接删除头像
- 删除聊天记录后，需要把客户端本地的 Application 进行删除，重新获取数据
- 删除自己群聊信息比较特殊，是把删除信息存储在 imapi.room_group_msg 中，利用中间表来实现数据隐藏，以达到删除的一个效果。           当自己的聊天信息（contentType ==1）都被删除后，系统信息不显示，从信息列表删除聊天栏。


```json
{
    "currentTime": 1614074769039,
    "resultCode": 1
}
```






### 2.6. 搜索接口

- 接口路径:         /tigase/search 

- 请求方式: GET

- 参数格式 ：Form Data

- 根据人的昵称搜索人、人所在的群、单聊信息内容、群聊信息内容

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是     | rw |
  | content      | 搜索内容     | 是       |      |



- 响应: 


```json
{
    "currentTime": 1614584001777,
    "data": {
        // 单聊信息
        "shikuMsgs": [],
        // 搜索人
        "friend": [
            {
                "account": "100164373329",
                "encryAccount": "ccaa643b00b40998dfb81f34ed8fdc78",
                "setAccountCount": 0,
                "userType": 2,
                "offlineNoPushMsg": 0,
                "areaCode": "86",
                "telephone": "8618094152050",
                "phone": "18094152050",
                "name": "",
                "nickname": "张益达",
                "birthday": 0,
                "sex": 1,
                "active": 0,
                "loc": {
                    "lng": 0.0,
                    "lat": 0.0
                },
                "description": "",
                "countryId": 0,
                "provinceId": 0,
                "cityId": 0,
                "areaId": 0,
                "level": 0,
                "vip": 0,
                "balance": 0.0,
                "msgNum": 0,
                "totalRecharge": 0.0,
                "totalConsume": 0.0,
                "friendsCount": 0,
                "fansCount": 0,
                "attCount": 0,
                "createTime": 1612772503,
                "modifyTime": 1612772503,
                "idcard": "",
                "idcardUrl": "",
                "isAuth": 0,
                "onlinestate": 0,
                "settings": {
                    "allowAtt": 1,
                    "allowGreet": 1,
                    "friendsVerify": 1,
                    "openService": 0,
                    "isVibration": 0,
                    "isTyping": 0,
                    "isUseGoogleMap": 0,
                    "multipleDevices": 1,
                    "closeTelephoneFind": 1,
                    "chatRecordTimeOut": "-1.0",
                    "chatSyncTimeLen": 30.0,
                    "isKeepalive": 1,
                    "showLastLoginTime": -1,
                    "showTelephone": -1,
                    "phoneSearch": 1,
                    "nameSearch": 1,
                    "friendFromList": "1,2,3,4,5",
                    "authSwitch": 0,
                    "isOpenPrivacyPosition": 1,
                    "isSkidRemoveHistoryMsg": 1,
                    "isShowMsgState": 1,
                    "beInvitedJoinRoom": 0,
                    "hiding": -1
                },
                "num": 0,
                "isPasuse": 0,
                "withdrawBurnReadTime": 0,
                "realNameCertified": 0,
                "userId": 100164
            }
        ],
        
        // 群聊信息
        "mucmsgs": [],
        
        // 搜索群
        "group": [
            {
                "adminMaxNumber": 50,
                "allowConference": 1,
                "allowHostUpdate": 1,
                "allowInviteFriend": 1,
                "allowOpenLive": 1,
                "allowSendCard": 1,
                "allowSpeakCourse": 1,
                "allowUploadFile": 1,
                "chatRecordTimeOut": -1.0,
                "createTime": 1614581672,
                "desc": "群聊信息",
                "encryptType": 0,
                "id": "603c8fa87a9732085424961f",
                "inGroup": false,
                "isAttritionNotice": 1,
                "isLook": 1,
                "isNeedVerify": 0,
                "isSecretGroup": 0,
                "jid": "b0b48653e4194f2f8206508187dae626",
                "liveStatus": 0,
                "loc": {
                    "lat": 0.0,
                    "lng": 0.0
                },
                "maxUserSize": 1000,
                "meetingStatus": 0,
                "member": {
                    "active": 1614581672,
                    "beginMsgTime": 0,
                    "clearMaxSeqNo": 0,
                    "createTime": 1614581672,
                    "hideChatSwitch": 0,
                    "hiding": 0,
                    "inviteUserId": 0,
                    "isBlack": 0,
                    "isOpenTopChat": 0,
                    "joinSeqNo": 0,
                    "loginTime": 0,
                    "modifyTime": 0,
                    "nickname": "张益达",
                    "offlineNoPushMsg": 0,
                    "onlinestate": 0,
                    "openTopChatTime": 0,
                    "operationType": 0,
                    "role": 1,
                    "sub": 1,
                    "talkTime": 0,
                    "userId": 100164
                },
                "modifyTime": 1614581672,
                "name": "群聊信息",
                "nickname": "张益达",
                "notice": {
                    "modifyTime": 0,
                    "time": 0
                },
                "notices": [],
                "s": 1,
                "showMember": 1,
                "showRead": 0,
                "subject": "",
                "tags": [],
                "talkTime": 0,
                "userId": 100164,
                "userSize": 2,
                "withdrawTime": 0
            }
        ]
    },
    "resultCode": 1
}
```



### 查询置顶会话，把置顶的根据时间排序固定到顶部

### 2.7. 增加置顶会话

- 接口路径:          /tigase/dialog/add

- 请求方式: GET

- 参数格式 ：Form Data

- 在 imapi。stick_dialog 表中记录 置顶的 群聊/单聊信息

- imapi。stick_dialog。isRoom ： 好友（jid 为 好友id）为1，群聊（jid 为群聊room。jid）为0

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是     | rw |
  | jid   | 群jid / 好友id | 是       |      |
  | isAdaptive | 更新 群成员/好友 置顶时间（openTopChatTime）字段 | 是 | 1 |



- 响应: 

  


```json

{
    "currentTime": 1614592084433,
    "resultCode": 1
}
```



### 2.8. 删除置顶会话

- 接口路径:          /tigase/dialog/delete 

- 请求方式: GET

- 参数格式 ：Form Data

- 删除 imapi。stick_dialog 表中记录 置顶的 群聊/单聊信息

- imapi。stick_dialog。isRoom ： 好友（jid 为 好友id）为1，群聊（jid 为群聊room。jid）为0

- 请求:   

  | 参数         | 含义         | 是否必须 | 备注 |
  | ------------ | ------------ | -------- | ---- |
  | access_token | token 令牌   | 是       |      |
  | flag         | 任务管理标识 | 是     | rw |
  | jid   | 群jid / 好友id | 是       |      |
  | isAdaptive | 更新 群成员/好友 置顶时间（openTopChatTime）字段 | 是 | 1 |



- 响应: 

  


```json

{
    "currentTime": 1614592084433,
    "resultCode": 1
}
```



## 3.上传服务  
### 3.0文件服务搭建

1、文件的上传路径是 ：ip:8088

2、文件访问路径：ip：8089

3、对后台管理地址，上传资源路径进行配置

![](/1614741908631.png)

4、配置 ngnix，通过 ngnix 转发到 服务器 访问资源, ngnix 配置如下

```nginx.conf
# 文件访问
    server {
        listen       8089;
        # 本机外网ip
        server_name  10.0.0.169;

        # 拒绝访问html 等类型的文件避免受到脚本攻击
        location ~/\.(html|htm|jsp) {
            deny all;
        }


        location / {
            root     /data/www/resources/;
            expires  4d;
        }
    }
```




###  3.1图片上传  

- 接口路径:  /upload/UploadServlet 

- 请求方式:  POST 

- 请求:   

  | 参数      | 含义 | 是否必须 | 备注           |
  | --------- | ---- | -------- | -------------- |
  | file      |      | 是       | 文件字节流数组 |
  | validTime |      | 是       | 0              |
  
- 响应:

- 图片信息保存库 resources

```json
{
    "total":1,
    "data":{
        "images":[
            {
                "oFileName":"首页.png",
                "oUrl":"http://10.0.0.169:8089/0/0/202103/o/bdb89a47460d453993c19619e608b6dc.png",
                "status":1,
                "tUrl":"http://10.0.0.169:8089/0/0/202103/t/bdb89a47460d453993c19619e608b6dc.png"
            }
        ]
    },
    "success":1,
    "failure":0,
    "resultCode":1,
    "time":1272
}
```



###  3.2 推送任务消息

- 接口路径:   /console/oneSendOne 

- 请求方式: GET

- 此接口要嵌入任务管理视图处理逻辑处，用任务管理调用IM 的接口，进行消息推送

- 请求:   

  | 参数         | 含义           | 是否必须 | 备注 |
  | ------------ | -------------- | -------- | ---- |
  | flag         | 任务管理标识   | 是       | rw   |
  | access_token | token 令牌     | 是       |      |
  | type         | 消息类型       | 是       | 1    |
  | content      | 消息内容       | 是       |      |
  | sendPhone    | 发送者手机号码 | 是       |      |
  | toUserPhone  | 接收者手机号码 | 是       |      |
  
  
  
- 响应:

```json
{
    "currentTime": 1614826227934,
    "resultCode": 1
}
```



###   未完成工作

1、同步任务管理到自己的分支；

2、修改任务管理用户的增、删、改同步IM 操作；

3、仔细查询自己 分支修改的东西，以免合并被冲掉；（查看idea 自己提交内容）



