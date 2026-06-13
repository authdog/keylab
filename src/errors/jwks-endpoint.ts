export class JwksEndpointError extends Error {
    code = 502
    statusCode: number
    constructor(message: string, statusCode: number) {
        super(message)
        this.name = "JwksEndpointError"
        this.statusCode = statusCode
        Error.call(this, message)
        Error.captureStackTrace(this)
    }
}
