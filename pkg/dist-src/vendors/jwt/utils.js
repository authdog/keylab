export const strToUint8Array = str => {
  const buf = new Uint8Array(str.length);

  for (let i = 0; i < str.length; i++) {
    buf[i] = str.charCodeAt(i);
  }

  return buf;
};
export const uint8ArrayToStr = buf => String.fromCharCode.apply(null, buf);