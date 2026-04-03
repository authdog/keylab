import { expect, it } from "vitest"
import { base64ToBytes, normalizeJwk, strToUint8Array, uint8ArrayToStr } from "./utils"

it("test strToUint8Array conversion", async () => {
    const str = "hello world"
    const buf = strToUint8Array(str)
    expect(uint8ArrayToStr(buf)).toBe(str)
})

it("throws on invalid base64 input", () => {
    expect(() => base64ToBytes("abc")).toThrow("Invalid base64 string.")
})

it("returns non-object jwk values unchanged", () => {
    expect(normalizeJwk(null)).toBeNull()
    expect(normalizeJwk("raw-jwk")).toBe("raw-jwk")
})
