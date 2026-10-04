// @vitest-environment happy-dom

import { expect, it } from "vitest"
import {
    JwtAlgorithmsEnum as Algs,
    checkTokenValidness,
    getKeyPair,
    signJwtWithPrivateKey,
} from "../../index"
import type { IJwkRecordVisible } from "../jwks/jwks-types"

it("signs and verifies the getting-started JWK ES256 flow", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256,
        keySize: 2048,
    })

    const token = await signJwtWithPrivateKey(
        {
            sub: "user-123",
            iss: "https://issuer.example",
            aud: ["web-app"],
            scp: "profile:read",
        },
        Algs.ES256,
        keyPair.privateKey,
        { kid: keyPair.kid },
    )

    const verified = await checkTokenValidness(token, {
        adhoc: [keyPair.publicKey as unknown as IJwkRecordVisible],
    })

    expect(verified !== true && verified !== false && verified.payload.sub).toEqual("user-123")
})

it("signs and verifies a portable ES256K JWK without node:crypto", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256K,
        keySize: 256,
    })

    const token = await signJwtWithPrivateKey(
        { sub: "portable-user" },
        Algs.ES256K,
        keyPair.privateKey,
    )

    const verified = await checkTokenValidness(token, {
        adhoc: [keyPair.publicKey as unknown as IJwkRecordVisible],
    })

    expect(verified !== true && verified !== false && verified.payload.sub).toEqual("portable-user")
})

it("signs and verifies an ML-DSA-65 JWK without node:crypto", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ML_DSA_65,
        keySize: 256,
    })

    const token = await signJwtWithPrivateKey(
        { sub: "ml-dsa-user" },
        Algs.ML_DSA_65,
        keyPair.privateKey,
    )

    const verified = await checkTokenValidness(token, {
        adhoc: [keyPair.publicKey as unknown as IJwkRecordVisible],
    })

    expect(verified !== true && verified !== false && verified.payload.sub).toEqual("ml-dsa-user")
}, 60_000)
