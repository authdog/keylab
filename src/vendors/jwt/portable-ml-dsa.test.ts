import { expect, it } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { AlgorithmMismatchError, InvalidSignatureError } from "../../errors"
import type { IJwkRecordVisible } from "../jwks/jwks-types"
import { getKeyPair, signJwtWithPrivateKey } from "./jwt-sign"
import { checkTokenValidness } from "./jwt-verify"
import { createMlDsaKeyPair, signMlDsaJwt, verifyMlDsaJwt } from "./portable-ml-dsa"
import { base64UrlToBytes, bytesToBase64Url, utf8ToBase64Url } from "./utils"

const signAndVerify = async (alg: Algs) => {
    const keyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: alg,
        keySize: 256,
    })
    const token = await signJwtWithPrivateKey({ sub: alg }, alg, keyPair.privateKey)
    const verified = await checkTokenValidness(token, {
        adhoc: [keyPair.publicKey as unknown as IJwkRecordVisible],
    })

    expect(verified !== true && verified !== false && verified.payload.sub).toEqual(alg)
    return { keyPair, token }
}

it("signs and verifies ML-DSA-65 with a 32-byte seed and no private material on the public key", async () => {
    const { keyPair, token } = await signAndVerify(Algs.ML_DSA_65)
    const publicKey = keyPair.publicKey as {
        pub?: string
        priv?: string
        kty?: string
        alg?: string
    }
    const privateKey = keyPair.privateKey as { priv?: string }

    expect(publicKey.kty).toBe("AKP")
    expect(publicKey.alg).toBe(Algs.ML_DSA_65)
    expect(publicKey.priv).toBeUndefined()
    expect(base64UrlToBytes(privateKey.priv || "").length).toBe(32)

    const headerPart = token.split(".")[0]
    const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(headerPart)))
    expect(header.alg).toBe(Algs.ML_DSA_65)

    const parts = token.split(".")
    const signature = base64UrlToBytes(parts[2])
    signature[0] ^= 0xff
    parts[2] = bytesToBase64Url(signature)

    await expect(
        checkTokenValidness(parts.join("."), {
            adhoc: [keyPair.publicKey as unknown as IJwkRecordVisible],
        }),
    ).rejects.toThrow("Invalid signature")
}, 60_000)

it("rejects ML-DSA PEM key generation and signing without a private seed", async () => {
    await expect(
        getKeyPair({
            keyFormat: "pem",
            algorithmIdentifier: Algs.ML_DSA_65,
            keySize: 256,
        }),
    ).rejects.toThrow("ML-DSA requires a JWK key. PEM is not supported.")

    const keyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ML_DSA_65,
        keySize: 256,
    })
    const privateKey = keyPair.privateKey as { priv?: string; pub?: string }

    await expect(
        signJwtWithPrivateKey({ sub: "public-only" }, Algs.ML_DSA_65, keyPair.publicKey),
    ).rejects.toThrow("ML-DSA signing requires a private JWK.")

    const shortened = {
        ...(keyPair.privateKey as object),
        priv: bytesToBase64Url(new Uint8Array(16)),
    }
    await expect(
        signJwtWithPrivateKey({ sub: "short-seed" }, Algs.ML_DSA_65, shortened),
    ).rejects.toThrow("ML-DSA private key must be a 32-byte seed")

    expect(privateKey.priv).toBeTruthy()
}, 60_000)

it("signs and verifies ML-DSA-44 and ML-DSA-87 and rejects a different parameter set", async () => {
    await signAndVerify(Algs.ML_DSA_44)
    const signed = await signAndVerify(Algs.ML_DSA_87)
    const other = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ML_DSA_65,
        keySize: 256,
    })

    await expect(
        checkTokenValidness(signed.token, {
            adhoc: [other.publicKey as unknown as IJwkRecordVisible],
        }),
    ).rejects.toBeInstanceOf(AlgorithmMismatchError)
}, 60_000)

const mlDsa65 = async () => {
    const keyPair = await createMlDsaKeyPair(Algs.ML_DSA_65, "jwk")
    const token = await signMlDsaJwt({
        payload: { sub: "edge" },
        alg: Algs.ML_DSA_65,
        privateKey: keyPair.privateKey,
        protectedHeaders: { kid: keyPair.kid },
    })
    return { ...keyPair, token }
}

it("rejects PEM private keys and keys for another parameter set when signing", async () => {
    const { privateKey } = await createMlDsaKeyPair(Algs.ML_DSA_44, "jwk")
    const sign = (key: unknown) =>
        signMlDsaJwt({ payload: {}, alg: Algs.ML_DSA_65, privateKey: key, protectedHeaders: {} })

    await expect(sign("-----BEGIN PRIVATE KEY-----")).rejects.toThrow(
        "ML-DSA requires a JWK key. PEM is not supported.",
    )
    await expect(sign(privateKey)).rejects.toThrow(
        "ML-DSA key algorithm does not match the requested algorithm",
    )
}, 60_000)

it("rejects malformed tokens and non ML-DSA headers", async () => {
    await expect(verifyMlDsaJwt({ token: "a.b", publicKeys: [] })).rejects.toThrow("Malformed JWT.")

    const hsHeader = utf8ToBase64Url(JSON.stringify({ alg: "HS256" }))
    await expect(
        verifyMlDsaJwt({ token: `${hsHeader}.${utf8ToBase64Url("{}")}.c2ln`, publicKeys: [] }),
    ).rejects.toBeInstanceOf(InvalidSignatureError)
})

it("skips unusable candidates and keys with a different kid", async () => {
    const { publicKey, kid, token } = await mlDsa65()

    const result = await verifyMlDsaJwt({
        token,
        publicKeys: [
            null,
            { kty: "RSA", alg: Algs.ML_DSA_65 },
            { ...publicKey, alg: Algs.ML_DSA_44 },
            { ...publicKey, kid: "other-kid" },
            publicKey,
        ],
    })

    expect(result.payload.sub).toBe("edge")
    expect(result.protectedHeader.kid).toBe(kid)
}, 60_000)

it("rejects public keys with missing, invalid, or wrongly sized material", async () => {
    const { publicKey, token } = await mlDsa65()
    const verifyWith = (pub: string | undefined) =>
        verifyMlDsaJwt({ token, publicKeys: [{ ...publicKey, pub }] })

    await expect(verifyWith(undefined)).rejects.toBeInstanceOf(InvalidSignatureError)
    await expect(verifyWith("a b")).rejects.toBeInstanceOf(InvalidSignatureError)
    await expect(verifyWith(bytesToBase64Url(new Uint8Array(16)))).rejects.toBeInstanceOf(
        InvalidSignatureError,
    )
}, 60_000)

it("rejects signatures with the wrong length", async () => {
    const { publicKey, token } = await mlDsa65()
    const [header, payload, signature] = token.split(".")
    const truncated = bytesToBase64Url(base64UrlToBytes(signature).slice(0, 100))

    await expect(
        verifyMlDsaJwt({ token: `${header}.${payload}.${truncated}`, publicKeys: [publicKey] }),
    ).rejects.toBeInstanceOf(InvalidSignatureError)
}, 60_000)
