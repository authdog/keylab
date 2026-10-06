import {
    importJWK,
    type JWK,
    type JWTHeaderParameters,
    type JWTPayload,
    jwtVerify,
    SignJWT,
} from "jose"
import { KID_BYTE_LENGTH } from "../../constants"
import { InvalidSignatureError } from "../../errors/invalid-signature"
import {
    base64UrlToBytes,
    bytesToBase64Url,
    bytesToHex,
    getRandomBytes,
    parseJwtParts,
    strToUint8Array,
    utf8ToBase64Url,
} from "./utils"

const PEM_ERROR = "ML-DSA requires a JWK key. PEM is not supported."
const EMPTY_CONTEXT = new Uint8Array(0)
const SEED_LENGTH = 32

const ML_DSA = {
    "ML-DSA-44": { suite: "ml_dsa44", publicKey: 1312, signature: 2420 },
    "ML-DSA-65": { suite: "ml_dsa65", publicKey: 1952, signature: 3309 },
    "ML-DSA-87": { suite: "ml_dsa87", publicKey: 2592, signature: 4627 },
} as const

type MlDsaName = keyof typeof ML_DSA
type MlDsaModule = typeof import("@noble/post-quantum/ml-dsa.js")
type MlDsaSuite = MlDsaModule["ml_dsa65"]

type AkpJwk = {
    kty?: string
    alg?: string
    use?: string
    kid?: string
    pub?: string
    priv?: string
}

let modulePromise: Promise<MlDsaModule> | null = null
let joseSupported: Promise<boolean> | null = null

const loadMlDsa = () => {
    if (!modulePromise) {
        modulePromise = import("@noble/post-quantum/ml-dsa.js")
    }
    return modulePromise
}

const suiteFor = async (alg: MlDsaName): Promise<MlDsaSuite> => {
    const mod = await loadMlDsa()
    return mod[ML_DSA[alg].suite]
}

export const isMlDsaAlgorithm = (alg: string): alg is MlDsaName =>
    alg === "ML-DSA-44" || alg === "ML-DSA-65" || alg === "ML-DSA-87"

const asAkp = (key: unknown): AkpJwk | null => {
    if (!key || typeof key !== "object") {
        return null
    }
    return key as AkpJwk
}

const decodeFixed = (value: string | undefined, label: string, expected: number) => {
    if (!value) {
        throw new Error(`ML-DSA key is missing ${label}`)
    }

    let bytes: Uint8Array
    try {
        bytes = base64UrlToBytes(value)
    } catch {
        throw new Error(`ML-DSA key has an invalid ${label}`)
    }

    if (bytes.length !== expected) {
        throw new Error(
            label === "seed"
                ? "ML-DSA private key must be a 32-byte seed"
                : `ML-DSA key has the wrong ${label} length`,
        )
    }

    return bytes
}

const probeJoseMlDsa = async () => {
    try {
        const suite = await suiteFor("ML-DSA-65")
        const seed = getRandomBytes(SEED_LENGTH)
        const { publicKey } = suite.keygen(seed)
        const pub = bytesToBase64Url(publicKey)
        const privateJwk = {
            kty: "AKP",
            alg: "ML-DSA-65",
            pub,
            priv: bytesToBase64Url(seed),
        }
        const key = await importJWK(privateJwk as JWK, "ML-DSA-65")
        const token = await new SignJWT({ probe: true })
            .setProtectedHeader({ alg: "ML-DSA-65" })
            .sign(key)
        const publicKeyObj = await importJWK(
            { kty: "AKP", alg: "ML-DSA-65", pub } as JWK,
            "ML-DSA-65",
        )
        await jwtVerify(token, publicKeyObj)
        return true
    } catch {
        return false
    }
}

const mlDsaJoseSupported = () => {
    if (!joseSupported) {
        joseSupported = probeJoseMlDsa()
    }
    return joseSupported
}

const signWithJose = async (
    payload: Record<string, unknown>,
    alg: MlDsaName,
    privateJwk: AkpJwk,
    protectedHeaders: Record<string, unknown>,
) => {
    const key = await importJWK(privateJwk as JWK, alg)
    return await new SignJWT(payload as JWTPayload)
        .setProtectedHeader({ ...protectedHeaders, alg } as JWTHeaderParameters)
        .sign(key)
}

const signWithNoble = async (
    payload: Record<string, unknown>,
    alg: MlDsaName,
    privateJwk: AkpJwk,
    protectedHeaders: Record<string, unknown>,
) => {
    const seed = decodeFixed(privateJwk.priv, "seed", SEED_LENGTH)
    const suite = await suiteFor(alg)
    const { secretKey } = suite.keygen(seed)
    const header = { ...protectedHeaders, alg }
    const signingInput = `${utf8ToBase64Url(JSON.stringify(header))}.${utf8ToBase64Url(
        JSON.stringify(payload),
    )}`
    const signature = suite.sign(strToUint8Array(signingInput), secretKey, {
        context: EMPTY_CONTEXT,
    })

    return `${signingInput}.${bytesToBase64Url(signature)}`
}

const verifyWithNoble = async (
    parts: ReturnType<typeof parseJwtParts>,
    jwk: AkpJwk,
    alg: MlDsaName,
) => {
    const info = ML_DSA[alg]
    if (parts.signature.length !== info.signature) {
        return false
    }

    let pub: Uint8Array
    try {
        pub = decodeFixed(jwk.pub, "public key", info.publicKey)
    } catch {
        return false
    }

    const suite = await suiteFor(alg)
    try {
        return suite.verify(parts.signature, strToUint8Array(parts.signingInput), pub, {
            context: EMPTY_CONTEXT,
        })
    } catch {
        return false
    }
}

export const createMlDsaKeyPair = async (
    algorithmIdentifier: MlDsaName,
    keyFormat: "pem" | "jwk",
) => {
    if (keyFormat === "pem") {
        throw new Error(PEM_ERROR)
    }

    const info = ML_DSA[algorithmIdentifier]
    const suite = await suiteFor(algorithmIdentifier)
    const seed = getRandomBytes(SEED_LENGTH)
    const { publicKey } = suite.keygen(seed)
    if (publicKey.length !== info.publicKey) {
        throw new Error("ML-DSA public key has the wrong length")
    }

    const kid = bytesToHex(getRandomBytes(KID_BYTE_LENGTH))
    const publicJwk = {
        kty: "AKP" as const,
        alg: algorithmIdentifier,
        use: "sig" as const,
        kid,
        pub: bytesToBase64Url(publicKey),
    }

    return {
        publicKey: publicJwk,
        privateKey: {
            ...publicJwk,
            priv: bytesToBase64Url(seed),
        },
        kid,
    }
}

export const signMlDsaJwt = async ({
    payload,
    alg,
    privateKey,
    protectedHeaders,
}: {
    payload: Record<string, unknown>
    alg: MlDsaName
    privateKey: unknown
    protectedHeaders: Record<string, unknown>
}) => {
    if (typeof privateKey === "string") {
        throw new Error(PEM_ERROR)
    }

    const privateJwk = asAkp(privateKey)
    if (!privateJwk?.priv || privateJwk.kty !== "AKP") {
        throw new Error("ML-DSA signing requires a private JWK.")
    }
    if (privateJwk.alg && privateJwk.alg !== alg) {
        throw new Error("ML-DSA key algorithm does not match the requested algorithm")
    }

    if (await mlDsaJoseSupported()) {
        try {
            return await signWithJose(payload, alg, privateJwk, protectedHeaders)
        } catch {
            // The runtime advertised ML-DSA, but this key still needs the portable path.
        }
    }

    return signWithNoble(payload, alg, privateJwk, protectedHeaders)
}

export const verifyMlDsaJwt = async ({
    token,
    publicKeys,
}: {
    token: string
    publicKeys: unknown[]
}) => {
    const parts = parseJwtParts(token)
    const headerAlg = parts.protectedHeader.alg
    if (!headerAlg || !isMlDsaAlgorithm(headerAlg)) {
        throw new InvalidSignatureError()
    }

    const useJose = await mlDsaJoseSupported()

    for (const candidate of publicKeys) {
        const jwk = asAkp(candidate)
        if (!jwk) {
            continue
        }
        if (jwk.kty !== "AKP" || jwk.alg !== headerAlg) {
            continue
        }
        if (parts.protectedHeader.kid && jwk.kid && parts.protectedHeader.kid !== jwk.kid) {
            continue
        }

        if (useJose) {
            try {
                const key = await importJWK(
                    { kty: "AKP", alg: headerAlg, pub: jwk.pub, kid: jwk.kid } as JWK,
                    headerAlg,
                )
                const result = await jwtVerify(token, key)
                return {
                    payload: result.payload,
                    protectedHeader: result.protectedHeader,
                }
            } catch {
                // Try the portable verifier for this key before giving up.
            }
        }

        if (await verifyWithNoble(parts, jwk, headerAlg)) {
            return {
                payload: parts.payload,
                protectedHeader: parts.protectedHeader,
            }
        }
    }

    throw new InvalidSignatureError()
}
