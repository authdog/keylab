import { JsonWebTokenError } from "./jwt-error"

export class TokenExpiredError extends JsonWebTokenError {
    expiredAt: Date
    constructor(message: string, expiredAt: Date) {
        super(message)
        this.name = "TokenExpiredError"
        this.expiredAt = expiredAt
    }
}
