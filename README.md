# dingtalk-encrypt
DingTalk Encrypt Node Version.  
Refer to [Java version](https://github.com/opendingtalk/eapp-corp-project.git): 

**Issues:** It's your turn!

# Usage
## this repository
- git clone
- npm install
- run 'EncryptTest.js' for main APIs.

## npm module
- npm install --save dingtalk-encrypt
- use APIs as follows API Doc.

# API Doc
- Need constants:
> TOKEN - Random string for signature, unrestricted, such as "123456".  
  ENCODING_AES_KEY - Secret key for callback data, random 43 characters of [a-z, A-Z, 0-9].  
  CORP_ID - DingTalk corpId from the [Official OA](https://oa.dingtalk.com).  

- Main APIs([Usage Example](https://open-doc.dingtalk.com/microapp/serverapi2/lo5n6i)):
  - getEncryptedMap
  - getDecryptMsg
  - getSignature
  - encrypt
  - decrypt

- Example
  - 处理钉钉回调
  ```
  // 参考：钉钉开发文档-业务事件回调 
  const DingTalkEncryptor = require('dingtalk-encrypt');
  const utils = require('dingtalk-encrypt/Utils');
  /** 加解密需要，可以随机填写。如 "12345" */
  const TOKEN = '666666';
  /** 加密密钥，用于回调数据的加密，固定为43个字符，从[a-z, A-Z, 0-9]共62个字符中随机生成*/
  const ENCODING_AES_KEY = 'TXpRMU5qYzRPVEF4TWpNME5UWTNPRGt3TVRJek5EVTI';
  // const ENCODING_AES_KEY = utils.getRandomStr(43);
  /** 企业corpid, 可以在钉钉企业管理后台查看（https://oa.dingtalk.com/） */
  const CORP_ID = 'ding12345678901234567890123456789012';
  /** 实例化加密类 */
  console.log('\nEncryptor Test:');
  const encryptor = new DingTalkEncryptor(TOKEN, ENCODING_AES_KEY, CORP_ID);

  // 解密钉钉回调数据 
  const plainText = encryptor.getDecryptMsg(signature, timestamp, nonce, encryptMsg);
  console.log('DEBUG plainText: ' + plainText);
  const obj = JSON.parse(plainText);
  // 回调事件类型，根据事件类型和业务数据处理相应业务
  const eventType = obj.EventType;
  // 响应数据：加密'success'，签名等等
  encryptor.getEncryptedMap('success', timestamp, utils.getRandomStr(8));
  ```
  - 单独使用加/解密
  ```
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
  // console.log(JSON.parse(JSON.stringify(testJson)));
  // const unencryptedJson = 'success';
  const unencryptedJson = JSON.stringify(testJson);
  console.log(`  node unencryptedJson:\n ${unencryptedJson}`);
  const encryptedJson = encryptor.encrypt(ENCRYPT_RANDOM_16, unencryptedJson);
  console.log(`  \nnode encryptedJson:\n ${encryptedJson}`);
  const decryptedJson = encryptor.decrypt(encryptedJson);
  console.log(`  \nnode decryptedJson:\n ${decryptedJson}, (${decryptedJson.length})`);
  console.log('  \nnode sign:\n ' + encryptor.getSignature(TOKEN, timeStamp, nonce, encryptedJson));
  ```

# Thanks To
- [Authors of crypto-js](https://github.com/brix/crypto-js)
- [Authors of eapp-corp-project](https://github.com/opendingtalk/eapp-corp-project)