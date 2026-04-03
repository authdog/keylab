import { expect, it } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { getKeyPair, signJwtWithPrivateKey } from "./jwt-sign"
import { verifyPortableJwt } from "./portable-algorithms"

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
