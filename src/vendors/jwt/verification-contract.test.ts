import { errors } from "jose"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import {
    AlgorithmMismatchError,
    InsufficientScopeError,
    InvalidSignatureError,
    JsonWebTokenError,
    MalformedTokenError,
    TokenExpiredError,
} from "../../errors"
import { clearJwksCache, verifyTokenWithPublicKey } from "../jwks/jwks"
import type { IJwkRecordVisible } from "../jwks/jwks-types"
import { createJwtHandler, createJwtMiddleware } from "../middleware/middleware"
import { getKeyPair, signJwtWithPrivateKey } from "./jwt-sign"
import { checkTokenValidness } from "./jwt-verify"

beforeEach(() => {
    clearJwksCache()
})

const now = () => Math.floor(Date.now() / 1000)

// One algorithm per verification path: jose, portable curves, and ML-DSA.
const ASYMMETRIC = [Algs.RS256, Algs.ES256K, Algs.Ed448, Algs.ML_DSA_65] as const

const keysFor = async (alg: (typeof ASYMMETRIC)[number]) => {
    const keyPair = await getKeyPair({ keyFormat: "jwk", algorithmIdentifier: alg, keySize: 2048 })
    const signingAlg = alg === Algs.Ed448 ? Algs.EdDSA : alg
    const sign = (payload: Record<string, unknown>) =>
        signJwtWithPrivateKey(payload, signingAlg, keyPair.privateKey)
    const adhoc = [keyPair.publicKey as unknown as IJwkRecordVisible] as [IJwkRecordVisible]
    return { keyPair, sign, adhoc }
}

describe.each(ASYMMETRIC)("%s verification contract", (alg) => {
    it("raises TokenExpiredError with expiredAt and the original cause", async () => {
        const { sign, adhoc } = await keysFor(alg)
        const exp = now() - 60
        const error = await checkTokenValidness(await sign({ exp }), { adhoc }).catch((e) => e)

        expect(error).toBeInstanceOf(TokenExpiredError)
        expect(error.expiredAt).toEqual(new Date(exp * 1000))
    }, 60_000)

    it("rejects tokens that are not yet valid", async () => {
        const { sign, adhoc } = await keysFor(alg)
        const token = await sign({ nbf: now() + 600 })

        await expect(checkTokenValidness(token, { adhoc })).rejects.toThrow(
            '"nbf" claim timestamp check failed',
        )
    }, 60_000)

    it("raises InvalidSignatureError for a key that did not sign the token", async () => {
        const { sign } = await keysFor(alg)
        const other = await keysFor(alg)

        await expect(
            checkTokenValidness(await sign({ exp: now() + 60 }), { adhoc: other.adhoc }),
        ).rejects.toBeInstanceOf(InvalidSignatureError)
    }, 60_000)

    it("enforces requiredScopes", async () => {
        const { sign, adhoc } = await keysFor(alg)
        const token = await sign({ exp: now() + 60, scp: "read" })

        const error = await checkTokenValidness(token, { adhoc, requiredScopes: ["admin"] }).catch(
            (e) => e,
        )
        expect(error).toBeInstanceOf(InsufficientScopeError)
        expect(error.code).toBe(403)
        expect(error.requiredScopes).toEqual(["admin"])

        await expect(
            checkTokenValidness(token, { adhoc, requiredScopes: ["read"] }),
        ).resolves.toBeTruthy()
    }, 60_000)

    it("enforces requiredIssuer and requiredAudiences", async () => {
        const { sign, adhoc } = await keysFor(alg)
        const token = await sign({ exp: now() + 60, iss: "issuer-a", aud: ["api"] })

        await expect(
            verifyTokenWithPublicKey(token, null, { adhoc, requiredIssuer: "issuer-b" }),
        ).rejects.toBeInstanceOf(JsonWebTokenError)
        await expect(
            verifyTokenWithPublicKey(token, null, { adhoc, requiredAudiences: ["other"] }),
        ).rejects.toBeInstanceOf(JsonWebTokenError)
        await expect(
            verifyTokenWithPublicKey(token, null, {
                adhoc,
                requiredIssuer: "issuer-a",
                requiredAudiences: ["api"],
            }),
        ).resolves.toBeTruthy()
    }, 60_000)
})

it("raises AlgorithmMismatchError when the supplied key declares another algorithm", async () => {
    const rsa = await keysFor(Algs.RS256)
    const token = await rsa.sign({ exp: now() + 60 })
    const adhoc = [{ ...(rsa.keyPair.publicKey as object), alg: Algs.RS512 }] as unknown as [
        IJwkRecordVisible,
    ]

    await expect(checkTokenValidness(token, { adhoc })).rejects.toBeInstanceOf(
        AlgorithmMismatchError,
    )
})

it("raises AlgorithmMismatchError for the key with the token's kid", async () => {
    const rsa = await keysFor(Algs.RS256)
    const token = await signJwtWithPrivateKey(
        { exp: now() + 60 },
        Algs.RS256,
        rsa.keyPair.privateKey,
        {},
        { keyId: rsa.keyPair.kid },
    )
    const other = await keysFor(Algs.RS256)
    const adhoc = [
        other.keyPair.publicKey,
        { ...(rsa.keyPair.publicKey as object), alg: Algs.PS256 },
    ] as unknown as [IJwkRecordVisible]

    await expect(checkTokenValidness(token, { adhoc })).rejects.toBeInstanceOf(
        AlgorithmMismatchError,
    )
})

it("rejects non-numeric exp on the portable path", async () => {
    const { sign, adhoc } = await keysFor(Algs.ES256K)

    await expect(checkTokenValidness(await sign({ exp: "soon" }), { adhoc })).rejects.toThrow(
        '"exp" claim must be a number',
    )
})

it("raises MalformedTokenError for structurally invalid tokens", async () => {
    await expect(checkTokenValidness("abc", { secret: "s" })).rejects.toBeInstanceOf(
        MalformedTokenError,
    )
    await expect(
        verifyTokenWithPublicKey("!!!.e30.c2ln", null, { adhoc: [] as any }),
    ).rejects.toBeInstanceOf(MalformedTokenError)

    const noAlg = `${btoa(JSON.stringify({ typ: "JWT" }))}.e30.c2ln`
    await expect(
        verifyTokenWithPublicKey(noAlg, null, { adhoc: [] as any }),
    ).rejects.toBeInstanceOf(MalformedTokenError)
})

it("keeps the jose error on cause", async () => {
    const { sign } = await keysFor(Algs.RS256)
    const other = await keysFor(Algs.RS256)
    const error = await checkTokenValidness(await sign({ exp: now() + 60 }), {
        adhoc: other.adhoc,
    }).catch((e) => e)

    expect(error.cause).toBeInstanceOf(errors.JWSSignatureVerificationFailed)
})

describe("HS256", () => {
    it("enforces requiredScopes and keeps resolving false for a wrong secret", async () => {
        const token = await signJwtWithPrivateKey(
            { exp: now() + 60, scope: "read write" },
            Algs.HS256,
            "secret",
        )

        await expect(
            checkTokenValidness(token, { secret: "secret", requiredScopes: ["admin"] }),
        ).rejects.toBeInstanceOf(InsufficientScopeError)
        await expect(
            checkTokenValidness(token, { secret: "secret", requiredScopes: ["read", "write"] }),
        ).resolves.toBe(true)
        await expect(
            checkTokenValidness(token, { secret: "wrong", requiredScopes: ["admin"] }),
        ).resolves.toBe(false)
    })
})

describe("middleware scope enforcement", () => {
    it("responds 403 when scopes are missing and 401 for other failures", async () => {
        const token = await signJwtWithPrivateKey(
            { exp: now() + 60, scp: ["read"] },
            Algs.HS256,
            "secret",
        )
        const middleware = createJwtMiddleware({ secret: "secret", requiredScopes: ["admin"] })
        const respond = () => {
            const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
            return res
        }

        const forbidden = respond()
        await middleware({ headers: { authorization: `Bearer ${token}` } }, forbidden, vi.fn())
        expect(forbidden.status).toHaveBeenCalledWith(403)

        const unauthorized = respond()
        await middleware({ headers: { authorization: "Bearer abc" } }, unauthorized, vi.fn())
        expect(unauthorized.status).toHaveBeenCalledWith(401)
    })

    it("reports InsufficientScopeError from the handler", async () => {
        const { sign, adhoc } = await keysFor(Algs.RS256)
        const token = await sign({ exp: now() + 60, scp: "read" })
        const handler = createJwtHandler({ adhoc, requiredScopes: ["admin"] })

        const result = await handler({ headers: { authorization: `Bearer ${token}` } })

        expect(result.success).toBe(false)
        expect(result.error).toBeInstanceOf(InsufficientScopeError)
    })
})

it("accepts Ed25519 keys labelled with the curve name for EdDSA tokens", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.Ed25519,
        keySize: 256,
    })
    const token = await signJwtWithPrivateKey({ exp: now() + 60 }, Algs.Ed25519, keyPair.privateKey)
    const adhoc = [{ ...(keyPair.publicKey as object), alg: Algs.Ed25519 }] as unknown as [
        IJwkRecordVisible,
    ]

    await expect(checkTokenValidness(token, { adhoc })).resolves.toBeTruthy()
})
