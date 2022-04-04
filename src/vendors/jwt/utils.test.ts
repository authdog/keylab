import { strToUint8Array, uint8ArrayToStr } from "./utils";
it("test strToUint8Array conversion", async () => {
    const str = "hello world";
    const buf = strToUint8Array(str);
    expect(uint8ArrayToStr(buf)).toBe(str);
});
