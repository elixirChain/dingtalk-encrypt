'use strict';

const DingTalkEncryptor = require('./DingTalkEncryptor');
const utils = require('./Utils');

/** 加解密需要，可以随机填写。如 "12345" */
const TOKEN = '666666';
/** 加密密钥，用于回调数据的加密，固定为43个字符，从[a-z, A-Z, 0-9]共62个字符中随机生成*/
const ENCODING_AES_KEY = utils.getRandomEncodingAesKey();
// const ENCODING_AES_KEY = utils.getRandomStr(43);
console.log('ENCODING_AES_KEY:\n' + ENCODING_AES_KEY);
/** 企业corpid, 可以在钉钉企业管理后台查看（https://oa.dingtalk.com/） */
const CORP_ID = 'ding1234567890';
/** 实例化加密类 */
console.log('# Encryption and Decryption Test:');
const encryptor = new DingTalkEncryptor(TOKEN, ENCODING_AES_KEY, CORP_ID);

// const plainText = 'success';
const ENCRYPT_RANDOM_16 = utils.getRandomStr(16);
const timeStamp = (new Date().getTime()).toString();
const nonce = utils.getRandomStr(8);

/** 测试加解密响应报文或者字符串 */
const testJson = {
  EventType: 'bpms_instance_change',
  processInstanceId: 'ad253df6-e175caf-68085c60ba8a',
  corpId: 'ding2c4d8175651',
  createTime: 1495592259000,
  title: '自测-1016',
  type: 'start',
  staffId: 'er5875',
  url: 'https://aflow.dingtalk.com/dingtalk/mobile/homepage.htm',
  processCode: 'xxx',
};
const testStr = '中文乱码测试/abc/123';
// const unencryptedStr = 'success';

const unencryptedStr = JSON.stringify(testStr);
console.log(`  node unencryptedStr:\n ${unencryptedStr}, (${unencryptedStr.length})`);
const encryptedStr = encryptor.encrypt(ENCRYPT_RANDOM_16, unencryptedStr);
console.log(`  \nnode encryptedStr:\n ${encryptedStr}`);
const decryptedJson = encryptor.decrypt(encryptedStr);
console.log(`  \nnode decryptedJson:\n ${decryptedJson}, (${decryptedJson.length}), ${unencryptedStr === decryptedJson}` );
console.log('  \nnode sign:\n ' + encryptor.getSignature(TOKEN, timeStamp, nonce, encryptedStr));

console.log('\n# DingTalk test:');
const plaintext = JSON.stringify(testJson);
const encryptRes = encryptor.getEncryptedMap(plaintext, timeStamp, nonce);
console.log('encrypt: ', encryptRes);
const decryptRes = encryptor.getDecryptMsg(encryptRes.msg_signature, encryptRes.timeStamp, encryptRes.nonce, encryptRes.encrypt);
console.log('decrypt: ', JSON.parse(decryptRes));

