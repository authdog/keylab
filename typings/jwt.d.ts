import { JwtAlgorithmsEnum } from "../lib/enums";

export interface IcheckTokenValidnessCredentials {
    // HS256
    secret?: string;
    // RS256
    domainUri?: string;
    jwksUri?: string;
    verifySsl?: boolean;
}

export interface ISignTokenCredentials {
    // HS256
    secret?: string;
    // RS256
    jwk: any;
}

export interface IJwtTokenClaims {
    sub: string; // subject id
    issuer: string; // issuer
    audiences: string[]; // audiences
    sessionDuration: number; // minutes
    scopes: string; // scopes eg: "user openid"
    data?: any; // payload
}

export interface IJwtTokenOpts {
    compact: true;
    jwk: any;
    fields: {
        typ: string;
    };
}

export interface IDecodedJwt {
    iss?: string;
    aud?: string[] | string;
    sub?: string;
    iat: number;
    exp: number;
    scp?: string;
}

export interface ICheckJwtFields {
    requiredAudiences?: string[];
    requiredIssuer?: string;
}

export interface ICreateSignedJwtOptions {
    algorithm: JwtAlgorithmsEnum;
    claims: IJwtTokenClaims;
    signinOptions: ISignTokenCredentials;
}
