/* eslint-env browser */

import scryptAsync from 'scrypt-async';


export function generateSalt() {
  let result = '';
  let z;
  const intArray = new Uint32Array(2);
  window.crypto.getRandomValues(intArray);

  for (let i = 0; i < intArray.length; i += 1) {
    let str = intArray[i].toString(16);
    z = (8 - str.length) + 1;
    str = Array(z).join('0') + str;
    result += str;
  }

  return result;
}

export function scrypt(pwd, salt, cb) {
  const options = {
    N: 16384, r: 8, dkLen: 64, encoding: 'hex'
  };
  return scryptAsync(pwd, salt, options, cb);
}
