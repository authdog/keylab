import { createLocalJWKSet, importSPKI, jwtVerify, JWK } from "jose"
import { extractAlgFromJwtHeader } from "../jwt/jwt-verify"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { INVALID_PUBLIC_KEY_FORMAT, JWK_NO_APPLICABLE_KEY } from "../../errors/messages"
import { needsPortableEdDsa, verifyPortableJwt } from "../jwt/portable-algorithms"
import { normalizeCurveName, normalizeJwk } from "../jwt/utils"

export interface IJwksClient {
    jwksUri?: string // required for RS256
    domainUri?: string // required when domainUri doesn't match jwksUri's host
    verifySsl?: boolean // set it to true if you're using self-signed certificate in local environment
}

// https://datatracker.ietf.org/doc/html/rfc7517
export interface IJwkRecordVisible {
    kty: string // key type
    kid: string // key id
    use: string // public key use
    alg: string // algorithm
    e: string // exponent
    n: string // modulus
}

export interface IVerifyRSATokenCredentials {
    jwksUri?: string
    verifySsl?: boolean
    requiredAudiences?: string[]
    requiredIssuer?: string
    requiredScopes?: string[]
    adhoc?: [IJwkRecordVisible]
}

export interface IRSAKeyStore {
    keys: [IJwkRecordVisible]
}

// TODO: add proper type for key parameter
/**
 * @param privateKey is a JSON Web Key object with private fields
 * @returns public key (without private fields)
 * will remove private fields from jwk, in order to make sure a jwk is exposable publicly
 */
export const makePublicKey = (privateKey: any) => {
    const publicKey = {
        kty: privateKey.kty,
        kid: privateKey.kid,
        use: privateKey.sig,
        alg: privateKey.alg,
        x5c: privateKey.x5c,
        x5t: privateKey.x5t,
        x5u: privateKey.x5u,
        key_ops: privateKey.key_ops,
        n: privateKey.n,
        e: privateKey.e,
        key_id: privateKey.key_id,
    }

    Object.keys(publicKey).forEach((key) => {
        if (publicKey[key] === undefined) {
            delete publicKey[key]
        }
    })

    return publicKey
}

export interface ITokenExtractedWithPubKey {
    payload: any
    protectedHeader: any
}

/**
 *
 * @param token token to verify
 * @param publicKey string is PEM, JWK is JSON Web Key
 * @param opts verifyRSA Token Credentials
 * @returns decoded payload if token is valid
 */
export const verifyTokenWithPublicKey = async (
    token: string,
    publicKey: string | JWK | null,
    opts: IVerifyRSATokenCredentials = null,
): Promise<ITokenExtractedWithPubKey> => {
    const tokenAlg = extractAlgFromJwtHeader(token)
    const joseCandidates: any[] = []
    const portableCandidates: any[] = []

    const pushCandidate = (candidate: any) => {
        const normalized = normalizeJwk(candidate)
        const curve = normalizeCurveName(normalized?.crv)
        const isPortableCandidate =
            tokenAlg === Algs.ES256K
                ? curve === "secp256k1"
                : tokenAlg === Algs.EdDSA && curve === "Ed448"

        if (isPortableCandidate) {
            portableCandidates.push(normalized)
            return
        }

        joseCandidates.push(normalized)
    }

    if (publicKey || opts?.adhoc) {
        if (typeof publicKey === "string") {
            if (tokenAlg === Algs.ES256K || (await needsPortableEdDsa(tokenAlg, publicKey))) {
                return verifyPortableJwt({
                    token,
                    publicKeys: [publicKey],
                })
            }

            const keyLike = await pemToJwk(publicKey, tokenAlg)
            return (await jwtVerify(token, keyLike, {
                issuer: opts?.requiredIssuer,
                audience: opts?.requiredAudiences,
            })) as any
        }

        if (publicKey && typeof publicKey === "object") {
            pushCandidate(publicKey)
        }

        for (const adhocKey of opts?.adhoc || []) {
            pushCandidate(adhocKey)
        }
    } else if (opts?.jwksUri) {
        const response = await (globalThis as any).fetch(opts.jwksUri, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "authdog-agent",
                ...(opts?.requiredIssuer ? { "X-Issuer": opts.requiredIssuer } : {}),
            },
        })

        if (!response?.ok) {
            throw new Error("Expected 200 OK from the JSON Web Key Set HTTP response")
        }

        const jwksJson = await response.json()
        for (const key of Array.isArray((jwksJson as any)?.keys) ? (jwksJson as any).keys : []) {
            pushCandidate(key)
        }
    } else {
        throw new Error(INVALID_PUBLIC_KEY_FORMAT)
    }

    if (portableCandidates.length > 0) {
        try {
            return await verifyPortableJwt({
                token,
                publicKeys: portableCandidates,
            })
        } catch (error) {
            if (joseCandidates.length === 0) {
                throw error
            }
        }
    }

    if (tokenAlg === Algs.ES256K && portableCandidates.length === 0) {
        throw new Error(JWK_NO_APPLICABLE_KEY)
    }

    if (joseCandidates.length === 0) {
        throw new Error(JWK_NO_APPLICABLE_KEY)
    }

    return (await jwtVerify(
        token,
        createLocalJWKSet({
            keys: joseCandidates as JWK[],
        }),
        {
            issuer: opts?.requiredIssuer,
            audience: opts?.requiredAudiences,
        },
    )) as any
}

/**
 *
 * @param pemString
 * @param algorithm
 * @returns
 */
export const pemToJwk = async (pemString: string, algorithm: string) => {
    return await importSPKI(pemString, algorithm === "Ed25519" ? "EdDSA" : algorithm)
}
