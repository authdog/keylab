import type * as jose from "jose"
import { afterEach, expect, it, vi } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { createMlDsaKeyPair, signMlDsaJwt, verifyMlDsaJwt } from "./portable-ml-dsa"
import { parseJwtParts, utf8ToBase64Url } from "./utils"

// Simulates a runtime whose WebCrypto supports ML-DSA, so the jose path runs on any Node version.
const faults = vi.hoisted(() => ({ signThrows: false, verifyThrows: false }))
const JOSE_SIGNATURE = "jose-signature"

vi.mock("jose", async (importOriginal) => {
    const actual = await importOriginal<typeof import("jose")>()
    const fakeKey = (jwk: jose.JWK) => ({ fakeAkp: true, jwk })

    class FakeSignJWT {
        private header: jose.JWTHeaderParameters = { alg: "" }
        constructor(private readonly payload: jose.JWTPayload) {}
        setProtectedHeader(header: jose.JWTHeaderParameters) {
            this.header = header
            return this
        }
        async sign() {
            if (faults.signThrows && !this.payload.probe) {
                throw new Error("jose sign failed")
            }
            return `${utf8ToBase64Url(JSON.stringify(this.header))}.${utf8ToBase64Url(
                JSON.stringify(this.payload),
            )}.${JOSE_SIGNATURE}`
        }
    }

    return {
        ...actual,
        importJWK: vi.fn(async (jwk: jose.JWK, alg?: string) =>
            jwk.kty === "AKP" ? fakeKey(jwk) : actual.importJWK(jwk, alg),
        ),
        SignJWT: FakeSignJWT,
        jwtVerify: vi.fn(async (token: string) => {
            if (faults.verifyThrows) {
                throw new Error("jose verify failed")
            }
            const parts = parseJwtParts(token)
            return { payload: parts.payload, protectedHeader: parts.protectedHeader }
        }),
    }
})

afterEach(() => {
    faults.signThrows = false
    faults.verifyThrows = false
})

it("signs and verifies through jose when the runtime supports ML-DSA", async () => {
    const keyPair = await createMlDsaKeyPair(Algs.ML_DSA_65, "jwk")
    const token = await signMlDsaJwt({
        payload: { sub: "jose" },
        alg: Algs.ML_DSA_65,
        privateKey: keyPair.privateKey,
        protectedHeaders: { kid: keyPair.kid },
    })

    expect(token.endsWith(`.${JOSE_SIGNATURE}`)).toBe(true)

    const result = await verifyMlDsaJwt({ token, publicKeys: [keyPair.publicKey] })
    expect(result.payload.sub).toBe("jose")
    expect(result.protectedHeader).toMatchObject({ alg: Algs.ML_DSA_65, kid: keyPair.kid })
})

it("falls back to noble when jose rejects the key at sign and verify time", async () => {
    faults.signThrows = true
    const keyPair = await createMlDsaKeyPair(Algs.ML_DSA_44, "jwk")
    const token = await signMlDsaJwt({
        payload: { sub: "fallback" },
        alg: Algs.ML_DSA_44,
        privateKey: keyPair.privateKey,
        protectedHeaders: { kid: keyPair.kid },
    })

    expect(token.endsWith(`.${JOSE_SIGNATURE}`)).toBe(false)

    faults.verifyThrows = true
    const result = await verifyMlDsaJwt({ token, publicKeys: [keyPair.publicKey] })
    expect(result.payload.sub).toBe("fallback")
})
