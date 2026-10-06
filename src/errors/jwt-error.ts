export class JsonWebTokenError extends Error {
    code = 401
    /** The underlying error (e.g. from `jose`) when this error wraps one. */
    declare cause?: unknown
    constructor(message: string) {
        super(message)
        this.name = "JsonWebTokenError"
        Error.call(this, message)
        Error.captureStackTrace(this)
    }
}
