# dingtalk-encrypt

Node.js 版钉钉回调事件消息体加解密工具库。

参考 [Java 版本](https://github.com/opendingtalk/eapp-corp-project.git)。

---

## 快速开始

### 源码使用

```bash
git clone <repo>
cd dingtalk-encrypt
npm install
node EncryptTest.js   # 查看主要 API 和 Utils 用法
```

### 作为 npm 模块使用

```bash
npm install --save dingtalk-encrypt
```

API 用法见下方 [API 文档](#api-文档)。

---

## API 文档

### 常量说明

| 常量 | 说明 |
|------|------|
| **TOKEN** | 签名用随机串，不受格式限制，例如 `"123456"` |
| **ENCODING_AES_KEY** | 回调数据加密密钥，固定 43 位字符，从 `[a-z, A-Z, 0-9]` 中随机生成 |
| **KEY** | 钉钉 `suiteKey` / `customKey` / `Corpid`，见[官方文档](https://open.dingtalk.com/document/development/callback-event-message-body-encryption-and-decryption) |

**KEY 填写规则：**

| 应用类型 | KEY 填写内容 |
|----------|--------------|
| 企业内部应用 | Corpid |
| 企业定制应用 | customKey |
| 第三方企业应用 | suiteKey |

### 主要 API（`DingTalkEncryptor`）

| 方法 | 说明 |
|------|------|
| `getEncryptedMap(plaintext, timestamp, nonce)` | 获取加密响应对象（回调函数用） |
| `getDecryptMsg(msgSignature, timestamp, nonce, encryptMsg)` | 解密回调数据（含签名校验） |
| `getSignature(token, timestamp, nonce, encrypt)` | 计算签名 |
| `encrypt(random, plainText)` | 加密 |
| `decrypt(encrypted)` | 解密 |

### 工具函数（`dingtalk-encrypt/Utils`）

| 函数 | 说明 |
|------|------|
| `getRandomStr(size)` | 生成指定长度的随机字符串 |
| `getRandomEncodingAesKey()` | 生成 43 位随机 `ENCODING_AES_KEY` |

---

## 使用示例

### 处理钉钉回调

> 参考：钉钉开发文档 — 业务事件回调

```js
const DingTalkEncryptor = require('dingtalk-encrypt');
const utils = require('dingtalk-encrypt/Utils');

/** 加解密需要，可以随机填写。如 "12345" */
const TOKEN = utils.getRandomStr(6);

/** 加密密钥，用于回调数据的加密，固定为43个字符，
 *  从 [a-z, A-Z, 0-9] 共62个字符中随机生成，见 getRandomEncodingAesKey */
const ENCODING_AES_KEY = utils.getRandomEncodingAesKey();
console.log('ENCODING_AES_KEY: \n', ENCODING_AES_KEY);

/** KEY 第三方企业应用为 suiteKey，企业定制应用为 customKey，
 *  企业内部应用为 Corpid，可以在钉钉企业管理后台查看（https://oa.dingtalk.com/） */
const KEY = 'ding1234567890';

/** 实例化加密类 */
console.log('\nEncryptor Test:');
const encryptor = new DingTalkEncryptor(TOKEN, ENCODING_AES_KEY, KEY);

// 解密钉钉回调数据
const plainText = encryptor.getDecryptMsg(signature, timestamp, nonce, encryptMsg);
console.log('DEBUG plainText: ' + plainText);

const obj = JSON.parse(plainText);
// 回调事件类型，根据事件类型和业务数据处理相应业务
const eventType = obj.EventType;

// 响应数据：加密 'success'，签名等等
encryptor.getEncryptedMap('success', timestamp, utils.getRandomStr(8));
```

### 单独使用加/解密

```js
/** 测试加解密响应报文或者字符串 */
const testJson = {
  EventType: 'bpms_instance_change',
  processInstanceId: 'ad253df6-e175caf-68085c60ba8a',
  key: 'ding2c4d8175651',
  createTime: 1495592259000,
  title: '自测-1016',
  type: 'start',
  staffId: 'er5875',
  url: 'https://aflow.dingtalk.com/dingtalk/mobile/homepage.htm',
  processCode: 'xxx',
};

const unencryptedJson = JSON.stringify(testJson);
console.log(`  node unencryptedJson:\n ${unencryptedJson}`);

const encryptedJson = encryptor.encrypt(ENCRYPT_RANDOM_16, unencryptedJson);
console.log(`  \nnode encryptedJson:\n ${encryptedJson}`);

const decryptedJson = encryptor.decrypt(encryptedJson);
console.log(`  \nnode decryptedJson:\n ${decryptedJson}, (${decryptedJson.length})`);

console.log('  \nnode sign:\n ' + encryptor.getSignature(TOKEN, timeStamp, nonce, encryptedJson));
```

---

## 致谢

- [Authors of eapp-corp-project](https://github.com/opendingtalk/eapp-corp-project)
