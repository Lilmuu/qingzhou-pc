/**
 *  登录加固通用数据封装处理API
 *
 *  注：myData.属性值。 myData为web版数据存储对象，h5和小程序自定义处理；
 */
const forge = require('node-forge')
import CryptoJS from 'crypto-js'
import EncryptUtils from './encryptUtils'
import { getItem } from '@/utils/imUtil/storage'

function buildLoginPassword (pwd) {
  let md5pwd = CryptoJS.MD5(pwd);
  let md5Str = CryptoJS.enc.Base64.stringify(md5pwd);
  let encryptAES = EncryptUtils.encryptAES(CryptoJS.enc.Base64.parse(md5Str), md5pwd);
  let md5Aes = CryptoJS.MD5(encryptAES.ciphertext);
  let encode = CryptoJS.enc.Hex.stringify(md5Aes);
  return encode;
}


let ApiAuthUtils = {

  /**
   * 参数mac验签同时验登录密码，内容为apiKey + areaCode+account+ salt，
   * mac key为登录密码密文, HMACMD5算法结果取base64编码成字符串，
   * @param pwd
   * @param obj
   * @returns {*}
   */
  getLoginCodeParam: function (obj) {
    let macValue = obj.apiKey + obj.areaCode + obj.account + obj.salt;
    obj.mac = EncryptUtils.encryptMacToBase64(macValue, EncryptUtils.buildLoginPassword(obj.password));
    var objParam = {};
    objParam.areaCode = obj.areaCode;
    objParam.account = obj.account;
    objParam.salt = obj.salt;
    objParam.deviceId = "web";
    objParam.mac = obj.mac;
    return objParam;
  },

  /**
   * 获取加密私钥
   * 参数mac验签同时验登录密码，内容为apiKey + userId+ salt，
   * mac key为登录密码密文, HMACMD5算法结果取base64编码成字符串，
   * @param obj
   */
  getLoginPrivateKeyParam: function (obj) {
    obj.mac = EncryptUtils.encryptMacToBase64(obj.apiKey + obj.userId + obj.salt, EncryptUtils.buildLoginPassword(obj.pwd));
    let privateKey = {};
    privateKey.userId = obj.userId;
    privateKey.salt = obj.salt;
    privateKey.apiKey = obj.apiKey;
    return obj;
  },

  /**
   * 上传RSA公私钥
   *
   * 参数userId，判断身份用，
   * 参数salt为时间，精确到毫秒的13位数字，
   *
   * 参数privateKey表示加密私钥，aes加密，加密内容是私钥字节数组不是base64字符串，aes key为登录密码明文, 加密结果 base64编码
   *
   * 参数publicKey表示公钥，base64编码
   参数mac验签，内容为apiKey+userId+privateKey+ publicKey+salt,
   参与拼接的公私钥是base64编码后的字符串，应当与参数字符串完全相同，不能出现base64解码后再编码才参与计算，
   key为登录密码密文，HMACMD5算法结果取base64编码成字符串，
   * @param obj
   */
  uploadLoginKeyParam: function (obj) {
    // 生成一对RSA公私钥
    let keyPrair = EncryptUtils.generatedRSAKey();
    let rsaPrivate = keyPrair.getPrivateKeyB64();
    let rsaPublic = keyPrair.getPublicKeyB64();
    obj.privateKey = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(rsaPrivate), CryptoJS.MD5(obj.password));
    obj.publicKey = rsaPublic;
    let macParam = obj.apiKey + obj.userId + obj.privateKey + rsaPublic + obj.salt;
    obj.mac = EncryptUtils.encryptMacToBase64(macParam, EncryptUtils.buildLoginPassword(obj.password));
    let longKeyParam = {};
    longKeyParam.salt = obj.salt;
    longKeyParam.userId = obj.userId;
    longKeyParam.privateKey = obj.privateKey;
    longKeyParam.publicKey = rsaPublic;
    longKeyParam.mac = obj.mac;
    return longKeyParam;
  },

  /**
   * forge 上传生成RSA公私钥
   */
  uploadLoginKeyParam_Forge: function (obj) {
    const kp = forge.pki.rsa.generateKeyPair(1024);
    // 和其他平台统一的(pkcs1|x509)&der格式公私钥字节数组，
    let publicKey = forge.util.encode64(EncryptUtils.toPublicKeyData(kp.publicKey));
    let rsaPrivate = forge.util.encode64(EncryptUtils.toPublicKeyData(kp.privateKey));
    obj.privateKey = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(rsaPrivate), CryptoJS.MD5(obj.pwd));
    obj.publicKey = publicKey;
    let macParam = obj.apiKey + obj.userId + obj.privateKey + publicKey + obj.salt;
    obj.mac = EncryptUtils.encryptMacToBase64(macParam, EncryptUtils.buildLoginPassword(obj.pwd));
    let longKeyParam = {};
    longKeyParam.salt = obj.salt;
    longKeyParam.userId = obj.userId;
    longKeyParam.privateKey = obj.privateKey;
    longKeyParam.publicKey = publicKey;
    longKeyParam.mac = obj.mac;
    return longKeyParam;
  },



  /**
   * 参数userId，判断身份用，
   参数salt为时间，精确到毫秒的13位数字，
   参数deviceId设备名，与接口1上传的该参数相同，即android、ios、web，用于服务器获取对应code使用，
   参数data为aes加密json参数列表，
   aes加密key为接口1获取到的code,
   aes加密内容json参数列表为该接口原有参数外加以下几个参数，
   参数mac验参同时验登录密码，内容为apiKey+userId+所有参数依次排列+salt+登录密码密文，key为接口1获取到的code, HMACMD5算法结果取base64编码成字符串，
   *
   * forge rsa 相关处理
   * 登录加固接口
   */
  getUserLoginV1Param_Forge: function (obj) {
    var userLoginParam = {};
    obj.deviceId = "web";
    userLoginParam.deviceId = obj.deviceId;
    userLoginParam.userId = obj.userId;
    userLoginParam.salt = obj.salt;
    // 解密code 1.获取私钥 2.解密私钥 3.创建秘钥 4。解密code
    // code为随机128位16字节数组byte[]公钥rsa加密后base64编码
    let privateKey = obj.privateKey;

    let decryptPrivateKey = EncryptUtils.decryptAES_Str(privateKey, CryptoJS.MD5(obj.pwd));// aes解密私钥

    let decryptCode = EncryptUtils.rsaDecrypt(obj.code, decryptPrivateKey);

    var macValue = obj.apiKey + obj.userId + EncryptUtils.paramKeySort(userLoginParam) + obj.salt + EncryptUtils.buildLoginPassword(obj.pwd);
    let mac = EncryptUtils.encryptMacToBase64(macValue, CryptoJS.enc.Base64.parse(decryptCode));
    userLoginParam.mac = mac;
    userLoginParam.data = EncryptUtils.encryptAES_StrToStr(JSON.stringify(userLoginParam), decryptCode);
    delete userLoginParam.mac;
    return userLoginParam;
  },
  /**
   *
   * 参数salt为时间，精确到毫秒的13位数字，
   参数deviceId设备名，与接口1上传的该参数相同，即android、ios、web，
   参数data为aes加密json参数列表，
   aes加密key为apiKey计算md5后的16字节数据,
   aes加密内容json参数列表为该接口原有参数外加以下几个参数，
   参数smsCode检查短信验证码，
   参数mac验参，内容为apiKey +所有参数依次排列+salt，key为apiKey计算md5后的16字节数据, HMACMD5算法结果取base64编码成字符串，
   返回结果同密码登录接口4，解密key为apiKey计算md5后的16字节数据,
   *
   * 用户在注册时通过DH协议生成一对密钥对，
   * 将公钥、加密后的私钥(将明文密码MD5值作为Key，使用AES对称加密算法加密原私钥，得到加密后的私钥)发送到服务器，同时将私钥保存至本地
   *
   * 补充：注册需要上传 rsa和dh的秘钥对（参数： rsaPublicKey  rsaPrivateKey  dhPublicKey  dhPrivateKey）
   * dh用于消息处理，ras秘钥对用于私密群组
   *
   * 普通注册接口user/register/v1
   *
   */
  userRegeditParam: function (obj) {
    /* // rsa 秘钥对
     let keyPrair = EncryptUtils.generatedRSAKey();
     let rsaPrivate = keyPrair.getPrivateKeyB64();
     let rsaPublic = keyPrair.getPublicKeyB64();
     rsaPrivate = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(rsaPrivate), CryptoJS.MD5(obj.repassword));
     obj.rsaPublicKey = rsaPublic;
     obj.rsaPrivateKey = rsaPrivate;
     // dh秘钥对
     let ecdh = EncryptUtils.genDHKeyPair();
     let webpri=EncryptUtils.encryptDHPrivateKey(ecdh);
     let webpub=EncryptUtils.encryptDHPublicKey(ecdh.getPublic());
     webpri = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(webpri), CryptoJS.MD5(obj.repassword));
     obj.dhPublicKey = webpub;
     obj.dhPrivateKey = webpri;
     delete obj.repassword;// 去掉明文密码参数*/
    obj = this.createRSAandDHSecretKey(obj);
    // 这里需维护本地公私钥内存数据，各端调通后可以删除
    /* myData.encryptData.dhPrivateKey = webpri;
    myData.encryptData.dhPublicKey = webpub;
    myData.encryptData.rsaPrivateKey = rsaPrivate;
    myData.encryptData.rsaPublicKey = rsaPublic;*/
    let paramSortVal = EncryptUtils.paramKeySort(obj);
    let macVal = process.env.VUE_APP_API_KEY + paramSortVal + obj.salt;
    let mac = EncryptUtils.encryptMacToBase64(macVal, CryptoJS.MD5(process.env.VUE_APP_API_KEY));
    obj.mac = mac;
    let regeditParam = {};
    regeditParam.data = EncryptUtils.encryptAES_StrToStr_test(JSON.stringify(obj), CryptoJS.MD5(process.env.VUE_APP_API_KEY));
    regeditParam.deviceId = "web";
    regeditParam.salt = obj.salt;
    regeditParam.secretData = obj;// 用于更新用户本地的rsa、dh的数据
    return regeditParam;
  },

  /**
   * 参数loginToken为登录身份，用于判断登录的用户以及设备，base64编码字符串，
   参数salt为时间，精确到毫秒的13位数字，
   参数data为加密参数列表，具体是json字符串aes加密后base64编码，
   aes加密key为该loginToken对应loginKey, base64解码后的16字节数据，
   json参数列表为该接口原有参数外加以下几个参数，参数mac验参，内容为apiKey+userId+loginToken+所有参数依次排列+salt，key为loginKey,

   返回结果data为加密结果列表，具体是json字符串aes加密后的base64编码，
   aes加密key为该loginToken对应loginKey, base64解码后的16字节数据，
   json格式返回结果有以下几个字段，
   accessToken, 用于普通接口明文传输判断身份，16字节随机数组base64编码，
   httpKey 用于加密自动登录参数列表，不明文传输，16字节随机数组base64编码，
   messageKey 用于消息加固，具体待定，
   payKey 用于支付加固，具体待定，
   自动登录接口也按登录前普通接口添加secret验参，不带accessToken,
   如果loginToken过期返回错误码1030112，
   需要退出登录，回到密码登录页面，
   *
   * @param obj
   */
  userAutoLoginParam: function (obj) {
    let macSoart = {};
    macSoart.access_token = obj.access_token;
    macSoart.userId = obj.userId;
    let paramSortVal = EncryptUtils.paramKeySort(macSoart);
    let macVal = process.env.VUE_APP_API_KEY + obj.userId + obj.loginToken + paramSortVal + obj.salt;
    macSoart.mac = EncryptUtils.encryptMacToBase64(macVal, CryptoJS.enc.Base64.parse(obj.loginKey));
    let autoLoginParam = {};
    autoLoginParam.data = EncryptUtils.encryptAES_StrToStr_test(JSON.stringify(macSoart), CryptoJS.enc.Base64.parse(obj.loginKey));
    autoLoginParam.loginToken = obj.loginToken;
    autoLoginParam.salt = obj.salt;
    return autoLoginParam;
  },

  /**
   *返回结果data为加密结果列表，具体是json字符串aes加密后的base64编码，
   aes加密key为该loginToken对应loginKey, base64解码后的16字节数据，
   json格式返回结果有以下几个字段，
   accessToken, 用于普通接口明文传输判断身份，16字节随机数组base64编码，
   httpKey 用于加密自动登录参数列表，不明文传输，16字节随机数组base64编码，
   messageKey 用于消息加固，具体待定，
   payKey 用于支付加固，具体待定，
   自动登录接口也按登录前普通接口添加secret验参，不带accessToken,
   如果loginToken过期返回错误码1030112，
   需要退出登录，回到密码登录页面，
   *
   * 解密自动登录成功后返回的data
   */
  decryptAutoLoginSuccessData: function (data, loginKey) {
    let dataVal = EncryptUtils.decryptAES(data, CryptoJS.enc.Base64.parse(loginKey));
    let userData = CryptoJS.enc.Utf8.stringify(dataVal);
    return userData;
  },

  /**
   * 登录前的秘钥生成规则secret
   * 参数secret验签，内容为apiKey +所有参数依次排列+salt，key为apiKey计算md5后的
   * @param obj
   * @returns {*}
   */
  apiAuthoCreateSecret (obj, timeSend, url) {
    let sortParam = EncryptUtils.paramKeySort(obj);
    if (!timeSend) timeSend = new Date().getTime();
    obj.secret = process.env.VUE_APP_API_KEY + sortParam + timeSend;
    obj.secret = EncryptUtils.encryptMacToBase64(obj.secret, CryptoJS.MD5(process.env.VUE_APP_API_KEY));
    obj.salt = timeSend;
    return obj;
  },

  /**
   * 登录后普通接口mac验参，添加参数，
   * 参数salt为时间，精确到毫秒的13位数字，
   * 参数secret验签，内容为apiKey+userId+accessToken+所有参数依次排列+salt，key为httpKey做base64解码后的16字节数据, HMACMD5算法结果取base64编码成字符串，
   * userId 当前请求的人
   * 登录后的秘钥生成规则
   * @param obj
   * @param timeSend
   * @param url
   * @param userId
   * @param access_token
   * @param httpKey
   * @returns {*}
   */
  apiAuthoLoginCreateSecret (obj, timeSend, url, userId, access_token, httpKey) {
    let sortParam = EncryptUtils.paramKeySort(obj);
    if (!timeSend) timeSend = new Date().getTime();
    obj.secret = process.env.VUE_APP_API_KEY + userId + access_token + sortParam + timeSend;
    obj.secret = EncryptUtils.encryptMacToBase64(obj.secret, CryptoJS.enc.Base64.parse(httpKey));
    obj.salt = timeSend;
    return obj;
  },

  /**
   * 创建密钥 secret
   * @param obj
   * @returns {*}
   */
  apiCreateCommApiSecret (obj, url, userId, access_token, httpKey) {
    let timesend = obj.salt;
    delete obj.salt;
    if (!access_token) {
        return ApiAuthUtils.apiAuthoCreateSecret(obj, timesend, url);
    } else {
      if(url == '/auth/getLoginCode' || url == '/authkeys/getLoginPrivateKey' || url == '/user/login/v1'){
        return ApiAuthUtils.apiAuthoCreateSecret(obj, timesend, url);
      }else{
        return ApiAuthUtils.apiAuthoLoginCreateSecret(obj, timesend, url, userId, access_token, httpKey);
      }
    }
    return obj;
  },

  /**
   * 生成用户的随机码，用于修改密码验签
   * 用户修改密码成功后，取出本地保存的私钥，将用户输入的新密码MD5值作为Key，
   * 使用AES对称加密算法加密该私钥，得到加密后的私钥，发送到服务器，同时更新本地保存的私钥
   *
   * 上传密钥对需要验签，防止第三方随意上传或篡改我们的公私钥。
   * 验签规则如下，上传公私钥之前客户端先将明文登录密码md5，不是md5了，是登录密码存储在服务器上的新加密规则，
   * 在将apiKey作为Key，使用AES加密MD5值，在将该值作为Key，telephone为value取出MAC值，作为参数与公私钥一起上传，
   * 服务端也按照该步骤进行验证，如结果一致则接口调用成功，反之则失败
   * @param obj
   */
  updatePasswordV1Param: function (obj) {
    // 解密obj.userRandomStr
    let rsaPrivateKey = getItem('MeInfo').rsaMsgPrivateKey
    let enRsaPrivateKey = EncryptUtils.decryptAES_Str(rsaPrivateKey, CryptoJS.MD5(obj.oldPwd));
    obj.userRandomStr = EncryptUtils.rsaDecrypt_str(obj.userRandomStr, enRsaPrivateKey);
    let loginPwd = EncryptUtils.buildLoginPassword(obj.newPwd);
    let code = CryptoJS.enc.Base64.parse(loginPwd).toString().substring(0, 32);// 24 toString = 16进制48*2；16
    let ward = CryptoJS.enc.Hex.parse(code);
    let byteAesPwdTest = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Utf8.parse(process.env.VUE_APP_API_KEY), ward);
    obj.mac = EncryptUtils.encryptMacToBase64(CryptoJS.enc.Base64.parse(byteAesPwdTest), obj.userRandomStr);
    // 更新rsa、dh私钥
    let secretData = this.createRSAandDHPrivateSecretKey(obj.oldPwd, obj.newPwd);
    obj.dhPrivateKey = secretData.dhPrivateKey;
    obj.rsaPrivateKey = secretData.rsaPrivateKey;
    obj.newPassword = loginPwd;
    obj.oldPassword = EncryptUtils.buildLoginPassword(obj.oldPwd);
    delete obj.userRandomStr;
    delete obj.oldPwd;
    delete obj.newPwd;
    return obj;
  },

  /**
   * 重置密码 mac验参
   * @param obj
   */
  resetPasswordV1Param: function (obj) {
    let newPassword = EncryptUtils.buildLoginPassword(obj.repassword);// 新密码
    let code = CryptoJS.enc.Base64.parse(newPassword).toString().substring(0, 32);// 24 toString = 16进制48*2；16
    let ward = CryptoJS.enc.Hex.parse(code);
    let byteAesPwdTest = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Utf8.parse(process.env.VUE_APP_API_KEY), ward);
    obj.mac = EncryptUtils.encryptMacToBase64(CryptoJS.enc.Base64.parse(byteAesPwdTest), CryptoJS.enc.Utf8.parse(obj.telephone));
    obj.newPassword = newPassword;
    obj = ApiAuthUtils.createRSAandDHSecretKey(obj);
    return obj;
  },

  /**
   * 创建RSA和DH 的私钥
   * @param password 明文密码
   */
  createRSAandDHPrivateSecretKey: function (oldPassword, newPassword) {
    // rsa解密旧版秘钥
    let rsaPrivateKey = getItem('MeInfo').rsaMsgPrivateKey
    rsaPrivateKey = EncryptUtils.decryptAES_Str(rsaPrivateKey, CryptoJS.MD5(oldPassword));
    rsaPrivateKey = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(rsaPrivateKey), CryptoJS.MD5(newPassword));
    // dh解密旧版秘钥
    let dhPrivateKey = getItem('MeInfo').dhMsgPrivateKey
    dhPrivateKey = EncryptUtils.decryptAES_Str(dhPrivateKey, CryptoJS.MD5(oldPassword));
    dhPrivateKey = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(dhPrivateKey), CryptoJS.MD5(newPassword));
    let secretKey = {};
    secretKey.rsaPrivateKey = rsaPrivateKey;
    secretKey.dhPrivateKey = dhPrivateKey;
    return secretKey;
  },

  /**
   * 创建RSA和DH的公私钥方法
   * @param obj.repassword 明文密码
   */
  createRSAandDHSecretKey: function (obj) {
    // rsa 秘钥对
    let keyPrair = EncryptUtils.generatedRSAKey();
    let rsaPrivateKey = keyPrair.getPrivateKeyB64();
    let rsaPublicKey = keyPrair.getPublicKeyB64();
    rsaPrivateKey = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(rsaPrivateKey), CryptoJS.MD5(obj.repassword));
    obj.rsaPublicKey = rsaPublicKey;
    obj.rsaPrivateKey = rsaPrivateKey;
    // dh秘钥对
    let ecdh = EncryptUtils.genDHKeyPair();
    let dhPrivateKey = EncryptUtils.encryptDHPrivateKey(ecdh);
    let dhPublicKey = EncryptUtils.encryptDHPublicKey(ecdh.getPublic());
    dhPrivateKey = EncryptUtils.encryptAES_StrToStr_test(CryptoJS.enc.Base64.parse(dhPrivateKey), CryptoJS.MD5(obj.repassword));
    obj.dhPublicKey = dhPublicKey;
    obj.dhPrivateKey = dhPrivateKey;
    delete obj.repassword;// 明文密码
    return obj;
  },


  /**
   * 消息加密传输对content 加密处理
   *
   * 1.用户A得到用户B的公钥
   2.用户A通过自己的私钥与用户B的公钥，通过DH协议，计算出对称密钥K
   3.用户A通过本地算法1对对称密钥K进行进一步计算，得到一个新的对称密钥S，让每条消息加/解密的对称密钥都不一样
   4.用户A将对称密钥S作为Key，使用AES对称加密算法对消息内的content字段进行加密
   5.用户A使用本地算法3得到一个mac值，将该值也放入消息内发送出去
   *
   * 使用DH协议+AES对称加密算法+本地算法来实现端到端加密
   DH协议：A(私钥) + B(公钥) = 对称密钥K = A(公钥) + B(私钥)
   AES128：取对称密钥前16个字节作为Key，对称密钥长度不足时补0
   *
   * 本地算法
   1.用于消息传输，让每条发送出去的消息加密的对称密钥都不一致，对称密钥S = MD5(apiKey + msgId + 对称密钥K[通过DH协议生成])
   3.用于单聊消息验签，表明消息的确为此人发送，MAC(fromUserId + toUserId + isEncrypt + msgId + 对称密钥S[通过本地算法1生成])，value为content
   * @param obj
   */
  encryptContent: function (obj) {
    let sendPrivateKeyTest = EncryptUtils.decryptAES_Str(obj.sendPrivateKey, CryptoJS.MD5(obj.enablePassword));
    // dh协议处理
    let secretKey = EncryptUtils.deriveDHFromBase64Key(sendPrivateKeyTest, obj.receivePublicKey);
    let sendPrivateKey = ApiAuthUtils.base64Md5(process.env.VUE_APP_API_KEY + obj.messageId + secretKey);
    let encryptContent = EncryptUtils.encryptAES_StrToStr_test(obj.content, CryptoJS.enc.Base64.parse(sendPrivateKey));
    let macVal = obj.fromUserId + obj.toUserId + obj.isEncrypt + obj.messageId + sendPrivateKey;
    let signature = EncryptUtils.encryptMacToBase64(encryptContent, macVal);
    let messageParam = {};
    messageParam.content = encryptContent;
    messageParam.signature = signature;
    return messageParam;
  },

  /**
   * 消息加密传输对content 解密处理
   *
   * 6.用户B得到用户A的公钥
   7.用户B通过自己的私钥与用户A的公钥，通过DH协议，计算出对称密钥K
   8.用户B通过本地算法1对对称密钥K进行进一步计算，得到新的对称密钥S
   9.用户B通过本地算法3得到一个mac值，与消息内的mac值进行对比，mac值一致时，进行第10步操作，不一致时，将消息标记为验签失败，存入数据库，同时将当前消息放入消息缓冲队列
   10.用户B将对称密钥S作为Key，使用AES对称加密算法对消息内的content字段进行解密
   *
   *  本地算法
   1.用于消息传输，让每条发送出去的消息加密的对称密钥都不一致，对称密钥S = MD5(apiKey + msgId + 对称密钥K[通过DH协议生成])
   3.用于单聊消息验签，表明消息的确为此人发送，MAC(fromUserId + toUserId + isEncrypt + msgId + 对称密钥S[通过本地算法1生成])，value为content
   *
   * 使用DH协议+AES对称加密算法+本地算法来实现端到端加密
   DH协议：A(私钥) + B(公钥) = 对称密钥K = A(公钥) + B(私钥)
   AES128：取对称密钥前16个字节作为Key，对称密钥长度不足时补0
   *
   * @param obj
   * 消息验参
   */
  getMessageSignature: function (obj) {
    let sendPrivateKeyTest = EncryptUtils.decryptAES_Str(obj.sendPrivateKey, CryptoJS.MD5(obj.enablePassword));
    // dh协议处理 K
    let secretKey = EncryptUtils.deriveDHFromBase64Key(sendPrivateKeyTest, obj.receivePublicKey);
    // 本地算法1 S
    let sendPrivateKey = ApiAuthUtils.base64Md5(process.env.VUE_APP_API_KEY + obj.messageId + secretKey);
    // 本地算法3
    let macVal = obj.fromUserId + obj.toUserId + obj.isEncrypt + obj.messageId + sendPrivateKey;
    // 验签
    let signature = EncryptUtils.encryptMacToBase64(obj.content, macVal);
    let getMessageParam = {};
    getMessageParam.signature = signature;
    getMessageParam.sendPrivateKey = sendPrivateKey;
    return getMessageParam;
  },

  /**
   *
   * 生成消息验签signature
   *
   * @param obj
   */
  getReceiveSignature: function (obj) {
    console.log("端到端消息解密参数 obj ： " + JSON.stringify(obj))
    let sendPrivateKeyTest = EncryptUtils.decryptAES_Str(obj.sendPrivateKey, CryptoJS.MD5(myData.enablePassword.toString()));
    console.log("aes解密dh私钥 ：" + sendPrivateKeyTest);
    // dh协议处理 K
    let secretKey = EncryptUtils.deriveDHFromBase64Key(sendPrivateKeyTest, obj.receivePublicKey);
    // 本地算法1 S
    let sendPrivateKey = ApiAuthUtils.base64Md5(process.env.VUE_APP_API_KEY + obj.messageId + secretKey);
    // 本地算法3
    let macVal = obj.fromUserId + obj.toUserId + obj.isEncrypt + obj.messageId + sendPrivateKey;
    // 验签
    let signature = EncryptUtils.encryptMacToBase64(obj.content, macVal);
    return signature;
  },

  /**
   * 端对端解密收到消息的content内容
   *
   * @param obj
   */
  decryptContent: function (content, sendPrivateKey) {
    console.log("decryptContent 消息解密 ： content :" + content + "   sendPrivateKey : " + sendPrivateKey);
    let decryptContent = EncryptUtils.decryptAES(content, CryptoJS.enc.Base64.parse(sendPrivateKey));
    return CryptoJS.enc.Utf8.stringify(decryptContent);
  },

  /**
   * 通用特殊的md5处理
   * md5得到charArray 后 base64处理
   */
  base64Md5: function (str) {
    let md5Str = CryptoJS.MD5(str);
    return CryptoJS.enc.Base64.stringify(md5Str);
  },

  /**
   * AES加解密通用处理
   *  获取秘钥key
   */
  getAESMsgKey: function (messageId) {
    var key = process.env.VUE_APP_API_KEY + messageId;
    return CryptoJS.MD5(key);
  },

  /**
   * 消息加密
   * @param msg
   * @returns {*}
   */
  encryptAESMessage: function (msg) {
    var key = ApiAuthUtils.getAESMsgKey(msg.messageId);
    msg.content = EncryptUtils.encryptAES_StrToStr_test(msg.content, key);
    return msg;
  },

  /**
   * AES消息解密
   * @param msg
   * @returns {*}
   */
  decryptAESMessage: function (msg) {
    var key = ApiAuthUtils.getAESMsgKey(msg.messageId);
    let decryptContent = EncryptUtils.decryptAES(msg.content, key);
    decryptContent = CryptoJS.enc.Utf8.stringify(decryptContent);
    console.log("AES decryptAESMessage content :" + decryptContent);
    return decryptContent;
  },

  /**
   * 消息缓冲队列为一个全局变量，专门用来处理验签失败的消息，消息缓冲队列为一个全局变量，为一个Map集合：
   Map<String，List<ChatMessage> = Map<好友id，好友验签失败的消息集合>
   同时还有一个辅助变量，标志当前是否正在调用获取某好友公钥列表接口，也为一个Map集合：
   Map<String，Boolean>  =  Map<好友id，标志位>
   验签失败的原因
   1.第三方篡改了我们的关键消息，对于此类消息我们是永远验签不成功的，直接丢掉
   2.对方忘记密码后上传了新的公钥对，导致使用用户原公钥参与运算的离线、漫游消息验签失败(即当前消息的对称密钥K不是客户端公钥表内最后一条公钥运算出来的，
   导致对称密钥S也不一致，最终导致验签失败)
   消息缓冲队列的工作方式
   当一条消息准备put到map内时，先通过消息内的fromUserId与timeSend，
   得到本地该好友createTime < timeSend的公钥列表，之后倒序取出公钥列表内的公钥一一验签，当某个公钥验签成功后，
   在拿该公钥进行运算得到对称密钥S，解密该消息得到明文，再去更新本地消息数据库，当所有公钥都不能正常验签该消息时，取出List<ChatMessage>，
   将该条消息放入集合内，重新put到map内，同时通过好友id取出标志位，判断此刻是否正在获取当前对象的公钥列表，当标志位为true时，
   等待接口调用完成，当标志位为false时，调用获取好友公钥列表接口，当接口调用完成时，更新本地数据库内这个好友的公钥列表，
   在取出这个好友队列内的消息，将该好友的消息队列清空，之后按照上部分黄色字体的步骤重新处理一遍，此时消息如果还是验签失败，直接丢掉不处理
   */


  /**
   * 私密群组通用处理
   *
   * 本地算法
   * 4.用于群聊消息验签，表明消息的确为此人发送，MAC(fromUserId + toUserId + isEncrypt + msgId +对称密钥G[通过本地算法6生成])，value为content
   * 5.用于群组端到端密钥存储，让数据库内的群组通信密钥以密文的形式存在AES(MD5(apiKey + roomJid), 对称密钥G[群主随机生成的一串字符串])
   * 6.用于消息传输，让每条发送出去的消息加密的对称密钥都不一致，对称密钥S = MD5(apiKey + msgId + 对称密钥G[群主随机生成的一串字符串])
   *
   * 方案概述
   用户在注册的时候除了生成一对DH密钥对，还需要生成一对RSA密钥对，用于私密群组，RSA密钥对的创建、更新与保存和DH密钥对一致，详情参考上面的介绍，
   通过RSA密钥对，以及一个对称密钥G(由群主创建，UUID)，实现群组的端到端加密方案
   原项目内私密群组只支持不可搜索，现可加入端到端加密

   私密群组创建流程
   1.用户A生成一串UUID，之后都称为对称密钥G
   2.用户A使用自己的公钥加密对称密钥G，得到加密之后的结果
   3.用户A调用建群接口，同时将加密之后的结果上传
   4.服务端收到建群请求时，判断是否为私密群组，如果为私密群组，取出加密结果放入对应的群成员表内
   5.用户A在建群成功的回调内使用本地算法5，将对称密钥G存入朋友表的chatKeyGroup字段内
   *
   */
  // 生成随机UUID
  getUUID: function () {
    function S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    let uuidStr = (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    console.log("getUuid : " + uuidStr);
    return uuidStr;
  },

  /**
   * 创建群组端到端秘钥
   * @param decrtptKey 明文的uuid
   * @param rsaPublicKey
   * @returns {*}
   */
  createRoomChatKey: function (decrtptKey, rsaPublicKey) {
    return EncryptUtils.rsaEncrypt(decrtptKey, rsaPublicKey);
  },

  /**
   * AES加密群组端到端密钥存储
   * chatKeyGroup
   */
  encryptChatKeyGroup: function (obj) {
    let chatKey = this.base64Md5(process.env.VUE_APP_API_KEY + obj.roomJid);
    return EncryptUtils.encryptAES_StrToStr_test(obj.decrtptKey, CryptoJS.enc.Base64.parse(chatKey));
  },

  /**
   * AES解密本地保存的群组端到端秘钥
   * @param obj
   */
  decryptChatKeyGroupByAES: function (obj) {
    let chatKey = this.base64Md5(process.env.VUE_APP_API_KEY + obj.roomJid);
    let decrtptKey = EncryptUtils.decryptAES(obj.encryptKey, CryptoJS.enc.Base64.parse(chatKey));
    decrtptKey = CryptoJS.enc.Utf8.stringify(decrtptKey);
    return decrtptKey;
  },

  /**
   * RSA解密群成员中保存的群组端到端秘钥
   * @param obj
   */
  decryptChatKeyGroupByRSA: function (obj) {
    let decryptPrivateKey = EncryptUtils.decryptAES_Str(obj.privateKey, CryptoJS.MD5(obj.password));// aes解密rsa私钥
    console.log("decryptChatKeyGroupByRSA decryptPrivateKey : " + decryptPrivateKey);
    let decryptCode = EncryptUtils.rsaDecrypt(obj.encrtptKey, decryptPrivateKey);
    return forge.util.decode64(decryptCode);
  },

  /**
   * 私密群组端到端消息加密传输通用处理
   * 消息加密传输
   1.用户A取出本地保存的对称密钥，根据本地算法5，解密得到真正的对称密钥G
   2.用户A将对称密钥G作为Key，使用AES对称加密算法对消息内的content字段进行加密
   3.用户A使用本地算法4得到一个mac值，将该值也放入消息内发送出去
   4.用户B得到mac值，使用本地算法4也得到一个mac值，与消息内的mac值进行对比，如结果一致，进行第5步，如不一致，将该消息标记为验签失败，放入缓冲队列，存入数据库
   5.用户B将对称密钥G作为Key，使用AES对称加密算法对消息内的content字段进行解密
   *
   * 本地算法四：
   * 4.用于群聊消息验签，表明消息的确为此人发送，MAC(fromUserId + toUserId + isEncrypt + msgId +对称密钥G[通过本地算法6生成])，value为content
   */

  /**
   * AES解密本地保存的群组端到端秘钥
   * @param obj
   */
  getDecrtptKey: function (roomJid, encryptKey) {
    // encryptKey = JSON.parse(encryptKey);
    console.log("getDecrtptKey  param  roomJid:" + roomJid + "   encryptKey : " + encryptKey);
    let decryptParam = {};
    decryptParam.roomJid = roomJid;
    decryptParam.encryptKey = encryptKey;
    return this.decryptChatKeyGroupByAES(decryptParam);// AES解密得到秘钥G=UUID
  },

  /**
   * 群组端到端消息通过群组秘钥UUID保证每次消息发送消息秘钥都不同
   * 本地算法6
   * 6.用于消息传输，让每条发送出去的消息加密的对称密钥都不一致，对称密钥S = MD5(apiKey + msgId + 对称密钥C[群主随机生成的一串字符串])
   * @param messageId
   * @param encryptKey 明文UUID
   * @returns {*}
   */
  encryptCode: function (messageId, encryptKey) {
    let encryptCode = process.env.VUE_APP_API_KEY + messageId + encryptKey;
    console.log("encryptCode :" + CryptoJS.enc.Base64.stringify(CryptoJS.MD5(encryptCode)));
    return CryptoJS.enc.Base64.stringify(CryptoJS.MD5(encryptCode));
  },

  /**
   * 私密群组端对端生成signature参数
   * @param obj
   */
  getCharRoomMessageSignature: function (obj) {
    console.log("生成signature参数  obj : " + JSON.stringify(obj));
    let decrtptKey = this.getDecrtptKey(obj.roomJid, obj.encryptKey);// AES解密得到秘钥G=UUID
    console.log("生成signature参数 AES解密得到UUID ： " + decrtptKey);
    let macVal = obj.fromUserId + obj.toUserId + obj.isEncrypt + obj.msgId + this.encryptCode(obj.msgId, decrtptKey);
    let signature = EncryptUtils.encryptMacToBase64(obj.content, macVal);// 字节数组
    return signature;
  },

  /**
   * 私密群组端对端验参signature通过后解密content
   *
   *  4.用户B得到mac值，使用本地算法4也得到一个mac值，与消息内的mac值进行对比，如结果一致，进行第5步，如不一致，将该消息标记为验签失败，放入缓冲队列，存入数据库
   * 5.用户B将对称密钥G作为Key，使用AES对称加密算法对消息内的content字段进行解密
   */
  secretGroupDecryptContent: function (obj) {
    console.log("私密群组端对端验参signature通过后解密content obj :" + JSON.stringify(obj));
    let decrtptKey = this.getDecrtptKey(obj.roomJid, obj.encryptKey);// AES解密得到秘钥G=UUID
    console.log("signature通过后解密content AES解密得到UUID ： " + decrtptKey);
    let decryptContent = EncryptUtils.decryptAES(obj.content, CryptoJS.enc.Base64.parse(this.encryptCode(obj.msgId, decrtptKey)));
    console.log("未解密之前content：" + decryptContent);
    decryptContent = CryptoJS.enc.Utf8.stringify(decryptContent);
    console.log("私密群组解密content : " + decryptContent);
    return decryptContent;
  },


  /**
   * 私密群组端对端加密content
   * 用户A将对称密钥G作为Key，使用AES对称加密算法对消息内的content字段进行加密
   * @param obj
   */
  encryptContentByCharRoom: function (obj) {
    console.log("私密群组加密content : encryptContentByCharRoom :" + JSON.stringify(obj))
    let decrtptKey = this.getDecrtptKey(obj.roomJid, obj.encryptKey);// AES解密得到秘钥G=UUID
    console.log("加密content 生成mac参数 AES解密得到UUID ： " + decrtptKey);
    let content = EncryptUtils.encryptAES_StrToStr_test(obj.content, CryptoJS.enc.Base64.parse(this.encryptCode(obj.msgId, decrtptKey)));// 加密content
    let signatureParam = {};
    signatureParam.roomJid = obj.roomJid;
    signatureParam.encryptKey = obj.encryptKey;
    signatureParam.fromUserId = obj.fromUserId;
    signatureParam.toUserId = obj.toUserId;
    signatureParam.isEncrypt = obj.isEncrypt;
    signatureParam.msgId = obj.msgId;
    signatureParam.content = content;
    let signature = this.getCharRoomMessageSignature(signatureParam);
    let encryptContent = {};
    encryptContent.content = content;
    encryptContent.signature = signature;
    return encryptContent;
  },

  /**
   * 当其他群成员收到type==804的消息时，取出本地保存的对称密钥G，使用消息发送方的公钥加密对称密钥G，
   * 并发送type==805的xmpp消息，将对称密钥传过去，在收到新密钥之后，用私钥解密得到chatKeyGroup，标记群组状态为正常
   * 发送805单聊
   *
   * roomJid
   * encryptChatKey
   * rsaPublicKey
   * @param obj
   */
  updatePasswordToChatKey: function (obj) {
    console.log("updatepwd :" + JSON.stringify(obj));
    let decryptKey = this.getDecrtptKey(obj.roomJid, obj.encryptChatKey);// 解密后的chatKey
    console.log("收到804消息 解密后的chatKey ：" + decryptKey)
    var chatKey = this.createRoomChatKey(decryptKey, obj.rsaPublicKey);
    return chatKey;
  },

  /**
   * rsa验签（签名）通用处理
   * @param privateKey
   * @param encryptSignVal
   * @param repassword
   * @returns {*|the}
   */
  rsaSignCommon: function (rsaPrivateKey, encryptSignVal, repassword) {
    rsaPrivateKey = EncryptUtils.decryptAES_Str(rsaPrivateKey, CryptoJS.MD5(repassword));
    return EncryptUtils.rsaSignToBase(rsaPrivateKey, encryptSignVal);
  }
};

/**
  * 解密登录成功后返回的data
  *
  * 返回结果data为加密结果列表，具体是json字符串aes加密后的base64编码，
  * aes加密key为接口1获取到的code,私钥解密
  */
export function decryptLoginSuccessData (data, code, privateKey, pwd) {
  let decryptPrivateKey = EncryptUtils.decryptAES_Str(privateKey, CryptoJS.MD5(pwd));// aes解密私钥
  let decryptCode = EncryptUtils.rsaDecrypt(code, decryptPrivateKey);
  data = EncryptUtils.decryptAES(data, CryptoJS.enc.Base64.parse(decryptCode));
  let userData = CryptoJS.enc.Utf8.stringify(data);
  return userData;
}


/**
  * AES加密
  * @param content
  * @param key
  * @returns {*}
  */
export function encryptAES (content, key) {
  key = ApiAuthUtils.getAESMsgKey(key);
  content = EncryptUtils.encryptAES_StrToStr_test(content, key);
  return content;
}

/**
  * AES解密
  * @param content
  * @param key
  * @returns {*}
  */
export function decryptAES (content, key) {
  key = ApiAuthUtils.getAESMsgKey(key);
  let decryptContent = EncryptUtils.decryptAES(content, key);
  decryptContent = CryptoJS.enc.Utf8.stringify(decryptContent);
  return decryptContent;
}

/**
  * 解密注册成功返回的数据
  * @param regeditData
  * @returns {*|string}
  */
export function decryptRegeditData (regeditData) {
  regeditData = EncryptUtils.decryptAES(regeditData, CryptoJS.MD5(process.env.VUE_APP_API_KEY));
  let userData = CryptoJS.enc.Utf8.stringify(regeditData);
  return userData;
}
/**
  * 消息key验参
  * 自动登录接口5返回的messageKey用于xmpp消息验参，
  * 消息body json中添加字段mac用于验参，
  * Mac算法 内容为所有参数依次排列, 遇到浮点数转成整数再参与拼接，
  * Mac算法 Key 为messageKey作base64解码后的16字节数据，
  * HMACMD5算法结果取base64编码成字符串，
  * @param obj
  * @param messageKey
  * @returns {*}
  */
export function messageCheckingParam (obj, messageKey) {
  obj.timeSend = Math.floor(obj.timeSend);
  let paramSortVal = EncryptUtils.paramKeySort(obj);
  let mac = EncryptUtils.encryptMacToBase64(paramSortVal, CryptoJS.enc.Base64.parse(messageKey));
  return mac;
}



export default { ...ApiAuthUtils, encryptAES, decryptAES, decryptLoginSuccessData, decryptRegeditData, messageCheckingParam }
