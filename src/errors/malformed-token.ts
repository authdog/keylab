import { JsonWebTokenError } from "./jwt-error"

export class MalformedTokenError extends JsonWebTokenError {
    constructor(message = "Malformed token") {
        super(message)
        this.name = "MalformedTokenError"
    }
}
