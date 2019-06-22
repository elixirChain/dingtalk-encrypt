'use strict';

const int2Bytes = function(count) {
  const byteArr = [ (count >> 24 & 255), (count >> 16 & 255), (count >> 8 & 255), (count & 255) ];
  return byteArr;
};
const bytes2int = function(byteArr) {
  let count = 0;
  for (let i = 0; i < 4; ++i) {
    count <<= 8;
    count |= byteArr[i] & 255;
  }
  return count;
};

// https://stackoverflow.com/questions/3195865/converting-byte-array-to-string-in-javascript
const string2Bin = function(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i));
  }
  return result;
};
const bin2String = function(array) {
  return String.fromCharCode.apply(String, array);
};

const getRandomStr = function(size) {
  const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = size; i > 0; --i) {
    randomStr += base[Math.floor(Math.random() * base.length)];
  }
  return randomStr;
};

module.exports = {
  int2Bytes,
  bytes2int,
  string2Bin,
  bin2String,
  getRandomStr,
};