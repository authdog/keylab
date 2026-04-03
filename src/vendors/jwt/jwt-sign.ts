import { JwtAlgorithmsEnum as Algs, JwtKeyTypes } from "../../enums"
import type { KeyObject } from "crypto"
import {
    exportJWK,
    exportPKCS8,
    exportSPKI,
    generateKeyPair as generateJoseKeyPair,
    importJWK,
    importPKCS8,
    JWTHeaderParameters,
    SignJWT,
} from "jose"
import { IGetKeyPair, IKeyPair } from "./interfaces"
import {
    bytesToBase64Url,
    bytesToHex,
    getRandomBytes,
    normalizeJwk,
    strToUint8Array,
} from "./utils"
import {
    createPortableKeyPair,
    isPortableAlgorithm,
    needsPortableEdDsa,
    signPortableJwt,
} from "./portable-algorithms"

interface ISignJwtOpts {
    kid?: string
}

const normalizedJwtAlg = (alg: Algs) =>
    alg === Algs.Ed25519 || alg === Algs.Ed448 ? Algs.EdDSA : alg

const getJwkUse = (algorithmIdentifier: Algs) => {
    if (
        [
            Algs.RSA_OAEP,
            Algs.RSA_OAEP_256,
            Algs.RSA_OAEP_384,
            Algs.RSA_OAEP_512,
            Algs.RSA1_5,
            Algs.ECDH_ES,
            Algs.ECDH_ES_A128KW,
            Algs.ECDH_ES_A192KW,
            Algs.ECDH_ES_A256KW,
            Algs.X25519,
            Algs.X448,
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
        ].includes(algorithmIdentifier)
    ) {
        return "enc"
    }

    return "sig"
}

const getJoseImportAlgorithm = (alg: Algs) => {
    switch (alg) {
        case Algs.Ed25519:
            return Algs.EdDSA
        case Algs.RSAPSS:
        case Algs.RSA_PSS:
            return Algs.PS256
        case Algs.RSA1_5:
            return Algs.RSA_OAEP
        case Algs.X25519:
            return Algs.ECDH_ES
        default:
            return alg
    }
}

const getJoseKeyGenerationConfig = (algorithmIdentifier: Algs, keySize?: number) => {
    switch (algorithmIdentifier) {
        case Algs.RS256:
        case Algs.RS384:
        case Algs.RS512:
        case Algs.PS256:
        case Algs.PS384:
        case Algs.PS512:
        case Algs.RSA_OAEP:
        case Algs.RSA_OAEP_256:
        case Algs.RSA_OAEP_384:
        case Algs.RSA_OAEP_512:
            return {
                alg: algorithmIdentifier,
                options: {
                    extractable: true,
                    modulusLength: keySize || 2048,
                },
            }
        case Algs.RSAPSS:
        case Algs.RSA_PSS:
            return {
                alg: Algs.PS256,
                options: {
                    extractable: true,
                    modulusLength: keySize || 2048,
                },
            }
        case Algs.RSA1_5:
            return {
                alg: Algs.RSA_OAEP,
                options: {
                    extractable: true,
                    modulusLength: keySize || 2048,
                },
            }
        case Algs.ES256:
        case Algs.ES384:
        case Algs.ES512:
            return {
                alg: algorithmIdentifier,
                options: {
                    extractable: true,
                },
            }
        case Algs.EdDSA:
        case Algs.Ed25519:
            return {
                alg: Algs.EdDSA,
                options: {
                    extractable: true,
                    crv: "Ed25519",
                },
            }
        case Algs.X25519:
            return {
                alg: Algs.ECDH_ES,
                options: {
                    extractable: true,
                    crv: "X25519",
                },
            }
        case Algs.ECDH_ES:
        case Algs.ECDH_ES_A128KW:
        case Algs.ECDH_ES_A192KW:
        case Algs.ECDH_ES_A256KW:
            return {
                alg: Algs.ECDH_ES,
                options: {
                    extractable: true,
                },
            }
        default:
            return null
    }
}

const getNodeKeyGenerationConfig = (algorithmIdentifier: Algs, keySize?: number) => {
    switch (algorithmIdentifier) {
        case Algs.RS256:
        case Algs.RS384:
        case Algs.RS512:
        case Algs.PS256:
        case Algs.PS384:
        case Algs.PS512:
        case Algs.RSAPSS:
        case Algs.RSA_PSS:
        case Algs.RSA_OAEP:
        case Algs.RSA_OAEP_256:
        case Algs.RSA_OAEP_384:
        case Algs.RSA_OAEP_512:
        case Algs.RSA1_5:
            return {
                type: "rsa",
                options: {
                    modulusLength: keySize || 2048,
                },
            }
        case Algs.ES256:
            return {
                type: "ec",
                options: {
                    namedCurve: "prime256v1",
                },
            }
        case Algs.ES384:
            return {
                type: "ec",
                options: {
                    namedCurve: "secp384r1",
                },
            }
        case Algs.ES512:
            return {
                type: "ec",
                options: {
                    namedCurve: "secp521r1",
                },
            }
        case Algs.ECDH_ES:
        case Algs.ECDH_ES_A128KW:
        case Algs.ECDH_ES_A192KW:
        case Algs.ECDH_ES_A256KW:
            return {
                type: "ec",
                options: {
                    namedCurve: "prime256v1",
                },
            }
        case Algs.EdDSA:
        case Algs.Ed25519:
            return {
                type: "ed25519",
                options: {},
            }
        case Algs.X25519:
            return {
                type: "x25519",
                options: {},
            }
        default:
            return null
    }
}

const getKeyPairWithNodeCrypto = async (
    algorithmIdentifier: Algs,
    keyFormat: "pem" | "jwk",
    keySize?: number,
): Promise<IKeyPair | null> => {
    const nodeConfig = getNodeKeyGenerationConfig(algorithmIdentifier, keySize)
    if (!nodeConfig) {
        return null
    }

    const crypto = await import("crypto")
    const { publicKey, privateKey } = crypto.generateKeyPairSync(
        nodeConfig.type as any,
        nodeConfig.options as any,
    ) as unknown as {
        publicKey: KeyObject
        privateKey: KeyObject
    }
    const kid = bytesToHex(getRandomBytes(16))

    if (keyFormat === "pem") {
        return {
            publicKey: publicKey.export({
                format: "pem",
                type: "spki",
            }) as any,
            privateKey: privateKey.export({
                format: "pem",
                type: "pkcs8",
            }) as any,
            kid,
        }
    }

    const metadata = createKeyMetadata(algorithmIdentifier, kid)
    return {
        publicKey: {
            ...(publicKey.export({
                format: "jwk",
            }) as any),
            ...metadata,
        } as any,
        privateKey: {
            ...(privateKey.export({
                format: "jwk",
            }) as any),
            ...metadata,
        } as any,
        kid,
    }
}

const createKeyMetadata = (algorithmIdentifier: Algs, kid: string) => ({
    kid,
    use: getJwkUse(algorithmIdentifier),
    alg: normalizedJwtAlg(algorithmIdentifier),
})

const getSymmetricKeySize = (algorithmIdentifier: Algs, keySize?: number) => {
    if (keySize) {
        return Math.max(Math.floor(keySize / 8), 16)
    }

    switch (algorithmIdentifier) {
        case Algs.HS384:
            return 48
        case Algs.HS512:
            return 64
        case Algs.A192KW:
        case Algs.A192GCMKW:
        case Algs.PBES2_HS384_A192KW:
            return 24
        case Algs.A256KW:
        case Algs.A256GCMKW:
        case Algs.PBES2_HS512_A256KW:
            return 32
        case Algs.HS256:
        case Algs.A128KW:
        case Algs.A128GCMKW:
        case Algs.PBES2_HS256_A128KW:
            return 32
        default:
            return 32
    }
}

export const signJwtWithPrivateKey = async (
    payload: any,
    alg: Algs,
    privateKey: string | any,
    opts: ISignJwtOpts = {},
    altOpts: any = {},
) => {
    const protectedHeaders: JWTHeaderParameters = {
        alg: normalizedJwtAlg(alg),
        type: JwtKeyTypes?.JWT,
    }

    if (altOpts?.keyId) {
        protectedHeaders.kid = altOpts.keyId
    }

    if (isPortableAlgorithm(alg) || (await needsPortableEdDsa(alg, privateKey))) {
        return signPortableJwt({
            payload: { ...payload, ...opts },
            alg,
            privateKey,
            protectedHeaders,
        })
    }

    let privateKeyObj
    if (privateKey?.kty) {
        privateKeyObj = await importJWK(normalizeJwk(privateKey), getJoseImportAlgorithm(alg))
    } else {
        try {
            privateKeyObj = await importPKCS8(privateKey, getJoseImportAlgorithm(alg))
        } catch (error) {
            if ([Algs.HS256, Algs.HS384, Algs.HS512].includes(alg)) {
                privateKeyObj = strToUint8Array(privateKey)
            } else {
                throw error
            }
        }
    }

    return await new SignJWT({ ...payload, ...opts })
        .setProtectedHeader(protectedHeaders)
        .sign(privateKeyObj)
}

export const getKeyPair = async ({
    keyFormat = "jwk",
    algorithmIdentifier,
    keySize,
}: IGetKeyPair): Promise<IKeyPair> => {
    if (isPortableAlgorithm(algorithmIdentifier)) {
        return createPortableKeyPair(algorithmIdentifier, keyFormat) as Promise<IKeyPair>
    }

    if (
        [
            Algs.HS256,
            Algs.HS384,
            Algs.HS512,
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
        ].includes(algorithmIdentifier)
    ) {
        const kid = bytesToHex(getRandomBytes(16))
        if (keyFormat === "pem") {
            const secret = bytesToHex(
                getRandomBytes(getSymmetricKeySize(algorithmIdentifier, keySize)),
            )
            return {
                publicKey: secret as any,
                privateKey: secret as any,
                kid,
            }
        }

        const secret = bytesToBase64Url(
            getRandomBytes(getSymmetricKeySize(algorithmIdentifier, keySize)),
        )
        const jwk = {
            kty: JwtKeyTypes.OCTET,
            k: secret,
            ...createKeyMetadata(algorithmIdentifier, kid),
        }

        return {
            publicKey: jwk as any,
            privateKey: jwk as any,
            kid,
        }
    }

    const joseConfig = getJoseKeyGenerationConfig(algorithmIdentifier, keySize)
    if (!joseConfig) {
        throw new Error(`Unsupported algorithm ${algorithmIdentifier}`)
    }

    let publicKey
    let privateKey

    try {
        ;({ publicKey, privateKey } = await generateJoseKeyPair(joseConfig.alg, joseConfig.options))
    } catch (error) {
        const fallbackKeyPair = await getKeyPairWithNodeCrypto(
            algorithmIdentifier,
            keyFormat,
            keySize,
        )
        if (fallbackKeyPair) {
            return fallbackKeyPair
        }
        throw error
    }
    const kid = bytesToHex(getRandomBytes(16))

    if (keyFormat === "pem") {
        return {
            publicKey: (await exportSPKI(publicKey)) as any,
            privateKey: (await exportPKCS8(privateKey)) as any,
            kid,
        }
    }

    const metadata = createKeyMetadata(algorithmIdentifier, kid)
    return {
        publicKey: {
            ...(await exportJWK(publicKey)),
            ...metadata,
        } as any,
        privateKey: {
            ...(await exportJWK(privateKey)),
            ...metadata,
        } as any,
        kid,
    }
}
