/* eslint-disable no-bitwise */
'use strict';

const Crypto = require('crypto');
const Utils = require('./Utils');
const DingTalkEncryptException = require('./DingTalkEncryptException');

class DingTalkEncryptor {
  constructor(token, encodingAesKey, corpIdOrSuiteKey) {
    this.AES_ENCODE_KEY_LENGTH = 43;
    this.RANDOM_LENGTH = 16;

    this.token = token;
    this.encodingAesKey = encodingAesKey;
    this.aesKey = Buffer.from(encodingAesKey + '=', 'base64');
    this.corpId = corpIdOrSuiteKey;
    this.iv = this.aesKey.slice(0, 16);
  }

  /**
   * verify encodingAesKey
   * @param {string} val
   */
  set encodingAesKey(val) {
    if (!val || val.length !== this.AES_ENCODE_KEY_LENGTH) {
      throw new DingTalkEncryptException(900004);
    }
  }

  /**
   * 加密
   */
  encrypt(random, plainText) {
    try {
      const randomBuf = Buffer.from(random);
      const plainTextBuf = Buffer.from(plainText);
      const textLen = plainTextBuf.length;
      const textLenBuf = Buffer.from([(textLen >> 24 & 255), (textLen >> 16 & 255), (textLen >> 8 & 255), (textLen & 255)]);
      const corpIdBuf = Buffer.from(this.corpId);
      const padCount = 32 - (randomBuf.length + textLenBuf.length + plainTextBuf.length + corpIdBuf.length) % 32;
      const padBuf = Buffer.from(new Array(padCount).fill(padCount));
      const finalBuf = Buffer.concat([randomBuf, textLenBuf, plainTextBuf, corpIdBuf, padBuf]);
      const crypto = Crypto.createCipheriv('AES-256-CBC', this.aesKey, this.iv);
      crypto.setAutoPadding(false);
      return Buffer.concat([crypto.update(finalBuf)]).toString('base64');
    } catch (e) {
      throw new DingTalkEncryptException(900007);
    }
  }

  /**
   * 解密
   */
  decrypt(encrypted) {
    let decrypt;
    try {
      // decrypt
      const crypto = Crypto.createDecipheriv('AES-256-CBC', this.aesKey, this.iv);
      crypto.setAutoPadding(false);
      decrypt = Buffer.concat([crypto.update(encrypted, 'base64')]);
    } catch (e) {
      throw new DingTalkEncryptException(900008);
    }

    let corpId, plainText;
    try {
      const textLen = decrypt.slice(16, 20).readUInt32BE();
      plainText = decrypt.slice(20, 20 + textLen).toString();
      const pad = decrypt.length - 16 - 4 - textLen - 20;
      if (pad > 31) pad = 0;
      const finalDecrypt = decrypt.slice(0, decrypt.length - pad);
      corpId = finalDecrypt.slice(20 + textLen).toString();
    } catch (e) {
      throw new DingTalkEncryptException(900009);
    }

    /**
     * TODO:解密获取的 corpId 某些情况存在问题：
     * - 末尾多余空字符
     * - 待加密的串太少时，位数不够
     */
    if (this.corpId !== corpId && !corpId.startsWith(this.corpId) && !this.corpId.startsWith(corpId)) {
      throw new DingTalkEncryptException(900010);
    } else {
      return plainText;
    }
  }

  /**
   * 获取签名
   */
  getSignature(token, timestamp, nonce, encrypt) {
    timestamp = timestamp + '';
    const strArr = [ token, timestamp, nonce, encrypt ];
    strArr.sort();
    const sha1 = Crypto.createHash('sha1');
    sha1.update(strArr.join(''))
    return sha1.digest('hex');
  }

  /**
   * 获取加密响应对象
   */
  getEncryptedMap(plaintext, timestamp, nonce) {
    timestamp = timestamp + '';
    if (plaintext == null) {
      throw new DingTalkEncryptException(900001);
    } else if (timestamp == null) {
      throw new DingTalkEncryptException(900002);
    } else if (nonce == null) {
      throw new DingTalkEncryptException(900003);
    } else {
      const encrypt = this.encrypt(Utils.getRandomStr(this.RANDOM_LENGTH), plaintext);
      const signature = this.getSignature(this.token, timestamp, nonce, encrypt);
      return {
        msg_signature: signature,
        encrypt: encrypt,
        timeStamp: timestamp,
        nonce: nonce
      };
    }
  }

  /**
   * 解密回调数据
   * - 校验消息签名等
   */
  getDecryptMsg(msgSignature, timestamp, nonce, encryptMsg) {
    const signature = this.getSignature(this.token, timestamp, nonce, encryptMsg);
    if (signature !== msgSignature) {
      throw new DingTalkEncryptException(900006);
    } else {
      return this.decrypt(encryptMsg);
    }
  }

}

module.exports = DingTalkEncryptor;
