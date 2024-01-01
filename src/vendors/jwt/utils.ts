export const strToUint8Array = (str: string) => {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
};

export const uint8ArrayToStr = (buf: Uint8Array) =>
    String.fromCharCode.apply(null, buf);

export const isNodeJs = () => {
    return (
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null
    );
}