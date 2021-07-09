export const JWT_CANNOT_BE_DECODED = "impossible to decode jwt";
export const JWT_MALFORMED_HEADERS = "malformed jwt headers";
export const JWT_NON_SUPPORTED_ALGORITHM = "invalid algorithm";
export const JWT_NON_IMPLEMENTED_ALGORITHM = "non implemented algorithm";
export const JWT_MISSING_VALIDATION_CREDENTIALS = "missing credential";

export enum JwtAlgorithmsEnum {
    HS256 = "HS256",
    HS384 = "HS384",
    HS512 = "HS512",
    RS256 = "RS256",
    RS384 = "RS384",
    RS512 = "RS512",
    ES256 = "ES256",
    ES384 = "ES384",
    ES512 = "ES512",
    PS256 = "PS256",
    PS384 = "PS384"
}

export const JWT_SUPPORTED_ALGS = Object.values(JwtAlgorithmsEnum);

export const REGEX_BEARER_HEADERS = /^Bearer$/i;

export const AUTHDOG_ID_ISSUER = "https://id.authdog.com";
export const CODE_NOT_RUNNING_IN_BROWSER =
    "code is not executed in the browser";
