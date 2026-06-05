import { expect, it } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { getKeyPair, signJwtWithPrivateKey } from "./jwt-sign"
import { needsPortableEdDsa, signPortableJwt, verifyPortableJwt } from "./portable-algorithms"

it("skips non-matching portable keys and verifies with the matching one", async () => {
    const wrongKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256K,
        keySize: 256,
    })
    const signingKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256K,
        keySize: 256,
    })

    const token = await signJwtWithPrivateKey(
        { urn: "urn:test:portable" },
        Algs.ES256K,
        signingKeyPair.privateKey,
        {
            kid: signingKeyPair.kid,
        },
    )

    const verified = await verifyPortableJwt({
        token,
        publicKeys: [wrongKeyPair.publicKey, signingKeyPair.publicKey],
    })

    expect(verified.payload.urn).toEqual("urn:test:portable")
})

it("ignores unresolvable string keys and verifies with the valid one", async () => {
    const signingKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256K,
        keySize: 256,
    })

    const token = await signJwtWithPrivateKey(
        { urn: "urn:test:ignore-bad-key" },
        Algs.ES256K,
        signingKeyPair.privateKey,
    )

    const verified = await verifyPortableJwt({
        token,
        publicKeys: ["not-a-pem-string", signingKeyPair.publicKey],
    })

    expect(verified.payload.urn).toEqual("urn:test:ignore-bad-key")
})

it("skips keys with wrong curve and verifies with the matching one", async () => {
    const signingKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256K,
        keySize: 256,
    })
    const wrongCurveKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.Ed448,
    })

    const token = await signJwtWithPrivateKey(
        { urn: "urn:test:wrong-curve" },
        Algs.ES256K,
        signingKeyPair.privateKey,
    )

    const verified = await verifyPortableJwt({
        token,
        publicKeys: [wrongCurveKeyPair.publicKey, signingKeyPair.publicKey],
    })

    expect(verified.payload.urn).toEqual("urn:test:wrong-curve")
})

it("throws invalid signature for portable keys that match headers but not signatures", async () => {
    const signingKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.Ed448,
        keySize: 456,
    })
    const wrongKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.Ed448,
        keySize: 456,
    })

    const token = await signJwtWithPrivateKey(
        { urn: "urn:test:portable-invalid" },
        Algs.EdDSA,
        signingKeyPair.privateKey,
        {
            kid: signingKeyPair.kid,
        },
    )

    await expect(
        verifyPortableJwt({
            token,
            publicKeys: [
                {
                    ...(wrongKeyPair.publicKey as any),
                    kid: signingKeyPair.kid,
                },
            ],
        }),
    ).rejects.toThrow("Invalid signature")
})

it("returns false/true from needsPortableEdDsa catch when key resolution fails", async () => {
    // "not-a-pem-string" causes resolvePortableJwk to throw → catch branch at line 273-274
    expect(await needsPortableEdDsa(Algs.EdDSA, "not-a-pem-string")).toBe(false)
    expect(await needsPortableEdDsa(Algs.Ed448, "not-a-pem-string")).toBe(true)
})

it("returns correct value from needsPortableEdDsa when no key is provided", async () => {
    expect(await needsPortableEdDsa(Algs.EdDSA, null)).toBe(false)
    expect(await needsPortableEdDsa(Algs.Ed448, null)).toBe(true)
    expect(await needsPortableEdDsa(Algs.Ed448, undefined)).toBe(true)
})

it("throws on malformed jwt token with fewer than 3 parts", async () => {
    const keyPair = await getKeyPair({ keyFormat: "jwk", algorithmIdentifier: Algs.ES256K })
    await expect(
        verifyPortableJwt({ token: "only.two", publicKeys: [keyPair.publicKey] }),
    ).rejects.toThrow("Malformed JWT.")
})

it("skips candidate key when kid in token header mismatches the key kid", async () => {
    const signingKeyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256K,
        keySize: 256,
    })

    const token = await signJwtWithPrivateKey(
        { urn: "urn:test:kid-mismatch" },
        Algs.ES256K,
        signingKeyPair.privateKey,
        {},
        { keyId: "signing-kid" },
    )

    await expect(
        verifyPortableJwt({
            token,
            publicKeys: [{ ...(signingKeyPair.publicKey as any), kid: "different-kid" }],
        }),
    ).rejects.toThrow("Invalid signature")
})

it("throws when signPortableJwt is called with a public key lacking the private component", async () => {
    const keyPair = await getKeyPair({ keyFormat: "jwk", algorithmIdentifier: Algs.ES256K })
    await expect(
        signPortableJwt({
            payload: { urn: "test" },
            alg: Algs.ES256K,
            privateKey: keyPair.publicKey,
            protectedHeaders: { alg: Algs.ES256K },
        }),
    ).rejects.toThrow("Unsupported portable private key")
})
