import { JsonWebTokenError } from "./jwt-error"

export class InsufficientScopeError extends JsonWebTokenError {
    code = 403
    requiredScopes: string[]
    constructor(requiredScopes: string[], message = "Token is missing required scopes") {
        super(message)
        this.name = "InsufficientScopeError"
        this.requiredScopes = requiredScopes
    }
}
