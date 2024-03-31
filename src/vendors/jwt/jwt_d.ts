import { JwtAlgorithmsEnum as Algs } from "../../enums";
import { IJwkRecordVisible } from "../jwks/jwks_d";

export interface IcheckTokenValidnessCredentials {
    // HS256 | HS384 | HS512
    secret?: string;
    // RS256 | RS384 | RS512 | PS256 | PS384 | PS512 | ES256 | ES384 | ES512 | EdDSA | ES256K
    domainUri?: string;
    jwksUri?: string;
    // used when servers verifying tokens have access to jwks set
    jwksLocalSet?: {
        kty?: string;
        use?: string;
        kid?: string;
        e?: string;
        n?: string;
        x5c?: string[];
        x5t?: string;
        x5tS256?: string;
        alg?: string;
        crv?: string;
        x?: string;
        y?: string;
        d?: string;
        p?: string;
        q?: string;
        dp?: string;
        dq?: string;
    };
    verifySsl?: boolean;
    adhoc?: [IJwkRecordVisible];
    // scopes
    requiredScopes?: string[];
    // public
    publicKey?: string;
}

export interface ISignTokenCredentials {
    // HS256 | HS384 | HS512
    secret?: string;
    // RS256 | RS384 | RS512 | PS256 | PS384 | PS512 | ES256 | ES384 | ES512 | EdDSA | ES256K
    pemPrivateKey?: string;
    jwkPrivateKey?: any;
    // any algorithm supported by jwt
    sessionDuration: number;
}

export interface IJwtTokenClaims {
    sub: string; // subject id
    iss: string; // issuer
    aud: string[]; // audiences
    scp: string; // scopes eg: "user openid"
    pld?: any; // payload
    aid?: string; // authdog global identifier
}

export interface IJwtTokenOpts {
    compact?: true;
    jwk: any;
    fields?: {
        typ: string;
    };
    sessionDuration: number;
}

export interface ICheckJwtFields {
    requiredAudiences?: string[];
    requiredIssuer?: string;
    requiredScopes?: string[];
}

export interface ICreateSignedJwtOptions {
    algorithm: Algs;
    claims: IJwtTokenClaims;
    signinOptions: ISignTokenCredentials;
}
