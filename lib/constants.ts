export const JWT_CANNOT_BE_DECODED = "impossible to decode jwt";
export const JWT_MALFORMED_HEADERS = "malformed jwt headers";
export const JWT_NON_SUPPORTED_ALGORITHM = "invalid algorithm";
export const JWT_NON_IMPLEMENTED_ALGORITHM = "non implemented algorithm";
export const JWT_MISSING_VALIDATION_CREDENTIALS = "missing credential";
export const JWT_NON_COMPLIANT_AUDIENCE =
    "non compliant or missing audience from jwt";

export const JWT_GENERIC_ERROR_MESSAGE = "error jwt";

export const JWKS_MISSING_KEY_ID = "keyId does not exist in the target set";
export const JWK_MISSING_KEY_ID_FROM_HEADERS = "kid missing from token headers";

export const GLOBAL_FUNCTION_NOT_IMPLEMENTED = "function not implemented";

import * as enums from "./enums";

export const JWT_SUPPORTED_ALGS = Object.values(enums.JwtAlgorithmsEnum);
export const JWT_PUBLIC_KEY_USES = Object.values(enums.JwtPublicKeyUse);

export const REGEX_BEARER_HEADERS = /^Bearer$/i;

export const AUTHDOG_ID_ISSUER = "https://id.authdog.com";
export const CODE_NOT_RUNNING_IN_BROWSER =
    "code is not executed in the browser";

export const AUTHDOG_JWKS_API_ID = "v1";
