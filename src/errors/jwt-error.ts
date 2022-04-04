export class JsonWebTokenError extends Error {
    code = 401;
    constructor(message) {
        super(message);
        this.name = "JsonWebTokenError";
        Error.call(this, message);
        Error.captureStackTrace(this);
    }
}
