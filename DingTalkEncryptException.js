'use strict';

class DingTalkEncryptException {
  constructor(code) {
    // super();
    this.msgMap = new Map([
      [ 0, '成功' ],
      [ 900001, '加密明文文本非法' ],
      [ 900002, '加密时间戳参数非法' ],
      [ 900003, '加密随机字符串参数非法' ],
      [ 900005, '签名不匹配' ],
      [ 900006, '签名计算失败' ],
      [ 900004, '不合法的 encodingAesKey' ],
      [ 900007, '计算加密文字错误' ],
      [ 900008, '计算解密文字错误' ],
      [ 900009, '计算解密文字长度不匹配' ],
      [ 900010, '计算解密文字corpid不匹配' ],
    ]);
    this.code = code;
    this.message = this.msgMap.get(code);
  }

  toString(){
    return `DingTalkEncryptException: [${this.code}], ${this.message}\n`;
  }
}

module.exports = DingTalkEncryptException;
