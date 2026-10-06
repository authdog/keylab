import { expect, it } from "vitest"
import { MalformedTokenError } from "../../errors"
import {
    base64ToBytes,
    getRuntimeCrypto,
    normalizeCurveName,
    normalizeJwk,
    parseJwtParts,
    strToUint8Array,
    uint8ArrayToStr,
} from "./utils"

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

it("normalizes X25519 and X448 curve names", () => {
    expect(normalizeCurveName("x25519")).toBe("X25519")
    expect(normalizeCurveName("X25519")).toBe("X25519")
    expect(normalizeCurveName("x448")).toBe("X448")
    expect(normalizeCurveName("X448")).toBe("X448")
})

it("throws when web crypto is not available", () => {
    const originalCrypto = globalThis.crypto
    try {
        Object.defineProperty(globalThis, "crypto", { value: undefined, configurable: true })
        expect(() => getRuntimeCrypto()).toThrow("Web Crypto API is not available in this runtime.")
    } finally {
        Object.defineProperty(globalThis, "crypto", { value: originalCrypto, configurable: true })
    }
})

it("rejects base64 with characters outside the alphabet", () => {
    expect(() => base64ToBytes("!!!!")).toThrow("Invalid base64 string.")
    expect(() => base64ToBytes("ab=c")).toThrow("Invalid base64 string.")
    expect(Array.from(base64ToBytes("AQID"))).toEqual([1, 2, 3])
})

it("raises MalformedTokenError for undecodable token parts", () => {
    expect(() => parseJwtParts("a.b")).toThrow(MalformedTokenError)
    expect(() => parseJwtParts("e30.!!!!.c2ln")).toThrow(MalformedTokenError)
})
