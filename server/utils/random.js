export function randomInt(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1));
}

export function randomStr(strLength) {
  let string = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;

  for (let i = 0; i < strLength; i += 1) {
    string += chars[randomInt(0, charsLength - 1)];
  }

  return string;
}
