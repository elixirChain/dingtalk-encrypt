'use strict';

class PKCS7Padding {
  constructor() {}

  static getPaddingBytes(count) {
    let amountToPad = 32 - count % 32;
    if (amountToPad === 0) {
      amountToPad = 32;
    }
    // const padChr = this.chr(amountToPad);
    const target = (amountToPad & 255);
    const padChr = String.fromCharCode(target);
    let tmp = '';
    for (let index = 0; index < amountToPad; ++index) {
      tmp = tmp + padChr;
    }

    return tmp;
  }

  static removePaddingBytes(decrypted) {
    let pad = decrypted.charCodeAt(decrypted.length - 1);
    if (pad < 1 || pad > 32) {
      pad = 0;
    }

    return decrypted.substring(0, decrypted.length - pad);
  }
}

module.exports = PKCS7Padding;
