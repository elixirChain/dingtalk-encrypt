/* eslint-disable no-bitwise */
'use strict';

const CryptoJS = require('crypto-js');
// const AES = require('crypto-js/aes');
const PKCS7Padding = require('./PKCS7Padding');
const Utils = require('./Utils');
const DingTalkEncryptException = require('./DingTalkEncryptException');

class DingTalkEncryptor {
  constructor(token, encodingAesKey, corpIdOrSuiteKey) {
    this.utf8 = 'utf-8';
    this.base64 = 'base64';
    this.AES_ENCODE_KEY_LENGTH = 43;
    this.RANDOM_LENGTH = 16;

    this.token = token;
    this.encodingAesKey = encodingAesKey;
    this.aesKey = new Buffer.from(encodingAesKey + '=', 'base64');
    this.corpId = corpIdOrSuiteKey;
  }

  // verify encodingAesKey
  set encodingAesKey(val){
    if (val && val.length === this.AES_ENCODE_KEY_LENGTH) {
      this.aesKey = new Buffer.from(val + '=', 'base64');
    } else {
      throw new DingTalkEncryptException(900004);
    }
  }

  encrypt(random, plainText) {
    try {
      // 拼接字符串
      let unencrypted = random;
      // unencrypted += plainText.length; // 先获取byte数组，再转换为字符串
      unencrypted += Utils.bin2String(Utils.int2Bytes(plainText.length));
      unencrypted += plainText;
      unencrypted += this.corpId;
      unencrypted += PKCS7Padding.getPaddingBytes(unencrypted.length);

      const key = CryptoJS.enc.Latin1.parse(this.aesKey.toString());
      const iv = CryptoJS.enc.Latin1.parse(this.aesKey.toString().substr(0, 16));
      /** NoPadding,ZeroPadding,Pkcs7 ... */
      const pad = CryptoJS.pad.NoPadding;
      // encrypt
      const encrypted = CryptoJS.AES.encrypt(
        unencrypted,
        key,
        {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: pad,
        }
      );
      return encrypted;
    } catch (error) {
      throw new DingTalkEncryptException(900007);
    }
  }

  decrypt(text) {
    let originalStr;
    let networkOrder;
    try {
      const key = CryptoJS.enc.Latin1.parse(this.aesKey.toString());
      const iv = CryptoJS.enc.Latin1.parse(this.aesKey.toString().substr(0, 16));
      /** NoPadding,ZeroPadding,Pkcs7 ... */
      const pad = CryptoJS.pad.NoPadding;
      // decrypt
      const decrypted = CryptoJS.AES.decrypt(text,
        key,
        {
          iv,
          padding: pad,
        }
      );
      originalStr = decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new DingTalkEncryptException(900008);
    }

    let plainText;
    let fromCorpid;
    let noPadRet;
    try {
      noPadRet = PKCS7Padding.removePaddingBytes(originalStr);
      networkOrder = noPadRet.substring(16, 20);
      // reverse: Utils.bin2String(Utils.int2Bytes(plainText.length));
      const plainTextLength = Utils.bytes2int(Utils.string2Bin(networkOrder));
      plainText = noPadRet.substring(20, 20 + plainTextLength);
      fromCorpid = noPadRet.substring(20 + plainTextLength, noPadRet.length);
    } catch (error) {
      throw new DingTalkEncryptException(900009);
    }

    if (fromCorpid !== this.corpId) {
      throw new DingTalkEncryptException(900010);
    } else {
      return plainText;
    }
  }

  getSignature(token, timestamp, nonce, encrypt) {
    timestamp = timestamp+'';
    const strArr = [ this.token, timestamp, nonce, encrypt ];
    strArr.sort();
    const sha1Arr = CryptoJS.SHA1(strArr.join(''));
    return sha1Arr.toString();
  }

  getEncryptedMap(plaintext, timeStamp, nonce) {
    timeStamp = timeStamp + '';
    if (plaintext == null) {
      throw new DingTalkEncryptException(900001);
    } else if (timeStamp == null) {
      throw new DingTalkEncryptException(900002);
    } else if (nonce == null) {
      throw new DingTalkEncryptException(900003);
    } else {
      const encrypt = this.encrypt(Utils.getRandomStr(this.RANDOM_LENGTH), plaintext);
      const signature = this.getSignature(this.token, timeStamp, nonce, encrypt);
      const resultMap = new Map();
      resultMap.set('msg_signature', signature);
      resultMap.set('encrypt', encrypt);
      resultMap.set('timeStamp', timeStamp);
      resultMap.set('nonce', nonce);
      return resultMap;
    }
  }

  getDecryptMsg(msgSignature, timeStamp, nonce, encryptMsg) {
    const signature = this.getSignature(this.token, timeStamp, nonce, encryptMsg);
    if (signature !== msgSignature) {
      throw new DingTalkEncryptException(900006);
    } else {
      return this.decrypt(encryptMsg);
    }
  }

}

module.exports = DingTalkEncryptor;
