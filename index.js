'use strict';

(function(root, factory, undef) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = exports = factory(require('./DingTalkEncryptor'));
  }
}(this, function(DingTalkEncryptor) {
  return DingTalkEncryptor;
}));

// 兼容
exports.DingTalkEncryptor = require("./DingTalkEncryptor");
// 导出异常
exports.DingTalkEncryptException = require('./DingTalkEncryptException');

// 导出工具函数
const Utils = require("./Utils");
exports.getRandomEncodingAesKey = Utils.getRandomEncodingAesKey;
exports.getRandomStr = Utils.getRandomStr;