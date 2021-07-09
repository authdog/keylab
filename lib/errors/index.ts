import { JsonWebTokenError } from "jsonwebtoken";
import { UnauthorizedError } from "./unauthorized";

export const throwUnauthorized = (message?: string) => {
    throw new UnauthorizedError(message || "unauthorized");
};

export const throwJwtError = (message?: string) => {
    throw new JsonWebTokenError(message || "error jwt");
};
