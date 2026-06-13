export const JWT_CANNOT_BE_DECODED = "impossible to decode jwt"
export const JWT_MALFORMED_HEADERS = "malformed jwt headers"
export const JWT_NON_SUPPORTED_ALGORITHM = "invalid algorithm"
export const JWT_NON_IMPLEMENTED_ALGORITHM = "non implemented algorithm"
export const JWT_MISSING_VALIDATION_CREDENTIALS = "missing credential"
export const JWT_NON_COMPLIANT_AUDIENCE = "non compliant or missing audience from jwt"

export const JWT_GENERIC_ERROR_MESSAGE = "error jwt"

export const JWK_NO_APPLICABLE_KEY = "no applicable key found in the JSON Web Key Set"

export const MALFORMED_URI = "URI malformed"

export const JWKS_MISSING_KEY_ID = "keyId does not exist in the target set"
export const JWK_MISSING_KEY_ID_FROM_HEADERS = "kid missing from token headers"
export const GENERIC_UNAUTHORIZED_MESSAGE = "unauthorized"

export const GLOBAL_FUNCTION_NOT_IMPLEMENTED = "function not implemented"

export const CODE_NOT_RUNNING_IN_BROWSER = "code is not executed in the browser"

export const HEADERS_CREDENTIALS_BAD_SCHEME = "credentials_bad_scheme"
export const HEADERS_CREDENTIALS_BAD_FORMAT = "credentials_bad_format"
export const HEADERS_CREDENTIALS_FORMAT = "Format is Authorization: Bearer [token]"

export const ALLOWED_AUTHORIZATION_HEADER_CAPITALIZED = "Authorization"
export const ALLOWED_AUTHORIZATION_HEADER_LOWERCASED = "authorization"

export const INVALID_SCOPE_FIELD_TYPE = "Invalid scp field type"

export const INVALID_PEM_STRING = "Invalid PEM string"

export const INVALID_PUBLIC_KEY_FORMAT =
    "Invalid public key format (must be PEM, JWK, adhoc JWks or JWKs URI)"

export const TOKEN_EXPIRED = "Token has expired"
export const INVALID_SIGNATURE = "Invalid signature"
export const ALGORITHM_MISMATCH = "Algorithm mismatch"
export const MALFORMED_TOKEN = "Malformed token"
export const JWKS_ENDPOINT_ERROR = "Expected 200 OK from the JSON Web Key Set HTTP response"

export const ERROR_CODES = {
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    INVALID_SIGNATURE: "INVALID_SIGNATURE",
    ALGORITHM_MISMATCH: "ALGORITHM_MISMATCH",
    MALFORMED_TOKEN: "MALFORMED_TOKEN",
    JWKS_ENDPOINT_ERROR: "JWKS_ENDPOINT_ERROR",
    UNAUTHORIZED: "UNAUTHORIZED",
    JWT_ERROR: "JWT_ERROR",
    ENVIRONMENT_ERROR: "ENVIRONMENT_ERROR",
} as const
