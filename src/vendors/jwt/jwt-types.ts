import type { JwtAlgorithmsEnum as Algs } from "../../enums"
import type { JwksCache } from "../jwks/jwks-cache"
import type { IJwkRecordVisible } from "../jwks/jwks-types"
import type { IJwkPrivateKey, IJwkPublicKey } from "./interfaces"

export interface IcheckTokenValidnessCredentials {
    // HS256 | HS384 | HS512
    secret?: string
    // RS256 | RS384 | RS512 | PS256 | PS384 | PS512 | ES256 | ES384 | ES512 | EdDSA | ES256K
    domainUri?: string
    jwksUri?: string
    // used when servers verifying tokens have access to jwks set
    jwksLocalSet?: {
        kty?: string
        use?: string
        kid?: string
        e?: string
        n?: string
        x5c?: string[]
        x5t?: string
        x5tS256?: string
        alg?: string
        crv?: string
        x?: string
        y?: string
        d?: string
        p?: string
        q?: string
        dp?: string
        dq?: string
    }
    /** @deprecated Has no effect: `fetch` cannot disable TLS verification portably. */
    verifySsl?: boolean
    adhoc?: [IJwkRecordVisible]
    // scopes
    requiredScopes?: string[]
    /** Cache used for `jwksUri` lookups (default: the shared default cache) */
    jwksCache?: JwksCache
    // public
    publicKey?: string
}

export interface ISignTokenCredentials {
    // HS256 | HS384 | HS512
    secret?: string
    // RS256 | RS384 | RS512 | PS256 | PS384 | PS512 | ES256 | ES384 | ES512 | EdDSA | ES256K
    pemPrivateKey?: string
    jwkPrivateKey?: IJwkPrivateKey
    // any algorithm supported by jwt
    sessionDuration: number
}

export interface IJwtTokenClaims {
    sub: string // subject id
    iss: string // issuer
    aud: string[] // audiences
    scp: string // scopes eg: "user openid"
    pld?: unknown // payload
    aid?: string // authdog global identifier
    nbf?: number // not before
    jti?: string // JWT ID
    nonce?: string // nonce
    auth_time?: number // authentication time
    azp?: string // authorized party
}

export interface IJwtTokenOpts {
    compact?: true
    jwk: IJwkPrivateKey | IJwkPublicKey
    fields?: {
        typ: string
    }
    sessionDuration: number
}

export interface ICheckJwtFields {
    requiredAudiences?: string[]
    requiredIssuer?: string
    requiredScopes?: string[]
}

export interface ICreateSignedJwtOptions {
    algorithm: Algs
    claims: IJwtTokenClaims
    signinOptions: ISignTokenCredentials
}
