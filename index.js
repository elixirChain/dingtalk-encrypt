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
exports.DingTalkEncryptor = require("./DingTalkEncryptor")
const Utils = require("./Utils");
exports.getRandomEncodingAesKey = Utils.getRandomEncodingAesKey;
exports.getRandomStr = Utils.getRandomStr;
