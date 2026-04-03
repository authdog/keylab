import { getKeyPair, signJwtWithPrivateKey } from "./jwt-sign"
import { parseJwt } from "./jwt-verify"
import * as c from "../../constants"
import { JwtAlgorithmsEnum as Algs, JwtParts } from "../../enums"
import { strToUint8Array, uint8ArrayToStr } from "./utils"
import { generateKeyPair, randomBytes } from "crypto"
import { IKeyPair } from "./interfaces"
import { afterEach, expect, it, vi } from "vitest"

const isBunRuntime = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined"

afterEach(() => {
    vi.resetModules()
    vi.unmock("jose")
})

it("jwt sign with payload fields - HS256", async () => {
    const payload = {
        sub: "12345",
        aud: [c.AUTHDOG_ID_ISSUER],
    }
    const token = await signJwtWithPrivateKey(payload, Algs.HS256, "secret", undefined, {
        keyId: "some-key",
    })
    expect(token).toBeTruthy()
    const { alg, kid } = parseJwt(token, JwtParts?.HEADER)
    expect(alg).toEqual(Algs.HS256)
    expect(kid).toEqual("some-key")
})

it("jwt sign with payload fields - HS384", async () => {
    const payload = {
        sub: "12345",
        aud: [c.AUTHDOG_ID_ISSUER],
    }
    const token = await signJwtWithPrivateKey(payload, Algs.HS384, "secret")
    expect(token).toBeTruthy()
    const { alg } = parseJwt(token, JwtParts?.HEADER)
    expect(alg).toEqual(Algs.HS384)
})

it("jwt sign with payload fields - HS512", async () => {
    const payload = {
        sub: "12345",
        aud: [c.AUTHDOG_ID_ISSUER],
    }
    const token = await signJwtWithPrivateKey(payload, Algs.HS512, "secret")
    expect(token).toBeTruthy()
    const { alg } = parseJwt(token, JwtParts?.HEADER)
    expect(alg).toEqual(Algs.HS512)
})

it("jwt sign with payload fields - RS256", async () => {
    // RS256
    const keyPairRS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS256,
        keySize: 4096,
    })

    const signedPayloadRs256 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(" "),
        },
        Algs.RS256,
        keyPairRS256.privateKey,
    )

    const { iss, aud, sub, aid } = parseJwt(signedPayloadRs256)

    expect(iss).toEqual("issuer:12345")
    expect(aud).toEqual(["aud:12345"])
    expect(sub).toEqual("sub:12345")
    expect(aid).toEqual("12345")
})

it("jwt sign with payload fields - RS384", async () => {
    const keyPairRS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS384,
        keySize: 4096,
    })

    const signedPayloadRs384 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(" "),
        },
        Algs.RS384,
        keyPairRS384.privateKey,
    )

    const { iss, aud, sub, aid } = parseJwt(signedPayloadRs384)

    expect(iss).toEqual("issuer:12345")
    expect(aud).toEqual(["aud:12345"])
    expect(sub).toEqual("sub:12345")
    expect(aid).toEqual("12345")
})

it("jwt sign with payload fields - RS512", async () => {
    const keyPairRS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS512,
        keySize: 4096,
    })

    const signedPayloadRs512 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(" "),
        },
        Algs.RS512,
        keyPairRS512.privateKey,
    )

    const { iss, aud, sub, aid } = parseJwt(signedPayloadRs512)

    expect(iss).toEqual("issuer:12345")
    expect(aud).toEqual(["aud:12345"])
    expect(sub).toEqual("sub:12345")
    expect(aid).toEqual("12345")
})

it("jwt sign with payload fields - ES256", async () => {
    // ES256
    const keyPairES256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES256,
        keySize: 4096,
    })

    const signedPayloadEs256 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(" "),
        },
        Algs.ES256,
        keyPairES256.privateKey,
    )

    const { iss, aud, sub, aid } = parseJwt(signedPayloadEs256)

    expect(iss).toEqual("issuer:12345")
    expect(aud).toEqual(["aud:12345"])
    expect(sub).toEqual("sub:12345")
    expect(aid).toEqual("12345")
})

it("jwt sign with payload fields - EDDSA", async () => {
    // EDDSA
    const keyPairEDDSA = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.EdDSA,
        keySize: 256,
    })

    const signedPayloadEdDSA = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(" "),
        },
        Algs.EdDSA,
        keyPairEDDSA.privateKey,
    )

    const { iss, aud, sub, aid } = parseJwt(signedPayloadEdDSA)

    expect(iss).toEqual("issuer:12345")
    expect(aud).toEqual(["aud:12345"])
    expect(sub).toEqual("sub:12345")
    expect(aid).toEqual("12345")
})

it("it converts string to uint8 and vice versa", async () => {
    const superSecret = "Lapsus$"
    const buffer: Uint8Array = strToUint8Array(superSecret)
    const debufferedString: string = uint8ArrayToStr(buffer)
    expect(debufferedString).toEqual(superSecret)
})

it("generate promisified key pair - rsa", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS256,
        keySize: 4096,
    })
    expect(keyPair?.publicKey).toBeTruthy()
    expect(keyPair?.privateKey).toBeTruthy()

    const keyPairRsa384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS384,
        keySize: 4096,
    })

    expect(keyPairRsa384?.publicKey).toBeTruthy()
    expect(keyPairRsa384?.privateKey).toBeTruthy()

    const keyPairRsa512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS512,
        keySize: 4096,
    })

    expect(keyPairRsa512?.publicKey).toBeTruthy()
    expect(keyPairRsa512?.privateKey).toBeTruthy()
})

it("generate promisified key pair - ec", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES256,
        keySize: 4096,
    })
    expect(keyPair?.publicKey).toBeTruthy()
    expect(keyPair?.privateKey).toBeTruthy()

    const keyPairEs384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES384,
        keySize: 4096,
    })

    expect(keyPairEs384?.publicKey).toBeTruthy()
    expect(keyPairEs384?.privateKey).toBeTruthy()

    const keyPairEs512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES512,
        keySize: 4096,
    })

    expect(keyPairEs512?.publicKey).toBeTruthy()
    expect(keyPairEs512?.privateKey).toBeTruthy()
})

it("signs payload with pkcs8 private key", async () => {
    // RS256
    const keyPairRS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS256,
        keySize: 4096,
    })

    const signedPayloadRs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.RS256,
        keyPairRS256.privateKey,
    )

    expect(signedPayloadRs256).toBeTruthy()

    // RS384
    const keyPairRS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS384,
        keySize: 4096,
    })

    const signedPayloadRs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs?.RS384,
        keyPairRS384.privateKey,
    )

    expect(signedPayloadRs384).toBeTruthy()

    // RS512
    const keyPairRS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS512,
        keySize: 4096,
    })

    const signedPayloadRs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.RS512,
        keyPairRS512.privateKey,
    )

    expect(signedPayloadRs512).toBeTruthy()

    // ES256
    const keyPairES256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES256,
        keySize: 4096,
    })

    const signedPayloadEs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.ES256,
        keyPairES256.privateKey,
    )

    expect(signedPayloadEs256).toBeTruthy()

    // ES384
    const keyPairES384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES384,
        keySize: 4096,
    })

    const signedPayloadEs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.ES384,
        keyPairES384.privateKey,
    )

    expect(signedPayloadEs384).toBeTruthy()

    // ES512
    const keyPairES512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES512,
        keySize: 4096,
    })

    const signedPayloadEs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.ES512,
        keyPairES512.privateKey,
    )

    expect(signedPayloadEs512).toBeTruthy()
})

it("signs payload with pkcs8 private key - RSA-PSS", async () => {
    // PS256
    const keyPairPS256 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs?.RSAPSS,
        keySize: 4096,
    })

    const signedPayloadPs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.PS256,
        keyPairPS256.privateKey,
    )

    expect(signedPayloadPs256).toBeTruthy()

    // PS384
    const keyPairPS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RSAPSS,
        keySize: 4096,
    })

    const signedPayloadPs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.PS384,
        keyPairPS384.privateKey,
    )

    expect(signedPayloadPs384).toBeTruthy()

    // PS512

    const keyPairPS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RSAPSS,
        keySize: 4096,
    })

    const signedPayloadPs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.PS512,
        keyPairPS512.privateKey,
    )

    expect(signedPayloadPs512).toBeTruthy()
})

it("signs payload with pkcs8 private key - EdDSA", async () => {
    const keyPairEddsa = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.EdDSA,
        keySize: 4096,
    })

    expect(keyPairEddsa?.privateKey).toBeTruthy()

    const signedPayloadEddsa = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.EdDSA,
        keyPairEddsa.privateKey,
    )

    expect(signedPayloadEddsa).toBeTruthy()
})

it("signs payload with pkcs8 private key - Ed25519", async () => {
    const { privateKey, publicKey } = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.Ed25519,
        keySize: 4096,
    })

    expect(privateKey).toBeTruthy()
    expect(publicKey).toBeTruthy()

    const signedPayloadEd25519 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.EdDSA,
        privateKey,
    )

    expect(signedPayloadEd25519).toBeTruthy()
})

it("signs payload with jwk private key - Ed25519 alias", async () => {
    const keyPairEd25519 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.Ed25519,
        keySize: 256,
    })

    const signedPayloadEd25519 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.Ed25519,
        keyPairEd25519.privateKey,
    )

    const { alg } = parseJwt(signedPayloadEd25519, JwtParts.HEADER)
    expect(alg).toEqual(Algs.EdDSA)
})

it("signs payload with pkcs8 private key - Ed448", async () => {
    const keyPairEd448 = await getKeyPair({
        keyFormat: isBunRuntime ? "jwk" : "pem",
        algorithmIdentifier: Algs.Ed448,
        keySize: 4096,
    })

    expect(keyPairEd448?.privateKey).toBeTruthy()

    const signedPayloadEd448 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.EdDSA,
        keyPairEd448.privateKey,
    )

    expect(signedPayloadEd448).toBeTruthy()
})

it("signs payload with pkcs8 private key - ES256k", async () => {
    const keyPairES256k = await getKeyPair({
        keyFormat: isBunRuntime ? "jwk" : "pem",
        algorithmIdentifier: Algs.ES256K,
        keySize: 4096,
    })

    expect(keyPairES256k?.privateKey).toBeTruthy()
    const signedPayloadEs256k = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test",
        },
        Algs.ES256K,
        keyPairES256k.privateKey,
        {
            kid: keyPairES256k?.kid,
        },
    )
    expect(signedPayloadEs256k).toBeTruthy()
})

it("throws when a non-HS string key is not valid PKCS8", async () => {
    await expect(
        signJwtWithPrivateKey(
            { urn: "urn:test:test" },
            Algs.RS256,
            "definitely-not-a-private-key",
        ),
    ).rejects.toBeTruthy()
})

it("generates key pairs for all supported algorithms", async () => {
    const testAlgs = async (algs: Algs[], options: any = {}) => {
        for (const alg of algs) {
            const keyPair = await getKeyPair({
                algorithmIdentifier: alg,
                keySize: options.keySize || 2048,
                keyFormat: options.keyFormat || "jwk",
            })
            expect(keyPair?.privateKey).toBeTruthy()
            if (options.expectPublic !== false) {
                expect(keyPair?.publicKey).toBeTruthy()
            }
        }
    }

    // RSA-OAEP variants
    await testAlgs(
        [Algs.RSA_OAEP, Algs.RSA_OAEP_256, Algs.RSA_OAEP_384, Algs.RSA_OAEP_512, Algs.RSA1_5],
        { keySize: 2048 },
    )

    // ECDH-ES variants
    await testAlgs([Algs.ECDH_ES, Algs.ECDH_ES_A128KW, Algs.ECDH_ES_A192KW, Algs.ECDH_ES_A256KW], {
        keySize: 256,
    })

    // OKP variants
    await testAlgs([Algs.X25519, Algs.X448], { keySize: 256 })

    // Symmetric/OCTET variants (KW, GCMKW, DIR, PBES2)
    await testAlgs(
        [
            Algs.A128KW,
            Algs.A192KW,
            Algs.A256KW,
            Algs.DIR,
            Algs.A128GCMKW,
            Algs.A192GCMKW,
            Algs.A256GCMKW,
            Algs.PBES2_HS256_A128KW,
            Algs.PBES2_HS384_A192KW,
            Algs.PBES2_HS512_A256KW,
        ],
        { keySize: 256, expectPublic: false },
    )
})

it("generates symmetric keys with default sizes and metadata", async () => {
    const hs512Pem = await getKeyPair({
        algorithmIdentifier: Algs.HS512,
        keyFormat: "pem",
    } as any)
    expect(hs512Pem.privateKey).toEqual(hs512Pem.publicKey)
    expect(hs512Pem.privateKey).toHaveLength(128)

    const a128KwJwk = await getKeyPair({
        algorithmIdentifier: Algs.A128KW,
        keyFormat: "jwk",
    } as any)
    expect(a128KwJwk.privateKey).toMatchObject({
        kty: "oct",
        use: "enc",
        alg: Algs.A128KW,
    })

    const a192KwJwk = await getKeyPair({
        algorithmIdentifier: Algs.A192KW,
        keyFormat: "jwk",
    } as any)
    expect(a192KwJwk.privateKey).toMatchObject({
        kty: "oct",
        use: "enc",
        alg: Algs.A192KW,
    })

    const a256KwJwk = await getKeyPair({
        algorithmIdentifier: Algs.A256KW,
        keyFormat: "jwk",
    } as any)
    expect(a256KwJwk.privateKey).toMatchObject({
        kty: "oct",
        use: "enc",
        alg: Algs.A256KW,
    })

    const dirPem = await getKeyPair({
        algorithmIdentifier: Algs.DIR,
        keyFormat: "pem",
    } as any)
    expect(dirPem.privateKey).toEqual(dirPem.publicKey)
    expect(dirPem.privateKey).toHaveLength(64)
})

it("throws on unsupported key generation algorithm", async () => {
    await expect(
        getKeyPair({
            algorithmIdentifier: "unsupported" as any,
            keyFormat: "jwk",
        } as any),
    ).rejects.toThrow("Unsupported algorithm unsupported")
})

it("falls back to node crypto when jose key generation fails", async () => {
    vi.doMock("jose", async () => {
        const actual = await vi.importActual<typeof import("jose")>("jose")
        return {
            ...actual,
            generateKeyPair: vi.fn(async () => {
                throw new Error("mock jose failure")
            }),
        }
    })

    const { getKeyPair: getKeyPairWithFallback } = await import("./jwt-sign")

    const rsaKeyPair = await getKeyPairWithFallback({
        algorithmIdentifier: Algs.RS256,
        keyFormat: "pem",
        keySize: 2048,
    })
    expect(rsaKeyPair.privateKey).toContain("PRIVATE KEY")

    const es256KeyPair = await getKeyPairWithFallback({
        algorithmIdentifier: Algs.ES256,
        keyFormat: "jwk",
        keySize: 256,
    })
    expect(es256KeyPair.publicKey).toMatchObject({
        kty: "EC",
        crv: "P-256",
    })

    const es384KeyPair = await getKeyPairWithFallback({
        algorithmIdentifier: Algs.ES384,
        keyFormat: "jwk",
        keySize: 384,
    })
    expect(es384KeyPair.publicKey).toMatchObject({
        kty: "EC",
        crv: "P-384",
    })

    const es512KeyPair = await getKeyPairWithFallback({
        algorithmIdentifier: Algs.ES512,
        keyFormat: "jwk",
        keySize: 521,
    })
    expect(es512KeyPair.publicKey).toMatchObject({
        kty: "EC",
        crv: "P-521",
    })

    const ecdhKeyPair = await getKeyPairWithFallback({
        algorithmIdentifier: Algs.ECDH_ES,
        keyFormat: "jwk",
        keySize: 256,
    })
    expect(ecdhKeyPair.publicKey).toMatchObject({
        kty: "EC",
        crv: "P-256",
    })

    const ed25519KeyPair = await getKeyPairWithFallback({
        algorithmIdentifier: Algs.Ed25519,
        keyFormat: "jwk",
        keySize: 256,
    })
    expect(ed25519KeyPair.publicKey).toMatchObject({
        kty: "OKP",
        crv: "Ed25519",
        alg: Algs.EdDSA,
        use: "sig",
    })

    const x25519KeyPair = await getKeyPairWithFallback({
        algorithmIdentifier: Algs.X25519,
        keyFormat: "jwk",
        keySize: 256,
    })
    expect(x25519KeyPair.publicKey).toMatchObject({
        kty: "OKP",
        crv: "X25519",
        alg: Algs.X25519,
        use: "enc",
    })
})

it("experiment algorithm", async () => {
    const generateKey = async ({
        alg,
        fallbackAlg,
    }: {
        alg: string
        fallbackAlg: Algs
    }): Promise<IKeyPair> => {
        return new Promise((resolve: Function, reject: Function) => {
            generateKeyPair(
                alg as any,
                {
                    publicKeyEncoding: {
                        ...c.publicKeyEncodingPem,
                    },
                    privateKeyEncoding: {
                        ...c.privateKeyEncodingPem,
                    },
                },
                (err, publicKey, privateKey) => {
                    if (err) return reject(err)

                    // TODO: define kid length in constants
                    const kid = randomBytes(16).toString("hex")

                    resolve({ publicKey, privateKey, kid })
                },
            )
        })
    }

    const generateKeyWithFallback = async (args: {
        alg: string
        fallbackAlg: Algs
    }): Promise<IKeyPair> => {
        try {
            return await generateKey(args)
        } catch {
            return await getKeyPair({
                algorithmIdentifier: args.fallbackAlg,
                keySize: 256,
                keyFormat: "jwk",
            })
        }
    }

    const keyEd25519 = await generateKeyWithFallback({
        alg: Algs.Ed25519.toLowerCase(),
        fallbackAlg: Algs.Ed25519,
    })
    expect(keyEd25519?.privateKey).toBeTruthy()

    const keyEd448 = await generateKeyWithFallback({
        alg: "ed448",
        fallbackAlg: Algs.Ed448,
    })
    expect(keyEd448?.privateKey).toBeTruthy()

    const keyX25519 = await generateKeyWithFallback({
        alg: "x25519",
        fallbackAlg: Algs.X25519,
    })
    expect(keyX25519?.privateKey).toBeTruthy()

    const keyX448 = await generateKeyWithFallback({
        alg: "x448",
        fallbackAlg: Algs.X448,
    })
    expect(keyX448?.privateKey).toBeTruthy()
})
