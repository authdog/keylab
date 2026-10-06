import type { JwksCache } from "./jwks-cache"

export interface IJwksClient {
    jwksUri?: string // required for RS256
    domainUri?: string // required when domainUri doesn't match jwksUri's host
    /** @deprecated Has no effect: `fetch` cannot disable TLS verification portably. */
    verifySsl?: boolean
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
    /** @deprecated Has no effect: `fetch` cannot disable TLS verification portably. */
    verifySsl?: boolean
    requiredAudiences?: string[]
    requiredIssuer?: string
    requiredScopes?: string[]
    adhoc?: [IJwkRecordVisible]
    /** Cache used for `jwksUri` lookups (default: the shared default cache) */
    jwksCache?: JwksCache
}
