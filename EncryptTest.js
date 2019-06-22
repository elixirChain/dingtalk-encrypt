'use strict';

const CryptoJS = require('crypto-js');
// const AES = require('crypto-js/aes');
const DingTalkEncryptor = require('./DingTalkEncryptor');
const Utils = require('./Utils');
const DingTalkEncryptException = require('./DingTalkEncryptException');

/** 加解密需要用到的token，企业可以随机填写。如 "12345" */
const TOKEN = '666666';
/** 数据加密密钥。用于回调数据的加密，长度固定为43个字符，从a-z, A-Z, 0-9共62个字符中选取,您可以随机生成*/
const ENCODING_AES_KEY = 'TXpRMU5qYzRPVEF4TWpNME5UWTNPRGt3TVRJek5EVTI';
/** 企业corpid, 需要修改成开发者所在企业 */
const CORP_ID = 'ding12345678901234567890123456789012';

const plainText = 'success';
const ENCRYPT_RANDOM_16 = 'aaaabbbbccccdddd';

console.log('\nEncryptor Test:');
const encryptor = new DingTalkEncryptor(TOKEN, ENCODING_AES_KEY, CORP_ID);
console.log(`  plainText: ${plainText}, (${plainText.length})`);
const encrypted =  encryptor.encrypt(ENCRYPT_RANDOM_16, plainText);
console.log(`  encrypted: ${encrypted}`);
const decrypted = encryptor.decrypt(encrypted);
console.log(`  decrypted: ${decrypted}, (${decrypted.length})`);

// const timeStamp = (new Date().getTime).toString();
// const nonce = Utils.getRandomStr(8);
const timeStamp = "1561081681688";
const nonce = '88888888';
const sign = encryptor.  getSignature(TOKEN, timeStamp, nonce, encrypted);
console.log(`\nSignature Test: \n  sign: ${sign}, (${sign.length})`);

const er = new DingTalkEncryptException(900008);
console.log('\nDingTalkEncryptException Test: ');
console.log('  code: '+er.code);
console.log('  message: '+er.message +'\n');

console.log('  error encodingAesKey: ');
new DingTalkEncryptor(TOKEN, "error encodingAesKey", CORP_ID);



