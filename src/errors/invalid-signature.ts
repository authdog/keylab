import { JsonWebTokenError } from "./jwt-error"

export class InvalidSignatureError extends JsonWebTokenError {
    constructor(message = "Invalid signature") {
        super(message)
        this.name = "InvalidSignatureError"
    }
}
