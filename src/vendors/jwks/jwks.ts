import {
    createLocalJWKSet,
    importSPKI,
    type JWK,
    type JWTHeaderParameters,
    type JWTPayload,
    jwtVerify,
} from "jose"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { AlgorithmMismatchError } from "../../errors/algorithm-mismatch"
import { MalformedTokenError } from "../../errors/malformed-token"
import { INVALID_PUBLIC_KEY_FORMAT, JWK_NO_APPLICABLE_KEY } from "../../errors/messages"
import { assertClaims } from "../jwt/claims"
import type { IJwkPrivateKey } from "../jwt/interfaces"
import { needsPortableEdDsa, verifyPortableJwt } from "../jwt/portable-algorithms"
import { isMlDsaAlgorithm, verifyMlDsaJwt } from "../jwt/portable-ml-dsa"
import { base64UrlToUtf8, normalizeCurveName, normalizeJwk } from "../jwt/utils"
import { toVerificationError } from "../jwt/verification-errors"
import { type IJwksCacheOptions, JwksCache } from "./jwks-cache"
import type { IJwkRecordVisible, IVerifyRSATokenCredentials } from "./jwks-types"

export type {
    IJwkRecordVisible,
    IJwksClient,
    IVerifyRSATokenCredentials,
} from "./jwks-types"

export interface IRSAKeyStore {
    keys: [IJwkRecordVisible]
}

/**
 * @param privateKey is a JSON Web Key object with private fields
 * @returns public key (without private fields)
 * will remove private fields from jwk, in order to make sure a jwk is exposable publicly
 */
export const makePublicKey = (privateKey: IJwkPrivateKey) => {
    const publicKey = {
        kty: privateKey.kty,
        kid: privateKey.kid,
        use: privateKey.use,
        alg: privateKey.alg,
        x5c: privateKey.x5c,
        x5t: privateKey.x5t,
        x5u: privateKey.x5u,
        key_ops: privateKey.key_ops,
        n: privateKey.n,
        e: privateKey.e,
        key_id: privateKey.key_id,
    }

    for (const key of Object.keys(publicKey) as Array<keyof typeof publicKey>) {
        if (publicKey[key] === undefined) {
            delete publicKey[key]
        }
    }

    return publicKey
}

export interface ITokenExtractedWithPubKey {
    payload: JWTPayload
    protectedHeader: JWTHeaderParameters
}

const readHeader = (token: string): { alg: string; kid?: string } => {
    const [headerPart] = token.split(".")
    let header: unknown
    try {
        header = JSON.parse(base64UrlToUtf8(headerPart))
    } catch (error) {
        throw Object.defineProperty(new MalformedTokenError(), "cause", { value: error })
    }
    if (!header || typeof header !== "object" || typeof (header as any).alg !== "string") {
        throw new MalformedTokenError()
    }
    return header as { alg: string; kid?: string }
}

// Ed25519 and Ed448 keys are commonly published with the generic EdDSA label.
const algFamily = (alg: string) => (alg === "Ed25519" || alg === "Ed448" ? Algs.EdDSA : alg)

/**
 * Raises AlgorithmMismatchError when the key meant for this token declares another `alg`:
 * the keys whose `kid` matches the token's, or the single key the caller supplied when the
 * token has no `kid`. Anything else falls through to the usual "no applicable key" handling.
 */
const assertAlgorithmMatches = (
    header: { alg: string; kid?: string },
    candidates: any[],
    callerSupplied: boolean,
) => {
    const keys = candidates.filter((key) => key && typeof key === "object")
    const intended = header.kid
        ? keys.filter((key) => key.kid === header.kid)
        : callerSupplied && keys.length === 1
          ? keys
          : []
    if (
        intended.length > 0 &&
        intended.every((key) => key.alg && algFamily(key.alg) !== algFamily(header.alg))
    ) {
        throw new AlgorithmMismatchError(
            `Token algorithm ${header.alg} does not match the key algorithm`,
        )
    }
}

let defaultJwksCache: JwksCache | null = null

export const createJwksCache = (options?: IJwksCacheOptions): JwksCache => {
    return new JwksCache(options)
}

export const getDefaultJwksCache = (): JwksCache => {
    if (!defaultJwksCache) {
        defaultJwksCache = new JwksCache()
    }
    return defaultJwksCache
}

export const clearJwksCache = (): void => {
    if (defaultJwksCache) {
        void defaultJwksCache.clear()
        defaultJwksCache = null
    }
}

const fetchJwksKeys = async (
    jwksUri: string,
    header: { kid?: string },
    opts: IVerifyRSATokenCredentials,
) => {
    const cache = opts.jwksCache ?? getDefaultJwksCache()
    const headers: Record<string, string> = opts.requiredIssuer
        ? { "X-Issuer": opts.requiredIssuer }
        : {}

    const keys = await cache.getKeys(jwksUri, headers)
    if (header.kid && !keys.some((key: any) => key?.kid === header.kid)) {
        // The issuer may have rotated keys since the set was cached.
        return cache.refresh(jwksUri, headers)
    }
    return keys
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
    opts?: IVerifyRSATokenCredentials,
): Promise<ITokenExtractedWithPubKey> => {
    try {
        const result = await verifySignature(token, publicKey, opts)
        assertClaims(result.payload as Record<string, unknown>, opts)
        return result
    } catch (error) {
        throw toVerificationError(error)
    }
}

const verifySignature = async (
    token: string,
    publicKey: string | JWK | null,
    opts?: IVerifyRSATokenCredentials,
): Promise<ITokenExtractedWithPubKey> => {
    const header = readHeader(token)
    const tokenAlg = header.alg
    const suppliedKeys: any[] = []
    const joseCandidates: any[] = []
    const portableCandidates: any[] = []
    const mlDsaCandidates: any[] = []

    const pushCandidate = (candidate: any) => {
        suppliedKeys.push(candidate)
        if (isMlDsaAlgorithm(tokenAlg)) {
            mlDsaCandidates.push(candidate)
            return
        }

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
            if (isMlDsaAlgorithm(tokenAlg)) {
                throw new Error("ML-DSA requires a JWK key. PEM is not supported.")
            }

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
        for (const key of await fetchJwksKeys(opts.jwksUri, header, opts)) {
            pushCandidate(key)
        }
    } else {
        throw new Error(INVALID_PUBLIC_KEY_FORMAT)
    }

    assertAlgorithmMatches(header, suppliedKeys, Boolean(publicKey || opts?.adhoc))

    if (isMlDsaAlgorithm(tokenAlg)) {
        if (mlDsaCandidates.length === 0) {
            throw new Error(JWK_NO_APPLICABLE_KEY)
        }

        return (await verifyMlDsaJwt({
            token,
            publicKeys: mlDsaCandidates,
        })) as ITokenExtractedWithPubKey
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
