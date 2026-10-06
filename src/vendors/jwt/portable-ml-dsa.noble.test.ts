import type * as jose from "jose"
import { afterEach, expect, it, vi } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { InvalidSignatureError } from "../../errors"
import { createMlDsaKeyPair, signMlDsaJwt, verifyMlDsaJwt } from "./portable-ml-dsa"

// Simulates a runtime whose WebCrypto has no ML-DSA, so every call takes the noble path.
const faults = vi.hoisted(() => ({ shortPublicKey: false, verifyThrows: false }))

vi.mock("jose", async (importOriginal) => {
    const actual = await importOriginal<typeof import("jose")>()
    return {
        ...actual,
        importJWK: vi.fn(async (jwk: jose.JWK, alg?: string) => {
            if (jwk.kty === "AKP") {
                throw new Error("ML-DSA is not supported by this runtime")
            }
            return actual.importJWK(jwk, alg)
        }),
    }
})

vi.mock("@noble/post-quantum/ml-dsa.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@noble/post-quantum/ml-dsa.js")>()
    const wrap = (suite: typeof actual.ml_dsa65) => ({
        ...suite,
        keygen: (seed?: Uint8Array) => {
            const keys = suite.keygen(seed)
            return faults.shortPublicKey ? { ...keys, publicKey: keys.publicKey.slice(1) } : keys
        },
        verify: (...args: Parameters<typeof suite.verify>) => {
            if (faults.verifyThrows) {
                throw new Error("verify failed")
            }
            return suite.verify(...args)
        },
    })
    return {
        ...actual,
        ml_dsa44: wrap(actual.ml_dsa44),
        ml_dsa65: wrap(actual.ml_dsa65),
        ml_dsa87: wrap(actual.ml_dsa87),
    }
})

afterEach(() => {
    faults.shortPublicKey = false
    faults.verifyThrows = false
})

const signNoble = async (alg: Algs.ML_DSA_44 | Algs.ML_DSA_65 | Algs.ML_DSA_87) => {
    const keyPair = await createMlDsaKeyPair(alg, "jwk")
    const token = await signMlDsaJwt({
        payload: { sub: alg },
        alg,
        privateKey: keyPair.privateKey,
        protectedHeaders: { kid: keyPair.kid },
    })
    return { ...keyPair, token }
}

it.each([Algs.ML_DSA_44, Algs.ML_DSA_65, Algs.ML_DSA_87] as const)(
    "signs and verifies %s with the portable implementation",
    async (alg) => {
        const { publicKey, kid, token } = await signNoble(alg)

        const result = await verifyMlDsaJwt({ token, publicKeys: [publicKey] })

        expect(result.payload.sub).toBe(alg)
        expect(result.protectedHeader).toEqual({ kid, alg })
    },
    60_000,
)

it("produces tokens that native jose verifies", async ({ skip }) => {
    const actual = await vi.importActual<typeof import("jose")>("jose")
    const { publicKey, token } = await signNoble(Algs.ML_DSA_65)

    const key = await actual
        .importJWK({ kty: "AKP", alg: Algs.ML_DSA_65, pub: publicKey.pub } as jose.JWK)
        .catch(() => null)
    if (!key) {
        skip()
        return
    }

    const { payload } = await actual.jwtVerify(token, key)
    expect(payload.sub).toBe(Algs.ML_DSA_65)
}, 60_000)

it("rejects a generated public key with the wrong length", async () => {
    faults.shortPublicKey = true

    await expect(createMlDsaKeyPair(Algs.ML_DSA_65, "jwk")).rejects.toThrow(
        "ML-DSA public key has the wrong length",
    )
}, 60_000)

it("treats a throwing verifier as an invalid signature", async () => {
    const { publicKey, token } = await signNoble(Algs.ML_DSA_65)
    faults.verifyThrows = true

    await expect(verifyMlDsaJwt({ token, publicKeys: [publicKey] })).rejects.toBeInstanceOf(
        InvalidSignatureError,
    )
}, 60_000)
