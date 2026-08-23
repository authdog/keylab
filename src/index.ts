// Export functions

// Export enums
export * from "./enums"
export { JwtAlgorithmsEnum } from "./enums"
// Export error classes
export {
    AlgorithmMismatchError,
    EnvironmentError,
    InvalidSignatureError,
    JsonWebTokenError,
    JwksEndpointError,
    MalformedTokenError,
    TokenExpiredError,
    UnauthorizedError,
} from "./errors"
export {
    checkTokenValidness,
    createSignedJwt,
    extractBearerTokenFromHeaders,
    getKeyPair,
    parseJwt,
    pemToJwk,
    verifyTokenWithPublicKey,
} from "./vendors"
// Export JWE
export {
    decryptJwe,
    encryptJwe,
    type IDecryptedJwe,
    type IDecryptJweOptions,
    type IEncryptJweOptions,
} from "./vendors/jwe/jwe"
// Export JWKS interfaces and types
export {
    clearJwksCache,
    createJwksCache,
    type IJwkRecordVisible,
    type IJwksClient,
    type IRSAKeyStore,
    type ITokenExtractedWithPubKey,
    type IVerifyRSATokenCredentials,
} from "./vendors/jwks/jwks"
export { type IJwksCacheOptions, JwksCache } from "./vendors/jwks/jwks-cache"
// Re-export from jwks-types for consistency
export type {
    IJwkRecordVisible as IJwkRecordVisibleLegacy,
    IJwksClient as IJwksClientLegacy,
    IVerifyRSATokenCredentials as IVerifyRSATokenCredentialsLegacy,
} from "./vendors/jwks/jwks-types"

// Export JWT interfaces and types
export type {
    IDecodedJwt,
    IGetKeyPair,
    IJwkPrivateKey,
    IJwkPublicKey,
    IKeyPair,
} from "./vendors/jwt/interfaces"
export { signJwtWithPrivateKey } from "./vendors/jwt/jwt-sign"
export type {
    ICheckJwtFields,
    ICreateSignedJwtOptions,
    IcheckTokenValidnessCredentials,
    IJwtTokenClaims,
    IJwtTokenOpts,
    ISignTokenCredentials,
} from "./vendors/jwt/jwt-types"
export { getTimeToExpiry, isTokenExpired } from "./vendors/jwt/token-expiry"
// Export Middleware
export {
    createJwtHandler,
    createJwtMiddleware,
    type IJwtHandlerResult,
    type IMiddlewareOptions,
} from "./vendors/middleware/middleware"
