// Export functions
export {
    checkTokenValidness,
    createSignedJwt,
    extractBearerTokenFromHeaders,
    parseJwt,
    pemToJwk,
    getKeyPair,
} from "./vendors"

export { signJwtWithPrivateKey } from "./vendors/jwt/jwt-sign"
export { verifyTokenWithPublicKey } from "./vendors"
export { isTokenExpired, getTimeToExpiry } from "./vendors/jwt/token-expiry"

// Export JWE
export {
    encryptJwe,
    decryptJwe,
    type IEncryptJweOptions,
    type IDecryptJweOptions,
    type IDecryptedJwe,
} from "./vendors/jwe/jwe"

// Export Middleware
export {
    createJwtMiddleware,
    createJwtHandler,
    type IMiddlewareOptions,
    type IJwtHandlerResult,
} from "./vendors/middleware/middleware"

// Export error classes
export {
    JsonWebTokenError,
    UnauthorizedError,
    EnvironmentError,
    TokenExpiredError,
    InvalidSignatureError,
    AlgorithmMismatchError,
    MalformedTokenError,
    JwksEndpointError,
} from "./errors"

// Export enums
export * from "./enums"
export { JwtAlgorithmsEnum } from "./enums"

// Export JWT interfaces and types
export {
    type IDecodedJwt,
    type IGetKeyPair,
    type IJwkPrivateKey,
    type IJwkPublicKey,
    type IKeyPair,
} from "./vendors/jwt/interfaces"

export {
    type IcheckTokenValidnessCredentials,
    type ISignTokenCredentials,
    type IJwtTokenClaims,
    type IJwtTokenOpts,
    type ICheckJwtFields,
    type ICreateSignedJwtOptions,
} from "./vendors/jwt/jwt_d"

// Export JWKS interfaces and types
export {
    type IJwksClient,
    type IJwkRecordVisible,
    type IVerifyRSATokenCredentials,
    type IRSAKeyStore,
    type ITokenExtractedWithPubKey,
    createJwksCache,
    clearJwksCache,
} from "./vendors/jwks/jwks"

export { JwksCache, type IJwksCacheOptions } from "./vendors/jwks/jwks-cache"

// Re-export from jwks_d for consistency
export {
    type IJwksClient as IJwksClientLegacy,
    type IJwkRecordVisible as IJwkRecordVisibleLegacy,
    type IVerifyRSATokenCredentials as IVerifyRSATokenCredentialsLegacy,
} from "./vendors/jwks/jwks_d"
