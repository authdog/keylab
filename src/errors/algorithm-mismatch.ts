import { JsonWebTokenError } from "./jwt-error"

export class AlgorithmMismatchError extends JsonWebTokenError {
    constructor(message = "Algorithm mismatch") {
        super(message)
        this.name = "AlgorithmMismatchError"
    }
}
