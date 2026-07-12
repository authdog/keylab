export class EnvironmentError extends Error {
    code = 500
    constructor(message: string) {
        super(message)
        this.name = "EnvironmentError"
        Error.call(this, message)
        Error.captureStackTrace(this)
    }
}
