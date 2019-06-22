'use strict';

(function(root, factory, undef) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = exports = factory(require('./DingTalkEncryptor'));
  }
}(this, function(DingTalkEncryptor) {
  return DingTalkEncryptor;
}));
