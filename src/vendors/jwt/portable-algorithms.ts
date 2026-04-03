import type { JWK } from "jose"
import { JwtAlgorithmsEnum as Algs, JwtKeyTypes } from "../../enums"
import {
    base64UrlToBytes,
    bytesToBase64Url,
    concatBytes,
    getRandomBytes,
    bytesToHex,
    isNodeJs,
    looksLikePem,
    normalizeCurveName,
    normalizeJwk,
    strToUint8Array,
    utf8ToBase64Url,
} from "./utils"
import { secp256k1 } from "@noble/curves/secp256k1.js"
import { ed448, x448 } from "@noble/curves/ed448.js"

type PortableCurve = "ES256K" | "Ed448" | "X448"
type PortableKey = string | JWK | Record<string, any>

const PORTABLE_PEM_RUNTIME_ERROR =
    "PEM support for ES256K, Ed448, and X448 requires a Node.js runtime. Use JWK keys in Workers and browsers."

const loadNodeCrypto = async () => {
    if (!isNodeJs()) {
        throw new Error(PORTABLE_PEM_RUNTIME_ERROR)
    }

    return import("crypto")
}

const decodePublicPoint = (jwk: any) =>
    concatBytes(new Uint8Array([0x04]), base64UrlToBytes(jwk.x), base64UrlToBytes(jwk.y))

const encodeEcPoint = (publicKey: Uint8Array) => ({
    x: bytesToBase64Url(publicKey.slice(1, 33)),
    y: bytesToBase64Url(publicKey.slice(33, 65)),
})

const createOkpJwk = ({
    curve,
    publicKey,
    privateKey,
    kid,
    use,
}: {
    curve: "Ed448" | "X448"
    publicKey: Uint8Array
    privateKey?: Uint8Array
    kid: string
    use: "sig" | "enc"
}) => ({
    kty: "OKP",
    crv: curve,
    x: bytesToBase64Url(publicKey),
    ...(privateKey ? { d: bytesToBase64Url(privateKey) } : {}),
    use,
    kid,
})

const createPortableJwkPair = (algorithmIdentifier: Algs) => {
    const kid = bytesToHex(getRandomBytes(16))

    switch (algorithmIdentifier) {
        case Algs.ES256K: {
            const { secretKey } = secp256k1.keygen()
            const publicKey = secp256k1.getPublicKey(secretKey, false)
            const coords = encodeEcPoint(publicKey)

            return {
                kid,
                publicKey: {
                    kty: "EC",
                    crv: "secp256k1",
                    ...coords,
                    use: "sig",
                    alg: Algs.ES256K,
                    kid,
                },
                privateKey: {
                    kty: "EC",
                    crv: "secp256k1",
                    ...coords,
                    d: bytesToBase64Url(secretKey),
                    use: "sig",
                    alg: Algs.ES256K,
                    kid,
                },
            }
        }
        case Algs.Ed448: {
            const { secretKey, publicKey } = ed448.keygen()
            return {
                kid,
                publicKey: {
                    ...createOkpJwk({
                        curve: "Ed448",
                        publicKey,
                        kid,
                        use: "sig",
                    }),
                    alg: Algs.EdDSA,
                },
                privateKey: {
                    ...createOkpJwk({
                        curve: "Ed448",
                        publicKey,
                        privateKey: secretKey,
                        kid,
                        use: "sig",
                    }),
                    alg: Algs.EdDSA,
                },
            }
        }
        case Algs.X448: {
            const { secretKey, publicKey } = x448.keygen()
            return {
                kid,
                publicKey: {
                    ...createOkpJwk({
                        curve: "X448",
                        publicKey,
                        kid,
                        use: "enc",
                    }),
                    alg: Algs.ECDH_ES,
                },
                privateKey: {
                    ...createOkpJwk({
                        curve: "X448",
                        publicKey,
                        privateKey: secretKey,
                        kid,
                        use: "enc",
                    }),
                    alg: Algs.ECDH_ES,
                },
            }
        }
        default:
            throw new Error(`Unsupported portable algorithm: ${algorithmIdentifier}`)
    }
}

const exportPortableKeyPairToPem = async (keyPair: any) => {
    const crypto = await loadNodeCrypto()
    const publicKeyObject = crypto.createPublicKey({
        key: keyPair.publicKey,
        format: "jwk",
    } as any)
    const privateKeyObject = crypto.createPrivateKey({
        key: keyPair.privateKey,
        format: "jwk",
    } as any)

    return {
        kid: keyPair.kid,
        publicKey: publicKeyObject.export({
            format: "pem",
            type: "spki",
        }) as string,
        privateKey: privateKeyObject.export({
            format: "pem",
            type: "pkcs8",
        }) as string,
    }
}

const curveFromJwkForAlg = (alg: string, jwk: any): PortableCurve | null => {
    const crv = normalizeCurveName(jwk?.crv)
    if (alg === Algs.ES256K || crv === "secp256k1") {
        return "ES256K"
    }
    if (alg === Algs.Ed448 || crv === "Ed448") {
        return "Ed448"
    }
    if (alg === Algs.X448 || crv === "X448") {
        return "X448"
    }
    if (alg === Algs.EdDSA && crv === "Ed448") {
        return "Ed448"
    }
    return null
}

const keyObjectToJwk = async (value: string, isPrivate: boolean) => {
    const crypto = await loadNodeCrypto()
    const keyObject = isPrivate ? crypto.createPrivateKey(value) : crypto.createPublicKey(value)

    return normalizeJwk(
        keyObject.export({
            format: "jwk",
        }) as JWK,
    )
}

const resolvePortableJwk = async (key: PortableKey, isPrivate: boolean) => {
    if (typeof key === "string") {
        if (!looksLikePem(key)) {
            throw new Error("Portable algorithms expect JWK or PEM key material.")
        }
        return keyObjectToJwk(key, isPrivate)
    }

    return normalizeJwk(key)
}

const buildPortableHeader = (alg: Algs, key: any, protectedHeaders: any) => {
    const curve = curveFromJwkForAlg(alg, key)
    return {
        ...protectedHeaders,
        alg: curve === "ES256K" ? Algs.ES256K : Algs.EdDSA,
        ...(curve === "ES256K" ? {} : { typ: "JWT" }),
        type: protectedHeaders?.type || JwtKeyTypes.JWT,
    }
}

const parseJwtParts = (token: string) => {
    const [headerPart, payloadPart, signaturePart] = token.split(".")
    if (!headerPart || !payloadPart || !signaturePart) {
        throw new Error("Malformed JWT.")
    }

    return {
        signingInput: `${headerPart}.${payloadPart}`,
        protectedHeader: JSON.parse(new TextDecoder().decode(base64UrlToBytes(headerPart))),
        payload: JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadPart))),
        signature: base64UrlToBytes(signaturePart),
    }
}

const matchesHeader = (jwk: any, protectedHeader: any) => {
    if (!jwk) {
        return false
    }

    if (protectedHeader?.kid && jwk?.kid && protectedHeader.kid !== jwk.kid) {
        return false
    }

    if (protectedHeader?.alg === Algs.ES256K) {
        return normalizeCurveName(jwk.crv) === "secp256k1"
    }

    if (protectedHeader?.alg === Algs.EdDSA) {
        return normalizeCurveName(jwk.crv) === "Ed448"
    }

    return false
}

export const isPortableAlgorithm = (alg: string) =>
    alg === Algs.ES256K || alg === Algs.Ed448 || alg === Algs.X448

export const needsPortableEdDsa = async (alg: string, key?: PortableKey | null) => {
    if (alg !== Algs.EdDSA && alg !== Algs.Ed448) {
        return false
    }

    if (!key) {
        return alg === Algs.Ed448
    }

    try {
        const jwk = await resolvePortableJwk(
            key,
            typeof key !== "string" || key.includes("PRIVATE KEY"),
        )
        return curveFromJwkForAlg(alg, jwk) === "Ed448"
    } catch {
        return alg === Algs.Ed448
    }
}

export const createPortableKeyPair = async (
    algorithmIdentifier: Algs,
    keyFormat: "pem" | "jwk",
) => {
    const jwkPair = createPortableJwkPair(algorithmIdentifier)
    return keyFormat === "pem" ? exportPortableKeyPairToPem(jwkPair) : jwkPair
}

export const signPortableJwt = async ({
    payload,
    alg,
    privateKey,
    protectedHeaders,
}: {
    payload: Record<string, any>
    alg: Algs
    privateKey: PortableKey
    protectedHeaders: Record<string, any>
}) => {
    const jwk = await resolvePortableJwk(privateKey, true)
    const curve = curveFromJwkForAlg(alg, jwk)

    if (!curve || !jwk?.d) {
        throw new Error(`Unsupported portable private key for algorithm ${alg}`)
    }

    const header = buildPortableHeader(alg, jwk, protectedHeaders)
    const signingInput = `${utf8ToBase64Url(JSON.stringify(header))}.${utf8ToBase64Url(
        JSON.stringify(payload),
    )}`
    const signingBytes = strToUint8Array(signingInput)
    const secretKey = base64UrlToBytes(jwk.d)

    const signature =
        curve === "ES256K"
            ? secp256k1.sign(signingBytes, secretKey, {
                  prehash: true,
                  format: "compact",
              })
            : ed448.sign(signingBytes, secretKey)

    return `${signingInput}.${bytesToBase64Url(signature)}`
}

export const verifyPortableJwt = async ({
    token,
    publicKeys,
}: {
    token: string
    publicKeys: PortableKey[]
}) => {
    const parts = parseJwtParts(token)
    const message = strToUint8Array(parts.signingInput)
    const candidateJwks = (
        await Promise.all(
            publicKeys.map(async (candidate) => {
                try {
                    return await resolvePortableJwk(candidate, false)
                } catch {
                    return null
                }
            }),
        )
    ).filter(Boolean)

    for (const jwk of candidateJwks) {
        if (!matchesHeader(jwk, parts.protectedHeader)) {
            continue
        }

        if (parts.protectedHeader.alg === Algs.ES256K) {
            const publicKey = decodePublicPoint(jwk)
            if (
                secp256k1.verify(parts.signature, message, publicKey, {
                    prehash: true,
                })
            ) {
                return {
                    payload: parts.payload,
                    protectedHeader: parts.protectedHeader,
                }
            }
        }

        if (parts.protectedHeader.alg === Algs.EdDSA && normalizeCurveName(jwk.crv) === "Ed448") {
            if (ed448.verify(parts.signature, message, base64UrlToBytes(jwk.x))) {
                return {
                    payload: parts.payload,
                    protectedHeader: parts.protectedHeader,
                }
            }
        }
    }

    throw new Error("Invalid signature")
}
