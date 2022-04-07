import { IRSAKeyStore } from "../jwks";
import { JwtAlgorithmsEnum as Algs } from "../../enums";

export interface IcheckTokenValidnessCredentials {
    // HS256 | HS384 | HS512
    secret?: string;
    // RS256 | RS384 | RS512 | PS256 | PS384 | PS512 | ES256 | ES384 | ES512 | EdDSA | ES256K
    domainUri?: string;
    jwksUri?: string;
    verifySsl?: boolean;
    adhoc?: IRSAKeyStore;
    // scopes
    requiredScopes?: string[];
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
