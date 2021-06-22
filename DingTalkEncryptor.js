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
    // this.aesKey = (new Buffer.from(encodingAesKey + '=', 'base64')).toString('hex');
    // decode encodingAesKey to aesKey, then convert to binary
    this.aesKey = (new Buffer.from(encodingAesKey + '=', 'base64')).toString('binary');
    this.corpId = corpIdOrSuiteKey;

    // this.keySpec = CryptoJS.enc.Hex.parse(this.aesKey);
    // this.iv = CryptoJS.enc.Hex.parse(this.aesKey.substr(0, 32));
    this.keySpec = CryptoJS.enc.Latin1.parse(this.aesKey);
    this.iv = CryptoJS.enc.Latin1.parse(this.aesKey.substr(0, 16));
    this.options = {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
    };
  }

  // verify encodingAesKey
  set encodingAesKey(val){
    if (!val || val.length !== this.AES_ENCODE_KEY_LENGTH) {
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

      // encrypt
      // unencrypted = CryptoJS.enc.Latin1.parse(unencrypted) // 中文乱码
      unencrypted = CryptoJS.enc.Utf16.parse(unencrypted)
      const encrypted = CryptoJS.AES.encrypt(unencrypted, this.keySpec, this.options);
      return encrypted.toString();
      // return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    } catch (e) {
      throw new DingTalkEncryptException(900007);
    }
  }

  decrypt(encrypted) {
    let originalStr;
    let networkOrder;
    try {
      // decrypt
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.keySpec, this.options);
      // originalStr = CryptoJS.enc.Latin1.stringify(decrypted); // 中文乱码
      originalStr = CryptoJS.enc.Utf16.stringify(decrypted);
    } catch (e) {
      console.log(e);
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
      // console.log(`debug noPadRet: ${noPadRet.length}: ${noPadRet}`);
      // console.log(`debug networkOrder: ${networkOrder.length}: [${networkOrder}]`);
      // console.log(`debug plainText: ${plainText.length}: ${plainText}`);
      // console.log(`debug fromCorpid: ${fromCorpid.length}: ${fromCorpid}`);
    } catch (e) {
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
      return {
        msg_signature: signature,
        encrypt: encrypt,
        timeStamp: timeStamp,
        nonce: nonce
      };
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
