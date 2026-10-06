import { errors } from "jose"
import { AlgorithmMismatchError } from "../../errors/algorithm-mismatch"
import { InvalidSignatureError } from "../../errors/invalid-signature"
import { JwksEndpointError } from "../../errors/jwks-endpoint"
import { JsonWebTokenError } from "../../errors/jwt-error"
import { MalformedTokenError } from "../../errors/malformed-token"
import { TOKEN_EXPIRED } from "../../errors/messages"
import { TokenExpiredError } from "../../errors/token-expired"

const withCause = <T extends Error>(error: T, cause: unknown): T => {
    Object.defineProperty(error, "cause", {
        value: cause,
        writable: true,
        configurable: true,
        enumerable: false,
    })
    return error
}

/**
 * Converts `jose` and decoding failures into the error classes documented in llm-docs/api.md.
 * The original error stays reachable on `cause`. Anything else is returned unchanged.
 */
export const toVerificationError = (error: unknown): unknown => {
    if (error instanceof JsonWebTokenError || error instanceof JwksEndpointError) {
        return error
    }

    if (error instanceof errors.JWTExpired) {
        const expiredAt = new Date(Number(error.payload.exp) * 1000)
        return withCause(new TokenExpiredError(TOKEN_EXPIRED, expiredAt), error)
    }

    if (error instanceof errors.JWSSignatureVerificationFailed) {
        return withCause(new InvalidSignatureError(), error)
    }

    if (error instanceof errors.JOSEAlgNotAllowed) {
        return withCause(new AlgorithmMismatchError(), error)
    }

    if (error instanceof errors.JWSInvalid || error instanceof errors.JWTInvalid) {
        return withCause(new MalformedTokenError(), error)
    }

    if (
        error instanceof errors.JWTClaimValidationFailed ||
        error instanceof errors.JWKSNoMatchingKey
    ) {
        return withCause(new JsonWebTokenError(error.message), error)
    }

    return error
}
