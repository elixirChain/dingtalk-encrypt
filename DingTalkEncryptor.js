/* eslint-disable no-bitwise */
'use strict';

const Crypto = require('crypto');
const DingTalkEncryptException = require('./DingTalkEncryptException');

class DingTalkEncryptor {
  constructor(token, encodingAesKey, corpIdOrSuiteKey) {
    this.utf8 = 'utf-8';
    this.base64 = 'base64';
    this.AES_ENCODE_KEY_LENGTH = 43;
    this.RANDOM_LENGTH = 16;

    this.token = token;
    this.encodingAesKey = encodingAesKey;
    this.aesKey = (Buffer.from(encodingAesKey + '=', 'base64')).toString();
    this.corpId = corpIdOrSuiteKey;
    this.keySpec = this.aesKey;
    this.iv = this.aesKey.slice(0, 16);
  }

  // verify encodingAesKey
  set encodingAesKey(val) {
    if (!val || val.length !== this.AES_ENCODE_KEY_LENGTH) {
      throw new DingTalkEncryptException(900004);
    }
  }

  encrypt(random, plainText) {
    try {
      const randomBuf = Buffer.from(random);
      const plainTextBuf = Buffer.from(plainText);
      const textLen = plainTextBuf.length;
      const textLenBuf = Buffer.from([(textLen >> 24 & 255), (textLen >> 16 & 255), (textLen >> 8 & 255), (textLen & 255)]);
      const cropIdBuf = Buffer.from(this.corpId);
      const padCount = 32 - (randomBuf.length + textLenBuf.length + plainTextBuf.length + cropIdBuf.length) % 32;
      const padBuf = Buffer.from(new Array(padCount).fill(padCount));
      const finalBuf = Buffer.concat([randomBuf, textLenBuf, plainTextBuf, cropIdBuf, padBuf]);
      const crypto = Crypto.createCipheriv('AES-256-CBC', this.keySpec, this.iv);
      return Buffer.concat([crypto.update(finalBuf), crypto.final()]).toString('base64');
    } catch (e) {
      throw new DingTalkEncryptException(900007);
    }
  }

  decrypt(encrypted) {
    let decrypt;
    try {
      // decrypt
      const crypto = Crypto.createDecipheriv('AES-256-CBC', this.keySpec, this.iv);
      decrypt = Buffer.concat([crypto.update(encrypted, 'base64'), crypto.final()]);
    } catch (e) {
      throw new DingTalkEncryptException(900008);
    }

    let cropId;
    let plainText;
    try {
      let pad = decrypt[decrypt.length - 1];
      if (pad < 1 || pad > 32) pad = 0;
      const finalDecrypt = decrypt.slice(0, decrypt.length - pad);
      // const random = finalDecrypt.slice(0, 16);
      const textLen = finalDecrypt.slice(16, 20).readUInt32BE();
      plainText = finalDecrypt.slice(20, 20 + textLen).toString();
      cropId = finalDecrypt.slice(20 + textLen).toString();
    } catch (e) {
      throw new DingTalkEncryptException(900009);
    }

    if (cropId !== this.corpId) {
      throw new DingTalkEncryptException(900010);
    } else {
      return plainText;
    }
  }

  getSignature(token, timestamp, nonce, encrypt) {
    timestamp = timestamp + '';
    const strArr = [this.token, timestamp, nonce, encrypt];
    strArr.sort();
    const sha1 = Crypto.createHash('sha1');
    sha1.update(strArr.join(''))
    return sha1.digest('hex');
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
      const encrypt = this.encrypt(this.getRandomStr(this.RANDOM_LENGTH), plaintext);
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

  getRandomStr(size) {
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = size; i > 0; --i) {
      randomStr += base[Math.floor(Math.random() * base.length)];
    }
    return randomStr;
  };
}

module.exports = DingTalkEncryptor;
