import * as c from "../constants"
import { EnvironmentError } from "./environment"
import { JsonWebTokenError } from "./jwt-error"
import { UnauthorizedError } from "./unauthorized"

export const throwUnauthorized = (message?: string) => {
    throw new UnauthorizedError("unauthorized", {
        message: message || c.GENERIC_UNAUTHORIZED_MESSAGE,
    })
}

export const throwJwtError = (message?: string) => {
    throw new JsonWebTokenError(message || c.JWT_GENERIC_ERROR_MESSAGE)
}

export const throwEnvironmentError = (message?: string) => {
    throw new EnvironmentError(message || c.CODE_NOT_RUNNING_IN_BROWSER)
}

export { AlgorithmMismatchError } from "./algorithm-mismatch"
export { EnvironmentError } from "./environment"
export { InsufficientScopeError } from "./insufficient-scope"
export { InvalidSignatureError } from "./invalid-signature"
export { JwksEndpointError } from "./jwks-endpoint"
export { JsonWebTokenError } from "./jwt-error"
export { MalformedTokenError } from "./malformed-token"
export * as msg from "./messages"
export { TokenExpiredError } from "./token-expired"
export { UnauthorizedError } from "./unauthorized"
