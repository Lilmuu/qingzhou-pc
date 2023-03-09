import CryptoJS from 'crypto-js'

/**
  * AES加密
  * @param content
  * @param key
  * @returns {*}
  */
 export function encryptAES (content, key) {
  key = EncryptUtils.getAESMsgKey(key);
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
  key = EncryptUtils.getAESMsgKey(key);
  let decryptContent = EncryptUtils.decryptAES(content, key);
  decryptContent = CryptoJS.enc.Utf8.stringify(decryptContent);
  return decryptContent;
}

export default { encryptAES, decryptAES }

const EncryptUtils = {
  AES: {
    aesIvKey: null,
    getAesIvKey: function () {
      if (!this.aesIvKey) {
        let ivArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        let iv = EncryptUtils.getStrFromBytes(ivArr);
        this.aesIvKey = CryptoJS.enc.Utf8.parse(iv);
      }
      return this.aesIvKey;
    },
    encrypt: function (value, key) {
      return CryptoJS.AES.encrypt(value, key, this.getOption(this.getAesIvKey()));
    },
    decrypt: function (value, key) {
      return CryptoJS.AES.decrypt(value, key, this.getOption(this.getAesIvKey()));
    },
    option: null,
    getOption: function (ivKey) {
      if (!this.option) {
        this.option = {
          iv: ivKey,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      }

      return this.option;
    },
  },

  encryptAES_StrToStr_test: function (value, key) {
    let result = this.AES.encrypt(value, key);
    return CryptoJS.enc.Base64.stringify(result.ciphertext);
  },

  /**
   * AES加解密通用处理
   *  获取秘钥key
   */
  getAESMsgKey (key) {
    // 可自定义一个静态key与动态key进行相加，用于加密的key
    // key = process.env.VUE_APP_API_KEY + key
    return CryptoJS.MD5(key);
  },
  decryptAES: function (value, key) {
    return this.AES.decrypt(value, key);
  },
    /*
    字节数组转换为字符串
    */
  getStrFromBytes: function (arr) {
    let r = "";
    for (let i = 0; i < arr.length; i++) {
      r += String.fromCharCode(arr[i]);
    }
    return r;
  },
}