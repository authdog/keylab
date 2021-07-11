export interface IcheckTokenValidnessCredentials {
    // HS256
    secret?: string;
    // RS256
    domainUri?: string;
    jwksUri?: string;
    verifySsl?: boolean;
}

export interface IJwtTokenClaims {
    adid: string;
    issuer: string;
    audiences: string[];
    sessionDuration: number; // minutes
    scopes: string;
    data?: any;
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
}
