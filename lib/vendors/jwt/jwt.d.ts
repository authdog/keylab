import { JwtAlgorithmsEnum } from "../../enums";

export interface IcheckTokenValidnessCredentials {
    // HS256
    secret?: string;
    // RS256
    domainUri?: string;
    jwksUri?: string;
    verifySsl?: boolean;
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
    aud: string[] | string;
    sub: string;
    iat: number;
    exp: number;
}

export interface ICheckJwtFields {
    requiredAudiences?: string[];
    requiredIssuer?: string;
}

export interface ICreateSignedJwtOptions {
    algorithm: JwtAlgorithmsEnum;
    claims: IJwtTokenClaims;
    signinOptions: IcheckTokenValidnessCredentials;
}
