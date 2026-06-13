import { UnauthorizedError } from "./unauthorized"
import { EnvironmentError } from "./environment"
import * as c from "../constants"
import { JsonWebTokenError } from "./jwt-error"

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

export * as msg from "./messages"

export { JsonWebTokenError } from "./jwt-error"
export { UnauthorizedError } from "./unauthorized"
export { EnvironmentError } from "./environment"
export { TokenExpiredError } from "./token-expired"
export { InvalidSignatureError } from "./invalid-signature"
export { AlgorithmMismatchError } from "./algorithm-mismatch"
export { MalformedTokenError } from "./malformed-token"
export { JwksEndpointError } from "./jwks-endpoint"
