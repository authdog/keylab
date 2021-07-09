import { JsonWebTokenError } from "jsonwebtoken";

class UnauthorizedError extends Error {
    code = 401;
    constructor(message) {
        super(message);
        this.name = "UnauthorizedError";
        Error.call(this, message);
        Error.captureStackTrace(this);
    }
}

export const throwUnauthorized = (message?: string) => {
    throw new UnauthorizedError(message || "unauthorized");
};

export const throwJwtError = (message?: string) => {
    throw new JsonWebTokenError(message || "error jwt");
};
