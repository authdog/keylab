// export const SECRET_MUST_BE_SET_MSG = 'secret should be set';
// export const ALGORITHMS_MUST_BE_SET_MSG = 'algorithms should be set';
// export const ALGORITHMS_MUST_BE_ARR_MSG = 'algorithms must be an array';
export const JWT_CANNOT_BE_DECODED = "impossible to decode jwt";
export const JWT_MALFORMED_HEADERS = "malformed jwt headers";
export const JWT_NON_SUPPORTED_ALGORITHM = "invalid algorithm";
export const JWT_SUPPORTED_ALGS = [
    "HS256",
    "HS384",
    "HS512",
    "RS256",
    "RS384",
    "RS512",
    "ES256",
    "ES384",
    "ES512",
    "PS256",
    "PS384",
];

export const REGEX_BEARER_HEADERS = /^Bearer$/i;
