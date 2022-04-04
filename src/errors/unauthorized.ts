interface IUnauthorizedError {
    message: string;
}

export class UnauthorizedError extends Error {
    code = 401;
    constructor(id: string, { message }: IUnauthorizedError) {
        super(message);
        this.name = "UnauthorizedError";
        Error.call(this, message);
        Error.captureStackTrace(this);
    }
}
