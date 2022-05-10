'use strict';

const int2Bytes = function(count) {
  const byteArr = [ (count >> 24 & 255), (count >> 16 & 255), (count >> 8 & 255), (count & 255) ];
  // console.log(`debug int2Bytes: ${count} -> ${byteArr}`);
  return byteArr;
};
const bytes2int = function(byteArr) {
  let count = 0;
  for (let i = 0; i < 4; ++i) {
    count <<= 8;
    count |= byteArr[i] & 255;
  }
  // console.log(`debug bytes2int: ${byteArr} -> ${count}`);
  return count;
};

// https://stackoverflow.com/questions/3195865/converting-byte-array-to-string-in-javascript
const string2Bin = function(str) {
  const binaryArr = [];
  for (let i = 0; i < str.length; i++) {
    binaryArr.push(str.charCodeAt(i));
  }
  // console.log(`debug string2Bin: ${str} -> ${binaryArr}`);
  return binaryArr;
};
const bin2String = function(array) {
  const str = String.fromCharCode.apply(String, array);
  // console.log(`debug bin2String: ${array} -> ${str}`);
  return str;
};

/**
 * get random string
 * @param {number} size 
 * @return {string} random string
 */
const getRandomStr = function(size) {
  const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = size; i > 0; --i) {
    randomStr += base[Math.floor(Math.random() * base.length)];
  }
  return randomStr;
};

/**
 * random encoding aes key
 * @return {string} EncodingAesKey
 */
const getRandomEncodingAesKey = () => Buffer.from(getRandomStr(32)).toString('base64').substring(0, 43);

module.exports = {
  int2Bytes,
  bytes2int,
  string2Bin,
  bin2String,
  getRandomStr,
  getRandomEncodingAesKey,
};
